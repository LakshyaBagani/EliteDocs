package com.doconsult.server.service;

import com.doconsult.server.dto.response.AnalyticsResponse;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.AppointmentStatus;
import com.doconsult.server.model.Doctor;
import com.doconsult.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final UserRepository userRepository;
        private final DoctorRepository doctorRepository;
        private final PatientRepository patientRepository;
        private final AppointmentRepository appointmentRepository;

        public AnalyticsResponse getAdminDashboard() {
                return AnalyticsResponse.builder()
                                .totalDoctors(doctorRepository.countByIsVerifiedTrue())
                                .totalPatients(patientRepository.count())
                                .totalAppointments(appointmentRepository.count())
                                .todayAppointments(appointmentRepository.countByDate(LocalDate.now()))
                                .pendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.PENDING))
                                .completedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED))
                                .cancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED))
                                .build();
        }

        public AnalyticsResponse getDoctorDashboard(java.util.UUID doctorUserId) {
                Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));

                long completedCount = appointmentRepository.countByDoctorAndStatus(
                                doctor.getId(), AppointmentStatus.COMPLETED);
                long todayCount = appointmentRepository.findTodayAppointments(
                                doctor.getId(), LocalDate.now()).size();

                return AnalyticsResponse.builder()
                                .doctorTodayAppointments(todayCount)
                                .doctorCompletedConsultations(completedCount)
                                .doctorAverageRating(doctor.getAverageRating())
                                .doctorTotalReviews((long) doctor.getTotalReviews())
                                .build();
        }
}
