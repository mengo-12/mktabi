'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/services/apiClient';

export default function CaseDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

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

    // 📡 1. جلب تفاصيل القضية الحية من السيرفر
    const fetchCaseDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get(`/cases/${id}`);
            setCaseData(response.data);
        } catch (err) {
            console.error(err);
            setError('تعذر جلب تفاصيل القضية، قد لا تملك الصلاحية أو أن الملف غير موجود.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaseDetails();
    }, [id]);

    // 📤 2. دالة رفع مستند جديد محلياً مرتبط بهذه القضية
    // 📤 دالة رفع مستند جديد محلياً مرتبط بهذه القضية
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            setUploading(true);
            setUploadError('');

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('description', docDescription);

            // 🚀 الرابط الصحيح والمطابق تماماً للباك-إند الخاص بك الآن:
            await apiClient.post(`/documents/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // تنظيف المدخلات وإعادة جلب البيانات لتحديث قائمة الملفات فوراً
            setSelectedFile(null);
            setDocDescription('');
            fetchCaseDetails();
        } catch (err) {
            setUploadError(err.response?.data?.detail || 'حدث خطأ أثناء رفع الملف للسيرفر.');
        } finally {
            setUploading(false);
        }
    };

    // // 📥 3. دالة تحميل / بث المستند الآمن برقم الـ ID الخاص به
    // const handleDownloadDocument = async (docId, fileName) => {
    //     try {
    //         // 🚀 تعديل الرابط هنا أيضاً إلى documents ليطابق الـ Router
    //         const response = await apiClient.get(`/documents/download/${docId}`, {
    //             responseType: 'blob'
    //         });

    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', fileName || `document_${docId}.pdf`);
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //     } catch (err) {
    //         alert('فشل تحميل الملف. تأكد من صلاحياتك الأمنية على هذا المستند.');
    //     }
    // };

    // 👁️ دالة جلب وبث المستند لعرضه مباشرة في النافذة المنبثقة
    const handleViewDocument = async (docId, fileName) => {
        try {
            setUploading(true); // استخدام مؤشر التحميل أثناء جلب الملف

            // طلب الملف كـ Blob من الباك-إند
            const response = await apiClient.get(`/documents/download/${docId}`, {
                responseType: 'blob'
            });

            // 🚀 تحديد نوع الملف (MIME Type) بشكل صحيح ليقوم المتصفح بعرضه بدلاً من تحميله
            const fileBlob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
            const url = window.URL.createObjectURL(fileBlob);

            // تخزين البيانات وفتح النافذة المنبثقة
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
            // إرسال طلب الحذف إلى الـ Router المرتبط بـ /documents
            await apiClient.delete(`/documents/${docId}`);

            // تحديث البيانات فوراً في الواجهة لإخفاء الملف المحذوف
            fetchCaseDetails();
            alert('تم حذف المستند بنجاح من الأرشيف الرقمي للشركة.');
        } catch (err) {
            alert(err.response?.data?.detail || 'فشل حذف الملف، قد لا تملك الصلاحية الكافية.');
        } finally {
            setUploading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="text-sm text-slate-500 font-medium">جاري جلب ملف القضية والأرشيف الرقمي...</p>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="p-6 max-w-xl mx-auto text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <span className="text-4xl">⚠️</span>
                <p className="text-slate-800 font-bold text-lg">{error || 'القضية غير موجودة'}</p>
                <button onClick={() => router.push('/dashboard/cases')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors">
                    العودة لجدول القضايا
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* هيدر الصفحة والعودة للخلف */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/dashboard/cases')} className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors text-xl">
                    👉
                </button>
                <div>
                    <span className="text-xs px-2.5 py-0.5 font-bold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                        قضية رقم #{caseData.id}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{caseData.title}</h2>
                </div>
            </div>

            {/* تقسم الصفحة إلى قسمين: تفاصيل القضية يميناً والأرشفة يساراً */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 🏛️ القسم الأول: بطاقة تفاصيل القضية وأطرافها (2/3 من المساحة) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white border-r-4 border-blue-600 pr-2">وصف وموضوع الدعوى</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 leading-relaxed whitespace-pre-line">{caseData.description}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div>
                                <span className="text-xs text-slate-400 font-semibold block">الموكل (الطرف الأول)</span>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{caseData.client?.name || 'غير محدد'}</p>
                                <p className="text-xs text-slate-400 mt-0.5">نوع الهوية/السجل: {caseData.client?.client_type === 'company' ? 'شركة / سجّل تجاري' : 'فرد / هوية وطنية'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-semibold block">المحامي المسؤول (الوكيل)</span>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{caseData.lawyer?.full_name || 'غير معين'}</p>
                                <p className="text-xs text-slate-400 mt-0.5">البريد: {caseData.lawyer?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div>
                                <span className="text-xs text-slate-400 font-semibold block">الحالة القضائية الحالية</span>
                                <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                    {caseData.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📂 القسم الثاني: الأرشيف الرقمي للمستندات (DMS) (1/3 من المساحة) */}
                <div className="space-y-6">

                    {/* نموذج رفع ملف جديد */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>📤</span> أرشفة مستند جديد للقضية
                        </h3>

                        {uploadError && (
                            <p className="text-xs p-2.5 bg-red-50 text-red-600 rounded-lg font-medium">{uploadError}</p>
                        )}

                        <form onSubmit={handleFileUpload} className="space-y-3">
                            <input
                                type="file"
                                required
                                accept=".pdf,.doc,.docx,.jpg,.png"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="w-full text-xs text-slate-500 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            <input
                                type="text"
                                placeholder="وصف مختصر (مثال: لائحة اعتراضية)"
                                value={docDescription}
                                onChange={(e) => setDocDescription(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow transition-colors"
                            >
                                {uploading ? 'جاري التخزين المحلي...' : 'حفظ المستند بالأرشيف'}
                            </button>
                        </form>
                    </div>

                    {/* قائمة الوثائق المرفوعة مسبقاً بالقضية */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>📂</span> الوثائق والمستندات المرفقة ({caseData.attachments?.length || 0})
                        </h3>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {caseData.attachments?.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">لا توجد ملفات مرفوعة لهذه الدعوى بعد.</p>
                            ) : (

                                caseData.attachments?.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/10 hover:border-blue-100 transition-colors">
                                        <div className="min-w-0 flex-1 pl-2">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate" title={doc.original_name}>
                                                {doc.original_name} {/* 👈 حدثناها هنا لتقرأ الاسم الأصلي من السيرفر */}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{doc.description || 'مستند قضائي مؤرشف'}</p>
                                        </div>
                                        {/* <button
                                            onClick={() => handleDownloadDocument(doc.id, doc.original_name)} // 👈 حدثناها هنا أيضاً
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg text-xs font-semibold transition-colors shrink-0"
                                            title="تحميل آمن كـ Stream"
                                        >
                                            ⬇️
                                        </button> */}
                                        <button
                                            onClick={() => handleViewDocument(doc.id, doc.original_name)} // 👈 الدالة الجديدة هنا
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
                                            title="استعراض المستند في المتصفح"
                                        >
                                            <span>👁️</span> استعراض
                                        </button>
                                        
                                        {/* 🚀 زر الحذف الجديد والأنيق */}
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id, doc.original_name)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                            title="حذف المستند نهائياً"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))

                            )}
                        </div>
                    </div>

                </div>

            </div>



            {/* 🏛️ النافذة المنبثقة لاستعراض المستندات القضائية (DMS Preview Modal) */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">

                        {/* هيدر النافذة */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📄</span>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-md" title={previewTitle}>
                                    استعراض: {previewTitle}
                                </h3>
                            </div>

                            {/* أزرار التحكم (إغلاق وتحميل) */}
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewUrl}
                                    download={previewTitle}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                                >
                                    📥 تحميل نسخة
                                </a>
                                <button
                                    onClick={() => {
                                        setIsPreviewOpen(false);
                                        window.URL.revokeObjectURL(previewUrl); // تنظيف الذاكرة بعد الإغلاق
                                    }}
                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-colors font-bold text-sm"
                                >
                                    ❌ إغلاق
                                </button>
                            </div>
                        </div>

                        {/* جسم النافذة وعارض الملفات المباشر */}
                        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 relative">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full rounded-xl border-0 shadow-inner bg-white"
                                title="Document Preview"
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}