# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.models.visit import Visit
# from app.models.notification import InAppNotification  # استيراد موديل التنبيهات
# from app.services.websocket_manager import notifier_manager  # استيراد مدير الـ WebSocket
# from datetime import datetime

# router = APIRouter(prefix="/api/v1/visits", tags=["Visits"])

# @router.post("/", status_code=status.HTTP_201_CREATED)
# async def create_visit(visit_data: VisitCreate, db: Session = Depends(get_db)):
#     # 1. حفظ بيانات الزيارة الأساسية القادمة من المودال
#     new_visit = Visit(
#         visitor_name=visit_data.visitor_name,
#         visitor_phone=visit_data.visitor_phone,
#         visit_reason=visit_data.visit_reason,
#         appointment_time=visit_data.appointment_time,
#         lawyer_id=visit_data.lawyer_id  # المحامي المختار للاجتماع
#     )
#     db.add(new_visit)
#     db.commit()
#     db.refresh(new_visit)
    
#     # تحضير صيغة الوقت للعرض في الرسالة
#     visit_time = new_visit.appointment_time.strftime('%I:%M %p')

#     # ================== هنا نضع الكود الخاص بك ==================
#     # 2. حفظ التنبيه في قاعدة البيانات ليراه المحامي لاحقاً
#     db_notif = InAppNotification(
#         lawyer_id=new_visit.lawyer_id,  # نربطه بمعرف المحامي المستهدف
#         title="📅 اجتماع مجدول جديد",
#         message=f"لديك اجتماع جديد مع أ/ {new_visit.visitor_name} في تمام الساعة {visit_time}",
#         category="visit"
#     )
#     db.add(db_notif)
#     db.commit()
#     db.refresh(db_notif)

#     # 3. دفعه فوراً لجرس المحامي حياً عبر الـ WebSocket إذا كان متصلاً الآن
#     await notifier_manager.send_personal_notification(
#         lawyer_id=new_visit.lawyer_id,
#         notification_data={
#             "id": db_notif.id,
#             "title": db_notif.title,
#             "message": db_notif.message,
#             "category": db_notif.category,
#             "created_at": str(db_notif.created_at)
#         }
#     )
#     # ============================================================

#     return {"status": "success", "data": new_visit}