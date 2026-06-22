# backend\app\api\v1\endpoints\notifications.py
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.notification import InAppNotification
from app.services.websocket_manager import notifier_manager
from app.models.auth import User
from app.api.deps import get_current_user # لضمان الأمان أثناء التحديث

router = APIRouter()

# 📂 [1] مسار جلب التنبيهات غير المقروءة 
@router.get("/unread/{lawyer_id}")
async def get_unread_notifications(lawyer_id: int, db: AsyncSession = Depends(get_db)):
    query = (
        select(InAppNotification)
        .where(InAppNotification.lawyer_id == lawyer_id, InAppNotification.is_read == False)
        .order_by(InAppNotification.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


# 🔄 [2] المسار الجديد المصلح: تحديث حالة تنبيه محدد إلى "تمت القراءة"
@router.patch("/{notification_id}/read", response_model=dict)
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    تحديث حالة التنبيه في قاعدة البيانات ليصبح مقروءاً بشكل دائم ومستقر.
    """
    result = await db.execute(
        select(InAppNotification).where(InAppNotification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="التنبيه المطلوب غير موجود.")
        
    if notification.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="لا تمتلك صلاحية لتعديل هذا التنبيه.")

    # تحويل الحالة وحفظها في قاعدة البيانات
    notification.is_read = True
    await db.commit()
    
    return {"status": "success", "message": "تم تحديث حالة التنبيه بنجاح."}


# 🔌 [3] نقطة اتصال الـ WebSocket 
@router.websocket("/ws/{lawyer_id}")
async def websocket_endpoint(websocket: WebSocket, lawyer_id: int):
    await notifier_manager.connect(websocket=websocket, lawyer_id=lawyer_id)
    try:
        while True:
            data = await websocket.receive_text()
    except Exception:
        pass
    finally:
        notifier_manager.disconnect(websocket, lawyer_id)