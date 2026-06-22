// frontend\src\app\dashboard\lawyers\page.jsx
'use client';
import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Mail, Phone, CheckCircle2, XCircle, Loader2, AlertCircle, Search, Filter } from 'lucide-react';

export default function LawyersManagement() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔍 حالات البحث والفلترة الجديدة
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

    // حالات التحكم في النافذة المنبثقة (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false); 
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        role: 'associate',
        password: '',
        is_active: true
    });

    const roleMapping = {
        admin: { label: 'مدير النظام', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' },
        partner: { label: 'محامي شريك', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30' },
        associate: { label: 'محامي مستشار', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30' },
        trainee: { label: 'محامي متدرب', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' },
        secretary: { label: 'سكرتارية', color: 'bg-slate-50 text-slate-600 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800' },
    };

    // 1️⃣ جلب قائمة الطاقم المحدث لدعم البارامترات ديناميكياً
    const fetchTeam = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            // بناء الـ Query Parameters للبحث والفلترة
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedRoleFilter) params.append('role', selectedRoleFilter);

            const response = await fetch(`http://localhost:8000/api/v1/lawyers/?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('فشل في جلب قائمة أعضاء الفريق');
            const data = await response.json();
            setTeam(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // إعادة الاستدعاء التلقائي عند تغيير نصوص البحث أو اختيار الفلتر
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTeam();
        }, 400); // Debounce بمقدار 400ms لحماية السيرفر أثناء الكتابة المستمرة

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedRoleFilter]);

    const openEditModal = (user) => {
        setEditMode(true);
        setSelectedUserId(user.id);
        setFormData({
            full_name: user.full_name,
            email: user.email, 
            phone_number: user.phone_number || '',
            role: user.role,
            password: '', 
            is_active: user.is_active
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditMode(false);
        setSelectedUserId(null);
        setFormData({ full_name: '', email: '', phone_number: '', role: 'associate', password: '', is_active: true });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const url = editMode
                ? `http://localhost:8000/api/v1/lawyers/${selectedUserId}`
                : 'http://localhost:8000/api/v1/lawyers/';

            const method = editMode ? 'PUT' : 'POST';

            const bodyData = editMode
                ? { full_name: formData.full_name, phone_number: formData.phone_number, role: formData.role, is_active: formData.is_active }
                : formData;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'حدث خطأ أثناء معالجة الطلب');
            }

            setIsModalOpen(false);
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen space-y-6 text-right" dir="rtl">
            {/* رأس الصفحة */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900 dark:text-white">⚖️ إدارة الطاقم والمحامين</h1>
                    <p className="text-xs text-slate-400 mt-1">تعديل صلاحيات المحامين أو إضافة أعضاء جدد للفريق والمكتب.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    إضافة عضو جديد
                </button>
            </div>

            {/* 🛠️ قسم البحث والتصفية الجديد */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                {/* حقل البحث */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث باسم المحامي، البريد الإلكتروني أو الجوال..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white placeholder-slate-400"
                    />
                </div>

                {/* قائمة اختيار الفلترة حسب الدور */}
                <div className="relative w-full md:w-60 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                        value={selectedRoleFilter}
                        onChange={(e) => setSelectedRoleFilter(e.target.value)}
                        className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 dark:text-white"
                    >
                        <option value="">كل طاقم العمل والمحامين</option>
                        <option value="admin">مدير النظام (Admin)</option>
                        <option value="partner">محامي شريك (Partner)</option>
                        <option value="associate">محامي مستشار (Associate)</option>
                        <option value="trainee">محامي متدرب (Trainee)</option>
                        <option value="secretary">سكرتارية (Secretary)</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-xs font-medium">{error}</p>
                </div>
            )}

            {/* الجدول */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-xs text-slate-400">جاري تحديث النتائج...</p>
                        </div>
                    ) : team.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-xs italic">
                            لا توجد نتائج مطابقة لخيارات البحث الحالية.
                        </div>
                    ) : (
                        <table className="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                                    <th className="p-4">الاسم الكامل</th>
                                    <th className="p-4">البريد الإلكتروني</th>
                                    <th className="p-4">رقم الهاتف</th>
                                    <th className="p-4">الدور / الصلاحية</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                {team.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-4 font-bold text-slate-900 dark:text-white">{member.full_name}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-sans">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                {member.email}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-sans">
                                            {member.phone_number ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    {member.phone_number}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">غير محدد</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] border ${roleMapping[member.role]?.color || 'bg-slate-100'}`}>
                                                {roleMapping[member.role]?.label || member.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {member.is_active ? (
                                                <span className="text-emerald-500 flex items-center gap-1.5 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> نشط</span>
                                            ) : (
                                                <span className="text-rose-400 flex items-center gap-1.5 font-bold"><XCircle className="w-3.5 h-3.5" /> معطل</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openEditModal(member)}
                                                className="text-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1 mx-auto"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                تعديل
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* النافذة المنبثقة المشتركة (Modal) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">{editMode ? 'تعديل بيانات العضو' : 'إضافة عضو فريق جديد'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">الاسم الكامل *</label>
                                <input
                                    type="text" required value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            {!editMode && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">البريد الإلكتروني *</label>
                                    <input
                                        type="email" required value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-sans text-slate-800 dark:text-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">رقم الجوال</label>
                                <input
                                    type="text" value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-sans text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">الدور والصلاحية القانونية *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                                >
                                    <option value="partner">محامي شريك (Partner)</option>
                                    <option value="associate">محامي مستشار / ممارس (Associate)</option>
                                    <option value="trainee">محامي متدرب (Trainee)</option>
                                    <option value="secretary">سكرتارية ومكتب أمامي (Secretary)</option>
                                </select>
                            </div>

                            {editMode && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">حالة الحساب</label>
                                    <select
                                        value={formData.is_active ? "true" : "false"}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                                    >
                                        <option value="true">نشط (يستطيع دخول المنصة)</option>
                                        <option value="false">معطل / مجمد (يُمنع من الدخول)</option>
                                    </select>
                                </div>
                            )}

                            {!editMode && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">كلمة المرور الأولية *</label>
                                    <input
                                        type="password" required minLength={8} value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-sans text-slate-800 dark:text-white"
                                    />
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">إلغاء</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:bg-blue-400 flex items-center gap-2">
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {editMode ? 'حفظ التغييرات' : 'حفظ الحساب الجديد'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}