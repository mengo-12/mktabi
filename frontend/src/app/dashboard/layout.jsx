// 'use client';

// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import Sidebar from '@/components/Sidebar';
// import NotificationBell from '@/components/NotificationBell';
// import { LogOut, ShieldCheck, Scale } from 'lucide-react';

// export default function DashboardLayout({ children }) {
//     const { logout, user } = useAuth();
//     const router = useRouter();
//     const [isAuthorized, setIsAuthorized] = useState(false);
//     const [checking, setChecking] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const storedUser = localStorage.getItem('user');

//         if (token && storedUser && storedUser !== "undefined") {
//             setIsAuthorized(true);
//             setChecking(false);
//         } else {
//             setIsAuthorized(false);
//             setChecking(false);
//             router.push('/login');
//         }
//     }, [router]);

//     if (checking || !isAuthorized) {
//         return (
//             <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center relative overflow-hidden">
//                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
//                 <div className="flex flex-col items-center gap-4 relative z-10 animate-fade-in">
//                     <div className="relative flex items-center justify-center">
//                         <div className="animate-spin h-14 w-14 border-2 border-amber-500/20 border-t-amber-500 rounded-full" />
//                         <Scale className="w-5 h-5 text-amber-500 absolute" />
//                     </div>
//                     <div className="text-center space-y-1">
//                         <p className="text-sm font-bold text-slate-200 tracking-wide">بوابة مَكْتَبِي الرَّقْمِي</p>
//                         <p className="text-xs text-slate-500 font-medium flex items-center gap-1 justify-center">
//                             <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />
//                             جاري تأمين الاتصال وتشفير البيانات...
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen flex bg-[#0B0F19]" dir="rtl">
//             <Sidebar />

// <div className="flex-1 flex flex-col min-w-0">
//     {/* الهيدر بارتفاعه الفاخر h-20 وبأعلى درجات الـ Glassmorphism النظيفة المتوافقة مع النظامين */}
//     <header className="bg-blue-600 dark:bg-blue-600 text-white backdrop-blur-md h-20 border-b border-blue-700 dark:border-blue-700 px-8 flex justify-between items-center sticky top-0 z-30 shadow-md transition-all">
//         <div>
//             <h1 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-wide">لوحة التحكم السحابية</h1>
//             <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">نظام إدارة وُجهاء المحاماة الاستراتيجي</p>
//         </div>

//         <div className="flex items-center gap-5">

//             {/* 👈 جرس التنبيهات الذكي مستدعى بشكل نظيف ومباشر وبدون طبقات معقدة */}
//             {user?.id && (
//                 <NotificationBell/>
//             )}

//             <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />

//             <button
//                 onClick={logout}
//                 className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all duration-200 group cursor-pointer"
//             >
//                 <span>تسجيل الخروج</span>
//                 <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
//             </button>
//         </div>
//     </header>

//     <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 custom-scrollbar transition-all">
//         {children}
//     </main>
// </div>
//         </div>
//     );
// }



'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import {
    LogOut,
    ShieldCheck,
    Scale,
    Palette,
    Check,
    RotateCcw,
} from 'lucide-react';


export default function DashboardLayout({ children }) {
    const { logout, user } = useAuth();
    const router = useRouter();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    // 🎨 لون خلفية صفحات النظام
    const [pageBackground, setPageBackground] = useState('#F8FAFC');

    // 🎨 لون واجهة النظام
    // Header + Sidebar

    const [uiColor, setUiColor] = useState('#2563EB');

    // 🎨 إظهار/إخفاء قائمة الألوان
    const [showColorPicker, setShowColorPicker] = useState(false);


    // --------------------------------------------------
    // التحقق من تسجيل الدخول
    // --------------------------------------------------
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== 'undefined') {
            setIsAuthorized(true);
            setChecking(false);
        } else {
            setIsAuthorized(false);
            setChecking(false);
            router.push('/login');
        }
    }, [router]);


    // --------------------------------------------------
    // تحميل لون المستخدم
    // --------------------------------------------------
    useEffect(() => {
        if (!user?.id) return;

        // ================================
        // 🎨 لون خلفية الصفحات
        // ================================

        const backgroundStorageKey =
            `dashboard-background-${user.id}`;

        const savedBackground =
            localStorage.getItem(backgroundStorageKey) || '#F8FAFC';

        setPageBackground(savedBackground);

        document.documentElement.style.setProperty(
            '--mktabi-page-background',
            savedBackground
        );


        // ================================
        // 🎨 لون الواجهة
        // Header + Sidebar
        // ================================

        const uiStorageKey =
            `dashboard-ui-color-${user.id}`;

        const savedUiColor =
            localStorage.getItem(uiStorageKey) || '#2563EB';

        setUiColor(savedUiColor);

        // ⭐ مهم جدًا
        // وضع اللون في CSS Variable
        document.documentElement.style.setProperty(
            '--mktabi-ui-color',
            savedUiColor
        );

    }, [user?.id]);

    // --------------------------------------------------
    // تغيير لون الخلفية
    // --------------------------------------------------
    const handleBackgroundChange = (color) => {
        setPageBackground(color);

        document.documentElement.style.setProperty(
            '--mktabi-page-background',
            color
        );

        if (user?.id) {
            const storageKey = `dashboard-background-${user.id}`;

            localStorage.setItem(
                storageKey,
                color
            );
        }
    };

    const handleUiColorChange = (color) => {

        // تحديث React
        setUiColor(color);

        // تحديث CSS Variable مباشرة
        document.documentElement.style.setProperty(
            '--mktabi-ui-color',
            color
        );

        // حفظ اللون للمستخدم
        if (user?.id) {

            const storageKey =
                `dashboard-ui-color-${user.id}`;

            localStorage.setItem(
                storageKey,
                color
            );
        }
    };

    // --------------------------------------------------
    // إعادة اللون الافتراضي
    // --------------------------------------------------
    const resetBackgroundColor = () => {
        const defaultColor = '#F8FAFC';

        setPageBackground(defaultColor);

        document.documentElement.style.setProperty(
            '--mktabi-page-background',
            defaultColor
        );

        if (user?.id) {
            const storageKey = `dashboard-background-${user.id}`;

            localStorage.removeItem(storageKey);
        }
    };

    const resetUiColor = () => {

        const defaultColor = '#2563EB';

        setUiColor(defaultColor);

        document.documentElement.style.setProperty(
            '--mktabi-ui-color',
            defaultColor
        );

        if (user?.id) {

            const storageKey =
                `dashboard-ui-color-${user.id}`;

            localStorage.removeItem(storageKey);
        }
    };


    // --------------------------------------------------
    // الألوان المتاحة
    // --------------------------------------------------
    const backgroundColors = [

        // ==================================================
        // ⚪ محايدة
        // ==================================================
        {
            name: 'أبيض',
            color: '#FFFFFF',
        },
        {
            name: 'رمادي فاتح جدًا',
            color: '#F8FAFC',
        },
        {
            name: 'رمادي فاتح',
            color: '#F1F5F9',
        },
        {
            name: 'رمادي',
            color: '#E2E8F0',
        },
        {
            name: 'رمادي دافئ',
            color: '#F5F5F4',
        },
        {
            name: 'رمادي محايد',
            color: '#F4F4F5',
        },
        {
            name: 'بيج فاتح',
            color: '#FAFAF9',
        },

        // ==================================================
        // 🔵 أزرق
        // ==================================================
        {
            name: 'أزرق فاتح',
            color: '#EFF6FF',
        },
        {
            name: 'أزرق سماوي',
            color: '#F0F9FF',
        },
        {
            name: 'أزرق ثلجي',
            color: '#F0F7FF',
        },
        {
            name: 'أزرق هادئ',
            color: '#EAF2F8',
        },
        {
            name: 'أزرق باهت',
            color: '#E8F1FA',
        },
        {
            name: 'أزرق رمادي',
            color: '#EEF2F7',
        },

        // ==================================================
        // 🟢 أخضر
        // ==================================================
        {
            name: 'أخضر فاتح',
            color: '#F0FDF4',
        },
        {
            name: 'أخضر نعناعي',
            color: '#ECFDF5',
        },
        {
            name: 'أخضر هادئ',
            color: '#F1F8F4',
        },
        {
            name: 'أخضر باهت',
            color: '#EEF8F0',
        },
        {
            name: 'سيلادون',
            color: '#F0F7F2',
        },

        // ==================================================
        // 🟣 بنفسجي
        // ==================================================
        {
            name: 'بنفسجي فاتح',
            color: '#F5F3FF',
        },
        {
            name: 'بنفسجي هادئ',
            color: '#FAF5FF',
        },
        {
            name: 'لافندر',
            color: '#F7F5FF',
        },
        {
            name: 'بنفسجي باهت',
            color: '#F3F0FA',
        },

        // ==================================================
        // 🌸 وردي
        // ==================================================
        {
            name: 'وردي فاتح',
            color: '#FFF1F2',
        },
        {
            name: 'وردي هادئ',
            color: '#FFF5F7',
        },
        {
            name: 'وردي باهت',
            color: '#FDF2F8',
        },
        {
            name: 'وردي بودري',
            color: '#FDF5F5',
        },

        // ==================================================
        // 🔴 أحمر
        // ==================================================
        {
            name: 'أحمر فاتح',
            color: '#FEF2F2',
        },
        {
            name: 'أحمر هادئ',
            color: '#FFF5F5',
        },

        // ==================================================
        // 🟡 أصفر
        // ==================================================
        {
            name: 'أصفر فاتح',
            color: '#FEFCE8',
        },
        {
            name: 'أصفر هادئ',
            color: '#FFFBEB',
        },
        {
            name: 'كريمي',
            color: '#FFFCF5',
        },
        {
            name: 'عاجي',
            color: '#FFFDF5',
        },

        // ==================================================
        // 🟠 برتقالي
        // ==================================================
        {
            name: 'برتقالي فاتح',
            color: '#FFF7ED',
        },
        {
            name: 'خوخي',
            color: '#FFF4ED',
        },
        {
            name: 'مشمشي هادئ',
            color: '#FFF6F0',
        },

        // ==================================================
        // 🩵 تركوازي / فيروزي
        // ==================================================
        {
            name: 'تركوازي فاتح',
            color: '#F0FDFA',
        },
        {
            name: 'فيروزي هادئ',
            color: '#ECFEFF',
        },
        {
            name: 'تركوازي باهت',
            color: '#EFFAF9',
        },

        // ==================================================
        // 🩵 سماوي
        // ==================================================
        {
            name: 'سماوي فاتح',
            color: '#F0F9FF',
        },
        {
            name: 'سماوي هادئ',
            color: '#F3FAFC',
        },

        // ==================================================
        // 🟤 بني / رملي
        // ==================================================
        {
            name: 'رملي فاتح',
            color: '#FAF7F2',
        },
        {
            name: 'بني فاتح جدًا',
            color: '#F7F3EF',
        },
        {
            name: 'لاتيه',
            color: '#F8F3EC',
        },

    ];

    // --------------------------------------------------
    // الألوان الواجهة (Header + Sidebar)
    // --------------------------------------------------


    const uiColors = [
        {
            name: 'أزرق ملكي',
            color: '#2563EB',
        },
        {
            name: 'أزرق',
            color: '#1D4ED8',
        },
        {
            name: 'كحلي',
            color: '#1E3A8A',
        },
        {
            name: 'أزرق داكن',
            color: '#1E40AF',
        },
        {
            name: 'سماوي داكن',
            color: '#0369A1',
        },
        {
            name: 'تركوازي',
            color: '#0F766E',
        },
        {
            name: 'زمردي',
            color: '#047857',
        },
        {
            name: 'أخضر داكن',
            color: '#166534',
        },
        {
            name: 'بنفسجي',
            color: '#7C3AED',
        },
        {
            name: 'بنفسجي داكن',
            color: '#5B21B6',
        },
        {
            name: 'نيلي',
            color: '#4338CA',
        },
        {
            name: 'وردي',
            color: '#BE185D',
        },
        {
            name: 'أحمر',
            color: '#B91C1C',
        },
        {
            name: 'برتقالي',
            color: '#C2410C',
        },
        {
            name: 'بني',
            color: '#78350F',
        },
        {
            name: 'رمادي فحمي',
            color: '#334155',
        },
        {
            name: 'رمادي داكن',
            color: '#1F2937',
        },
        {
            name: 'أسود',
            color: '#111827',
        },
    ];


    // --------------------------------------------------
    // شاشة التحقق
    // --------------------------------------------------
    if (checking || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center relative overflow-hidden">

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center gap-4 relative z-10 animate-fade-in">

                    <div className="relative flex items-center justify-center">
                        <div className="animate-spin h-14 w-14 border-2 border-amber-500/20 border-t-amber-500 rounded-full" />

                        <Scale className="w-5 h-5 text-amber-500 absolute" />
                    </div>

                    <div className="text-center space-y-1">

                        <p className="text-sm font-bold text-slate-200 tracking-wide">
                            بوابة مَكْتَبِي الرَّقْمِي
                        </p>

                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 justify-center">

                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />

                            جاري تأمين الاتصال وتشفير البيانات...

                        </p>

                    </div>

                </div>
            </div>
        );
    }


    return (
        <div
            className="min-h-screen flex bg-[#0B0F19]"
            dir="rtl"
        >

            <Sidebar />


            <div className="flex-1 flex flex-col min-w-0">


                {/* =====================================================
                    HEADER
                ====================================================== */}

                <header
                    className="text-white backdrop-blur-md h-20 border-b border-white/20 px-8 flex justify-between items-center sticky top-0 z-30 shadow-md transition-all"
                    style={{
                        backgroundColor: uiColor,
                    }}
                >

                    <div>

                        <h1 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-wide">
                            لوحة التحكم السحابية
                        </h1>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                            نظام إدارة وُجهاء المحاماة الاستراتيجي
                        </p>

                    </div>


                    <div className="flex items-center gap-5">


                        {/* =================================================
                            🎨 زر تغيير لون الخلفية
                        ================================================== */}

                        <div className="relative">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowColorPicker(prev => !prev)
                                }
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    w-9
                                    h-9
                                    rounded-xl
                                    text-white
                                    hover:bg-white/10
                                    border
                                    border-white/10
                                    transition-all
                                "
                                title="تغيير لون خلفية الصفحات"
                            >

                                <Palette className="w-4 h-4" />

                            </button>


                            {/* =============================================
                                قائمة الألوان
                            ============================================== */}

                            {showColorPicker && (
                                <>

                                    {/* طبقة خارجية لإغلاق القائمة */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setShowColorPicker(false)
                                        }
                                    />


                                    <div
                                        className="
        absolute
        left-0
        top-12
        z-50
        w-80
        bg-white
        dark:bg-slate-900
        border
        border-slate-200
        dark:border-slate-700
        rounded-2xl
        shadow-2xl
        p-4
        text-right
    "
                                    >

                                        {/* =================================================
        العنوان
    ================================================== */}

                                        <div className="mb-5">

                                            <div className="flex items-center gap-2">

                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: uiColor,
                                                    }}
                                                >
                                                    <Palette className="w-4 h-4 text-white" />
                                                </div>

                                                <div>

                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                        تخصيص المظهر
                                                    </p>

                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        تخصيص مظهر النظام لهذا المستخدم
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        {/* =================================================
        1. لون خلفية الصفحات
    ================================================== */}

                                        <div className="mb-5">

                                            <div className="mb-3">

                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                    خلفية الصفحات
                                                </p>

                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    لون محتوى صفحات النظام
                                                </p>

                                            </div>


                                            <div
                                                className="
                grid
                grid-cols-5
                gap-2
                max-h-[230px]
                overflow-y-auto
                pr-1
                custom-scrollbar
            "
                                            >

                                                {backgroundColors.map((item) => {

                                                    const isSelected =
                                                        pageBackground === item.color;

                                                    return (

                                                        <button
                                                            key={item.color}
                                                            type="button"
                                                            onClick={() => {
                                                                handleBackgroundChange(item.color);
                                                            }}
                                                            title={item.name}
                                                            className="
                            relative
                            h-11
                            rounded-xl
                            border
                            border-slate-200
                            dark:border-slate-700
                            hover:scale-105
                            transition-all
                            shadow-sm
                        "
                                                            style={{
                                                                backgroundColor: item.color,
                                                            }}
                                                        >

                                                            {isSelected && (

                                                                <span
                                                                    className="
                                    absolute
                                    inset-0
                                    flex
                                    items-center
                                    justify-center
                                "
                                                                >

                                                                    <span
                                                                        className="
                                        w-6
                                        h-6
                                        rounded-full
                                        bg-blue-600
                                        text-white
                                        flex
                                        items-center
                                        justify-center
                                        shadow-lg
                                    "
                                                                    >

                                                                        <Check className="w-3.5 h-3.5" />

                                                                    </span>

                                                                </span>

                                                            )}

                                                        </button>

                                                    );

                                                })}

                                            </div>

                                        </div>


                                        {/* =================================================
        فاصل
    ================================================== */}

                                        <div className="border-t border-slate-200 dark:border-slate-700 my-4" />


                                        {/* =================================================
        2. لون الهيدر والـ Sidebar
    ================================================== */}

                                        <div className="mb-4">

                                            <div className="mb-3">

                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                    لون الهيدر والقائمة الجانبية
                                                </p>

                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    لون واجهة النظام بالكامل
                                                </p>

                                            </div>


                                            <div
                                                className="
                grid
                grid-cols-5
                gap-2
                max-h-[200px]
                overflow-y-auto
                pr-1
                custom-scrollbar
            "
                                            >

                                                {uiColors.map((item) => {

                                                    const isSelected =
                                                        uiColor === item.color;

                                                    return (

                                                        <button
                                                            key={item.color}
                                                            type="button"
                                                            onClick={() => {
                                                                handleUiColorChange(item.color);
                                                            }}
                                                            title={item.name}
                                                            className="
                            relative
                            h-11
                            rounded-xl
                            border
                            border-slate-200
                            dark:border-slate-700
                            hover:scale-105
                            transition-all
                            shadow-sm
                        "
                                                            style={{
                                                                backgroundColor: item.color,
                                                            }}
                                                        >

                                                            {isSelected && (

                                                                <span
                                                                    className="
                                    absolute
                                    inset-0
                                    flex
                                    items-center
                                    justify-center
                                "
                                                                >

                                                                    <span
                                                                        className="
                                        w-6
                                        h-6
                                        rounded-full
                                        bg-white
                                        flex
                                        items-center
                                        justify-center
                                        shadow-lg
                                    "
                                                                    >

                                                                        <Check
                                                                            className="w-3.5 h-3.5"
                                                                            style={{
                                                                                color: item.color,
                                                                            }}
                                                                        />

                                                                    </span>

                                                                </span>

                                                            )}

                                                        </button>

                                                    );

                                                })}

                                            </div>

                                        </div>


                                        {/* =================================================
        إعادة الافتراضي
    ================================================== */}

                                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">

                                            <div className="grid grid-cols-2 gap-2">

                                                {/* إعادة خلفية الصفحات */}

                                                <button
                                                    type="button"
                                                    onClick={resetBackgroundColor}
                                                    className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-3
                    py-2.5
                    rounded-xl
                    text-[11px]
                    font-bold
                    text-slate-600
                    dark:text-slate-300
                    bg-slate-100
                    dark:bg-slate-800
                    hover:bg-slate-200
                    dark:hover:bg-slate-700
                    transition
                "
                                                >

                                                    <RotateCcw className="w-3.5 h-3.5" />

                                                    خلفية الصفحات

                                                </button>


                                                {/* إعادة لون الواجهة */}

                                                <button
                                                    type="button"
                                                    onClick={resetUiColor}
                                                    className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-3
                    py-2.5
                    rounded-xl
                    text-[11px]
                    font-bold
                    text-slate-600
                    dark:text-slate-300
                    bg-slate-100
                    dark:bg-slate-800
                    hover:bg-slate-200
                    dark:hover:bg-slate-700
                    transition
                "
                                                >

                                                    <RotateCcw className="w-3.5 h-3.5" />

                                                    لون الواجهة

                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                </>
                            )}

                        </div>


                        {/* =================================================
                            جرس التنبيهات
                        ================================================== */}

                        {user?.id && (
                            <NotificationBell />
                        )}


                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />


                        {/* =================================================
                            تسجيل الخروج
                        ================================================== */}

                        <button
                            onClick={logout}
                            className="
                                flex
                                items-center
                                gap-2
                                px-3
                                py-2
                                rounded-xl
                                text-xs
                                font-bold
                                text-rose-600
                                dark:text-rose-400
                                hover:text-rose-700
                                dark:hover:text-rose-300
                                hover:bg-rose-50
                                dark:hover:bg-rose-500/10
                                border
                                border-transparent
                                hover:border-rose-200
                                dark:hover:border-rose-500/20
                                transition-all
                                duration-200
                                group
                                cursor-pointer
                            "
                        >

                            <span>
                                تسجيل الخروج
                            </span>

                            <LogOut
                                className="
                                    w-3.5
                                    h-3.5
                                    transition-transform
                                    duration-200
                                    group-hover:translate-x-0.5
                                "
                            />

                        </button>

                    </div>

                </header>


                {/* =====================================================
                    PAGE CONTENT
                ====================================================== */}

                <main
                    className="
        flex-1
        p-6
        overflow-y-auto
        text-slate-800
        dark:text-slate-100
        custom-scrollbar
        transition-colors
    "
                    style={{
                        backgroundColor:
                            'var(--mktabi-page-background, #f8fafc)',
                    }}
                >
                    {children}
                </main>

            </div>

        </div>
    );
}