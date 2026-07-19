from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dashboard import Dashboard
from app.schemas.dashboard import DashboardCreate, DashboardUpdate


class DashboardService:

    @staticmethod
    async def get_dashboards(
        db: AsyncSession,
        user_id: int,
    ):
        result = await db.execute(
            select(Dashboard).order_by(Dashboard.created_at.desc())
        )

        return result.scalars().all()

    @staticmethod
    async def get_dashboard(
        db: AsyncSession,
        dashboard_id: int,
        user_id: int,
    ):
        result = await db.execute(
            select(Dashboard).where(
                Dashboard.id == dashboard_id,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create_dashboard(
        db: AsyncSession,
        payload: DashboardCreate,
        user_id: int,
    ):
        dashboard = Dashboard(
            user_id=user_id,
            name=payload.name,
            description=payload.description,
            icon=payload.icon,
            color=payload.color,
            layout=[],
            is_default=payload.is_default,
        )

        db.add(dashboard)

        await db.commit()

        await db.refresh(dashboard)

        return dashboard

    @staticmethod
    async def update_dashboard(
        db: AsyncSession,
        dashboard: Dashboard,
        payload: DashboardUpdate,
    ):
        data = payload.model_dump(exclude_unset=True)

        for key, value in data.items():
            setattr(dashboard, key, value)

        await db.commit()

        await db.refresh(dashboard)

        return dashboard

    @staticmethod
    async def delete_dashboard(
        db: AsyncSession,
        dashboard: Dashboard,
    ):
        await db.delete(dashboard)

        await db.commit()

        return {"message": "Dashboard deleted successfully"}