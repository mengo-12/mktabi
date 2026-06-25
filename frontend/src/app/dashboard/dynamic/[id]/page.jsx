// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import { dynamicService } from '@/services/dynamicService';
// import { Plus, Table, LayoutGrid, FileText, Save, Trash2, Edit3, Settings, X } from 'lucide-react';

// export default function DynamicSectionPage() {
//     const { id: sectionId } = useParams();
//     const [tables, setTables] = useState([]);
//     const [activeTable, setActiveTable] = useState(null);
//     const [rows, setRows] = useState([]);
//     const [viewMode, setViewMode] = useState('table');

//     // حالات النوافذ المنبثقة (Modals)
//     const [isRowModalOpen, setIsRowModalOpen] = useState(false);
//     const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

//     const [editingRow, setEditingRow] = useState(null); 
//     const [rowData, setRowData] = useState({});

//     // العمل على إدارة الأعمدة وهيكل الجدول
//     const [manageColumns, setManageColumns] = useState([]);
//     const [newColumnName, setNewColumnName] = useState('');
//     const [newColumnType, setNewColumnType] = useState('text');

//     // تتبع الخلية النشطة للتعديل داخل الجدول الرئيسي
//     const [editingCell, setEditingCell] = useState(null);
//     const [editValue, setEditValue] = useState("");

//     // تتبع حالة تعديل اسم العمود الحالي داخل الـ Settings Modal
//     const [editingColumnId, setEditingColumnId] = useState(null);

//     useEffect(() => {
//         if (sectionId) {
//             loadSectionContent();
//         }
//     }, [sectionId]);

//     const loadSectionContent = async () => {
//         try {
//             const tablesData = await dynamicService.getTablesBySection(sectionId);
//             setTables(tablesData);
//             if (tablesData.length > 0) {
//                 const currentActive = tablesData.find(t => t.id === activeTable?.id) || tablesData[0];
//                 setActiveTable(currentActive);
//                 setViewMode(currentActive.view_mode || 'table');
//                 loadTableRows(currentActive.id);
//             }
//         } catch (error) {
//             console.error("خطأ في جلب المحتويات:", error);
//         }
//     };

//     const loadTableRows = async (tableId) => {
//         try {
//             const rowsData = await dynamicService.getRowsByTable(tableId);
//             setRows(rowsData);
//         } catch (error) {
//             console.error("خطأ في جلب الصفوف:", error);
//         }
//     };

//     const handleTableChange = (table) => {
//         setActiveTable(table);
//         setViewMode(table.view_mode || 'table');
//         loadTableRows(table.id);
//     };

//     // --- إدارة الصفوف (إضافة / تعديل / حذف) ---
//     const openAddRowModal = () => {
//         setEditingRow(null);
//         setRowData({});
//         setIsRowModalOpen(true);
//     };

//     const openEditRowModal = (row) => {
//         setEditingRow(row);
//         setRowData(row.cells_data);
//         setIsRowModalOpen(true);
//     };

//     const handleSaveRow = async () => {
//         try {
//             if (editingRow) {
//                 await dynamicService.updateRow(editingRow.id, rowData);
//                 alert("تم تحديث السجل بنجاح!");
//             } else {
//                 await dynamicService.addRow(activeTable.id, rowData);
//                 alert("تم حفظ السجل بنجاح!");
//             }
//             setIsRowModalOpen(false);
//             if (activeTable?.id) {
//                 await loadTableRows(activeTable.id);
//             }
//         } catch (error) {
//             console.error("خطأ أثناء معالجة السجل:", error);
//             alert("حدث خطأ أثناء الحفظ، يرجى التحقق من مطابقة البيانات.");
//         }
//     };

//     const handleDeleteRow = async (rowId) => {
//         if (confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) {
//             try {
//                 await dynamicService.deleteRow(rowId);
//                 alert("تم حذف السجل بنجاح.");
//                 if (activeTable?.id) {
//                     await loadTableRows(activeTable.id);
//                 }
//             } catch (error) {
//                 console.error("خطأ في حذف السجل:", error);
//                 alert("فشل حذف السجل من قاعدة البيانات.");
//             }
//         }
//     };

//     // --- إدارة الأعمدة وهيكل الجدول ---
//     const openSettingsModal = () => {
//         setManageColumns([...activeTable.columns_definition]);
//         setIsSettingsModalOpen(true);
//     };

//     const handleAddColumnStructure = () => {
//         if (!newColumnName.trim()) return;
//         const newCol = {
//             id: `col_${Date.now()}`,
//             name: newColumnName.trim(),
//             type: newColumnType
//         };
//         setManageColumns([...manageColumns, newCol]);
//         setNewColumnName('');
//     };

//     const handleRemoveColumnStructure = (colId) => {
//         setManageColumns(manageColumns.filter(c => c.id !== colId));
//     };

//     const handleSaveChangesStructure = async () => {
//         try {
//             await dynamicService.updateTable(activeTable.id, activeTable.name, manageColumns, viewMode);
//             setIsSettingsModalOpen(false);
//             alert("تم تحديث هيكل الجدول والأعمدة بنجاح!");
//             loadSectionContent(); 
//         } catch (error) {
//             console.error("خطأ أثناء تحديث الهيكل:", error);
//         }
//     };

//     // الترتيب بالسحب والإفلات
//     const [draggedColIndex, setDraggedColIndex] = useState(null);

//     const handleDragStart = (index) => {
//         setDraggedColIndex(index);
//     };

//     const handleDragOver = (e, index) => {
//         e.preventDefault(); 
//         if (draggedColIndex === null || draggedColIndex === index) return;

//         const updated = [...manageColumns];
//         const draggedItem = updated[draggedColIndex];

//         updated.splice(draggedColIndex, 1);
//         updated.splice(index, 0, draggedItem);

//         setDraggedColIndex(index); 
//         setManageColumns(updated); 
//     };

//     const handleDragEnd = () => {
//         setDraggedColIndex(null);
//     };

//     // دالة التعديل الفوري للخلية (تم التعديل لتعمل بـ col.id)
//     const handleCellBlur = async (rowId, colId, originalValue) => {
//         if (editValue === originalValue) {
//             setEditingCell(null);
//             return;
//         }

//         try {
//             const currentRow = rows.find(r => r.id === rowId);
//             const updatedCellsData = {
//                 ...currentRow.cells_data,
//                 [colId]: editValue // التخزين باستخدام المعرّف الثابت colId
//             };

//             await dynamicService.updateRow(rowId, updatedCellsData);

//             setRows(prevRows => prevRows.map(row => {
//                 if (row.id === rowId) {
//                     return { ...row, cells_data: updatedCellsData };
//                 }
//                 return row;
//             }));

//         } catch (error) {
//             console.error("خطأ أثناء التعديل الفوري للخلية:", error);
//             alert("فشل حفظ التعديل، يرجى التحقق من الاتصال.");
//         } finally {
//             setEditingCell(null); 
//         }
//     };

//     // دالة تعديل اسم العمود (الآن تعدل الاسم فقط ويبقى الـ id ثابتاً ومحفوظاً بالبيانات)
//     const handleRenameColumn = (columnId, newName) => {
//         if (!newName.trim()) {
//             setEditingColumnId(null);
//             return;
//         }

//         const updatedManageColumns = manageColumns.map(col => {
//             if (col.id === columnId) {
//                 return { ...col, name: newName.trim() };
//             }
//             return col;
//         });
//         setManageColumns(updatedManageColumns);

//         setActiveTable(prev => ({
//             ...prev,
//             columns_definition: updatedManageColumns
//         }));

//         setEditingColumnId(null);
//     };

//     if (tables.length === 0) {
//         return (
//             <div className="md:mr-64 p-8 text-center text-slate-400 min-h-screen bg-[#0B0F19]" dir="rtl">
//                 <div className="max-w-md mx-auto pt-20">
//                     <p className="text-lg font-semibold text-slate-300">هذا القسم لا يحتوي على جداول حالياً.</p>
//                     <p className="text-xs text-slate-500 mt-2">توجه إلى "مصنع النظام" في الإعدادات لبناء وتثبيت الجداول هنا.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="md:mr-64 p-6 bg-[#0B0F19] min-h-screen text-slate-100 font-sans min-w-0" dir="rtl">

//             {/* شريط الجداول العلوية */}
//             <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
//                 {tables.map((tab) => (
//                     <button
//                         key={tab.id}
//                         onClick={() => handleTableChange(tab)}
//                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTable?.id === tab.id
//                             ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
//                             : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
//                             }`}
//                     >
//                         📊 {tab.name}
//                     </button>
//                 ))}
//             </div>

//             {activeTable && (
//                 <div>
//                     {/* شريط التحكم الرئيسي */}
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
//                         <div>
//                             <h1 className="text-xl font-black text-slate-200">{activeTable.name}</h1>
//                             <p className="text-[10px] text-slate-500 mt-1">إدارة شاملة للهيكل، الأعمدة، والصفوف والأرشفة</p>
//                         </div>

//                         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
//                             <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
//                                 <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><Table className="w-4 h-4" /></button>
//                                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4" /></button>
//                                 <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><FileText className="w-4 h-4" /></button>
//                             </div>

//                             <button
//                                 onClick={openSettingsModal}
//                                 className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-amber-500 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
//                             >
//                                 <Settings className="w-4 h-4" /> إدارة الأعمدة
//                             </button>

//                             <button
//                                 onClick={openAddRowModal}
//                                 className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-600/10"
//                             >
//                                 <Plus className="w-4 h-4" /> إضافة سجل جديد
//                             </button>
//                         </div>
//                     </div>

//                     {/* 🖥️ 1. نمط الجدول (Table View) */}
//                     {viewMode === 'table' && (
//                         <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800">
//                             <table className="w-full text-right border-collapse min-w-[700px]">
//                                 <thead className="bg-slate-950 text-slate-400 text-xs font-bold border-b border-slate-800">
//                                     <tr>
//                                         {activeTable.columns_definition.map((col) => (
//                                             <th key={col.id} className="p-4">{col.name}</th>
//                                         ))}
//                                         <th className="p-4 text-left">خيارات التحكم</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="text-xs text-slate-300 divide-y divide-slate-800/50">
//                                     {rows.map((row) => (
//                                         <tr key={row.id} className="hover:bg-slate-850/40 transition">
//                                             {activeTable.columns_definition.map((col) => {
//                                                 const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.id;
//                                                 // التعديل هنا: جلب القيمة بواسطة col.id بدلاً من col.name
//                                                 const cellValue = row.cells_data[col.id] || "";

//                                                 return (
//                                                     <td
//                                                         key={col.id}
//                                                         className="p-4 font-medium min-w-[150px]"
//                                                         onDoubleClick={() => {
//                                                             setEditingCell({ rowId: row.id, colKey: col.id });
//                                                             setEditValue(cellValue);
//                                                         }}
//                                                     >
//                                                         {isEditing ? (
//                                                             <input
//                                                                 type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
//                                                                 value={editValue}
//                                                                 autoFocus
//                                                                 onChange={(e) => setEditValue(e.target.value)}
//                                                                 onBlur={() => handleCellBlur(row.id, col.id, cellValue)}
//                                                                 onKeyDown={(e) => {
//                                                                     if (e.key === 'Enter') handleCellBlur(row.id, col.id, cellValue);
//                                                                     if (e.key === 'Escape') setEditingCell(null);
//                                                                 }}
//                                                                 className="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-1.5 text-xs text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
//                                                             />
//                                                         ) : (
//                                                             <div className="cursor-pointer hover:bg-slate-800/40 p-1 rounded transition select-none min-h-[20px] flex items-center">
//                                                                 {cellValue || <span className="text-slate-600 italic">فارغ</span>}
//                                                             </div>
//                                                         )}
//                                                     </td>
//                                                 );
//                                             })}

//                                             <td className="p-4 text-left flex items-center justify-end gap-2">
//                                                 <button
//                                                     onClick={() => handleDeleteRow(row.id)}
//                                                     className="p-1.5 bg-slate-950 hover:bg-red-950 rounded-lg text-red-400 hover:text-red-300 transition"
//                                                     title="حذف الصف"
//                                                 >
//                                                     <Trash2 className="w-3.5 h-3.5" />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}

//                                     {rows.length === 0 && (
//                                         <tr>
//                                             <td colSpan={activeTable.columns_definition.length + 1} className="text-center p-8 text-slate-500">
//                                                 لا توجد سجلات مدخلة حتى الآن.
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}

//                     {/* 🎴 2. نمط بطاقات (Grid View) */}
//                     {viewMode === 'grid' && (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {rows.map((row) => (
//                                 <div key={row.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
//                                     <div className="space-y-2.5">
//                                         {activeTable.columns_definition.map((col, idx) => (
//                                             <div key={col.id} className={idx === 0 ? "border-b border-slate-800 pb-2 mb-2" : ""}>
//                                                 <span className="block text-[10px] text-slate-500 font-bold">{col.name}</span>
//                                                 <span className={`text-xs font-semibold ${idx === 0 ? "text-amber-400 text-sm font-black" : "text-slate-300"}`}>
//                                                     {/* التعديل هنا: جلب القيمة بواسطة col.id */}
//                                                     {row.cells_data[col.id] || '-'}
//                                                 </span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-3">
//                                         <button onClick={() => openEditRowModal(row)} className="px-2.5 py-1.5 bg-slate-950 text-blue-400 hover:bg-blue-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition"><Edit3 className="w-3.5 h-3.5" /> تعديل</button>
//                                         <button onClick={() => handleDeleteRow(row.id)} className="px-2.5 py-1.5 bg-slate-950 text-red-400 hover:bg-red-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* 📝 3. نمط القائمة الطولية (List View) */}
//                     {viewMode === 'list' && (
//                         <div className="space-y-3">
//                             {rows.map((row) => (
//                                 <div key={row.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center justify-between transition">
//                                     <div className="flex flex-wrap gap-6 items-center text-xs">
//                                         {activeTable.columns_definition.map((col) => (
//                                             <div key={col.id} className="flex gap-1">
//                                                 <span className="text-slate-500 font-bold">{col.name}: </span>
//                                                 {/* التعديل هنا: جلب القيمة بواسطة col.id */}
//                                                 <span className="text-slate-300 font-medium">{row.cells_data[col.id] || '-'}</span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <div className="flex gap-2">
//                                         <button onClick={() => openEditRowModal(row)} className="p-1.5 bg-slate-950 text-blue-400 hover:bg-slate-800 rounded-lg transition"><Edit3 className="w-3.5 h-3.5" /></button>
//                                         <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 bg-slate-950 text-red-400 hover:bg-red-950 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* 📥 النافذة المنبثقة: إضافة أو تعديل صف */}
//             {isRowModalOpen && activeTable && (
//                 <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
//                         <div className="flex justify-between items-center border-b border-slate-800 pb-3">
//                             <h3 className="text-sm font-black text-amber-500">
//                                 {editingRow ? `📝 تعديل السجل المختار` : `📥 إضافة سجل جديد إلى: ${activeTable.name}`}
//                             </h3>
//                             <button onClick={() => setIsRowModalOpen(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
//                         </div>

//                         <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
//                             {activeTable.columns_definition.map((col) => (
//                                 <div key={col.id}>
//                                     <label className="block text-xs font-bold text-slate-400 mb-1">{col.name}</label>
//                                     <input
//                                         type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
//                                         // التعديل هنا: ربط الـ value بـ col.id
//                                         value={rowData[col.id] || ''}
//                                         onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })}
//                                         className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
//                                         placeholder={`أدخل قيمة حقل ${col.name}...`}
//                                     />
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
//                             <button onClick={() => setIsRowModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">إلغاء</button>
//                             <button onClick={handleSaveRow} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1"><Save className="w-4 h-4" /> حفظ البيانات</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ⚙️ النافذة المنبثقة: إعدادات وهيكل الأعمدة */}
//             {isSettingsModalOpen && activeTable && (
//                 <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
//                         <div className="flex justify-between items-center border-b border-slate-800 pb-3">
//                             <h3 className="text-sm font-black text-amber-500">⚙️ مهندس الأعمدة وهيكل جدول ({activeTable.name})</h3>
//                             <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
//                         </div>

//                         <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
//                             <span className="block text-[10px] text-slate-500 font-bold">➕ إضافة حقل جديد للجدول</span>
//                             <div className="flex flex-col sm:flex-row gap-2">
//                                 <input
//                                     type="text"
//                                     placeholder="اسم الحقل (مثال: رقم القضية)..."
//                                     value={newColumnName}
//                                     onChange={(e) => setNewColumnName(e.target.value)}
//                                     className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
//                                 />
//                                 <select
//                                     value={newColumnType}
//                                     onChange={(e) => setNewColumnType(e.target.value)}
//                                     className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 focus:outline-none"
//                                 >
//                                     <option value="text">نص ذكي</option>
//                                     <option value="number">أرقام / مبالغ</option>
//                                     <option value="date">تاريخ ووقت</option>
//                                 </select>
//                                 <button
//                                     onClick={handleAddColumnStructure}
//                                     className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-black transition"
//                                 >
//                                     إضافة حقل
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <span className="block text-[10px] text-slate-400 font-bold">الأعمدة المعتمدة (انقر مرتين على الاسم لتعديله، أو اسحب من ☰ للترتيب):</span>
//                             <div className="max-h-[35vh] overflow-y-auto space-y-2 pr-1">
//                                 {manageColumns.map((col, index) => (
//                                     <div
//                                         key={col.id}
//                                         draggable
//                                         onDragStart={() => handleDragStart(index)}
//                                         onDragOver={(e) => handleDragOver(e, index)}
//                                         onDragEnd={handleDragEnd}
//                                         className={`flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border transition-all duration-200 ${draggedColIndex === index
//                                             ? 'border-amber-500/50 bg-slate-900/80 opacity-50 scale-[0.98]'
//                                             : 'border-slate-800/80 hover:border-slate-700'
//                                             }`}
//                                     >
//                                         <div className="flex items-center gap-3 text-xs w-full">
//                                             <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 font-bold px-1 py-2 text-sm select-none">
//                                                 ☰
//                                             </div>

//                                             <div className="flex items-center gap-2 flex-1">
//                                                 {editingColumnId === col.id ? (
//                                                     <input
//                                                         type="text"
//                                                         defaultValue={col.name}
//                                                         autoFocus
//                                                         onBlur={(e) => handleRenameColumn(col.id, e.target.value)}
//                                                         onKeyDown={(e) => {
//                                                             if (e.key === 'Enter') handleRenameColumn(col.id, e.target.value);
//                                                             if (e.key === 'Escape') setEditingColumnId(null);
//                                                         }}
//                                                         className="bg-slate-900 text-amber-400 font-bold text-xs px-2 py-1 rounded border border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full max-w-[150px]"
//                                                     />
//                                                 ) : (
//                                                     <span
//                                                         onDoubleClick={() => setEditingColumnId(col.id)}
//                                                         className="text-slate-200 font-bold cursor-pointer hover:text-amber-400 transition-colors duration-150 select-none"
//                                                         title="انقر مرتين لتعديل الاسم"
//                                                     >
//                                                         {col.name}
//                                                     </span>
//                                                 )}
//                                                 <span className="px-2 py-0.5 bg-slate-900 text-slate-500 rounded text-[10px]">
//                                                     {col.type === 'text' ? 'نص' : col.type === 'number' ? 'رقم' : 'تاريخ'}
//                                                 </span>
//                                             </div>
//                                         </div>

//                                         <button
//                                             onClick={() => handleRemoveColumnStructure(col.id)}
//                                             className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/20 transition flex-shrink-0"
//                                             title="حذف العمود"
//                                         >
//                                             <Trash2 className="w-3.5 h-3.5" />
//                                         </button>
//                                     </div>
//                                 ))}

//                                 {manageColumns.length === 0 && (
//                                     <p className="text-center text-xs text-slate-600 py-4">لا توجد أعمدة في هذا الجدول حالياً.</p>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
//                             <button onClick={() => setIsSettingsModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">إلغاء</button>
//                             <button onClick={handleSaveChangesStructure} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1"><Save className="w-4 h-4" /> حفظ التغييرات</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { dynamicService } from '@/services/dynamicService';
import { Plus, Table, LayoutGrid, FileText, Save, Trash2, Settings, X, Link, Paperclip, ChevronDown, ListPlus, Search, Filter, RefreshCw } from 'lucide-react';

export default function DynamicSectionPage() {
    const { id: sectionId } = useParams();
    const [tables, setTables] = useState([]);
    const [activeTable, setActiveTable] = useState(null);
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]); 
    const [viewMode, setViewMode] = useState('table');

    // حالات النوافذ المنبثقة (Modals)
    const [isRowModalOpen, setIsRowModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const [editingRow, setEditingRow] = useState(null); 
    const [rowData, setRowData] = useState({});

    // إدارة الأعمدة وهيكل الجدول
    const [manageColumns, setManageColumns] = useState([]);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnType, setNewColumnType] = useState('text');
    
    // إعدادات الحقول المتقدمة
    const [dropdownOptions, setDropdownOptions] = useState([]);
    const [newOptionInput, setNewOptionInput] = useState('');
    const [selectedRelationTableId, setSelectedRelationTableId] = useState('');

    // تتبع الخلية النشطة للتعديل داخل الجدول
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState("");

    // حالات محرك البحث والفلترة الذكي
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterColumn, setSelectedFilterColumn] = useState('');
    const [filterOperator, setFilterOperator] = useState('contains'); 
    const [filterValue, setFilterValue] = useState('');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');

    // تتبع حالة ترتيب الحقول بالسحب والإفلات
    const [draggedColIndex, setDraggedColIndex] = useState(null);

    useEffect(() => {
        if (sectionId) {
            loadSectionContent();
        }
    }, [sectionId]);

    // محرك الفلترة والتصفية الفوري
    useEffect(() => {
        let result = [...rows];

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            result = result.filter(row => {
                return Object.values(row.cells_data).some(val => 
                    String(val).toLowerCase().includes(term)
                );
            });
        }

        if (selectedFilterColumn) {
            const column = activeTable?.columns_definition.find(c => c.id === selectedFilterColumn);
            
            if (column) {
                result = result.filter(row => {
                    const cellValue = row.cells_data[selectedFilterColumn];
                    
                    if (column.type === 'text' || column.type === 'dropdown' || column.type === 'relation' || column.type === 'attachment') {
                        if (!filterValue) return true;
                        return String(cellValue || '').toLowerCase().includes(String(filterValue).toLowerCase());
                    }
                    
                    if (column.type === 'number') {
                        if (!filterValue) return true;
                        const numCell = Number(cellValue || 0);
                        const numFilter = Number(filterValue);
                        if (filterOperator === 'gt') return numCell > numFilter;
                        if (filterOperator === 'lt') return numCell < numFilter;
                        if (filterOperator === 'eq') return numCell === numFilter;
                    }

                    if (column.type === 'date') {
                        if (!filterDateStart && !filterDateEnd) return true;
                        const cellDate = new Date(cellValue);
                        if (isNaN(cellDate.getTime())) return false; 
                        
                        if (filterDateStart && filterDateEnd) {
                            return cellDate >= new Date(filterDateStart) && cellDate <= new Date(filterDateEnd);
                        }
                        if (filterDateStart) return cellDate >= new Date(filterDateStart);
                        if (filterDateEnd) return cellDate <= new Date(filterDateEnd);
                    }

                    return true;
                });
            }
        }

        setFilteredRows(result);
    }, [searchTerm, selectedFilterColumn, filterOperator, filterValue, filterDateStart, filterDateEnd, rows, activeTable]);

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
            setFilteredRows(rowsData);
        } catch (error) {
            console.error("خطأ في جلب الصفوف:", error);
        }
    };

    const handleTableChange = (table) => {
        setActiveTable(table);
        setViewMode(table.view_mode || 'table');
        resetFilters();
        loadTableRows(table.id);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedFilterColumn('');
        setFilterOperator('contains');
        setFilterValue('');
        setFilterDateStart('');
        setFilterDateEnd('');
    };

    // توابع السحب والإفلات لترتيب الحقول
    const handleDragStart = (index) => setDraggedColIndex(index);
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
    const handleDragEnd = () => setDraggedColIndex(null);

    // --- إدارة الصفوف ---
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
            } else {
                await dynamicService.addRow(activeTable.id, rowData);
            }
            setIsRowModalOpen(false);
            if (activeTable?.id) await loadTableRows(activeTable.id);
        } catch (error) {
            console.error("خطأ أثناء الحفظ:", error);
        }
    };

    const handleDeleteRow = async (rowId) => {
        if (confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) {
            try {
                await dynamicService.deleteRow(rowId);
                if (activeTable?.id) await loadTableRows(activeTable.id);
            } catch (error) {
                console.error("خطأ في حذف السجل:", error);
            }
        }
    };

    // --- إدارة الأعمدة المتقدمة ---
    const openSettingsModal = () => {
        setManageColumns([...activeTable.columns_definition]);
        setDropdownOptions([]);
        setSelectedRelationTableId('');
        setIsSettingsModalOpen(true);
    };

    const handleAddDropdownOption = () => {
        if (!newOptionInput.trim()) return;
        setDropdownOptions([...dropdownOptions, newOptionInput.trim()]);
        setNewOptionInput('');
    };

    const handleAddColumnStructure = () => {
        if (!newColumnName.trim()) return;
        
        const newCol = {
            id: `col_${Date.now()}`,
            name: newColumnName.trim(),
            type: newColumnType,
            options: newColumnType === 'dropdown' ? dropdownOptions : undefined,
            relatedTableId: newColumnType === 'relation' ? selectedRelationTableId : undefined
        };
        
        setManageColumns([...manageColumns, newCol]);
        setNewColumnName('');
        setDropdownOptions([]);
        setSelectedRelationTableId('');
    };

    const handleRemoveColumnStructure = (colId) => {
        setManageColumns(manageColumns.filter(c => c.id !== colId));
    };

    const handleSaveChangesStructure = async () => {
        try {
            await dynamicService.updateTable(activeTable.id, activeTable.name, manageColumns, viewMode);
            setIsSettingsModalOpen(false);
            alert("تم تحديث هيكل الجدول بنجاح!");
            loadSectionContent(); 
        } catch (error) {
            console.error("خطأ أثناء تحديث الهيكل:", error);
        }
    };

    const handleCellBlur = async (rowId, colId, originalValue) => {
        if (editValue === originalValue) {
            setEditingCell(null);
            return;
        }
        try {
            const currentRow = rows.find(r => r.id === rowId);
            const updatedCellsData = { ...currentRow.cells_data, [colId]: editValue };
            await dynamicService.updateRow(rowId, updatedCellsData);
            setRows(prevRows => prevRows.map(row => row.id === rowId ? { ...row, cells_data: updatedCellsData } : row));
        } catch (error) {
            console.error("خطأ التعديل الفوري:", error);
        } finally {
            setEditingCell(null); 
        }
    };

    const activeFilterColumnObject = activeTable?.columns_definition.find(c => c.id === selectedFilterColumn);

    if (tables.length === 0) {
        return (
            <div className="md:mr-64 p-8 text-center text-slate-400 min-h-screen bg-[#0B0F19]" dir="rtl">
                <p className="text-lg font-semibold text-slate-300">هذا القسم لا يحتوي على جداول حالياً.</p>
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
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTable?.id === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
                    >
                        📊 {tab.name}
                    </button>
                ))}
            </div>

            {activeTable && (
                <div>
                    {/* شريط التحكم الرئيسي */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div>
                            <h1 className="text-xl font-black text-slate-200">{activeTable.name}</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><Table className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><FileText className="w-4 h-4" /></button>
                            </div>
                            <button onClick={openSettingsModal} className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"><Settings className="w-4 h-4" /> هيكلة الحقول المتقدمة</button>
                            <button onClick={openAddRowModal} className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg"><Plus className="w-4 h-4" /> إضافة سجل جديد</button>
                        </div>
                    </div>

                    {/* 🔍 محرك الفلترة والبحث الذكي الديناميكي */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                                <Search className="w-3.5 h-3.5" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="بحث شامل في كل الحقول والمستندات..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                            />
                        </div>

                        <div className="flex gap-2 col-span-1 md:col-span-2 items-center flex-wrap md:flex-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
                                <Filter className="w-3.5 h-3.5 text-amber-500" />
                                <span>تصفية بحسب:</span>
                            </div>
                            
                            <select 
                                value={selectedFilterColumn} 
                                onChange={(e) => { setSelectedFilterColumn(e.target.value); setFilterValue(''); }}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                            >
                                <option value="">إختر الحقل...</option>
                                {activeTable.columns_definition.map(col => (
                                    <option key={col.id} value={col.id}>{col.name}</option>
                                ))}
                            </select>

                            {selectedFilterColumn && activeFilterColumnObject && (
                                <div className="flex gap-1.5 items-center w-full">
                                    {activeFilterColumnObject.type === 'number' && (
                                        <select 
                                            value={filterOperator} 
                                            onChange={(e) => setFilterOperator(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-amber-500 font-bold focus:outline-none"
                                        >
                                            <option value="gt">أكبر من (&gt;)</option>
                                            <option value="lt">أصغر من (&lt;)</option>
                                            <option value="eq">يساوي (=)</option>
                                        </select>
                                    )}

                                    {activeFilterColumnObject.type === 'date' ? (
                                        <div className="flex items-center gap-1 w-full">
                                            <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 max-w-[130px]" />
                                            <span className="text-[10px] text-slate-500">إلى</span>
                                            <input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 max-w-[130px]" />
                                        </div>
                                    ) : activeFilterColumnObject.type === 'dropdown' ? (
                                        <select 
                                            value={filterValue} 
                                            onChange={(e) => setFilterValue(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-amber-400"
                                        >
                                            <option value="">كل الخيارات...</option>
                                            {activeFilterColumnObject.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input 
                                            type="text" 
                                            placeholder="اكتب قيمة التصفية..." 
                                            value={filterValue}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                                        />
                                    )}
                                </div>
                            )}

                            {(searchTerm || selectedFilterColumn) && (
                                <button onClick={resetFilters} className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition text-[10px] flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> مسح
                                </button>
                            )}
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
                                        <th className="p-4 text-left">الخيارات</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-slate-300 divide-y divide-slate-800/50">
                                    {filteredRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeTable.columns_definition.length + 1} className="p-8 text-center text-slate-500 italic">لا توجد سجلات مطابقة لخيارات البحث الحالية.</td>
                                        </tr>
                                    ) : (
                                        filteredRows.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-850/40 transition">
                                                {activeTable.columns_definition.map((col) => {
                                                    const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.id;
                                                    const cellValue = row.cells_data[col.id] || "";

                                                    return (
                                                        <td key={col.id} className="p-4 font-medium min-w-[150px]" onDoubleClick={() => { setEditingCell({ rowId: row.id, colKey: col.id }); setEditValue(cellValue); }}>
                                                            {isEditing ? (
                                                                col.type === 'dropdown' ? (
                                                                    <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleCellBlur(row.id, col.id, cellValue)} className="w-full bg-slate-950 border border-amber-500 text-xs text-amber-400 p-1 rounded-xl">
                                                                        <option value="">إختر...</option>
                                                                        {col.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                                    </select>
                                                                ) : (
                                                                    <input
                                                                        type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                                                        value={editValue} autoFocus onChange={(e) => setEditValue(e.target.value)}
                                                                        onBlur={() => handleCellBlur(row.id, col.id, cellValue)}
                                                                        className="w-full bg-slate-950 border border-amber-500 rounded-xl p-1.5 text-xs text-amber-400 focus:outline-none"
                                                                    />
                                                                )
                                                            ) : (
                                                                <div className="cursor-pointer hover:bg-slate-800 p-1 rounded min-h-[20px] flex items-center gap-1.5">
                                                                    {col.type === 'relation' && <Link className="w-3 h-3 text-cyan-400" />}
                                                                    {col.type === 'attachment' && <Paperclip className="w-3 h-3 text-emerald-400" />}
                                                                    {col.type === 'dropdown' && cellValue && <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800 text-[10px]">{cellValue}</span>}
                                                                    {col.type !== 'dropdown' && (cellValue || <span className="text-slate-600 italic">فارغ</span>)}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="p-4 text-left flex items-center justify-end gap-2">
                                                    <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 bg-slate-950 hover:bg-red-950 rounded-lg text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 🖥️ 2. نمط البطاقات (Grid View) */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRows.map((row) => (
                                <div key={row.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                                    <div className="space-y-2.5">
                                        {activeTable.columns_definition.map((col, idx) => (
                                            <div key={col.id} className={idx === 0 ? "border-b border-slate-800 pb-2 mb-2" : ""}>
                                                <span className="block text-[10px] text-slate-500 font-bold">{col.name}</span>
                                                <span className={`text-xs font-semibold flex items-center gap-1.5 ${idx === 0 ? "text-amber-400 text-sm font-black" : "text-slate-300"}`}>
                                                    {col.type === 'relation' && <Link className="w-3 h-3 text-cyan-400" />}
                                                    {col.type === 'attachment' && <Paperclip className="w-3 h-3 text-emerald-400" />}
                                                    {row.cells_data[col.id] || '-'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-3">
                                        <button onClick={() => openEditRowModal(row)} className="px-2.5 py-1.5 bg-slate-950 text-blue-400 rounded-lg text-xs font-bold transition">تعديل</button>
                                        <button onClick={() => handleDeleteRow(row.id)} className="px-2.5 py-1.5 bg-slate-950 text-red-400 rounded-lg text-xs font-bold transition">حذف</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 🖥️ 3. نمط القائمة المصلح والمطور (List View) */}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            {filteredRows.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800 italic">لا توجد مستندات أو سجلات تطابق البحث الحالي.</div>
                            ) : (
                                filteredRows.map((row) => {
                                    // نعتبر أول حقل في الجدول كعنوان رئيسي لسطر القائمة
                                    const primaryCol = activeTable.columns_definition[0];
                                    const primaryValue = row.cells_data[primaryCol?.id] || "سجل غير معنون";

                                    return (
                                        <div key={row.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 hover:bg-slate-850/60 p-4 rounded-xl border border-slate-800 transition-all gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-amber-500">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-black text-slate-200">{primaryValue}</h3>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                        {activeTable.columns_definition.slice(1, 4).map((col) => (
                                                            <span key={col.id} className="text-[10px] text-slate-500 font-medium">
                                                                {col.name}: <strong className="text-slate-400 font-semibold">{row.cells_data[col.id] || '-'}</strong>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 border-slate-800/50 pt-2 sm:pt-0">
                                                <button onClick={() => openEditRowModal(row)} className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-blue-400 rounded-xl text-[11px] font-bold transition">تعديل</button>
                                                <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 bg-slate-950 hover:bg-red-950 text-red-400 rounded-xl transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* [بقيت النوافذ المنبثقة للـ Row والـ Settings مدمجة بشكل سليم لضمان ثبات المنظومة] */}
            {isRowModalOpen && activeTable && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-amber-500">{editingRow ? `📝 تعديل سجل` : `📥 إضافة سجل جديد`}</h3>
                            <button onClick={() => setIsRowModalOpen(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {activeTable.columns_definition.map((col) => (
                                <div key={col.id}>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">{col.name}</label>
                                    {col.type === 'dropdown' ? (
                                        <select value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200">
                                            <option value="">إختر خياراً...</option>
                                            {col.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : col.type === 'attachment' ? (
                                        <div className="w-full bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500/50 transition">
                                            <input type="file" className="hidden" id={`file_${col.id}`} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.files[0]?.name })} />
                                            <label htmlFor={`file_${col.id}`} className="cursor-pointer text-xs text-slate-500 flex flex-col items-center gap-1.5">
                                                <Paperclip className="w-5 h-5 text-slate-400" />
                                                {rowData[col.id] || "اضغط لرفع ملف أو مستند للمكتب (PDF, DOCX)"}
                                            </label>
                                        </div>
                                    ) : col.type === 'relation' ? (
                                        <select value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200">
                                            <option value="">ابحث واختر من الجدول المترابط...</option>
                                            <option value="سجل مرتبط رقم 1">سجل مرتبط تجريبي 1</option>
                                            <option value="سجل مرتبط رقم 2">سجل مرتبط تجريبي 2</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                            value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-amber-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                            <button onClick={() => setIsRowModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">إلغاء</button>
                            <button onClick={handleSaveRow} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black"><Save className="w-4 h-4" /> حفظ</button>
                        </div>
                    </div>
                </div>
            )}

            {isSettingsModalOpen && activeTable && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-amber-500">⚙️ باني مخطط الحقول المتقدم (Dynamic Schema Builder)</h3>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                            <span className="block text-[10px] text-amber-500 font-bold">➕ إضافة حقل ذكي جديد وتحديد المنطق:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input type="text" placeholder="اسم الحقل (مثال: أتعاب القضية)..." value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none" />
                                <select value={newColumnType} onChange={(e) => setNewColumnType(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 focus:outline-none">
                                    <option value="text">نص ذكي</option>
                                    <option value="number">أرقام / مبالغ</option>
                                    <option value="date">تاريخ ووقت</option>
                                    <option value="dropdown">قائمة منسدلة (Dropdown)</option>
                                    <option value="attachment">حقل مرفقات وملفات</option>
                                    <option value="relation">حقل علاقة (Relation 🔗)</option>
                                </select>
                                <button onClick={handleAddColumnStructure} className="bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-black transition">إضافة الحقل للمخطط</button>
                            </div>

                            {newColumnType === 'dropdown' && (
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                                    <label className="block text-[10px] text-slate-400 font-bold">خيارات القائمة المنسدلة:</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="مثال: قيد التنفيذ، منتهية..." value={newOptionInput} onChange={(e) => setNewOptionInput(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs" />
                                        <button onClick={handleAddDropdownOption} className="bg-slate-800 px-3 text-xs rounded-lg text-slate-300 hover:bg-slate-700"><ListPlus className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {dropdownOptions.map((opt, idx) => <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{opt}</span>)}
                                    </div>
                                </div>
                            )}

                            {newColumnType === 'relation' && (
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                                    <label className="block text-[10px] text-cyan-400 font-bold">ربط علاقة مع جدول آخر بالمنظومة:</label>
                                    <select value={selectedRelationTableId} onChange={(e) => setSelectedRelationTableId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300">
                                        <option value="">إختر الجدول المستهدف بالربط التلقائي...</option>
                                        {tables.filter(t => t.id !== activeTable.id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <span className="block text-[10px] text-slate-400 font-bold">مخطط الحقول الحالي للجدول:</span>
                            <div className="max-h-[30vh] overflow-y-auto space-y-2">
                                {manageColumns.map((col, index) => (
                                    <div key={col.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-3 text-xs w-full">
                                            <div className="cursor-grab text-slate-600 font-bold">☰</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-200 font-bold">{col.name}</span>
                                                <span className="px-2 py-0.5 bg-slate-900 text-slate-500 rounded text-[10px]">{col.type}</span>
                                                {col.type === 'dropdown' && <span className="text-[9px] text-amber-500 font-bold">({col.options?.length} خيارات)</span>}
                                                {col.type === 'relation' && <span className="text-[9px] text-cyan-400 font-bold">(مربوط 🔗)</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveColumnStructure(col.id)} className="text-red-500 hover:bg-red-950/20 p-2 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                            <button onClick={() => setIsSettingsModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">إلغاء</button>
                            <button onClick={handleSaveChangesStructure} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black"><Save className="w-4 h-4" /> حفظ التغييرات الهيكلية</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}