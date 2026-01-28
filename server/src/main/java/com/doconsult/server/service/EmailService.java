package com.doconsult.server.service;

import com.doconsult.server.model.Appointment;
import com.doconsult.server.model.Consultation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@doconsult.com}")
    private String fromEmail;

    @Async
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(appointment.getPatient().getUser().getEmail());
            message.setSubject("Appointment Confirmation - DocConsult");

            String body = "Dear " + appointment.getPatient().getFullName() + ",\n\n" +
                    "Your appointment has been booked!\n\n" +
                    "Doctor: Dr. " + appointment.getDoctor().getFullName() + "\n" +
                    "Date: " + appointment.getAppointmentDate() + "\n" +
                    "Time: " + appointment.getSlotTime() + "\n" +
                    "Type: " + appointment.getConsultationType() + "\n\n" +
                    "Thank you!\nDocConsult Team";

            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Async
    public void sendPaymentConfirmation(Appointment appointment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(appointment.getPatient().getUser().getEmail());
            message.setSubject("Payment Confirmed - DocConsult");
            message.setText("Payment of ₹" + appointment.getFeeAmount() + " confirmed.");
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Async
    public void sendConsultationSummary(Consultation consultation) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(consultation.getAppointment().getPatient().getUser().getEmail());
            message.setSubject("Consultation Summary - DocConsult");
            message.setText("Diagnosis: " + consultation.getDiagnosis());
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
