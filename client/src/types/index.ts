// API Types for DocConsult

export interface User {
    id: string;
    email: string;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
    firstName: string;
    lastName: string;
    profileCompleted: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export interface Doctor {
    id: string;
    userId: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    fullName: string;
    specialization: string;
    qualification: string;
    experienceYears: number;
    consultationFeeOnline: number;
    consultationFeeClinic: number;
    licenseNumber: string;
    bio: string;
    profileImage: string;
    clinicName: string;
    clinicAddress: string;
    isVerified: boolean;
    isAvailableOnline: boolean;
    isAvailableClinic: boolean;
    averageRating: number;
    totalReviews: number;
    availabilities: Availability[];
}

export interface Availability {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
}

export interface Patient {
    id: string;
    userId: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    bloodGroup: string;
    address: string;
    emergencyContact: string;
    profileImage: string;
    allergies: string;
    medicalConditions: string;
}

export interface Appointment {
    id: string;
    appointmentDate: string;
    slotTime: string;
    consultationType: "ONLINE" | "CLINIC";
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    reason: string;
    symptoms: string;
    feeAmount: number;
    isPaid: boolean;
    paymentId: string;
    meetingLink: string;
    cancellationReason: string;
    createdAt: string;
    doctor: {
        id: string;
        fullName: string;
        specialization: string;
        profileImage: string;
        clinicAddress: string;
    };
    patient: {
        id: string;
        fullName: string;
        phone: string;
        profileImage: string;
    };
    consultation?: Consultation;
}

export interface Consultation {
    id: string;
    appointmentId: string;
    symptoms: string;
    diagnosis: string;
    notes: string;
    vitals: string;
    followUpDate: string;
    createdAt: string;
    prescriptions: Prescription[];
}

export interface Prescription {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface Review {
    id: string;
    doctorId: string;
    appointmentId: string;
    rating: number;
    comment: string;
    createdAt: string;
    patient: {
        id: string;
        fullName: string;
        profileImage: string;
    };
}

export interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    errors?: Record<string, string>;
}

export interface Analytics {
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalRevenue: number;
    doctorTotalPatients: number;
    doctorTodayAppointments: number;
    doctorCompletedConsultations: number;
    doctorTotalEarnings: number;
    doctorAverageRating: number;
    doctorTotalReviews: number;
}
