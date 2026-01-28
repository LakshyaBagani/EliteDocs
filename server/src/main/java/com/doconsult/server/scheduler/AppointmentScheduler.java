package com.doconsult.server.scheduler;

import com.doconsult.server.model.Appointment;
import com.doconsult.server.model.AppointmentStatus;
import com.doconsult.server.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentScheduler {

    private final AppointmentRepository appointmentRepository;

    /**
     * Runs daily at midnight to cancel expired appointments.
     * Finds appointments that are scheduled before today and are still
     * in PENDING or CONFIRMED status.
     */
    @Scheduled(cron = "0 0 0 * * *") // Daily at midnight
    @Transactional
    public void cancelExpiredAppointments() {
        log.info("Running job to cancel expired appointments...");

        LocalDate today = LocalDate.now();
        List<AppointmentStatus> activeStatuses = Arrays.asList(
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED);

        List<Appointment> expiredAppointments = appointmentRepository
                .findByAppointmentDateBeforeAndStatusIn(today, activeStatuses);

        if (expiredAppointments.isEmpty()) {
            log.info("No expired appointments found.");
            return;
        }

        log.info("Found {} expired appointments. Cancelling them...", expiredAppointments.size());

        for (Appointment appointment : expiredAppointments) {
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointment.setCancellationReason("System: Auto-cancelled due to expiration (Date passed)");
            // Note: We're not sending emails here to avoid spamming users for old
            // appointments,
            // but in a real system we might want to notify them.
        }

        appointmentRepository.saveAll(expiredAppointments);
        log.info("Successfully cancelled {} expired appointments.", expiredAppointments.size());
    }
}
