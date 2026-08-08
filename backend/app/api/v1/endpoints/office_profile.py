import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.office_profile import OfficeProfile
from app.schemas.office_profile import (
    OfficeProfileCreate,
    OfficeProfileUpdate,
    OfficeProfileResponse,
)


router = APIRouter()


# ============================================================
# إعدادات ملفات شعار المكتب
# ============================================================

# backend/storage/office
BASE_DIR = Path(__file__).resolve().parents[4]
OFFICE_STORAGE_DIR = BASE_DIR / "storage" / "office"

# إنشاء المجلد تلقائياً إذا لم يكن موجوداً
OFFICE_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


# أنواع الصور المسموح بها
ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

# الحد الأقصى لحجم الشعار: 5 MB
MAX_LOGO_SIZE = 5 * 1024 * 1024


# ============================================================
# دالة جلب المكتب أو إنشائه
# ============================================================

async def get_or_create_office_profile(
    db: AsyncSession,
) -> OfficeProfile:

    result = await db.execute(
        select(OfficeProfile)
        .where(OfficeProfile.is_active == True)
        .limit(1)
    )

    profile = result.scalar_one_or_none()

    if profile:
        return profile

    profile = OfficeProfile(
        office_name="مكتبي الرقمي",
        is_active=True,
    )

    db.add(profile)

    await db.commit()
    await db.refresh(profile)

    return profile


# ============================================================
# GET - جلب بيانات المكتب
# ============================================================

@router.get(
    "/",
    response_model=OfficeProfileResponse,
)
async def get_office_profile(
    db: AsyncSession = Depends(get_db),
):

    profile = await get_or_create_office_profile(db)

    return profile


# ============================================================
# POST - إنشاء بيانات المكتب
# ============================================================

@router.post(
    "/",
    response_model=OfficeProfileResponse,
)
async def create_office_profile(
    payload: OfficeProfileCreate,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(OfficeProfile)
        .where(OfficeProfile.is_active == True)
        .limit(1)
    )

    existing_profile = result.scalar_one_or_none()

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="بيانات المكتب موجودة بالفعل.",
        )

    profile = OfficeProfile(
        **payload.model_dump(),
        is_active=True,
    )

    db.add(profile)

    await db.commit()
    await db.refresh(profile)

    return profile


# ============================================================
# PUT - تحديث بيانات المكتب
# ============================================================

@router.put(
    "/",
    response_model=OfficeProfileResponse,
)
async def update_office_profile(
    payload: OfficeProfileUpdate,
    db: AsyncSession = Depends(get_db),
):

    profile = await get_or_create_office_profile(db)

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    return profile


# ============================================================
# POST - رفع شعار المكتب
# ============================================================

@router.post(
    "/logo",
    response_model=OfficeProfileResponse,
)
async def upload_office_logo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):

    # --------------------------------------------------------
    # 1. التأكد من وجود نوع الملف
    # --------------------------------------------------------

    if not file.content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="لم يتم تحديد نوع الملف.",
        )

    # --------------------------------------------------------
    # 2. التحقق من نوع الصورة
    # --------------------------------------------------------

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نوع الشعار غير مسموح. الأنواع المسموحة: JPG, PNG, WEBP.",
        )

    # --------------------------------------------------------
    # 3. قراءة الملف
    # --------------------------------------------------------

    file_data = await file.read()

    # --------------------------------------------------------
    # 4. التحقق من حجم الملف
    # --------------------------------------------------------

    if len(file_data) > MAX_LOGO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="حجم الشعار كبير جداً. الحد الأقصى هو 5 ميجابايت.",
        )

    if len(file_data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="الملف فارغ.",
        )

    # --------------------------------------------------------
    # 5. جلب بيانات المكتب
    # --------------------------------------------------------

    profile = await get_or_create_office_profile(db)

    # --------------------------------------------------------
    # 6. حذف الشعار القديم إذا كان موجوداً
    # --------------------------------------------------------

    if profile.logo_url:

        old_filename = Path(profile.logo_url).name
        old_file = OFFICE_STORAGE_DIR / old_filename

        if old_file.exists() and old_file.is_file():

            try:
                old_file.unlink()
            except OSError:
                pass

    # --------------------------------------------------------
    # 7. إنشاء اسم آمن وفريد للملف
    # --------------------------------------------------------

    extension = ALLOWED_CONTENT_TYPES[file.content_type]

    filename = f"logo_{uuid.uuid4().hex}{extension}"

    file_path = OFFICE_STORAGE_DIR / filename

    # --------------------------------------------------------
    # 8. حفظ الملف
    # --------------------------------------------------------

    file_path.write_bytes(file_data)

    # --------------------------------------------------------
    # 9. حفظ رابط الشعار في قاعدة البيانات
    # --------------------------------------------------------

    profile.logo_url = f"/api/v1/office-profile/logo/{filename}"

    await db.commit()
    await db.refresh(profile)

    return profile


# ============================================================
# GET - عرض شعار المكتب
# ============================================================

@router.get(
    "/logo/{filename}",
)
async def get_office_logo(
    filename: str,
):

    # منع أي محاولة للوصول إلى مسارات خارج مجلد الشعارات
    safe_filename = Path(filename).name

    file_path = OFFICE_STORAGE_DIR / safe_filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="شعار المكتب غير موجود.",
        )

    return FileResponse(
        path=file_path,
        media_type="image",
    )


# ============================================================
# DELETE - حذف شعار المكتب
# ============================================================

@router.delete(
    "/logo",
    response_model=OfficeProfileResponse,
)
async def delete_office_logo(
    db: AsyncSession = Depends(get_db),
):

    profile = await get_or_create_office_profile(db)

    # حذف الملف الفعلي
    if profile.logo_url:

        old_filename = Path(profile.logo_url).name
        old_file = OFFICE_STORAGE_DIR / old_filename

        if old_file.exists() and old_file.is_file():

            try:
                old_file.unlink()
            except OSError:
                pass

    # إزالة الرابط من قاعدة البيانات
    profile.logo_url = None

    await db.commit()
    await db.refresh(profile)

    return profile