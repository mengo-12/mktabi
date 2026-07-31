// "use client";

// import { useState } from "react";

// import ColumnNode from "./ColumnNode";

// import useReportStore from "../store/reportStore";

// export default function TableNode({

//     table

// }) {

//     const [open, setOpen] = useState(false);

//     const selectTable =
//         useReportStore(state => state.selectTable);

//     const columns =
//         table.columns ||
//         table.columns_definition ||
//         [];

//     return (

//         <div>

//             <button

//                 onClick={() => {

//                     selectTable(table);

//                     setOpen(!open);

//                 }}

//                 className="w-full text-left"

//             >

//                 📄 {table.name}

//             </button>

//             {

//                 open && (

//                     <div className="ml-5 mt-1">

//                         {columns.map((column, index) => (
//                             <ColumnNode
//                                 key={`${table.id}-${column.id || index}`}
//                                 column={column}
//                             />
//                         ))}

//                     </div>

//                 )

//             }

//         </div>

//     );

// }


"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Table2 } from "lucide-react";
import ColumnNode from "./ColumnNode";
import useReportStore from "../store/reportStore";

export default function TableNode({ table }) {

    const [open, setOpen] = useState(false);

    const selectTable =
        useReportStore(state => state.selectTable);

    const selectedTable =
        useReportStore(state => state.selectedTable);

    const columns =
        table.columns ||
        table.columns_definition ||
        [];

    const active =
        String(selectedTable?.id) === String(table.id);

    return (

        <div className="space-y-1">

            <button

                onClick={() => {

                    selectTable(table);

                    setOpen(!open);

                }}

                className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    transition

                    ${
                        active
                            ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-700"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                `}
            >

                {open ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                )}

                <div
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-100
                        dark:bg-blue-900/30
                    "
                >

                    <Table2 className="w-5 h-5 text-blue-600 dark:text-blue-400"/>

                </div>

                <div className="flex-1 text-left">

                    <div className="font-semibold text-slate-900 dark:text-white">

                        {table.name}

                    </div>

                    <div className="text-xs text-slate-500">

                        {columns.length} Columns

                    </div>

                </div>

            </button>

            {open && (

                <div className="ml-8 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">

                    {columns.map((column,index)=>(

                        <ColumnNode
                            key={`${table.id}-${column.id || index}`}
                            column={column}
                        />

                    ))}

                </div>

            )}

        </div>

    );

}