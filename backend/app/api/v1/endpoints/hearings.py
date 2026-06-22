from unittest import case

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

from app.models.notification import InAppNotification
from app.services.websocket_manager import notifier_manager

from datetime import date, datetime, timedelta

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
    case = await verify_case_access(hearing_in.case_id, current_user, db)

    new_hearing = Hearing(**hearing_in.model_dump())
    db.add(new_hearing)
    await db.commit()
    await db.refresh(new_hearing)

# 🔔 إطلاق تنبيه فوري: قيد جلسة جديدة للمحامي المسؤول عن القضية
    try:
        session_time = new_hearing.hearing_time.strftime('%I:%M %p') if new_hearing.hearing_time else ""
        db_notif = InAppNotification(
            lawyer_id=case.lawyer_id,  # إرسال التنبيه للمحامي صاحب القضية
            title="⚖️ جلسة قضائية جديدة مقيدة",
            message=f"تمت جدولة جلسة لقضية ({case.title}) بتاريخ {new_hearing.hearing_date} الساعة {session_time} في {new_hearing.court_name or 'المحكمة'}.",
            category="session"
        )
        db.add(db_notif)
        await db.commit()

        await notifier_manager.send_personal_notification(
            lawyer_id=case.lawyer_id,
            notification_data={
                "id": db_notif.id,
                "title": db_notif.title,
                "message": db_notif.message,
                "category": db_notif.category,
                "created_at": str(db_notif.created_at)
            }
        )
    except Exception as e:
        print(f"⚠️ خطأ غير مؤثر في التنبيهات: {str(e)}")

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
    is_rescheduled = "hearing_date" in update_data or "hearing_time" in update_data
    
    for key, value in update_data.items():
        setattr(hearing, key, value)
        
    await db.commit()
    await db.refresh(hearing)
    
    # 🔔 إطلاق تنبيه فوري: في حال تم تعديل أو تأجيل موعد الجلسة
    if is_rescheduled:
        try:
            session_time = hearing.hearing_time.strftime('%I:%M %p') if hearing.hearing_time else ""
            db_notif = InAppNotification(
                lawyer_id=case.lawyer_id,
                title="🔄 تعديل وتأجيل في موعد الجلسة",
                message=f"تنبيه: تم تعديل موعد جلسة قضية ({case.title}) ليصبح بتاريخ {hearing.hearing_date} الساعة {session_time}.",
                category="session"
            )
            db.add(db_notif)
            await db.commit()

            await notifier_manager.send_personal_notification(
                lawyer_id=case.lawyer_id,
                notification_data={
                    "id": db_notif.id,
                    "title": db_notif.title,
                    "message": db_notif.message,
                    "category": db_notif.category,
                    "created_at": str(db_notif.created_at)
                }
            )
        except Exception as e:
            print(f"⚠️ خطأ غير مؤثر في تنبيه التعديل: {str(e)}")

        # ⏱️ [4] مسار ذكي لترتيب الجلسات اليومية وكشف التداخلات للمحامي الحالي
@router.get("/daily-schedule", response_model=dict)
async def get_daily_smart_schedule(
    target_date: str = None, # يمكن تمرير تاريخ معين أو تركه لليوم تلقائياً
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # تحديد التاريخ المستهدف (اليوم الافتراضي)
    query_date = date.fromisoformat(target_date) if target_date else date.today()

    # 1. جلب جميع القضايا المسندة لهذا المحامي
    cases_stmt = select(Case.id).where(Case.lawyer_id == current_user.id, Case.is_active == True)
    cases_res = await db.execute(cases_stmt)
    case_ids = [row[0] for row in cases_res.all()]

    if not case_ids:
        return {"date": str(query_date), "hearings": [], "conflicts_detected": False}

    # 2. جلب جميع جلسات اليوم لهذه القضايا مرتبة بالوقت
    hearings_stmt = (
        select(Hearing, Case.title.label("case_title"))
        .join(Case, Case.id == Hearing.case_id)
        .where(Hearing.case_id.in_(case_ids), Hearing.hearing_date == query_date)
        .order_by(Hearing.hearing_time.asc())
    )
    hearings_res = await db.execute(hearings_stmt)
    rows = hearings_res.all()

    formatted_hearings = []
    conflicts_detected = False

    # 3. خوارزمية ترتيب وكشف التداخل الزمني (Conflict Detection)
    for i, row in enumerate(rows):
        hearing, case_title = row[0], row[1]
        has_conflict = False
        conflict_with = None

        # تحويل الوقت الحالي لمقارنته
        current_time = hearing.hearing_time

        # فحص الجلسة السابقة أو اللاحقة لمعرفة هل الفارق الزمني أقل من ساعة مثلاً؟
        if i > 0:
            prev_hearing = rows[i-1][0]
            # إذا كان الفارق بين الجلستين أقل من 60 دقيقة (تداخل محتمل)
            if current_time and prev_hearing.hearing_time:
                # تحويل الأوقات إلى datetime للمقارنة الرياضية
                dt_current = datetime.combine(date.today(), current_time)
                dt_prev = datetime.combine(date.today(), prev_hearing.hearing_time)
                
                if (dt_current - dt_prev) < timedelta(minutes=60):
                    has_conflict = True
                    conflicts_detected = True
                    conflict_with = f"جلسة قضية: {rows[i-1][1]}"

        formatted_hearings.append({
            "id": hearing.id,
            "case_title": case_title,
            "court_name": hearing.court_name or "غير محدد",
            "room_number": hearing.room_number or "غير محدد",
            "time": hearing.hearing_time.strftime('%I:%M %p') if hearing.hearing_time else "غير محدد",
            "has_conflict": has_conflict,
            "conflict_reason": f"تداخل زمني حاد مع ({conflict_with})" if has_conflict else None
        })

    return {
        "date": str(query_date),
        "total_hearings": len(formatted_hearings),
        "conflicts_detected": conflicts_detected,
        "hearings": formatted_hearings
    }

    return hearing