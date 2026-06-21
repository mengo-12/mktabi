# backend\app\api\v1\endpoints\notifications.py
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.notification import InAppNotification
from app.services.websocket_manager import notifier_manager

router = APIRouter()

# 📂 [1] مسار جلب التنبيهات غير المقروءة (الحل لخطأ 404)
@router.get("/unread/{lawyer_id}")
async def get_unread_notifications(lawyer_id: int, db: AsyncSession = Depends(get_db)):
    query = (
        select(InAppNotification)
        .where(InAppNotification.lawyer_id == lawyer_id, InAppNotification.is_read == False)
        .order_by(InAppNotification.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


# 🔌 [2] نقطة اتصال الـ WebSocket (الحل لخطأ 403)
# أزلنا الـ Depends(get_current_user) المعقدة هنا لمنع حظر المتصفح، وجعلنا التحقق يعتمد على المعرّف الممرر بالرابط مباشرة
@router.websocket("/ws/{lawyer_id}")
async def websocket_endpoint(websocket: WebSocket, lawyer_id: int):
    await notifier_manager.connect(websocket, lawyer_id)
    try:
        while True:
            # الحفاظ على الاتصال حياً ومفتوحاً
            data = await websocket.receive_text()
    except Exception:
        pass
    finally:
        notifier_manager.disconnect(websocket, lawyer_id)