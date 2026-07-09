// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import { dynamicService } from '@/services/dynamicService';
// import GlobalDocumentGenerator from '@/components/GlobalDocumentGenerator';
// import { Plus, Table, Edit, LayoutGrid, Save, Trash2, Settings, X, FileText, Link, Paperclip, ChevronDown, ListPlus, Search, Filter, RefreshCw, ExternalLink, Loader2, Calendar, Wand2 } from 'lucide-react';

// export default function DynamicSectionPage() {
//     const { id: sectionId } = useParams();
//     const [tables, setTables] = useState([]);
//     const [activeTable, setActiveTable] = useState(null);
//     const [rows, setRows] = useState([]);
//     const [filteredRows, setFilteredRows] = useState([]);
//     const [viewMode, setViewMode] = useState('table');

//     // مخزن لبيانات الجداول الأخرى لإدارة العلاقات الذكية
//     const [relationRowsMap, setRelationRowsMap] = useState({});

//     // حالة تتبع رفع الملفات (الحقل الحالي الذي يتم رفعه ونسبة التحميل أو الحالة)
//     const [uploadingField, setUploadingField] = useState(null);

//     // حالات النوافذ المنبثقة (Modals)
//     const [isRowModalOpen, setIsRowModalOpen] = useState(false);
//     const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

//     const [editingRow, setEditingRow] = useState(null);
//     const [rowData, setRowData] = useState({});

//     // إدارة الأعمدة وهيكل الجدول
//     const [manageColumns, setManageColumns] = useState([]);
//     const [newColumnName, setNewColumnName] = useState('');
//     const [newColumnType, setNewColumnType] = useState('text');

//     // إعدادات الحقول المتقدمة
//     const [dropdownOptions, setDropdownOptions] = useState([]);
//     const [newOptionInput, setNewOptionInput] = useState('');
//     const [selectedRelationTableId, setSelectedRelationTableId] = useState('');

//     // تتبع الخلية النشطة للتعديل داخل الجدول
//     const [editingCell, setEditingCell] = useState(null);
//     const [editValue, setEditValue] = useState("");

//     // حالات محرك البحث والفلترة الذكي
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedFilterColumn, setSelectedFilterColumn] = useState('');
//     const [filterOperator, setFilterOperator] = useState('contains');
//     const [filterValue, setFilterValue] = useState('');
//     const [filterDateStart, setFilterDateStart] = useState('');
//     const [filterDateEnd, setFilterDateEnd] = useState('');

//     // تتبع حالة ترتيب الحقول بالسحب والإفلات
//     const [draggedColIndex, setDraggedColIndex] = useState(null);

//     useEffect(() => {
//         if (sectionId) {
//             loadSectionContent();
//         }
//     }, [sectionId]);

//     // محرك الفلترة والتصفية الفوري
//     useEffect(() => {
//         let result = [...rows];

//         if (searchTerm.trim() !== '') {
//             const term = searchTerm.toLowerCase();
//             result = result.filter(row => {
//                 return Object.values(row.cells_data).some(val =>
//                     String(val).toLowerCase().includes(term)
//                 );
//             });
//         }

//         if (selectedFilterColumn) {
//             const column = activeTable?.columns_definition.find(c => c.id === selectedFilterColumn);

//             if (column) {
//                 result = result.filter(row => {
//                     const cellValue = row.cells_data[selectedFilterColumn];

//                     if (column.type === 'text' || column.type === 'dropdown' || column.type === 'relation' || column.type === 'attachment') {
//                         if (!filterValue) return true;
//                         return String(cellValue || '').toLowerCase().includes(String(filterValue).toLowerCase());
//                     }

//                     if (column.type === 'number') {
//                         if (!filterValue) return true;
//                         const numCell = Number(cellValue || 0);
//                         const numFilter = Number(filterValue);
//                         if (filterOperator === 'gt') return numCell > numFilter;
//                         if (filterOperator === 'lt') return numCell < numFilter;
//                         if (filterOperator === 'eq') return numCell === numFilter;
//                     }

//                     if (column.type === 'date') {
//                         if (!filterDateStart && !filterDateEnd) return true;
//                         const cellDate = new Date(cellValue);
//                         if (isNaN(cellDate.getTime())) return false;

//                         if (filterDateStart && filterDateEnd) {
//                             return cellDate >= new Date(filterDateStart) && cellDate <= new Date(filterDateEnd);
//                         }
//                         if (filterDateStart) return cellDate >= new Date(filterDateStart);
//                         if (filterDateEnd) return cellDate <= new Date(filterDateEnd);
//                     }

//                     return true;
//                 });
//             }
//         }

//         setFilteredRows(result);
//     }, [searchTerm, selectedFilterColumn, filterOperator, filterValue, filterDateStart, filterDateEnd, rows, activeTable]);

//     const loadSectionContent = async () => {
//         try {
//             const tablesData = await dynamicService.getTablesBySection(sectionId);
//             setTables(tablesData);
//             if (tablesData.length > 0) {
//                 const currentActive = tablesData.find(t => t.id === activeTable?.id) || tablesData[0];
//                 setActiveTable(currentActive);
//                 setViewMode(currentActive.view_mode || 'table');
//                 loadTableRows(currentActive.id);
//                 loadRequiredRelations(currentActive, tablesData);
//             }
//         } catch (error) {
//             console.error("خطأ في جلب المحتويات:", error);
//         }
//     };

//     const loadTableRows = async (tableId) => {
//         try {
//             const rowsData = await dynamicService.getRowsByTable(tableId);
//             setRows(rowsData);
//             setFilteredRows(rowsData);
//         } catch (error) {
//             console.error("خطأ في جلب الصفوف:", error);
//         }
//     };

//     const loadRequiredRelations = async (currentTable, allTables) => {
//         const relationCols = currentTable.columns_definition.filter(col => col.type === 'relation' && col.relatedTableId);

//         const updatedMap = { ...relationRowsMap };
//         for (const col of relationCols) {
//             if (!updatedMap[col.relatedTableId]) {
//                 try {
//                     const rRows = await dynamicService.getRowsByTable(col.relatedTableId);
//                     updatedMap[col.relatedTableId] = rRows;
//                 } catch (err) {
//                     console.error(`خطأ في جلب بيانات الجدول المترابط ${col.relatedTableId}:`, err);
//                 }
//             }
//         }
//         setRelationRowsMap(updatedMap);
//     };

//     const handleTableChange = (table) => {
//         setActiveTable(table);
//         setViewMode(table.view_mode || 'table');
//         resetFilters();
//         loadTableRows(table.id);
//         loadRequiredRelations(table, tables);
//     };

//     const resetFilters = () => {
//         setSearchTerm('');
//         setSelectedFilterColumn('');
//         setFilterOperator('contains');
//         setFilterValue('');
//         setFilterDateStart('');
//         setFilterDateEnd('');
//     };

//     // معالج رفع الملفات الفعلي وإرساله كـ FormData للـ Backend
//     const handleFileUpload = async (e, colId) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         setUploadingField(colId);
//         try {
//             // نتحقق من وجود الخدمة المخصصة للرفع في دالة الـ service لديك
//             // إذا لم تكن موجودة، يمكنك استخدام axios أو fetch مباشرة هنا لإرسال الـ FormData
//             const response = await dynamicService.uploadAttachment(file);

//             // نفترض أن السيرفر يعيد كائن يحتوي على رابط الملف واسمه الأصلي كالتالي:
//             // response = { url: "https://api.lawfirm.os/uploads/file.pdf", name: "الملف.pdf" }

//             // سنخزن كائن مشفر نصياً أو مجرد الرابط المباشر في خلايا السجل
//             setRowData(prev => ({
//                 ...prev,
//                 [colId]: response.url // أو response.file_path حسب معايير الـ API الخاصة بك
//             }));
//         } catch (error) {
//             console.error("خطأ أثناء رفع المستند:", error);
//             alert("فشل رفع المستند، يرجى التحقق من حجم الملف أو اتصال الشبكة.");
//         } finally {
//             setUploadingField(null);
//         }
//     };

//     // توابع السحب والإفلات لترتيب الحقول
//     const handleDragStart = (index) => setDraggedColIndex(index);
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
//     const handleDragEnd = () => setDraggedColIndex(null);

//     // --- إدارة الصفوف ---
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
//             } else {
//                 await dynamicService.addRow(activeTable.id, rowData);
//             }
//             setIsRowModalOpen(false);
//             if (activeTable?.id) await loadTableRows(activeTable.id);
//         } catch (error) {
//             console.error("خطأ أثناء الحفظ:", error);
//         }
//     };

//     const handleDeleteRow = async (rowId) => {
//         if (confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) {
//             try {
//                 await dynamicService.deleteRow(rowId);
//                 if (activeTable?.id) await loadTableRows(activeTable.id);
//             } catch (error) {
//                 console.error("خطأ في حذف السجل:", error);
//             }
//         }
//     };

//     // --- إدارة الأعمدة المتقدمة ---
//     const openSettingsModal = async () => {
//         setManageColumns([...activeTable.columns_definition]);
//         setDropdownOptions([]);
//         setSelectedRelationTableId('');

//         try {
//             // جلب جميع جداول النظام من كافة الأقسام دون قيد
//             const allSystemTables = await dynamicService.getAllTables();
//             setTables(allSystemTables);
//         } catch (error) {
//             console.error("خطأ أثناء جلب جداول النظام الشاملة للعلاقات:", error);
//         }

//         setIsSettingsModalOpen(true);
//     };
//     const handleAddDropdownOption = () => {
//         if (!newOptionInput.trim()) return;
//         setDropdownOptions([...dropdownOptions, newOptionInput.trim()]);
//         setNewOptionInput('');
//     };

//     const handleAddColumnStructure = () => {
//         if (!newColumnName.trim()) return;

//         const newCol = {
//             id: `col_${Date.now()}`,
//             name: newColumnName.trim(),
//             type: newColumnType,
//             options: newColumnType === 'dropdown' ? dropdownOptions : undefined,
//             relatedTableId: newColumnType === 'relation' ? selectedRelationTableId : undefined
//         };

//         setManageColumns([...manageColumns, newCol]);
//         setNewColumnName('');
//         setDropdownOptions([]);
//         setSelectedRelationTableId('');
//     };

//     const handleRemoveColumnStructure = (colId) => {
//         setManageColumns(manageColumns.filter(c => c.id !== colId));
//     };

//     const handleSaveChangesStructure = async () => {
//         try {
//             await dynamicService.updateTable(activeTable.id, activeTable.name, manageColumns, viewMode);
//             setIsSettingsModalOpen(false);
//             alert("تم تحديث هيكل الجدول بنجاح!");
//             loadSectionContent();
//         } catch (error) {
//             console.error("خطأ أثناء تحديث الهيكل:", error);
//         }
//     };

//     const handleCellBlur = async (rowId, colId, originalValue) => {
//         if (editValue === originalValue) {
//             setEditingCell(null);
//             return;
//         }
//         try {
//             const currentRow = rows.find(r => r.id === rowId);
//             const updatedCellsData = { ...currentRow.cells_data, [colId]: editValue };
//             await dynamicService.updateRow(rowId, updatedCellsData);
//             setRows(prevRows => prevRows.map(row => row.id === rowId ? { ...row, cells_data: updatedCellsData } : row));
//         } catch (error) {
//             console.error("خطأ التعديل الفوري:", error);
//         } finally {
//             setEditingCell(null);
//         }
//     };

//     const getRelationDisplayValue = (relatedTableId, targetRowId) => {
//         if (!relatedTableId || !targetRowId) return "";
//         const targetRows = relationRowsMap[relatedTableId] || [];
//         const foundRow = targetRows.find(r => String(r.id) === String(targetRowId));
//         if (foundRow) {
//             const firstKey = Object.keys(foundRow.cells_data)[0];
//             return foundRow.cells_data[firstKey] || `سجل #${targetRowId}`;
//         }
//         return `تحميل... (#${targetRowId})`;
//     };

//     // دالة مساعدة لاستخراج اسم الملف النظيف من رابط الـ URL المخزن
//     const getFileNameFromUrl = (url) => {
//         if (!url) return "";
//         return url.substring(url.lastIndexOf('/') + 1);
//     };

//     const activeFilterColumnObject = activeTable?.columns_definition.find(c => c.id === selectedFilterColumn);

//     if (tables.length === 0) {
//         return (
//             <div className="md:mr-64 p-8 text-center text-slate-400 min-h-screen bg-[#0B0F19]" dir="rtl">
//                 <p className="text-lg font-semibold text-slate-300">هذا القسم لا يحتوي على جداول حالياً.</p>
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
//                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTable?.id === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
//                     >
//                         📊 {tab.name}
//                     </button>
//                 ))}
//             </div>

//             {activeTable && (
//                 <div>
//                     {/* شريط التحكم الرئيسي */}
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
//                         <div>
//                             <h1 className="text-xl font-black text-slate-200">{activeTable.name}</h1>
//                         </div>
//                         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
//                             <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
//                                 <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><Table className="w-4 h-4" /></button>
//                                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4" /></button>
//                                 <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}><FileText className="w-4 h-4" /></button>
//                                 <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'calendar' ? 'bg-amber-600 text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}><Calendar className="w-3.5 h-3.5" /></button>
//                             </div>
//                             <button onClick={openSettingsModal} className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"><Settings className="w-4 h-4" /> هيكلة الحقول المتقدمة</button>
//                             <button onClick={openAddRowModal} className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg"><Plus className="w-4 h-4" /> إضافة سجل جديد</button>
//                         </div>
//                     </div>

//                     {/* 🔍 محرك الفلترة والبحث الذكي الديناميكي */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
//                         <div className="relative">
//                             <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
//                                 <Search className="w-3.5 h-3.5" />
//                             </span>
//                             <input
//                                 type="text"
//                                 placeholder="بحث شامل في كل الحقول والمستندات..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
//                             />
//                         </div>

//                         <div className="flex gap-2 col-span-1 md:col-span-2 items-center flex-wrap md:flex-nowrap">
//                             <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
//                                 <Filter className="w-3.5 h-3.5 text-amber-500" />
//                                 <span>تصفية بحسب:</span>
//                             </div>

//                             <select
//                                 value={selectedFilterColumn}
//                                 onChange={(e) => { setSelectedFilterColumn(e.target.value); setFilterValue(''); }}
//                                 className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
//                             >
//                                 <option value="">إختر الحقل...</option>
//                                 {activeTable.columns_definition.map(col => (
//                                     <option key={col.id} value={col.id}>{col.name}</option>
//                                 ))}
//                             </select>

//                             {selectedFilterColumn && activeFilterColumnObject && (
//                                 <div className="flex gap-1.5 items-center w-full">
//                                     {activeFilterColumnObject.type === 'number' && (
//                                         <select
//                                             value={filterOperator}
//                                             onChange={(e) => setFilterOperator(e.target.value)}
//                                             className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-amber-500 font-bold focus:outline-none"
//                                         >
//                                             <option value="gt">أكبر من (&gt;)</option>
//                                             <option value="lt">أصغر من (&lt;)</option>
//                                             <option value="eq">يساوي (=)</option>
//                                         </select>
//                                     )}

//                                     {activeFilterColumnObject.type === 'date' ? (
//                                         <div className="flex items-center gap-1 w-full">
//                                             <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 max-w-[130px]" />
//                                             <span className="text-[10px] text-slate-500">إلى</span>
//                                             <input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 max-w-[130px]" />
//                                         </div>
//                                     ) : activeFilterColumnObject.type === 'dropdown' ? (
//                                         <select
//                                             value={filterValue}
//                                             onChange={(e) => setFilterValue(e.target.value)}
//                                             className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-amber-400"
//                                         >
//                                             <option value="">كل الخيارات...</option>
//                                             {activeFilterColumnObject.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
//                                         </select>
//                                     ) : (
//                                         <input
//                                             type="text"
//                                             placeholder="اكتب قيمة التصفية..."
//                                             value={filterValue}
//                                             onChange={(e) => setFilterValue(e.target.value)}
//                                             className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
//                                         />
//                                     )}
//                                 </div>
//                             )}

//                             {(searchTerm || selectedFilterColumn) && (
//                                 <button onClick={resetFilters} className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition text-[10px] flex items-center gap-1">
//                                     <RefreshCw className="w-3 h-3" /> مسح
//                                 </button>
//                             )}
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
//                                         <th className="p-4 text-left">الخيارات</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="text-xs text-slate-300 divide-y divide-slate-800/50">
//                                     {filteredRows.length === 0 ? (
//                                         <tr>
//                                             <td colSpan={activeTable.columns_definition.length + 1} className="p-8 text-center text-slate-500 italic">لا توجد سجلات مطابقة لخيارات البحث الحالية.</td>
//                                         </tr>
//                                     ) : (
//                                         filteredRows.map((row) => (
//                                             <tr key={row.id} className="hover:bg-slate-850/40 transition">
//                                                 {activeTable.columns_definition.map((col) => {
//                                                     const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.id;
//                                                     const cellValue = row.cells_data[col.id] || "";

//                                                     return (
//                                                         <td key={col.id} className="p-4 font-medium min-w-[150px]" onDoubleClick={() => { if (col.type !== 'attachment') { setEditingCell({ rowId: row.id, colKey: col.id }); setEditValue(cellValue); } }}>
//                                                             {isEditing ? (
//                                                                 col.type === 'dropdown' ? (
//                                                                     <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleCellBlur(row.id, col.id, cellValue)} className="w-full bg-slate-950 border border-amber-500 text-xs text-amber-400 p-1 rounded-xl">
//                                                                         <option value="">إختر...</option>
//                                                                         {col.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
//                                                                     </select>
//                                                                 ) : col.type === 'relation' ? (
//                                                                     <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleCellBlur(row.id, col.id, cellValue)} className="w-full bg-slate-950 border border-amber-500 text-xs text-cyan-400 p-1 rounded-xl">
//                                                                         <option value="">اختر السجل المرتبط...</option>
//                                                                         {(relationRowsMap[col.relatedTableId] || []).map((rRow) => {
//                                                                             const firstKey = Object.keys(rRow.cells_data)[0];
//                                                                             return <option key={rRow.id} value={rRow.id}>{rRow.cells_data[firstKey]}</option>;
//                                                                         })}
//                                                                     </select>
//                                                                 ) : (
//                                                                     <input
//                                                                         type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
//                                                                         value={editValue} autoFocus onChange={(e) => setEditValue(e.target.value)}
//                                                                         onBlur={() => handleCellBlur(row.id, col.id, cellValue)}
//                                                                         className="w-full bg-slate-950 border border-amber-500 rounded-xl p-1.5 text-xs text-amber-400 focus:outline-none"
//                                                                     />
//                                                                 )
//                                                             ) : (
//                                                                 <div className="cursor-pointer hover:bg-slate-800 p-1 rounded min-h-[20px] flex items-center gap-1.5">
//                                                                     {col.type === 'relation' && (
//                                                                         <>
//                                                                             <Link className="w-3 h-3 text-cyan-400" />
//                                                                             <span className="text-cyan-400 font-bold underline">
//                                                                                 {getRelationDisplayValue(col.relatedTableId, cellValue) || <span className="text-slate-600 italic">غير مرتبط</span>}
//                                                                             </span>
//                                                                         </>
//                                                                     )}
//                                                                     {col.type === 'attachment' && (
//                                                                         cellValue ? (
//                                                                             <a href={cellValue} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-400 font-bold underline hover:text-emerald-300">
//                                                                                 <Paperclip className="w-3 h-3" />
//                                                                                 <span className="max-w-[120px] truncate">{getFileNameFromUrl(cellValue)}</span>
//                                                                                 <ExternalLink className="w-2.5 h-2.5" />
//                                                                             </a>
//                                                                         ) : <span className="text-slate-650 italic text-[11px]">لا يوجد ملف</span>
//                                                                     )}
//                                                                     {col.type === 'dropdown' && cellValue && <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800 text-[10px]">{cellValue}</span>}
//                                                                     {col.type !== 'dropdown' && col.type !== 'relation' && col.type !== 'attachment' && (cellValue || <span className="text-slate-600 italic">فارغ</span>)}
//                                                                 </div>
//                                                             )}
//                                                         </td>
//                                                     );
//                                                 })}
//                                                 <td className="p-4 text-left flex items-center justify-end gap-2">
//                                                     <button onClick={() => openEditRowModal(row)} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-blue-400 transition">تعديل</button>
//                                                     <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 bg-slate-950 hover:bg-red-950 rounded-lg text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}

//                     {/* 🖥️ 2. نمط البطاقات (Grid View) */}
//                     {viewMode === 'grid' && (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {filteredRows.map((row) => (
//                                 <div key={row.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
//                                     <div className="space-y-2.5">
//                                         {activeTable.columns_definition.map((col, idx) => (
//                                             <div key={col.id} className={idx === 0 ? "border-b border-slate-800 pb-2 mb-2" : ""}>
//                                                 <span className="block text-[10px] text-slate-500 font-bold">{col.name}</span>
//                                                 <span className={`text-xs font-semibold flex items-center gap-1.5 ${idx === 0 ? "text-amber-400 text-sm font-black" : "text-slate-300"}`}>
//                                                     {col.type === 'relation' && (
//                                                         <>
//                                                             <Link className="w-3 h-3 text-cyan-400" />
//                                                             <span className="text-cyan-400 underline">{getRelationDisplayValue(col.relatedTableId, row.cells_data[col.id]) || '-'}</span>
//                                                         </>
//                                                     )}
//                                                     {col.type === 'attachment' && (
//                                                         row.cells_data[col.id] ? (
//                                                             <a href={row.cells_data[col.id]} target="_blank" rel="noreferrer" className="text-emerald-400 underline flex items-center gap-1">
//                                                                 <Paperclip className="w-3 h-3" /> {getFileNameFromUrl(row.cells_data[col.id])}
//                                                             </a>
//                                                         ) : '-'
//                                                     )}
//                                                     {col.type !== 'relation' && col.type !== 'attachment' && (row.cells_data[col.id] || '-')}
//                                                 </span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-3">
//                                         <button onClick={() => openEditRowModal(row)} className="px-2.5 py-1.5 bg-slate-950 text-blue-400 rounded-lg text-xs font-bold transition">تعديل</button>
//                                         <button onClick={() => handleDeleteRow(row.id)} className="px-2.5 py-1.5 bg-slate-950 text-red-400 rounded-lg text-xs font-bold transition">حذف</button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* 🖥️ 3. نمط القائمة المطور (List View) */}
//                     {viewMode === 'list' && (
//                         <div className="space-y-3">
//                             {filteredRows.length === 0 ? (
//                                 <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800 italic">لا توجد مستندات أو سجلات تطابق البحث الحالي.</div>
//                             ) : (
//                                 filteredRows.map((row) => {
//                                     const primaryCol = activeTable.columns_definition[0];
//                                     const primaryValue = row.cells_data[primaryCol?.id] || "سجل غير معنون";

//                                     return (
//                                         <div key={row.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 hover:bg-slate-850/60 p-4 rounded-xl border border-slate-800 transition-all gap-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-amber-500">
//                                                     <FileText className="w-4 h-4" />
//                                                 </div>
//                                                 <div>
//                                                     <h3 className="text-xs font-black text-slate-200">{primaryValue}</h3>
//                                                     <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
//                                                         {activeTable.columns_definition.slice(1, 4).map((col) => (
//                                                             <span key={col.id} className="text-[10px] text-slate-500 font-medium">
//                                                                 {col.name}:{' '}
//                                                                 {col.type === 'attachment' ? (
//                                                                     row.cells_data[col.id] ? (
//                                                                         <a href={row.cells_data[col.id]} target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">{getFileNameFromUrl(row.cells_data[col.id])}</a>
//                                                                     ) : '-'
//                                                                 ) : (
//                                                                     <strong className={col.type === 'relation' ? 'text-cyan-400 underline' : 'text-slate-400 font-semibold'}>
//                                                                         {col.type === 'relation' ? getRelationDisplayValue(col.relatedTableId, row.cells_data[col.id]) || '-' : row.cells_data[col.id] || '-'}
//                                                                     </strong>
//                                                                 )}
//                                                             </span>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 border-slate-800/50 pt-2 sm:pt-0">
//                                                 {/* 📄 إضافة زر توليد مستند ذكي لهذا السجل المحدد */}
//                                                 <GlobalDocumentGenerator
//                                                     activeTable={activeTable}
//                                                     selectedRow={row}
//                                                     triggerButton={
//                                                         <button className="px-2.5 py-1.5 bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-slate-950 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-amber-500/20">
//                                                             <Wand2 className="w-3 h-3" />
//                                                             توليد مستند
//                                                         </button>
//                                                     }
//                                                 />

//                                                 <button onClick={() => openEditRowModal(row)} className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-blue-400 rounded-xl text-[11px] font-bold transition">تعديل</button>
//                                                 <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 bg-slate-950 hover:bg-red-950 text-red-400 rounded-xl transition"><Trash2 className="w-3.5 h-3.5" /></button>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                             )}
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* 📅 4. نمط التقويم القانوني الديناميكي (Calendar View) */}
//             {viewMode === 'calendar' && (
//                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">

//                     {/* أيام الأسبوع الثابتة كـ Header للتقويم */}
//                     <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-2">
//                         <div>الأحد</div><div>الإثنين</div><div>الثلاثاء</div><div>الأربعاء</div><div>الخميس</div><div>الجمعة</div><div>السبت</div>
//                     </div>

//                     {/* عرض المواعيد والجلسات مرتبة زمنياً بناءً على اختيار المحامي */}
//                     <div className="space-y-2 mt-4">
//                         {(() => {
//                             {/* 🔗 استخراج معرفات الحقول المربوطة من الـ Backend */ }
//                             const dateFieldId = activeTable?.calendar_mapping?.date_field;
//                             const titleFieldId = activeTable?.calendar_mapping?.title_field;
//                             const statusFieldId = activeTable?.calendar_mapping?.status_field; // اختياري في حال أضفت ربط للحالة لاحقاً

//                             {/* لو لم يقم المحامي بربط الحقول بعد، نضع حقول افتراضية كـ Fallback لحماية الكود */ }
//                             const finalDateFieldId = dateFieldId || activeTable.columns_definition.find(c => c.type === 'date')?.id;
//                             const finalTitleFieldId = titleFieldId || activeTable.columns_definition[0]?.id;
//                             const finalStatusFieldId = statusFieldId || activeTable.columns_definition.find(c => c.type === 'dropdown')?.id;

//                             return filteredRows
//                                 .filter(row => {
//                                     // التحقق من وجود قيمة داخل حقل التاريخ المربوط
//                                     return finalDateFieldId && !!row.cells_data[finalDateFieldId];
//                                 })
//                                 .sort((a, b) => {
//                                     // ترتيب المواعيد من الأقدم إلى الأحدث أو العكس
//                                     return new Date(a.cells_data[finalDateFieldId]) - new Date(b.cells_data[finalDateFieldId]);
//                                 })
//                                 .map(row => {
//                                     return (
//                                         <div key={row.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850 hover:border-amber-500/40 transition">
//                                             <div className="flex items-center gap-3">
//                                                 {/* عرض التاريخ الديناميكي المربوط */}
//                                                 <div className="text-amber-500 font-mono text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
//                                                     {row.cells_data[finalDateFieldId]}
//                                                 </div>
//                                                 {/* عرض العنوان الديناميكي المربوط (مثل اسم الدعوى) */}
//                                                 <span className="text-xs font-bold text-slate-200">
//                                                     {row.cells_data[finalTitleFieldId] || 'بدون عنوان'}
//                                                 </span>
//                                             </div>

//                                             <div className="flex items-center gap-2">
//                                                 {/* عرض حالة الموعد إذا كانت موجودة ومربوطة */}
//                                                 {finalStatusFieldId && row.cells_data[finalStatusFieldId] && (
//                                                     <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
//                                                         {row.cells_data[finalStatusFieldId]}
//                                                     </span>
//                                                 )}
//                                                 <button
//                                                     onClick={() => openEditRowModal(row)}
//                                                     className="text-[11px] text-blue-400 hover:underline px-2 py-1 rounded hover:bg-blue-500/10 transition"
//                                                 >
//                                                     تعديل
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     );
//                                 });
//                         })()}
//                     </div>
//                 </div>
//             )}
//             {/* 📥 المودال: إضافة وتعديل سجل */}
//             {isRowModalOpen && activeTable && (
//                 <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
//                         <div className="flex justify-between items-center border-b border-slate-800 pb-3">
//                             <h3 className="text-sm font-black text-amber-500">{editingRow ? `📝 تعديل سجل` : `📥 إضافة سجل جديد`}</h3>
//                             <button onClick={() => setIsRowModalOpen(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
//                         </div>
//                         <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                             {activeTable.columns_definition.map((col) => (
//                                 <div key={col.id}>
//                                     <label className="block text-xs font-bold text-slate-400 mb-1">{col.name}</label>
//                                     {col.type === 'dropdown' ? (
//                                         <select value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200">
//                                             <option value="">إختر خياراً...</option>
//                                             {col.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
//                                         </select>
//                                     ) : col.type === 'attachment' ? (
//                                         <div className="w-full bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 text-center relative hover:border-emerald-500/50 transition">
//                                             <input type="file" className="hidden" id={`file_${col.id}`} onChange={(e) => handleFileUpload(e, col.id)} disabled={uploadingField === col.id} />

//                                             {uploadingField === col.id ? (
//                                                 <div className="flex flex-col items-center justify-center gap-2 py-2">
//                                                     <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
//                                                     <span className="text-xs text-slate-400">جاري رفع المستند القانوني وتشفيره بأمان...</span>
//                                                 </div>
//                                             ) : (
//                                                 <label htmlFor={`file_${col.id}`} className="cursor-pointer text-xs text-slate-500 flex flex-col items-center gap-1.5">
//                                                     <Paperclip className="w-5 h-5 text-slate-400" />
//                                                     {rowData[col.id] ? (
//                                                         <span className="text-emerald-400 font-bold max-w-full truncate block px-4">
//                                                             ✓ تم الرفع: {getFileNameFromUrl(rowData[col.id])}
//                                                         </span>
//                                                     ) : "اضغط لرفع ملف أو مستند للمكتب (PDF, DOCX)"}
//                                                 </label>
//                                             )}
//                                         </div>
//                                     ) : col.type === 'relation' ? (
//                                         <select value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-400 font-bold">
//                                             <option value="">ابحث واختر من الجدول المترابط...</option>
//                                             {(relationRowsMap[col.relatedTableId] || []).map((rRow) => {
//                                                 const firstKey = Object.keys(rRow.cells_data)[0];
//                                                 return (
//                                                     <option key={rRow.id} value={rRow.id}>
//                                                         🔗 {rRow.cells_data[firstKey] || `سجل #${rRow.id}`}
//                                                     </option>
//                                                 );
//                                             })}
//                                         </select>
//                                     ) : (
//                                         <input
//                                             type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
//                                             value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })}
//                                             className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-amber-500"
//                                         />
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
//                             <button onClick={() => setIsRowModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">إلغاء</button>
//                             <button onClick={handleSaveRow} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black" disabled={uploadingField !== null}><Save className="w-4 h-4" /> حفظ السجل</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* [باني المخطط المتقدم والـ Settings] */}
//             {isSettingsModalOpen && activeTable && (
//                 <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
//                         <div className="flex justify-between items-center border-b border-slate-800 pb-3">
//                             <h3 className="text-sm font-black text-amber-500">⚙️ باني مخطط الحقول المتقدم (Dynamic Schema Builder)</h3>
//                             <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
//                         </div>

//                         <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
//                             <span className="block text-[10px] text-amber-500 font-bold">➕ إضافة حقل ذكي جديد وتحديد المنطق:</span>
//                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                                 <input type="text" placeholder="اسم الحقل (مثال: أتعاب القضية)..." value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none" />
//                                 <select value={newColumnType} onChange={(e) => setNewColumnType(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 focus:outline-none">
//                                     <option value="text">نص ذكي</option>
//                                     <option value="number">أرقام / مبالغ</option>
//                                     <option value="date">تاريخ ووقت</option>
//                                     <option value="dropdown">قائمة منسدلة (Dropdown)</option>
//                                     <option value="attachment">حقل مرفقات وملفات</option>
//                                     <option value="relation">حقل علاقة (Relation 🔗)</option>
//                                 </select>
//                                 <button onClick={handleAddColumnStructure} className="bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-black transition">إضافة الحقل للمخطط</button>
//                             </div>

//                             {newColumnType === 'dropdown' && (
//                                 <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
//                                     <label className="block text-[10px] text-slate-400 font-bold">خيارات القائمة المنسدلة:</label>
//                                     <div className="flex gap-2">
//                                         <input type="text" placeholder="مثال: قيد التنفيذ، منتهية..." value={newOptionInput} onChange={(e) => setNewOptionInput(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs" />
//                                         <button onClick={handleAddDropdownOption} className="bg-slate-800 px-3 text-xs rounded-lg text-slate-300 hover:bg-slate-700"><ListPlus className="w-3.5 h-3.5" /></button>
//                                     </div>
//                                     <div className="flex flex-wrap gap-1.5 pt-1">
//                                         {dropdownOptions.map((opt, idx) => <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{opt}</span>)}
//                                     </div>
//                                 </div>
//                             )}

//                             {newColumnType === 'relation' && (
//                                 <div className="mt-3 animate-in fade-in duration-200">
//                                     <label className="block text-xs font-bold text-cyan-450 mb-1.5">
//                                         🔗 اختر الجدول المرتبط المستهدف:
//                                     </label>
//                                     <select
//                                         value={selectedRelationTableId}
//                                         onChange={(e) => setSelectedRelationTableId(e.target.value)}
//                                         className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500"
//                                     >
//                                         <option value="">-- اختر جدولاً من القائمة --</option>
//                                         {tables && tables.map((t) => (
//                                             <option key={t.id} value={t.id}>
//                                                 📊 {t.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="space-y-2">
//                             <span className="block text-[10px] text-slate-400 font-bold">مخطط الحقول الحالي للجدول:</span>
//                             <div className="max-h-[30vh] overflow-y-auto space-y-2">
//                                 {manageColumns.map((col, index) => (
//                                     <div key={col.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
//                                         <div className="flex items-center gap-3 text-xs w-full">
//                                             <div className="cursor-grab text-slate-600 font-bold">☰</div>
//                                             <div className="flex items-center gap-2">
//                                                 <span className="text-slate-200 font-bold">{col.name}</span>
//                                                 <span className="px-2 py-0.5 bg-slate-900 text-slate-500 rounded text-[10px]">{col.type}</span>
//                                                 {col.type === 'dropdown' && <span className="text-[9px] text-amber-500 font-bold">({col.options?.length} خيارات)</span>}
//                                                 {col.type === 'relation' && <span className="text-[9px] text-cyan-400 font-bold">(مربوط 🔗)</span>}
//                                             </div>
//                                         </div>
//                                         <button onClick={() => handleRemoveColumnStructure(col.id)} className="text-red-500 hover:bg-red-950/20 p-2 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
//                             {/* 🤖 إضافة زر توليد مستند ذكي لكامل الجدول */}
//                             <GlobalDocumentGenerator
//                                 activeTable={activeTable}
//                                 filteredRows={filteredRows}
//                                 triggerButton={
//                                     <button className="bg-slate-950 text-amber-500 border border-amber-500/30 hover:bg-amber-600 hover:text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg">
//                                         <Wand2 className="w-4 h-4" />
//                                         توليد مستند شامل للجدول
//                                     </button>
//                                 }
//                             />
//                             <button onClick={() => setIsSettingsModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">إلغاء</button>
//                             <button onClick={handleSaveChangesStructure} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black"><Save className="w-4 h-4" /> حفظ التغييرات الهيكلية</button>
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
import apiClient from '@/services/apiClient';
import GlobalDocumentGenerator from '@/components/GlobalDocumentGenerator';
import ClientDocumentsList from '@/components/ClientDocumentsList';
import { Plus, Table, Edit, LayoutGrid, Save, Trash2, Settings, X, FileText, Link, Paperclip, ChevronDown, ListPlus, Search, Filter, RefreshCw, ExternalLink, Loader2, Calendar, Wand2, FolderOpen } from 'lucide-react';

export default function DynamicSectionPage() {
    const { id: sectionId } = useParams();
    const [tables, setTables] = useState([]);
    const [activeTable, setActiveTable] = useState(null);
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [viewMode, setViewMode] = useState('table');

    // مخزن لبيانات الجداول الأخرى لإدارة العلاقات الذكية
    const [relationRowsMap, setRelationRowsMap] = useState({});

    // حالة تتبع رفع الملفات (الحقل الحالي الذي يتم رفعه ونسبة التحميل أو الحالة)
    const [uploadingField, setUploadingField] = useState(null);

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

    // حالة للتحكم في فتح إغلاق مودال أرشيف المستندات الشامل للموكل
    const [isClientDocsModalOpen, setIsClientDocsModalOpen] = useState(false);
    const [selectedClientRowId, setSelectedClientRowId] = useState(null);

    // تتبع حالة ترتيب الحقول بالسحب والإفلات
    const [draggedColIndex, setDraggedColIndex] = useState(null);

    useEffect(() => {
        if (sectionId) {
            loadSectionContent();
        }
    }, [sectionId]);

    // محرك الفلترة والتصفية الفوري ليدعم نصوص ومصفوفات العلاقات Many-to-Many
    useEffect(() => {
        let result = [...rows];

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            result = result.filter(row => {
                return Object.entries(row.cells_data).some(([colId, val]) => {
                    const column = activeTable?.columns_definition.find(c => c.id === colId);
                    if (column?.type === 'relation' && Array.isArray(val)) {
                        return val.some(id => {
                            const name = getRelationDisplayValue(column.relatedTableId, id);
                            return name.toLowerCase().includes(term);
                        });
                    }
                    return String(val || '').toLowerCase().includes(term);
                });
            });
        }

        if (selectedFilterColumn) {
            const column = activeTable?.columns_definition.find(c => c.id === selectedFilterColumn);

            if (column) {
                result = result.filter(row => {
                    const cellValue = row.cells_data[selectedFilterColumn];

                    if (column.type === 'relation') {
                        if (!filterValue) return true;
                        if (Array.isArray(cellValue)) {
                            return cellValue.some(id => {
                                const displayName = getRelationDisplayValue(column.relatedTableId, id);
                                return displayName.toLowerCase().includes(String(filterValue).toLowerCase());
                            });
                        }
                        const displayName = getRelationDisplayValue(column.relatedTableId, cellValue);
                        return displayName.toLowerCase().includes(String(filterValue).toLowerCase());
                    }

                    if (column.type === 'text' || column.type === 'dropdown' || column.type === 'attachment') {
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
                loadRequiredRelations(currentActive, tablesData);
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

    const loadRequiredRelations = async (currentTable, allTables) => {
        const relationCols = currentTable.columns_definition.filter(col => col.type === 'relation' && col.relatedTableId);

        const updatedMap = { ...relationRowsMap };
        for (const col of relationCols) {
            if (!updatedMap[col.relatedTableId]) {
                try {
                    const rRows = await dynamicService.getRowsByTable(col.relatedTableId);
                    updatedMap[col.relatedTableId] = rRows;
                } catch (err) {
                    console.error(`خطأ في جلب بيانات الجدول المترابط ${col.relatedTableId}:`, err);
                }
            }
        }
        setRelationRowsMap(updatedMap);
    };

    const handleTableChange = (table) => {
        setActiveTable(table);
        setViewMode(table.view_mode || 'table');
        resetFilters();
        loadTableRows(table.id);
        loadRequiredRelations(table, tables);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedFilterColumn('');
        setFilterOperator('contains');
        setFilterValue('');
        setFilterDateStart('');
        setFilterDateEnd('');
    };

    const handleFileUpload = async (e, columnId) => {
        const file = e.target.files[0]; // التقاط الملف الحالي
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadingField(columnId);

            // 💡 تم التعديل هنا: توجيه الطلب إلى /attachments ليتطابق مع الـ prefix بالسيرفر
            const response = await apiClient.post('/attachments/upload-general', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // تنظيف الرابط المستلم من السيرفر
            let savedPath = response.data.url;

            // 💡 تنظيف مرن: لحذف النطاق سواء كان localhost أو 127.0.0.1 لضمان سلامة الرابط في النظام
            if (savedPath.includes('/api/v1')) {
                const parts = savedPath.split('/api/v1');
                savedPath = '/api/v1' + parts[1];
            }

            // الكائن الجديد الذي يمثل الملف المرفوع حالياً
            const newAttachment = {
                name: file.name,
                url: savedPath
            };

            // ⭐️ المنطق التراكمي: جلب المرفقات القديمة من الـ State الحالي لمنع مسحها
            let existingAttachments = [];
            const currentFieldValue = rowData[columnId];

            if (currentFieldValue) {
                if (Array.isArray(currentFieldValue)) {
                    // إذا كان الحقل يحتوي بالفعل على مصفوفة ملفات
                    existingAttachments = currentFieldValue;
                } else if (typeof currentFieldValue === 'string') {
                    // إذا كان الحقل يحتوي على رابط نصي واحد (من النظام القديم)، نحوله لمصفوفة لحفظ التاريخ
                    existingAttachments = [{
                        name: getFileNameFromUrl(currentFieldValue) || "مستند سابق",
                        url: currentFieldValue
                    }];
                }
            }

            // 🤝 دمج الملفات القديمة مع الملف الجديد
            const updatedFilesList = [...existingAttachments, newAttachment];

            // تحديث حالة البيانات في الواجهة (rowData) بالمصفوفة المتراكمة الجديدة
            setRowData({
                ...rowData,
                [columnId]: updatedFilesList
            });

            alert("تم إضافة المستند الجديد وتراكمه بالنظام بنجاح.");
        } catch (error) {
            console.error("خطأ أثناء رفع الملف التراكمي:", error);
            alert("فشل رفع الملف، يرجى التحقق من حجم الملف وصلاحية الاتصال.");
        } finally {
            setUploadingField(null);
        }
    };

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

    // --- إدارة الصفوف وتجهيز العلاقات Many-to-Many للـ API والـ UI ---
    const openAddRowModal = () => {
        setEditingRow(null);
        const initialData = {};
        activeTable.columns_definition.forEach((col) => {
            if (col.type === 'relation') {
                initialData[col.id] = [];
            } else {
                initialData[col.id] = '';
            }
        });
        setRowData(initialData);
        setIsRowModalOpen(true);
    };

    const openEditRowModal = (row) => {
        setEditingRow(row);
        const preparedData = { ...row.cells_data };
        activeTable.columns_definition.forEach((col) => {
            if (col.type === 'relation') {
                if (!preparedData[col.id]) {
                    preparedData[col.id] = [];
                } else if (!Array.isArray(preparedData[col.id])) {
                    preparedData[col.id] = [preparedData[col.id]];
                }
            }
        });
        setRowData(preparedData);
        setIsRowModalOpen(true);
    };

    const handleSaveRow = async () => {
        try {
            if (editingRow) {
                await dynamicService.updateRow(editingRow.id, rowData);
            } else {
                await dynamicService.addRow(activeTable.id, rowData);
            }

            await loadTableRows(activeTable.id);

            const clearedData = {};
            activeTable.columns_definition.forEach((col) => {
                if (col.type === 'relation') {
                    clearedData[col.id] = [];
                } else {
                    clearedData[col.id] = '';
                }
            });
            setRowData(clearedData);
            setIsRowModalOpen(false);
            setEditingRow(null);
        } catch (error) {
            console.error("خطأ أثناء الحفظ الفعلي للسجل:", error);
            alert("فشل حفظ البيانات.");
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

    const openSettingsModal = async () => {
        setManageColumns([...activeTable.columns_definition]);
        setDropdownOptions([]);
        setSelectedRelationTableId('');
        try {
            const allSystemTables = await dynamicService.getAllTables();
            setTables(allSystemTables);
        } catch (error) {
            console.error("خطأ أثناء جلب جداول النظام الشاملة للعلاقات:", error);
        }
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

    const getRelationDisplayValue = (relatedTableId, relatedId) => {
        if (!relatedTableId || !relatedId) return "";
        const targetRows = relationRowsMap[relatedTableId] || [];
        const foundRow = targetRows.find(r => String(r.id) === String(relatedId));
        if (foundRow) {
            const firstKey = Object.keys(foundRow.cells_data)[0];
            return foundRow.cells_data[firstKey] || `سجل #${relatedId}`;
        }
        return `تحميل... (#${relatedId})`;
    };

    const getFileNameFromUrl = (url) => {
        // إذا كان الرابط غير موجود أو ليس نصاً، نرجعه كما هو أو نرجع نصاً بديلًا
        if (!url || typeof url !== 'string') {
            return "مستند قانوني";
        }

        try {
            // كودك الحالي المستند إلى substring أو split
            return url.substring(url.lastIndexOf('/') + 1);
        } catch (e) {
            return "مستند قانوني";
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

    // دالة لجلب جميع الملفات المرفقة المرتبطة بسجل معين (الموكل مثلاً) عبر الجداول الأخرى
    const getAllAssociatedDocuments = (clientId) => {
        let associatedDocs = [];
        if (!clientId) return associatedDocs;

        const targetIdStr = String(clientId);
        const targetIdNum = Number(clientId);

        let rowsToScan = [];

        // 1️⃣ استخراج الأسطر من هيكل الجداول إذا وجد
        if (Array.isArray(tables) && tables.length > 0) {
            tables.forEach((table) => {
                table.rows?.forEach((row) => {
                    rowsToScan.push({
                        id: row.id,
                        cells_data: row.cells_data,
                        tableName: table.name || 'الموكلين'
                    });
                });
            });
        }

        // 2️⃣ خطة الإنقاذ والبدائل المباشرة بملف الصفحة الأب (rows أو clients أو currentTable)
        if (rowsToScan.length === 0) {
            if (typeof rows !== 'undefined' && Array.isArray(rows)) {
                rows.forEach(r => rowsToScan.push({ id: r.id, cells_data: r.cells_data, tableName: 'الموكلين' }));
            }
            else if (typeof clients !== 'undefined' && Array.isArray(clients)) {
                clients.forEach(c => rowsToScan.push({ id: c.id, cells_data: c.cells_data, tableName: 'الموكلين' }));
            }
            else if (typeof currentTable !== 'undefined' && currentTable?.rows) {
                currentTable.rows.forEach(r => rowsToScan.push({ id: r.id, cells_data: r.cells_data, tableName: currentTable.name }));
            }
        }

        // 3️⃣ تجميع وتجهيز المستندات المرتبطة بالعميل
        rowsToScan.forEach((row) => {
            const isRelated = (String(row.id) === targetIdStr || Number(row.id) === targetIdNum);

            if (isRelated) {
                Object.keys(row.cells_data || {}).forEach((key) => {
                    const value = row.cells_data[key];

                    if (typeof value === 'string' && (value.startsWith('http') || value.includes('/download/'))) {
                        let relativeUrl = value;
                        if (relativeUrl.includes('/api/v1')) {
                            relativeUrl = relativeUrl.split('/api/v1')[1];
                        } else if (relativeUrl.startsWith('http')) {
                            try {
                                const urlObj = new URL(relativeUrl);
                                relativeUrl = urlObj.pathname.replace('/api/v1', '');
                            } catch (e) { }
                        }

                        if (!relativeUrl.startsWith('/')) {
                            relativeUrl = `/${relativeUrl}`;
                        }

                        const recordTitle = row.cells_data?.["c1"] || `سجل #${row.id}`;

                        associatedDocs.push({
                            id: `${row.id}_${key}`,
                            fileName: typeof getFileNameFromUrl === 'function' ? getFileNameFromUrl(value) : `مستند_${row.id}`,
                            fileUrl: relativeUrl,
                            originTable: row.tableName,
                            recordTitle: recordTitle,
                            cells_data: { ...row.cells_data, fileUrl: relativeUrl }
                        });
                    }
                });
            }
        });

        return associatedDocs;
    };

    const handleDeleteDocument = async (param1, param2, explicitFieldId = null, explicitRowId = null) => {
        let attachmentId = null;
        let doc = null;
        let targetUrl = null;

        // 1. فحص ذكي لترتيب المتغيرات الممررة من المكون المتصل
        if (param1 !== undefined && param1 !== null && (typeof param1 === 'number' || (typeof param1 === 'string' && !isNaN(param1.trim()) && param1.trim() !== ''))) {
            attachmentId = parseInt(String(param1).trim(), 10);
            doc = param2; // الكائن الممرر بالكامل (rawDoc)
        } else {
            doc = param1;
            targetUrl = param2 || (doc ? (doc.url || doc.fileUrl || doc.value || doc.path) : null);
        }

        // استخراج احتياطي للمعرف من الرابط
        if (!attachmentId && targetUrl && typeof targetUrl === 'string') {
            const cleanUrl = targetUrl.split('?')[0];
            const parts = cleanUrl.split('/');
            for (let i = parts.length - 1; i >= 0; i--) {
                const part = parts[i].trim();
                if (part && !isNaN(part)) {
                    attachmentId = parseInt(part, 10);
                    break;
                }
            }
        }

        if (!attachmentId && doc && typeof doc === 'object') {
            const potentialIds = [doc.attachment_id, doc.document_id, doc.file_id];
            for (const idVal of potentialIds) {
                if (idVal !== undefined && idVal !== null && !isNaN(idVal)) {
                    attachmentId = parseInt(idVal, 10);
                    break;
                }
            }
        }

        console.log("=== تتبع بيانات الحذف الذكي ===");
        console.log("المعرف الرقمي المستخرج للمستند (attachmentId):", attachmentId);
        console.log("كائن السجل المرتبط (doc):", doc);

        if (!attachmentId || isNaN(attachmentId)) {
            alert("لم يتم العثور على المعرف الرقمي الخاص بالمستند بالسيرفر.");
            return;
        }

        if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المستند نهائياً؟")) {
            return;
        }

        try {
            const authToken = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('access_token')) : '';

            // إرسال طلب الحذف المادي للملف
            const response = await fetch(`http://127.0.0.1:8000/api/v1/attachments/${attachmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 204 || response.ok || response.status === 404) {
                if (response.status === 404) {
                    console.log("تنبيه: المستند غير موجود مسبقاً على السيرفر (404)، سيتم استكمال تنظيف الحقول.");
                }

                // 2. تحديد معرّف السطر بدقة وحمايته من التداخل مع الـ columns
                let rowId = explicitRowId;

                if (!rowId && doc && doc.id && !String(doc.id).startsWith('col_')) {
                    rowId = doc.id;
                }
                if (!rowId && doc && doc.row_id && !String(doc.row_id).startsWith('col_')) {
                    rowId = doc.row_id;
                }
                if (!rowId && typeof editingRow !== 'undefined' && editingRow && editingRow.id && !String(editingRow.id).startsWith('col_')) {
                    rowId = editingRow.id;
                }

                // استقبال الـ columnKey بشكل صحيح في المتغير المخصص له
                let fieldId = explicitFieldId || (doc ? doc.field_id : null);

                // 3. البحث الاحتياطي الصارم في الـ state عن معرف السطر الحقيقي فقط
                if ((!rowId || String(rowId).startsWith('col_')) && typeof rows !== 'undefined' && Array.isArray(rows)) {
                    const foundRow = rows.find(r => r.cells_data && JSON.stringify(r.cells_data).includes(String(attachmentId)));
                    if (foundRow && foundRow.id && !String(foundRow.id).startsWith('col_')) {
                        rowId = foundRow.id;
                    }
                }

                // محاولة استخراج اسم الحقل (fieldId) الفعلي إذا لم يصل من المكون
                if (!fieldId && typeof rows !== 'undefined' && Array.isArray(rows)) {
                    const targetSearchId = rowId ? String(rowId) : null;
                    const activeRowObj = rows.find(r => String(r.id) === targetSearchId) || rows.find(r => r.cells_data && JSON.stringify(r.cells_data).includes(String(attachmentId)));

                    if (activeRowObj && activeRowObj.cells_data) {
                        const foundField = Object.keys(activeRowObj.cells_data).find(key => {
                            const valStr = String(activeRowObj.cells_data[key]);
                            return valStr.includes(`/download/${attachmentId}`) || valStr.includes(String(attachmentId));
                        });
                        if (foundField) fieldId = foundField;
                    }
                }

                if (!rowId || String(rowId).startsWith('col_')) {
                    console.error("Critical: Could not determine valid rowId for dynamic update. Found:", rowId);
                    alert("تعذر تحديد السجل الرقمي المرتبط بالملف لتحديثه تلقائياً.");
                    return;
                }

                // 4. دالة التنظيف المتقدمة (تدعم الحقول النصية والمصفوفات)
                const performCellsCleanup = (currentCellsData) => {
                    if (!currentCellsData) return {};
                    const updatedCells = { ...currentCellsData };

                    // مَسح ذكي وعميق لكل الحقول التي تحتوي على معرف الملف أو رابط التحميل الخاص به
                    Object.keys(updatedCells).forEach(key => {
                        const value = updatedCells[key];

                        if (Array.isArray(value)) {
                            // إذا كان الحقل عبارة عن مصفوفة ملفات (مثل حالة سعود)، نقوم بفلترة الملف المحذوف فقط
                            updatedCells[key] = value.filter(fileObj => {
                                if (!fileObj) return false;
                                const rawUrl = fileObj.url || fileObj.filePath || "";
                                const fileIdMatch = rawUrl.match(/\/download\/(\d+)/);
                                const actualFileId = fileIdMatch ? parseInt(fileIdMatch[1], 10) : fileObj.id;
                                return parseInt(actualFileId) !== parseInt(attachmentId);
                            });

                            // إذا أصبحت المصفوفة فارغة تماماً نضعها null أو مصفوفة فارغة حسب تفضيل السيرفر
                            if (updatedCells[key].length === 0) updatedCells[key] = null;
                        } else if (value && typeof value === 'string') {
                            // إذا كان الحقل نصاً مباشراً (رابط مباشر)
                            if (value.includes(`/download/${attachmentId}`) || value.includes(String(attachmentId))) {
                                updatedCells[key] = null;
                            }
                        }
                    });

                    if (fieldId && (!updatedCells[fieldId] || (Array.isArray(updatedCells[fieldId]) && updatedCells[fieldId].length === 0))) {
                        updatedCells[fieldId] = null;
                    }

                    return updatedCells;
                };

                // 5. استخراج البيانات الحالية للخلايا لتحديثها محلياً وفورياً
                let currentCells = null;
                const fallbackRow = (typeof rows !== 'undefined' && Array.isArray(rows)) ? rows.find(r => String(r.id) === String(rowId)) : null;

                if (fallbackRow && fallbackRow.cells_data) {
                    currentCells = fallbackRow.cells_data;
                } else if (doc && doc.cells_data) {
                    currentCells = doc.cells_data;
                }

                const cleanedCellsData = performCellsCleanup(currentCells || {});

                // 6. تحديث المراجع والـ States فوراً لضمان اختفاء الفايل محلياً بدون ريفريش
                if (typeof setRows === 'function') {
                    setRows(prevRows => prevRows.map(row =>
                        String(row.id) === String(rowId) ? { ...row, cells_data: cleanedCellsData } : row
                    ));
                }

                if (typeof setFilteredRows === 'function') {
                    setFilteredRows(prev => prev.map(row =>
                        String(row.id) === String(rowId) ? { ...row, cells_data: cleanedCellsData } : row
                    ));
                }

                // تحديث كائن الموكل المفتوح حالياً للتعديل لكي يشعر بالتغيير الفوري للمكون الفرعي
                if (typeof setEditingRow === 'function') {
                    setEditingRow(prev => {
                        if (prev && String(prev.id) === String(rowId)) {
                            return { ...prev, cells_data: cleanedCellsData };
                        }
                        return prev;
                    });
                }

                // 7. مزامنة التحديث مع السيرفر عبر الـ PUT الموجه للـ rowId الرقمي النقي
                const tableId = (typeof activeTable !== 'undefined' && activeTable?.id) || (doc ? doc.table_id : null) || 4;

                try {
                    const payload = {
                        table_id: parseInt(tableId, 10),
                        cells_data: cleanedCellsData
                    };

                    console.log(`إرسال طلب التحديث الفوري للسجل ${rowId}:`, payload);

                    const updateResponse = await fetch(`http://127.0.0.1:8000/api/v1/dynamic/rows/${rowId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (updateResponse.ok) {
                        console.log(`نجاح كامل: تم تصفير الرابط في السيرفر للسجل ${rowId}`);
                    } else {
                        console.error("رفض السيرفر تحديث الخلايا. كود الاستجابة:", updateResponse.status);
                    }
                } catch (dbErr) {
                    console.error("خطأ شبكة أثناء تحديث السيرفر بالـ PUT:", dbErr);
                }

                alert("تم حذف المستند بنجاح وتحديث السجل.");

                if (tableId && typeof loadTableRows === 'function') {
                    await loadTableRows(tableId);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Fails: ${errorData.detail || "حدث خطأ غير معروف أثناء حذف الملف"}`);
            }
        } catch (error) {
            console.error("خطأ:", error);
            alert("حدث خطأ أثناء الاتصال بالسيرفر.");
        }
    };

    // تأكد من إضافة الدالة داخل المكون وقبل الـ return
    const handleViewDocument = (fileUrl) => {
        if (!fileUrl) return alert("خطأ: رابط المستند غير موجود.");

        // 1. جلب التوكن الحالي من المتصفح
        const token = localStorage.getItem('token');

        let fullUrl = '';

        // 2. حل مشكلة تكرار الرابط: فحص هل الرابط القادم من السيرفر كامل أم جزئي
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            // إذا كان الرابط كاملاً مثل http://localhost:8000/... نستخدمه مباشرة
            fullUrl = fileUrl;
        } else {
            // إذا كان الرابط جزئياً مثل /documents/download/23 نركبه مع السيرفر
            fullUrl = `http://127.0.0.1:8000/api/v1${fileUrl}`;
        }

        // 3. حقن التوكن في الرابط كـ Query Parameter (تأكد من عدم تكرار علامة الاستفهام)
        if (token) {
            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl = `${fullUrl}${separator}token=${token}`;
        }

        // 4. تحميل أو عرض المستند عبر الرابط الصحيح النظيف
        const link = document.createElement('a');
        link.href = fullUrl;
        link.target = '_blank'; // لفتحه في تبويب جديد وعرضه inline
        link.setAttribute('download', fileUrl.split('/').pop() || 'document');

        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="md:mr-64 p-6 bg-[#0B0F19] min-h-screen text-slate-100 font-sans min-w-0" dir="rtl">
            {/* شريط الجداول العلوية */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
                {tables.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTableChange(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTable?.id === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-850 border border-slate-800'}`}
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
                                <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'calendar' ? 'bg-amber-600 text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}><Calendar className="w-3.5 h-3.5" /></button>
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
                                                    const cellValue = row.cells_data[col.id];

                                                    return (
                                                        <td key={col.id} className="p-4 font-medium min-w-[150px]" onDoubleClick={() => { if (col.type !== 'attachment' && col.type !== 'relation') { setEditingCell({ rowId: row.id, colKey: col.id }); setEditValue(cellValue || ""); } }}>
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
                                                                <div className="cursor-pointer hover:bg-slate-800 p-1 rounded min-h-[20px] flex items-center gap-1.5 flex-wrap">
                                                                    {col.type === 'relation' && (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {Array.isArray(cellValue) && cellValue.length > 0 ? (
                                                                                cellValue.map((id) => (
                                                                                    <span key={id} className="inline-flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 px-2 py-0.5 rounded text-[10px] underline">
                                                                                        <Link className="w-2.5 h-2.5" />
                                                                                        {getRelationDisplayValue(col.relatedTableId, id)}
                                                                                    </span>
                                                                                ))
                                                                            ) : <span className="text-slate-650 italic text-[11px]">غير مرتبط</span>}
                                                                        </div>
                                                                    )}
                                                                    {col.type === 'attachment' && (
                                                                        cellValue ? (
                                                                            <a href={cellValue} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-400 font-bold underline hover:text-emerald-300">
                                                                                <Paperclip className="w-3 h-3" />
                                                                                <span className="max-w-[120px] truncate">{getFileNameFromUrl(cellValue)}</span>
                                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                                            </a>
                                                                        ) : <span className="text-slate-650 italic text-[11px]">لا يوجد ملف</span>
                                                                    )}
                                                                    {col.type === 'dropdown' && cellValue && <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800 text-[10px]">{cellValue}</span>}
                                                                    {col.type !== 'dropdown' && col.type !== 'relation' && col.type !== 'attachment' && (cellValue || <span className="text-slate-600 italic">فارغ</span>)}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="p-4 text-left flex items-center justify-end gap-2">
                                                    <button onClick={() => openEditRowModal(row)} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-blue-400 transition">تعديل</button>
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
                                                <span className={`text-xs font-semibold flex items-center gap-1.5 flex-wrap ${idx === 0 ? "text-amber-400 text-sm font-black" : "text-slate-300"}`}>
                                                    {col.type === 'relation' && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {Array.isArray(row.cells_data[col.id]) && row.cells_data[col.id].length > 0 ? (
                                                                row.cells_data[col.id].map((relatedId) => (
                                                                    <span key={relatedId} className="inline-flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 px-2 py-0.5 rounded text-[11px] underline">
                                                                        <Link className="w-2.5 h-2.5" />
                                                                        {getRelationDisplayValue(col.relatedTableId, relatedId) || '-'}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-slate-655 italic">-</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {col.type === 'attachment' && (
                                                        row.cells_data[col.id] ? (
                                                            <a href={row.cells_data[col.id]} target="_blank" rel="noreferrer" className="text-emerald-400 underline flex items-center gap-1">
                                                                <Paperclip className="w-3 h-3" /> {getFileNameFromUrl(row.cells_data[col.id])}
                                                            </a>
                                                        ) : '-'
                                                    )}
                                                    {col.type !== 'relation' && col.type !== 'attachment' && (row.cells_data[col.id] || '-')}
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

                    {/* 🖥️ 3. نمط القائمة المطور (List View) */}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            {filteredRows.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800 italic">لا توجد مستندات أو سجلات تطابق البحث الحالي.</div>
                            ) : (
                                filteredRows.map((row) => {
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
                                                            <span key={col.id} className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                                                {col.name}:{' '}
                                                                {col.type === 'attachment' ? (
                                                                    row.cells_data[col.id] ? (
                                                                        <a href={row.cells_data[col.id]} target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">{getFileNameFromUrl(row.cells_data[col.id])}</a>
                                                                    ) : '-'
                                                                ) : col.type === 'relation' ? (
                                                                    <span className="flex gap-1 flex-wrap">
                                                                        {Array.isArray(row.cells_data[col.id]) && row.cells_data[col.id].length > 0 ? (
                                                                            row.cells_data[col.id].map(relatedId => (
                                                                                <strong key={relatedId} className="text-cyan-400 underline font-semibold">
                                                                                    {getRelationDisplayValue(col.relatedTableId, relatedId) || '-'}
                                                                                </strong>
                                                                            ))
                                                                        ) : '-'}
                                                                    </span>
                                                                ) : (
                                                                    <strong className="text-slate-400 font-semibold">{row.cells_data[col.id] || '-'}</strong>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 border-slate-800/50 pt-2 sm:pt-0">
                                                <GlobalDocumentGenerator
                                                    activeTable={activeTable}
                                                    selectedRow={row}
                                                    triggerButton={
                                                        <button className="px-2.5 py-1.5 bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-slate-950 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-amber-500/20">
                                                            <Wand2 className="w-3 h-3" />
                                                            توليد مستند
                                                        </button>
                                                    }
                                                />
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

            {/* 📅 4. نمط التقويم القانوني الديناميكي (Calendar View) */}
            {viewMode === 'calendar' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-2">
                        <div>الأحد</div><div>الإثنين</div><div>الثلاثاء</div><div>الأربعاء</div><div>الخميس</div><div>الجمعة</div><div>السبت</div>
                    </div>

                    <div className="space-y-2 mt-4">
                        {(() => {
                            const dateFieldId = activeTable?.calendar_mapping?.date_field;
                            const titleFieldId = activeTable?.calendar_mapping?.title_field;
                            const statusFieldId = activeTable?.calendar_mapping?.status_field;

                            const finalDateFieldId = dateFieldId || activeTable.columns_definition.find(c => c.type === 'date')?.id;
                            const finalTitleFieldId = titleFieldId || activeTable.columns_definition[0]?.id;
                            const finalStatusFieldId = statusFieldId || activeTable.columns_definition.find(c => c.type === 'dropdown')?.id;

                            return filteredRows
                                .filter(row => finalDateFieldId && !!row.cells_data[finalDateFieldId])
                                .sort((a, b) => new Date(a.cells_data[finalDateFieldId]) - new Date(b.cells_data[finalDateFieldId]))
                                .map(row => (
                                    <div key={row.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850 hover:border-amber-500/40 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="text-amber-500 font-mono text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                                                {row.cells_data[finalDateFieldId]}
                                            </div>
                                            <span className="text-xs font-bold text-slate-200">
                                                {row.cells_data[finalTitleFieldId] || 'بدون عنوان'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {finalStatusFieldId && row.cells_data[finalStatusFieldId] && (
                                                <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                                                    {row.cells_data[finalStatusFieldId]}
                                                </span>
                                            )}
                                            <button onClick={() => openEditRowModal(row)} className="text-[11px] text-blue-400 hover:underline px-2 py-1 rounded hover:bg-blue-500/10 transition">تعديل</button>
                                        </div>
                                    </div>
                                ));
                        })()}
                    </div>
                </div>
            )}

            {/* 📥 المودال: إضافة وتعديل سجل المطور والداعم للاختيار المتعدد الشامل */}
            {/* 📥 المودال: إضافة وتعديل سجل المطور والداعم للاختيار المتعدد الشامل */}
            {isRowModalOpen && activeTable && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-amber-500">
                                {editingRow ? '📝 تعديل بيانات السجل القانوني الحالي' : '➕ إضافة سجل قانوني جديد للمكتب'}
                            </h3>
                            <button onClick={() => setIsRowModalOpen(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {activeTable.columns_definition.map((col) => (
                                <div key={col.id}>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">{col.name}</label>

                                    {col.type === 'dropdown' ? (
                                        <select value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200">
                                            <option value="">إختر خياراً...</option>
                                            {col.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : col.type === 'attachment' ? (
                                        <div className="space-y-2">
                                            <div className="w-full bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 text-center relative hover:border-emerald-500/50 transition">
                                                <input type="file" className="hidden" id={`file_${col.id}`} onChange={(e) => handleFileUpload(e, col.id)} disabled={uploadingField === col.id} />
                                                {uploadingField === col.id ? (
                                                    <div className="flex flex-col items-center justify-center gap-2 py-2">
                                                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                                        <span className="text-xs text-slate-400">جاري رفع المستند القانوني وتشفيره بأمان...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <label htmlFor={`file_${col.id}`} className="cursor-pointer text-xs text-slate-500 flex flex-col items-center gap-1.5">
                                                            <Paperclip className="w-5 h-5 text-slate-400" />
                                                            {rowData[col.id] ? (
                                                                <span className="text-emerald-400 font-bold max-w-full truncate block px-4">
                                                                    ✓ تم الرفع: {getFileNameFromUrl(rowData[col.id])}
                                                                </span>
                                                            ) : "اضغط لرفع ملف أو مستند للمكتب (PDF, DOCX)"}
                                                        </label>

                                                        {/* أزرار المعاينة والتحكم الذكية */}
                                                        {rowData[col.id] && (
                                                            <div className="flex items-center gap-4 mt-2 border-t border-slate-900 pt-2 w-full justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewDocument(rowData[col.id])}
                                                                    className="text-[11px] text-amber-500 underline hover:text-amber-400 cursor-pointer font-bold"
                                                                >
                                                                    معاينة هذا المستند ↗
                                                                </button>

                                                                <span className="text-slate-700">|</span>

                                                                {/* 🔥 الزر الجديد لفتح الـ Popup واستعراض كافة المستندات المرتبطة بالموكل */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (editingRow) {
                                                                            setIsClientDocsModalOpen(true);
                                                                        } else {
                                                                            alert("يرجى حفظ السجل أولاً لربطه بالموكل واستعراض أرشيفه.");
                                                                        }
                                                                    }}
                                                                    className="text-[11px] text-cyan-400 hover:text-cyan-350 cursor-pointer font-bold flex items-center gap-1"
                                                                >
                                                                    🗂️ عرض أرشيف الموكل الشامل
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : col.type === 'relation' ? (
                                        <select
                                            multiple
                                            value={Array.isArray(rowData[col.id]) ? rowData[col.id] : []}
                                            onChange={(e) => {
                                                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                                setRowData({ ...rowData, [col.id]: selectedOptions });
                                            }}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-400 font-bold min-h-[100px] focus:outline-none focus:border-cyan-500"
                                        >
                                            {(relationRowsMap[col.relatedTableId] || []).map((rRow) => {
                                                const firstKey = Object.keys(rRow.cells_data)[0];
                                                return (
                                                    <option key={rRow.id} value={rRow.id} className="p-1.5 rounded hover:bg-slate-800">
                                                        🔗 {rRow.cells_data[firstKey] || `سجل #${rRow.id}`}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    ) : (
                                        <input
                                            type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                            value={rowData[col.id] || ''} onChange={(e) => setRowData({ ...rowData, [col.id]: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-amber-500"
                                        />
                                    )}
                                    {col.type === 'relation' && <span className="block text-[10px] text-slate-500 mt-1">اضغط مع الاستمرار على Ctrl (أو Cmd في Mac) لاختيار أكثر من سجل.</span>}
                                </div>
                            ))}

                            {/* 📂 قسم المستندات المرتبطة الديناميكي المستدعى عبر الدالة الموحدة */}
                            {editingRow && (
                                <div className="mt-6 pt-4 border-t border-slate-800 space-y-3 text-right" dir="rtl">
                                    <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                                        <FolderOpen className="w-4 h-4" />
                                        <span>ملف الموكل الشامل: المستندات المرتبطة به في النظام</span>
                                    </div>

                                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                        {getAllAssociatedDocuments(editingRow.id).length === 0 ? (
                                            <div className="text-[11px] text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                                                لا توجد مستندات أو عقود مرفوعة مرتبطة بهذا الموكل في الجداول الأخرى حالياً.
                                            </div>
                                        ) : (
                                            getAllAssociatedDocuments(editingRow.id).map((doc) => (
                                                <div key={doc.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850 hover:border-emerald-500/30 transition text-xs gap-4">
                                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(doc.fileUrl)}
                                                            className="text-slate-200 hover:text-emerald-400 font-bold underline flex items-center gap-1.5 truncate text-right bg-transparent border-none cursor-pointer p-0"
                                                        >
                                                            <Paperclip className="w-3 h-3 text-emerald-500 shrink-0" />
                                                            <span className="truncate">{doc.fileName}</span>
                                                        </button>
                                                        <span className="text-[10px] text-slate-500 truncate">
                                                            مصدره: <strong className="text-slate-400">{doc.originTable}</strong> ({doc.recordTitle})
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDocument(doc.fileUrl)}
                                                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer"
                                                    >
                                                        فتح المستند ↗
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                            <button onClick={() => setIsRowModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">إلغاء</button>
                            <button onClick={handleSaveRow} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5" disabled={uploadingField !== null}>
                                <Save className="w-4 h-4" /> حفظ السجل
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [باني المخطط المتقدم والـ Settings] */}
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
                                <div className="mt-3 animate-in fade-in duration-200">
                                    <label className="block text-xs font-bold text-cyan-400 mb-1.5">
                                        🔗 اختر الجدول المرتبط المستهدف (Many-to-Many):
                                    </label>
                                    <select
                                        value={selectedRelationTableId}
                                        onChange={(e) => setSelectedRelationTableId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500"
                                    >
                                        <option value="">-- اختر جدولاً من القائمة --</option>
                                        {tables && tables.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                📊 {t.name}
                                            </option>
                                        ))}
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
                                                {col.type === 'relation' && <span className="text-[9px] text-cyan-400 font-bold">(متعدد 🔗)</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveColumnStructure(col.id)} className="text-red-500 hover:bg-red-950/20 p-2 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                            <GlobalDocumentGenerator
                                activeTable={activeTable}
                                filteredRows={filteredRows}
                                triggerButton={
                                    <button className="bg-slate-950 text-amber-500 border border-amber-500/30 hover:bg-amber-600 hover:text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg">
                                        <Wand2 className="w-4 h-4" />
                                        توليد مستند شامل للجدول
                                    </button>
                                }
                            />
                            <button onClick={() => setIsSettingsModalOpen(false)} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">إلغاء</button>
                            <button onClick={handleSaveChangesStructure} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                                <Save className="w-4 h-4" /> حفظ التغييرات الهيكلية
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isClientDocsModalOpen && editingRow && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative">

                        {/* زر إغلاق الـ Popup العلوي */}
                        <button
                            onClick={() => setIsClientDocsModalOpen(false)}
                            className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-850 p-2 rounded-xl transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* استدعاء جدول المستندات الشامل وتمرير البيانات والدالة الموحدة له */}
                        <div className="pt-2">
                            <ClientDocumentsList
                                editingRow={editingRow}
                                getAllAssociatedDocuments={getAllAssociatedDocuments}
                                handleViewDocument={handleViewDocument}
                                handleDeleteDocument={handleDeleteDocument}
                                allDocuments={rows} // مرر مصفوفة الـ rows المجلوبة من السيرفر لجدول رقم 4 هنا كاحتياط
                            />
                        </div>

                        {/* تذييل النافذة المنبثقة */}
                        <div className="flex justify-end border-t border-slate-800 pt-4">
                            <button
                                onClick={() => setIsClientDocsModalOpen(false)}
                                className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-6 py-2 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
                            >
                                إغلاق الأرشيف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}