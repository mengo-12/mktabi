// الكود قبل اضافة التصميم الجديد
// import React, { useMemo } from 'react';
// import { FileText, Eye, Tag, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';

// export default function ClientDocumentsList({
//     editingRow,
//     getAllAssociatedDocuments,
//     handleViewDocument,
//     handleDeleteDocument,
//     allDocuments = []
// }) {

//     // تحديد رابط السيرفر الأساسي (منفذ 8000)
//     const BACKEND_URL = useMemo(() => {
//         return window.location.origin.includes('localhost') 
//             ? 'http://localhost:8000' 
//             : window.location.origin;
//     }, []);

//     // دالة استخراج وتجهيز الملفات بناءً على رد السيرفر الديناميكي
//     const associatedDocs = useMemo(() => {
//         if (!editingRow) return [];

//         let sourceRows = [];

//         if (typeof getAllAssociatedDocuments === 'function') {
//             try {
//                 const docs = getAllAssociatedDocuments(editingRow.id);
//                 if (Array.isArray(docs) && docs.length > 0) sourceRows = docs;
//             } catch (err) {
//                 console.error("خطأ أثناء تصفية المستندات:", err);
//             }
//         }

//         if (sourceRows.length === 0 && Array.isArray(allDocuments)) {
//             sourceRows = allDocuments;
//         }

//         if (sourceRows.length === 0 && editingRow) {
//             sourceRows = [editingRow];
//         }

//         const currentClientId = String(editingRow.id);
//         const currentClientName = editingRow.cells_data?.c1 || editingRow.name || "";

//         const extractedFiles = [];

//         sourceRows.forEach((row) => {
//             if (!row || !row.cells_data) return;

//             const cellsData = row.cells_data;
//             const rowId = row.id;
//             const tableId = row.table_id || "عام";

//             const isMatch = String(rowId) === currentClientId || 
//                             (cellsData.c1 && currentClientName && String(cellsData.c1).trim() === String(currentClientName).trim());

//             if (!isMatch) return;

//             Object.keys(cellsData).forEach((key) => {
//                 const value = cellsData[key];
//                 if (!value) return;

//                 // الحالة الأولى: مصفوفة ملفات (مثل حالة سعود)
//                 if (Array.isArray(value)) {
//                     value.forEach((fileObj, index) => {
//                         if (fileObj && (fileObj.url || fileObj.filePath)) {
//                             let rawUrl = fileObj.url || fileObj.filePath;
                            
//                             // إصلاح مشكلة الـ 404: تحويل مسار الـ documents إلى attachments تلقائياً ليطابق السيرفر
//                             if (rawUrl.includes('/documents/download/')) {
//                                 rawUrl = rawUrl.replace('/documents/download/', '/attachments/download/');
//                             }

//                             // استخراج الـ ID الفعلي للملف من الرابط للحذف الفردي (مثال: من الرابط يستخرج 70)
//                             const fileIdMatch = rawUrl.match(/\/download\/(\d+)/);
//                             const actualFileId = fileIdMatch ? fileIdMatch[1] : (fileObj.id || `${rowId}-${index}`);

//                             const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BACKEND_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

//                             extractedFiles.push({
//                                 id: actualFileId, // معرف الملف الفعلي الفريد وليس معرف السطر
//                                 fileName: fileObj.name || "مستند قانوني غير مسمى",
//                                 fileUrl: fullUrl,
//                                 originTable: `جدول رقم ${tableId}`,
//                                 recordTitle: cellsData.c1 || `سجل #${rowId}`,
//                                 rawDoc: row,
//                                 columnKey: key // العمود الذي يحتوي على المصفوفة لتسهيل التحديث
//                             });
//                         }
//                     });
//                 }
//                 // الحالة الثانية: نص رابط مباشر (مثل حالة ياسر وسامي)
//                 else if (typeof value === 'string' && (value.startsWith('http') || value.includes('/download/'))) {
//                     let fixedUrl = value;
//                     if (fixedUrl.includes('/documents/download/')) {
//                         fixedUrl = fixedUrl.replace('/documents/download/', '/attachments/download/');
//                     }

//                     const fileIdMatch = fixedUrl.match(/\/download\/(\d+)/);
//                     const actualFileId = fileIdMatch ? fileIdMatch[1] : `${rowId}-${key}`;

//                     const fullUrl = fixedUrl.startsWith('http') ? fixedUrl : `${BACKEND_URL}${fixedUrl.startsWith('/') ? '' : '/'}${fixedUrl}`;
//                     const fileNameFromUrl = fixedUrl.split('/').pop() || "";

//                     extractedFiles.push({
//                         id: actualFileId,
//                         fileName: cellsData.c1 ? `ملف الموكل (${cellsData.c1})` : `مستند_${fileNameFromUrl}`,
//                         fileUrl: fullUrl,
//                         originTable: `جدول رقم ${tableId}`,
//                         recordTitle: cellsData.c1 || `سجل #${rowId}`,
//                         rawDoc: row,
//                         columnKey: key
//                     });
//                 }
//             });
//         });

//         return extractedFiles;
//     }, [editingRow, getAllAssociatedDocuments, allDocuments, BACKEND_URL]);

//     if (!editingRow) {
//         return (
//             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400" dir="rtl">
//                 <p className="text-xs italic">يرجى اختيار سجل أو موكل لعرض أرشيفه الرقمي المربوط.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 w-full" dir="rtl">
//             {/* رأس القسم */}
//             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//                 <div className="flex items-center gap-2.5">
//                     <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
//                         <FileText className="w-5 h-5" />
//                     </div>
//                     <div>
//                         <h3 className="text-sm font-black text-slate-200">الأرشيف الرقمي للموكل</h3>
//                         <p className="text-[11px] text-slate-500 mt-0.5">الملفات المستخرجة للسجل: <span className="text-emerald-400 font-bold">{editingRow.cells_data?.c1 || `سجل #${editingRow.id}`}</span></p>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-400">
//                     <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
//                     <span>مستندات النظام المكتشفة</span>
//                 </div>
//             </div>

//             {/* جدول عرض المستندات */}
//             <div className="overflow-x-auto">
//                 {associatedDocs.length === 0 ? (
//                     <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 space-y-3">
//                         <div className="inline-flex p-2.5 bg-amber-500/10 text-amber-500 rounded-full mx-auto">
//                             <AlertCircle className="w-5 h-5" />
//                         </div>
//                         <p className="text-xs text-slate-400 font-medium">لا توجد ملفات مرفوعة مرفقة بهذا السجل حالياً.</p>
//                     </div>
//                 ) : (
//                     <table className="w-full text-right border-collapse text-xs">
//                         <thead>
//                             <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/40">
//                                 <th className="py-3 px-4 rounded-r-xl">اسم الملف / المستند</th>
//                                 <th className="py-3 px-4">المصدر</th>
//                                 <th className="py-3 px-4">مرتبط بـ</th>
//                                 <th className="py-3 px-4 text-left rounded-l-xl">العمليات</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-850">
//                             {associatedDocs.map((doc) => (
//                                 <tr key={doc.id} className="hover:bg-slate-950/40 transition group">
//                                     <td className="py-3.5 px-4 font-bold text-slate-300 max-w-[240px] truncate">
//                                         <div className="flex items-center gap-2">
//                                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
//                                             <span className="truncate group-hover:text-emerald-400 transition" title={doc.fileName}>
//                                                 {doc.fileName}
//                                             </span>
//                                         </div>
//                                     </td>

//                                     <td className="py-3.5 px-4">
//                                         <span className="inline-flex items-center gap-1 bg-slate-950 text-cyan-400 px-2.5 py-1 rounded-lg border border-slate-850 font-medium text-[11px]">
//                                             <Tag className="w-3 h-3 text-cyan-500" />
//                                             {doc.originTable}
//                                         </span>
//                                     </td>

//                                     <td className="py-3.5 px-4 text-slate-400 font-medium truncate">
//                                         {doc.recordTitle}
//                                     </td>

//                                     <td className="py-3.5 px-4 text-left flex justify-end gap-2 items-center">
//                                         <button
//                                             type="button"
//                                             onClick={() => handleViewDocument && handleViewDocument(doc.fileUrl)}
//                                             className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl font-bold text-[11px] transition shadow-sm cursor-pointer"
//                                         >
//                                             <Eye className="w-3.5 h-3.5" />
//                                             <span>عرض الفايل ↗</span>
//                                         </button>

//                                         {typeof handleDeleteDocument === 'function' && (
//                                             <button
//                                                 type="button"
//                                                 onClick={() => {
//                                                     // تمرير معرف الملف الفعلي (مثل 70) ومعلومات السجل لتفادي الحذف الشامل
//                                                     handleDeleteDocument(doc.id, doc.rawDoc, doc.columnKey);
//                                                 }}
//                                                 className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl font-bold text-[11px] transition shadow-sm cursor-pointer"
//                                                 title="حذف هذا الملف فقط"
//                                             >
//                                                 <Trash2 className="w-3.5 h-3.5" />
//                                             </button>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         </div>
//     );
// }

import React, { useMemo } from 'react';
import { FileText, Eye, Tag, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';

export default function ClientDocumentsList({
    editingRow,
    getAllAssociatedDocuments,
    handleViewDocument,
    handleDeleteDocument,
    allDocuments = []
}) {

    // تحديد رابط السيرفر الأساسي (منفذ 8000)
    const BACKEND_URL = useMemo(() => {
        return window.location.origin.includes('localhost') 
            ? 'http://localhost:8000' 
            : window.location.origin;
    }, []);

    // دالة استخراج وتجهيز الملفات بناءً على رد السيرفر الديناميكي
    const associatedDocs = useMemo(() => {
        if (!editingRow) return [];

        let sourceRows = [];

        if (typeof getAllAssociatedDocuments === 'function') {
            try {
                const docs = getAllAssociatedDocuments(editingRow.id);
                if (Array.isArray(docs) && docs.length > 0) sourceRows = docs;
            } catch (err) {
                console.error("خطأ أثناء تصفية المستندات:", err);
            }
        }

        if (sourceRows.length === 0 && Array.isArray(allDocuments)) {
            sourceRows = allDocuments;
        }

        if (sourceRows.length === 0 && editingRow) {
            sourceRows = [editingRow];
        }

        const currentClientId = String(editingRow.id);
        const currentClientName = editingRow.cells_data?.c1 || editingRow.name || "";

        const extractedFiles = [];

        sourceRows.forEach((row) => {
            if (!row || !row.cells_data) return;

            const cellsData = row.cells_data;
            const rowId = row.id;
            const tableId = row.table_id || "عام";

            const isMatch = String(rowId) === currentClientId || 
                            (cellsData.c1 && currentClientName && String(cellsData.c1).trim() === String(currentClientName).trim());

            if (!isMatch) return;

            Object.keys(cellsData).forEach((key) => {
                const value = cellsData[key];
                if (!value) return;

                // الحالة الأولى: مصفوفة ملفات (مثل حالة سعود)
                if (Array.isArray(value)) {
                    value.forEach((fileObj, index) => {
                        if (fileObj && (fileObj.url || fileObj.filePath)) {
                            let rawUrl = fileObj.url || fileObj.filePath;
                            
                            // إصلاح مشكلة الـ 404: تحويل مسار الـ documents إلى attachments تلقائياً ليطابق السيرفر
                            if (rawUrl.includes('/documents/download/')) {
                                rawUrl = rawUrl.replace('/documents/download/', '/attachments/download/');
                            }

                            // استخراج الـ ID الفعلي للملف من الرابط للحذف الفردي (مثال: من الرابط يستخرج 70)
                            const fileIdMatch = rawUrl.match(/\/download\/(\d+)/);
                            const actualFileId = fileIdMatch ? fileIdMatch[1] : (fileObj.id || `${rowId}-${index}`);

                            const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BACKEND_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

                            extractedFiles.push({
                                id: actualFileId, // معرف الملف الفعلي الفريد وليس معرف السطر
                                fileName: fileObj.name || "مستند قانوني غير مسمى",
                                fileUrl: fullUrl,
                                originTable: `جدول رقم ${tableId}`,
                                recordTitle: cellsData.c1 || `سجل #${rowId}`,
                                rawDoc: row,
                                columnKey: key // العمود الذي يحتوي على المصفوفة لتسهيل التحديث
                            });
                        }
                    });
                }
                // الحالة الثانية: نص رابط مباشر (مثل حالة ياسر وسامي)
                else if (typeof value === 'string' && (value.startsWith('http') || value.includes('/download/'))) {
                    let fixedUrl = value;
                    if (fixedUrl.includes('/documents/download/')) {
                        fixedUrl = fixedUrl.replace('/documents/download/', '/attachments/download/');
                    }

                    const fileIdMatch = fixedUrl.match(/\/download\/(\d+)/);
                    const actualFileId = fileIdMatch ? fileIdMatch[1] : `${rowId}-${key}`;

                    const fullUrl = fixedUrl.startsWith('http') ? fixedUrl : `${BACKEND_URL}${fixedUrl.startsWith('/') ? '' : '/'}${fixedUrl}`;
                    const fileNameFromUrl = fixedUrl.split('/').pop() || "";

                    extractedFiles.push({
                        id: actualFileId,
                        fileName: cellsData.c1 ? `ملف الموكل (${cellsData.c1})` : `مستند_${fileNameFromUrl}`,
                        fileUrl: fullUrl,
                        originTable: `جدول رقم ${tableId}`,
                        recordTitle: cellsData.c1 || `سجل #${rowId}`,
                        rawDoc: row,
                        columnKey: key
                    });
                }
            });
        });

        return extractedFiles;
    }, [editingRow, getAllAssociatedDocuments, allDocuments, BACKEND_URL]);

    if (!editingRow) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400" dir="rtl">
                <p className="text-xs italic">يرجى اختيار سجل أو موكل لعرض أرشيفه الرقمي المربوط.</p>
            </div>
        );
    }

return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 w-full shadow-sm text-black dark:text-slate-100" dir="rtl">
            {/* رأس القسم */}
<div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
    <div className="flex items-center gap-2.5">
        <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText className="w-5 h-5" />
        </div>
        <div>
            <h3 className="text-sm font-black text-black dark:text-slate-200">الأرشيف الرقمي للموكل</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">الملفات المستخرجة للسجل: <span className="text-blue-600 dark:text-blue-400 font-bold">{editingRow.cells_data?.c1 || `سجل #${editingRow.id}`}</span></p>
        </div>
    </div>
    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
        <span>مستندات النظام المكتشفة</span>
    </div>
</div>

            {/* جدول عرض المستندات */}
            <div className="overflow-x-auto">
                {associatedDocs.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 space-y-3">
                        <div className="inline-flex p-2.5 bg-amber-500/10 text-blue-600 rounded-full mx-auto">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">لا توجد ملفات مرفوعة مرفقة بهذا السجل حالياً.</p>
                    </div>
                ) : (
                    <table className="w-full text-right border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50/60 dark:bg-slate-950/40">
                                <th className="py-3 px-4 rounded-r-xl">اسم الملف / المستند</th>
                                <th className="py-3 px-4">المصدر</th>
                                <th className="py-3 px-4">مرتبط بـ</th>
                                <th className="py-3 px-4 text-left rounded-l-xl">العمليات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                            {associatedDocs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-950/40 transition-all group">
                                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-300 max-w-[240px] truncate">
<div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
    <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" title={doc.fileName}>
        {doc.fileName}
    </span>
</div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-950 text-cyan-600 dark:text-cyan-400 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-800 font-medium text-[11px]">
                                            <Tag className="w-3 h-3 text-cyan-500" />
                                            {doc.originTable}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium truncate">
                                        {doc.recordTitle}
                                    </td>

                                    <td className="py-3.5 px-4 text-left flex justify-end gap-2 items-center">
                                        <button
                                            type="button"
                                            onClick={() => handleViewDocument && handleViewDocument(doc.fileUrl)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl font-bold text-[11px] transition-all shadow-sm cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>عرض الفايل ↗</span>
                                        </button>

                                        {typeof handleDeleteDocument === 'function' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // تمرير معرف الملف الفعلي (مثل 70) ومعلومات السجل لتفادي الحذف الشامل
                                                    handleDeleteDocument(doc.id, doc.rawDoc, doc.columnKey);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 hover:bg-red-600 dark:bg-red-500/10 dark:hover:bg-red-500 text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white border border-red-200 dark:border-red-500/20 hover:border-red-600 dark:hover:border-red-500 rounded-xl font-bold text-[11px] transition-all shadow-sm cursor-pointer"
                                                title="حذف هذا الملف فقط"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}