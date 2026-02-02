import React, { useEffect, useState } from "react";
import {
    Activity,
    Calendar,
    DollarSign,
    Users,
    Stethoscope,
    ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { analyticsService } from "../../services/analyticsService";
import type { Analytics } from "../../types";
import "./AdminDashboard.css";

export const AdminDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await analyticsService.getAdminDashboard();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to load admin dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-container">
                    {/* Skeleton Header */}
                    <div className="dashboard-header">
                        <div>
                            <div className="skeleton-line" style={{ height: '2rem', width: '200px', marginBottom: '0.5rem' }} />
                            <div className="skeleton-line" style={{ height: '1rem', width: '280px' }} />
                        </div>
                    </div>

                    {/* Skeleton Stats Grid */}
                    <div className="skeleton-stats-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton-stat-card">
                                <div className="skeleton-line short" />
                                <div className="skeleton-line xshort" style={{ height: '1.5rem' }} />
                            </div>
                        ))}
                    </div>

                    {/* Skeleton Quick Actions */}
                    <div className="skeleton-content-grid" style={{ marginBottom: '2rem' }}>
                        {[1, 2].map((i) => (
                            <div key={i} className="skeleton-section-card" style={{ minHeight: '150px' }}>
                                <div className="skeleton-circle" style={{ width: '48px', height: '48px', marginBottom: '1rem' }} />
                                <div className="skeleton-line medium" style={{ marginBottom: '0.5rem' }} />
                                <div className="skeleton-line long" />
                            </div>
                        ))}
                    </div>

                    {/* Skeleton Activity Card */}
                    <div className="skeleton-section-card" style={{ minHeight: '200px', textAlign: 'center' }}>
                        <div className="skeleton-circle" style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                        <div className="skeleton-line" style={{ width: '160px', margin: '0 auto 0.5rem' }} />
                        <div className="skeleton-line" style={{ width: '80%', margin: '0 auto' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-container">
                {/* Header Section */}
                <div className="dashboard-header animate-fade-in">
                    <div>
                        <h1 className="dashboard-header__title">
                            Admin <span>Dashboard</span>
                        </h1>
                        <p className="dashboard-header__subtitle">
                            Platform overview and performance metrics.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Patients"
                        value={analytics?.totalPatients || 0}
                        icon={<Users size={24} />}
                        colorClass="blue"
                        delay={1}
                    />
                    <StatCard
                        title="Total Doctors"
                        value={analytics?.totalDoctors || 0}
                        icon={<Stethoscope size={24} />}
                        colorClass="purple"
                        delay={2}
                    />
                    <StatCard
                        title="Total Appointments"
                        value={analytics?.totalAppointments || 0}
                        icon={<Calendar size={24} />}
                        colorClass="orange"
                        delay={3}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₹${analytics?.totalRevenue || 0}`}
                        icon={<DollarSign size={24} />}
                        colorClass="emerald"
                        delay={4}
                    />
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="activity-card animate-fade-in animate-delay-4" style={{ textAlign: 'left', padding: '2rem' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="stat-card__icon stat-card__icon--purple">
                                <Stethoscope size={24} />
                            </div>
                            <Link to="/admin/doctors" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>
                        <h3 className="activity-card__title">Manage Doctors</h3>
                        <p className="activity-card__text" style={{ margin: '0' }}>
                            Verify new doctor profiles, manage specializations, and monitor professional credentials.
                        </p>
                    </div>

                    <div className="activity-card animate-fade-in animate-delay-4" style={{ textAlign: 'left', padding: '2rem' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="stat-card__icon stat-card__icon--blue">
                                <Users size={24} />
                            </div>
                            <Link to="/admin/patients" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>
                        <h3 className="activity-card__title">Manage Patients</h3>
                        <p className="activity-card__text" style={{ margin: '0' }}>
                            View patient records, monitor account activity, and manage support requests.
                        </p>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="activity-card recent-activity animate-fade-in animate-delay-4">
                    <div className="activity-card__icon-wrapper">
                        <Activity className="activity-card__icon" size={32} />
                    </div>
                    <h3 className="activity-card__title">Platform Activity</h3>
                    <p className="activity-card__text">
                        Detailed activity logs, user management, and system health monitoring features are coming soon. This dashboard will eventually allow you to verify doctors, manage payments, and view detailed platform analytics.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Subcomponents
const StatCard = ({
    title,
    value,
    icon,
    colorClass,
    delay,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: "blue" | "purple" | "orange" | "emerald";
    delay: number;
}) => (
    <div className={`stat-card stat-card--${colorClass} animate-fade-in animate-delay-${delay}`}>
        <div className="stat-card__header">
            <div className="stat-card__content">
                <p className="stat-card__label">{title}</p>
                <h3 className="stat-card__value">{value}</h3>
            </div>
            <div className={`stat-card__icon stat-card__icon--${colorClass}`}>
                {icon}
            </div>
        </div>
    </div>
);
