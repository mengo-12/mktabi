# تجميع كل المسارات
from fastapi import APIRouter
from app.api.v1.endpoints import auth, clients, cases, attachments, hearings, lawyers, visits

api_router = APIRouter()
# ربط مسارات الـ Auth وتحت وسم (Tag) واضح في الـ Swagger
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients Management"]) # 👈 ربط مسار الموكلين
api_router.include_router(cases.router, prefix="/cases", tags=["Cases Management"]) # 👈 ربط مسار إدارة القضايا
api_router.include_router(attachments.router, prefix="/documents", tags=["Documents Management"]) # 👈 ربط مسار المستندات
api_router.include_router(hearings.router, prefix="/hearings", tags=["Hearings Management"]) # 👈 ربط مسار إدارة الجلسات
api_router.include_router(lawyers.router, prefix="/lawyers", tags=["Lawyers & Team Management"]) # 👇 ربط مسار إدارة المحامين وطاقم العمل الجديد وحمايته بصلاحيات الإدارة
api_router.include_router(visits.router, prefix="/visits", tags=["Office Visits & Appointments"]) # 👇 ربط مسار إدارة مواعيد وزيارات المكتب الجديد