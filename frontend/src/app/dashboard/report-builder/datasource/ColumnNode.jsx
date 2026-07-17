"use client";

import useReportStore from "../store/reportStore";

export default function ColumnNode({

    column

}) {

    const selectColumn =
        useReportStore(state => state.selectColumn);

    return (

        <button

            onClick={() =>

                selectColumn(column)

            }

            className="block text-left text-sm py-1"

        >

            • {column.name}

        </button>

    );

}