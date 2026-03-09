import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    X,
    Check,
    Eye,
    PhoneCall,
    ClipboardList,
    Search,
    ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { appointmentService } from "../../services/appointmentService";
import type { Appointment, PagedResponse } from "../../types";
import "./DoctorAppointments.css";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Pending", color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
    CONFIRMED: { label: "Confirmed", color: "#059669", bg: "#ecfdf5", border: "#d1fae5" },
    COMPLETED: { label: "Completed", color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
    IN_PROGRESS: { label: "In Progress", color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    NO_SHOW: { label: "No Show", color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
};

export const DoctorAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadAppointments();
    }, [statusFilter, page]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const status = statusFilter === "ALL" ? undefined : statusFilter;
            const response: PagedResponse<Appointment> = await appointmentService.getAppointments(
                status,
                page,
                9
            );
            setAppointments(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Failed to load appointments", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await appointmentService.updateStatus(id, newStatus);
            toast.success(`Appointment ${newStatus.toLowerCase()}!`);
            loadAppointments();
        } catch (error) {
            console.error("Failed to update appointment", error);
            toast.error("Failed to update appointment status");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const filterCounts: Record<StatusFilter, string> = {
        ALL: `All (${totalElements})`,
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
    };

    if (loading && appointments.length === 0) {
        return (
            <div className="da-page">
                <div className="da-container">
                    <div className="da-header">
                        <div className="skeleton-line" style={{ width: '280px', height: '2.25rem', marginBottom: '0.75rem' }} />
                        <div className="skeleton-line" style={{ width: '200px', height: '1rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton" style={{ width: '90px', height: '38px', borderRadius: '9999px' }} />
                        ))}
                    </div>
                    <div className="da-grid">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="da-card-skeleton">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
                                    <div>
                                        <div className="skeleton-line" style={{ width: '120px', height: '1rem', marginBottom: '0.375rem' }} />
                                        <div className="skeleton-line" style={{ width: '80px', height: '0.75rem' }} />
                                    </div>
                                </div>
                                <div className="skeleton-line" style={{ width: '100%', height: '1px', marginBottom: '1rem' }} />
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                                    <div className="skeleton-line" style={{ width: '70%', height: '0.875rem' }} />
                                    <div className="skeleton-line" style={{ width: '50%', height: '0.875rem' }} />
                                    <div className="skeleton-line" style={{ width: '60%', height: '0.875rem' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="da-page">
            <div className="da-container">
                {/* Header */}
                <div className="da-header da-animate-fade-in">
                    <div className="da-header__row">
                        <div>
                            <h1 className="da-header__title">
                                <ClipboardList size={28} className="da-header__icon" />
                                Your Appointments
                            </h1>
                            <p className="da-header__subtitle">
                                Manage all your patient appointments
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="da-filters da-animate-fade-in da-animate-delay-1">
                    {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as StatusFilter[]).map(
                        (status) => (
                            <button
                                key={status}
                                className={`da-filter ${statusFilter === status ? "da-filter--active" : ""}`}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setPage(0);
                                }}
                            >
                                {filterCounts[status]}
                            </button>
                        )
                    )}
                </div>

                {/* Appointments Grid */}
                {appointments.length === 0 ? (
                    <div className="da-empty da-animate-fade-in da-animate-delay-2">
                        <div className="da-empty__icon-wrapper">
                            <Search size={32} />
                        </div>
                        <h3 className="da-empty__title">No Appointments Found</h3>
                        <p className="da-empty__text">
                            {statusFilter === "ALL"
                                ? "You don't have any appointments yet. Patients will book consultations with you."
                                : `No ${statusFilter.toLowerCase()} appointments found. Try a different filter.`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="da-grid da-animate-fade-in da-animate-delay-2">
                            {appointments.map((appointment) => (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={appointment}
                                    formatDate={formatDate}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="da-pagination da-animate-fade-in">
                                <button
                                    className="da-page-btn"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </button>
                                <div className="da-page-numbers">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            className={`da-page-num ${page === i ? "da-page-num--active" : ""}`}
                                            onClick={() => setPage(i)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="da-page-btn"
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Appointment Card Component
const AppointmentCard = ({
    appointment,
    formatDate,
    onStatusChange,
}: {
    appointment: Appointment;
    formatDate: (d: string) => string;
    onStatusChange: (id: string, status: string) => void;
}) => {
    const isOnline = appointment.consultationType === "ONLINE";
    const statusCfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING;

    const getStartLink = () => {
        if (isOnline) return `/doctor/consultations/${appointment.id}/video`;
        return `/doctor/consultations/${appointment.id}`;
    };

    return (
        <div className="da-card">
            {/* Top color accent */}
            <div
                className="da-card__accent"
                style={{ background: `linear-gradient(135deg, ${statusCfg.color}, ${statusCfg.color}88)` }}
            />

            {/* Patient info */}
            <div className="da-card__patient">
                <div className="da-card__avatar">
                    {appointment.patient?.fullName?.[0] || "P"}
                </div>
                <div className="da-card__patient-info">
                    <h4 className="da-card__name">{appointment.patient?.fullName}</h4>
                    <p className="da-card__reason">
                        {appointment.reason || "General Consultation"}
                    </p>
                </div>
                <span
                    className="da-card__status"
                    style={{
                        color: statusCfg.color,
                        background: statusCfg.bg,
                        border: `1px solid ${statusCfg.border}`,
                    }}
                >
                    {statusCfg.label}
                </span>
            </div>

            {/* Divider */}
            <div className="da-card__divider" />

            {/* Details */}
            <div className="da-card__details">
                <div className="da-card__detail">
                    <Calendar size={14} />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="da-card__detail">
                    <Clock size={14} />
                    <span>{appointment.slotTime}</span>
                </div>
                <div className="da-card__detail">
                    {isOnline ? <Video size={14} /> : <MapPin size={14} />}
                    <span>{appointment.consultationType}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="da-card__actions">
                {appointment.status === "PENDING" && (
                    <>
                        <button
                            className="da-card__btn da-card__btn--success"
                            onClick={() => onStatusChange(appointment.id, "CONFIRMED")}
                        >
                            <Check size={14} />
                            Confirm
                        </button>
                        <button
                            className="da-card__btn da-card__btn--danger"
                            onClick={() => onStatusChange(appointment.id, "CANCELLED")}
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    </>
                )}
                {appointment.status === "IN_PROGRESS" && isOnline && (
                    <Link
                        to={`/doctor/consultations/${appointment.id}/video`}
                        className="da-card__btn da-card__btn--primary"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', textDecoration: 'none' }}
                    >
                        <PhoneCall size={14} />
                        Rejoin Call
                    </Link>
                )}
                {appointment.status === "CONFIRMED" && (
                    <>
                        <Link
                            to={getStartLink()}
                            className="da-card__btn da-card__btn--primary"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', textDecoration: 'none' }}
                        >
                            <Eye size={14} />
                            Start
                        </Link>
                        <button
                            className="da-card__btn da-card__btn--secondary"
                            onClick={() => onStatusChange(appointment.id, "COMPLETED")}
                        >
                            Complete
                        </button>
                    </>
                )}
                {(appointment.status === "COMPLETED" || appointment.status === "CANCELLED") && (
                    <Link
                        to={`/doctor/consultations/${appointment.id}`}
                        className="da-card__btn da-card__btn--secondary"
                        style={{ background: 'white', color: '#475569', textDecoration: 'none', border: '1px solid #e2e8f0' }}
                    >
                        <Eye size={14} />
                        View Details
                    </Link>
                )}
            </div>
        </div>
    );
};
