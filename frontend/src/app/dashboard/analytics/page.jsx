'use client';
import { useEffect, useState } from 'react';

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        fetch('http://localhost:8000/api/v1/analytics/summary', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then((res) => {
            if (!res.ok) throw new Error('غير مصرح لك بالوصول أو حدث خطأ في السيرفر.');
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
    }, []);

    if (loading) return <div className="text-center py-10 dark:text-slate-400">جاري تحميل التقارير المالية والقانونية...</div>;
    if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl text-center">{error}</div>;

    return (
        <div className="space-y-8" dir="rtl">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">قسم الإحصائيات وتقارير الأداء</h1>
                <p className="text-sm text-slate-500 mt-1">نظرة عامة على المؤشرات المالية والقانونية للمكتب</p>
            </div>

            {/* 💰 المؤشرات المالية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-2xl">💰</span>
                    <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-2">التدفقات النقدية الداخلة</h3>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                        {data?.financial_metrics?.total_cash_in?.toLocaleString()} ر.س
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <span className="text-2xl">⏳</span>
                    <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-2">المستحقات المعلقة (الديون)</h3>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                        {data?.financial_metrics?.pending_receivables?.toLocaleString()} ر.س
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <span className="text-2xl">📈</span>
                    <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mt-2">الأتعاب المتوقعة الإجمالية</h3>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">
                        {data?.financial_metrics?.total_revenue_expected?.toLocaleString()} ر.س
                    </p>
                </div>
            </div>

            {/* ⚖️ المؤشرات القانونية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">القضايا المتداولة والنشطة حالياً</h4>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{data?.legal_metrics?.active_cases}</p>
                    </div>
                    <span className="text-3xl bg-blue-50 dark:bg-slate-700 p-3 rounded-xl">💼</span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">القضايا المغلقة والمحسومة</h4>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{data?.legal_metrics?.closed_cases}</p>
                    </div>
                    <span className="text-3xl bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">🔒</span>
                </div>
            </div>

            {/* 🧑‍⚖️ جدول كفاءة وأداء المحامين */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white">مؤشرات إنتاجية وتوزيع عمل المحامين</h3>
                </div>
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-bold">
                            <th className="px-6 py-3">اسم المحامي المستشار</th>
                            <th className="px-6 py-3">عدد القضايا النشطة المسندة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                        {data?.lawyers_performance?.map((lawyer, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/20">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{lawyer.lawyer_name}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                    <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                                        {lawyer.cases_count} قضية
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}