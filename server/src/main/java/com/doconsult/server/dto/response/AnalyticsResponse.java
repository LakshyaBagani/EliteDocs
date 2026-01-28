package com.doconsult.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    // Admin dashboard stats
    private Long totalDoctors;
    private Long totalPatients;
    private Long totalAppointments;
    private Long todayAppointments;
    private Long pendingAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private BigDecimal totalRevenue;

    // Doctor specific stats
    private Long doctorTotalPatients;
    private Long doctorTodayAppointments;
    private Long doctorCompletedConsultations;
    private BigDecimal doctorTotalEarnings;
    private BigDecimal doctorAverageRating;
    private Long doctorTotalReviews;
}
