from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.visits import OfficeVisit, VisitStatus
from app.models.auth import User
from app.api.deps import get_current_user
from app.schemas.visits import VisitCreate, VisitOut, VisitUpdate

router = APIRouter()

@router.get("/", response_model=List[VisitOut])
async def get_all_visits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ جلب جميع مواعيد الزيارات للمكتب مرتبة بالأحدث """
    result = await db.execute(select(OfficeVisit).order_by(OfficeVisit.appointment_time.asc()))
    return result.scalars().all()


@router.post("/", response_model=VisitOut, status_code=status.HTTP_201_CREATED)
async def create_visit_appointment(
    visit_in: VisitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ تسجيل موعد زيارة جديد (متاح للسكرتارية وكافة المحامين) """
    # التأكد من أن المحامي المستضيف موجود فعلاً في النظام
    lawyer_check = await db.execute(select(User).where(User.id == visit_in.host_lawyer_id))
    if not lawyer_check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="المحامي المستضيف المختار غير موجود في النظام.")

    db_visit = OfficeVisit(**visit_in.model_dump())
    db.add(db_visit)
    await db.commit()
    await db.refresh(db_visit)
    return db_visit


@router.put("/{visit_id}", response_model=VisitOut)
async def update_visit_status_or_details(
    visit_id: int,
    visit_updates: VisitUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ تعديل تفاصيل الزيارة أو تحديث حالتها (مثال: تحويلها إلى مكتملة أو ملغية) """
    result = await db.execute(select(OfficeVisit).where(OfficeVisit.id == visit_id))
    visit = result.scalar_one_or_none()

    if not visit:
        raise HTTPException(status_code=404, detail="موعد الزيارة غير موجود.")

    update_data = visit_updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(visit, field, value)

    await db.commit()
    await db.refresh(visit)
    return visit