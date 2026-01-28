package com.doconsult.server.dto.request;

import com.doconsult.server.model.ConsultationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {

    @NotNull(message = "Doctor ID is required")
    private java.util.UUID doctorId;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotNull(message = "Slot time is required")
    private LocalTime slotTime;

    @NotNull(message = "Consultation type is required")
    private ConsultationType consultationType;

    private String reason;

    private String symptoms;
}
