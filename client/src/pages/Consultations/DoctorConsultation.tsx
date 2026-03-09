import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Video,
    MapPin,
    Stethoscope,
    Pill,
    FileText,
    Plus,
    X,
    Save,
} from "lucide-react";
import { toast } from "react-toastify";
import { appointmentService } from "../../services/appointmentService";
import {
    consultationService,
    type ConsultationRequest,
    type PrescriptionRequest,
} from "../../services/consultationService";
import type { Appointment, Consultation } from "../../types";
import "./DoctorConsultation.css";

export const DoctorConsultation: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [symptoms, setSymptoms] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [vitals, setVitals] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>([]);

    useEffect(() => {
        if (appointmentId) {
            loadData();
        }
    }, [appointmentId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const appt = await appointmentService.getAppointmentById(appointmentId!);
            setAppointment(appt);

            // Load existing consultation (returns null if none exists yet)
            const consult = await consultationService.getConsultationByAppointmentId(appointmentId!);
            if (consult) {
                setConsultation(consult);
                setSymptoms(consult.symptoms || "");
                setDiagnosis(consult.diagnosis || "");
                setNotes(consult.notes || "");
                setVitals(consult.vitals || "");
                setFollowUpDate(consult.followUpDate || "");
                setPrescriptions(
                    consult.prescriptions?.map((p) => ({
                        medicationName: p.medicationName,
                        dosage: p.dosage,
                        frequency: p.frequency,
                        duration: p.duration,
                        instructions: p.instructions,
                    })) || []
                );
            }
        } catch (error) {
            console.error("Failed to load appointment", error);
            toast.error("Failed to load appointment details");
        } finally {
            setLoading(false);
        }
    };

    const addPrescription = () => {
        setPrescriptions([
            ...prescriptions,
            { medicationName: "", dosage: "", frequency: "", duration: "", instructions: "" },
        ]);
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const updatePrescription = (index: number, field: keyof PrescriptionRequest, value: string) => {
        const updated = [...prescriptions];
        updated[index] = { ...updated[index], [field]: value };
        setPrescriptions(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!diagnosis.trim()) {
            toast.error("Diagnosis is required");
            return;
        }

        setSubmitting(true);
        try {
            const data: ConsultationRequest = {
                appointmentId: appointmentId!,
                symptoms,
                diagnosis,
                notes: notes || undefined,
                vitals: vitals || undefined,
                followUpDate: followUpDate || undefined,
                prescriptions: prescriptions.filter((p) => p.medicationName.trim()),
            };

            if (consultation) {
                await consultationService.updateConsultation(consultation.id, data);
                toast.success("Consultation updated!");
            } else {
                await consultationService.createConsultation(data);
                toast.success("Consultation created!");
            }

            navigate("/doctor/appointments");
        } catch (error) {
            console.error("Failed to save consultation", error);
            toast.error("Failed to save consultation");
        } finally {
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className="doctor-consultation">
                <div className="consultation-container">
                    <div className="consultation-loading">
                        <div className="loading-spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="doctor-consultation">
                <div className="consultation-container">
                    <div className="consultation-header">
                        <Link to="/doctor/appointments" className="consultation-header__back">
                            <ArrowLeft size={18} />
                            Back to Appointments
                        </Link>
                        <h1 className="consultation-header__title">Appointment Not Found</h1>
                    </div>
                </div>
            </div>
        );
    }

    const isViewOnly = appointment.status === "COMPLETED" || appointment.status === "CANCELLED";

    return (
        <div className="doctor-consultation">
            <div className="consultation-container">
                {/* Header */}
                <div className="consultation-header">
                    <Link to="/doctor/appointments" className="consultation-header__back">
                        <ArrowLeft size={18} />
                        Back to Appointments
                    </Link>
                    <h1 className="consultation-header__title">
                        {isViewOnly ? "Consultation Details" : consultation ? "Edit Consultation" : "Start Consultation"}
                    </h1>
                    <p className="consultation-header__subtitle">
                        {isViewOnly
                            ? "Review the consultation details"
                            : "Fill in the consultation details for this appointment"}
                    </p>
                </div>

                {/* Appointment Info */}
                <div className="consultation-appt-card">
                    <div className="consultation-appt-card__patient">
                        <div className="consultation-appt-card__avatar">
                            {appointment.patient.fullName?.[0] || "P"}
                        </div>
                        <div>
                            <div className="consultation-appt-card__name">
                                {appointment.patient.fullName}
                            </div>
                            <div className="consultation-appt-card__reason">
                                {appointment.reason || "General Consultation"}
                            </div>
                        </div>
                    </div>
                    <div className="consultation-appt-card__details">
                        <div className="consultation-appt-card__detail">
                            <Calendar size={14} className="consultation-appt-card__detail-icon" />
                            {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="consultation-appt-card__detail">
                            <Clock size={14} className="consultation-appt-card__detail-icon" />
                            {appointment.slotTime}
                        </div>
                        <div className="consultation-appt-card__detail">
                            {appointment.consultationType === "ONLINE" ? (
                                <Video size={14} className="consultation-appt-card__detail-icon" />
                            ) : (
                                <MapPin size={14} className="consultation-appt-card__detail-icon" />
                            )}
                            {appointment.consultationType}
                        </div>
                        <span className="consultation-appt-card__status">
                            {appointment.status}
                        </span>
                    </div>
                </div>

                {/* Video Call Button for Online Appointments */}
                {(appointment.status === "CONFIRMED" || appointment.status === "IN_PROGRESS") &&
                    appointment.consultationType === "ONLINE" && (
                    <div style={{
                        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                        borderRadius: "1rem",
                        border: "1px solid #bfdbfe",
                        padding: "1.5rem",
                        marginBottom: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}>
                        <div>
                            <h3 style={{ fontWeight: 700, color: "#1e40af", marginBottom: "0.25rem" }}>
                                {appointment.status === "IN_PROGRESS" ? "Call in Progress" : "Online Consultation"}
                            </h3>
                            <p style={{ color: "#3b82f6", fontSize: "0.875rem" }}>
                                {appointment.status === "IN_PROGRESS"
                                    ? "Rejoin the ongoing video call with your patient."
                                    : "Start a video call with your patient before filling the consultation form."}
                            </p>
                        </div>
                        <Link
                            to={`/doctor/consultations/${appointmentId}/video`}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                color: "white",
                                borderRadius: "0.75rem",
                                textDecoration: "none",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.9375rem",
                            }}
                        >
                            <Video size={18} />
                            {appointment.status === "IN_PROGRESS" ? "Rejoin Call" : "Start Video Call"}
                        </Link>
                    </div>
                )}

                {/* View Mode */}
                {isViewOnly && consultation ? (
                    <div className="consultation-view">
                        <div className="consultation-view__card">
                            <h3 className="consultation-view__card-title">
                                <Stethoscope size={20} />
                                Diagnosis & Notes
                            </h3>
                            {consultation.symptoms && (
                                <div className="consultation-view__field">
                                    <div className="consultation-view__label">Symptoms</div>
                                    <div className="consultation-view__value">{consultation.symptoms}</div>
                                </div>
                            )}
                            <div className="consultation-view__field">
                                <div className="consultation-view__label">Diagnosis</div>
                                <div className="consultation-view__value">{consultation.diagnosis}</div>
                            </div>
                            {consultation.vitals && (
                                <div className="consultation-view__field">
                                    <div className="consultation-view__label">Vitals</div>
                                    <div className="consultation-view__value">{consultation.vitals}</div>
                                </div>
                            )}
                            {consultation.notes && (
                                <div className="consultation-view__field">
                                    <div className="consultation-view__label">Notes</div>
                                    <div className="consultation-view__value">{consultation.notes}</div>
                                </div>
                            )}
                            {consultation.followUpDate && (
                                <div className="consultation-view__field">
                                    <div className="consultation-view__label">Follow-up Date</div>
                                    <div className="consultation-view__value">
                                        {formatDate(consultation.followUpDate)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                            <div className="consultation-view__card">
                                <h3 className="consultation-view__card-title">
                                    <Pill size={20} />
                                    Prescriptions
                                </h3>
                                {consultation.prescriptions.map((p, i) => (
                                    <div key={i} className="consultation-view__prescription">
                                        <div className="consultation-view__med-name">
                                            {p.medicationName}
                                        </div>
                                        <div className="consultation-view__med-details">
                                            <span className="consultation-view__med-detail">
                                                <strong>Dosage:</strong> {p.dosage}
                                            </span>
                                            <span className="consultation-view__med-detail">
                                                <strong>Frequency:</strong> {p.frequency}
                                            </span>
                                            <span className="consultation-view__med-detail">
                                                <strong>Duration:</strong> {p.duration}
                                            </span>
                                            {p.instructions && (
                                                <span className="consultation-view__med-detail">
                                                    <strong>Instructions:</strong> {p.instructions}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : isViewOnly && !consultation ? (
                    <div className="consultation-view__card" style={{ textAlign: "center", padding: "3rem" }}>
                        <FileText size={48} style={{ color: "#cbd5e1", marginBottom: "1rem" }} />
                        <h3 style={{ color: "#0f172a", marginBottom: "0.5rem" }}>No Consultation Record</h3>
                        <p style={{ color: "#64748b" }}>No consultation was recorded for this appointment.</p>
                    </div>
                ) : (
                    /* Form Mode */
                    <form className="consultation-form" onSubmit={handleSubmit}>
                        <div className="consultation-form__card">
                            <h3 className="consultation-form__card-title">
                                <Stethoscope size={20} />
                                Diagnosis & Notes
                            </h3>

                            <div className="consultation-form__group">
                                <label className="consultation-form__label">Symptoms</label>
                                <textarea
                                    className="consultation-form__textarea"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Describe the patient's symptoms..."
                                    rows={3}
                                />
                            </div>

                            <div className="consultation-form__group">
                                <label className="consultation-form__label">Diagnosis *</label>
                                <textarea
                                    className="consultation-form__textarea"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Enter your diagnosis..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="consultation-form__group">
                                <label className="consultation-form__label">Vitals</label>
                                <input
                                    type="text"
                                    className="consultation-form__input"
                                    value={vitals}
                                    onChange={(e) => setVitals(e.target.value)}
                                    placeholder="e.g., BP: 120/80, Temp: 98.6°F, Heart Rate: 72bpm"
                                />
                            </div>

                            <div className="consultation-form__group">
                                <label className="consultation-form__label">Notes</label>
                                <textarea
                                    className="consultation-form__textarea"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                            </div>

                            <div className="consultation-form__group">
                                <label className="consultation-form__label">Follow-up Date</label>
                                <input
                                    type="date"
                                    className="consultation-form__input"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Prescriptions */}
                        <div className="consultation-form__card">
                            <h3 className="consultation-form__card-title">
                                <Pill size={20} />
                                Prescriptions
                            </h3>

                            <div className="prescription-list">
                                {prescriptions.map((prescription, index) => (
                                    <div key={index} className="prescription-item">
                                        <div className="prescription-item__header">
                                            <span className="prescription-item__number">
                                                Medication #{index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                className="prescription-item__remove"
                                                onClick={() => removePrescription(index)}
                                            >
                                                <X size={14} />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="consultation-form__group">
                                            <label className="consultation-form__label">Medication Name</label>
                                            <input
                                                type="text"
                                                className="consultation-form__input"
                                                value={prescription.medicationName}
                                                onChange={(e) =>
                                                    updatePrescription(index, "medicationName", e.target.value)
                                                }
                                                placeholder="e.g., Amoxicillin"
                                            />
                                        </div>

                                        <div className="consultation-form__row">
                                            <div className="consultation-form__group">
                                                <label className="consultation-form__label">Dosage</label>
                                                <input
                                                    type="text"
                                                    className="consultation-form__input"
                                                    value={prescription.dosage}
                                                    onChange={(e) =>
                                                        updatePrescription(index, "dosage", e.target.value)
                                                    }
                                                    placeholder="e.g., 500mg"
                                                />
                                            </div>
                                            <div className="consultation-form__group">
                                                <label className="consultation-form__label">Frequency</label>
                                                <input
                                                    type="text"
                                                    className="consultation-form__input"
                                                    value={prescription.frequency}
                                                    onChange={(e) =>
                                                        updatePrescription(index, "frequency", e.target.value)
                                                    }
                                                    placeholder="e.g., 3 times a day"
                                                />
                                            </div>
                                        </div>

                                        <div className="consultation-form__row">
                                            <div className="consultation-form__group">
                                                <label className="consultation-form__label">Duration</label>
                                                <input
                                                    type="text"
                                                    className="consultation-form__input"
                                                    value={prescription.duration}
                                                    onChange={(e) =>
                                                        updatePrescription(index, "duration", e.target.value)
                                                    }
                                                    placeholder="e.g., 7 days"
                                                />
                                            </div>
                                            <div className="consultation-form__group">
                                                <label className="consultation-form__label">Instructions</label>
                                                <input
                                                    type="text"
                                                    className="consultation-form__input"
                                                    value={prescription.instructions}
                                                    onChange={(e) =>
                                                        updatePrescription(index, "instructions", e.target.value)
                                                    }
                                                    placeholder="e.g., After meals"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="add-prescription-btn" onClick={addPrescription}>
                                <Plus size={18} />
                                Add Medication
                            </button>
                        </div>

                        {/* Submit */}
                        <div className="consultation-form__actions">
                            <button
                                type="submit"
                                className="consultation-form__submit"
                                disabled={submitting}
                            >
                                <Save size={18} />
                                {submitting
                                    ? "Saving..."
                                    : consultation
                                    ? "Update Consultation"
                                    : "Save Consultation"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
