// 'use client';
// import { useState, useEffect } from 'react';
// import apiClient from '@/services/apiClient';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, FileText, UploadCloud, Eye, Trash2, X, Download, ImageIcon } from 'lucide-react';

// export default function CasesPage() {
//     const [cases, setCases] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const router = useRouter();

//     // 📡 جلب البيانات حياً من الباك-إند عند تحميل الصفحة
//     useEffect(() => {
//         const fetchCases = async () => {
//             try {
//                 setLoading(true);
//                 setError('');
//                 // طلب مسار جلب القضايا (الباك-إند سيفلتر تلقائياً حسب توكن المستخدم)
//                 const response = await apiClient.get('/cases/');
//                 setCases(response.data);
//             } catch (err) {
//                 console.error(err);
//                 setError('حدث خطأ أثناء جلب ملفات القضايا من السيرفر.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCases();
//     }, []);

//     // 🎨 دالة ذكية لتلوين حالة القضية ديناميكياً (Status Badges)
//     const getStatusBadge = (status) => {
//         const statuses = {
//             pending: { text: "تحت الدراسة", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200" },
//             active: { text: "نشطة / متداولة", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200" },
//             appeal: { text: "قيد الاستئناف", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200" },
//             supreme: { text: "قيد المحكمة العليا", className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200" },
//             closed: { text: "مغلقة / منتهية", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300" }
//         };

//         const current = statuses[status] || { text: status, className: "bg-slate-50 text-slate-600" };
//         return (
//             <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${current.className}`}>
//                 {current.text}
//             </span>
//         );
//     };

//     return (
//         <div className="space-y-6">

//             {/* رأس الصفحة والإجراءات السريعة */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة القضايا والملفات</h2>
//                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عرض ومتابعة كافة القضايا الموزعة والصلاحيات المرتبطة بها</p>
//                 </div>
//                 <div>
//                     <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors">
//                         ＋ إضافة قضية جديدة
//                     </button>
//                 </div>
//             </div>

//             {/* عرض رسالة الخطأ إن وجدت */}
//             {error && (
//                 <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
//                     ⚠️ {error}
//                 </div>
//             )}

//             {/* الجدول الرئيسي والمحتوى */}
//             <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-right border-collapse">
//                         <thead>
//                             <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold">
//                                 <th className="p-4 w-20">رقم القضية</th>
//                                 <th className="p-4">عنوان وموضوع القضية</th>
//                                 <th className="p-4">الموكل (العميل)</th>
//                                 <th className="p-4">المحامي المسؤول</th>
//                                 <th className="p-4">الحالة</th>
//                                 <th className="p-4 text-center">الإجراءات</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">

//                             {/* 1️⃣ حالة التحميل (Skeleton Loader) */}
//                             {loading && (
//                                 Array.from({ length: 3 }).map((_, idx) => (
//                                     <tr key={idx} className="animate-pulse">
//                                         <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div></td>
//                                         <td className="p-4">
//                                             <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
//                                             <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24"></div>
//                                         </td>
//                                         <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div></td>
//                                         <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div></td>
//                                         <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div></td>
//                                         <td className="p-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-20 mx-auto"></div></td>
//                                     </tr>
//                                 ))
//                             )}

//                             {/* 2️⃣ حالة عدم وجود قضايا بعد انتهاء التحميل */}
//                             {!loading && cases.length === 0 && (
//                                 <tr>
//                                     <td colSpan="6" className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
//                                         📭 لا توجد قضايا مسجلة في النظام حالياً أو لا تملك صلاحية لاستعراضها.
//                                     </td>
//                                 </tr>
//                             )}

//                             {/* 3️⃣ عرض البيانات حياً وبشكل آمن */}
//                             {!loading && cases.map((item) => (
//                                 <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
//                                     <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
//                                         #{item.id}
//                                     </td>
//                                     <td className="p-4">
//                                         <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
//                                         <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">{item.description}</p>
//                                     </td>
//                                     <td className="p-4">
//                                         {/* استدعاء آمن ومحمي للبيانات المترابطة (Client Eager Loading) */}
//                                         <div className="font-medium text-slate-800 dark:text-slate-300">
//                                             {item.client?.name || <span className="text-slate-400 text-xs">غير محدد</span>}
//                                         </div>
//                                     </td>
//                                     <td className="p-4">
//                                         {/* استدعاء آمن ومحمي لبيانات المحامي (Lawyer Eager Loading) */}
//                                         <div className="font-medium text-slate-800 dark:text-slate-300">
//                                             {item.lawyer?.full_name || <span className="text-slate-400 text-xs">غير معين</span>}
//                                         </div>
//                                     </td>
//                                     <td className="p-4">
//                                         {getStatusBadge(item.status)}
//                                     </td>
//                                     <td className="p-4 text-center">
//                                         <button
//                                             onClick={() => router.push(`/dashboard/cases/${item.id}`)}
//                                             className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
//                                         >
//                                             استعراض التفاصيل
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}

//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//         </div>
//     );
// }




'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, UploadCloud, Eye, Trash2, X, Download, ImageIcon, Paperclip } from 'lucide-react';

export default function CasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [clients, setClients] = useState([]);
    const [lawyers, setLawyers] = useState([]);

    const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
    const [newCaseData, setNewCaseData] = useState({
        title: '',
        description: '',
        status: 'pending',
        case_number: '',
        case_type: 'commercial',
        court_name: '',
        client_id: '',
        lawyer_id: ''
    });

    // 📂 حالة تخزين الملفات المختارة للرفع
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const fetchCases = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get('/cases/');
            setCases(response.data);
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء جلب ملفات القضايا من السيرفر.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        // 1. جلب بيانات العملاء
        try {
            const clientsRes = await apiClient.get('/clients/');
            setClients(clientsRes.data);
        } catch (err) {
            console.error('❌ خطأ في جلب بيانات العملاء:', err);
        }

        // 2. جلب بيانات المحامين والموظفين بعد إضافة المسار في الباك إند
        try {
            const lawyersRes = await apiClient.get('/auth/users/');
            setLawyers(lawyersRes.data);
        } catch (err) {
            console.error('❌ خطأ في جلب بيانات المحامين:', err);
        }
    };

    useEffect(() => {
        fetchCases();
        fetchDropdownData();
    }, []);

    // 📥 التعامل مع اختيار الملفات المتعددة
    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // دمج الملفات الجديدة مع المختارة سابقاً (إذا رغب المستخدم في الاختيار أكثر من مرة)
            setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
        }
    };

    // 🗑️ حذف ملف من القائمة قبل الرفع
    const removeFileFromList = (indexToRemove) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== indexToRemove));
    };

    // 💾 دالة إرسال البيانات والملفات الشاملة باستخدام FormData
    const handleCreateCaseSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            // ⚠️ بناء الـ FormData للشحن المتكامل (بيانات + ملفات ثنائية)
            const formData = new FormData();

            // 1. إضافة البيانات النصية للـ Form بذكاء واجتناب النصوص الفارغة
            Object.keys(newCaseData).forEach((key) => {
                const value = newCaseData[key];

                // إذا كان الحقل يحتوي على قيمة نصية فعلية أو رقم
                if (value !== '' && value !== null && value !== undefined) {
                    // 🌟 حل مشكلة الـ Alias: الباك إند يتوقع 'status' والـ State لديك ترسل 'status' بالفعل، هذا ممتاز.
                    formData.append(key, value);
                }
            });

            // 2. حلقة التكرار لإضافة كافة الملفات المتعددة تحت مفتاح 'files' ليفهمها الباك إند كقائمة
            selectedFiles.forEach((file) => {
                formData.append('files', file);
            });

            // 🌟 تعديل الـ Headers: يُفضل في Axios ترك المتصفح يحدد الـ boundary تلقائياً عند إرسال FormData
            const response = await apiClient.post('/cases/', formData, {
                headers: {
                    // تركها فارغة أو عدم تحديدها يجعل المتصفح يضع الترويسة الصحيحة مع الـ Boundary المناسب للملفات المتعددة
                    'Content-Type': 'multipart/form-data',
                },
            });

            setCases([response.data, ...cases]);

            // إغلاق المودال وتصفير الواجهة
            setIsCaseModalOpen(false);
            setSelectedFiles([]); // تصفير الملفات
            setNewCaseData({
                title: '', description: '', status: 'pending',
                case_number: '', case_type: 'commercial', court_name: '',
                client_id: '', lawyer_id: ''
            });
        } catch (err) {
            console.error("تفاصيل الخطأ كاملة:", err.response?.data || err);

            // استخراج رسالة الخطأ القادمة من FastAPI إن وجدت وعرضها للمستخدم لتسهيل تتبع المشاكل
            const errorDetail = err.response?.data?.detail;
            const errorMessage = typeof errorDetail === 'string'
                ? errorDetail
                : 'حدث خطأ أثناء إضافة القضية أو رفع الملفات المتعددة.';

            alert(`⚠️ خطأ: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            pending: { text: "تحت الدراسة", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200" },
            active: { text: "نشطة / متداولة", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200" },
            appeal: { text: "قيد الاستئناف", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200" },
            supreme: { text: "قيد المحكمة العليا", className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200" },
            closed: { text: "مغلقة / منتهية", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300" }
        };
        const current = statuses[status] || { text: status, className: "bg-slate-50 text-slate-600" };
        return (
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${current.className}`}>
                {current.text}
            </span>
        );
    };

    return (
        <div className="space-y-6">

            {/* رأس الصفحة والإجراءات */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة القضايا والملفات</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عرض ومتابعة كافة القضايا الموزعة والصلاحيات المرتبطة بها</p>
                </div>
                <div>
                    <button
                        onClick={() => setIsCaseModalOpen(true)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
                    >
                        ＋ إضافة قضية جديدة
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* الجدول الرئيسي */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                                <th className="p-4 w-20">رقم النظام</th>
                                <th className="p-4">عنوان وموضوع القضية</th>
                                <th className="p-4">الموكل (العميل)</th>
                                <th className="p-4">المحامي المسؤول</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
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

                            {!loading && cases.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                                        📭 لا توجد قضايا مسجلة في النظام حالياً أو لا تملك صلاحية لاستعراضها.
                                    </td>
                                </tr>
                            )}

                            {!loading && cases.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">#{item.id}</td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                        <div className="flex gap-2 items-center mt-1 text-xs text-slate-400">
                                            {item.case_number && <span>رقم القيد: {item.case_number}</span>}
                                            {item.court_name && <span>• {item.court_name}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800 dark:text-slate-300">{item.client?.name || <span className="text-slate-400 text-xs">غير محدد</span>}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800 dark:text-slate-300">{item.lawyer?.full_name || <span className="text-slate-400 text-xs">غير معين</span>}</div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(item.status)}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => router.push(`/dashboard/cases/${item.id}`)}
                                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            استعراض التفاصيل
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🖥️ الـ Popup / Modal المطور بالكامل مع الرفع المتعدد للمستندات */}
            {isCaseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden my-8">

                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">إضافة قضية جديدة للنظام</h3>
                                <p className="text-xs text-slate-400 mt-0.5">أدخل تفاصيل وموضوع ملف القضية الجديد وارفع مستنداتها</p>
                            </div>
                            <button onClick={() => setIsCaseModalOpen(false)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCaseSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان / موضوع القضية *</label>
                                    <input type="text" required placeholder="مثال: قضية نزاع تجاري لشركة س" value={newCaseData.title} onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم قيد القضية (في المحكمة)</label>
                                    <input type="text" placeholder="مثال: 1445/هـ/203" value={newCaseData.case_number} onChange={(e) => setNewCaseData({ ...newCaseData, case_number: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">حالة القضية الابتدائية</label>
                                    <select value={newCaseData.status} onChange={(e) => setNewCaseData({ ...newCaseData, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
                                        <option value="pending">تحت الدراسة (Pending)</option>
                                        <option value="active">نشطة / متداولة (Active)</option>
                                        <option value="appeal">قيد الاستئناف (Appeal)</option>
                                        <option value="supreme">قيد المحكمة العليا (Supreme)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">تصنيف/نوع القضية</label>
                                    <select value={newCaseData.case_type} onChange={(e) => setNewCaseData({ ...newCaseData, case_type: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
                                        <option value="commercial">تجاري</option>
                                        <option value="labor">عمالي</option>
                                        <option value="criminal">جنائي</option>
                                        <option value="civil">حقوقي / مدني</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المحكمة المختصة</label>
                                    <input type="text" placeholder="مثال: المحكمة العمالية بجدة" value={newCaseData.court_name} onChange={(e) => setNewCaseData({ ...newCaseData, court_name: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الموكل (العميل) *</label>
                                    <select required value={newCaseData.client_id} onChange={(e) => setNewCaseData({ ...newCaseData, client_id: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
                                        <option value="">-- اختر الموكل --</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المحامي المسؤول *</label>
                                    <select required value={newCaseData.lawyer_id} onChange={(e) => setNewCaseData({ ...newCaseData, lawyer_id: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
                                        <option value="">-- تعيين محامي --</option>
                                        {lawyers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">شرح وتفاصيل إضافية</label>
                                <textarea rows="2" placeholder="اكتب هنا ملخص الدعوى..." value={newCaseData.description} onChange={(e) => setNewCaseData({ ...newCaseData, description: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" ></textarea>
                            </div>

                            {/* 📂 حقل رفع الملفات المتعددة المتطور */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">مستندات وأوراق القضية (مرفقات متعددة)</label>
                                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-center group cursor-pointer">
                                    <input
                                        type="file"
                                        multiple // 🌟 تفعيل الاختيار المتعدد
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-1">
                                        <UploadCloud size={28} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">اضغط هنا أو اسحب الملفات لرفعها</p>
                                        <p className="text-[10px] text-slate-400">يدعم الـ PDF، الصور، والمستندات القانونية (يمكنك اختيار أكثر من ملف)</p>
                                    </div>
                                </div>

                                {/* 📋 قائمة عرض الملفات المختارة حالياً مع إمكانية الحذف الفوري قبل الحفظ */}
                                {selectedFiles.length > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                            <Paperclip size={12} /> الملفات الجاهزة للرفع ({selectedFiles.length}):
                                        </p>
                                        {selectedFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-750 text-xs shadow-2xs">
                                                <div className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-200">
                                                    <FileText size={14} className="text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[280px] font-medium">{file.name}</span>
                                                    <span className="text-[10px] text-slate-400 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFileFromList(idx)}
                                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                                <button type="button" onClick={() => setIsCaseModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">إلغاء</button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-md">
                                    {isSubmitting ? 'جاري رفع البيانات والملفات...' : 'إنشاء الملف'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}