from apscheduler.schedulers.asyncio import AsyncIOScheduler

import app.core.system_state as system_state

from app.services.backup_service import create_backup

scheduler = AsyncIOScheduler()


def auto_backup():

    if system_state.is_restoring:
        print("⏸ Automatic backup skipped: database restore in progress")
        return

    try:

        backup = create_backup()

        print("✅ Automatic Backup Created")
        print(backup)

    except Exception as e:

        print("❌ Automatic Backup Failed")
        print(e)


def start_backup_scheduler():

    if scheduler.running:
        return

    scheduler.add_job(
        auto_backup,
        trigger="cron",
        hour=2,
        minute=0,
        id="automatic_backup",
        replace_existing=True,
    )

    scheduler.start()

    print("✅ Backup Scheduler Started")