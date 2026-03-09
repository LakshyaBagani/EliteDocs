import api from "./api";
import type { ApiResponse, ChatMessage } from "../types";

export const videoCallService = {
    async startCall(appointmentId: string): Promise<string> {
        const response = await api.post<ApiResponse<string>>(
            `/video-call/${appointmentId}/start`
        );
        return response.data.data;
    },

    async endCall(appointmentId: string): Promise<string> {
        const response = await api.post<ApiResponse<string>>(
            `/video-call/${appointmentId}/end`
        );
        return response.data.data;
    },

    async getChatHistory(appointmentId: string): Promise<ChatMessage[]> {
        const response = await api.get<ApiResponse<ChatMessage[]>>(
            `/video-call/${appointmentId}/chat-history`
        );
        return response.data.data;
    },
};
