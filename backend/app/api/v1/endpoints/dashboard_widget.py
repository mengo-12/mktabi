from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.schemas.dashboard_widget import (
    DashboardWidgetCreate,
    DashboardWidgetUpdate,
    DashboardWidgetResponse,
)

from app.services.dashboard_widget_service import (
    DashboardWidgetService,
)

router = APIRouter()


@router.get(
    "/dashboard/{dashboard_id}",
    response_model=list[DashboardWidgetResponse],
)
async def get_widgets(
    dashboard_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await DashboardWidgetService.get_widgets(
        db,
        dashboard_id,
    )


@router.post(
    "/",
    response_model=DashboardWidgetResponse,
)
async def create_widget(
    payload: DashboardWidgetCreate,
    db: AsyncSession = Depends(get_db),
):
    return await DashboardWidgetService.create_widget(
        db,
        payload,
    )


@router.put(
    "/{widget_id}",
    response_model=DashboardWidgetResponse,
)
async def update_widget(
    widget_id: int,
    payload: DashboardWidgetUpdate,
    db: AsyncSession = Depends(get_db),
):
    widget = await DashboardWidgetService.get_widget(
        db,
        widget_id,
    )

    if not widget:
        raise HTTPException(
            status_code=404,
            detail="Widget not found",
        )

    return await DashboardWidgetService.update_widget(
        db,
        widget,
        payload,
    )

@router.post(
    "/{widget_id}/duplicate",
    response_model=DashboardWidgetResponse,
)
async def duplicate_widget(
    widget_id: int,
    db: AsyncSession = Depends(get_db),
):
    widget = await DashboardWidgetService.get_widget(
        db,
        widget_id,
    )

    if not widget:
        raise HTTPException(
            status_code=404,
            detail="Widget not found",
        )

    return await DashboardWidgetService.duplicate_widget(
        db,
        widget,
    )


@router.delete(
    "/{widget_id}",
)
async def delete_widget(
    widget_id: int,
    db: AsyncSession = Depends(get_db),
):
    widget = await DashboardWidgetService.get_widget(
        db,
        widget_id,
    )

    if not widget:
        raise HTTPException(
            status_code=404,
            detail="Widget not found",
        )

    return await DashboardWidgetService.delete_widget(
        db,
        widget,
    )