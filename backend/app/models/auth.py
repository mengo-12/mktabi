# جدول المستخدمين والصلاحياتimport enum

import enum
from sqlalchemy import String, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"               # مدير النظام (له كل الصلاحيات)
    PARTNER = "partner"           # محامي شريك
    ASSOCIATE = "associate"       # محامي مستشار / ممارس
    TRAINEE = "trainee"           # محامي متدرب
    SECRETARY = "secretary"       # سكرتارية ومكتب أمامي

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.ASSOCIATE, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)