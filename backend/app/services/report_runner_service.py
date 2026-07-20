from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from collections import defaultdict

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

        filters = payload.get("filters", [])

        if filters:
            rows = ReportRunnerService.apply_filters(rows, filters)

        sorting = payload.get("sorting", [])

        if sorting:
            rows = ReportRunnerService.apply_sorting(rows, sorting)

        group_by = payload.get("groupBy")

        if group_by:
            rows = ReportRunnerService.apply_group_by(rows, group_by)

        calculated_fields = payload.get("calculatedFields", [])

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

        visualization = payload.get("visualization")

        chart = ReportRunnerService.build_chart(
            response_rows,
            visualization,
        )

        if calculated_fields:
            response_rows = ReportRunnerService.apply_calculated_fields(
                response_rows,
                calculated_fields,
            )

        return {

            "table": {
                "id": table.id,
                "name": table.name,
            },

            "columns": response_columns,

            "rows": response_rows,

            "chart": chart,

            "visualization": visualization,

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
    

    @staticmethod
    def apply_filters(rows, filters):

        def check(value, operator, expected):

            if value is None:
                value = ""

            value = str(value)
            expected = str(expected)

            if operator == "=":
                return value == expected

            if operator == "!=":
                return value != expected

            if operator == "contains":
                return expected.lower() in value.lower()

            if operator == "starts_with":
                return value.lower().startswith(expected.lower())

            if operator == "ends_with":
                return value.lower().endswith(expected.lower())

            if operator == ">":
                try:
                    return float(value) > float(expected)
                except:
                    return False

            if operator == "<":
                try:
                    return float(value) < float(expected)
                except:
                    return False

            if operator == ">=":
                try:
                    return float(value) >= float(expected)
                except:
                    return False

            if operator == "<=":
                try:
                    return float(value) <= float(expected)
                except:
                    return False

            return True

        filtered = []

        for row in rows:

            cells = row.cells_data or {}

            passed = True

            for f in filters:

                column = f.get("column")
                operator = f.get("operator", "=")
                expected = f.get("value")

                value = cells.get(column)

                if not check(value, operator, expected):
                    passed = False
                    break

            if passed:
                filtered.append(row)

        return filtered
    

    @staticmethod
    def apply_sorting(rows, sorting):

        for sort in reversed(sorting):

            column = sort.get("column")

            if not column:
                continue

            reverse = sort.get("direction") == "desc"

            rows = sorted(
                rows,
                key=lambda row: (
                    row.cells_data or {}
                ).get(column, ""),
                reverse=reverse,
            )

        return rows
    

    @staticmethod
    def apply_group_by(rows, group_by):

        groups = {}

        for row in rows:

            cells = row.cells_data or {}

            key = cells.get(group_by)

            if key not in groups:
                groups[key] = row

        return list(groups.values())
    

    @staticmethod
    def apply_calculated_fields(rows, calculated_fields):

        for field in calculated_fields:

            field_name = field.get("name")
            operation = field.get("operation")
            column = field.get("column")

            values = []

            for row in rows:

                value = row.get(column)

                try:
                    values.append(float(value))
                except:
                    pass

            if operation == "sum":
                result = sum(values)

            elif operation == "avg":
                result = sum(values) / len(values) if values else 0

            elif operation == "count":
                result = len(values)

            elif operation == "min":
                result = min(values) if values else 0

            elif operation == "max":
                result = max(values) if values else 0

            else:
                result = None

            for row in rows:
                row[field_name] = result

        return rows

    
    @staticmethod
    def build_chart(rows, visualization):

        if not visualization:
            return None

        chart_type = visualization.get("type", "bar")

        if chart_type == "table":
            return None

        x_axis = visualization.get("xAxis")
        y_axis = visualization.get("yAxis")
        aggregation = visualization.get("aggregation", "count")

        if not x_axis:
            return None

        groups = defaultdict(list)

        for row in rows:
            key = row.get(x_axis)

            if isinstance(key, list):
                key = ", ".join(map(str, key))

            if key is None:
                key = "بدون قيمة"

            groups[str(key)].append(row)

        labels = []
        values = []

        for label, items in groups.items():

            labels.append(label)

            if aggregation == "count":
                values.append(len(items))
                continue

            nums = []

            for item in items:

                value = item.get(y_axis)

                if isinstance(value, list):
                    continue

                try:
                    nums.append(float(value))
                except:
                    pass

            if aggregation == "sum":
                values.append(sum(nums))

            elif aggregation == "avg":
                values.append(
                    sum(nums) / len(nums)
                    if nums else 0
                )

            elif aggregation == "min":
                values.append(
                    min(nums)
                    if nums else 0
                )

            elif aggregation == "max":
                values.append(
                    max(nums)
                    if nums else 0
                )

            else:
                values.append(len(items))

        return {

            "type": chart_type,

            "labels": labels,

            "datasets": [

                {

                    "label": y_axis or aggregation,

                    "data": values

                }

            ]

        }
