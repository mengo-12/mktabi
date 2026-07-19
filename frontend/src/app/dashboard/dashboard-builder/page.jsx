"use client";

import { useEffect, useState } from "react";
import dashboardService from "./services/dashboardService";
import { FolderOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardBuilderPage() {

    const router = useRouter();

    const [dashboards, setDashboards] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingDashboard, setEditingDashboard] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        icon: "📊",
        color: "#3B82F6",
    });


    useEffect(() => {
        loadDashboards();
    }, []);

    const loadDashboards = async () => {
        try {
            setLoading(true);

            const data =
                await dashboardService.getDashboards();

            setDashboards(data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {

        setEditingDashboard(null);

        setForm({
            name: "",
            description: "",
            icon: "📊",
            color: "#3B82F6",
        });

        setIsModalOpen(true);

    };

    const openEditModal = (dashboard) => {

        setEditingDashboard(dashboard);

        setForm({
            name: dashboard.name || "",
            description: dashboard.description || "",
            icon: dashboard.icon || "📊",
            color: dashboard.color || "#3B82F6",
        });

        setIsModalOpen(true);

    };

    const saveDashboard = async () => {

        try {

            if (editingDashboard) {

                await dashboardService.updateDashboard(
                    editingDashboard.id,
                    form
                );

            } else {

                await dashboardService.createDashboard(form);

            }

            setIsModalOpen(false);

            loadDashboards();

        } catch (err) {

            console.error(err);

        }

    };

    const deleteDashboard = async (dashboard) => {

        if (!confirm("حذف اللوحة؟")) return;

        await dashboardService.deleteDashboard(dashboard.id);

        loadDashboards();

    };

    const openDashboard = (dashboard) => {

        router.push(
            `/dashboard/dashboard-builder/${dashboard.id}`
        );

    };

    const DashboardCard = ({ dashboard }) => (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center gap-3">

                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                        background: dashboard.color || "#3B82F6",
                    }}
                >
                    {dashboard.icon || "📊"}
                </div>

                <div>

                    <h2 className="font-semibold text-white">
                        {dashboard.name}
                    </h2>

                    <p className="text-sm text-slate-400">
                        {dashboard.description}
                    </p>

                </div>

            </div>

            <div className="flex gap-2 mt-6">

                <Link
                    href={`/dashboard/dashboard-builder/${dashboard.id}`}
                    className="flex-1 bg-cyan-600 rounded-lg py-2 text-white flex items-center justify-center gap-2"
                >
                    <FolderOpen size={16} />
                    فتح
                </Link>

                <button
                    onClick={() => openEditModal(dashboard)}
                    className="px-3 rounded-lg border border-slate-700"
                >
                    <Pencil size={16} />
                </button>

                <button
                    onClick={() => deleteDashboard(dashboard)}
                    className="px-3 rounded-lg border border-red-700 text-red-400"
                >
                    <Trash2 size={16} />
                </button>

            </div>

        </div>
    );

    return (
        <div className="mr-0 lg:mr-64 p-6">

            <div className="flex items-center justify-between mb-6">

                <h1 className="text-2xl font-bold">
                    Dashboard Builder
                </h1>

                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                    + لوحة جديدة
                </button>

            </div>

            {loading ? (

                <div>Loading...</div>

            ) : dashboards.length === 0 ? (

                <div className="border rounded-lg p-10 text-center">

                    لا توجد لوحات.

                </div>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                    {dashboards.map((dashboard) => (
                        <DashboardCard
                            key={dashboard.id}
                            dashboard={dashboard}
                        />
                    ))}

                </div>

            )}

            {
                isModalOpen && (

                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

                        <div className="w-full max-w-lg bg-slate-900 rounded-xl border border-slate-800 p-6">

                            <h2 className="text-xl font-bold mb-6 text-white">

                                {editingDashboard ? "تعديل لوحة" : "لوحة جديدة"}

                            </h2>

                            <div className="space-y-4">

                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="اسم اللوحة"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                                />

                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="الوصف"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                                />

                                <input
                                    value={form.icon}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            icon: e.target.value,
                                        })
                                    }
                                    placeholder="📊"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                                />

                                <input
                                    type="color"
                                    value={form.color}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            color: e.target.value,
                                        })
                                    }
                                    className="h-12 w-full"
                                />

                            </div>

                            <div className="flex justify-end gap-3 mt-6">

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="border border-slate-700 rounded-lg px-4 py-2"
                                >
                                    إلغاء
                                </button>

                                <button
                                    onClick={saveDashboard}
                                    className="bg-blue-600 rounded-lg px-4 py-2 text-white"
                                >
                                    حفظ
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>
    );

}