from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.hearing import Hearing
from app.models.case import Case
from app.models.auth import User, UserRole
from app.schemas.hearing import HearingCreate, HearingResponse, HearingUpdate
from app.api.deps import RoleChecker, get_current_user

router = APIRouter()

# 🛡️ دالة مساعدة داخلية للتحقق من الصلاحية الأمنية للمحامي على القضية
async def verify_case_access(case_id: int, current_user: User, db: AsyncSession) -> Case:
    result = await db.execute(select(Case).where(Case.id == case_id, Case.is_active == True))
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="الملف القضائي المرتبط غير موجود أو مؤرشف.")
        
    # السماح التلقائي للأدمن والشركاء
    if current_user.role in [UserRole.ADMIN, UserRole.PARTNER]:
        return case
        
    # حظر المحامين الآخرين إذا لم تكن القضية مسندة إليهم حصراً
    if case.lawyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="عذراً، لا تمتلك الصلاحية القانونية للوصول أو التعديل على جلسات هذه القضية."
        )
    return case


# ➕ [1] مسار إنشاء جلسة جديدة لقضية معينة
@router.post("/", response_model=HearingResponse, status_code=status.HTTP_201_CREATED)
async def create_new_hearing(
    hearing_in: HearingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # التحقق من الصلاحية الأمنية للمستخدم على القضية أولاً
    await verify_case_access(hearing_in.case_id, current_user, db)
    
    new_hearing = Hearing(**hearing_in.model_dump())
    db.add(new_hearing)
    await db.commit()
    await db.refresh(new_hearing)
    return new_hearing


# 📂 [2] مسار جلب جميع جلسات قضية محددة مرتبة تاريخياً من الأقدم للأحدث
@router.get("/case/{case_id}", response_model=List[HearingResponse])
async def get_case_hearings(
    case_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # التحقق الأمني
    await verify_case_access(case_id, current_user, db)
    
    # جلب الجلسات وترتيبها تصاعدياً حسب التاريخ والوقت لتظهر بالتتابع الصحيح للمحامي
    query = select(Hearing).where(Hearing.case_id == case_id).order_by(Hearing.hearing_date.asc(), Hearing.hearing_time.asc())
    result = await db.execute(query)
    return result.scalars().all()


# 📝 [3] مسار تحديث بيانات الجلسة (إضافة مذكرات، قرارات، أو تعديل الموعد)
@router.put("/{hearing_id}", response_model=HearingResponse)
async def update_hearing_details(
    hearing_id: int,
    hearing_update: HearingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. جلب الجلسة للتأكد من وجودها ومعرفة رقم القضية التابعة لها
    result = await db.execute(select(Hearing).where(Hearing.id == hearing_id))
    hearing = result.scalar_one_or_none()
    
    if not hearing:
        raise HTTPException(status_code=404, detail="جلسة المحاكمة المطلوبة غير موجودة.")
        
    # 2. التحقق الأمني من خلال رقم القضية المرتبطة بالجلسة
    await verify_case_access(hearing.case_id, current_user, db)
    
    # 3. تحديث الحقول المرسلة فقط ديناميكياً
    update_data = hearing_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(hearing, key, value)
        
    await db.commit()
    await db.refresh(hearing)
    return hearing