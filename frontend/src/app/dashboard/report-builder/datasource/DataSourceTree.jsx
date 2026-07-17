"use client";

import useDataSources from "../hooks/useDataSources";

import useReportStore from "../store/reportStore";

import SectionNode from "./SectionNode";

export default function DataSourceTree() {

    useDataSources();

    const sections =
        useReportStore(state => state.dataSources);

    return (

        <div className="p-3 space-y-2">

            {

                sections.map(section => (

                    <SectionNode

                        key={section.id}

                        section={section}


                    />

                ))

            }

        </div>

    );

}