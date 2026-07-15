import apiClient from '@/services/apiClient';

export const dynamicService = {
    // --- خدمات الأقسام (Sidebar) ---
    async getSections() {
        const response = await apiClient.get('/dynamic/sections');
        return response.data;
    },

    async createSection(title, icon = 'Folder', order = 0) {
        const response = await apiClient.post('/dynamic/sections', { title, icon, order });
        return response.data;
    },

    // 🎯 الإضافة الجديدة لتعديل القسم
    async updateSection(sectionId, title, icon = 'Folder', order = 0) {
        const response = await apiClient.put(`/dynamic/sections/${sectionId}`, { title, icon, order });
        return response.data;
    },

    // 🎯 الإضافة الجديدة لحذف القسم
    async deleteSection(sectionId) {
        const response = await apiClient.delete(`/dynamic/sections/${sectionId}`);
        return response.data;
    },

    // --- خدمات الجداول والأعمدة ---
    async getTablesBySection(sectionId) {

        const response =
            await apiClient.get(
                `/dynamic/sections/${sectionId}/tables`
            );


        return response.data.map(table => {

            return {
                ...table,
                user_permission:
                    table.user_permission || "no_access"
            };

        });

    },

    async getAllTables() {
        const response = await apiClient.get('/dynamic/tables/all');
        return response.data;
    },

    async createTable(sectionId, name, columnsDefinition, viewMode = "table", options = {}) {

        const response = await apiClient.post("/dynamic/tables", {
            section_id: sectionId,
            name,
            columns_definition: columnsDefinition,
            view_mode: viewMode,
            is_staff_table: options.is_staff_table ?? false,
            calendar_mapping: options.calendar_mapping ?? null
        });

        return response.data;
    },

    async updateTable(
        tableId,
        name,
        columnsDefinition,
        viewMode = "table",
        options = {}
    ) {
        const response = await apiClient.put(`/dynamic/tables/${tableId}`, {
            name,
            columns_definition: columnsDefinition,
            default_view: viewMode,
            is_staff_table: options.is_staff_table ?? false,
            calendar_mapping: options.calendar_mapping ?? null
        });

        return response.data;
    },

    async deleteTable(tableId) {
        const response = await apiClient.delete(`/dynamic/tables/${tableId}`);
        return response.data;
    },

    // --- خدمات الأسطر والبيانات (الصفوف) ---
    async getRowsByTable(tableId) {
        const response = await apiClient.get(`/dynamic/tables/${tableId}/rows`);
        return response.data;
    },

    // 🌟 تم تصحيح هذا المسار ليتوافق مع استقبال FastAPI لـ table_id في الـ URL Path
    async addRow(tableId, cellsData) {
        const response = await apiClient.post(`/dynamic/tables/${tableId}/rows`, {
            cells_data: cellsData
        });
        return response.data;
    },

    async updateRow(rowId, cellsData) {
        // 🌟 إزالة /tables/${tableId} لأن الباك إند يتوقع الـ rowId مباشرة في هذا المسار
        const response = await apiClient.put(`/dynamic/rows/${rowId}`, {
            cells_data: cellsData
        });
        return response.data;
    },

    async deleteRow(rowId) {
        const response = await apiClient.delete(`/dynamic/rows/${rowId}`);
        return response.data;
    },

    // 🎯 دالة رفع المرفقات الجديدة المحدثة والمتوافقة مع الراوتر المحمي
    async uploadAttachment(file) {
        const formData = new FormData();
        formData.append('file', file); // السيرفر يتوقع مفتاح 'file'

        // تم تعديل المسار هنا إلى /documents/upload-general بناءً على الـ API Doc الخاص بك
        const response = await apiClient.post('/documents/upload-general', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // يعيد الكائن المحتوي على { url, name, id }
        return response.data;
    },

    async getCalendarEvents() {
        const response = await apiClient.get("/dynamic/calendar/events");
        return response.data;
    },
};