from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dashboard_widget import DashboardWidget
from app.schemas.dashboard_widget import (
    DashboardWidgetCreate,
    DashboardWidgetUpdate,
)


class DashboardWidgetService:

    @staticmethod
    async def get_widgets(
        db: AsyncSession,
        dashboard_id: int,
    ):
        result = await db.execute(
            select(DashboardWidget)
            .where(
                DashboardWidget.dashboard_id == dashboard_id
            )
            .order_by(DashboardWidget.id)
        )

        return result.scalars().all()

    @staticmethod
    async def get_widget(
        db: AsyncSession,
        widget_id: int,
    ):
        result = await db.execute(
            select(DashboardWidget).where(
                DashboardWidget.id == widget_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create_widget(
        db: AsyncSession,
        payload: DashboardWidgetCreate,
    ):
        widget = DashboardWidget(
            dashboard_id=payload.dashboard_id,
            title=payload.title,
            widget_type=payload.widget_type,
            report_id=payload.report_id,
            config=payload.config,
            x=payload.x,
            y=payload.y,
            w=payload.w,
            h=payload.h,
        )

        db.add(widget)

        await db.commit()

        await db.refresh(widget)

        return widget

    @staticmethod
    async def update_widget(
        db: AsyncSession,
        widget: DashboardWidget,
        payload: DashboardWidgetUpdate,
    ):
        data = payload.model_dump(exclude_unset=True)

        for key, value in data.items():
            setattr(widget, key, value)

        await db.commit()

        await db.refresh(widget)

        return widget

    @staticmethod
    async def delete_widget(
        db: AsyncSession,
        widget: DashboardWidget,
    ):
        await db.delete(widget)

        await db.commit()

        return {
            "message": "Widget deleted successfully"
        }

    @staticmethod
    async def duplicate_widget(
        db: AsyncSession,
        widget: DashboardWidget,
    ):
        new_widget = DashboardWidget(
            dashboard_id=widget.dashboard_id,
            title=f"{widget.title} (Copy)",
            widget_type=widget.widget_type,
            report_id=widget.report_id,
            config=widget.config,
            x=widget.x + 1,
            y=widget.y + 1,
            w=widget.w,
            h=widget.h,
        )

        db.add(new_widget)

        await db.commit()

        await db.refresh(new_widget)

        return new_widget