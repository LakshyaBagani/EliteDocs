import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../Button/Button';
import {
    Activity,
    Menu,
    X,
    ChevronRight,
    LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const getDashboardPath = () => {
        if (user?.role === 'DOCTOR') return '/doctor/dashboard';
        if (user?.role === 'ADMIN') return '/admin/dashboard';
        return '/patient/dashboard';
    };

    return (
        <nav className={`nav-sticky transition-all duration-300 ${scrolled ? 'h-16 py-0 shadow-soft' : 'h-20 py-2'}`}>
            <div style={{ padding: '0 3.5rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo — Left */}
                <Link to={isAuthenticated ? getDashboardPath() : '/'} className="flex items-center gap-2.5 no-underline group">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-elite group-hover:scale-110 transition-transform">
                        <Activity size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-secondary font-heading">
                        Elite<span className="text-primary">Docs</span>
                    </span>
                </Link>

                {/* Center links — only for unauthenticated */}
                {!isAuthenticated && (
                    <div className="hidden lg:flex items-center gap-1">
                        {['Find Doctors', 'About Platform', 'Specializations'].map((item) => (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase().replace(' ', '-')}`}
                                className="text-sm font-semibold text-text-muted hover:text-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-all"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right — User + Logout (authenticated) or Login/Register */}
                <div className="hidden lg:flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border-subtle">
                                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-[11px] font-bold text-white uppercase">
                                    {user?.firstName?.charAt(0)}
                                </div>
                                <span className="text-[13px] font-bold text-secondary uppercase tracking-wider">
                                    {user?.firstName}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-bold text-secondary px-5 hover:text-primary transition-colors">
                                Login
                            </Link>
                            <Link to="/register">
                                <Button className="btn-elite btn-primary">
                                    Join for Free
                                    <ChevronRight size={18} />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-secondary hover:bg-bg-alt rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-border-subtle p-6 lg:hidden animate-fade-in shadow-elite z-50">
                    <div className="flex flex-col gap-2">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                                        {user?.firstName?.charAt(0)}
                                    </div>
                                    <span className="text-base font-bold text-secondary">{user?.firstName}</span>
                                </div>
                                <hr className="border-border-subtle my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-base font-semibold text-red-500 px-4 py-3 rounded-lg hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                {['Find Doctors', 'About Platform', 'Specializations'].map(item => (
                                    <Link
                                        key={item}
                                        to={`/${item.toLowerCase().replace(' ', '-')}`}
                                        className="text-base font-semibold text-secondary hover:text-primary px-4 py-3 rounded-lg hover:bg-primary-light no-underline transition-all"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                ))}
                                <hr className="border-border-subtle my-2" />
                                <div className="flex flex-col gap-3 mt-2">
                                    <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="btn-elite btn-ghost w-full py-3">Login</Button>
                                    </Link>
                                    <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="btn-elite btn-primary w-full py-3">Get Started</Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
