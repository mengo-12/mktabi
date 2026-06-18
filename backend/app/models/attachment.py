from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime

class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    
    # تفاصيل الملف الحيوية
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False) # المسار الفيزيائي على القرص
    file_type: Mapped[str] = mapped_column(String(100), nullable=False) # MIME Type مثل application/pdf
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)     # الحجم بالبايت
    
    # تتبع الموظف والوقت
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # 🔄 العلاقات العكسية
    case: Mapped["Case"] = relationship("Case")