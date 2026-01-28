package com.doconsult.server.controller;

import com.doconsult.server.dto.request.PatientProfileRequest;
import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.dto.response.PatientResponse;
import com.doconsult.server.service.AuthService;
import com.doconsult.server.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient APIs")
public class PatientController {

    private final PatientService patientService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all patients (admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<PatientResponse>>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                patientService.getAllPatients(page, size, sortBy, sortDir)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search patients (admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<PatientResponse>>> searchPatients(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                patientService.searchPatients(query, page, size)));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get own patient profile")
    public ResponseEntity<ApiResponse<PatientResponse>> getOwnProfile() {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientByUserId(userId)));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update patient profile")
    public ResponseEntity<ApiResponse<PatientResponse>> updateProfile(
            @Valid @RequestBody PatientProfileRequest request) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                patientService.createOrUpdateProfile(userId, request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }
}
