import api from "./api";
import type { ApiResponse, Patient, PagedResponse } from "../types";

export interface PatientProfileRequest {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    bloodGroup: string;
    address: string;
    emergencyContact: string;
    allergies?: string;
    medicalConditions?: string;
}

export const patientService = {
    async getAllPatients(
        page = 0,
        size = 10,
        sortBy = "createdAt",
        sortDir = "desc"
    ): Promise<PagedResponse<Patient>> {
        const response = await api.get<ApiResponse<PagedResponse<Patient>>>(
            `/patients?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
        );
        return response.data.data;
    },

    async searchPatients(
        query: string,
        page = 0,
        size = 10
    ): Promise<PagedResponse<Patient>> {
        const response = await api.get<ApiResponse<PagedResponse<Patient>>>(
            `/patients/search?query=${query}&page=${page}&size=${size}`
        );
        return response.data.data;
    },

    async getOwnProfile(): Promise<Patient> {
        const response = await api.get<ApiResponse<Patient>>("/patients/profile");
        return response.data.data;
    },

    async updateProfile(data: PatientProfileRequest): Promise<Patient> {
        const response = await api.put<ApiResponse<Patient>>("/patients/profile", data);
        return response.data.data;
    },

    async getPatientById(id: string): Promise<Patient> {
        const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
        return response.data.data;
    },
};
