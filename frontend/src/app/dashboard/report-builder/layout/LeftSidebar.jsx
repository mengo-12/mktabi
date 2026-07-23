"use client";

import DataSourceTree from "../datasource/DataSourceTree";
import useDataSources from "../hooks/useDataSources";

export default function LeftSidebar() {

    useDataSources();


    return (

        <aside className="w-80 shrink-0 border-r border-zinc-800 bg-zinc-900 overflow-auto">

            <div className="p-4 border-b border-zinc-800">

                <h2 className="font-semibold">

                    Data Sources

                </h2>

            </div>

            <DataSourceTree />

        </aside>

    );

}