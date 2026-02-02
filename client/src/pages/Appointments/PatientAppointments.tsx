import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Video,
    MapPin,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import { appointmentService } from "../../services/appointmentService";
import type { Appointment, PagedResponse } from "../../types";
import "./PatientAppointments.css";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

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

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const status = statusFilter === "ALL" ? undefined : statusFilter;
            const response: PagedResponse<Appointment> = await appointmentService.getAppointments(
                status,
                page,
                10
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

    const getStatusClass = (status: string) => {
        switch (status) {
            case "PENDING":
                return "appointment-item__status--pending";
            case "CONFIRMED":
                return "appointment-item__status--confirmed";
            case "COMPLETED":
                return "appointment-item__status--completed";
            case "CANCELLED":
            case "NO_SHOW":
                return "appointment-item__status--cancelled";
            default:
                return "";
        }
    };

    if (loading && appointments.length === 0) {
        return (
            <div className="patient-appointments">
                <div className="appointments-container">
                    {/* Skeleton Header */}
                    <div className="appointments-header">
                        <div>
                            <div className="skeleton-line" style={{ width: '160px', height: '1rem', marginBottom: '1rem' }} />
                            <div className="skeleton-line" style={{ width: '200px', height: '2rem', marginBottom: '0.5rem' }} />
                            <div className="skeleton-line" style={{ width: '280px', height: '1rem' }} />
                        </div>
                    </div>

                    {/* Skeleton Filters */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '2rem' }} />
                        ))}
                    </div>

                    {/* Skeleton Appointments List */}
                    <div className="appointments-list">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton-appointment-item" style={{ padding: '1.25rem' }}>
                                <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
                                <div className="skeleton-info" style={{ flex: 1 }}>
                                    <div className="skeleton-line" style={{ width: '40%', marginBottom: '0.5rem' }} />
                                    <div className="skeleton-line short" />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '0.5rem' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-appointments">
            <div className="appointments-container">
                {/* Header */}
                <div className="appointments-header">
                    <div>
                        <Link to="/patient/dashboard" className="appointments-header__back">
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <h1 className="appointments-header__title">My Appointments</h1>
                        <p className="appointments-header__subtitle">
                            View and manage all your appointments history
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="appointments-filters">
                    {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as StatusFilter[]).map(
                        (status) => (
                            <button
                                key={status}
                                className={`filter-btn ${statusFilter === status ? "filter-btn--active" : ""}`}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setPage(0);
                                }}
                            >
                                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        )
                    )}
                </div>

                {/* Appointments List */}
                {appointments.length === 0 ? (
                    <div className="appointments-empty">
                        <Calendar size={56} className="appointments-empty__icon" />
                        <h3 className="appointments-empty__title">No Appointments Found</h3>
                        <p className="appointments-empty__text">
                            {statusFilter === "ALL"
                                ? "You haven't booked any appointments yet."
                                : `No ${statusFilter.toLowerCase()} appointments found.`}
                        </p>
                        {statusFilter === "ALL" && (
                            <Link to="/doctors" className="action-btn action-btn--primary">
                                Book Your First Appointment
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="appointments-list">
                            {appointments.map((appointment) => (
                                <div key={appointment.id} className="appointment-item">
                                    <div className="appointment-item__doctor">
                                        <div className="appointment-item__avatar">
                                            {appointment.doctor?.profileImage ? (
                                                <img src={appointment.doctor.profileImage} alt={appointment.doctor.fullName} />
                                            ) : (
                                                <span>{appointment.doctor?.fullName?.[0] || "D"}</span>
                                            )}
                                        </div>
                                        <div className="appointment-item__info">
                                            <h4 className="appointment-item__name">
                                                Dr. {appointment.doctor?.fullName}
                                            </h4>
                                            <p className="appointment-item__specialization">
                                                {appointment.doctor?.specialization || "General Physician"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="appointment-item__details">
                                        <div className="appointment-item__detail">
                                            <Calendar size={14} className="appointment-item__detail-icon" />
                                            {formatDate(appointment.appointmentDate)}
                                        </div>
                                        <div className="appointment-item__detail">
                                            <Clock size={14} className="appointment-item__detail-icon" />
                                            {appointment.slotTime}
                                        </div>
                                        <div className="appointment-item__detail">
                                            {appointment.consultationType === "ONLINE" ? (
                                                <Video size={14} className="appointment-item__detail-icon" />
                                            ) : (
                                                <MapPin size={14} className="appointment-item__detail-icon" />
                                            )}
                                            {appointment.consultationType}
                                        </div>
                                        <span
                                            className={`appointment-item__status ${getStatusClass(
                                                appointment.status
                                            )}`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </div>

                                    <div className="appointment-item__actions">
                                        {appointment.status === "PENDING" && (
                                            <button
                                                className="action-btn action-btn--danger"
                                                onClick={() => handleCancelAppointment(appointment.id)}
                                            >
                                                <X size={14} />
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="appointments-pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </button>
                                <span className="pagination-info">
                                    Page {page + 1} of {totalPages} ({totalElements} total)
                                </span>
                                <button
                                    className="pagination-btn"
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
