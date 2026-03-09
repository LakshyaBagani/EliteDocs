package com.doconsult.server.repository;

import com.doconsult.server.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

        @EntityGraph(attributePaths = {"user", "availabilities"})
        Optional<Doctor> findByUserId(UUID userId);

        @EntityGraph(attributePaths = {"user", "availabilities"})
        Page<Doctor> findByIsVerifiedTrue(Pageable pageable);

        @EntityGraph(attributePaths = {"user", "availabilities"})
        Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);

        @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.user LEFT JOIN FETCH d.availabilities WHERE d.isVerified = true " +
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

        @EntityGraph(attributePaths = {"user", "availabilities"})
        @Query("SELECT d FROM Doctor d WHERE d.isVerified = true ORDER BY d.averageRating DESC")
        List<Doctor> findTopRatedDoctors(Pageable pageable);

        long countByIsVerifiedTrue();
}
