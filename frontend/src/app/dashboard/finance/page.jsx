'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

export default function FinancialDashboard() {
    // حالات حفظ البيانات القادمة من الباك إند
    const [financialData, setFinancialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState('2026');

    // دالة جلب البيانات من الباك إند
    const fetchFinancialMetrics = async () => {
        try {
            setLoading(true);
            setError(null);

            // استبدل هذا الرابط برابط الـ API الفعلي الخاص بالباك إند لديك
            // مثلاً: http://localhost:8000/api/v1/financials/dashboard?year=${selectedYear}
            const response = await fetch(`/api/v1/financials/dashboard?year=${selectedYear}`);

            if (!response.ok) {
                throw new Error('حدث خطأ أثناء جلب البيانات المالية من السيرفر');
            }

            const data = await response.json();
            setFinancialData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // إعادة جلب البيانات عند تغيير السنة أو عند تحميل الصفحة أول مرة
    useEffect(() => {
        fetchFinancialMetrics();
    }, [selectedYear]);

    // واجهة حالة التحميل (Loading State)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50" dir="rtl">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 mt-4 font-medium">جاري تحميل البيانات المالية الحية...</p>
            </div>
        );
    }

    // واجهة حالة الخطأ (Error State)
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir="rtl">
                <div className="bg-white p-6 rounded-xl border border-rose-200 text-center shadow-sm max-w-md">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">فشل الاتصال بالخادم</h3>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchFinancialMetrics}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    // مصفوفة البطاقات المعتمدة على البيانات الحقيقية من الباك إند
    const stats = [
        {
            title: 'إجمالي الإيرادات المحصلة',
            amount: `${financialData?.metrics?.total_revenue?.toLocaleString()} ر.س`,
            change: `${financialData?.metrics?.revenue_change}%`,
            isPositive: financialData?.metrics?.revenue_change >= 0,
            icon: DollarSign,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        },
        {
            title: 'المستحقات المعلقة',
            amount: `${financialData?.metrics?.pending_amount?.toLocaleString()} ر.س`,
            change: 'في انتظار الدفع',
            isPositive: null,
            icon: FileText,
            color: 'bg-amber-50 text-amber-600 border-amber-100',
        },
        {
            title: 'فواتير متأخرة السداد',
            amount: `${financialData?.metrics?.overdue_amount?.toLocaleString()} ر.س`,
            change: 'تجاوزت الموعد',
            isPositive: false,
            icon: AlertTriangle,
            color: 'bg-rose-50 text-rose-600 border-rose-100',
        },
        {
            title: 'المصروفات القضائية والإدارية',
            amount: `${financialData?.metrics?.total_expenses?.toLocaleString()} ر.س`,
            change: `${financialData?.metrics?.expenses_change}%`,
            isPositive: financialData?.metrics?.expenses_change <= 0, // الانخفاض هنا إيجابي
            icon: TrendingUp,
            color: 'bg-blue-50 text-blue-600 border-blue-100',
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            {/* رأس الصفحة */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم المالية</h1>
                    <p className="text-sm text-gray-500 mt-1">متابعة التدفقات النقدية الحية والفواتير والمصاريف.</p>
                </div>
                <button
                    onClick={fetchFinancialMetrics}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                    تحديث البيانات
                </button>
            </div>

            {/* قسم البطاقات الإحصائية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.amount}</h3>
                                </div>
                                <div className={`p-3 rounded-lg border ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                {stat.isPositive !== null && (
                                    stat.isPositive ? (
                                        <span className="text-emerald-600 flex items-center ml-1 font-medium font-sans">
                                            <ArrowUpRight className="w-4 h-4 ml-0.5" /> {stat.change}
                                        </span>
                                    ) : (
                                        <span className="text-rose-600 flex items-center ml-1 font-medium font-sans">
                                            <ArrowDownRight className="w-4 h-4 ml-0.5" /> {stat.change}
                                        </span>
                                    )
                                )}
                                {stat.isPositive === null && (
                                    <span className="text-gray-500 font-medium">{stat.change}</span>
                                )}
                                <span className="text-gray-400 text-xs mr-1">مقارنة بالشهر الماضي</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* الجزء السفلي */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* مساحة الرسم البياني */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">السيولة النقدية (الإيرادات مقابل المصروفات)</h2>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-gray-300 rounded-lg text-sm bg-white p-2"
                        >
                            <option value="2026">السنة الحالية 2026</option>
                            <option value="2025">السنة الماضية 2025</option>
                        </select>
                    </div>
                    <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        [ هنا يمكنك دمج مكتبة ريزوم البيانية واستخدام خط البيانات من الـ API: financialData.chart_data ]
                    </div>
                </div>

                {/* جدول العمليات الأخيرة الحقيقي */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">آخر العمليات الماليّة</h2>
                        <button className="text-sm text-blue-600 hover:underline font-medium">عرض الكل</button>
                    </div>

                    <div className="space-y-4">
                        {financialData?.recent_transactions?.length > 0 ? (
                            financialData.recent_transactions.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {item.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">{item.client_name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className={`text-sm font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-gray-700'}`}>
                                            {item.type === 'income' ? `+${item.amount.toLocaleString()} ر.س` : `-${item.amount.toLocaleString()} ر.س`}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-0.5 font-sans">{item.date}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-gray-400 py-8">لا توجد عمليات مالية مسجلة بعد.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}