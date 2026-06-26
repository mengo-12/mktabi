from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime
from typing import Optional

class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # 💡 تم تحويلها إلى Optional و nullable=True لتقبل الرفع الديناميكي العام
    case_id: Mapped[Optional[int]] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False) 
    file_type: Mapped[str] = mapped_column(String(100), nullable=False) 
    file_size: Mapped[int] = mapped_column(Integer, nullable=False) 
    
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    case: Mapped[Optional["Case"]] = relationship("Case", back_populates="attachments")