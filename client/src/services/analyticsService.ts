import api from "./api";
import type { ApiResponse, Analytics } from "../types";

export const analyticsService = {
    async getAdminDashboard(): Promise<Analytics> {
        const response = await api.get<ApiResponse<Analytics>>("/analytics/admin");
        return response.data.data;
    },

    async getDoctorDashboard(): Promise<Analytics> {
        const response = await api.get<ApiResponse<Analytics>>("/analytics/doctor");
        return response.data.data;
    },
};
