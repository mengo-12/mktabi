// 'use client';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import Sidebar from '@/components/Sidebar';
// import NotificationBell from '@/components/NotificationBell';

// export default function DashboardLayout({ children }) {
//     const { logout, user } = useAuth();
//     const router = useRouter();
//     const [isAuthorized, setIsAuthorized] = useState(false);
//     const [checking, setChecking] = useState(true); // مؤشر فحص محلي صارم

//     useEffect(() => {
//         // فحص فوري ومباشر من المتصفح لتفادي أي وميض أو تأخير بالـ Context
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

//     // أثناء الفحص، اعرض شاشة الانتظار لضمان عدم حدوث وميض أو ارتداد
//     if (checking || !isAuthorized) {
//         return (
//             <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//                 <div className="flex flex-col items-center gap-3">
//                     <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
//                     <p className="text-sm font-medium text-slate-500">جاري تأمين الاتصال بالمكتب...</p>
//                 </div>
//             </div>
//         );
//     }

// return (
//         <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900" dir="rtl">
//             <Sidebar />

//             <div className="flex-1 flex flex-col min-w-0">
//                 <header className="bg-white dark:bg-slate-800 h-16 shadow-sm border-b border-slate-100 dark:border-slate-700 px-6 flex justify-between items-center">
//                     <h1 className="text-lg font-bold text-slate-800 dark:text-white">نظام مكتب المحاماة الذكي</h1>
                    
//                     {/* أزرار التحكم في الترويسة اليمنى */}
//                     <div className="flex items-center gap-4">
//                         {/* 👈 3. زر جرس التنبيهات الحية مربوط ديناميكياً بـ id المحامي */}
//                         {user?.id && <NotificationBell lawyerId={user.id} />}
                        
//                         <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

//                         <button
//                             onClick={logout}
//                             className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
//                         >
//                             تسجيل الخروج
//                         </button>
//                     </div>
//                 </header>

//                 <main className="flex-1 p-6 overflow-y-auto">
//                     {children}
//                 </main>
//             </div>
//         </div>
//     );
// }



'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { LogOut, ShieldCheck, Scale } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== "undefined") {
            setIsAuthorized(true);
            setChecking(false);
        } else {
            setIsAuthorized(false);
            setChecking(false);
            router.push('/login');
        }
    }, [router]);

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
                        <p className="text-sm font-bold text-slate-200 tracking-wide">بوابة مَكْتَبِي الرَّقْمِي</p>
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
        <div className="min-h-screen flex bg-[#0B0F19]" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* الهيدر بارتفاعه الفاخر h-20 وبأعلى درجات الـ Glassmorphism النظيفة */}
                <header className="bg-[#0F172A]/80 backdrop-blur-md h-20 border-b border-slate-800/50 px-8 flex justify-between items-center sticky top-0 z-30 shadow-sm shadow-slate-950/20">
                    <div>
                        <h1 className="text-base font-black text-slate-100 tracking-wide">لوحة التحكم السحابية</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">نظام إدارة وُجهاء المحاماة الاستراتيجي</p>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        
                        {/* 👈 جرس التنبيهات الذكي مستدعى بشكل نظيف ومباشر وبدون طبقات معقدة */}
                        {user?.id && (
                            <NotificationBell lawyerId={user.id} />
                        )}
                        
                        <div className="h-6 w-px bg-slate-800" />

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all duration-200 group"
                        >
                            <span>تسجيل الخروج</span>
                            <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-[#0B0F19] to-[#0D1321] custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}