'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    const { logout } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true); // مؤشر فحص محلي صارم

    useEffect(() => {
        // فحص فوري ومباشر من المتصفح لتفادي أي وميض أو تأخير بالـ Context
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

    // أثناء الفحص، اعرض شاشة الانتظار لضمان عدم حدوث وميض أو ارتداد
    if (checking || !isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-sm font-medium text-slate-500">جاري تأمين الاتصال بالمكتب...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900" dir="rtl">
            {/* القائمة الجانبية الثابتة */}
            <Sidebar />

            {/* منطقة المحتوى */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white dark:bg-slate-800 h-16 shadow-sm border-b border-slate-100 dark:border-slate-700 px-6 flex justify-between items-center">
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">نظام مكتب المحاماة الذكي</h1>
                    <button
                        onClick={logout}
                        className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                        تسجيل الخروج
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}