package com.doconsult.server.repository;

import com.doconsult.server.model.MedicalDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, java.util.UUID> {

    Page<MedicalDocument> findByPatientId(java.util.UUID patientId, Pageable pageable);

    Page<MedicalDocument> findByPatientIdAndDocumentType(java.util.UUID patientId, String documentType,
            Pageable pageable);
}
