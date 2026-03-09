package com.doconsult.server.service;

import com.doconsult.server.exception.BadRequestException;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.Appointment;
import com.doconsult.server.model.AppointmentStatus;
import com.doconsult.server.repository.AppointmentRepository;
import com.doconsult.server.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoCallService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public Appointment startCall(UUID appointmentId, UUID doctorUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        // Verify doctor owns this appointment
        var doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("You can only start calls for your own appointments");
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED
                && appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
            throw new BadRequestException("Only confirmed or in-progress appointments can start a video call");
        }

        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment endCall(UUID appointmentId, UUID doctorUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        var doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", doctorUserId));
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("You can only end calls for your own appointments");
        }

        if (appointment.getStatus() == AppointmentStatus.IN_PROGRESS) {
            appointment.setStatus(AppointmentStatus.CONFIRMED);
            return appointmentRepository.save(appointment);
        }

        return appointment;
    }

    public void validateParticipant(UUID appointmentId, UUID userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);
        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);

        if (!isDoctor && !isPatient) {
            throw new BadRequestException("You are not a participant of this appointment");
        }
    }
}
