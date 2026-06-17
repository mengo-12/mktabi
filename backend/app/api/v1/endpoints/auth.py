# مسارات التسجيل وتسجيل الدخول
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.auth import User, UserRole
from app.schemas.auth import UserCreate, UserOut

router = APIRouter()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup_first_admin(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    مسار مؤمن لتسجيل المدير الأول للنظام (Admin).
    يغلق تلقائياً ويتطلب Master Key إذا كانت قاعدة البيانات تحتوي على مستخدمين.
    """
    # 1. التحقق من عدد المستخدمين الحاليين في النظام بشكل Async
    result = await db.execute(select(func.count()).select_from(User))
    user_count = result.scalar()

    # 2. إذا لم يكن النظام فارغاً، نتحقق من الـ Master Key
    if user_count > 0:
        if not user_in.master_key or user_in.master_key != settings.MASTER_SETUP_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="التسجيل العام مغلق. يرجى توفير مفتاح الإعداد الرئيسي الصحيح لإنشاء مستخدم جديد."
            )

    # 3. التحقق من عدم تكرار البريد الإلكتروني
    email_check = await db.execute(select(User).where(User.email == user_in.email))
    if email_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="هذا البريد الإلكتروني مسجل بالفعل في النظام."
        )

    # 4. تشفير كلمة المرور وتحديد الدور
    # إذا كان أول مستخدم، نجعله ADMIN تلقائياً، وإلا نعتمد الدور المدخل (بشرط وجود الماستر كي)
    final_role = UserRole.ADMIN if user_count == 0 else user_in.role
    hashed_password = get_password_hash(user_in.password)

    # 5. إنشاء الكائن وحفظه في قاعدة البيانات
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        hashed_password=hashed_password,
        role=final_role,
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user