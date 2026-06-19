from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, time, datetime

# النموذج المشترك للحقول
class HearingBase(BaseModel):
    hearing_date: date
    hearing_time: time
    court_name: str = Field(..., max_length=250)
    room_number: str = Field(..., max_length=50)
    judge_name: Optional[str] = Field(None, max_length=150)
    summary: Optional[str] = None
    requirements: Optional[str] = None

# نموذج إنشاء جلسة جديدة (يستلزم رقم القضية)
class HearingCreate(HearingBase):
    case_id: int

# نموذج تحديث الجلسة (لإضافة القرارات والملخصات)
class HearingUpdate(BaseModel):
    hearing_date: Optional[date] = None
    hearing_time: Optional[time] = None
    court_name: Optional[str] = None
    room_number: Optional[str] = None
    judge_name: Optional[str] = None
    summary: Optional[str] = None
    requirements: Optional[str] = None

# نموذج الاستجابة وإرسال البيانات للفرونت إند
class HearingResponse(HearingBase):
    id: int
    case_id: int
    created_at: datetime

    class Config:
        from_attributes = True