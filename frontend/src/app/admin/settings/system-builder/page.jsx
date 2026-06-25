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

    // جلب الأقسام عند تحميل الصفحة
    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        try {
            const data = await dynamicService.getSections();
            setSections(data);
        } catch (error) {
            console.error("خطأ في جلب الأقسام", error);
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
            alert("تم بناء وتثبيت الجدول بنجاح في النظام!");
            // تصفير الحقول
            setTableName('');
            setColumns([{ id: 'c1', name: '', type: 'text' }]);
        } catch (error) {
            console.error("خطأ أثناء حفظ الجدول", error);
        }
    };

    return (
        <div className="p-8 bg-zinc-950 text-zinc-100 min-h-screen font-sans text-right" dir="rtl">
            <h1 className="text-3xl font-bold border-b border-zinc-800 pb-4 mb-8 text-amber-500">⚙️ مصنع النظام المكتبي المخصص</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* القسم الأول: إنشاء الصفحات في الـ Sidebar */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-zinc-300">1. إدارة صفحات القائمة الجانبية</h2>
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

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
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

                {/* القسم الثاني: بناء الجدول وتصميم الأعمدة */}
                <div className="lg:col-span-2 bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-zinc-300">2. هندسة وبناء حقول الجدول وعلاقاته</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                    <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
                        {columns.map((col, index) => (
                            <div key={col.id} className="flex gap-3 items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                <span className="text-xs text-zinc-500 font-mono">{col.id}</span>
                                <input
                                    type="text"
                                    placeholder="اسم العمود (مثلاً: رقم الجوال، تاريخ الجلسة)"
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
                                    <option value="number">🔢 رقم / أتعاب مالية</option>
                                    <option value="date">📅 تاريخ ووقت</option>
                                    <option value="file">📄 مرفق ملف (PDF/صورة)</option>
                                    <option value="relation">🔗 حقل علاقة بجدول آخر</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                        <button
                            onClick={handleAddColumnField}
                            className="text-amber-500 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition"
                        >
                            + إضافة حقل (عمود) جديد
                        </button>
                        <button
                            onClick={handleSaveTable}
                            className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-6 py-2 rounded-lg text-sm shadow-lg shadow-amber-900/20 transition"
                        >
                            🚀 تثبيت الجدول وحفظ الهيكل
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}