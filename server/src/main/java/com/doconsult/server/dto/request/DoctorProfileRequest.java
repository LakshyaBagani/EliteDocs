package com.doconsult.server.dto.request;

import com.doconsult.server.model.DayOfWeek;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    private String qualification;

    @Min(value = 0, message = "Experience years cannot be negative")
    private Integer experienceYears;

    private BigDecimal consultationFeeOnline;

    private BigDecimal consultationFeeClinic;

    private String licenseNumber;

    private String bio;

    private String clinicName;

    private String clinicAddress;

    private Boolean isAvailableOnline;

    private Boolean isAvailableClinic;

    private List<AvailabilityRequest> availabilities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityRequest {
        @NotNull(message = "Day of week is required")
        private DayOfWeek dayOfWeek;

        @NotBlank(message = "Start time is required")
        private String startTime;

        @NotBlank(message = "End time is required")
        private String endTime;

        private Integer slotDurationMinutes;
    }
}
