import React, { useEffect, useState } from "react";
import {
    Users,
    Search,
    Calendar,
    Clock,
    Phone,
    Mail,
    Heart,
    Droplets,
    AlertCircle,
    Activity,
    ChevronRight,
    ArrowLeft,
    ClipboardList,
    Pill,
    Video,
    MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import { patientService } from "../../services/patientService";
import type { DoctorPatient, VisitSummary } from "../../services/patientService";
import "./DoctorPatients.css";

type StatusFilter = "ALL" | "ACTIVE" | "PAST";

const VISIT_STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    PENDING: { color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
    CONFIRMED: { color: "#059669", bg: "#ecfdf5", border: "#d1fae5" },
    COMPLETED: { color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    CANCELLED: { color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
    IN_PROGRESS: { color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
    NO_SHOW: { color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
};

export const DoctorPatients: React.FC = () => {
    const [patients, setPatients] = useState<DoctorPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const data = await patientService.getDoctorPatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to load patients", error);
            toast.error("Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPatient = async (patientId: string) => {
        setDetailLoading(true);
        try {
            const data = await patientService.getDoctorPatientDetail(patientId);
            setSelectedPatient(data);
        } catch (error) {
            console.error("Failed to load patient details", error);
            toast.error("Failed to load patient details");
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredPatients = patients.filter((p) => {
        const matchesSearch =
            !searchQuery ||
            p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // ===== DETAIL VIEW =====
    if (selectedPatient) {
        return <PatientDetailView patient={selectedPatient} formatDate={formatDate} onBack={() => setSelectedPatient(null)} />;
    }

    // ===== LIST VIEW =====
    if (loading) {
        return (
            <div className="dp-page">
                <div className="dp-container">
                    <div className="dp-header">
                        <div className="skeleton-line" style={{ width: '280px', height: '2.25rem', marginBottom: '0.75rem' }} />
                        <div className="skeleton-line" style={{ width: '200px', height: '1rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton" style={{ width: '90px', height: '38px', borderRadius: '9999px' }} />
                        ))}
                    </div>
                    <div className="dp-grid">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="dp-card-skeleton">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
                                    <div>
                                        <div className="skeleton-line" style={{ width: '120px', height: '1rem', marginBottom: '0.375rem' }} />
                                        <div className="skeleton-line" style={{ width: '160px', height: '0.75rem' }} />
                                    </div>
                                </div>
                                <div className="skeleton-line" style={{ width: '100%', height: '1px', marginBottom: '1rem' }} />
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                                    <div className="skeleton-line" style={{ width: '70%', height: '0.875rem' }} />
                                    <div className="skeleton-line" style={{ width: '50%', height: '0.875rem' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dp-page">
            <div className="dp-container">
                {/* Header */}
                <div className="dp-header dp-animate-fade-in">
                    <div className="dp-header__row">
                        <div>
                            <h1 className="dp-header__title">
                                <Users size={28} className="dp-header__icon" />
                                My Patients
                            </h1>
                            <p className="dp-header__subtitle">
                                View all patients and their medical records
                            </p>
                        </div>
                        <div className="dp-search">
                            <Search size={16} className="dp-search__icon" />
                            <input
                                type="text"
                                className="dp-search__input"
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="dp-filters dp-animate-fade-in dp-animate-delay-1">
                    {(["ALL", "ACTIVE", "PAST"] as StatusFilter[]).map((status) => (
                        <button
                            key={status}
                            className={`dp-filter ${statusFilter === status ? "dp-filter--active" : ""}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "ALL"
                                ? `All (${patients.length})`
                                : status === "ACTIVE"
                                    ? `Active (${patients.filter((p) => p.status === "ACTIVE").length})`
                                    : `Past (${patients.filter((p) => p.status === "PAST").length})`}
                        </button>
                    ))}
                </div>

                {/* Patient Grid */}
                {filteredPatients.length === 0 ? (
                    <div className="dp-empty dp-animate-fade-in dp-animate-delay-2">
                        <div className="dp-empty__icon-wrapper">
                            <Users size={32} />
                        </div>
                        <h3 className="dp-empty__title">No Patients Found</h3>
                        <p className="dp-empty__text">
                            {searchQuery
                                ? "No patients match your search. Try a different query."
                                : "You haven't had any patient appointments yet."}
                        </p>
                    </div>
                ) : (
                    <div className="dp-grid dp-animate-fade-in dp-animate-delay-2">
                        {filteredPatients.map((patient) => (
                            <PatientCard
                                key={patient.id}
                                patient={patient}
                                formatDate={formatDate}
                                onClick={() => handleViewPatient(patient.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== Patient Card =====
const PatientCard = ({
    patient,
    formatDate,
    onClick,
}: {
    patient: DoctorPatient;
    formatDate: (d: string) => string;
    onClick: () => void;
}) => {
    const isActive = patient.status === "ACTIVE";

    return (
        <div className="dp-card" onClick={onClick}>
            <div
                className="dp-card__accent"
                style={{
                    background: isActive
                        ? "linear-gradient(135deg, #3b82f6, #3b82f688)"
                        : "linear-gradient(135deg, #94a3b8, #94a3b888)",
                }}
            />

            <div className="dp-card__patient">
                <div className="dp-card__avatar">
                    {patient.profileImage ? (
                        <img src={patient.profileImage} alt={patient.fullName} />
                    ) : (
                        patient.fullName?.[0] || "P"
                    )}
                </div>
                <div className="dp-card__info">
                    <h4 className="dp-card__name">{patient.fullName}</h4>
                    <p className="dp-card__email">{patient.email}</p>
                </div>
                <span
                    className="dp-card__status"
                    style={{
                        color: isActive ? "#059669" : "#64748b",
                        background: isActive ? "#ecfdf5" : "#f1f5f9",
                        border: `1px solid ${isActive ? "#d1fae5" : "#e2e8f0"}`,
                    }}
                >
                    {isActive ? "Active" : "Past"}
                </span>
            </div>

            <div className="dp-card__divider" />

            <div className="dp-card__details">
                {patient.gender && (
                    <div className="dp-card__detail">
                        <Heart size={14} />
                        <span>{patient.gender}</span>
                    </div>
                )}
                {patient.bloodGroup && (
                    <div className="dp-card__detail">
                        <Droplets size={14} />
                        <span>Blood Group: <strong>{patient.bloodGroup}</strong></span>
                    </div>
                )}
                {patient.lastVisitDate && (
                    <div className="dp-card__detail">
                        <Calendar size={14} />
                        <span>Last Visit: {formatDate(patient.lastVisitDate)}</span>
                    </div>
                )}
            </div>

            <div className="dp-card__footer">
                <span className="dp-card__visits">
                    {patient.totalVisits} {patient.totalVisits === 1 ? "visit" : "visits"}
                </span>
                <span className="dp-card__view">
                    View Details <ChevronRight size={14} />
                </span>
            </div>
        </div>
    );
};

// ===== Patient Detail View =====
const PatientDetailView = ({
    patient,
    formatDate,
    onBack,
}: {
    patient: DoctorPatient;
    formatDate: (d: string) => string;
    onBack: () => void;
}) => {
    const isActive = patient.status === "ACTIVE";

    return (
        <div className="dp-detail">
            <div className="dp-detail__container">
                {/* Back button */}
                <button className="dp-detail__back" onClick={onBack} style={{ color: '#64748b', textDecoration: 'none' }}>
                    <ArrowLeft size={16} />
                    Back to Patients
                </button>

                {/* Profile Card */}
                <div className="dp-detail__profile dp-animate-fade-in">
                    <div className="dp-detail__profile-top">
                        <div className="dp-detail__avatar">
                            {patient.profileImage ? (
                                <img src={patient.profileImage} alt={patient.fullName} />
                            ) : (
                                patient.fullName?.[0] || "P"
                            )}
                        </div>
                        <div className="dp-detail__profile-info">
                            <h1 className="dp-detail__name">{patient.fullName}</h1>
                            <div className="dp-detail__meta">
                                {patient.email && (
                                    <span className="dp-detail__meta-item">
                                        <Mail size={14} />
                                        {patient.email}
                                    </span>
                                )}
                                {patient.phone && (
                                    <span className="dp-detail__meta-item">
                                        <Phone size={14} />
                                        {patient.phone}
                                    </span>
                                )}
                                {patient.gender && (
                                    <span className="dp-detail__meta-item">
                                        <Heart size={14} />
                                        {patient.gender}
                                    </span>
                                )}
                                {patient.dateOfBirth && (
                                    <span className="dp-detail__meta-item">
                                        <Calendar size={14} />
                                        DOB: {formatDate(patient.dateOfBirth)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span
                            className="dp-detail__status-badge"
                            style={{
                                color: isActive ? "#059669" : "#64748b",
                                background: isActive ? "#ecfdf5" : "#f1f5f9",
                                border: `1px solid ${isActive ? "#d1fae5" : "#e2e8f0"}`,
                            }}
                        >
                            {isActive ? "Active Patient" : "Past Patient"}
                        </span>
                    </div>

                    {/* Medical Info */}
                    <div className="dp-detail__medical">
                        <div className="dp-detail__medical-item">
                            <p className="dp-detail__medical-label">Blood Group</p>
                            <p className="dp-detail__medical-value">
                                {patient.bloodGroup || "Not specified"}
                            </p>
                        </div>
                        <div className="dp-detail__medical-item">
                            <p className="dp-detail__medical-label">Allergies</p>
                            <p className="dp-detail__medical-value">
                                {patient.allergies || "None reported"}
                            </p>
                        </div>
                        <div className="dp-detail__medical-item">
                            <p className="dp-detail__medical-label">Medical Conditions</p>
                            <p className="dp-detail__medical-value">
                                {patient.medicalConditions || "None reported"}
                            </p>
                        </div>
                        <div className="dp-detail__medical-item">
                            <p className="dp-detail__medical-label">Total Visits</p>
                            <p className="dp-detail__medical-value">{patient.totalVisits}</p>
                        </div>
                    </div>
                </div>

                {/* Visit History */}
                <div className="dp-detail__visits dp-animate-fade-in dp-animate-delay-1">
                    <div className="dp-detail__visits-header">
                        <h2 className="dp-detail__visits-title">
                            <ClipboardList size={20} />
                            Visit History
                        </h2>
                        {patient.visits && (
                            <span className="dp-detail__visits-count">
                                {patient.visits.length} {patient.visits.length === 1 ? "visit" : "visits"}
                            </span>
                        )}
                    </div>

                    <div className="dp-detail__visits-list">
                        {!patient.visits || patient.visits.length === 0 ? (
                            <p className="dp-detail__visits-empty">
                                No visit records found.
                            </p>
                        ) : (
                            patient.visits.map((visit) => (
                                <VisitCard key={visit.appointmentId} visit={visit} formatDate={formatDate} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== Visit Card =====
const VisitCard = ({
    visit,
    formatDate,
}: {
    visit: VisitSummary;
    formatDate: (d: string) => string;
}) => {
    const statusCfg = VISIT_STATUS_CONFIG[visit.status] || VISIT_STATUS_CONFIG.PENDING;

    return (
        <div className="dp-visit">
            <div className="dp-visit__header">
                <span className="dp-visit__date">
                    {formatDate(visit.appointmentDate)} — {visit.slotTime}
                </span>
                <div className="dp-visit__badges">
                    <span
                        className="dp-visit__badge dp-visit__badge--status"
                        style={{
                            color: statusCfg.color,
                            background: statusCfg.bg,
                            border: `1px solid ${statusCfg.border}`,
                        }}
                    >
                        {visit.status}
                    </span>
                    <span className="dp-visit__badge dp-visit__badge--type">
                        {visit.consultationType === "ONLINE" ? (
                            <><Video size={10} style={{ display: 'inline', marginRight: 4 }} /> Online</>
                        ) : (
                            <><MapPin size={10} style={{ display: 'inline', marginRight: 4 }} /> Clinic</>
                        )}
                    </span>
                </div>
            </div>

            <div className="dp-visit__info">
                {visit.reason && (
                    <div className="dp-visit__info-item">
                        <strong>Reason:</strong> {visit.reason}
                    </div>
                )}
                {visit.diagnosis && (
                    <div className="dp-visit__info-item">
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                    </div>
                )}
            </div>

            {visit.prescriptions && visit.prescriptions.length > 0 && (
                <div className="dp-visit__prescriptions">
                    <p className="dp-visit__prescriptions-title">
                        <Pill size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Prescriptions
                    </p>
                    {visit.prescriptions.map((rx, idx) => (
                        <div key={idx} className="dp-visit__prescription">
                            <span className="dp-visit__prescription-name">{rx.medicationName}</span>
                            {rx.dosage && <span>• {rx.dosage}</span>}
                            {rx.frequency && <span>• {rx.frequency}</span>}
                            {rx.duration && <span>• {rx.duration}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
