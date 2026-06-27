# تجميع كل المسارات
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, clients, cases, attachments, hearings, 
    lawyers, visits, analytics, tasks, notifications, dynamic, office_settings
)

api_router = APIRouter()

# ربط مسارات الـ Auth وتحت وسم (Tag) واضح في الـ Swagger
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients Management"]) # 👈 ربط مسار الموكلين
api_router.include_router(cases.router, prefix="/cases", tags=["Cases Management"]) # 👈 ربط مسار إدارة القضايا
api_router.include_router(attachments.router, prefix="/documents", tags=["Documents Management"]) # 👈 ربط مسار المستندات
api_router.include_router(hearings.router, prefix="/hearings", tags=["Hearings Management"]) # 👈 ربط مسار إدارة الجلسات
api_router.include_router(lawyers.router, prefix="/lawyers", tags=["Lawyers & Team Management"]) # 👇 ربط مسار إدارة المحامين وطاقم العمل الجديد وحمايته بصلاحيات الإدارة
api_router.include_router(visits.router, prefix="/visits", tags=["Office Visits & Appointments"]) # 👇 ربط مسار إدارة مواعيد وزيارات المكتب الجديد
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Reports"]) # 👇 ربط مسار التحليلات والتقارير الجديد
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks Management"]) # 👇 ربط مسار إدارة المهام الجديد
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications & WebSockets"]) # 🔔 🎯 تفعيل ربط مسار التنبيهات والـ WebSockets في السيرفر

# 🚀 ربط محرك النظام الديناميكي الجديد وتجميعه مع بقية المسارات تلقائياً
api_router.include_router(dynamic.router, prefix="/dynamic", tags=["Dynamic System OS"])
# 📄 2. أضف هذا السطر لربط مسار قوالب المستندات وإعدادات المكتب بالسيستم
api_router.include_router(office_settings.router, prefix="/office-settings", tags=["Office Settings & Document Generation"])