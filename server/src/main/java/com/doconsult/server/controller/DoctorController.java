package com.doconsult.server.controller;

import com.doconsult.server.dto.request.DoctorProfileRequest;
import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.dto.response.DoctorResponse;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.service.AuthService;
import com.doconsult.server.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor APIs")
public class DoctorController {

    private final DoctorService doctorService;
    private final AuthService authService;

    @GetMapping("/mgmt/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all doctors for management")
    public ResponseEntity<ApiResponse<PagedResponse<DoctorResponse>>> getAllDoctorsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.getAllDoctorsAdmin(page, size, sortBy, sortDir)));
    }

    @PutMapping("/mgmt/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify a doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> verifyDoctorAdmin(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.verifyDoctor(id)));
    }

    @GetMapping
    @Operation(summary = "Get all doctors with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<DoctorResponse>>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.getAllDoctors(page, size, sortBy, sortDir)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search doctors with filters")
    public ResponseEntity<ApiResponse<PagedResponse<DoctorResponse>>> searchDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.searchDoctors(specialization, minFee, maxFee, minRating, page, size, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/specializations")
    @Operation(summary = "Get all specializations")
    public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllSpecializations()));
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getTopRated(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getTopRatedDoctors(limit)));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get doctor availability")
    public ResponseEntity<ApiResponse<List<DoctorResponse.AvailabilityResponse>>> getAvailability(
            @PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorAvailability(id)));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get own doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> getOwnProfile() {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorByUserId(userId)));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateProfile(
            @Valid @RequestBody DoctorProfileRequest request) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.createOrUpdateProfile(userId, request)));
    }
}
