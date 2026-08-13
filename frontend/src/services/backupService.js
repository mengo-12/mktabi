// import apiClient from "@/services/apiClient";

// const backupService = {

//     async getBackups() {
//         const response = await apiClient.get("/backups");
//         return response.data;
//     },

//     async createBackup() {
//         const response = await apiClient.post("/backups/create");
//         return response.data;
//     },

//     downloadBackup(filename) {
//         window.open(
//             `${process.env.NEXT_PUBLIC_API_URL}/backups/download/${filename}`,
//             "_blank"
//         );
//     },

//     async deleteBackup(filename) {

//         const response = await apiClient.delete(
//             `/backups/${filename}`
//         );

//         return response.data;

//     },

//     async restoreBackup(filename) {

//         const response = await apiClient.post(
//             `/backups/restore/${filename}`
//         );

//         return response.data;

//     },

// };

// export default backupService;



import apiClient from "@/services/apiClient";

const backupService = {

    // =====================================================
    // جلب النسخ الاحتياطية
    // =====================================================
    async getBackups() {

        const response = await apiClient.get("/backups");

        return response.data;
    },


    // =====================================================
    // إنشاء نسخة احتياطية
    // =====================================================
    async createBackup() {

        const response = await apiClient.post(
            "/backups/create"
        );

        return response.data;
    },


    // =====================================================
    // تحميل نسخة احتياطية
    // =====================================================
    async downloadBackup(filename) {

        try {

            const response = await apiClient.get(
                `/backups/download/${encodeURIComponent(filename)}`,
                {
                    responseType: "blob",
                }
            );


            // =================================================
            // تحويل الاستجابة إلى ملف
            // =================================================

            const blob = new Blob(
                [response.data],
                {
                    type:
                        response.headers["content-type"] ||
                        "application/octet-stream",
                }
            );


            // =================================================
            // إنشاء رابط مؤقت للتحميل
            // =================================================

            const url = window.URL.createObjectURL(blob);


            // =================================================
            // إنشاء عنصر تحميل
            // =================================================

            const link = document.createElement("a");

            link.href = url;

            link.download = filename;

            document.body.appendChild(link);

            link.click();


            // =================================================
            // تنظيف الرابط والعنصر
            // =================================================

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(
                "خطأ أثناء تحميل النسخة الاحتياطية:",
                error
            );

            throw error;
        }
    },


    // =====================================================
    // حذف نسخة احتياطية
    // =====================================================
    async deleteBackup(filename) {

        const response = await apiClient.delete(
            `/backups/${encodeURIComponent(filename)}`
        );

        return response.data;
    },


    // =====================================================
    // استعادة نسخة احتياطية
    // =====================================================
    async restoreBackup(filename) {

        const response = await apiClient.post(
            `/backups/restore/${encodeURIComponent(filename)}`
        );

        return response.data;
    },

};

export default backupService;