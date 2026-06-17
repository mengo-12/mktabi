# نقطة الانطلاق لتشغيل FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# إعداد الصلاحيات (CORS) للسماح لـ Next.js بالاتصال بالـ Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في الإنتاج سنحدد رابط سيرفر العميل فقط
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "success", "message": "مرحباً بك في نظام إدارة مكاتب المحاماة الذكي"}