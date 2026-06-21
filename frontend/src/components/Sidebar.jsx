'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const menuItems = [
        { name: 'الرئيسية', path: '/dashboard', icon: '📊' },
        { name: 'إدارة الموكلين', path: '/dashboard/clients', icon: '👥' },
        { name: 'إدارة القضايا', path: '/dashboard/cases', icon: '💼' },
        { name: 'المالية', path: '/dashboard/finance', icon: '💰' },
        { name: 'المحامين', path: '/dashboard/lawyers', icon: '⚖️' },
        { name: 'مواعيد الزيارات', path: '/dashboard/visits', icon: '📅' },
        { name: 'تقارير الأداء', path: '/dashboard/analytics', icon: '📈' },
        { name: 'المهام', path: '/dashboard/tasks', icon: '📝' },
        { name: 'المساعد الذكي للمواعيد', path: '/dashboard/schedule', icon: '⏳' },


    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-l border-slate-800">
            {/* هيدر القائمة الجانبية */}
            <div className="p-6 border-b border-slate-800 text-center">
                <h2 className="text-xl font-bold text-white tracking-wide">مَكْتَبِي الرَّقْمِي</h2>
                <p className="text-xs text-slate-500 mt-1">نظام إدارة شركات المحاماة</p>
            </div>

            {/* روابط التنقل */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* فوتر يعرض بيانات المحامي الحالي داخل القائمة */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600">
                        {user?.full_name?.charAt(0) || 'م'}
                    </div>
                    <div className="truncate">
                        <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
                        <span className="text-xs text-slate-500 capitalize">{user?.role === 'admin' ? 'مدير النظام' : 'محامي'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}