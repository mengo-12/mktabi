from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

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
                columns = []

                for column in table.columns_definition or []:
                    columns.append(
                        {
                            "id": column.get("id"),
                            "name": column.get("name"),
                            "type": column.get("type"),
                            "required": column.get("required", False),
                            "options": column.get("options", []),
                            "relatedTableId": column.get("relatedTableId"),
                            "relation": column.get("relation"),
                        }
                    )

                section_item["tables"].append(
                    {
                        "id": table.id,
                        "name": table.name,
                        "view_mode": table.view_mode,
                        "columns": columns,
                    }
                )

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
                    "required": column.get("required", False),
                    "options": column.get("options", []),
                    "relatedTableId": column.get("relatedTableId"),
                    "relation": column.get("relation"),
                }
            )

        return columns
