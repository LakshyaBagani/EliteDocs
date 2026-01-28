import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { Search, Star, Video, Building, ChevronLeft, ChevronRight, ArrowRight, UserSearch, CheckCircle } from 'lucide-react';
import type { Doctor, PagedResponse } from '../../types';
import './Doctors.css';

export const Doctors: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [selectedSpec, setSelectedSpec] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadDoctors();
        loadSpecializations();
    }, [page, selectedSpec]);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            let data: PagedResponse<Doctor>;
            if (selectedSpec || searchTerm) {
                data = await doctorService.searchDoctors({
                    specialization: selectedSpec || searchTerm,
                    page,
                    size: 9
                });
            } else {
                data = await doctorService.getDoctors(page, 9);
            }
            setDoctors(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to load doctors', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSpecializations = async () => {
        try {
            const data = await doctorService.getSpecializations();
            setSpecializations(data);
        } catch (error) {
            console.error('Failed to load specializations', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        loadDoctors();
    };

    return (
        <div className="doctors-page">
            <div className="doctors-container">
                {/* Header */}
                <div className="doctors-header">
                    <h1>Find Your <span>Doctor</span></h1>
                    <p>Browse our network of certified healthcare professionals ready to provide exceptional care</p>
                </div>

                {/* Search Section */}
                <div className="doctors-search-section">
                    <div className="doctors-search-row">
                        <div className="doctors-search-input-wrapper">
                            <Search size={20} className="doctors-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name or specialization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button className="doctors-search-btn" onClick={handleSearch}>
                            <Search size={18} />
                            Search
                        </button>
                    </div>

                    <div className="doctors-filters">
                        <button
                            className={`doctors-filter-pill ${selectedSpec === '' ? 'active' : ''}`}
                            onClick={() => setSelectedSpec('')}
                        >
                            All Specialists
                        </button>
                        {specializations.slice(0, 6).map((spec) => (
                            <button
                                key={spec}
                                className={`doctors-filter-pill ${selectedSpec === spec ? 'active' : ''}`}
                                onClick={() => setSelectedSpec(spec)}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Doctors Grid */}
                {loading ? (
                    <div className="doctors-loading-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="doctor-card-skeleton">
                                <div className="skeleton-header" />
                                <div className="skeleton-body">
                                    <div className="skeleton-line medium" />
                                    <div className="skeleton-line short" />
                                    <div className="skeleton-line short" />
                                    <div className="skeleton-line" />
                                    <div className="skeleton-line medium" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="doctors-empty">
                        <div className="doctors-empty-icon">
                            <UserSearch size={36} />
                        </div>
                        <h3>No doctors found</h3>
                        <p>Try adjusting your search criteria or browse all specialists</p>
                    </div>
                ) : (
                    <div className="doctors-grid">
                        {doctors.map((doctor) => (
                            <DoctorCard key={doctor.id} doctor={doctor} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="doctors-pagination">
                        <button
                            className="pagination-btn"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <div className="pagination-info">
                            Page <span>{page + 1}</span> of <span>{totalPages}</span>
                        </div>
                        <button
                            className="pagination-btn"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
    return (
        <div className="doctor-card">
            <Link to={`/doctors/${doctor.id}`} className="doctor-card-link">
                {/* Header */}
                <div className="doctor-card-header">
                    <div className="doctor-avatar">
                        {doctor.profileImage ? (
                            <img src={doctor.profileImage} alt={doctor.fullName} />
                        ) : (
                            <span>{doctor.firstName[0]}{doctor.lastName[0]}</span>
                        )}
                    </div>
                    {doctor.isVerified && (
                        <span className="verified-badge">
                            <CheckCircle size={14} />
                            Verified
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="doctor-card-body">
                    <h3 className="doctor-name">Dr. {doctor.fullName}</h3>
                    <p className="doctor-specialization">{doctor.specialization}</p>
                    <p className="doctor-experience">{doctor.experienceYears || 0} years experience</p>

                    <div className="doctor-rating">
                        <div className="doctor-rating-stars">
                            <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                        </div>
                        <span className="doctor-rating-value">{doctor.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="doctor-rating-count">({doctor.totalReviews || 0} reviews)</span>
                    </div>

                    <div className="doctor-availability">
                        {doctor.isAvailableOnline && (
                            <span className="availability-tag online">
                                <Video size={14} />
                                Online
                            </span>
                        )}
                        {doctor.isAvailableClinic && (
                            <span className="availability-tag clinic">
                                <Building size={14} />
                                Clinic
                            </span>
                        )}
                    </div>

                    <div className="doctor-fees">
                        {doctor.consultationFeeOnline && (
                            <div className="fee-item">
                                Online: <span>₹{doctor.consultationFeeOnline}</span>
                            </div>
                        )}
                        {doctor.consultationFeeClinic && (
                            <div className="fee-item">
                                Clinic: <span>₹{doctor.consultationFeeClinic}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="doctor-card-footer">
                    <button className="book-btn">
                        Book Appointment
                        <ArrowRight size={18} />
                    </button>
                </div>
            </Link>
        </div>
    );
};
