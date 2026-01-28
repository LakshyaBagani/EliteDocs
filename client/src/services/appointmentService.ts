import api from "./api";
import type { Appointment, PagedResponse, ApiResponse } from "../types";

interface BookAppointmentData {
    doctorId: string;
    appointmentDate: string;
    slotTime: string;
    consultationType: "ONLINE" | "CLINIC";
    reason?: string;
    symptoms?: string;
}

export const appointmentService = {
    async bookAppointment(data: BookAppointmentData): Promise<Appointment> {
        const response = await api.post<ApiResponse<Appointment>>(
            "/appointments",
            data
        );
        return response.data.data;
    },

    async getAppointments(
        status?: string,
        page = 0,
        size = 10
    ): Promise<PagedResponse<Appointment>> {
        let url = `/appointments?page=${page}&size=${size}`;
        if (status) url += `&status=${status}`;
        const response = await api.get<ApiResponse<PagedResponse<Appointment>>>(
            url
        );
        return response.data.data;
    },

    async getTodayAppointments(): Promise<Appointment[]> {
        const response = await api.get<ApiResponse<Appointment[]>>(
            "/appointments/today"
        );
        return response.data.data;
    },

    async getAppointmentById(id: string): Promise<Appointment> {
        const response = await api.get<ApiResponse<Appointment>>(
            `/appointments/${id}`
        );
        return response.data.data;
    },

    async updateStatus(
        id: string,
        status: string,
        reason?: string
    ): Promise<Appointment> {
        let url = `/appointments/${id}/status?status=${status}`;
        if (reason) url += `&reason=${encodeURIComponent(reason)}`;
        const response = await api.patch<ApiResponse<Appointment>>(url);
        return response.data.data;
    },

    async confirmPayment(id: string): Promise<Appointment> {
        const response = await api.post<ApiResponse<Appointment>>(
            `/appointments/${id}/pay`
        );
        return response.data.data;
    },

    async cancelAppointment(id: string, reason?: string): Promise<void> {
        let url = `/appointments/${id}`;
        if (reason) url += `?reason=${encodeURIComponent(reason)}`;
        await api.delete(url);
    },
};
