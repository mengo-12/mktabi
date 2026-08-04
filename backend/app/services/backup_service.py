from pathlib import Path
from datetime import datetime
import subprocess
import os
from pathlib import Path
from app.core.config import settings

from app.services.calendar_notification_scheduler import scheduler

import app.core.system_state as system_state

BACKUP_DIR = Path("backups")
BACKUP_DIR.mkdir(exist_ok=True)

MIN_BACKUPS = 5

def format_size(size):
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{size:.2f} TB"

def create_backup():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    backup_file = BACKUP_DIR / f"{settings.POSTGRES_DB}_{timestamp}.backup"

    env = os.environ.copy()
    env["PGPASSWORD"] = settings.POSTGRES_PASSWORD

    subprocess.run(
        [
            settings.PG_DUMP_PATH,
            "-h",
            settings.POSTGRES_SERVER,
            "-p",
            str(settings.POSTGRES_PORT),
            "-U",
            settings.POSTGRES_USER,
            "-F",
            "c",
            "-f",
            str(backup_file),
            settings.POSTGRES_DB,
        ],
        env=env,
        check=True,
    )
    cleanup_old_backups()

    return {
        "filename": backup_file.name,
        "path": str(backup_file),
        "size": format_size(backup_file.stat().st_size),
        "created_at": datetime.fromtimestamp(
            backup_file.stat().st_mtime
        ),
    }


def list_backups():

    backups = []

    for file in sorted(
        BACKUP_DIR.glob("*.backup"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    ):

        backups.append({
            "filename": file.name,
            "size": format_size(file.stat().st_size),
            "created_at": datetime.fromtimestamp(
                file.stat().st_mtime
            ),
            "path": str(file),
        })

    return backups

def cleanup_old_backups():

    backups = sorted(
        BACKUP_DIR.glob("*.backup"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )

    keep = max(settings.BACKUP_KEEP_COUNT, MIN_BACKUPS)

    for backup in backups[keep:]:

        try:
            backup.unlink()
            print(f"🗑 Deleted old backup: {backup.name}")

        except Exception as e:
            print(f"❌ Failed deleting {backup.name}: {e}")

def delete_backup(filename: str):

    file_path = BACKUP_DIR / filename

    if not file_path.exists():
        raise FileNotFoundError("Backup not found")

    file_path.unlink()

    return {
        "success": True,
        "message": "Backup deleted successfully",
    }

def restore_backup(filename: str):

    backup_file = BACKUP_DIR / filename

    if not backup_file.exists():
        raise FileNotFoundError("Backup not found")

    system_state.is_restoring = True

    was_running = scheduler.running

    try:

        # إيقاف المجدول
        if was_running:
            scheduler.pause()

        # إنشاء نسخة احتياطية قبل الاستعادة
        create_backup()

        env = os.environ.copy()
        env["PGPASSWORD"] = settings.POSTGRES_PASSWORD

        subprocess.run(
            [
                settings.PG_RESTORE_PATH,
                "-h",
                settings.POSTGRES_SERVER,
                "-p",
                str(settings.POSTGRES_PORT),
                "-U",
                settings.POSTGRES_USER,
                "-d",
                settings.POSTGRES_DB,
                "--clean",
                "--if-exists",
                "--no-owner",
                "--no-privileges",
                str(backup_file),
            ],
            env=env,
            check=True,
        )

        return {
            "success": True,
            "message": "Database restored successfully",
        }

    finally:

        system_state.is_restoring = False

        if was_running:
            scheduler.resume()