package com.doconsult.server.repository;

import com.doconsult.server.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, java.util.UUID> {

    List<Prescription> findByConsultationId(java.util.UUID consultationId);
}
