# تجميع كل المسارات
from fastapi import APIRouter
from app.api.v1.endpoints import auth, clients

api_router = APIRouter()
# ربط مسارات الـ Auth وتحت وسم (Tag) واضح في الـ Swagger
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients Management"]) # 👈 ربط مسار الموكلين