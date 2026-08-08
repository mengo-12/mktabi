import apiClient from "@/services/apiClient";

const officeProfileService = {
    // جلب بيانات المكتب
    async getProfile() {
        const response = await apiClient.get("/office-profile/");
        return response.data;
    },

    // تحديث بيانات المكتب
    async updateProfile(data) {
        const response = await apiClient.put(
            "/office-profile/",
            data
        );

        return response.data;
    },

    // رفع شعار المكتب
    async uploadLogo(file) {
        const formData = new FormData();

        formData.append("file", file);

        const response = await apiClient.post(
            "/office-profile/logo",
            formData
        );

        return response.data;
    },

    // حذف شعار المكتب
    async deleteLogo() {
        const response = await apiClient.delete(
            "/office-profile/logo"
        );

        return response.data;
    },
};

export default officeProfileService;