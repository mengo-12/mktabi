// 'use client';
// import { useState, useEffect } from 'react';
// import apiClient from '@/services/apiClient';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, FileText, UploadCloud, Eye, Trash2, X, Download, ImageIcon, Paperclip, DollarSign, Search, Filter } from 'lucide-react';

// export default function CasesPage() {
//     const [cases, setCases] = useState([]);
//     const [filteredCases, setFilteredCases] = useState([]); // 🌟 قائمة القضايا المفلترة المعروضة
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     const [clients, setClients] = useState([]);
//     const [lawyers, setLayers] = useState([]);

//     const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

//     // 🔍 1. حالات (States) البحث والتصفية الجديدة
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [typeFilter, setTypeFilter] = useState('all');

//     // الـ State الافتراضي للمودال يشمل الحقول المالية
//     const [newCaseData, setNewCaseData] = useState({
//         title: '',
//         description: '',
//         status: 'pending',
//         case_number: '',
//         case_type: 'commercial',
//         court_name: '',
//         client_id: '',
//         lawyer_id: '',
//         case_value: 0.0,
//         amount_paid: 0.0
//     });

//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const [isEditing, setIsEditing] = useState(false);
//     const [editingCaseId, setEditingCaseId] = useState(null);

//     const router = useRouter();

//     const fetchCases = async () => {
//         try {
//             setLoading(true);
//             setError('');
//             const response = await apiClient.get('/cases/');
//             setCases(response.data);
//             setFilteredCases(response.data); // تعيين القيمة الابتدائية
//         } catch (err) {
//             console.error(err);
//             setError('حدث خطأ أثناء جلب ملفات القضايا من السيرفر.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchDropdownData = async () => {
//         try {
//             const clientsRes = await apiClient.get('/clients/');
//             setClients(clientsRes.data);
//         } catch (err) {
//             console.error('❌ خطأ في جلب بيانات العملاء:', err);
//         }

//         try {
//             const lawyersRes = await apiClient.get('/auth/users/');
//             setLayers(lawyersRes.data);
//         } catch (err) {
//             console.error('❌ خطأ في جلب بيانات المحامين:', err);
//         }
//     };

//     useEffect(() => {
//         fetchCases();
//         fetchDropdownData();
//     }, []);

//     // 🔍 2. منطق تصفية القضايا تلقائياً عند تغيير البحث أو الفلاتر
//     useEffect(() => {
//         let result = cases;

//         // الفلترة بالبحث النصي (العنوان، رقم القضية، اسم الموكل، اسم المحكمة)
//         if (searchQuery.trim() !== '') {
//             const query = searchQuery.toLowerCase();
//             result = result.filter(item => 
//                 item.title?.toLowerCase().includes(query) ||
//                 item.case_number?.toLowerCase().includes(query) ||
//                 item.court_name?.toLowerCase().includes(query) ||
//                 item.client?.name?.toLowerCase().includes(query) ||
//                 item.lawyer?.full_name?.toLowerCase().includes(query)
//             );
//         }

//         // الفلترة حسب الحالة
//         if (statusFilter !== 'all') {
//             result = result.filter(item => item.status === statusFilter);
//         }

//         // الفلترة حسب نوع القضية
//         if (typeFilter !== 'all') {
//             result = result.filter(item => item.case_type === typeFilter);
//         }

//         setFilteredCases(result);
//     }, [searchQuery, statusFilter, typeFilter, cases]);

//     const handleFileChange = (e) => {
//         if (e.target.files) {
//             const filesArray = Array.from(e.target.files);
//             setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
//         }
//     };

//     const removeFileFromList = (indexToRemove) => {
//         setSelectedFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== indexToRemove));
//     };

//     const handleCreateCaseSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             setIsSubmitting(true);

//             const formData = new FormData();
//             Object.keys(newCaseData).forEach((key) => {
//                 const value = newCaseData[key];
//                 if (value !== '' && value !== null && value !== undefined) {
//                     if (key === 'case_value' || key === 'amount_paid') {
//                         formData.append(key, String(Number(value)));
//                     } else {
//                         formData.append(key, value);
//                     }
//                 }
//             });

//             selectedFiles.forEach((file) => {
//                 formData.append('files', file);
//             });

//             let response;
//             if (isEditing) {
//                 response = await apiClient.patch(`/cases/${editingCaseId}`, formData, {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                 });
//                 setCases(prev => prev.map(c => c.id === editingCaseId ? response.data : c));
//                 alert("تم تحديث القضية وبياناتها المالية بنجاح");
//             } else {
//                 response = await apiClient.post('/cases/', formData, {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                 });
//                 setCases([response.data, ...cases]);
//                 alert("تم إنشاء القضية بنجاح");
//             }

//             setIsCaseModalOpen(false);
//             setIsEditing(false);
//             setEditingCaseId(null);
//             setSelectedFiles([]);
//             setNewCaseData({
//                 title: '', description: '', status: 'pending',
//                 case_number: '', case_type: 'commercial', court_name: '',
//                 client_id: '', lawyer_id: '', case_value: 0.0, amount_paid: 0.0
//             });

//         } catch (err) {
//             console.error("خطأ أثناء حفظ البيانات:", err.response?.data || err);
//             const errorDetail = err.response?.data?.detail;
//             const errorMessage = typeof errorDetail === 'string'
//                 ? errorDetail
//                 : (isEditing ? 'حدث خطأ أثناء تحديث القضية.' : 'حدث خطأ أثناء إنشاء القضية.');
//             alert(`⚠️ خطأ: ${errorMessage}`);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleUpdateCase = async (caseId, updatedData) => {
//         try {
//             const formData = new FormData();
//             Object.keys(updatedData).forEach((key) => {
//                 formData.append(key, updatedData[key]);
//             });

//             const response = await apiClient.patch(`/cases/${caseId}`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//             });

//             setCases(prevCases => prevCases.map(c => c.id === caseId ? response.data : c));
//             alert("تم تحديث حالة القضية بنجاح");
//         } catch (err) {
//             console.error("خطأ أثناء التحديث السريع للحالة:", err);
//             alert("فشل تحديث الحالة، يرجى التحقق من اتصال السيرفر.");
//         }
//     };

//     const openEditModal = (caseItem) => {
//         setEditingCaseId(caseItem.id);
//         setNewCaseData({
//             title: caseItem.title,
//             description: caseItem.description || '',
//             status: caseItem.status,
//             case_number: caseItem.case_number || '',
//             case_type: caseItem.case_type,
//             court_name: caseItem.court_name || '',
//             client_id: caseItem.client?.id || '',
//             lawyer_id: caseItem.lawyer?.id || '',
//             case_value: caseItem.case_value || 0.0,
//             amount_paid: caseItem.amount_paid || 0.0
//         });
//         setSelectedFiles([]);
//         setIsEditing(true);
//         setIsCaseModalOpen(true);
//     };

//     return (
//         <div className="space-y-6" dir="rtl">

//             {/* رأس الصفحة والإجراءات */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة القضايا والملفات</h2>
//                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عرض ومتابعة كافة القضايا والمستندات القانونية والمستحقات المالية</p>
//                 </div>
//                 <div>
//                     <button
//                         onClick={() => {
//                             setIsEditing(false);
//                             setNewCaseData({
//                                 title: '', description: '', status: 'pending',
//                                 case_number: '', case_type: 'commercial', court_name: '',
//                                 client_id: '', lawyer_id: '', case_value: 0.0, amount_paid: 0.0
//                             });
//                             setIsCaseModalOpen(true);
//                         }}
//                         className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
//                     >
//                         ＋ إضافة قضية جديدة
//                     </button>
//                 </div>
//             </div>

//             {error && (
//                 <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
//                     ⚠️ {error}
//                 </div>
//             )}

//             {/* 🔍 3. شريط البحث والفلاتر الجديد (UX/UI متميز) */}
//             <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                
//                 {/* مدخل البحث النصي */}
//                 <div className="relative w-full md:max-w-md">
//                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
//                         <Search size={18} />
//                     </span>
//                     <input
//                         type="text"
//                         placeholder="ابحث باسم القضية، رقم القيد، اسم الموكل، أو المحكمة..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="w-full pr-10 pl-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
//                     />
//                 </div>

//                 {/* خيارات الفرز والتصفية */}
//                 <div className="flex flex-wrap w-full md:w-auto items-center gap-3 justify-start md:justify-end">
                    
//                     {/* فلتر الحالة */}
//                     <div className="flex items-center gap-1.5 w-full sm:w-auto">
//                         <span className="text-xs font-bold text-slate-400 shrink-0">الحالة:</span>
//                         <select
//                             value={statusFilter}
//                             onChange={(e) => setStatusFilter(e.target.value)}
//                             className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
//                         >
//                             <option value="all">الكل</option>
//                             <option value="pending">تحت الدراسة</option>
//                             <option value="active">نشطة / متداولة</option>
//                             <option value="appeal">قيد الاستئناف</option>
//                             <option value="supreme">قيد المحكمة العليا</option>
//                             <option value="closed">مغلقة / منتهية</option>
//                         </select>
//                     </div>

//                     {/* فلتر النوع */}
//                     <div className="flex items-center gap-1.5 w-full sm:w-auto">
//                         <span className="text-xs font-bold text-slate-400 shrink-0">التصنيف:</span>
//                         <select
//                             value={typeFilter}
//                             onChange={(e) => setTypeFilter(e.target.value)}
//                             className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
//                         >
//                             <option value="all">الكل</option>
//                             <option value="commercial">تجاري</option>
//                             <option value="labor">عمالي</option>
//                             <option value="criminal">جنائي</option>
//                             <option value="civil">حقوقي / مدني</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             {/* الجدول الرئيسي */}
//             <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-right border-collapse">
//                         <thead>
//                             <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold">
//                                 <th className="p-4 w-20">رقم النظام</th>
//                                 <th className="p-4">عنوان وموضوع القضية</th>
//                                 <th className="p-4">الموكل (العميل)</th>
//                                 <th className="p-4">المحامي المسؤول</th>
//                                 <th className="p-4">أتعاب القضية</th>
//                                 <th className="p-4">الحالة</th>
//                                 <th className="p-4 text-center" colSpan="2">الإجراءات</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
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
//                                         <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
//                                         <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div></td>
//                                         <td className="p-4" colSpan="2"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-32 mx-auto"></div></td>
//                                     </tr>
//                                 ))
//                             )}

//                             {/* 💡 فحص ما إذا كانت نتائج الفلترة فارغة */}
//                             {!loading && filteredCases.length === 0 && (
//                                 <tr>
//                                     <td colSpan="7" className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
//                                         📭 لا توجد نتائج مطابقة لخيارات البحث أو الفلترة المحددة.
//                                     </td>
//                                 </tr>
//                             )}

//                             {!loading && filteredCases.map((item) => (
//                                 <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
//                                     <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">#{item.id}</td>
//                                     <td className="p-4">
//                                         <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
//                                         <div className="flex gap-2 items-center mt-1 text-xs text-slate-400">
//                                             {item.case_number && <span>رقم القيد: {item.case_number}</span>}
//                                             {item.court_name && <span>• {item.court_name}</span>}
//                                             <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px]">
//                                                 {item.case_type === 'commercial' ? 'تجاري' : item.case_type === 'labor' ? 'عمالي' : item.case_type === 'criminal' ? 'جنائي' : 'حقوقي'}
//                                             </span>
//                                         </div>
//                                     </td>
//                                     <td className="p-4">
//                                         <div className="font-medium text-slate-800 dark:text-slate-300">{item.client?.name || <span className="text-slate-400 text-xs">غير محدد</span>}</div>
//                                     </td>
//                                     <td className="p-4">
//                                         <div className="font-medium text-slate-800 dark:text-slate-300">{item.lawyer?.full_name || <span className="text-slate-400 text-xs">غير معين</span>}</div>
//                                     </td>
//                                     <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
//                                         <div className="font-semibold text-slate-900 dark:text-slate-100">
//                                             {item.case_value ? `${item.case_value.toLocaleString()} ر.س` : '0 ر.س'}
//                                         </div>
//                                         {item.case_value > 0 && (
//                                             <div className="mt-1 w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
//                                                 <div
//                                                     className="bg-green-500 h-1.5 rounded-full"
//                                                     style={{ width: `${Math.min((item.amount_paid / item.case_value) * 100, 100)}%` }}
//                                                 ></div>
//                                             </div>
//                                         )}
//                                     </td>
//                                     <td className="p-4">
//                                         <select
//                                             value={item.status}
//                                             onChange={(e) => handleUpdateCase(item.id, { status: e.target.value })}
//                                             className="text-xs font-bold rounded-full border px-2 py-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
//                                         >
//                                             <option value="pending">تحت الدراسة</option>
//                                             <option value="active">نشطة / متداولة</option>
//                                             <option value="appeal">قيد الاستئناف</option>
//                                             <option value="supreme">قيد المحكمة العليا</option>
//                                             <option value="closed">مغلقة / منتهية</option>
//                                         </select>
//                                     </td>
//                                     <td className="p-4 text-center">
//                                         <button
//                                             onClick={() => router.push(`/dashboard/cases/${item.id}`)}
//                                             className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
//                                         >
//                                             استعراض التفاصيل
//                                         </button>
//                                     </td>
//                                     <td className="p-4 text-center">
//                                         <button
//                                             onClick={() => openEditModal(item)}
//                                             className="px-3 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors"
//                                         >
//                                             تعديل
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Popup / Modal المطور بالشؤون المالية والمستندات */}
//             {isCaseModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
//                     <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden my-8">

//                         <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
//                             <div>
//                                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">
//                                     {isEditing ? 'تعديل بيانات القضية وعقد الأتعاب' : 'إضافة قضية جديدة للنظام'}
//                                 </h3>
//                                 <p className="text-xs text-slate-400 mt-0.5">أدخل تفاصيل القضية، البيانات المالية، وارفع المستندات القانونية الخاصة بها</p>
//                             </div>
//                             <button onClick={() => { setIsCaseModalOpen(false); setIsEditing(false); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
//                                 <X size={18} />
//                             </button>
//                         </div>

//                         <form onSubmit={handleCreateCaseSubmit} className="p-5 space-y-4">
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div className="sm:col-span-2">
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان / موضوع القضية *</label>
//                                     <input type="text" required placeholder="مثال: قضية نزاع تجاري لشركة س" value={newCaseData.title} onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم قيد القضية (في المحكمة)</label>
//                                     <input type="text" placeholder="مثال: 1445/هـ/203" value={newCaseData.case_number} onChange={(e) => setNewCaseData({ ...newCaseData, case_number: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">حالة القضية الابتدائية</label>
//                                     <select value={newCaseData.status} onChange={(e) => setNewCaseData({ ...newCaseData, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
//                                         <option value="pending">تحت الدراسة (Pending)</option>
//                                         <option value="active">نشطة / متداولة (Active)</option>
//                                         <option value="appeal">قيد الاستئناف (Appeal)</option>
//                                         <option value="supreme">قيد المحكمة العليا (Supreme)</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">تصنيف/نوع القضية</label>
//                                     <select value={newCaseData.case_type} onChange={(e) => setNewCaseData({ ...newCaseData, case_type: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
//                                         <option value="commercial">تجاري</option>
//                                         <option value="labor">عمالي</option>
//                                         <option value="criminal">جنائي</option>
//                                         <option value="civil">حقوقي / مدني</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المحكمة المختصة</label>
//                                     <input type="text" placeholder="مثال: المحكمة العمالية بجدة" value={newCaseData.court_name} onChange={(e) => setNewCaseData({ ...newCaseData, court_name: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الموكل (العميل) *</label>
//                                     <select required value={newCaseData.client_id} onChange={(e) => setNewCaseData({ ...newCaseData, client_id: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
//                                         <option value="">-- اختر الموكل --</option>
//                                         {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المحامي المسؤول *</label>
//                                     <select required value={newCaseData.lawyer_id} onChange={(e) => setNewCaseData({ ...newCaseData, lawyer_id: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white">
//                                         <option value="">-- تعيين محامي --</option>
//                                         {lawyers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
//                                         <DollarSign size={12} className="text-blue-500" /> إجمالي أتعاب القضية (ر.س)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         step="any"
//                                         placeholder="0.00"
//                                         value={newCaseData.case_value}
//                                         onChange={(e) => setNewCaseData({ ...newCaseData, case_value: parseFloat(e.target.value) || 0 })}
//                                         className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-900 dark:text-white"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
//                                         <DollarSign size={12} className="text-green-500" /> المبلغ المسدد حالياً (ر.س)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         step="any"
//                                         placeholder="0.00"
//                                         value={newCaseData.amount_paid}
//                                         onChange={(e) => setNewCaseData({ ...newCaseData, amount_paid: parseFloat(e.target.value) || 0 })}
//                                         className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-900 dark:text-white"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">شرح وتفاصيل إضافية</label>
//                                 <textarea rows="2" placeholder="اكتب هنا ملخص الدعوى..." value={newCaseData.description} onChange={(e) => setNewCaseData({ ...newCaseData, description: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" ></textarea>
//                             </div>

//                             <div className="space-y-2">
//                                 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">مستندات وأوراق القضية (مرفقات متعددة)</label>
//                                 <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-center group cursor-pointer">
//                                     <input
//                                         type="file"
//                                         multiple
//                                         onChange={handleFileChange}
//                                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                                     />
//                                     <div className="flex flex-col items-center justify-center space-y-1">
//                                         <UploadCloud size={28} className="text-blue-500 group-hover:scale-110 transition-transform" />
//                                         <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">اضغط هنا أو اسحب الملفات لرفعها</p>
//                                         <p className="text-[10px] text-slate-400">يدعم الـ PDF، الصور، والمستندات القانونية</p>
//                                     </div>
//                                 </div>

//                                 {selectedFiles.length > 0 && (
//                                     <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
//                                         <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
//                                             <Paperclip size={12} /> الملفات الجاهزة للرفع ({selectedFiles.length}):
//                                         </p>
//                                         {selectedFiles.map((file, idx) => (
//                                             <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-xs shadow-2xs">
//                                                 <div className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-200">
//                                                     <FileText size={14} className="text-slate-400 shrink-0" />
//                                                     <span className="truncate max-w-[280px] font-medium">{file.name}</span>
//                                                     <span className="text-[10px] text-slate-400 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
//                                                 </div>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => removeFileFromList(idx)}
//                                                     className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
//                                                 >
//                                                     <X size={14} />
//                                                 </button>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
//                                 <button type="button" onClick={() => setIsCaseModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">إلغاء</button>
//                                 <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-md">
//                                     {isSubmitting ? 'جاري حفظ البيانات والملفات...' : (isEditing ? 'تعديل وحفظ التغييرات' : 'إنشاء قضية جديدة')}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation';
import { 
    Briefcase, 
    Plus, 
    Search, 
    Filter, 
    Building2, 
    User, 
    Scale, 
    DollarSign, 
    ChevronLeft, 
    AlertCircle, 
    Loader2, 
    X, 
    UploadCloud, 
    Paperclip, 
    FileText 
} from 'lucide-react';

export default function CasesPage() {
    const [cases, setCases] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]); // قائمة القضايا المفلترة المعروضة
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [clients, setClients] = useState([]);
    const [lawyers, setLayers] = useState([]);

    const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

    // حالات البحث والتصفية
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // الـ State الافتراضي للمودال يشمل الحقول المالية
    const [newCaseData, setNewCaseData] = useState({
        title: '',
        description: '',
        status: 'pending',
        case_number: '',
        case_type: 'commercial',
        court_name: '',
        client_id: '',
        lawyer_id: '',
        case_value: 0.0,
        amount_paid: 0.0
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editingCaseId, setEditingCaseId] = useState(null);

    const router = useRouter();

    const fetchCases = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get('/cases/');
            setCases(response.data);
            setFilteredCases(response.data); // تعيين القيمة الابتدائية
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء جلب ملفات القضايا من السيرفر.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const clientsRes = await apiClient.get('/clients/');
            setClients(clientsRes.data);
        } catch (err) {
            console.error('❌ خطأ في جلب بيانات العملاء:', err);
        }

        try {
            const lawyersRes = await apiClient.get('/auth/users/');
            setLayers(lawyersRes.data);
        } catch (err) {
            console.error('❌ خطأ في جلب بيانات المحامين:', err);
        }
    };

    useEffect(() => {
        fetchCases();
        fetchDropdownData();
    }, []);

    // منطق تصفية القضايا تلقائياً عند تغيير البحث أو الفلاتر
    useEffect(() => {
        let result = cases;

        // الفلترة بالبحث النصي (العنوان، رقم القضية، اسم الموكل، اسم المحكمة)
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.title?.toLowerCase().includes(query) ||
                item.case_number?.toLowerCase().includes(query) ||
                item.court_name?.toLowerCase().includes(query) ||
                item.client?.name?.toLowerCase().includes(query) ||
                item.lawyer?.full_name?.toLowerCase().includes(query)
            );
        }

        // الفلترة حسب الحالة
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter);
        }

        // الفلترة حسب نوع القضية
        if (typeFilter !== 'all') {
            result = result.filter(item => item.case_type === typeFilter);
        }

        setFilteredCases(result);
    }, [searchQuery, statusFilter, typeFilter, cases]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
        }
    };

    const removeFileFromList = (indexToRemove) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== indexToRemove));
    };

    const handleCreateCaseSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            const formData = new FormData();
            Object.keys(newCaseData).forEach((key) => {
                const value = newCaseData[key];
                if (value !== '' && value !== null && value !== undefined) {
                    if (key === 'case_value' || key === 'amount_paid') {
                        formData.append(key, String(Number(value)));
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            selectedFiles.forEach((file) => {
                formData.append('files', file);
            });

            let response;
            if (isEditing) {
                response = await apiClient.patch(`/cases/${editingCaseId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setCases(prev => prev.map(c => c.id === editingCaseId ? response.data : c));
                alert("تم تحديث القضية وبياناتها المالية بنجاح");
            } else {
                response = await apiClient.post('/cases/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setCases([response.data, ...cases]);
                alert("تم إنشاء القضية بنجاح");
            }

            setIsCaseModalOpen(false);
            setIsEditing(false);
            setEditingCaseId(null);
            setSelectedFiles([]);
            setNewCaseData({
                title: '', description: '', status: 'pending',
                case_number: '', case_type: 'commercial', court_name: '',
                client_id: '', lawyer_id: '', case_value: 0.0, amount_paid: 0.0
            });

        } catch (err) {
            console.error("خطأ أثناء حفظ البيانات:", err.response?.data || err);
            const errorDetail = err.response?.data?.detail;
            const errorMessage = typeof errorDetail === 'string'
                ? errorDetail
                : (isEditing ? 'حدث خطأ أثناء تحديث القضية.' : 'حدث خطأ أثناء إنشاء القضية.');
            alert(`⚠️ خطأ: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCase = async (caseId, updatedData) => {
        try {
            const formData = new FormData();
            Object.keys(updatedData).forEach((key) => {
                formData.append(key, updatedData[key]);
            });

            const response = await apiClient.patch(`/cases/${caseId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setCases(prevCases => prevCases.map(c => c.id === caseId ? response.data : c));
            alert("تم تحديث حالة القضية بنجاح");
        } catch (err) {
            console.error("خطأ أثناء التحديث السريع للحالة:", err);
            alert("فشل تحديث الحالة، يرجى التحقق من اتصال السيرفر.");
        }
    };

    const openEditModal = (caseItem) => {
        setEditingCaseId(caseItem.id);
        setNewCaseData({
            title: caseItem.title,
            description: caseItem.description || '',
            status: caseItem.status,
            case_number: caseItem.case_number || '',
            case_type: caseItem.case_type,
            court_name: caseItem.court_name || '',
            client_id: caseItem.client?.id || '',
            lawyer_id: caseItem.lawyer?.id || '',
            case_value: caseItem.case_value || 0.0,
            amount_paid: caseItem.amount_paid || 0.0
        });
        setSelectedFiles([]);
        setIsEditing(true);
        setIsCaseModalOpen(true);
    };

    // ميثود مساعدة للحصول على ألوان الحالات بشكل احترافي ناعم متناسق مع النظام
    const getStatusStyle = (status) => {
        switch(status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
            case 'appeal': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
            case 'supreme': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
            case 'closed': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
            default: return 'bg-slate-50 text-slate-600 dark:bg-slate-900 border border-slate-200';
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">

            {/* رأس الصفحة والإجراءات بتصميم ملكي */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141C2F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">إدارة القضايا والملفات</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">عرض ومتابعة كافة القضايا والمستندات القانونية والمستحقات المالية لملفات العمل القانوني.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setNewCaseData({
                            title: '', description: '', status: 'pending',
                            case_number: '', case_type: 'commercial', court_name: '',
                            client_id: '', lawyer_id: '', case_value: 0.0, amount_paid: 0.0
                        });
                        setIsCaseModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0F172A] text-xs font-bold rounded-xl shadow-sm shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4 text-[#0F172A]" />
                    إضافة قضية جديدة
                </button>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 shadow-sm shadow-rose-500/5">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-semibold">⚠️ {error}</p>
                </div>
            )}

            {/* 🔍 شريط البحث والفلاتر (UX/UI متميز) */}
            <div className="bg-white dark:bg-[#141C2F] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* مدخل البحث النصي */}
                <div className="relative w-full lg:max-w-md">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        placeholder="ابحث باسم القضية، رقم القيد، اسم الموكل، أو المحكمة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-transparent text-slate-900 dark:text-white"
                    />
                </div>

                {/* خيارات الفرز والتصفية */}
                <div className="flex flex-wrap w-full lg:w-auto items-center gap-4 justify-start lg:justify-end">
                    {/* فلتر الحالة */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter size={14} className="text-slate-400 shrink-0" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                        >
                            <option value="all">كل الحالات القضائية</option>
                            <option value="pending">تحت الدراسة</option>
                            <option value="active">نشطة / متداولة</option>
                            <option value="appeal">قيد الاستئناف</option>
                            <option value="supreme">قيد المحكمة العليا</option>
                            <option value="closed">مغلقة / منتهية</option>
                        </select>
                    </div>

                    {/* فلتر النوع */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                        >
                            <option value="all">كل التصنيفات</option>
                            <option value="commercial">تجاري</option>
                            <option value="labor">عمالي</option>
                            <option value="criminal">جنائي</option>
                            <option value="civil">حقوقي / مدني</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* الجدول الرئيسي الفاخر */}
            <div className="bg-white dark:bg-[#141C2F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#0F172A]/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wide">
                                <th className="p-4 w-20">المعرف</th>
                                <th className="p-4">عنوان وموضوع القضية</th>
                                <th className="p-4">الموكل (العميل)</th>
                                <th className="p-4">المحامي المسؤول</th>
                                <th className="p-4">أتعاب القضية</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
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
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div></td>
                                        <td className="p-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-32 mx-auto"></div></td>
                                    </tr>
                                ))
                            )}

                            {!loading && filteredCases.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-slate-400 dark:text-slate-500 font-medium italic">
                                        لا توجد نتائج مطابقة لخيارات البحث أو الفلترة المحددة.
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredCases.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0F172A]/40 transition-colors group">
                                    <td className="p-4 font-mono font-bold text-slate-400">#{item.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Scale className="w-4 h-4 text-slate-400 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                                                <div className="flex gap-2 items-center mt-1 text-[11px] text-slate-400">
                                                    {item.case_number && <span>رقم القيد: {item.case_number}</span>}
                                                    {item.court_name && <span>• {item.court_name}</span>}
                                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold">
                                                        {item.case_type === 'commercial' ? 'تجاري' : item.case_type === 'labor' ? 'عمالي' : item.case_type === 'criminal' ? 'جنائي' : 'حقوقي'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800 dark:text-slate-300 flex items-center gap-1">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            {item.client?.name || <span className="text-slate-400 italic">غير محدد</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800 dark:text-slate-300">{item.lawyer?.full_name || <span className="text-slate-400 italic">غير معين</span>}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                                            {item.case_value ? `${item.case_value.toLocaleString()} ر.س` : '0 ر.س'}
                                        </div>
                                        {item.case_value > 0 && (
                                            <div className="mt-1.5 w-24 bg-slate-100 dark:bg-[#0F172A] rounded-full h-1 overflow-hidden border border-slate-200/40 dark:border-slate-800">
                                                <div
                                                    className="bg-emerald-500 h-1 rounded-full"
                                                    style={{ width: `${Math.min((item.amount_paid / item.case_value) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={item.status}
                                            onChange={(e) => handleUpdateCase(item.id, { status: e.target.value })}
                                            className={`text-[10px] font-extrabold rounded-lg border px-2.5 py-1 bg-white dark:bg-[#141C2F] focus:outline-none cursor-pointer tracking-wide ${getStatusStyle(item.status)}`}
                                        >
                                            <option value="pending">تحت الدراسة</option>
                                            <option value="active">نشطة / متداولة</option>
                                            <option value="appeal">قيد الاستئناف</option>
                                            <option value="supreme">قيد المحكمة العليا</option>
                                            <option value="closed">مغلقة / منتهية</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/cases/${item.id}`)}
                                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold transition-colors"
                                            >
                                                الملف
                                            </button>
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="px-2.5 py-1.5 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 rounded-lg font-bold transition-colors"
                                            >
                                                تعديل
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* النافذة المنبثقة المدمجة (Modal) كاملة بالشؤون المالية والمستندات في جزأيها */}
            {isCaseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#141C2F] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

                        {/* هيدر المودال */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-amber-500" />
                                    {isEditing ? 'تعديل بيانات القضية وعقد الأتعاب' : 'إنشاء وتوثيق ملف قضية جديدة'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">أدخل تفاصيل القضية، البيانات المالية، وارفع المستندات القانونية الخاصة بها.</p>
                            </div>
                            <button 
                                onClick={() => { setIsCaseModalOpen(false); setIsEditing(false); }} 
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* الفورم الشامل */}
                        <form onSubmit={handleCreateCaseSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">عنوان / موضوع الدعوى القانونية *</label>
                                    <input type="text" required placeholder="مثال: قضية نزاع تجاري أو مطالبة مالية لشركة..." value={newCaseData.title} onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">رقم قيد القضية الآلي في المحكمة</label>
                                    <input type="text" placeholder="مثال: 1445/هـ/203" value={newCaseData.case_number} onChange={(e) => setNewCaseData({ ...newCaseData, case_number: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-900 dark:text-white font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">حالة التقاضي الحالية</label>
                                    <select value={newCaseData.status} onChange={(e) => setNewCaseData({ ...newCaseData, status: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <option value="pending">تحت الدراسة (Pending)</option>
                                        <option value="active">نشطة / متداولة (Active)</option>
                                        <option value="appeal">قيد الاستئناف (Appeal)</option>
                                        <option value="supreme">قيد المحكمة العليا (Supreme)</option>
                                        <option value="closed">مغلقة / منتهية (Closed)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">تصنيف / نوع القضية</label>
                                    <select value={newCaseData.case_type} onChange={(e) => setNewCaseData({ ...newCaseData, case_type: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <option value="commercial">تجاري</option>
                                        <option value="labor">عمالي</option>
                                        <option value="criminal">جنائي</option>
                                        <option value="civil">حقوقي / مدني</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">الدائرة / المحكمة المختصة</label>
                                    <input type="text" placeholder="مثال: المحكمة العمالية بجدة" value={newCaseData.court_name} onChange={(e) => setNewCaseData({ ...newCaseData, court_name: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">الموكل (العميل المرتبط) *</label>
                                    <select required value={newCaseData.client_id} onChange={(e) => setNewCaseData({ ...newCaseData, client_id: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <option value="">-- اختر الموكل التابع له الملف --</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">المحامي المسؤول والمباشر *</label>
                                    <select required value={newCaseData.lawyer_id} onChange={(e) => setNewCaseData({ ...newCaseData, lawyer_id: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <option value="">-- تعيين محامي للملف --</option>
                                        {lawyers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                        <DollarSign size={12} className="text-amber-500" /> إجمالي أتعاب القضية المتفق عليها (ر.س)
                                    </label>
                                    <input
                                        type="number" min="0" step="any" placeholder="0.00"
                                        value={newCaseData.case_value}
                                        onChange={(e) => setNewCaseData({ ...newCaseData, case_value: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 font-mono text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                        <DollarSign size={12} className="text-emerald-500" /> الدفعة المقدمة المسددة حالياً (ر.س)
                                    </label>
                                    <input
                                        type="number" min="0" step="any" placeholder="0.00"
                                        value={newCaseData.amount_paid}
                                        onChange={(e) => setNewCaseData({ ...newCaseData, amount_paid: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 font-mono text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">ملخص أو مذكرات قضائية مبدئية</label>
                                <textarea rows="2" placeholder="اكتب هنا ملخص النزاع أو أصل موضوع الدعوى الموكلة..." value={newCaseData.description} onChange={(e) => setNewCaseData({ ...newCaseData, description: e.target.value })} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 text-slate-900 dark:text-white resize-none" ></textarea>
                            </div>

                            {/* 📎 الجزء الثاني: مرفقات ومستندات القضية متعددة الملفات */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">مستندات وأوراق القضية (مرفقات متعددة)</label>
                                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-[#0F172A]/40 transition-all text-center group cursor-pointer">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-1">
                                        <UploadCloud size={28} className="text-amber-500/80 group-hover:scale-110 transition-transform duration-200" />
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">اضغط هنا أو اسحب الملفات لرفعها تأميناً</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500">يدعم الـ PDF، الصور، والمستندات القانونية والمذكرات</p>
                                    </div>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="bg-slate-50 dark:bg-[#0F172A]/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                            <Paperclip size={12} className="text-amber-500" /> الملفات الجاهزة للرفع والحفظ التلقائي ({selectedFiles.length}):
                                        </p>
                                        {selectedFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#141C2F] px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs shadow-xs">
                                                <div className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-200">
                                                    <FileText size={14} className="text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[280px] font-medium">{file.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFileFromList(idx)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* أزرار التحكم السفلى للمودال */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCaseModalOpen(false)} 
                                    className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-5 py-2 text-xs font-bold text-[#0F172A] bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                                >
                                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {isSubmitting ? 'جاري حفظ البيانات والملفات...' : (isEditing ? 'تعديل وحفظ التغييرات' : 'إنشاء وتوثيق القضية')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}