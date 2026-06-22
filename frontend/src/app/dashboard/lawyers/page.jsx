// // frontend\src\app\dashboard\lawyers\page.jsx
// 'use client';
// import { useState, useEffect } from 'react';
// import { UserPlus, Edit2, Mail, Phone, CheckCircle2, XCircle, Loader2, AlertCircle, Search, Filter } from 'lucide-react';

// export default function LawyersManagement() {
//     const [team, setTeam] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // 🔍 حالات البحث والفلترة الجديدة
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

//     // حالات التحكم في النافذة المنبثقة (Modal)
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [editMode, setEditMode] = useState(false); 
//     const [selectedUserId, setSelectedUserId] = useState(null);

//     const [formData, setFormData] = useState({
//         full_name: '',
//         email: '',
//         phone_number: '',
//         role: 'associate',
//         password: '',
//         is_active: true
//     });

//     const roleMapping = {
//         admin: { label: 'مدير النظام', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' },
//         partner: { label: 'محامي شريك', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30' },
//         associate: { label: 'محامي مستشار', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30' },
//         trainee: { label: 'محامي متدرب', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' },
//         secretary: { label: 'سكرتارية', color: 'bg-slate-50 text-slate-600 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800' },
//     };

//     // 1️⃣ جلب قائمة الطاقم المحدث لدعم البارامترات ديناميكياً
//     const fetchTeam = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const token = localStorage.getItem('token');
            
//             // بناء الـ Query Parameters للبحث والفلترة
//             const params = new URLSearchParams();
//             if (searchQuery) params.append('search', searchQuery);
//             if (selectedRoleFilter) params.append('role', selectedRoleFilter);

//             const response = await fetch(`http://localhost:8000/api/v1/lawyers/?${params.toString()}`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             if (!response.ok) throw new Error('فشل في جلب قائمة أعضاء الفريق');
//             const data = await response.json();
//             setTeam(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // إعادة الاستدعاء التلقائي عند تغيير نصوص البحث أو اختيار الفلتر
//     useEffect(() => {
//         const delayDebounceFn = setTimeout(() => {
//             fetchTeam();
//         }, 400); // Debounce بمقدار 400ms لحماية السيرفر أثناء الكتابة المستمرة

//         return () => clearTimeout(delayDebounceFn);
//     }, [searchQuery, selectedRoleFilter]);

//     const openEditModal = (user) => {
//         setEditMode(true);
//         setSelectedUserId(user.id);
//         setFormData({
//             full_name: user.full_name,
//             email: user.email, 
//             phone_number: user.phone_number || '',
//             role: user.role,
//             password: '', 
//             is_active: user.is_active
//         });
//         setIsModalOpen(true);
//     };

//     const openAddModal = () => {
//         setEditMode(false);
//         setSelectedUserId(null);
//         setFormData({ full_name: '', email: '', phone_number: '', role: 'associate', password: '', is_active: true });
//         setIsModalOpen(true);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             setSubmitting(true);
//             const token = localStorage.getItem('token');

//             const url = editMode
//                 ? `http://localhost:8000/api/v1/lawyers/${selectedUserId}`
//                 : 'http://localhost:8000/api/v1/lawyers/';

//             const method = editMode ? 'PUT' : 'POST';

//             const bodyData = editMode
//                 ? { full_name: formData.full_name, phone_number: formData.phone_number, role: formData.role, is_active: formData.is_active }
//                 : formData;

//             const response = await fetch(url, {
//                 method: method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify(bodyData)
//             });

//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.detail || 'حدث خطأ أثناء معالجة الطلب');
//             }

//             setIsModalOpen(false);
//             fetchTeam();
//         } catch (err) {
//             alert(err.message);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen space-y-6 text-right" dir="rtl">
//             {/* رأس الصفحة */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
//                 <div>
//                     <h1 className="text-base font-bold text-slate-900 dark:text-white">⚖️ إدارة الطاقم والمحامين</h1>
//                     <p className="text-xs text-slate-400 mt-1">تعديل صلاحيات المحامين أو إضافة أعضاء جدد للفريق والمكتب.</p>
//                 </div>
//                 <button
//                     onClick={openAddModal}
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
//                 >
//                     <UserPlus className="w-4 h-4" />
//                     إضافة عضو جديد
//                 </button>
//             </div>

//             {/* 🛠️ قسم البحث والتصفية الجديد */}
//             <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
//                 {/* حقل البحث */}
//                 <div className="relative w-full md:w-96">
//                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                     <input
//                         type="text"
//                         placeholder="ابحث باسم المحامي، البريد الإلكتروني أو الجوال..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="w-full pr-10 pl-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white placeholder-slate-400"
//                     />
//                 </div>

//                 {/* قائمة اختيار الفلترة حسب الدور */}
//                 <div className="relative w-full md:w-60 flex items-center gap-2">
//                     <Filter className="w-4 h-4 text-slate-400 shrink-0" />
//                     <select
//                         value={selectedRoleFilter}
//                         onChange={(e) => setSelectedRoleFilter(e.target.value)}
//                         className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 dark:text-white"
//                     >
//                         <option value="">كل طاقم العمل والمحامين</option>
//                         <option value="admin">مدير النظام (Admin)</option>
//                         <option value="partner">محامي شريك (Partner)</option>
//                         <option value="associate">محامي مستشار (Associate)</option>
//                         <option value="trainee">محامي متدرب (Trainee)</option>
//                         <option value="secretary">سكرتارية (Secretary)</option>
//                     </select>
//                 </div>
//             </div>

//             {error && (
//                 <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg flex items-center gap-3">
//                     <AlertCircle className="w-5 h-5" />
//                     <p className="text-xs font-medium">{error}</p>
//                 </div>
//             )}

//             {/* الجدول */}
//             <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     {loading ? (
//                         <div className="p-12 flex flex-col items-center justify-center gap-2">
//                             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                             <p className="text-xs text-slate-400">جاري تحديث النتائج...</p>
//                         </div>
//                     ) : team.length === 0 ? (
//                         <div className="p-12 text-center text-slate-400 text-xs italic">
//                             لا توجد نتائج مطابقة لخيارات البحث الحالية.
//                         </div>
//                     ) : (
//                         <table className="w-full text-right border-collapse text-xs">
//                             <thead>
//                                 <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
//                                     <th className="p-4">الاسم الكامل</th>
//                                     <th className="p-4">البريد الإلكتروني</th>
//                                     <th className="p-4">رقم الهاتف</th>
//                                     <th className="p-4">الدور / الصلاحية</th>
//                                     <th className="p-4">الحالة</th>
//                                     <th className="p-4 text-center">الإجراءات</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
//                                 {team.map((member) => (
//                                     <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
//                                         <td className="p-4 font-bold text-slate-900 dark:text-white">{member.full_name}</td>
//                                         <td className="p-4 text-slate-600 dark:text-slate-300 font-sans">
//                                             <div className="flex items-center gap-2">
//                                                 <Mail className="w-3.5 h-3.5 text-slate-400" />
//                                                 {member.email}
//                                             </div>
//                                         </td>
//                                         <td className="p-4 text-slate-600 dark:text-slate-300 font-sans">
//                                             {member.phone_number ? (
//                                                 <div className="flex items-center gap-2">
//                                                     <Phone className="w-3.5 h-3.5 text-slate-400" />
//                                                     {member.phone_number}
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-slate-400 italic">غير محدد</span>
//                                             )}
//                                         </td>
//                                         <td className="p-4">
//                                             <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] border ${roleMapping[member.role]?.color || 'bg-slate-100'}`}>
//                                                 {roleMapping[member.role]?.label || member.role}
//                                             </span>
//                                         </td>
//                                         <td className="p-4">
//                                             {member.is_active ? (
//                                                 <span className="text-emerald-500 flex items-center gap-1.5 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> نشط</span>
//                                             ) : (
//                                                 <span className="text-rose-400 flex items-center gap-1.5 font-bold"><XCircle className="w-3.5 h-3.5" /> معطل</span>
//                                             )}
//                                         </td>
//                                         <td className="p-4 text-center">
//                                             <button
//                                                 onClick={() => openEditModal(member)}
//                                                 className="text-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1 mx-auto"
//                                             >
//                                                 <Edit2 className="w-3.5 h-3.5" />
//                                                 تعديل
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             </div>

//             {/* النافذة المنبثقة المشتركة (Modal) */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//                     <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
//                         <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
//                             <h3 className="text-xs font-bold text-slate-900 dark:text-white">{editMode ? 'تعديل بيانات العضو' : 'إضافة عضو فريق جديد'}</h3>
//                             <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
//                         </div>

//                         <form onSubmit={handleSubmit} className="p-5 space-y-4">
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-500 mb-1">الاسم الكامل *</label>
//                                 <input
//                                     type="text" required value={formData.full_name}
//                                     onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
//                                     className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white"
//                                 />
//                             </div>

//                             {!editMode && (
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-500 mb-1">البريد الإلكتروني *</label>
//                                     <input
//                                         type="email" required value={formData.email}
//                                         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                                         className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-sans text-slate-800 dark:text-white"
//                                     />
//                                 </div>
//                             )}

//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-500 mb-1">رقم الجوال</label>
//                                 <input
//                                     type="text" value={formData.phone_number}
//                                     onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
//                                     className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-sans text-slate-800 dark:text-white"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-500 mb-1">الدور والصلاحية القانونية *</label>
//                                 <select
//                                     value={formData.role}
//                                     onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                                     className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none cursor-pointer text-slate-800 dark:text-white"
//                                 >
//                                     <option value="partner">محامي شريك (Partner)</option>
//                                     <option value="associate">محامي مستشار / ممارس (Associate)</option>
//                                     <option value="trainee">محامي متدرب (Trainee)</option>
//                                     <option value="secretary">سكرتارية ومكتب أمامي (Secretary)</option>
//                                 </select>
//                             </div>

//                             {editMode && (
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-500 mb-1">حالة الحساب</label>
//                                     <select
//                                         value={formData.is_active ? "true" : "false"}
//                                         onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
//                                         className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none cursor-pointer text-slate-800 dark:text-white"
//                                     >
//                                         <option value="true">نشط (يستطيع دخول المنصة)</option>
//                                         <option value="false">معطل / مجمد (يُمنع من الدخول)</option>
//                                     </select>
//                                 </div>
//                             )}

//                             {!editMode && (
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-500 mb-1">كلمة المرور الأولية *</label>
//                                     <input
//                                         type="password" required minLength={8} value={formData.password}
//                                         onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                                         className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-sans text-slate-800 dark:text-white"
//                                     />
//                                 </div>
//                             )}

//                             <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">إلغاء</button>
//                                 <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:bg-blue-400 flex items-center gap-2">
//                                     {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
//                                     {editMode ? 'حفظ التغييرات' : 'حفظ الحساب الجديد'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



// frontend\src\app\dashboard\lawyers\page.jsx
'use client';
import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Mail, Phone, CheckCircle2, XCircle, Loader2, AlertCircle, Search, Filter, Shield, Briefcase } from 'lucide-react';

export default function LawyersManagement() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // حالات البحث والفلترة
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

    // 🌟 خريطة الألوان الفاخرة الجديدة للأدوار (Corporate & Gold Accents)
    const roleMapping = {
        admin: { label: 'مدير النظام', color: 'bg-slate-900 text-amber-500 border-amber-500/30 dark:bg-amber-500/10' },
        partner: { label: 'محامي شريك', color: 'bg-slate-900/90 text-amber-400 border-amber-400/20' },
        associate: { label: 'محامي مستشار', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' },
        trainee: { label: 'محامي متدرب', color: 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800' },
        secretary: { label: 'سكرتارية', color: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800' },
    };

    const fetchTeam = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
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

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTeam();
        }, 400);
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

            const url = editMode ? `http://localhost:8000/api/v1/lawyers/${selectedUserId}` : 'http://localhost:8000/api/v1/lawyers/';
            const method = editMode ? 'PUT' : 'POST';
            const bodyData = editMode ? { full_name: formData.full_name, phone_number: formData.phone_number, role: formData.role, is_active: formData.is_active } : formData;

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        // الخلفية العامة بدرجات رصينة (Slate/Gray الفاخر)
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">
            
            {/* الهيدر الرئيسي بتصميم ملكي (Midnight Navy) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0F172A] dark:bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-amber-400">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wide">إدارة الطاقم والمستشارين</h1>
                        <p className="text-xs text-slate-400 mt-1">هيكلة الهيئة القانونية للمكتب، تنظيم الصلاحيات ومراقبة الحسابات النشطة.</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="relative z-10 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-amber-500/10 transition-all flex items-center gap-2 border border-amber-400/20"
                >
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    إدراج مستشار جديد
                </button>
            </div>

            {/* أدوات البحث والفلترة بتصميم ناصع وراقٍ */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#141C2F] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث بالاسم، البريد أو رقم الجوال القانوني..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 text-slate-800 dark:text-white placeholder-slate-400 transition-colors"
                    />
                </div>

                <div className="relative w-full md:w-64 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                        value={selectedRoleFilter}
                        onChange={(e) => setSelectedRoleFilter(e.target.value)}
                        className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer text-slate-700 dark:text-slate-200 font-medium"
                    >
                        <option value="">كافة الهيئة القانونية والمكتبية</option>
                        <option value="admin">مدير النظام (Admin)</option>
                        <option value="partner">محامي شريك (Partner)</option>
                        <option value="associate">محامي مستشار (Associate)</option>
                        <option value="trainee">محامي متدرب (Trainee)</option>
                        <option value="secretary">سكرتارية وتنسيق (Secretary)</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 text-rose-700 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-xs font-semibold">{error}</p>
                </div>
            )}

            {/* الجدول الفاخر (The Executive Table) */}
            <div className="bg-white dark:bg-[#141C2F] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                            <p className="text-xs text-slate-400 font-medium">جاري فحص وتحديث السجلات القانونية...</p>
                        </div>
                    ) : team.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 text-xs italic">
                            لم يتم العثور على أي سجلات تطابق خيارات الفلترة الحالية.
                        </div>
                    ) : (
                        <table className="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#1E293B]/30 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-4 font-semibold">الاسم الكامل</th>
                                    <th className="p-4 font-semibold">قنوات التواصل</th>
                                    <th className="p-4 font-semibold">رقم الجوال</th>
                                    <th className="p-4 font-semibold">الصفة / المسمى الرقمي</th>
                                    <th className="p-4 font-semibold">حالة الاتصال</th>
                                    <th className="p-4 text-center font-semibold">الملف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                {team.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/20 transition-colors">
                                        {/* الاسم بخط عريض ووقور */}
                                        <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">{member.full_name}</td>
                                        
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
                                                <span className="text-slate-400 italic">غير مدرج</span>
                                            )}
                                        </td>
                                        
                                        {/* وسام الدور المحدث بالألوان الفاخرة */}
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-lg font-bold text-[10px] tracking-wide border uppercase ${roleMapping[member.role]?.color || 'bg-slate-100'}`}>
                                                {roleMapping[member.role]?.label || member.role}
                                            </span>
                                        </td>
                                        
                                        <td className="p-4">
                                            {member.is_active ? (
                                                <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 font-bold">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    مفوّض
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                                                    <XCircle className="w-3.5 h-3.5 stroke-[2]" />
                                                    موقوف مؤقتاً
                                                </span>
                                            )}
                                        </td>
                                        
                                        {/* زر التعديل بلمسة ذهبية أنيقة عند التحويم */}
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openEditModal(member)}
                                                className="text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 font-bold flex items-center justify-center gap-1 mx-auto border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg hover:border-amber-500/30 transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                إدارة
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* النافذة المنبثقة الفاخرة (The Executive Modal) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#141C2F] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1E293B]/30">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
                                <Shield className="w-4 h-4 text-amber-500" />
                                <span>{editMode ? 'تعديل الصلاحيات والملف' : 'تأسيس حساب منسوب جديد'}</span>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">الاسم الكامل للمستشار *</label>
                                <input
                                    type="text" required value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {!editMode && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">البريد الإلكتروني الرسمي *</label>
                                    <input
                                        type="email" required value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-sans text-slate-800 dark:text-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">رقم الجوال للتواصل</label>
                                <input
                                    type="text" value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-sans text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">المرتبة / الصفة القانونية *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer text-slate-800 dark:text-white"
                                >
                                    <option value="partner">محامي شريك (Partner)</option>
                                    <option value="associate">محامي مستشار / ممارس (Associate)</option>
                                    <option value="trainee">محامي متدرب (Trainee)</option>
                                    <option value="secretary">سكرتارية وتنسيق إداري (Secretary)</option>
                                </select>
                            </div>

                            {editMode && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">حالة تفويض الحساب</label>
                                    <select
                                        value={formData.is_active ? "true" : "false"}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                                        className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer text-slate-800 dark:text-white"
                                    >
                                        <option value="true">مفوّض (يملك صلاحية الدخول)</option>
                                        <option value="false">موقوف مؤقتاً (سحب صلاحيات الدخول)</option>
                                    </select>
                                </div>
                            )}

                            {!editMode && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">كلمة المرور المشفرة *</label>
                                    <input
                                        type="password" required minLength={8} value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-sans text-slate-800 dark:text-white"
                                    />
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">إلغاء</button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 border border-amber-400/10 transition-all"
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {editMode ? 'اعتماد التعديلات' : 'إنشاء السجل الرقمي'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}