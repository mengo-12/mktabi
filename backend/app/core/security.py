from passlib.context import CryptContext

# تحديث الإعداد لإجبار المكتبة على استخدام المحرك الحديث لـ bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """التحقق من تطابق كلمة المرور المدخلة مع المشفرة"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """تشفير كلمة المرور قبل حفظها"""
    # نقوم بتحويل النص إلى bytes ومن ثم عمل الـ hash للتوافق التام ومنع مشاكل التقطيع
    return pwd_context.hash(password)