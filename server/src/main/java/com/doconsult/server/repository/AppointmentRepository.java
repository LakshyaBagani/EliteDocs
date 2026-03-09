package com.doconsult.server.repository;

import com.doconsult.server.model.Appointment;
import com.doconsult.server.model.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

        @Query(value = "SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.user JOIN FETCH a.patient p JOIN FETCH p.user WHERE a.doctor.id = :doctorId",
               countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId")
        Page<Appointment> findByDoctorId(@Param("doctorId") UUID doctorId, Pageable pageable);

        @Query(value = "SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.user JOIN FETCH a.patient p JOIN FETCH p.user WHERE a.patient.id = :patientId",
               countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.patient.id = :patientId")
        Page<Appointment> findByPatientId(@Param("patientId") UUID patientId, Pageable pageable);

        @Query(value = "SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.user JOIN FETCH a.patient p JOIN FETCH p.user WHERE a.doctor.id = :doctorId AND a.status = :status",
               countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
        Page<Appointment> findByDoctorIdAndStatus(@Param("doctorId") UUID doctorId, @Param("status") AppointmentStatus status, Pageable pageable);

        @Query(value = "SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.user JOIN FETCH a.patient p JOIN FETCH p.user WHERE a.patient.id = :patientId AND a.status = :status",
               countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.patient.id = :patientId AND a.status = :status")
        Page<Appointment> findByPatientIdAndStatus(@Param("patientId") UUID patientId, @Param("status") AppointmentStatus status,
                        Pageable pageable);

        List<Appointment> findByDoctorIdAndAppointmentDate(UUID doctorId, LocalDate date);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.user JOIN FETCH a.patient p JOIN FETCH p.user WHERE a.doctor.id = :doctorId " +
                        "AND a.appointmentDate = :date " +
                        "AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
        List<Appointment> findActiveAppointmentsByDoctorAndDate(
                        @Param("doctorId") UUID doctorId,
                        @Param("date") LocalDate date);

        boolean existsByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(
                        UUID doctorId,
                        LocalDate appointmentDate,
                        LocalTime slotTime,
                        AppointmentStatus status);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.user JOIN FETCH a.patient p JOIN FETCH p.user WHERE a.doctor.id = :doctorId " +
                        "AND a.appointmentDate = :date " +
                        "AND a.status = 'CONFIRMED' " +
                        "ORDER BY a.slotTime")
        List<Appointment> findTodayAppointments(
                        @Param("doctorId") UUID doctorId,
                        @Param("date") LocalDate date);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
        long countByDoctorAndStatus(@Param("doctorId") UUID doctorId,
                        @Param("status") AppointmentStatus status);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
        long countByStatus(@Param("status") AppointmentStatus status);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date")
        long countByDate(@Param("date") LocalDate date);

        List<Appointment> findByAppointmentDateBeforeAndStatusIn(LocalDate date, List<AppointmentStatus> statuses);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.patient.id = :patientId " +
                        "AND a.doctor.id = :doctorId " +
                        "AND a.status IN ('PENDING', 'CONFIRMED') " +
                        "ORDER BY a.appointmentDate DESC")
        List<Appointment> findActiveByPatientAndDoctor(
                        @Param("patientId") UUID patientId,
                        @Param("doctorId") UUID doctorId);

        @Query("SELECT a.slotTime FROM Appointment a WHERE a.doctor.id = :doctorId " +
                        "AND a.appointmentDate = :date " +
                        "AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
        List<LocalTime> findBookedSlotsByDoctorAndDate(
                        @Param("doctorId") UUID doctorId,
                        @Param("date") LocalDate date);

        @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient", "patient.user"})
        Optional<Appointment> findById(UUID id);

        @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
        List<com.doconsult.server.model.Patient> findDistinctPatientsByDoctorId(@Param("doctorId") java.util.UUID doctorId);

        @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.consultation WHERE a.doctor.id = :doctorId AND a.patient.id = :patientId ORDER BY a.appointmentDate DESC, a.slotTime DESC")
        List<Appointment> findByDoctorIdAndPatientId(@Param("doctorId") java.util.UUID doctorId, @Param("patientId") java.util.UUID patientId);
}
