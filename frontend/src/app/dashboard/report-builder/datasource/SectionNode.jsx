"use client";

import { useState } from "react";

import TableNode from "./TableNode";

export default function SectionNode({

    section

}) {

    const [open, setOpen] = useState(true);

    return (

        <div>

            <button

                onClick={() => setOpen(!open)}

                className="w-full text-left font-semibold"

            >

                📁 {section.title}

            </button>

            {

                open && (

                    <div className="ml-4 mt-2 space-y-2">

                        {

                            section.tables.map(table => (

                                <TableNode

                                    key={`${section.id}-${table.id}`}

                                    table={table}

                                />

                            ))

                        }

                    </div>

                )

            }

        </div>

    );

}