import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    DollarSign,
    Star,
    User,
    Users,
    Video,
    MapPin,
    ChevronRight,
} from "lucide-react";
import { analyticsService } from "../../services/analyticsService";
import { doctorService } from "../../services/doctorService";
import { appointmentService } from "../../services/appointmentService";
import type { Analytics, Doctor, Appointment } from "../../types";
import "./DoctorDashboard.css";

export const DoctorDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [profile, setProfile] = useState<Doctor | null>(null);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [analyticsData, profileData, appointmentsData] = await Promise.all([
                analyticsService.getDoctorDashboard(),
                doctorService.getOwnProfile(),
                appointmentService.getTodayAppointments(),
            ]);
            setAnalytics(analyticsData);
            setProfile(profileData);
            setTodayAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="doctor-dashboard">
                <div className="dashboard-container">
                    {/* Skeleton Header */}
                    <div className="dashboard-header">
                        <div>
                            <div className="skeleton-line" style={{ height: '2rem', width: '280px', marginBottom: '0.5rem' }} />
                            <div className="skeleton-line" style={{ height: '1rem', width: '220px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div className="skeleton" style={{ width: '120px', height: '44px', borderRadius: '0.75rem' }} />
                            <div className="skeleton" style={{ width: '140px', height: '44px', borderRadius: '0.75rem' }} />
                        </div>
                    </div>

                    {/* Skeleton Stats Grid */}
                    <div className="skeleton-stats-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton-stat-card">
                                <div className="skeleton-line short" />
                                <div className="skeleton-line xshort" style={{ height: '1.5rem' }} />
                            </div>
                        ))}
                    </div>

                    {/* Skeleton Content Grid */}
                    <div className="skeleton-content-grid">
                        <div className="skeleton-section-card">
                            <div className="skeleton-section-header">
                                <div className="skeleton-line" style={{ width: '140px', height: '1.25rem' }} />
                                <div className="skeleton-line" style={{ width: '100px', height: '1rem' }} />
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton-appointment-item">
                                    <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
                                    <div className="skeleton-info">
                                        <div className="skeleton-line medium" />
                                        <div className="skeleton-line short" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="skeleton-section-card">
                            <div className="skeleton-section-header">
                                <div className="skeleton-line" style={{ width: '120px', height: '1.25rem' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
                                <div className="skeleton-circle" style={{ width: '80px', height: '80px', marginBottom: '1rem' }} />
                                <div className="skeleton-line" style={{ width: '140px', height: '1.25rem', marginBottom: '0.5rem' }} />
                                <div className="skeleton-line" style={{ width: '100px', height: '1rem' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-dashboard">
            <div className="dashboard-container">
                {/* Header Section */}
                <div className="dashboard-header animate-fade-in">
                    <div>
                        <h1 className="dashboard-header__title">
                            Welcome back, <span>Dr. {profile?.lastName}</span>
                        </h1>
                        <p className="dashboard-header__subtitle">
                            Manage your appointments and patients here.
                        </p>
                    </div>
                    <div className="dashboard-header__actions">
                        <Link to="/doctor/profile" className="dashboard-btn dashboard-btn--secondary">
                            Edit Profile
                        </Link>
                        <Link to="/doctor/appointments" className="dashboard-btn dashboard-btn--primary">
                            Appointments
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Patients"
                        value={analytics?.doctorTotalPatients || 0}
                        icon={<Users size={24} />}
                        colorClass="blue"
                        delay={1}
                    />
                    <StatCard
                        title="Today's Appointments"
                        value={analytics?.doctorTodayAppointments || 0}
                        icon={<Calendar size={24} />}
                        colorClass="purple"
                        delay={2}
                    />
                    <StatCard
                        title="Total Earnings"
                        value={`₹${analytics?.doctorTotalEarnings || 0}`}
                        icon={<DollarSign size={24} />}
                        colorClass="emerald"
                        delay={3}
                    />
                    <StatCard
                        title="Rating"
                        value={analytics?.doctorAverageRating?.toFixed(1) || "0.0"}
                        subtext={`(${analytics?.doctorTotalReviews || 0} reviews)`}
                        icon={<Star size={24} />}
                        colorClass="amber"
                        delay={4}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-content">
                    {/* Today's Schedule */}
                    <div className="section-card animate-fade-in animate-delay-3">
                        <div className="section-card__header">
                            <h2 className="section-card__title">
                                <Clock size={20} className="section-card__title-icon" />
                                Today's Schedule
                            </h2>
                            <Link to="/doctor/appointments" className="section-card__link">
                                View Calendar
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="section-card__body">
                            {todayAppointments.length === 0 ? (
                                <div className="empty-state">
                                    <Calendar size={48} className="empty-state__icon" />
                                    <p className="empty-state__text">
                                        No appointments scheduled for today.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {todayAppointments.map((apt) => (
                                        <AppointmentCard key={apt.id} appointment={apt} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Summary */}
                    <div className="section-card animate-fade-in animate-delay-4">
                        <div className="section-card__header">
                            <h2 className="section-card__title">
                                <User size={20} className="section-card__title-icon" />
                                Profile Status
                            </h2>
                        </div>
                        <div className="section-card__body profile-card">
                            <div className="profile-card__avatar-wrapper">
                                <div className="profile-card__avatar">
                                    {profile?.profileImage ? (
                                        <img
                                            src={profile.profileImage}
                                            alt={profile.fullName}
                                        />
                                    ) : (
                                        <span>
                                            {profile?.firstName?.[0]}
                                            {profile?.lastName?.[0]}
                                        </span>
                                    )}
                                </div>
                                <h3 className="profile-card__name">
                                    Dr. {profile?.fullName}
                                </h3>
                                <span className="profile-card__specialization">
                                    {profile?.specialization || "Specialization"}
                                </span>
                            </div>

                            <div className="profile-card__details">
                                <div className="profile-card__detail">
                                    <MapPin size={18} className="profile-card__detail-icon" />
                                    <div className="profile-card__detail-content">
                                        <span className="profile-card__detail-label">
                                            Clinic Address
                                        </span>
                                        <span className="profile-card__detail-value">
                                            {profile?.clinicAddress || "Not set"}
                                        </span>
                                    </div>
                                </div>
                                <div className="profile-card__detail">
                                    <Video size={18} className="profile-card__detail-icon" />
                                    <div className="profile-card__detail-content">
                                        <span className="profile-card__detail-label">
                                            Consultation Fee
                                        </span>
                                        <span className="profile-card__detail-value">
                                            ₹{profile?.consultationFeeOnline || 0} (Online)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link to="/doctor/profile" className="profile-card__update-btn">
                                Update Availability
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Subcomponents
const StatCard = ({
    title,
    value,
    subtext,
    icon,
    colorClass,
    delay,
}: {
    title: string;
    value: string | number;
    subtext?: string;
    icon: React.ReactNode;
    colorClass: "blue" | "purple" | "emerald" | "amber";
    delay: number;
}) => (
    <div className={`stat-card stat-card--${colorClass} animate-fade-in animate-delay-${delay}`}>
        <div className="stat-card__header">
            <div className="stat-card__content">
                <p className="stat-card__label">{title}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <h3 className="stat-card__value">{value}</h3>
                    {subtext && <span className="stat-card__subtext">{subtext}</span>}
                </div>
            </div>
            <div className={`stat-card__icon stat-card__icon--${colorClass}`}>
                {icon}
            </div>
        </div>
    </div>
);

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const isOnline = appointment.consultationType === "ONLINE";

    return (
        <div className="appointment-card">
            <div className="appointment-card__avatar">
                {appointment.patient.fullName[0]}
            </div>
            <div className="appointment-card__info">
                <div className="appointment-card__row">
                    <h4 className="appointment-card__name">
                        {appointment.patient.fullName}
                    </h4>
                    <span className="appointment-card__time">
                        {appointment.slotTime}
                    </span>
                </div>
                <div className="appointment-card__meta">
                    <span className="appointment-card__type">
                        {isOnline ? (
                            <Video size={14} style={{ color: "#2563eb" }} />
                        ) : (
                            <MapPin size={14} style={{ color: "#dc2626" }} />
                        )}
                        {appointment.consultationType}
                    </span>
                    <span
                        className={`appointment-card__status appointment-card__status--${appointment.status === "CONFIRMED" ? "confirmed" : "pending"
                            }`}
                    >
                        {appointment.status}
                    </span>
                </div>
            </div>
            <div className="appointment-card__action">
                <Link to={`/doctor/consultations/${appointment.id}`}>
                    <button className="appointment-card__btn">Start</button>
                </Link>
            </div>
        </div>
    );
};
