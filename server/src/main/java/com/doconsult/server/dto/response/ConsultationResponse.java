package com.doconsult.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponse {

    private java.util.UUID id;
    private java.util.UUID appointmentId;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private String vitals;
    private LocalDateTime followUpDate;
    private LocalDateTime createdAt;
    private List<PrescriptionResponse> prescriptions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionResponse {
        private java.util.UUID id;
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
