package com.doconsult.server.repository;

import com.doconsult.server.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, java.util.UUID> {

        Optional<Doctor> findByUserId(java.util.UUID userId);

        Page<Doctor> findByIsVerifiedTrue(Pageable pageable);

        Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);

        @Query("SELECT d FROM Doctor d WHERE d.isVerified = true " +
                        "AND (:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) "
                        +
                        "AND (:minFee IS NULL OR d.consultationFeeOnline >= :minFee) " +
                        "AND (:maxFee IS NULL OR d.consultationFeeOnline <= :maxFee) " +
                        "AND (:minRating IS NULL OR d.averageRating >= :minRating)")
        Page<Doctor> searchDoctors(
                        @Param("specialization") String specialization,
                        @Param("minFee") BigDecimal minFee,
                        @Param("maxFee") BigDecimal maxFee,
                        @Param("minRating") BigDecimal minRating,
                        Pageable pageable);

        @Query("SELECT DISTINCT d.specialization FROM Doctor d WHERE d.isVerified = true ORDER BY d.specialization")
        List<String> findAllSpecializations();

        @Query("SELECT d FROM Doctor d WHERE d.isVerified = true ORDER BY d.averageRating DESC")
        List<Doctor> findTopRatedDoctors(Pageable pageable);

        long countByIsVerifiedTrue();
}
