import enum
from sqlalchemy import String, Text, ForeignKey, Date, Time, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import date, time, datetime

class Hearing(Base):
    __tablename__ = "hearings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    
    # تفاصيل الموعد والمكان
    hearing_date: Mapped[date] = mapped_column(Date, nullable=False)
    hearing_time: Mapped[time] = mapped_column(Time, nullable=False)
    court_name: Mapped[str] = mapped_column(String(250), nullable=False) # اسم المحكمة
    room_number: Mapped[str] = mapped_column(String(50), nullable=False)  # رقم القاعة
    judge_name: Mapped[str] = mapped_column(String(150), nullable=True)   # اسم القاضي (اختياري)
    
    # تفاصيل الجلسة والقرارات
    summary: Mapped[str] = mapped_column(Text, nullable=True)       # ملخص ما حدث / القرارات
    requirements: Mapped[str] = mapped_column(Text, nullable=True)  # طلبات الجلسة القادمة
    
    # التتبع الزمني للإنشاء
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # 🔄 العلاقة العكسية مع القضية (One-to-Many)
    case: Mapped["Case"] = relationship("Case", back_populates="hearings")