import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from datetime import datetime

class VisitStatus(str, enum.Enum):
    PENDING = "pending"     # قيد الانتظار / مجدول
    CONFIRMED = "confirmed" # مؤكد
    COMPLETED = "completed" # اكتملت الزيارة
    CANCELLED = "cancelled" # ملغية

class OfficeVisit(Base):
    __tablename__ = "office_visits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    visitor_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    visitor_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    visit_reason: Mapped[str] = mapped_column(String(255), nullable=False) # سبب الزيارة: استشارة جديدة، توقيع عقد..
    appointment_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[VisitStatus] = mapped_column(Enum(VisitStatus), default=VisitStatus.PENDING, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    # ربط الزيارة بالمحامي المستضيف (من جدول المستخدمين الحالي)
    host_lawyer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)