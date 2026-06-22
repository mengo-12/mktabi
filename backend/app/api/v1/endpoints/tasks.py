from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.task import Task
from app.models.auth import User, UserRole
from app.api.deps import get_current_user

# أدوات التنبيهات الحية
from app.models.notification import InAppNotification
from app.services.websocket_manager import notifier_manager

router = APIRouter()

# ➕ 1. مسار إنشاء وتكليف مهمة جديدة
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(
    title: str,
    assigned_to: int,
    description: str = None,
    due_date: str = None,
    priority: str = "medium",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # التحقق من وجود الموظف المسؤول في النظام
    user_res = await db.execute(select(User).where(User.id == assigned_to))
    assigned_user = user_res.scalar_one_or_none()
    if not assigned_user:
        raise HTTPException(status_code=404, detail="الموظف المعين لتنفيذ المهمة غير موجود.")

    parsed_date = datetime.fromisoformat(due_date) if due_date else None

    new_task = Task(
        title=title,
        description=description,
        assigned_to=assigned_to,
        created_by=current_user.id,
        due_date=parsed_date,
        priority=priority
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    # 🔔 إرسال تنبيه فوري للموظف المكلف بالمهمة
    try:
        db_notif = InAppNotification(
            lawyer_id=assigned_to,
            title="📝 تم تكليفك بمهمة عمل جديدة",
            message=f"قام {current_user.full_name} بتكليفك بمهمة: ({title}). يرجى الاطلاع والبدء بالتنفيذ.",
            category="task"
        )
        db.add(db_notif)
        await db.commit()
        await db.refresh(db_notif)

        await notifier_manager.send_personal_notification(
            lawyer_id=assigned_to,
            notification_data={
                "id": db_notif.id,
                "title": db_notif.title,
                "message": db_notif.message,
                "category": db_notif.category,
                # "created_at": str(db_notif.created_at),
                "created_at": db_notif.created_at.isoformat()
            }
        )
        print("✅ تم إرسال تنبيه المهمة عبر الـ WebSocket بنجاح!")
    except Exception as e:
        print(f"⚠️ خطأ في إرسال تنبيه المهمة: {str(e)}")

    return {"message": "تم إنشاء وتكليف المهمة بنجاح", "task_id": new_task.id}

# 📂 2. مسار جلب مهام المستخدم الحالي (المحامي أو السكرتير المتصل)
@router.get("/my-tasks")
async def get_my_tasks(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(Task).where(Task.assigned_to == current_user.id).order_by(Task.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()