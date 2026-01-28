package com.doconsult.server.service;

import com.doconsult.server.dto.request.ConsultationRequest;
import com.doconsult.server.dto.response.ConsultationResponse;
import com.doconsult.server.exception.BadRequestException;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.*;
import com.doconsult.server.repository.AppointmentRepository;
import com.doconsult.server.repository.ConsultationRepository;
import com.doconsult.server.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final EmailService emailService;

    @Transactional
    public ConsultationResponse createConsultation(java.util.UUID doctorUserId, ConsultationRequest request) {
        // Verify doctor
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));

        // Get appointment
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        // Verify this appointment belongs to the doctor
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("This appointment does not belong to you");
        }

        // Check if consultation already exists
        if (consultationRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new BadRequestException("Consultation already exists for this appointment");
        }

        // Create consultation
        Consultation consultation = Consultation.builder()
                .appointment(appointment)
                .symptoms(request.getSymptoms())
                .diagnosis(request.getDiagnosis())
                .notes(request.getNotes())
                .vitals(request.getVitals())
                .followUpDate(request.getFollowUpDate())
                .build();

        // Add prescriptions if provided
        if (request.getPrescriptions() != null && !request.getPrescriptions().isEmpty()) {
            for (ConsultationRequest.PrescriptionRequest prescRequest : request.getPrescriptions()) {
                Prescription prescription = Prescription.builder()
                        .consultation(consultation)
                        .medicationName(prescRequest.getMedicationName())
                        .dosage(prescRequest.getDosage())
                        .frequency(prescRequest.getFrequency())
                        .duration(prescRequest.getDuration())
                        .instructions(prescRequest.getInstructions())
                        .build();
                consultation.getPrescriptions().add(prescription);
            }
        }

        consultation = consultationRepository.save(consultation);

        // Update appointment status to completed
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Send consultation summary email
        try {
            emailService.sendConsultationSummary(consultation);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToResponse(consultation);
    }

    public ConsultationResponse getConsultationById(java.util.UUID consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", consultationId));
        return mapToResponse(consultation);
    }

    public ConsultationResponse getConsultationByAppointmentId(java.util.UUID appointmentId) {
        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "appointmentId", appointmentId));
        return mapToResponse(consultation);
    }

    @Transactional
    public ConsultationResponse updateConsultation(java.util.UUID consultationId, java.util.UUID doctorUserId,
            ConsultationRequest request) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", consultationId));

        // Verify this consultation belongs to the doctor
        if (!consultation.getAppointment().getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("This consultation does not belong to you");
        }

        consultation.setSymptoms(request.getSymptoms());
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setNotes(request.getNotes());
        consultation.setVitals(request.getVitals());
        consultation.setFollowUpDate(request.getFollowUpDate());

        // Update prescriptions
        if (request.getPrescriptions() != null) {
            consultation.getPrescriptions().clear();
            for (ConsultationRequest.PrescriptionRequest prescRequest : request.getPrescriptions()) {
                Prescription prescription = Prescription.builder()
                        .consultation(consultation)
                        .medicationName(prescRequest.getMedicationName())
                        .dosage(prescRequest.getDosage())
                        .frequency(prescRequest.getFrequency())
                        .duration(prescRequest.getDuration())
                        .instructions(prescRequest.getInstructions())
                        .build();
                consultation.getPrescriptions().add(prescription);
            }
        }

        consultation = consultationRepository.save(consultation);
        return mapToResponse(consultation);
    }

    private ConsultationResponse mapToResponse(Consultation consultation) {
        List<ConsultationResponse.PrescriptionResponse> prescriptions = consultation.getPrescriptions().stream()
                .map(p -> ConsultationResponse.PrescriptionResponse.builder()
                        .id(p.getId())
                        .medicationName(p.getMedicationName())
                        .dosage(p.getDosage())
                        .frequency(p.getFrequency())
                        .duration(p.getDuration())
                        .instructions(p.getInstructions())
                        .build())
                .collect(Collectors.toList());

        return ConsultationResponse.builder()
                .id(consultation.getId())
                .appointmentId(consultation.getAppointment().getId())
                .symptoms(consultation.getSymptoms())
                .diagnosis(consultation.getDiagnosis())
                .notes(consultation.getNotes())
                .vitals(consultation.getVitals())
                .followUpDate(consultation.getFollowUpDate())
                .createdAt(consultation.getCreatedAt())
                .prescriptions(prescriptions)
                .build();
    }
}
