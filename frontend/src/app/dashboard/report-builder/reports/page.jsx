// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import reportBuilderService from "../services/reportBuilderService";
// import { Eye, Pencil, Trash2, FileText } from "lucide-react";
// import usePagePermission from "@/hooks/usePagePermission";

// export default function ReportsPage() {
//     const router = useRouter();
//     const { canRead, canWrite } = usePagePermission("report-builder");

//     const [reports, setReports] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const loadReports = async () => {
//         try {
//             setLoading(true);

//             const data = await reportBuilderService.getReports();

//             setReports(data || []);
//         } catch (e) {
//             console.error(e);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadReports();
//     }, []);

//     const handleOpen = (report) => {
//         router.push(`/dashboard/report-builder?report=${report.id}`);
//     };

//     const handleEdit = (report) => {
//         if (!canWrite) return;

//         router.push(`/dashboard/report-builder?report=${report.id}&edit=1`);
//     };

//     const handleDelete = async (report) => {
//         if (!canWrite) return;

//         if (!confirm(`هل تريد حذف التقرير "${report.name}" ؟`))
//             return;

//         try {

//             await reportBuilderService.deleteReport(report.id);

//             await loadReports();

//         } catch (e) {

//             console.error(e);

//             alert("فشل حذف التقرير");

//         }

//     };

//     return (
//         <div className="p-6">

//             <div className="flex items-center justify-between mb-6">

//                 <h1 className="text-2xl font-bold text-white">
//                     التقارير المحفوظة
//                 </h1>

//                 {canWrite && (
//                     <button
//                         onClick={() => router.push("/dashboard/report-builder")}
//                         className="px-4 py-2 rounded-lg bg-cyan-600 text-white"
//                     >
//                         تقرير جديد
//                     </button>
//                 )}

//             </div>

//             {loading ? (

//                 <div className="text-slate-400">
//                     جاري تحميل التقارير...
//                 </div>

//             ) : reports.length === 0 ? (

//                 <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
//                     لا توجد تقارير محفوظة.
//                 </div>

//             ) : (

//                 <div className="overflow-hidden rounded-xl border border-slate-800">

//                     <table className="min-w-full">

//                         <thead className="bg-slate-900">

//                             <tr>

//                                 <th className="px-4 py-3 text-right">
//                                     الاسم
//                                 </th>

//                                 <th className="px-4 py-3 text-right">
//                                     الوصف
//                                 </th>

//                                 <th className="px-4 py-3 text-center">
//                                     الإجراءات
//                                 </th>

//                             </tr>

//                         </thead>

//                         <tbody>

//                             {reports.map((report) => (

//                                 <tr
//                                     key={report.id}
//                                     className="border-t border-slate-800 hover:bg-slate-900/50"
//                                 >

//                                     <td className="px-4 py-3">

//                                         <div className="flex items-center gap-2">

//                                             <FileText
//                                                 size={18}
//                                                 className="text-cyan-400"
//                                             />

//                                             {report.name}

//                                         </div>

//                                     </td>

//                                     <td className="px-4 py-3 text-slate-400">

//                                         {report.description || "-"}

//                                     </td>

//                                     <td className="px-4 py-3">

//                                         <div className="flex justify-center gap-2">

//                                             <button
//                                                 onClick={() => handleOpen(report)}
//                                                 className="px-3 py-1 bg-blue-600 text-white rounded"
//                                             >
//                                                 <Eye size={18} />
//                                             </button>

//                                             {canWrite && (
//                                                 <button
//                                                     onClick={() => handleEdit(report)}
//                                                     className="rounded bg-amber-600 p-2"
//                                                 >
//                                                     <Pencil size={18} />
//                                                 </button>
//                                             )}

//                                             {canWrite && (
//                                                 <button
//                                                     onClick={() => handleDelete(report)}
//                                                     className="rounded bg-red-600 p-2"
//                                                 >
//                                                     <Trash2 size={18} />
//                                                 </button>
//                                             )}

//                                         </div>

//                                     </td>

//                                 </tr>

//                             ))}

//                         </tbody>

//                     </table>

//                 </div>

//             )}

//         </div>
//     );
// }



"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import reportBuilderService from "../services/reportBuilderService";
import { Eye, Pencil, Trash2, FileText } from "lucide-react";
import usePagePermission from "@/hooks/usePagePermission";

export default function ReportsPage() {
    const router = useRouter();
    const { canRead, canWrite } = usePagePermission("report-builder");

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
        if (!canWrite) return;

        router.push(`/dashboard/report-builder?report=${report.id}&edit=1`);
    };

    const handleDelete = async (report) => {
        if (!canWrite) return;

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
        <div className="mr-64 min-h-screen bg-slate-100 dark:bg-slate-950">
            <div className="space-y-8">

                {/* ================= Header ================= */}

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6">

                        <div className="flex items-center gap-4">

                            <div
                                className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-cyan-500
                        to-blue-600
                        text-white
                        shadow-lg
                    "
                            >

                                <FileText className="w-7 h-7" />

                            </div>

                            <div>

                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">

                                    التقارير المحفوظة

                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                                    إدارة جميع التقارير المحفوظة وتشغيلها أو تعديلها أو حذفها.

                                </p>

                            </div>

                        </div>

                        {canWrite && (

                            <button
                                onClick={() => router.push("/dashboard/report-builder")}
                                className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-blue-600
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        shadow-md
                        transition
                        hover:bg-blue-700
                    "
                            >

                                + تقرير جديد

                            </button>

                        )}

                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 border-t border-slate-200 dark:border-slate-800">

                        <div className="p-5">

                            <div className="text-xs uppercase tracking-wide text-slate-500">

                                إجمالي التقارير

                            </div>

                            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">

                                {reports.length}

                            </div>

                        </div>

                        <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                            <div className="text-xs uppercase tracking-wide text-slate-500">

                                الحالة

                            </div>

                            <div className="mt-2 text-lg font-semibold text-emerald-600">

                                جاهزة

                            </div>

                        </div>

                        <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                            <div className="text-xs uppercase tracking-wide text-slate-500">

                                آخر تحديث

                            </div>

                            <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">

                                الآن

                            </div>

                        </div>

                    </div>

                </div>


                {loading ? (

                    <div
                        className="
            rounded-2xl
            border
            border-slate-200
            dark:border-slate-800
            bg-white
            dark:bg-slate-900
            p-16
            text-center
            shadow-sm
        "
                    >

                        <div className="animate-pulse text-5xl mb-4">
                            ⏳
                        </div>

                        <div className="text-lg font-medium text-slate-700 dark:text-slate-300">

                            جاري تحميل التقارير...

                        </div>

                    </div>

                ) : reports.length === 0 ? (

                    <div
                        className="
            rounded-2xl
            border-2
            border-dashed
            border-slate-300
            dark:border-slate-700
            bg-white
            dark:bg-slate-900
            p-16
            text-center
            shadow-sm
        "
                    >

                        <div className="text-6xl mb-5">

                            📄

                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                            لا توجد تقارير محفوظة

                        </h2>

                        <p className="mt-3 text-slate-500 dark:text-slate-400">

                            قم بإنشاء أول تقرير ليظهر هنا.

                        </p>

                    </div>

                ) : (

                    <div
                        className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            dark:border-slate-800
            bg-white
            dark:bg-slate-900
            shadow-sm
        "
                    >

                        <table className="min-w-full">

                            <thead className="bg-slate-50 dark:bg-slate-800/70">

                                <tr>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">

                                        التقرير

                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">

                                        الوصف

                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">

                                        الإجراءات

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {reports.map((report) => (

                                    <tr
                                        key={report.id}
                                        className="
                            border-t
                            border-slate-200
                            dark:border-slate-800
                            transition-colors
                            hover:bg-slate-50
                            dark:hover:bg-slate-800/40
                        "
                                    >

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-4">

                                                <div
                                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-100
                                        dark:bg-blue-900/30
                                    "
                                                >

                                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />

                                                </div>

                                                <div>

                                                    <div className="font-semibold text-slate-900 dark:text-white">

                                                        {report.name}

                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-500">

                                                        Report #{report.id}

                                                    </div>

                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-5">

                                            <div className="max-w-xl text-sm text-slate-500 dark:text-slate-400">

                                                {report.description || "لا يوجد وصف لهذا التقرير."}

                                            </div>

                                        </td>

                                        <td className="px-6 py-5">

                                            <div className="flex items-center justify-center gap-2">

                                                <button
                                                    onClick={() => handleOpen(report)}
                                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-slate-200
                                        dark:border-slate-700
                                        hover:bg-blue-50
                                        dark:hover:bg-blue-900/20
                                        transition
                                    "
                                                >

                                                    <Eye className="w-5 h-5 text-blue-600" />

                                                </button>

                                                {canWrite && (

                                                    <button
                                                        onClick={() => handleEdit(report)}
                                                        className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-slate-200
                                            dark:border-slate-700
                                            hover:bg-amber-50
                                            dark:hover:bg-amber-900/20
                                            transition
                                        "
                                                    >

                                                        <Pencil className="w-5 h-5 text-amber-600" />

                                                    </button>

                                                )}

                                                {canWrite && (

                                                    <button
                                                        onClick={() => handleDelete(report)}
                                                        className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-slate-200
                                            dark:border-slate-700
                                            hover:bg-red-50
                                            dark:hover:bg-red-900/20
                                            transition
                                        "
                                                    >

                                                        <Trash2 className="w-5 h-5 text-red-600" />

                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>
        </div>
    );
}