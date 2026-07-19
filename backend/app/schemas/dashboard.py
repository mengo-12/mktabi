from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#3B82F6"


class DashboardCreate(DashboardBase):
    is_default: bool = False


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    layout: Optional[Any] = None
    is_default: Optional[bool] = None


class DashboardResponse(DashboardBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

    user_id: int | None = None

    layout: Any
    is_default: bool

    created_at: datetime
    updated_at: datetime