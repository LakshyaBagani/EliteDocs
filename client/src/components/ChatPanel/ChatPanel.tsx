import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import type { ChatMessage } from "../../types";
import "./ChatPanel.css";

interface ChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    currentUserId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
    messages,
    onSendMessage,
    currentUserId,
}) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput("");
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="chat-panel">
            <div className="chat-panel__header">
                <h3 className="chat-panel__title">
                    <MessageSquare size={18} />
                    Chat
                </h3>
            </div>

            <div className="chat-panel__messages">
                {messages.length === 0 ? (
                    <div className="chat-panel__empty">
                        <MessageSquare size={32} />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSent = msg.senderUserId === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`chat-message ${
                                    isSent ? "chat-message--sent" : "chat-message--received"
                                }`}
                            >
                                {!isSent && (
                                    <span className="chat-message__sender">
                                        {msg.senderName}
                                    </span>
                                )}
                                <div className="chat-message__bubble">{msg.content}</div>
                                <span className="chat-message__time">
                                    {msg.createdAt ? formatTime(msg.createdAt) : ""}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-panel__input-area" onSubmit={handleSubmit}>
                <input
                    className="chat-panel__input"
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    type="submit"
                    className="chat-panel__send-btn"
                    disabled={!input.trim()}
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};
