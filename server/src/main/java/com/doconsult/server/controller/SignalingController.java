package com.doconsult.server.controller;

import com.doconsult.server.dto.request.ChatMessageRequest;
import com.doconsult.server.dto.request.SignalMessage;
import com.doconsult.server.dto.response.ChatMessageResponse;
import com.doconsult.server.model.User;
import com.doconsult.server.repository.UserRepository;
import com.doconsult.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class SignalingController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @MessageMapping("/signal/{appointmentId}")
    @SendTo("/topic/signal/{appointmentId}")
    public SignalMessage relaySignal(@DestinationVariable String appointmentId,
                                     SignalMessage message,
                                     SimpMessageHeaderAccessor headerAccessor) {
        UUID userId = extractUserId(headerAccessor);
        if (userId != null) {
            message.setSenderUserId(userId.toString());
        }
        log.debug("Relaying signal type={} for appointment={}", message.getType(), appointmentId);
        return message;
    }

    @MessageMapping("/chat/{appointmentId}")
    @SendTo("/topic/chat/{appointmentId}")
    public ChatMessageResponse handleChatMessage(@DestinationVariable String appointmentId,
                                                  ChatMessageRequest request,
                                                  SimpMessageHeaderAccessor headerAccessor) {
        UUID userId = extractUserId(headerAccessor);
        if (userId == null) {
            log.warn("Unauthenticated chat message attempt for appointment={}", appointmentId);
            return null;
        }

        ChatMessageResponse response = chatService.saveMessage(
                UUID.fromString(appointmentId), userId, request.getContent());
        log.debug("Chat message saved for appointment={} from user={}", appointmentId, userId);
        return response;
    }

    private UUID extractUserId(SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String email = userDetails.getUsername();
            User user = userRepository.findByEmail(email).orElse(null);
            return user != null ? user.getId() : null;
        }
        return null;
    }
}
