package com.doconsult.server.controller;

import com.doconsult.server.dto.request.ConsultationRequest;
import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.dto.response.ConsultationResponse;
import com.doconsult.server.service.AuthService;
import com.doconsult.server.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Consultation APIs")
public class ConsultationController {

    private final ConsultationService consultationService;
    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create consultation after appointment")
    public ResponseEntity<ApiResponse<ConsultationResponse>> createConsultation(
            @Valid @RequestBody ConsultationRequest request) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        ConsultationResponse response = consultationService.createConsultation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Consultation created", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get consultation by ID")
    public ResponseEntity<ApiResponse<ConsultationResponse>> getById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getConsultationById(id)));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get consultation by appointment ID")
    public ResponseEntity<ApiResponse<ConsultationResponse>> getByAppointment(
            @PathVariable java.util.UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(
                consultationService.getConsultationByAppointmentId(appointmentId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update consultation")
    public ResponseEntity<ApiResponse<ConsultationResponse>> updateConsultation(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody ConsultationRequest request) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                consultationService.updateConsultation(id, userId, request)));
    }
}
