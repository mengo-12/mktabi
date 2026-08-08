// الكود قبل اضافة التصميم الجديد
// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname, useSearchParams } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { dynamicService } from '@/services/dynamicService';
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
//     Crown,
//     FolderOpen,
//     ChevronDown,
//     ChevronLeft,
// } from 'lucide-react';

// export default function Sidebar() {
//     const pathname = usePathname();
//     const { user } = useAuth();
//     console.log("USER", user);
//     console.log("SYSTEM PAGES", user?.system_pages);
//     const isAdmin = user?.role === "admin" || user?.is_superuser;
//     const systemPages = user?.system_pages || {};
//     const [dynamicSections, setDynamicSections] = useState([]);
//     const [expandedSections, setExpandedSections] = useState({});
//     const searchParams = useSearchParams();
//     const currentTableId = searchParams.get("table");
//     const pagePermissions = user?.system_pages || {};

//     // جلب الصفحات والأقسام الديناميكية التي صممها المدير من الباك إند
//     useEffect(() => {
//         const fetchDynamicPages = async () => {
//             try {
//                 const data = await dynamicService.getSections();

//                 setDynamicSections(
//                     (data || []).filter(
//                         section =>
//                             Array.isArray(section.tables) &&
//                             section.tables.length > 0
//                     )
//                 );

//             } catch (error) {
//                 console.error("خطأ في جلب الأقسام الديناميكية بالـ Sidebar:", error);
//             }
//         };

//         fetchDynamicPages();
//     }, [pathname, user]);

//     const canViewPage = (pageId) => {
//         if (isAdmin) return true;

//         return ["read", "write"].includes(
//             systemPages?.[pageId] || "no_access"
//         );
//     };

//     // تنظيم الروابط الثابتة في مجموعات لتنسيق بصري مريح للعين
//     const menuGroups = [
//         {
//             groupName: "النظام",
//             items: [
//                 {
//                     id: "dashboard",
//                     name: "الرئيسية",
//                     path: "/dashboard",
//                     icon: LayoutDashboard
//                 },
//                 {
//                     id: "calendar",
//                     name: "التقويم",
//                     path: "/dashboard/calendar",
//                     icon: CalendarDays
//                 },
//                 {
//                     id: "finance",
//                     name: "المالية",
//                     path: "/dashboard/finance",
//                     icon: CircleDollarSign
//                 },
//                 {
//                     id: "reports",
//                     name: "التقارير",
//                     path: "/dashboard/analytics",
//                     icon: BarChart3
//                 },
//                 {
//                     id: "dashboard-builder",
//                     name: "منشئ لوحة التحكم",
//                     path: "/dashboard/dashboard-builder",
//                     icon: LayoutDashboard
//                 },
//                 {
//                     id: "system-builder",
//                     name: "منشئ النظام",
//                     path: "/admin/settings/system-builder",
//                     icon: ClipboardList
//                 },
//                 {
//                     id: "report-builder",
//                     name: "منشئ التقارير",
//                     path: "/dashboard/report-builder",
//                     icon: BarChart3
//                 },
//                 {
//                     id: "saved-reports",
//                     name: "التقارير المحفوظة",
//                     path: "/dashboard/report-builder/reports",
//                     icon: FolderOpen
//                 }
//             ]
//         }
//     ];


//     const toggleSection = (sectionId) => {
//         setExpandedSections(prev => ({
//             ...prev,
//             [sectionId]: !prev[sectionId]
//         }));
//     };

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

//                 {/* 1. المجموعات الأساسية الثابتة للنظام */}
//                 {menuGroups.map((group, groupIdx) => (
//                     <div key={groupIdx} className="space-y-1">

//                         <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
//                             {group.groupName}
//                         </p>

//                         {group.items
//                             .filter(item => canViewPage(item.id))
//                             .map((item) => {

//                                 if (!canViewPage(item.id)) {
//                                     return null;
//                                 }

//                                 const Icon = item.icon;
//                                 const isActive = pathname === item.path;

//                                 return (
//                                     <Link
//                                         key={item.path}
//                                         href={item.path}
//                                         className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all
//                         ${isActive
//                                                 ? "bg-slate-800/50 text-amber-400 border border-slate-700/50"
//                                                 : "hover:bg-slate-800/30 hover:text-slate-200"
//                                             }`}
//                                     >

//                                         <div className="flex items-center gap-3">

//                                             <Icon
//                                                 className={`w-4 h-4 ${isActive
//                                                     ? "text-amber-500"
//                                                     : "text-slate-500"
//                                                     }`}
//                                             />

//                                             <span>{item.name}</span>

//                                         </div>

//                                     </Link>
//                                 );

//                             })}

//                     </div>
//                 ))}

//                 {/* 2. الأقسام المخصصة والمولدة ديناميكياً من قبل المدير (تنزل تلقائياً هنا) */}
//                 {dynamicSections.length > 0 && (
//                     <div className="space-y-1 pt-2 border-t border-slate-800/30">
//                         <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-amber-500/70 mb-2">
//                             الأقسام المخصصة
//                         </p>

//                         {dynamicSections.map((section) => {

//                             // إظهار الجداول المسموح بها فقط
//                             const visibleTables = (section.tables || []).filter(
//                                 table =>
//                                     table.user_permission !== "hidden" &&
//                                     table.user_permission !== "no_access"
//                             );

//                             // إذا لم يوجد أي جدول فلا يظهر القسم
//                             if (visibleTables.length === 0) return null;

//                             return (
//                                 <div key={section.id} className="space-y-1">

//                                     {/* زر فتح وإغلاق القسم */}
//                                     <button
//                                         type="button"
//                                         onClick={() => toggleSection(section.id)}
//                                         className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-slate-800/30 hover:text-slate-200"
//                                     >

//                                         <div className="flex items-center gap-3">

//                                             {expandedSections[section.id] ? (
//                                                 <ChevronDown className="w-4 h-4 text-slate-400" />
//                                             ) : (
//                                                 <ChevronLeft className="w-4 h-4 text-slate-400" />
//                                             )}

//                                             <FolderOpen className="w-4 h-4 text-amber-400" />

//                                             <span>{section.title}</span>

//                                         </div>

//                                     </button>

//                                     {/* الجداول */}
//                                     {expandedSections[section.id] && (

//                                         <div className="mr-8 space-y-1">

//                                             {visibleTables.map((table) => {

//                                                 const tablePath =
//                                                     `/dashboard/dynamic/${section.id}?table=${table.id}`;

//                                                 const tableActive =
//                                                     String(currentTableId) === String(table.id);

//                                                 return (

//                                                     <Link
//                                                         key={table.id}
//                                                         href={tablePath}
//                                                         className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] transition-all
//                     ${tableActive
//                                                                 ? "bg-slate-800/40 text-amber-400"
//                                                                 : "hover:bg-slate-800/20 text-slate-400 hover:text-slate-200"
//                                                             }`}
//                                                     >
//                                                         <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
//                                                         <span>{table.name}</span>
//                                                     </Link>

//                                                 );

//                                             })}

//                                         </div>

//                                     )}

//                                 </div>
//                             );

//                         })}
//                     </div>
//                 )}
//             </nav>

//             {/* فوتر يعرض بطاقة المحامي بشكل سفلي أنيق جداً */}
//             <div className="p-3 bg-slate-950/40 border-t border-slate-800/60">
//                 <div className="flex items-center gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
//                     <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-slate-200 border border-slate-700/60 relative shrink-0">
//                         {user?.full_name?.charAt(0) || 'م'}
//                         {user?.role === 'admin' && (
//                             <div className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-[#0F172A]">
//                                 <Crown className="w-2 h-2 text-slate-950" />
//                             </div>
//                         )}
//                     </div>

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
import { usePathname, useSearchParams } from 'next/navigation';
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
    ChevronDown,
    ChevronLeft,
    DatabaseBackup,
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    console.log("USER", user);
    console.log("SYSTEM PAGES", user?.system_pages);
    const isAdmin = user?.role === "admin" || user?.is_superuser;
    const systemPages = user?.system_pages || {};
    const [dynamicSections, setDynamicSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const searchParams = useSearchParams();
    const currentTableId = searchParams.get("table");
    const pagePermissions = user?.system_pages || {};

    // const canViewPage = (pageId) => {

    //     if (
    //         user?.role === "admin" ||
    //         user?.role === "partner" ||
    //         user?.is_superuser
    //     ) {
    //         return true;
    //     }

    //     let permissions = pagePermissions;

    //     if (typeof permissions === "string") {

    //         try {

    //             permissions = JSON.parse(permissions);

    //         } catch {

    //             permissions = {};

    //         }

    //     }

    //     return (
    //         permissions?.[pageId] === "read_only" ||
    //         permissions?.[pageId] === "read_write"
    //     );

    // };
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

    // const canViewPage = (pageId) => {

    //     if (isAdmin) {
    //         return true;
    //     }

    //     const permission =
    //         systemPages?.[pageId] || "no_access";

    //     return (
    //         permission === "read_only" ||
    //         permission === "read_write"
    //     );
    // };

    const canViewPage = (pageId) => {
        if (isAdmin) return true;

        return ["read", "write"].includes(
            systemPages?.[pageId] || "no_access"
        );
    };

    // تنظيم الروابط الثابتة في مجموعات لتنسيق بصري مريح للعين
    const menuGroups = [
        {
            groupName: "النظام",
            items: [
                {
                    id: "dashboard",
                    name: "الرئيسية",
                    path: "/dashboard",
                    icon: LayoutDashboard
                },
                {
                    id: "calendar",
                    name: "التقويم",
                    path: "/dashboard/calendar",
                    icon: CalendarDays
                },
                {
                    id: "finance",
                    name: "المالية",
                    path: "/dashboard/finance",
                    icon: CircleDollarSign
                },
                {
                    id: "reports",
                    name: "التقارير",
                    path: "/dashboard/analytics",
                    icon: BarChart3
                },
                {
                    id: "dashboard-builder",
                    name: "منشئ لوحة التحكم",
                    path: "/dashboard/dashboard-builder",
                    icon: LayoutDashboard
                },
                {
                    id: "system-builder",
                    name: "منشئ النظام",
                    path: "/admin/settings/system-builder",
                    icon: ClipboardList
                },
                {
                    id: "backups",
                    name: "النسخ الاحتياطي",
                    path: "/dashboard/backups",
                    icon: DatabaseBackup
                },
                {
                    id: "report-builder",
                    name: "منشئ التقارير",
                    path: "/dashboard/report-builder",
                    icon: BarChart3
                },
                {
                    id: "saved-reports",
                    name: "التقارير المحفوظة",
                    path: "/dashboard/report-builder/reports",
                    icon: FolderOpen
                }
            ]
        }
    ];


    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    return (
        <aside className="w-64 bg-blue-600 dark:bg-blue-600 text-white h-screen fixed top-0 right-0 flex flex-col border-l border-blue-700 dark:border-blue-700 shadow-xl select-none z-50 transition-all" dir="rtl">

            {/* هيدر القائمة الجانبية */}
            <div className="p-5 border-b border-blue-500/50 relative overflow-hidden bg-blue-600 dark:bg-blue-600">
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/15 rounded-xl border border-white/20 shadow-inner">
                        <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white tracking-wide leading-tight">مَكْتَبِي الرَّقْمِي</h2>
                        <p className="text-[10px] text-blue-100 font-medium mt-0.5">نظام إدارة شركات المحاماة</p>
                    </div>
                </div>
            </div>

            {/* روابط التنقل مقسمة بشكل منسق */}
            <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">

                {/* 1. المجموعات الأساسية الثابتة للنظام */}
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-1">

                        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-blue-200/80 mb-2">
                            {group.groupName}
                        </p>

                        {group.items
                            .filter(item => canViewPage(item.id))
                            .map((item) => {

                                if (!canViewPage(item.id)) {
                                    return null;
                                }

                                const Icon = item.icon;
                                const isActive = pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all
                                    ${isActive
                                                ? "bg-white text-blue-700 font-bold shadow-md"
                                                : "text-blue-50 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >

                                        <div className="flex items-center gap-3">

                                            <Icon
                                                className={`w-4 h-4 ${isActive
                                                    ? "text-blue-700"
                                                    : "text-blue-200"
                                                    }`}
                                            />

                                            <span>{item.name}</span>

                                        </div>

                                    </Link>
                                );

                            })}

                    </div>
                ))}

                {/* 2. الأقسام المخصصة والمولدة ديناميكياً من قبل المدير (تنزل تلقائياً هنا) */}
                {dynamicSections.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-blue-500/50">
                        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-blue-200/80 mb-2">
                            الأقسام المخصصة
                        </p>

                        {dynamicSections.map((section) => {

                            // إظهار الجداول المسموح بها فقط
                            const visibleTables = (section.tables || []).filter(
                                table =>
                                    table.user_permission !== "hidden" &&
                                    table.user_permission !== "no_access"
                            );

                            // إذا لم يوجد أي جدول فلا يظهر القسم
                            if (visibleTables.length === 0) return null;

                            return (
                                <div key={section.id} className="space-y-1">

                                    {/* زر فتح وإغلاق القسم */}
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-blue-50 hover:bg-white/10 hover:text-white transition-all duration-200"
                                    >

                                        <div className="flex items-center gap-3">

                                            {expandedSections[section.id] ? (
                                                <ChevronDown className="w-4 h-4 text-blue-200" />
                                            ) : (
                                                <ChevronLeft className="w-4 h-4 text-blue-200" />
                                            )}

                                            <FolderOpen className="w-4 h-4 text-blue-100" />

                                            <span>{section.title}</span>

                                        </div>

                                    </button>

                                    {/* الجداول */}
                                    {expandedSections[section.id] && (

                                        <div className="mr-8 space-y-1">

                                            {visibleTables.map((table) => {

                                                const tablePath =
                                                    `/dashboard/dynamic/${section.id}?table=${table.id}`;

                                                const tableActive =
                                                    String(currentTableId) === String(table.id);

                                                return (

                                                    <Link
                                                        key={table.id}
                                                        href={tablePath}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] transition-all
                                                    ${tableActive
                                                                ? "bg-white/20 text-white font-bold backdrop-blur-sm"
                                                                : "text-blue-100 hover:bg-white/10 hover:text-white"
                                                            }`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${tableActive ? "bg-white" : "bg-blue-300"}`} />
                                                        <span>{table.name}</span>
                                                    </Link>

                                                );

                                            })}

                                        </div>

                                    )}

                                </div>
                            );

                        })}
                    </div>
                )}
            </nav>

            {/* فوتر يعرض بطاقة المحامي بشكل سفلي أنيق جداً */}
            <div className="p-3 bg-blue-700/50 border-t border-blue-500/50">
                <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-bold text-blue-700 shrink-0 shadow-sm relative">
                        {user?.full_name?.charAt(0) || 'م'}
                        {user?.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 p-0.5 rounded-full border border-blue-700 shadow">
                                <Crown className="w-2 h-2 text-slate-900" />
                            </div>
                        )}
                    </div>

                    <div className="truncate flex-1">
                        <p className="text-xs font-bold text-white truncate">
                            {user?.full_name || 'الأستاذ المحامي'}
                        </p>
                        <span className="block text-[10px] text-blue-200 font-bold mt-0.5">
                            {user?.role === 'admin' ? 'مدير النظام' : 'محامي ممارس'}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}