# تجميع كل المسارات
from fastapi import APIRouter
from app.api.v1.endpoints import auth, clients, cases

api_router = APIRouter()
# ربط مسارات الـ Auth وتحت وسم (Tag) واضح في الـ Swagger
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients Management"]) # 👈 ربط مسار الموكلين
api_router.include_router(cases.router, prefix="/cases", tags=["Cases Management"]) # 👈 ربط مسار إدارة القضايا