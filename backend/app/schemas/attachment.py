# backend\app\schemas\attachment.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional  # 💡 تم إضافتها لدعم القيم الفارغة

class AttachmentResponse(BaseModel):
    id: int
    case_id: Optional[int]  # 💡 تم تحويلها إلى Optional لتفادي أخطاء الرفع العام والديناميكي
    original_name: str
    file_type: str
    file_size: int
    uploaded_by: int
    uploaded_at: datetime

    class Config:
        from_attributes = True