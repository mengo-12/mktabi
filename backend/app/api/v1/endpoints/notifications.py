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
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()

# 📂 [1] مسار جلب التنبيهات غير المقروءة 
@router.get("/unread")
async def get_unread_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    يجلب تنبيهات المستخدم الحالي تلقائياً من التوكن.
    """

    result = await db.execute(
        select(InAppNotification)
        .where(
            InAppNotification.lawyer_id == current_user.id,
            InAppNotification.is_read == False,
        )
        .order_by(InAppNotification.created_at.desc())
    )

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
        raise HTTPException(
            status_code=403,
            detail="ليس لديك صلاحية لهذا التنبيه."
        )

    # تحويل الحالة وحفظها في قاعدة البيانات
    notification.is_read = True
    await db.commit()
    
    return {"status": "success", "message": "تم تحديث حالة التنبيه بنجاح."}


# 🔌 [3] نقطة اتصال الـ WebSocket 
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    token = websocket.query_params.get("token")

    if not token:
        await websocket.close()
        return

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        sub = str(payload["sub"])
        print("TOKEN SUB:", sub)

    except JWTError:

        await websocket.close()

        return

    # ===========================
    # موظف ديناميكي
    # ===========================

    if sub.startswith("dynamic_staff_"):

        parts = sub.split("_")

        row_id = int(parts[2])

        table_id = int(parts[4])

        await notifier_manager.connect_staff(
            table_id=table_id,
            row_id=row_id,
            websocket=websocket,
        )

        try:

            while True:
                await websocket.receive_text()

        except Exception:
            pass

        finally:

            notifier_manager.disconnect_staff(
                table_id=table_id,
                row_id=row_id,
                websocket=websocket,
            )

        return

    # ===========================
    # مستخدم إدارة
    # ===========================

    user_id = int(sub)

    await notifier_manager.connect_user(
        user_id=user_id,
        websocket=websocket,
    )

    try:

        while True:
            await websocket.receive_text()

    except Exception:
        pass

    finally:

        notifier_manager.disconnect_user(
            user_id=user_id,
            websocket=websocket,
        )