"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Printer, Save, X, Sparkles, Eye } from 'lucide-react';

export default function GlobalDocumentGenerator({ triggerButton, activeTable, selectedRow, filteredRows }) {
    const [isOpen, setIsOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [mergedContent, setMergedContent] = useState('');
    const [documentTitle, setDocumentTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [officeSettings, setOfficeSettings] = useState(null);

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

    // 🔥 دالة سحرية جديدة: تحول عناصر Canva المحفوظة في الإعدادات إلى HTML مرئي ومطابق تماماً للتصميم
    const renderCanvaToHTML = () => {
        const elements = officeSettings?.header_data?.canvas_elements || [];
        if (elements.length === 0) return '';

        return `
            <div style="position: relative; width: 100%; height: 140px; font-family: 'Cairo', sans-serif; direction: rtl; margin-bottom: 20px;">
                ${elements.map(el => {
                    const widthStr = typeof el.width === 'number' ? `${el.width}px` : (el.type === 'line' ? `${el.width}%` : el.width);
                    const style = `position: absolute; right: ${el.x}%; top: ${el.y}%; width: ${widthStr};`;

                    if (el.type === 'text') {
                        return `<div style="${style} font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; color: ${el.color || '#000'}; text-align: right; white-space: pre-wrap;">${el.content}</div>`;
                    }
                    if (el.type === 'image') {
                        return `<div style="${style}"><img src="${el.content}" style="width: 100%; height: auto; object-fit: contain;"/></div>`;
                    }
                    if (el.type === 'line') {
                        return `<div style="${style} background-color: ${el.color || '#f59e0b'}; height: ${el.height || 2}px; border-radius: 2px;"></div>`;
                    }
                    return '';
                }).join('')}
            </div>
        `;
    };

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        const primaryColumnId = columnsDefinition[0]?.id;
        const primaryValue = activeRowData[primaryColumnId] || 'سجل';
        setDocumentTitle(`${template.title} - ${primaryValue}`);

        let content = template.content_body;
        columnsDefinition.forEach(col => {
            const placeholder = `{{${col.name}}}`;
            const actualValue = activeRowData[col.id] || `[لم يحدد ${col.name}]`;
            content = content.replaceAll(placeholder, actualValue);
        });
        setMergedContent(content);
    };

    const handleSaveToArchive = async () => {
        if (!documentTitle || !mergedContent) return;
        setIsSaving(true);

        // 👑 التعديل الجوهري هنا: قمنا بحقن ترويسة Canva الديناميكية الممررة من دالتنا بدلاً من النصوص القديمة الثابتة
        const finalHTMLStructure = `
            <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; padding: 40px; color: #1e293b; background: white;">
                
                ${renderCanvaToHTML()}
                
                <div style="font-size: 14px; line-height: 1.8; white-space: pre-line; min-height: 450px; margin-top: 10px;">
                    ${mergedContent}
                </div>

                <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
                    <p>${officeSettings?.footer_data?.address || ''} | جوال: ${officeSettings?.footer_data?.phone || ''}</p>
                    <p>${officeSettings?.footer_data?.iban ? `الحساب البنكي (IBAN): ${officeSettings.footer_data.iban}` : ''}</p>
                </div>
            </div>
        `;

        const payload = {
            title: documentTitle,
            template_id: selectedTemplate?.id,
            table_id: parseInt(tableId),
            row_id: parseInt(rowId),
            final_content: finalHTMLStructure,
            created_by: "المحامي الحالي"
        };

        try {
            const res = await fetch('/api/v1/office-settings/generated', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("تم توليد المستند وحفظه في أرشيف هذا السجل بنجاح مدمجاً بهوية Canva! 💾📂");
                setIsOpen(false);
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
                onClick: (e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }
            })}

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl">

                        {/* الرأس */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-100">معالج المستندات والذكاء التوليدي الموحد</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">توليد عقود، فواتير، وتقارير مدمجة تلقائياً ببيانات هذا السجل.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* الجسد */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 overflow-hidden">

                            {/* القائمة اليمنى */}
                            <div className="md:col-span-1 border-l border-slate-800 p-4 overflow-y-auto bg-slate-950/20">
                                <span className="text-[11px] font-bold text-slate-400 block mb-3 uppercase tracking-wider">اختر قالب التصميم</span>
                                <div className="space-y-2">
                                    {templates.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleSelectTemplate(template)}
                                            className={`w-full text-right p-3 rounded-xl border text-xs flex flex-col gap-1 transition ${selectedTemplate?.id === template.id
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                                : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
                                            }`}
                                        >
                                            <span className="font-bold flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5" />
                                                {template.title}
                                            </span>
                                            <span className="text-[10px] text-slate-500">نوع: {template.template_type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* منطقة المعاينة */}
                            <div className="md:col-span-3 flex flex-col overflow-hidden p-6 bg-slate-950/40">
                                {selectedTemplate ? (
                                    <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400">اسم المستند النهائي المؤرشف</label>
                                            <input
                                                type="text"
                                                value={documentTitle}
                                                onChange={(e) => setDocumentTitle(e.target.value)}
                                                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none w-full"
                                            />
                                        </div>

                                        <div className="flex-1 bg-white rounded-xl p-8 overflow-y-auto shadow-inner text-slate-900 border border-slate-200">
                                            
                                            {/* 👑 ترويسة محاكاة الورقة الرسمية للمعاينة الحية المبنية على تصميم Canva المحفوظ */}
                                            <div dangerouslySetInnerHTML={{ __html: renderCanvaToHTML() }} />

                                            {/* محتوى الورقة */}
                                            <textarea
                                                value={mergedContent}
                                                onChange={(e) => setMergedContent(e.target.value)}
                                                className="w-full h-[32vh] border-0 text-slate-800 text-sm font-sans leading-relaxed focus:ring-0 outline-none resize-none p-0 bg-transparent mt-4"
                                                style={{ whiteSpace: 'pre-line' }}
                                            />

                                            {/* تذييل محاكاة الورقة */}
                                            <div className="mt-12 border-t pt-3 text-[10px] text-slate-400 text-center">
                                                <p>{officeSettings?.footer_data?.address || ''} | هاتف: {officeSettings?.footer_data?.phone || ''}</p>
                                            </div>
                                        </div>

                                        {/* أزرار التحكم والاعتماد */}
                                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                                            <button
                                                onClick={() => window.print()}
                                                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 text-xs font-bold px-4 py-2 rounded-lg transition"
                                            >
                                                <Printer className="w-4 h-4" /> طباعة فورية
                                            </button>
                                            <button
                                                onClick={handleSaveToArchive}
                                                disabled={isSaving}
                                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition shadow-lg disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" /> {isSaving ? 'جاري الأرشفة...' : 'اعتماد وحفظ بالأرشيف الرقمي'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                                        <Eye className="w-12 h-12 text-slate-700 mb-2" />
                                        <h4 className="text-xs font-bold text-slate-400">معاينة المستند خالية</h4>
                                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs">الرجاء اختيار أحد القوالب الجاهزة من القائمة اليمنى ليقوم النظام بدمج بيانات هذا السجل تلقائياً وعرضها لك هنا.</p>
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