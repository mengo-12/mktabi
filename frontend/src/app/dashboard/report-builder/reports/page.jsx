"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import reportBuilderService from "../services/reportBuilderService";
import { Eye, Pencil, Trash2, FileText } from "lucide-react";

export default function ReportsPage() {
    const router = useRouter();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReports = async () => {
        try {
            setLoading(true);

            const data = await reportBuilderService.getReports();

            setReports(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleOpen = (report) => {
        router.push(`/dashboard/report-builder?report=${report.id}`);
    };

    const handleEdit = (report) => {
        router.push(`/dashboard/report-builder?report=${report.id}&edit=1`);
    };

    const handleDelete = async (report) => {

        if (!confirm(`هل تريد حذف التقرير "${report.name}" ؟`))
            return;

        try {

            await reportBuilderService.deleteReport(report.id);

            await loadReports();

        } catch (e) {

            console.error(e);

            alert("فشل حذف التقرير");

        }

    };

    return (
        <div className="p-6">

            <div className="flex items-center justify-between mb-6">

                <h1 className="text-2xl font-bold text-white">
                    التقارير المحفوظة
                </h1>

                <button
                    onClick={() => router.push("/dashboard/report-builder")}
                    className="px-4 py-2 rounded-lg bg-cyan-600 text-white"
                >
                    تقرير جديد
                </button>

            </div>

            {loading ? (

                <div className="text-slate-400">
                    جاري تحميل التقارير...
                </div>

            ) : reports.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
                    لا توجد تقارير محفوظة.
                </div>

            ) : (

                <div className="overflow-hidden rounded-xl border border-slate-800">

                    <table className="min-w-full">

                        <thead className="bg-slate-900">

                            <tr>

                                <th className="px-4 py-3 text-right">
                                    الاسم
                                </th>

                                <th className="px-4 py-3 text-right">
                                    الوصف
                                </th>

                                <th className="px-4 py-3 text-center">
                                    الإجراءات
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {reports.map((report) => (

                                <tr
                                    key={report.id}
                                    className="border-t border-slate-800 hover:bg-slate-900/50"
                                >

                                    <td className="px-4 py-3">

                                        <div className="flex items-center gap-2">

                                            <FileText
                                                size={18}
                                                className="text-cyan-400"
                                            />

                                            {report.name}

                                        </div>

                                    </td>

                                    <td className="px-4 py-3 text-slate-400">

                                        {report.description || "-"}

                                    </td>

                                    <td className="px-4 py-3">

                                        <div className="flex justify-center gap-2">

                                            <button
                                                onClick={() => handleOpen(report)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleEdit(report)}
                                                className="rounded bg-amber-600 p-2"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(report)}
                                                className="rounded bg-red-600 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}