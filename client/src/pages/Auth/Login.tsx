import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Mail, Lock, Stethoscope, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import './Auth.css';

interface LoginForm {
    email: string;
    password: string;
}

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [adminMode, setAdminMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

    const handleTitleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount === 5) {
            setAdminMode(true);
            toast.info("Admin mode activated");
        }
    };

    // Handle redirection after successful login/auth update
    React.useEffect(() => {
        if (isAuthenticated && user) {
            console.log('Auth state updated, checking redirection. Role:', user.role);
            if (user.role === 'DOCTOR') {
                if (user.profileCompleted) {
                    navigate('/doctor/dashboard');
                } else {
                    navigate('/doctor/profile/setup');
                }
            } else if (user.role === 'PATIENT') {
                navigate('/patient/dashboard');
            } else if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            login(response);
            toast.success('Login successful!');

            // Immediate navigation based on role from response
            const userRole = response.user.role;
            console.log('Login successful, redirecting for role:', userRole);

            if (userRole === 'DOCTOR') {
                if (response.user.profileCompleted) {
                    navigate('/doctor/dashboard');
                } else {
                    navigate('/doctor/profile/setup');
                }
            } else if (userRole === 'PATIENT') {
                navigate('/patient/dashboard');
            } else if (userRole === 'ADMIN') {
                navigate('/admin/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Login failed';

            if (errorMessage === 'Email not verified') {
                toast.warning('Please verify your email first');
                navigate('/register', {
                    state: {
                        email: data.email,
                        showOtp: true
                    }
                });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <Stethoscope size={36} />
                    </div>
                    <h1 className="auth-title" onClick={handleTitleClick} style={{ cursor: clickCount > 0 ? 'pointer' : 'default' }}>
                        {adminMode ? "Admin Access" : "Welcome Back"}
                    </h1>
                    <p className="auth-subtitle">
                        {adminMode ? "Enter super admin credentials" : "Sign in to continue to EliteDocs"}
                    </p>
                </div>

                {adminMode && (
                    <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontSize: '0.875rem' }}>
                        <ShieldCheck size={16} />
                        Super Admin Mode Active
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <Mail size={20} />
                            </span>
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="Enter your email"
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
                        <label className="input-label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <Lock size={20} />
                            </span>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="Enter your password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                            />
                        </div>
                        {errors.password && (
                            <span className="input-error">{errors.password.message}</span>
                        )}
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
                                Sign In
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/register">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
