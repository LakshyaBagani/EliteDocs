package com.doconsult.server.repository;

import com.doconsult.server.model.Appointment;
import com.doconsult.server.model.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, java.util.UUID> {

        Page<Appointment> findByDoctorId(java.util.UUID doctorId, Pageable pageable);

        Page<Appointment> findByPatientId(java.util.UUID patientId, Pageable pageable);

        Page<Appointment> findByDoctorIdAndStatus(java.util.UUID doctorId, AppointmentStatus status, Pageable pageable);

        Page<Appointment> findByPatientIdAndStatus(java.util.UUID patientId, AppointmentStatus status,
                        Pageable pageable);

        List<Appointment> findByDoctorIdAndAppointmentDate(java.util.UUID doctorId, LocalDate date);

        @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
                        "AND a.appointmentDate = :date " +
                        "AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
        List<Appointment> findActiveAppointmentsByDoctorAndDate(
                        @Param("doctorId") java.util.UUID doctorId,
                        @Param("date") LocalDate date);

        boolean existsByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(
                        java.util.UUID doctorId,
                        LocalDate appointmentDate,
                        LocalTime slotTime,
                        AppointmentStatus status);

        @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
                        "AND a.appointmentDate = :date " +
                        "AND a.status = 'CONFIRMED' " +
                        "ORDER BY a.slotTime")
        List<Appointment> findTodayAppointments(
                        @Param("doctorId") java.util.UUID doctorId,
                        @Param("date") LocalDate date);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
        long countByDoctorAndStatus(@Param("doctorId") java.util.UUID doctorId,
                        @Param("status") AppointmentStatus status);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
        long countByStatus(@Param("status") AppointmentStatus status);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date")
        long countByDate(@Param("date") LocalDate date);

        List<Appointment> findByAppointmentDateBeforeAndStatusIn(LocalDate date, List<AppointmentStatus> statuses);
}
