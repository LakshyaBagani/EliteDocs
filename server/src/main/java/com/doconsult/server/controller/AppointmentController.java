package com.doconsult.server.controller;

import com.doconsult.server.dto.request.AppointmentRequest;
import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.dto.response.AppointmentResponse;
import com.doconsult.server.dto.response.DoctorPatientResponse;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.model.AppointmentStatus;
import com.doconsult.server.model.Role;
import com.doconsult.server.service.AppointmentService;
import com.doconsult.server.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment APIs")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        AppointmentResponse response = appointmentService.createAppointment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked", response));
    }

    @GetMapping
    @Operation(summary = "Get appointments")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        var user = authService.getCurrentUser();
        PagedResponse<AppointmentResponse> response;
        if (user.getRole() == Role.DOCTOR) {
            response = appointmentService.getDoctorAppointments(user.getId(), status, page, size, sortBy, sortDir);
        } else {
            response = appointmentService.getPatientAppointments(user.getId(), status, page, size, sortBy, sortDir);
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get today's appointments for doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getTodayAppointments() {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorTodayAppointments(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable java.util.UUID id,
            @RequestParam AppointmentStatus status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.updateAppointmentStatus(id, status, reason)));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Confirm payment (mock)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmPayment(@PathVariable java.util.UUID id) {
        String paymentId = "PAY_" + java.util.UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.confirmPayment(id, paymentId)));
    }

    @GetMapping("/with-doctor/{doctorId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient's active appointment with a specific doctor")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentWithDoctor(
            @PathVariable java.util.UUID doctorId) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        AppointmentResponse response = appointmentService.getPatientAppointmentWithDoctor(userId, doctorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/booked-slots/{doctorId}")
    @Operation(summary = "Get booked slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<String>>> getBookedSlots(
            @PathVariable java.util.UUID doctorId,
            @RequestParam java.time.LocalDate date) {
        List<java.time.LocalTime> slots = appointmentService.getBookedSlots(doctorId, date);
        List<String> slotStrings = slots.stream()
                .map(t -> t.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(slotStrings));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Reschedule an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody AppointmentRequest request) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        AppointmentResponse response = appointmentService.rescheduleAppointment(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled", response));
    }

    @GetMapping("/my-patients")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get all patients for the current doctor")
    public ResponseEntity<ApiResponse<List<DoctorPatientResponse>>> getDoctorPatients() {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorPatients(userId)));
    }

    @GetMapping("/my-patients/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get patient detail with visit history")
    public ResponseEntity<ApiResponse<DoctorPatientResponse>> getDoctorPatientDetail(
            @PathVariable java.util.UUID patientId) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorPatientDetail(userId, patientId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(
            @PathVariable java.util.UUID id,
            @RequestParam(required = false) String reason) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        appointmentService.cancelAppointment(id, userId, reason);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", null));
    }
}
