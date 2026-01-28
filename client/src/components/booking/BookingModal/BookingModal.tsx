import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, Video, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { appointmentService } from '../../../services/appointmentService';
import { toast } from 'react-toastify';
import type { Doctor, Availability } from '../../../types';
import './BookingModal.css';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor;
    defaultConsultationType: 'online' | 'clinic';
}

interface TimeSlot {
    time: string;
    available: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    doctor,
    defaultConsultationType
}) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'datetime' | 'details' | 'confirm' | 'success'>(
        'datetime'
    );
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [consultationType, setConsultationType] = useState<'ONLINE' | 'CLINIC'>(
        defaultConsultationType.toUpperCase() as 'ONLINE' | 'CLINIC'
    );
    const [reason, setReason] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    useEffect(() => {
        if (selectedDate && doctor.availabilities) {
            generateTimeSlots(selectedDate);
        }
    }, [selectedDate, doctor.availabilities]);

    const generateTimeSlots = (date: string) => {
        const selectedDateObj = new Date(date);
        const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

        // Find availability for the selected day
        const dayAvailability = doctor.availabilities?.find(
            (a: Availability) => a.dayOfWeek.toUpperCase() === dayOfWeek
        );

        if (!dayAvailability) {
            setAvailableSlots([]);
            return;
        }

        const slots: TimeSlot[] = [];
        const startTime = dayAvailability.startTime;
        const endTime = dayAvailability.endTime;
        const duration = dayAvailability.slotDurationMinutes || 30;

        // Parse time strings
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        let currentHour = startHour;
        let currentMin = startMin;

        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
            const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
            slots.push({ time: timeStr, available: true });

            // Add duration
            currentMin += duration;
            if (currentMin >= 60) {
                currentHour += Math.floor(currentMin / 60);
                currentMin = currentMin % 60;
            }
        }

        setAvailableSlots(slots);
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days ahead
        return maxDate.toISOString().split('T')[0];
    };

    const handleNext = () => {
        if (step === 'datetime' && selectedDate && selectedTime) {
            setStep('details');
        } else if (step === 'details') {
            setStep('confirm');
        }
    };

    const handleBack = () => {
        if (step === 'details') setStep('datetime');
        else if (step === 'confirm') setStep('details');
    };

    const handleBook = async () => {
        setLoading(true);
        try {
            await appointmentService.bookAppointment({
                doctorId: doctor.id,
                appointmentDate: selectedDate,
                slotTime: selectedTime + ':00',
                consultationType,
                reason,
                symptoms
            });
            setStep('success');
            toast.success('Appointment booked successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('datetime');
        setSelectedDate('');
        setSelectedTime('');
        setReason('');
        setSymptoms('');
        onClose();
    };

    const getFee = () => {
        return consultationType === 'ONLINE'
            ? doctor.consultationFeeOnline
            : doctor.consultationFeeClinic;
    };

    if (!isOpen) return null;

    return (
        <div className="booking-modal-overlay" onClick={handleClose}>
            <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleClose}>
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="booking-modal-header">
                    <h2>Book Appointment</h2>
                    <p>with Dr. {doctor.fullName}</p>
                </div>

                {/* Progress Steps */}
                {step !== 'success' && (
                    <div className="booking-steps">
                        <div className={`booking-step ${step === 'datetime' ? 'active' : ''} ${['details', 'confirm'].includes(step) ? 'completed' : ''}`}>
                            <span className="step-num">1</span>
                            <span className="step-label">Date & Time</span>
                        </div>
                        <div className={`booking-step ${step === 'details' ? 'active' : ''} ${step === 'confirm' ? 'completed' : ''}`}>
                            <span className="step-num">2</span>
                            <span className="step-label">Details</span>
                        </div>
                        <div className={`booking-step ${step === 'confirm' ? 'active' : ''}`}>
                            <span className="step-num">3</span>
                            <span className="step-label">Confirm</span>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="booking-modal-content">
                    {step === 'datetime' && (
                        <>
                            {/* Consultation Type */}
                            <div className="booking-section">
                                <label>Consultation Type</label>
                                <div className="consultation-options">
                                    {doctor.isAvailableOnline && (
                                        <button
                                            className={`consultation-option ${consultationType === 'ONLINE' ? 'active' : ''}`}
                                            onClick={() => setConsultationType('ONLINE')}
                                        >
                                            <Video size={20} />
                                            <span>Online</span>
                                            <span className="option-price">₹{doctor.consultationFeeOnline}</span>
                                        </button>
                                    )}
                                    {doctor.isAvailableClinic && (
                                        <button
                                            className={`consultation-option ${consultationType === 'CLINIC' ? 'active' : ''}`}
                                            onClick={() => setConsultationType('CLINIC')}
                                        >
                                            <Building size={20} />
                                            <span>Clinic</span>
                                            <span className="option-price">₹{doctor.consultationFeeClinic}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="booking-section">
                                <label><Calendar size={16} /> Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime('');
                                    }}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    className="date-input"
                                />
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div className="booking-section">
                                    <label><Clock size={16} /> Select Time Slot</label>
                                    {availableSlots.length > 0 ? (
                                        <div className="time-slots-grid">
                                            {availableSlots.map((slot) => (
                                                <button
                                                    key={slot.time}
                                                    className={`time-slot ${selectedTime === slot.time ? 'active' : ''} ${!slot.available ? 'disabled' : ''}`}
                                                    onClick={() => slot.available && setSelectedTime(slot.time)}
                                                    disabled={!slot.available}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-slots-message">
                                            <AlertCircle size={20} />
                                            <p>No slots available on this day. Please select another date.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {step === 'details' && (
                        <>
                            <div className="booking-section">
                                <label>Reason for Visit</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., General checkup, Follow-up..."
                                    className="text-input"
                                />
                            </div>

                            <div className="booking-section">
                                <label>Symptoms (Optional)</label>
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Describe your symptoms..."
                                    className="textarea-input"
                                    rows={3}
                                />
                            </div>
                        </>
                    )}

                    {step === 'confirm' && (
                        <div className="confirmation-summary">
                            <h3>Booking Summary</h3>

                            <div className="summary-item">
                                <span className="summary-label">Doctor</span>
                                <span className="summary-value">Dr. {doctor.fullName}</span>
                            </div>

                            <div className="summary-item">
                                <span className="summary-label">Specialization</span>
                                <span className="summary-value">{doctor.specialization}</span>
                            </div>

                            <div className="summary-item">
                                <span className="summary-label">Date</span>
                                <span className="summary-value">
                                    {new Date(selectedDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className="summary-item">
                                <span className="summary-label">Time</span>
                                <span className="summary-value">{selectedTime}</span>
                            </div>

                            <div className="summary-item">
                                <span className="summary-label">Type</span>
                                <span className="summary-value">
                                    {consultationType === 'ONLINE' ? 'Online Consultation' : 'Clinic Visit'}
                                </span>
                            </div>

                            {reason && (
                                <div className="summary-item">
                                    <span className="summary-label">Reason</span>
                                    <span className="summary-value">{reason}</span>
                                </div>
                            )}

                            <div className="summary-item total">
                                <span className="summary-label">Total Amount</span>
                                <span className="summary-value">₹{getFee()}</span>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="success-content">
                            <div className="success-icon">
                                <CheckCircle size={64} />
                            </div>
                            <h3>Appointment Booked!</h3>
                            <p>Your appointment has been successfully booked.</p>
                            <p className="success-details">
                                {new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })} at {selectedTime}
                            </p>
                            <p className="success-note">
                                You will receive a confirmation email shortly.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="booking-modal-footer">
                    {step === 'datetime' && (
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                            disabled={!selectedDate || !selectedTime}
                        >
                            Continue
                        </button>
                    )}

                    {step === 'details' && (
                        <>
                            <button className="btn-secondary" onClick={handleBack}>
                                Back
                            </button>
                            <button className="btn-primary" onClick={handleNext}>
                                Review Booking
                            </button>
                        </>
                    )}

                    {step === 'confirm' && (
                        <>
                            <button className="btn-secondary" onClick={handleBack} disabled={loading}>
                                Back
                            </button>
                            <button className="btn-primary" onClick={handleBook} disabled={loading}>
                                {loading ? 'Booking...' : `Confirm & Pay ₹${getFee()}`}
                            </button>
                        </>
                    )}

                    {step === 'success' && (
                        <button className="btn-primary" onClick={() => {
                            handleClose();
                            navigate('/patient/dashboard');
                        }}>
                            Go to Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
