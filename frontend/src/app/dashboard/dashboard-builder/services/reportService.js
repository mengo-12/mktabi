import apiClient from "@/services/apiClient";

const reportService = {

    async getReports() {

        const { data } =
            await apiClient.get("/report-builder");

        return data;

    },

    async getReport(id) {

        const { data } =
            await apiClient.get(`/report-builder/${id}`);

        return data;

    },

};

export default reportService;