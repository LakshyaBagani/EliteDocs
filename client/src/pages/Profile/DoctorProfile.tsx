import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    User,
    MapPin,
    Clock,
    DollarSign,
    Save,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";
import type { Availability } from "../../types";
import "./DoctorProfile.css";

interface AvailabilityInput {
    id?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
}

const DAYS_OF_WEEK = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

export const DoctorProfile: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        specialization: "",
        qualification: "",
        experienceYears: 0,
        licenseNumber: "",
        bio: "",
        clinicName: "",
        clinicAddress: "",
        consultationFeeOnline: 0,
        consultationFeeClinic: 0,
        isAvailableOnline: true,
        isAvailableClinic: true,
    });

    const [availabilities, setAvailabilities] = useState<AvailabilityInput[]>([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await doctorService.getOwnProfile();
            setFormData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                specialization: data.specialization || "",
                qualification: data.qualification || "",
                experienceYears: data.experienceYears || 0,
                licenseNumber: data.licenseNumber || "",
                bio: data.bio || "",
                clinicName: data.clinicName || "",
                clinicAddress: data.clinicAddress || "",
                consultationFeeOnline: data.consultationFeeOnline || 0,
                consultationFeeClinic: data.consultationFeeClinic || 0,
                isAvailableOnline: data.isAvailableOnline ?? true,
                isAvailableClinic: data.isAvailableClinic ?? true,
            });
            setAvailabilities(
                data.availabilities?.map((a: Availability) => ({
                    id: a.id,
                    dayOfWeek: a.dayOfWeek,
                    startTime: a.startTime,
                    endTime: a.endTime,
                    slotDurationMinutes: a.slotDurationMinutes || 30,
                })) || []
            );
        } catch (error) {
            console.error("Failed to load profile", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const addAvailability = () => {
        setAvailabilities((prev) => [
            ...prev,
            {
                dayOfWeek: "MONDAY",
                startTime: "09:00",
                endTime: "17:00",
                slotDurationMinutes: 30,
            },
        ]);
    };

    const removeAvailability = (index: number) => {
        setAvailabilities((prev) => prev.filter((_, i) => i !== index));
    };

    const updateAvailability = (
        index: number,
        field: keyof AvailabilityInput,
        value: string | number
    ) => {
        setAvailabilities((prev) =>
            prev.map((a, i) =>
                i === index ? { ...a, [field]: value } : a
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updateData = {
                ...formData,
                availabilities: availabilities.map((a) => ({
                    dayOfWeek: a.dayOfWeek,
                    startTime: a.startTime,
                    endTime: a.endTime,
                    slotDurationMinutes: a.slotDurationMinutes,
                })),
            };

            await doctorService.updateProfile(updateData);
            toast.success("Profile updated successfully!");
            navigate("/doctor/dashboard");
        } catch (error: any) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="doctor-profile">
            <div className="profile-container">
                {/* Header */}
                <div className="profile-header">
                    <Link to="/doctor/dashboard" className="profile-header__back">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 className="profile-header__title">Edit Your Profile</h1>
                    <p className="profile-header__subtitle">
                        Update your professional information and availability
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="profile-form-card">
                        <div className="profile-form-card__header">
                            <h2 className="profile-form-card__title">
                                <User size={20} className="profile-form-card__title-icon" />
                                Personal Information
                            </h2>
                        </div>
                        <div className="profile-form-card__body">
                            <div className="form-grid form-grid--2col">
                                <div className="form-group">
                                    <label className="form-label form-label--required">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label--required">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label--required">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., Cardiologist"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Qualification</label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., MBBS, MD"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Years of Experience</label>
                                    <input
                                        type="number"
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">License Number</label>
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Medical License Number"
                                    />
                                </div>
                                <div className="form-group form-group--full">
                                    <label className="form-label">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        placeholder="Tell patients about yourself, your experience, and approach to care..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinic Information */}
                    <div className="profile-form-card">
                        <div className="profile-form-card__header">
                            <h2 className="profile-form-card__title">
                                <MapPin size={20} className="profile-form-card__title-icon" />
                                Clinic Information
                            </h2>
                        </div>
                        <div className="profile-form-card__body">
                            <div className="form-grid form-grid--2col">
                                <div className="form-group">
                                    <label className="form-label">Clinic Name</label>
                                    <input
                                        type="text"
                                        name="clinicName"
                                        value={formData.clinicName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Your Clinic Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Clinic Address</label>
                                    <input
                                        type="text"
                                        name="clinicAddress"
                                        value={formData.clinicAddress}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Full clinic address"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consultation Fees */}
                    <div className="profile-form-card">
                        <div className="profile-form-card__header">
                            <h2 className="profile-form-card__title">
                                <DollarSign size={20} className="profile-form-card__title-icon" />
                                Consultation Fees
                            </h2>
                        </div>
                        <div className="profile-form-card__body">
                            <div className="form-grid form-grid--2col">
                                <div className="form-group">
                                    <label className="form-label">Online Consultation Fee (₹)</label>
                                    <input
                                        type="number"
                                        name="consultationFeeOnline"
                                        value={formData.consultationFeeOnline}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        min="0"
                                        placeholder="500"
                                    />
                                    <span className="form-hint">
                                        Fee charged for video consultations
                                    </span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Clinic Consultation Fee (₹)</label>
                                    <input
                                        type="number"
                                        name="consultationFeeClinic"
                                        value={formData.consultationFeeClinic}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        min="0"
                                        placeholder="700"
                                    />
                                    <span className="form-hint">
                                        Fee charged for in-person visits
                                    </span>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            name="isAvailableOnline"
                                            checked={formData.isAvailableOnline}
                                            onChange={handleCheckboxChange}
                                            style={{ width: "18px", height: "18px", accentColor: "#2563eb" }}
                                        />
                                        <span className="form-label" style={{ margin: 0 }}>
                                            Available for Online Consultations
                                        </span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            name="isAvailableClinic"
                                            checked={formData.isAvailableClinic}
                                            onChange={handleCheckboxChange}
                                            style={{ width: "18px", height: "18px", accentColor: "#2563eb" }}
                                        />
                                        <span className="form-label" style={{ margin: 0 }}>
                                            Available for Clinic Visits
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Availability Schedule */}
                    <div className="availability-section">
                        <div className="availability-header">
                            <h2 className="availability-title">
                                <Clock size={20} className="availability-title-icon" />
                                Availability Schedule
                            </h2>
                            <button
                                type="button"
                                className="availability-add-btn"
                                onClick={addAvailability}
                            >
                                <Plus size={16} />
                                Add Time Slot
                            </button>
                        </div>
                        <div className="availability-body">
                            {availabilities.length === 0 ? (
                                <div className="availability-empty">
                                    <Clock size={40} className="availability-empty-icon" />
                                    <p>No availability slots added yet.</p>
                                    <p style={{ fontSize: "0.8125rem", marginTop: "0.25rem" }}>
                                        Click "Add Time Slot" to set your weekly schedule.
                                    </p>
                                </div>
                            ) : (
                                availabilities.map((slot, index) => (
                                    <div key={index} className="slot-item">
                                        <div className="slot-item__day">
                                            <select
                                                value={slot.dayOfWeek}
                                                onChange={(e) =>
                                                    updateAvailability(index, "dayOfWeek", e.target.value)
                                                }
                                            >
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <option key={day} value={day}>
                                                        {day.charAt(0) + day.slice(1).toLowerCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="slot-item__time">
                                            <input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(e) =>
                                                    updateAvailability(index, "startTime", e.target.value)
                                                }
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(e) =>
                                                    updateAvailability(index, "endTime", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="slot-item__duration">
                                            <input
                                                type="number"
                                                value={slot.slotDurationMinutes}
                                                onChange={(e) =>
                                                    updateAvailability(
                                                        index,
                                                        "slotDurationMinutes",
                                                        parseInt(e.target.value) || 30
                                                    )
                                                }
                                                min="15"
                                                max="120"
                                            />
                                            <span>min</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="slot-item__remove"
                                            onClick={() => removeAvailability(index)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="profile-submit-section">
                        <Link to="/doctor/dashboard" className="btn-cancel">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
