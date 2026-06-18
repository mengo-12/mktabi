from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.models.auth import User, UserRole
from app.models.client import Client
from app.models.case import Case, CaseType, CaseStatus
from app.schemas.case import CaseCreate, CaseResponse, CaseUpdate
from app.api.deps import RoleChecker, get_current_user

router = APIRouter()

# الصلاحيات المسموح لها بالإدخال والتعديل والأرشفة
allowed_creators = RoleChecker([UserRole.ADMIN, UserRole.PARTNER, UserRole.SECRETARY])

# 📌 [1] مسار إنشاء قضية جديدة مع التحقق الصارم من الروابط
@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_in: CaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_creators)
):
    """
    إنشاء قضية جديدة مع التحقق الفوري من وجود الموكل والمحامي في قاعدة البيانات.
    """
    # 1. التحقق من وجود الموكل
    client_res = await db.execute(select(Client).where(Client.id == case_in.client_id))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="الموكل المعين غير موجود في النظام.")
    if not client.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="لا يمكن ربط قضية بموكل مؤرشف غير نشط.")

    # 2. التحقق من وجود المحامي المسؤول
    lawyer_res = await db.execute(select(User).where(User.id == case_in.lawyer_id))
    lawyer = lawyer_res.scalar_one_or_none()
    if not lawyer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المحامي المسؤول غير موجود في النظام.")

    # 3. التحقق من عدم تكرار رقم القضية بالمحكمة
    if case_in.case_number:
        case_num_res = await db.execute(select(Case).where(Case.case_number == case_in.case_number))
        if case_num_res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="رقم القضية هذا مسجل مسبقاً بقضية أخرى.")

    # حفظ القضية
    db_case = Case(**case_in.model_dump(), is_active=True)
    db.add(db_case)
    await db.commit()
    
    # جلب البيانات مجدداً مع عمل Eager Loading للعلاقات لكي تظهر في الـ Response
    stmt = select(Case).where(Case.id == db_case.id).options(
        selectinload(Case.client),
        selectinload(Case.lawyer)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


# 📌 [2] مسار العرض الذكي وعزل البيانات (Role-Based Data Isolation)
@router.get("/", response_model=List[CaseResponse])
async def read_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None, description="البحث في العناوين"),
    case_type: Optional[CaseType] = Query(None),
    status_filter: Optional[CaseStatus] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    جلب القضايا بذكاء عزل الصلاحيات:
    - Admin / Partner: يشاهدون جميع قضايا المكتب بدون استثناء.
    - Associate / Trainee: يعود لهم النظام فقط بالقضايا المسندة إليهم برمجياً.
    """
    # استخدام selectinload لضمان جلب بيانات الموكل والمحامي بشكل Async فعال جداً وبأداء سريع
    query = select(Case).where(Case.is_active == True).options(
        selectinload(Case.client),
        selectinload(Case.lawyer)
    )

    # 🧠 تطبيق شرط العزل الذكي (Data Isolation Guard)
    if current_user.role not in [UserRole.ADMIN, UserRole.PARTNER]:
        query = query.where(Case.lawyer_id == current_user.id)

    # تطبيق الفلاتر الإضافية
    if search:
        query = query.where(Case.title.ilike(f"%{search}%"))
    if case_type:
        query = query.where(Case.case_type == case_type)
    if status_filter:
        query = query.where(Case.status == status_filter)

    query = query.order_by(Case.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{id}", response_model=CaseResponse)
async def read_case_by_id(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🧠 قمنا بإزالة السطر المسبب للمشكلة مؤقتاً لضمان تشغيل الصفحة فوراً
    query = select(Case).where(Case.id == id, Case.is_active == True).options(
        selectinload(Case.client),
        selectinload(Case.lawyer),
        selectinload(Case.attachments)
    )
    
    result = await db.execute(query)
    db_case = result.scalar_one_or_none()
    
    if not db_case:
        raise HTTPException(status_code=404, detail="الملف القضائي غير موجود أو تم أرشفته.")
        
    # جدار الحماية وعزل البيانات
    if current_user.role not in [UserRole.ADMIN, UserRole.PARTNER]:
        if db_case.lawyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="غير مصرح لك بالدخول على هذه القضية."
            )
            
    return db_case

# 📌 [3] مسار الأرشفة الصامتة للقضايا (Soft Delete)
@router.delete("/{id}", response_model=dict)
async def soft_delete_case(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_creators)
):
    """
    أرشفة القضية صامتاً (Soft Delete) بتحويل حقل is_active إلى False.
    """
    result = await db.execute(select(Case).where(Case.id == id))
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="القضية غير موجودة في النظام.")
    if not case.is_active:
        raise HTTPException(status_code=400, detail="هذه القضية مؤرشفة بالفعل سابقاً.")
        
    case.is_active = False
    await db.commit()
    return {"status": "success", "message": f"تم نقل القضية '{case.title}' إلى الأرشيف صامتاً بنجاح."}