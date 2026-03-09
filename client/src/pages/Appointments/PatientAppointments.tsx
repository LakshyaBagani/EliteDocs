import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    X,
    PhoneCall,
    ClipboardList,
    Search,
} from "lucide-react";
import { toast } from "react-toastify";
import { appointmentService } from "../../services/appointmentService";
import { websocketService } from "../../services/websocketService";
import type { Appointment, PagedResponse } from "../../types";
import "./PatientAppointments.css";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Pending", color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
    CONFIRMED: { label: "Confirmed", color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    COMPLETED: { label: "Completed", color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
    IN_PROGRESS: { label: "In Progress", color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    NO_SHOW: { label: "No Show", color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
};

export const PatientAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadAppointments();
    }, [statusFilter, page]);

    // WebSocket: listen for real-time call status changes
    useEffect(() => {
        websocketService.connect(() => {
            // Subscribe to call-status for each online CONFIRMED appointment
            appointments
                .filter((a) => a.consultationType === "ONLINE" && a.status === "CONFIRMED")
                .forEach((a) => {
                    const topic = `/topic/call-status/${a.id}`;
                    websocketService.subscribe(topic, (message) => {
                        const data = JSON.parse(message.body);
                        if (data.status === "IN_PROGRESS") {
                            setAppointments((prev) =>
                                prev.map((apt) =>
                                    apt.id === a.id ? { ...apt, status: "IN_PROGRESS" } : apt
                                )
                            );
                            toast.info("Doctor has started the call! You can now join.");
                        } else if (data.status === "ENDED") {
                            setAppointments((prev) =>
                                prev.map((apt) =>
                                    apt.id === a.id ? { ...apt, status: "COMPLETED" } : apt
                                )
                            );
                        }
                    });
                });
        });

        return () => {
            appointments
                .filter((a) => a.consultationType === "ONLINE" && a.status === "CONFIRMED")
                .forEach((a) => {
                    websocketService.unsubscribe(`/topic/call-status/${a.id}`);
                });
            websocketService.disconnect();
        };
    }, [appointments.map((a) => a.id).join(",")]);

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

    const handleCancelAppointment = async (id: string) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

        try {
            await appointmentService.cancelAppointment(id, "Cancelled by patient");
            toast.success("Appointment cancelled successfully");
            loadAppointments();
        } catch (error) {
            console.error("Failed to cancel appointment", error);
            toast.error("Failed to cancel appointment");
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
            <div className="pa-page">
                <div className="pa-container">
                    <div className="pa-header">
                        <div className="skeleton-line" style={{ width: '140px', height: '1rem', marginBottom: '1rem' }} />
                        <div className="skeleton-line" style={{ width: '280px', height: '2.25rem', marginBottom: '0.75rem' }} />
                        <div className="skeleton-line" style={{ width: '200px', height: '1rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton" style={{ width: '90px', height: '38px', borderRadius: '9999px' }} />
                        ))}
                    </div>
                    <div className="pa-grid">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="pa-card-skeleton">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
                                    <div>
                                        <div className="skeleton-line" style={{ width: '120px', height: '1rem', marginBottom: '0.375rem' }} />
                                        <div className="skeleton-line" style={{ width: '80px', height: '0.75rem' }} />
                                    </div>
                                </div>
                                <div className="skeleton-line" style={{ width: '100%', height: '1px', marginBottom: '1rem' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
        <div className="pa-page">
            <div className="pa-container">
                {/* Header */}
                <div className="pa-header animate-fade-in">
                    <div className="pa-header__row">
                        <div>
                            <h1 className="pa-header__title">
                                <ClipboardList size={28} className="pa-header__icon" />
                                My Appointments
                            </h1>
                            <p className="pa-header__subtitle">
                                Track and manage all your medical appointments
                            </p>
                        </div>
                        <Link to="/doctors" className="pa-book-btn">
                            <Calendar size={16} />
                            Book New
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="pa-filters animate-fade-in animate-delay-1">
                    {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as StatusFilter[]).map(
                        (status) => (
                            <button
                                key={status}
                                className={`pa-filter ${statusFilter === status ? "pa-filter--active" : ""}`}
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
                    <div className="pa-empty animate-fade-in animate-delay-2">
                        <div className="pa-empty__icon-wrapper">
                            <Search size={32} />
                        </div>
                        <h3 className="pa-empty__title">No Appointments Found</h3>
                        <p className="pa-empty__text">
                            {statusFilter === "ALL"
                                ? "You haven't booked any appointments yet. Find a doctor and book your first consultation."
                                : `No ${statusFilter.toLowerCase()} appointments found. Try a different filter.`}
                        </p>
                        {statusFilter === "ALL" && (
                            <Link to="/doctors" className="pa-book-btn">
                                <Calendar size={16} />
                                Book Your First Appointment
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="pa-grid animate-fade-in animate-delay-2">
                            {appointments.map((appointment) => (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={appointment}
                                    formatDate={formatDate}
                                    onCancel={handleCancelAppointment}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pa-pagination animate-fade-in">
                                <button
                                    className="pa-page-btn"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </button>
                                <div className="pa-page-numbers">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            className={`pa-page-num ${page === i ? "pa-page-num--active" : ""}`}
                                            onClick={() => setPage(i)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="pa-page-btn"
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
    onCancel,
}: {
    appointment: Appointment;
    formatDate: (d: string) => string;
    onCancel: (id: string) => void;
}) => {
    const isOnline = appointment.consultationType === "ONLINE";
    const canJoin = isOnline && appointment.status === "IN_PROGRESS";
    const canCancel = appointment.status === "PENDING";
    const statusCfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING;

    return (
        <div className="pa-card">
            {/* Top color accent */}
            <div
                className="pa-card__accent"
                style={{ background: `linear-gradient(135deg, ${statusCfg.color}, ${statusCfg.color}88)` }}
            />

            {/* Doctor info */}
            <div className="pa-card__doctor">
                <div className="pa-card__avatar">
                    {appointment.doctor?.profileImage ? (
                        <img src={appointment.doctor.profileImage} alt={appointment.doctor.fullName} />
                    ) : (
                        <span>{appointment.doctor?.fullName?.[0] || "D"}</span>
                    )}
                </div>
                <div className="pa-card__doctor-info">
                    <h4 className="pa-card__name">Dr. {appointment.doctor?.fullName}</h4>
                    <p className="pa-card__specialization">
                        {appointment.doctor?.specialization || "General Physician"}
                    </p>
                </div>
                <span
                    className="pa-card__status"
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
            <div className="pa-card__divider" />

            {/* Details */}
            <div className="pa-card__details">
                <div className="pa-card__detail">
                    <Calendar size={14} />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="pa-card__detail">
                    <Clock size={14} />
                    <span>{appointment.slotTime}</span>
                </div>
                <div className="pa-card__detail">
                    {isOnline ? <Video size={14} /> : <MapPin size={14} />}
                    <span>{appointment.consultationType}</span>
                </div>
            </div>

            {/* Actions */}
            {(canJoin || canCancel) && (
                <div className="pa-card__actions">
                    {canJoin && (
                        <Link
                            to={`/patient/consultations/${appointment.id}/video`}
                            className="pa-card__join"
                        >
                            <PhoneCall size={14} />
                            {appointment.status === "IN_PROGRESS" ? "Join Call" : "Join"}
                        </Link>
                    )}
                    {canCancel && (
                        <button
                            className="pa-card__cancel"
                            onClick={() => onCancel(appointment.id)}
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
