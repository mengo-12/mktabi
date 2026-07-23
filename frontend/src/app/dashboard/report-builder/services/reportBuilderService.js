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

    },

    async getReports() {
        const { data } = await apiClient.get("/report-builder");
        return data;
    },

    async getReport(id) {
        const { data } = await apiClient.get(`/report-builder/${id}`);
        return data;
    },

    async updateReport(id, payload) {
        const { data } = await apiClient.put(
            `/report-builder/${id}`,
            payload
        );
        return data;
    },

    async deleteReport(id) {
        const { data } = await apiClient.delete(
            `/report-builder/${id}`
        );
        return data;
    },
};

export default reportBuilderService;