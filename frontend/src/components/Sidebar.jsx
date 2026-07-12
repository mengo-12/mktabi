// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { 
//     LayoutDashboard, 
//     Users, 
//     Briefcase, 
//     Scale,
//     CircleDollarSign, 
//     CalendarDays, 
//     BarChart3, 
//     ClipboardList, 
//     Hourglass,
//     Crown
// } from 'lucide-react';

// export default function Sidebar() {
//     const pathname = usePathname();
//     const { user } = useAuth();

//     // تنظيم الروابط في مجموعات لتنسيق بصري مريح للعين
//     const menuGroups = [
//         {
//             groupName: "العامة",
//             items: [
//                 { name: 'الرئيسية', path: '/dashboard', icon: LayoutDashboard },
//             ]
//         },
//         {
//             groupName: "إدارة المكتب",
//             items: [
//                 { name: 'إدارة الموكلين', path: '/dashboard/clients', icon: Users },
//                 { name: 'إدارة القضايا', path: '/dashboard/cases', icon: Briefcase },
//                 { name: 'الفريق والقضاة', path: '/dashboard/lawyers', icon: Scale },
//             ]
//         },
//         {
//             groupName: "الأعمال والإنتاجية",
//             items: [
//                 { name: 'المهام اليومية', path: '/dashboard/tasks', icon: ClipboardList },
//                 { name: 'مواعيد الزيارات', path: '/dashboard/visits', icon: CalendarDays },
//                 { name: 'المساعد الذكي للجدولة', path: '/dashboard/schedule', icon: Hourglass },
//             ]
//         },
//         {
//             groupName: "المالية والتقارير",
//             items: [
//                 { name: 'الحسابات والمالية', path: '/dashboard/finance', icon: CircleDollarSign },
//                 { name: 'تقارير الأداء', path: '/dashboard/analytics', icon: BarChart3 },
//             ]
//         }
//     ];

//     return (
//         <aside className="w-64 bg-[#0F172A] text-slate-400 h-screen fixed top-0 right-0 flex flex-col border-l border-slate-800/60 shadow-xl select-none z-50" dir="rtl">

//             {/* هيدر القائمة الجانبية */}
//             <div className="p-5 border-b border-slate-800/50 relative overflow-hidden bg-slate-950/20">
//                 <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

//                 <div className="flex items-center gap-3">
//                     <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-inner">
//                         <Scale className="w-5 h-5 text-amber-500" />
//                     </div>
//                     <div>
//                         <h2 className="text-sm font-black text-slate-100 tracking-wide leading-tight">مَكْتَبِي الرَّقْمِي</h2>
//                         <p className="text-[10px] text-slate-500 font-medium mt-0.5">نظام إدارة شركات المحاماة</p>
//                     </div>
//                 </div>
//             </div>

//             {/* روابط التنقل مقسمة بشكل منسق */}
//             <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
//                 {menuGroups.map((group, groupIdx) => (
//                     <div key={groupIdx} className="space-y-1">
//                         {/* اسم المجموعة الفرعية */}
//                         <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
//                             {group.groupName}
//                         </p>

//                         {group.items.map((item) => {
//                             const isActive = pathname === item.path;
//                             const Icon = item.icon;

//                             return (
//                                 <Link
//                                     key={item.path}
//                                     href={item.path}
//                                     className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
//                                         isActive
//                                             ? 'bg-slate-800/50 text-amber-400 border border-slate-700/50 shadow-inner'
//                                             : 'hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
//                                     }`}
//                                 >
//                                     {/* المحتوى الأيمن: الأيقونة والاسم */}
//                                     <div className="flex items-center gap-3">
//                                         <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
//                                             isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-400'
//                                         }`} />
//                                         <span>{item.name}</span>
//                                     </div>

//                                     {/* الخط المضيء العمودي للزر النشط */}
//                                     {isActive && (
//                                         <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-l-md" />
//                                     )}
//                                 </Link>
//                             );
//                         })}
//                     </div>
//                 ))}
//             </nav>

//             {/* فوتر يعرض بطاقة المحامي بشكل سفلي أنيق جداً */}
//             <div className="p-3 bg-slate-950/40 border-t border-slate-800/60">
//                 <div className="flex items-center gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
//                     {/* الصورة الرمزية */}
//                     <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-slate-200 border border-slate-700/60 relative shrink-0">
//                         {user?.full_name?.charAt(0) || 'م'}
//                         {user?.role === 'admin' && (
//                             <div className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-[#0F172A]">
//                                 <Crown className="w-2 h-2 text-slate-950" />
//                             </div>
//                         )}
//                     </div>

//                     {/* الاسم والوظيفة */}
//                     <div className="truncate flex-1">
//                         <p className="text-xs font-bold text-slate-200 truncate">
//                             {user?.full_name || 'الأستاذ المحامي'}
//                         </p>
//                         <span className="block text-[10px] text-amber-500/80 font-bold mt-0.5">
//                             {user?.role === 'admin' ? 'مدير النظام' : 'محامي ممارس'}
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         </aside>
//     );
// }



'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dynamicService } from '@/services/dynamicService';
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
    Crown,
    FolderOpen,
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [dynamicSections, setDynamicSections] = useState([]);

    // جلب الصفحات والأقسام الديناميكية التي صممها المدير من الباك إند
    useEffect(() => {
        const fetchDynamicPages = async () => {
            try {
                const data = await dynamicService.getSections();

                setDynamicSections(
                    (data || []).filter(
                        section =>
                            Array.isArray(section.tables) &&
                            section.tables.length > 0
                    )
                );

            } catch (error) {
                console.error("خطأ في جلب الأقسام الديناميكية بالـ Sidebar:", error);
            }
        };

        fetchDynamicPages();
    }, [pathname, user]);

    // تنظيم الروابط الثابتة في مجموعات لتنسيق بصري مريح للعين
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

                {/* 1. المجموعات الأساسية الثابتة للنظام */}
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-1">
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
                                    className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${isActive
                                        ? 'bg-slate-800/50 text-amber-400 border border-slate-700/50 shadow-inner'
                                        : 'hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-400'
                                            }`} />
                                        <span>{item.name}</span>
                                    </div>

                                    {isActive && (
                                        <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-l-md" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}

                {/* 2. الأقسام المخصصة والمولدة ديناميكياً من قبل المدير (تنزل تلقائياً هنا) */}
                {dynamicSections.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-800/30">
                        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-amber-500/70 mb-2">
                            الأقسام المخصصة
                        </p>
                        {dynamicSections.map((section) => {
                            // توجيه المستخدم لصفحة العرض الديناميكية الموحدة وتمرير معرف القسم
                            const dynamicPath = `/dashboard/dynamic/${section.id}`;
                            const isActive = pathname === dynamicPath;

                            return (
                                <Link
                                    key={section.id}
                                    href={dynamicPath}
                                    className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${isActive
                                        ? 'bg-slate-800/50 text-amber-400 border border-slate-700/50 shadow-inner'
                                        : 'hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FolderOpen className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-400'
                                            }`} />
                                        <span>{section.title}</span>
                                    </div>

                                    {isActive && (
                                        <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-amber-400 rounded-l-md" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </nav>

            {/* فوتر يعرض بطاقة المحامي بشكل سفلي أنيق جداً */}
            <div className="p-3 bg-slate-950/40 border-t border-slate-800/60">
                <div className="flex items-center gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-slate-200 border border-slate-700/60 relative shrink-0">
                        {user?.full_name?.charAt(0) || 'م'}
                        {user?.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-[#0F172A]">
                                <Crown className="w-2 h-2 text-slate-950" />
                            </div>
                        )}
                    </div>

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