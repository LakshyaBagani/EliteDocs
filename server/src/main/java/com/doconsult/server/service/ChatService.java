package com.doconsult.server.service;

import com.doconsult.server.dto.response.ChatMessageResponse;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.*;
import com.doconsult.server.repository.AppointmentRepository;
import com.doconsult.server.repository.ChatMessageRepository;
import com.doconsult.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageResponse saveMessage(UUID appointmentId, UUID senderUserId, String content) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderUserId));

        String senderName = getSenderName(sender);

        ChatMessage message = ChatMessage.builder()
                .appointment(appointment)
                .senderUserId(senderUserId)
                .senderRole(sender.getRole().name())
                .content(content)
                .messageType(MessageType.TEXT)
                .build();

        message = chatMessageRepository.save(message);

        return mapToResponse(message, senderName);
    }

    public List<ChatMessageResponse> getMessageHistory(UUID appointmentId) {
        List<ChatMessage> messages = chatMessageRepository.findByAppointmentIdOrderByCreatedAtAsc(appointmentId);
        return messages.stream()
                .map(msg -> {
                    User sender = userRepository.findById(msg.getSenderUserId()).orElse(null);
                    String name = sender != null ? getSenderName(sender) : "Unknown";
                    return mapToResponse(msg, name);
                })
                .collect(Collectors.toList());
    }

    private String getSenderName(User user) {
        if (user.getRole() == Role.DOCTOR && user.getDoctorProfile() != null) {
            return "Dr. " + user.getDoctorProfile().getFullName();
        } else if (user.getRole() == Role.PATIENT && user.getPatientProfile() != null) {
            return user.getPatientProfile().getFullName();
        }
        return user.getEmail();
    }

    private ChatMessageResponse mapToResponse(ChatMessage message, String senderName) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .senderUserId(message.getSenderUserId())
                .senderName(senderName)
                .senderRole(message.getSenderRole())
                .content(message.getContent())
                .messageType(message.getMessageType().name())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
