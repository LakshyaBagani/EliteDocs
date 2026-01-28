package com.doconsult.server.controller;

import com.doconsult.server.dto.response.AnalyticsResponse;
import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.service.AnalyticsService;
import com.doconsult.server.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics APIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AuthService authService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAdminDashboard()));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor dashboard analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getDoctorDashboard() {
        java.util.UUID userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDoctorDashboard(userId)));
    }
}
