import api from "./api";
import type { Doctor, PagedResponse, ApiResponse, Review } from "../types";

// Interface for profile update request (availabilities don't need id when creating)
export interface DoctorProfileUpdateRequest {
    firstName?: string;
    lastName?: string;
    specialization?: string;
    qualification?: string;
    experienceYears?: number;
    licenseNumber?: string;
    bio?: string;
    clinicName?: string;
    clinicAddress?: string;
    consultationFeeOnline?: number;
    consultationFeeClinic?: number;
    isAvailableOnline?: boolean;
    isAvailableClinic?: boolean;
    availabilities?: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        slotDurationMinutes?: number;
    }[];
}

export const doctorService = {
    async getDoctors(
        page = 0,
        size = 10,
        sortBy = "averageRating",
        sortDir = "desc"
    ): Promise<PagedResponse<Doctor>> {
        const response = await api.get<ApiResponse<PagedResponse<Doctor>>>(
            `/doctors?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
        );
        return response.data.data;
    },

    async searchDoctors(params: {
        specialization?: string;
        minFee?: number;
        maxFee?: number;
        minRating?: number;
        page?: number;
        size?: number;
    }): Promise<PagedResponse<Doctor>> {
        const queryParams = new URLSearchParams();
        if (params.specialization)
            queryParams.append("specialization", params.specialization);
        if (params.minFee) queryParams.append("minFee", params.minFee.toString());
        if (params.maxFee) queryParams.append("maxFee", params.maxFee.toString());
        if (params.minRating)
            queryParams.append("minRating", params.minRating.toString());
        queryParams.append("page", (params.page || 0).toString());
        queryParams.append("size", (params.size || 10).toString());

        const response = await api.get<ApiResponse<PagedResponse<Doctor>>>(
            `/doctors/search?${queryParams.toString()}`
        );
        return response.data.data;
    },

    async getDoctorById(id: string): Promise<Doctor> {
        const response = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
        return response.data.data;
    },

    async getSpecializations(): Promise<string[]> {
        const response = await api.get<ApiResponse<string[]>>(
            "/doctors/specializations"
        );
        return response.data.data;
    },

    async getTopRated(limit = 6): Promise<Doctor[]> {
        const response = await api.get<ApiResponse<Doctor[]>>(
            `/doctors/top-rated?limit=${limit}`
        );
        return response.data.data;
    },

    async getDoctorReviews(
        doctorId: number,
        page = 0,
        size = 10
    ): Promise<PagedResponse<Review>> {
        const response = await api.get<ApiResponse<PagedResponse<Review>>>(
            `/reviews/doctor/${doctorId}?page=${page}&size=${size}`
        );
        return response.data.data;
    },

    async getOwnProfile(): Promise<Doctor> {
        const response = await api.get<ApiResponse<Doctor>>("/doctors/profile");
        return response.data.data;
    },

    async updateProfile(data: DoctorProfileUpdateRequest): Promise<Doctor> {
        const response = await api.put<ApiResponse<Doctor>>(
            "/doctors/profile",
            data
        );
        return response.data.data;
    },

    // Admin Methods
    async getAdminDoctors(
        page = 0,
        size = 10,
        sortBy = "createdAt",
        sortDir = "desc"
    ): Promise<PagedResponse<Doctor>> {
        const response = await api.get<ApiResponse<PagedResponse<Doctor>>>(
            `/doctors/mgmt/all?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
        );
        return response.data.data;
    },

    async verifyDoctor(id: string): Promise<Doctor> {
        const response = await api.put<ApiResponse<Doctor>>(`/doctors/mgmt/${id}/verify`);
        return response.data.data;
    },
};

