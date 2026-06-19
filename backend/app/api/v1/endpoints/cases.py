import os
import shutil
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.models.auth import User, UserRole
from app.models.client import Client
from app.models.case import Case, CaseType, CaseStatus
from app.models.attachment import Attachment  # استيراد الموديل الخاص بك
from app.schemas.case import CaseResponse
from app.api.deps import RoleChecker, get_current_user
from app.models.case import Case # تأكد من استيراد الموديل
from app.schemas.case import CaseUpdate # تحتاج لتعريف هذا الـ Schema

router = APIRouter()

allowed_creators = RoleChecker([UserRole.ADMIN, UserRole.PARTNER, UserRole.SECRETARY])

# 📁 المجلد المحلي المخصص لحفظ ملفات القضايا على السيرفر (On-Premises)
UPLOAD_DIR = "uploaded_case_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    # حقول القضية من خلال الـ Form
    title: str = Form(...),
    client_id: int = Form(...),
    lawyer_id: int = Form(...),
    case_number: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    case_type: CaseType = Form(CaseType.COMMERCIAL),
    status_filter: CaseStatus = Form(CaseStatus.PENDING, alias="status"),
    start_date: Optional[date] = Form(None),
    
    # 📂 استقبال مصفوفة الملفات المتعددة
    files: Optional[List[UploadFile]] = File(None),
    
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_creators) # المستخدم الحالي الذي يقوم بالعملية
):
    """
    إنشاء قضية جديدة ورفع مستندات متعددة مع ربطها تلقائياً بالموظف الذي قام بالرفع.
    """
    # 1. التحقق من وجود الموكل
    client_res = await db.execute(select(Client).where(Client.id == client_id))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="الموكل المعين غير موجود في النظام.")
    if not client.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="لا يمكن ربط قضية بموكل مؤرشف غير نشط.")

    # 2. التحقق من وجود المحامي المسؤول
    lawyer_res = await db.execute(select(User).where(User.id == lawyer_id))
    lawyer = lawyer_res.scalar_one_or_none()
    if not lawyer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المحامي المسؤول غير موجود في النظام.")

    # 3. التحقق من عدم تكرار رقم القضية
    if case_number:
        case_num_res = await db.execute(select(Case).where(Case.case_number == case_number))
        if case_num_res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="رقم القضية هذا مسجل مسبقاً بقضية أخرى.")

    # 4. حفظ كائن القضية مبدئياً
    final_start_date = start_date or date.today()
    db_case = Case(
        title=title,
        client_id=client_id,
        lawyer_id=lawyer_id,
        case_number=case_number,
        description=description,
        case_type=case_type,
        status=status_filter,
        start_date=final_start_date,
        is_active=True
    )
    db.add(db_case)
    await db.flush() # توليد ID القضية لربط المرفقات بها

    # 5. معالجة وحفظ الملفات المرفوعة
    if files:
        for file in files:
            # توليد اسم فريد للملف لمنع التداخل والتعارض على القرص الصلب
            unique_filename = f"{uuid4()}_{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # كتابة الملف في السيرفر المحلي
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            # الحصول على الحجم الحقيقي بعد الحفظ بالبايت
            file_size = os.path.getsize(file_path)

            # ✨ السحر هنا: إنشاء سجل المرفق بناءً على الـ Model الخاص بك بدقة
            db_attachment = Attachment(
                case_id=db_case.id,
                original_name=file.filename,
                file_path=file_path,                               # مسار الملف الفعلي كاملاً
                file_type=file.content_type or "application/octet-stream", # MIME Type
                file_size=file_size,                               # الحجم بالبايت
                uploaded_by=current_user.id                        # 🌟 ربط المرفق بالمسؤول الذي قام برفعه حالياً
            )
            db.add(db_attachment)

    # حفظ الحزمة كاملة (القضية + المرفقات المتعددة) في قاعدة البيانات
    await db.commit()
    
    # إعادة تحميل القضية مع عمل Eager Loading للعلاقات لضمان مطابقة الـ Schema المرسلة للفرونت إند
    stmt = select(Case).where(Case.id == db_case.id).options(
        selectinload(Case.client),
        selectinload(Case.lawyer),
        selectinload(Case.attachments)
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
    # 🛠️ الحل هنا: أضفنا selectinload(Case.attachments) ليتطابق الاستعلام مع متطلبات CaseResponse بالكامل ويمنع خطأ الـ Greenlet
    query = select(Case).where(Case.is_active == True).options(
        selectinload(Case.client),
        selectinload(Case.lawyer),
        selectinload(Case.attachments) # ✅ تمت الإضافة بنجاح لحل مشكلة الـ 500 و Network Error
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
        raise HTTPException(status_code=404, detail="القضية غير موجودة in النظام.")
    if not case.is_active:
        raise HTTPException(status_code=400, detail="هذه القضية مؤرشفة بالفعل سابقاً.")
        
    case.is_active = False
    await db.commit()
    return {"status": "success", "message": f"تم نقل القضية '{case.title}' إلى الأرشيف صامتاً بنجاح."}


@router.patch("/{case_id}", response_model=CaseResponse) # أضفنا response_model لضمان التوافق
async def update_case(
    case_id: int,
    # المدخلات النصية (كلها اختيارية لأنها تعديل جزئي)
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status: Optional[CaseStatus] = Form(None),
    case_number: Optional[str] = Form(None),
    case_type: Optional[CaseType] = Form(None),
    client_id: Optional[int] = Form(None),
    lawyer_id: Optional[int] = Form(None),
    # الملفات المرفقة
    files: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # 1. البحث عن القضية
    result = await db.execute(select(Case).where(Case.id == case_id))
    db_case = result.scalar_one_or_none()
    
    if not db_case:
        raise HTTPException(status_code=404, detail="القضية غير موجودة")
    
    # 2. تحديث الحقول النصية (إذا أرسل المستخدم قيمة جديدة)
    if title is not None: db_case.title = title
    if description is not None: db_case.description = description
    if status is not None: db_case.status = status
    if case_number is not None: db_case.case_number = case_number
    if case_type is not None: db_case.case_type = case_type
    if client_id is not None: db_case.client_id = client_id
    if lawyer_id is not None: db_case.lawyer_id = lawyer_id

    # 3. معالجة الملفات الجديدة (إذا تم رفع ملفات)
    if files:
        for file in files:
            unique_filename = f"{uuid4()}_{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            db_attachment = Attachment(
                case_id=db_case.id,
                original_name=file.filename,
                file_path=file_path,
                file_type=file.content_type or "application/octet-stream",
                file_size=os.path.getsize(file_path),
                uploaded_by=None # أو يمكنك إضافة current_user هنا إذا أردت
            )
            db.add(db_attachment)

    # 4. الحفظ النهائي
    await db.commit()
    
    # 5. إعادة تحميل الكائن مع العلاقات (لضمان عمل CaseResponse بشكل صحيح)
    stmt = select(Case).where(Case.id == db_case.id).options(
        selectinload(Case.client),
        selectinload(Case.lawyer),
        selectinload(Case.attachments)
    )
    result = await db.execute(stmt)
    return result.scalar_one()