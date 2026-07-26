'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PageGuard({ pageId, children }) {

    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {

        if (loading) return;

        if (
            user?.role === "admin" ||
            user?.role === "partner" ||
            user?.is_superuser
        ) {
            return;
        }

        let permissions = user?.system_pages || {};

        if (typeof permissions === "string") {
            try {
                permissions = JSON.parse(permissions);
            } catch {
                permissions = {};
            }
        }

        const permission = permissions[pageId] || "no_access";

        if (permission === "no_access") {
            router.replace("/dashboard");
        }

    }, [loading, user, pageId, router]);

    if (loading) {
        return null;
    }

    return children;
}