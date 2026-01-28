package com.doconsult.server.service;

import com.doconsult.server.dto.request.DoctorProfileRequest;
import com.doconsult.server.dto.response.DoctorResponse;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.*;
import com.doconsult.server.repository.AvailabilityRepository;
import com.doconsult.server.repository.DoctorRepository;
import com.doconsult.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

        private final DoctorRepository doctorRepository;
        private final UserRepository userRepository;
        private final AvailabilityRepository availabilityRepository;

        @Cacheable(value = "doctors", key = "#page + '-' + #size + '-' + #sortBy + '-' + #sortDir")
        public PagedResponse<DoctorResponse> getAllDoctors(int page, int size, String sortBy, String sortDir) {
                Sort sort = sortDir.equalsIgnoreCase("desc")
                                ? Sort.by(sortBy).descending()
                                : Sort.by(sortBy).ascending();
                Pageable pageable = PageRequest.of(page, size, sort);

                Page<Doctor> doctorsPage = doctorRepository.findByIsVerifiedTrue(pageable);

                List<DoctorResponse> content = doctorsPage.getContent().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());

                return PagedResponse.<DoctorResponse>builder()
                                .content(content)
                                .page(doctorsPage.getNumber())
                                .size(doctorsPage.getSize())
                                .totalElements(doctorsPage.getTotalElements())
                                .totalPages(doctorsPage.getTotalPages())
                                .last(doctorsPage.isLast())
                                .first(doctorsPage.isFirst())
                                .build();
        }

        public PagedResponse<DoctorResponse> getAllDoctorsAdmin(int page, int size, String sortBy, String sortDir) {
                Sort sort = sortDir.equalsIgnoreCase("desc")
                                ? Sort.by(sortBy).descending()
                                : Sort.by(sortBy).ascending();
                Pageable pageable = PageRequest.of(page, size, sort);

                Page<Doctor> doctorsPage = doctorRepository.findAll(pageable);

                List<DoctorResponse> content = doctorsPage.getContent().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());

                return PagedResponse.<DoctorResponse>builder()
                                .content(content)
                                .page(doctorsPage.getNumber())
                                .size(doctorsPage.getSize())
                                .totalElements(doctorsPage.getTotalElements())
                                .totalPages(doctorsPage.getTotalPages())
                                .last(doctorsPage.isLast())
                                .first(doctorsPage.isFirst())
                                .build();
        }

        public PagedResponse<DoctorResponse> searchDoctors(String specialization, BigDecimal minFee,
                        BigDecimal maxFee, BigDecimal minRating,
                        int page, int size, String sortBy, String sortDir) {
                Sort sort = sortDir.equalsIgnoreCase("desc")
                                ? Sort.by(sortBy).descending()
                                : Sort.by(sortBy).ascending();
                Pageable pageable = PageRequest.of(page, size, sort);

                Page<Doctor> doctorsPage = doctorRepository.searchDoctors(
                                specialization, minFee, maxFee, minRating, pageable);

                List<DoctorResponse> content = doctorsPage.getContent().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());

                return PagedResponse.<DoctorResponse>builder()
                                .content(content)
                                .page(doctorsPage.getNumber())
                                .size(doctorsPage.getSize())
                                .totalElements(doctorsPage.getTotalElements())
                                .totalPages(doctorsPage.getTotalPages())
                                .last(doctorsPage.isLast())
                                .first(doctorsPage.isFirst())
                                .build();
        }

        @Cacheable(value = "doctorById", key = "#id")
        public DoctorResponse getDoctorById(java.util.UUID id) {
                Doctor doctor = doctorRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
                return mapToResponse(doctor);
        }

        public DoctorResponse getDoctorByUserId(java.util.UUID userId) {
                Doctor doctor = doctorRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "userId", userId));
                return mapToResponse(doctor);
        }

        @Transactional
        @CacheEvict(value = { "doctors", "doctorById", "specializations" }, allEntries = true)
        public DoctorResponse createOrUpdateProfile(java.util.UUID userId, DoctorProfileRequest request) {
                Doctor doctor = doctorRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "userId", userId));

                doctor.setFirstName(request.getFirstName());
                doctor.setLastName(request.getLastName());
                doctor.setSpecialization(request.getSpecialization());
                doctor.setQualification(request.getQualification());
                doctor.setExperienceYears(request.getExperienceYears());
                doctor.setConsultationFeeOnline(request.getConsultationFeeOnline());
                doctor.setConsultationFeeClinic(request.getConsultationFeeClinic());
                doctor.setLicenseNumber(request.getLicenseNumber());
                doctor.setBio(request.getBio());
                doctor.setClinicName(request.getClinicName());
                doctor.setClinicAddress(request.getClinicAddress());

                if (request.getIsAvailableOnline() != null) {
                        doctor.setIsAvailableOnline(request.getIsAvailableOnline());
                }
                if (request.getIsAvailableClinic() != null) {
                        doctor.setIsAvailableClinic(request.getIsAvailableClinic());
                }

                // Handle availability updates
                if (request.getAvailabilities() != null && !request.getAvailabilities().isEmpty()) {
                        // Clear existing availabilities
                        doctor.getAvailabilities().clear();

                        for (DoctorProfileRequest.AvailabilityRequest availRequest : request.getAvailabilities()) {
                                Availability availability = Availability.builder()
                                                .doctor(doctor)
                                                .dayOfWeek(availRequest.getDayOfWeek())
                                                .startTime(LocalTime.parse(availRequest.getStartTime()))
                                                .endTime(LocalTime.parse(availRequest.getEndTime()))
                                                .slotDurationMinutes(availRequest.getSlotDurationMinutes() != null
                                                                ? availRequest.getSlotDurationMinutes()
                                                                : 30)
                                                .isActive(true)
                                                .build();
                                doctor.getAvailabilities().add(availability);
                        }
                }

                doctor = doctorRepository.save(doctor);
                return mapToResponse(doctor);
        }

        @Cacheable(value = "specializations")
        public List<String> getAllSpecializations() {
                return doctorRepository.findAllSpecializations();
        }

        public List<DoctorResponse> getTopRatedDoctors(int limit) {
                Pageable pageable = PageRequest.of(0, limit);
                return doctorRepository.findTopRatedDoctors(pageable).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Cacheable(value = "availabilities", key = "#doctorId")
        public List<DoctorResponse.AvailabilityResponse> getDoctorAvailability(java.util.UUID doctorId) {
                List<Availability> availabilities = availabilityRepository.findByDoctorIdAndIsActiveTrue(doctorId);
                return availabilities.stream()
                                .map(this::mapAvailabilityToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        @CacheEvict(value = "doctorById", key = "#doctorId")
        public DoctorResponse verifyDoctor(java.util.UUID doctorId) {
                Doctor doctor = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
                doctor.setIsVerified(true);
                doctor = doctorRepository.save(doctor);
                return mapToResponse(doctor);
        }

        public void updateDoctorRating(java.util.UUID doctorId) {
                Doctor doctor = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
                // Rating update logic will be handled by ReviewService
        }

        private DoctorResponse mapToResponse(Doctor doctor) {
                List<DoctorResponse.AvailabilityResponse> availabilities = doctor.getAvailabilities().stream()
                                .filter(Availability::getIsActive)
                                .map(this::mapAvailabilityToResponse)
                                .collect(Collectors.toList());

                return DoctorResponse.builder()
                                .id(doctor.getId())
                                .userId(doctor.getUser().getId())
                                .email(doctor.getUser().getEmail())
                                .phone(doctor.getUser().getPhone())
                                .firstName(doctor.getFirstName())
                                .lastName(doctor.getLastName())
                                .fullName(doctor.getFullName())
                                .specialization(doctor.getSpecialization())
                                .qualification(doctor.getQualification())
                                .experienceYears(doctor.getExperienceYears())
                                .consultationFeeOnline(doctor.getConsultationFeeOnline())
                                .consultationFeeClinic(doctor.getConsultationFeeClinic())
                                .licenseNumber(doctor.getLicenseNumber())
                                .bio(doctor.getBio())
                                .profileImage(doctor.getProfileImage())
                                .clinicName(doctor.getClinicName())
                                .clinicAddress(doctor.getClinicAddress())
                                .isVerified(doctor.getIsVerified())
                                .isAvailableOnline(doctor.getIsAvailableOnline())
                                .isAvailableClinic(doctor.getIsAvailableClinic())
                                .averageRating(doctor.getAverageRating())
                                .totalReviews(doctor.getTotalReviews())
                                .availabilities(availabilities)
                                .build();
        }

        private DoctorResponse.AvailabilityResponse mapAvailabilityToResponse(Availability availability) {
                return DoctorResponse.AvailabilityResponse.builder()
                                .id(availability.getId())
                                .dayOfWeek(availability.getDayOfWeek())
                                .startTime(availability.getStartTime())
                                .endTime(availability.getEndTime())
                                .slotDurationMinutes(availability.getSlotDurationMinutes())
                                .build();
        }
}
