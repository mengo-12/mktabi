import apiClient from "@/services/apiClient";

const backupService = {

    async getBackups() {
        const response = await apiClient.get("/backups");
        return response.data;
    },

    async createBackup() {
        const response = await apiClient.post("/backups/create");
        return response.data;
    },

    downloadBackup(filename) {
        window.open(
            `${process.env.NEXT_PUBLIC_API_URL}/backups/download/${filename}`,
            "_blank"
        );
    },

    async deleteBackup(filename) {

        const response = await apiClient.delete(
            `/backups/${filename}`
        );

        return response.data;

    },

    async restoreBackup(filename) {

        const response = await apiClient.post(
            `/backups/restore/${filename}`
        );

        return response.data;

    },

};

export default backupService;