// "use client";

// import React, { useState, useEffect } from 'react';
// import { FileText, Printer, Save, X, Sparkles, Eye } from 'lucide-react';

// export default function GlobalDocumentGenerator({ triggerButton, activeTable, selectedRow, filteredRows }) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [templates, setTemplates] = useState([]);
//     const [selectedTemplate, setSelectedTemplate] = useState(null);
//     const [mergedContent, setMergedContent] = useState('');
//     const [documentTitle, setDocumentTitle] = useState('');
//     const [isSaving, setIsSaving] = useState(false);
//     const [officeSettings, setOfficeSettings] = useState(null);

//     const tableId = activeTable?.id;
//     const columnsDefinition = activeTable?.columns_definition || [];
//     const activeRowData = selectedRow?.cells_data || filteredRows?.[0]?.cells_data || {};
//     const rowId = selectedRow?.id || 0;

//     useEffect(() => {
//         if (isOpen) {
//             fetchTemplates();
//             fetchOfficeSettings();
//         }
//     }, [isOpen]);

//     const fetchTemplates = async () => {
//         try {
//             const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates');
//             const data = await res.json();
//             if (Array.isArray(data)) setTemplates(data);
//         } catch (error) {
//             console.error("خطأ في جلب القوالب:", error);
//         }
//     };

//     const fetchOfficeSettings = async () => {
//         try {
//             const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/');
//             const data = await res.json();
//             setOfficeSettings(data);
//         } catch (error) {
//             console.error("خطأ في جلب إعدادات المكتب:", error);
//         }
//     };

//     // 🔥 دالة سحرية جديدة: تحول عناصر Canva المحفوظة في الإعدادات إلى HTML مرئي ومطابق تماماً للتصميم
//     // 🔥 التعديل التلقائي: الدالة الآن تقرأ عناصر Canva المربوطة بالقالب المختار مباشرة
//     const renderCanvaToHTML = () => {
//         // إذا كان القالب يحتوي على canvas_elements نستخدمها، وإلا نعود للافتراضي الخاص بالمكتب
//         const elements = selectedTemplate?.canvas_elements || selectedTemplate?.header_data?.canvas_elements || officeSettings?.header_data?.canvas_elements || [];
//         if (elements.length === 0) return '';

//         return `
//             <div style="position: relative; width: 100%; height: 140px; font-family: 'Cairo', sans-serif; direction: rtl; margin-bottom: 20px;">
//                 ${elements.map(el => {
//             const widthStr = typeof el.width === 'number' ? `${el.width}px` : (el.type === 'line' ? `${el.width}%` : el.width);
//             const style = `position: absolute; right: ${el.x}%; top: ${el.y}%; width: ${widthStr};`;

//             if (el.type === 'text') {
//                 return `<div style="${style} font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; color: ${el.color || '#000'}; text-align: right; white-space: pre-wrap;">${el.content}</div>`;
//             }
//             if (el.type === 'image') {
//                 return `<div style="${style}"><img src="${el.content}" style="width: 100%; height: auto; object-fit: contain;"/></div>`;
//             }
//             if (el.type === 'line') {
//                 return `<div style="${style} background-color: ${el.color || '#f59e0b'}; height: ${el.height || 2}px; border-radius: 2px;"></div>`;
//             }
//             return '';
//         }).join('')}
//             </div>
//         `;
//     };

//     const handleSelectTemplate = (template) => {
//         setSelectedTemplate(template);
//         const primaryColumnId = columnsDefinition[0]?.id;
//         const primaryValue = activeRowData[primaryColumnId] || 'سجل';
//         setDocumentTitle(`${template.title} - ${primaryValue}`);

//         let content = template.content_body;
//         columnsDefinition.forEach(col => {
//             const placeholder = `{{${col.name}}}`;
//             const actualValue = activeRowData[col.id] || `[لم يحدد ${col.name}]`;
//             content = content.replaceAll(placeholder, actualValue);
//         });
//         setMergedContent(content);
//     };

//     const handleSaveToArchive = async () => {
//         if (!documentTitle || !mergedContent) return;
//         setIsSaving(true);

//         // 1. بناء الهيكل المرئي المدمج بتصميم Canva للطباعة والمعاينة
//         const finalHTMLStructure = `
//             <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; padding: 40px; color: #1e293b; background: white;">

//                 ${renderCanvaToHTML()}

//                 <div style="font-size: 14px; line-height: 1.8; white-space: pre-line; min-height: 450px; margin-top: 10px;">
//                     ${mergedContent}
//                 </div>

//                 <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
//                     <p>${officeSettings?.footer_data?.address || ''} | جوال: ${officeSettings?.footer_data?.phone || ''}</p>
//                     <p>${officeSettings?.footer_data?.iban ? `الحساب البنكي (IBAN): ${officeSettings.footer_data.iban}` : ''}</p>
//                 </div>
//             </div>
//         `;

//         // 2. تجهيز الـ Payload الشامل للباك إند (دمج الكود الجديد الخاص بك مع المتغيرات الديناميكية للمكون)
//         const payload = {
//             title: documentTitle,
//             template_id: selectedTemplate?.id,       // معرّف القالب لربط التصميم بالباك إند
//             table_id: parseInt(tableId),              // selectedTableId من البروبس الديناميكية
//             row_id: parseInt(rowId),                  // selectedRowId من البروبس الديناميكية
//             content_body: mergedContent,              // النص المكتوب حالياً بعد التعديل (textInsertedByUser)
//             final_content: finalHTMLStructure,        // الهيكل النهائي مع ترويسة Canva
//             created_by: "المحامي الحالي"
//         };

//         try {
//             // 3. إرسال الطلب إلى السيرفر
//             const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/generated', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });

//             if (res.ok) {
//                 alert("تم توليد المستند وحفظه في أرشيف هذا السجل بنجاح مدمجاً بهوية Canva! 💾📂");
//                 setIsOpen(false);
//             } else {
//                 alert("فشل في حفظ وتوليد المستند، يرجى التحقق من السيرفر.");
//             }
//         } catch (error) {
//             console.error("خطأ أثناء أرشفة المستند:", error);
//             alert("حدث خطأ في الاتصال بالخادم.");
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <>
//             {triggerButton && React.cloneElement(triggerButton, {
//                 onClick: (e) => {
//                     e.stopPropagation();
//                     setIsOpen(true);
//                 }
//             })}

//             {isOpen && (
//                 <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
//                     <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl">

//                         {/* الرأس */}
//                         <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 rounded-t-2xl">
//                             <div className="flex items-center gap-2">
//                                 <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
//                                 <div>
//                                     <h3 className="text-sm font-bold text-slate-100">معالج المستندات والذكاء التوليدي الموحد</h3>
//                                     <p className="text-[11px] text-slate-400 mt-0.5">توليد عقود، فواتير، وتقارير مدمجة تلقائياً ببيانات هذا السجل.</p>
//                                 </div>
//                             </div>
//                             <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition">
//                                 <X className="w-4 h-4" />
//                             </button>
//                         </div>

//                         {/* الجسد */}
//                         <div className="flex-1 grid grid-cols-1 md:grid-cols-4 overflow-hidden">

//                             {/* القائمة اليمنى */}
//                             <div className="md:col-span-1 border-l border-slate-800 p-4 overflow-y-auto bg-slate-950/20">
//                                 <span className="text-[11px] font-bold text-slate-400 block mb-3 uppercase tracking-wider">اختر قالب التصميم</span>
//                                 <div className="space-y-2">
//                                     {templates.map(template => (
//                                         <button
//                                             key={template.id}
//                                             onClick={() => handleSelectTemplate(template)}
//                                             className={`w-full text-right p-3 rounded-xl border text-xs flex flex-col gap-1 transition ${selectedTemplate?.id === template.id
//                                                 ? 'bg-amber-500/10 border-amber-500 text-amber-500'
//                                                 : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
//                                                 }`}
//                                         >
//                                             <span className="font-bold flex items-center gap-1.5">
//                                                 <FileText className="w-3.5 h-3.5" />
//                                                 {template.title}
//                                             </span>
//                                             <span className="text-[10px] text-slate-500">نوع: {template.template_type}</span>
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* منطقة المعاينة */}
//                             <div className="md:col-span-3 flex flex-col overflow-hidden p-6 bg-slate-950/40">
//                                 {selectedTemplate ? (
//                                     <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
//                                         <div className="flex flex-col gap-2">
//                                             <label className="text-xs font-bold text-slate-400">اسم المستند النهائي المؤرشف</label>
//                                             <input
//                                                 type="text"
//                                                 value={documentTitle}
//                                                 onChange={(e) => setDocumentTitle(e.target.value)}
//                                                 className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none w-full"
//                                             />
//                                         </div>

//                                         <div className="flex-1 bg-white rounded-xl p-8 overflow-y-auto shadow-inner text-slate-900 border border-slate-200">

//                                             {/* 👑 ترويسة محاكاة الورقة الرسمية للمعاينة الحية المبنية على تصميم Canva المحفوظ */}
//                                             <div dangerouslySetInnerHTML={{ __html: renderCanvaToHTML() }} />

//                                             {/* محتوى الورقة */}
//                                             <textarea
//                                                 value={mergedContent}
//                                                 onChange={(e) => setMergedContent(e.target.value)}
//                                                 className="w-full h-[32vh] border-0 text-slate-800 text-sm font-sans leading-relaxed focus:ring-0 outline-none resize-none p-0 bg-transparent mt-4"
//                                                 style={{ whiteSpace: 'pre-line' }}
//                                             />

//                                             {/* تذييل محاكاة الورقة */}
//                                             <div className="mt-12 border-t pt-3 text-[10px] text-slate-400 text-center">
//                                                 <p>{officeSettings?.footer_data?.address || ''} | هاتف: {officeSettings?.footer_data?.phone || ''}</p>
//                                             </div>
//                                         </div>

//                                         {/* أزرار التحكم والاعتماد */}
//                                         <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
//                                             <button
//                                                 onClick={() => window.print()}
//                                                 className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 text-xs font-bold px-4 py-2 rounded-lg transition"
//                                             >
//                                                 <Printer className="w-4 h-4" /> طباعة فورية
//                                             </button>
//                                             <button
//                                                 onClick={handleSaveToArchive}
//                                                 disabled={isSaving}
//                                                 className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition shadow-lg disabled:opacity-50"
//                                             >
//                                                 <Save className="w-4 h-4" /> {isSaving ? 'جاري الأرشفة...' : 'اعتماد وحفظ بالأرشيف الرقمي'}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="flex-1 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8">
//                                         <Eye className="w-12 h-12 text-slate-700 mb-2" />
//                                         <h4 className="text-xs font-bold text-slate-400">معاينة المستند خالية</h4>
//                                         <p className="text-[11px] text-slate-500 mt-1 max-w-xs">الرجاء اختيار أحد القوالب الجاهزة من القائمة اليمنى ليقوم النظام بدمج بيانات هذا السجل تلقائياً وعرضها لك هنا.</p>
//                                     </div>
//                                 )}
//                             </div>

//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }



"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Save, X, Sparkles, Eye, Bold, Type, Palette } from 'lucide-react';

export default function GlobalDocumentGenerator({ triggerButton, activeTable, selectedRow, filteredRows }) {
    const [isOpen, setIsOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // عناصر الكانفاس التفاعلية
    const [canvasElements, setCanvasElements] = useState([]);
    const [mergedContent, setMergedContent] = useState('');
    const [documentTitle, setDocumentTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [officeSettings, setOfficeSettings] = useState(null);

    // حالة العنصر النشط حالياً لإظهار شريط أدوات Canva فوقه
    const [activeElementId, setActiveElementId] = useState(null);

    const tableId = activeTable?.id;
    const columnsDefinition = activeTable?.columns_definition || [];
    const activeRowData = selectedRow?.cells_data || filteredRows?.[0]?.cells_data || {};
    const rowId = selectedRow?.id || 0;

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            fetchOfficeSettings();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates');
            const data = await res.json();
            if (Array.isArray(data)) setTemplates(data);
        } catch (error) {
            console.error("خطأ في جلب القوالب:", error);
        }
    };

    const fetchOfficeSettings = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/');
            const data = await res.json();
            setOfficeSettings(data);
        } catch (error) {
            console.error("خطأ في جلب إعدادات المكتب:", error);
        }
    };

    // تحديث خصائص أي عنصر نصي (المحتوى، الحجم، الوزن، اللون)
    const updateElementProperty = (elementId, property, value) => {
        setCanvasElements(prev =>
            prev.map(el => el.id === elementId ? { ...el, [property]: value } : el)
        );
    };

    // 🛠️ التعديل الجذري: تجميع الـ HTML النهائي ليتطابق 100% مع حسابات الشاشة الحالية
    const generateFinalHTMLStructure = () => {
        const canvaHTML = `
            <div style="position: relative; width: 100%; height: 140px; font-family: 'Cairo', sans-serif; direction: rtl; margin-bottom: 20px; box-sizing: border-box;">
                ${canvasElements.map(el => {
                    const widthStr = typeof el.width === 'number' ? `${el.width}px` : (el.type === 'line' ? `${el.width}%` : el.width);

                    // 🎯 مطابقة تامة للشاشة: الاعتماد على left المباشرة مع إلغاء عمليات العكس المعقدة التي تربك المتصفح أثناء الطباعة
                    const style = `position: absolute; left: ${el.x}%; top: ${el.y}%; width: widthStr; box-sizing: border-box; text-align: right; transform: translate(0, 0);`;

                    if (el.type === 'text') return `<div style="${style} font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; color: ${el.color || '#000000'}; white-space: pre-wrap; line-height: 1.3; font-family: 'Cairo', sans-serif;">${el.content}</div>`;
                    if (el.type === 'image') return `<div style="${style}"><img src="${el.content}" style="width: 100%; height: auto; object-fit: contain;"/></div>`;
                    if (el.type === 'line') return `<div style="${style} background-color: ${el.color || '#f59e0b'}; height: ${el.height || 2}px; border-radius: 2px;"></div>`;
                    return '';
                }).join('')}
            </div>
        `;

        return `
            <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; padding: 20mm; color: #1e293b; background: white; width: 210mm; min-height: 297mm; box-sizing: border-box; position: relative; margin: 0 auto;">
                ${canvaHTML}
                <div style="font-size: 14px; line-height: 1.8; white-space: pre-line; min-height: 500px; margin-top: 15px; color: #1e293b; font-family: 'Cairo', sans-serif;">
                    ${mergedContent}
                </div>
                <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center; width: 100%; font-family: 'Cairo', sans-serif;">
                    <p>${officeSettings?.footer_data?.address || ''} | جوال: ${officeSettings?.footer_data?.phone || ''}</p>
                </div>
            </div>
        `;
    };

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        const primaryColumnId = columnsDefinition[0]?.id;
        const primaryValue = activeRowData[primaryColumnId] || 'سجل';
        setDocumentTitle(`${template.title} - ${primaryValue}`);

        const rawElements =
            template?.visual_design?.canvas_elements ||
            template?.canvas_elements ||
            template?.header_data?.canvas_elements ||
            officeSettings?.header_data?.canvas_elements ||
            [];

        const processedElements = rawElements.map(el => {
            if (el.type === 'text') {
                let textContent = el.content || '';
                columnsDefinition.forEach(col => {
                    const placeholder = `{{${col.name}}}`;
                    const actualValue = activeRowData[col.id] || `[${col.name}]`;
                    textContent = textContent.replaceAll(placeholder, actualValue);
                });
                return {
                    ...el,
                    content: textContent,
                    fontSize: el.fontSize || 14,
                    fontWeight: el.fontWeight || 'normal',
                    color: el.color || '#000000'
                };
            }
            return el;
        });

        setCanvasElements(processedElements);

        let bodyContent = template.content_body || '';
        columnsDefinition.forEach(col => {
            const placeholder = `{{${col.name}}}`;
            const actualValue = activeRowData[col.id] || `[لم يحدد ${col.name}]`;
            bodyContent = bodyContent.replaceAll(placeholder, actualValue);
        });
        setMergedContent(bodyContent);
    };

    const handleSaveToArchive = async () => {
        if (!documentTitle) return alert("يرجى إدخال اسم المستند أولاً.");
        setIsSaving(true);

        const payload = {
            title: documentTitle,
            template_id: selectedTemplate?.id,
            table_id: parseInt(tableId),
            row_id: parseInt(rowId),
            content_body: mergedContent,
            final_content: generateFinalHTMLStructure(),
            created_by: "المحامي الحالي"
        };

        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/generated', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("تم توليد وحفظ المستند بالتنسيقات الجديدة بنجاح! 💾📊");
                setIsOpen(false);
            } else {
                alert("فشل في حفظ وتوليد المستند.");
            }
        } catch (error) {
            console.error("خطأ أثناء أرشفة المستند:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {triggerButton && React.cloneElement(triggerButton, {
                onClick: (e) => { e.stopPropagation(); setIsOpen(true); }
            })}

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                        {/* رأس المودال */}
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100">معالج توليد وتحرير القوالب (خصائص Canva الكاملة)</h3>
                                    <p className="text-[11px] text-zinc-400 mt-0.5">اضغط على أي نص لتعديل المحتوى، الحجم، اللون، أو السمك مباشرة فوق الورقة.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* الجسد الرئيسي */}
                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 overflow-hidden">

                            {/* الجانب الأيمن */}
                            <div className="xl:col-span-1 border-l border-zinc-800 p-4 overflow-y-auto bg-zinc-950/20 space-y-5">
                                <div>
                                    <span className="text-[11px] font-bold text-zinc-400 block mb-2 uppercase tracking-wider">1. اختر قالب المستند</span>
                                    <div className="space-y-2">
                                        {templates.map(template => (
                                            <button
                                                key={template.id}
                                                onClick={() => handleSelectTemplate(template)}
                                                className={`w-full text-right p-3 rounded-xl border text-xs flex flex-col gap-1 transition ${selectedTemplate?.id === template.id ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-950 border-zinc-850 text-zinc-300 hover:border-zinc-700'}`}
                                            >
                                                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{template.title}</span>
                                                <span className="text-[10px] text-zinc-500">النوع: {template.template_type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedTemplate && (
                                    <div className="space-y-3 pt-2 border-t border-zinc-800">
                                        <div>
                                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">2. اسم الملف الملف الأرشفة:</label>
                                            <input
                                                type="text"
                                                value={documentTitle}
                                                onChange={(e) => setDocumentTitle(e.target.value)}
                                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:border-amber-500 outline-none w-full font-sans"
                                            />
                                        </div>

                                        <div className="pt-4 space-y-2">
                                            <button
                                                onClick={() => {
                                                    const printContent = generateFinalHTMLStructure();
                                                    const printWindow = window.open('', '_blank');

                                                    printWindow.document.write(`
                                                        <html>
                                                        <head>
                                                            <title>${documentTitle || 'مستند قانوني'}</title>
                                                            <meta charset="utf-8">
                                                            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
                                                            <style>
                                                                @page { 
                                                                    size: A4; 
                                                                    margin: 0mm !important; 
                                                                }
                                                                body { 
                                                                    margin: 0; 
                                                                    padding: 0; 
                                                                    background: #ffffff;
                                                                    direction: rtl;
                                                                    -webkit-print-color-adjust: exact; 
                                                                    print-color-adjust: exact;
                                                                }
                                                                * {
                                                                    font-family: 'Cairo', sans-serif !important;
                                                                }
                                                            </style>
                                                        </head>
                                                        <body>
                                                            ${printContent}
                                                            <script>
                                                                window.onload = function() {
                                                                    setTimeout(() => {
                                                                        window.print();
                                                                        window.close();
                                                                    }, 350);
                                                                };
                                                            </script>
                                                        </body>
                                                        </html>
                                                    `);
                                                    printWindow.document.close();
                                                }}
                                                className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold py-2.5 rounded-xl transition shadow-lg"
                                            >
                                                <Printer className="w-4 h-4" /> طباعة المستند فوراً
                                            </button>
                                            <button onClick={handleSaveToArchive} disabled={isSaving} className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-xs py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"><Save className="w-4 h-4" /> {isSaving ? 'جاري الحفظ...' : 'حفظ واعتماد بالأرشيف'}</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* الجانب الأيسر: ورقة الكانفاس الحرة */}
                            <div className="xl:col-span-3 flex items-start justify-center p-6 bg-zinc-950/60 overflow-y-auto" onClick={() => setActiveElementId(null)}>
                                {selectedTemplate ? (
                                    <div className="w-full max-w-[640px] aspect-[1/1.414] bg-white text-zinc-900 shadow-2xl p-10 relative border border-zinc-300 rounded-sm flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>

                                        {/* طبقة عناصر التصميم */}
                                        <div className="absolute inset-0 p-10 overflow-hidden">
                                            <div className="relative w-full h-full">
                                                {canvasElements.map((el) => {
                                                    const widthStr = typeof el.width === 'number' ? `${el.width}px` : (el.type === 'line' ? `${el.width}%` : el.width);
                                                    const isSelected = activeElementId === el.id;

                                                    return (
                                                        <div
                                                            key={el.id}
                                                            style={{
                                                                position: 'absolute',
                                                                left: `${el.x}%`,
                                                                top: `${el.y}%`,
                                                                width: widthStr,
                                                                zIndex: isSelected ? 40 : 20
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (el.type === 'text') setActiveElementId(el.id);
                                                            }}
                                                        >
                                                            {/* شريط أدوات التنسيق العائم */}
                                                            {el.type === 'text' && isSelected && (
                                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white rounded-lg shadow-xl px-2 py-1 flex items-center gap-2 pointer-events-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                                                                    <div className="flex items-center gap-1 border-l border-zinc-700 pl-1">
                                                                        <button onClick={() => updateElementProperty(el.id, 'fontSize', Math.max(8, (el.fontSize || 14) - 1))} className="p-1 hover:bg-zinc-800 rounded text-[10px] font-bold">A-</button>
                                                                        <span className="text-[10px] font-mono px-1 min-w-[18px] text-center">{el.fontSize || 14}</span>
                                                                        <button onClick={() => updateElementProperty(el.id, 'fontSize', (el.fontSize || 14) + 1)} className="p-1 hover:bg-zinc-800 rounded text-[10px] font-bold">A+</button>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => updateElementProperty(el.id, 'fontWeight', el.fontWeight === 'bold' ? 'normal' : 'bold')}
                                                                        className={`p-1 rounded hover:bg-zinc-800 ${el.fontWeight === 'bold' ? 'text-amber-400 bg-zinc-800' : ''}`}
                                                                    >
                                                                        <Bold className="w-3 h-3" />
                                                                    </button>
                                                                    <div className="flex gap-1 items-center border-r border-zinc-700 pr-1">
                                                                        {['#000000', '#2563eb', '#dc2626', '#16a34a'].map(c => (
                                                                            <button
                                                                                key={c}
                                                                                onClick={() => updateElementProperty(el.id, 'color', c)}
                                                                                className={`w-3 h-3 rounded-full border border-white/20 ${el.color === c ? 'ring-2 ring-amber-400' : ''}`}
                                                                                style={{ backgroundColor: c }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* حقل النص التفاعلي */}
                                                            {el.type === 'text' && (
                                                                <div
                                                                    contentEditable
                                                                    suppressContentEditableWarning
                                                                    onBlur={(e) => updateElementProperty(el.id, 'content', e.target.innerText)}
                                                                    style={{
                                                                        fontSize: `${el.fontSize || 14}px`,
                                                                        fontWeight: el.fontWeight || 'normal',
                                                                        color: el.color || '#000000'
                                                                    }}
                                                                    className={`text-right whitespace-pre-wrap font-sans leading-tight outline-none border transition-all ${isSelected ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/30' : 'border-transparent hover:border-zinc-300 hover:border-dashed'} p-0.5 rounded cursor-text`}
                                                                >
                                                                    {el.content}
                                                                </div>
                                                            )}
                                                            {el.type === 'image' && (
                                                                <img src={el.content} alt="شعار" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} className="pointer-events-none" />
                                                            )}
                                                            {el.type === 'line' && (
                                                                <div style={{ backgroundColor: el.color, height: `${el.height}px`, width: '100%' }} className="rounded-full" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* حيز موضوع العقد */}
                                        <div className="z-10 mt-36 w-full flex-1 flex flex-col">
                                            <textarea
                                                value={mergedContent}
                                                onChange={(e) => setMergedContent(e.target.value)}
                                                className="w-full flex-1 border-0 text-zinc-800 text-sm font-sans leading-relaxed focus:ring-0 outline-none resize-none p-0 bg-transparent"
                                                style={{ whiteSpace: 'pre-line' }}
                                                placeholder="نص إضافي بأسفل الترويسة (اختياري)..."
                                            />
                                        </div>

                                        {/* تذييل الورقة */}
                                        <div className="z-10 border-t border-zinc-200 pt-3 text-[10px] text-zinc-400 text-center font-sans">
                                            <p>{officeSettings?.footer_data?.address || 'عنوان المكتب الرئيسي'} | هاتف: {officeSettings?.footer_data?.phone || 'لا يوجد رقم جوال مسجل'}</p>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-800 rounded-2xl max-w-xl">
                                        <Eye className="w-12 h-12 text-zinc-700 mb-3" />
                                        <h4 className="text-xs font-bold text-zinc-400">شاشة معالج توليد المستندات فارغة</h4>
                                        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs leading-relaxed">الرجاء اختيار أحد القوالب الجاهزة من القائمة اليمنى ليتم فتح لوحة تحرير الخصائص الذكية.</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}