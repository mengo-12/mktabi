'use client';
import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Mail, Phone, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function LawyersManagement() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // حالات التحكم في النافذة المنبثقة (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false); // للتفريق بين الإضافة والتعديل
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
        admin: { label: 'مدير النظام', color: 'bg-rose-50 text-rose-700 border-rose-100' },
        partner: { label: 'محامي شريك', color: 'bg-purple-50 text-purple-700 border-purple-100' },
        associate: { label: 'محامي مستشار', color: 'bg-blue-50 text-blue-700 border-blue-100' },
        trainee: { label: 'محامي متدرب', color: 'bg-amber-50 text-amber-700 border-amber-100' },
        secretary: { label: 'سكرتارية', color: 'bg-slate-50 text-slate-700 border-slate-100' },
    };

    // 1️⃣ جلب قائمة الطاقم
    const fetchTeam = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/v1/lawyers/', {
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

    useEffect(() => {
        fetchTeam();
    }, []);

    // 2️⃣ تجهيز النافذة لعملية التعديل ببيانات المستخدم المختار
    const openEditModal = (user) => {
        setEditMode(true);
        setSelectedUserId(user.id);
        setFormData({
            full_name: user.full_name,
            email: user.email, // الباك إند لا يعدل الإيميل في مسار التعديل الحالي ولكنه يعرض للقراءة
            phone_number: user.phone_number || '',
            role: user.role,
            password: '', // نترك كلمة المرور فارغة لأن التعديل الإداري لا يتطلبها دائماً
            is_active: user.is_active
        });
        setIsModalOpen(true);
    };

    // 3️⃣ تجهيز النافذة لعملية الإضافة الجديدة
    const openAddModal = () => {
        setEditMode(false);
        setSelectedUserId(null);
        setFormData({ full_name: '', email: '', phone_number: '', role: 'associate', password: '', is_active: true });
        setIsModalOpen(true);
    };

    // 4️⃣ معالجة الإرسال (إما إنشاء أو تعديل)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const url = editMode
                ? `http://localhost:8000/api/v1/lawyers/${selectedUserId}`
                : 'http://localhost:8000/api/v1/lawyers/';

            const method = editMode ? 'PUT' : 'POST';

            // عند التعديل، نرسل فقط الحقول المدعومة في السكيما المخصصة للتعديل بجانب الإدارة
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50" dir="rtl">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 mt-4">جاري تحميل قائمة الطاقم...</p>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen" dir="rtl">
            {/* رأس الصفحة */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الطاقم والمحامين</h1>
                    <p className="text-sm text-gray-500 mt-1">تعديل صلاحيات المحامين أو إضافة أعضاء جدد للفريق.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    إضافة عضو جديد
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* الجدول */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
                                <th className="p-4">الاسم الكامل</th>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4">رقم الهاتف</th>
                                <th className="p-4">الدور / الصلاحية</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {team.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
                                    <td className="p-4 font-semibold text-gray-900">{member.full_name}</td>
                                    <td className="p-4 text-gray-600 font-sans"><div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" />{member.email}</div></td>
                                    <td className="p-4 text-gray-600 font-sans">
                                        {member.phone_number ? <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{member.phone_number}</div> : <span className="text-gray-400 italic">غير محدد</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleMapping[member.role]?.color || 'bg-gray-100'}`}>
                                            {roleMapping[member.role]?.label || member.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {member.is_active ? (
                                            <span className="text-emerald-600 flex items-center gap-1.5 font-medium"><CheckCircle2 className="w-4 h-4" /> نشط</span>
                                        ) : (
                                            <span className="text-rose-500 flex items-center gap-1.5 font-medium"><XCircle className="w-4 h-4" /> معطل</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => openEditModal(member)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            تعديل
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* النافذة المنبثقة المشتركة للإضافة والتعديل */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editMode ? 'تعديل بيانات العضو' : 'إضافة عضو فريق جديد'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                                <input
                                    type="text" required value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                />
                            </div>

                            {!editMode && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                                    <input
                                        type="email" required value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-sans"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الجوال</label>
                                <input
                                    type="text" value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-sans"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">الدور والصلاحية القانونية</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                                >
                                    <option value="partner">محامي شريك (Partner)</option>
                                    <option value="associate">محامي مستشار / ممارس (Associate)</option>
                                    <option value="trainee">محامي متدرب (Trainee)</option>
                                    <option value="secretary">سكرتارية ومكتب أمامي (Secretary)</option>
                                </select>
                            </div>

                            {/* حقل حالة الحساب يظهر فقط أثناء التعديل لتجميد العضو أو تفعيله */}
                            {editMode && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">حالة الحساب</label>
                                    <select
                                        value={formData.is_active ? "true" : "false"}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                                    >
                                        <option value="true">نشط (يستطيع دخول المنصة)</option>
                                        <option value="false">معطل / مجمد (يُمنع من الدخول)</option>
                                    </select>
                                </div>
                            )}

                            {!editMode && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور الأولية</label>
                                    <input
                                        type="password" required minLength={8} value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-sans"
                                    />
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">إلغاء</button>
                                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
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