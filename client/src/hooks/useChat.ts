import { useState, useCallback, useEffect, useRef } from "react";
import { websocketService } from "../services/websocketService";
import { videoCallService } from "../services/videoCallService";
import type { ChatMessage } from "../types";

interface UseChatOptions {
    appointmentId: string;
}

export function useChat({ appointmentId }: UseChatOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const subscribed = useRef(false);

    // Load chat history
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await videoCallService.getChatHistory(appointmentId);
                setMessages(history || []);
            } catch (err) {
                console.error("Failed to load chat history:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, [appointmentId]);

    // Subscribe to real-time chat messages
    const subscribeToChat = useCallback(() => {
        if (subscribed.current) return;
        subscribed.current = true;

        websocketService.subscribe(
            `/topic/chat/${appointmentId}`,
            (message) => {
                const chatMessage: ChatMessage = JSON.parse(message.body);
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some((m) => m.id === chatMessage.id)) return prev;
                    return [...prev, chatMessage];
                });
            }
        );
    }, [appointmentId]);

    const unsubscribeFromChat = useCallback(() => {
        websocketService.unsubscribe(`/topic/chat/${appointmentId}`);
        subscribed.current = false;
    }, [appointmentId]);

    const sendMessage = useCallback(
        (content: string) => {
            if (!content.trim()) return;
            websocketService.send(`/app/chat/${appointmentId}`, {
                appointmentId,
                content: content.trim(),
            });
        },
        [appointmentId]
    );

    useEffect(() => {
        return () => {
            unsubscribeFromChat();
        };
    }, [unsubscribeFromChat]);

    return {
        messages,
        isLoading,
        sendMessage,
        subscribeToChat,
        unsubscribeFromChat,
    };
}
