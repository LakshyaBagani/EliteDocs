package com.doconsult.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private UUID id;
    private UUID senderUserId;
    private String senderName;
    private String senderRole;
    private String content;
    private String messageType;
    private LocalDateTime createdAt;
}
