// "use client";

// import { useState } from "react";

// import TableNode from "./TableNode";

// export default function SectionNode({

//     section

// }) {

//     const [open, setOpen] = useState(true);

//     return (

//         <div>

//             <button

//                 onClick={() => setOpen(!open)}

//                 className="w-full text-left font-semibold"

//             >

//                 📁 {section.title}

//             </button>

//             {

//                 open && (

//                     <div className="ml-4 mt-2 space-y-2">

//                         {

//                             section.tables.map(table => (

//                                 <TableNode

//                                     key={`${section.id}-${table.id}`}

//                                     table={table}

//                                 />

//                             ))

//                         }

//                     </div>

//                 )

//             }

//         </div>

//     );

// }



"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    FolderOpen,
    Folder
} from "lucide-react";

import TableNode from "./TableNode";

export default function SectionNode({ section }) {

    const [open,setOpen] = useState(true);

    return (

        <div
            className="
                rounded-2xl
                border
                border-slate-200
                dark:border-slate-800
                bg-white
                dark:bg-slate-900
                shadow-sm
            "
        >

            <button

                onClick={()=>setOpen(!open)}

                className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    transition
                    hover:bg-slate-50
                    dark:hover:bg-slate-800
                "
            >

                {open
                    ? <ChevronDown className="w-4 h-4 text-slate-500"/>
                    : <ChevronRight className="w-4 h-4 text-slate-500"/>
                }

                {open
                    ? <FolderOpen className="w-5 h-5 text-amber-500"/>
                    : <Folder className="w-5 h-5 text-amber-500"/>
                }

                <div className="flex-1 text-left">

                    <div className="font-semibold text-slate-900 dark:text-white">

                        {section.title}

                    </div>

                    <div className="text-xs text-slate-500">

                        {section.tables.length} Tables

                    </div>

                </div>

            </button>

            {open && (

                <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2">

                    {section.tables.map(table=>(

                        <TableNode
                            key={`${section.id}-${table.id}`}
                            table={table}
                        />

                    ))}

                </div>

            )}

        </div>

    );

}