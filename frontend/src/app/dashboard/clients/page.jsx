// "use client";
// import { useState, useEffect, useCallback } from "react";
// import apiClient from "@/services/apiClient"; // تأكد من مسار apiClient الخاص بمشروعك

// export default function ClientsPage() {
//     // 📋 حالات عرض البيانات والفلترة
//     const [clients, setClients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [clientTypeFilter, setClientTypeFilter] = useState(""); // individual / company
//     const [showArchived, setShowArchived] = useState(false); // عرض المؤرشفين (is_active)

//     // 🗂️ حالات التحكم في النوافذ (Modals / Drawers)
//     const [isFormModalOpen, setIsFormModalOpen] = useState(false);
//     const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
//     const [editingClient, setEditingClient] = useState(null);
//     const [selectedClient, setSelectedClient] = useState(null); // للملف الشخصي الجانبي
//     const [activeTab, setActiveTab] = useState("cases"); // cases / documents
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // 📝 حالة كائن البيانات للنموذج (Form Data)
//     const [formData, setFormData] = useState({
//         client_type: "individual", // individual أو corporate (وليس company)
//         name: "",
//         national_id: "",
//         commercial_register: "",    // مطابقة للباك إند
//         company_representative: "", // مطابقة للباك إند
//         email: "",
//         phone_number: "",           // مطابقة للباك إند
//         address: ""
//     });

//     // 🔍 1. دالة جلب البيانات من الباك إند مع الفلاتر والـ Debounce
//     const fetchClients = useCallback(async (search = searchTerm) => {
//         try {
//             setLoading(true);

//             const params = {
//                 skip: 0,
//                 limit: 100,
//                 include_archived: showArchived // الباك إند يتوقع include_archived بوليان
//             };

//             if (search && search.trim() !== "") {
//                 params.search = search;
//             }

//             if (clientTypeFilter) {
//                 params.client_type = clientTypeFilter; // سيمرر "individual" أو "corporate"
//             }

//             const response = await apiClient.get("/clients/", { params });
//             setClients(response.data);
//         } catch (err) {
//             console.error("خطأ أثناء جلب بيانات الموكلين:", err);
//         } finally {
//             setLoading(false);
//         }
//     }, [searchTerm, clientTypeFilter, showArchived]);

//     // ⏱️ تطبيق الـ Debounce (300ms) للبحث لحماية السيرفر المحلي
//     useEffect(() => {
//         const delayDebounceFn = setTimeout(() => {
//             fetchClients(searchTerm);
//         }, 300);

//         return () => clearTimeout(delayDebounceFn);
//     }, [searchTerm, fetchClients]);

//     // استدعاء الجلب عند تغيير الفلاتر الأخرى فوراً
//     useEffect(() => {
//         fetchClients();
//     }, [clientTypeFilter, showArchived]);

//     // ➕ 2. معالجة حفظ البيانات (إنشاء / تعديل)
//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             setIsSubmitting(true);

//             const payload = { ...formData };
//             if (formData.client_type === "individual") {
//                 payload.commercial_register = null;
//                 payload.company_representative = null;
//             } else {
//                 payload.national_id = null;
//             }

//             if (editingClient) {
//                 // استخدام PATCH وتمرير الـ payload النظيف
//                 const response = await apiClient.patch(`/clients/${editingClient.id}`, payload);
//                 setClients(prev => prev.map(c => c.id === editingClient.id ? response.data : c));
//             } else {
//                 // إنشاء موكل جديد
//                 const response = await apiClient.post("/clients/", payload);
//                 setClients(prev => [response.data, ...prev]);
//             }

//             setIsFormModalOpen(false);
//             resetForm();
//         } catch (err) {
//             alert(`⚠️ خطأ: ${err.response?.data?.detail || "فشل في حفظ البيانات"}`);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // 🗑️ 3. الأرشفة الصامتة (Soft Delete) لحماية العلاقات الخارجية
//     const handleSoftDelete = async (clientId, clientName) => {
//         if (!confirm(`هل أنت متأكد من نقل الموكل "${clientName}" إلى الأرشيف الصامت؟ لحماية سجل القضايا المرتبطة.`)) return;
//         try {
//             // إرسال طلب DELETE ليقوم الباك إند بتحويل is_active إلى False
//             await apiClient.delete(`/clients/${clientId}`);
//             // إخفاء العميل حياً من القائمة النشطة الحالية
//             setClients(prev => prev.filter(c => c.id !== clientId));
//             if (selectedClient?.id === clientId) setIsProfileDrawerOpen(false);
//         } catch (err) {
//             alert("⚠️ فشل في أرشفة الموكل، قد يكون مرتبط ببيانات حرجة.");
//         }
//     };

//     // فتح واجهة التعديل وتعبئة البيانات السابقة
//     const openEditModal = (client) => {
//         setEditingClient(client);
//         setFormData({
//             client_type: client.client_type,
//             name: client.name,
//             national_id: client.national_id || "",
//             commercial_register: client.commercial_register || "",
//             company_representative: client.company_representative || "",
//             email: client.email || "",
//             phone_number: client.phone_number || "",
//             address: client.address || ""
//         });
//         setIsFormModalOpen(true);
//     };

//     // فتح لوحة استعراض السجل الكامل (Drawer) للموكل
//     const openClientProfile = async (client) => {
//         try {
//             setLoading(true);
//             // جلب الموكل مع قضاياه المضمنة مباشرة من المسار الجديد
//             const response = await apiClient.get(`/clients/${client.id}`);
//             setSelectedClient(response.data);
//             setIsProfileDrawerOpen(true);
//         } catch (err) {
//             console.error("خطأ أثناء جلب ملف الموكل وقضاياه الحصرية:", err);
//             // حل احتياطي في حال حدوث مشكلة في الشبكة
//             setSelectedClient(client);
//             setIsProfileDrawerOpen(true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetForm = () => {
//         setEditingClient(null);
//         setFormData({
//             client_type: "individual", name: "", national_id: "", commercial_register: "",
//             company_representative: "", email: "", phone_number: "", address: ""
//         });
//     };
//     return (
//         <div className="p-6 space-y-6 text-right" dir="rtl">
//             {/* أولاً: شريط العناوين والأزرار الأساسية */}
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
//                 <div>
//                     <h2 className="text-base font-bold text-slate-900 dark:text-white">📁 إدارة ملفات الموكلين</h2>
//                     <p className="text-xs text-slate-400 mt-1">إضافة وتعديل وأرشفة الكيانات التجارية والأفراد ومتابعة سجلاتهم.</p>
//                 </div>
//                 <button
//                     onClick={() => { resetForm(); setIsFormModalOpen(true); }}
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
//                 >
//                     <span>➕ إضافة موكل جديد</span>
//                 </button>
//             </div>

//             {/* ثانياً: شريط التصفية والبحث المتقدم */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
//                 <input
//                     type="text"
//                     placeholder="🔍 ابحث بالاسم، الجوال، السجل، الهوية..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
//                 />
//                 <select
//                     value={clientTypeFilter}
//                     onChange={(e) => setClientTypeFilter(e.target.value)}
//                     className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
//                 >
//                     <option value="">كل التصنيفات (أفراد وشركات)</option>
//                     <option value="individual">أفراد</option>
//                     {/* 💡 التعديل هنا: تم تغيير القيمة من company إلى corporate لتطابق الباك إند */}
//                     <option value="corporate">شركات ومؤسسات</option>
//                 </select>
//                 <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer justify-self-start sm:justify-self-end">
//                     <input
//                         type="checkbox"
//                         checked={showArchived}
//                         onChange={(e) => setShowArchived(e.target.checked)}
//                         className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
//                     />
//                     <span>عرض الموكلين المؤرشفين فقط</span>
//                 </label>
//             </div>

//             {/* ثالثاً: جدول استعراض البيانات الأساسي */}
//             <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
//                 {loading ? (
//                     <p className="text-center py-12 text-xs text-slate-400">جاري تحميل سجلات الموكلين...</p>
//                 ) : clients.length === 0 ? (
//                     <p className="text-center py-12 text-xs text-slate-400">لا توجد نتائج مطابقة لخيارات البحث الحالية.</p>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-right border-collapse text-xs">
//                             <thead>
//                                 <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
//                                     <th className="p-4">اسم الموكل / الكيان</th>
//                                     <th className="p-4">التصنيف</th>
//                                     <th className="p-4">المعرف القانوني</th>
//                                     <th className="p-4">رقم الجوال</th>
//                                     <th className="p-4">البريد الإلكتروني</th>
//                                     <th className="p-4 text-center">الإجراءات</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
//                                 {clients.map((client) => (
//                                     <tr key={client.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
//                                         <td className="p-4 font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => openClientProfile(client)}>
//                                             {client.name}
//                                         </td>
//                                         <td className="p-4">
//                                             <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${client.client_type === 'corporate' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'}`}>
//                                                 {client.client_type === 'corporate' ? 'شركة / مؤسسة' : 'فرد'}
//                                             </span>
//                                         </td>
//                                         <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
//                                             {client.client_type === 'corporate' ? `سجل: ${client.cr_number}` : `هوية: ${client.national_id}`}
//                                         </td>
//                                         <td className="p-4 font-mono">{client.phone_number}</td>
//                                         <td className="p-4 text-slate-500">{client.email || '-'}</td>
//                                         <td className="p-4 flex items-center justify-center gap-2">
//                                             <button onClick={() => openEditModal(client)} className="px-2 py-1 text-slate-500 hover:text-blue-600 font-medium">تعديل</button>
//                                             {client.is_active && (
//                                                 <button onClick={() => handleSoftDelete(client.id, client.name)} className="px-2 py-1 text-red-400 hover:text-red-600 font-medium">أرشفة</button>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>

//             {/* رابعاً: الـ Dynamic Modal Form لتفادي الأخطاء القانونية */}
//             {isFormModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//                     <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
//                         <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
//                             <h3 className="text-xs font-bold text-slate-900 dark:text-white">
//                                 {editingClient ? "📝 تعديل بيانات الموكل" : "➕ إضافة موكل جديد للنظام"}
//                             </h3>
//                             <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
//                         </div>
//                         <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-right" dir="rtl">

//                             {/* 1. حقل تصنيف الكيان القانوني */}
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-500 mb-1">تصنيف الكيان القانوني *</label>
//                                 <select
//                                     value={formData.client_type}
//                                     onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
//                                     className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
//                                 >
//                                     <option value="individual">أفراد (مواطن / مقيم)</option>
//                                     {/* 💡 تم التعديل إلى corporate ليطابق الـ Enum تماماً */}
//                                     <option value="corporate">شركات / مؤسسات / كيانات تجارية</option>
//                                 </select>
//                             </div>

//                             {/* 2. الحقول الديناميكية المتغيرة بناءً على التصنيف */}
//                             {formData.client_type === "individual" ? (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
//                                     <div>
//                                         <label className="block text-xs font-semibold text-slate-500 mb-1">اسم الموكل الكامل *</label>
//                                         <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-semibold text-slate-500 mb-1">رقم الهوية الوطنية / الإقامة *</label>
//                                         {/* 💡 مطابقة حقل national_id */}
//                                         <input type="text" required maxLength={10} value={formData.national_id} onChange={(e) => setFormData({ ...formData, national_id: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono" />
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-4 animate-in fade-in duration-150">
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-xs font-semibold text-slate-500 mb-1">اسم الشركة / الكيان التجاري *</label>
//                                             <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs font-semibold text-slate-500 mb-1">رقم السجل التجاري CR *</label>
//                                             {/* 💡 تم التعديل إلى commercial_register بدلاً من cr_number */}
//                                             <input type="text" required value={formData.commercial_register} onChange={(e) => setFormData({ ...formData, commercial_register: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono" />
//                                         </div>
//                                     </div>
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
//                                         <div>
//                                             <label className="block text-xs font-semibold text-slate-500 mb-1">الشخص المسؤول عن التواصل *</label>
//                                             {/* 💡 تم التعديل إلى company_representative بدلاً من contact_person */}
//                                             <input type="text" required={formData.client_type === "corporate"} placeholder="اسم الممثل القانوني" value={formData.company_representative} onChange={(e) => setFormData({ ...formData, company_representative: e.target.value })} className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs font-semibold text-slate-500 mb-1">العنوان الوطني / تفاصيل إضافية</label>
//                                             <input type="text" placeholder="رقم المبنى، الحي" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* 3. حقول الاتصال الأساسية */}
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-500 mb-1">رقم الجوال *</label>
//                                     {/* 💡 تم التعديل إلى phone_number بدلاً من phone */}
//                                     <input type="tel" required placeholder="05xxxxxxxx" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-500 mb-1">البريد الإلكتروني</label>
//                                     <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
//                                 </div>
//                             </div>

//                             <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
//                                 <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">إلغاء</button>
//                                 <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:bg-blue-400">
//                                     {isSubmitting ? 'جاري الحفظ...' : 'حفظ الملف برمجياً'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//             {/* خامساً: لوحة استعراض سجل الموكل (Client Profile Drawer) */}
//             {isProfileDrawerOpen && selectedClient && (
//                 <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
//                     <div className="w-full max-w-xl bg-white dark:bg-slate-800 h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 text-right overflow-y-auto">
//                         <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
//                             <div>
//                                 <h3 className="text-sm font-bold text-slate-900 dark:text-white">🗂️ ملف الموكل: {selectedClient.name}</h3>
//                                 <p className="text-[11px] text-slate-400 mt-0.5">تاريخ الكيان وسجل المعاملات القانونية الحية داخل المكتب.</p>
//                             </div>
//                             <button onClick={() => setIsProfileDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 text-base font-bold">✕</button>
//                         </div>

//                         {/* التبويبات الدلالية الفاخرة للعميل */}
//                         <div className="flex border-b border-slate-100 dark:border-slate-700 my-4 text-xs">
//                             <button onClick={() => setActiveTab("cases")} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'cases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>💼 القضايا المرتبطة ({selectedClient.cases?.length || 0})</button>
//                             <button onClick={() => setActiveTab("documents")} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>📄 المستندات المجمعة</button>
//                         </div>

//                         {/* محتوى التبويبات الذكي */}
//                         <div className="flex-1 overflow-y-auto text-xs">
//                             {activeTab === "cases" ? (
//                                 !selectedClient.cases || selectedClient.cases.length === 0 ? (
//                                     <p className="text-center py-12 text-slate-400">لا توجد قضايا مسجلة لهذا العميل حالياً.</p>
//                                 ) : (
//                                     <div className="space-y-3">
//                                         {selectedClient.cases.map(c => (
//                                             <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
//                                                 <div>
//                                                     <p className="font-bold text-slate-800 dark:text-white">{c.title}</p>
//                                                     <p className="text-[11px] text-slate-400 mt-0.5">رقم القضية: {c.case_number || 'غير محدد'} | النوع: {c.case_type}</p>
//                                                 </div>
//                                                 <span className="px-2 py-0.5 font-bold text-[10px] rounded bg-blue-100 text-blue-700 dark:bg-blue-950/40">{c.status}</span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )
//                             ) : (
//                                 // تبويب تجميع كل ملفات العميل من كافة قضاياه في مكان واحد
//                                 <div className="space-y-2">
//                                     <p className="text-[11px] text-slate-400 mb-3">كافة المرفقات المرفوعة حياً داخل عرائض وجلسات قضايا الموكل:</p>
//                                     {!selectedClient.cases ? (
//                                         <p className="text-center py-6 text-slate-400">لا توجد ملفات متوفرة.</p>
//                                     ) : (
//                                         selectedClient.cases.flatMap(c => c.attachments || []).length === 0 ? (
//                                             <p className="text-center py-6 text-slate-400">لم يتم رفع مستندات رسمية في ملفات القضايا بعد.</p>
//                                         ) : (
//                                             selectedClient.cases.flatMap(c => c.attachments || []).map(att => (
//                                                 <div key={att.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
//                                                     <span className="font-medium truncate max-w-[250px]">{att.original_name}</span>
//                                                     <a href={`${apiClient.defaults.baseURL}/documents/download/${att.id}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">تحميل المرفق 📥</a>
//                                                 </div>
//                                             ))
//                                         )
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


"use client";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/services/apiClient";
import { 
    Folder, UserPlus, Search, Filter, Archive, Users, Building2, 
    Mail, Phone, ShieldCheck, FileText, Download, Briefcase, 
    MoreHorizontal, Edit3, Trash2, X, Loader2, MapPin, IDCard 
} from "lucide-react";

export default function ClientsPage() {
    // 📋 حالات عرض البيانات والفلترة
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [clientTypeFilter, setClientTypeFilter] = useState(""); // individual / corporate
    const [showArchived, setShowArchived] = useState(false); // عرض المؤرشفين (is_active)

    // 🗂️ حالات التحكم في النوافذ (Modals / Drawers)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null); // للملف الشخصي الجانبي
    const [activeTab, setActiveTab] = useState("cases"); // cases / documents
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 📝 حالة كائن البيانات للنموذج (Form Data)
    const [formData, setFormData] = useState({
        client_type: "individual", 
        name: "",
        national_id: "",
        commercial_register: "",    
        company_representative: "", 
        email: "",
        phone_number: "",          
        address: ""
    });

    // 🔍 1. دالة جلب البيانات من الباك إند
    const fetchClients = useCallback(async (search = searchTerm) => {
        try {
            setLoading(true);
            const params = {
                skip: 0,
                limit: 100,
                include_archived: showArchived 
            };

            if (search && search.trim() !== "") {
                params.search = search;
            }

            if (clientTypeFilter) {
                params.client_type = clientTypeFilter; 
            }

            const response = await apiClient.get("/clients/", { params });
            setClients(response.data);
        } catch (err) {
            console.error("خطأ أثناء جلب بيانات الموكلين:", err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, clientTypeFilter, showArchived]);

    // ⏱️ تطبيق الـ Debounce (300ms) للبحث لحماية السيرفر المحلي
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchClients(searchTerm);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchClients]);

    // استدعاء الجلب عند تغيير الفلاتر الأخرى فوراً
    useEffect(() => {
        fetchClients();
    }, [clientTypeFilter, showArchived]);

    // ➕ 2. معالجة حفظ البيانات (إنشاء / تعديل)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = { ...formData };
            if (formData.client_type === "individual") {
                payload.commercial_register = null;
                payload.company_representative = null;
            } else {
                payload.national_id = null;
            }

            if (editingClient) {
                const response = await apiClient.patch(`/clients/${editingClient.id}`, payload);
                setClients(prev => prev.map(c => c.id === editingClient.id ? response.data : c));
            } else {
                const response = await apiClient.post("/clients/", payload);
                setClients(prev => [response.data, ...prev]);
            }

            setIsFormModalOpen(false);
            resetForm();
        } catch (err) {
            alert(`⚠️ خطأ: ${err.response?.data?.detail || "فشل في حفظ البيانات"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🗑️ 3. الأرشفة الصامتة (Soft Delete) لحماية العلاقات الخارجية
    const handleSoftDelete = async (clientId, clientName) => {
        if (!confirm(`هل أنت متأكد من نقل الموكل "${clientName}" إلى الأرشيف الصامت؟ لحماية سجل القضايا المرتبطة.`)) return;
        try {
            await apiClient.delete(`/clients/${clientId}`);
            setClients(prev => prev.filter(c => c.id !== clientId));
            if (selectedClient?.id === clientId) setIsProfileDrawerOpen(false);
        } catch (err) {
            alert("⚠️ فشل في أرشفة الموكل، قد يكون مرتبط ببيانات حرجة.");
        }
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setFormData({
            client_type: client.client_type,
            name: client.name,
            national_id: client.national_id || "",
            commercial_register: client.commercial_register || "",
            company_representative: client.company_representative || "",
            email: client.email || "",
            phone_number: client.phone_number || "",
            address: client.address || ""
        });
        setIsFormModalOpen(true);
    };

    const openClientProfile = async (client) => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/clients/${client.id}`);
            setSelectedClient(response.data);
            setIsProfileDrawerOpen(true);
        } catch (err) {
            console.error("خطأ أثناء جلب ملف الموكل وقضاياه الحصرية:", err);
            setSelectedClient(client);
            setIsProfileDrawerOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingClient(null);
        setFormData({
            client_type: "individual", name: "", national_id: "", commercial_register: "",
            company_representative: "", email: "", phone_number: "", address: ""
        });
    };

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">

            
            {/* أولاً: الهيدر الرئيسي بتصميم ملكي (Midnight Navy) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0F172A] dark:bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-amber-400">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wide">إدارة ملفات الموكلين</h1>
                        <p className="text-xs text-slate-400 mt-1">أرشفة وتنظيم الكيانات التجارية والأفراد، ربط التوكيلات ومتابعة القضايا الحية حاسوبياً.</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormModalOpen(true); }}
                    className="relative z-10 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 border border-amber-400/20"
                >
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    إضافة موكل جديد
                </button>
            </div>

            {/* ثانياً: شريط التصفية والبحث المتقدم */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#141C2F] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الجوال، السجل، الهوية..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white placeholder-slate-400 transition-colors"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-56 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={clientTypeFilter}
                            onChange={(e) => setClientTypeFilter(e.target.value)}
                            className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer text-slate-700 dark:text-slate-200 font-medium"
                        >
                            <option value="">كل التصنيفات (أفراد وشركات)</option>
                            <option value="individual">الأفراد</option>
                            <option value="corporate">الشركات والمؤسسات</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none bg-[#F8FAFC] dark:bg-[#1E293B]/30 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 dark:bg-slate-900"
                        />
                        <span>عرض السجلات المؤرشفة</span>
                    </label>
                </div>
            </div>

            {/* ثالثاً: جدول استعراض البيانات الأساسي */}
            <div className="bg-white dark:bg-[#141C2F] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden">
                {loading && clients.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        <p className="text-xs text-slate-400 font-medium">جاري فحص وتحديث قاعدة الموكلين المعمدة...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 text-xs italic">
                        لا توجد نتائج مطابقة لخيارات البحث أو الفلترة الجارية.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#1E293B]/30 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-4 font-semibold">اسم الموكل / الكيان المعني</th>
                                    <th className="p-4 font-semibold">التصنيف القانوني</th>
                                    <th className="p-4 font-semibold">المعرف الرسمي</th>
                                    <th className="p-4 font-semibold">رقم الجوال الدائم</th>
                                    <th className="p-4 font-semibold">البريد الإلكتروني</th>
                                    <th className="p-4 text-center font-semibold">التحكم والملف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/20 transition-colors group">
                                        {/* الاسم كـ تفعيل لفتح الملف الجانبي الفاخر */}
                                        <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                                            <button 
                                                onClick={() => openClientProfile(client)}
                                                className="hover:text-amber-500 dark:hover:text-amber-400 text-right transition-colors flex items-center gap-2 group"
                                            >
                                                {client.client_type === 'corporate' ? (
                                                    <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                                                ) : (
                                                    <Users className="w-4 h-4 text-blue-400 shrink-0" />
                                                )}
                                                <span className="underline decoration-transparent group-hover:decoration-current transition-all">
                                                    {client.name}
                                                </span>
                                            </button>
                                        </td>
                                        
                                        {/* نوع الموكل */}
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border ${
                                                client.client_type === 'corporate' 
                                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40' 
                                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40'
                                            }`}>
                                                {client.client_type === 'corporate' ? 'شركة / كيان تجاري' : 'فرد / مستند مستقل'}
                                            </span>
                                        </td>
                                        
                                        {/* المعرف القانوني المنقح برمجياً */}
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                                            {client.client_type === 'corporate' ? (
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                                    سجل: {client.commercial_register || client.cr_number}
                                                </span>
                                            ) : (
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                                    هوية: {client.national_id}
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-sans">
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                {client.phone_number}
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 text-slate-500 dark:text-slate-400 font-sans">{client.email || <span className="text-slate-300 italic">غير مدون</span>}</td>
                                        
                                        {/* أزرار الإجراءات الأنيقة والمتباعدة */}
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => openEditModal(client)} 
                                                    className="text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg hover:border-amber-500/30 transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    تعديل
                                                </button>
                                                {client.is_active && (
                                                    <button 
                                                        onClick={() => handleSoftDelete(client.id, client.name)} 
                                                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 border border-transparent hover:border-rose-500/20 px-2 py-1 rounded-lg transition-colors"
                                                    >
                                                        <Archive className="w-3.5 h-3.5" />
                                                        أرشفة
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* رابعاً: الـ Dynamic Modal Form لتفادي الأخطاء القانونية */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#141C2F] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#1E293B]/30">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
                                <ShieldCheck className="w-4 h-4 text-amber-500" />
                                <h3>{editingClient ? "تعديل ميثاق وبيانات الموكل" : "تأسيس قيد موكل جديد بالنظام"}</h3>
                            </div>
                            <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-sm">✕</button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {/* 1. حقل تصنيف الكيان القانوني */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">تصنيف الكيان القانوني للملف *</label>
                                <select
                                    value={formData.client_type}
                                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white font-bold cursor-pointer"
                                >
                                    <option value="individual">أفراد (مواطن / مقيم دائم)</option>
                                    <option value="corporate">شركات / مؤسسات / كيانات اعتبارية</option>
                                </select>
                            </div>

                            {/* 2. الحقول الديناميكية المتغيرة بناءً على التصنيف */}
                            {formData.client_type === "individual" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">اسم الموكل بالكامل *</label>
                                        <input 
                                            type="text" required value={formData.name} 
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                            className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">رقم الهوية الوطنية / الإقامة *</label>
                                        <input 
                                            type="text" required maxLength={10} value={formData.national_id} 
                                            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })} 
                                            className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white tracking-wider" 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">اسم المنشأة / الشركة *</label>
                                            <input 
                                                type="text" required value={formData.name} 
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                                className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">رقم السجل التجاري CR *</label>
                                            <input 
                                                type="text" required value={formData.commercial_register} 
                                                onChange={(e) => setFormData({ ...formData, commercial_register: e.target.value })} 
                                                className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white tracking-wide" 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-amber-400/80 mb-1.5">الممثل أو المفوض القانوني *</label>
                                            <input 
                                                type="text" required={formData.client_type === "corporate"} placeholder="اسم الشخص المسؤول" 
                                                value={formData.company_representative} 
                                                onChange={(e) => setFormData({ ...formData, company_representative: e.target.value })} 
                                                className="w-full p-2.5 text-xs bg-white dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">المقر / العنوان الوطني</label>
                                            <input 
                                                type="text" placeholder="مثال: الرياض، برج العليا" 
                                                value={formData.address || ''} 
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                                                className="w-full p-2.5 text-xs bg-white dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. حقول الاتصال الأساسية */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">رقم الجوال الفعال *</label>
                                    <input 
                                        type="tel" required placeholder="05xxxxxxxx" value={formData.phone_number} 
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} 
                                        className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800 dark:text-white" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">المراسلات الإلكترونية (Email)</label>
                                    <input 
                                        type="email" placeholder="client@domain.com" value={formData.email} 
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                        className="w-full p-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-sans text-slate-800 dark:text-white" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">إلغاء</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 border border-amber-400/10 transition-all"
                                >
                                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {editingClient ? 'تحديث المستند' : 'حفظ وإدراج كملف آمن'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* خامساً: لوحة استعراض سجل الموكل (Client Profile Drawer الفاخر الجانبي) */}
            {isProfileDrawerOpen && selectedClient && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-start animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-white dark:bg-[#141C2F] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-right border-r border-slate-100 dark:border-slate-800">
                        
                        {/* رأس الـ Drawer */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#1E293B]/20">
                            <div>
                                <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-md mb-2 inline-block">
                                    الملف التعريفي الموحد
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {selectedClient.client_type === 'corporate' ? <Building2 className="w-4 h-4 text-purple-400" /> : <Users className="w-4 h-4 text-blue-400" />}
                                    {selectedClient.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs mt-2">
                                    {selectedClient.phone_number && <span className="flex items-center gap-1 font-sans"><Phone className="w-3 h-3" /> {selectedClient.phone_number}</span>}
                                    {selectedClient.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedClient.address}</span>}
                                </div>
                            </div>
                            <button onClick={() => setIsProfileDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* التبويبات الدلالية الفاخرة للعميل */}
                        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-[#141C2F] text-xs">
                            <button 
                                onClick={() => setActiveTab("cases")} 
                                className={`px-4 py-3.5 font-bold transition-all relative ${activeTab === 'cases' ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    القضايا المربوطة حياً ({selectedClient.cases?.length || 0})
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab("documents")} 
                                className={`px-4 py-3.5 font-bold transition-all relative ${activeTab === 'documents' ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    تجميع الأوراق والمستندات
                                </span>
                            </button>
                        </div>

                        {/* محتوى التبويبات الذكي المريح للعين */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0B0F19]/40 space-y-4">
                            {activeTab === "cases" ? (
                                !selectedClient.cases || selectedClient.cases.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 text-xs italic bg-white dark:bg-[#141C2F] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        لا توجد قضايا مقيدة قانونياً لهذا العميل تحت السجلات الحالية.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedClient.cases.map(c => (
                                            <div key={c.id} className="p-4 bg-white dark:bg-[#141C2F] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-800 dark:text-white text-xs">{c.title}</p>
                                                    <p className="text-[11px] text-slate-400 font-sans">
                                                        رقم الدعوى: {c.case_number || 'قيد الرفع'} | نوع الاختصاص: {c.case_type}
                                                    </p>
                                                </div>
                                                <span className="px-2.5 py-0.5 font-bold text-[10px] rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 whitespace-nowrap">
                                                    {c.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[11px] text-slate-400 font-medium mb-1">المستندات المستدعاة آلياً من كافة ملفات وجلسات الموكل المتوفرة:</p>
                                    {!selectedClient.cases ? (
                                        <p className="text-center py-6 text-slate-400 text-xs">لا توجد ملفات متوفرة.</p>
                                    ) : (
                                        selectedClient.cases.flatMap(c => c.attachments || []).length === 0 ? (
                                            <div className="p-12 text-center text-slate-400 text-xs italic bg-white dark:bg-[#141C2F] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                                لم يتم إرفاق أي دفوع، صكوك أو وثائق رسمية داخل قضايا هذا الموكل بعد.
                                            </div>
                                        ) : (
                                            selectedClient.cases.flatMap(c => c.attachments || []).map(att => (
                                                <div key={att.id} className="p-3 bg-white dark:bg-[#141C2F] border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4 shadow-sm hover:border-slate-200 transition-colors">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <span className="font-medium truncate text-slate-700 dark:text-slate-300 max-w-[280px]">{att.original_name}</span>
                                                    </div>
                                                    <a 
                                                        href={`${apiClient.defaults.baseURL}/documents/download/${att.id}`} 
                                                        target="_blank" rel="noreferrer" 
                                                        className="text-amber-500 dark:text-amber-400 text-[11px] font-bold hover:underline shrink-0 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        تحميل الملف
                                                    </a>
                                                </div>
                                            ))
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}