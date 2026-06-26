"use client";

import React, { useState, useEffect } from 'react';
import { Save, FileText, Plus, Variable, Trash2, ArrowRight, Layout } from 'lucide-react';

export default function TemplateDesigner() {
    // حالات إدارة القوالب
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // حالات نموذج البيانات (Form State)
    const [title, setTitle] = useState('');
    const [templateType, setTemplateType] = useState('contract'); // contract, invoice, custom
    const [contentBody, setContentBody] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#f59e0b');
    const [variablesMeta, setVariablesMeta] = useState(['اسم_الموكل', 'رقم_الهوية', 'رقم_القضية', 'تاريخ_اليوم', 'قيمة_العقد']);

    // جلب القوالب من الـ Backend عند فتح الصفحة
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/v1/office-settings/templates');
            const data = await res.json();
            if (Array.isArray(data)) setTemplates(data);
        } catch (error) {
            console.error("خطأ في جلب القوالب:", error);
        }
    };

    // دالة إدراج المتغير السحري داخل النص في مكان مؤشر الكتابة
    const insertVariable = (variable) => {
        setContentBody(prev => prev + ` {{${variable}}} `);
    };

    // حفظ أو تحديث القالب في قاعدة البيانات
    const handleSaveTemplate = async () => {
        if (!title || !contentBody) {
            alert("الرجاء ملء اسم القالب ومحتوى المستند");
            return;
        }

        const payload = {
            title,
            template_type: templateType,
            visual_design: { primary_color: primaryColor, show_logo: true },
            content_body: contentBody,
            variables_meta: variablesMeta
        };

        try {
            let url = '/api/v1/office-settings/templates';
            let method = 'POST';

            if (selectedTemplate && !isCreating) {
                url = `/api/v1/office-settings/templates/${selectedTemplate.id}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("تم حفظ قالب المستند بنجاح! 💾");
                setIsCreating(false);
                setSelectedTemplate(null);
                fetchTemplates();
            }
        } catch (error) {
            console.error("خطأ أثناء حفظ القالب:", error);
        }
    };

    const handleSelectTemplate = (tpl) => {
        setSelectedTemplate(tpl);
        setIsCreating(false);
        setTitle(tpl.title);
        setTemplateType(tpl.template_type);
        setContentBody(tpl.content_body);
        setPrimaryColor(tpl.visual_design?.primary_color || '#f59e0b');
    };

    return (
        <div className="p-6 text-right" dir="rtl">
            {/* الترويسة العلوية */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Layout className="text-amber-500 w-5 h-5" />
                        مصمم ومطور المستندات الحرّة
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">صمم قوالب العقود، الفواتير، والخطابات القانونية بمكتبك وسيربطها النظام ديناميكياً.</p>
                </div>
                
                {!isCreating && !selectedTemplate && (
                    <button 
                        onClick={() => {
                            setIsCreating(true);
                            setTitle('');
                            setContentBody('');
                            setTemplateType('contract');
                        }}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition"
                    >
                        <Plus className="w-4 h-4" /> إنشاء قالب مستند جديد
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* الجزء الأيمن: قائمة القوالب المصممة مسبقاً */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-xs font-bold text-slate-400 mb-3 border-b border-slate-800 pb-2">القوالب الحالية بالمكتب</h2>
                    <div className="space-y-2">
                        {templates.length === 0 ? (
                            <p className="text-slate-500 text-xs text-center py-4">لا توجد قوالب مصممة بعد.</p>
                        ) : (
                            templates.map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => handleSelectTemplate(tpl)}
                                    className={`w-full text-right p-3 rounded-lg border text-xs font-medium flex items-center justify-between transition ${
                                        selectedTemplate?.id === tpl.id 
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                                            : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-450" />
                                        {tpl.title}
                                    </span>
                                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                                        {tpl.template_type === 'contract' ? 'عقد' : tpl.template_type === 'invoice' ? 'فاتورة' : 'مستند'}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* الجزء الأيسر: لوحة التحكم والتصميم الحر */}
                {(isCreating || selectedTemplate) ? (
                    <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h2 className="text-sm font-bold text-amber-500">
                                {isCreating ? "لوحة بناء مستند جديد" : `تعديل قالب: ${title}`}
                            </h2>
                            <button 
                                onClick={() => { setIsCreating(false); setSelectedTemplate(null); }}
                                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                            >
                                إلغاء والعودة <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* إعدادات الهوية والتسمية */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">اسم القالب القانوني</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="مثال: عقد اتفاق محاماة، خطة مصاريف..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">نوع المستند</label>
                                <select 
                                    value={templateType} 
                                    onChange={(e) => setTemplateType(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
                                >
                                    <option value="contract">عقد / صحيفة دعوى</option>
                                    <option value="invoice">فاتورة مالية ضريبية</option>
                                    <option value="custom">مستند / خطاب مخصص حر</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">لون ترويسة المستند</label>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="color" 
                                        value={primaryColor} 
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="bg-transparent border-0 cursor-pointer w-8 h-8"
                                    />
                                    <span className="text-xs text-slate-400 font-mono">{primaryColor}</span>
                                </div>
                            </div>
                        </div>

                        {/* شريط الأدوات: المتغيرات السحرية */}
                        <div className="bg-slate-950 border border-slate-850 rounded-lg p-3">
                            <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center gap-1">
                                <Variable className="w-3.5 h-3.5 text-blue-400" />
                                انقر لإدراج متغير ديناميكي (يستبدله النظام تلقائياً ببيانات العميل أو القضية عند الطباعة):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {variablesMeta.map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => insertVariable(v)}
                                        className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded transition"
                                    >
                                        +{v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* مساحة التصميم والكتابة الحرة */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">متن ومحتوى المستند</label>
                            <textarea
                                value={contentBody}
                                onChange={(e) => setContentBody(e.target.value)}
                                rows={14}
                                placeholder="اكتب صياغة مستندك هنا... استخدم المتغيرات أعلاه لربط السطور تلقائياً."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-sans text-xs text-slate-200 leading-relaxed focus:border-amber-500 outline-none resize-none"
                            />
                        </div>

                        {/* زر الحفظ المعتمد */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSaveTemplate}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-lg"
                            >
                                <Save className="w-4 h-4" /> حفظ واعتماد القالب بالمكتب
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-3 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-700 mb-3" />
                        <h3 className="text-sm font-bold text-slate-400">لوحة التصميم خالية</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">الرجاء اختيار قالب من القائمة اليمنى لتعديله، أو اضغط على زر الإنشاء بالأعلى لصياغة مستند جديد بشعارك وألوانك.</p>
                    </div>
                )}
            </div>
        </div>
    );
}