import apiClient from "@/services/apiClient";

const dashboardWidgetService = {

    async getWidgets(dashboardId) {

        const { data } =
            await apiClient.get(
                `/dashboard-widgets/dashboard/${dashboardId}`
            );

        return data;

    },

    async createWidget(payload) {

        const { data } =
            await apiClient.post(
                "/dashboard-widgets",
                payload
            );

        return data;

    },

    async updateWidget(id, payload) {

        const { data } =
            await apiClient.put(
                `/dashboard-widgets/${id}`,
                payload
            );

        return data;

    },

    async deleteWidget(id) {

        const { data } =
            await apiClient.delete(
                `/dashboard-widgets/${id}`
            );

        return data;

    },

    async duplicateWidget(id) {

        const { data } = await apiClient.post(
            `/dashboard-widgets/${id}/duplicate`
        );

        return data;

    },

};

export default dashboardWidgetService;