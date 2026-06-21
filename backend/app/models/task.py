from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)                         # عنوان المهمة
    description = Column(Text, nullable=True)                            # تفاصيل العمل المطلوب
    due_date = Column(DateTime, nullable=True)                           # تاريخ ووقت الاستحقاق النهائي
    status = Column(String(50), default="pending")                       # pending, in_progress, completed
    priority = Column(String(50), default="medium")                      # low, medium, high
    
    # الروابط
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # منشئ المهمة
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # المسؤول عن التنفيذ
    
    created_at = Column(DateTime, default=datetime.utcnow)