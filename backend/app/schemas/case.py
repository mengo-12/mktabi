from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime # 👈 أضفنا datetime هنا لتوثيق وقت الرفع
from app.models.case import CaseType, CaseStatus
from app.models.client import ClientType

# 1️⃣ نماذج مصغرة مخصصة للعرض المتداخل (Nested Serialization)
class ClientMinOut(BaseModel):
    id: int
    name: str
    client_type: ClientType

    class Config:
        from_attributes = True

class LawyerMinOut(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True

# 🚀 السحر الجديد: نموذج مصغر لعرض بيانات الملف المرفق في الفرونت-إند
class AttachmentMinOut(BaseModel):
    id: int
    original_name: str
    file_type: str
    file_size: int
    description: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

# 2️⃣ النموذج المشترك للقضايا
class CaseBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=250)
    case_number: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    case_type: CaseType = Field(default=CaseType.COMMERCIAL)
    status: CaseStatus = Field(default=CaseStatus.PENDING)
    start_date: date = Field(default_factory=date.today)

# 3️⃣ نموذج الإنشاء (يستقبل المعرفات كأرقام إلزامية)
class CaseCreate(CaseBase):
    client_id: int
    lawyer_id: int

# 4️⃣ نموذج التحديث الجزئي
class CaseUpdate(BaseModel):
    title: Optional[str] = None
    case_number: Optional[str] = None
    description: Optional[str] = None
    case_type: Optional[CaseType] = None
    status: Optional[CaseStatus] = None
    start_date: Optional[date] = None
    lawyer_id: Optional[int] = None
    is_active: Optional[bool] = None

# 5️⃣ نموذج الاستجابة الذكي والشامل لـ Next.js
class CaseResponse(CaseBase):
    id: int
    client_id: int
    lawyer_id: int
    is_active: bool
    
    # تضمين الكائنات كاملة ومختصرة تلقائياً بفضل SQLAlchemy relationships
    client: Optional[ClientMinOut] = None
    lawyer: Optional[LawyerMinOut] = None
    
    # 🚀 الخيط المفقود: السماح بتدفق مصفوفة المرفقات الحية إلى المتصفح تلقائياً
    attachments: List[AttachmentMinOut] = []

    class Config:
        from_attributes = True