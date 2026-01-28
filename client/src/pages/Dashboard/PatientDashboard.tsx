import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    FileText,
    User,
    Video,
    MapPin,
    Plus,
    ChevronRight,
} from "lucide-react";
import { patientService } from "../../services/patientService";
import { appointmentService } from "../../services/appointmentService";
import type { Patient, Appointment } from "../../types";
import "./PatientDashboard.css";

export const PatientDashboard: React.FC = () => {
    const [profile, setProfile] = useState<Patient | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [profileData, appointmentsData] = await Promise.all([
                patientService.getOwnProfile(),
                appointmentService.getAppointments(undefined, 0, 20), // Fetch more to filter
            ]);
            setProfile(profileData);

            // Filter to show only upcoming appointments (today or future)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingAppointments = appointmentsData.content.filter((apt) => {
                const appointmentDate = new Date(apt.appointmentDate);
                appointmentDate.setHours(0, 0, 0, 0);

                // Include if appointment is today or in the future
                // and status is not CANCELLED or COMPLETED
                return appointmentDate >= today &&
                    apt.status !== 'CANCELLED' &&
                    apt.status !== 'COMPLETED';
            });

            // Take only first 5 for dashboard display
            setAppointments(upcomingAppointments.slice(0, 5));
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="patient-dashboard">
                <div className="flex justify-center pt-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-dashboard">
            <div className="dashboard-container">
                {/* Header Section */}
                <div className="dashboard-header animate-fade-in">
                    <div>
                        <h1 className="dashboard-header__title">
                            Hello, <span>{profile?.firstName}</span>
                        </h1>
                        <p className="dashboard-header__subtitle">
                            Manage your health and appointments.
                        </p>
                    </div>
                    <div className="dashboard-header__actions">
                        <Link to="/doctors" className="dashboard-btn dashboard-btn--primary">
                            <Plus size={18} style={{ marginRight: '0.5rem' }} />
                            Book Appointment
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Upcoming"
                        value={appointments.length}
                        icon={<Calendar size={24} />}
                        colorClass="blue"
                        delay={1}
                    />
                    <StatCard
                        title="Medical Records"
                        value={0}
                        icon={<FileText size={24} />}
                        colorClass="purple"
                        delay={2}
                    />
                    <StatCard
                        title="Profile Status"
                        value="Active"
                        icon={<User size={24} />}
                        colorClass="emerald"
                        delay={3}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-content">
                    {/* Upcoming Appointments */}
                    <div className="section-card animate-fade-in animate-delay-3">
                        <div className="section-card__header">
                            <h2 className="section-card__title">
                                <Clock size={20} className="section-card__title-icon" />
                                Upcoming Appointments
                            </h2>
                            <Link to="/patient/appointments" className="section-card__link">
                                View All
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="section-card__body">
                            {appointments.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium text-gray-500">No upcoming appointments</p>
                                    <Link to="/doctors" className="mt-4 inline-block dashboard-btn dashboard-btn--secondary">
                                        Find a Doctor
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map((apt) => (
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
                                My Profile
                            </h2>
                        </div>
                        <div className="section-card__body profile-card">
                            <div className="profile-card__avatar-wrapper">
                                <div className="profile-card__avatar">
                                    {profile?.profileImage ? (
                                        <img
                                            src={profile.profileImage}
                                            alt={profile.fullName}
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span>
                                            {profile?.firstName?.[0]}
                                            {profile?.lastName?.[0]}
                                        </span>
                                    )}
                                </div>
                                <h3 className="profile-card__name">{profile?.fullName}</h3>
                                <p className="profile-card__email">{profile?.email}</p>
                            </div>

                            <div className="profile-card__details">
                                <div className="profile-card__detail">
                                    <User size={18} className="profile-card__detail-icon" />
                                    <div className="profile-card__detail-content">
                                        <span className="profile-card__detail-label">Gender</span>
                                        <span className="profile-card__detail-value">{profile?.gender || "Not set"}</span>
                                    </div>
                                </div>
                                <div className="profile-card__detail">
                                    <MapPin size={18} className="profile-card__detail-icon" />
                                    <div className="profile-card__detail-content">
                                        <span className="profile-card__detail-label">Location</span>
                                        <span className="profile-card__detail-value">{profile?.address || "Not set"}</span>
                                    </div>
                                </div>
                            </div>

                            <Link to="/patient/profile" className="profile-card__update-btn">
                                Edit Profile
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
    icon,
    colorClass,
    delay,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: "blue" | "purple" | "emerald";
    delay: number;
}) => (
    <div className={`stat-card stat-card--${colorClass} animate-fade-in animate-delay-${delay}`}>
        <div className="stat-card__header">
            <div className="stat-card__content">
                <p className="stat-card__label">{title}</p>
                <h3 className="stat-card__value">{value}</h3>
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
                {appointment.doctor?.fullName?.[0] || "D"}
            </div>
            <div className="appointment-card__info">
                <div className="appointment-card__row">
                    <h4 className="appointment-card__name">
                        Dr. {appointment.doctor?.fullName}
                    </h4>
                    <span className="appointment-card__time">
                        {appointment.slotTime}
                    </span>
                </div>
                <div className="appointment-card__meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isOnline ? <Video size={14} style={{ color: '#3b82f6' }} /> : <MapPin size={14} style={{ color: '#ef4444' }} />}
                        {appointment.consultationType}
                    </span>
                    <span>{appointment.appointmentDate}</span>
                    <span
                        className={`appointment-card__status appointment-card__status--${appointment.status.toLowerCase()}`}
                    >
                        {appointment.status}
                    </span>
                </div>
            </div>
        </div>
    );
};
