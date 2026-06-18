mktabi-frontend/
├── .env.local             # متغيرات البيئة (رابط الباك-إند)
├── package.json
├── tailwind.config.js
└── src/
    ├── app/               # مجلد الصفحات الرئيسي (App Router)
    │   ├── layout.js      # التصميم العام (يتضمن الـ AuthProvider)
    │   ├── page.js        # صفحة الهبوط أو تحويل المسار
    │   ├── login/         # صفحة تسجيل الدخول
    │   │   └── page.js
    │   └── dashboard/     # لوحة التحكم المحمية
    │       ├── page.js    # الرابط الرئيسي للوحة
    │       ├── clients/   # إدارة الموكلين
    │       │   └── page.js
    │       └── cases/     # إدارة القضايا
    │           └── page.js
    ├── components/        # المكونات المشتركة وقابلة لإعادة الاستخدام
    │   ├── Sidebar.js     # القائمة الجانبية للمكتب
    │   ├── Navbar.js      # الشريط العلوي
    │   └── ui/            # عناصر الواجهة الصغيرة (أزرار، جداول)
    ├── context/
    │   └── AuthContext.js # إدارة جلسة المستخدم والتوكن
    └── services/
        └── apiClient.js   # عميل الاتصال الموحد بالسيرفر (Axios)