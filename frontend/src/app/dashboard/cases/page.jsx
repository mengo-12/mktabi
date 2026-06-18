'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export default function CasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 📡 جلب البيانات حياً من الباك-إند عند تحميل الصفحة
    useEffect(() => {
        const fetchCases = async () => {
            try {
                setLoading(true);
                setError('');
                // طلب مسار جلب القضايا (الباك-إند سيفلتر تلقائياً حسب توكن المستخدم)
                const response = await apiClient.get('/cases/');
                setCases(response.data);
            } catch (err) {
                console.error(err);
                setError('حدث خطأ أثناء جلب ملفات القضايا من السيرفر.');
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    // 🎨 دالة ذكية لتلوين حالة القضية ديناميكياً (Status Badges)
    const getStatusBadge = (status) => {
        const statusMap = {
            'ACTIVE': { text: 'نشطة', styles: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900' },
            'PENDING': { text: 'قيد الانتظار', styles: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900' },
            'CLOSED': { text: 'مغلقة', styles: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
            'APPEAL': { text: 'استئناف', styles: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900' }
        };

        const current = statusMap[status?.toUpperCase()] || { text: status, styles: 'bg-slate-50 text-slate-600 border-slate-200' };

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${current.styles}`}>
                {current.text}
            </span>
        );
    };

    return (
        <div className="space-y-6">

            {/* رأس الصفحة والإجراءات السريعة */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة القضايا والملفات</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عرض ومتابعة كافة القضايا الموزعة والصلاحيات المرتبطة بها</p>
                </div>
                <div>
                    <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors">
                        ＋ إضافة قضية جديدة
                    </button>
                </div>
            </div>

            {/* عرض رسالة الخطأ إن وجدت */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* الجدول الرئيسي والمحتوى */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                                <th className="p-4 w-20">رقم القضية</th>
                                <th className="p-4">عنوان وموضوع القضية</th>
                                <th className="p-4">الموكل (العميل)</th>
                                <th className="p-4">المحامي المسؤول</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">

                            {/* 1️⃣ حالة التحميل (Skeleton Loader) */}
                            {loading && (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div></td>
                                        <td className="p-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
                                            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24"></div>
                                        </td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div></td>
                                        <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div></td>
                                        <td className="p-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-20 mx-auto"></div></td>
                                    </tr>
                                ))
                            )}

                            {/* 2️⃣ حالة عدم وجود قضايا بعد انتهاء التحميل */}
                            {!loading && cases.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                                        📭 لا توجد قضايا مسجلة في النظام حالياً أو لا تملك صلاحية لاستعراضها.
                                    </td>
                                </tr>
                            )}

                            {/* 3️⃣ عرض البيانات حياً وبشكل آمن */}
                            {!loading && cases.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                        #{item.id}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">{item.description}</p>
                                    </td>
                                    <td className="p-4">
                                        {/* استدعاء آمن ومحمي للبيانات المترابطة (Client Eager Loading) */}
                                        <div className="font-medium text-slate-800 dark:text-slate-300">
                                            {item.client?.name || <span className="text-slate-400 text-xs">غير محدد</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {/* استدعاء آمن ومحمي لبيانات المحامي (Lawyer Eager Loading) */}
                                        <div className="font-medium text-slate-800 dark:text-slate-300">
                                            {item.lawyer?.full_name || <span className="text-slate-400 text-xs">غير معين</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors">
                                            استعراض التفاصيل
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}