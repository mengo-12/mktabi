from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.report_builder import ReportBuilder

from app.models.dynamic import CustomSection, CustomTable


class ReportBuilderService:

    @staticmethod
    async def get_datasources(db: AsyncSession):

        result = await db.execute(
            select(CustomSection)
            .options(selectinload(CustomSection.tables))
            .order_by(CustomSection.order)
        )

        # تم ضبط الإزاحة هنا لتدخل تحت نطاق الدالة (8 مسافات)
        sections = result.scalars().unique().all()
        output = []

        for section in sections:
            section_item = {
                "id": section.id,
                "title": section.title,
                "icon": section.icon,
                "tables": [],
            }

            for table in section.tables:

                tree = await ReportBuilderService.build_table_tree(
                    db, table, visited=set(), path=[]
                )
                if tree:
                    section_item["tables"].append(tree)

            output.append(section_item)

        # الـ return يجب أن تخرج من حلقة الـ for لتعيد كل الأقسام وليس الأول فقط
        return output

    @staticmethod
    def normalize_columns(columns_definition):

        columns = []
        for column in columns_definition or []:
            columns.append(
                {
                    "id": column.get("id"),
                    "name": column.get("name"),
                    "type": column.get("type"),
                    "relatedTableId": column.get("relatedTableId"),
                    "relation": column.get("relation"),
                    "path": [{"column_id": column.get("id")}],
                }
            )

        return columns

    @staticmethod
    async def build_table_tree(
        db: AsyncSession, table: CustomTable, visited=None, path=None
    ):
        if visited is None:
            visited = set()

        if path is None:
            path = []

        if table.id in visited:
            return None

        visited.add(table.id)

        columns = []
        relations = []

        for col in table.columns_definition or []:

            column_path = path + [{"table_id": table.id, "column_id": col.get("id")}]

            column_data = {
                "id": col.get("id"),
                "name": col.get("name"),
                "type": col.get("type"),
                "relatedTableId": col.get("relatedTableId"),
                "relation": col.get("relation"),
                "path": column_path,
            }

            columns.append(column_data)

            if col.get("type") != "relation":
                continue

            relation_table_id = col.get("relatedTableId") or (
                col.get("relation") or {}
            ).get("table_id")

            if not relation_table_id:
                continue

            relation_table = await db.get(
                CustomTable,
                int(relation_table_id),
            )

            if not relation_table:
                continue

            child = await ReportBuilderService.build_table_tree(
                db,
                relation_table,
                visited.copy(),
                column_path
                + [
                    {
                        "table_id": table.id,
                        "column_id": col.get("id"),
                        "relation_table_id": relation_table.id,
                    }
                ],
            )

            if not child:
                continue

            relations.append(
                {
                    "column_id": col["id"],
                    "column_name": col["name"],
                    "table": child,
                }
            )

        return {
            "id": table.id,
            "name": table.name,
            "section_id": table.section_id,
            "columns": columns,
            "relations": relations,
        }

    @staticmethod
    async def get_reports(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(ReportBuilder)
            .order_by(ReportBuilder.created_at.desc())
        )

        return result.scalars().all()