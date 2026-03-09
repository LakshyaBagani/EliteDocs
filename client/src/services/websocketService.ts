import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();

    connect(onConnect?: () => void): void {
        const token = localStorage.getItem("accessToken");

        this.client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log("WebSocket connected");
                onConnect?.();
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
            },
            onDisconnect: () => {
                console.log("WebSocket disconnected");
            },
        });

        this.client.activate();
    }

    disconnect(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
        this.client?.deactivate();
        this.client = null;
    }

    subscribe(destination: string, callback: (message: IMessage) => void): void {
        if (!this.client?.connected) {
            console.warn("WebSocket not connected, cannot subscribe to", destination);
            return;
        }

        // Avoid duplicate subscriptions
        if (this.subscriptions.has(destination)) {
            return;
        }

        const subscription = this.client.subscribe(destination, callback);
        this.subscriptions.set(destination, subscription);
    }

    unsubscribe(destination: string): void {
        const sub = this.subscriptions.get(destination);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    send(destination: string, body: object): void {
        if (!this.client?.connected) {
            console.warn("WebSocket not connected, cannot send to", destination);
            return;
        }
        this.client.publish({
            destination,
            body: JSON.stringify(body),
        });
    }

    isConnected(): boolean {
        return this.client?.connected ?? false;
    }
}

export const websocketService = new WebSocketService();
