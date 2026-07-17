"use client";

import useReportStore from "../store/reportStore";

export default function PropertiesPanel() {
    const { selectedTable, report } = useReportStore();

    return (
        <div className="p-5 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-white">
                    Properties
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                    خصائص العنصر المحدد داخل Report Builder
                </p>
            </div>

            {!selectedTable ? (
                <div className="rounded-lg border border-dashed border-zinc-700 p-5 text-sm text-zinc-500">
                    اختر جدولاً من Data Sources لعرض خصائصه.
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                        <div className="text-xs text-zinc-500">
                            Table
                        </div>

                        <div className="mt-1 text-white font-medium">
                            {selectedTable.name}
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                        <div className="text-xs text-zinc-500">
                            Selected Columns
                        </div>

                        <div className="mt-2 text-cyan-400 font-semibold">
                            {report.query.columns.length}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}