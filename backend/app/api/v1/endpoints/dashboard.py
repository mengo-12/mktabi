from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db

from app.schemas.dashboard import (
    DashboardCreate,
    DashboardUpdate,
    DashboardResponse,
)

from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get(
    "/",
    response_model=list[DashboardResponse],
)
async def get_dashboards(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await DashboardService.get_dashboards(
        db,
        current_user.id,
    )


@router.get(
    "/{dashboard_id}",
    response_model=DashboardResponse,
)
async def get_dashboard(
    dashboard_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    dashboard = await DashboardService.get_dashboard(
        db,
        dashboard_id,
        current_user.id,
    )

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    return dashboard


@router.post(
    "/",
    response_model=DashboardResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_dashboard(
    payload: DashboardCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await DashboardService.create_dashboard(
        db,
        payload,
        current_user.id,
    )


@router.put(
    "/{dashboard_id}",
    response_model=DashboardResponse,
)
async def update_dashboard(
    dashboard_id: int,
    payload: DashboardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    dashboard = await DashboardService.get_dashboard(
        db,
        dashboard_id,
        current_user.id,
    )

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    return await DashboardService.update_dashboard(
        db,
        dashboard,
        payload,
    )


@router.delete(
    "/{dashboard_id}",
)
async def delete_dashboard(
    dashboard_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    dashboard = await DashboardService.get_dashboard(
        db,
        dashboard_id,
        current_user.id,
    )

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    return await DashboardService.delete_dashboard(
        db,
        dashboard,
    )