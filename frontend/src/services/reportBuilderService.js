import apiClient from "@/services/apiClient";

const reportBuilderService = {

    async getDataSources() {

        const response = await apiClient.get(
            "/report-builder/datasources"
        );

        return response.data;

    }

};

export default reportBuilderService;