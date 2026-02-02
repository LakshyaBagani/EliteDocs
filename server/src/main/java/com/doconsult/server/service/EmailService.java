package com.doconsult.server.service;

import sendinblue.ApiClient;
import sendinblue.ApiException;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;

@Service
@Slf4j
public class EmailService {

    @Value("${app.brevo.api-key}")
    private String brevoApiKey;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private static final String SENDER_NAME = "DocConsult";

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    private TransactionalEmailsApi apiInstance;

    private TransactionalEmailsApi getApiInstance() {
        if (apiInstance == null) {
            ApiClient defaultClient = Configuration.getDefaultApiClient();
            ApiKeyAuth apiKey = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
            apiKey.setApiKey(brevoApiKey);
            apiInstance = new TransactionalEmailsApi();
        }
        return apiInstance;
    }

    public void sendOtpEmail(String to, String otp) {
        SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();

        SendSmtpEmailSender sender = new SendSmtpEmailSender();
        sender.setEmail(senderEmail);
        sender.setName(SENDER_NAME);
        sendSmtpEmail.setSender(sender);

        SendSmtpEmailTo recipient = new SendSmtpEmailTo();
        recipient.setEmail(to);
        sendSmtpEmail.setTo(Collections.singletonList(recipient));

        sendSmtpEmail.setSubject("Verify Your Email - EliteDocs");

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

                            <div class="footer">
                                &copy; 2024 EliteDocs. All rights reserved.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(otp);

        sendSmtpEmail.setHtmlContent(htmlContent);

        try {
            getApiInstance().sendTransacEmail(sendSmtpEmail);
            log.info("OTP email sent to {}", to);
        } catch (ApiException e) {
            log.error("Failed to send OTP email. Code: {}, Body: {}", e.getCode(), e.getResponseBody(), e);
            throw new RuntimeException("Failed to send email: " + e.getResponseBody());
        }
    }

    public void sendAppointmentConfirmation(String to, String patientName, String doctorName,
            LocalDateTime appointmentTime) {
        SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();

        SendSmtpEmailSender sender = new SendSmtpEmailSender();
        sender.setEmail(senderEmail);
        sender.setName(SENDER_NAME);
        sendSmtpEmail.setSender(sender);

        SendSmtpEmailTo recipient = new SendSmtpEmailTo();
        recipient.setEmail(to);
        sendSmtpEmail.setTo(Collections.singletonList(recipient));

        sendSmtpEmail.setSubject("Appointment Confirmed - EliteDocs");

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
                        .notice-icon { color: #3b82f6; font-size: 18px; margin-right: 8px; vertical-align: middle; display: inline-block; }
                        .notice-text { color: #1e40af; font-size: 14px; line-height: 20px; font-weight: 500; vertical-align: middle; display: inline-block; width: 85%%; }
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
                                <span class="notice-icon">&#9200;</span>
                                <span class="notice-text">Please be ready 10 minutes before the scheduled time to ensure a smooth consultation setup.</span>
                            </div>

                            <a href="http://localhost:5173/patient/dashboard" class="btn">View Appointment</a>

                            <div class="footer">
                                &copy; 2024 EliteDocs. All rights reserved.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(doctorName, formattedDate, formattedTime);

        sendSmtpEmail.setHtmlContent(htmlContent);

        try {
            getApiInstance().sendTransacEmail(sendSmtpEmail);
            log.info("Confirmation email sent to {}", to);
        } catch (ApiException e) {
            log.error("Failed to send confirmation email", e);
        }
    }

    public void sendConsultationSummary(com.doconsult.server.model.Consultation consultation) {
        SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();

        SendSmtpEmailSender sender = new SendSmtpEmailSender();
        sender.setEmail(senderEmail);
        sender.setName(SENDER_NAME);
        sendSmtpEmail.setSender(sender);

        SendSmtpEmailTo recipient = new SendSmtpEmailTo();
        recipient.setEmail(consultation.getAppointment().getPatient().getUser().getEmail());
        sendSmtpEmail.setTo(Collections.singletonList(recipient));

        sendSmtpEmail.setSubject("Consultation Summary - EliteDocs");

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

                            <a href="http://localhost:5173/patient/auth" class="btn">View Full Details</a>

                            <div class="footer">
                                &copy; 2024 EliteDocs. All rights reserved.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        consultation.getAppointment().getPatient().getFullName(),
                        consultation.getAppointment().getDoctor().getFullName(),
                        consultation.getDiagnosis());

        sendSmtpEmail.setHtmlContent(htmlContent);

        try {
            getApiInstance().sendTransacEmail(sendSmtpEmail);
            log.info("Consultation summary email sent to {}",
                    consultation.getAppointment().getPatient().getUser().getEmail());
        } catch (ApiException e) {
            log.error("Failed to send consultation summary email", e);
        }
    }
}
