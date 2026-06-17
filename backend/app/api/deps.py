from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.config import settings
from app.core.database import get_db
from app.models.auth import User, UserRole
from app.schemas.auth import TokenData

# إعلام النظام بمكان استخراج التوكن (من مسار الـ login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# 1️⃣ الدالة الأولى: حارس التحقق من الهوية واستخراج المستخدم الحالي
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    تستخرج التوكن، تفك تشفيره، وتتحقق من وجود المستخدم وصلاحية حسابه.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # فك تشفير التوكن والتحقق من التوقيع الرقمي
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        user_role: str = payload.get("role")
        
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=int(user_id), role=user_role)
    except JWTError:
        raise credentials_exception

    # جلب المستخدم من قاعدة البيانات للتأكد من أنه لم يُحذف أو يُعدل
    result = await db.execute(select(User).where(User.id == token_data.user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Inactive user account"
        )
        
    return user


# 2️⃣ الدالة الثانية: مستشعر الأدوار الديناميكي (RBAC Guard)
class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        """تستقبل قائمة بالأدوار المسموح لها بالدخول (مثال: [UserRole.ADMIN, UserRole.PARTNER])"""
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """يتم تنفيذها تلقائياً كـ Dependency للتحقق من دور المستخدم الحالي"""
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="عذراً، لا تمتلك الصلاحية الكافية لإتمام هذه العملية."
            )
        return current_user