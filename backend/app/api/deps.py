# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from jose import jwt, JWTError
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from typing import List

# from app.core.config import settings
# from app.core.database import get_db
# from app.models.auth import User, UserRole
# from app.schemas.auth import TokenData

# # إعلام النظام بمكان استخراج التوكن (من مسار الـ login)
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# # 1️⃣ الدالة الأولى: حارس التحقق من الهوية واستخراج المستخدم الحالي
# async def get_current_user(
#     token: str = Depends(oauth2_scheme), 
#     db: AsyncSession = Depends(get_db)
# ) -> User:
#     """
#     تستخرج التوكن، تفك تشفيره، وتتحقق من وجود المستخدم وصلاحية حسابه.
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
    
#     try:
#         # فك تشفير التوكن والتحقق من التوقيع الرقمي
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
#         user_id: str = payload.get("sub")
#         user_role: str = payload.get("role")
        
#         if user_id is None:
#             raise credentials_exception
#         token_data = TokenData(user_id=int(user_id), role=user_role)
#     except JWTError:
#         raise credentials_exception

#     # جلب المستخدم من قاعدة البيانات للتأكد من أنه لم يُحذف أو يُعدل
#     result = await db.execute(select(User).where(User.id == token_data.user_id))
#     user = result.scalar_one_or_none()

#     if user is None:
#         raise credentials_exception
        
#     if not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, 
#             detail="Inactive user account"
#         )
        
#     return user


# # 2️⃣ الدالة الثانية: مستشعر الأدوار الديناميكي (RBAC Guard)
# class RoleChecker:
#     def __init__(self, allowed_roles: List[UserRole]):
#         """تستقبل قائمة بالأدوار المسموح لها بالدخول (مثال: [UserRole.ADMIN, UserRole.PARTNER])"""
#         self.allowed_roles = allowed_roles

#     def __call__(self, current_user: User = Depends(get_current_user)) -> User:
#         """يتم تنفيذها تلقائياً كـ Dependency للتحقق من دور المستخدم الحالي"""
#         if current_user.role not in self.allowed_roles:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="عذراً، لا تمتلك الصلاحية الكافية لإتمام هذه العملية."
#             )
#         return current_user


# backend\app\api\deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import make_transient
from typing import List
import json

from app.core.config import settings
from app.core.database import get_db
from app.models.auth import User, UserRole
from app.schemas.auth import TokenData

# 🌟 استيراد نموذج الصفوف الديناميكية لقراءة صلاحيات الموظف
from app.models.dynamic import CustomRow

# إعلام النظام بمكان استخراج التوكن (من مسار الـ login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# 1️⃣ الدالة الأولى: حارس التحقق من الهوية واستخراج المستخدم الحالي (الهجين)
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    تستخرج التوكن، تفك تشفيره، وتتحقق من وجود المستخدم.
    تتعامل بذكاء مع المستخدم الثابت (Admin) والموظف الديناميكي (Staff).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # فك تشفير التوكن والتحقق من التوقيع الرقمي
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id_raw: str = str(payload.get("sub"))
        user_role: str = payload.get("role")
        
        if user_id_raw is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # 🌟 [الحالة الأولى]: إذا كان المستخدم موظفاً ديناميكياً من نظام الـ OS Builder
    if user_id_raw.startswith("dynamic_staff_"):
        try:
            parts = user_id_raw.split("_")
            row_id = int(parts[2])      # ID السجل الخاص بالموظف
            table_id = int(parts[4])    # ID جدول الموظفين
            
            row_stmt = select(CustomRow).where(CustomRow.id == row_id)
            row_result = await db.execute(row_stmt)
            staff_row = row_result.scalar_one_or_none()
            
            if not staff_row:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="حساب الموظف هذا لم يعد موجوداً في النظام الحركي."
                )
                
            cells = staff_row.cells_data or {}
            
            # 🎯 استخراج الصلاحيات بشكل مرن وذكي
            permissions_dict = {}
            for k, v in cells.items():
                # إذا كانت الصلاحية مخزنة كـ قاموس جاهز
                if isinstance(v, dict):
                    if any(x in str(v) for x in ["read_only", "read_write", "no_access"]):
                        permissions_dict = v
                        break
                # إذا كانت مخزنة كـ نص JSON
                elif isinstance(v, str) and any(x in v for x in ["read_only", "read_write", "no_access"]):
                    try:
                        permissions_dict = json.loads(v)
                        break
                    except:
                        pass

            # 🔒 [قفل الأمان الصارم]: حظر صلاحية التعديل على جدول الموظفين حتى لو تم التلاعب بقاعدة البيانات
            # نجبر النظام على جعل جدول الموظفين الحالي للقراءة فقط بالنسبة لهذا الموظف لمنع تصعيد الصلاحيات.
            permissions_dict[str(table_id)] = "read_only"

            fake_user = User(
                id=row_id,
                email=next((str(v) for k, v in cells.items() if "@" in str(v)), "staff@lawfirm.com"),
                full_name=next((str(v) for k, v in cells.items() if k in ["c1", "c-1", "name", "Full Name"]), "موظف النظام"),
                role=UserRole.SECRETARY,  # الموظف الديناميكي يأخذ دور سكرتارية كحد أقصى لمنع تخطي فحص الأدمن
                is_active=True
            )
            
            # حماية الكائن العائم وفصله لكي لا يربك الـ Session عند حفظ التعديلات الديناميكية
            make_transient(fake_user)
            
            fake_user.is_dynamic_staff = True
            fake_user.dynamic_permissions = permissions_dict  
            fake_user.staff_table_id = table_id
            
            return fake_user
            
        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"❌ فشل بناء كائن الموظف الديناميكي: {e}")
            raise credentials_exception

    # 🌟 [الحالة الثانية]: إذا كان مستخدم قياسي (Admin/Partner)
    try:
        token_data = TokenData(user_id=int(user_id_raw), role=user_role)
    except ValueError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == token_data.user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Inactive user account"
        )
        
    # الأدمن والمحامين الشركاء يحصلون على صلاحية مطلقة لكافة الجداول تلقائياً
    user.is_dynamic_staff = False
    user.dynamic_permissions = {"all": "read_write"}
    
    return user


# 2️⃣ الدالة الثانية: مستشعر الأدوار الديناميكي الحازم (RBAC Guard)
class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        """تستقبل قائمة بالأدوار المسموح لها بالدخول (مثال: [UserRole.ADMIN, UserRole.PARTNER])"""
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """يتم تنفيذها تلقائياً كـ Dependency للتحقق من دور المستخدم الحالي"""
        
        # 🔒 [تحديث أمني]: إذا كان الموظف ديناميكياً وطلب مساراً مخصصاً للأدمن فقط، يتم حظره فوراً.
        if getattr(current_user, "is_dynamic_staff", False):
            # إذا كان المسار مخصصاً للأدمن الصارم أو الشريك الأساسي وليس السكرتارية/الموظف
            if UserRole.SECRETARY not in self.allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="عذراً، هذا المسار مخصص للإدارة العليا فقط ولا يمكن للموظفين الديناميكيين دخوله."
                )
            return current_user
            
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="عذراً، لا تمتلك الصلاحية الكافية لإتمام هذه العملية."
            )
        return current_user
    

# 🛠️ دالة مساعدة لتطهير ومنع تصعيد الصلاحيات 
def sanitize_staff_permissions(cells_data: dict, staff_table_id: int) -> dict:
    """
    تقوم بفحص حقول الـ JSON داخل الموظف وتضمن أنه لا يمكن منح الموظف صلاحية التعديل 
    على جدول الموظفين نفسه، وتجبر صلاحية جدول الموظفين للموظف الجديد أن تكون read_only أو hidden.
    """
    cleaned_cells = cells_data.copy()
    staff_table_key = str(staff_table_id)
    
    for k, v in cleaned_cells.items():
        permissions_dict = None
        is_json_string = False
        
        if isinstance(v, dict):
            permissions_dict = v
        elif isinstance(v, str) and any(x in v for x in ["read_only", "read_write", "no_access"]):
            try:
                permissions_dict = json.loads(v)
                is_json_string = True
            except:
                pass
                
        if permissions_dict is not None:
            # 🚨 حماية صارمة: الموظف الجديد لا يجب أن يأخذ صلاحية read_write على جدول الموظفين نفسه
            permissions_dict[staff_table_key] = "read_only" 
            
            if is_json_string:
                cleaned_cells[k] = json.dumps(permissions_dict)
            else:
                cleaned_cells[k] = permissions_dict
            break 
            
    return cleaned_cells