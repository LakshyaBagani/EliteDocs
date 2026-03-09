package com.doconsult.server.service;

import com.doconsult.server.dto.request.AppointmentRequest;
import com.doconsult.server.dto.response.AppointmentResponse;
import com.doconsult.server.dto.response.DoctorPatientResponse;
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

        // Send notification email to doctor
        try {
            emailService.sendNewAppointmentNotification(
                    doctor.getUser().getEmail(),
                    doctor.getFullName(),
                    patient.getFullName(),
                    appointment.getAppointmentDate(),
                    appointment.getSlotTime(),
                    appointment.getConsultationType().name(),
                    appointment.getReason(),
                    appointment.getId());
        } catch (Exception e) {
            // Don't fail the booking if email fails
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

        // Send email if confirmed
        if (status == AppointmentStatus.CONFIRMED) {
            try {
                emailService.sendAppointmentConfirmation(
                        appointment.getPatient().getUser().getEmail(),
                        appointment.getPatient().getFullName(),
                        appointment.getDoctor().getFullName(),
                        appointment.getAppointmentDate().atTime(appointment.getSlotTime()));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

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
            emailService.sendAppointmentConfirmation(
                    appointment.getPatient().getUser().getEmail(),
                    appointment.getPatient().getFullName(),
                    appointment.getDoctor().getFullName(),
                    appointment.getAppointmentDate().atTime(appointment.getSlotTime()));
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

    public AppointmentResponse getPatientAppointmentWithDoctor(java.util.UUID patientUserId, java.util.UUID doctorId) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", patientUserId));

        List<Appointment> appointments = appointmentRepository.findActiveByPatientAndDoctor(
                patient.getId(), doctorId);

        if (appointments.isEmpty()) {
            return null;
        }

        return mapToResponse(appointments.get(0));
    }

    public List<java.time.LocalTime> getBookedSlots(java.util.UUID doctorId, LocalDate date) {
        return appointmentRepository.findBookedSlotsByDoctorAndDate(doctorId, date);
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(java.util.UUID appointmentId, java.util.UUID patientUserId,
            AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        // Verify patient owns this appointment
        if (!appointment.getPatient().getUser().getId().equals(patientUserId)) {
            throw new BadRequestException("You can only reschedule your own appointments");
        }

        // Only PENDING or CONFIRMED can be rescheduled
        if (appointment.getStatus() != AppointmentStatus.PENDING &&
                appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BadRequestException("Only pending or confirmed appointments can be rescheduled");
        }

        // Check if new slot is available (exclude current appointment)
        boolean slotTaken = appointmentRepository.existsByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(
                appointment.getDoctor().getId(), request.getAppointmentDate(), request.getSlotTime(),
                AppointmentStatus.CANCELLED);
        // If the slot is taken, check if it's by this same appointment
        if (slotTaken && !(appointment.getAppointmentDate().equals(request.getAppointmentDate()) &&
                appointment.getSlotTime().equals(request.getSlotTime()))) {
            throw new BadRequestException("This time slot is already booked");
        }

        // Update appointment
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setSlotTime(request.getSlotTime());
        appointment.setConsultationType(request.getConsultationType());
        if (request.getReason() != null) {
            appointment.setReason(request.getReason());
        }
        if (request.getSymptoms() != null) {
            appointment.setSymptoms(request.getSymptoms());
        }
        appointment.setStatus(AppointmentStatus.PENDING);

        appointment = appointmentRepository.save(appointment);

        // Send reschedule notification email to doctor
        try {
            emailService.sendRescheduleNotification(
                    appointment.getDoctor().getUser().getEmail(),
                    appointment.getDoctor().getFullName(),
                    appointment.getPatient().getFullName(),
                    appointment.getAppointmentDate(),
                    appointment.getSlotTime(),
                    appointment.getConsultationType().name(),
                    appointment.getReason(),
                    appointment.getId());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToResponse(appointment);
    }

    public List<DoctorPatientResponse> getDoctorPatients(java.util.UUID doctorUserId) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));

        List<Patient> patients = appointmentRepository.findDistinctPatientsByDoctorId(doctor.getId());

        return patients.stream().map(patient -> {
            List<Appointment> appointments = appointmentRepository.findByDoctorIdAndPatientId(
                    doctor.getId(), patient.getId());

            boolean hasUpcoming = appointments.stream()
                    .anyMatch(a -> (a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.CONFIRMED)
                            && !a.getAppointmentDate().isBefore(LocalDate.now()));

            String lastVisit = appointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .findFirst()
                    .map(a -> a.getAppointmentDate().toString())
                    .orElse(null);

            return DoctorPatientResponse.builder()
                    .id(patient.getId())
                    .fullName(patient.getFullName())
                    .email(patient.getUser().getEmail())
                    .phone(patient.getUser().getPhone())
                    .profileImage(patient.getProfileImage())
                    .gender(patient.getGender() != null ? patient.getGender().name() : null)
                    .bloodGroup(patient.getBloodGroup())
                    .allergies(patient.getAllergies())
                    .medicalConditions(patient.getMedicalConditions())
                    .dateOfBirth(patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null)
                    .totalVisits((int) appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count())
                    .lastVisitDate(lastVisit)
                    .status(hasUpcoming ? "ACTIVE" : "PAST")
                    .build();
        }).collect(Collectors.toList());
    }

    public DoctorPatientResponse getDoctorPatientDetail(java.util.UUID doctorUserId, java.util.UUID patientId) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));

        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndPatientId(
                doctor.getId(), patientId);

        if (appointments.isEmpty()) {
            throw new ResourceNotFoundException("Patient", "id", patientId);
        }

        Patient patient = appointments.get(0).getPatient();

        boolean hasUpcoming = appointments.stream()
                .anyMatch(a -> (a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.CONFIRMED)
                        && !a.getAppointmentDate().isBefore(LocalDate.now()));

        String lastVisit = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .findFirst()
                .map(a -> a.getAppointmentDate().toString())
                .orElse(null);

        List<DoctorPatientResponse.VisitSummary> visits = appointments.stream().map(a -> {
            Consultation consultation = a.getConsultation();
            List<DoctorPatientResponse.PrescriptionSummary> prescriptions = new java.util.ArrayList<>();
            String diagnosis = null;

            if (consultation != null) {
                diagnosis = consultation.getDiagnosis();
                prescriptions = consultation.getPrescriptions().stream()
                        .map(p -> DoctorPatientResponse.PrescriptionSummary.builder()
                                .medicationName(p.getMedicationName())
                                .dosage(p.getDosage())
                                .frequency(p.getFrequency())
                                .duration(p.getDuration())
                                .build())
                        .collect(Collectors.toList());
            }

            return DoctorPatientResponse.VisitSummary.builder()
                    .appointmentId(a.getId())
                    .appointmentDate(a.getAppointmentDate())
                    .slotTime(a.getSlotTime())
                    .consultationType(a.getConsultationType().name())
                    .status(a.getStatus().name())
                    .reason(a.getReason())
                    .diagnosis(diagnosis)
                    .prescriptions(prescriptions)
                    .build();
        }).collect(Collectors.toList());

        return DoctorPatientResponse.builder()
                .id(patient.getId())
                .fullName(patient.getFullName())
                .email(patient.getUser().getEmail())
                .phone(patient.getUser().getPhone())
                .profileImage(patient.getProfileImage())
                .gender(patient.getGender() != null ? patient.getGender().name() : null)
                .bloodGroup(patient.getBloodGroup())
                .allergies(patient.getAllergies())
                .medicalConditions(patient.getMedicalConditions())
                .dateOfBirth(patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null)
                .totalVisits((int) appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count())
                .lastVisitDate(lastVisit)
                .status(hasUpcoming ? "ACTIVE" : "PAST")
                .visits(visits)
                .build();
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
