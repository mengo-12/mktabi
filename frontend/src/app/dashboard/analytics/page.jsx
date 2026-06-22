// 'use client';
// import { useEffect, useState } from 'react';

// export default function AnalyticsPage() {
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
        
//         fetch('http://localhost:8000/api/v1/analytics/summary', {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//         .then((res) => {
//             if (!res.ok) throw new Error('غير مصرح لك بالوصول أو حدث خطأ في السيرفر.');
//             return res.json();
//         })
//         .then((data) => {
//             setData(data);
//             setLoading(false);
//         })
//         .catch((err) => {
//             setError(err.message);
//             setLoading(false);
//         });
//     }, []);

//     if (loading) return <div className="text-center py-10 dark:text-slate-400">جاري تحميل التقارير المالية والقانونية...</div>;
//     if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl text-center">{error}</div>;

//     return (
//         <div className="space-y-8" dir="rtl">
//             <div>
//                 <h1 className="text-2xl font-bold text-slate-800 dark:text-white">قسم الإحصائيات وتقارير الأداء</h1>
//                 <p className="text-sm text-slate-500 mt-1">نظرة عامة على المؤشرات المالية والقانونية للمكتب</p>
//             </div>

//             {/* 💰 المؤشرات المالية */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
//                     <span className="text-2xl">💰</span>
//                     <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-2">التدفقات النقدية الداخلة</h3>
//                     <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
//                         {data?.financial_metrics?.total_cash_in?.toLocaleString()} ر.س
//                     </p>
//                 </div>

//                 <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
//                     <span className="text-2xl">⏳</span>
//                     <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-2">المستحقات المعلقة (الديون)</h3>
//                     <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
//                         {data?.financial_metrics?.pending_receivables?.toLocaleString()} ر.س
//                     </p>
//                 </div>

//                 <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
//                     <span className="text-2xl">📈</span>
//                     <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mt-2">الأتعاب المتوقعة الإجمالية</h3>
//                     <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">
//                         {data?.financial_metrics?.total_revenue_expected?.toLocaleString()} ر.س
//                     </p>
//                 </div>
//             </div>

//             {/* ⚖️ المؤشرات القانونية */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center">
//                     <div>
//                         <h4 className="text-sm font-medium text-slate-500">القضايا المتداولة والنشطة حالياً</h4>
//                         <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{data?.legal_metrics?.active_cases}</p>
//                     </div>
//                     <span className="text-3xl bg-blue-50 dark:bg-slate-700 p-3 rounded-xl">💼</span>
//                 </div>

//                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center">
//                     <div>
//                         <h4 className="text-sm font-medium text-slate-500">القضايا المغلقة والمحسومة</h4>
//                         <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{data?.legal_metrics?.closed_cases}</p>
//                     </div>
//                     <span className="text-3xl bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">🔒</span>
//                 </div>
//             </div>

//             {/* 🧑‍⚖️ جدول كفاءة وأداء المحامين */}
//             <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
//                 <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
//                     <h3 className="font-bold text-slate-800 dark:text-white">مؤشرات إنتاجية وتوزيع عمل المحامين</h3>
//                 </div>
//                 <table className="w-full text-right border-collapse">
//                     <thead>
//                         <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-bold">
//                             <th className="px-6 py-3">اسم المحامي المستشار</th>
//                             <th className="px-6 py-3">عدد القضايا النشطة المسندة</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
//                         {data?.lawyers_performance?.map((lawyer, idx) => (
//                             <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/20">
//                                 <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{lawyer.lawyer_name}</td>
//                                 <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
//                                     <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
//                                         {lawyer.cases_count} قضية
//                                     </span>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }



'use client';

import { useEffect, useState } from 'react';
import { 
    TrendingUp, Calendar, Users, Briefcase, Lock, DollarSign, 
    ShieldAlert, RefreshCw, BarChart3, ArrowUpRight, PieChart 
} from 'lucide-react';

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        fetch('http://localhost:8000/api/v1/analytics/summary', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then((res) => {
            if (!res.ok) throw new Error('غير مصرح لك بالوصول أو حدث خطأ أثناء الاتصال بالخادم الرئيسي.');
            return res.json();
        })
        .then((data) => {
            setData(data);
            setLoading(false);
        })
        .catch((err) => {
            setError(err.message);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    // ─── شاشة التحميل الفاخرة المكونة من Skeleton مخصص للتقارير ───
    if (loading) {
        return (
            <div className="space-y-8 animate-pulse text-right" dir="rtl">
                <div className="space-y-3">
                    <div className="h-6 bg-slate-800 rounded-md w-1/4"></div>
                    <div className="h-4 bg-slate-850 rounded-md w-1/3"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-32 bg-slate-900 rounded-2xl border border-slate-800/60 p-6 space-y-4">
                            <div className="w-8 h-8 bg-slate-850 rounded-lg"></div>
                            <div className="h-4 bg-slate-850 rounded w-1/2"></div>
                            <div className="h-6 bg-slate-850 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
                <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800/60"></div>
            </div>
        );
    }

    // ─── نافذة الأخطاء المحدثة ───
    if (error) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-5 my-12 text-right" dir="rtl">
                <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <ShieldAlert size={32} />
                </div>
                <p className="text-slate-200 font-bold text-base">{error}</p>
                <button onClick={fetchAnalytics} className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all border border-slate-800 mx-auto">
                    <RefreshCw size={14} className="text-amber-500" />
                    <span>إعادة محاولة الاتصال</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">
            
            {/* ─── الهيدر الرئيسي للمؤشرات ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
                        <BarChart3 className="text-amber-500" size={24} />
                        <span>منصة الإحصائيات وتقارير الأداء الفني</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">قراءة حية متكاملة وتحليل ذكي للمؤشرات القانونية والمالية للمكتب.</p>
                </div>
                <button onClick={fetchAnalytics} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all">
                    <RefreshCw size={13} className="text-amber-500" />
                    <span>تحديث البيانات المباشرة</span>
                </button>
            </div>

            {/* ─── 💰 أولاً: قسم التدفقات والمؤشرات المالية الفاخرة ─── */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 uppercase flex items-center gap-2">
                    <PieChart size={14} className="text-amber-500" /> التحليل المالي والتدفقات النقدية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* التدفقات النقدية الداخلة */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-br-full -translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center justify-between">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                                <TrendingUp size={18} />
                            </div>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded font-bold">مُحصل فعلي</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-400 mt-4">التدفقات النقدية الداخلة</h4>
                        <p className="text-2xl font-black text-white mt-1.5 tracking-tight">
                            {data?.financial_metrics?.total_cash_in?.toLocaleString()} <span className="text-xs text-slate-500 font-medium">ر.س</span>
                        </p>
                    </div>

                    {/* المستحقات المعلقة والذمم */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-br-full -translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center justify-between">
                            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                                <Calendar size={18} />
                            </div>
                            <span className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded font-bold">قيد التحصيل</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-400 mt-4">المستحقات المتبقية في الذمة</h4>
                        <p className="text-2xl font-black text-white mt-1.5 tracking-tight">
                            {data?.financial_metrics?.pending_receivables?.toLocaleString()} <span className="text-xs text-slate-500 font-medium">ر.س</span>
                        </p>
                    </div>

                    {/* الأتعاب المتوقعة الإجمالية */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 rounded-br-full -translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center justify-between">
                            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                                <DollarSign size={18} />
                            </div>
                            <span className="text-[10px] text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded font-bold">قيمة العقود</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-400 mt-4">الأتعاب الكلية المستهدفة</h4>
                        <p className="text-2xl font-black text-white mt-1.5 tracking-tight">
                            {data?.financial_metrics?.total_revenue_expected?.toLocaleString()} <span className="text-xs text-slate-500 font-medium">ر.س</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── ⚖️ ثانياً: قسم المؤشرات القانونية وسلامة القضايا ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* القضايا المتداولة والنشطة */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex justify-between items-center group hover:border-slate-750 transition-all">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-400">ملفات الدعاوى المتداولة والنشطة</h4>
                        <p className="text-3xl font-black text-white tracking-tight pt-1">{data?.legal_metrics?.active_cases}</p>
                        <span className="text-[10px] text-slate-500 block pt-1">قضايا معينة ومسندة للوكلاء والمستشارين بالمكتب</span>
                    </div>
                    <div className="p-4 bg-slate-950 text-amber-500 border border-slate-850 rounded-xl group-hover:bg-amber-500/10 group-hover:text-amber-400 group-hover:border-amber-500/20 transition-all duration-300">
                        <Briefcase size={22} />
                    </div>
                </div>

                {/* القضايا المغلقة والمحسومة */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex justify-between items-center group hover:border-slate-750 transition-all">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-400">القضايا المغلقة والمحسومة نهائياً</h4>
                        <p className="text-3xl font-black text-white tracking-tight pt-1">{data?.legal_metrics?.closed_cases}</p>
                        <span className="text-[10px] text-slate-500 block pt-1">ملفات منتهية أُرسلت بالكامل للأرشيف الإلكتروني الرقمي</span>
                    </div>
                    <div className="p-4 bg-slate-950 text-slate-400 border border-slate-850 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-all duration-300">
                        <Lock size={22} />
                    </div>
                </div>
            </div>

            {/* ─── 🧑‍⚖️ ثالثاً: جدول إنتاجية وتوزيع جهد المستشارين بالمكتب ─── */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <h3 className="text-xs font-black text-white flex items-center gap-2 tracking-wide uppercase">
                        <Users size={16} className="text-amber-500" /> مصفوفة إنتاجية وتوزيع عمل المحامين والمستشارين
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 font-medium">مراقبة الأعباء المهنية</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-850/60">
                                <th className="px-6 py-3.5 tracking-wide">المستشار القانوني الوكيل</th>
                                <th className="px-6 py-3.5 tracking-wide">العبء التشغيلي الحالي (عدد القضايا الموكلة)</th>
                                <th className="px-6 py-3.5 text-center tracking-wide w-40">مستوى الإسناد</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-xs">
                            {!data?.lawyers_performance || data.lawyers_performance.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">لا توجد بيانات مسجلة لأداء المحامين حالياً في هذا النطاق.</td>
                                    </tr>
                            ) : (
                                data.lawyers_performance.map((lawyer, idx) => {
                                    // حساب مؤشر لوني وهمي لطيف بناءً على حجم القضايا المسندة
                                    const highLoad = lawyer.cases_count >= 5;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-200 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500/40"></div>
                                                <span>{lawyer.lawyer_name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">
                                                <span className="inline-flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-xl border border-slate-850 text-slate-200 text-[11px]">
                                                    <span className="font-black text-amber-500">{lawyer.cases_count}</span>
                                                    <span className="text-slate-500 text-[10px]">قضايا نشطة</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${highLoad ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {highLoad ? 'عبء مرتفع' : 'مستقر / متاح'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}