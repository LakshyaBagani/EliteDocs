import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import { BookingModal } from '../../components/booking/BookingModal/BookingModal';
import {
    Star,
    Video,
    Building,
    Clock,
    Award,
    GraduationCap,
    MapPin,
    Calendar,
    ArrowLeft,
    CheckCircle,
    Phone
} from 'lucide-react';
import type { Doctor } from '../../types';
import './DoctorDetail.css';

export const DoctorDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedConsultationType, setSelectedConsultationType] = useState<'online' | 'clinic'>('online');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadDoctor(id);
        }
    }, [id]);

    const loadDoctor = async (doctorId: string) => {
        setLoading(true);
        try {
            const data = await doctorService.getDoctorById(doctorId);
            setDoctor(data);
            // Set default consultation type based on availability
            if (data.isAvailableOnline) {
                setSelectedConsultationType('online');
            } else if (data.isAvailableClinic) {
                setSelectedConsultationType('clinic');
            }
        } catch (error) {
            console.error('Failed to load doctor', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/doctors/${id}` } });
            return;
        }
        setIsBookingModalOpen(true);
    };

    if (loading) {
        return (
            <div className="doctor-detail-page">
                <div className="doctor-detail-container">
                    {/* Skeleton Back Link */}
                    <div className="skeleton-line" style={{ width: '150px', height: '1rem', marginBottom: '1.5rem' }} />

                    <div className="doctor-detail-grid">
                        {/* Skeleton Main Content */}
                        <div className="doctor-main-content">
                            {/* Skeleton Profile Header */}
                            <div className="skeleton-form-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="skeleton-circle" style={{ width: '100px', height: '100px', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton-line" style={{ width: '200px', height: '1.75rem', marginBottom: '0.75rem' }} />
                                    <div className="skeleton-line" style={{ width: '150px', height: '1rem', marginBottom: '1rem' }} />
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div className="skeleton" style={{ width: '120px', height: '28px', borderRadius: '1rem' }} />
                                        <div className="skeleton" style={{ width: '150px', height: '28px', borderRadius: '1rem' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div className="skeleton" style={{ width: '140px', height: '32px', borderRadius: '2rem' }} />
                                        <div className="skeleton" style={{ width: '120px', height: '32px', borderRadius: '2rem' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Skeleton About Section */}
                            <div className="skeleton-form-card">
                                <div className="skeleton-line" style={{ width: '80px', height: '1.25rem', marginBottom: '1rem' }} />
                                <div className="skeleton-line long" />
                                <div className="skeleton-line medium" />
                                <div className="skeleton-line short" />
                            </div>

                            {/* Skeleton Experience Section */}
                            <div className="skeleton-form-card">
                                <div className="skeleton-line" style={{ width: '180px', height: '1.25rem', marginBottom: '1rem' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="skeleton-circle" style={{ width: '60px', height: '60px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton-line medium" />
                                        <div className="skeleton-line long" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skeleton Sidebar */}
                        <div className="doctor-sidebar">
                            <div className="skeleton-form-card">
                                <div className="skeleton-line" style={{ width: '160px', height: '1.25rem', marginBottom: '1.5rem' }} />
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div className="skeleton" style={{ flex: 1, height: '80px', borderRadius: '0.75rem' }} />
                                    <div className="skeleton" style={{ flex: 1, height: '80px', borderRadius: '0.75rem' }} />
                                </div>
                                <div className="skeleton-line long" style={{ marginBottom: '0.5rem' }} />
                                <div className="skeleton-line long" style={{ marginBottom: '1.5rem' }} />
                                <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '0.75rem' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="doctor-detail-page">
                <div className="doctor-detail-container">
                    <div className="doctor-not-found">
                        <h2>Doctor Not Found</h2>
                        <p>The doctor you're looking for doesn't exist or has been removed.</p>
                        <button onClick={() => navigate('/doctors')} className="back-btn">
                            <ArrowLeft size={18} />
                            Back to Doctors
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-detail-page">
            <div className="doctor-detail-container">
                {/* Back Button */}
                <button onClick={() => navigate('/doctors')} className="back-link">
                    <ArrowLeft size={18} />
                    Back to all doctors
                </button>

                <div className="doctor-detail-grid">
                    {/* Main Content */}
                    <div className="doctor-main-content">
                        {/* Profile Header */}
                        <div className="doctor-profile-header">
                            <div className="doctor-profile-avatar">
                                {doctor.profileImage ? (
                                    <img src={doctor.profileImage} alt={doctor.fullName} />
                                ) : (
                                    <span>{doctor.firstName[0]}{doctor.lastName[0]}</span>
                                )}
                            </div>
                            <div className="doctor-profile-info">
                                <div className="doctor-name-row">
                                    <h1>Dr. {doctor.fullName}</h1>
                                    {doctor.isVerified && (
                                        <span className="verified-badge-large">
                                            <CheckCircle size={16} />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="doctor-specialization-text">{doctor.specialization}</p>

                                <div className="doctor-quick-stats">
                                    <div className="quick-stat">
                                        <Clock size={16} />
                                        <span>{doctor.experienceYears || 0} years exp.</span>
                                    </div>
                                    <div className="quick-stat">
                                        <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                                        <span>{doctor.averageRating?.toFixed(1) || '0.0'} ({doctor.totalReviews || 0} reviews)</span>
                                    </div>
                                </div>

                                <div className="doctor-availability-badges">
                                    {doctor.isAvailableOnline && (
                                        <span className="availability-badge online">
                                            <Video size={14} />
                                            Online Consultations
                                        </span>
                                    )}
                                    {doctor.isAvailableClinic && (
                                        <span className="availability-badge clinic">
                                            <Building size={14} />
                                            Clinic Visits
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        {doctor.bio && (
                            <div className="doctor-section">
                                <h2>About</h2>
                                <p className="doctor-bio">{doctor.bio}</p>
                            </div>
                        )}

                        {/* Qualifications & Clinic Location - Side by Side */}
                        <div className="doctor-info-grid">
                            {/* Qualifications */}
                            {doctor.qualification && (
                                <div className="doctor-section">
                                    <h2><GraduationCap size={20} /> Qualifications</h2>
                                    <div className="qualifications-list">
                                        {doctor.qualification.split(',').map((qual: string, index: number) => (
                                            <span key={index} className="qualification-tag">
                                                {qual.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clinic Location */}
                            {doctor.clinicAddress && (
                                <div className="doctor-section">
                                    <h2><MapPin size={20} /> Clinic Location</h2>
                                    <div className="clinic-info">
                                        <p>{doctor.clinicAddress}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Experience */}
                        <div className="doctor-section">
                            <h2><Award size={20} /> Experience & Expertise</h2>
                            <div className="experience-card">
                                <div className="experience-years">
                                    <span className="years-number">{doctor.experienceYears || 0}</span>
                                    <span className="years-label">Years of Experience</span>
                                </div>
                                <p className="experience-text">
                                    Specialized in {doctor.specialization} with extensive experience in patient care and treatment.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="doctor-sidebar">
                        <div className="booking-card">
                            <h3>Book an Appointment</h3>

                            {/* Consultation Type Selection */}
                            <div className="consultation-type-selector">
                                {doctor.isAvailableOnline && (
                                    <button
                                        className={`type-option ${selectedConsultationType === 'online' ? 'active' : ''}`}
                                        onClick={() => setSelectedConsultationType('online')}
                                    >
                                        <Video size={20} />
                                        <span>Online</span>
                                        <span className="type-price">₹{doctor.consultationFeeOnline || 0}</span>
                                    </button>
                                )}
                                {doctor.isAvailableClinic && (
                                    <button
                                        className={`type-option ${selectedConsultationType === 'clinic' ? 'active' : ''}`}
                                        onClick={() => setSelectedConsultationType('clinic')}
                                    >
                                        <Building size={20} />
                                        <span>Clinic</span>
                                        <span className="type-price">₹{doctor.consultationFeeClinic || 0}</span>
                                    </button>
                                )}
                            </div>

                            <div className="booking-summary">
                                <div className="summary-row">
                                    <span>Consultation Fee</span>
                                    <span className="summary-value">
                                        ₹{selectedConsultationType === 'online'
                                            ? doctor.consultationFeeOnline || 0
                                            : doctor.consultationFeeClinic || 0}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span>Duration</span>
                                    <span className="summary-value">30 mins</span>
                                </div>
                            </div>

                            <button className="book-appointment-btn" onClick={handleBookAppointment}>
                                <Calendar size={18} />
                                Book Appointment
                            </button>

                            {!isAuthenticated && (
                                <p className="login-hint">
                                    Please <a href="/login">login</a> to book an appointment
                                </p>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="contact-card">
                            <h4>Need Help?</h4>
                            <p>Contact our support team for assistance with booking</p>
                            <a href="tel:+911234567890" className="contact-link">
                                <Phone size={16} />
                                +91 123-456-7890
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {doctor && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    doctor={doctor}
                    defaultConsultationType={selectedConsultationType}
                />
            )}
        </div>
    );
};
