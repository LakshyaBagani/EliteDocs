import api from "./api";
import type { AuthResponse, ApiResponse } from "../types";

interface RegisterData {
    email: string;
    password: string;
    phone?: string;
    role: "PATIENT" | "DOCTOR";
    firstName: string;
    lastName: string;
}

interface LoginData {
    email: string;
    password: string;
}

export const authService = {
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            "/auth/register",
            data
        );
        return response.data.data;
    },

    async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            `/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
        );
        return response.data.data;
    },

    async resendOtp(email: string): Promise<void> {
        await api.post<ApiResponse<string>>(
            `/auth/resend-otp?email=${encodeURIComponent(email)}`
        );
    },

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            "/auth/login",
            data
        );
        return response.data.data;
    },

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            `/auth/refresh?refreshToken=${refreshToken}`
        );
        return response.data.data;
    },

    async getCurrentUser(): Promise<AuthResponse["user"]> {
        const response = await api.get<ApiResponse<AuthResponse["user"]>>(
            "/auth/me"
        );
        return response.data.data;
    },

    logout(): void {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    },

    getStoredUser(): AuthResponse["user"] | null {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem("accessToken");
    },
};
