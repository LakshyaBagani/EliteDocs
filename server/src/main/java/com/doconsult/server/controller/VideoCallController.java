package com.doconsult.server.controller;

import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.dto.response.ChatMessageResponse;
import com.doconsult.server.service.AuthService;
import com.doconsult.server.service.ChatService;
import com.doconsult.server.service.VideoCallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/video-call")
@RequiredArgsConstructor
@Tag(name = "Video Call", description = "Video call management APIs")
public class VideoCallController {

    private final VideoCallService videoCallService;
    private final ChatService chatService;
    private final AuthService authService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/{appointmentId}/start")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Start a video call")
    public ResponseEntity<ApiResponse<String>> startCall(@PathVariable UUID appointmentId) {
        UUID userId = authService.getCurrentUser().getId();
        videoCallService.startCall(appointmentId, userId);

        // Broadcast to patient that call has started
        messagingTemplate.convertAndSend(
                "/topic/call-status/" + appointmentId,
                Map.of("status", "IN_PROGRESS"));

        return ResponseEntity.ok(ApiResponse.success("Call started", "IN_PROGRESS"));
    }

    @PostMapping("/{appointmentId}/end")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "End a video call")
    public ResponseEntity<ApiResponse<String>> endCall(@PathVariable UUID appointmentId) {
        UUID userId = authService.getCurrentUser().getId();
        videoCallService.endCall(appointmentId, userId);

        // Broadcast to patient that call has ended
        messagingTemplate.convertAndSend(
                "/topic/call-status/" + appointmentId,
                Map.of("status", "ENDED"));

        return ResponseEntity.ok(ApiResponse.success("Call ended", "CONFIRMED"));
    }

    @GetMapping("/{appointmentId}/chat-history")
    @Operation(summary = "Get chat history for an appointment")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getChatHistory(
            @PathVariable UUID appointmentId) {
        UUID userId = authService.getCurrentUser().getId();
        videoCallService.validateParticipant(appointmentId, userId);
        List<ChatMessageResponse> messages = chatService.getMessageHistory(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
}
