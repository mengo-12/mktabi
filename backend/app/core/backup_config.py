from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

BACKUP_DIR = BASE_DIR / "backups"

BACKUP_DIR.mkdir(exist_ok=True)