package com.doconsult.server.repository;

import com.doconsult.server.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, java.util.UUID> {

    Page<Review> findByDoctorId(java.util.UUID doctorId, Pageable pageable);

    Page<Review> findByPatientId(java.util.UUID patientId, Pageable pageable);

    Optional<Review> findByAppointmentId(java.util.UUID appointmentId);

    boolean existsByAppointmentId(java.util.UUID appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double calculateAverageRating(@Param("doctorId") java.util.UUID doctorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId")
    long countByDoctorId(@Param("doctorId") java.util.UUID doctorId);
}
