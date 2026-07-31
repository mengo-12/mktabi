// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import useReportStore from "../store/reportStore";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
// import EmptyCanvas from "./EmptyCanvas";
// import reportBuilderService from "../services/reportBuilderService";

// import {
//     Database,
//     CheckSquare,
//     Square,
//     Columns3,
//     Save
// } from "lucide-react";


// const SectionCard = ({ title, description, children }) => (
//     <div className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden">
//         <div className="px-4 py-3 border-b border-slate-800">
//             <h3 className="text-sm font-semibold text-white">
//                 {title}
//             </h3>

//             {description && (
//                 <p className="text-xs text-slate-500 mt-1">
//                     {description}
//                 </p>
//             )}
//         </div>

//         <div className="p-4">
//             {children}
//         </div>
//     </div>
// );

// export default function QueryCanvas() {

//     const [previewRows, setPreviewRows] = useState([]);
//     const [loadingPreview, setLoadingPreview] = useState(false);
//     const [saveModalOpen, setSaveModalOpen] = useState(false);
//     const [reportName, setReportName] = useState("");
//     const [reportDescription, setReportDescription] = useState("");
//     const [saving, setSaving] = useState(false);

//     const { user } = useAuth();
//     const router = useRouter();

//     const pagePermission =
//         user?.role === "admin" || user?.is_superuser
//             ? "write"
//             : (user?.system_pages?.["report-builder"] || "no_access");

//     const canRead =
//         pagePermission === "read" || pagePermission === "write";

//     const canWrite =
//         pagePermission === "write";

//     const {
//         selectedTable,
//         report,
//         loadReport,
//         setSelectedTable,
//         toggleColumn,
//         reportResult,
//         setReportResult,
//         selectedRelations,
//         toggleRelation,
//         dataSources,
//         addFilter,
//         updateFilter,
//         removeFilter,
//         addSorting,
//         updateSorting,
//         removeSorting,
//         setGroupBy,
//         clearGroupBy,
//         addCalculatedField,
//         updateCalculatedField,
//         removeCalculatedField,
//     } = useReportStore();

//     const searchParams = useSearchParams();
//     const reportId = searchParams.get("report");

//     useEffect(() => {

//         if (!reportId || dataSources.length === 0) return;

//         const loadSavedReport = async () => {

//             const reportData =
//                 await reportBuilderService.getReport(reportId);

//             //  تم نقل الـ console.log إلى هنا بعد تعريف reportData بنجاح
//             console.log("reportId", reportId);
//             console.log("dataSources", dataSources);
//             console.log("reportData", reportData);

//             const table =
//                 dataSources
//                     .flatMap(section => section.tables || [])
//                     .find(
//                         t => String(t.id) === String(reportData.base_table_id)
//                     );

//             console.log("table", table);

//             console.log(
//                 dataSources.flatMap(section =>
//                     (section.tables || []).map(table => ({
//                         id: table.id,
//                         name: table.name,
//                     }))
//                 )
//             );

//             if (!table) return;

//             setSelectedTable(table);

//             loadReport(reportData);

//             setTimeout(() => {
//                 console.log("report after load", useReportStore.getState().report);
//             }, 100);


//         };

//         loadSavedReport();

//     }, [reportId, dataSources]);

//     useEffect(() => {
//         if (!user) return;

//         if (!canRead) {
//             router.replace("/dashboard");
//         }
//     }, [user, canRead, router]);

//     // لا يوجد جدول محدد
//     if (!selectedTable) {
//         return <EmptyCanvas />;
//     }

//     const flattenColumns = (table, prefix = "") => {
//         if (!table) return [];

//         const result = [];

//         for (const column of table.columns || []) {

//             result.push({
//                 ...column,
//                 label: prefix
//                     ? `${prefix} → ${column.label || column.name}`
//                     : column.name,
//             });

//             if (column.type === "relation") {

//                 const childTable =
//                     table.relations?.find(
//                         r => String(r.column_id) === String(column.id)
//                     )?.table;

//                 if (childTable) {

//                     result.push(
//                         ...flattenColumns(
//                             childTable,
//                             prefix
//                                 ? `${prefix} → ${column.label || column.name}`
//                                 : column.name
//                         )
//                     );

//                 }

//             }

//         }

//         return result;
//     };

//     const columns = flattenColumns(selectedTable);

//     const selectedColumns =
//         report.query.columns || [];

//     const filters =
//         report.query.filters || [];

//     const sorting =
//         report.query.sorting || [];

//     const groupBy =
//         report.query.groupBy || "";

//     const calculatedFields =
//         report.query.calculatedFields || [];

//     const selectableColumns = selectedColumns;

//     const previewColumns =
//         reportResult?.columns?.length
//             ? reportResult.columns
//             : [
//                 ...selectedColumns,
//                 ...calculatedFields.map(field => ({
//                     id: field.name,
//                     name: field.name,
//                     type: "calculated",
//                 })),
//             ];


//     const isSelected = (columnId) => {
//         return selectedColumns.some(
//             (col) => String(col.id) === String(columnId)
//         );
//     };

//     const openSaveModal = () => {

//         setReportName(report.name || "");
//         setReportDescription(report.description || "");

//         setSaveModalOpen(true);

//     };


//     const runQuery = async () => {

//         if (!canWrite) return;
//         if (!selectedTable) return;

//         setLoadingPreview(true);

//         try {
//             const payload = {
//                 table_id: selectedTable.id,

//                 columns: selectedColumns.map(column => ({
//                     id: column.id,
//                     name: column.name,
//                     type: column.type,
//                     path: column.path || [],
//                 })),

//                 // relations: selectedColumns
//                 //     .filter(column => column.type === "relation")
//                 //     .map(column => ({
//                 //         column_id: column.id,
//                 //         table_id:
//                 //             column.relatedTableId ??
//                 //             column.relation?.table_id,
//                 //     })),

//                 relations: selectedColumns
//                     .filter(column => column.type === "relation")
//                     .map(column => {

//                         const relation = selectedTable.relations.find(
//                             r => String(r.column_id) === String(column.id)
//                         );

//                         return {
//                             column_id: column.id,
//                             table_id:
//                                 column.relatedTableId ??
//                                 column.relation?.table_id ??
//                                 relation?.table?.id,
//                         };
//                     }),


//                 filters: report.query.filters || [],

//                 sorting: report.query.sorting || [],

//                 groupBy: report.query.groupBy || "",

//                 calculatedFields: report.query.calculatedFields || [],



//             };

//             console.log("RUN PAYLOAD", payload);


//             const result = await reportBuilderService.runQuery(payload);
//             console.table(result.rows);
//             setReportResult(result);
//             setPreviewRows(result.rows || []);
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoadingPreview(false);
//         }
//     };

//     const saveReport = async () => {
//         if (!canWrite) return;

//         if (!reportName.trim()) {
//             alert("أدخل اسم التقرير");
//             return;
//         }

//         setSaving(true);

//         try {

//             const payload = {
//                 name: reportName,
//                 description: reportDescription,

//                 base_table_id: selectedTable.id,

//                 config: {
//                     query: {
//                         table_id: selectedTable.id,

//                         columns: previewColumns.map(column => ({
//                             id: column.id,
//                             name: column.name,
//                             type: column.type,
//                             path: column.path || [],
//                         })),

//                         relations: [

//                             // العلاقات التي اختارها المستخدم يدوياً
//                             ...selectedRelations.map(relation => ({
//                                 column_id: relation.column.id,
//                                 table_id:
//                                     relation.table?.id ??
//                                     relation.column.relatedTableId ??
//                                     relation.column.relation?.table_id,
//                             })),

//                             // العلاقات التي تم اختيار أعمدتها تلقائياً
//                             ...previewColumns
//                                 .filter(column => column.type === "relation")
//                                 .map(column => {

//                                     const relation =
//                                         selectedTable.relations?.find(
//                                             r => String(r.column_id) === String(column.id)
//                                         );

//                                     return {
//                                         column_id: column.id,
//                                         table_id:
//                                             relation?.table?.id ??
//                                             column.relatedTableId ??
//                                             column.relation?.table_id,
//                                     };

//                                 })

//                         ]
//                             .filter(r => r.table_id)
//                             .filter(
//                                 (relation, index, array) =>
//                                     index ===
//                                     array.findIndex(
//                                         item =>
//                                             item.column_id === relation.column_id
//                                     )
//                             ),

//                         filters: report.query.filters || [],

//                         sorting: report.query.sorting || [],

//                         groupBy: report.query.groupBy || "",

//                         calculatedFields:
//                             report.query.calculatedFields || [],
//                     },

//                     visualization: report.visualization,
//                 },
//             };
//             if (report.id) {
//                 await reportBuilderService.updateReport(report.id, payload);
//             } else {
//                 await reportBuilderService.createReport(payload);
//             }

//             setSaveModalOpen(false);
//             setReportName("");
//             setReportDescription("");

//             alert(
//                 report.id
//                     ? "تم تحديث التقرير"
//                     : "تم حفظ التقرير"
//             );

//         } catch (e) {
//             console.error(e);
//             alert("فشل الحفظ");
//         } finally {
//             setSaving(false);
//         }

//     };


//     const renderCellValue = (value) => {
//         if (value == null) return "";

//         if (Array.isArray(value)) {
//             return value
//                 .map(item => {
//                     if (item && typeof item === "object") {
//                         return item.display || "";
//                     }

//                     return String(item);
//                 })
//                 .filter(Boolean)
//                 .join("، ");
//         }

//         if (typeof value === "object") {
//             return value.display || "";
//         }

//         return String(value);
//     };

//     const relationColumns =

//         columns.filter(

//             col =>

//                 col.type === "relation"

//         );

//     return (
//         <div className="h-full flex flex-col overflow-hidden">

//             {/* ================= Header ================= */}

//             <div className="border-b border-slate-800 px-6 py-5">

//                 <div className="flex items-center gap-3">

//                     <Database className="w-6 h-6 text-cyan-400" />

//                     <div>

//                         <h2 className="text-xl font-bold text-white">
//                             {selectedTable.name}
//                         </h2>

//                         <p className="text-xs text-slate-400 mt-1">
//                             الجدول الأساسي للتقرير
//                         </p>

//                     </div>

//                     <button
//                         disabled={!canWrite}
//                         onClick={runQuery}
//                         className="px-4 py-2 rounded bg-blue-600 text-white"
//                     >
//                         تشغيل التقرير
//                     </button>

//                     <button
//                         disabled={!canWrite}
//                         onClick={openSaveModal}
//                         className="px-4 py-2 rounded bg-green-600 text-white flex items-center gap-2"
//                     >
//                         <Save size={18} />
//                         {report.id ? "تحديث التقرير" : "حفظ التقرير"}
//                     </button>

//                 </div>

//             </div>

//             {/* ================= Columns ================= */}

//             <div className="flex-1 overflow-auto p-6">

//                 <div className="mb-6">

//                     <div className="flex items-center gap-2 mb-4">

//                         <Columns3 className="w-5 h-5 text-cyan-400" />

//                         <h3 className="font-semibold text-white">
//                             الأعمدة
//                         </h3>

//                     </div>

//                     <div className="grid grid-cols-2 gap-3">

//                         {columns.map((column) => {

//                             const checked =
//                                 isSelected(column.id);

//                             return (

//                                 <button
//                                     key={`${column.id}-${JSON.stringify(column.path || [])}`}
//                                     type="button"
//                                     disabled={!canWrite}
//                                     onClick={() => canWrite && toggleColumn(column)
//                                     }
//                                     className={`
//                                         flex
//                                         items-center
//                                         gap-3
//                                         p-3
//                                         rounded-xl
//                                         border
//                                         transition-all
//                                         text-left

//                                         ${checked
//                                             ? "border-cyan-500 bg-cyan-500/10"
//                                             : "border-slate-800 hover:border-slate-700 bg-slate-900"}
//                                     `}
//                                 >

//                                     {checked ? (

//                                         <CheckSquare
//                                             className="w-5 h-5 text-cyan-400"
//                                         />

//                                     ) : (

//                                         <Square
//                                             className="w-5 h-5 text-slate-500"
//                                         />

//                                     )}

//                                     <div>

//                                         <div className="text-sm font-medium text-white">

//                                             {column.label || column.name}

//                                         </div>

//                                         <div className="text-[11px] text-slate-500">

//                                             {column.type}

//                                         </div>

//                                     </div>

//                                 </button>

//                             );

//                         })}

//                     </div>

//                 </div>

//                 {/* ================= Selected Columns ================= */}

//                 <div className="border-t border-slate-800 pt-6">

//                     <h3 className="text-sm font-semibold text-white mb-4">

//                         الأعمدة المختارة

//                         <span className="ml-2 text-cyan-400">

//                             ({selectedColumns.length})

//                         </span>

//                     </h3>

//                     {selectedColumns.length === 0 ? (

//                         <div className="text-sm text-slate-500">

//                             لم يتم اختيار أي أعمدة بعد.

//                         </div>

//                     ) : (

//                         <div className="flex flex-wrap gap-2">

//                             {previewColumns.map((column) => (

//                                 <div
//                                     key={`${column.id}-${JSON.stringify(column.path || [])}`}
//                                     className="
//                                         px-3
//                                         py-1.5
//                                         rounded-full
//                                         bg-cyan-500/10
//                                         border
//                                         border-cyan-500/20
//                                         text-cyan-300
//                                         text-xs
//                                         font-medium
//                                     "
//                                 >

//                                     {column.label || column.name}

//                                 </div>

//                             ))}

//                         </div>

//                     )}

//                 </div>

//                 {/* ================= filters ================= */}

//                 <SectionCard
//                     title="Filters"
//                     description="إنشاء شروط البحث للتقرير."
//                 >

//                     <div className="space-y-3">

//                         {filters.map(filter => (

//                             <div
//                                 key={filter.id}
//                                 className="grid grid-cols-12 gap-2"
//                             >

//                                 <select
//                                     disabled={!canWrite}
//                                     className="col-span-4 rounded-lg bg-slate-950 border border-slate-700 p-2"
//                                     value={filter.column}
//                                     onChange={(e) =>
//                                         updateFilter(filter.id, {
//                                             column: e.target.value,
//                                         })
//                                     }
//                                 >

//                                     <option value="">
//                                         اختر العمود
//                                     </option>

//                                     {selectableColumns.map(col => (

//                                         <option
//                                             key={col.id}
//                                             value={col.id}
//                                         >
//                                             {col.name}
//                                         </option>

//                                     ))}

//                                 </select>

//                                 <select
//                                     disabled={!canWrite}
//                                     className="col-span-3 rounded-lg bg-slate-950 border border-slate-700 p-2"
//                                     value={filter.operator}
//                                     onChange={(e) =>
//                                         updateFilter(filter.id, {
//                                             operator: e.target.value,
//                                         })
//                                     }
//                                 >

//                                     <option value="=">=</option>
//                                     <option value="!=">!=</option>
//                                     <option value="contains">contains</option>
//                                     <option value="starts_with">starts with</option>
//                                     <option value="ends_with">ends with</option>
//                                     <option value=">">{">"}</option>
//                                     <option value="<">{"<"}</option>
//                                     <option value=">=">{">="}</option>
//                                     <option value="<=">{"<="}</option>

//                                 </select>

//                                 <input
//                                     disabled={!canWrite}
//                                     className="col-span-4 rounded-lg bg-slate-950 border border-slate-700 p-2"
//                                     value={filter.value}
//                                     onChange={(e) =>
//                                         updateFilter(filter.id, {
//                                             value: e.target.value,
//                                         })
//                                     }
//                                     placeholder="القيمة"
//                                 />

//                                 <button
//                                     className="col-span-1 rounded-lg bg-red-600"
//                                     disabled={!canWrite}
//                                     onClick={() => canWrite && removeFilter(filter.id)}
//                                 >
//                                     ✕
//                                 </button>

//                             </div>

//                         ))}

//                         <button
//                             disabled={!canWrite}
//                             onClick={() => canWrite && addFilter()}
//                             className="px-4 py-2 rounded-lg bg-blue-600 text-white"
//                         >
//                             + إضافة فلتر
//                         </button>

//                     </div>

//                 </SectionCard>

//                 {/* ================= relations ================= */}


//                 <SectionCard
//                     title="Relations"
//                     description="ربط الجدول الحالي بالجداول الأخرى."
//                 >
//                     <div className="space-y-3">

//                         {

//                             relationColumns.length === 0 ?

//                                 (

//                                     <div className="text-sm text-slate-500">

//                                         لا يحتوي هذا الجدول على أي علاقات.

//                                     </div>

//                                 )

//                                 :

//                                 relationColumns.map((column) => {

//                                     const relationTableId =

//                                         column.relatedTableId ||

//                                         column.relation?.table_id;

//                                     const relatedTable =

//                                         dataSources
//                                             .flatMap(section => section.tables || [])
//                                             .find(
//                                                 table =>
//                                                     String(table.id) === String(relationTableId)
//                                             );

//                                     const checked =

//                                         selectedRelations.some(

//                                             r =>

//                                                 String(r.column.id) === String(column.id)

//                                         );

//                                     return (

//                                         <label
//                                             key={column.id}
//                                             className="
//                             flex
//                             items-center
//                             justify-between
//                             rounded-lg
//                             border
//                             border-slate-800
//                             bg-slate-900
//                             px-4
//                             py-3
//                             cursor-pointer
//                         "
//                                         >

//                                             <div>

//                                                 <div className="text-white text-sm">

//                                                     {column.label || column.name}

//                                                 </div>

//                                                 <div className="text-xs text-slate-500">

//                                                     →

//                                                     {

//                                                         relatedTable?.name ||

//                                                         `جدول #${relationTableId}`

//                                                     }

//                                                 </div>

//                                             </div>

//                                             <input

//                                                 disabled={!canWrite}

//                                                 type="checkbox"

//                                                 checked={checked}

//                                                 onChange={() =>

//                                                     canWrite &&

//                                                     toggleRelation({

//                                                         column,

//                                                         table: relatedTable

//                                                     })

//                                                 }

//                                             />

//                                         </label>

//                                     );

//                                 })

//                         }

//                     </div>
//                 </SectionCard>


//                 {/* ================= group by ================= */}


//                 <SectionCard
//                     title="Group By"
//                     description="تجميع النتائج حسب عمود."
//                 >

//                     <div className="flex gap-3">

//                         <select
//                             disabled={!canWrite}
//                             className="flex-1 rounded bg-slate-900 border border-slate-700 p-2"
//                             value={groupBy}
//                             onChange={(e) =>
//                                 setGroupBy(e.target.value)
//                             }
//                         >

//                             <option value="">
//                                 بدون تجميع
//                             </option>

//                             {selectableColumns.map(column => (

//                                 <option
//                                     key={column.id}
//                                     value={column.id}
//                                 >
//                                     {column.label || column.name}
//                                 </option>

//                             ))}

//                         </select>

//                         <button
//                             disabled={!canWrite}
//                             onClick={() => canWrite && clearGroupBy()}
//                             className="rounded bg-red-600 px-4"
//                         >
//                             حذف
//                         </button>

//                     </div>

//                 </SectionCard>

//                 {/* ================= sorting ================= */}


//                 <SectionCard
//                     title="Sorting"
//                     description="ترتيب نتائج التقرير."
//                 >

//                     <div className="space-y-4">

//                         {sorting.map((sort) => (

//                             <div
//                                 key={sort.id}
//                                 className="grid grid-cols-12 gap-3 items-center"
//                             >

//                                 <select
//                                     disabled={!canWrite}
//                                     className="col-span-6 rounded bg-slate-900 border border-slate-700 p-2"
//                                     value={sort.column}
//                                     onChange={(e) =>
//                                         updateSorting(sort.id, {
//                                             column: e.target.value,
//                                         })
//                                     }
//                                 >

//                                     <option value="">
//                                         اختر عمود
//                                     </option>

//                                     {selectableColumns.map((column) => (

//                                         <option
//                                             key={column.id}
//                                             value={column.id}
//                                         >
//                                             {column.label || column.name}
//                                         </option>

//                                     ))}

//                                 </select>

//                                 <select
//                                     disabled={!canWrite}
//                                     className="col-span-4 rounded bg-slate-900 border border-slate-700 p-2"
//                                     value={sort.direction}
//                                     onChange={(e) =>
//                                         updateSorting(sort.id, {
//                                             direction: e.target.value,
//                                         })
//                                     }
//                                 >

//                                     <option value="asc">
//                                         تصاعدي
//                                     </option>

//                                     <option value="desc">
//                                         تنازلي
//                                     </option>

//                                 </select>

//                                 <button
//                                     className="col-span-2 rounded bg-red-600 px-3 py-2"
//                                     disabled={!canWrite}
//                                     onClick={() => canWrite && removeSorting(sort.id)}
//                                 >
//                                     حذف
//                                 </button>

//                             </div>

//                         ))}

//                         <button
//                             disabled={!canWrite}
//                             onClick={() => canWrite && addSorting()}
//                             className="rounded bg-cyan-600 px-4 py-2 text-white"
//                         >
//                             + إضافة ترتيب
//                         </button>

//                     </div>

//                 </SectionCard>


//                 {/* ================= calculated fields ================= */}


//                 <SectionCard
//                     title="Calculated Fields"
//                     description="إنشاء حقول محسوبة."
//                 >

//                     <div className="space-y-4">

//                         {calculatedFields.map(field => (

//                             <div
//                                 key={field.id}
//                                 className="grid grid-cols-12 gap-3"
//                             >

//                                 <input
//                                     disabled={!canWrite}
//                                     className="col-span-3 rounded bg-slate-900 border border-slate-700 p-2"
//                                     placeholder="اسم الحقل"
//                                     value={field.name}
//                                     onChange={(e) =>
//                                         updateCalculatedField(field.id, {
//                                             name: e.target.value,
//                                         })
//                                     }
//                                 />

//                                 <select
//                                     disabled={!canWrite}
//                                     className="col-span-3 rounded bg-slate-900 border border-slate-700 p-2"
//                                     value={field.operation}
//                                     onChange={(e) =>
//                                         updateCalculatedField(field.id, {
//                                             operation: e.target.value,
//                                         })
//                                     }
//                                 >
//                                     <option value="sum">SUM</option>
//                                     <option value="avg">AVG</option>
//                                     <option value="count">COUNT</option>
//                                     <option value="min">MIN</option>
//                                     <option value="max">MAX</option>
//                                 </select>

//                                 <select
//                                     disabled={!canWrite}
//                                     className="col-span-4 rounded bg-slate-900 border border-slate-700 p-2"
//                                     value={field.column}
//                                     onChange={(e) =>
//                                         updateCalculatedField(field.id, {
//                                             column: e.target.value,
//                                         })
//                                     }
//                                 >
//                                     <option value="">
//                                         اختر عمود
//                                     </option>

//                                     {selectableColumns.map(column => (
//                                         <option
//                                             key={column.id}
//                                             value={column.id}
//                                         >
//                                             {column.label || column.name}
//                                         </option>
//                                     ))}
//                                 </select>

//                                 <button
//                                     className="col-span-2 rounded bg-red-600"
//                                     disabled={!canWrite}
//                                     onClick={() => canWrite && removeCalculatedField(field.id)}
//                                 >
//                                     حذف
//                                 </button>

//                             </div>

//                         ))}

//                         <button
//                             onClick={addCalculatedField}
//                             className="rounded bg-cyan-600 px-4 py-2"
//                         >
//                             + إضافة حقل محسوب
//                         </button>

//                     </div>

//                 </SectionCard>

//                 {/* ================= preview ================= */}



//                 <SectionCard
//                     title="Preview"
//                     description="نتائج تنفيذ التقرير"
//                 >

//                     {loadingPreview ? (

//                         <div className="text-center py-10 text-slate-400">
//                             جاري تحميل البيانات...
//                         </div>

//                     ) : previewRows.length === 0 ? (

//                         <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">

//                             <div className="text-slate-400 text-sm">
//                                 لا توجد بيانات حتى الآن.
//                             </div>

//                         </div>

//                     ) : (

//                         <div className="overflow-auto rounded-lg border border-slate-800">

//                             <table className="min-w-full text-sm">

//                                 <thead className="bg-slate-900">

//                                     <tr>

//                                         {previewColumns.map(col => (

//                                             <th
//                                                 key={`${col.id}-${JSON.stringify(col.path || [])}`}
//                                                 className="border-b border-slate-800 px-3 py-2 text-left"
//                                             >
//                                                 {col.name}
//                                             </th>

//                                         ))}

//                                     </tr>

//                                 </thead>

//                                 <tbody>

//                                     {previewRows.map(row => (

//                                         <tr
//                                             key={row.id}
//                                             className="hover:bg-slate-900/40"
//                                         >

//                                             {previewColumns.map(col => (

//                                                 <td
//                                                     key={`${col.id}-${JSON.stringify(col.path || [])}`}
//                                                     className="border-b border-slate-800 px-3 py-2"
//                                                 >
//                                                     {renderCellValue(row[col.id])}
//                                                 </td>

//                                             ))}

//                                         </tr>

//                                     ))}

//                                 </tbody>

//                             </table>

//                         </div>

//                     )}

//                 </SectionCard>

//                 {reportResult && (

//                     <div className="border rounded-lg p-4 mt-6">

//                         <h3 className="font-semibold mb-3">
//                             Preview
//                         </h3>

//                         {loadingPreview ? (
//                             <div>Loading...</div>
//                         ) : (
//                             <table className="w-full text-sm">

//                                 <thead>
//                                     <tr>
//                                         {previewColumns.map(col => (
//                                             <th
//                                                 key={`${col.id}-${JSON.stringify(col.path || [])}`}
//                                                 className="border px-2 py-1 text-left"
//                                             >
//                                                 {col.name}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>

//                                 <tbody>

//                                     {reportResult.rows.map((row) => (

//                                         <tr key={row.id}>

//                                             {previewColumns.map(col => (

//                                                 <td
//                                                     key={`${col.id}-${JSON.stringify(col.path || [])}`}
//                                                     className="border px-2 py-1"

//                                                 >
//                                                     {renderCellValue(row[col.id])}
//                                                 </td>

//                                             ))}

//                                         </tr>

//                                     ))}

//                                 </tbody>

//                             </table>

//                         )}

//                     </div>

//                 )}

//             </div>

//             {
//                 saveModalOpen && (

//                     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

//                         <div className="bg-slate-900 rounded-xl w-[500px] p-6">

//                             <h2 className="text-white text-xl font-bold mb-6">
//                                 حفظ التقرير
//                             </h2>

//                             <input
//                                 disabled={!canWrite}
//                                 className="w-full mb-4 rounded bg-slate-800 border border-slate-700 px-3 py-2 text-white"
//                                 placeholder="اسم التقرير"
//                                 value={reportName}
//                                 onChange={(e) =>
//                                     setReportName(e.target.value)
//                                 }
//                             />

//                             <textarea
//                                 disabled={!canWrite}
//                                 className="w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-white"
//                                 rows={4}
//                                 placeholder="وصف التقرير"
//                                 value={reportDescription}
//                                 onChange={(e) =>
//                                     setReportDescription(e.target.value)
//                                 }
//                             />

//                             <div className="flex justify-end gap-3 mt-6">

//                                 <button
//                                     onClick={() =>
//                                         setSaveModalOpen(false)
//                                     }
//                                     className="px-4 py-2 rounded bg-slate-700 text-white"
//                                 >
//                                     إلغاء
//                                 </button>

//                                 <button

//                                     disabled={!canWrite || saving}
//                                     onClick={saveReport}
//                                     className="px-4 py-2 rounded bg-green-600 text-white"
//                                 >
//                                     {saving
//                                         ? "جاري الحفظ..."
//                                         : report.id
//                                             ? "تحديث"
//                                             : "حفظ"}
//                                 </button>

//                             </div>

//                         </div>

//                     </div>

//                 )
//             }

//         </div>
//     );

// }



"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useReportStore from "../store/reportStore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import EmptyCanvas from "./EmptyCanvas";
import reportBuilderService from "../services/reportBuilderService";

import {
    Database,
    CheckSquare,
    Square,
    Columns3,
    Save
} from "lucide-react";


const SectionCard = ({ title, description, children }) => (
    <section
        className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-slate-900
            shadow-sm
        "
    >
        <div
            className="
                px-6
                py-5
                border-b
                border-slate-200
                dark:border-slate-700
                bg-slate-50
                dark:bg-slate-900/60
            "
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
            </h3>

            {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            )}
        </div>

        <div className="p-6">
            {children}
        </div>
    </section>
);

export default function QueryCanvas() {

    const [previewRows, setPreviewRows] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [reportName, setReportName] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const { user } = useAuth();
    const router = useRouter();

    const pagePermission =
        user?.role === "admin" || user?.is_superuser
            ? "write"
            : (user?.system_pages?.["report-builder"] || "no_access");

    const canRead =
        pagePermission === "read" || pagePermission === "write";

    const canWrite =
        pagePermission === "write";

    const {
        selectedTable,
        report,
        loadReport,
        setSelectedTable,
        toggleColumn,
        reportResult,
        setReportResult,
        selectedRelations,
        toggleRelation,
        dataSources,
        addFilter,
        updateFilter,
        removeFilter,
        addSorting,
        updateSorting,
        removeSorting,
        setGroupBy,
        clearGroupBy,
        addCalculatedField,
        updateCalculatedField,
        removeCalculatedField,
    } = useReportStore();

    const searchParams = useSearchParams();
    const reportId = searchParams.get("report");

    useEffect(() => {

        if (!reportId || dataSources.length === 0) return;

        const loadSavedReport = async () => {

            const reportData =
                await reportBuilderService.getReport(reportId);

            //  تم نقل الـ console.log إلى هنا بعد تعريف reportData بنجاح
            console.log("reportId", reportId);
            console.log("dataSources", dataSources);
            console.log("reportData", reportData);

            const table =
                dataSources
                    .flatMap(section => section.tables || [])
                    .find(
                        t => String(t.id) === String(reportData.base_table_id)
                    );

            console.log("table", table);

            console.log(
                dataSources.flatMap(section =>
                    (section.tables || []).map(table => ({
                        id: table.id,
                        name: table.name,
                    }))
                )
            );

            if (!table) return;

            setSelectedTable(table);

            loadReport(reportData);

            setTimeout(() => {
                console.log("report after load", useReportStore.getState().report);
            }, 100);


        };

        loadSavedReport();

    }, [reportId, dataSources]);

    useEffect(() => {
        if (!user) return;

        if (!canRead) {
            router.replace("/dashboard");
        }
    }, [user, canRead, router]);

    // لا يوجد جدول محدد
    if (!selectedTable) {
        return <EmptyCanvas />;
    }

    const flattenColumns = (table, prefix = "") => {
        if (!table) return [];

        const result = [];

        for (const column of table.columns || []) {

            result.push({
                ...column,
                label: prefix
                    ? `${prefix} → ${column.label || column.name}`
                    : column.name,
            });

            if (column.type === "relation") {

                const childTable =
                    table.relations?.find(
                        r => String(r.column_id) === String(column.id)
                    )?.table;

                if (childTable) {

                    result.push(
                        ...flattenColumns(
                            childTable,
                            prefix
                                ? `${prefix} → ${column.label || column.name}`
                                : column.name
                        )
                    );

                }

            }

        }

        return result;
    };

    const columns = flattenColumns(selectedTable);

    const selectedColumns =
        report.query.columns || [];

    const filters =
        report.query.filters || [];

    const sorting =
        report.query.sorting || [];

    const groupBy =
        report.query.groupBy || "";

    const calculatedFields =
        report.query.calculatedFields || [];

    const selectableColumns = selectedColumns;

    const previewColumns =
        reportResult?.columns?.length
            ? reportResult.columns
            : [
                ...selectedColumns,
                ...calculatedFields.map(field => ({
                    id: field.name,
                    name: field.name,
                    type: "calculated",
                })),
            ];


    const isSelected = (columnId) => {
        return selectedColumns.some(
            (col) => String(col.id) === String(columnId)
        );
    };

    const openSaveModal = () => {

        setReportName(report.name || "");
        setReportDescription(report.description || "");

        setSaveModalOpen(true);

    };


    const runQuery = async () => {

        if (!canWrite) return;
        if (!selectedTable) return;

        setLoadingPreview(true);

        try {
            const payload = {
                table_id: selectedTable.id,

                columns: selectedColumns.map(column => ({
                    id: column.id,
                    name: column.name,
                    type: column.type,
                    path: column.path || [],
                })),

                // relations: selectedColumns
                //     .filter(column => column.type === "relation")
                //     .map(column => ({
                //         column_id: column.id,
                //         table_id:
                //             column.relatedTableId ??
                //             column.relation?.table_id,
                //     })),

                relations: selectedColumns
                    .filter(column => column.type === "relation")
                    .map(column => {

                        const relation = selectedTable.relations.find(
                            r => String(r.column_id) === String(column.id)
                        );

                        return {
                            column_id: column.id,
                            table_id:
                                column.relatedTableId ??
                                column.relation?.table_id ??
                                relation?.table?.id,
                        };
                    }),


                filters: report.query.filters || [],

                sorting: report.query.sorting || [],

                groupBy: report.query.groupBy || "",

                calculatedFields: report.query.calculatedFields || [],



            };

            console.log("RUN PAYLOAD", payload);


            const result = await reportBuilderService.runQuery(payload);
            console.table(result.rows);
            setReportResult(result);
            setPreviewRows(result.rows || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPreview(false);
        }
    };

    const saveReport = async () => {
        if (!canWrite) return;

        if (!reportName.trim()) {
            alert("أدخل اسم التقرير");
            return;
        }

        setSaving(true);

        try {

            const payload = {
                name: reportName,
                description: reportDescription,

                base_table_id: selectedTable.id,

                config: {
                    query: {
                        table_id: selectedTable.id,

                        columns: previewColumns.map(column => ({
                            id: column.id,
                            name: column.name,
                            type: column.type,
                            path: column.path || [],
                        })),

                        relations: [

                            // العلاقات التي اختارها المستخدم يدوياً
                            ...selectedRelations.map(relation => ({
                                column_id: relation.column.id,
                                table_id:
                                    relation.table?.id ??
                                    relation.column.relatedTableId ??
                                    relation.column.relation?.table_id,
                            })),

                            // العلاقات التي تم اختيار أعمدتها تلقائياً
                            ...previewColumns
                                .filter(column => column.type === "relation")
                                .map(column => {

                                    const relation =
                                        selectedTable.relations?.find(
                                            r => String(r.column_id) === String(column.id)
                                        );

                                    return {
                                        column_id: column.id,
                                        table_id:
                                            relation?.table?.id ??
                                            column.relatedTableId ??
                                            column.relation?.table_id,
                                    };

                                })

                        ]
                            .filter(r => r.table_id)
                            .filter(
                                (relation, index, array) =>
                                    index ===
                                    array.findIndex(
                                        item =>
                                            item.column_id === relation.column_id
                                    )
                            ),

                        filters: report.query.filters || [],

                        sorting: report.query.sorting || [],

                        groupBy: report.query.groupBy || "",

                        calculatedFields:
                            report.query.calculatedFields || [],
                    },

                    visualization: report.visualization,
                },
            };
            if (report.id) {
                await reportBuilderService.updateReport(report.id, payload);
            } else {
                await reportBuilderService.createReport(payload);
            }

            setSaveModalOpen(false);
            setReportName("");
            setReportDescription("");

            alert(
                report.id
                    ? "تم تحديث التقرير"
                    : "تم حفظ التقرير"
            );

        } catch (e) {
            console.error(e);
            alert("فشل الحفظ");
        } finally {
            setSaving(false);
        }

    };


    const renderCellValue = (value) => {
        if (value == null) return "";

        if (Array.isArray(value)) {
            return value
                .map(item => {
                    if (item && typeof item === "object") {
                        return item.display || "";
                    }

                    return String(item);
                })
                .filter(Boolean)
                .join("، ");
        }

        if (typeof value === "object") {
            return value.display || "";
        }

        return String(value);
    };

    const relationColumns =

        columns.filter(

            col =>

                col.type === "relation"

        );

    return (
        <div className="h-full flex flex-col overflow-hidden">

            {/* ================= Header ================= */}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6">

                    {/* Left */}

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">

                            <Database className="w-7 h-7" />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">

                                {selectedTable.name}

                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                                إنشاء وتخصيص التقرير انطلاقًا من الجدول الأساسي مع إمكانية
                                اختيار الأعمدة وإضافة الفلاتر والعلاقات وتجميع النتائج.

                            </p>

                        </div>

                    </div>

                    {/* Right */}

                    <div className="flex flex-wrap items-center gap-3">

                        <button
                            disabled={!canWrite}
                            onClick={runQuery}
                            className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    dark:text-slate-200
                    shadow-sm
                    transition
                    hover:border-blue-500
                    hover:bg-slate-50
                    dark:hover:bg-slate-800
                    disabled:opacity-50
                "
                        >

                            ▶

                            تشغيل التقرير

                        </button>

                        <button
                            disabled={!canWrite}
                            onClick={openSaveModal}
                            className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-md
                    transition
                    hover:bg-blue-700
                    disabled:opacity-50
                "
                        >

                            <Save size={18} />

                            {report.id ? "تحديث التقرير" : "حفظ التقرير"}

                        </button>

                    </div>

                </div>

                {/* Statistics */}

                <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-200 dark:border-slate-800">

                    <div className="p-5">

                        <div className="text-xs uppercase tracking-wide text-slate-500">

                            الأعمدة

                        </div>

                        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">

                            {selectedColumns.length}

                        </div>

                    </div>

                    <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                        <div className="text-xs uppercase tracking-wide text-slate-500">

                            الفلاتر

                        </div>

                        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">

                            {filters.length}

                        </div>

                    </div>

                    <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                        <div className="text-xs uppercase tracking-wide text-slate-500">

                            العلاقات

                        </div>

                        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">

                            {selectedRelations.length}

                        </div>

                    </div>

                    <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                        <div className="text-xs uppercase tracking-wide text-slate-500">

                            Group By

                        </div>

                        <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">

                            {groupBy ? "مفعل" : "بدون"}

                        </div>

                    </div>

                </div>

            </div>

            {/* ================= Columns ================= */}

            <div className="flex-1 overflow-auto p-6 space-y-8">

                {/* ================= Columns ================= */}

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Columns
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                اختر الأعمدة التي سيتم عرضها داخل التقرير.
                            </p>

                        </div>

                        <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 px-4 py-2">

                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">

                                {selectedColumns.length} محدد

                            </span>

                        </div>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {columns.map((column) => {

                            const checked = isSelected(column.id);

                            return (

                                <button
                                    key={`${column.id}-${JSON.stringify(column.path || [])}`}
                                    type="button"
                                    disabled={!canWrite}
                                    onClick={() => canWrite && toggleColumn(column)}
                                    className={`
                        group
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        p-5
                        text-left
                        transition-all
                        duration-200

                        ${checked
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-md"
                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 hover:shadow-md"
                                        }
                    `}
                                >

                                    <div className="flex items-start justify-between">

                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    ${checked
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                    }
                                `}
                                            >

                                                {checked ? (
                                                    <CheckSquare className="w-5 h-5" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}

                                            </div>

                                            <div>

                                                <div className="font-semibold text-slate-900 dark:text-white">

                                                    {column.label || column.name}

                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">

                                                    {column.name}

                                                </div>

                                            </div>

                                        </div>

                                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">

                                            {column.type}

                                        </span>

                                    </div>

                                    {checked && (

                                        <div className="mt-5 flex items-center justify-between border-t border-blue-200 dark:border-blue-500/20 pt-3">

                                            <span className="text-xs text-blue-600 dark:text-blue-400">

                                                سيتم عرضه في التقرير

                                            </span>

                                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />

                                        </div>

                                    )}

                                </button>

                            );

                        })}

                    </div>

                </div>

                {/* ================= Selected Columns ================= */}

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">

                    <div className="flex items-center justify-between mb-5">

                        <div>

                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">

                                Selected Columns

                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">

                                الأعمدة التي ستظهر في نتيجة التقرير.

                            </p>

                        </div>

                        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold">

                            {selectedColumns.length}

                        </div>

                    </div>

                    {selectedColumns.length === 0 ? (

                        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-12 text-center">

                            <div className="text-4xl mb-3">

                                📄

                            </div>

                            <p className="text-slate-500 dark:text-slate-400">

                                لم يتم اختيار أي أعمدة بعد.

                            </p>

                        </div>

                    ) : (

                        <div className="flex flex-wrap gap-3">

                            {previewColumns.map((column) => (

                                <div
                                    key={`${column.id}-${JSON.stringify(column.path || [])}`}
                                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-blue-200
                        dark:border-blue-500/20
                        bg-blue-50
                        dark:bg-blue-500/10
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-blue-700
                        dark:text-blue-400
                    "
                                >

                                    <CheckSquare className="w-4 h-4" />

                                    {column.label || column.name}

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* ================= filters ================= */}

                <SectionCard
                    title="Filters"
                    description="إنشاء شروط البحث للتقرير."
                >

                    <div className="space-y-4">

                        {filters.length === 0 && (

                            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-10 text-center">

                                <div className="text-4xl mb-3">
                                    🔍
                                </div>

                                <h3 className="font-semibold text-slate-800 dark:text-white">

                                    لا توجد فلاتر

                                </h3>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                                    أضف أول شرط لتصفية بيانات التقرير.

                                </p>

                            </div>

                        )}

                        {filters.map((filter) => (

                            <div
                                key={filter.id}
                                className="
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                    shadow-sm
                    p-5
                "
                            >

                                <div className="grid gap-4 lg:grid-cols-12">

                                    <div className="lg:col-span-5">

                                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                                            Column

                                        </label>

                                        <select
                                            disabled={!canWrite}
                                            value={filter.column}
                                            onChange={(e) =>
                                                updateFilter(filter.id, {
                                                    column: e.target.value,
                                                })
                                            }
                                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-300
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-950
                                px-4
                                py-2.5
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                outline-none
                            "
                                        >

                                            <option value="">

                                                اختر العمود

                                            </option>

                                            {selectableColumns.map((col) => (

                                                <option
                                                    key={col.id}
                                                    value={col.id}
                                                >

                                                    {col.label || col.name}

                                                </option>

                                            ))}

                                        </select>

                                    </div>

                                    <div className="lg:col-span-3">

                                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                                            Operator

                                        </label>

                                        <select
                                            disabled={!canWrite}
                                            value={filter.operator}
                                            onChange={(e) =>
                                                updateFilter(filter.id, {
                                                    operator: e.target.value,
                                                })
                                            }
                                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-300
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-950
                                px-4
                                py-2.5
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                outline-none
                            "
                                        >

                                            <option value="=">=</option>
                                            <option value="!=">≠</option>
                                            <option value="contains">Contains</option>
                                            <option value="starts_with">Starts With</option>
                                            <option value="ends_with">Ends With</option>
                                            <option value=">">{">"}</option>
                                            <option value="<">{"<"}</option>
                                            <option value=">=">{">="}</option>
                                            <option value="<=">{"<="}</option>

                                        </select>

                                    </div>

                                    <div className="lg:col-span-4">

                                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                                            Value

                                        </label>

                                        <input
                                            disabled={!canWrite}
                                            value={filter.value}
                                            onChange={(e) =>
                                                updateFilter(filter.id, {
                                                    value: e.target.value,
                                                })
                                            }
                                            placeholder="أدخل القيمة"
                                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-300
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-950
                                px-4
                                py-2.5
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/20
                                outline-none
                            "
                                        />

                                    </div>

                                </div>

                                <div className="flex justify-end mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">

                                    <button
                                        disabled={!canWrite}
                                        onClick={() => canWrite && removeFilter(filter.id)}
                                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-red-200
                            dark:border-red-900
                            bg-red-50
                            dark:bg-red-900/20
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-red-600
                            hover:bg-red-100
                            dark:hover:bg-red-900/30
                            transition
                        "
                                    >

                                        ✕ حذف الفلتر

                                    </button>

                                </div>

                            </div>

                        ))}

                        <button
                            disabled={!canWrite}
                            onClick={() => canWrite && addFilter()}
                            className="
                w-full
                rounded-2xl
                border-2
                border-dashed
                border-blue-300
                dark:border-blue-700
                py-4
                text-blue-600
                dark:text-blue-400
                font-semibold
                hover:bg-blue-50
                dark:hover:bg-blue-500/10
                transition
            "
                        >

                            + إضافة فلتر جديد

                        </button>

                    </div>

                </SectionCard>

                {/* ================= relations ================= */}


                <SectionCard
                    title="Relations"
                    description="ربط الجدول الحالي بالجداول الأخرى."
                >

                    {relationColumns.length === 0 ? (

                        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-10 text-center">

                            <div className="text-4xl mb-3">
                                🔗
                            </div>

                            <h3 className="font-semibold text-slate-800 dark:text-white">

                                لا توجد علاقات

                            </h3>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                                هذا الجدول لا يحتوي على أي علاقات مع جداول أخرى.

                            </p>

                        </div>

                    ) : (

                        <div className="grid gap-4 md:grid-cols-2">

                            {relationColumns.map((column) => {

                                const relationTableId =
                                    column.relatedTableId ||
                                    column.relation?.table_id;

                                const relatedTable =
                                    dataSources
                                        .flatMap(section => section.tables || [])
                                        .find(
                                            table =>
                                                String(table.id) === String(relationTableId)
                                        );

                                const checked =
                                    selectedRelations.some(
                                        r =>
                                            String(r.column.id) === String(column.id)
                                    );

                                return (

                                    <button
                                        key={column.id}
                                        type="button"
                                        disabled={!canWrite}
                                        onClick={() =>
                                            canWrite &&
                                            toggleRelation({
                                                column,
                                                table: relatedTable,
                                            })
                                        }
                                        className={`
                            text-left
                            rounded-2xl
                            border
                            transition-all
                            duration-200
                            p-5
                            shadow-sm

                            ${checked
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 hover:shadow-md"
                                            }
                        `}
                                    >

                                        <div className="flex items-start justify-between">

                                            <div>

                                                <div className="text-sm text-slate-500 dark:text-slate-400">

                                                    Relation Column

                                                </div>

                                                <div className="mt-1 font-semibold text-slate-900 dark:text-white">

                                                    {column.label || column.name}

                                                </div>

                                            </div>

                                            <div
                                                className={`
                                    h-5
                                    w-5
                                    rounded-full
                                    border-2

                                    ${checked
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-slate-400"
                                                    }
                                `}
                                            />

                                        </div>

                                        <div className="my-5 flex items-center justify-center">

                                            <div className="flex items-center gap-3">

                                                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-medium">

                                                    {selectedTable.name}

                                                </div>

                                                <span className="text-blue-500 text-xl">

                                                    →

                                                </span>

                                                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">

                                                    {relatedTable?.name || `Table #${relationTableId}`}

                                                </div>

                                            </div>

                                        </div>

                                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">

                                            <span className="text-xs text-slate-500">

                                                سيتم استخدام هذه العلاقة في التقرير

                                            </span>

                                            <span
                                                className={`
                                    rounded-full
                                    px-3
                                    py-1
                                    text-xs
                                    font-semibold

                                    ${checked
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                    }
                                `}
                                            >

                                                {checked ? "مفعلة" : "غير مفعلة"}

                                            </span>

                                        </div>

                                    </button>

                                );

                            })}

                        </div>

                    )}

                </SectionCard>


                {/* ================= Group By ================= */}

                <SectionCard
                    title="Group By"
                    description="تجميع نتائج التقرير حسب عمود معين."
                >

                    <div className="space-y-5">

                        {/* الحالة الحالية */}

                        <div
                            className={`
                rounded-2xl
                border
                p-5
                transition-all

                ${groupBy
                                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/10"
                                    : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                                }
            `}
                        >

                            {groupBy ? (

                                <div className="flex items-center justify-between">

                                    <div>

                                        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">

                                            Active Group

                                        </div>

                                        <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">

                                            {
                                                selectableColumns.find(
                                                    c => String(c.id) === String(groupBy)
                                                )?.label ||

                                                selectableColumns.find(
                                                    c => String(c.id) === String(groupBy)
                                                )?.name ||

                                                "Unknown Column"
                                            }

                                        </div>

                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                                            سيتم تجميع النتائج باستخدام هذا العمود.

                                        </p>

                                    </div>

                                    <div
                                        className="
                            h-14
                            w-14
                            rounded-2xl
                            bg-emerald-500/15
                            flex
                            items-center
                            justify-center
                            text-2xl
                        "
                                    >

                                        📊

                                    </div>

                                </div>

                            ) : (

                                <div className="text-center py-4">

                                    <div className="text-4xl mb-3">

                                        📂

                                    </div>

                                    <div className="font-semibold text-slate-800 dark:text-white">

                                        لا يوجد تجميع

                                    </div>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                                        اختر عموداً لتجميع نتائج التقرير.

                                    </p>

                                </div>

                            )}

                        </div>

                        {/* اختيار العمود */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">

                                Column

                            </label>

                            <select
                                disabled={!canWrite}
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                    px-4
                    py-3
                    text-sm
                    text-slate-900
                    dark:text-white
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    outline-none
                    transition
                "
                            >

                                <option value="">

                                    بدون تجميع

                                </option>

                                {selectableColumns.map(column => (

                                    <option
                                        key={column.id}
                                        value={column.id}
                                    >

                                        {column.label || column.name}

                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* الإجراءات */}

                        <div className="flex justify-end">

                            <button
                                disabled={!canWrite || !groupBy}
                                onClick={() => canWrite && clearGroupBy()}
                                className="
                    rounded-xl
                    bg-red-500
                    hover:bg-red-600
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    px-5
                    py-2.5
                    text-white
                    font-medium
                    transition
                "
                            >

                                إزالة التجميع

                            </button>

                        </div>

                    </div>

                </SectionCard>

                {/* ================= Sorting ================= */}

                <SectionCard
                    title="Sorting"
                    description="ترتيب نتائج التقرير حسب عمود أو أكثر."
                >

                    <div className="space-y-5">

                        {/* Empty State */}

                        {sorting.length === 0 && (

                            <div
                                className="
                    rounded-2xl
                    border-2
                    border-dashed
                    border-slate-300
                    dark:border-slate-700
                    p-10
                    text-center
                "
                            >

                                <div className="text-5xl mb-4">

                                    ↕

                                </div>

                                <h4 className="font-semibold text-slate-800 dark:text-white">

                                    لا يوجد ترتيب

                                </h4>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                                    أضف قاعدة ترتيب لعرض النتائج بالشكل المناسب.

                                </p>

                            </div>

                        )}

                        {/* Sort Cards */}

                        {sorting.map((sort, index) => {

                            const selectedColumn = selectableColumns.find(
                                c => String(c.id) === String(sort.column)
                            );

                            return (

                                <div
                                    key={sort.id}
                                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        dark:border-slate-700
                        bg-white
                        dark:bg-slate-900
                        p-5
                        shadow-sm
                    "
                                >

                                    {/* Header */}

                                    <div className="flex items-center justify-between mb-5">

                                        <div className="flex items-center gap-3">

                                            <div
                                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-blue-100
                                    dark:bg-blue-900/30
                                    flex
                                    items-center
                                    justify-center
                                    text-blue-600
                                    dark:text-blue-400
                                    font-bold
                                "
                                            >

                                                {index + 1}

                                            </div>

                                            <div>

                                                <div className="font-semibold text-slate-900 dark:text-white">

                                                    قاعدة ترتيب #{index + 1}

                                                </div>

                                                <div className="text-xs text-slate-500 dark:text-slate-400">

                                                    {selectedColumn
                                                        ? selectedColumn.label || selectedColumn.name
                                                        : "لم يتم اختيار عمود"}

                                                </div>

                                            </div>

                                        </div>

                                        <button
                                            disabled={!canWrite}
                                            onClick={() =>
                                                canWrite && removeSorting(sort.id)
                                            }
                                            className="
                                rounded-xl
                                bg-red-500
                                hover:bg-red-600
                                px-4
                                py-2
                                text-white
                                transition
                                disabled:opacity-50
                            "
                                        >

                                            حذف

                                        </button>

                                    </div>

                                    {/* Body */}

                                    <div className="grid lg:grid-cols-2 gap-5">

                                        {/* Column */}

                                        <div>

                                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                                                العمود

                                            </label>

                                            <select
                                                disabled={!canWrite}
                                                value={sort.column}
                                                onChange={(e) =>
                                                    updateSorting(sort.id, {
                                                        column: e.target.value,
                                                    })
                                                }
                                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-300
                                    dark:border-slate-700
                                    bg-white
                                    dark:bg-slate-950
                                    px-4
                                    py-3
                                    text-sm
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-500/20
                                    outline-none
                                "
                                            >

                                                <option value="">

                                                    اختر عموداً

                                                </option>

                                                {selectableColumns.map(column => (

                                                    <option
                                                        key={column.id}
                                                        value={column.id}
                                                    >

                                                        {column.label || column.name}

                                                    </option>

                                                ))}

                                            </select>

                                        </div>

                                        {/* Direction */}

                                        <div>

                                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                                                اتجاه الترتيب

                                            </label>

                                            <div className="grid grid-cols-2 gap-3">

                                                <button
                                                    type="button"
                                                    disabled={!canWrite}
                                                    onClick={() =>
                                                        updateSorting(sort.id, {
                                                            direction: "asc",
                                                        })
                                                    }
                                                    className={`
                                        rounded-xl
                                        border
                                        px-4
                                        py-3
                                        transition

                                        ${sort.direction === "asc"

                                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"

                                                            : "border-slate-300 dark:border-slate-700"
                                                        }
                                    `}
                                                >

                                                    <div className="text-xl mb-1">

                                                        ↑

                                                    </div>

                                                    <div className="text-sm font-medium">

                                                        تصاعدي

                                                    </div>

                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={!canWrite}
                                                    onClick={() =>
                                                        updateSorting(sort.id, {
                                                            direction: "desc",
                                                        })
                                                    }
                                                    className={`
                                        rounded-xl
                                        border
                                        px-4
                                        py-3
                                        transition

                                        ${sort.direction === "desc"

                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"

                                                            : "border-slate-300 dark:border-slate-700"
                                                        }
                                    `}
                                                >

                                                    <div className="text-xl mb-1">

                                                        ↓

                                                    </div>

                                                    <div className="text-sm font-medium">

                                                        تنازلي

                                                    </div>

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                        {/* Footer */}

                        <div className="flex justify-end">

                            <button
                                disabled={!canWrite}
                                onClick={() => canWrite && addSorting()}
                                className="
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    px-6
                    py-3
                    text-white
                    font-medium
                    transition
                    disabled:opacity-50
                "
                            >

                                + إضافة ترتيب جديد

                            </button>

                        </div>

                    </div>

                </SectionCard>


                {/* ================= Calculated Fields ================= */}

                <SectionCard
                    title="Calculated Fields"
                    description="إنشاء حقول محسوبة باستخدام عمليات التجميع المختلفة."
                >

                    <div className="space-y-5">

                        {/* Empty State */}

                        {calculatedFields.length === 0 && (

                            <div
                                className="
                    rounded-2xl
                    border-2
                    border-dashed
                    border-slate-300
                    dark:border-slate-700
                    p-10
                    text-center
                "
                            >

                                <div className="text-5xl mb-4">

                                    🧮

                                </div>

                                <h3 className="font-semibold text-slate-900 dark:text-white">

                                    لا توجد حقول محسوبة

                                </h3>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                                    أنشئ حقولاً محسوبة مثل مجموع المبيعات أو متوسط الأسعار أو عدد السجلات.

                                </p>

                            </div>

                        )}

                        {/* Cards */}

                        {calculatedFields.map((field, index) => {

                            const selectedColumn =
                                selectableColumns.find(
                                    c => String(c.id) === String(field.column)
                                );

                            const operationColors = {
                                sum: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                                avg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                count: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                                min: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
                                max: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                            };

                            return (

                                <div
                                    key={field.id}
                                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        dark:border-slate-700
                        bg-white
                        dark:bg-slate-900
                        shadow-sm
                        overflow-hidden
                    "
                                >

                                    {/* Header */}

                                    <div
                                        className="
                            flex
                            items-center
                            justify-between
                            px-6
                            py-4
                            border-b
                            border-slate-200
                            dark:border-slate-700
                        "
                                    >

                                        <div className="flex items-center gap-4">

                                            <div
                                                className="
                                    h-11
                                    w-11
                                    rounded-xl
                                    bg-cyan-100
                                    dark:bg-cyan-900/30
                                    flex
                                    items-center
                                    justify-center
                                    font-bold
                                    text-cyan-700
                                    dark:text-cyan-300
                                "
                                            >

                                                {index + 1}

                                            </div>

                                            <div>

                                                <div className="font-semibold text-slate-900 dark:text-white">

                                                    {field.name || `Calculated Field #${index + 1}`}

                                                </div>

                                                <div className="text-xs text-slate-500 dark:text-slate-400">

                                                    {selectedColumn
                                                        ? selectedColumn.label || selectedColumn.name
                                                        : "لم يتم اختيار عمود"}

                                                </div>

                                            </div>

                                        </div>

                                        <button
                                            disabled={!canWrite}
                                            onClick={() =>
                                                canWrite &&
                                                removeCalculatedField(field.id)
                                            }
                                            className="
                                rounded-xl
                                bg-red-500
                                hover:bg-red-600
                                px-4
                                py-2
                                text-white
                                transition
                                disabled:opacity-50
                            "
                                        >

                                            حذف

                                        </button>

                                    </div>

                                    {/* Body */}

                                    <div className="p-6 space-y-6">

                                        {/* Name */}

                                        <div>

                                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                                                اسم الحقل

                                            </label>

                                            <input
                                                disabled={!canWrite}
                                                value={field.name}
                                                placeholder="مثال: إجمالي المبيعات"
                                                onChange={(e) =>
                                                    updateCalculatedField(field.id, {
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-300
                                    dark:border-slate-700
                                    bg-white
                                    dark:bg-slate-950
                                    px-4
                                    py-3
                                    focus:ring-2
                                    focus:ring-cyan-500/20
                                    focus:border-cyan-500
                                    outline-none
                                "
                                            />

                                        </div>

                                        {/* Operation */}

                                        <div>

                                            <label className="block mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">

                                                العملية الحسابية

                                            </label>

                                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

                                                {[
                                                    { value: "sum", label: "SUM" },
                                                    { value: "avg", label: "AVG" },
                                                    { value: "count", label: "COUNT" },
                                                    { value: "min", label: "MIN" },
                                                    { value: "max", label: "MAX" },
                                                ].map(op => (

                                                    <button
                                                        key={op.value}
                                                        type="button"
                                                        disabled={!canWrite}
                                                        onClick={() =>
                                                            updateCalculatedField(field.id, {
                                                                operation: op.value,
                                                            })
                                                        }
                                                        className={`
                                            rounded-xl
                                            border
                                            px-4
                                            py-4
                                            transition

                                            ${field.operation === op.value

                                                                ? operationColors[op.value]

                                                                : "border-slate-300 dark:border-slate-700"
                                                            }
                                        `}
                                                    >

                                                        <div className="font-bold">

                                                            {op.label}

                                                        </div>

                                                    </button>

                                                ))}

                                            </div>

                                        </div>

                                        {/* Column */}

                                        <div>

                                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">

                                                العمود

                                            </label>

                                            <select
                                                disabled={!canWrite}
                                                value={field.column}
                                                onChange={(e) =>
                                                    updateCalculatedField(field.id, {
                                                        column: e.target.value,
                                                    })
                                                }
                                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-300
                                    dark:border-slate-700
                                    bg-white
                                    dark:bg-slate-950
                                    px-4
                                    py-3
                                    outline-none
                                    focus:border-cyan-500
                                    focus:ring-2
                                    focus:ring-cyan-500/20
                                "
                                            >

                                                <option value="">

                                                    اختر عموداً

                                                </option>

                                                {selectableColumns.map(column => (

                                                    <option
                                                        key={column.id}
                                                        value={column.id}
                                                    >

                                                        {column.label || column.name}

                                                    </option>

                                                ))}

                                            </select>

                                        </div>

                                        {/* Preview */}

                                        <div
                                            className="
                                rounded-xl
                                border
                                border-dashed
                                border-cyan-300
                                dark:border-cyan-700
                                bg-cyan-50
                                dark:bg-cyan-900/10
                                p-4
                            "
                                        >

                                            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">

                                                Formula Preview

                                            </div>

                                            <div className="font-mono text-sm text-cyan-700 dark:text-cyan-300 break-all">

                                                {field.operation
                                                    ? field.operation.toUpperCase()
                                                    : "SUM"}

                                                (

                                                {selectedColumn
                                                    ? selectedColumn.label || selectedColumn.name
                                                    : "Column"}

                                                )

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                        {/* Footer */}

                        <div className="flex justify-end">

                            <button
                                disabled={!canWrite}
                                onClick={() =>
                                    canWrite && addCalculatedField()
                                }
                                className="
                    rounded-xl
                    bg-cyan-600
                    hover:bg-cyan-700
                    px-6
                    py-3
                    text-white
                    font-medium
                    transition
                    disabled:opacity-50
                "
                            >

                                + إنشاء حقل محسوب

                            </button>

                        </div>

                    </div>

                </SectionCard>

                {/* ================= preview ================= */}

                <SectionCard
                    title="Preview"
                    description="معاينة نتائج تنفيذ التقرير."
                >

                    <div className="space-y-5">

                        {/* Status Bar */}

                        <div
                            className="
                rounded-2xl
                border
                border-slate-200
                dark:border-slate-700
                bg-white
                dark:bg-slate-900
                p-5
            "
                        >

                            <div className="flex flex-wrap items-center justify-between gap-4">

                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                            h-12
                            w-12
                            rounded-xl
                            bg-cyan-100
                            dark:bg-cyan-900/30
                            flex
                            items-center
                            justify-center
                            text-xl
                        "
                                    >

                                        📊

                                    </div>

                                    <div>

                                        <div className="font-semibold text-slate-900 dark:text-white">

                                            نتائج التقرير

                                        </div>

                                        <div className="text-sm text-slate-500 dark:text-slate-400">

                                            معاينة مباشرة للبيانات الناتجة.

                                        </div>

                                    </div>

                                </div>

                                <div className="flex gap-3 flex-wrap">

                                    <div
                                        className="
                            rounded-xl
                            bg-slate-100
                            dark:bg-slate-800
                            px-4
                            py-2
                            text-sm
                        "
                                    >

                                        <span className="text-slate-500">

                                            Rows

                                        </span>

                                        <span className="ml-2 font-semibold">

                                            {previewRows.length}

                                        </span>

                                    </div>

                                    <div
                                        className="
                            rounded-xl
                            bg-slate-100
                            dark:bg-slate-800
                            px-4
                            py-2
                            text-sm
                        "
                                    >

                                        <span className="text-slate-500">

                                            Columns

                                        </span>

                                        <span className="ml-2 font-semibold">

                                            {previewColumns.length}

                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* Loading */}

                        {loadingPreview && (

                            <div
                                className="
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    p-12
                    text-center
                "
                            >

                                <div className="animate-pulse text-4xl mb-4">

                                    ⏳

                                </div>

                                <div className="font-medium text-slate-700 dark:text-slate-300">

                                    جاري تنفيذ التقرير...

                                </div>

                            </div>

                        )}

                        {/* Empty */}

                        {!loadingPreview && previewRows.length === 0 && (

                            <div
                                className="
                    rounded-2xl
                    border-2
                    border-dashed
                    border-slate-300
                    dark:border-slate-700
                    p-12
                    text-center
                "
                            >

                                <div className="text-5xl mb-5">

                                    📄

                                </div>

                                <h3 className="font-semibold text-slate-900 dark:text-white">

                                    لا توجد نتائج

                                </h3>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                                    قم بتشغيل التقرير أو عدّل الفلاتر للحصول على بيانات.

                                </p>

                            </div>

                        )}

                        {/* Data Grid */}

                        {!loadingPreview && previewRows.length > 0 && (

                            <div
                                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                "
                            >

                                <div
                                    className="
                        max-h-[600px]
                        overflow-auto
                    "
                                >

                                    <table className="min-w-full text-sm">

                                        <thead
                                            className="
                                sticky
                                top-0
                                z-20
                                bg-slate-100
                                dark:bg-slate-800
                            "
                                        >

                                            <tr>

                                                {previewColumns.map(col => (

                                                    <th
                                                        key={`${col.id}-${JSON.stringify(col.path || [])}`}
                                                        className="
                                            whitespace-nowrap
                                            border-b
                                            border-slate-200
                                            dark:border-slate-700
                                            px-5
                                            py-4
                                            text-left
                                            font-semibold
                                        "
                                                    >

                                                        {col.label || col.name}

                                                    </th>

                                                ))}

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {previewRows.map((row, rowIndex) => (

                                                <tr
                                                    key={row.id ?? rowIndex}
                                                    className="
                                        even:bg-slate-50
                                        dark:even:bg-slate-800/40
                                        hover:bg-cyan-50
                                        dark:hover:bg-cyan-900/10
                                        transition-colors
                                    "
                                                >

                                                    {previewColumns.map(col => (

                                                        <td
                                                            key={`${col.id}-${JSON.stringify(col.path || [])}`}
                                                            className="
                                                whitespace-nowrap
                                                border-b
                                                border-slate-100
                                                dark:border-slate-800
                                                px-5
                                                py-3
                                                text-slate-700
                                                dark:text-slate-300
                                            "
                                                        >

                                                            {renderCellValue(row[col.id])}

                                                        </td>

                                                    ))}

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        )}

                    </div>

                </SectionCard>

            </div>

            {/* ================= Save Report Dialog ================= */}

            {
                saveModalOpen && (

                    <div
                        className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/60
                backdrop-blur-sm
                p-6
            "
                    >

                        <div
                            className="
                    w-full
                    max-w-2xl
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                    shadow-2xl
                    animate-in
                    fade-in
                    zoom-in-95
                "
                        >

                            {/* Header */}

                            <div
                                className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-200
                        dark:border-slate-700
                        px-8
                        py-6
                    "
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                                h-14
                                w-14
                                rounded-2xl
                                bg-emerald-100
                                dark:bg-emerald-900/30
                                flex
                                items-center
                                justify-center
                                text-2xl
                            "
                                    >

                                        💾

                                    </div>

                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                                            {report.id
                                                ? "تحديث التقرير"
                                                : "حفظ التقرير"}

                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                                            سيتم حفظ إعدادات التقرير الحالية لاستخدامها لاحقاً.

                                        </p>

                                    </div>

                                </div>

                                <button
                                    onClick={() => setSaveModalOpen(false)}
                                    className="
                            rounded-xl
                            p-2
                            text-slate-500
                            hover:bg-slate-100
                            dark:hover:bg-slate-800
                            transition
                        "
                                >

                                    ✕

                                </button>

                            </div>

                            {/* Body */}

                            <div className="space-y-6 p-8">

                                {/* Name */}

                                <div>

                                    <label
                                        className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-slate-700
                                dark:text-slate-300
                            "
                                    >

                                        اسم التقرير

                                    </label>

                                    <input
                                        disabled={!canWrite}
                                        value={reportName}
                                        onChange={(e) =>
                                            setReportName(e.target.value)
                                        }
                                        placeholder="مثال: تقرير المبيعات الشهري"
                                        className="
                                w-full
                                rounded-2xl
                                border
                                border-slate-300
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-950
                                px-5
                                py-3
                                outline-none
                                transition
                                focus:border-emerald-500
                                focus:ring-4
                                focus:ring-emerald-500/10
                            "
                                    />

                                </div>

                                {/* Description */}

                                <div>

                                    <label
                                        className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-slate-700
                                dark:text-slate-300
                            "
                                    >

                                        الوصف

                                    </label>

                                    <textarea
                                        disabled={!canWrite}
                                        rows={5}
                                        value={reportDescription}
                                        onChange={(e) =>
                                            setReportDescription(e.target.value)
                                        }
                                        placeholder="اكتب وصفاً مختصراً للتقرير..."
                                        className="
                                w-full
                                resize-none
                                rounded-2xl
                                border
                                border-slate-300
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-950
                                px-5
                                py-3
                                outline-none
                                transition
                                focus:border-emerald-500
                                focus:ring-4
                                focus:ring-emerald-500/10
                            "
                                    />

                                </div>

                                {/* Info Card */}

                                <div
                                    className="
                            rounded-2xl
                            border
                            border-emerald-200
                            dark:border-emerald-900
                            bg-emerald-50
                            dark:bg-emerald-900/10
                            p-5
                        "
                                >

                                    <div className="flex items-start gap-3">

                                        <div className="text-xl">

                                            ℹ️

                                        </div>

                                        <div>

                                            <div className="font-semibold text-emerald-700 dark:text-emerald-300">

                                                ماذا سيتم حفظ؟

                                            </div>

                                            <ul
                                                className="
                                        mt-2
                                        list-disc
                                        space-y-1
                                        pl-5
                                        text-sm
                                        text-emerald-700/90
                                        dark:text-emerald-300/90
                                    "
                                            >

                                                <li>الأعمدة المختارة.</li>
                                                <li>الفلاتر.</li>
                                                <li>العلاقات.</li>
                                                <li>التجميع.</li>
                                                <li>الفرز.</li>
                                                <li>الحقول المحسوبة.</li>

                                            </ul>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* Footer */}

                            <div
                                className="
                        flex
                        items-center
                        justify-end
                        gap-3
                        border-t
                        border-slate-200
                        dark:border-slate-700
                        bg-slate-50
                        dark:bg-slate-950/40
                        px-8
                        py-5
                    "
                            >

                                <button
                                    onClick={() =>
                                        setSaveModalOpen(false)
                                    }
                                    className="
                            rounded-xl
                            border
                            border-slate-300
                            dark:border-slate-700
                            px-5
                            py-2.5
                            transition
                            hover:bg-slate-100
                            dark:hover:bg-slate-800
                        "
                                >

                                    إلغاء

                                </button>

                                <button
                                    disabled={!canWrite || saving}
                                    onClick={saveReport}
                                    className="
                            rounded-xl
                            bg-emerald-600
                            hover:bg-emerald-700
                            px-6
                            py-2.5
                            font-medium
                            text-white
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                                >

                                    {saving
                                        ? "جاري الحفظ..."
                                        : report.id
                                            ? "تحديث التقرير"
                                            : "حفظ التقرير"}

                                </button>

                            </div>

                        </div>

                    </div>

                )

            }
        </div>
    );

}