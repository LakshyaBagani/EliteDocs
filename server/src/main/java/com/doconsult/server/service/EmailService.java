package com.doconsult.server.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailService {

    @Value("${app.brevo.api-key}")
    private String brevoApiKey;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private static final String SENDER_NAME = "EliteDocs";
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private void sendEmail(String to, String subject, String htmlContent) {
        String jsonBody = """
                {
                    "sender": {"email": "%s", "name": "%s"},
                    "to": [{"email": "%s"}],
                    "subject": "%s",
                    "htmlContent": %s
                }
                """.formatted(senderEmail, SENDER_NAME, to, subject, escapeJson(htmlContent));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BREVO_API_URL))
                .header("api-key", brevoApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent to {}: {}", to, subject);
            } else {
                log.error("Failed to send email to {}. Status: {}, Body: {}", to, response.statusCode(), response.body());
                throw new RuntimeException("Failed to send email: " + response.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Email sending interrupted", e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String escapeJson(String html) {
        return "\"" + html
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }

    public void sendOtpEmail(String to, String otp) {
        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
                        .container { width: 100%%; padding: 20px 0; background-color: #ffffff; }
                        .card { background-color: #ffffff; width: 400px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }
                        @media only screen and (max-width: 480px) { .card { width: 90%% !important; border: none !important; } }
                        .logo { color: #4f46e5; font-size: 24px; font-weight: 700; margin-bottom: 24px; display: inline-block; text-decoration: none; }
                        .h1 { color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 8px; }
                        .text { color: #71717a; font-size: 16px; line-height: 24px; margin-bottom: 32px; }
                        .otp-box { background-color: #f5f3ff; color: #4f46e5; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; border-radius: 12px; display: inline-block; margin-bottom: 32px; border: 1px solid #ddd6fe; }
                        .footer { color: #a1a1aa; font-size: 12px; margin-top: 32px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">EliteDocs<span style="color:#4f46e5">+</span></div>
                            <h1 class="h1">Verify Your Email</h1>
                            <p class="text">Use the code below to complete your registration. This code is valid for 10 minutes.</p>
                            <div class="otp-box">%s</div>
                            <p class="text" style="margin-bottom: 0; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                            <div class="footer">&copy; 2025 EliteDocs. All rights reserved.</div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(otp);

        sendEmail(to, "Verify Your Email - EliteDocs", htmlContent);
    }

    public void sendAppointmentConfirmation(String to, String patientName, String doctorName,
            LocalDateTime appointmentTime) {
        String formattedDate = appointmentTime.format(DateTimeFormatter.ofPattern("EEE, MMM d"));
        String formattedTime = appointmentTime.format(DateTimeFormatter.ofPattern("h:mm a"));

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
                        .container { width: 100%%; padding: 20px 0; background-color: #ffffff; }
                        .card { background-color: #ffffff; width: 450px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }
                        @media only screen and (max-width: 480px) { .card { width: 90%% !important; border: none !important; } }
                        .logo { color: #4f46e5; font-size: 24px; font-weight: 700; margin-bottom: 30px; display: inline-block; }
                        .success-icon { background-color: #dcfce7; color: #16a34a; width: 64px; height: 64px; border-radius: 50%%; display: inline-block; line-height: 64px; text-align: center; font-size: 32px; margin: 0 auto 24px auto; }
                        .h1 { color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 32px; }
                        .details-grid { background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; border: 1px solid #e2e8f0; }
                        .grid-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
                        .grid-row:last-child { border-bottom: none; }
                        .label { color: #64748b; font-size: 14px; font-weight: 500; }
                        .value { color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; }
                        .notice-box { background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 32px; display: block; text-align: left; }
                        .notice-text { color: #1e40af; font-size: 14px; line-height: 20px; font-weight: 500; }
                        .btn { background-color: #4f46e5; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; }
                        .footer { color: #94a3b8; font-size: 12px; margin-top: 32px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">EliteDocs<span style="color:#4f46e5">+</span></div>
                            <div class="success-icon">&#10003;</div>
                            <h1 class="h1">Appointment Confirmed!</h1>
                            <div class="details-grid">
                                <div class="grid-row">
                                    <span class="label">Doctor</span>
                                    <span class="value">Dr. %s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">Date</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">Time</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>
                            <div class="notice-box">
                                <span class="notice-text">Please be ready 10 minutes before the scheduled time to ensure a smooth consultation setup.</span>
                            </div>
                            <a href="http://localhost:5173/patient/dashboard" class="btn">View Appointment</a>
                            <div class="footer">&copy; 2025 EliteDocs. All rights reserved.</div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(doctorName, formattedDate, formattedTime);

        sendEmail(to, "Appointment Confirmed - EliteDocs", htmlContent);
    }

    public void sendNewAppointmentNotification(String doctorEmail, String doctorName, String patientName,
            java.time.LocalDate appointmentDate, java.time.LocalTime slotTime,
            String consultationType, String reason, java.util.UUID appointmentId) {
        String formattedDate = appointmentDate.format(DateTimeFormatter.ofPattern("EEE, MMM d, yyyy"));
        String formattedTime = slotTime.format(DateTimeFormatter.ofPattern("h:mm a"));
        String confirmUrl = "http://localhost:5173/doctor/appointments?action=confirm&id=" + appointmentId;
        String rejectUrl = "http://localhost:5173/doctor/appointments?action=reject&id=" + appointmentId;

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
                        .container { width: 100%%; padding: 20px 0; background-color: #ffffff; }
                        .card { background-color: #ffffff; width: 450px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }
                        @media only screen and (max-width: 480px) { .card { width: 90%% !important; border: none !important; } }
                        .logo { color: #4f46e5; font-size: 24px; font-weight: 700; margin-bottom: 30px; display: inline-block; }
                        .new-icon { background-color: #dbeafe; color: #2563eb; width: 64px; height: 64px; border-radius: 50%%; display: inline-block; line-height: 64px; text-align: center; font-size: 32px; margin: 0 auto 24px auto; }
                        .h1 { color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 8px; }
                        .subtitle { color: #71717a; font-size: 16px; margin-bottom: 32px; }
                        .details-grid { background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; border: 1px solid #e2e8f0; }
                        .grid-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
                        .grid-row:last-child { border-bottom: none; }
                        .label { color: #64748b; font-size: 14px; font-weight: 500; }
                        .value { color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; }
                        .reason-box { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 32px; text-align: left; }
                        .reason-label { color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
                        .reason-text { color: #78350f; font-size: 14px; line-height: 20px; }
                        .btn-group { margin-bottom: 32px; }
                        .btn-confirm { background-color: #16a34a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; margin-right: 12px; }
                        .btn-reject { background-color: #dc2626; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; }
                        .footer { color: #94a3b8; font-size: 12px; margin-top: 32px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">EliteDocs<span style="color:#4f46e5">+</span></div>
                            <div class="new-icon">&#128197;</div>
                            <h1 class="h1">New Appointment Request</h1>
                            <p class="subtitle">A patient has requested an appointment with you.</p>
                            <div class="details-grid">
                                <div class="grid-row">
                                    <span class="label">Patient</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">Date</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">Time</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">Type</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>
                            %s
                            <div class="btn-group">
                                <a href="%s" class="btn-confirm">&#10003; Confirm</a>
                                <a href="%s" class="btn-reject">&#10007; Reject</a>
                            </div>
                            <p style="color: #71717a; font-size: 13px;">You can also manage this appointment from your dashboard.</p>
                            <div class="footer">&copy; 2025 EliteDocs. All rights reserved.</div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                patientName,
                formattedDate,
                formattedTime,
                consultationType,
                reason != null && !reason.isEmpty()
                        ? "<div class=\"reason-box\"><span class=\"reason-label\">Reason for Visit</span><span class=\"reason-text\">" + reason + "</span></div>"
                        : "",
                confirmUrl,
                rejectUrl);

        sendEmail(doctorEmail, "New Appointment Request - EliteDocs", htmlContent);
    }

    public void sendRescheduleNotification(String doctorEmail, String doctorName, String patientName,
            java.time.LocalDate appointmentDate, java.time.LocalTime slotTime,
            String consultationType, String reason, java.util.UUID appointmentId) {
        String formattedDate = appointmentDate.format(DateTimeFormatter.ofPattern("EEE, MMM d, yyyy"));
        String formattedTime = slotTime.format(DateTimeFormatter.ofPattern("h:mm a"));
        String confirmUrl = "http://localhost:5173/doctor/appointments?action=confirm&id=" + appointmentId;
        String rejectUrl = "http://localhost:5173/doctor/appointments?action=reject&id=" + appointmentId;

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
                        .container { width: 100%%; padding: 20px 0; background-color: #ffffff; }
                        .card { background-color: #ffffff; width: 450px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }
                        @media only screen and (max-width: 480px) { .card { width: 90%% !important; border: none !important; } }
                        .logo { color: #4f46e5; font-size: 24px; font-weight: 700; margin-bottom: 30px; display: inline-block; }
                        .reschedule-icon { background-color: #fef3c7; color: #d97706; width: 64px; height: 64px; border-radius: 50%%; display: inline-block; line-height: 64px; text-align: center; font-size: 32px; margin: 0 auto 24px auto; }
                        .h1 { color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 8px; }
                        .subtitle { color: #71717a; font-size: 16px; margin-bottom: 32px; }
                        .details-grid { background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; border: 1px solid #e2e8f0; }
                        .grid-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
                        .grid-row:last-child { border-bottom: none; }
                        .label { color: #64748b; font-size: 14px; font-weight: 500; }
                        .value { color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; }
                        .reason-box { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 32px; text-align: left; }
                        .reason-label { color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
                        .reason-text { color: #78350f; font-size: 14px; line-height: 20px; }
                        .btn-group { margin-bottom: 32px; }
                        .btn-confirm { background-color: #16a34a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; margin-right: 12px; }
                        .btn-reject { background-color: #dc2626; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; }
                        .footer { color: #94a3b8; font-size: 12px; margin-top: 32px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">EliteDocs<span style="color:#4f46e5">+</span></div>
                            <div class="reschedule-icon">&#128260;</div>
                            <h1 class="h1">Appointment Reschedule Request</h1>
                            <p class="subtitle">A patient has requested to reschedule their appointment.</p>
                            <div class="details-grid">
                                <div class="grid-row">
                                    <span class="label">Patient</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">New Date</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">New Time</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="grid-row">
                                    <span class="label">Type</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>
                            %s
                            <div class="btn-group">
                                <a href="%s" class="btn-confirm">&#10003; Confirm</a>
                                <a href="%s" class="btn-reject">&#10007; Reject</a>
                            </div>
                            <p style="color: #71717a; font-size: 13px;">You can also manage this appointment from your dashboard.</p>
                            <div class="footer">&copy; 2025 EliteDocs. All rights reserved.</div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                patientName,
                formattedDate,
                formattedTime,
                consultationType,
                reason != null && !reason.isEmpty()
                        ? "<div class=\"reason-box\"><span class=\"reason-label\">Reason for Visit</span><span class=\"reason-text\">" + reason + "</span></div>"
                        : "",
                confirmUrl,
                rejectUrl);

        sendEmail(doctorEmail, "Appointment Reschedule Request - EliteDocs", htmlContent);
    }

    public void sendConsultationSummary(com.doconsult.server.model.Consultation consultation) {
        String to = consultation.getAppointment().getPatient().getUser().getEmail();
        String patientName = consultation.getAppointment().getPatient().getFullName();
        String doctorName = consultation.getAppointment().getDoctor().getFullName();
        String diagnosis = consultation.getDiagnosis();

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
                        .container { width: 100%%; padding: 20px 0; background-color: #ffffff; }
                        .card { background-color: #ffffff; width: 450px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: left; }
                        @media only screen and (max-width: 480px) { .card { width: 90%% !important; border: none !important; } }
                        .logo { color: #4f46e5; font-size: 24px; font-weight: 700; margin-bottom: 24px; display: inline-block; }
                        .h1 { color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 24px; }
                        .text { color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px; }
                        .highlight { font-weight: 600; color: #111827; }
                        .diagnosis-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
                        .diagnosis-label { color: #166534; font-size: 14px; font-weight: 600; margin-bottom: 4px; display: block; }
                        .diagnosis-text { color: #14532d; font-size: 16px; font-weight: 500; }
                        .btn { background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 14px; }
                        .footer { color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">EliteDocs<span style="color:#4f46e5">+</span></div>
                            <h1 class="h1">Consultation Summary</h1>
                            <p class="text">Dear <span class="highlight">%s</span>,</p>
                            <p class="text">Your consultation with <span class="highlight">Dr. %s</span> has been completed.</p>
                            <div class="diagnosis-box">
                                <span class="diagnosis-label">Diagnosis</span>
                                <span class="diagnosis-text">%s</span>
                            </div>
                            <p class="text">You can view your full prescription and details in your dashboard.</p>
                            <a href="http://localhost:5173/patient/dashboard" class="btn">View Full Details</a>
                            <div class="footer">&copy; 2025 EliteDocs. All rights reserved.</div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(patientName, doctorName, diagnosis);

        sendEmail(to, "Consultation Summary - EliteDocs", htmlContent);
    }
}
