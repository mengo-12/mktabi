"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import reportService from "../services/reportService";

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
    ResponsiveContainer
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
} from "lucide-react";

export default function DashboardCanvasPage() {

    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

    const [reports, setReports] = useState([]);

    const [widgetForm, setWidgetForm] = useState({ title: "", widget_type: "table", report_id: "", });

    const [editingWidget, setEditingWidget] = useState(null);

    const { id } = useParams();

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    const [widgets, setWidgets] = useState([]);


    const [layouts, setLayouts] = useState({ lg: [], });

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

            setDashboard(data);

            await loadWidgets(data.id);

        } finally {

            setLoading(false);

        }

    };

    const createWidget = async () => {

        try {

            if (editingWidget) {

                await dashboardWidgetService.updateWidget(
                    editingWidget.id,
                    {
                        title: widgetForm.title,
                        widget_type: widgetForm.widget_type,
                        report_id: Number(widgetForm.report_id),
                    }
                );

            } else {

                await dashboardWidgetService.createWidget({
                    dashboard_id: dashboard.id,
                    title: widgetForm.title,
                    widget_type: widgetForm.widget_type,
                    report_id: Number(widgetForm.report_id),

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

        for (const item of layout) {

            await dashboardWidgetService.updateWidget(item.i, {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
            });

        }

    };

    const editWidget = async (widget) => {

        await loadReports();

        setEditingWidget(widget);

        setWidgetForm({
            title: widget.title,
            widget_type: widget.widget_type,
            report_id: String(widget.report_id),
        });

        setIsWidgetModalOpen(true);

    };

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

        <div className="mr-64 p-6 space-y-6"><div className="flex items-center justify-between">

            <div>

                <div className="flex items-center gap-3">

                    <Link
                        href="/dashboard/dashboard-builder"
                        className="p-2 rounded-lg border"
                    >
                        <ArrowRight size={18} />
                    </Link>

                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: dashboard.color }}
                    >
                        {dashboard.icon}
                    </div>

                    <div>

                        <h1 className="text-2xl font-bold">
                            {dashboard.name}
                        </h1>

                        <p className="text-slate-500">
                            {dashboard.description}
                        </p>

                    </div>

                </div>

            </div>

            <button
                onClick={async () => {

                    await loadReports();

                    setEditingWidget(null);

                    setWidgetForm({
                        title: "",
                        widget_type: "table",
                        report_id: "",
                    });

                    setIsWidgetModalOpen(true);

                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
            >
                <Plus size={18} />
                Add Widget
            </button>

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

                        isDraggable

                        isResizable

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
                                className="
                col-span-12
                rounded-xl
                border-2
                border-dashed
                border-slate-700
                h-[500px]
                flex
                items-center
                justify-center
            "
                            >

                                <div className="text-center">

                                    <div className="text-6xl mb-5">
                                        📊
                                    </div>

                                    <h2 className="text-xl font-semibold">
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
                                className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden"
                            >

                                <div className="widget-header flex items-center justify-between px-5 py-3 cursor-move border-b border-slate-800">

                                    <div className="font-semibold">
                                        {widget.title}
                                    </div>

                                    <button
                                        onClick={async () => {

                                            if (!confirm("حذف الـ Widget؟"))
                                                return;

                                            await dashboardWidgetService.deleteWidget(widget.id);

                                            loadWidgets(dashboard.id);

                                        }}
                                        className="p-2 rounded hover:bg-red-600/20 text-red-400"
                                    >
                                        <X size={18} />
                                    </button>

                                    <button
                                        onClick={() => editWidget(widget)}
                                        className="no-drag p-2 rounded hover:bg-slate-800"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                </div>

                                <div className="p-5">

                                    {widget.widget_type === "table" ? (

                                        <TableWidget widget={widget} />

                                    ) : (

                                        <ChartLoader widget={widget} />

                                    )}

                                </div>

                            </div>

                        ))}

                    </ResponsiveGridLayout>
                )}
            </div>

            <AddWidgetModal
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

        </div >


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
}) {

    if (!open) return null;

    return (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-6">

                <h2 className="text-xl font-bold mb-6">
                    {editingWidget ? "تعديل Widget" : "إضافة Widget"}
                </h2>

                <div className="space-y-4">

                    <input
                        value={widgetForm.title}
                        onChange={(e) =>
                            setWidgetForm({
                                ...widgetForm,
                                title: e.target.value
                            })
                        }
                        placeholder="عنوان الـ Widget"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    />

                    <select
                        value={widgetForm.widget_type}
                        onChange={(e) =>
                            setWidgetForm({
                                ...widgetForm,
                                widget_type: e.target.value
                            })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    >

                        <option value="table">Table</option>
                        <option value="kpi">KPI</option>
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>

                    </select>

                    <select
                        value={widgetForm.report_id}
                        onChange={(e) =>
                            setWidgetForm({
                                ...widgetForm,
                                report_id: e.target.value
                            })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    >

                        <option value="">

                            اختر التقرير

                        </option>

                        {reports.map(report => (

                            <option
                                key={report.id}
                                value={report.id}
                            >

                                {report.name}

                            </option>

                        ))}

                    </select>

                </div>

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-700 rounded-lg"
                    >

                        إلغاء

                    </button>

                    <button
                        onClick={onCreate}
                        className="px-4 py-2 bg-blue-600 rounded-lg text-white"
                    >

                        إنشاء

                    </button>

                </div>

            </div>

        </div>

    );

}

function TableWidget({ widget }) {

    const [loading, setLoading] = useState(true);

    const [result, setResult] = useState(null);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [sortColumn, setSortColumn] = useState("");

    const [sortDirection, setSortDirection] = useState("asc");

    const pageSize = 10;

    useEffect(() => {

        load();

    }, [widget.report_id]);

    const load = async () => {

        try {

            const report =
                await reportService.getReport(widget.report_id);

            const query =
                report.config?.query;

            if (!query) {
                throw new Error("Report query not found");
            }


            const { data } = await apiClient.post(
                "/report-builder/run",
                {
                    ...report.config.query,
                    visualization: {
                        ...report.config.visualization,
                        type: widget.widget_type,
                    },
                }
            );


            setResult(data);

            console.log(report.config.query);

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

        return <div>Loading...</div>;

    }

    if (!result) {

        return <div>No Data</div>;

    }


    return (

        <div className="space-y-3 h-full flex flex-col">

            <div className="flex items-center justify-between gap-3">

                <div className="relative w-full">

                    <Search
                        size={16}
                        className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => {

                            setSearch(e.target.value);

                            setPage(1);

                        }}
                        placeholder="بحث..."
                        className="w-full rounded-lg bg-slate-950 border border-slate-700 pl-10 pr-3 py-2"
                    />

                </div>

                <div className="text-sm text-slate-400 whitespace-nowrap">

                    {sortedRows.length} نتيجة

                </div>

            </div>

            <div className="overflow-auto rounded-lg border border-slate-800 flex-1 max-h-[420px]">

                <table className="w-full border-collapse">

                    <thead className="sticky top-0 bg-slate-900 z-20">

                        <tr>

                            <th className="border px-3 py-2 w-14">

                                #

                            </th>

                            {result.columns.map(col => (

                                <th
                                    key={col.id}
                                    onClick={() => sortBy(col.id)}
                                    className="border px-3 py-2 text-right cursor-pointer hover:bg-slate-800"
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
                                className="odd:bg-slate-900 even:bg-slate-950 hover:bg-slate-800"
                            >

                                <td className="border px-3 py-2">

                                    {(page - 1) * pageSize + index + 1}

                                </td>

                                {result.columns.map(col => (

                                    <td
                                        key={col.id}
                                        className="border px-3 py-2"
                                    >

                                        {renderCell(row[col.id])}

                                    </td>

                                ))}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            <div className="flex items-center justify-between">

                <div className="flex gap-2">

                    <button
                        onClick={exportExcel}
                        className="border rounded px-2 py-1 hover:bg-slate-800"
                    >
                        <FileSpreadsheet size={16} />
                    </button>

                    <button
                        onClick={exportCSV}
                        className="border rounded px-2 py-1 hover:bg-slate-800"
                    >
                        <FileText size={16} />
                    </button>

                    <button
                        onClick={exportPDF}
                        className="border rounded px-2 py-1 hover:bg-slate-800"
                    >
                        <FileDown size={16} />
                    </button>

                </div>

                <div className="flex items-center gap-2">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="border rounded p-2 disabled:opacity-40"
                    >

                        <ChevronRight size={16} />

                    </button>

                    <span>

                        {page} / {totalPages}

                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="border rounded p-2 disabled:opacity-40"
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

function ChartLoader({ widget }) {

    const [loading, setLoading] = useState(true);

    const [result, setResult] = useState(null);

    // console.log(result);
    // console.log(widget.widget_type);
    // console.log(result?.chart?.type);

    useEffect(() => {
        load();
    }, [widget.report_id, widget.widget_type]);

    const load = async () => {

        const report =
            await reportService.getReport(widget.report_id);


        const { data } = await apiClient.post(
            "/report-builder/run",
            {
                ...report.config.query,
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

    const chartData = result.chart;

    if (!chartData) {
        return (
            <div className="text-center py-10 text-slate-400">
                هذا التقرير لا يحتوي على إعدادات رسم بياني.
            </div>
        );
    }

    const chartType = widget.widget_type;

    if (
        !chartData.labels ||
        !chartData.datasets?.length
    ) {
        return (
            <div className="text-center py-10">
                لا توجد بيانات للرسم البياني
            </div>
        );
    }


    if (chartType === "bar") {

        return (

            <ResponsiveContainer width="100%" height={320}>

                <BarChart
                    data={chartData.labels.map((label, i) => ({
                        name: label,
                        value: chartData.datasets[0].data[i],
                    }))}
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Bar dataKey="value" />

                </BarChart>

            </ResponsiveContainer>

        );

    }

    if (chartType === "line") {

        return (

            <ResponsiveContainer width="100%" height={320}>

                <LineChart
                    data={chartData.labels.map((label, i) => ({
                        name: label,
                        value: chartData.datasets[0].data[i],
                    }))}
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Line
                        dataKey="value"
                        type="monotone"
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
                        data={chartData.labels.map((label, i) => ({
                            name: label,
                            value: chartData.datasets[0].data[i],
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                    />

                    <Tooltip />

                </PieChart>

            </ResponsiveContainer>

        );

    }

    if (chartType === "kpi") {
        return (

            <div className="text-center py-12">

                <div className="text-6xl font-bold">

                    {result.rows.length}

                </div>

                <div className="text-slate-400 mt-3">

                    إجمالي السجلات

                </div>

            </div>

        );

    }

    return null;
}