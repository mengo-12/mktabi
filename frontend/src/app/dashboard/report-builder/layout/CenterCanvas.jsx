// "use client";

// import QueryCanvas from "../canvas/QueryCanvas";

// export default function CenterCanvas() {

//     return (

//         <main className="flex-1 min-w-0 overflow-auto bg-zinc-950">

//             <QueryCanvas />

//         </main>

//     );

// }


"use client";

import QueryCanvas from "../canvas/QueryCanvas";

export default function CenterCanvas() {

    return (

        <main
            className="
                flex-1
                overflow-auto
                bg-slate-100
                dark:bg-slate-950
                p-8
            "
        >

            <QueryCanvas />

        </main>

    );

}