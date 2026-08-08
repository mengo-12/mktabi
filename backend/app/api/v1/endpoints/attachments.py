import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Cookie, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from urllib.parse import quote

from app.core.database import get_db
from app.models.auth import User, UserRole
from app.models.case import Case
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentResponse
from app.models.dynamic import CustomRow
from app.api.deps import get_current_user
from sqlalchemy.orm import make_transient


router = APIRouter()

# 📂 تحديد المجلد المحلي لحفظ الملفات وتأسيسه تلقائياً
STORAGE_DIR = "storage/uploads"
os.makedirs(STORAGE_DIR, exist_ok=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

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
# async def download_protected_file(
#     attachment_id: int,
#     request: Request,
#     token: str = Query(None), 
#     access_token: str = Cookie(None), 
#     header_token: str = Depends(oauth2_scheme), 
#     db: AsyncSession = Depends(get_db)
# ):
#     # 🔍 جلب التوكن من الرابط كـ Query Parameter بأكثر من طريقة لضمان التقاطه
#     url_token = token or request.query_params.get("token")
    
#     # 🛡️ الفحص بالترتيب: الرابط أولاً، ثم الهيدر (إن وجد)، ثم الكوكيز
#     active_token = url_token or header_token or access_token
    
#     if not active_token:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED, 
#             detail="لم يتم توفير رمز التحقق الأمني (Token). تأكد من إرساله في الرابط أو الكوكيز."
#         )

#     # 🛡️ فك تشفير التوكن والتحقق من هوية المستخدم
#     try:
#         from app.core.config import settings 
#         payload = jwt.decode(active_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         user_id: str = payload.get("sub")
#         if user_id is None:
#             raise HTTPException(status_code=401, detail="رمز التحقق غير صالح.")
#     except JWTError:
#         raise HTTPException(status_code=401, detail="انتهت صلاحية الجلسة أو الرمز غير صالح.")

#     # 👤 جلب المستخدم من قاعدة البيانات
#     user_res = await db.execute(select(User).where(User.id == int(user_id)))
#     current_user = user_res.scalar_one_or_none()
#     if not current_user:
#         raise HTTPException(status_code=401, detail="المستخدم غير موجود.")

#     # 📂 جلب بيانات الوثيقة القانونية
#     stmt = select(Attachment).where(Attachment.id == attachment_id)
#     res = await db.execute(stmt)
#     attachment = res.scalar_one_or_none()
    
#     if not attachment:
#         raise HTTPException(status_code=404, detail="المستند غير موجود في النظام.")

#     # 💾 التحقق من وجود الملف ماديًا على السيرفر
#     if not os.path.exists(attachment.file_path):
#         raise HTTPException(status_code=404, detail="الملف المادي مفقود من السيرفر.")

#     # تشفير الاسم العربي لضمان سلامة الهيدرز
#     encoded_filename = quote(attachment.original_name)

#     return FileResponse(
#         path=attachment.file_path,
#         media_type=attachment.file_type,
#         content_disposition_type="inline", 
#         headers={
#             "Content-Disposition": f"inline; filename*=UTF-8''{encoded_filename}" 
#         }
#     )

# 📌 [2] مسار التحميل الآمن للمستندات
# يدعم:
# 1️⃣ المستخدمين الأساسيين Admin / Partner
# 2️⃣ الموظفين الديناميكيين Dynamic Staff
# 3️⃣ Token في Query Parameter أو Authorization Header أو Cookie


async def download_protected_file(
    attachment_id: int,
    request: Request,
    token: str = Query(None),
    access_token: str = Cookie(None),
    header_token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    تحميل مستند محمي.

    يدعم نوعين من المستخدمين:

    المستخدم الأساسي:
        sub = "5"

    الموظف الديناميكي:
        sub = "dynamic_staff_121_table_5"

    لا نعتمد على int(sub) مباشرة حتى لا يحدث
    ValueError مع الموظفين الديناميكيين.
    """

    # ============================================================
    # 1️⃣ الحصول على الـ Token
    # ============================================================

    url_token = token or request.query_params.get("token")

    active_token = url_token or header_token or access_token

    if not active_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="لم يتم توفير رمز التحقق الأمني (Token)."
        )

    # ============================================================
    # 2️⃣ فك تشفير الـ Token
    # ============================================================

    try:
        from app.core.config import settings

        payload = jwt.decode(
            active_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id_raw = payload.get("sub")

        if not user_id_raw:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="رمز التحقق لا يحتوي على هوية المستخدم."
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="انتهت صلاحية الجلسة أو الرمز غير صالح."
        )

    # ============================================================
    # 3️⃣ التحقق من هوية المستخدم
    # ============================================================

    current_user = None

    # ------------------------------------------------------------
    # الحالة الأولى:
    # الموظف الديناميكي
    #
    # مثال:
    # dynamic_staff_121_table_5
    # ------------------------------------------------------------

    if str(user_id_raw).startswith("dynamic_staff_"):

        try:
            parts = str(user_id_raw).split("_")

            # نتوقع:
            # ["dynamic", "staff", "121", "table", "5"]

            if len(parts) != 5:
                raise ValueError("صيغة الموظف الديناميكي غير صحيحة.")

            row_id = int(parts[2])
            table_id = int(parts[4])

        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="هوية الموظف الديناميكي غير صالحة."
            )

        # --------------------------------------------------------
        # التحقق من أن سجل الموظف لا يزال موجوداً
        # --------------------------------------------------------

        row_stmt = select(CustomRow).where(
            CustomRow.id == row_id,
            CustomRow.table_id == table_id
        )

        row_result = await db.execute(row_stmt)
        staff_row = row_result.scalar_one_or_none()

        if not staff_row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="حساب الموظف هذا لم يعد موجوداً في النظام."
            )

        # --------------------------------------------------------
        # بناء كائن مستخدم مؤقت مثل get_current_user()
        # --------------------------------------------------------

        cells = staff_row.cells_data or {}

        email_value = next(
            (
                str(v)
                for v in cells.values()
                if "@" in str(v)
            ),
            "staff@lawfirm.com"
        )

        full_name = next(
            (
                str(v)
                for k, v in cells.items()
                if k in ["c1", "c-1", "name", "Full Name"]
            ),
            "موظف النظام"
        )

        current_user = User(
            id=row_id,
            email=email_value,
            full_name=full_name,
            role=UserRole.SECRETARY,
            is_active=True
        )

        # مهم:
        # هذا المستخدم ليس User حقيقياً في جدول users
        # لذلك لا نقوم بإضافته إلى Session.
        make_transient(current_user)

        current_user.is_dynamic_staff = True
        current_user.staff_table_id = table_id

    # ------------------------------------------------------------
    # الحالة الثانية:
    # مستخدم أساسي Admin / Partner
    #
    # مثال:
    # sub = "5"
    # ------------------------------------------------------------

    else:

        try:
            user_id = int(user_id_raw)

        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="هوية المستخدم غير صالحة."
            )

        user_res = await db.execute(
            select(User).where(User.id == user_id)
        )

        current_user = user_res.scalar_one_or_none()

        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="المستخدم غير موجود."
            )

        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="حساب المستخدم غير نشط."
            )

    # ============================================================
    # 4️⃣ جلب المستند
    # ============================================================

    stmt = select(Attachment).where(
        Attachment.id == attachment_id
    )

    res = await db.execute(stmt)

    attachment = res.scalar_one_or_none()

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود في النظام."
        )

    # ============================================================
    # 5️⃣ التأكد من وجود الملف فعلياً
    # ============================================================

    if not attachment.file_path or not os.path.exists(
        attachment.file_path
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الملف المادي مفقود من السيرفر."
        )

    # ============================================================
    # 6️⃣ تجهيز اسم الملف العربي
    # ============================================================

    encoded_filename = quote(
        attachment.original_name
    )

    # ============================================================
    # 7️⃣ إرسال الملف
    # ============================================================

    return FileResponse(
        path=attachment.file_path,
        media_type=attachment.file_type,
        content_disposition_type="inline",
        headers={
            "Content-Disposition": (
                f"inline; filename*=UTF-8''{encoded_filename}"
            )
        }
    )


# 🗑️ [3] مسار حذف المستند وقفل الملف المادي من السيرفر
# @router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_case_attachment(
#     attachment_id: int,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # 1. جلب بيانات الوثيقة
#     stmt = select(Attachment).where(Attachment.id == attachment_id)
#     res = await db.execute(stmt)
#     attachment = res.scalar_one_or_none()
    
#     if not attachment:
#         raise HTTPException(status_code=404, detail="المستند غير موجود أو تم حذفه مسبقاً.")

#     # 🛡️ حماية الحذف المعدلة: التحقق من وجود قضية أولاً
#     if attachment.case_id is not None:
#         # إذا كان الملف مرتبطاً بقضية، نتحقق من الصلاحيات كالمعتاد
#         case_res = await db.execute(select(Case).where(Case.id == attachment.case_id))
#         case = case_res.scalar_one_or_none()

#         if case and current_user.role not in [UserRole.ADMIN, UserRole.PARTNER]:
#             if case.lawyer_id != current_user.id:
#                 raise HTTPException(
#                     status_code=status.HTTP_403_FORBIDDEN, 
#                     detail="عذراً، لا تمتلك الصلاحية القانونية لحذف مستندات هذه القضية."
#                 )
#     else:
#         # 💡 ملف عام (الديناميكي): نسمح بحذفه إذا كان المستخدم هو من رفعه أو كان (Admin/Partner)
#         if current_user.role not in [UserRole.ADMIN, UserRole.PARTNER]:
#             if attachment.uploaded_by != current_user.id:
#                 raise HTTPException(
#                     status_code=status.HTTP_403_FORBIDDEN,
#                     detail="لا يمكنك حذف ملف قام برفعه مستخدم آخر."
#                 )

#     # 3. الحذف المادي (Physical Delete) للملف من الهاردوير
#     if attachment.file_path and os.path.exists(attachment.file_path):
#         try:
#             os.remove(attachment.file_path)
#         except Exception as e:
#             print(f"فشل حذف الملف من القرص: {e}")

#     # 4. الحذف البرمجي من قاعدة البيانات
#     await db.delete(attachment)
#     await db.commit()
    
#     return None



# 🗑️ [3] مسار حذف المستند وقفل الملف المادي من السيرفر

@router.delete(
    "/{attachment_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_case_attachment(
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ============================================================
    # 1️⃣ جلب بيانات المستند
    # ============================================================

    stmt = select(Attachment).where(
        Attachment.id == attachment_id
    )

    res = await db.execute(stmt)

    attachment = res.scalar_one_or_none()

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود أو تم حذفه مسبقاً."
        )

    # ============================================================
    # 2️⃣ تحديد نوع المستخدم
    # ============================================================

    is_dynamic_staff = getattr(
        current_user,
        "is_dynamic_staff",
        False
    )

    # ============================================================
    # 3️⃣ الملفات المرتبطة بقضية
    # ============================================================

    if attachment.case_id is not None:

        case_res = await db.execute(
            select(Case).where(
                Case.id == attachment.case_id
            )
        )

        case = case_res.scalar_one_or_none()

        if case is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="القضية المرتبطة بالمستند غير موجودة."
            )

        # --------------------------------------------------------
        # Admin / Partner
        # --------------------------------------------------------

        if current_user.role in [
            UserRole.ADMIN,
            UserRole.PARTNER
        ]:
            pass

        # --------------------------------------------------------
        # الموظف الديناميكي
        # --------------------------------------------------------

        elif is_dynamic_staff:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "الموظفون الديناميكيون لا يمكنهم حذف "
                    "مستندات القضايا من هذا المسار."
                )
            )

        # --------------------------------------------------------
        # المستخدم الأساسي الآخر
        # --------------------------------------------------------

        elif case.lawyer_id != current_user.id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "عذراً، لا تمتلك الصلاحية القانونية "
                    "لحذف مستندات هذه القضية."
                )
            )

    # ============================================================
    # 4️⃣ الملفات العامة / الديناميكية
    # ============================================================

    else:

        # --------------------------------------------------------
        # Admin / Partner
        # --------------------------------------------------------

        if current_user.role in [
            UserRole.ADMIN,
            UserRole.PARTNER
        ]:
            pass

        # --------------------------------------------------------
        # الموظف الديناميكي
        # --------------------------------------------------------

        elif is_dynamic_staff:

            # الموظف يستطيع حذف الملف العام الذي قام هو برفعه فقط

            if attachment.uploaded_by_staff != current_user.id:

                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "لا يمكنك حذف ملف قام برفعه "
                        "مستخدم آخر."
                    )
                )

        # --------------------------------------------------------
        # المستخدم الأساسي
        # --------------------------------------------------------

        else:

            if attachment.uploaded_by != current_user.id:

                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "لا يمكنك حذف ملف قام برفعه "
                        "مستخدم آخر."
                    )
                )

    # ============================================================
    # 5️⃣ حذف الملف من القرص
    # ============================================================

    if (
        attachment.file_path
        and os.path.exists(attachment.file_path)
    ):
        try:

            os.remove(
                attachment.file_path
            )

        except Exception as e:

            print(
                f"⚠️ فشل حذف الملف من القرص: {e}"
            )

    # ============================================================
    # 6️⃣ حذف سجل الملف من قاعدة البيانات
    # ============================================================

    await db.delete(attachment)

    await db.commit()

    return None



    # 📌 [4] مسار رفع عام ومستقل مخصص للحقول والجداول الديناميكية
# @router.post("/upload-general", status_code=status.HTTP_201_CREATED)
# async def upload_general_file(
#     file: UploadFile = File(...),
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # 1. فحص الصيغة والامتداد
#     file_ext = os.path.splitext(file.filename)[1].lower()
#     if file_ext not in ALLOWED_EXTENSIONS:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"صيغة الملف غير مدعومة. الصيغ المسموحة هي: {', '.join(ALLOWED_EXTENSIONS)}"
#         )

#     # 2. فحص الحجم
#     file_content = await file.read()
#     if len(file_content) > MAX_FILE_SIZE:
#         raise HTTPException(status_code=400, detail="حجم الملف يتجاوز 15 ميجابايت.")
#     await file.seek(0)

#     # 3. توليد اسم فريد وحفظ الملف
#     unique_filename = f"{uuid.uuid4()}{file_ext}"
#     dest_path = os.path.join(STORAGE_DIR, unique_filename)

#     with open(dest_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     # 4. تسجيل المياداتا في قاعدة البيانات (بدون case_id)
#     # تحديد نوع المستخدم الذي قام بالرفع
#     is_dynamic_staff = getattr(current_user, "is_dynamic_staff", False)

#     db_attachment = Attachment(
#         case_id=None,
#         original_name=file.filename,
#         file_path=dest_path,
#         file_type=file.content_type,
#         file_size=len(file_content),

#         uploaded_by=(
#             None if is_dynamic_staff else current_user.id
#         ),

#         uploaded_by_staff=(
#             current_user.staff_row_id if is_dynamic_staff else None
#         )
#     )
#     db.add(db_attachment)
#     await db.commit()
#     await db.refresh(db_attachment)

#     # 5. بناء رابط التحميل المباشر الآمن الذي سيتعامل معه الـ Frontend
#     # سيتوجه الطلب إلى مسار التنزيل المحمي بناءً على ID المرفق
#     download_url = f"http://localhost:8000/api/v1/documents/download/{db_attachment.id}"

#     return {
#         "url": download_url,
#         "name": file.filename,
#         "id": db_attachment.id
#     }


# 📌 [4] مسار رفع عام ومستقل مخصص للحقول والجداول الديناميكية

@router.post(
    "/upload-general",
    status_code=status.HTTP_201_CREATED
)
async def upload_general_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ============================================================
    # 1️⃣ التحقق من امتداد الملف
    # ============================================================

    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"صيغة الملف غير مدعومة. "
                f"الصيغ المسموحة هي: "
                f"{', '.join(ALLOWED_EXTENSIONS)}"
            )
        )

    # ============================================================
    # 2️⃣ قراءة الملف والتحقق من الحجم
    # ============================================================

    file_content = await file.read()

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حجم الملف يتجاوز 15 ميجابايت."
        )

    await file.seek(0)

    # ============================================================
    # 3️⃣ تحديد نوع المستخدم
    # ============================================================

    is_dynamic_staff = getattr(
        current_user,
        "is_dynamic_staff",
        False
    )

    # ============================================================
    # 4️⃣ إنشاء اسم آمن وفريد للملف
    # ============================================================

    unique_filename = f"{uuid.uuid4()}{file_ext}"

    dest_path = os.path.join(
        STORAGE_DIR,
        unique_filename
    )

    # ============================================================
    # 5️⃣ حفظ الملف على القرص
    # ============================================================

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"فشل حفظ الملف على السيرفر: {str(e)}"
        )

    # ============================================================
    # 6️⃣ تسجيل بيانات الملف في قاعدة البيانات
    # ============================================================
    #
    # المستخدم الأساسي:
    #
    # uploaded_by      = User.id
    # uploaded_by_staff = NULL
    #
    # الموظف الديناميكي:
    #
    # uploaded_by      = NULL
    # uploaded_by_staff = CustomRow.id
    #
    # current_user.id في حالة الموظف الديناميكي
    # يساوي بالفعل CustomRow.id
    # ============================================================

    db_attachment = Attachment(
        case_id=None,

        original_name=file.filename,

        file_path=dest_path,

        file_type=file.content_type or "application/octet-stream",

        file_size=len(file_content),

        uploaded_by=(
            None
            if is_dynamic_staff
            else current_user.id
        ),

        uploaded_by_staff=(
            current_user.id
            if is_dynamic_staff
            else None
        )
    )

    db.add(db_attachment)

    try:
        await db.commit()
        await db.refresh(db_attachment)

    except Exception:
        # إذا فشلت قاعدة البيانات بعد حفظ الملف،
        # نحاول حذف الملف حتى لا يبقى ملف يتيم على القرص.

        await db.rollback()

        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except Exception as cleanup_error:
                print(
                    f"⚠️ تعذر حذف الملف بعد فشل قاعدة البيانات: "
                    f"{cleanup_error}"
                )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="فشل تسجيل الملف في قاعدة البيانات."
        )

    # ============================================================
    # 7️⃣ إنشاء رابط الملف
    # ============================================================

    download_url = (
        f"http://localhost:8000"
        f"/api/v1/attachments/download/"
        f"{db_attachment.id}"
    )

    # ============================================================
    # 8️⃣ إرسال النتيجة للـ Frontend
    # ============================================================

    return {
        "url": download_url,
        "name": file.filename,
        "id": db_attachment.id
    }
