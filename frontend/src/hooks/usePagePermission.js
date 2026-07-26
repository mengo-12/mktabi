import { useAuth } from "@/context/AuthContext";

export default function usePagePermission(pageId) {
    const { user } = useAuth();

    const isAdmin =
        user?.role === "admin" || user?.is_superuser;

    if (isAdmin) {
        return {
            permission: "write",
            canRead: true,
            canWrite: true,
        };
    }

    const permission =
        user?.system_pages?.[pageId] || "no_access";

    return {
        permission,
        canRead:
            permission === "read" ||
            permission === "write",
        canWrite:
            permission === "write",
    };
}