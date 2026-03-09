package com.doconsult.server.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalMessage {
    private String type; // offer, answer, ice-candidate
    private String appointmentId;
    private String payload; // SDP or ICE candidate JSON
    private String senderUserId;
}
