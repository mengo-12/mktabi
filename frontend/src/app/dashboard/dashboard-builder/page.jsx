// "use client";

// import { useEffect, useState } from "react";
// import dashboardService from "./services/dashboardService";
// import { FolderOpen, Pencil, Trash2 } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";

// export default function DashboardBuilderPage() {

//     const router = useRouter();

//     const { user } = useAuth();

//     const pagePermission =
//         user?.role?.toLowerCase() === "admin" || user?.is_superuser
//             ? "write"
//             : (user?.system_pages?.["dashboard-builder"] || "no_access");

//     const canRead =
//         pagePermission === "read" ||
//         pagePermission === "write";

//     const canWrite =
//         pagePermission === "write";

//     const [dashboards, setDashboards] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const [editingDashboard, setEditingDashboard] = useState(null);

//     const [form, setForm] = useState({
//         name: "",
//         description: "",
//         icon: "📊",
//         color: "#3B82F6",
//     });


//     useEffect(() => {
//         loadDashboards();
//     }, []);

//     useEffect(() => {
//         if (!user) return;

//         if (!canRead) {
//             router.replace("/dashboard");
//         }
//     }, [user, canRead, router]);

//     const loadDashboards = async () => {
//         try {
//             setLoading(true);

//             const data =
//                 await dashboardService.getDashboards();

//             setDashboards(data);

//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openCreateModal = () => {
//         if (!canWrite) return;

//         setEditingDashboard(null);

//         setForm({
//             name: "",
//             description: "",
//             icon: "📊",
//             color: "#3B82F6",
//         });

//         setIsModalOpen(true);

//     };

//     const openEditModal = (dashboard) => {
//         if (!canWrite) return;

//         setEditingDashboard(dashboard);

//         setForm({
//             name: dashboard.name || "",
//             description: dashboard.description || "",
//             icon: dashboard.icon || "📊",
//             color: dashboard.color || "#3B82F6",
//         });

//         setIsModalOpen(true);

//     };

//     const saveDashboard = async () => {
//         if (!canWrite) return;

//         try {

//             if (editingDashboard) {

//                 await dashboardService.updateDashboard(
//                     editingDashboard.id,
//                     form
//                 );

//             } else {

//                 await dashboardService.createDashboard(form);

//             }

//             setIsModalOpen(false);

//             loadDashboards();

//         } catch (err) {

//             console.error(err);

//         }

//     };

//     const deleteDashboard = async (dashboard) => {
//         if (!canWrite) return;

//         if (!confirm("حذف اللوحة؟")) return;

//         await dashboardService.deleteDashboard(dashboard.id);

//         loadDashboards();

//     };

//     const openDashboard = (dashboard) => {

//         router.push(
//             `/dashboard/dashboard-builder/${dashboard.id}`
//         );

//     };

//     const DashboardCard = ({ dashboard }) => (
//         <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

//             <div className="flex items-center gap-3">

//                 <div
//                     className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
//                     style={{
//                         background: dashboard.color || "#3B82F6",
//                     }}
//                 >
//                     {dashboard.icon || "📊"}
//                 </div>

//                 <div>

//                     <h2 className="font-semibold text-white">
//                         {dashboard.name}
//                     </h2>

//                     <p className="text-sm text-slate-400">
//                         {dashboard.description}
//                     </p>

//                 </div>

//             </div>

//             <div className="flex gap-2 mt-6">

//                 <Link
//                     href={`/dashboard/dashboard-builder/${dashboard.id}`}
//                     className="flex-1 bg-cyan-600 rounded-lg py-2 text-white flex items-center justify-center gap-2"
//                 >
//                     <FolderOpen size={16} />
//                     فتح
//                 </Link>

//                 <button
//                     disabled={!canWrite}
//                     onClick={() => canWrite && openEditModal(dashboard)}
//                     className="px-3 rounded-lg border border-slate-700"
//                 >
//                     <Pencil size={16} />
//                 </button>

//                 <button
//                     disabled={!canWrite}
//                     onClick={() => canWrite && deleteDashboard(dashboard)}
//                     className="px-3 rounded-lg border border-red-700 text-red-400"
//                 >
//                     <Trash2 size={16} />
//                 </button>

//             </div>

//         </div>
//     );

//     if (!canRead) {
//         return (
//             <div className="flex items-center justify-center h-screen">
//                 ليس لديك صلاحية للوصول إلى Dashboard Builder
//             </div>
//         );
//     }

//     return (
//         <div className="mr-0 lg:mr-64 p-6">

//             <div className="flex items-center justify-between mb-6">

//                 <h1 className="text-2xl font-bold">
//                     Dashboard Builder
//                 </h1>

//                 <button
//                     disabled={!canWrite}
//                     onClick={() => canWrite && openCreateModal()}
//                     className="px-4 py-2 rounded bg-blue-600 text-white"
//                 >
//                     + لوحة جديدة
//                 </button>

//             </div>

//             {loading ? (

//                 <div>Loading...</div>

//             ) : dashboards.length === 0 ? (

//                 <div className="border rounded-lg p-10 text-center">

//                     لا توجد لوحات.

//                 </div>

//             ) : (

//                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

//                     {dashboards.map((dashboard) => (
//                         <DashboardCard
//                             key={dashboard.id}
//                             dashboard={dashboard}
//                         />
//                     ))}

//                 </div>

//             )}

//             {
//                 isModalOpen && (

//                     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

//                         <div className="w-full max-w-lg bg-slate-900 rounded-xl border border-slate-800 p-6">

//                             <h2 className="text-xl font-bold mb-6 text-white">

//                                 {editingDashboard ? "تعديل لوحة" : "لوحة جديدة"}

//                             </h2>

//                             <div className="space-y-4">

//                                 <input
//                                     value={form.name}
//                                     onChange={(e) =>
//                                         setForm({
//                                             ...form,
//                                             name: e.target.value,
//                                         })
//                                     }
//                                     placeholder="اسم اللوحة"
//                                     className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
//                                 />

//                                 <textarea
//                                     rows={4}
//                                     value={form.description}
//                                     onChange={(e) =>
//                                         setForm({
//                                             ...form,
//                                             description: e.target.value,
//                                         })
//                                     }
//                                     placeholder="الوصف"
//                                     className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
//                                 />

//                                 <input
//                                     value={form.icon}
//                                     onChange={(e) =>
//                                         setForm({
//                                             ...form,
//                                             icon: e.target.value,
//                                         })
//                                     }
//                                     placeholder="📊"
//                                     className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
//                                 />

//                                 <input
//                                     type="color"
//                                     value={form.color}
//                                     onChange={(e) =>
//                                         setForm({
//                                             ...form,
//                                             color: e.target.value,
//                                         })
//                                     }
//                                     className="h-12 w-full"
//                                 />

//                             </div>

//                             <div className="flex justify-end gap-3 mt-6">

//                                 <button
//                                     onClick={() => setIsModalOpen(false)}
//                                     className="border border-slate-700 rounded-lg px-4 py-2"
//                                 >
//                                     إلغاء
//                                 </button>

//                                 <button
//                                     disabled={!canWrite}
//                                     onClick={() => canWrite && saveDashboard()}
//                                     className="bg-blue-600 rounded-lg px-4 py-2 text-white"
//                                 >
//                                     حفظ
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

import { useEffect, useState } from "react";
import dashboardService from "./services/dashboardService";
import { FolderOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardBuilderPage() {

    const router = useRouter();

    const { user } = useAuth();

    const pagePermission =
        user?.role?.toLowerCase() === "admin" || user?.is_superuser
            ? "write"
            : (user?.system_pages?.["dashboard-builder"] || "no_access");

    const canRead =
        pagePermission === "read" ||
        pagePermission === "write";

    const canWrite =
        pagePermission === "write";

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

    useEffect(() => {
        if (!user) return;

        if (!canRead) {
            router.replace("/dashboard");
        }
    }, [user, canRead, router]);

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
        if (!canWrite) return;

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
        if (!canWrite) return;

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
        if (!canWrite) return;

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
        if (!canWrite) return;

        if (!confirm("حذف اللوحة؟")) return;

        await dashboardService.deleteDashboard(dashboard.id);

        loadDashboards();

    };

    const openDashboard = (dashboard) => {

        router.push(
            `/dashboard/dashboard-builder/${dashboard.id}`
        );

    };

    const DashboardCard = ({ dashboard }) => {

        return (

            <div
                className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                dark:border-slate-800
                bg-white
                dark:bg-slate-900
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border-blue-300
                dark:hover:border-blue-700
            "
            >

                {/* Header */}

                <div className="relative p-6">

                    <div
                        className="
                        absolute
                        right-0
                        top-0
                        h-24
                        w-24
                        rounded-full
                        opacity-10
                        blur-2xl
                    "
                        style={{
                            background: dashboard.color || "#3B82F6",
                        }}
                    />

                    <div className="flex items-start justify-between">

                        <div className="flex items-center gap-4">

                            <div
                                className="
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                text-2xl
                                shadow-lg
                            "
                                style={{
                                    background: dashboard.color || "#3B82F6",
                                }}
                            >

                                {dashboard.icon || "📊"}

                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">

                                    {dashboard.name}

                                </h2>

                                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">

                                    {dashboard.description || "لا يوجد وصف لهذه اللوحة."}

                                </p>

                            </div>

                        </div>

                        <span
                            className="
                            rounded-full
                            bg-emerald-100
                            dark:bg-emerald-900/30
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-emerald-700
                            dark:text-emerald-300
                        "
                        >

                            Active

                        </span>

                    </div>

                </div>

                {/* Statistics */}

                <div
                    className="
                    grid
                    grid-cols-3
                    border-y
                    border-slate-200
                    dark:border-slate-800
                "
                >

                    <div className="p-4 text-center">

                        <div className="text-xs uppercase text-slate-500">

                            Widgets

                        </div>

                        <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">

                            —

                        </div>

                    </div>

                    <div className="border-x border-slate-200 dark:border-slate-800 p-4 text-center">

                        <div className="text-xs uppercase text-slate-500">

                            Charts

                        </div>

                        <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">

                            —

                        </div>

                    </div>

                    <div className="p-4 text-center">

                        <div className="text-xs uppercase text-slate-500">

                            Updated

                        </div>

                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">

                            الآن

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex items-center justify-between p-5">

                    <Link
                        href={`/dashboard/dashboard-builder/${dashboard.id}`}
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
                        transition
                        hover:bg-blue-700
                    "
                    >

                        <FolderOpen size={17} />

                        فتح اللوحة

                    </Link>

                    <div className="flex items-center gap-2">

                        <button
                            disabled={!canWrite}
                            onClick={() => canWrite && openEditModal(dashboard)}
                            className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-300
                            dark:border-slate-700
                            bg-white
                            dark:bg-slate-900
                            text-slate-600
                            dark:text-slate-300
                            transition
                            hover:border-amber-400
                            hover:bg-amber-50
                            dark:hover:bg-amber-900/20
                        "
                        >

                            <Pencil size={16} />

                        </button>

                        <button
                            disabled={!canWrite}
                            onClick={() => canWrite && deleteDashboard(dashboard)}
                            className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-red-200
                            dark:border-red-900
                            bg-red-50
                            dark:bg-red-900/20
                            text-red-600
                            transition
                            hover:bg-red-100
                            dark:hover:bg-red-900/30
                        "
                        >

                            <Trash2 size={16} />

                        </button>

                    </div>

                </div>

            </div>

        );

    };

    if (!canRead) {
        return (
            <div className="flex items-center justify-center h-screen">
                ليس لديك صلاحية للوصول إلى Dashboard Builder
            </div>
        );
    }

    return (
        <div className="mr-0 lg:mr-64 p-6">

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
                        from-violet-500
                        to-indigo-600
                        text-white
                        shadow-lg
                    "
                            >

                                📊

                            </div>

                            <div>

                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">

                                    Dashboard Builder

                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                                    إنشاء وإدارة لوحات المعلومات التفاعلية ومتابعة مؤشرات الأداء.

                                </p>

                            </div>

                        </div>

                        {canWrite && (

                            <button
                                disabled={!canWrite}
                                onClick={() => canWrite && openCreateModal()}
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
                        disabled:opacity-50
                    "
                            >

                                + لوحة جديدة

                            </button>

                        )}

                    </div>

                    {/* Statistics */}

                    <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-200 dark:border-slate-800">

                        <div className="p-5">

                            <div className="text-xs uppercase tracking-wide text-slate-500">

                                Dashboards

                            </div>

                            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">

                                {dashboards.length}

                            </div>

                        </div>

                        <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                            <div className="text-xs uppercase tracking-wide text-slate-500">

                                Widgets

                            </div>

                            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">

                                —

                            </div>

                        </div>

                        <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                            <div className="text-xs uppercase tracking-wide text-slate-500">

                                Last Update

                            </div>

                            <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">

                                الآن

                            </div>

                        </div>

                        <div className="p-5 border-l border-slate-200 dark:border-slate-800">

                            <div className="text-xs uppercase tracking-wide text-slate-500">

                                Status

                            </div>

                            <div className="mt-2 text-lg font-semibold text-emerald-600">

                                جاهز

                            </div>

                        </div>

                    </div>

                </div>
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

            {isModalOpen && (
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
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-violet-500
              to-indigo-600
              text-2xl
              text-white
              shadow-lg
            "
                                >
                                    📊
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {editingDashboard ? "تعديل لوحة" : "لوحة جديدة"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        أدخل معلومات لوحة التحكم ليتم حفظها داخل النظام.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="
            rounded-xl
            p-2
            text-slate-500
            transition
            hover:bg-slate-100
            dark:hover:bg-slate-800
          "
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-6 p-8">
                            {/* Dashboard Name */}
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
                                    اسم اللوحة
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="مثال: لوحة المبيعات"
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
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
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
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="اكتب وصفاً مختصراً للوحة..."
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
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Icon */}
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
                                        أيقونة اللوحة
                                    </label>
                                    <input
                                        value={form.icon}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                icon: e.target.value,
                                            })
                                        }
                                        placeholder="📊"
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
                text-center
                text-2xl
                outline-none
                transition
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              "
                                    />
                                </div>

                                {/* Color */}
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
                                        لون اللوحة
                                    </label>
                                    <div
                                        className="
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-950
                px-4
                py-3
              "
                                    >
                                        <input
                                            type="color"
                                            value={form.color}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    color: e.target.value,
                                                })
                                            }
                                            className="h-12 w-20 cursor-pointer rounded-xl border-0 bg-transparent"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {form.color}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                اللون الرئيسي للوحة
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div
                                className="
            rounded-2xl
            border
            border-blue-200
            dark:border-blue-800
            bg-blue-50
            dark:bg-blue-900/10
            p-5
          "
                            >
                                <div className="text-xs uppercase tracking-wide text-slate-500">
                                    Preview
                                </div>
                                <div className="mt-4 flex items-center gap-4">
                                    <div
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
                                        style={{
                                            background: form.color || "#3B82F6",
                                        }}
                                    >
                                        {form.icon || "📊"}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {form.name || "اسم اللوحة"}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {form.description || "سيظهر وصف اللوحة هنا"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div
                                className="
            flex items-center justify-end gap-3
            border-t border-slate-200 dark:border-slate-700
            bg-slate-50 dark:bg-slate-900/40
            px-8 py-5
            mt-8
          "
                            >
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="
              inline-flex items-center justify-center
              rounded-xl
              border border-slate-300 dark:border-slate-700
              bg-white dark:bg-slate-900
              px-5 py-2.5
              text-sm font-medium
              text-slate-700 dark:text-slate-300
              transition-all duration-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
              hover:border-slate-400
              dark:hover:border-slate-600
            "
                                >
                                    إلغاء
                                </button>

                                <button
                                    disabled={!canWrite}
                                    onClick={() => canWrite && saveDashboard()}
                                    className="
              inline-flex items-center justify-center
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-600
              px-6 py-2.5
              text-sm font-semibold
              text-white
              shadow-lg shadow-cyan-600/20
              transition-all duration-200
              hover:scale-[1.02]
              hover:shadow-cyan-500/40
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:hover:scale-100
            "
                                >
                                    حفظ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

}