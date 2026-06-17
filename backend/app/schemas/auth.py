from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from app.models.auth import UserRole
import re

# 1️⃣ النموذج المشترك للبيانات الأساسية
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=150)
    phone_number: Optional[str] = None
    role: UserRole = UserRole.ASSOCIATE

# 2️⃣ النموذج القادم أثناء إنشاء مستخدم جديد (التسجيل)
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="كلمة المرور يجب ألا تقل عن 8 خانات")
    master_key: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("كلمة المرور يجب أن تحتوي على حرف واحد على الأثل")
        if not re.search(r"\d", v):
            raise ValueError("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")
        return v

# 3️⃣ النموذج الذي يعود للمستخدم عند الاستعلام عن الحساب
class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# 4️⃣ نموذج الاستجابة عند تسجيل الدخول الناجح (الذي كان ناقصاً وتسبب بالخطأ)
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 5️⃣ البيانات المشفرة المخزنة داخل التوكن للتحقق اللاحق
class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None