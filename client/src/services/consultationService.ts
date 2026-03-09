import api from "./api";
import type { ApiResponse, Consultation } from "../types";

export interface ConsultationRequest {
    appointmentId: string;
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

    async getConsultationById(id: string): Promise<Consultation> {
        const response = await api.get<ApiResponse<Consultation>>(`/consultations/${id}`);
        return response.data.data;
    },

    async getConsultationByAppointmentId(appointmentId: string): Promise<Consultation | null> {
        const response = await api.get<ApiResponse<Consultation>>(
            `/consultations/appointment/${appointmentId}`
        );
        return response.data.data ?? null;
    },

    async updateConsultation(
        id: string,
        data: ConsultationRequest
    ): Promise<Consultation> {
        const response = await api.put<ApiResponse<Consultation>>(
            `/consultations/${id}`,
            data
        );
        return response.data.data;
    },
};
