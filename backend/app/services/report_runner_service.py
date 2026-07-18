from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dynamic import CustomTable, CustomRow


class ReportRunnerService:

    @staticmethod
    async def run_query(db: AsyncSession, payload: dict):

        selected_relations = {
            relation["column_id"]: relation["table_id"]
            for relation in payload.get("relations", [])
        }

        table_id = payload.get("table_id")

        table = await db.get(CustomTable, table_id)

        if not table:
            return {
                "table": None,
                "columns": [],
                "rows": [],
            }

        selected_columns = payload.get("columns", [])

        relation_cache = await ReportRunnerService.preload_relation_tables(
            db,
            selected_columns,
        )

        result = await db.execute(
            select(CustomRow).where(CustomRow.table_id == table_id)
        )

        rows = result.scalars().all()

        response_columns = []

        for column in selected_columns:

            response_columns.append(
                {
                    "id": column["id"],
                    "name": column["name"],
                    "type": column["type"],
                    "path": column.get("path", []),
                }
            )

        response_rows = []

        for row in rows:
            item = {"id": row.id}
            cells = row.cells_data or {}

            # تم إصلاح المسافات هنا لتدخل داخل حلقة الـ rows والدالة بشكل سليم
            for column in response_columns:
                if column.get("path"):
                    value = ReportRunnerService.get_value_by_path(
                        row,
                        column["path"],
                        relation_cache,
                    )
                else:
                    value = cells.get(column["id"])

                # ===========================
                # Relation Join
                # ===========================

                if column["type"] == "relation":

                    relation_table_id = None

                    path = column.get("path", [])

                    if len(path) >= 2:
                        relation_table_id = path[-2].get("relation_table_id")

                    if relation_table_id is None:
                        relation_table_id = selected_relations.get(column["id"])

                    if value is None:

                        item[column["id"]] = []

                    else:

                        relation_ids = value if isinstance(value, list) else [value]

                        if relation_table_id:
                            item[column["id"]] = ReportRunnerService.resolve_relation(
                                relation_cache,
                                int(relation_table_id),
                                relation_ids,
                            )
                        else:
                            item[column["id"]] = relation_ids

                else:
                    item[column["id"]] = value

            response_rows.append(item)

        return {
            "table": {"id": table.id, "name": table.name},
            "columns": response_columns,
            "rows": response_rows,
        }

    @staticmethod
    async def load_relation_table(
        db: AsyncSession,
        table_id: int,
    ):
        table = await db.get(CustomTable, table_id)

        if not table:
            return None

        result = await db.execute(
            select(CustomRow).where(CustomRow.table_id == table_id)
        )

        rows = result.scalars().all()

        return {
            "table": table,
            "objects": {row.id: row for row in rows},
        }

    @staticmethod
    def resolve_relation(
        relation_cache: dict,
        relation_table_id: int,
        relation_ids: list,
    ):

        cache = relation_cache.get(relation_table_id)

        if not cache:
            return []

        lookup = cache["objects"]

        results = []

        for relation_id in relation_ids:

            row = lookup.get(int(relation_id))

            if not row:
                continue

            display = ReportRunnerService.get_display_value(
                row,
                cache["table"],
            )
            results.append({"id": relation_id, "display": display, "data": row})

        return results

    @staticmethod
    async def preload_relation_tables(
        db: AsyncSession,
        selected_columns: list,
    ):
        """
        تحميل جميع الجداول المرتبطة مرة واحدة.
        """

        relation_cache = {}

        for column in selected_columns:

            for step in column.get("path", []):

                relation_table_id = step.get("relation_table_id")

                if not relation_table_id:
                    continue

                relation_table_id = int(relation_table_id)

                if relation_table_id in relation_cache:
                    continue

                cache = await ReportRunnerService.load_relation_table(
                    db,
                    relation_table_id,
                )

                if cache:
                    relation_cache[relation_table_id] = cache

        return relation_cache

    @staticmethod
    def get_display_value(row, table):
        """
        إرجاع قيمة العرض (display_value) لأي سجل اعتماداً على display_column
        """

        if row is None:
            return ""

        cells = row.cells_data or {}

        # إذا كان الجدول لا يملك display_column
        if not table or not table.display_column:
            if cells:
                first_key = next(iter(cells))
                value = cells.get(first_key)
                return "" if value is None else str(value)
            return ""

        value = cells.get(table.display_column)

        if value is None:
            return ""

        return str(value)

    @staticmethod
    def get_value_by_path(
        root_row,
        path: list,
        relation_cache: dict,
    ):
        """
        استخراج قيمة عمود من أي مستوى من العلاقات.
        """

        current_row = root_row

        i = 0

        while i < len(path):

            step = path[i]

            # آخر خطوة = العمود المطلوب
            if i == len(path) - 1:
                return (current_row.cells_data or {}).get(step["column_id"])

            relation_column = step["column_id"]

            relation_info = path[i + 1]

            relation_table_id = relation_info["relation_table_id"]

            relation_value = (current_row.cells_data or {}).get(relation_column)

            if relation_value is None:
                return None

            if isinstance(relation_value, list):
                relation_value = relation_value[0]

            cache = relation_cache.get(int(relation_table_id))

            if not cache:
                return None

            current_row = cache["objects"].get(int(relation_value))

            if current_row is None:
                return None

            i += 2

        return None
