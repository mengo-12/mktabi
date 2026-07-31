// "use client";

// import DataSourceTree from "../datasource/DataSourceTree";
// import useDataSources from "../hooks/useDataSources";

// export default function LeftSidebar() {

//     useDataSources();


//     return (

//         <aside className="w-80 shrink-0 border-r border-zinc-800 bg-zinc-900 overflow-auto">

//             <div className="p-4 border-b border-zinc-800">

//                 <h2 className="font-semibold">

//                     Data Sources

//                 </h2>

//             </div>

//             <DataSourceTree />

//         </aside>

//     );

// }


"use client";

import { Database } from "lucide-react";
import DataSourceTree from "../datasource/DataSourceTree";
import useDataSources from "../hooks/useDataSources";

export default function LeftSidebar() {

    useDataSources();

    return (

        <aside
            className="
                w-80
                shrink-0
                border-r
                border-slate-200
                dark:border-slate-800
                bg-white
                dark:bg-slate-900
                overflow-auto
            "
        >

            <div
                className="
                    sticky
                    top-0
                    z-20
                    border-b
                    border-slate-200
                    dark:border-slate-800
                    bg-white/90
                    dark:bg-slate-900/90
                    backdrop-blur
                    p-5
                "
            >

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-cyan-100 dark:bg-cyan-900/30 p-3">

                        <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />

                    </div>

                    <div>

                        <h2 className="font-bold text-slate-900 dark:text-white">

                            Data Sources

                        </h2>

                        <p className="text-xs text-slate-500">

                            اختر جدولاً لبدء إنشاء التقرير.

                        </p>

                    </div>

                </div>

            </div>

            <DataSourceTree />

        </aside>

    );

}