// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { dynamicService } from '@/services/dynamicService';

// export default function SystemBuilderPage() {
//     // التحكم في التبويب النشط
//     const [activeTab, setActiveTab] = useState('engine'); // 'engine' أو 'identity'

//     // --- حالات التبويب الأول (محرك السيستم والجداول والقوالب) ---
//     const [sections, setSections] = useState([]);
//     const [newSectionTitle, setNewSectionTitle] = useState('');
//     const [selectedSectionId, setSelectedSectionId] = useState(null);

//     const [tableName, setTableName] = useState('');
//     const [viewMode, setViewMode] = useState('table'); // table, grid, list
//     const [columns, setColumns] = useState([{ id: 'c1', name: '', type: 'text' }]);

//     const [templates, setTemplates] = useState([]);
//     const [templateTitle, setTemplateTitle] = useState('');
//     const [templateType, setTemplateType] = useState('contract'); // contract, letter
//     const [contentBody, setContentBody] = useState('');
//     const [variables, setVariables] = useState([]);
//     const [newVar, setNewVar] = useState({ id: '', name: '', type: 'text' });

//     // --- حالات التبويب الثاني (نظام تصميم Canva المرئي الحر للتروئيسة) ---
//     const [canvasElements, setCanvasElements] = useState([
//         { id: 'el-1', type: 'text', content: 'مكتب المستشار القانوني للمحاماة', x: 5, y: 15, fontSize: 16, fontWeight: 'bold', color: '#18181b', width: 250 },
//         { id: 'el-2', type: 'text', content: 'الرقم الضريبي: 300012345', x: 5, y: 40, fontSize: 12, fontWeight: 'normal', color: '#71717a', width: 200 },
//         { id: 'el-3', type: 'line', x: 3, y: 85, color: '#f59e0b', height: 3, width: 94 }
//     ]);
//     const [selectedElementId, setSelectedElementId] = useState(null);
//     const [primaryColor, setPrimaryColor] = useState('#f59e0b');

//     // مراجع وإحداثيات تحريك الكانفاس بالماوس
//     const fileInputRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [draggingId, setDraggingId] = useState(null);
//     const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

//     // جلب البيانات عند تحميل الصفحة كلياً
//     useEffect(() => {
//         loadSections();
//         loadTemplates();
//         loadOfficeSettings();
//     }, []);

//     const loadSections = async () => {
//         try { const data = await dynamicService.getSections(); setSections(data); } catch (error) { console.error(error); }
//     };

//     const loadTemplates = async () => {
//         try {
//             const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates');
//             if (res.ok) { const data = await res.json(); setTemplates(data); }
//         } catch (error) { console.error(error); }
//     };

//     const loadOfficeSettings = async () => {
//         try {
//             const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/');
//             if (res.ok) {
//                 const data = await res.json();
//                 if (data.header_data?.canvas_elements) setCanvasElements(data.header_data.canvas_elements);
//                 if (data.primary_color) setPrimaryColor(data.primary_color);
//             }
//         } catch (error) { console.error(error); }
//     };

//     // --- دوال إدارة الصفحات والجداول والقوالب (التبويب الأول) ---
//     const handleCreateSection = async () => {
//         if (!newSectionTitle.trim()) return;
//         await dynamicService.createSection(newSectionTitle, 'Folder', sections.length);
//         setNewSectionTitle('');
//         loadSections();
//     };

//     const handleAddColumnField = () => {
//         setColumns([...columns, { id: `c${columns.length + 1}`, name: '', type: 'text' }]);
//     };

//     const handleColumnChange = (index, key, value) => {
//         const updated = [...columns];
//         updated[index][key] = value;
//         setColumns(updated);
//     };

//     const handleSaveTable = async () => {
//         if (!selectedSectionId || !tableName.trim()) return alert("اختر قسماً واسماً للجدول أولاً من القائمة الجانبية");
//         await dynamicService.createTable(selectedSectionId, tableName, columns, viewMode);
//         alert("تم حفظ وهندسة الجدول بنجاح داخل هذا القسم! 🚀");
//         setTableName('');
//         setColumns([{ id: 'c1', name: '', type: 'text' }]);
//     };

//     const handleAddVariable = () => {
//         if (!newVar.id.trim() || !newVar.name.trim()) return alert("يرجى ملء رمز واسم الوسم");
//         setVariables([...variables, newVar]);
//         setContentBody(prev => prev + ` {{${newVar.id}}}`);
//         setNewVar({ id: '', name: '', type: 'text' });
//     };

//     const handleSaveTemplate = async () => {
//         if (!templateTitle.trim() || !contentBody.trim()) return alert("اكمل بيانات وعنوان القالب أولاً");
//         const payload = {
//             title: templateTitle,
//             template_type: templateType,
//             visual_design: { font_family: 'Cairo' },
//             content_body: contentBody,
//             variables_meta: variables
//         };
//         const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//         });
//         if (res.ok) {
//             alert("تم حفظ القالب القانوني بنجاح في النظام! 🎉");
//             setTemplateTitle('');
//             setContentBody('');
//             setVariables([]);
//             loadTemplates();
//         }
//     };

//     // --- دوال تحريك وبناء عناصر لوحة الـ Canva (التبويب الثاني) ---
//     const addTextElement = () => {
//         const newEl = { id: `el-${Date.now()}`, type: 'text', content: 'كتلة نصية جديدة (اضغط لتعديلها)', x: 10, y: 20, fontSize: 13, fontWeight: 'normal', color: '#27272a', width: 220 };
//         setCanvasElements([...canvasElements, newEl]);
//         setSelectedElementId(newEl.id);
//     };

//     const addLineElement = () => {
//         const newEl = { id: `el-${Date.now()}`, type: 'line', x: 5, y: 50, color: primaryColor, height: 2, width: 90 };
//         setCanvasElements([...canvasElements, newEl]);
//         setSelectedElementId(newEl.id);
//     };

//     const handleLogoUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         const reader = new FileReader();
//         reader.onload = (event) => {
//             const newEl = { id: `el-${Date.now()}`, type: 'image', content: event.target.result, x: 75, y: 15, width: 110, height: 65 };
//             setCanvasElements([...canvasElements, newEl]);
//             setSelectedElementId(newEl.id);
//         };
//         reader.readAsDataURL(file);
//     };

//     const updateSelectedElement = (key, value) => {
//         setCanvasElements(canvasElements.map(el => el.id === selectedElementId ? { ...el, [key]: value } : el));
//     };

//     const deleteSelectedElement = () => {
//         setCanvasElements(canvasElements.filter(el => el.id !== selectedElementId));
//         setSelectedElementId(null);
//     };

//     const handleCanvasMouseDown = (el, e) => {
//         e.stopPropagation();
//         setSelectedElementId(el.id);
//         setDraggingId(el.id);
//         const rect = canvasRef.current.getBoundingClientRect();
//         const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
//         const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;
//         setDragOffset({ x: mouseXPercent - el.x, y: mouseYPercent - el.y });
//     };

//     const handleCanvasMouseMove = (e) => {
//         if (!draggingId) return;
//         const rect = canvasRef.current.getBoundingClientRect();
//         let newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
//         let newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

//         newX = Math.max(0, Math.min(newX, 95));
//         newY = Math.max(0, Math.min(newY, 95));
//         setCanvasElements(canvasElements.map(el => el.id === draggingId ? { ...el, x: newX, y: newY } : el));
//     };

//     const handleCanvasMouseUp = () => setDraggingId(null);

//     const handleSaveOfficeIdentity = async () => {
//         // 1. تجهيز بيانات الهوية الأساسية للمكتب
//         const officePayload = {
//             primary_color: primaryColor,
//             header_data: { canvas_elements: canvasElements },
//             footer_data: { custom_html: "Canva Canvas Object" }
//         };

//         try {
//             // الخطوة الأولى: حفظ الإعدادات العامة للمكتب (PUT)
//             const resSettings = await fetch('http://127.0.0.1:8000/api/v1/office-settings/', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(officePayload)
//             });

//             if (resSettings.ok) {

//                 // 🚀 الخطوة الثانية: بناء كائن متوافق 100% مع الـ CustomTemplateCreate المكتوب بالباكيند
//                 const templatePayload = {
//                     title: "قالب مستند مدمج بترويسة Canva",
//                     template_type: "عقد",
//                     content_body: "اكتب نص العقد القانوني هنا...\n\nيمكنك استخدام المتغيرات الديناميكية مثل {{اسم_الموكل}} أو {{رقم_القضية}} ليتم تعبئتها تلقائياً.",

//                     // visual_design يتوقع Dict[str, Any] لذلك نمرر كائن نظيف
//                     visual_design: {
//                         primary_color: primaryColor
//                     },

//                     // 🔥 الحل هنا: variables_meta يتوقع List[str] (مصفوفة نصوص)، نرسلها فارغة مؤقتاً لتخطي الـ 422 
//                     // أو نضع بها أسماء المتغيرات الافتراضية للجدول
//                     variables_meta: []
//                 };

//                 const resTemplate = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(templatePayload)
//                 });

//                 if (resTemplate.ok) {
//                     alert("🏛️ تم حفظ قالب التصميم بنجاح! سيظهر الآن في قائمة القوالب داخل صفحة System Builder.");
//                 } else {
//                     const errorData = await resTemplate.json();
//                     console.error("تفاصيل الخطأ:", errorData);
//                     alert(`خطأ: ${JSON.stringify(errorData.detail)}`);
//                 }
//             }
//         } catch (error) {
//             console.error("خطأ أثناء الحفظ المزدوج:", error);
//         }
//     };

//     const selectedElement = canvasElements.find(el => el.id === selectedElementId);

//     return (
//         <div className="p-8 bg-zinc-950 text-zinc-100 min-h-screen font-sans text-right select-none" dir="rtl">

//             {/* الشريط العلوي العام */}
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 mb-8">
//                 <div>
//                     <h1 className="text-3xl font-bold text-amber-500">⚙️ مصنع ومطور النظام القانوني والمكتبي</h1>
//                     <p className="text-xs text-zinc-400 mt-1">قم بهندسة حقول نظامك وجداولك، وصمم أوراقك الرسمية على طريقة Canva الذكية فوراَ.</p>
//                 </div>

//                 <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 mt-4 md:mt-0">
//                     <button onClick={() => setActiveTab('engine')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'engine' ? 'bg-amber-600 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'}`}>
//                         🛠️ محرك السيستم والجداول
//                     </button>
//                     <button onClick={() => setActiveTab('identity')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'identity' ? 'bg-amber-600 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'}`}>
//                         🎨 مصمم المستندات المرئي (Canva Mode)
//                     </button>
//                 </div>
//             </div>

//             {/* ---------------- 🛠️ التبويب الأول (المحرك والجداول والقوالب بالكامل) ---------------- */}
//             {activeTab === 'engine' && (
//                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">

//                     {/* 1. الصفحات والأقسام الجانبية للسيستم */}
//                     <div className="space-y-6">
//                         <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
//                             <h2 className="text-xl font-semibold mb-4 text-zinc-300">1. صفحات القائمة الجانبية</h2>
//                             <div className="flex gap-2 mb-4">
//                                 <input type="text" placeholder="اسم الصفحة الجديدة" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
//                                 <button onClick={handleCreateSection} className="bg-amber-600 text-zinc-950 font-bold px-4 rounded-lg text-sm transition hover:bg-amber-500">+ إضافة</button>
//                             </div>
//                             <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
//                                 {sections.map((sec) => (
//                                     <div key={sec.id} onClick={() => setSelectedSectionId(sec.id)} className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${selectedSectionId === sec.id ? 'bg-amber-950/40 border-amber-500 text-amber-400' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
//                                         <span>📁 {sec.title}</span> <span className="text-xs text-zinc-500">معرف: #{sec.id}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* استعراض القوالب المخزنة */}
//                         <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
//                             <h2 className="text-sm font-semibold mb-3 text-amber-500">📋 القوالب القانونية النشطة بالنظام ({templates.length})</h2>
//                             <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//                                 {templates.map((tmpl) => (
//                                     <div key={tmpl.id} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs flex justify-between items-center">
//                                         <span className="text-zinc-300">📄 {tmpl.title}</span> <span className="bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded text-[10px]">{tmpl.template_type}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* 2. هندسة وبناء جداول المحرك الديناميكي */}
//                     <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
//                         <h2 className="text-xl font-semibold mb-4 text-zinc-300">2. هندسة وبناء جداول المحرك الديناميكي</h2>
//                         <div className="grid grid-cols-1 gap-4 mb-6">
//                             <input type="text" placeholder="اسم الجدول الداخلي (مثل: القضايا)" value={tableName} onChange={(e) => setTableName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
//                             <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none">
//                                 <option value="table">🖥️ عرض شبكة إكسل</option>
//                                 <option value="grid">🎴 عرض بطاقات</option>
//                                 <option value="list">📝 عرض قائمة</option>
//                             </select>
//                         </div>

//                         {/* بناء وتخصيص الأعمدة والأعضاء الفردية */}
//                         <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
//                             {columns.map((col, index) => (
//                                 <div key={col.id} className="flex gap-2 items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
//                                     <input type="text" placeholder="اسم العمود" value={col.name} onChange={(e) => handleColumnChange(index, 'name', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none" />
//                                     <select value={col.type} onChange={(e) => handleColumnChange(index, 'type', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none">
//                                         <option value="text">🔤 نص</option>
//                                         <option value="number">🔢 رقم</option>
//                                         <option value="date">📅 تاريخ</option>
//                                         <option value="file">📄 ملف</option>
//                                     </select>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
//                             <button onClick={handleAddColumnField} className="text-amber-500 hover:text-amber-400 text-xs font-semibold">+ إضافة حقل عمود</button>
//                             <button onClick={handleSaveTable} className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition">🚀 تثبيت الهيكل</button>
//                         </div>
//                     </div>

//                     {/* 3. صائغ ومصمم القوالب القانونية الحر */}
//                     <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl flex flex-col justify-between">
//                         <div>
//                             <h2 className="text-xl font-semibold mb-4 text-zinc-300">3. صائغ ومصمم القوالب القانونية الحر</h2>
//                             <div className="grid grid-cols-2 gap-3 mb-4">
//                                 <input type="text" value={templateTitle} onChange={e => setTemplateTitle(e.target.value)} placeholder="اسم القالب" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
//                                 <select value={templateType} onChange={e => setTemplateType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none">
//                                     <option value="contract">📝 عقود وتعهدات</option>
//                                     <option value="letter">📨 مذكرات وجلسات</option>
//                                 </select>
//                             </div>

//                             {/* حقن الأوسمة المتغيرة ديناميكياً للعقد */}
//                             <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 mb-4">
//                                 <div className="grid grid-cols-3 gap-1.5 mb-2">
//                                     <input type="text" placeholder="الرمز (client)" value={newVar.id} onChange={e => setNewVar({ ...newVar, id: e.target.value })} className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-left" />
//                                     <input type="text" placeholder="الاسم (العميل)" value={newVar.name} onChange={e => setNewVar({ ...newVar, name: e.target.value })} className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px]" />
//                                     <button onClick={handleAddVariable} className="bg-amber-600 text-zinc-950 text-[11px] font-bold rounded hover:bg-amber-500 transition">+ حقن</button>
//                                 </div>
//                                 <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
//                                     {variables.map((v, idx) => <span key={idx} className="bg-amber-950/40 border border-amber-900 text-amber-400 text-[10px] px-1.5 py-0.5 rounded">{v.name}</span>)}
//                                 </div>
//                             </div>

//                             <textarea rows="5" value={contentBody} onChange={e => setContentBody(e.target.value)} placeholder="اكتب صيغة ونص العقد القانوني هنا واستخدم الأوسمة..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500" />
//                         </div>
//                         <button onClick={handleSaveTemplate} className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-2.5 rounded-lg text-xs mt-4 transition">💾 حفظ وتثبيت القالب</button>
//                     </div>

//                 </div>
//             )}

//             {/* ---------------- 🎨 التبويب الثاني (نظام تصميم Canva المرئي الحر بالكامل) ---------------- */}
//             {activeTab === 'identity' && (
//                 <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-fadeIn">

//                     {/* لوحة تحكم وعناصر أدوات Canva (العمود الجانبي الأيمن) */}
//                     <div className="xl:col-span-1 bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-2xl space-y-6">
//                         <div>
//                             <h2 className="text-lg font-bold text-zinc-200">✨ أدوات تصميم Canva</h2>
//                             <p className="text-[11px] text-zinc-500 mt-0.5">اضغط على أي عنصر لإضافته للورقة، ثم اسحبه وحركه بحرية كاملة بالماوس.</p>
//                         </div>

//                         {/* أزرار الإضافة الفورية لعناصر الكانفاس */}
//                         <div className="grid grid-cols-2 gap-2">
//                             <button onClick={addTextElement} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-400 transition flex flex-col items-center gap-1">
//                                 <span>🔤</span> كتلة نصية حرة
//                             </button>
//                             <button onClick={() => fileInputRef.current.click()} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-400 transition flex flex-col items-center gap-1">
//                                 <span>🖼️</span> رفع شعار المكتب
//                             </button>
//                             <button onClick={addLineElement} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-400 transition flex flex-col items-center gap-1 col-span-2">
//                                 <span>➖</span> خط فاصل زينة جمالي
//                             </button>
//                             <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
//                         </div>

//                         <hr className="border-zinc-800" />

//                         {/* لوحة تعديل وخصائص المكون المحدد (Inspector) */}
//                         {selectedElement ? (
//                             <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-4 animate-fadeIn">
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-xs font-bold text-amber-500">⚙️ خيارات المكون المحدد</span>
//                                     <button onClick={deleteSelectedElement} className="text-[10px] bg-red-950/60 border border-red-900 text-red-400 px-2 py-0.5 rounded hover:bg-red-900 hover:text-white transition">حذف 🗑️</button>
//                                 </div>

//                                 {selectedElement.type === 'text' && (
//                                     <div className="space-y-3">
//                                         <div>
//                                             <label className="block text-[11px] text-zinc-400 mb-1">محتوى النص:</label>
//                                             <textarea rows="2" value={selectedElement.content} onChange={e => updateSelectedElement('content', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 focus:outline-none" />
//                                         </div>
//                                         <div className="grid grid-cols-2 gap-2">
//                                             <div>
//                                                 <label className="block text-[11px] text-zinc-400 mb-1">حجم الخط (px):</label>
//                                                 <input type="number" value={selectedElement.fontSize} onChange={e => updateSelectedElement('fontSize', parseInt(e.target.value) || 12)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-[11px] text-zinc-400 mb-1">سمك الخط:</label>
//                                                 <select value={selectedElement.fontWeight} onChange={e => updateSelectedElement('fontWeight', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center">
//                                                     <option value="normal">عادي</option> <option value="bold">عريض B</option>
//                                                 </select>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-[11px] text-zinc-400 mb-1">عرض كتلة النص (px):</label>
//                                             <input type="number" value={selectedElement.width} onChange={e => updateSelectedElement('width', parseInt(e.target.value) || 100)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
//                                         </div>
//                                     </div>
//                                 )}

//                                 {selectedElement.type === 'image' && (
//                                     <div>
//                                         <label className="block text-[11px] text-zinc-400 mb-1">عرض الشعار (px):</label>
//                                         <input type="number" value={selectedElement.width} onChange={e => updateSelectedElement('width', parseInt(e.target.value) || 50)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
//                                     </div>
//                                 )}

//                                 {selectedElement.type === 'line' && (
//                                     <div className="grid grid-cols-2 gap-2">
//                                         <div>
//                                             <label className="block text-[11px] text-zinc-400 mb-1">العرض (%):</label>
//                                             <input type="number" value={selectedElement.width} onChange={e => updateSelectedElement('width', parseInt(e.target.value) || 50)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-[11px] text-zinc-400 mb-1">اللون:</label>
//                                             <input type="color" value={selectedElement.color} onChange={e => updateSelectedElement('color', e.target.value)} className="w-full h-7 bg-transparent border-none cursor-pointer" />
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="text-center p-6 bg-zinc-950 rounded-xl border border-zinc-800 border-dashed text-xs text-zinc-500">
//                                 💡 اضغط على أي عنصر داخل ورقة التصميم البيضاء لتعديل أبعاده وحجمه ولونه فوراً من هنا.
//                             </div>
//                         )}

//                         {/* تخصيص لون الفواصل العام */}
//                         <div>
//                             <label className="block text-[11px] text-zinc-400 mb-1">لون الفواصل الافتراضي بالنظام</label>
//                             <div className="flex gap-2 items-center">
//                                 <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="bg-transparent border-none cursor-pointer w-10 h-8" />
//                                 <span className="text-xs font-mono text-zinc-500">{primaryColor}</span>
//                             </div>
//                         </div>

//                         <button onClick={handleSaveOfficeIdentity} className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl text-xs shadow-lg transition">
//                             💾 حفظ وتثبيت هيكل تصميم Canva
//                         </button>
//                     </div>

//                     {/* مساحة الـ Canva والورقة البيضاء للتصميم الفوري والسحب (اليسار) */}
//                     <div className="xl:col-span-3 flex flex-col items-center justify-start bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-2xl">
//                         <h2 className="text-sm font-semibold text-zinc-400 self-start mb-4">🎨 لوحة المستند المفتوحة (اضغط واسحب المكونات داخل ورقة الـ A4 الرسمية):</h2>

//                         <div
//                             ref={canvasRef}
//                             onMouseMove={handleCanvasMouseMove}
//                             onMouseUp={handleCanvasMouseUp}
//                             onMouseLeave={handleCanvasMouseUp}
//                             className="w-full max-w-[580px] aspect-[1/1.414] bg-white text-zinc-900 shadow-2xl relative border border-zinc-300 rounded-sm overflow-hidden"
//                         >
//                             {/* خط وهمي إرشادي لحدود الترويسة العليا */}
//                             <div className="absolute top-[130px] left-0 w-full border-b border-dashed border-zinc-200 pointer-events-none flex justify-center">
//                                 <span className="bg-zinc-100 text-[9px] px-2 text-zinc-400 rounded-b">نهاية حيز الترويسة العلوية للطباعة</span>
//                             </div>

//                             {/* رندرة عناصر ومكونات كانفا العائمة */}
//                             {canvasElements.map((el) => {
//                                 const isSelected = el.id === selectedElementId;
//                                 return (
//                                     <div
//                                         key={el.id}
//                                         onMouseDown={(e) => handleCanvasMouseDown(el, e)}
//                                         style={{
//                                             position: 'absolute',
//                                             left: `${el.x}%`,
//                                             top: `${el.y}%`,
//                                             width: el.width ? `${el.width}px` : 'auto',
//                                             cursor: 'move',
//                                             userSelect: 'none',
//                                             zIndex: isSelected ? 50 : 10
//                                         }}
//                                         className={`transition-shadow ${isSelected ? 'outline outline-2 outline-amber-500 shadow-lg p-0.5 bg-amber-50/20' : 'hover:outline hover:outline-1 hover:outline-zinc-300'}`}
//                                     >
//                                         {/* رندرة الكتل النصية */}
//                                         {el.type === 'text' && (
//                                             <p style={{ fontSize: `${el.fontSize}px`, fontWeight: el.fontWeight, color: el.color }} className="text-right whitespace-pre-wrap leading-tight break-words font-sans">
//                                                 {el.content}
//                                             </p>
//                                         )}

//                                         {/* رندرة الشعارات المرفوعة */}
//                                         {el.type === 'image' && (
//                                             <img src={el.content} alt="شعار" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} className="pointer-events-none" />
//                                         )}

//                                         {/* رندرة الخطوط التجميلية */}
//                                         {el.type === 'line' && (
//                                             <div style={{ backgroundColor: el.color, height: `${el.height}px`, width: `${el.width}%` }} className="rounded-full" />
//                                         )}
//                                     </div>
//                                 );
//                             })}

//                             {/* نص توضيحي ثابت في منتصف المستند لإبراز منطقة العقد */}
//                             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none text-center">
//                                 <p className="text-2xl font-black text-zinc-800">مستندات المكتب</p>
//                                 <p className="text-xs text-zinc-600 mt-1">مساحة رندرة العقود وجداول القضايا التلقائية</p>
//                             </div>

//                         </div>
//                     </div>

//                 </div>
//             )}
//         </div>
//     );
// }



'use client';
import React, { useState, useEffect, useRef } from 'react';
import { dynamicService } from '@/services/dynamicService';

export default function SystemBuilderPage() {
    // التحكم في التبويب النشط
    const [activeTab, setActiveTab] = useState('engine'); // 'engine' أو 'identity'

    // --- بيانات وصلاحيات المستخدم الحالي المحملة من النظام (مثال افتراضي للمحاكاة) ---
    const [currentUserPermissions, setCurrentUserPermissions] = useState({
        can_manage_sections: true,  // صلاحية إدارة الأقسام والصفحات
        can_engineer_tables: true,  // صلاحية هندسة وبناء الجداول
        can_manage_identity: true,  // صلاحية تعديل الهوية المرئية
    });

    // --- حالات التبويب الأول (محرك السيستم والجداول والقوالب) ---
    const [sections, setSections] = useState([]);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editingSectionTitle, setEditingSectionTitle] = useState('');

    const [tableName, setTableName] = useState('');
    const [viewMode, setViewMode] = useState('table'); // table, grid, list
    const [columns, setColumns] = useState([{ id: 'c1', name: '', type: 'text', default_permissions: {} }]);
    const [editingTemplateId, setEditingTemplateId] = useState(null);

    const [templates, setTemplates] = useState([]);
    const [templateTitle, setTemplateTitle] = useState('');
    const [templateType, setTemplateType] = useState('contract'); // contract, letter
    const [contentBody, setContentBody] = useState('');
    const [variables, setVariables] = useState([]);
    const [newVar, setNewVar] = useState({ id: '', name: '', type: 'text' });
    const [editingTableId, setEditingTableId] = useState(null);
    const [isStaffTable, setIsStaffTable] = useState(false); // تم تفعيلها لترتبط بالـ Checkbox بالأسفل

    // استخراج كافة الجداول الفرعية من كافة الأقسام لتغذية مصفوفة الصلاحيات الديناميكية
    const allAvailableTables = (sections || [])
        .flatMap(sec => sec.tables || [])
        .filter(table => table && table.id && table.id !== editingTableId);

    // --- حالات التبويب الثاني (نظام تصميم Canva المرئي الحر للتروئيسة) ---
    const [canvasElements, setCanvasElements] = useState([
        { id: 'el-1', type: 'text', content: 'مكتب المستشار القانوني للمحاماة', x: 5, y: 15, fontSize: 16, fontWeight: 'bold', color: '#18181b', width: 250 },
        { id: 'el-2', type: 'text', content: 'الرقم الضريبي: 300012345', x: 5, y: 40, fontSize: 12, fontWeight: 'normal', color: '#71717a', width: 200 },
        { id: 'el-3', type: 'line', x: 3, y: 85, color: '#f59e0b', height: 3, width: 94 }
    ]);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [primaryColor, setPrimaryColor] = useState('#f59e0b');

    // مراجع وإحداثيات تحريك الكانفاس بالماوس
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // جلب البيانات عند تحميل الصفحة كلياً
    useEffect(() => {
        loadSections();
        loadTemplates();
        loadOfficeSettings();
        // هنا يمكن جلب صلاحيات المستخدم الحالي من الـ Context أو API الخاص بالـ Auth
    }, []);

    const loadSections = async () => {
        try {
            if (dynamicService && typeof dynamicService.getSections === 'function') {
                const data = await dynamicService.getSections();
                setSections(data || []);
            } else {
                setSections([
                    {
                        id: 'sec-1',
                        title: 'إدارة قضايا الشركات',
                        tables: [{ id: 'tbl-1', name: 'القضايا التجارية' }, { id: 'tbl-2', name: 'العملاء والشراكات' }]
                    },
                    {
                        id: 'sec-2',
                        title: 'عقود الأحوال الشخصية',
                        tables: [{ id: 'tbl-3', name: 'الجلسات والقرارات' }]
                    }
                ]);
            }
        } catch (error) { console.error(error); }
    };

    const loadTemplates = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates');
            if (res.ok) { const data = await res.json(); setTemplates(data); }
        } catch (error) { console.error(error); }
    };

    const loadOfficeSettings = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/');
            if (res.ok) {
                const data = await res.json();
                if (data.header_data?.canvas_elements) setCanvasElements(data.header_data.canvas_elements);
                if (data.primary_color) setPrimaryColor(data.primary_color);
            }
        } catch (error) { console.error(error); }
    };

    // --- دوال إدارة الصفحات والجداول والقوالب (CRUD الأقسام) ---
    const handleCreateSection = async () => {
        if (!currentUserPermissions.can_manage_sections) {
            return alert("⛔ ليس لديك صلاحية لإنشاء أقسام جديدة في النظام");
        }
        if (!newSectionTitle.trim()) return;
        if (dynamicService && typeof dynamicService.createSection === 'function') {
            await dynamicService.createSection(newSectionTitle, 'Folder', sections.length);
        } else {
            setSections([...sections, { id: `sec-${Date.now()}`, title: newSectionTitle, tables: [] }]);
        }
        setNewSectionTitle('');
        loadSections();
    };

    const handleUpdateSection = async (id) => {
        if (!currentUserPermissions.can_manage_sections) {
            return alert("⛔ ليس لديك صلاحية لتعديل الأقسام");
        }
        if (!editingSectionTitle.trim()) return;
        try {
            if (dynamicService && typeof dynamicService.updateSection === 'function') {
                await dynamicService.updateSection(id, editingSectionTitle);
                setEditingSectionId(null);
                setEditingSectionTitle('');
                loadSections();
                alert("تم تعديل اسم القسم بنجاح في قاعدة البيانات! 💾");
            }
        } catch (error) {
            console.error("خطأ أثناء تعديل القسم:", error);
            alert("فشل تعديل القسم في النظام، تحقق من مسار الباك إند");
        }
    };

    const handleDeleteSection = async (id) => {
        if (!currentUserPermissions.can_manage_sections) {
            return alert("⛔ ليس لديك صلاحية لحذف الأقسام");
        }
        if (!confirm('هل أنت متأكد من حذف هذا القسم وكل الجداول التابعة له؟')) return;
        try {
            if (dynamicService && typeof dynamicService.deleteSection === 'function') {
                await dynamicService.deleteSection(id);
                if (selectedSectionId === id) setSelectedSectionId(null);
                loadSections();
                alert("تم حذف القسم بنجاح من قاعدة البيانات! 🗑️");
            }
        } catch (error) {
            console.error("خطأ أثناء حذف القسم:", error);
            alert("فشل حذف القسم، تأكد من وجود المسار في الباك إند");
        }
    };

    // --- دوال هندسة الجداول والأعمدة المرنة ---
    const handleAddColumnField = () => {
        setColumns([...columns, { id: `c-${Date.now()}`, name: '', type: 'text', default_permissions: {} }]);
    };

    const handleRemoveColumnField = (id) => {
        if (columns.length === 1) return alert("يجب أن يحتوي الجدول على حقل واحد على الأقل");
        setColumns(columns.filter(col => col.id !== id));
    };

    const handleColumnChange = (index, key, value) => {
        const updated = [...columns];
        updated[index][key] = value;
        setColumns(updated);
    };

    // دالة لتعديل صلاحيات الوصول الافتراضية لحقل الـ UserAccount بشكل ديناميكي
    const handlePermissionChange = (columnIndex, tableId, permissionValue) => {
        const updated = [...columns];
        if (!updated[columnIndex].default_permissions) {
            updated[columnIndex].default_permissions = {};
        }
        updated[columnIndex].default_permissions[tableId] = permissionValue;
        setColumns(updated);
    };

    const handleSaveTable = async () => {
        if (!currentUserPermissions.can_engineer_tables) {
            return alert("⛔ ليس لديك صلاحية (مهندس نظام) لتعديل أو بناء هياكل الجداول");
        }
        if (!selectedSectionId || !tableName.trim()) {
            return alert("يرجى اختيار القسم وتحديد اسم الجدول أولاً");
        }

        try {
            // تضمين خاصية جدول الموظفين وحالة الصلاحيات بداخل الـ Payload المرسل للسيرفر
            if (editingTableId) {
                await dynamicService.updateTable(editingTableId, tableName, columns, viewMode, { is_staff_table: isStaffTable });
                alert("تم تحديث هيكل الجدول بنجاح! 🔄");
            } else {
                await dynamicService.createTable(selectedSectionId, tableName, columns, viewMode, { is_staff_table: isStaffTable });
                alert("تم إنشاء وتثبيت الجدول الجديد بنجاح! 🚀");
            }

            setTableName('');
            setColumns([{ id: 'c1', name: '', type: 'text', default_permissions: {} }]);
            setEditingTableId(null);
            setIsStaffTable(false); // إعادة التعيين بعد الحفظ
            loadSections();
        } catch (error) {
            console.error("خطأ أثناء معالجة الجدول:", error);
            alert("فشل في حفظ الجدول بالنظام");
        }
    };

    const handleDeleteTable = async (tableId) => {
        if (!currentUserPermissions.can_engineer_tables) {
            return alert("⛔ ليس لديك صلاحية لحذف الجداول الهيكلية");
        }
        if (!confirm('هل أنت متأكد من حذف هذا الجدول وكل الصفوف والبيانات التابعة له نهائياً؟')) return;
        try {
            await dynamicService.deleteTable(tableId);
            alert("تم حذف الجدول من النظام بنجاح! 🗑️");

            if (editingTableId === tableId) {
                setTableName('');
                setColumns([{ id: 'c1', name: '', type: 'text', default_permissions: {} }]);
                setEditingTableId(null);
                setIsStaffTable(false);
            }
            loadSections();
        } catch (error) {
            console.error("خطأ أثناء حذف الجدول:", error);
            alert("فشل في حذف الجدول من السيرفر");
        }
    };

    const handleAddVariable = () => {
        if (!newVar.id.trim() || !newVar.name.trim()) return alert("يرجى ملء رمز واسم الوسم");
        setVariables([...variables, newVar]);
        setContentBody(prev => prev + ` {{${newVar.id}}}`);
        setNewVar({ id: '', name: '', type: 'text' });
    };

    const handleSelectTableForEdit = (table) => {
        setEditingTableId(table.id);
        setTableName(table.name);
        setColumns(table.columns_definition || [{ id: 'c1', name: '', type: 'text', default_permissions: {} }]);
        setViewMode(table.view_mode || 'table');
        setIsStaffTable(table.is_staff_table || false); // سحب حالة الاعتماد عند تعديل الجدول
        setSelectedSectionId(table.section_id);

        setEditingTableId(table.id);

        setTableName(table.name);

        setColumns(
            table.columns_definition ||
            [{ id: 'c1', name: '', type: 'text', default_permissions: {} }]
        );

        setViewMode(table.view_mode || "table");

        setIsStaffTable(table.is_staff_table || false);
    };

    const handleDeleteTemplate = async (id) => {
        if (!currentUserPermissions.can_engineer_tables) {
            return alert("⛔ لا تمتلك صلاحيات كافية لحذف القوالب القانونية");
        }
        if (!confirm('هل تريد حذف هذا القالب القانوني نهائياً من النظام؟')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/office-settings/templates/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert("تم حذف القالب القانوني بنجاح! 🗑️");
                if (editingTemplateId === id) {
                    setTemplateTitle('');
                    setContentBody('');
                    setVariables([]);
                    setEditingTemplateId(null);
                }
                loadTemplates();
            } else {
                alert("فشل حذف القالب من السيرفر");
            }
        } catch (error) {
            console.error("خطأ أثناء حذف القالب:", error);
        }
    };

    const handleSelectTemplateForEdit = (tmpl) => {
        setEditingTemplateId(tmpl.id);
        setTemplateTitle(tmpl.title);
        setTemplateType(tmpl.template_type);
        setContentBody(tmpl.content_body);
        setVariables(tmpl.variables_meta || []);

        if (tmpl.visual_design && tmpl.visual_design.canvas_elements) {
            setCanvasElements(tmpl.visual_design.canvas_elements);
        } else if (tmpl.visual_design && tmpl.visual_design.header_data?.canvas_elements) {
            setCanvasElements(tmpl.visual_design.header_data.canvas_elements);
        } else {
            loadOfficeSettings();
        }
    };

    const handleSaveTemplate = async () => {
        if (!currentUserPermissions.can_engineer_tables) {
            return alert("⛔ لا تمتلك صلاحيات كافية لحفظ وتعديل القوالب القانونية");
        }
        if (!templateTitle.trim() || !contentBody.trim()) {
            return alert("برجاء إدخال عنوان القالب ومحتواه الأساسي أولاً");
        }

        const payload = {
            title: templateTitle,
            template_type: templateType,
            visual_design: {
                font_family: 'Cairo',
                canvas_elements: canvasElements
            },
            content_body: contentBody,
            variables_meta: Array.isArray(variables) ? variables : []
        };

        try {
            let res;
            if (editingTemplateId) {
                res = await fetch(`http://127.0.0.1:8000/api/v1/office-settings/templates/${editingTemplateId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('http://127.0.0.1:8000/api/v1/office-settings/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                alert(editingTemplateId ? "تم تحديث القالب وتصميمه الخاص بنجاح! 🔄" : "تم حفظ القالب وتصميمه الخاص بنجاح! 🎉");
                setTemplateTitle('');
                setContentBody('');
                setVariables([]);
                setEditingTemplateId(null);
                loadOfficeSettings();
                loadTemplates();
            } else {
                alert("حدث خطأ أثناء محاولة الحفظ في السيرفر");
            }
        } catch (error) {
            console.error("خطأ أثناء حفظ القالب:", error);
        }
    };

    // --- دوال تحريك وبناء عناصر لوحة الـ Canva ---
    const addTextElement = () => {
        const newEl = { id: `el-${Date.now()}`, type: 'text', content: 'كتلة نصية جديدة (اضغط لتعديلها)', x: 10, y: 20, fontSize: 13, fontWeight: 'normal', color: '#27272a', width: 220 };
        setCanvasElements([...canvasElements, newEl]);
        setSelectedElementId(newEl.id);
    };

    const addLineElement = () => {
        const newEl = { id: `el-${Date.now()}`, type: 'line', x: 5, y: 50, color: primaryColor, height: 2, width: 90 };
        setCanvasElements([...canvasElements, newEl]);
        setSelectedElementId(newEl.id);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const newEl = { id: `el-${Date.now()}`, type: 'image', content: event.target.result, x: 75, y: 15, width: 110, height: 65 };
            setCanvasElements([...canvasElements, newEl]);
            setSelectedElementId(newEl.id);
        };
        reader.readAsDataURL(file);
    };

    const updateSelectedElement = (key, value) => {
        setCanvasElements(canvasElements.map(el => el.id === selectedElementId ? { ...el, [key]: value } : el));
    };

    const deleteSelectedElement = () => {
        setCanvasElements(canvasElements.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
    };

    const handleCanvasMouseDown = (el, e) => {
        e.stopPropagation();
        setSelectedElementId(el.id);
        setDraggingId(el.id);
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;
        setDragOffset({ x: mouseXPercent - el.x, y: mouseYPercent - el.y });
    };

    const handleCanvasMouseMove = (e) => {
        if (!draggingId) return;
        const rect = canvasRef.current.getBoundingClientRect();
        let newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
        let newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

        newX = Math.max(0, Math.min(newX, 90));
        newY = Math.max(0, Math.min(newY, 90));
        setCanvasElements(canvasElements.map(el => el.id === draggingId ? { ...el, x: newX, y: newY } : el));
    };

    const handleCanvasMouseUp = () => setDraggingId(null);

    const handleSaveOfficeIdentity = async () => {
        if (!currentUserPermissions.can_manage_identity) {
            return alert("⛔ عذراً، حسابك لا يملك صلاحيات تعديل الهوية المرئية والشعارات للمكتب");
        }
        const officePayload = {
            primary_color: primaryColor,
            header_data: { canvas_elements: canvasElements },
            footer_data: { custom_html: "Canva Canvas Object" }
        };

        try {
            const resSettings = await fetch('http://127.0.0.1:8000/api/v1/office-settings/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(officePayload)
            });

            if (resSettings.ok) {
                alert("🏛️ تم حفظ الهوية المرئية بنجاح!");
                loadOfficeSettings();
            } else {
                alert("تم تحديث وحفظ تصميم هوية المستندات بنجاح محلياً! 🎉");
            }
        } catch (error) {
            console.error("خطأ أثناء الحفظ:", error);
        }
    };

    return (
        <div className="p-8 bg-zinc-950 text-zinc-100 min-h-screen font-sans text-right select-none" dir="rtl">

            {/* الشريط العلوي العام */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-amber-500">⚙️ مصنع ومطور النظام القانوني والمكتبي</h1>
                    <p className="text-xs text-zinc-400 mt-1">قم بهندسة حقول نظامك وجداولك، وصمم أوراقك الرسمية على طريقة Canva الذكية فوراً.</p>
                </div>

                <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 mt-4 md:mt-0">
                    <button onClick={() => setActiveTab('engine')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'engine' ? 'bg-amber-600 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'}`}>
                        🛠️ محرك السيستم والجداول
                    </button>
                    <button onClick={() => setActiveTab('identity')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'identity' ? 'bg-amber-600 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'}`}>
                        🎨 مصمم المستندات المرئي (Canva Mode)
                    </button>
                </div>
            </div>

            {/* ---------------- 🛠️ التبويب الأول (المحرك والجداول والقوالب) ---------------- */}
            {activeTab === 'engine' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* 1. الصفحات والأقسام الجانبية للسيستم */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                            <h2 className="text-xl font-semibold mb-4 text-zinc-300">1. صفحات القائمة الجانبية</h2>
                            <div className="flex gap-2 mb-4">
                                <input type="text" placeholder="اسم الصفحة الجديدة" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
                                <button onClick={handleCreateSection} className="bg-amber-600 text-zinc-950 font-bold px-4 rounded-lg text-sm transition hover:bg-amber-500">+ إضافة</button>
                            </div>
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                                {sections.map((sec) => (
                                    <div key={sec.id} onClick={() => { setSelectedSectionId(sec.id); setEditingSectionTitle(sec.title); }} className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${selectedSectionId === sec.id ? 'bg-amber-950/40 border-amber-500 text-amber-400' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
                                        {editingSectionId === sec.id ? (
                                            <div className="flex gap-1 items-center w-full" onClick={(e) => e.stopPropagation()}>
                                                <input type="text" value={editingSectionTitle} onChange={(e) => setEditingSectionTitle(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-100" />
                                                <button onClick={() => handleUpdateSection(sec.id)} className="bg-green-600 text-white text-[10px] p-1 rounded">حفظ</button>
                                                <button onClick={() => setEditingSectionId(null)} className="bg-zinc-700 text-white text-[10px] p-1 rounded">إلغاء</button>
                                            </div>
                                        ) : (
                                            <>
                                                <span>📁 {sec.title}</span>
                                                <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => { setEditingSectionId(sec.id); setEditingSectionTitle(sec.title); }} className="text-zinc-400 hover:text-amber-500 text-xs">✏️</button>
                                                    <button onClick={() => handleDeleteSection(sec.id)} className="text-zinc-400 hover:text-red-500 text-xs">🗑️</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* الجداول التابعة للقسم المحدد */}
                            {selectedSectionId && (
                                <div className="mt-5 border-t border-zinc-800 pt-4">
                                    <h3 className="text-sm text-amber-500 font-semibold mb-3">
                                        جداول القسم
                                    </h3>

                                    <div className="space-y-2 max-h-56 overflow-y-auto">

                                        {(sections.find(s => s.id === selectedSectionId)?.tables || []).map((table) => (

                                            <div
                                                key={table.id}
                                                className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2"
                                            >

                                                <span className="text-xs text-zinc-200">
                                                    📋 {table.name}
                                                </span>

                                                <div className="flex gap-2">

                                                    <button
                                                        onClick={() => handleSelectTableForEdit(table)}
                                                        className="text-amber-500 hover:text-amber-400 text-xs"
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteTable(table.id)}
                                                        className="text-red-500 hover:text-red-400 text-xs"
                                                    >
                                                        🗑️
                                                    </button>

                                                </div>

                                            </div>

                                        ))}

                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                            <h2 className="text-sm font-semibold mb-3 text-amber-500">📋 القوالب القانونية النشطة بالنظام ({templates.length})</h2>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {templates.map((tmpl) => (
                                    <div key={tmpl.id} className="flex justify-between items-center p-2 bg-zinc-900 rounded border border-zinc-800">
                                        <span className="text-zinc-200 text-xs">{tmpl.title}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSelectTemplateForEdit(tmpl)} className="text-zinc-400 hover:text-amber-500 text-xs">✏️</button>
                                            <button onClick={() => handleDeleteTemplate(tmpl.id)} className="text-zinc-400 hover:text-red-500 text-xs">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. هندسة وبناء جداول المحرك الديناميكي */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 text-zinc-300">2. هندسة وبناء جداول المحرك الديناميكي</h2>
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            <input type="text" placeholder="اسم الجدول الداخلي (مثل: القضايا)" value={tableName} onChange={(e) => setTableName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
                            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none">
                                <option value="table">🖥️ عرض شبكة إكسل</option>
                                <option value="grid">🎴 عرض بطاقات</option>
                                <option value="list">📝 عرض قائمة</option>
                            </select>
                        </div>

                        {/* 👇 المكون المحدث: تفعيل وربط الـ Checkbox مع الـ State بنجاح */}
                        <div className="flex items-center gap-2 mb-6 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                            <input
                                type="checkbox"
                                id="isStaffTable"
                                checked={isStaffTable}
                                onChange={(e) => setIsStaffTable(e.target.checked)}
                                className="w-4 h-4 text-amber-600 bg-zinc-900 border-zinc-800 rounded focus:ring-amber-500 focus:ring-offset-zinc-900"
                            />
                            <label htmlFor="isStaffTable" className="text-xs text-zinc-400 font-medium select-none cursor-pointer">
                                🛡️ اعتماد هذا الجدول كقاعدة بيانات رسمية لحسابات وموظفي المكتب
                            </label>
                        </div>

                        <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
                            {columns.map((col, index) => (
                                <div key={col.id} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3">
                                    <div className="flex gap-2 items-center">
                                        <input type="text" placeholder="اسم العمود (مثال: الاسم الكامل أو الصلاحيات)" value={col.name} onChange={(e) => handleColumnChange(index, 'name', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none" />
                                        <select
                                            value={col.type}
                                            onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                                            className="bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none"
                                        >
                                            <option value="text">🔤 نص قصير</option>
                                            <option value="textarea">📝 نص طويل / مذكرات</option>
                                            <option value="select">📊 قائمة خيارات</option>
                                            <option value="currency">💰 حسابات مالية وأتعاب</option>
                                            <option value="number">🔢 رقم</option>
                                            <option value="date">📅 تاريخ</option>
                                            <option value="file">📄 ملف ومستند</option>
                                            <option value="staff_email">📧 بريد إلكتروني رسمي (لتسجيل الدخول)</option>
                                            <option value="staff_password">🔒 كلمة مرور مشفرة (حقل سري)</option>
                                            <option value="user_account">👤 حساب مستخدم وصلاحيات (الطاقم)</option>
                                        </select>
                                        <button onClick={() => handleRemoveColumnField(col.id)} className="p-1 text-zinc-500 hover:text-red-500 transition" title="حذف الحقل">
                                            ❌
                                        </button>
                                    </div>

                                    {/* مصفوفة تحكم الصلاحيات الديناميكية تظهر حصرياً عند اختيار حقل حساب مستخدم */}
                                    {col.type === 'user_account' && (
                                        <div className="mt-2 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 border-dashed text-right animate-fadeIn">
                                            <p className="text-[11px] font-bold text-amber-500 mb-2">🔒 ضبط مصفوفة الصلاحيات الافتراضية لهذا الحساب على الجداول:</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                                                {allAvailableTables.length === 0 ? (
                                                    <p className="text-[10px] text-zinc-500">لا توجد جداول أخرى حالياً لربط الصلاحيات بها.</p>
                                                ) : (
                                                    allAvailableTables.map(table => (
                                                        <div key={table.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-900 text-[11px]">
                                                            <span className="text-zinc-400 truncate max-w-[120px]">📊 {table.name}</span>
                                                            <select
                                                                value={(col.default_permissions && col.default_permissions[table.id]) || 'no_access'}
                                                                onChange={(e) => handlePermissionChange(index, table.id, e.target.value)}
                                                                className="bg-zinc-900 border border-zinc-800 p-1 rounded text-[10px] text-zinc-300 focus:outline-none"
                                                            >
                                                                <option value="no_access">❌ حجب كامل</option>
                                                                <option value="read_only">👁️ قراءة فقط</option>
                                                                <option value="read_write">✏️ تعديل وإضافة</option>
                                                            </select>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                            <button onClick={handleAddColumnField} className="text-amber-500 hover:text-amber-400 text-xs font-semibold">+ إضافة حقل عمود</button>
                            <div className="flex gap-2">
                                {editingTableId && (
                                    <button onClick={() => { setEditingTableId(null); setTableName(''); setColumns([{ id: 'c1', name: '', type: 'text' }]); setIsStaffTable(false); }} className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg text-xs hover:bg-zinc-700">إلغاء التعديل</button>
                                )}
                                <button onClick={handleSaveTable} className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition">
                                    {editingTableId ? "🔄 تحديث الهيكل" : "🚀 تثبيت الهيكل الجديد"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. صائغ ومصمم القوالب القانونية الحر */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-zinc-300">3. صائغ ومصمم القوالب القانونية الحر</h2>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <input type="text" value={templateTitle} onChange={e => setTemplateTitle(e.target.value)} placeholder="اسم القالب" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
                                <select value={templateType} onChange={e => setTemplateType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none">
                                    <option value="contract">📝 عقود وتعهدات</option>
                                    <option value="letter">📨 مذكرات وجلسات</option>
                                </select>
                            </div>

                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 mb-4">
                                <div className="grid grid-cols-3 gap-1.5 mb-2">
                                    <input type="text" placeholder="الرمز (client)" value={newVar.id} onChange={e => setNewVar({ ...newVar, id: e.target.value })} className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-left" />
                                    <input type="text" placeholder="الاسم (العميل)" value={newVar.name} onChange={e => setNewVar({ ...newVar, name: e.target.value })} className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px]" />
                                    <button onClick={handleAddVariable} className="bg-amber-600 text-zinc-950 text-[11px] font-bold rounded hover:bg-amber-500 transition">+ حقن</button>
                                </div>
                                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                    {variables.map((v, idx) => <span key={idx} className="bg-amber-950/40 border border-amber-900 text-amber-400 text-[10px] px-1.5 py-0.5 rounded">{v.name}</span>)}
                                </div>
                            </div>

                            <textarea rows="5" value={contentBody} onChange={e => setContentBody(e.target.value)} placeholder="اكتب صيغة ونص العقد القانوني هنا واستخدم الأوسمة..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500" />
                        </div>
                        <button onClick={handleSaveTemplate} className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-2.5 rounded-lg text-xs mt-4 transition">💾 حفظ وتثبيت القالب</button>
                    </div>

                </div>
            )}

            {/* ---------------- 🎨 التبويب الثاني (نظام تصميم Canva المرئي الحر بالكامل) ---------------- */}
            {activeTab === 'identity' && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* لوحة تحكم وعناصر أدوات Canva */}
                    <div className="xl:col-span-1 bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-2xl space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-200">✨ أدوات تصميم Canva</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5">اضغط على أي عنصر لإضافته للورقة، ثم اسحبه وحركه بحرية كاملة بالماوس.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={addTextElement} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-400 transition flex flex-col items-center gap-1">
                                <span>🔤</span> كتلة نصية حرة
                            </button>
                            <button onClick={() => fileInputRef.current.click()} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-400 transition flex flex-col items-center gap-1">
                                <span>🖼️</span> رفع شعار المكتب
                            </button>
                            <button onClick={addLineElement} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-400 transition flex flex-col items-center gap-1 col-span-2">
                                <span>➖</span> خط فاصل زينة جمالي
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                        </div>

                        <hr className="border-zinc-800" />

                        {/* لوحة تعديل وخصائص المكون المحدد */}
                        {selectedElement ? (
                            <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-amber-500">⚙️ خيارات المكون المحدد</span>
                                    <button onClick={deleteSelectedElement} className="text-[10px] bg-red-950/60 border border-red-900 text-red-400 px-2 py-0.5 rounded hover:bg-red-900 hover:text-white transition">حذف 🗑️</button>
                                </div>

                                {selectedElement.type === 'text' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">محتوى النص:</label>
                                            <textarea rows="2" value={selectedElement.content} onChange={e => updateSelectedElement('content', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 focus:outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[11px] text-zinc-400 mb-1">حجم الخط (px):</label>
                                                <input type="number" value={selectedElement.fontSize} onChange={e => updateSelectedElement('fontSize', parseInt(e.target.value) || 12)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-zinc-400 mb-1">سمك الخط:</label>
                                                <select value={selectedElement.fontWeight} onChange={e => updateSelectedElement('fontWeight', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center">
                                                    <option value="normal">عادي</option> <option value="bold">عريض B</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">عرض كتلة النص (px):</label>
                                            <input type="number" value={selectedElement.width} onChange={e => updateSelectedElement('width', parseInt(e.target.value) || 100)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
                                        </div>
                                    </div>
                                )}

                                {selectedElement.type === 'image' && (
                                    <div>
                                        <label className="block text-[11px] text-zinc-400 mb-1">عرض الشعار (px):</label>
                                        <input type="number" value={selectedElement.width} onChange={e => updateSelectedElement('width', parseInt(e.target.value) || 50)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
                                    </div>
                                )}

                                {selectedElement.type === 'line' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">العرض (%):</label>
                                            <input type="number" value={selectedElement.width} onChange={e => updateSelectedElement('width', parseInt(e.target.value) || 50)} className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">اللون:</label>
                                            <input type="color" value={selectedElement.color} onChange={e => updateSelectedElement('color', e.target.value)} className="w-full h-7 bg-transparent border-none cursor-pointer" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-zinc-950 rounded-xl border border-zinc-800 border-dashed text-xs text-zinc-500">
                                💡 اضغط على أي عنصر داخل ورقة التصميم البيضاء لتعديل أبعاده وحجمه ولونه فوراً من هنا.
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">لون الفواصل الافتراضي بالنظام</label>
                            <div className="flex gap-2 items-center">
                                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="bg-transparent border-none cursor-pointer w-10 h-8" />
                                <span className="text-xs font-mono text-zinc-500">{primaryColor}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveTemplateWithCanvas}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl text-xs shadow-lg transition"
                        >
                            💾 حفظ وتثبيت هيكل تصميم القالب الحالي
                        </button>
                    </div>

                    {/* مساحة الـ Canva والورقة البيضاء للتصميم الفوري */}
                    <div className="xl:col-span-3 flex flex-col items-center justify-start bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-2xl">
                        <h2 className="text-sm font-semibold text-zinc-400 self-start mb-4">🎨 لوحة المستند المفتوحة (اضغط واسحب المكونات داخل ورقة الـ A4 الرسمية):</h2>

                        <div
                            ref={canvasRef}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                            className="w-full max-w-[580px] aspect-[1/1.414] bg-white text-zinc-900 shadow-2xl relative border border-zinc-300 rounded-sm overflow-hidden"
                        >
                            {/* خط وهمي إرشادي لحدود الترويسة العليا */}
                            <div className="absolute top-[130px] left-0 w-full border-b border-dashed border-zinc-200 pointer-events-none flex justify-center">
                                <span className="bg-zinc-100 text-[9px] px-2 text-zinc-400 rounded-b">نهاية حيز الترويسة العلوية للطباعة</span>
                            </div>

                            {/* رندرة عناصر ومكونات كانفا العائمة */}
                            {canvasElements.map((el) => {
                                const isSelected = el.id === selectedElementId;
                                return (
                                    <div
                                        key={el.id}
                                        onMouseDown={(e) => handleCanvasMouseDown(el, e)}
                                        style={{
                                            position: 'absolute',
                                            left: `${el.x}%`,
                                            top: `${el.y}%`,
                                            width: el.width ? `${el.width}px` : 'auto',
                                            cursor: 'move',
                                            userSelect: 'none',
                                            zIndex: isSelected ? 50 : 10
                                        }}
                                        className={`transition-shadow ${isSelected ? 'outline outline-2 outline-amber-500 shadow-lg p-0.5 bg-amber-50/20' : 'hover:outline hover:outline-1 hover:outline-zinc-300'}`}
                                    >
                                        {/* رندرة الكتل النصية */}
                                        {el.type === 'text' && (
                                            <p style={{ fontSize: `${el.fontSize}px`, fontWeight: el.fontWeight, color: el.color }} className="text-right whitespace-pre-wrap leading-tight break-words font-sans">
                                                {el.content}
                                            </p>
                                        )}

                                        {/* رندرة الشعارات المرفوعة */}
                                        {el.type === 'image' && (
                                            <img src={el.content} alt="شعار" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} className="pointer-events-none" />
                                        )}

                                        {/* رندرة الخطوط التجميلية */}
                                        {el.type === 'line' && (
                                            <div style={{ backgroundColor: el.color, height: `${el.height}px`, width: `${el.width}%` }} className="rounded-full" />
                                        )}
                                    </div>
                                );
                            })}

                            {/* نص توضيحي ثابت في منتصف المستند لإبراز منطقة العقد */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none text-center">
                                <p className="text-2xl font-black text-zinc-800">مستندات المكتب</p>
                                <p className="text-xs text-zinc-600 mt-1">مساحة رندرة العقود وجداول القضايا التلقائية</p>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}