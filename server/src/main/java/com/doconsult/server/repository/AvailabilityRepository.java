package com.doconsult.server.repository;

import com.doconsult.server.model.Availability;
import com.doconsult.server.model.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, java.util.UUID> {

    List<Availability> findByDoctorIdAndIsActiveTrue(java.util.UUID doctorId);

    List<Availability> findByDoctorIdAndDayOfWeekAndIsActiveTrue(java.util.UUID doctorId, DayOfWeek dayOfWeek);

    void deleteByDoctorId(java.util.UUID doctorId);
}
