from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dynamic import CustomTable, CustomRow


class ReportRunnerService:

    @staticmethod
    async def run_query(db: AsyncSession, payload: dict):

        table_id = payload.get("table_id")
        selected_columns = payload.get("columns", [])

        table = await db.get(CustomTable, table_id)

        if not table:
            return {"columns": [], "rows": []}

        columns_definition = table.columns_definition or []
        columns_map = {}

        for column in columns_definition:
            columns_map[column["id"]] = column

        relation_cache = await ReportRunnerService.preload_relation_tables(
            db,
            columns_map,
        )

        result = await db.execute(
            select(CustomRow).where(CustomRow.table_id == table_id)
        )

        rows = result.scalars().all()
        response_columns = []

        for column_id in selected_columns:
            column = columns_map.get(column_id)
            if not column:
                continue

            response_columns.append(
                {"id": column["id"], "name": column["name"], "type": column["type"]}
            )

        response_rows = []

        for row in rows:
            item = {"id": row.id}
            cells = row.cells_data or {}

            # تم إصلاح المسافات هنا لتدخل داخل حلقة الـ rows والدالة بشكل سليم
            for column in response_columns:
                value = cells.get(column["id"])

                # ===========================
                # Relation Join
                # ===========================
                if column["type"] == "relation":
                    relation_table_id = None
                    definition = columns_map.get(column["id"])

                    if definition:
                        relation_table_id = definition.get("relatedTableId") or (
                            definition.get("relation") or {}
                        ).get("table_id")

                    if value is None:
                        item[column["id"]] = []
                    else:
                        relation_ids = value if isinstance(value, list) else [value]

                        if relation_table_id:
                            related_rows = ReportRunnerService.resolve_relation(
                                relation_cache,
                                int(relation_table_id),
                                relation_ids,
                            )
                            item[column["id"]] = related_rows
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
    async def load_relation_table(db: AsyncSession, table_id: int):
        table = await db.get(CustomTable, table_id)

        if not table:
            return None

        result = await db.execute(
            select(CustomRow).where(CustomRow.table_id == table_id)
        )

        rows = result.scalars().all()
        lookup = {}

        for row in rows:
            lookup[row.id] = row.cells_data or {}

        return {
            "table": table,
            "rows": lookup,
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

        lookup = cache["rows"]

        results = []

        for relation_id in relation_ids:

            row = lookup.get(int(relation_id))

            if not row:
                continue

            display = ReportRunnerService.get_display_value(
                cache,
                relation_id,
            )
            results.append({"id": relation_id, "display": display, "data": row})

        return results

    @staticmethod
    async def preload_relation_tables(
        db: AsyncSession,
        columns_map: dict,
    ):
        """
        تحميل جميع الجداول المرتبطة مرة واحدة.
        """

        relation_cache = {}

        for column in columns_map.values():

            if column.get("type") != "relation":
                continue

            relation_table_id = column.get("relatedTableId") or (
                column.get("relation") or {}
            ).get("table_id")

            if not relation_table_id:
                continue

            relation_table_id = int(relation_table_id)

            if relation_table_id in relation_cache:
                continue

            relation_cache[relation_table_id] = (
                await ReportRunnerService.load_relation_table(
                    db,
                    relation_table_id,
                )
            )

        return relation_cache


@staticmethod
def get_display_value(
    cache: dict,
    relation_id: int,
):
    """
    تحديد القيمة المعروضة للسجل المرتبط.
    """

    table = cache["table"]
    lookup = cache["rows"]

    row = lookup.get(int(relation_id))

    if not row:
        return None

    # استخدام Display Column إذا كان محدداً
    display_column = getattr(table, "display_column", None)

    if display_column:
        value = row.get(display_column)

        if value not in [None, "", []]:
            return value

    # أولاً: الحقل المسمى name
    for key, value in row.items():
        if key.lower() == "name" and value not in [None, "", []]:
            return value

    # ثانياً: العمود c1 (غالباً اسم السجل)
    if row.get("c1") not in [None, "", []]:
        return row["c1"]

    # ثالثاً: أول قيمة نصية
    for value in row.values():
        if isinstance(value, str) and value.strip():
            return value

    # رابعاً: أول قيمة غير فارغة
    for value in row.values():
        if value not in [None, "", []]:
            return value

    return relation_id
