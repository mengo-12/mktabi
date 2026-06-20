"use client";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/services/apiClient"; // تأكد من مسار apiClient الخاص بمشروعك

export default function ClientsPage() {
    // 📋 حالات عرض البيانات والفلترة
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [clientTypeFilter, setClientTypeFilter] = useState(""); // individual / company
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
        client_type: "individual", // individual أو corporate (وليس company)
        name: "",
        national_id: "",
        commercial_register: "",    // مطابقة للباك إند
        company_representative: "", // مطابقة للباك إند
        email: "",
        phone_number: "",           // مطابقة للباك إند
        address: ""
    });

    // 🔍 1. دالة جلب البيانات من الباك إند مع الفلاتر والـ Debounce
    const fetchClients = useCallback(async (search = searchTerm) => {
        try {
            setLoading(true);

            const params = {
                skip: 0,
                limit: 100,
                include_archived: showArchived // الباك إند يتوقع include_archived بوليان
            };

            if (search && search.trim() !== "") {
                params.search = search;
            }

            if (clientTypeFilter) {
                params.client_type = clientTypeFilter; // سيمرر "individual" أو "corporate"
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
                // استخدام PATCH وتمرير الـ payload النظيف
                const response = await apiClient.patch(`/clients/${editingClient.id}`, payload);
                setClients(prev => prev.map(c => c.id === editingClient.id ? response.data : c));
            } else {
                // إنشاء موكل جديد
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
            // إرسال طلب DELETE ليقوم الباك إند بتحويل is_active إلى False
            await apiClient.delete(`/clients/${clientId}`);
            // إخفاء العميل حياً من القائمة النشطة الحالية
            setClients(prev => prev.filter(c => c.id !== clientId));
            if (selectedClient?.id === clientId) setIsProfileDrawerOpen(false);
        } catch (err) {
            alert("⚠️ فشل في أرشفة الموكل، قد يكون مرتبط ببيانات حرجة.");
        }
    };

    // فتح واجهة التعديل وتعبئة البيانات السابقة
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

    // فتح لوحة استعراض السجل الكامل (Drawer) للموكل
    const openClientProfile = async (client) => {
        try {
            // نفضل جلب بيانات العميل كاملة مع علاقاته (القضايا والمستندات) إذا كان الباك إند يدعم ذلك في مسار الـ GET id
            const response = await apiClient.get(`/clients/${client.id}`);
            setSelectedClient(response.data);
            setIsProfileDrawerOpen(true);
        } catch (err) {
            // حل بديل في حال عدم دعم التداخل: استخدام الكائن الحالي
            setSelectedClient(client);
            setIsProfileDrawerOpen(true);
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
        <div className="p-6 space-y-6 text-right" dir="rtl">
            {/* أولاً: شريط العناوين والأزرار الأساسية */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">📁 إدارة ملفات الموكلين</h2>
                    <p className="text-xs text-slate-400 mt-1">إضافة وتعديل وأرشفة الكيانات التجارية والأفراد ومتابعة سجلاتهم.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                    <span>➕ إضافة موكل جديد</span>
                </button>
            </div>

            {/* ثانياً: شريط التصفية والبحث المتقدم */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <input
                    type="text"
                    placeholder="🔍 ابحث بالاسم، الجوال، السجل، الهوية..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <select
                    value={clientTypeFilter}
                    onChange={(e) => setClientTypeFilter(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                    <option value="">كل التصنيفات (أفراد وشركات)</option>
                    <option value="individual">أفراد</option>
                    {/* 💡 التعديل هنا: تم تغيير القيمة من company إلى corporate لتطابق الباك إند */}
                    <option value="corporate">شركات ومؤسسات</option>
                </select>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer justify-self-start sm:justify-self-end">
                    <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={(e) => setShowArchived(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>عرض الموكلين المؤرشفين فقط</span>
                </label>
            </div>

            {/* ثالثاً: جدول استعراض البيانات الأساسي */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {loading ? (
                    <p className="text-center py-12 text-xs text-slate-400">جاري تحميل سجلات الموكلين...</p>
                ) : clients.length === 0 ? (
                    <p className="text-center py-12 text-xs text-slate-400">لا توجد نتائج مطابقة لخيارات البحث الحالية.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                                    <th className="p-4">اسم الموكل / الكيان</th>
                                    <th className="p-4">التصنيف</th>
                                    <th className="p-4">المعرف القانوني</th>
                                    <th className="p-4">رقم الجوال</th>
                                    <th className="p-4">البريد الإلكتروني</th>
                                    <th className="p-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-4 font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => openClientProfile(client)}>
                                            {client.name}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${client.client_type === 'corporate' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'}`}>
                                                {client.client_type === 'corporate' ? 'شركة / مؤسسة' : 'فرد'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                                            {client.client_type === 'corporate' ? `سجل: ${client.cr_number}` : `هوية: ${client.national_id}`}
                                        </td>
                                        <td className="p-4 font-mono">{client.phone}</td>
                                        <td className="p-4 text-slate-500">{client.email || '-'}</td>
                                        <td className="p-4 flex items-center justify-center gap-2">
                                            <button onClick={() => openEditModal(client)} className="px-2 py-1 text-slate-500 hover:text-blue-600 font-medium">تعديل</button>
                                            {client.is_active && (
                                                <button onClick={() => handleSoftDelete(client.id, client.name)} className="px-2 py-1 text-red-400 hover:text-red-600 font-medium">أرشفة</button>
                                            )}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                {editingClient ? "📝 تعديل بيانات الموكل" : "➕ إضافة موكل جديد للنظام"}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-right">
                            {/* حقل تصنيف الكيان */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">تصنيف الكيان القانوني *</label>
                                <select
                                    value={formData.client_type}
                                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="individual">أفراد (مواطن / مقيم)</option>
                                    <option value="corporate">شركات / مؤسسات / كيانات تجارية</option>
                                </select>
                            </div>

                            {/* الحقول الديناميكية المتغيرة بناءً على تصنيف العميل */}
                            {formData.client_type === "individual" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">اسم الموكل الكامل *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">رقم الهوية الوطنية / الإقامة *</label>
                                        <input type="text" required maxLength={10} value={formData.national_id} onChange={(e) => setFormData({ ...formData, national_id: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">اسم الشركة / الكيان التجاري *</label>
                                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">رقم السجل التجاري CR *</label>
                                            <input type="text" required value={formData.cr_number} onChange={(e) => setFormData({ ...formData, cr_number: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">الشخص المسؤول عن التواصل</label>
                                            <input type="text" placeholder="اسم الممثل القانوني" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">المسمى الوظيفي للممثل</label>
                                            <input type="text" placeholder="مثال: مدير الشؤون القانونية" value={formData.contact_title} onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })} className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* حقول الاتصال الأساسية الثابتة */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">رقم الجوال (صيغة دولية) *</label>
                                    <input type="tel" required placeholder="+9665xxxxxxxx" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">البريد الإلكتروني</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">العنوان الوطني الكامل</label>
                                <input type="text" placeholder="رقم المبنى، اسم الشارع، الحي، المدينة" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none" />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">إلغاء</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:bg-blue-400">{isSubmitting ? 'جاري الحفظ...' : 'حفظ الملف برمجياً'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* خامساً: لوحة استعراض سجل الموكل (Client Profile Drawer) */}
            {isProfileDrawerOpen && selectedClient && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-800 h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 text-right overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">🗂️ ملف الموكل: {selectedClient.name}</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">تاريخ الكيان وسجل المعاملات القانونية الحية داخل المكتب.</p>
                            </div>
                            <button onClick={() => setIsProfileDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 text-base font-bold">✕</button>
                        </div>

                        {/* التبويبات الدلالية الفاخرة للعميل */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700 my-4 text-xs">
                            <button onClick={() => setActiveTab("cases")} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'cases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>💼 القضايا المرتبطة ({selectedClient.cases?.length || 0})</button>
                            <button onClick={() => setActiveTab("documents")} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>📄 المستندات المجمعة</button>
                        </div>

                        {/* محتوى التبويبات الذكي */}
                        <div className="flex-1 overflow-y-auto text-xs">
                            {activeTab === "cases" ? (
                                !selectedClient.cases || selectedClient.cases.length === 0 ? (
                                    <p className="text-center py-12 text-slate-400">لا توجد قضايا مسجلة لهذا العميل حالياً.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedClient.cases.map(c => (
                                            <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">{c.title}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">رقم القضية: {c.case_number || 'غير محدد'} | النوع: {c.case_type}</p>
                                                </div>
                                                <span className="px-2 py-0.5 font-bold text-[10px] rounded bg-blue-100 text-blue-700 dark:bg-blue-950/40">{c.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                // تبويب تجميع كل ملفات العميل من كافة قضاياه في مكان واحد
                                <div className="space-y-2">
                                    <p className="text-[11px] text-slate-400 mb-3">كافة المرفقات المرفوعة حياً داخل عرائض وجلسات قضايا الموكل:</p>
                                    {!selectedClient.cases ? (
                                        <p className="text-center py-6 text-slate-400">لا توجد ملفات متوفرة.</p>
                                    ) : (
                                        selectedClient.cases.flatMap(c => c.attachments || []).length === 0 ? (
                                            <p className="text-center py-6 text-slate-400">لم يتم رفع مستندات رسمية في ملفات القضايا بعد.</p>
                                        ) : (
                                            selectedClient.cases.flatMap(c => c.attachments || []).map(att => (
                                                <div key={att.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
                                                    <span className="font-medium truncate max-w-[250px]">{att.original_name}</span>
                                                    <a href={`${apiClient.defaults.baseURL}/documents/download/${att.id}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">تحميل المرفق 📥</a>
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