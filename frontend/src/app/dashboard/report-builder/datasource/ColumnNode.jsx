// "use client";

// import useReportStore from "../store/reportStore";

// export default function ColumnNode({

//     column

// }) {

//     const selectColumn =
//         useReportStore(state => state.selectColumn);

//     return (

//         <button

//             onClick={() =>

//                 selectColumn(column)

//             }

//             className="block text-left text-sm py-1"

//         >

//             • {column.name}

//         </button>

//     );

// }


"use client";

import { Columns3 } from "lucide-react";
import useReportStore from "../store/reportStore";

export default function ColumnNode({ column }) {

    const selectColumn =
        useReportStore(state => state.selectColumn);

    return (

        <button
            onClick={() => selectColumn(column)}
            className="
                group
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2
                text-left
                transition
                hover:bg-slate-100
                dark:hover:bg-slate-800
            "
        >

            <div
                className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-cyan-100
                    dark:bg-cyan-900/30
                "
            >

                <Columns3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />

            </div>

            <div className="flex-1 min-w-0">

                <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">

                    {column.label || column.name}

                </div>

                <div className="truncate text-xs text-slate-500">

                    {column.type}

                </div>

            </div>

        </button>

    );

}