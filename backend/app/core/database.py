from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# إنشاء المحرك غير المتزامن
engine = create_async_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    echo=False, # اجعلها True إذا كنت تريد رؤية استعلامات SQL في الـ Terminal أثناء التطوير
    pool_pre_ping=True,
)

# إنشاء مصنع الجلسات
SessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# الصف الأساسي الذي سترث منه كل الجداول لاحقاً
class Base(DeclarativeBase):
    pass

# دالة مساعدة (Dependency) للحصول على جلسة قاعدة البيانات وغلقها تلقائياً بعد انتهاء الطلب
async def get_db():
    async with SessionLocal() as session:
        yield session