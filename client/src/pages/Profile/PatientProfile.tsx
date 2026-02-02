import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    User,
    MapPin,
    Phone,
    Save,
    Activity,
} from "lucide-react";
import { toast } from "react-toastify";
import { patientService } from "../../services/patientService";
import "./PatientProfile.css";

export const PatientProfile: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "OTHER" as "MALE" | "FEMALE" | "OTHER",
        bloodGroup: "",
        address: "",
        emergencyContact: "",
        allergies: "",
        medicalConditions: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await patientService.getOwnProfile();
            setFormData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                dateOfBirth: data.dateOfBirth || "",
                gender: (data.gender as any) || "OTHER",
                bloodGroup: data.bloodGroup || "",
                address: data.address || "",
                emergencyContact: data.emergencyContact || "",
                allergies: data.allergies || "",
                medicalConditions: data.medicalConditions || "",
            });
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
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await patientService.updateProfile(formData);
            toast.success("Profile updated successfully!");
            navigate("/patient/dashboard");
        } catch (error: any) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="patient-profile">
                <div className="profile-container">
                    {/* Skeleton Header */}
                    <div className="profile-header">
                        <div className="skeleton-line" style={{ width: '160px', height: '1rem', marginBottom: '1rem' }} />
                        <div className="skeleton-line" style={{ width: '200px', height: '2rem', marginBottom: '0.5rem' }} />
                        <div className="skeleton-line" style={{ width: '320px', height: '1rem' }} />
                    </div>

                    {/* Skeleton Form Cards */}
                    {[1, 2, 3].map((card) => (
                        <div key={card} className="skeleton-form-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <div className="skeleton-circle" style={{ width: '24px', height: '24px' }} />
                                <div className="skeleton-line" style={{ width: '160px', height: '1.25rem', margin: 0 }} />
                            </div>
                            <div className="skeleton-form-grid">
                                {[1, 2, 3, 4].map((field) => (
                                    <div key={field} className="skeleton-form-field">
                                        <div className="skeleton-label" />
                                        <div className="skeleton-input" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Skeleton Submit Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <div className="skeleton" style={{ width: '100px', height: '44px', borderRadius: '0.75rem' }} />
                        <div className="skeleton" style={{ width: '140px', height: '44px', borderRadius: '0.75rem' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-profile">
            <div className="profile-container">
                {/* Header */}
                <div className="profile-header">
                    <Link to="/patient/dashboard" className="profile-header__back">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 className="profile-header__title">Edit My Profile</h1>
                    <p className="profile-header__subtitle">
                        Keep your health information up to date for better care
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className="profile-form-card">
                        <div className="profile-form-card__header">
                            <h2 className="profile-form-card__title">
                                <User size={20} className="profile-form-card__title-icon" />
                                Basic Information
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
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <input
                                        type="text"
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., O+"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        disabled
                                        value="Linked to account"
                                        className="form-input"
                                        style={{ opacity: 0.7 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="profile-form-card">
                        <div className="profile-form-card__header">
                            <h2 className="profile-form-card__title">
                                <MapPin size={20} className="profile-form-card__title-icon" />
                                Contact Information
                            </h2>
                        </div>
                        <div className="profile-form-card__body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Your full address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Emergency Contact</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="tel"
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Emergency relative's phone"
                                        />
                                        <Phone size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="profile-form-card">
                        <div className="profile-form-card__header">
                            <h2 className="profile-form-card__title">
                                <Activity size={20} className="profile-form-card__title-icon" />
                                Medical Details
                            </h2>
                        </div>
                        <div className="profile-form-card__body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Allergies</label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        placeholder="List any drug or food allergies..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Medical Conditions</label>
                                    <textarea
                                        name="medicalConditions"
                                        value={formData.medicalConditions}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        placeholder="Existing medical conditions (e.g., Diabetes, Hypertension)..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="profile-submit-section">
                        <Link to="/patient/dashboard" className="btn-cancel">
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
