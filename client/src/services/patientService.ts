import api from "./api";
import type { ApiResponse, Patient, PagedResponse } from "../types";

export interface DoctorPatient {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
    gender: string;
    bloodGroup: string;
    allergies: string;
    medicalConditions: string;
    dateOfBirth: string;
    totalVisits: number;
    lastVisitDate: string;
    status: "ACTIVE" | "PAST";
    visits?: VisitSummary[];
}

export interface VisitSummary {
    appointmentId: string;
    appointmentDate: string;
    slotTime: string;
    consultationType: string;
    status: string;
    reason: string;
    diagnosis: string;
    prescriptions: PrescriptionSummary[];
}

export interface PrescriptionSummary {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
}

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

    async getDoctorPatients(): Promise<DoctorPatient[]> {
        const response = await api.get<ApiResponse<DoctorPatient[]>>(
            "/appointments/my-patients"
        );
        return response.data.data;
    },

    async getDoctorPatientDetail(patientId: string): Promise<DoctorPatient> {
        const response = await api.get<ApiResponse<DoctorPatient>>(
            `/appointments/my-patients/${patientId}`
        );
        return response.data.data;
    },
};
