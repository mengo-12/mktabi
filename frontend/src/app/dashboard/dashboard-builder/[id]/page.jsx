"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Plus,
    ArrowRight,
} from "lucide-react";

import Link from "next/link";
import dashboardService from "../services/dashboardService";

export default function DashboardCanvasPage() {

    const { id } = useParams();

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, [id]);

    const loadDashboard = async () => {

        try {

            const data =
                await dashboardService.getDashboard(id);

            setDashboard(data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

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

    return (

        <div className="mr-64 p-6 space-y-6">

            <div className="flex items-center justify-between">

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
                            style={{
                                background: dashboard.color,
                            }}
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
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                    <Plus size={18} />

                    Add Widget

                </button>

            </div>

            <div
                className="
                    rounded-xl
                    border-2
                    border-dashed
                    border-slate-700
                    h-[700px]
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

        </div>

    );

}