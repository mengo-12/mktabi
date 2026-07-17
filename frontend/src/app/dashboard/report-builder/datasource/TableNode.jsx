"use client";

import { useState } from "react";

import ColumnNode from "./ColumnNode";

import useReportStore from "../store/reportStore";

export default function TableNode({

    table

}) {

    const [open, setOpen] = useState(false);

    const selectTable =
        useReportStore(state => state.selectTable);

    const columns =
        table.columns ||
        table.columns_definition ||
        [];

    return (

        <div>

            <button

                onClick={() => {

                    selectTable(table);

                    setOpen(!open);

                }}

                className="w-full text-left"

            >

                📄 {table.name}

            </button>

            {

                open && (

                    <div className="ml-5 mt-1">

                        {columns.map((column, index) => (
                            <ColumnNode
                                key={`${table.id}-${column.id || index}`}
                                column={column}
                            />
                        ))}

                    </div>

                )

            }

        </div>

    );

}