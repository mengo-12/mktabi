from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.visits import VisitStatus

class VisitBase(BaseModel):
    visitor_name: str = Field(..., min_length=3, max_length=150)
    visitor_phone: str
    visit_reason: str
    appointment_time: datetime
    host_lawyer_id: int
    notes: Optional[str] = None

class VisitCreate(VisitBase):
    pass

class VisitUpdate(BaseModel):
    visitor_name: Optional[str] = None
    visitor_phone: Optional[str] = None
    visit_reason: Optional[str] = None
    appointment_time: Optional[datetime] = None
    status: Optional[VisitStatus] = None
    host_lawyer_id: Optional[int] = None
    notes: Optional[str] = None

class VisitOut(VisitBase):
    id: int
    status: VisitStatus

    class Config:
        from_attributes = True