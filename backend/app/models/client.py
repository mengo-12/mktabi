import enum
from sqlalchemy import String, Enum, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class ClientType(str, enum.Enum):
    INDIVIDUAL = "individual"  # فرد
    CORPORATE = "corporate"    # شركة / مؤسسة

class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    client_type: Mapped[ClientType] = mapped_column(Enum(ClientType), default=ClientType.INDIVIDUAL, nullable=False)
    
    # بيانات التواصل الأساسية
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    
    # الحقول الشرطية (Optional conditional fields)
    national_id: Mapped[str] = mapped_column(String(20), nullable=True)         # للأفراد
    commercial_register: Mapped[str] = mapped_column(String(50), nullable=True) # للشركات (السجل التجاري)
    company_representative: Mapped[str] = mapped_column(String(150), nullable=True) # اسم ممثل الشركة
    
    # التحكم بحالة الموكل (الأرشفة الصامتة)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # 🔗 العلاقات (One-to-Many): الموكل يملك عدة قضايا
    cases: Mapped[list["Case"]] = relationship(
        "Case", 
        back_populates="client", 
        cascade="all, delete-orphan"
    )