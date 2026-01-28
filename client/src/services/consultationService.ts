import api from "./api";
import type { ApiResponse, Consultation } from "../types";

export interface ConsultationRequest {
    appointmentId: number;
    symptoms: string;
    diagnosis: string;
    notes?: string;
    vitals?: string;
    followUpDate?: string;
    prescriptions?: PrescriptionRequest[];
}

export interface PrescriptionRequest {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export const consultationService = {
    async createConsultation(data: ConsultationRequest): Promise<Consultation> {
        const response = await api.post<ApiResponse<Consultation>>("/consultations", data);
        return response.data.data;
    },

    async getConsultationById(id: number): Promise<Consultation> {
        const response = await api.get<ApiResponse<Consultation>>(`/consultations/${id}`);
        return response.data.data;
    },

    async getConsultationByAppointmentId(appointmentId: number): Promise<Consultation> {
        const response = await api.get<ApiResponse<Consultation>>(
            `/consultations/appointment/${appointmentId}`
        );
        return response.data.data;
    },

    async updateConsultation(
        id: number,
        data: ConsultationRequest
    ): Promise<Consultation> {
        const response = await api.put<ApiResponse<Consultation>>(
            `/consultations/${id}`,
            data
        );
        return response.data.data;
    },
};
