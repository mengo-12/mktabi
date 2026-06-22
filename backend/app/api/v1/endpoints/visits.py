# backend\app\api\v1\endpoints\visits.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.visits import OfficeVisit, VisitStatus
from app.models.auth import User
from app.api.deps import get_current_user
from app.schemas.visits import VisitCreate, VisitOut, VisitUpdate

# استيراد منظومة التنبيهات الحية
from app.models.notification import InAppNotification
from app.services.websocket_manager import notifier_manager

router = APIRouter()

# 🔍 1. جلب الزيارات مع دعم البحث المتقدم والفلترة
@router.get("/", response_model=List[VisitOut])
async def get_all_visits(
    search: Optional[str] = Query(None, description="البحث باسم الزائر أو رقم الهاتف"),
    status_filter: Optional[VisitStatus] = Query(None, description="الفلترة بحالة الزيارة"),
    lawyer_id: Optional[int] = Query(None, description="الفلترة بموجب المحامي المستضيف"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ جلب مواعيد الزيارات مع توفير خيارات البحث والفلترة المرنة والترتيب الذكي بالأحدث """
    stmt = select(OfficeVisit)
    
    # مصفوفة لتجميع الشروط الفلترية ديناميكياً
    conditions = []
    
    if search:
        conditions.append(
            or_(
                OfficeVisit.visitor_name.ilike(f"%{search}%"),
                OfficeVisit.visitor_phone.ilike(f"%{search}%")
            )
        )
    if status_filter:
        conditions.append(OfficeVisit.status == status_filter)
    if lawyer_id:
        conditions.append(OfficeVisit.host_lawyer_id == lawyer_id)
        
    if conditions:
        stmt = stmt.where(*conditions)
        
    # ترتيب مواعيد الزيارات القادمة أولاً تتابعياً
    stmt = stmt.order_by(OfficeVisit.appointment_time.desc())
    
    result = await db.execute(stmt)
    return result.scalars().all()


# 📅 2. تسجيل زيارة وإرسال تنبيه فوري ومؤتمت للمحامي المستضيف
@router.post("/", response_model=VisitOut, status_code=status.HTTP_201_CREATED)
async def create_visit_appointment(
    visit_in: VisitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ تسجيل موعد زيارة جديد مع إطلاق إشعار فوري وتنبيه حي للمحامي المستضيف عبر الـ WebSocket """
    # التأكد من وجود المحامي المستضيف في النظام
    lawyer_check = await db.execute(select(User).where(User.id == visit_in.host_lawyer_id))
    host_lawyer = lawyer_check.scalar_one_or_none()
    if not host_lawyer:
        raise HTTPException(status_code=404, detail="المحامي المستضيف المختار غير موجود في النظام.")

    db_visit = OfficeVisit(**visit_in.model_dump())
    db.add(db_visit)
    await db.commit()
    await db.refresh(db_visit)

    # 🔔 إرسال التنبيه الفوري للمحامي
    try:
        visit_time = db_visit.appointment_time.strftime('%I:%M %p')
        db_notif = InAppNotification(
            lawyer_id=db_visit.host_lawyer_id,
            title="📅 اجتماع وموعد زيارة جديد",
            message=f"تم تسجيل موعد زيارة جديد لـ أ/ {db_visit.visitor_name} في تمام الساعة {visit_time}.",
            category="visit"
        )
        db.add(db_notif)
        await db.commit()
        await db.refresh(db_notif)

        await notifier_manager.send_personal_notification(
            lawyer_id=int(db_visit.host_lawyer_id),
            notification_data={
                "id": int(db_notif.id),
                "title": str(db_notif.title),
                "message": str(db_notif.message),
                "category": str(db_notif.category),
                "created_at": db_notif.created_at.isoformat()
            }
        )
    except Exception as e:
        print(f"⚠️ فشل إرسال إشعار الزيارة الفوري: {str(e)}")

    return db_visit


# 📝 3. تعديل وتحديث بيانات الزيارة
@router.put("/{visit_id}", response_model=VisitOut)
async def update_visit_status_or_details(
    visit_id: int,
    visit_updates: VisitUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ تعديل تفاصيل الزيارة القانونية أو تغيير حالتها الإدارية """
    result = await db.execute(select(OfficeVisit).where(OfficeVisit.id == visit_id))
    visit = result.scalar_one_or_none()

    if not visit:
        raise HTTPException(status_code=404, detail="موعد الزيارة غير موجود أو تم حذفه مسبقاً.")

    update_data = visit_updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(visit, field, value)

    await db.commit()
    await db.refresh(visit)
    return visit


# 🗑️ 4. حذف موعد زيارة (دالة الحذف الجديدة)
@router.delete("/{visit_id}", status_code=status.HTTP_200_OK)
async def delete_visit_appointment(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ حذف موعد زيارة نهائياً من سجلات النظام """
    result = await db.execute(select(OfficeVisit).where(OfficeVisit.id == visit_id))
    visit = result.scalar_one_or_none()

    if not visit:
        raise HTTPException(status_code=404, detail="موعد الزيارة المطلوب حذفه غير موجود.")

    await db.delete(visit)
    await db.commit()
    return {"status": "success", "message": "تم حذف موعد الزيارة بنجاح نهائياً."}