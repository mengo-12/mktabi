from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import InAppNotification
from app.services.websocket_manager import notifier_manager


async def create_notification(
    db: AsyncSession,
    title: str,
    message: str,
    category: str = "system",
    lawyer_id: int | None = None,
    dynamic_table_id: int | None = None,
    dynamic_row_id: int | None = None,
    data: dict | None = None,
):

    notification = InAppNotification(
        lawyer_id=lawyer_id,
        dynamic_table_id=dynamic_table_id,
        dynamic_row_id=dynamic_row_id,
        title=title,
        message=message,
        category=category,
        is_read=False,
        payload=data or {}
    )

    db.add(notification)

    await db.commit()

    await db.refresh(notification)

    print("NOTIFICATION SAVED:", notification.id)

    notification_json = {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "category": notification.category,
        "payload": notification.payload,
        "created_at": str(notification.created_at),
        "is_read": notification.is_read,
    }

    print(
        "SEND TO:",
        lawyer_id,
        dynamic_table_id,
        dynamic_row_id
    )

    await notifier_manager.send_notification(
        notification=notification_json,
        lawyer_id=lawyer_id,
        dynamic_table_id=dynamic_table_id,
        dynamic_row_id=dynamic_row_id,
    )

    return notification