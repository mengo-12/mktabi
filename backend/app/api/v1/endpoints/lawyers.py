from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.auth import User, UserRole
from app.api.deps import get_current_user, RoleChecker
from app.schemas.auth import UserOut, UserCreate
from app.schemas.lawyers import UserUpdateByAdmin

router = APIRouter()

# قفل الحماية: يسمح فقط للمدير (ADMIN) والمحامي الشريك (PARTNER) بإدارة الفريق
admin_and_partner_guard = RoleChecker([UserRole.ADMIN, UserRole.PARTNER])

@router.get("/", response_model=List[UserOut])
async def list_team_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    جلب قائمة كافة أعضاء الفريق والمحامين (النشطين وغير النشطين) لعرضهم في لوحة التحكم الإدارية.
    """
    result = await db.execute(select(User).order_by(User.id.desc()))
    team = result.scalars().all()
    return team


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_and_partner_guard)
):
    """
    إضافة محامٍ أو موظف جديد إلى المكتب (خاص بالإدارة).
    """
    # التحقق من عدم تكرار البريد الإلكتروني
    email_check = await db.execute(select(User).where(User.email == user_in.email))
    if email_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر في النظام."
        )

    hashed_password = get_password_hash(user_in.password)

    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        hashed_password=hashed_password,
        role=user_in.role, # نعتمد الدور الممرر من الإدارة (Associate, Trainee, etc.)
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=UserOut)
async def update_team_member(
    user_id: int,
    user_updates: UserUpdateByAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_and_partner_guard)
):
    """
    تعديل بيانات موظف/محامٍ، أو تجميد حسابه (is_active = False)، أو ترقيته (تغيير الـ role).
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستخدم غير موجود في النظام."
        )

    # تحديث الحقول الممررة فقط بشكل ديناميكي
    update_data = user_updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user