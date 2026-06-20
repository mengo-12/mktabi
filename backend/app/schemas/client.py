from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import List, Optional
from app.schemas.case import CaseResponse
from app.models.client import ClientType

# 1️⃣ النموذج الأساسي للحقول المشتركة
class ClientBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200, description="اسم الموكل بالكامل أو اسم الشركة")
    client_type: ClientType = Field(default=ClientType.INDIVIDUAL)
    phone_number: str = Field(..., min_length=7, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = None

# 2️⃣ نموذج الإنشاء مع التحقق الشرطي الصارم (Conditional Validation)
class ClientCreate(ClientBase):
    national_id: Optional[str] = None
    commercial_register: Optional[str] = None
    company_representative: Optional[str] = None

    @model_validator(mode='after')
    def validate_conditional_fields(self) -> 'ClientCreate':
        if self.client_type == ClientType.INDIVIDUAL:
            if not self.national_id:
                raise ValueError("يجب إدخال رقم الهوية الوطنية/الإقامة عندما يكون الموكل فرداً.")
            # تفريغ حقول الشركات لضمان نظافة البيانات
            self.commercial_register = None
            self.company_representative = None
        
        elif self.client_type == ClientType.CORPORATE:
            if not self.commercial_register or not self.company_representative:
                raise ValueError("يجب إدخال رقم السجل التجاري واسم ممثل الشركة عندما يكون الموكل شركة.")
            # تفريغ حقول الأفراد
            self.national_id = None
            
        return self

# 3️⃣ نموذج التحديث (جميع الحقول اختيارية لتحديث جزئي مرن)
class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    national_id: Optional[str] = None
    commercial_register: Optional[str] = None
    company_representative: Optional[str] = None
    is_active: Optional[bool] = None

# 4️⃣ نموذج الاستجابة الآمن للواجهة الأمامية
class ClientResponse(ClientBase):
    id: int
    national_id: Optional[str] = None
    commercial_register: Optional[str] = None
    company_representative: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# 5️⃣ نموذج الاستجابة المفصل للملف الشخصي (يحتوي على القضايا المتداخلة)
class ClientDetailResponse(ClientResponse):
    cases: List[CaseResponse] = []
    class Config:
        from_attributes = True