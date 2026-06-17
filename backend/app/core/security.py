from datetime import datetime, timedelta, timezone
from typing import Any, Union
from passlib.context import CryptContext
from jose import jwt
from app.core.config import settings

# إعداد سياق التشفير لـ bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """تشفير كلمة المرور قبل حفظها"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """التحقق من تطابق كلمة المرور المدخلة (plain) مع المشفرة في قاعدة البيانات (hashed)"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, Any], role: str, expires_delta: timedelta = None) -> str:
    """
    توليد توكن JWT آمن وموقع بمفتاح النظام السري.
    يحتوي على معرف المستخدم (sub) ودوره (role) لسهولة التعامل معه في Next.js.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # تضمين البيانات داخل الـ Payload
    to_encode = {
        "exp": expire, 
        "sub": str(subject),
        "role": role
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt