law_platform/
└── backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py                 # نقطة الانطلاق لتشغيل FastAPI
    │   ├── core/
    │   │   ├── config.py           # إعدادات النظام وقراءة ملفات الـ .env
    │   │   ├── database.py         # إعداد الاتصال بـ PostgreSQL (Async)
    │   │   └── security.py         # التشفير وتوليد توكنات JWT
    │   ├── models/                 # جداول قاعدة البيانات (SQLAlchemy Models)
    │   │   ├── __init__.py
    │   │   └── auth.py             # جدول المستخدمين والصلاحيات
    │   ├── schemas/                # نماذج التحقق من البيانات (Pydantic Schemas)
    │   │   ├── __init__.py
    │   │   └── auth.py
    │   └── api/                    # المسارات والمتحكمات (Routes/Endpoints)
    │       ├── __init__.py
    │       └── v1/
    │           ├── api.py          # تجميع كل المسارات
    │           └── endpoints/
    │               └── auth.py     # مسارات التسجيل وتسجيل الدخول
    ├── .env                        # المتغيرات البيئية (سرية)
    ├── .gitignore
    └── requirements.txt            # المكتبات المطلوبة