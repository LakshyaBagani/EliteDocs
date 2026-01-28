package com.doconsult.server.dto.response;

import com.doconsult.server.model.DayOfWeek;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {

    private java.util.UUID id;
    private java.util.UUID userId;
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private String fullName;
    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private BigDecimal consultationFeeOnline;
    private BigDecimal consultationFeeClinic;
    private String licenseNumber;
    private String bio;
    private String profileImage;
    private String clinicName;
    private String clinicAddress;
    private Boolean isVerified;
    private Boolean isAvailableOnline;
    private Boolean isAvailableClinic;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private List<AvailabilityResponse> availabilities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityResponse {
        private java.util.UUID id;
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer slotDurationMinutes;
    }
}
