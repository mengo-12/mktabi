'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, FileText, CheckCircle2, XCircle, AlertCircle, Loader2, Plus } from 'lucide-react';

export default function OfficeVisits() {
    const [visits, setVisits] = useState([]);
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        visitor_name: '',
        visitor_phone: '',
        visit_reason: '',
        appointment_time: '',
        host_lawyer_id: '',
        notes: ''
    });

    const statusMapping = {
        pending: { label: 'قيد الانتظار', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' },
        confirmed: { label: 'مؤكد', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' },
        completed: { label: 'اكتملت', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' },
        cancelled: { label: 'ملغية', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' },
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            const [visitsRes, lawyersRes] = await Promise.all([
                fetch('http://localhost:8000/api/v1/visits/', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8000/api/v1/lawyers/', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!visitsRes.ok || !lawyersRes.ok) throw new Error('حدث خطأ أثناء جلب البيانات من السيرفر');

            setVisits(await visitsRes.json());
            setLawyers(await lawyersRes.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateVisit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8000/api/v1/visits/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('فشل حفظ الموعد');

            setIsModalOpen(false);
            setFormData({ visitor_name: '', visitor_phone: '', visit_reason: '', appointment_time: '', host_lawyer_id: '', notes: '' });
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (visitId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/v1/visits/${visitId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50" dir="rtl">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 mt-4">جاري تحميل مواعيد وزيارات المكتب...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen space-y-6 text-right" dir="rtl">
            {/* رأس الصفحة */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900 dark:text-white">📅 مواعيد وزيارات المكتب</h1>
                    <p className="text-xs text-slate-400 mt-1">تنظيم ومتابعة حضور الموكلين والمراجعين للمكتب وجدولتها مع المحامين.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    جدولة زيارة جديدة
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-xs font-medium">{error}</p>
                </div>
            )}

            {/* الجدول القديم بالألوان الجديدة المطابقة لصفحة الموكلين */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                                <th className="p-4">الزائر / العميل</th>
                                <th className="p-4">سبب الزيارة</th>
                                <th className="p-4">التوقيت والتاريخ</th>
                                <th className="p-4">المحامي المستضيف</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">الإجراء السريع</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                            {visits.length > 0 ? (
                                visits.map((visit) => {
                                    const hostLawyer = lawyers.find(l => l.id === visit.host_lawyer_id);
                                    const formattedDate = new Date(visit.appointment_time).toLocaleString('ar-EG', {
                                        dateStyle: 'short',
                                        timeStyle: 'short'
                                    });

                                    return (
                                        <tr key={visit.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{visit.visitor_name}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5 font-sans flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {visit.visitor_phone}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{visit.visit_reason}</td>
                                            <td className="p-4 font-sans text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-1.5 font-mono">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {formattedDate}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-700 dark:text-slate-200 font-medium">
                                                {hostLawyer ? hostLawyer.full_name : 'غير محدد'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${statusMapping[visit.status]?.color}`}>
                                                    {statusMapping[visit.status]?.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {visit.status === 'pending' ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(visit.id, 'completed')}
                                                            className="text-emerald-500 hover:text-emerald-600 font-medium flex items-center gap-1"
                                                            title="تحديد كمكتمل عند وصول الزائر"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> وصول
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(visit.id, 'cancelled')}
                                                            className="text-red-400 hover:text-red-600 font-medium flex items-center gap-1"
                                                            title="إلغاء الموعد"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> إلغاء
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">تمت معالجته</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-xs text-slate-400 italic">لا توجد مواعيد زيارات مسجلة حالياً.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* النافذة المنبثقة المشتركة للجدولة (Modal) متوافقة مع ألوان Slate و Dark Mode */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">جدولة موعد زيارة للمكتب</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                        </div>

                        <form onSubmit={handleCreateVisit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">اسم الزائر / العميل *</label>
                                <input
                                    type="text" required value={formData.visitor_name}
                                    onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">رقم جوال الزائر *</label>
                                <input
                                    type="text" required value={formData.visitor_phone}
                                    onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono text-slate-800 dark:text-white"
                                    placeholder="05xxxxxxxx"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">الغرض من الزيارة / سبب الحضور *</label>
                                <input
                                    type="text" required value={formData.visit_reason}
                                    onChange={(e) => setFormData({ ...formData, visit_reason: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ ووقت الزيارة *</label>
                                    <input
                                        type="datetime-local" required value={formData.appointment_time}
                                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">المحامي المستضيف *</label>
                                    <select
                                        required value={formData.host_lawyer_id}
                                        onChange={(e) => setFormData({ ...formData, host_lawyer_id: e.target.value })}
                                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                                    >
                                        <option value="">اختر المحامي المستضيف...</option>
                                        {lawyers.map(lawyer => (
                                            <option key={lawyer.id} value={lawyer.id}>{lawyer.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">ملاحظات إضافية (اختياري)</label>
                                <textarea
                                    rows="2" value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">إلغاء</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:bg-blue-400">
                                    {submitting ? 'جاري الحفظ...' : 'تأكيد وحفظ الموعد'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}