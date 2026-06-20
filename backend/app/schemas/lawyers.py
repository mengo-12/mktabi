from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.auth import UserRole

# النموذج المستخدم عند قيام الآدمين بتعديل بيانات محامٍ أو موظف
class UserUpdateByAdmin(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3, max_length=150)
    phone_number: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None