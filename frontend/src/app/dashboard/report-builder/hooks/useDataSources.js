import { useEffect } from "react";

import reportBuilderService from "../services/reportBuilderService";

import useReportStore from "../store/reportStore";

export default function useDataSources() {

    const setDataSources =
        useReportStore(state => state.setDataSources);

    const setLoading =
        useReportStore(state => state.setLoading);

    useEffect(() => {

        load();

    }, []);

    async function load() {

        try {

            setLoading(true);

            const data =
                await reportBuilderService.getDataSources();

            setDataSources(data);

        }

        finally {

            setLoading(false);

        }

    }

}