package com.doconsult.server.dto.response;

import com.doconsult.server.model.AppointmentStatus;
import com.doconsult.server.model.ConsultationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {

    private java.util.UUID id;
    private LocalDate appointmentDate;
    private LocalTime slotTime;
    private ConsultationType consultationType;
    private AppointmentStatus status;
    private String reason;
    private String symptoms;
    private BigDecimal feeAmount;
    private Boolean isPaid;
    private String paymentId;
    private String meetingLink;
    private String cancellationReason;
    private LocalDateTime createdAt;

    // Doctor info (for patient view)
    private DoctorSummary doctor;

    // Patient info (for doctor view)
    private PatientSummary patient;

    // Consultation info
    private ConsultationResponse consultation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorSummary {
        private java.util.UUID id;
        private String fullName;
        private String specialization;
        private String profileImage;
        private String clinicAddress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientSummary {
        private java.util.UUID id;
        private String fullName;
        private String phone;
        private String profileImage;
    }
}
