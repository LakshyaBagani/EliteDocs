package com.doconsult.server.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorPatientResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String profileImage;
    private String gender;
    private String bloodGroup;
    private String allergies;
    private String medicalConditions;
    private String dateOfBirth;
    private int totalVisits;
    private String lastVisitDate;
    private String status; // ACTIVE (has upcoming), PAST (only past visits)
    private List<VisitSummary> visits;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VisitSummary {
        private UUID appointmentId;
        private LocalDate appointmentDate;
        private LocalTime slotTime;
        private String consultationType;
        private String status;
        private String reason;
        private String diagnosis;
        private List<PrescriptionSummary> prescriptions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionSummary {
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
    }
}
