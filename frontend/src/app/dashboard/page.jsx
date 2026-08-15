// 'use client';
// import { useAuth } from '@/context/AuthContext';
// import { 
//     Briefcase, 
//     Users, 
//     FolderOpen, 
//     Sparkles, 
//     ShieldCheck 
// } from 'lucide-react';

// export default function DashboardPage() {
//     const { user } = useAuth();

//     return (
//         <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">

//             {/* بطاقة الترحيب القانونية بتصميم ملكي فاخر */}
//             <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#141C2F] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
//                 {/* تأثير خلفية خفيف باللون الـ Amber */}
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

//                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                     <div className="space-y-2">
//                         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[11px] font-bold border border-amber-500/20 mb-1">
//                             <Sparkles className="w-3.5 h-3.5" />
//                             النظام محدث ومؤمن بالكامل
//                         </div>
//                         <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50">
//                             أهلاً بك يا أستاذ، {user?.full_name || 'المحامي'} 👋
//                         </h2>
//                         <p className="text-slate-400 max-w-xl text-xs md:text-sm font-medium leading-relaxed">
//                             مكتبك القانوني الرقمي يعمل الآن حياً. يمكنك البدء في إدارة ملفات القضايا، مراجعة المستحقات المالية، والتحكم بالمستندات المحلية بصفر تكلفة وبأعلى معايير الأمان.
//                         </p>
//                     </div>

//                     <div className="hidden lg:flex items-center gap-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-slate-400 text-xs">
//                         <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
//                         <div>
//                             <p className="font-bold text-slate-200">تشفير محلي تام</p>
//                             <p className="text-[10px] text-slate-500 mt-0.5">الملفات والبيانات تخضع لخصوصية صارمة</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* لوحة التحكم الإحصائية الحية */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

//                 {/* كارت القضايا النشطة */}
//                 <div className="bg-white dark:bg-[#141C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/20 dark:hover:border-amber-500/20 transition-all duration-200 group">
//                     <div className="flex justify-between items-start">
//                         <div className="space-y-1">
//                             <p className="text-xs font-bold text-slate-500 dark:text-slate-400">القضايا النشطة تحت إشرافك</p>
//                             <p className="text-4xl font-black text-slate-900 dark:text-slate-50 font-mono mt-2 tracking-tight">1</p>
//                         </div>
//                         <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
//                             <Briefcase className="w-5 h-5" />
//                         </div>
//                     </div>
//                     <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
//                         <span className="text-slate-400">تحتاج إلى متابعة مستمرة</span>
//                         <span className="text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">محدث الآن</span>
//                     </div>
//                 </div>

//                 {/* كارت الموكلين */}
//                 <div className="bg-white dark:bg-[#141C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all duration-200 group">
//                     <div className="flex justify-between items-start">
//                         <div className="space-y-1">
//                             <p className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الموكلين المسجلين</p>
//                             <p className="text-4xl font-black text-slate-900 dark:text-slate-50 font-mono mt-2 tracking-tight">--</p>
//                         </div>
//                         <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
//                             <Users className="w-5 h-5" />
//                         </div>
//                     </div>
//                     <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
//                         <span className="text-slate-400">ملفات الشركات والأفراد</span>
//                         <span className="text-slate-400 italic">في انتظار البيانات</span>
//                     </div>
//                 </div>

//                 {/* كارت المستندات المؤرشفة */}
//                 <div className="bg-white dark:bg-[#141C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-200 group">
//                     <div className="flex justify-between items-start">
//                         <div className="space-y-1">
//                             <p className="text-xs font-bold text-slate-500 dark:text-slate-400">المستندات والمذكرات المؤرشفة</p>
//                             <p className="text-4xl font-black text-slate-900 dark:text-slate-50 font-mono mt-2 tracking-tight">--</p>
//                         </div>
//                         <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
//                             <FolderOpen className="w-5 h-5" />
//                         </div>
//                     </div>
//                     <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
//                         <span className="text-slate-400">صيغ مدعومة: PDF, Word, Images</span>
//                         <span className="text-slate-400 italic">ملحقات آمنة</span>
//                     </div>
//                 </div>

//             </div>

//         </div>
//     );
// }


'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { dynamicService } from '@/services/dynamicService';

import {
    BriefcaseBusiness,
    Users,
    CalendarDays,
    FileText,
    AlertTriangle,
    Clock3,
    ArrowLeft,
    RefreshCw,
    Loader2,
    ChevronLeft,
    Scale,
    CheckCircle2,
    CircleDot,
    ListTodo,
    TrendingUp,
    FolderOpen,
    ExternalLink,
    Zap,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeText = (value) => {
    return String(value ?? '')
        .trim()
        .toLowerCase();
};

const isObject = (value) => {
    return value !== null && typeof value === 'object';
};

const flattenTables = (sections = []) => {
    return sections.flatMap((section) =>
        Array.isArray(section.tables)
            ? section.tables.map((table) => ({
                ...table,
                sectionTitle: section.title || '',
                sectionId: section.id,
            }))
            : []
    );
};

const getColumns = (table) => {
    return Array.isArray(table?.columns_definition)
        ? table.columns_definition
        : [];
};

const getColumnById = (table, id) => {
    if (!id) return null;

    return getColumns(table).find(
        (column) => String(column.id) === String(id)
    );
};

const findColumnByName = (table, keywords = []) => {
    const columns = getColumns(table);

    return columns.find((column) => {
        const name = normalizeText(column.name);

        return keywords.some((keyword) =>
            name.includes(normalizeText(keyword))
        );
    });
};

const findDateColumn = (table) => {
    const columns = getColumns(table);

    // أولاً: الحقل المربوط بالتقويم
    const mappedStart =
        table?.calendar_mapping?.start_field ||
        table?.calendar_mapping?.date_field;

    if (mappedStart) {
        const mappedColumn = getColumnById(table, mappedStart);

        if (mappedColumn) {
            return mappedColumn;
        }
    }

    // ثانياً: أي حقل تاريخ
    return columns.find(
        (column) =>
            column.type === 'date' ||
            column.type === 'datetime'
    );
};

const findTitleColumn = (table) => {
    const mappedTitle = table?.calendar_mapping?.title_field;

    if (mappedTitle) {
        const column = getColumnById(table, mappedTitle);

        if (column) {
            return column;
        }
    }

    return (
        findColumnByName(table, [
            'عنوان القضية',
            'اسم القضية',
            'عنوان',
            'اسم',
            'رقم القضية',
        ]) ||
        getColumns(table)[0] ||
        null
    );
};

const findStatusColumn = (table) => {
    const mappedStatus =
        table?.calendar_mapping?.status_field;

    if (mappedStatus) {
        const mappedColumn = getColumnById(
            table,
            mappedStatus
        );

        if (mappedColumn) {
            return mappedColumn;
        }
    }

    return findColumnByName(table, [
        'حالة القضية',
        'الحالة',
        'status',
        'حالة',
    ]);
};

const isCaseTable = (table) => {
    const text = normalizeText(
        `${table?.name || ''} ${table?.sectionTitle || ''}`
    );

    return (
        text.includes('قض') ||
        text.includes('case')
    );
};

const isClientTable = (table) => {
    const text = normalizeText(
        `${table?.name || ''} ${table?.sectionTitle || ''}`
    );

    return (
        text.includes('موكل') ||
        text.includes('افراد') ||
        text.includes('أفراد') ||
        text.includes('شركات') ||
        text.includes('عميل') ||
        text.includes('client')
    );
};

const isHearingTable = (table) => {
    const text = normalizeText(
        `${table?.name || ''} ${table?.sectionTitle || ''}`
    );

    return (
        text.includes('جلس') ||
        text.includes('موعد') ||
        text.includes('calendar') ||
        table?.calendar_mapping?.enabled === true
    );
};

const isTaskTable = (table) => {
    const text = normalizeText(
        `${table?.name || ''} ${table?.sectionTitle || ''}`
    );

    return (
        text.includes('مهم') ||
        text.includes('task')
    );
};

const isAttachmentValue = (value) => {
    if (!value) return false;

    if (typeof value === 'string') {
        return (
            value.includes('/download/') ||
            value.startsWith('http') ||
            value.toLowerCase().includes('.pdf') ||
            value.toLowerCase().includes('.doc') ||
            value.toLowerCase().includes('.jpg') ||
            value.toLowerCase().includes('.png')
        );
    }

    if (Array.isArray(value)) {
        return value.some((item) =>
            isAttachmentValue(item)
        );
    }

    if (isObject(value)) {
        return (
            isAttachmentValue(value.url) ||
            isAttachmentValue(value.fileUrl) ||
            isAttachmentValue(value.filePath) ||
            isAttachmentValue(value.path)
        );
    }

    return false;
};

const countAttachments = (rows = []) => {
    let total = 0;

    rows.forEach((row) => {
        Object.values(row?.cells_data || {}).forEach(
            (value) => {
                if (isAttachmentValue(value)) {
                    total += 1;
                }
            }
        );
    });

    return total;
};

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const toLocalDateKey = (value) => {
    if (!value) return null;

    // YYYY-MM-DD
    if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
        date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getTodayKey = () => {
    return toLocalDateKey(new Date());
};

const addDays = (dateKey, amount) => {
    const date = new Date(`${dateKey}T12:00:00`);

    date.setDate(date.getDate() + amount);

    return toLocalDateKey(date);
};

const isToday = (value) => {
    return (
        toLocalDateKey(value) ===
        getTodayKey()
    );
};

const isWithinNextDays = (
    value,
    days = 7
) => {
    const dateKey = toLocalDateKey(value);

    if (!dateKey) return false;

    const today = getTodayKey();
    const end = addDays(today, days);

    return (
        dateKey >= today &&
        dateKey <= end
    );
};

const formatArabicDate = (value) => {
    if (!value) return 'غير محدد';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat(
        'ar-SA',
        {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }
    ).format(date);
};

const formatTime = (value) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat(
        'ar-SA',
        {
            hour: '2-digit',
            minute: '2-digit',
        }
    ).format(date);
};

/*
|--------------------------------------------------------------------------
| Accent Color
|--------------------------------------------------------------------------
|
| يدعم أكثر من اسم CSS variable حتى يتوافق
| مع نظام الألوان الموجود في المشروع.
|--------------------------------------------------------------------------
*/

const getAccentColor = () => {
    if (typeof window === 'undefined') {
        return '#f59e0b';
    }

    const styles =
        getComputedStyle(
            document.documentElement
        );

    const possibleVariables = [
        '--primary-color',
        '--accent-color',
        '--theme-color',
        '--color-primary',
        '--accent',
        '--primary',
    ];

    for (const variable of possibleVariables) {
        const value =
            styles
                .getPropertyValue(variable)
                .trim();

        if (value) {
            return value;
        }
    }

    return '#f59e0b';
};

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    accent,
    href,
    danger = false,
}) {
    const content = (
        <div className="
            group
            h-full
            min-w-0
            rounded-2xl
            border
            border-border
            bg-card
            p-4
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
        ">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="
                        truncate
                        text-[10px]
                        font-bold
                        text-muted-foreground
                    ">
                        {title}
                    </p>

                    <p className="
                        mt-2
                        text-2xl
                        font-black
                        tracking-tight
                        text-foreground
                        sm:text-3xl
                    ">
                        {value}
                    </p>

                    <p className={`
                        mt-1.5
                        truncate
                        text-[9px]
                        font-medium
                        ${danger
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        }
                    `}>
                        {subtitle}
                    </p>
                </div>

                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        transition-transform
                        duration-200
                        group-hover:scale-105
                    "
                    style={{
                        backgroundColor: danger
                            ? 'rgb(239 68 68 / 0.10)'
                            : `${accent}12`,
                        color: danger
                            ? '#ef4444'
                            : accent,
                    }}
                >
                    <Icon className="h-4.5 w-4.5" />
                </div>
            </div>
        </div>
    );

    if (!href) {
        return content;
    }

    return (
        <Link
            href={href}
            className="block h-full min-w-0"
        >
            {content}
        </Link>
    );
}
/*
|--------------------------------------------------------------------------
| Mini Today Stat
|--------------------------------------------------------------------------
*/

function MiniTodayStat({
    label,
    value,
    icon: Icon,
    accent,
    danger = false,
}) {
    return (
        <div
            className="
                min-w-0
                rounded-xl
                border
                border-border
                bg-background/60
                p-3
                transition-all
                duration-200
                hover:bg-muted/40
            "
        >
            <div className="flex items-center gap-2">
                <div
                    className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                    "
                    style={{
                        backgroundColor: danger
                            ? 'rgb(239 68 68 / 0.10)'
                            : `${accent}12`,
                        color: danger
                            ? '#ef4444'
                            : accent,
                    }}
                >
                    <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0">
                    <p className="truncate text-[9px] font-bold text-muted-foreground">
                        {label}
                    </p>

                    <p className="mt-0.5 text-base font-black text-foreground">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Dashboard Section Header
|--------------------------------------------------------------------------
*/

function DashboardSectionHeader({
    title,
    subtitle,
    icon: Icon,
    accent,
    count,
    action,
}) {
    return (
        <div className="
            flex
            min-w-0
            items-center
            justify-between
            gap-3
            border-b
            border-border
            px-5
            py-4
        ">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                    "
                    style={{
                        backgroundColor: `${accent}12`,
                        color: accent,
                    }}
                >
                    <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-xs font-black text-foreground">
                            {title}
                        </h3>

                        {typeof count === 'number' && (
                            <span
                                className="
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-md
                                    px-1.5
                                    text-[9px]
                                    font-black
                                "
                                style={{
                                    backgroundColor: `${accent}12`,
                                    color: accent,
                                }}
                            >
                                {count}
                            </span>
                        )}
                    </div>

                    {subtitle && (
                        <p className="
                            mt-1
                            truncate
                            text-[9px]
                            font-medium
                            text-muted-foreground
                        ">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="
            flex
            min-h-[150px]
            flex-col
            items-center
            justify-center
            px-5
            py-8
            text-center
        ">
            <div className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-muted
                text-muted-foreground
            ">
                <Icon className="h-5 w-5" />
            </div>

            <p className="
                mt-3
                text-xs
                font-black
                text-foreground
            ">
                {title}
            </p>

            <p className="
                mt-1
                max-w-sm
                text-[10px]
                leading-5
                text-muted-foreground
            ">
                {description}
            </p>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Quick Action
|--------------------------------------------------------------------------
*/

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
    accent,
}) {
    return (
        <Link
            href={href}
            className="
                group
                min-w-0
                rounded-xl
                border
                border-border
                bg-background/50
                p-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-muted/40
            "
        >
            <div className="flex items-center gap-2.5">
                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        transition-transform
                        duration-200
                        group-hover:scale-105
                    "
                    style={{
                        backgroundColor: `${accent}12`,
                        color: accent,
                    }}
                >
                    <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <p className="
                        truncate
                        text-[10px]
                        font-black
                        text-foreground
                    ">
                        {title}
                    </p>

                    <p className="
                        mt-0.5
                        truncate
                        text-[9px]
                        text-muted-foreground
                    ">
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    );
}


/*
|--------------------------------------------------------------------------
| Main Dashboard
|--------------------------------------------------------------------------
*/

export default function DashboardPage() {
    const { user, loading: authLoading } =
        useAuth();

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');

    const [accentColor, setAccentColor] =
        useState('#f59e0b');

    const [sections, setSections] =
        useState([]);

    const [tables, setTables] =
        useState([]);

    const [tableRows, setTableRows] =
        useState({});

    /*
    |--------------------------------------------------------------------------
    | Detect current theme color
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const updateAccent = () => {
            setAccentColor(
                getAccentColor()
            );
        };

        updateAccent();

        const observer =
            new MutationObserver(
                updateAccent
            );

        observer.observe(
            document.documentElement,
            {
                attributes: true,
                attributeFilter: [
                    'class',
                    'style',
                ],
            }
        );

        window.addEventListener(
            'storage',
            updateAccent
        );

        return () => {
            observer.disconnect();

            window.removeEventListener(
                'storage',
                updateAccent
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load Dynamic Data
    |--------------------------------------------------------------------------
    */

    const loadDashboardData = async (
        isRefresh = false
    ) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const sectionsData =
                await dynamicService.getSections();

            const safeSections =
                Array.isArray(sectionsData)
                    ? sectionsData
                    : [];

            const safeTables =
                flattenTables(
                    safeSections
                );

            setSections(
                safeSections
            );

            setTables(
                safeTables
            );

            /*
             * جلب سجلات كل الجداول المتاحة
             *
             * getSections في النظام يعيد الجداول
             * المسموح للمستخدم برؤيتها.
             */
            const results =
                await Promise.allSettled(
                    safeTables.map(
                        async (table) => {
                            const rows =
                                await dynamicService.getRowsByTable(
                                    table.id
                                );

                            return {
                                tableId:
                                    table.id,
                                rows:
                                    Array.isArray(
                                        rows
                                    )
                                        ? rows
                                        : [],
                            };
                        }
                    )
                );

            const rowsMap = {};

            results.forEach(
                (result) => {
                    if (
                        result.status ===
                        'fulfilled'
                    ) {
                        rowsMap[
                            result.value.tableId
                        ] =
                            result.value.rows;
                    }
                }
            );

            setTableRows(
                rowsMap
            );

        } catch (err) {
            console.error(
                'Dashboard loading error:',
                err
            );

            setError(
                'تعذر تحميل بيانات لوحة التحكم من قاعدة البيانات.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (
            authLoading ||
            !user
        ) {
            return;
        }

        loadDashboardData();
    }, [
        authLoading,
        user,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Dashboard Calculations
    |--------------------------------------------------------------------------
    */

    const dashboardData =
        useMemo(() => {

            const caseTables =
                tables.filter(
                    isCaseTable
                );

            const clientTables =
                tables.filter(
                    isClientTable
                );

            const hearingTables =
                tables.filter(
                    isHearingTable
                );

            const taskTables =
                tables.filter(
                    isTaskTable
                );

            /*
            |--------------------------------------------------------------------------
            | Cases
            |--------------------------------------------------------------------------
            */

            const caseRows =
                caseTables.flatMap(
                    (table) =>
                        (
                            tableRows[
                            table.id
                            ] || []
                        ).map(
                            (row) => ({
                                ...row,
                                __table:
                                    table,
                            })
                        )
                );

            let activeCases = 0;
            let closedCases = 0;
            let casesNeedingAttention = 0;

            caseRows.forEach(
                (row) => {

                    const statusColumn =
                        findStatusColumn(
                            row.__table
                        );

                    const status =
                        statusColumn
                            ? normalizeText(
                                row
                                    .cells_data?.[
                                statusColumn
                                    .id
                                ]
                            )
                            : '';

                    const closed =
                        [
                            'منتهية',
                            'منتهي',
                            'مغلقة',
                            'مغلق',
                            'مكتملة',
                            'مكتمل',
                            'ملغاة',
                            'ملغي',
                            'closed',
                            'completed',
                            'cancelled',
                        ].some(
                            (value) =>
                                status.includes(
                                    value
                                )
                        );

                    if (closed) {
                        closedCases++;
                    } else {
                        activeCases++;
                    }

                    const urgent =
                        [
                            'متأخر',
                            'متأخرة',
                            'عاجل',
                            'عاجلة',
                            'مهم',
                            'حرج',
                        ].some(
                            (value) =>
                                status.includes(
                                    value
                                )
                        );

                    if (urgent) {
                        casesNeedingAttention++;
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Clients
            |--------------------------------------------------------------------------
            */

            const clientRows =
                clientTables.flatMap(
                    (table) =>
                        tableRows[
                        table.id
                        ] || []
                );

            /*
            |--------------------------------------------------------------------------
            | Hearings
            |--------------------------------------------------------------------------
            */

            const hearingRows =
                hearingTables.flatMap(
                    (table) => {

                        const dateColumn =
                            findDateColumn(
                                table
                            );

                        const titleColumn =
                            findTitleColumn(
                                table
                            );

                        if (!dateColumn) {
                            return [];
                        }

                        return (
                            tableRows[
                            table.id
                            ] || []
                        )
                            .map(
                                (row) => {

                                    const value =
                                        row
                                            .cells_data?.[
                                        dateColumn
                                            .id
                                        ];

                                    return {
                                        ...row,
                                        __table:
                                            table,
                                        __date:
                                            value,
                                        __title:
                                            titleColumn
                                                ? row
                                                    .cells_data?.[
                                                titleColumn
                                                    .id
                                                ]
                                                : table.name,
                                    };
                                }
                            )
                            .filter(
                                (row) =>
                                    row.__date
                            );
                    }
                );

            const todayHearings =
                hearingRows
                    .filter(
                        (row) =>
                            isToday(
                                row.__date
                            )
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                a.__date
                            ) -
                            new Date(
                                b.__date
                            )
                    );

            const upcomingHearings =
                hearingRows
                    .filter(
                        (row) =>
                            isWithinNextDays(
                                row.__date,
                                7
                            )
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                a.__date
                            ) -
                            new Date(
                                b.__date
                            )
                    );

            /*
            |--------------------------------------------------------------------------
            | Tasks
            |--------------------------------------------------------------------------
            */

            const taskRows =
                taskTables.flatMap(
                    (table) => {

                        const dateColumn =
                            findDateColumn(
                                table
                            );

                        if (!dateColumn) {
                            return [];
                        }

                        return (
                            tableRows[
                            table.id
                            ] || []
                        )
                            .map(
                                (row) => ({
                                    ...row,
                                    __table:
                                        table,
                                    __date:
                                        row
                                            .cells_data?.[
                                        dateColumn
                                            .id
                                        ],
                                })
                            )
                            .filter(
                                (row) =>
                                    row.__date
                            );
                    }
                );

            const todayTasks =
                taskRows.filter(
                    (row) =>
                        isToday(
                            row.__date
                        )
                );

            /*
            |--------------------------------------------------------------------------
            | Documents
            |--------------------------------------------------------------------------
            */

            const allRows =
                Object.values(
                    tableRows
                ).flat();

            const documentsCount =
                countAttachments(
                    allRows
                );

            /*
            |--------------------------------------------------------------------------
            | Case status distribution
            |--------------------------------------------------------------------------
            */

            const statusDistribution =
                {};

            caseRows.forEach(
                (row) => {

                    const statusColumn =
                        findStatusColumn(
                            row.__table
                        );

                    const status =
                        statusColumn
                            ? row
                                .cells_data?.[
                            statusColumn
                                .id
                            ]
                            : null;

                    const label =
                        status ||
                        'غير محددة';

                    statusDistribution[
                        label
                    ] =
                        (
                            statusDistribution[
                            label
                            ] || 0
                        ) + 1;
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Recent Cases
            |--------------------------------------------------------------------------
            */

            const recentCases =
                [...caseRows]
                    .sort(
                        (a, b) => {

                            const aDate =
                                a.created_at
                                    ? new Date(
                                        a.created_at
                                    ).getTime()
                                    : a.id;

                            const bDate =
                                b.created_at
                                    ? new Date(
                                        b.created_at
                                    ).getTime()
                                    : b.id;

                            return (
                                bDate -
                                aDate
                            );
                        }
                    )
                    .slice(0, 5);

            return {
                caseRows,
                activeCases,
                closedCases,
                casesNeedingAttention,

                clientRows,

                hearingRows,
                todayHearings,
                upcomingHearings,

                todayTasks,

                documentsCount,

                statusDistribution,

                recentCases,
            };

        }, [
            tables,
            tableRows,
        ]);

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    if (
        authLoading ||
        loading
    ) {
        return (
            <div
                dir="rtl"
                className="
        min-h-screen
        w-full
        min-w-0
        overflow-x-hidden
        bg-background
        text-foreground
    "
            >
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري تحميل لوحة التحكم...
                </div>
            </div>
        );
    }

    // if (authLoading || loading) {
    //     return (
    //         <div
    //             dir="rtl"
    //             className="
    //             min-h-screen
    //             w-full
    //             min-w-0
    //             overflow-x-hidden
    //             bg-background
    //             text-foreground
    //             flex
    //             items-center
    //             justify-center
    //         "
    //         >
    //             <div className="flex items-center gap-3 text-sm text-muted-foreground">
    //                 <Loader2 className="h-5 w-5 animate-spin" />
    //                 جاري تحميل لوحة التحكم...
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <main
            className="min-h-screen mr-64 transition-colors duration-300"
            style={{
                backgroundColor:
                    'var(--mktabi-page-background, #F8FAFC)',
            }}
            dir="rtl"
        >
            <div className="mx-auto w-full max-w-[1600px] px-6 py-7 lg:px-8">

                {/* ========================================================= */}
                {/* HEADER */}
                {/* ========================================================= */}

                <header className="mb-7">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex min-w-0 items-center gap-4">

                            {/* Icon */}

                            <div
                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                                style={{
                                    backgroundColor: accentColor,
                                    boxShadow: `0 10px 25px ${accentColor}30`,
                                }}
                            >
                                <Scale className="h-7 w-7" />
                            </div>

                            {/* Title */}

                            <div className="min-w-0">

                                <p
                                    className="mb-1 text-[11px] font-black"
                                    style={{ color: accentColor }}
                                >
                                    لوحة التحكم
                                </p>

                                <h1 className="truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    أهلاً بك، {user?.full_name || 'المحامي'}
                                </h1>

                                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
                                    نظرة سريعة على القضايا والجلسات والمهام والموكلين.
                                </p>

                            </div>

                        </div>


                        {/* Header Actions */}

                        <div className="flex w-full items-center gap-3 lg:w-auto">

                            <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:block">

                                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                                    اليوم
                                </p>

                                <p className="mt-1 text-xs font-black text-slate-800 dark:text-white">
                                    {formatArabicDate(new Date())}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() => loadDashboardData(true)}
                                disabled={refreshing}
                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 lg:flex-none"
                                style={{
                                    backgroundColor: accentColor,
                                    boxShadow: `0 8px 20px ${accentColor}25`,
                                }}
                            >

                                <RefreshCw
                                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''
                                        }`}
                                />

                                تحديث البيانات

                            </button>

                        </div>

                    </div>

                </header>


                {/* ========================================================= */}
                {/* ERROR */}
                {/* ========================================================= */}

                {error && (

                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-950/20">

                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

                        <div>

                            <p className="text-xs font-black text-red-800 dark:text-red-300">
                                حدث خطأ
                            </p>

                            <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-400">
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* ========================================================= */}
                {/* TODAY OVERVIEW */}
                {/* ========================================================= */}

                <section
                    className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >

                    {/* Accent background */}

                    <div
                        className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full blur-3xl"
                        style={{
                            backgroundColor: `${accentColor}12`,
                        }}
                    />

                    <div className="relative grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-7">

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor: accentColor,
                                    }}
                                />

                                <span
                                    className="text-[11px] font-black"
                                    style={{
                                        color: accentColor,
                                    }}
                                >
                                    ملخص اليوم
                                </span>

                            </div>


                            <h2 className="text-xl font-black text-slate-900 dark:text-white">

                                لديك{' '}

                                <span style={{ color: accentColor }}>
                                    {dashboardData.todayHearings.length}
                                </span>

                                {' '}جلسة اليوم

                            </h2>


                            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500 dark:text-zinc-400">

                                راجع مواعيد الجلسات والمهام والقضايا التي تحتاج إلى
                                متابعة قبل بدء أعمالك اليومية.

                            </p>

                        </div>


                        {/* Today Statistics */}

                        <div className="grid grid-cols-3 gap-3 lg:min-w-[390px]">

                            <MiniTodayStat
                                label="جلسات اليوم"
                                value={dashboardData.todayHearings.length}
                                icon={CalendarDays}
                                accent={accentColor}
                            />

                            <MiniTodayStat
                                label="مهام اليوم"
                                value={dashboardData.todayTasks.length}
                                icon={ListTodo}
                                accent={accentColor}
                            />

                            <MiniTodayStat
                                label="تحتاج متابعة"
                                value={dashboardData.casesNeedingAttention}
                                icon={AlertTriangle}
                                accent={accentColor}
                                danger={
                                    dashboardData.casesNeedingAttention > 0
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* ========================================================= */}
                {/* MAIN STATISTICS */}
                {/* ========================================================= */}

                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                    <StatCard
                        title="القضايا النشطة"
                        value={dashboardData.activeCases}
                        subtitle={`إجمالي القضايا: ${dashboardData.caseRows.length}`}
                        icon={BriefcaseBusiness}
                        accent={accentColor}
                        href="/dashboard/cases"
                    />

                    <StatCard
                        title="جلسات اليوم"
                        value={dashboardData.todayHearings.length}
                        subtitle="الجلسات المسجلة اليوم"
                        icon={CalendarDays}
                        accent={accentColor}
                    />

                    <StatCard
                        title="الموكلون"
                        value={dashboardData.clientRows.length}
                        subtitle="الأفراد والشركات"
                        icon={Users}
                        accent={accentColor}
                        href="/dashboard/clients"
                    />

                    <StatCard
                        title="المستندات"
                        value={dashboardData.documentsCount}
                        subtitle="المرفقات المكتشفة"
                        icon={FileText}
                        accent={accentColor}
                    />

                    <StatCard
                        title="تحتاج متابعة"
                        value={dashboardData.casesNeedingAttention}
                        subtitle="قضايا تحتاج إلى إجراء"
                        icon={AlertTriangle}
                        accent={accentColor}
                        danger={
                            dashboardData.casesNeedingAttention > 0
                        }
                    />

                </section>


                {/* ========================================================= */}
                {/* HEARINGS + CASE STATUS */}
                {/* ========================================================= */}

                <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">

                    {/* ===================================================== */}
                    {/* TODAY HEARINGS */}
                    {/* ===================================================== */}

                    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 xl:col-span-2">

                        <DashboardSectionHeader
                            title="جلسات اليوم"
                            subtitle="الجلسات التي تحتاج انتباهك اليوم"
                            icon={CalendarDays}
                            accent={accentColor}
                            count={dashboardData.todayHearings.length}
                        />

                        <div className="divide-y divide-slate-100 dark:divide-zinc-800">

                            {dashboardData.todayHearings.length === 0 ? (

                                <EmptyState
                                    icon={CalendarDays}
                                    title="لا توجد جلسات اليوم"
                                    description="لم يتم العثور على جلسات مسجلة بتاريخ اليوم."
                                />

                            ) : (

                                dashboardData.todayHearings
                                    .slice(0, 7)
                                    .map((hearing) => {

                                        const table = hearing.__table;

                                        return (

                                            <div
                                                key={`${table.id}-${hearing.id}`}
                                                className="flex min-w-0 items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                            >

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                        style={{
                                                            backgroundColor: `${accentColor}12`,
                                                            color: accentColor,
                                                        }}
                                                    >
                                                        <CalendarDays className="h-4 w-4" />
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-xs font-black text-slate-800 dark:text-white">
                                                            {hearing.__title || table.name}
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500">

                                                            <span>
                                                                {table.name}
                                                            </span>

                                                            <span>•</span>

                                                            <span>
                                                                {formatTime(
                                                                    hearing.__date
                                                                )}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>


                                                <Link
                                                    href={`/dashboard/dynamic/${table.sectionId}?table=${table.id}`}
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Link>

                                            </div>

                                        );

                                    })

                            )}

                        </div>


                        {dashboardData.todayHearings.length > 7 && (

                            <div className="border-t border-slate-100 px-6 py-3 text-center dark:border-zinc-800">

                                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">

                                    يوجد{' '}
                                    {dashboardData.todayHearings.length - 7}
                                    {' '}
                                    جلسات أخرى اليوم

                                </span>

                            </div>

                        )}

                    </div>


                    {/* ===================================================== */}
                    {/* CASE STATUS */}
                    {/* ===================================================== */}

                    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                        <DashboardSectionHeader
                            title="حالة القضايا"
                            subtitle="توزيع القضايا حسب الحالة"
                            icon={BriefcaseBusiness}
                            accent={accentColor}
                        />

                        <div className="space-y-5 p-6">

                            {Object.keys(
                                dashboardData.statusDistribution
                            ).length === 0 ? (

                                <EmptyState
                                    icon={BriefcaseBusiness}
                                    title="لا توجد بيانات"
                                    description="لا توجد حالات مسجلة للقضايا."
                                />

                            ) : (

                                Object.entries(
                                    dashboardData.statusDistribution
                                )
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 7)
                                    .map(([status, count], index) => {

                                        const total =
                                            dashboardData.caseRows.length || 1;

                                        const percentage =
                                            Math.round(
                                                (count / total) * 100
                                            );

                                        return (

                                            <div key={status}>

                                                <div className="mb-2 flex items-center justify-between gap-3">

                                                    <div className="flex min-w-0 items-center gap-2">

                                                        <span
                                                            className="h-2 w-2 shrink-0 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    index === 0
                                                                        ? accentColor
                                                                        : '#CBD5E1',
                                                            }}
                                                        />

                                                        <span className="truncate text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                                                            {status}
                                                        </span>

                                                    </div>

                                                    <span className="shrink-0 text-[10px] font-black text-slate-400 dark:text-zinc-500">
                                                        {count}
                                                    </span>

                                                </div>


                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">

                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor:
                                                                index === 0
                                                                    ? accentColor
                                                                    : `${accentColor}55`,
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    })

                            )}

                        </div>

                    </div>

                </section>


                {/* ========================================================= */}
                {/* UPCOMING + QUICK ACTIONS */}
                {/* ========================================================= */}

                <section className="mt-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">

                    {/* ===================================================== */}
                    {/* UPCOMING HEARINGS */}
                    {/* ===================================================== */}

                    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">

                        <DashboardSectionHeader
                            title="الجلسات القادمة"
                            subtitle="الجلسات خلال الأيام السبعة القادمة"
                            icon={Clock3}
                            accent={accentColor}
                        />

                        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">

                            {dashboardData.upcomingHearings
                                .slice(0, 6)
                                .map((hearing) => {

                                    const table = hearing.__table;

                                    return (

                                        <Link
                                            key={`${table.id}-${hearing.id}`}
                                            href={`/dashboard/dynamic/${table.sectionId}?table=${table.id}`}
                                            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                                        >

                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                style={{
                                                    backgroundColor: `${accentColor}12`,
                                                    color: accentColor,
                                                }}
                                            >
                                                <CalendarDays className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-[11px] font-black text-slate-800 dark:text-white">
                                                    {hearing.__title || table.name}
                                                </p>

                                                <p className="mt-1 truncate text-[10px] text-slate-400 dark:text-zinc-500">
                                                    {formatArabicDate(hearing.__date)}
                                                </p>

                                            </div>

                                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />

                                        </Link>

                                    );

                                })}


                            {dashboardData.upcomingHearings.length === 0 && (

                                <div className="col-span-full">

                                    <EmptyState
                                        icon={CalendarDays}
                                        title="لا توجد جلسات قادمة"
                                        description="لا توجد جلسات مسجلة خلال الأيام القادمة."
                                    />

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ===================================================== */}
                    {/* QUICK ACTIONS */}
                    {/* ===================================================== */}

                    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                        <DashboardSectionHeader
                            title="الوصول السريع"
                            subtitle="الأقسام الأكثر استخداماً"
                            icon={Zap}
                            accent={accentColor}
                        />


                        <div className="grid grid-cols-2 gap-3 p-6">

                            <QuickAction
                                href="/dashboard/cases"
                                icon={BriefcaseBusiness}
                                title="القضايا"
                                description="إدارة القضايا"
                                accent={accentColor}
                            />

                            <QuickAction
                                href="/dashboard/clients"
                                icon={Users}
                                title="الموكلون"
                                description="ملفات الموكلين"
                                accent={accentColor}
                            />

                            <QuickAction
                                href="/dashboard/tasks"
                                icon={ListTodo}
                                title="المهام"
                                description="مهام المكتب"
                                accent={accentColor}
                            />

                            <QuickAction
                                href="/dashboard/analytics"
                                icon={TrendingUp}
                                title="التقارير"
                                description="إحصائيات المكتب"
                                accent={accentColor}
                            />

                        </div>


                        {/* Tasks */}

                        <div className="border-t border-slate-100 px-6 py-5 dark:border-zinc-800">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-[10px] font-black text-slate-800 dark:text-white">
                                        مهام اليوم
                                    </p>

                                    <p className="mt-1 text-[9px] text-slate-400 dark:text-zinc-500">
                                        المهام المسجلة لليوم
                                    </p>

                                </div>


                                <span
                                    className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-black"
                                    style={{
                                        backgroundColor: `${accentColor}12`,
                                        color: accentColor,
                                    }}
                                >
                                    {dashboardData.todayTasks.length}
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ========================================================= */}
                {/* RECENT CASES */}
                {/* ========================================================= */}

                <section className="mt-5 min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    <DashboardSectionHeader
                        title="آخر القضايا"
                        subtitle="أحدث القضايا الموجودة في النظام"
                        icon={BriefcaseBusiness}
                        accent={accentColor}
                        action={
                            <Link
                                href="/dashboard/cases"
                                className="inline-flex items-center gap-1 text-[10px] font-black transition-opacity hover:opacity-70"
                                style={{
                                    color: accentColor,
                                }}
                            >
                                عرض الكل
                                <ArrowLeft className="h-3 w-3" />
                            </Link>
                        }
                    />


                    <div className="w-full overflow-x-auto">

                        <table className="w-full min-w-[720px] border-collapse text-right">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/50">

                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-zinc-400">
                                        القضية
                                    </th>

                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-zinc-400">
                                        المحكمة
                                    </th>

                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-zinc-400">
                                        الحالة
                                    </th>

                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-zinc-400">
                                        الجدول
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboardData.recentCases.map((row) => {

                                    const table = row.__table;

                                    const numberColumn =
                                        findColumnByName(
                                            table,
                                            [
                                                'رقم القضية',
                                                'رقم',
                                            ]
                                        );

                                    const courtColumn =
                                        findColumnByName(
                                            table,
                                            [
                                                'المحكمة',
                                            ]
                                        );

                                    const statusColumn =
                                        findStatusColumn(table);

                                    return (

                                        <tr
                                            key={`${table.id}-${row.id}`}
                                            className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                                        >

                                            <td className="px-6 py-4">

                                                <span className="text-xs font-black text-slate-800 dark:text-white">

                                                    {row.cells_data?.[
                                                        numberColumn?.id
                                                    ] ||
                                                        row.cells_data?.[
                                                        getColumns(table)[0]?.id
                                                        ] ||
                                                        `سجل #${row.id}`}

                                                </span>

                                            </td>


                                            <td className="px-6 py-4">

                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">

                                                    {row.cells_data?.[
                                                        courtColumn?.id
                                                    ] || '-'}

                                                </span>

                                            </td>


                                            <td className="px-6 py-4">

                                                <span
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold"
                                                    style={{
                                                        backgroundColor: `${accentColor}12`,
                                                        color: accentColor,
                                                    }}
                                                >

                                                    <CheckCircle2 className="h-3 w-3" />

                                                    {row.cells_data?.[
                                                        statusColumn?.id
                                                    ] || 'غير محددة'}

                                                </span>

                                            </td>


                                            <td className="px-6 py-4">

                                                <Link
                                                    href={`/dashboard/dynamic/${table.sectionId}?table=${table.id}`}
                                                    className="text-[10px] font-bold text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                                                >
                                                    {table.name}
                                                </Link>

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>


                        {dashboardData.recentCases.length === 0 && (

                            <EmptyState
                                icon={BriefcaseBusiness}
                                title="لا توجد قضايا حتى الآن"
                                description="لم يتم العثور على سجلات قضايا في الجداول المتاحة."
                            />

                        )}

                    </div>

                </section>


                {/* ========================================================= */}
                {/* FOOTER */}
                {/* ========================================================= */}

                <footer className="flex flex-col items-center justify-between gap-2 py-7 text-[9px] font-medium text-slate-400 dark:text-zinc-500 sm:flex-row">

                    <span>
                        البيانات المعروضة مأخوذة مباشرة من قاعدة بيانات النظام.
                    </span>

                    <span>
                        {tables.length} جدول متاح للمستخدم
                    </span>

                </footer>

            </div>
        </main>
    );
}