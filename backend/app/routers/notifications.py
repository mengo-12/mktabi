# app/routers/notifications.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.websocket_manager import notifier_manager

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

# 1. القناة الحية للمتصفح
@router.websocket("/ws/{lawyer_id}")
async def websocket_endpoint(websocket: WebSocket, lawyer_id: int):
    await notifier_manager.connect(lawyer_id, websocket)
    try:
        while True:
            # إبقاء القناة مفتوحة للاستماع (Heartbeat / Ping-Pong)
            await websocket.receive_text()
    except WebSocketDisconnect:
        notifier_manager.disconnect(lawyer_id, websocket)

# 2. جلب التنبيهات غير المقروءة للجرس عند فتح النظام
@router.get("/unread/{lawyer_id}")
def get_unread_notifications(lawyer_id: int, db: Session = Depends(get_db)):
    return db.query(InAppNotification).filter(
        InAppNotification.lawyer_id == lawyer_id,
        InAppNotification.is_read == False
    ).order_by(InAppNotification.created_at.desc()).all()