import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Mail, Lock, User, Phone, Stethoscope, UserRound, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import './Auth.css';

interface RegisterForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: 'PATIENT' | 'DOCTOR';
}

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>();
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');

    // Handle redirection after successful registration/auth update
    React.useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'DOCTOR') {
                navigate('/doctor/profile/setup');
            } else if (user.role === 'PATIENT') {
                navigate('/patient/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Check for redirect from login
    React.useEffect(() => {
        if (location.state?.email && location.state?.showOtp) {
            setValue('email', location.state.email);
            setShowOtp(true);
            toast.info('Please verify your email to continue.');
        }
    }, [location.state, setValue]);

    const password = watch('password');

    const onSubmit = async (data: RegisterForm) => {
        if (showOtp) {
            await handleVerifyOtp();
            return;
        }

        setIsLoading(true);
        try {
            await authService.register({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role: selectedRole
            });
            setShowOtp(true);
            toast.success('Registration successful! Please check your email for OTP.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        try {
            const email = watch('email');
            const response = await authService.verifyOtp(email, otp);
            login(response);
            toast.success('Email verified successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const email = watch('email');
            await authService.resendOtp(email);
            toast.success('OTP sent successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <div className="auth-header">
                    <div className="auth-icon">
                        <Stethoscope size={36} />
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join EliteDocs and get started today</p>
                </div>

                {/* Role Selection */}
                {!showOtp && (
                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-option ${selectedRole === 'PATIENT' ? 'active' : ''}`}
                            onClick={() => setSelectedRole('PATIENT')}
                        >
                            <div className="role-icon">
                                <UserRound size={24} />
                            </div>
                            <span className="role-label">I'm a Patient</span>
                        </button>
                        <button
                            type="button"
                            className={`role-option ${selectedRole === 'DOCTOR' ? 'active' : ''}`}
                            onClick={() => setSelectedRole('DOCTOR')}
                        >
                            <div className="role-icon">
                                <Stethoscope size={24} />
                            </div>
                            <span className="role-label">I'm a Doctor</span>
                        </button>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    {!showOtp ? (
                        <>
                            <div className="form-row">
                                <div className="input-group">
                                    <label className="input-label">First Name</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">
                                            <User size={20} />
                                        </span>
                                        <input
                                            className="auth-input"
                                            type="text"
                                            placeholder="John"
                                            {...register('firstName', { required: 'First name is required' })}
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <span className="input-error">{errors.firstName.message}</span>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Last Name</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">
                                            <User size={20} />
                                        </span>
                                        <input
                                            className="auth-input"
                                            type="text"
                                            placeholder="Doe"
                                            {...register('lastName', { required: 'Last name is required' })}
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <span className="input-error">{errors.lastName.message}</span>
                                    )}
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Mail size={20} />
                                    </span>
                                    <input
                                        className="auth-input"
                                        type="email"
                                        placeholder="john@example.com"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: 'Invalid email format'
                                            }
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <span className="input-error">{errors.email.message}</span>
                                )}
                            </div>

                            <div className="input-group">
                                <label className="input-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Phone size={20} />
                                    </span>
                                    <input
                                        className="auth-input"
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        {...register('phone')}
                                    />
                                </div>
                                {errors.phone && (
                                    <span className="input-error">{errors.phone.message}</span>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">
                                            <Lock size={20} />
                                        </span>
                                        <input
                                            className="auth-input"
                                            type="password"
                                            placeholder="••••••••"
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Minimum 6 characters'
                                                }
                                            })}
                                        />
                                    </div>
                                    {errors.password && (
                                        <span className="input-error">{errors.password.message}</span>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">
                                            <Lock size={20} />
                                        </span>
                                        <input
                                            className="auth-input"
                                            type="password"
                                            placeholder="••••••••"
                                            {...register('confirmPassword', {
                                                required: 'Please confirm password',
                                                validate: value => value === password || 'Passwords do not match'
                                            })}
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <span className="input-error">{errors.confirmPassword.message}</span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="spinner" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="otp-verification">
                            <div className="input-group">
                                <label className="input-label">Enter OTP</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Lock size={20} />
                                    </span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <p className="input-helper">
                                    We sent a code to {watch('email')}.{' '}
                                    <button type="button" onClick={handleResendOtp} className="text-link">
                                        Resend
                                    </button>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                className="auth-submit-btn"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? (
                                    <span className="spinner" />
                                ) : (
                                    <>
                                        Verify Email
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
