"use client";

import { useEffect, useState } from "react";
import backupService from "@/services/backupService";
import usePagePermission from "@/hooks/usePagePermission";
import { useRouter } from "next/navigation";

export default function BackupsPage() {

    const router = useRouter();

    const {
        permission,
        canRead,
        canWrite
    } = usePagePermission("backups");

    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBackups = async () => {

        try {

            const data = await backupService.getBackups();
            setBackups(data);

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

        loadBackups();

    }, []);

    const handleCreateBackup = async () => {

        if (!canWrite) {
            return;
        }

        await backupService.createBackup();

        await loadBackups();
    };


    const handleDeleteBackup = async (filename) => {

        if (!canWrite) {
            return;
        }

        if (!confirm("هل تريد حذف هذه النسخة الاحتياطية؟")) {
            return;
        }

        await backupService.deleteBackup(filename);

        await loadBackups();
    };

    const handleRestoreBackup = async (filename) => {

        if (!canWrite) {
            return;
        }

        if (
            !confirm(
                "سيتم استبدال قاعدة البيانات الحالية بالكامل، هل أنت متأكد؟"
            )
        ) {
            return;
        }

        await backupService.restoreBackup(filename);

        alert("تمت استعادة النسخة الاحتياطية بنجاح.");
    };

    return (

        <div className="p-6">

            <div className="flex justify-between items-center mb-6">

                <h1 className="text-2xl font-bold">
                    النسخ الاحتياطية
                </h1>

                {canWrite && (
                    <button
                        onClick={handleCreateBackup}
                        className="px-4 py-2 rounded bg-blue-600 text-white"
                    >
                        إنشاء نسخة احتياطية
                    </button>
                )}

            </div>

            {loading ? (

                <div>جاري التحميل...</div>

            ) : (

                <table className="w-full border">

                    <thead>

                        <tr className="bg-gray-100">

                            <th className="p-2">الملف</th>

                            <th className="p-2">الحجم</th>

                            <th className="p-2">تاريخ الإنشاء</th>

                            <th className="p-2">تحميل</th>

                            <th className="p-2">
                                حذف
                            </th>

                            <th className="p-2">
                                استعادة
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {backups.map((backup) => (

                            <tr key={backup.filename}>

                                <td className="border p-2">
                                    {backup.filename}
                                </td>

                                <td className="border p-2">
                                    {backup.size}
                                </td>

                                <td className="border p-2">
                                    {backup.created_at}
                                </td>

                                <td className="border p-2">

                                    <button
                                        onClick={() =>
                                            backupService.downloadBackup(
                                                backup.filename
                                            )
                                        }
                                        className="text-blue-600"
                                    >
                                        تحميل
                                    </button>

                                </td>

                                <td className="border p-2">

                                    {canWrite && (
                                        <td className="border p-2">
                                            <button
                                                onClick={() =>
                                                    handleDeleteBackup(backup.filename)
                                                }
                                                className="text-red-600"
                                            >
                                                حذف
                                            </button>
                                        </td>
                                    )}

                                </td>

                                <td className="border p-2">

                                    {canWrite && (
                                        <td className="border p-2">
                                            <button
                                                onClick={() =>
                                                    handleRestoreBackup(backup.filename)
                                                }
                                                className="text-green-600"
                                            >
                                                استعادة
                                            </button>
                                        </td>
                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>

    );

}