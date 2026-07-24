"use client";

import { createContext, useContext } from "react";

const DashboardFilterContext = createContext(null);

export function DashboardFilterProvider({
    value,
    children,
}) {
    return (
        <DashboardFilterContext.Provider value={value}>
            {children}
        </DashboardFilterContext.Provider>
    );
}

export function useDashboardFilters() {
    return useContext(DashboardFilterContext);
}