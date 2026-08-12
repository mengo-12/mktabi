// التصميم القديم

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "next/navigation";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import apiClient from "@/services/apiClient";
// import reportService from "../services/reportService";

// import { useAuth } from "@/context/AuthContext";

// import { Plus, ArrowRight, } from "lucide-react";

// import dashboardWidgetService from "../services/dashboardWidgetService";
// import dashboardService from "../services/dashboardService";

// import { Responsive, WidthProvider } from "react-grid-layout";

// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const ResponsiveGridLayout = WidthProvider(Responsive);

// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";

// import {
//     BarChart,
//     Bar,
//     LineChart,
//     Line,
//     PieChart,
//     Pie,
//     Cell,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     ResponsiveContainer,
//     RadialBarChart,
//     RadialBar,
//     Legend,
// } from "recharts";

// import {
//     X,
//     Pencil,
//     Search,
//     ChevronLeft,
//     ChevronRight,
//     ArrowUpDown,
//     FileSpreadsheet,
//     FileText,
//     FileDown,
// } from "lucide-react";

// export default function DashboardCanvasPage() {

//     const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

//     const [reports, setReports] = useState([]);

//     const [widgetForm, setWidgetForm] = useState({ title: "", widget_type: "table", report_id: "", });

//     const [editingWidget, setEditingWidget] = useState(null);

//     const [isSettingsOpen, setIsSettingsOpen] = useState(false);

//     const [widgetSettings, setWidgetSettings] = useState({
//         showTitle: true,
//         showExport: true,
//         pageSize: 10,
//         autoRefresh: 0,
//         color: "#3b82f6",
//         display: "default",
//     });

//     const [globalFilters, setGlobalFilters] = useState({
//         dateFrom: "",
//         dateTo: "",
//         lawyer: "",
//         client: "",
//         caseType: "",
//         status: "",
//     });

//     const [isGlobalFilterOpen, setIsGlobalFilterOpen] =
//         useState(false);

//     const [tables, setTables] =
//         useState([]);

//     const [filterMapping, setFilterMapping] = useState({});

//     const [filterOptions, setFilterOptions] = useState({});

//     const { id } = useParams();

//     const { user } = useAuth();

//     const pagePermission =
//         user?.role?.toLowerCase() === "admin" ||
//             user?.is_superuser
//             ? "write"
//             : (user?.system_pages?.["dashboard-builder"] || "no_access");

//     const canRead =
//         pagePermission === "read" ||
//         pagePermission === "write";

//     const canWrite =
//         pagePermission === "write";

//     const [dashboard, setDashboard] = useState(null);

//     const [loading, setLoading] = useState(true);

//     const [widgets, setWidgets] = useState([]);

//     const [layouts, setLayouts] = useState({ lg: [], });

//     const [datasources, setDatasources] = useState([]);

//     const [dashboardFilters, setDashboardFilters] = useState([]);

//     const [filterModalOpen, setFilterModalOpen] =
//         useState(false);

//     useEffect(() => {
//         setLayouts({
//             lg: widgets.map(widget => ({
//                 i: String(widget.id),
//                 x: widget.x,
//                 y: widget.y,
//                 w: widget.w,
//                 h: widget.h,
//             })),
//         });
//     }, [widgets]);



//     useEffect(() => {

//         loadDashboard();

//     }, [id]);

//     const router = useRouter();

//     useEffect(() => {
//         if (!user) return;

//         if (!canRead) {
//             router.replace("/dashboard");
//         }
//     }, [user, canRead, router]);


//     const loadWidgets = async (dashboardId) => {

//         const data =
//             await dashboardWidgetService.getWidgets(dashboardId);


//         setWidgets(data);

//     };


//     const loadReports = async () => {
//         try {
//             const data = await reportService.getReports();
//             setReports(data);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const loadDashboard = async () => {

//         try {

//             const data =
//                 await dashboardService.getDashboard(id);


//             const mapping =
//                 data.global_filter_mapping || {};


//             setDashboard(data);

//             setFilterMapping(mapping);


//             await loadGlobalFilterOptions(mapping);


//             await loadWidgets(data.id);

//             await loadDatasources();


//         } finally {

//             setLoading(false);

//         }

//     };

//     const createWidget = async () => {

//         if (!canWrite) return;

//         try {

//             if (editingWidget) {

//                 await dashboardWidgetService.updateWidget(
//                     editingWidget.id,
//                     {
//                         title: widgetForm.title,
//                         widget_type: widgetForm.widget_type,
//                         report_id: Number(widgetForm.report_id),

//                         config: editingWidget.config,
//                     }
//                 );

//             } else {

//                 await dashboardWidgetService.createWidget({
//                     dashboard_id: dashboard.id,
//                     title: widgetForm.title,
//                     widget_type: widgetForm.widget_type,
//                     report_id: Number(widgetForm.report_id),

//                     config: {
//                         showTitle: true,
//                         color: "#3b82f6",
//                         pageSize: 10,
//                         autoRefresh: 0,
//                         showExport: true,
//                         display: "default",
//                     },

//                     x: 0,
//                     y: 0,
//                     w: 4,
//                     h: 3,
//                 });

//             }

//             setEditingWidget(null);

//             setIsWidgetModalOpen(false);

//             loadWidgets(dashboard.id);

//         } catch (err) {

//             console.error(err);

//         }

//     };


//     const saveLayout = async (layout) => {

//         if (!canWrite) return;

//         for (const item of layout) {

//             await dashboardWidgetService.updateWidget(item.i, {
//                 x: item.x,
//                 y: item.y,
//                 w: item.w,
//                 h: item.h,
//             });

//         }

//     };

//     const loadDatasources = async () => {

//         const { data } =
//             await apiClient.get(
//                 "/report-builder/datasources"
//             );

//         setDatasources(data);

//     };

//     const editWidget = async (widget) => {

//         if (!canWrite) return;

//         await loadReports();

//         setEditingWidget(widget);

//         setWidgetForm({
//             title: widget.title,
//             widget_type: widget.widget_type,
//             report_id: String(widget.report_id),
//         });

//         setIsWidgetModalOpen(true);

//     };

//     const openWidgetSettings = (widget) => {

//         if (!canWrite) return;


//         setEditingWidget(widget);

//         setWidgetSettings({
//             showTitle: widget.config?.showTitle ?? true,
//             showExport: widget.config?.showExport ?? true,
//             pageSize: widget.config?.pageSize ?? 10,
//             autoRefresh: widget.config?.autoRefresh ?? 0,
//             color: widget.config?.color ?? "#3b82f6",
//             display: widget.config?.display ?? "default",
//         });

//         setIsSettingsOpen(true);

//     };

//     const openGlobalFilters = async () => {

//         const data =
//             await apiClient.get(
//                 "/report-builder/datasources"
//             );

//         setTables(data.data);

//         setIsGlobalFilterOpen(true);

//     };

//     const loadGlobalFilterOptions = async (mapping) => {

//         const options = {};

//         const filters = mapping?.filters || [];

//         for (const filter of (mapping.filters || [])) {


//             if (!filter.table_id || !filter.column_id)
//                 continue;

//             const tableId = filter.table_id;
//             const columnId = filter.column_id;



//             try {


//                 const { data } = await apiClient.post(
//                     "/report-builder/run",
//                     {
//                         table_id: Number(tableId),

//                         columns: [
//                             {
//                                 id: columnId,
//                                 name: filter.label,
//                                 type: filter.type || "text",
//                                 path: filter.path || [],
//                             }
//                         ],

//                         relations: filter.relation
//                             ? [
//                                 {
//                                     column_id: columnId,
//                                     table_id: filter.relation.table_id,
//                                 }
//                             ]
//                             : [],

//                         filters: [],

//                         global_filters: {},

//                         global_filter_mapping: {
//                             filters: [],
//                         },

//                         groupBy: "",

//                         sorting: [],

//                         visualization: {
//                             type: "table"
//                         }
//                     }
//                 );



//                 options[filter.id] = [
//                     ...new Set(

//                         data.rows.map(row => {

//                             const val =
//                                 row[columnId];


//                             if (Array.isArray(val)) {

//                                 return val[0]?.display;

//                             }


//                             return val;

//                         })

//                     )
//                 ];


//             }
//             catch (error) {

//                 console.error(
//                     "Filter loading error",
//                     filter.id,
//                     error
//                 );

//             }

//         }



//         setFilterOptions(options);

//     };

//     if (!canRead) {
//         return (
//             <div className="flex items-center justify-center h-screen">
//                 ليس لديك صلاحية للوصول إلى Dashboard
//             </div>
//         );
//     }

//     if (loading) {

//         return (
//             <div className="mr-64 p-6">
//                 Loading...
//             </div>
//         );

//     }

//     if (!dashboard) {

//         return (
//             <div className="mr-64 p-6">
//                 Dashboard غير موجود
//             </div>
//         );

//     }

//     const layoutReady = layouts.lg.length === widgets.length;

//     return (

//         <div className="mr-64 p-6 space-y-6"><div className="flex items-center justify-between">

//             <div>

//                 <div className="flex items-center gap-3">

//                     <Link
//                         href="/dashboard/dashboard-builder"
//                         className="p-2 rounded-lg border"
//                     >
//                         <ArrowRight size={18} />
//                     </Link>

//                     <div
//                         className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
//                         style={{ background: dashboard.color }}
//                     >
//                         {dashboard.icon}
//                     </div>

//                     <div>

//                         <h1 className="text-2xl font-bold">
//                             {dashboard.name}
//                         </h1>

//                         <p className="text-slate-500">
//                             {dashboard.description}
//                         </p>

//                     </div>

//                 </div>

//             </div>

//             <button
//                 disabled={!canWrite}
//                 onClick={async () => {

//                     if (!canWrite) return;

//                     await loadReports();

//                     setEditingWidget(null);

//                     setWidgetForm({
//                         title: "",
//                         widget_type: "table",
//                         report_id: "",
//                     });

//                     setIsWidgetModalOpen(true);
//                 }}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
//             >
//                 <Plus size={18} />
//                 Add Widget
//             </button>

//             <button
//                 disabled={!canWrite}
//                 onClick={() => canWrite && setFilterModalOpen(true)}
//                 className="px-4 py-2 rounded-lg border border-slate-700"
//             >

//                 Configure Filters

//             </button>

//             <div className="flex gap-3 flex-wrap">

//                 {(filterMapping.filters || []).map((filter) => (

//                     <select
//                         key={filter.id}
//                         value={globalFilters[filter.id] || ""}
//                         // onChange={(e) => {

//                         //     setGlobalFilters({
//                         //         ...globalFilters,
//                         //         [filter.id]: e.target.value,
//                         //     });

//                         // }}

//                         onChange={(e) => {

//                             const newFilters = {
//                                 ...globalFilters,
//                                 [filter.id]: e.target.value,
//                             };

//                             setGlobalFilters(newFilters);

//                         }}
//                         className="
//                 rounded-lg
//                 bg-slate-950
//                 border
//                 border-slate-700
//                 px-3
//                 py-2
//             "
//                     >

//                         <option value="">
//                             {filter.label || "الكل"}
//                         </option>

//                         {(filterOptions[filter.id] || []).map((item, index) => (

//                             <option
//                                 key={index}
//                                 value={item}
//                             >
//                                 {item}
//                             </option>

//                         ))}

//                     </select>

//                 ))}

//             </div>

//         </div>

//             <div className="w-full">

//                 {layoutReady && (

//                     <ResponsiveGridLayout

//                         // layouts={layouts}

//                         layouts={{
//                             lg: layouts.lg,
//                             md: layouts.lg,
//                             sm: layouts.lg,
//                             xs: layouts.lg,
//                         }}

//                         breakpoints={{
//                             lg: 1200,
//                             md: 996,
//                             sm: 768,
//                             xs: 480,
//                         }}

//                         cols={{
//                             lg: 12,
//                             md: 10,
//                             sm: 6,
//                             xs: 2,
//                         }}

//                         rowHeight={35}

//                         isDraggable={canWrite}

//                         isResizable={canWrite}

//                         compactType={null}

//                         useCSSTransforms={false}

//                         preventCollision={false}

//                         draggableHandle=".widget-header"
//                         draggableCancel=".no-drag"

//                         onLayoutChange={(layout) => {
//                             setLayouts({ lg: layout });
//                         }}

//                         onResizeStop={(layout) => saveLayout(layout)}

//                         onDragStop={(layout) => saveLayout(layout)}

//                     >

//                         {widgets.length === 0 && (

//                             <div
//                                 className="
//                 col-span-12
//                 rounded-xl
//                 border-2
//                 border-dashed
//                 border-slate-700
//                 h-[500px]
//                 flex
//                 items-center
//                 justify-center
//             "
//                             >

//                                 <div className="text-center">

//                                     <div className="text-6xl mb-5">
//                                         📊
//                                     </div>

//                                     <h2 className="text-xl font-semibold">
//                                         Dashboard Canvas
//                                     </h2>

//                                     <p className="text-slate-500 mt-2">
//                                         لا توجد Widgets حتى الآن
//                                     </p>

//                                 </div>

//                             </div>

//                         )}

//                         {widgets.map(widget => (

//                             <div
//                                 key={widget.id}
//                                 className="
//                                     rounded-2xl
//                                     border
//                                     border-slate-800
//                                     bg-slate-900
//                                     shadow-lg
//                                     overflow-hidden
//                                     transition-all
//                                     hover:border-blue-500/40
//                                 "
//                             >

//                                 {widget.config?.showTitle !== false && (
//                                     <div className="widget-header flex items-center justify-between px-5 py-3 cursor-move border-b border-slate-800">

//                                         <div className="font-semibold">
//                                             {widget.title}
//                                         </div>

//                                         <div className="flex items-center gap-2">

//                                             <button
//                                                 disabled={!canWrite}
//                                                 onClick={() => canWrite && openWidgetSettings(widget)}
//                                                 className="no-drag p-2 rounded hover:bg-slate-800"
//                                             >
//                                                 ⚙️
//                                             </button>

//                                             <button
//                                                 disabled={!canWrite}
//                                                 onClick={() => canWrite && editWidget(widget)}
//                                                 className="no-drag p-2 rounded hover:bg-slate-800"
//                                             >
//                                                 <Pencil size={18} />
//                                             </button>

//                                             <button
//                                                 disabled={!canWrite}
//                                                 onClick={async () => {

//                                                     if (!canWrite) return;

//                                                     await dashboardWidgetService.duplicateWidget(widget.id);

//                                                     loadWidgets(dashboard.id);

//                                                 }}
//                                                 className="no-drag p-2 rounded hover:bg-slate-800"
//                                             >

//                                                 📄

//                                             </button>

//                                             <button
//                                                 disabled={!canWrite}
//                                                 onClick={async () => {

//                                                     if (!confirm("حذف الـ Widget؟"))
//                                                         return;

//                                                     await dashboardWidgetService.deleteWidget(widget.id);

//                                                     loadWidgets(dashboard.id);

//                                                 }}
//                                                 className="no-drag p-2 rounded hover:bg-red-600/20 text-red-400"
//                                             >
//                                                 <X size={18} />
//                                             </button>

//                                         </div>

//                                     </div>
//                                 )}

//                                 <div className="p-5">
//                                     {widget.widget_type === "table" ? (

//                                         <TableWidget
//                                             widget={widget}
//                                             globalFilters={globalFilters}
//                                             filterMapping={filterMapping}
//                                         />

//                                     ) : (

//                                         <ChartLoader
//                                             widget={widget}
//                                             globalFilters={globalFilters}
//                                             filterMapping={filterMapping}
//                                         />

//                                     )}

//                                 </div>

//                             </div>

//                         ))}

//                     </ResponsiveGridLayout>
//                 )}
//             </div>

//             <AddWidgetModal
//                 canWrite={canWrite}
//                 open={isWidgetModalOpen}
//                 onClose={() => {
//                     setEditingWidget(null);
//                     setIsWidgetModalOpen(false);
//                 }}
//                 reports={reports}
//                 widgetForm={widgetForm}
//                 setWidgetForm={setWidgetForm}
//                 onCreate={createWidget}
//                 editingWidget={editingWidget}
//             />

//             <WidgetSettingsModal
//                 open={isSettingsOpen}
//                 onClose={() => setIsSettingsOpen(false)}
//                 settings={widgetSettings}
//                 setSettings={setWidgetSettings}
//                 widget={editingWidget}
//                 dashboardId={dashboard.id}
//                 reload={() => loadWidgets(dashboard.id)}
//                 canWrite={canWrite}
//             />

//             <ConfigureDashboardFiltersModal

//                 open={filterModalOpen}

//                 onClose={() =>
//                     setFilterModalOpen(false)
//                 }

//                 datasources={datasources}

//                 mapping={filterMapping}

//                 setMapping={setFilterMapping}

//                 dashboard={dashboard}

//                 reload={loadDashboard}
//                 canWrite={canWrite}

//             />

//         </div >


//     );

// }

// function WidgetSettingsModal({

//     open,

//     onClose,

//     settings,

//     setSettings,

//     widget,

//     reload,

//     canWrite,

// }) {

//     if (!open || !widget)
//         return null;

//     const save = async () => {

//         if (!canWrite) return;

//         await dashboardWidgetService.updateWidget(
//             widget.id,
//             {
//                 config: settings,
//             }
//         );

//         reload();

//         onClose();

//     };

//     return (

//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

//             <div className="w-[500px] rounded-xl bg-slate-900 border border-slate-700 p-6">

//                 <h2 className="text-xl font-bold mb-6">

//                     Widget Settings

//                 </h2>

//                 <div className="space-y-5">

//                     <label className="flex items-center justify-between">

//                         <span>Show Title</span>

//                         <input
//                             type="checkbox"
//                             checked={settings.showTitle}
//                             onChange={(e) =>

//                                 setSettings({
//                                     ...settings,
//                                     showTitle: e.target.checked
//                                 })

//                             }
//                         />

//                     </label>

//                     <label className="flex items-center justify-between">

//                         <span>Show Export</span>

//                         <input
//                             type="checkbox"
//                             checked={settings.showExport}
//                             onChange={(e) =>

//                                 setSettings({
//                                     ...settings,
//                                     showExport: e.target.checked
//                                 })

//                             }
//                         />

//                     </label>

//                     <div>

//                         <div className="mb-2">

//                             Page Size

//                         </div>

//                         <input
//                             type="number"
//                             value={settings.pageSize}
//                             onChange={(e) =>

//                                 setSettings({

//                                     ...settings,

//                                     pageSize: Number(e.target.value)

//                                 })

//                             }
//                             className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
//                         />

//                     </div>

//                     <div>

//                         <div className="mb-2">

//                             Auto Refresh

//                         </div>

//                         <select
//                             value={settings.autoRefresh}
//                             onChange={(e) =>

//                                 setSettings({

//                                     ...settings,

//                                     autoRefresh: Number(e.target.value)

//                                 })

//                             }
//                             className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
//                         >

//                             <option value={0}>Disabled</option>

//                             <option value={30}>30 sec</option>

//                             <option value={60}>1 min</option>

//                             <option value={300}>5 min</option>

//                         </select>

//                     </div>

//                     <div>

//                         <div className="mb-2">

//                             Color

//                         </div>

//                         <input
//                             type="color"
//                             value={settings.color}
//                             onChange={(e) =>

//                                 setSettings({

//                                     ...settings,

//                                     color: e.target.value

//                                 })

//                             }
//                         />

//                     </div>

//                 </div>

//                 <div className="flex justify-end gap-3 mt-8">

//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 rounded border border-slate-700"
//                     >

//                         Cancel

//                     </button>

//                     <button
//                         disabled={!canWrite}
//                         onClick={() => canWrite && save()}
//                         className="px-4 py-2 rounded bg-blue-600"
//                     >

//                         Save

//                     </button>

//                 </div>

//             </div>

//         </div>

//     );

// }



// function AddWidgetModal({
//     open,
//     onClose,
//     reports,
//     widgetForm,
//     setWidgetForm,
//     onCreate,
//     editingWidget,
//     canWrite,
// }) {

//     if (!open) return null;

//     return (

//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

//             <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-6">

//                 <h2 className="text-xl font-bold mb-6">
//                     {editingWidget ? "تعديل Widget" : "إضافة Widget"}
//                 </h2>

//                 <div className="space-y-4">

//                     <input
//                         value={widgetForm.title}
//                         onChange={(e) =>
//                             setWidgetForm({
//                                 ...widgetForm,
//                                 title: e.target.value
//                             })
//                         }
//                         placeholder="عنوان الـ Widget"
//                         className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
//                     />

//                     <select
//                         value={widgetForm.widget_type}
//                         onChange={(e) =>
//                             setWidgetForm({
//                                 ...widgetForm,
//                                 widget_type: e.target.value
//                             })
//                         }
//                         className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
//                     >

//                         <option value="table">Table</option>
//                         <option value="kpi">KPI</option>
//                         <option value="bar">Bar Chart</option>
//                         <option value="line">Line Chart</option>
//                         <option value="pie">Pie Chart</option>

//                     </select>

//                     <select
//                         value={widgetForm.report_id}
//                         onChange={(e) =>
//                             setWidgetForm({
//                                 ...widgetForm,
//                                 report_id: e.target.value
//                             })
//                         }
//                         className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
//                     >

//                         <option value="">

//                             اختر التقرير

//                         </option>

//                         {reports.map(report => (

//                             <option
//                                 key={report.id}
//                                 value={report.id}
//                             >

//                                 {report.name}

//                             </option>

//                         ))}

//                     </select>

//                 </div>

//                 <div className="flex justify-end gap-3 mt-6">

//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 border border-slate-700 rounded-lg"
//                     >

//                         إلغاء

//                     </button>

//                     <button
//                         disabled={!canWrite}
//                         onClick={() => canWrite && onCreate()}
//                         className="px-4 py-2 bg-blue-600 rounded-lg text-white"
//                     >

//                         إنشاء

//                     </button>

//                 </div>

//             </div>

//         </div>

//     );

// }

// function TableWidget({
//     widget,
//     globalFilters,
//     filterMapping,
// }) {

//     const [loading, setLoading] = useState(true);

//     const [result, setResult] = useState(null);

//     const [search, setSearch] = useState("");

//     const [page, setPage] = useState(1);

//     const [sortColumn, setSortColumn] = useState("");

//     const [sortDirection, setSortDirection] = useState("asc");

//     const pageSize = widget.config?.pageSize || 10;

//     useEffect(() => {

//         load();

//         if (!widget.config?.autoRefresh)
//             return;


//     }, [
//         widget.report_id,
//         widget.config?.autoRefresh,
//         globalFilters
//     ]);

//     const load = async () => {

//         try {

//             const report =
//                 await reportService.getReport(widget.report_id);

//             const query =
//                 report.config?.query;

//             if (!query) {
//                 throw new Error("Report query not found");
//             }

//             const requestBody = {
//                 ...report.config.query,

//                 global_filters: globalFilters,

//                 global_filter_mapping: filterMapping,

//                 visualization: {
//                     ...report.config.visualization,
//                     type: widget.widget_type,
//                 },
//             };


//             const { data } = await apiClient.post(
//                 "/report-builder/run",
//                 {
//                     ...report.config.query,

//                     global_filters: globalFilters,

//                     global_filter_mapping: filterMapping,

//                     visualization: {
//                         ...report.config.visualization,
//                         type: widget.widget_type,
//                     },
//                 }
//             );


//             setResult(data);


//         } catch (err) {

//             console.error(err);

//         } finally {

//             setLoading(false);

//         }

//     };

//     const renderCell = (value) => {

//         if (value == null)
//             return "";

//         if (Array.isArray(value)) {

//             return value
//                 .map(item => {

//                     if (typeof item === "object") {
//                         return item.display;
//                     }

//                     return String(item);

//                 })
//                 .join("، ");

//         }

//         if (typeof value === "object") {
//             return value.display ?? "";
//         }

//         return String(value);

//     };


//     const filteredRows = useMemo(() => {

//         if (!result) return [];

//         return result.rows.filter(row =>
//             result.columns.some(col =>
//                 String(renderCell(row[col.id]))
//                     .toLowerCase()
//                     .includes(search.toLowerCase())
//             )
//         );

//     }, [result, search]);

//     const sortedRows = useMemo(() => {

//         if (!sortColumn) return filteredRows;

//         return [...filteredRows].sort((a, b) => {

//             const av = String(renderCell(a[sortColumn]) ?? "");

//             const bv = String(renderCell(b[sortColumn]) ?? "");

//             return sortDirection === "asc"
//                 ? av.localeCompare(bv)
//                 : bv.localeCompare(av);

//         });

//     }, [filteredRows, sortColumn, sortDirection]);

//     const totalPages =
//         Math.max(1, Math.ceil(sortedRows.length / pageSize));

//     const pageRows =
//         sortedRows.slice(
//             (page - 1) * pageSize,
//             page * pageSize
//         );

//     const sortBy = (id) => {

//         if (sortColumn === id) {

//             setSortDirection(
//                 sortDirection === "asc"
//                     ? "desc"
//                     : "asc"
//             );

//         } else {

//             setSortColumn(id);

//             setSortDirection("asc");

//         }

//     };

//     const exportCSV = () => {

//         const headers =
//             result.columns.map(c => c.name);

//         const rows =
//             sortedRows.map(row =>
//                 result.columns.map(col =>
//                     `"${renderCell(row[col.id])}"`
//                 )
//             );

//         const csv =
//             [headers, ...rows]
//                 .map(r => r.join(","))
//                 .join("\n");

//         const blob =
//             new Blob([csv], {
//                 type: "text/csv;charset=utf-8;"
//             });

//         const url =
//             URL.createObjectURL(blob);

//         const a =
//             document.createElement("a");

//         a.href = url;

//         a.download = `${widget.title}.csv`;

//         a.click();

//         URL.revokeObjectURL(url);

//     };

//     const exportExcel = () => {

//         const data =
//             sortedRows.map(row => {

//                 const obj = {};

//                 result.columns.forEach(col => {

//                     obj[col.name] =
//                         renderCell(row[col.id]);

//                 });

//                 return obj;

//             });

//         const ws =
//             XLSX.utils.json_to_sheet(data);

//         const wb =
//             XLSX.utils.book_new();

//         XLSX.utils.book_append_sheet(
//             wb,
//             ws,
//             "Report"
//         );

//         XLSX.writeFile(
//             wb,
//             `${widget.title}.xlsx`
//         );

//     };

//     const exportPDF = () => {

//         const doc =
//             new jsPDF();

//         autoTable(doc, {

//             head: [
//                 result.columns.map(c => c.name)
//             ],

//             body:
//                 sortedRows.map(row =>
//                     result.columns.map(col =>
//                         renderCell(row[col.id])
//                     )
//                 ),

//             styles: {
//                 fontSize: 8,
//             },

//         });

//         doc.save(`${widget.title}.pdf`);

//     };

//     if (loading) {

//         return <div>Loading...</div>;

//     }

//     if (!result) {

//         return <div>No Data</div>;

//     }


//     return (

//         <div className="space-y-3 h-full flex flex-col">

//             <div className="flex items-center justify-between gap-3">

//                 <div className="relative w-full">

//                     <Search
//                         size={16}
//                         className="absolute left-3 top-3 text-slate-400"
//                     />

//                     <input
//                         value={search}
//                         onChange={(e) => {

//                             setSearch(e.target.value);

//                             setPage(1);

//                         }}
//                         placeholder="بحث..."
//                         className="w-full rounded-lg bg-slate-950 border border-slate-700 pl-10 pr-3 py-2"
//                     />

//                 </div>

//                 <div className="text-sm text-slate-400 whitespace-nowrap">

//                     {sortedRows.length} نتيجة

//                 </div>

//             </div>

//             <div className="overflow-auto rounded-lg border border-slate-800 flex-1 max-h-[420px]">

//                 <table className="w-full border-collapse">

//                     <thead className="sticky top-0 bg-slate-900 z-20">

//                         <tr>

//                             <th className="border px-3 py-2 w-14">

//                                 #

//                             </th>

//                             {result.columns.map((col, index) => (

//                                 <th
//                                     key={`header-${col.id}-${index}`}
//                                     onClick={() => sortBy(col.id)}
//                                     className="border px-3 py-2 text-right cursor-pointer hover:bg-slate-800"
//                                 >
//                                     <div className="flex items-center gap-2">
//                                         {col.name}
//                                         <ArrowUpDown size={14} />
//                                     </div>
//                                 </th>

//                             ))}

//                         </tr>

//                     </thead>

//                     <tbody>

//                         {pageRows.map((row, index) => (

//                             <tr
//                                 key={index}
//                                 className="odd:bg-slate-900 even:bg-slate-950 hover:bg-slate-800"
//                             >

//                                 <td className="border px-3 py-2">

//                                     {(page - 1) * pageSize + index + 1}

//                                 </td>

//                                 {result.columns.map((col, colIndex) => (

//                                     <td
//                                         key={`cell-${col.id}-${colIndex}`}
//                                         className="border px-3 py-2"
//                                     >

//                                         {renderCell(row[col.id])}

//                                     </td>

//                                 ))}

//                             </tr>

//                         ))}

//                     </tbody>

//                 </table>

//             </div>

//             <div className="flex items-center justify-between">

//                 {widget.config?.showExport !== false && (

//                     <div className="flex gap-2">

//                         <button
//                             onClick={exportExcel}
//                             className="border rounded px-2 py-1 hover:bg-slate-800"
//                         >
//                             <FileSpreadsheet size={16} />
//                         </button>

//                         <button
//                             onClick={exportCSV}
//                             className="border rounded px-2 py-1 hover:bg-slate-800"
//                         >
//                             <FileText size={16} />
//                         </button>

//                         <button
//                             onClick={exportPDF}
//                             className="border rounded px-2 py-1 hover:bg-slate-800"
//                         >
//                             <FileDown size={16} />
//                         </button>

//                     </div>

//                 )}

//                 <div className="flex items-center gap-2">

//                     <button
//                         disabled={page === 1}
//                         onClick={() => setPage(page - 1)}
//                         className="border rounded p-2 disabled:opacity-40"
//                     >

//                         <ChevronRight size={16} />

//                     </button>

//                     <span>

//                         {page} / {totalPages}

//                     </span>

//                     <button
//                         disabled={page === totalPages}
//                         onClick={() => setPage(page + 1)}
//                         className="border rounded p-2 disabled:opacity-40"
//                     >

//                         <ChevronLeft size={16} />

//                     </button>

//                 </div>

//             </div>

//         </div>

//     );

// }

// function prepareChartData(result) {

//     if (!result?.rows?.length) return [];

//     const groupColumn =
//         result.columns.find(c =>
//             c.type === "dropdown" ||
//             c.type === "text"
//         ) || result.columns[0];

//     const map = {};

//     result.rows.forEach(row => {

//         let value = row[groupColumn.id];

//         if (Array.isArray(value))
//             value = value.join(",");

//         value = value || "غير محدد";

//         map[value] = (map[value] || 0) + 1;

//     });

//     return Object.entries(map).map(([name, value]) => ({
//         name,
//         value,
//     }));

// }

// const COLORS = [
//     "#3b82f6",
//     "#22c55e",
//     "#f59e0b",
//     "#ef4444",
//     "#8b5cf6",
//     "#06b6d4",
//     "#14b8a6",
//     "#f97316",
//     "#ec4899",
//     "#84cc16",
// ];

// function ChartLoader({
//     widget,
//     globalFilters,
//     filterMapping,
// }) {

//     const [loading, setLoading] = useState(true);

//     const [result, setResult] = useState(null);

//     useEffect(() => {

//         load();

//         if (!widget.config?.autoRefresh)
//             return;

//         const interval = setInterval(() => {

//             load();

//         }, widget.config.autoRefresh * 1000);

//         return () => clearInterval(interval);

//     }, [
//         widget.report_id,
//         widget.widget_type,
//         widget.config?.autoRefresh,
//         globalFilters
//     ]);

//     const load = async () => {

//         const report =
//             await reportService.getReport(widget.report_id);


//         const { data } = await apiClient.post(
//             "/report-builder/run",
//             {
//                 ...report.config.query,

//                 global_filters: globalFilters,

//                 global_filter_mapping: filterMapping,

//                 visualization: {
//                     ...report.config.visualization,
//                     type: widget.widget_type,
//                 },
//             }
//         );

//         setResult(data);

//         setLoading(false);

//     };

//     if (loading)
//         return <div>Loading...</div>;

//     const chartType = widget.widget_type;

//     const chartColor = widget.config?.color || "#3b82f6";

//     const CustomTooltip = ({ active, payload }) => {

//         if (!active || !payload?.length) return null;

//         return (
//             <div className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 shadow-xl">
//                 <div className="font-semibold">
//                     {payload[0].name}
//                 </div>

//                 <div className="text-blue-400">
//                     {payload[0].value}
//                 </div>
//             </div>
//         );

//     };


//     if (chartType === "kpi") {

//         const total = result.rows.length;

//         const preview = result.rows.slice(0, 3);

//         return (

//             <div className="h-full flex flex-col justify-between">

//                 <div className="flex items-center justify-between">

//                     <div>

//                         <div className="text-slate-400 text-sm">

//                             إجمالي السجلات

//                         </div>

//                         <div className="text-5xl font-bold mt-2">

//                             {total}

//                         </div>

//                     </div>

//                     <ResponsiveContainer
//                         width={120}
//                         height={120}
//                     >

//                         <RadialBarChart
//                             innerRadius="70%"
//                             outerRadius="100%"
//                             data={[
//                                 {
//                                     name: "Rows",
//                                     value: total,
//                                     fill: chartColor
//                                 },
//                             ]}
//                             startAngle={90}
//                             endAngle={-270}
//                         >

//                             <RadialBar
//                                 dataKey="value"
//                                 cornerRadius={10}
//                             />

//                         </RadialBarChart>

//                     </ResponsiveContainer>

//                 </div>

//                 <div className="mt-6 border-t border-slate-800 pt-4">

//                     <div className="text-xs text-slate-400 mb-3">

//                         أول السجلات

//                     </div>

//                     <div className="space-y-2">

//                         {preview.map((row, index) => (

//                             <div
//                                 key={index}
//                                 className="rounded-lg bg-slate-800 px-3 py-2 text-sm"
//                             >

//                                 #{index + 1}

//                             </div>

//                         ))}

//                     </div>

//                 </div>

//             </div>

//         );

//     }

//     const chartData = prepareChartData(result);

//     // const chartType = widget.widget_type;



//     if (!chartData.length) {
//         return (
//             <div className="text-center py-10">
//                 لا توجد بيانات
//             </div>
//         );
//     }

//     if (chartType === "bar") {

//         return (

//             <ResponsiveContainer width="100%" height={320}>
//                 <BarChart
//                     data={chartData}
//                     margin={{
//                         top: 20,
//                         right: 20,
//                         left: 0,
//                         bottom: 10,
//                     }}
//                 >
//                     <CartesianGrid
//                         strokeDasharray="3 3"
//                         vertical={false}
//                         stroke="#334155"
//                     />

//                     <XAxis
//                         dataKey="name"
//                         tick={{ fill: "#cbd5e1", fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                     />

//                     <YAxis
//                         tick={{ fill: "#cbd5e1", fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                     />

//                     <Tooltip content={<CustomTooltip />} />

//                     <Bar
//                         dataKey="value"
//                         radius={[8, 8, 0, 0]}
//                         fill={chartColor}
//                     >
//                         {chartData.map((entry, index) => (
//                             <Cell
//                                 key={index}
//                                 fill={COLORS[index % COLORS.length]}
//                             />
//                         ))}
//                     </Bar>

//                 </BarChart>
//             </ResponsiveContainer>

//         );

//     }

//     if (chartType === "line") {

//         return (

//             <ResponsiveContainer width="100%" height={320}>
//                 <LineChart
//                     data={chartData}
//                     margin={{
//                         top: 20,
//                         right: 20,
//                         left: 0,
//                         bottom: 10,
//                     }}
//                 >

//                     <CartesianGrid
//                         strokeDasharray="3 3"
//                         vertical={false}
//                         stroke="#334155"
//                     />

//                     <XAxis
//                         dataKey="name"
//                         tick={{ fill: "#cbd5e1" }}
//                         axisLine={false}
//                         tickLine={false}
//                     />

//                     <YAxis
//                         tick={{ fill: "#cbd5e1" }}
//                         axisLine={false}
//                         tickLine={false}
//                     />

//                     <Tooltip content={<CustomTooltip />} />

//                     <Line
//                         type="monotone"
//                         dataKey="value"
//                         stroke={chartColor}
//                         strokeWidth={3}
//                         dot={{ r: 4 }}
//                         activeDot={{ r: 8 }}
//                     />

//                 </LineChart>
//             </ResponsiveContainer>

//         );

//     }

//     if (chartType === "pie") {

//         return (

//             <ResponsiveContainer width="100%" height={320}>
//                 <PieChart>

//                     <Pie
//                         data={chartData}
//                         dataKey="value"
//                         nameKey="name"
//                         innerRadius={60}
//                         outerRadius={95}
//                         paddingAngle={3}
//                         label
//                         fill={chartColor}
//                     >

//                         {chartData.map((entry, index) => (
//                             <Cell
//                                 key={index}
//                                 fill={
//                                     widget.config?.color
//                                     || COLORS[index % COLORS.length]
//                                 }
//                             />
//                         ))}

//                     </Pie>

//                     <Tooltip content={<CustomTooltip />} />

//                     <Legend />

//                 </PieChart>
//             </ResponsiveContainer>

//         );

//     }

//     return null;
// }

// function ConfigureDashboardFiltersModal({

//     open,

//     onClose,

//     datasources,

//     mapping,

//     setMapping,

//     dashboard,

//     reload,

//     canWrite,

// }) {

//     if (!open)
//         return null;

//     const filters = mapping.filters || [];


//     const addFilter = () => {

//         setMapping({

//             ...mapping,

//             filters: [

//                 ...filters,

//                 {
//                     id: `filter_${Date.now()}`,
//                     label: "",
//                     table_id: "",
//                     column_id: "",
//                     type: "select"
//                 }

//             ]

//         });

//     };

//     const getRelation = (tableId, columnId) => {
//         const table = datasources
//             .flatMap(section => section.tables)
//             .find(t => t.id === Number(tableId));

//         if (!table) return null;

//         return table.relations.find(r => r.column_id === columnId);
//     };

//     const save = async () => {

//         await dashboardService.updateDashboard(

//             dashboard.id,

//             {

//                 global_filter_mapping:

//                     mapping,

//             }

//         );

//         reload();

//         onClose();

//     };

//     return (

//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

//             <div className="bg-slate-900 rounded-xl p-6 w-[700px]">

//                 <h2 className="text-xl font-bold mb-6">

//                     Configure Global Filters

//                 </h2>

//                 <div className="space-y-4">


//                     {
//                         filters.map((filter, index) => (

//                             <div
//                                 key={filter.id}
//                                 className="border border-slate-700 rounded-lg p-4 space-y-3"
//                             >


//                                 <input

//                                     value={filter.label}

//                                     placeholder="اسم الفلتر"

//                                     onChange={(e) => {

//                                         const newFilters = [...filters];

//                                         const columnId = e.target.value;

//                                         newFilters[index].column_id = columnId;

//                                         const relation = getRelation(
//                                             newFilters[index].table_id,
//                                             columnId
//                                         );

//                                         if (relation) {

//                                             newFilters[index].relation = {
//                                                 table_id: relation.table.id,
//                                                 table_name: relation.table.name,
//                                             };

//                                         } else {

//                                             delete newFilters[index].relation;

//                                         }

//                                         setMapping({
//                                             ...mapping,
//                                             filters: newFilters
//                                         });

//                                     }}

//                                     className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"

//                                 />



//                                 <select

//                                     value={filter.table_id}

//                                     onChange={(e) => {


//                                         const newFilters = [...filters];

//                                         newFilters[index].table_id =
//                                             Number(e.target.value);

//                                         newFilters[index].column_id = "";


//                                         setMapping({

//                                             ...mapping,

//                                             filters: newFilters

//                                         });


//                                     }}

//                                     className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"

//                                 >

//                                     <option value="">
//                                         اختر الجدول
//                                     </option>


//                                     {

//                                         datasources.map(section =>

//                                             section.tables.map(table => (

//                                                 <option

//                                                     key={table.id}

//                                                     value={table.id}

//                                                 >

//                                                     {table.name}

//                                                 </option>

//                                             ))

//                                         )

//                                     }

//                                 </select>



//                                 <select

//                                     value={filter.column_id}

//                                     onChange={(e) => {


//                                         const newFilters = [...filters];

//                                         newFilters[index].column_id = e.target.value;


//                                         setMapping({

//                                             ...mapping,

//                                             filters: newFilters

//                                         });


//                                     }}

//                                     className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"

//                                 >

//                                     <option value="">
//                                         اختر العمود
//                                     </option>


//                                     {

//                                         datasources

//                                             .flatMap(section => section.tables)

//                                             .filter(table =>
//                                                 table.id === Number(filter.table_id)
//                                             )

//                                             .flatMap(table => table.columns)

//                                             .map(column => (

//                                                 <option

//                                                     key={column.id}

//                                                     value={column.id}

//                                                 >

//                                                     {column.name}

//                                                 </option>

//                                             ))

//                                     }


//                                 </select>



//                             </div>


//                         ))
//                     }


//                     <button

//                         disabled={!canWrite}
//                         onClick={() => canWrite && addFilter()}

//                         className="border rounded px-4 py-2"

//                     >

//                         + إضافة فلتر

//                     </button>


//                 </div>

//                 <div className="flex justify-end gap-3 mt-8">

//                     <button
//                         onClick={onClose}
//                     >

//                         Cancel

//                     </button>

//                     <button
//                         disabled={!canWrite}
//                         onClick={() => canWrite && save()}
//                         className="bg-blue-600 rounded px-4 py-2"
//                     >

//                         Save

//                     </button>

//                 </div>

//             </div>

//         </div>

//     );

// }









"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import reportService from "../services/reportService";

import { useAuth } from "@/context/AuthContext";

import { Plus, ArrowRight, } from "lucide-react";

import dashboardWidgetService from "../services/dashboardWidgetService";
import dashboardService from "../services/dashboardService";

import { Responsive, WidthProvider } from "react-grid-layout";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ResponsiveGridLayout = WidthProvider(Responsive);

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    Legend
} from "recharts";

import {
    X,
    Pencil,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    FileSpreadsheet,
    FileText,
    FileDown,
    Settings,
    Copy,
} from "lucide-react";

export default function DashboardCanvasPage() {

    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

    const [reports, setReports] = useState([]);

    const [widgetForm, setWidgetForm] = useState({ title: "", widget_type: "table", report_id: "", });

    const [editingWidget, setEditingWidget] = useState(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [widgetSettings, setWidgetSettings] = useState({
        showTitle: true,
        showExport: true,
        pageSize: 10,
        autoRefresh: 0,
        color: "#3b82f6",
        display: "default",
    });

    const [globalFilters, setGlobalFilters] = useState({
        dateFrom: "",
        dateTo: "",
        lawyer: "",
        client: "",
        caseType: "",
        status: "",
    });

    const [isGlobalFilterOpen, setIsGlobalFilterOpen] =
        useState(false);

    const [tables, setTables] =
        useState([]);

    const [filterMapping, setFilterMapping] = useState({});

    const [filterOptions, setFilterOptions] = useState({});

    const { id } = useParams();

    const { user } = useAuth();

    const pagePermission =
        user?.role?.toLowerCase() === "admin" ||
            user?.is_superuser
            ? "write"
            : (user?.system_pages?.["dashboard-builder"] || "no_access");

    const canRead =
        pagePermission === "read" ||
        pagePermission === "write";

    const canWrite =
        pagePermission === "write";

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    const [widgets, setWidgets] = useState([]);

    const [layouts, setLayouts] = useState({ lg: [], });

    const [datasources, setDatasources] = useState([]);

    const [dashboardFilters, setDashboardFilters] = useState([]);

    const [filterModalOpen, setFilterModalOpen] =
        useState(false);

    useEffect(() => {
        setLayouts({
            lg: widgets.map(widget => ({
                i: String(widget.id),
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
            })),
        });
    }, [widgets]);



    useEffect(() => {

        loadDashboard();

    }, [id]);

    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        if (!canRead) {
            router.replace("/dashboard");
        }
    }, [user, canRead, router]);


    const loadWidgets = async (dashboardId) => {

        const data =
            await dashboardWidgetService.getWidgets(dashboardId);


        setWidgets(data);

    };


    const loadReports = async () => {
        try {
            const data = await reportService.getReports();
            setReports(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadDashboard = async () => {

        try {

            const data =
                await dashboardService.getDashboard(id);


            const mapping =
                data.global_filter_mapping || {};


            setDashboard(data);

            setFilterMapping(mapping);


            await loadGlobalFilterOptions(mapping);


            await loadWidgets(data.id);

            await loadDatasources();


        } finally {

            setLoading(false);

        }

    };

    const createWidget = async () => {

        if (!canWrite) return;

        try {

            if (editingWidget) {

                await dashboardWidgetService.updateWidget(
                    editingWidget.id,
                    {
                        title: widgetForm.title,
                        widget_type: widgetForm.widget_type,
                        report_id: Number(widgetForm.report_id),

                        config: editingWidget.config,
                    }
                );

            } else {

                await dashboardWidgetService.createWidget({
                    dashboard_id: dashboard.id,
                    title: widgetForm.title,
                    widget_type: widgetForm.widget_type,
                    report_id: Number(widgetForm.report_id),

                    config: {
                        showTitle: true,
                        color: "#3b82f6",
                        pageSize: 10,
                        autoRefresh: 0,
                        showExport: true,
                        display: "default",
                    },

                    x: 0,
                    y: 0,
                    w: 4,
                    h: 3,
                });

            }

            setEditingWidget(null);

            setIsWidgetModalOpen(false);

            loadWidgets(dashboard.id);

        } catch (err) {

            console.error(err);

        }

    };


    const saveLayout = async (layout) => {

        if (!canWrite) return;

        for (const item of layout) {

            await dashboardWidgetService.updateWidget(item.i, {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
            });

        }

    };

    const loadDatasources = async () => {

        const { data } =
            await apiClient.get(
                "/report-builder/datasources"
            );

        setDatasources(data);

    };

    const editWidget = async (widget) => {

        if (!canWrite) return;

        await loadReports();

        setEditingWidget(widget);

        setWidgetForm({
            title: widget.title,
            widget_type: widget.widget_type,
            report_id: String(widget.report_id),
        });

        setIsWidgetModalOpen(true);

    };

    const openWidgetSettings = (widget) => {

        if (!canWrite) return;


        setEditingWidget(widget);

        setWidgetSettings({
            showTitle: widget.config?.showTitle ?? true,
            showExport: widget.config?.showExport ?? true,
            pageSize: widget.config?.pageSize ?? 10,
            autoRefresh: widget.config?.autoRefresh ?? 0,
            color: widget.config?.color ?? "#3b82f6",
            display: widget.config?.display ?? "default",
        });

        setIsSettingsOpen(true);

    };

    const openGlobalFilters = async () => {

        const data =
            await apiClient.get(
                "/report-builder/datasources"
            );

        setTables(data.data);

        setIsGlobalFilterOpen(true);

    };

    const loadGlobalFilterOptions = async (mapping) => {

        const options = {};

        const filters = mapping?.filters || [];

        for (const filter of (mapping.filters || [])) {


            if (!filter.table_id || !filter.column_id)
                continue;

            const tableId = filter.table_id;
            const columnId = filter.column_id;



            try {


                const { data } = await apiClient.post(
                    "/report-builder/run",
                    {
                        table_id: Number(tableId),

                        columns: [
                            {
                                id: columnId,
                                name: filter.label,
                                type: filter.type || "text",
                                path: filter.path || [],
                            }
                        ],

                        relations: filter.relation
                            ? [
                                {
                                    column_id: columnId,
                                    table_id: filter.relation.table_id,
                                }
                            ]
                            : [],

                        filters: [],

                        global_filters: {},

                        global_filter_mapping: {
                            filters: [],
                        },

                        groupBy: "",

                        sorting: [],

                        visualization: {
                            type: "table"
                        }
                    }
                );



                options[filter.id] = [
                    ...new Set(

                        data.rows.map(row => {

                            const val =
                                row[columnId];


                            if (Array.isArray(val)) {

                                return val[0]?.display;

                            }


                            return val;

                        })

                    )
                ];


            }
            catch (error) {

                console.error(
                    "Filter loading error",
                    filter.id,
                    error
                );

            }

        }



        setFilterOptions(options);

    };

    if (!canRead) {
        return (
            <div className="flex items-center justify-center h-screen">
                ليس لديك صلاحية للوصول إلى Dashboard
            </div>
        );
    }

    if (loading) {

        return (
            <div className="mr-64 p-6">
                Loading...
            </div>
        );

    }

    if (!dashboard) {

        return (
            <div className="mr-64 p-6">
                Dashboard غير موجود
            </div>
        );

    }

    const layoutReady = layouts.lg.length === widgets.length;

    return (

        <div
            className="mr-64 min-h-screen p-8 space-y-6 text-slate-900 dark:text-slate-100 transition-colors"
            style={{
                backgroundColor: 'var(--mktabi-page-background, #F8FAFC)',
            }}
        >

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">

                <div className="flex items-center justify-between flex-wrap gap-4">

                    <div className="flex items-center gap-4">

                        <Link
                            href="/dashboard/dashboard-builder"
                            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            <ArrowRight size={18} />
                        </Link>

                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                            style={{ background: dashboard.color }}
                        >
                            {dashboard.icon}
                        </div>

                        <div>

                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {dashboard.name}
                            </h1>

                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {dashboard.description}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-3 flex-wrap">

                        <button
                            disabled={!canWrite}
                            onClick={async () => {

                                if (!canWrite) return;

                                await loadReports();

                                setEditingWidget(null);

                                setWidgetForm({
                                    title: "",
                                    widget_type: "table",
                                    report_id: "",
                                });

                                setIsWidgetModalOpen(true);

                            }}
                            className="
                px-5
                py-2.5
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                disabled:opacity-50
                text-white
                font-bold
                shadow-md
                transition
                flex
                items-center
                gap-2
                "
                        >
                            <Plus size={18} />
                            Add Widget
                        </button>

                        <button
                            disabled={!canWrite}
                            onClick={() => canWrite && setFilterModalOpen(true)}
                            className="
                px-5
                py-2.5
                rounded-xl
                bg-white
                dark:bg-slate-900
                border
                border-slate-300
                dark:border-slate-700
                hover:border-blue-500
                hover:bg-slate-50
                dark:hover:bg-slate-800
                transition
                "
                        >
                            Configure Filters
                        </button>

                    </div>

                </div>

                {(filterMapping.filters || []).length > 0 && (

                    <div className="flex gap-3 flex-wrap mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">

                        {(filterMapping.filters || []).map((filter) => (

                            <select
                                key={filter.id}
                                value={globalFilters[filter.id] || ""}
                                onChange={(e) => {

                                    const newFilters = {
                                        ...globalFilters,
                                        [filter.id]: e.target.value,
                                    };

                                    setGlobalFilters(newFilters);

                                }}
                                className="
                    rounded-xl
                    bg-white
                    dark:bg-slate-900
                    border
                    border-slate-300
                    dark:border-slate-700
                    px-3
                    py-2.5
                    shadow-sm
                    focus:ring-2
                    focus:ring-blue-500/20
                    focus:border-blue-500
                    "
                            >

                                <option value="">
                                    {filter.label || "الكل"}
                                </option>

                                {(filterOptions[filter.id] || []).map((item, index) => (

                                    <option
                                        key={index}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                ))}

                            </select>

                        ))}

                    </div>

                )}

            </div>

            <div className="w-full">

                {layoutReady && (

                    <ResponsiveGridLayout

                        // layouts={layouts}

                        layouts={{
                            lg: layouts.lg,
                            md: layouts.lg,
                            sm: layouts.lg,
                            xs: layouts.lg,
                        }}

                        breakpoints={{
                            lg: 1200,
                            md: 996,
                            sm: 768,
                            xs: 480,
                        }}

                        cols={{
                            lg: 12,
                            md: 10,
                            sm: 6,
                            xs: 2,
                        }}

                        rowHeight={35}

                        isDraggable={canWrite}

                        isResizable={canWrite}

                        compactType={null}

                        useCSSTransforms={false}

                        preventCollision={false}

                        draggableHandle=".widget-header"
                        draggableCancel=".no-drag"

                        onLayoutChange={(layout) => {
                            setLayouts({ lg: layout });
                        }}

                        onResizeStop={(layout) => saveLayout(layout)}

                        onDragStop={(layout) => saveLayout(layout)}

                    >

                        {widgets.length === 0 && (

                            <div
                                className="col-span-12 rounded-3xl border-2 border-dashed border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm h-[500px] flex items-center justify-center"
                            >

                                <div className="text-center">

                                    <div className="text-6xl mb-5">
                                        📊
                                    </div>

                                    <h2 className="font-semibold text-slate-800 dark:text-white">
                                        Dashboard Canvas
                                    </h2>

                                    <p className="text-slate-500 mt-2">
                                        لا توجد Widgets حتى الآن
                                    </p>

                                </div>

                            </div>

                        )}

                        {widgets.map(widget => (

                            <div
                                key={widget.id}
                                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all"
                            >

                                {widget.config?.showTitle !== false && (
                                    <div className="widget-header flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-move">

                                        <div className="font-semibold text-slate-800 dark:text-white">
                                            {widget.title}
                                        </div>

                                        <div className="flex items-center gap-2">

                                            <button
                                                disabled={!canWrite}
                                                onClick={() => canWrite && openWidgetSettings(widget)}
                                                className="no-drag p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                                            >
                                                <Settings />
                                            </button>

                                            <button
                                                disabled={!canWrite}
                                                onClick={() => canWrite && editWidget(widget)}
                                                className="no-drag p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition"

                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                disabled={!canWrite}
                                                onClick={async () => {

                                                    if (!canWrite) return;

                                                    await dashboardWidgetService.duplicateWidget(widget.id);

                                                    loadWidgets(dashboard.id);

                                                }}
                                                className="no-drag p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition"

                                            >

                                                <Copy />

                                            </button>

                                            <button
                                                disabled={!canWrite}
                                                onClick={async () => {

                                                    if (!confirm("حذف الـ Widget؟"))
                                                        return;

                                                    await dashboardWidgetService.deleteWidget(widget.id);

                                                    loadWidgets(dashboard.id);

                                                }}
                                                className="no-drag p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                            >
                                                <X size={18} />
                                            </button>

                                        </div>

                                    </div>
                                )}

                                <div className="p-5">
                                    {widget.widget_type === "table" ? (

                                        <TableWidget
                                            widget={widget}
                                            globalFilters={globalFilters}
                                            filterMapping={filterMapping}
                                        />

                                    ) : (

                                        <ChartLoader
                                            widget={widget}
                                            globalFilters={globalFilters}
                                            filterMapping={filterMapping}
                                        />

                                    )}

                                </div>

                            </div>

                        ))}

                    </ResponsiveGridLayout>
                )}
            </div>

            <AddWidgetModal
                canWrite={canWrite}
                open={isWidgetModalOpen}
                onClose={() => {
                    setEditingWidget(null);
                    setIsWidgetModalOpen(false);
                }}
                reports={reports}
                widgetForm={widgetForm}
                setWidgetForm={setWidgetForm}
                onCreate={createWidget}
                editingWidget={editingWidget}
            />

            <WidgetSettingsModal
                open={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={widgetSettings}
                setSettings={setWidgetSettings}
                widget={editingWidget}
                dashboardId={dashboard.id}
                reload={() => loadWidgets(dashboard.id)}
                canWrite={canWrite}
            />

            <ConfigureDashboardFiltersModal

                open={filterModalOpen}

                onClose={() =>
                    setFilterModalOpen(false)
                }

                datasources={datasources}

                mapping={filterMapping}

                setMapping={setFilterMapping}

                dashboard={dashboard}

                reload={loadDashboard}
                canWrite={canWrite}

            />

        </div >


    );

}

function WidgetSettingsModal({
    open,
    onClose,
    settings,
    setSettings,
    widget,
    reload,
    canWrite,
}) {

    if (!open || !widget) return null;

    const save = async () => {

        if (!canWrite) return;

        await dashboardWidgetService.updateWidget(widget.id, {
            config: settings,
        });

        reload();
        onClose();

    };

    return (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">

                <div className="mb-6">

                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Widget Settings
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Customize this widget appearance and behaviour.
                    </p>

                </div>

                <div className="space-y-6">

                    <label className="flex items-center justify-between">

                        <span className="font-medium text-slate-700 dark:text-slate-200">
                            Show Title
                        </span>

                        <input
                            type="checkbox"
                            checked={settings.showTitle}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    showTitle: e.target.checked,
                                })
                            }
                            className="h-5 w-5 accent-blue-600"
                        />

                    </label>

                    <label className="flex items-center justify-between">

                        <span className="font-medium text-slate-700 dark:text-slate-200">
                            Show Export
                        </span>

                        <input
                            type="checkbox"
                            checked={settings.showExport}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    showExport: e.target.checked,
                                })
                            }
                            className="h-5 w-5 accent-blue-600"
                        />

                    </label>

                    <div>

                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
                            Page Size
                        </label>

                        <input
                            type="number"
                            value={settings.pageSize}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    pageSize: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />

                    </div>

                    <div>

                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
                            Auto Refresh
                        </label>

                        <select
                            value={settings.autoRefresh}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    autoRefresh: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >

                            <option value={0}>Disabled</option>
                            <option value={30}>30 sec</option>
                            <option value={60}>1 min</option>
                            <option value={300}>5 min</option>

                        </select>

                    </div>

                    <div>

                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
                            Widget Color
                        </label>

                        <div className="flex items-center gap-4">


                            <input
                                type="color"
                                value={settings.color}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        color: e.target.value,
                                    })
                                }
                                className="h-11 w-24 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                            />
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                اختر لون الرسم
                            </span>
                        </div>

                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-8">

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!canWrite}
                        onClick={() => canWrite && save()}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold dark:text-white transition disabled:opacity-50"
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>

    );

}

function AddWidgetModal({
    open,
    onClose,
    reports,
    widgetForm,
    setWidgetForm,
    onCreate,
    editingWidget,
    canWrite,
}) {

    if (!open) return null;

    return (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">

                <div className="mb-6">

                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {editingWidget ? "تعديل Widget" : "إضافة Widget"}
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        اختر نوع الـ Widget والتقرير الذي سيتم عرضه داخل لوحة التحكم.
                    </p>

                </div>

                <div className="space-y-5">

                    <div>

                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                            عنوان الـ Widget
                        </label>

                        <input
                            value={widgetForm.title}
                            onChange={(e) =>
                                setWidgetForm({
                                    ...widgetForm,
                                    title: e.target.value,
                                })
                            }
                            placeholder="عنوان الـ Widget"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                            نوع الـ Widget
                        </label>

                        <select
                            value={widgetForm.widget_type}
                            onChange={(e) =>
                                setWidgetForm({
                                    ...widgetForm,
                                    widget_type: e.target.value,
                                })
                            }
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                            <option value="table">Table</option>
                            <option value="kpi">KPI</option>
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                        </select>

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                            التقرير
                        </label>

                        <select
                            value={widgetForm.report_id}
                            onChange={(e) =>
                                setWidgetForm({
                                    ...widgetForm,
                                    report_id: e.target.value,
                                })
                            }
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                            <option value="">
                                اختر التقرير
                            </option>

                            {reports.map((report) => (
                                <option
                                    key={report.id}
                                    value={report.id}
                                >
                                    {report.name}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-700 rounded-lg"
                    >

                        إلغاء

                    </button>

                    <button
                        disabled={!canWrite}
                        onClick={() => canWrite && onCreate()}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition disabled:opacity-50"
                    >

                        إنشاء

                    </button>

                </div>

            </div>

        </div>

    );

}



function TableWidget({
    widget,
    globalFilters,
    filterMapping,
}) {

    const [loading, setLoading] = useState(true);

    const [result, setResult] = useState(null);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [sortColumn, setSortColumn] = useState("");

    const [sortDirection, setSortDirection] = useState("asc");

    const pageSize = widget.config?.pageSize || 10;

    useEffect(() => {

        load();

        if (!widget.config?.autoRefresh)
            return;


    }, [
        widget.report_id,
        widget.config?.autoRefresh,
        globalFilters
    ]);

    const load = async () => {

        try {

            const report =
                await reportService.getReport(widget.report_id);

            const query =
                report.config?.query;

            if (!query) {
                throw new Error("Report query not found");
            }

            const requestBody = {
                ...report.config.query,

                global_filters: globalFilters,

                global_filter_mapping: filterMapping,

                visualization: {
                    ...report.config.visualization,
                    type: widget.widget_type,
                },
            };


            const { data } = await apiClient.post(
                "/report-builder/run",
                {
                    ...report.config.query,

                    global_filters: globalFilters,

                    global_filter_mapping: filterMapping,

                    visualization: {
                        ...report.config.visualization,
                        type: widget.widget_type,
                    },
                }
            );


            setResult(data);


        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    const renderCell = (value) => {

        if (value == null)
            return "";

        if (Array.isArray(value)) {

            return value
                .map(item => {

                    if (typeof item === "object") {
                        return item.display;
                    }

                    return String(item);

                })
                .join("، ");

        }

        if (typeof value === "object") {
            return value.display ?? "";
        }

        return String(value);

    };


    const filteredRows = useMemo(() => {

        if (!result) return [];

        return result.rows.filter(row =>
            result.columns.some(col =>
                String(renderCell(row[col.id]))
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        );

    }, [result, search]);

    const sortedRows = useMemo(() => {

        if (!sortColumn) return filteredRows;

        return [...filteredRows].sort((a, b) => {

            const av = String(renderCell(a[sortColumn]) ?? "");

            const bv = String(renderCell(b[sortColumn]) ?? "");

            return sortDirection === "asc"
                ? av.localeCompare(bv)
                : bv.localeCompare(av);

        });

    }, [filteredRows, sortColumn, sortDirection]);

    const totalPages =
        Math.max(1, Math.ceil(sortedRows.length / pageSize));

    const pageRows =
        sortedRows.slice(
            (page - 1) * pageSize,
            page * pageSize
        );

    const sortBy = (id) => {

        if (sortColumn === id) {

            setSortDirection(
                sortDirection === "asc"
                    ? "desc"
                    : "asc"
            );

        } else {

            setSortColumn(id);

            setSortDirection("asc");

        }

    };

    const exportCSV = () => {

        const headers =
            result.columns.map(c => c.name);

        const rows =
            sortedRows.map(row =>
                result.columns.map(col =>
                    `"${renderCell(row[col.id])}"`
                )
            );

        const csv =
            [headers, ...rows]
                .map(r => r.join(","))
                .join("\n");

        const blob =
            new Blob([csv], {
                type: "text/csv;charset=utf-8;"
            });

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download = `${widget.title}.csv`;

        a.click();

        URL.revokeObjectURL(url);

    };

    const exportExcel = () => {

        const data =
            sortedRows.map(row => {

                const obj = {};

                result.columns.forEach(col => {

                    obj[col.name] =
                        renderCell(row[col.id]);

                });

                return obj;

            });

        const ws =
            XLSX.utils.json_to_sheet(data);

        const wb =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            wb,
            ws,
            "Report"
        );

        XLSX.writeFile(
            wb,
            `${widget.title}.xlsx`
        );

    };

    const exportPDF = () => {

        const doc =
            new jsPDF();

        autoTable(doc, {

            head: [
                result.columns.map(c => c.name)
            ],

            body:
                sortedRows.map(row =>
                    result.columns.map(col =>
                        renderCell(row[col.id])
                    )
                ),

            styles: {
                fontSize: 8,
            },

        });

        doc.save(`${widget.title}.pdf`);

    };

    if (loading) {

        return <div className="flex items-center justify-center h-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-slate-500 dark:text-slate-400">
                    Loading...
                </p>
            </div>
        </div>

    }

    if (!result) {

        return <div className="flex items-center justify-center h-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-slate-500 dark:text-slate-400">
                    No Data
                </p>
            </div>
        </div>


    }


    return (

        <div className="space-y-4 h-full flex flex-col">

            <div className="flex items-center justify-between gap-4">

                <div className="relative w-full">

                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => {

                            setSearch(e.target.value);

                            setPage(1);

                        }}
                        placeholder="بحث..."
                        className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        dark:border-slate-700
                        bg-white
                        dark:bg-slate-900
                        pl-10
                        pr-4
                        py-2.5
                        shadow-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500/20
                        focus:border-blue-500
                    "
                    />

                </div>

                <div className="text-sm font-medium text-slate-500 whitespace-nowrap">

                    {sortedRows.length} نتيجة

                </div>

            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-1 max-h-[420px] shadow-sm">

                <table className="w-full border-collapse">

                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-20">

                        <tr>

                            <th className="border border-slate-200 dark:border-slate-700 px-3 py-3 w-14">

                                #

                            </th>

                            {result.columns.map((col, index) => (

                                <th
                                    key={`header-${col.id}-${index}`}
                                    onClick={() => sortBy(col.id)}
                                    className="
                                    border
                                    border-slate-200
                                    dark:border-slate-700
                                    px-4
                                    py-3
                                    text-right
                                    font-semibold
                                    text-slate-800
                                    dark:text-white
                                    cursor-pointer
                                    hover:bg-blue-50
                                    dark:hover:bg-slate-700
                                    transition
                                "
                                >

                                    <div className="flex items-center gap-2">

                                        {col.name}

                                        <ArrowUpDown size={14} />

                                    </div>

                                </th>

                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        {pageRows.map((row, index) => (

                            <tr
                                key={index}
                                className="
                odd:bg-white
                even:bg-slate-50
                dark:odd:bg-slate-900
                dark:even:bg-slate-800
                hover:bg-blue-50
                dark:hover:bg-slate-700
                transition-colors
            "
                            >

                                <td
                                    className="
                    border
                    border-slate-200
                    dark:border-slate-700
                    px-3
                    py-3
                    text-center
                    font-medium
                "
                                >
                                    {(page - 1) * pageSize + index + 1}
                                </td>

                                {result.columns.map((col, colIndex) => (

                                    <td
                                        key={`cell-${col.id}-${colIndex}`}
                                        className="
                        border
                        border-slate-200
                        dark:border-slate-700
                        px-4
                        py-3
                        text-sm
                    "
                                    >

                                        {renderCell(row[col.id])}

                                    </td>

                                ))}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            <div className="flex items-center justify-between pt-2">

                {widget.config?.showExport !== false && (

                    <div className="flex gap-2">

                        <button
                            onClick={exportExcel}
                            title="Excel"
                            className="
                    rounded-lg
                    border
                    border-slate-300
                    dark:border-slate-700
                    p-2
                    hover:bg-blue-50
                    dark:hover:bg-slate-800
                    transition
                "
                        >
                            <FileSpreadsheet size={16} />
                        </button>

                        <button
                            onClick={exportCSV}
                            title="CSV"
                            className="
                    rounded-lg
                    border
                    border-slate-300
                    dark:border-slate-700
                    p-2
                    hover:bg-blue-50
                    dark:hover:bg-slate-800
                    transition
                "
                        >
                            <FileText size={16} />
                        </button>

                        <button
                            onClick={exportPDF}
                            title="PDF"
                            className="
                    rounded-lg
                    border
                    border-slate-300
                    dark:border-slate-700
                    p-2
                    hover:bg-blue-50
                    dark:hover:bg-slate-800
                    transition
                "
                        >
                            <FileDown size={16} />
                        </button>

                    </div>

                )}

                <div className="flex items-center gap-2">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="
                rounded-lg
                border
                border-slate-300
                dark:border-slate-700
                p-2
                hover:bg-blue-50
                dark:hover:bg-slate-800
                transition
                disabled:opacity-40
            "
                    >
                        <ChevronRight size={16} />
                    </button>

                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="
                rounded-lg
                border
                border-slate-300
                dark:border-slate-700
                p-2
                hover:bg-blue-50
                dark:hover:bg-slate-800
                transition
                disabled:opacity-40
            "
                    >
                        <ChevronLeft size={16} />
                    </button>

                </div>

            </div>

        </div>

    );

}

function prepareChartData(result) {

    if (!result?.rows?.length) return [];

    const groupColumn =
        result.columns.find(c =>
            c.type === "dropdown" ||
            c.type === "text"
        ) || result.columns[0];

    const map = {};

    result.rows.forEach(row => {

        let value = row[groupColumn.id];

        if (Array.isArray(value))
            value = value.join(",");

        value = value || "غير محدد";

        map[value] = (map[value] || 0) + 1;

    });

    return Object.entries(map).map(([name, value]) => ({
        name,
        value,
    }));

}

const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#14b8a6",
    "#f97316",
    "#ec4899",
    "#84cc16",
];

function ChartLoader({
    widget,
    globalFilters,
    filterMapping,
}) {

    const [loading, setLoading] = useState(true);

    const [result, setResult] = useState(null);

    useEffect(() => {

        load();

        if (!widget.config?.autoRefresh)
            return;

        const interval = setInterval(() => {

            load();

        }, widget.config.autoRefresh * 1000);

        return () => clearInterval(interval);

    }, [
        widget.report_id,
        widget.widget_type,
        widget.config?.autoRefresh,
        globalFilters
    ]);

    const load = async () => {

        const report =
            await reportService.getReport(widget.report_id);


        const { data } = await apiClient.post(
            "/report-builder/run",
            {
                ...report.config.query,

                global_filters: globalFilters,

                global_filter_mapping: filterMapping,

                visualization: {
                    ...report.config.visualization,
                    type: widget.widget_type,
                },
            }
        );

        setResult(data);

        setLoading(false);

    };

    if (loading)
        return <div>Loading...</div>;

    const chartType = widget.widget_type;

    const chartColor = widget.config?.color || "#3b82f6";

    const isDark =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

    const axisColor = isDark ? "#cbd5e1" : "#475569";
    const gridColor = isDark ? "#334155" : "#e2e8f0";

    const CustomTooltip = ({ active, payload }) => {

        if (!active || !payload?.length) return null;

        return (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-xl">
                <div className="font-semibold text-slate-800 dark:text-white">
                    {payload[0].name}
                </div>

                <div className="text-blue-600 dark:text-blue-400">
                    {payload[0].value}
                </div>
            </div>
        );

    };


    if (chartType === "kpi") {

        const total = result.rows.length;

        const preview = result.rows.slice(0, 3);

        return (

            <div className="h-full flex flex-col justify-between">

                <div className="flex items-center justify-between">

                    <div>

                        <div className="text-slate-400 text-sm">

                            إجمالي السجلات

                        </div>

                        <div className="text-5xl font-bold mt-2">

                            {total}

                        </div>

                    </div>

                    <ResponsiveContainer
                        width={120}
                        height={120}
                    >

                        <RadialBarChart
                            innerRadius="70%"
                            outerRadius="100%"
                            data={[
                                {
                                    name: "Rows",
                                    value: total,
                                    fill: chartColor
                                },
                            ]}
                            startAngle={90}
                            endAngle={-270}
                        >

                            <RadialBar
                                dataKey="value"
                                cornerRadius={10}
                            />

                        </RadialBarChart>

                    </ResponsiveContainer>

                </div>

                <div className="mt-6 border-t border-slate-800 pt-4">

                    <div className="text-xs text-slate-400 mb-3">

                        أول السجلات

                    </div>

                    <div className="space-y-2">

                        {preview.map((row, index) => (

                            <div
                                key={index}
                                className="rounded-lg bg-slate-800 px-3 py-2 text-sm"
                            >

                                #{index + 1}

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        );

    }

    const chartData = prepareChartData(result);

    // const chartType = widget.widget_type;



    if (!chartData.length) {
        return (
            <div className="text-center py-10">
                لا توجد بيانات
            </div>
        );
    }

    if (chartType === "bar") {

        return (

            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={gridColor}
                    />

                    <XAxis
                        dataKey="name"
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Bar
                        dataKey="value"
                        radius={[8, 8, 0, 0]}
                        fill={chartColor}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Bar>

                </BarChart>
            </ResponsiveContainer>

        );

    }

    if (chartType === "line") {

        return (

            <ResponsiveContainer width="100%" height={320}>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 10,
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={gridColor}
                    />

                    <XAxis
                        dataKey="name"
                        tick={{ fill: axisColor }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fill: axisColor }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={chartColor}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                    />

                </LineChart>
            </ResponsiveContainer>

        );

    }

    if (chartType === "pie") {

        return (

            <ResponsiveContainer width="100%" height={320}>
                <PieChart>

                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        label
                        fill={chartColor}
                    >

                        {chartData.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={
                                    widget.config?.color
                                    || COLORS[index % COLORS.length]
                                }
                            />
                        ))}

                    </Pie>

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        wrapperStyle={{
                            color: isDark ? "#e2e8f0" : "#334155",
                        }}
                    />

                </PieChart>
            </ResponsiveContainer>

        );

    }

    return null;
}

function ConfigureDashboardFiltersModal({

    open,

    onClose,

    datasources,

    mapping,

    setMapping,

    dashboard,

    reload,

    canWrite,

}) {

    if (!open)
        return null;

    const filters = mapping.filters || [];


    const addFilter = () => {

        setMapping({

            ...mapping,

            filters: [

                ...filters,

                {
                    id: `filter_${Date.now()}`,
                    label: "",
                    table_id: "",
                    column_id: "",
                    type: "select"
                }

            ]

        });

    };

    const getRelation = (tableId, columnId) => {
        const table = datasources
            .flatMap(section => section.tables)
            .find(t => t.id === Number(tableId));

        if (!table) return null;

        return table.relations.find(r => r.column_id === columnId);
    };

    const save = async () => {

        await dashboardService.updateDashboard(

            dashboard.id,

            {

                global_filter_mapping:

                    mapping,

            }

        );

        reload();

        onClose();

    };

    return (

        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">

            <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-8">

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">

                    Configure Global Filters

                </h2>

                <div className="space-y-4">


                    {
                        filters.map((filter, index) => (

                            <div
                                key={filter.id}
                                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-4 "
                            >


                                <input

                                    value={filter.label}

                                    placeholder="اسم الفلتر"

                                    onChange={(e) => {

                                        const newFilters = [...filters];

                                        const columnId = e.target.value;

                                        newFilters[index].column_id = columnId;

                                        const relation = getRelation(
                                            newFilters[index].table_id,
                                            columnId
                                        );

                                        if (relation) {

                                            newFilters[index].relation = {
                                                table_id: relation.table.id,
                                                table_name: relation.table.name,
                                            };

                                        } else {

                                            delete newFilters[index].relation;

                                        }

                                        setMapping({
                                            ...mapping,
                                            filters: newFilters
                                        });

                                    }}

                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition "

                                />



                                <select

                                    value={filter.table_id}

                                    onChange={(e) => {


                                        const newFilters = [...filters];

                                        newFilters[index].table_id =
                                            Number(e.target.value);

                                        newFilters[index].column_id = "";


                                        setMapping({

                                            ...mapping,

                                            filters: newFilters

                                        });


                                    }}

                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition "

                                >

                                    <option value="">
                                        اختر الجدول
                                    </option>


                                    {

                                        datasources.map(section =>

                                            section.tables.map(table => (

                                                <option

                                                    key={table.id}

                                                    value={table.id}

                                                >

                                                    {table.name}

                                                </option>

                                            ))

                                        )

                                    }

                                </select>



                                <select

                                    value={filter.column_id}

                                    onChange={(e) => {


                                        const newFilters = [...filters];

                                        newFilters[index].column_id = e.target.value;


                                        setMapping({

                                            ...mapping,

                                            filters: newFilters

                                        });


                                    }}

                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition "

                                >

                                    <option value="">
                                        اختر العمود
                                    </option>


                                    {

                                        datasources

                                            .flatMap(section => section.tables)

                                            .filter(table =>
                                                table.id === Number(filter.table_id)
                                            )

                                            .flatMap(table => table.columns)

                                            .map(column => (

                                                <option

                                                    key={column.id}

                                                    value={column.id}

                                                >

                                                    {column.name}

                                                </option>

                                            ))

                                    }


                                </select>



                            </div>


                        ))
                    }


                    <button

                        disabled={!canWrite}
                        onClick={() => canWrite && addFilter()}

                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition disabled:opacity-50"

                    >

                        + إضافة فلتر

                    </button>


                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >

                        Cancel

                    </button>

                    <button
                        disabled={!canWrite}
                        onClick={() => canWrite && save()}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition disabled:opacity-50"
                    >

                        Save

                    </button>

                </div>

            </div>

        </div>

    );

}