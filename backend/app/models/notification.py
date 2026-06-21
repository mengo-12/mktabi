# app/models/notification.py
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class InAppNotification(Base):
    __tablename__ = "in_app_notifications"

    id = Column(Integer, primary_key=True, index=True)
    lawyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)                         # عنوان التنبيه
    message = Column(Text, nullable=False)                              # نص التنبيه
    category = Column(String(50), default="general")                    # session, task, visit
    is_read = Column(Boolean, default=False)                            # حالة القراءة
    created_at = Column(DateTime, default=datetime.utcnow)