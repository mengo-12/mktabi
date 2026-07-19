import apiClient from "@/services/apiClient";

const reportService = {

    async getReports() {

        const { data } =
            await apiClient.get("/report-builder");

        return data;

    },

};

export default reportService;