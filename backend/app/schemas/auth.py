from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from app.models.auth import UserRole
import re

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=150)
    phone_number: Optional[str] = None
    role: UserRole = UserRole.ASSOCIATE

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="كلمة المرور يجب ألا تقل عن 8 خانات")
    master_key: Optional[str] = None  # مطلوب فقط لإنشاء الـ Admin الأول إذا لم تكن القاعدة فارغة

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("كلمة المرور يجب أن تحتوي على حرف واحد على الأقل")
        if not re.search(r"\d", v):
            raise ValueError("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")
        return v

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True