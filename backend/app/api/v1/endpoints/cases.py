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
from app.models.attachment import Attachment 
from app.schemas.case import CaseResponse
from app.api.deps import RoleChecker, get_current_user
from app.schemas.case import CaseUpdate 

router = APIRouter()

allowed_creators = RoleChecker([UserRole.ADMIN, UserRole.PARTNER, UserRole.SECRETARY])

UPLOAD_DIR = "uploaded_case_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    title: str = Form(...),
    client_id: int = Form(...),
    lawyer_id: int = Form(...),
    case_number: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    case_type: CaseType = Form(CaseType.COMMERCIAL),
    status_filter: CaseStatus = Form(CaseStatus.PENDING, alias="status"),
    start_date: Optional[date] = Form(None),
    
    # 🌟 استقبال الحقول المالية الجديدة من الـ Form
    case_value: float = Form(0.0, description="إجمالي أتعاب المحاماة"),
    amount_paid: float = Form(0.0, description="المبلغ المدفوع مقدمًا"),
    
    files: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_creators) 
):
    """
    إنشاء قضية جديدة مع الأتعاب المالية ورفع مستندات متعددة.
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

    # 4. حفظ كائن القضية مع تضمين الحقول المالية
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
        # 🌟 هنا تم إصلاح المشكلة وتمرير القيم الممررة من الفرونت إند
        case_value=case_value,   
        amount_paid=amount_paid, 
        is_active=True
    )
    db.add(db_case)
    await db.flush() 

    # 5. معالجة وحفظ الملفات المرفوعة
    if files:
        for file in files:
            unique_filename = f"{uuid4()}_{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            file_size = os.path.getsize(file_path)

            db_attachment = Attachment(
                case_id=db_case.id,
                original_name=file.filename,
                file_path=file_path,                               
                file_type=file.content_type or "application/octet-stream", 
                file_size=file_size,                               
                uploaded_by=current_user.id                        
            )
            db.add(db_attachment)

    await db.commit()
    
    stmt = select(Case).where(Case.id == db_case.id).options(
        selectinload(Case.client),
        selectinload(Case.lawyer),
        selectinload(Case.attachments)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


# 📌 مسار العرض وجلب البيانات
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
    query = select(Case).where(Case.is_active == True).options(
        selectinload(Case.client),
        selectinload(Case.lawyer),
        selectinload(Case.attachments) 
    )

    if current_user.role not in [UserRole.ADMIN, UserRole.PARTNER]:
        query = query.where(Case.lawyer_id == current_user.id)

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
        
    if current_user.role not in [UserRole.ADMIN, UserRole.PARTNER]:
        if db_case.lawyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="غير مصرح لك بالدخول على هذه القضية."
            )
            
    return db_case


@router.delete("/{id}", response_model=dict)
async def soft_delete_case(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allowed_creators)
):
    result = await db.execute(select(Case).where(Case.id == id))
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="القضية غير موجودة في النظام.")
    if not case.is_active:
        raise HTTPException(status_code=400, detail="هذه القضية مؤرشفة بالفعل سابقاً.")
        
    case.is_active = False
    await db.commit()
    return {"status": "success", "message": f"تم نقل القضية '{case.title}' إلى الأرشيف بنجاح."}


# 📌 تعديل مسار التحديث ليشمل الحقول المالية أيضاً
@router.patch("/{case_id}", response_model=CaseResponse) 
async def update_case(
    case_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status: Optional[CaseStatus] = Form(None, alias="status"),
    case_number: Optional[str] = Form(None),
    case_type: Optional[CaseType] = Form(None),
    client_id: Optional[int] = Form(None),
    lawyer_id: Optional[int] = Form(None),
    
    # 🌟 إضافة الحقول هنا لإمكانية تعديل الأتعاب أو المبالغ المدفوعة لاحقاً
    case_value: Optional[float] = Form(None),
    amount_paid: Optional[float] = Form(None),
    
    files: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # 1. البحث عن القضية
    result = await db.execute(select(Case).where(Case.id == case_id))
    db_case = result.scalar_one_or_none()
    
    if not db_case:
        raise HTTPException(status_code=404, detail="القضية غير موجودة")
    
    # 2. تحديث الحقول النصية والمالية الجديدة
    if title is not None: db_case.title = title
    if description is not None: db_case.description = description
    if status is not None: db_case.status = status
    if case_number is not None: db_case.case_number = case_number
    if case_type is not None: db_case.case_type = case_type
    if client_id is not None: db_case.client_id = client_id
    if lawyer_id is not None: db_case.lawyer_id = lawyer_id
    
    # 🌟 تحديث القيم المالية إذا تم إرسالها من النموذج
    if case_value is not None: db_case.case_value = case_value
    if amount_paid is not None: db_case.amount_paid = amount_paid

    # 3. معالجة الملفات الجديدة
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
                uploaded_by=None 
            )
            db.add(db_attachment)

    # 4. الحفظ النهائي
    await db.commit()
    
    # 5. إعادة تحميل الكائن مع العلاقات
    stmt = select(Case).where(Case.id == db_case.id).options(
        selectinload(Case.client),
        selectinload(Case.lawyer),
        selectinload(Case.attachments)
    )
    result = await db.execute(stmt)
    return result.scalar_one()