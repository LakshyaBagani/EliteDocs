package com.doconsult.server.controller;

import com.doconsult.server.dto.request.ReviewRequest;
import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.dto.response.ReviewResponse;
import com.doconsult.server.service.AuthService;
import com.doconsult.server.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Review APIs")
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Create a review for completed appointment")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        ReviewResponse response = reviewService.createReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted", response));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get reviews for a doctor")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getDoctorReviews(
            @PathVariable java.util.UUID doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewService.getDoctorReviews(doctorId, page, size)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Delete a review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable java.util.UUID id) {
        java.util.UUID userId = authService.getCurrentUser().getId();
        reviewService.deleteReview(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
