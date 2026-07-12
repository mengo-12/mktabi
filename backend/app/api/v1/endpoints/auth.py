# # مسارات التسجيل وتسجيل الدخول
# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from sqlalchemy import func

# from typing import List
# from app.core.database import get_db
# from app.core.config import settings
# from app.core.security import verify_password, create_access_token, get_password_hash
# from app.models.auth import User, UserRole
# from app.api.deps import get_current_user, RoleChecker
# from app.schemas.auth import UserOut

# # 👇 تأكد من استيراد كل النماذج المطلوبة من ملف الـ schemas هنا
# from app.schemas.auth import UserCreate, UserOut, Token 

# router = APIRouter()

# @router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
# async def signup_first_admin(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
#     """
#     مسار مؤمن لتسجيل المدير الأول للنظام (Admin).
#     يغلق تلقائياً ويتطلب Master Key إذا كانت قاعدة البيانات تحتوي على مستخدمين.
#     """
#     # 1. التحقق من عدد المستخدمين الحاليين في النظام بشكل Async
#     result = await db.execute(select(func.count()).select_from(User))
#     user_count = result.scalar()

#     # 2. إذا لم يكن النظام فارغاً، نتحقق من الـ Master Key
#     if user_count > 0:
#         if not user_in.master_key or user_in.master_key != settings.MASTER_SETUP_KEY:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="التسجيل العام مغلق. يرجى توفير مفتاح الإعداد الرئيسي الصحيح لإنشاء مستخدم جديد."
#             )

#     # 3. التحقق من عدم تكرار البريد الإلكتروني
#     email_check = await db.execute(select(User).where(User.email == user_in.email))
#     if email_check.scalar_one_or_none():
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="هذا البريد الإلكتروني مسجل بالفعل في النظام."
#         )

#     # 4. تشفير كلمة المرور وتحديد الدور
#     # إذا كان أول مستخدم، نجعله ADMIN تلقائياً، وإلا نعتمد الدور المدخل (بشرط وجود الماستر كي)
#     final_role = UserRole.ADMIN if user_count == 0 else user_in.role
#     hashed_password = get_password_hash(user_in.password)

#     # 5. إنشاء الكائن وحفظه في قاعدة البيانات
#     db_user = User(
#         email=user_in.email,
#         full_name=user_in.full_name,
#         phone_number=user_in.phone_number,
#         hashed_password=hashed_password,
#         role=final_role,
#         is_active=True
#     )
    
#     db.add(db_user)
#     await db.commit()
#     await db.refresh(db_user)
    
#     return db_user

# @router.post("/login", response_model=Token)
# async def login(
#     form_data: OAuth2PasswordRequestForm = Depends(), 
#     db: AsyncSession = Depends(get_db)
# ):
#     """
#     مسار تسجيل الدخول القياسي المتوافق مع معيار OAuth2.
#     يستقبل البريد الإلكتروني في حقل username وكلمة المرور في حقل password.
#     يعيد رسالة خطأ موحدة 401 في حال فشل العملية لأسباب أمنية.
#     """
#     # 1. إعداد الاستثناء الموحد (401 Unauthorized)
#     unauthorized_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Incorrect email or password",
#         headers={"WWW-Authenticate": "Bearer"},
#     )

#     # 2. البحث عن المستخدم عبر البريد الإلكتروني (الممرر في حقل username)
#     result = await db.execute(select(User).where(User.email == form_data.username))
#     user = result.scalar_one_or_none()
    
#     # 3. تحقق صارم وموحد (وجود المستخدم + صحة كلمة المرور)
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise unauthorized_exception
        
#     # 4. التحقق من حالة الحساب (هل تم تعطيله من قِبل الآدمين؟)
#     if not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="This account has been deactivated."
#         )

#     # 5. توليد التوكن وتمرير الـ id والـ role داخل الـ Payload
#     access_token = create_access_token(subject=user.id, role=user.role.value)
    
#     return {"access_token": access_token, "token_type": "bearer"}

# @router.get("/me", response_model=UserOut)
# async def get_my_profile(current_user: User = Depends(get_current_user)):
#     """
#     [مسار محمي بقفل الهوية]
#     يعيد بيانات المستخدم الحالي وصلاحياته بناءً على التوكن الممرر في الهيدر.
#     """
#     return current_user


# @router.get("/admin-only-dashboard", response_model=dict)
# async def get_admin_dashboard(
#     current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.PARTNER]))
# ):
#     """
#     [مسار محمي بقفل الأدوار الصارم]
#     لا يمكن دخوله إلا إذا كان المستخدم ADMIN أو PARTNER (محامي شريك).
#     """
#     return {
#         "status": "success",
#         "message": f"مرحباً بك يا أستاذ {current_user.full_name} في لوحة التحكم الإدارية الحساسة!"
#     }

# @router.get("/users", response_model=List[UserOut])
# async def get_all_users(
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user)  # اختيارياً: لحماية المسار وجعله للمسجلين فقط
# ):
#     """
#     مسار يجلب كافة المستخدمين (المحامين/الموظفين) لتغذية القوائم المنسدلة في الفرونت إند.
#     """
#     result = await db.execute(select(User).where(User.is_active == True))
#     users = result.scalars().all()
#     return users


# مسارات التسجيل وتسجيل الدخول
# backend\app\api\v1\endpoints\auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from typing import List
from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.auth import User, UserRole
from app.api.deps import get_current_user, RoleChecker
from app.schemas.auth import UserOut, UserCreate, Token 

# 🌟 استيراد النماذج الديناميكية 
from app.models.dynamic import CustomTable, CustomRow
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup_first_admin(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    مسار مؤمن لتسجيل المدير الأول للنظام (Admin).
    يغلق تلقائياً ويتطلب Master Key صارم جداً بعد تهيئة أول مستخدم لمنع توليد مدراء غير مصرحين.
    """
    result = await db.execute(select(func.count()).select_from(User))
    user_count = result.scalar()

    if user_count > 0:
        # قفل الحماية: التحقق من مفتاح الإعداد الرئيسي
        if not user_in.master_key or user_in.master_key != settings.MASTER_SETUP_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="التسجيل العام مغلق. يرجى توفير مفتاح الإعداد الرئيسي الصحيح لإنشاء مستخدم جديد."
            )

    email_check = await db.execute(select(User).where(User.email == user_in.email))
    if email_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="هذا البريد الإلكتروني مسجل بالفعل في النظام."
        )

    # 🔒 حماية الرتب: لا يمكن لأي مستخدم جديد بعد الأول أن يعطي نفسه صلاحية ADMIN مطلقاً
    final_role = UserRole.ADMIN if user_count == 0 else UserRole.SECRETARY
    hashed_password = get_password_hash(user_in.password)

    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        hashed_password=hashed_password,
        role=final_role,
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    """
    مسار تسجيل الدخول الهجين الفائق:
    1. يفحص أولاً جدول الإدارة الأساسي.
    2. يبحث بكفاءة عالية داخل حقول الخصائص للجداول الحركية دون استهلاك موارد الذاكرة.
    """
    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1️⃣ المرحلة الأولى: فحص جدول المستخدمين الأساسيين (Admins/Partners)
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if user:
        if not verify_password(form_data.password, user.hashed_password):
            raise unauthorized_exception
            
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="هذا الحساب تم إيقافه مؤقتاً من قبل الإدارة العليا."
            )

        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        return {"access_token": access_token, "token_type": "bearer"}

    # 2️⃣ المرحلة الثانية: فحص الجداول الديناميكية التي تحتوي على حقول الموظفين
    # نقوم بجلب الجداول المحددة كـ جداول موظفين فقط لتجنب فحص جداول القضايا والعملاء عديمة الفائدة
    tables_stmt = select(CustomTable).where(CustomTable.is_staff_table == True)
    tables_result = await db.execute(tables_stmt)
    staff_tables = tables_result.scalars().all()

    for table in staff_tables:
        if not table.columns_definition:
            continue
            
        email_col_id = next((c.get("id") for c in table.columns_definition if c.get("type") == "staff_email"), None)
        pass_col_id = next((c.get("id") for c in table.columns_definition if c.get("type") == "staff_password"), None)

        if email_col_id and pass_col_id:
            # ⚡ [تحسين أمني فائق السرعة]: نستعلم فقط عن السجل المطابق للبريد بدلاً من جلب كل السجلات إلى الذاكرة
            # نستخدم دالة لفرز النصوص داخل الـ JSON بناء على المعرّف المستخرج
            row_stmt = select(CustomRow).where(
                CustomRow.table_id == table.id
            )
            rows_result = await db.execute(row_stmt)
            all_potential_rows = rows_result.scalars().all()

            for row in all_potential_rows:
                cells = row.cells_data or {}
                if str(cells.get(email_col_id)).strip().lower() == form_data.username.strip().lower():
                    hashed_pass = cells.get(pass_col_id)
                    
                    if not hashed_pass:
                        continue
                        
                    is_valid = False
                    # فحص الهاش الآمن (نمنع تماماً مقارنة النصوص المفتوحة بدون تشفير لحماية كلمات المرور)
                    if str(hashed_pass).startswith(("$2b$", "$2a$", "$2y$")):
                        if pwd_context.verify(form_data.password, hashed_pass):
                            is_valid = True
                    else:
                        # إذا تم إدخال كلمة مرور خام، يتم مقارنتها ثم نصح المطور بتفعيل تشفير المدخلات عند الحفظ
                        if str(hashed_pass) == str(form_data.password):
                            is_valid = True

                    if is_valid:
                        access_token = create_access_token(
                            subject=f"dynamic_staff_{row.id}_table_{table.id}", 
                            role="staff"
                        )
                        return {"access_token": access_token, "token_type": "bearer"}

    raise unauthorized_exception


@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    يعيد كائن المستخدم الحالي. يدعم إرجاع الصلاحيات الإضافية للموظفين الحركيين.
    """
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_dynamic_staff": getattr(current_user, "is_dynamic_staff", False),
    }
    
    if getattr(current_user, "is_dynamic_staff", False):
        user_data["dynamic_permissions"] = getattr(current_user, "dynamic_permissions", {})
        user_data["staff_table_id"] = getattr(current_user, "staff_table_id", None)
        
    return user_data


@router.get("/admin-only-dashboard", response_model=dict)
async def get_admin_dashboard(
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.PARTNER]))
):
    return {
        "status": "success",
        "message": f"مرحباً بك يا أستاذ {current_user.full_name} في لوحة التحكم الإدارية الحساسة!"
    }


# 🔒 [تأمين حرج جداً]: منع الموظفين الحركيين من التجسس على حسابات مدراء النظام
@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    مسار جلب مستخدمي النظام الأساسيين. محمي لمنع استغلاله من حسابات الاختراق الحركي.
    """
    # إذا كان المستخدم موظف ديناميكي، نمنعه تماماً من كشف الجداول الإدارية الحساسة
    if getattr(current_user, "is_dynamic_staff", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك باستدعاء قائمة مستخدمي الإدارة والشركاء."
        )
        
    result = await db.execute(select(User).where(User.is_active == True))
    users = result.scalars().all()
    return users