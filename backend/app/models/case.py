import enum
from sqlalchemy import String, Enum, Text, ForeignKey, Date, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import date

class CaseType(str, enum.Enum):
    CRIMINAL = "criminal"      # جنائي
    CIVIL = "civil"            # مدني
    COMMERCIAL = "commercial"  # تجاري
    LABOR = "labor"            # عمالي
    PERSONAL = "personal"      # أحوال شخصية

class CaseStatus(str, enum.Enum):
    PENDING = "pending"         # تحت الدراسة
    ACTIVE = "active"           # نشطة / متداولة
    APPEAL = "appeal"           # قيد الاستئناف
    SUPREME = "supreme"         # قيد المحكمة العليا
    CLOSED = "closed"           # مغلقة / منتهية

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    case_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=True) # رقم القضية في المحكمة (اختياري بالبداية)
    title: Mapped[str] = mapped_column(String(250), nullable=False) # عنوان القضية
    description: Mapped[str] = mapped_column(Text, nullable=True)   # تفاصيل / وصف القضية
    case_type: Mapped[CaseType] = mapped_column(Enum(CaseType), default=CaseType.COMMERCIAL, nullable=False)
    status: Mapped[CaseStatus] = mapped_column(Enum(CaseStatus), default=CaseStatus.PENDING, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)

    # 🌟 الحقول المالية الجديدة لأتعاب المحاماة الخاصة بهذه القضية
    case_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # إجمالي الأتعاب المتفق عليها مع الموكل لهذه القضية
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0, nullable=False) # ما قام الموكل بسداده لك حتى الآن لهذه القضية

    # 🔗 الروابط الخارجية (Foreign Keys)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    lawyer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False) # من الصعب حذف محامي لديه قضايا نشطة

    # 🔄 تفعيل الـ back-populates للربط ثنائي الاتجاه
    client: Mapped["Client"] = relationship("Client", back_populates="cases")
    lawyer: Mapped["User"] = relationship("User") # ربط مباشر مع جدول المستخدمين لمعرفة المحامي المسؤول
    attachments: Mapped[list["Attachment"]] = relationship("Attachment", back_populates="case", cascade="all, delete-orphan")
    hearings: Mapped[list["Hearing"]] = relationship("Hearing", back_populates="case", cascade="all, delete-orphan")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)