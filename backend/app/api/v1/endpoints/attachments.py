import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.auth import User, UserRole
from app.models.case import Case
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentResponse
from app.api.deps import get_current_user

router = APIRouter()

# 📂 تحديد المجلد المحلي لحفظ الملفات وتأسيسه تلقائياً
STORAGE_DIR = "storage/uploads"
os.makedirs(STORAGE_DIR, exist_ok=True)

# 🛡️ تحديد الصيغ القانونية والمكتبية المسموح بها وحجم الملف الأقصى (مثلاً: 15 ميجابايت)
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 Megabytes

# 📌 [1] مسار الرفع والتحقق المادي والأمني
@router.post("/{case_id}/upload", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_case_file(
    case_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. التحقق من وجود القضية في النظام
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="القضية المحددة غير موجودة.")

    # 2. فحص الصيغة وامتداد الملف
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"صيغة الملف غير مدعومة. الصيغ المسموحة هي: {', '.join(ALLOWED_EXTENSIONS)}")

    # 3. جلب محتوى الملف لفحص حجمه لحماية السيرفر من هجمات الإغراق
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="حجم الملف كبير جداً. الحد الأقصى المسموح به هو 15 ميجابايت.")
    await file.seek(0) # إعادة مؤشر القراءة للبداية بعد الفحص

    # 4. توليد اسم عشوائي فريد (UUID) لحفظ الملف محلياً بدون مشاكل مع اللغات العربية
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(STORAGE_DIR, unique_filename)

    # 5. حفظ الملف مادياً (Physical Copy) على القرص الصلب للسيرفر
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 6. تسجيل مياداتا الملف في قاعدة البيانات
    db_attachment = Attachment(
        case_id=case_id,
        original_name=file.filename,
        file_path=dest_path,
        file_type=file.content_type,
        file_size=len(file_content),
        uploaded_by=current_user.id
    )
    db.add(db_attachment)
    await db.commit()
    await db.refresh(db_attachment)
    
    return db_attachment


# 📌 [2] مسار التحميل الآمن والمعزول بالصلاحيات (Protected Streaming)
@router.get("/download/{attachment_id}")
async def download_protected_file(
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. جلب بيانات الوثيقة والقضية المرتبطة بها
    stmt = select(Attachment).where(Attachment.id == attachment_id)
    res = await db.execute(stmt)
    attachment = res.scalar_one_or_none()
    
    if not attachment:
        raise HTTPException(status_code=404, detail="المستند غير موجود في النظام.")

    # 2. جلب القضية للتحقق من أمان عزل البيانات (Data Isolation Guard)
    case_res = await db.execute(select(Case).where(Case.id == attachment.case_id))
    case = case_res.scalar_one_or_none()

    # 🧠 الحماية الصارمة: إذا لم يكن المستخدم Admin أو Partner، يجب أن تكون القضية مسندة إليه شخصياً
    if current_user.role not in [UserRole.ADMIN, UserRole.PARTNER]:
        if case.lawyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="عذراً، لا تمتلك صلاحية قانونية لاستعراض أو تحميل مستندات هذه القضية."
            )

    # 3. التحقق من وجود الملف في السيرفر مادياً فعلاً
    if not os.path.exists(attachment.file_path):
        raise HTTPException(status_code=404, detail="الملف المادي مفقود من السيرفر.")

    # 4. بث وقراءة الملف للمستخدم باسمه الأصلي التاريخي
    return FileResponse(
        path=attachment.file_path,
        media_type=attachment.file_type,
        filename=attachment.original_name
    )