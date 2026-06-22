// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import apiClient from '@/services/apiClient';
// import {
//     ArrowLeft, FileText, UploadCloud, Eye, Trash2, X, Download, ImageIcon,
//     Calendar, Clock, MapPin, User, Plus, Edit3, Gavel, DollarSign
// } from 'lucide-react';

// export default function CaseDetailsPage() {
//     const { id } = useParams();
//     const router = useRouter();

//     // حالات الصفحة الأساسية وبيانات القضية
//     const [caseData, setCaseData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     // حالات خاصة بقسم إدارة المستندات (DMS)
//     const [uploading, setUploading] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [docDescription, setDocDescription] = useState('');
//     const [uploadError, setUploadError] = useState('');

//     // حالات خاصة بالنافذة المنبثقة لعرض الملف المباشر (Preview Modal)
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//     const [previewUrl, setPreviewUrl] = useState('');
//     const [previewTitle, setPreviewTitle] = useState('');
//     const [previewType, setPreviewType] = useState('');

//     // ⚖️ حالات خاصة بنظام الجلسات الجديد (Hearings)
//     const [hearings, setHearings] = useState([]);
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
//     const [selectedHearingId, setSelectedHearingId] = useState(null);

//     // نماذج بيانات الجلسات (Form States)
//     const [newHearing, setNewHearing] = useState({
//         hearing_date: '', hearing_time: '', court_name: '', room_number: '', judge_name: '', summary: '', requirements: ''
//     });
    
//     const [updateForm, setUpdateForm] = useState({
//         hearing_date: '',
//         hearing_time: '',
//         court_name: '',
//         room_number: '',
//         judge_name: '',
//         summary: '',
//         requirements: ''
//     });

//     // 📡 1. جلب تفاصيل القضية والجلسات من السيرفر
//     const fetchCaseDetails = async () => {
//         try {
//             setLoading(true);
//             setError('');
//             const response = await apiClient.get(`/cases/${id}`);
//             setCaseData(response.data);
            
//             // جلب الجلسات المرتبطة تلقائياً
//             fetchHearings();
//         } catch (err) {
//             console.error(err);
//             setError('تعذر جلب تفاصيل القضية، قد لا تملك الصلاحية أو أن الملف غير موجود.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchHearings = async () => {
//         try {
//             const response = await apiClient.get(`/hearings/case/${id}`);
//             setHearings(response.data);
//         } catch (error) {
//             console.error("خطأ جلب الجلسات:", error);
//         }
//     };

//     // 📦 دالة تحويل حجم الملف من بايت إلى صيغة مقروءة (KB, MB)
//     const formatFileSize = (bytes) => {
//         if (!bytes) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     };

//     // 📅 دالة تنسيق التاريخ إلى صيغة عربية أنيقة
//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         return new Date(dateString).toLocaleDateString('ar-SA', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const getStatusBadge = (status) => {
//         const statuses = {
//             pending: { text: "تحت الدراسة", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 border-amber-200" },
//             active: { text: "نشطة / متداولة", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-200" },
//             appeal: { text: "قيد الاستئناف", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 border-purple-200" },
//             closed: { text: "مغلقة / منتهية", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 border-slate-300" }
//         };
//         const current = statuses[status?.toLowerCase()] || { text: status, className: "bg-slate-50 text-slate-600" };
//         return <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${current.className}`}>{current.text}</span>;
//     };

//     useEffect(() => {
//         if (id) {
//             fetchCaseDetails();
//         }
//     }, [id]);

//     // 📤 2. دالة رفع مستند جديد كودك الأصلي المستقر
//     const handleFileUpload = async (e) => {
//         e.preventDefault();
//         if (!selectedFile) return;

//         try {
//             setUploading(true);
//             setUploadError('');

//             const formData = new FormData();
//             formData.append('file', selectedFile);
//             formData.append('description', docDescription);

//             await apiClient.post(`/documents/${id}/upload`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });

//             setSelectedFile(null);
//             setDocDescription('');
//             fetchCaseDetails();
//         } catch (err) {
//             setUploadError(err.response?.data?.detail || 'حدث خطأ أثناء رفع الملف للسيرفر.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     // 👁️ دالة جلب وبث المستند لعرضه مباشرة في النافذة المنبثقة
//     const handleViewDocument = async (docId, fileName) => {
//         try {
//             setUploading(true);
//             const response = await apiClient.get(`/documents/download/${docId}`, {
//                 responseType: 'blob'
//             });

//             const fileBlob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
//             const url = window.URL.createObjectURL(fileBlob);
//             const contentType = response.headers['content-type'] || '';

//             setPreviewType(contentType);
//             setPreviewUrl(url);
//             setPreviewTitle(fileName);
//             setIsPreviewOpen(true);
//         } catch (err) {
//             alert('فشل استعراض الملف. تأكد من صلاحياتك الأمنية على هذا المستند.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     // 🗑️ دالة حذف المستند نهائياً من الأرشيف والسيرفر
//     const handleDeleteDocument = async (docId, fileName) => {
//         const isConfirmed = window.confirm(`هل أنت متأكد تماماً من حذف المستند "${fileName}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`);
//         if (!isConfirmed) return;

//         try {
//             setUploading(true);
//             await apiClient.delete(`/documents/${docId}`);
//             fetchCaseDetails();
//             alert('تم حذف المستند بنجاح من الأرشيف الرقمي للشركة.');
//         } catch (err) {
//             alert(err.response?.data?.detail || 'فشل حذف الملف، قد لا تملك الصلاحية الكافية.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     // ⚖️ منطق إدارة جلسات المحاكمة (Hearings)
//     const handleCreateHearing = async (e) => {
//         e.preventDefault();
//         try {
//             setUploading(true);
//             await apiClient.post('/hearings/', { ...newHearing, case_id: parseInt(id) });
//             setIsAddModalOpen(false);
//             setNewHearing({ hearing_date: '', hearing_time: '', court_name: '', room_number: '', judge_name: '', summary: '', requirements: '' });
//             fetchHearings();
//             alert('تمت جدولة الجلسة بنجاح.');
//         } catch (err) {
//             alert(err.response?.data?.detail || 'فشل حفظ الجلسة الجديدة.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const openUpdateModal = (hearing) => {
//         setSelectedHearingId(hearing.id);
//         setUpdateForm({
//             hearing_date: hearing.hearing_date || '',
//             hearing_time: hearing.hearing_time || '',
//             court_name: hearing.court_name || '',
//             room_number: hearing.room_number || '',
//             judge_name: hearing.judge_name || '',
//             summary: hearing.summary || '',
//             requirements: hearing.requirements || ''
//         });
//         setIsUpdateModalOpen(true);
//     };

//     const handleUpdateHearingDecisions = async (e) => {
//         e.preventDefault();
//         try {
//             setUploading(true);
//             await apiClient.put(`/hearings/${selectedHearingId}`, updateForm);
//             setIsUpdateModalOpen(false);
//             fetchHearings();
//             alert('تم توثيق القرارات والطلبات بنجاح في الأرشيف.');
//         } catch (err) {
//             alert('فشل تحديث قرارات الجلسة.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
//                 <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
//                 <p className="text-sm text-slate-500 font-medium">جاري جلب ملف القضية والأرشيف الرقمي...</p>
//             </div>
//         );
//     }

//     if (error || !caseData) {
//         return (
//             <div className="p-6 max-w-xl mx-auto text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
//                 <span className="text-4xl">⚠️</span>
//                 <p className="text-slate-800 font-bold text-lg">{error || 'القضية غير موجودة'}</p>
//                 <button onClick={() => router.push('/dashboard/cases')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors">
//                     العودة لجدول القضايا
//                 </button>
//             </div>
//         );
//     }

//     // حسابات المؤشر المالي المرتبط بالقضية
//     const caseValue = caseData.case_value || 0;
//     const amountPaid = caseData.amount_paid || 0;
//     const remainingAmount = caseValue - amountPaid;
//     const collectionPercentage = caseValue > 0 ? Math.min((amountPaid / caseValue) * 100, 100) : 0;

//     return (
//         <div className="space-y-8 text-right" dir="rtl">
//             {/* هيدر الصفحة والعودة للخلف */}
//             <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => router.push('/dashboard/cases')} className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors text-xl">
//                         <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400 rotate-180" />
//                     </button>
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <span className="text-xs px-2.5 py-0.5 font-bold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
//                                 قضية رقم #{caseData.id}
//                             </span>
//                             {getStatusBadge(caseData.status)}
//                         </div>
//                         <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">{caseData.title}</h2>
//                     </div>
//                 </div>
//             </div>

//             {/* تقسيم الصفحة: تفاصيل القضية والجلسات يميناً، والأرشفة المستقرة يساراً */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//                 {/* 🏛️ القسم الأول: بطاقة تفاصيل القضية + خط الجلسات الزمني (2/3 من المساحة) */}
//                 <div className="lg:col-span-2 space-y-6">
//                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
//                         <div>
//                             <h3 className="text-sm font-bold text-slate-900 dark:text-white border-r-4 border-blue-600 pr-2 flex items-center gap-2"><Gavel size={16} /> موضوع وتكييف الدعوى</h3>
//                             <p className="text-slate-600 dark:text-slate-300 text-xs mt-3 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">{caseData.description || 'لا يوجد وصف تفصيلي.'}</p>
//                         </div>

//                         {/* معلومات أطراف النزاع والوكلاء */}
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
//                             <div>
//                                 <span className="text-xs text-slate-400 font-semibold block">الموكل (الطرف الأول)</span>
//                                 <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">{caseData.client?.name || 'غير محدد'}</p>
//                                 <p className="text-[10px] text-slate-400 mt-0.5">نوع الهوية/السجل: {caseData.client?.client_type === 'company' ? 'شركة / سجّل تجاري' : 'فرد / هوية وطنية'}</p>
//                             </div>
//                             <div>
//                                 <span className="text-xs text-slate-400 font-semibold block">المحامي المسؤول (الوكيل)</span>
//                                 <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">{caseData.lawyer?.full_name || 'غير معين'}</p>
//                                 <p className="text-[10px] text-slate-400 mt-0.5">البريد: {caseData.lawyer?.email}</p>
//                             </div>
//                         </div>

//                         {/* 📊 ربط وتثبيت المؤشر المالي داخل صفحة التفاصيل الشاملة */}
//                         <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
//                             <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><DollarSign size={14} className="text-green-500" /> الحالة المالية للقضية</h4>
//                             <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl">
//                                 <div>
//                                     <span className="text-[10px] text-slate-400 block">إجمالي العقد</span>
//                                     <span className="text-xs font-bold text-slate-800 dark:text-white">{caseValue.toLocaleString()} ر.س</span>
//                                 </div>
//                                 <div>
//                                     <span className="text-[10px] text-slate-400 block">المحصل</span>
//                                     <span className="text-xs font-bold text-green-600 dark:text-green-400">{amountPaid.toLocaleString()} ر.س</span>
//                                 </div>
//                                 <div>
//                                     <span className="text-[10px] text-slate-400 block">المتبقي</span>
//                                     <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{remainingAmount.toLocaleString()} ر.س</span>
//                                 </div>
//                             </div>
//                             {caseValue > 0 && (
//                                 <div className="space-y-1">
//                                     <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
//                                         <span>نسبة التحصيل الفعلي</span>
//                                         <span className="text-green-600 font-bold">{collectionPercentage.toFixed(1)}%</span>
//                                     </div>
//                                     <div className="w-full bg-slate-100 dark:bg-slate-750 h-2 rounded-full overflow-hidden">
//                                         <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${collectionPercentage}%` }}></div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* ⚖️ خط الجلسات والمواعيد الزمني الجديد تماماً */}
//                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
//                         <div className="flex items-center justify-between mb-6">
//                             <h3 className="text-sm font-bold text-slate-900 dark:text-white border-r-4 border-blue-600 pr-2 flex items-center gap-2">
//                                 <Calendar size={16} /> خط الجلسات والمواعيد الزمني
//                             </h3>
//                             <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all">
//                                 <Plus size={14} /> <span>جدولة جلسة جديد</span>
//                             </button>
//                         </div>

//                         {hearings.length === 0 ? (
//                             <p className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">لا توجد جلسات محاكمة مجدولة في سجل هذه القضية حالياً.</p>
//                         ) : (
//                             <div className="relative border-r-2 border-slate-100 dark:border-slate-700 mr-2 pr-5 space-y-5">
//                                 {hearings.map((hearing) => {
//                                     const isPast = new Date(`${hearing.hearing_date}T${hearing.hearing_time}`) < new Date();
//                                     return (
//                                         <div key={hearing.id} className="relative group">
//                                             <span className={`absolute -right-[28px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-800 ${isPast ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`}></span>
//                                             <div className={`p-4 rounded-xl border transition-all ${isPast ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/20 dark:border-slate-700/50 opacity-85' : 'bg-blue-50/10 border-blue-100/50 dark:bg-blue-950/10 dark:border-blue-900/30 shadow-sm'}`}>
//                                                 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
//                                                     <div className="space-y-1.5 flex-1 text-xs">
//                                                         <div className="flex flex-wrap items-center gap-3 text-xs">
//                                                             <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300"><Calendar size={13} className="text-blue-500" /> {hearing.hearing_date}</span>
//                                                             <span className="flex items-center gap-1 text-slate-400"><Clock size={12} /> {hearing.hearing_time}</span>
//                                                             <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isPast ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400' : 'bg-emerald-600 text-white'}`}>{isPast ? "جلسة منتهية" : "جلسة مقبلة"}</span>
//                                                         </div>
//                                                         <p className="text-slate-600 dark:text-slate-400"><MapPin size={12} className="inline ml-1 text-red-400" /> {hearing.court_name} — قاعة: ({hearing.room_number})</p>
//                                                         {hearing.judge_name && <p className="text-[11px] text-slate-400">ناظر الدائرة: {hearing.judge_name}</p>}

//                                                         {(hearing.summary || hearing.requirements) && (
//                                                             <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1 text-[11px]">
//                                                                 {hearing.summary && <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-800 dark:text-white font-bold">📋 منطوق القرارات:</strong> {hearing.summary}</p>}
//                                                                 {hearing.requirements && <p className="text-blue-600 dark:text-blue-400"><strong className="text-slate-800 dark:text-white font-bold">🎯 الطلبات للمقبلة:</strong> {hearing.requirements}</p>}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                     <button onClick={() => openUpdateModal(hearing)} className="flex items-center gap-1 px-2 py-1 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-colors shrink-0">
//                                                         <Edit3 size={11} /> <span>تحديث القرارات</span>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* 📂 القسم الثاني: الأرشيف الرقمي للمستندات كودك الأصلي المستقر (1/3 من المساحة) */}
//                 <div className="space-y-6">
//                     {/* نموذج رفع ملف جديد المستقر */}
//                     <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
//                         <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
//                             <span>📤</span> أرشفة مستند جديد للقضية
//                         </h3>

//                         {uploadError && (
//                             <p className="text-xs p-2.5 bg-red-50 text-red-600 rounded-lg font-medium">{uploadError}</p>
//                         )}

//                         <form onSubmit={handleFileUpload} className="space-y-3">
//                             <input
//                                 type="file"
//                                 required
//                                 accept=".pdf,.doc,.docx,.jpg,.png"
//                                 onChange={(e) => setSelectedFile(e.target.files[0])}
//                                 className="w-full text-xs text-slate-500 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
//                             />
//                             <input
//                                 type="text"
//                                 placeholder="وصف مختصر (مثال: لائحة اعتراضية)"
//                                 value={docDescription}
//                                 onChange={(e) => setDocDescription(e.target.value)}
//                                 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                             <button
//                                 type="submit"
//                                 disabled={uploading || !selectedFile}
//                                 className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow transition-colors"
//                             >
//                                 {uploading ? 'جاري التخزين المحلي...' : 'حفظ المستند بالأرشيف'}
//                             </button>
//                         </form>
//                     </div>

//                     {/* قائمة الوثائق المرفوعة مسبقاً */}
//                     <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
//                         <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
//                             <span>📂</span> الوثائق والمستندات المرفقة ({caseData.attachments?.length || 0})
//                         </h3>

//                         <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
//                             {caseData.attachments?.length === 0 ? (
//                                 <p className="text-xs text-slate-400 text-center py-6">لا توجد ملفات مرفوعة لهذه الدعوى بعد.</p>
//                             ) : (
//                                 caseData.attachments?.map((doc) => {
//                                     const isImage = doc.file_type?.startsWith('image/');
//                                     return (
//                                         <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:shadow-sm transition-all">
//                                             <div className="min-w-0 flex-1 flex items-center gap-3">
//                                                 <div className={`p-2 rounded-lg shrink-0 ${isImage ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30'}`}>
//                                                     {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
//                                                 </div>

//                                                 <div className="min-w-0 flex-1 pl-2">
//                                                     <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={doc.original_name}>
//                                                         {doc.original_name}
//                                                     </p>
//                                                     <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
//                                                         <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
//                                                             {formatFileSize(doc.file_size)}
//                                                         </span>
//                                                         <span>•</span>
//                                                         <span>رُفع في: {formatDate(doc.uploaded_at)}</span>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             <div className="flex items-center gap-1 shrink-0">
//                                                 <button
//                                                     onClick={() => handleViewDocument(doc.id, doc.original_name)}
//                                                     className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors"
//                                                     title="استعراض"
//                                                 >
//                                                     <Eye size={16} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteDocument(doc.id, doc.original_name)}
//                                                     className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
//                                                     title="حذف نهائي"
//                                                 >
//                                                     <Trash2 size={16} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* 🏛️ نافذة جدولة جلسة محاكمة جديدة */}
//             {isAddModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//                     <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
//                         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
//                             <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><Calendar size={16} className="text-blue-600" /> جدولة جلسة محاكمة جديدة</h3>
//                             <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={15} /></button>
//                         </div>
//                         <form onSubmit={handleCreateHearing} className="p-6 space-y-4 text-xs">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div><label className="block font-bold text-slate-500 mb-1">تاريخ الجلسة *</label><input type="date" required value={newHearing.hearing_date} onChange={(e) => setNewHearing({ ...newHearing, hearing_date: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-blue-500 text-right" /></div>
//                                 <div><label className="block font-bold text-slate-500 mb-1">وقت الجلسة *</label><input type="time" required value={newHearing.hearing_time} onChange={(e) => setNewHearing({ ...newHearing, hearing_time: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-blue-500" /></div>
//                             </div>
//                             <div><label className="block font-bold text-slate-500 mb-1">اسم المحكمة والدائرة *</label><input type="text" required placeholder="مثال: المحكمة التجارية بجدة - الدائرة الرابعة" value={newHearing.court_name} onChange={(e) => setNewHearing({ ...newHearing, court_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-blue-500" /></div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div><label className="block font-bold text-slate-500 mb-1">رقم القاعة / المكتب *</label><input type="text" required placeholder="مثال: قاعة رقم 3" value={newHearing.room_number} onChange={(e) => setNewHearing({ ...newHearing, room_number: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-blue-500" /></div>
//                                 <div><label className="block font-bold text-slate-500 mb-1">اسم فضيلة الشيخ ناظر الدائرة</label><input type="text" placeholder="اختياري" value={newHearing.judge_name} onChange={(e) => setNewHearing({ ...newHearing, judge_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-blue-500" /></div>
//                             </div>
//                             <div className="flex items-center justify-end gap-3 pt-2">
//                                 <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold">إلغاء</button>
//                                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">تثبيت الجلسة</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* 📝 نافذة تحديث القرارات والطلبات الصادرة */}
//             {isUpdateModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//                     <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
//                         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
//                             <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><Edit3 size={16} className="text-blue-600" /> توثيق منطوق القرارات وطلبات الجلسة</h3>
//                             <button onClick={() => setIsUpdateModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={15} /></button>
//                         </div>
//                         <form onSubmit={handleUpdateHearingDecisions} className="p-6 space-y-4 text-xs">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div><label className="block font-bold text-slate-500 mb-1">تاريخ الجلسة</label><input type="date" value={updateForm.hearing_date} onChange={(e) => setUpdateForm({ ...updateForm, hearing_date: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-right" /></div>
//                                 <div><label className="block font-bold text-slate-500 mb-1">وقت الجلسة</label><input type="time" value={updateForm.hearing_time} onChange={(e) => setUpdateForm({ ...updateForm, hearing_time: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800" /></div>
//                             </div>
//                             <div><label className="block font-bold text-slate-500 mb-1">المحكمة والدائرة</label><input type="text" value={updateForm.court_name} onChange={(e) => setUpdateForm({ ...updateForm, court_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800" /></div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div><label className="block font-bold text-slate-500 mb-1">القاعة / المكتب</label><input type="text" value={updateForm.room_number} onChange={(e) => setUpdateForm({ ...updateForm, room_number: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800" /></div>
//                                 <div><label className="block font-bold text-slate-500 mb-1">ناظر الدائرة</label><input type="text" value={updateForm.judge_name} onChange={(e) => setUpdateForm({ ...updateForm, judge_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800" /></div>
//                             </div>
//                             <div>
//                                 <label className="block font-bold text-slate-500 mb-1">ملخص الجلسة وما صدر عنها من قرارات أو أحكام</label>
//                                 <textarea rows={3} placeholder="اكتب القرارات أو أسباب التأجيل الصادرة من المحكمة..." value={updateForm.summary} onChange={(e) => setUpdateForm({ ...updateForm, summary: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-blue-500 resize-none" />
//                             </div>
//                             <div>
//                                 <label className="block font-bold text-slate-500 mb-1">الطلبات والمذكرات المطلوبة من المكتب للجلسة القادمة</label>
//                                 <textarea rows={2} placeholder="مثال: تقديم مذكرة جوابية ثانية مع مستندات الحسابات..." value={updateForm.requirements} onChange={(e) => setUpdateForm({ ...updateForm, requirements: e.target.value })} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-blue-500 resize-none" />
//                             </div>
//                             <div className="flex items-center justify-end gap-3 pt-2">
//                                 <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold">إلغاء</button>
//                                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">حفظ وتوثيق القرارات</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* 🖼️ عارض المستندات والصور (DMS Preview Modal) المحدث والمستقر */}
//             {isPreviewOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
//                     <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
//                         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
//                             <div className="flex items-center gap-2.5 min-w-0">
//                                 <span className="text-blue-600 shrink-0">
//                                     {previewType.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
//                                 </span>
//                                 <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-md" title={previewTitle}>
//                                     {previewTitle}
//                                 </h3>
//                             </div>
//                             <div className="flex items-center gap-3">
//                                 <a
//                                     href={previewUrl}
//                                     download={previewTitle}
//                                     className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
//                                 >
//                                     <Download size={14} />
//                                     <span>تحميل نسخة</span>
//                                 </a>
//                                 <button
//                                     onClick={() => {
//                                         setIsPreviewOpen(false);
//                                         window.URL.revokeObjectURL(previewUrl);
//                                     }}
//                                     className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-colors font-bold text-sm"
//                                 >
//                                     <X size={18} />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 relative flex items-center justify-center overflow-auto">
//                             {previewType.startsWith('image/') ? (
//                                 <img
//                                     src={previewUrl}
//                                     alt={previewTitle}
//                                     className="max-w-full max-h-full object-contain rounded-xl shadow-md bg-white dark:bg-slate-900"
//                                 />
//                             ) : (
//                                 <iframe
//                                     src={previewUrl}
//                                     className="w-full h-full rounded-xl border-0 shadow-inner bg-white"
//                                     title="Document PDF Preview"
//                                 />
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/services/apiClient';
import {
    ArrowLeft, FileText, UploadCloud, Eye, Trash2, X, Download, ImageIcon,
    Calendar, Clock, MapPin, User, Plus, Edit3, Gavel, DollarSign, ShieldAlert, FolderOpen
} from 'lucide-react';

export default function CaseDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    // حالات الصفحة الأساسية وبيانات القضية
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // حالات خاصة بقسم إدارة المستندات (DMS)
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [docDescription, setDocDescription] = useState('');
    const [uploadError, setUploadError] = useState('');

    // حالات خاصة بالنافذة المنبثقة لعرض الملف المباشر (Preview Modal)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewType, setPreviewType] = useState('');

    // ⚖️ حالات خاصة بنظام الجلسات الجديد (Hearings)
    const [hearings, setHearings] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedHearingId, setSelectedHearingId] = useState(null);

    // نماذج بيانات الجلسات (Form States)
    const [newHearing, setNewHearing] = useState({
        hearing_date: '', hearing_time: '', court_name: '', room_number: '', judge_name: '', summary: '', requirements: ''
    });
    
    const [updateForm, setUpdateForm] = useState({
        hearing_date: '', hearing_time: '', court_name: '', room_number: '', judge_name: '', summary: '', requirements: ''
    });

    // 📡 1. جلب تفاصيل القضية والجلسات من السيرفر
    const fetchCaseDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get(`/cases/${id}`);
            setCaseData(response.data);
            fetchHearings();
        } catch (err) {
            console.error(err);
            setError('تعذر جلب تفاصيل القضية، قد لا تملك الصلاحية أو أن الملف غير موجود في الأرشيف.');
        } finally {
            setLoading(false);
        }
    };

    const fetchHearings = async () => {
        try {
            const response = await apiClient.get(`/hearings/case/${id}`);
            setHearings(response.data);
        } catch (error) {
            console.error("خطأ جلب الجلسات:", error);
        }
    };

    // 📦 دالة تحويل حجم الملف من بايت إلى صيغة مقروءة (KB, MB)
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 📅 دالة تنسيق التاريخ إلى صيغة عربية أنيقة
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statuses = {
            pending: { text: "تحت الدراسة", className: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/10 border-amber-500/30" },
            active: { text: "نشطة / متداولة", className: "bg-emerald-500/10 text-emerald-400 dark:bg-emerald-500/10 border-emerald-500/30" },
            appeal: { text: "قيد الاستئناف", className: "bg-purple-500/10 text-purple-400 dark:bg-purple-500/10 border-purple-500/30" },
            closed: { text: "مغلقة / منتهية", className: "bg-slate-500/10 text-slate-400 dark:bg-slate-800 border-slate-700" }
        };
        const current = statuses[status?.toLowerCase()] || { text: status, className: "bg-slate-800 text-slate-400" };
        return <span className={`px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-sm tracking-wide ${current.className}`}>{current.text}</span>;
    };

    useEffect(() => {
        if (id) {
            fetchCaseDetails();
        }
    }, [id]);

    // 📤 2. دالة رفع مستند جديد كودك الأصلي المستقر
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            setUploading(true);
            setUploadError('');

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('description', docDescription);

            await apiClient.post(`/documents/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSelectedFile(null);
            setDocDescription('');
            fetchCaseDetails();
        } catch (err) {
            setUploadError(err.response?.data?.detail || 'حدث خطأ أثناء رفع الملف للسيرفر.');
        } finally {
            setUploading(false);
        }
    };

    // 👁️ دالة جلب وبث المستند لعرضه مباشرة في النافذة المنبثقة
    const handleViewDocument = async (docId, fileName) => {
        try {
            setUploading(true);
            const response = await apiClient.get(`/documents/download/${docId}`, {
                responseType: 'blob'
            });

            const fileBlob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
            const url = window.URL.createObjectURL(fileBlob);
            const contentType = response.headers['content-type'] || '';

            setPreviewType(contentType);
            setPreviewUrl(url);
            setPreviewTitle(fileName);
            setIsPreviewOpen(true);
        } catch (err) {
            alert('فشل استعراض الملف. تأكد من صلاحياتك الأمنية على هذا المستند.');
        } finally {
            setUploading(false);
        }
    };

    // 🗑️ دالة حذف المستند نهائياً من الأرشيف والسيرفر
    const handleDeleteDocument = async (docId, fileName) => {
        const isConfirmed = window.confirm(`هل أنت متأكد تماماً من حذف المستند "${fileName}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`);
        if (!isConfirmed) return;

        try {
            setUploading(true);
            await apiClient.delete(`/documents/${docId}`);
            fetchCaseDetails();
            alert('تم حذف المستند بنجاح من الأرشيف الرقمي للشركة.');
        } catch (err) {
            alert(err.response?.data?.detail || 'فشل حذف الملف، قد لا تملك الصلاحية الكافية.');
        } finally {
            setUploading(false);
        }
    };

    // ⚖️ منطق إدارة جلسات المحاكمة (Hearings)
    const handleCreateHearing = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            await apiClient.post('/hearings/', { ...newHearing, case_id: parseInt(id) });
            setIsAddModalOpen(false);
            setNewHearing({ hearing_date: '', hearing_time: '', court_name: '', room_number: '', judge_name: '', summary: '', requirements: '' });
            fetchHearings();
            alert('تمت جدولة الجلسة بنجاح.');
        } catch (err) {
            alert(err.response?.data?.detail || 'فشل حفظ الجلسة الجديدة.');
        } finally {
            setUploading(false);
        }
    };

    const openUpdateModal = (hearing) => {
        setSelectedHearingId(hearing.id);
        setUpdateForm({
            hearing_date: hearing.hearing_date || '',
            hearing_time: hearing.hearing_time || '',
            court_name: hearing.court_name || '',
            room_number: hearing.room_number || '',
            judge_name: hearing.judge_name || '',
            summary: hearing.summary || '',
            requirements: hearing.requirements || ''
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateHearingDecisions = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            await apiClient.put(`/hearings/${selectedHearingId}`, updateForm);
            setIsUpdateModalOpen(false);
            fetchHearings();
            alert('تم توثيق القرارات والطلبات بنجاح في الأرشيف.');
        } catch (err) {
            alert('فشل تحديث قرارات الجلسة.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-slate-950">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
                </div>
                <p className="text-sm text-slate-400 font-medium tracking-wide">جاري فحص الخادم وجلب الأرشيف الرقمي للدعوى...</p>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-5 my-12">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <ShieldAlert size={32} />
                </div>
                <p className="text-slate-200 font-bold text-lg">{error || 'القضية غير موجودة'}</p>
                <button onClick={() => router.push('/dashboard/cases')} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all border border-slate-700">
                    العودة إلى جدول القضايا العمومي
                </button>
            </div>
        );
    }

    // حسابات المؤشر المالي المرتبط بالقضية
    const caseValue = caseData.case_value || 0;
    const amountPaid = caseData.amount_paid || 0;
    const remainingAmount = caseValue - amountPaid;
    const collectionPercentage = caseValue > 0 ? Math.min((amountPaid / caseValue) * 100, 100) : 0;

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">
            
            {/* ─── هيدر الصفحة الفاخر ─── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/cases')} className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all group">
                        <ArrowLeft size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors rotate-180" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] px-3 py-0.5 font-bold rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 tracking-wider">
                                مَلف قَضية رقم #{caseData.id}
                            </span>
                            {getStatusBadge(caseData.status)}
                        </div>
                        <h2 className="text-2xl font-black text-white mt-2 tracking-tight">{caseData.title}</h2>
                    </div>
                </div>
            </div>

            {/* ─── تقسيم صفحة الدعوى الشاملة ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 🏛️ الجانب الأيمن (2/3): تفاصيل ملف الدعوى + التايم لاين الذكي */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* بطاقة تفاصيل القضية الأساسية */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-white border-r-4 border-amber-500 pr-3 flex items-center gap-2">
                                <Gavel size={18} className="text-amber-500" /> موضوع وتكييف الدعوى القانوني
                            </h3>
                            <p className="text-slate-300 text-xs mt-4 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                                {caseData.description || 'لا يوجد وصف تفصيلي ملحق بالملف الإلكتروني لهذه الدعوى.'}
                            </p>
                        </div>

                        {/* أطراف النزاع والوكلاء المعينين */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-slate-800">
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                                <span className="text-[11px] text-slate-400 font-semibold block">الموكل (الطرف الأول)</span>
                                <p className="text-sm font-bold text-amber-500 mt-1">{caseData.client?.name || 'غير محدد'}</p>
                                <p className="text-[10px] text-slate-500 mt-1">الكيان الفني: {caseData.client?.client_type === 'company' ? 'مؤسسة / شركة / سجّل تجاري' : 'فرد / صفة طبيعية'}</p>
                            </div>
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                                <span className="text-[11px] text-slate-400 font-semibold block">المحامي المسؤول (المستشار الوكيل)</span>
                                <p className="text-sm font-bold text-slate-200 mt-1">{caseData.lawyer?.full_name || 'لم يتم التعيين بعد'}</p>
                                <p className="text-[10px] text-slate-500 mt-1">قناة التواصل: {caseData.lawyer?.email || '—'}</p>
                            </div>
                        </div>

                        {/* 📊 ربط وتثبيت المؤشر المالي المطور */}
                        <div className="pt-5 border-t border-slate-800 space-y-4">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                <DollarSign size={16} className="text-emerald-500" /> المركز والمؤشر المالي للدعوى
                            </h4>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block mb-1">قيمة عقد التمثيل</span>
                                    <span className="text-sm font-black text-slate-200">{caseValue.toLocaleString()} ر.س</span>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block mb-1">المحـصل الفعلي</span>
                                    <span className="text-sm font-black text-emerald-400">{amountPaid.toLocaleString()} ر.س</span>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                    <span className="text-[10px] text-slate-400 block mb-1">الأتعاب المتبقية</span>
                                    <span className="text-sm font-black text-amber-500">{remainingAmount.toLocaleString()} ر.س</span>
                                </div>
                            </div>
                            
                            {caseValue > 0 && (
                                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-850/60">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-slate-400">كفاءة ونسبة التحصيل المالي</span>
                                        <span className="text-emerald-400 font-bold">{collectionPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-l from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700" style={{ width: `${collectionPercentage}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ⚖️ خط الجلسات والمواعيد الزمني (Timeline المطور) */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                            <h3 className="text-sm font-bold text-white border-r-4 border-amber-500 pr-3 flex items-center gap-2">
                                <Calendar size={18} className="text-amber-500" /> الأجندة وخط الجلسات الزمني
                            </h3>
                            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all transform active:scale-95">
                                <Plus size={15} />
                                <span>جدولة جلسة قضائية</span>
                            </button>
                        </div>

                        {hearings.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                                <p className="text-xs text-slate-500">لا توجد جلسات محاكمة مجدولة برقم هذه القضية حالياً في الأجندة.</p>
                            </div>
                        ) : (
                            <div className="relative border-r-2 border-slate-800 mr-2 pr-6 space-y-6">
                                {hearings.map((hearing) => {
                                    const isPast = new Date(`${hearing.hearing_date}T${hearing.hearing_time}`) < new Date();
                                    return (
                                        <div key={hearing.id} className="relative group">
                                            {/* نقطة التايم لاين المضيئة بناء على حالة الجلسة */}
                                            <span className={`absolute -right-[33px] top-2 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-slate-900 ${isPast ? 'bg-slate-700' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse'}`}></span>
                                            
                                            <div className={`p-4 rounded-xl border transition-all ${isPast ? 'bg-slate-950/40 border-slate-850 opacity-75' : 'bg-slate-950 border-slate-800 shadow-md hover:border-slate-700'}`}>
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="space-y-2 flex-1 text-xs">
                                                        <div className="flex flex-wrap items-center gap-3 text-xs">
                                                            <span className="flex items-center gap-1.5 font-bold text-slate-200">
                                                                <Calendar size={14} className="text-amber-500" /> {hearing.hearing_date}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-slate-400">
                                                                <Clock size={13} /> {hearing.hearing_time}
                                                            </span>
                                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isPast ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                                {isPast ? "منتهية وموثقة" : "جلسة قادمة"}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-300 font-medium">
                                                            <MapPin size={13} className="inline ml-1 text-amber-500/80" /> {hearing.court_name} — قاعة/مكتب: ({hearing.room_number})
                                                        </p>
                                                        {hearing.judge_name && <p className="text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded inline-block">ناظر الدائرة فضيلة المستشار: {hearing.judge_name}</p>}

                                                        {(hearing.summary || hearing.requirements) && (
                                                            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-[11px] leading-relaxed">
                                                                {hearing.summary && (
                                                                    <p className="text-slate-300 bg-slate-900/50 p-2 rounded">
                                                                        <strong className="text-amber-500 font-bold block mb-0.5">📋 منطوق القرارات والمجريات:</strong> {hearing.summary}
                                                                    </p>
                                                                )}
                                                                {hearing.requirements && (
                                                                    <p className="text-slate-300 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                                                                        <strong className="text-amber-400 font-bold block mb-0.5">🎯 التزامات وطلبات الجلسة المقبلة:</strong> {hearing.requirements}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => openUpdateModal(hearing)} className="flex items-center gap-1 px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl transition-all shrink-0">
                                                        <Edit3 size={12} className="text-amber-500" />
                                                        <span>توثيق المجريات</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 📂 الجانب الأيسر (1/3): الأرشيف الرقمي الحصري للمستندات (DMS) */}
                <div className="space-y-6">
                    
                    {/* فورم الأرشفة السريعة وضبط التخزين */}
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <UploadCloud size={18} className="text-amber-500" /> أرشفة مستند رقمي جديد
                        </h3>

                        {uploadError && (
                            <p className="text-xs p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium">{uploadError}</p>
                        )}

                        <form onSubmit={handleFileUpload} className="space-y-3">
                            <div className="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-3 bg-slate-950 text-center transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-1">
                                    <FolderOpen size={24} className="mx-auto text-slate-500 group-hover:text-amber-500 transition-colors" />
                                    <p className="text-[11px] text-slate-400 font-bold">
                                        {selectedFile ? selectedFile.name : "اضغط هنا لاختيار الملف المستهدف"}
                                    </p>
                                    <p className="text-[9px] text-slate-600">PDF, WORD, JPG, PNG</p>
                                </div>
                            </div>

                            <input
                                type="text"
                                placeholder="صياغة المسمى (مثال: اللائحة الاعتراضية المعدلة)"
                                value={docDescription}
                                onChange={(e) => setDocDescription(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            />
                            
                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-colors"
                            >
                                {uploading ? 'جاري التخزين والمزامنة...' : 'حفظ بالمستودع الرقمي'}
                            </button>
                        </form>
                    </div>

                    {/* قائمة المرفقات المستقرة المخزنة */}
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <FileText size={18} className="text-amber-500" /> مستندات القضية المودعة ({caseData.attachments?.length || 0})
                        </h3>

                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                            {caseData.attachments?.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">لا توجد ملفات مرفوعة في المستودع الرقمي للدعوى حالياً.</p>
                            ) : (
                                caseData.attachments?.map((doc) => {
                                    const isImage = doc.file_type?.startsWith('image/');
                                    return (
                                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-850 bg-slate-950 hover:border-slate-800 transition-all">
                                            <div className="min-w-0 flex-1 flex items-center gap-3">
                                                <div className={`p-2 rounded-lg shrink-0 ${isImage ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-slate-200 truncate" title={doc.original_name}>
                                                        {doc.original_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-500">
                                                        <span className="bg-slate-900 px-1.5 py-0.2 rounded text-slate-400">
                                                            {formatFileSize(doc.file_size)}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatDate(doc.uploaded_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-0.5 shrink-0">
                                                <button
                                                    onClick={() => handleViewDocument(doc.id, doc.original_name)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-900 rounded-lg transition-colors"
                                                    title="استعراض فوري"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc.id, doc.original_name)}
                                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                                                    title="إتلاف من الأرشيف"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── ⚖️ نافذة منبثقة: جدولة جلسة محاكمة جديدة ─── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
                    <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Calendar size={18} className="text-amber-500" /> جدولة وعقد جلسة قضائية جديدة
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateHearing} className="p-6 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">تاريخ الانعقاد *</label>
                                    <input type="date" required value={newHearing.hearing_date} onChange={(e) => setNewHearing({ ...newHearing, hearing_date: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right text-white" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">توقيت الموعد *</label>
                                    <input type="time" required value={newHearing.hearing_time} onChange={(e) => setNewHearing({ ...newHearing, hearing_time: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-slate-400 mb-1.5">جهة الاختصاص الدائرة والمحكمة *</label>
                                <input type="text" required placeholder="مثال: ديوان المظالم بجدة - الدائرة الإدارية الثالثة" value={newHearing.court_name} onChange={(e) => setNewHearing({ ...newHearing, court_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">رقم القاعة / المكتب البث *</label>
                                    <input type="text" required placeholder="مثال: القاعة الرابعة الموحدة" value={newHearing.room_number} onChange={(e) => setNewHearing({ ...newHearing, room_number: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">القاضي ناظر الدائرة</label>
                                    <input type="text" placeholder="حفظ اسم ناظر القضية (اختياري)" value={newHearing.judge_name} onChange={(e) => setNewHearing({ ...newHearing, judge_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl font-bold transition-all">إلغاء</button>
                                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold shadow-md transition-all">تثبيت الجلسة بالأجندة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── 📝 نافذة منبثقة: تحديث المجريات والقرارات الصادرة ─── */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
                    <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Edit3 size={18} className="text-amber-500" /> توثيق منطوق القرارات وطلبات الدائرة
                            </h3>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateHearingDecisions} className="p-6 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">تاريخ الجلسة</label>
                                    <input type="date" value={updateForm.hearing_date} onChange={(e) => setUpdateForm({ ...updateForm, hearing_date: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">وقت الجلسة</label>
                                    <input type="time" value={updateForm.hearing_time} onChange={(e) => setUpdateForm({ ...updateForm, hearing_time: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-slate-400 mb-1.5">المحكمة والدائرة</label>
                                <input type="text" value={updateForm.court_name} onChange={(e) => setUpdateForm({ ...updateForm, court_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">القاعة / المكتب</label>
                                    <input type="text" value={updateForm.room_number} onChange={(e) => setUpdateForm({ ...updateForm, room_number: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1.5">ناظر الدائرة</label>
                                    <input type="text" value={updateForm.judge_name} onChange={(e) => setUpdateForm({ ...updateForm, judge_name: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-slate-400 mb-1.5">ملخص مجريات الجلسة وأسباب التأجيل أو القرارات</label>
                                <textarea rows={3} placeholder="رصد وتحليل دقيق لمنطوق ما دار داخل الجلسة وما صدر..." value={updateForm.summary} onChange={(e) => setUpdateForm({ ...updateForm, summary: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none" />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-400 mb-1.5">الطلبات القضائية والمذكرات المستهدفة للجلسة المقبلة</label>
                                <textarea rows={2} placeholder="مثال: إعداد رد على الدفوع الشكلية مع تبيان القيود الحسابية..." value={updateForm.requirements} onChange={(e) => setUpdateForm({ ...updateForm, requirements: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none" />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl font-bold transition-all">إلغاء</button>
                                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold shadow-md transition-all">حفظ وتوثيق القرارات</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── 🖼️ عارض وثائق ومستندات الأرشيف (DMS Preview Modal) ─── */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm transition-all">
                    <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-amber-500 shrink-0">
                                    {previewType.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                                </span>
                                <h3 className="text-sm font-bold text-white truncate max-w-md md:max-w-xl" title={previewTitle}>
                                    {previewTitle}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewUrl}
                                    download={previewTitle}
                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-amber-500/20"
                                >
                                    <Download size={14} />
                                    <span>تحميل نسخة</span>
                                </a>
                                <button
                                    onClick={() => {
                                        setIsPreviewOpen(false);
                                        window.URL.revokeObjectURL(previewUrl);
                                    }}
                                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-950 p-4 relative flex items-center justify-center overflow-auto">
                            {previewType.startsWith('image/') ? (
                                <img
                                    src={previewUrl}
                                    alt={previewTitle}
                                    className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-slate-800 bg-slate-900"
                                />
                            ) : (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full rounded-xl border-0 shadow-2xl bg-white"
                                    title="Document Law Archive Preview"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}