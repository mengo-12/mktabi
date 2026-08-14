from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.services.calendar_notification_scheduler import start_calendar_scheduler

from app.services.backup_scheduler import start_backup_scheduler
# استيراد الموديلات هنا مهم جداً لكي يتعرف عليها Base.metadata أثناء الإنشاء
from app.models.auth import User
from app.models.client import Client
from app.models.case import Case
from app.models.attachment import Attachment
# 2️⃣ استيراد الـ api_router لتجميع المسارات (هذا السطر الذي كان ناقصاً أو معطلاً)
from app.api.v1.api import api_router

from fastapi.responses import JSONResponse
import app.core.system_state as system_state

@asynccontextmanager
async def lifespan(app: FastAPI):
    # [1️⃣] إنشاء الجداول بشكل Async عند تشغيل السيرفر
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    start_calendar_scheduler()

    start_backup_scheduler()
    
    yield

    # إغلاق اتصالات SQLAlchemy
    await engine.dispose()

    print("🔌 Database engine disposed")
    # هنا يمكنك وضع أي عمليات تنظيف عند إغلاق السيرفر مستقبلاً (مثل غلق اتصالات الواتساب)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# إعداد الـ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def maintenance_middleware(request, call_next):

    if system_state.is_restoring:

        allowed = (
            "/docs",
            "/openapi.json",
            "/api/v1/backups/restore/",
        )

        if not any(request.url.path.startswith(p) for p in allowed):

            return JSONResponse(
                status_code=503,
                content={
                    "detail": "System is restoring database. Please try again later."
                },
            )

    return await call_next(request)

# سنقوم بربط المسارات لاحقاً هنا
app.include_router(api_router, prefix=settings.API_V1_STR)
# تهيئة المعيار القياسي وتحديد رابط الـ login الفعلي للنظام
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

@app.get("/")
def root():
    return {"status": "success", "message": "مرحباً بك في نظام إدارة مكاتب المحاماة الذكي"}