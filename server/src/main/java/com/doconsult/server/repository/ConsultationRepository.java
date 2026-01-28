package com.doconsult.server.repository;

import com.doconsult.server.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, java.util.UUID> {

    Optional<Consultation> findByAppointmentId(java.util.UUID appointmentId);
}
