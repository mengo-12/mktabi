from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class OfficeProfileBase(BaseModel):
    office_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class OfficeProfileCreate(OfficeProfileBase):
    pass


class OfficeProfileUpdate(OfficeProfileBase):
    logo_url: Optional[str] = None


class OfficeProfileResponse(OfficeProfileBase):
    id: int
    logo_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)