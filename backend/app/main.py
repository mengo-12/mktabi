from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
# استيراد الموديلات هنا مهم جداً لكي يتعرف عليها Base.metadata أثناء الإنشاء
from app.models.auth import User
from app.models.client import Client
from app.models.case import Case
# 2️⃣ استيراد الـ api_router لتجميع المسارات (هذا السطر الذي كان ناقصاً أو معطلاً)
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # [1️⃣] إنشاء الجداول بشكل Async عند تشغيل السيرفر
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    # هنا يمكنك وضع أي عمليات تنظيف عند إغلاق السيرفر مستقبلاً (مثل غلق اتصالات الواتساب)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# إعداد الـ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# سنقوم بربط المسارات لاحقاً هنا
app.include_router(api_router, prefix=settings.API_V1_STR)
# تهيئة المعيار القياسي وتحديد رابط الـ login الفعلي للنظام
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

@app.get("/")
def root():
    return {"status": "success", "message": "مرحباً بك في نظام إدارة مكاتب المحاماة الذكي"}