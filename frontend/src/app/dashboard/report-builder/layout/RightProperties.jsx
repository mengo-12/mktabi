// "use client";

// import PropertiesPanel from "../properties/PropertiesPanel";

// export default function RightProperties() {

//     return (

//         <aside className="w-96 shrink-0 border-l border-zinc-800 bg-zinc-900 overflow-auto">

//             <PropertiesPanel />

//         </aside>

//     );

// }


"use client";

import PropertiesPanel from "../properties/PropertiesPanel";

export default function RightProperties() {

    return (

        <aside
            className="
                w-96
                shrink-0
                border-l
                border-slate-200
                dark:border-slate-800
                bg-white
                dark:bg-slate-900
                overflow-auto
            "
        >

            <PropertiesPanel />

        </aside>

    );

}