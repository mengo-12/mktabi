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

    // --- خدمات الجداول والأعمدة ---
    async getTablesBySection(sectionId) {
        const response = await apiClient.get(`/dynamic/sections/${sectionId}/tables`);
        return response.data;
    },

    async createTable(sectionId, name, columnsDefinition, viewMode = 'table') {
        const response = await apiClient.post('/dynamic/tables', {
            section_id: sectionId,
            name,
            columns_definition: columnsDefinition,
            view_mode: viewMode
        });
        return response.data;
    },

    async updateTable(tableId, name, columnsDefinition, viewMode = 'table') {
        const response = await apiClient.put(`/dynamic/tables/${tableId}`, {
            name: name,
            columns_definition: columnsDefinition,
            view_mode: viewMode
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

    async addRow(tableId, cellsData) {
        const response = await apiClient.post('/dynamic/rows', {
            table_id: tableId,
            cells_data: cellsData
        });
        return response.data;
    },

    async updateRow(rowId, cellsData) {
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
    }
};