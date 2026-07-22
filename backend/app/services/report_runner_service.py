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
            payload.get("relations", []),
        )

        result = await db.execute(
            select(CustomRow).where(CustomRow.table_id == table_id)
        )

        rows = result.scalars().all()

        filters = payload.get("filters", [])

        if filters:
            rows = ReportRunnerService.apply_filters(
                rows,
                filters,
                selected_columns,
                relation_cache,
            )

        sorting = payload.get("sorting", [])

        if sorting:
            rows = ReportRunnerService.apply_sorting(
                rows,
                sorting,
                selected_columns,
                relation_cache,
            )

        # ----------------------------
        # Build Groups
        # ----------------------------

        group_by = payload.get("groupBy")

        if group_by:

            groups = ReportRunnerService.build_groups(
                rows,
                group_by,
                selected_columns,
                relation_cache,
            )

        else:

            groups = [
                {
                    "rows": [row],
                }
                for row in rows
            ]

        calculated_fields = payload.get(
            "calculatedFields",
            [],
        )

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

        for field in calculated_fields:

            response_columns.append(
                {
                    "id": field["name"],
                    "name": field["name"],
                    "type": "number",
                }
            )

        response_rows = []

        for group in groups:

            source = group["rows"][0]

            item = {
                "id": getattr(source, "id", None)
            }

            for column in selected_columns:

                # item[column["id"]] = ReportRunnerService.extract_value(
                #     source,
                #     column,
                #     relation_cache,
                # )
                
                value = ReportRunnerService.extract_value(
                    source,
                    column,
                    relation_cache,
                )

                if column["type"] == "relation":

                    relation_table_id = selected_relations.get(column["id"])

                    if relation_table_id is None:

                        path = column.get("path", [])

                        for step in reversed(path):

                            if step.get("relation_table_id"):

                                relation_table_id = step["relation_table_id"]
                                break

                    if relation_table_id and value is not None:

                        relation_ids = value if isinstance(value, list) else [value]

                        item[column["id"]] = ReportRunnerService.resolve_relation(
                            relation_cache,
                            int(relation_table_id),
                            relation_ids,
                        )

                    else:

                        item[column["id"]] = value

                else:

                    item[column["id"]] = value

            ReportRunnerService.apply_aggregations(
                item,
                group["rows"],
                calculated_fields,
                selected_columns,
                relation_cache,
            )

            response_rows.append(item)

        visualization = payload.get("visualization")

        chart = ReportRunnerService.build_chart(
            response_rows,
            visualization,
        )

        # if calculated_fields:
        #     response_rows = ReportRunnerService.apply_calculated_fields(
        #         response_rows,
        #         calculated_fields,
        #     )

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
        selected_relations: list,
    ):
        relation_cache = {}

        table_ids = set()

        for relation in selected_relations:
            if relation.get("table_id"):
                table_ids.add(int(relation["table_id"]))

        for column in selected_columns:

            for step in column.get("path", []):

                relation_table_id = step.get("relation_table_id")

                if relation_table_id:
                    table_ids.add(int(relation_table_id))

        for table_id in table_ids:

            cache = await ReportRunnerService.load_relation_table(
                db,
                table_id,
            )

            if cache:
                relation_cache[table_id] = cache

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
    def apply_filters(
        rows,
        filters,
        selected_columns,
        relation_cache,
    ):

        if not filters:
            return rows

        column_lookup = {
            str(column["id"]): column
            for column in selected_columns
        }

        def compare(value, operator, expected):

            if isinstance(value, list):

                return any(
                    compare(v, operator, expected)
                    for v in value
                )

            if isinstance(value, dict):

                value = value.get("display")

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

            if operator in (">", "<", ">=", "<="):

                try:

                    left = float(value)
                    right = float(expected)

                except:

                    return False

                if operator == ">":
                    return left > right

                if operator == "<":
                    return left < right

                if operator == ">=":
                    return left >= right

                if operator == "<=":
                    return left <= right

            return True

        output = []

        for row in rows:

            passed = True

            for flt in filters:

                column = column_lookup.get(str(flt["column"]))

                if not column:
                    continue

                value = ReportRunnerService.extract_value(
                    row,
                    column,
                    relation_cache,
                )

                if not compare(
                    value,
                    flt["operator"],
                    flt["value"],
                ):
                    passed = False
                    break

            if passed:
                output.append(row)

        return output
    

    @staticmethod
    def apply_sorting(
        rows,
        sorting,
        selected_columns,
        relation_cache,
    ):

        if not sorting:
            return rows

        column_lookup = {
            str(column["id"]): column
            for column in selected_columns
        }

        for sort in reversed(sorting):

            column = column_lookup.get(str(sort["column"]))

            if not column:
                continue

            reverse = sort.get("direction") == "desc"

            def sort_key(row):

                value = ReportRunnerService.extract_value(
                    row,
                    column,
                    relation_cache,
                )

                if isinstance(value, dict):
                    value = value.get("display")

                if isinstance(value, list):
                    value = ", ".join(str(v) for v in value)

                if value is None:
                    return ""

                # إذا كان العمود رقمياً رتب كرقم
                if column.get("type") == "number":
                    try:
                        return float(value)
                    except Exception:
                        return 0

                # إذا كان تاريخاً
                if column.get("type") == "date":
                    return str(value)

                # باقي الأنواع
                return str(value).lower()

            rows = sorted(
                rows,
                key=sort_key,
                reverse=reverse,
            )

        return rows
    

    @staticmethod
    def build_groups(
        rows,
        group_by,
        selected_columns,
        relation_cache,
    ):

        lookup = {
            str(c["id"]): c
            for c in selected_columns
        }

        column = lookup.get(str(group_by))

        if not column:
            return [{"rows": rows}]

        groups = {}

        for row in rows:

            key = ReportRunnerService.extract_value(
                row,
                column,
                relation_cache,
            )

            if isinstance(key, dict):
                key = key.get("display")

            if isinstance(key, list):
                key = tuple(
                    str(v)
                    for v in key
                )

            groups.setdefault(
                key,
                [],
            ).append(row)

        return [

            {
                "key": key,
                "rows": value,
            }

            for key, value in groups.items()

        ]
        

    @staticmethod
    def apply_aggregations(
        target,
        rows,
        calculated_fields,
        selected_columns,
        relation_cache,
    ):

        lookup = {
            str(c["id"]): c
            for c in selected_columns
        }

        for field in calculated_fields:

            column = lookup.get(str(field["column"]))

            values = []

            if column:

                for row in rows:

                    value = ReportRunnerService.extract_value(
                        row,
                        column,
                        relation_cache,
                    )

                    if isinstance(value, dict):
                        value = value.get("display")

                    if isinstance(value, list):
                        continue

                    try:
                        values.append(float(value))
                    except:
                        pass

            op = field["operation"].lower()

            if op == "sum":
                result = sum(values)

            elif op == "avg":
                result = (
                    sum(values) / len(values)
                    if values else 0
                )

            elif op == "count":
                result = len(rows)

            elif op == "min":
                result = (
                    min(values)
                    if values else None
                )

            elif op == "max":
                result = (
                    max(values)
                    if values else None
                )

            else:
                result = None

            target[field["name"]] = result

    
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
    
    @staticmethod
    def extract_value(
        row,
        column,
        relation_cache,
    ):
        if isinstance(row, dict):

            return row.get(column["id"])
        
        path = column.get("path") or []

        if path:
            return ReportRunnerService.get_value_by_path(
                row,
                path,
                relation_cache,
            )

        return (row.cells_data or {}).get(column["id"])
