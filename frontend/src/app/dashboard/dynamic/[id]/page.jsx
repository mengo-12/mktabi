'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { dynamicService } from '@/services/dynamicService';
import { Plus, Table, LayoutGrid, FileText, Save, Trash2, Edit3, Settings, X } from 'lucide-react';

export default function DynamicSectionPage() {
    const { id: sectionId } = useParams();
    const [tables, setTables] = useState([]);
    const [activeTable, setActiveTable] = useState(null);
    const [rows, setRows] = useState([]);
    const [viewMode, setViewMode] = useState('table');

    // حالات النوافذ المنبثقة (Modals)
    const [isRowModalOpen, setIsRowModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const [editingRow, setEditingRow] = useState(null); 
    const [rowData, setRowData] = useState({});

    // العمل على إدارة الأعمدة وهيكل الجدول
    const [manageColumns, setManageColumns] = useState([]);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnType, setNewColumnType] = useState('text');

    // تتبع الخلية النشطة للتعديل داخل الجدول الرئيسي
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState("");

    // تتبع حالة تعديل اسم العمود الحالي داخل الـ Settings Modal
    const [editingColumnId, setEditingColumnId] = useState(null);

    useEffect(() => {
        if (sectionId) {
            loadSectionContent();
        }
    }, [sectionId]);

    const loadSectionContent = async () => {
        try {
            const tablesData = await dynamicService.getTablesBySection(sectionId);
            setTables(tablesData);
            if (tablesData.length > 0) {
                const currentActive = tablesData.find(t => t.id === activeTable?.id) || tablesData[0];
                setActiveTable(currentActive);
                setViewMode(currentActive.view_mode || 'table');
                loadTableRows(currentActive.id);
            }
        } catch (error) {
            console.error("خطأ في جلب المحتويات:", error);
        }
    };

    const loadTableRows = async (tableId) => {
        try {
            const rowsData = await dynamicService.getRowsByTable(tableId);
            setRows(rowsData);
        } catch (error) {
            console.error("خطأ في جلب الصفوف:", error);
        }
    };

    const handleTableChange = (table) => {
        setActiveTable(table);
        setViewMode(table.view_mode || 'table');
        loadTableRows(table.id);
    };

    // --- إدارة الصفوف (إضافة / تعديل / حذف) ---
    const openAddRowModal = () => {
        setEditingRow(null);
        setRowData({});
        setIsRowModalOpen(true);
    };

    const openEditRowModal = (row) => {
        setEditingRow(row);
        setRowData(row.cells_data);
        setIsRowModalOpen(true);
    };

    const handleSaveRow = async () => {
        try {
            if (editingRow) {
                await dynamicService.updateRow(editingRow.id, rowData);
                alert("تم تحديث السجل بنجاح!");
            } else {
                await dynamicService.addRow(activeTable.id, rowData);
                alert("تم حفظ السجل بنجاح!");
            }
            setIsRowModalOpen(false);
            if (activeTable?.id) {
                await loadTableRows(activeTable.id);
            }
        } catch (error) {
            console.error("خطأ أثناء معالجة السجل:", error);
            alert("حدث خطأ أثناء الحفظ، يرجى التحقق من مطابقة البيانات.");
        }
    };

    const handleDeleteRow = async (rowId) => {
        if (confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) {
            try {
                await dynamicService.deleteRow(rowId);
                alert("تم حذف السجل بنجاح.");
                if (activeTable?.id) {
                    await loadTableRows(activeTable.id);
                }
            } catch (error) {
                console.error("خطأ في حذف السجل:", error);
                alert("فشل حذف السجل من قاعدة البيانات.");
            }
        }
    };

    // --- إدارة الأعمدة وهيكل الجدول ---
    const openSettingsModal = () => {
        setManageColumns([...activeTable.columns_definition]);
        setIsSettingsModalOpen(true);
    };

    const handleAddColumnStructure = () => {
        if (!newColumnName.trim()) return;
        const newCol = {
            id: `col_${Date.now()}`,
            name: newColumnName.trim(),
            type: newColumnType
        };
        setManageColumns([...manageColumns, newCol]);
        setNewColumnName('');
    };

    const handleRemoveColumnStructure = (colId) => {
        setManageColumns(manageColumns.filter(c => c.id !== colId));
    };

    const handleSaveChangesStructure = async () => {
        try {
            await dynamicService.updateTable(activeTable.id, activeTable.name, manageColumns, viewMode);
            setIsSettingsModalOpen(false);
            alert("تم تحديث هيكل الجدول والأعمدة بنجاح!");
            loadSectionContent(); 
        } catch (error) {
            console.error("خطأ أثناء تحديث الهيكل:", error);
        }
    };

    // الترتيب بالسحب والإفلات
    const [draggedColIndex, setDraggedColIndex] = useState(null);

    const handleDragStart = (index) => {
        setDraggedColIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault(); 
        if (draggedColIndex === null || draggedColIndex === index) return;

        const updated = [...manageColumns];
        const draggedItem = updated[draggedColIndex];

        updated.splice(draggedColIndex, 1);
        updated.splice(index, 0, draggedItem);

        setDraggedColIndex(index); 
        setManageColumns(updated); 
    };

    const handleDragEnd = () => {
        setDraggedColIndex(null);
    };

    // دالة التعديل الفوري للخلية (تم التعديل لتعمل بـ col.id)
    const handleCellBlur = async (rowId, colId, originalValue) => {
        if (editValue === originalValue) {
            setEditingCell(null);
            return;
        }

        try {
            const currentRow = rows.find(r => r.id === rowId);
            const updatedCellsData = {
                ...currentRow.cells_data,
                [colId]: editValue // التخزين باستخدام المعرّف الثابت colId
            };

            await dynamicService.updateRow(rowId, updatedCellsData);

            setRows(prevRows => prevRows.map(row => {
                if (row.id === rowId) {
                    return { ...row, cells_data: updatedCellsData };
                }
                return row;
            }));

        } catch (error) {
            console.error("خطأ أثناء التعديل الفوري للخلية:", error);
            alert("فشل حفظ التعديل، يرجى التحقق من الاتصال.");
        } finally {
            setEditingCell(null); 
        }
    };

    // دالة تعديل اسم العمود (الآن تعدل الاسم فقط ويبقى الـ id ثابتاً ومحفوظاً بالبيانات)
    const handleRenameColumn = (columnId, newName) => {
        if (!newName.trim()) {
            setEditingColumnId(null);
            return;
        }

        const updatedManageColumns = manageColumns.map(col => {
            if (col.id === columnId) {
                return { ...col, name: newName.trim() };
            }
            return col;
        });
        setManageColumns(updatedManageColumns);

        setActiveTable(prev => ({
            ...prev,
            columns_definition: updatedManageColumns
        }));

        setEditingColumnId(null);
    };

    if (tables.length === 0) {
        return (
            <div className="md:mr-64 p-8 text-center text-slate-400 min-h-screen bg-[#0B0F19]" dir="rtl">
                <div className="max-w-md mx-auto pt-20">
                    <p className="text-lg font-semibold text-slate-300">هذا القسم لا يحتوي على جداول حالياً.</p>
                    <p className="text-xs text-slate-500 mt-2">توجه إلى "مصنع النظام" في الإعدادات لبناء وتثبيت الجداول هنا.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="md:mr-64 p-6 bg-[#0B0F19] min-h-screen text-slate-100 font-sans min-w-0" dir="rtl">

            {/* شريط الجداول العلوية */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
                {tables.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTableChange(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTable?.id === tab.id
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                            }`}
                    >
                        📊 {tab.name}
                    </button>
                ))}
            </div>

            {activeTable && (
                <div>
                    {/* شريط التحكم الرئيسي */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div>
                            <h1 className="text-xl font-black text-slate-200">{activeTable.name}</h1>
                            <p className="text-[10px] text-slate-500 mt-1">إدارة شاملة للهيكل، الأعمدة، والصفوف والأرشفة</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><Table className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><FileText className="w-4 h-4" /></button>
                            </div>

                            <button
                                onClick={openSettingsModal}
                                className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-amber-500 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                            >
                                <Settings className="w-4 h-4" /> إدارة الأعمدة
                            </button>

                            <button
                                onClick={openAddRowModal}
                                className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-600/10"
                            >
                                <Plus className="w-4 h-4" /> إضافة سجل جديد
                            </button>
                        </div>
                    </div>

                    {/* 🖥️ 1. نمط الجدول (Table View) */}
                    {viewMode === 'table' && (
                        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800">
                            <table className="w-full text-right border-collapse min-w-[700px]">
                                <thead className="bg-slate-950 text-slate-400 text-xs font-bold border-b border-slate-800">
                                    <tr>
                                        {activeTable.columns_definition.map((col) => (
                                            <th key={col.id} className="p-4">{col.name}</th>
                                        ))}
                                        <th className="p-4 text-left">خيارات التحكم</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-slate-300 divide-y divide-slate-800/50">
                                    {rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-850/40 transition">
                                            {activeTable.columns_definition.map((col) => {
                                                const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.id;
                                                // التعديل هنا: جلب القيمة بواسطة col.id بدلاً من col.name
                                                const cellValue = row.cells_data[col.id] || "";

                                                return (
                                                    <td
                                                        key={col.id}
                                                        className="p-4 font-medium min-w-[150px]"
                                                        onDoubleClick={() => {
                                                            setEditingCell({ rowId: row.id, colKey: col.id });
                                                            setEditValue(cellValue);
                                                        }}
                                                    >
                                                        {isEditing ? (
                                                            <input
                                                                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                                                value={editValue}
                                                                autoFocus
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={() => handleCellBlur(row.id, col.id, cellValue)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleCellBlur(row.id, col.id, cellValue);
                                                                    if (e.key === 'Escape') setEditingCell(null);
                                                                }}
                                                                className="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-1.5 text-xs text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                                            />
                                                        ) : (
                                                            <div className="cursor-pointer hover:bg-slate-800/40 p-1 rounded transition select-none min-h-[20px] flex items-center">
                                                                {cellValue || <span className="text-slate-600 italic">فارغ</span>}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            <td className="p-4 text-left flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDeleteRow(row.id)}
                                                    className="p-1.5 bg-slate-950 hover:bg-red-950 rounded-lg text-red-400 hover:text-red-300 transition"
                                                    title="حذف الصف"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={activeTable.columns_definition.length + 1} className="text-center p-8 text-slate-500">
                                                لا توجد سجلات مدخلة حتى الآن.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 🎴 2. نمط بطاقات (Grid View) */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rows.map((row) => (
                                <div key={row.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                                    <div className="space-y-2.5">
                                        {activeTable.columns_definition.map((col, idx) => (
                                            <div key={col.id} className={idx === 0 ? "border-b border-slate-800 pb-2 mb-2" : ""}>
                                                <span className="block text-[10px] text-slate-500 font-bold">{col.name}</span>
                                                <span className={`text-xs font-semibold ${idx === 0 ? "text-amber-400 text-sm font-black" : "text-slate-300"}`}>
                                                    {/* التعديل هنا: جلب القيمة بواسطة col.id */}
                                                    {row.cells_data[col.id] || '-'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-3">
                                        <button onClick={() => openEditRowModal(row)} className="px-2.5 py-1.5 bg-slate-950 text-blue-400 hover:bg-blue-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition"><Edit3 className="w-3.5 h-3.5" /> تعديل</button>
                                        <button onClick={() => handleDeleteRow(row.id)} className="px-2.5 py-1.5 bg-slate-950 text-red-400 hover:bg-red-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 📝 3. نمط القائمة الطولية (List View) */}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            {rows.map((row) => (
                                <div key={row.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center justify-between transition">
                                    <div className="flex flex-wrap gap-6 items-center text-xs">
                                        {activeTable.columns_definition.map((col) => (
                                            <div key={col.id} className="flex gap-1">
                                                <span className="text-slate-500 font-bold">{col.name}: </span>
                                                {/* التعديل هنا: جلب القيمة بواسطة col.id */}
                                                <span className="text-slate-300 font-medium">{row.cells_data[col.id] || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditRowModal(row)} className="p-1.5 bg-slate-950 text-blue-400 hover:bg-slate-800 rounded-lg transition"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 bg-slate-950 text-red-400 hover:bg-red-950 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 📥 النافذة المنبثقة: إضافة أو تعديل صف */}
            {isRowModalOpen && activeTable && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-amber-500">
                                {editingRow ? `📝 تعديل السجل المختار` : `📥 إضافة سجل جديد إلى: ${activeTable.name}`}
                            </h3>
                            <button onClick={() => setIsRowModalOpen(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {activeTable.columns_definition.map((col) => (
                                <div key={col.id}>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">{col.name}</label>
                                    <input
                                        type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                        // التعديل هنا: ربط الـ value بـ col.id
                                        value={rowData[col.id] || ''}
                                        onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                        placeholder={`أدخل قيمة حقل ${col.name}...`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                            <button onClick={() => setIsRowModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">إلغاء</button>
                            <button onClick={handleSaveRow} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1"><Save className="w-4 h-4" /> حفظ البيانات</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ⚙️ النافذة المنبثقة: إعدادات وهيكل الأعمدة */}
            {isSettingsModalOpen && activeTable && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-amber-500">⚙️ مهندس الأعمدة وهيكل جدول ({activeTable.name})</h3>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                            <span className="block text-[10px] text-slate-500 font-bold">➕ إضافة حقل جديد للجدول</span>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="اسم الحقل (مثال: رقم القضية)..."
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                                />
                                <select
                                    value={newColumnType}
                                    onChange={(e) => setNewColumnType(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 focus:outline-none"
                                >
                                    <option value="text">نص ذكي</option>
                                    <option value="number">أرقام / مبالغ</option>
                                    <option value="date">تاريخ ووقت</option>
                                </select>
                                <button
                                    onClick={handleAddColumnStructure}
                                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-black transition"
                                >
                                    إضافة حقل
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="block text-[10px] text-slate-400 font-bold">الأعمدة المعتمدة (انقر مرتين على الاسم لتعديله، أو اسحب من ☰ للترتيب):</span>
                            <div className="max-h-[35vh] overflow-y-auto space-y-2 pr-1">
                                {manageColumns.map((col, index) => (
                                    <div
                                        key={col.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border transition-all duration-200 ${draggedColIndex === index
                                            ? 'border-amber-500/50 bg-slate-900/80 opacity-50 scale-[0.98]'
                                            : 'border-slate-800/80 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 text-xs w-full">
                                            <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 font-bold px-1 py-2 text-sm select-none">
                                                ☰
                                            </div>

                                            <div className="flex items-center gap-2 flex-1">
                                                {editingColumnId === col.id ? (
                                                    <input
                                                        type="text"
                                                        defaultValue={col.name}
                                                        autoFocus
                                                        onBlur={(e) => handleRenameColumn(col.id, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRenameColumn(col.id, e.target.value);
                                                            if (e.key === 'Escape') setEditingColumnId(null);
                                                        }}
                                                        className="bg-slate-900 text-amber-400 font-bold text-xs px-2 py-1 rounded border border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full max-w-[150px]"
                                                    />
                                                ) : (
                                                    <span
                                                        onDoubleClick={() => setEditingColumnId(col.id)}
                                                        className="text-slate-200 font-bold cursor-pointer hover:text-amber-400 transition-colors duration-150 select-none"
                                                        title="انقر مرتين لتعديل الاسم"
                                                    >
                                                        {col.name}
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 bg-slate-900 text-slate-500 rounded text-[10px]">
                                                    {col.type === 'text' ? 'نص' : col.type === 'number' ? 'رقم' : 'تاريخ'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveColumnStructure(col.id)}
                                            className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/20 transition flex-shrink-0"
                                            title="حذف العمود"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {manageColumns.length === 0 && (
                                    <p className="text-center text-xs text-slate-600 py-4">لا توجد أعمدة في هذا الجدول حالياً.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                            <button onClick={() => setIsSettingsModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">إلغاء</button>
                            <button onClick={handleSaveChangesStructure} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1"><Save className="w-4 h-4" /> حفظ التغييرات</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}