// 'use client';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';

// export default function Sidebar() {
//     const pathname = usePathname();
//     const { user } = useAuth();

//     const menuItems = [
//         { name: 'الرئيسية', path: '/dashboard', icon: '📊' },
//         { name: 'إدارة الموكلين', path: '/dashboard/clients', icon: '👥' },
//         { name: 'إدارة القضايا', path: '/dashboard/cases', icon: '💼' },
//         { name: 'المالية', path: '/dashboard/finance', icon: '💰' },
//         { name: 'المحامين', path: '/dashboard/lawyers', icon: '⚖️' },
//         { name: 'مواعيد الزيارات', path: '/dashboard/visits', icon: '📅' },
//         { name: 'تقارير الأداء', path: '/dashboard/analytics', icon: '📈' },
//         { name: 'المهام', path: '/dashboard/tasks', icon: '📝' },
//         { name: 'المساعد الذكي للمواعيد', path: '/dashboard/schedule', icon: '⏳' },


//     ];

//     return (
//         <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-l border-slate-800">
//             {/* هيدر القائمة الجانبية */}
//             <div className="p-6 border-b border-slate-800 text-center">
//                 <h2 className="text-xl font-bold text-white tracking-wide">مَكْتَبِي الرَّقْمِي</h2>
//                 <p className="text-xs text-slate-500 mt-1">نظام إدارة شركات المحاماة</p>
//             </div>

//             {/* روابط التنقل */}
//             <nav className="flex-1 p-4 space-y-2">
//                 {menuItems.map((item) => {
//                     const isActive = pathname === item.path;
//                     return (
//                         <Link
//                             key={item.path}
//                             href={item.path}
//                             className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
//                                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
//                                     : 'hover:bg-slate-800 hover:text-white'
//                                 }`}
//                         >
//                             <span className="text-lg">{item.icon}</span>
//                             <span>{item.name}</span>
//                         </Link>
//                     );
//                 })}
//             </nav>

//             {/* فوتر يعرض بيانات المحامي الحالي داخل القائمة */}
//             <div className="p-4 border-t border-slate-800 bg-slate-950/40">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600">
//                         {user?.full_name?.charAt(0) || 'م'}
//                     </div>
//                     <div className="truncate">
//                         <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
//                         <span className="text-xs text-slate-500 capitalize">{user?.role === 'admin' ? 'مدير النظام' : 'محامي'}</span>
//                     </div>
//                 </div>
//             </div>
//         </aside>
//     );
// }



'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    Scale,
    CircleDollarSign, 
    CalendarDays, 
    BarChart3, 
    ClipboardList, 
    Hourglass,
    Crown
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    // تنظيم الروابط في مجموعات لتنسيق بصري مريح للعين
    const menuGroups = [
        {
            groupName: "العامة",
            items: [
                { name: 'الرئيسية', path: '/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            groupName: "إدارة المكتب",
            items: [
                { name: 'إدارة الموكلين', path: '/dashboard/clients', icon: Users },
                { name: 'إدارة القضايا', path: '/dashboard/cases', icon: Briefcase },
                { name: 'الفريق والقضاة', path: '/dashboard/lawyers', icon: Scale },
            ]
        },
        {
            groupName: "الأعمال والإنتاجية",
            items: [
                { name: 'المهام اليومية', path: '/dashboard/tasks', icon: ClipboardList },
                { name: 'مواعيد الزيارات', path: '/dashboard/visits', icon: CalendarDays },
                { name: 'المساعد الذكي للجدولة', path: '/dashboard/schedule', icon: Hourglass },
            ]
        },
        {
            groupName: "المالية والتقارير",
            items: [
                { name: 'الحسابات والمالية', path: '/dashboard/finance', icon: CircleDollarSign },
                { name: 'تقارير الأداء', path: '/dashboard/analytics', icon: BarChart3 },
            ]
        }
    ];

    return (
        <aside className="w-64 bg-[#0F172A] text-slate-400 h-screen fixed top-0 right-0 flex flex-col border-l border-slate-800/60 shadow-xl select-none z-50" dir="rtl">
            
            {/* هيدر القائمة الجانبية */}
            <div className="p-5 border-b border-slate-800/50 relative overflow-hidden bg-slate-950/20">
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-inner">
                        <Scale className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-100 tracking-wide leading-tight">مَكْتَبِي الرَّقْمِي</h2>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">نظام إدارة شركات المحاماة</p>
                    </div>
                </div>
            </div>

            {/* روابط التنقل مقسمة بشكل منسق */}
            <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-1">
                        {/* اسم المجموعة الفرعية */}
                        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                            {group.groupName}
                        </p>
                        
                        {group.items.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;
                            
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                                        isActive
                                            ? 'bg-slate-800/50 text-amber-400 border border-slate-700/50 shadow-inner'
                                            : 'hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
                                    }`}
                                >
                                    {/* المحتوى الأيمن: الأيقونة والاسم */}
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                                            isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-400'
                                        }`} />
                                        <span>{item.name}</span>
                                    </div>

                                    {/* الخط المضيء العمودي للزر النشط */}
                                    {isActive && (
                                        <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-l-md" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* فوتر يعرض بطاقة المحامي بشكل سفلي أنيق جداً */}
            <div className="p-3 bg-slate-950/40 border-t border-slate-800/60">
                <div className="flex items-center gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
                    {/* الصورة الرمزية */}
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-slate-200 border border-slate-700/60 relative shrink-0">
                        {user?.full_name?.charAt(0) || 'م'}
                        {user?.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-[#0F172A]">
                                <Crown className="w-2 h-2 text-slate-950" />
                            </div>
                        )}
                    </div>
                    
                    {/* الاسم والوظيفة */}
                    <div className="truncate flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate">
                            {user?.full_name || 'الأستاذ المحامي'}
                        </p>
                        <span className="block text-[10px] text-amber-500/80 font-bold mt-0.5">
                            {user?.role === 'admin' ? 'مدير النظام' : 'محامي ممارس'}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}