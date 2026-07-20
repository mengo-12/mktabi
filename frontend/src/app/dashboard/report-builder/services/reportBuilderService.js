import apiClient from "@/services/apiClient";

const reportBuilderService = {
    async getDataSources() {
        const { data } = await apiClient.get("/report-builder/datasources");
        return data;
    },

    async runQuery(payload) {
        const { data } = await apiClient.post(
            "/report-builder/run",
            payload
        );

        return data;
    },

    async createReport(payload) {

        const { data } = await apiClient.post(
            "/report-builder/",
            payload
        );

        return data;

    }
};

export default reportBuilderService;