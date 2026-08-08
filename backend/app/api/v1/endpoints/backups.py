from fastapi import APIRouter

from fastapi.responses import FileResponse
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth import User, UserRole
from app.api.deps import get_current_user

from app.services.backup_service import (
    create_backup,
    list_backups,
    delete_backup,
    restore_backup,
)

router = APIRouter()

def check_backup_permission(
    current_user: User,
    required_permission: str
):
    """
    حماية عمليات النسخ الاحتياطي.

    read:
        عرض وتحميل النسخ الاحتياطية.

    write:
        إنشاء / حذف / استعادة النسخ الاحتياطية.

    ADMIN / PARTNER:
        صلاحية كاملة دائماً.

    الموظف الديناميكي:
        يعتمد على system_pages["backups"].
    """

    # =====================================================
    # 1️⃣ ADMIN / PARTNER
    # =====================================================

    if current_user.role in [
        UserRole.ADMIN,
        UserRole.PARTNER
    ]:
        return

    # =====================================================
    # 2️⃣ الموظف الديناميكي
    # =====================================================

    if getattr(current_user, "is_dynamic_staff", False):

        system_pages = getattr(
            current_user,
            "system_pages",
            {}
        ) or {}

        permission = system_pages.get(
            "backups",
            "no_access"
        )

        # -------------------------
        # صلاحية القراءة
        # -------------------------

        if required_permission == "read":

            if permission in ["read", "write"]:
                return

        # -------------------------
        # صلاحية الكتابة
        # -------------------------

        if required_permission == "write":

            if permission == "write":
                return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="لا تمتلك الصلاحية الكافية لإدارة النسخ الاحتياطية."
        )

    # =====================================================
    # 3️⃣ أي مستخدم آخر
    # =====================================================

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="غير مصرح لك بالوصول إلى النسخ الاحتياطية."
    )


# @router.post("/create")
# def create_database_backup():

#     return create_backup()

@router.post("/create")
def create_database_backup(
    current_user: User = Depends(get_current_user)
):

    check_backup_permission(
        current_user,
        "write"
    )

    return create_backup()

# @router.get("/")
# def get_backups():

#     return list_backups()

@router.get("/")
def get_backups(
    current_user: User = Depends(get_current_user)
):

    check_backup_permission(
        current_user,
        "read"
    )

    return list_backups()

# @router.get("/download/{filename}")
# def download_backup(filename: str):

#     file_path = Path("backups") / filename

#     if not file_path.exists():
#         return {"error": "Backup not found"}

#     return FileResponse(
#         path=file_path,
#         filename=filename,
#         media_type="application/octet-stream",
#     )

@router.get("/download/{filename}")
def download_backup(
    filename: str,
    current_user: User = Depends(get_current_user)
):

    check_backup_permission(
        current_user,
        "read"
    )

    file_path = Path("backups") / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Backup not found"
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream",
    )

# @router.delete("/{filename}")
# def remove_backup(filename: str):

#     return delete_backup(filename)

# @router.post("/restore/{filename}")
# def restore_database(filename: str):

#     return restore_backup(filename)

@router.delete("/{filename}")
def remove_backup(
    filename: str,
    current_user: User = Depends(get_current_user)
):

    check_backup_permission(
        current_user,
        "write"
    )

    return delete_backup(filename)

@router.post("/restore/{filename}")
def restore_database(
    filename: str,
    current_user: User = Depends(get_current_user)
):

    check_backup_permission(
        current_user,
        "write"
    )

    return restore_backup(filename)