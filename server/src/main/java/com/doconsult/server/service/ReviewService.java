package com.doconsult.server.service;

import com.doconsult.server.dto.request.ReviewRequest;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.dto.response.ReviewResponse;
import com.doconsult.server.exception.BadRequestException;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.*;
import com.doconsult.server.repository.AppointmentRepository;
import com.doconsult.server.repository.DoctorRepository;
import com.doconsult.server.repository.PatientRepository;
import com.doconsult.server.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    @CacheEvict(value = "doctorById", key = "#result.doctorId")
    public ReviewResponse createReview(java.util.UUID patientUserId, ReviewRequest request) {
        // Get patient
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", patientUserId));

        // Get appointment
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        // Verify this appointment belongs to the patient
        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new BadRequestException("This appointment does not belong to you");
        }

        // Check if appointment is completed
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new BadRequestException("You can only review after the consultation is completed");
        }

        // Check if review already exists
        if (reviewRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new BadRequestException("You have already reviewed this appointment");
        }

        // Create review
        Review review = Review.builder()
                .doctor(appointment.getDoctor())
                .patient(patient)
                .appointment(appointment)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        // Update doctor's average rating
        updateDoctorRating(appointment.getDoctor().getId());

        return mapToResponse(review);
    }

    public PagedResponse<ReviewResponse> getDoctorReviews(java.util.UUID doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviewsPage = reviewRepository.findByDoctorId(doctorId, pageable);

        List<ReviewResponse> content = reviewsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<ReviewResponse>builder()
                .content(content)
                .page(reviewsPage.getNumber())
                .size(reviewsPage.getSize())
                .totalElements(reviewsPage.getTotalElements())
                .totalPages(reviewsPage.getTotalPages())
                .last(reviewsPage.isLast())
                .first(reviewsPage.isFirst())
                .build();
    }

    @Transactional
    @CacheEvict(value = "doctorById", allEntries = true)
    public void deleteReview(java.util.UUID reviewId, java.util.UUID patientUserId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Verify this review belongs to the patient
        if (!review.getPatient().getUser().getId().equals(patientUserId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        java.util.UUID doctorId = review.getDoctor().getId();
        reviewRepository.delete(review);

        // Update doctor's average rating
        updateDoctorRating(doctorId);
    }

    private void updateDoctorRating(java.util.UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        Double avgRating = reviewRepository.calculateAverageRating(doctorId);
        long totalReviews = reviewRepository.countByDoctorId(doctorId);

        doctor.setAverageRating(avgRating != null
                ? BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        doctor.setTotalReviews((int) totalReviews);

        doctorRepository.save(doctor);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .doctorId(review.getDoctor().getId())
                .appointmentId(review.getAppointment().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .patient(ReviewResponse.PatientSummary.builder()
                        .id(review.getPatient().getId())
                        .fullName(review.getPatient().getFullName())
                        .profileImage(review.getPatient().getProfileImage())
                        .build())
                .build();
    }
}
