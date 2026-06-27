'use client';
import React, { useState, useEffect } from 'react';
import { dynamicService } from '@/services/dynamicService';

export default function SystemBuilderPage() {
    const [sections, setSections] = useState([]);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    // حالات بناء جدول جديد
    const [tableName, setTableName] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [columns, setColumns] = useState([{ id: 'c1', name: '', type: 'text' }]);

    // 🔥 حالات إدارة وتصميم القوالب الديناميكية الحرّة
    const [templates, setTemplates] = useState([]);
    const [templateTitle, setTemplateTitle] = useState('');
    const [templateType, setTemplateType] = useState('contract');
    const [contentBody, setContentBody] = useState('');
    const [variables, setVariables] = useState([]);
    const [newVar, setNewVar] = useState({ id: '', name: '', type: 'text' });

    // جلب الأقسام والقوالب عند تحميل الصفحة
    useEffect(() => {
        loadSections();
        loadTemplates();
    }, []);

    const loadSections = async () => {
        try {
            const data = await dynamicService.getSections();
            setSections(data);
        } catch (error) {
            console.error("خطأ في جلب الأقسام", error);
        }
    };

    // جلب القوالب المخزنة في النظام
    const loadTemplates = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error("خطأ في جلب القوالب:", error);
        }
    };

    const handleCreateSection = async () => {
        if (!newSectionTitle.trim()) return;
        await dynamicService.createSection(newSectionTitle, 'Folder', sections.length);
        setNewSectionTitle('');
        loadSections();
    };

    const handleAddColumnField = () => {
        const newId = `c${columns.length + 1}`;
        setColumns([...columns, { id: newId, name: '', type: 'text' }]);
    };

    const handleColumnChange = (index, key, value) => {
        const updated = [...columns];
        updated[index][key] = value;
        setColumns(updated);
    };

    const handleSaveTable = async () => {
        if (!selectedSectionId || !tableName.trim()) {
            alert("الرجاء اختيار قسم وتحديد اسم للجدول");
            return;
        }
        try {
            await dynamicService.createTable(selectedSectionId, tableName, columns, viewMode);
            alert("تم بناء وتثبيت الجدول بنجاح في النظام! 🚀");
            setTableName('');
            setColumns([{ id: 'c1', name: '', type: 'text' }]);
        } catch (error) {
            console.error("خطأ أثناء حفظ الجدول", error);
        }
    };

    // 🔥 إضافة وسم/متغير مخصص داخل نص القالب
    const handleAddVariable = () => {
        if (!newVar.id.trim() || !newVar.name.trim()) return;
        setVariables([...variables, newVar]);
        // دمج الوسم في نهاية النص الحالي لتسهيل الصياغة
        setContentBody(prev => prev + ` {{${newVar.id}}}`);
        setNewVar({ id: '', name: '', type: 'text' });
    };

    // 🔥 حفظ قالب العقد/المستند المخصص في الباكيند
    const handleSaveTemplate = async () => {
        if (!templateTitle.trim() || !contentBody.trim()) {
            alert("الرجاء كتابة عنوان القالب ومحتواه النصي");
            return;
        }

        const payload = {
            title: templateTitle,
            template_type: templateType,
            visual_design: { font_family: 'Cairo', primary_color: '#f59e0b' },
            content_body: contentBody,
            variables_meta: variables
        };

        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("تم حفظ وتثبيت قالب المستند الحر في النظام بنجاح! 🎉");
                setTemplateTitle('');
                setContentBody('');
                setVariables([]);
                loadTemplates(); // إعادة تحديث القائمة
            }
        } catch (error) {
            console.error("خطأ أثناء حفظ القالب:", error);
        }
    };

    return (
        <div className="p-8 bg-zinc-950 text-zinc-100 min-h-screen font-sans text-right" dir="rtl">
            <h1 className="text-3xl font-bold border-b border-zinc-800 pb-4 mb-8 text-amber-500">⚙️ مصنع ومطور النظام المكتبي المخصص (System OS Builder)</h1>

            {/* تخطيط مرن وعريض لاستيعاب الـ 3 أقسام الكبرى */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* 📁 القسم الأول: إدارة الصفحات في الـ Sidebar وقائمة القوالب الحالية */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 text-zinc-300">1. صفحات القائمة الجانبية</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="اسم الصفحة (مثلاً: قضايا الشركات)"
                                value={newSectionTitle}
                                onChange={(e) => setNewSectionTitle(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                            />
                            <button onClick={handleCreateSection} className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-4 rounded-lg text-sm transition">
                                + إضافة
                            </button>
                        </div>

                        <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                            {sections.map((sec) => (
                                <div
                                    key={sec.id}
                                    onClick={() => setSelectedSectionId(sec.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${selectedSectionId === sec.id ? 'bg-amber-950/40 border-amber-500 text-amber-400' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <span>📁 {sec.title}</span>
                                    <span className="text-xs text-zinc-500">معرف: #{sec.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* قائمة فرعية لعرض المستندات المثبتة حالياً للرؤية */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                        <h2 className="text-sm font-semibold mb-3 text-amber-500">📋 القوالب القانونية النشطة بالنظام ({templates.length})</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {templates.map((tmpl) => (
                                <div key={tmpl.id} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs flex justify-between items-center">
                                    <span className="text-zinc-300">📄 {tmpl.title}</span>
                                    <span className="bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded text-[10px]">{tmpl.template_type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🛠️ القسم الثاني: بناء الجدول وتصميم الأعمدة الديناميكية */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-zinc-300">2. هندسة وبناء جداول المحرك الديناميكي</h2>

                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">اسم الجدول الداخلي</label>
                            <input
                                type="text"
                                placeholder="مثال: بيانات القضية الأساسية"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">نمط العرض الافتراضي في الصفحة</label>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                            >
                                <option value="table">🖥️ عرض شبكة إكسل (Table View)</option>
                                <option value="grid">🎴 عرض بطاقات فخمة (Grid Card View)</option>
                                <option value="list">📝 عرض قائمة مستندات طولية (List View)</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="text-sm font-medium text-zinc-400 mb-3">تحديد أعمدة الجدول (Columns Definition)</h3>
                    <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
                        {columns.map((col, index) => (
                            <div key={col.id} className="flex gap-2 items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 font-mono">{col.id}</span>
                                <input
                                    type="text"
                                    placeholder="اسم العمود (مثلاً: رقم الجوال)"
                                    value={col.name}
                                    onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none"
                                />
                                <select
                                    value={col.type}
                                    onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none"
                                >
                                    <option value="text">🔤 نص</option>
                                    <option value="number">🔢 رقم / مالية</option>
                                    <option value="date">📅 تاريخ</option>
                                    <option value="file">📄 ملف مرفق</option>
                                    <option value="relation">🔗 علاقة</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                        <button onClick={handleAddColumnField} className="text-amber-500 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition">
                            + إضافة حقل (عمود)
                        </button>
                        <button onClick={handleSaveTable} className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition">
                            🚀 تثبيت وحفظ الهيكل
                        </button>
                    </div>
                </div>

                {/* 🎨 القسم الثالث الجديد: مصمم وصائغ القوالب القانونية الحر (Template Designer) */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-zinc-300">3. صائغ ومصمم القوالب القانونية الحر</h2>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">اسم القالب</label>
                                <input
                                    type="text"
                                    value={templateTitle}
                                    onChange={e => setTemplateTitle(e.target.value)}
                                    placeholder="مثال: صيغة عقد شراكة"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">تصنيف المستند</label>
                                <select
                                    value={templateType}
                                    onChange={e => setTemplateType(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                                >
                                    <option value="contract">📝 عقود وتعهدات</option>
                                    <option value="letter">📨 مذكرات ومخاطبات</option>
                                    <option value="invoice">💰 تصفية مالية وفواتير</option>
                                </select>
                            </div>
                        </div>

                        {/* باني الحقول/المتغيرات المخصصة داخل نص العقد */}
                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 mb-4">
                            <label className="block text-[11px] text-amber-500 font-bold mb-1.5">➕ حقن متغير مخصص داخل نص القالب:</label>
                            <div className="grid grid-cols-3 gap-1.5 mb-2">
                                <input
                                    type="text"
                                    placeholder="الرمز بالإنجليزي (client)"
                                    value={newVar.id}
                                    onChange={e => setNewVar({...newVar, id: e.target.value})}
                                    className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-100 text-left"
                                />
                                <input
                                    type="text"
                                    placeholder="الاسم بالعربي (العميل)"
                                    value={newVar.name}
                                    onChange={e => setNewVar({...newVar, name: e.target.value})}
                                    className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-100"
                                />
                                <button onClick={handleAddVariable} className="bg-amber-600 hover:bg-amber-500 text-zinc-950 text-[11px] font-bold rounded">
                                    + حقن الوسم
                                </button>
                            </div>
                            {/* شارات الأوسمة المضافة */}
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                {variables.map((v, idx) => (
                                    <span key={idx} className="bg-amber-950/40 border border-amber-900 text-amber-400 text-[10px] px-1.5 py-0.5 rounded">
                                        {v.name} ({`{{${v.id}}}`})
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* المساحة النصية لصياغة المستند */}
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">صياغة نص القالب القانوني</label>
                            <textarea
                                rows="6"
                                value={contentBody}
                                onChange={e => setContentBody(e.target.value)}
                                placeholder="اكتب نص العقد أو المذكرة هنا بشكل حر، واستخدم ميزة حقن الأوسمة أعلاه لترك حقول فارغة يملأها النظام لاحقاً..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4 mt-4">
                        <button onClick={handleSaveTemplate} className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-2.5 rounded-lg text-xs shadow-lg transition">
                            💾 حفظ القالب وتثبيته في النظام
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}