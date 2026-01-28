package com.doconsult.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private java.util.UUID id;
    private java.util.UUID doctorId;
    private java.util.UUID appointmentId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private PatientSummary patient;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientSummary {
        private java.util.UUID id;
        private String fullName;
        private String profileImage;
    }
}
