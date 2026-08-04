from fastapi import APIRouter

from fastapi.responses import FileResponse
from pathlib import Path

from app.services.backup_service import (
    create_backup,
    list_backups,
    delete_backup,
    restore_backup,
)

router = APIRouter()


@router.post("/create")
def create_database_backup():

    return create_backup()

@router.get("/")
def get_backups():

    return list_backups()

@router.get("/download/{filename}")
def download_backup(filename: str):

    file_path = Path("backups") / filename

    if not file_path.exists():
        return {"error": "Backup not found"}

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream",
    )

@router.delete("/{filename}")
def remove_backup(filename: str):

    return delete_backup(filename)

@router.post("/restore/{filename}")
def restore_database(filename: str):

    return restore_backup(filename)