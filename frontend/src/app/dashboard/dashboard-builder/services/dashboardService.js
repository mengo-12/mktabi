import apiClient from "@/services/apiClient";

const dashboardService = {
    async getDashboards() {
        const { data } = await apiClient.get("/dashboards");
        return data;
    },

    async getDashboard(id) {
        const { data } = await apiClient.get(`/dashboards/${id}`);
        return data;
    },

    async createDashboard(payload) {
        const { data } = await apiClient.post("/dashboards", payload);
        return data;
    },

    async updateDashboard(id, payload) {
        const { data } = await apiClient.put(`/dashboards/${id}`, payload);
        return data;
    },

    async deleteDashboard(id) {
        const { data } = await apiClient.delete(`/dashboards/${id}`);
        return data;
    },
};

export default dashboardService;