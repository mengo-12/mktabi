"use client";

import { useState } from "react";
import useReportStore from "../store/reportStore";
import EmptyCanvas from "./EmptyCanvas";
import reportBuilderService from "../services/reportBuilderService";

import {
    Database,
    CheckSquare,
    Square,
    Columns3
} from "lucide-react";

export default function QueryCanvas() {

    const [previewRows, setPreviewRows] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);


    const {
        selectedTable,
        report,
        toggleColumn,
        reportResult,
        setReportResult,
        selectedRelations,
        toggleRelation,
        dataSources
    } = useReportStore();

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
                    ? `${prefix} → ${column.label || column.name}}`
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


    const isSelected = (columnId) => {
        return selectedColumns.some(
            (col) => String(col.id) === String(columnId)
        );
    };

    const SectionCard = ({ title, description, children }) => (
        <div className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">
                    {title}
                </h3>

                {description && (
                    <p className="text-xs text-slate-500 mt-1">
                        {description}
                    </p>
                )}
            </div>

            <div className="p-4">
                {children}
            </div>
        </div>
    );

    const runQuery = async () => {
        if (!selectedTable) return;

        setLoadingPreview(true);

        try {
            const payload = {
                table_id: selectedTable.id,

                columns: selectedColumns.map((column) => ({
                    id: column.id,
                    name: column.name,
                    type: column.type,
                    path: column.path || [],
                })),

                relations: selectedRelations.map((relation) => ({
                    column_id: relation.column.id,
                    table_id:
                        relation.table?.id ??
                        relation.column.relatedTableId ??
                        relation.column.relation?.table_id,
                })),
            };

            const result = await reportBuilderService.runQuery(payload);

            setReportResult(result);
            setPreviewRows(result.rows || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPreview(false);
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

            <div className="border-b border-slate-800 px-6 py-5">

                <div className="flex items-center gap-3">

                    <Database className="w-6 h-6 text-cyan-400" />

                    <div>

                        <h2 className="text-xl font-bold text-white">
                            {selectedTable.name}
                        </h2>

                        <p className="text-xs text-slate-400 mt-1">
                            الجدول الأساسي للتقرير
                        </p>

                    </div>

                    <button
                        onClick={runQuery}
                        className="px-4 py-2 rounded bg-blue-600 text-white"
                    >
                        تشغيل التقرير
                    </button>

                </div>

            </div>

            {/* ================= Columns ================= */}

            <div className="flex-1 overflow-auto p-6">

                <div className="mb-6">

                    <div className="flex items-center gap-2 mb-4">

                        <Columns3 className="w-5 h-5 text-cyan-400" />

                        <h3 className="font-semibold text-white">
                            الأعمدة
                        </h3>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        {columns.map((column) => {

                            const checked =
                                isSelected(column.id);

                            return (

                                <button
                                    key={`${column.id}-${JSON.stringify(column.path || [])}`}
                                    type="button"
                                    onClick={() =>
                                        toggleColumn(column)
                                    }
                                    className={`
                                        flex
                                        items-center
                                        gap-3
                                        p-3
                                        rounded-xl
                                        border
                                        transition-all
                                        text-left

                                        ${checked
                                            ? "border-cyan-500 bg-cyan-500/10"
                                            : "border-slate-800 hover:border-slate-700 bg-slate-900"}
                                    `}
                                >

                                    {checked ? (

                                        <CheckSquare
                                            className="w-5 h-5 text-cyan-400"
                                        />

                                    ) : (

                                        <Square
                                            className="w-5 h-5 text-slate-500"
                                        />

                                    )}

                                    <div>

                                        <div className="text-sm font-medium text-white">

                                            {column.label || column.name}

                                        </div>

                                        <div className="text-[11px] text-slate-500">

                                            {column.type}

                                        </div>

                                    </div>

                                </button>

                            );

                        })}

                    </div>

                </div>

                {/* ================= Selected Columns ================= */}

                <div className="border-t border-slate-800 pt-6">

                    <h3 className="text-sm font-semibold text-white mb-4">

                        الأعمدة المختارة

                        <span className="ml-2 text-cyan-400">

                            ({selectedColumns.length})

                        </span>

                    </h3>

                    {selectedColumns.length === 0 ? (

                        <div className="text-sm text-slate-500">

                            لم يتم اختيار أي أعمدة بعد.

                        </div>

                    ) : (

                        <div className="flex flex-wrap gap-2">

                            {selectedColumns.map((column) => (

                                <div
                                    key={`${column.id}-${JSON.stringify(column.path || [])}`}
                                    className="
                                        px-3
                                        py-1.5
                                        rounded-full
                                        bg-cyan-500/10
                                        border
                                        border-cyan-500/20
                                        text-cyan-300
                                        text-xs
                                        font-medium
                                    "
                                >

                                    {column.label || column.name}

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* ================= filters ================= */}

                <SectionCard
                    title="Filters"
                    description="سيتم هنا إنشاء شروط البحث الخاصة بالتقرير."
                >
                    <div className="text-slate-500 text-sm">
                        لا توجد فلاتر حالياً.
                    </div>
                </SectionCard>

                {/* ================= relations ================= */}


                <SectionCard
                    title="Relations"
                    description="ربط الجدول الحالي بالجداول الأخرى."
                >
                    <div className="space-y-3">

                        {

                            relationColumns.length === 0 ?

                                (

                                    <div className="text-sm text-slate-500">

                                        لا يحتوي هذا الجدول على أي علاقات.

                                    </div>

                                )

                                :

                                relationColumns.map((column) => {

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

                                        <label
                                            key={column.id}
                                            className="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            border
                            border-slate-800
                            bg-slate-900
                            px-4
                            py-3
                            cursor-pointer
                        "
                                        >

                                            <div>

                                                <div className="text-white text-sm">

                                                    {column.label || column.name}

                                                </div>

                                                <div className="text-xs text-slate-500">

                                                    →

                                                    {

                                                        relatedTable?.name ||

                                                        `جدول #${relationTableId}`

                                                    }

                                                </div>

                                            </div>

                                            <input

                                                type="checkbox"

                                                checked={checked}

                                                onChange={() =>

                                                    toggleRelation({

                                                        column,

                                                        table: relatedTable

                                                    })

                                                }

                                            />

                                        </label>

                                    );

                                })

                        }

                    </div>
                </SectionCard>




                {/* ================= group by ================= */}


                <SectionCard
                    title="Group By"
                    description="تجميع النتائج حسب أحد الأعمدة."
                >
                    <div className="text-slate-500 text-sm">
                        لا يوجد تجميع.
                    </div>
                </SectionCard>

                {/* ================= sorting ================= */}


                <SectionCard
                    title="Sorting"
                    description="ترتيب نتائج التقرير."
                >
                    <div className="text-slate-500 text-sm">
                        لا يوجد ترتيب.
                    </div>
                </SectionCard>


                {/* ================= calculated fields ================= */}


                <SectionCard
                    title="Calculated Fields"
                    description="إنشاء حقول محسوبة مثل SUM و COUNT و AVG."
                >
                    <div className="text-slate-500 text-sm">
                        لا توجد حقول محسوبة.
                    </div>
                </SectionCard>

                {/* ================= preview ================= */}



                <SectionCard
                    title="Preview"
                    description="نتائج تنفيذ التقرير"
                >

                    {loadingPreview ? (

                        <div className="text-center py-10 text-slate-400">
                            جاري تحميل البيانات...
                        </div>

                    ) : previewRows.length === 0 ? (

                        <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">

                            <div className="text-slate-400 text-sm">
                                لا توجد بيانات حتى الآن.
                            </div>

                        </div>

                    ) : (

                        <div className="overflow-auto rounded-lg border border-slate-800">

                            <table className="min-w-full text-sm">

                                <thead className="bg-slate-900">

                                    <tr>

                                        {selectedColumns.map(col => (

                                            <th
                                                key={`${col.id}-${JSON.stringify(col.path || [])}`}
                                                className="border-b border-slate-800 px-3 py-2 text-left"
                                            >
                                                {col.name}
                                            </th>

                                        ))}

                                    </tr>

                                </thead>

                                <tbody>

                                    {previewRows.map(row => (

                                        <tr
                                            key={row.id}
                                            className="hover:bg-slate-900/40"
                                        >

                                            {selectedColumns.map(col => (

                                                <td
                                                    key={`${col.id}-${JSON.stringify(col.path || [])}`}
                                                    className="border-b border-slate-800 px-3 py-2"
                                                >
                                                    {renderCellValue(row[col.id])}
                                                </td>

                                            ))}

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </SectionCard>

                {reportResult && (

                    <div className="border rounded-lg p-4 mt-6">

                        <h3 className="font-semibold mb-3">
                            Preview
                        </h3>

                        {loadingPreview ? (
                            <div>Loading...</div>
                        ) : (
                            <table className="w-full text-sm">

                                <thead>
                                    <tr>
                                        {selectedColumns.map(col => (
                                            <th
                                                key={`${col.id}-${JSON.stringify(col.path || [])}`}
                                                className="border px-2 py-1 text-left"
                                            >
                                                {col.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>

                                    {reportResult.rows.map((row) => (

                                        <tr key={row.id}>

                                            {selectedColumns.map(col => (

                                                <td
                                                    key={`${col.id}-${JSON.stringify(col.path || [])}`}
                                                    className="border px-2 py-1"

                                                >
                                                    {renderCellValue(row[col.id])}
                                                </td>

                                            ))}

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        )}

                    </div>

                )}

            </div>

        </div>
    );

}