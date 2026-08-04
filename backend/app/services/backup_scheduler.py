from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.services.backup_service import create_backup

scheduler = AsyncIOScheduler()


def auto_backup():

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