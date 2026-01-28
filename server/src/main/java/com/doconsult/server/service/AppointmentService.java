package com.doconsult.server.service;

import com.doconsult.server.dto.request.AppointmentRequest;
import com.doconsult.server.dto.response.AppointmentResponse;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.exception.BadRequestException;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.*;
import com.doconsult.server.repository.AppointmentRepository;
import com.doconsult.server.repository.DoctorRepository;
import com.doconsult.server.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final EmailService emailService;

    @Transactional
    public AppointmentResponse createAppointment(java.util.UUID patientUserId, AppointmentRequest request) {
        // Get patient
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", patientUserId));

        // Get doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        // Check if doctor is verified
        if (!doctor.getIsVerified()) {
            throw new BadRequestException("Doctor is not verified yet");
        }

        // Check if slot is available
        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(
                request.getDoctorId(), request.getAppointmentDate(), request.getSlotTime(),
                AppointmentStatus.CANCELLED)) {
            throw new BadRequestException("This time slot is already booked");
        }

        // Check consultation type availability
        if (request.getConsultationType() == ConsultationType.ONLINE && !doctor.getIsAvailableOnline()) {
            throw new BadRequestException("Doctor is not available for online consultations");
        }
        if (request.getConsultationType() == ConsultationType.CLINIC && !doctor.getIsAvailableClinic()) {
            throw new BadRequestException("Doctor is not available for clinic visits");
        }

        // Determine fee
        java.math.BigDecimal fee = request.getConsultationType() == ConsultationType.ONLINE
                ? doctor.getConsultationFeeOnline()
                : doctor.getConsultationFeeClinic();

        // Create appointment
        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .slotTime(request.getSlotTime())
                .consultationType(request.getConsultationType())
                .status(AppointmentStatus.PENDING)
                .reason(request.getReason())
                .symptoms(request.getSymptoms())
                .feeAmount(fee)
                .isPaid(false)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Send confirmation email (async)
        try {
            emailService.sendAppointmentConfirmation(appointment);
        } catch (Exception e) {
            // Log error but don't fail the appointment creation
            e.printStackTrace();
        }

        return mapToResponse(appointment);
    }

    public PagedResponse<AppointmentResponse> getPatientAppointments(java.util.UUID patientUserId,
            AppointmentStatus status,
            int page, int size, String sortBy, String sortDir) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", patientUserId));

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Appointment> appointmentsPage;
        if (status != null) {
            appointmentsPage = appointmentRepository.findByPatientIdAndStatus(patient.getId(), status, pageable);
        } else {
            appointmentsPage = appointmentRepository.findByPatientId(patient.getId(), pageable);
        }

        return buildPagedResponse(appointmentsPage);
    }

    public PagedResponse<AppointmentResponse> getDoctorAppointments(java.util.UUID doctorUserId,
            AppointmentStatus status,
            int page, int size, String sortBy, String sortDir) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Appointment> appointmentsPage;
        if (status != null) {
            appointmentsPage = appointmentRepository.findByDoctorIdAndStatus(doctor.getId(), status, pageable);
        } else {
            appointmentsPage = appointmentRepository.findByDoctorId(doctor.getId(), pageable);
        }

        return buildPagedResponse(appointmentsPage);
    }

    public List<AppointmentResponse> getDoctorTodayAppointments(java.util.UUID doctorUserId) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));

        List<Appointment> appointments = appointmentRepository.findTodayAppointments(
                doctor.getId(), LocalDate.now());

        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(java.util.UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));
        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(java.util.UUID appointmentId, AppointmentStatus status,
            String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        appointment.setStatus(status);
        if (status == AppointmentStatus.CANCELLED && reason != null) {
            appointment.setCancellationReason(reason);
        }

        appointment = appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse confirmPayment(java.util.UUID appointmentId, String paymentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        appointment.setIsPaid(true);
        appointment.setPaymentId(paymentId);
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        appointment = appointmentRepository.save(appointment);

        // Send payment confirmation email
        try {
            emailService.sendPaymentConfirmation(appointment);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToResponse(appointment);
    }

    @Transactional
    public void cancelAppointment(java.util.UUID appointmentId, java.util.UUID patientUserId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        // Verify patient owns this appointment
        if (!appointment.getPatient().getUser().getId().equals(patientUserId)) {
            throw new BadRequestException("You can only cancel your own appointments");
        }

        // Check if appointment can be cancelled
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointmentRepository.save(appointment);
    }

    private PagedResponse<AppointmentResponse> buildPagedResponse(Page<Appointment> appointmentsPage) {
        List<AppointmentResponse> content = appointmentsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<AppointmentResponse>builder()
                .content(content)
                .page(appointmentsPage.getNumber())
                .size(appointmentsPage.getSize())
                .totalElements(appointmentsPage.getTotalElements())
                .totalPages(appointmentsPage.getTotalPages())
                .last(appointmentsPage.isLast())
                .first(appointmentsPage.isFirst())
                .build();
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse.DoctorSummary doctorSummary = AppointmentResponse.DoctorSummary.builder()
                .id(appointment.getDoctor().getId())
                .fullName(appointment.getDoctor().getFullName())
                .specialization(appointment.getDoctor().getSpecialization())
                .profileImage(appointment.getDoctor().getProfileImage())
                .clinicAddress(appointment.getDoctor().getClinicAddress())
                .build();

        AppointmentResponse.PatientSummary patientSummary = AppointmentResponse.PatientSummary.builder()
                .id(appointment.getPatient().getId())
                .fullName(appointment.getPatient().getFullName())
                .phone(appointment.getPatient().getUser().getPhone())
                .profileImage(appointment.getPatient().getProfileImage())
                .build();

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .appointmentDate(appointment.getAppointmentDate())
                .slotTime(appointment.getSlotTime())
                .consultationType(appointment.getConsultationType())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .symptoms(appointment.getSymptoms())
                .feeAmount(appointment.getFeeAmount())
                .isPaid(appointment.getIsPaid())
                .paymentId(appointment.getPaymentId())
                .meetingLink(appointment.getMeetingLink())
                .cancellationReason(appointment.getCancellationReason())
                .createdAt(appointment.getCreatedAt())
                .doctor(doctorSummary)
                .patient(patientSummary)
                .build();
    }
}
