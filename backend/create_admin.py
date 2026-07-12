# create_admin.py
import asyncio
import os
import sys

# 🎯 حل مشكلة المسارات
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import get_password_hash
from sqlalchemy.future import select
from app.core.database import SessionLocal
from app.models.auth import User, UserRole 

async def create_new_admin():
    async with SessionLocal() as db: 
        try:
            target_email = "admin@laww.com"
            
            # 🔎 التحقق من الإيميل لمنع التكرار
            stmt = select(User).where(User.email == target_email)
            result = await db.execute(stmt)
            email_exists = result.scalar_one_or_none()

            if email_exists:
                print(f"❌ الحساب ({target_email}) موجود بالفعل في النظام!")
                return

            # 🎯 إنشاء كائن الأدمن بالحقول الأساسية المعتمدة في الموديل فقط
            new_admin = User(
                email=target_email,
                full_name="المدير العام",
                role=UserRole.ADMIN,  # إعطاء صلاحية الأدمن
                is_active=True,
                hashed_password=get_password_hash("admin123")  # الباسوورد
            )

            db.add(new_admin)
            await db.commit()
            
            print("==================================================")
            print("✅ تم إنشاء حساب الـ Admin الجديد بنجاح!")
            print(f"📧 البريد الإلكتروني: {target_email}")
            print("🔑 كلمة المرور: admin123")
            print("==================================================")
            
        except Exception as e:
            print(f"❌ حدث خطأ أثناء الاتصال بقاعدة البيانات أو الإنشاء: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(create_new_admin())