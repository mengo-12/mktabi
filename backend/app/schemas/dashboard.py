from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#3B82F6"


class DashboardCreate(DashboardBase):
    is_default: bool = False
    global_filter_mapping: dict = Field(default_factory=dict)


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    layout: Optional[Any] = None
    is_default: Optional[bool] = None
    global_filter_mapping: dict | None = None


class DashboardResponse(DashboardBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

    user_id: int | None = None

    layout: Any
    is_default: bool

    created_at: datetime
    updated_at: datetime
    global_filter_mapping: dict = Field(default_factory=dict)