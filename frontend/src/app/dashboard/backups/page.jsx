// "use client";

// import { useEffect, useState } from "react";
// import backupService from "@/services/backupService";
// import usePagePermission from "@/hooks/usePagePermission";
// import { useRouter } from "next/navigation";

// export default function BackupsPage() {

//     const router = useRouter();

//     const {
//         permission,
//         canRead,
//         canWrite
//     } = usePagePermission("backups");

//     const [backups, setBackups] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const loadBackups = async () => {

//         try {

//             const data = await backupService.getBackups();
//             setBackups(data);

//         } finally {

//             setLoading(false);

//         }

//     };

//     useEffect(() => {
//         if (permission === "no_access") {
//             router.replace("/dashboard");
//         }
//     }, [permission, router]);


//     useEffect(() => {

//         loadBackups();

//     }, []);

//     const handleCreateBackup = async () => {

//         if (!canWrite) {
//             return;
//         }

//         await backupService.createBackup();

//         await loadBackups();
//     };


//     const handleDeleteBackup = async (filename) => {

//         if (!canWrite) {
//             return;
//         }

//         if (!confirm("هل تريد حذف هذه النسخة الاحتياطية؟")) {
//             return;
//         }

//         await backupService.deleteBackup(filename);

//         await loadBackups();
//     };

//     const handleRestoreBackup = async (filename) => {

//         if (!canWrite) {
//             return;
//         }

//         if (
//             !confirm(
//                 "سيتم استبدال قاعدة البيانات الحالية بالكامل، هل أنت متأكد؟"
//             )
//         ) {
//             return;
//         }

//         await backupService.restoreBackup(filename);

//         alert("تمت استعادة النسخة الاحتياطية بنجاح.");
//     };

//     return (

//         <div className="p-6">

//             <div className="flex justify-between items-center mb-6">

//                 <h1 className="text-2xl font-bold">
//                     النسخ الاحتياطية
//                 </h1>

//                 {canWrite && (
//                     <button
//                         onClick={handleCreateBackup}
//                         className="px-4 py-2 rounded bg-blue-600 text-white"
//                     >
//                         إنشاء نسخة احتياطية
//                     </button>
//                 )}

//             </div>

//             {loading ? (

//                 <div>جاري التحميل...</div>

//             ) : (

//                 <table className="w-full border">

//                     <thead>

//                         <tr className="bg-gray-100">

//                             <th className="p-2">الملف</th>

//                             <th className="p-2">الحجم</th>

//                             <th className="p-2">تاريخ الإنشاء</th>

//                             <th className="p-2">تحميل</th>

//                             <th className="p-2">
//                                 حذف
//                             </th>

//                             <th className="p-2">
//                                 استعادة
//                             </th>

//                         </tr>

//                     </thead>

//                     <tbody>

//                         {backups.map((backup) => (

//                             <tr key={backup.filename}>

//                                 <td className="border p-2">
//                                     {backup.filename}
//                                 </td>

//                                 <td className="border p-2">
//                                     {backup.size}
//                                 </td>

//                                 <td className="border p-2">
//                                     {backup.created_at}
//                                 </td>

//                                 <td className="border p-2">

//                                     <button
//                                         onClick={() =>
//                                             backupService.downloadBackup(
//                                                 backup.filename
//                                             )
//                                         }
//                                         className="text-blue-600"
//                                     >
//                                         تحميل
//                                     </button>

//                                 </td>

//                                 <td className="border p-2">

//                                     {canWrite && (
//                                         <td className="border p-2">
//                                             <button
//                                                 onClick={() =>
//                                                     handleDeleteBackup(backup.filename)
//                                                 }
//                                                 className="text-red-600"
//                                             >
//                                                 حذف
//                                             </button>
//                                         </td>
//                                     )}

//                                 </td>

//                                 <td className="border p-2">

//                                     {canWrite && (
//                                         <td className="border p-2">
//                                             <button
//                                                 onClick={() =>
//                                                     handleRestoreBackup(backup.filename)
//                                                 }
//                                                 className="text-green-600"
//                                             >
//                                                 استعادة
//                                             </button>
//                                         </td>
//                                     )}

//                                 </td>

//                             </tr>

//                         ))}

//                     </tbody>

//                 </table>

//             )}

//         </div>

//     );

// }



"use client";

import { useEffect, useState } from "react";
import backupService from "@/services/backupService";
import usePagePermission from "@/hooks/usePagePermission";
import { useRouter } from "next/navigation";
import {
    DatabaseBackup,
    Download,
    Trash2,
    RotateCcw,
    Plus,
    FileArchive,
    HardDrive,
    CalendarDays,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";

export default function BackupsPage() {

    const router = useRouter();

    const {
        permission,
        canRead,
        canWrite
    } = usePagePermission("backups");

    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [restoring, setRestoring] = useState(null);

    const loadBackups = async () => {

        try {

            setLoading(true);

            const data = await backupService.getBackups();

            setBackups(Array.isArray(data) ? data : []);

        } catch (error) {

            console.error(
                "خطأ أثناء جلب النسخ الاحتياطية:",
                error
            );

            setBackups([]);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        if (permission === "no_access") {

            router.replace("/dashboard");

        }

    }, [permission, router]);


    useEffect(() => {

        if (permission !== "no_access") {
            loadBackups();
        }

    }, [permission]);


    const handleCreateBackup = async () => {

        if (!canWrite || creating) {
            return;
        }

        try {

            setCreating(true);

            await backupService.createBackup();

            await loadBackups();

        } catch (error) {

            console.error(
                "خطأ أثناء إنشاء النسخة الاحتياطية:",
                error
            );

            alert("حدث خطأ أثناء إنشاء النسخة الاحتياطية.");

        } finally {

            setCreating(false);

        }

    };


    const handleDeleteBackup = async (filename) => {

        if (!canWrite || deleting) {
            return;
        }

        if (!confirm("هل تريد حذف هذه النسخة الاحتياطية نهائياً؟")) {
            return;
        }

        try {

            setDeleting(filename);

            await backupService.deleteBackup(filename);

            await loadBackups();

        } catch (error) {

            console.error(
                "خطأ أثناء حذف النسخة الاحتياطية:",
                error
            );

            alert("حدث خطأ أثناء حذف النسخة الاحتياطية.");

        } finally {

            setDeleting(null);

        }

    };


    const handleRestoreBackup = async (filename) => {

        if (!canWrite || restoring) {
            return;
        }

        if (
            !confirm(
                "⚠️ سيتم استبدال قاعدة البيانات الحالية بالكامل بهذه النسخة الاحتياطية.\n\nهل أنت متأكد من المتابعة؟"
            )
        ) {
            return;
        }

        try {

            setRestoring(filename);

            await backupService.restoreBackup(filename);

            alert("✅ تمت استعادة النسخة الاحتياطية بنجاح.");

        } catch (error) {

            console.error(
                "خطأ أثناء استعادة النسخة الاحتياطية:",
                error
            );

            alert(
                "❌ حدث خطأ أثناء استعادة النسخة الاحتياطية."
            );

        } finally {

            setRestoring(null);

        }

    };


    const formatSize = (size) => {

        if (size === null || size === undefined) {
            return "-";
        }

        return size;

    };


    if (permission === "no_access") {
        return null;
    }


    return (

        /*
         * مهم:
         * Sidebar عندك fixed و w-64
         * لذلك نستخدم mr-64 حتى لا يدخل المحتوى تحته.
         */
        <main
            className="min-h-screen bg-slate-50 dark:bg-zinc-950 mr-64"
            dir="rtl"
        >

            <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-8">


                {/* ===================================================== */}
                {/* Header */}
                {/* ===================================================== */}

                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20">

                            <DatabaseBackup className="h-7 w-7" />

                        </div>

                        <div>

                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">

                                النسخ الاحتياطية

                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">

                                إدارة وحماية النسخ الاحتياطية لبيانات النظام.

                            </p>

                        </div>

                    </div>


                    {canWrite && (

                        <button
                            onClick={handleCreateBackup}
                            disabled={creating}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >

                            {creating ? (

                                <>

                                    <RefreshCw className="h-4 w-4 animate-spin" />

                                    جاري إنشاء النسخة...

                                </>

                            ) : (

                                <>

                                    <Plus className="h-4 w-4" />

                                    إنشاء نسخة احتياطية

                                </>

                            )}

                        </button>

                    )}

                </div>


                {/* ===================================================== */}
                {/* Statistics */}
                {/* ===================================================== */}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {/* عدد النسخ */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">

                                    إجمالي النسخ

                                </p>

                                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">

                                    {backups.length}

                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">

                                <FileArchive className="h-5 w-5" />

                            </div>

                        </div>

                    </div>


                    {/* الحالة */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">

                                    حالة النسخ الاحتياطي

                                </p>

                                <p className="mt-2 text-sm font-black text-emerald-600 dark:text-emerald-400">

                                    النظام يعمل

                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">

                                <ShieldCheck className="h-5 w-5" />

                            </div>

                        </div>

                    </div>


                    {/* التخزين */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">

                                    التخزين

                                </p>

                                <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">

                                    قاعدة البيانات

                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">

                                <HardDrive className="h-5 w-5" />

                            </div>

                        </div>

                    </div>

                </div>


                {/* ===================================================== */}
                {/* Table Card */}
                {/* ===================================================== */}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">


                    {/* Table Header */}

                    <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-base font-black text-slate-900 dark:text-white">

                                    ملفات النسخ الاحتياطية

                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">

                                    جميع النسخ الاحتياطية المتوفرة في النظام.

                                </p>

                            </div>

                            <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">

                                {backups.length} نسخة

                            </span>

                        </div>

                    </div>


                    {/* Loading */}

                    {loading ? (

                        <div className="flex min-h-[300px] items-center justify-center">

                            <div className="flex flex-col items-center gap-3">

                                <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />

                                <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">

                                    جاري تحميل النسخ الاحتياطية...

                                </p>

                            </div>

                        </div>

                    ) : backups.length === 0 ? (

                        /* Empty State */

                        <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-zinc-800">

                                <DatabaseBackup className="h-9 w-9 text-slate-400 dark:text-zinc-500" />

                            </div>

                            <h3 className="mt-5 text-lg font-black text-slate-700 dark:text-white">

                                لا توجد نسخ احتياطية

                            </h3>

                            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-zinc-400">

                                لم يتم إنشاء أي نسخة احتياطية لقاعدة البيانات حتى الآن.

                            </p>

                            {canWrite && (

                                <button
                                    onClick={handleCreateBackup}
                                    disabled={creating}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >

                                    <Plus className="h-4 w-4" />

                                    إنشاء أول نسخة

                                </button>

                            )}

                        </div>

                    ) : (

                        /* ================================================= */
                        /* Responsive Table */
                        /* ================================================= */

                        <div className="w-full overflow-x-auto">

                            <table className="w-full min-w-[900px] border-collapse text-right">

                                <thead>

                                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/50">

                                        <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400">

                                            الملف

                                        </th>

                                        <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400">

                                            الحجم

                                        </th>

                                        <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400">

                                            تاريخ الإنشاء

                                        </th>

                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-500 dark:text-zinc-400">

                                            تحميل

                                        </th>

                                        {canWrite && (

                                            <>

                                                <th className="px-6 py-4 text-center text-xs font-black text-slate-500 dark:text-zinc-400">

                                                    حذف

                                                </th>

                                                <th className="px-6 py-4 text-center text-xs font-black text-slate-500 dark:text-zinc-400">

                                                    استعادة

                                                </th>

                                            </>

                                        )}

                                    </tr>

                                </thead>


                                <tbody>

                                    {backups.map((backup, index) => (

                                        <tr
                                            key={backup.filename}
                                            className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/40 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                                        >

                                            {/* الملف */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">

                                                        <FileArchive className="h-5 w-5" />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p
                                                            className="max-w-[350px] truncate text-sm font-bold text-slate-800 dark:text-white"
                                                            title={backup.filename}
                                                        >
                                                            {backup.filename}
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">

                                                            نسخة احتياطية #{index + 1}

                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* الحجم */}

                                            <td className="px-6 py-4">

                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">

                                                    <HardDrive className="h-3.5 w-3.5" />

                                                    {formatSize(backup.size)}

                                                </span>

                                            </td>


                                            {/* التاريخ */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">

                                                    <CalendarDays className="h-4 w-4 text-slate-400" />

                                                    <span>

                                                        {backup.created_at}

                                                    </span>

                                                </div>

                                            </td>


                                            {/* تحميل */}

                                            <td className="px-6 py-4 text-center">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        backupService.downloadBackup(
                                                            backup.filename
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                                >

                                                    <Download className="h-4 w-4" />

                                                    تحميل

                                                </button>

                                            </td>


                                            {/* حذف */}

                                            {canWrite && (

                                                <td className="px-6 py-4 text-center">

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            deleting ===
                                                            backup.filename
                                                        }
                                                        onClick={() =>
                                                            handleDeleteBackup(
                                                                backup.filename
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                    >

                                                        {deleting ===
                                                        backup.filename ? (

                                                            <RefreshCw className="h-4 w-4 animate-spin" />

                                                        ) : (

                                                            <Trash2 className="h-4 w-4" />

                                                        )}

                                                        حذف

                                                    </button>

                                                </td>

                                            )}


                                            {/* استعادة */}

                                            {canWrite && (

                                                <td className="px-6 py-4 text-center">

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            restoring ===
                                                            backup.filename
                                                        }
                                                        onClick={() =>
                                                            handleRestoreBackup(
                                                                backup.filename
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                                    >

                                                        {restoring ===
                                                        backup.filename ? (

                                                            <RefreshCw className="h-4 w-4 animate-spin" />

                                                        ) : (

                                                            <RotateCcw className="h-4 w-4" />

                                                        )}

                                                        استعادة

                                                    </button>

                                                </td>

                                            )}

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* ===================================================== */}
                {/* Security Notice */}
                {/* ===================================================== */}

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/20">

                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

                    <div>

                        <p className="text-xs font-black text-amber-800 dark:text-amber-300">

                            تنبيه أمني

                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">

                            استعادة نسخة احتياطية ستستبدل بيانات قاعدة البيانات الحالية بالكامل.
                            تأكد من اختيار النسخة الصحيحة قبل تنفيذ عملية الاستعادة.

                        </p>

                    </div>

                </div>

            </div>

        </main>
    );
}
