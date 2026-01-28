import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button/Button';
import { Calendar, Video, Shield, ArrowRight, Star, Check, Users, Clock, Heart, Activity, Stethoscope, Phone } from 'lucide-react';
import './Home.css';

export const Home: React.FC = () => {
    return (
        <main className="home-page">

            {/* HERO */}
            <section className="hero-section">
                <div className="site-container">
                    <div className="hero-grid">
                        {/* Left */}
                        <div className="hero-content fade-in">
                            <div className="hero-badge">
                                <Activity size={16} />
                                <span>#1 Trusted Healthcare Platform</span>
                            </div>

                            <h1 className="hero-title">
                                Expert Medical Care,{' '}
                                <span className="text-primary">Anytime, Anywhere</span>
                            </h1>

                            <p className="hero-subtitle">
                                Connect with 500+ verified doctors instantly. Get prescriptions,
                                medical advice, and follow-ups through secure HD video calls.
                            </p>

                            <div className="hero-buttons">
                                <Link to="/doctors">
                                    <Button className="btn-elite btn-primary">
                                        Book Consultation <ArrowRight size={18} />
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="btn-elite btn-ghost">
                                        View All Doctors
                                    </Button>
                                </Link>
                            </div>

                            <div className="trust-badges">
                                <div className="trust-item"><Check size={20} color="#22c55e" /> Free Consultation</div>
                                <div className="trust-item"><Check size={20} color="#22c55e" /> 24/7 Available</div>
                                <div className="trust-item"><Check size={20} color="#22c55e" /> 100% Secure</div>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="hero-card fade-in delay-1">
                            <div className="doctor-preview">
                                <div className="doctor-info">
                                    <div className="doctor-avatar">
                                        <Calendar size={32} />
                                    </div>
                                    <div>
                                        <div className="doctor-name">Book a Consultation</div>
                                        <div className="doctor-spec">Choose from 30+ Specialties</div>
                                    </div>
                                </div>
                                <div className="doctor-stats">
                                    <span><Star size={16} fill="white" /> 500+ Doctors</span>
                                    <span><Users size={16} /> 50K+ Consultations</span>
                                </div>
                            </div>

                            <div className="quick-stats">
                                <div className="stat-mini hover-lift">
                                    <Clock size={24} color="#2563eb" />
                                    <div className="stat-value">{"< 2 min"}</div>
                                    <div className="stat-label">Avg. Wait</div>
                                </div>
                                <div className="stat-mini hover-lift">
                                    <Heart size={24} color="#ef4444" />
                                    <div className="stat-value">98%</div>
                                    <div className="stat-label">Satisfaction</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="section-white">
                <div className="site-container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Get started in 3 simple steps</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card hover-lift fade-in">
                            <div className="step-number">1</div>
                            <h3>Find Your Doctor</h3>
                            <p>Browse our network of 500+ verified specialists and choose the right one for you.</p>
                        </div>
                        <div className="step-card hover-lift fade-in delay-1">
                            <div className="step-number">2</div>
                            <h3>Book Appointment</h3>
                            <p>Select a convenient time slot. Get instant confirmation with no waiting.</p>
                        </div>
                        <div className="step-card hover-lift fade-in delay-2">
                            <div className="step-number">3</div>
                            <h3>Start Consultation</h3>
                            <p>Connect via secure HD video call. Get prescriptions and follow-up care.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="section-gray">
                <div className="site-container">
                    <div className="section-header">
                        <h2>Why Choose Us</h2>
                        <p>Everything you need for quality healthcare</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card hover-lift">
                            <div className="feature-icon"><Calendar size={28} /></div>
                            <h3>Easy Scheduling</h3>
                            <p>Book appointments in seconds with real-time doctor availability.</p>
                        </div>
                        <div className="feature-card hover-lift">
                            <div className="feature-icon"><Video size={28} /></div>
                            <h3>HD Video Calls</h3>
                            <p>Crystal-clear video consultations from the comfort of your home.</p>
                        </div>
                        <div className="feature-card hover-lift">
                            <div className="feature-icon"><Shield size={28} /></div>
                            <h3>100% Private</h3>
                            <p>Your health data is encrypted with bank-level security.</p>
                        </div>
                        <div className="feature-card hover-lift">
                            <div className="feature-icon"><Phone size={28} /></div>
                            <h3>24/7 Support</h3>
                            <p>Our care team is always available to help you anytime.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="stats-section">
                <div className="site-container">
                    <div className="stats-grid">
                        <div className="stat-item"><span className="stat-num">500+</span><span>Verified Doctors</span></div>
                        <div className="stat-item"><span className="stat-num">50K+</span><span>Consultations</span></div>
                        <div className="stat-item"><span className="stat-num">4.9</span><span>User Rating</span></div>
                        <div className="stat-item"><span className="stat-num">24/7</span><span>Available</span></div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="site-container">
                    <h2>Ready to Take Control of Your Health?</h2>
                    <p>Join thousands of patients who trust EliteDocs. Your first consultation is free!</p>
                    <Link to="/register">
                        <Button className="btn-elite btn-primary btn-large">
                            Get Started for Free <ArrowRight size={20} />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="site-container footer-content">
                    <div className="footer-brand">Elite<span>Docs</span></div>
                    <div className="footer-copy">© 2026 EliteDocs. All rights reserved.</div>
                    <div className="footer-links">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Contact</span>
                    </div>
                </div>
            </footer>
        </main>
    );
};

export default Home;
