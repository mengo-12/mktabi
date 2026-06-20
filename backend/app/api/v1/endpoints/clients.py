from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional

from app.core.database import get_db
from app.models.auth import User, UserRole
from app.models.client import Client, ClientType
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate, ClientDetailResponse
from app.api.deps import RoleChecker, get_current_user
from app.models.case import Case

router = APIRouter()

# إعداد الصلاحيات المسموح لها بالإدخال والتعديل والأرشفة
allowed_staff = RoleChecker([UserRole.ADMIN, UserRole.PARTNER, UserRole.SECRETARY])

# 📌 [1] مسار إنشاء موكل جديد
@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_staff)
):
    """
    إنشاء موكل جديد (فرد أو شركة).
    مسموح فقط للـ: Admin, Partner, Secretary.
    """
    # التحقق من عدم تكرار رقم الهاتف أو السجل/الهوية منعاً للازدواجية
    query = select(Client).where(Client.phone_number == client_in.phone_number)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="رقم الهاتف هذا مسجل لموكل آخر بالفعل.")

    db_client = Client(**client_in.model_dump())
    db.add(db_client)
    await db.commit()
    await db.refresh(db_client)
    return db_client


# 📌 [2] مسار العرض المتقدم والفلترة والـ Pagination
@router.get("/", response_model=List[ClientResponse])
async def read_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None, description="البحث باسم الموكل"),
    client_type: Optional[ClientType] = Query(None, description="الفلترة حسب النوع"),
    include_archived: bool = Query(False, description="عرض المؤرشفين (متاح فقط للـ Admin)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # أي مستخدم مسجل يمكنه العرض
):
    """
    جلب قائمة الموكلين مع دعم الفلترة والـ Pagination والأرشفة.
    """
    query = select(Client)

    # تطبيق شروط الفلترة والبحث
    if search:
        query = query.where(Client.name.ilike(f"%{search}%"))
    if client_type:
        query = query.where(Client.client_type == client_type)
        
    # منطق الأرشفة الصامتة (Soft Delete handling)
    if not include_archived:
        query = query.where(Client.is_active == True)
    elif include_archived and current_user.role != UserRole.ADMIN:
        # منع غير الإداريين من رؤية الملفات المؤرشفة حتى لو طلبوها
        raise HTTPException(status_code=403, detail="لا تمتلك الصلاحية لاستعراض الملفات المؤرشفة.")

    # تطبيق الـ Pagination والترتيب (الأحدث أولاً)
    query = query.order_by(Client.id.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


# 📌 [3] مسار الأرشفة الصامتة (Soft Delete)
@router.delete("/{id}", response_model=dict)
async def soft_delete_client(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_staff)
):
    """
    أرشفة موكل صامتاً (Soft Delete) بتحويل حالته إلى غير نشط لمنع كسر روابط القضايا.
    """
    result = await db.execute(select(Client).where(Client.id == id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="الموكل غير موجود في النظام.")
        
    if not client.is_active:
        raise HTTPException(status_code=400, detail="هذا الموكل مؤرشف بالفعل سابقاً.")
        
    # تغيير الحالة صامتاً دون الحذف الفعلي من الـ Hard Drive
    client.is_active = False
    await db.commit()
    
    return {"status": "success", "message": f"تم نقل الموكل '{client.name}' إلى الأرشيف بنجاح."}

# 📌 [4] مسار تحديث بيانات الموكل
@router.patch("/{id}", response_model=ClientResponse)
async def update_client(
    id: int,
    client_in: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_staff)
):
    """
    تحديث بيانات موكل موجود جزئياً أو كلياً.
    مسموح فقط للـ: Admin, Partner, Secretary.
    """
    result = await db.execute(select(Client).where(Client.id == id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="الموكل غير موجود في النظام.")
        
    if client_in.phone_number and client_in.phone_number != client.phone_number:
        phone_query = select(Client).where(Client.phone_number == client_in.phone_number)
        phone_result = await db.execute(phone_query)
        if phone_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="رقم الهاتف الجديد مستخدم لموكل آخر بالفعل.")

    update_data = client_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(client, key, value)
        
    await db.commit()
    await db.refresh(client)
    return client


# 📌 [5] مسار جلب تفاصيل موكل محدد مع قضاياه الحية ومرفقاتها
from sqlalchemy.orm import selectinload

@router.get("/{id}", response_model=ClientDetailResponse)
async def read_client_by_id(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    جلب بيانات موكل محدد مع تحميل قائمة قضاياه، ومرفقاتها، واحتساب الوضع المالي والمستحقات حياً.
    """
    query = (
        select(Client)
        .where(Client.id == id)
        .options(
            selectinload(Client.cases).selectinload(Case.attachments)
        )
    )
    
    result = await db.execute(query)
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="الموكل غير موجود في النظام.")
    
    # 🌟 حسابات المستحقات المالية حياً (Dynamic Financial Calculation)
    # ملاحظة للمطورين: يتم ربطها لاحقاً بجداول الفواتير Invoices والمدفوعات Payments الفعليه
    # في الوقت الحالي، سنضع الحسابات الافتراضية بناءً على المتوفر لضمان عدم تعطل الـ Next.js:
    
    total_contracts = 0.0
    total_paid = 0.0
    
    # احتساب أولي من واقع مجموع مبالغ القضايا إذا كانت مخزنة في جدول القضايا
    for case in client.cases:
        total_contracts += getattr(case, "case_value", 0.0) # نفترض وجود حقل قيمة القضية
        total_paid += getattr(case, "amount_paid", 0.0)
        
    total_due = total_contracts - total_paid

    # حقن البيانات المالية ديناميكياً في كائن العميل قبل إرساله
    client.financial_summary = {
        "total_contracts_amount": total_contracts,
        "total_paid_amount": total_paid,
        "total_due_amount": total_due
    }
    
    return client