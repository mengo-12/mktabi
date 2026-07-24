from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class DashboardWidgetBase(BaseModel):
    title: str
    widget_type: str

    report_id: Optional[int] = None

    config: dict | None = {}

    x: int = 0
    y: int = 0

    w: int = 4
    h: int = 3


class DashboardWidgetCreate(DashboardWidgetBase):
    dashboard_id: int

    config: dict | None = {}

class DashboardWidgetUpdate(BaseModel):
    title: Optional[str] = None
    report_id: Optional[int] = None

    config: dict | None = None

    x: Optional[int] = None
    y: Optional[int] = None

    w: Optional[int] = None
    h: Optional[int] = None


class DashboardWidgetResponse(DashboardWidgetBase):
    model_config = ConfigDict(from_attributes=True)

    config: Optional[Any] = None

    id: int
    dashboard_id: int

    created_at: datetime
    updated_at: datetime