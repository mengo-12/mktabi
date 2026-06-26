import apiClient from '@/services/apiClient';

export const hearingService = {
    // جلب الأجندة اليومية والجدولة الذكية للمكتب
    async getDailySchedule() {
        const response = await apiClient.get('/hearings/daily-schedule');
        return response.data;
    },

    // جلب جلسات قضية معينة إذا رغب المحامي في تصفيتها
    async getCaseHearings(caseId) {
        const response = await apiClient.get(`/hearings/case/${caseId}`);
        return response.data;
    }
};