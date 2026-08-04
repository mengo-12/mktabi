from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.dynamic import CustomTable, CustomRow
from app.services.notification_service import create_notification

scheduler = AsyncIOScheduler()


async def check_calendar_notifications():

    # print("✅ Scheduler is running")

    async with SessionLocal() as db:

        now = datetime.now()

        result = await db.execute(select(CustomTable))
        tables = result.scalars().all()

        for table in tables:

            notification_mapping = table.notification_mapping or {}

            # print("=" * 50)
            # print("TABLE:", table.id, table.name)
            # print("NOTIFICATION:", notification_mapping)

            # هل الإشعارات مفعلة؟
            if not notification_mapping.get("enabled", False):
                continue

            date_field = notification_mapping.get("date_field")

            if not date_field:
                continue

            remind_before = notification_mapping.get(
                "remind_before_minutes",
                30
            )

            title_template = notification_mapping.get(
                "title",
                "📅 تذكير"
            )

            message_template = notification_mapping.get(
                "message",
                "لديك موعد قريب"
            )

            rows_result = await db.execute(
                select(CustomRow).where(CustomRow.table_id == table.id)
            )

            rows = rows_result.scalars().all()

            print("ROWS:", len(rows))

            for row in rows:

                cells = row.cells_data or {}

                date_value = cells.get(date_field)

                

                # print("ROW:", row.id)
                # print("RAW VALUE:", repr(date_value))
                # print("DATE:", date_value)

                if not date_value:
                    continue

                try:

                    event_date = datetime.fromisoformat(
                        date_value.replace("Z", "+00:00")
                    ).replace(tzinfo=None)

                    print("PARSED:", event_date)

                except Exception:
                    continue

                remaining = event_date - now

                # print("NOW:", now)
                # print("EVENT:", event_date)
                # print("REMAINING:", remaining)
                # print("REMIND:", remind_before)
                # print("=" * 50)
                # print("NOW:", now)
                # print("EVENT:", event_date)
                # print("REMAINING:", remaining)
                # print("SECONDS:", remaining.total_seconds())
                # print("REMIND:", remind_before)
                # print("LIMIT:", timedelta(minutes=remind_before))
                # print("COMPARE:", remaining > timedelta(minutes=remind_before))
                # print("=" * 50)
                # print("UTC NOW:", datetime.utcnow())
                # print("LOCAL NOW:", datetime.now())

                # انتهى الموعد
                if remaining.total_seconds() < 0:
                    print("❌ Event expired")
                    continue

                # لم يصل وقت التذكير
                # if remaining > timedelta(minutes=remind_before):
                #     print("✅ Test Mode - ignoring time check")
                #     print("⏳ Too early")
                #     continue

                remaining_seconds = remaining.total_seconds()

                target_seconds = remind_before * 60

                # لم نصل بعد إلى وقت الإشعار
                if remaining_seconds > target_seconds:
                    # print("⏳ Too early")
                    continue

                # تجاوزنا نافذة الإرسال (أكثر من دقيقة بعد وقت الإشعار)
                if remaining_seconds < target_seconds - 60:
                    # print("⌛ Notification window passed")
                    continue

                # تم إرسال إشعار سابق
                if cells.get("notification_sent_for") == event_date.isoformat():
                    continue

                try:
                    title = title_template.format(**cells)
                except Exception:
                    title = title_template

                if "{title}" in message_template:

                    message = message_template.replace(
                        "{title}",
                        title
                    )

                else:
                    try:
                        message = message_template.format(**cells)
                    except Exception:
                        message = message_template

                try:
                    message = message_template.format(**cells)
                except Exception:
                    message = message_template

                responsible_field = notification_mapping.get("responsible_field")

                if not responsible_field:
                    continue

                dynamic_staff_table_id = None

                for column in (table.columns_definition or []):
                    if column.get("id") == responsible_field:
                        related_table_id = column.get("relatedTableId")

                        if related_table_id:
                            dynamic_staff_table_id = int(related_table_id)

                        break

                if dynamic_staff_table_id is None:
                    print("❌ لم يتم العثور على جدول الموظفين المرتبط بالحقل:", responsible_field)
                    continue

                responsible_value = cells.get(responsible_field)

                print("RESPONSIBLE:", responsible_value)

                if not responsible_value:
                    continue

                # علاقة Relation يتم تخزينها كمصفوفة ["121"]
                if isinstance(responsible_value, list) and len(responsible_value) > 0:

                    dynamic_row_id = int(responsible_value[0])

                    # print("STAFF TABLE:", dynamic_staff_table_id)
                    # print("STAFF ROW:", dynamic_row_id)

                    await create_notification(
                        db=db,
                        dynamic_table_id=dynamic_staff_table_id,
                        dynamic_row_id=dynamic_row_id,
                        title=title,
                        message=message,
                        category="calendar",
                        data={
                            "table_id": table.id,
                            "row_id": row.id,
                        },
                    )

                    # print("✅ Notification created")
                    # print("STAFF TABLE:", dynamic_staff_table_id)
                    # print("STAFF ROW:", dynamic_row_id)

                # مستخدم إدارة (users)
                else:

                    try:
                        lawyer_id = int(responsible_value)
                        # print("🚀 Creating notification...")

                        await create_notification(
                            db=db,
                            lawyer_id=lawyer_id,
                            title=title,
                            message=message,
                            category="calendar",
                            data={
                                "table_id": table.id,
                                "row_id": row.id,
                            },
                        )

                    except (TypeError, ValueError):
                        continue

                cells["notification_sent_for"] = event_date.isoformat()

                row.cells_data = cells

                # print("=" * 50)
                # print("TABLE:", table.id, table.name)
                # print("notification_mapping:", table.notification_mapping)

        await db.commit()


def start_calendar_scheduler():

    if scheduler.running:
        return

    scheduler.add_job(
        check_calendar_notifications,
        trigger="interval",
        minutes=1,
        id="general_notifications",
        replace_existing=True,
    )

    scheduler.start()

    # print("✅ Scheduler started")