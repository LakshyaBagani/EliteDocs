import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../Button/Button';
import { Activity, Menu, X, ChevronRight, LayoutDashboard, LogOut } from 'lucide-react';

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

    return (
        <nav className={`nav-sticky transition-all duration-300 ${scrolled ? 'h-16 py-0 shadow-soft' : 'h-24 py-4'}`}>
            <div className="site-container h-full flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2.5 no-underline group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-elite group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-secondary font-heading">
                        Elite<span className="text-primary">Docs</span>
                    </span>
                </Link>

                {/* Main Navigation - Desktop */}
                <div className="hidden lg:flex items-center gap-12">
                    {!isAuthenticated && ['Find Doctors', 'About Platform', 'Specializations'].map((item) => (
                        <Link
                            key={item}
                            to={`/${item.toLowerCase().replace(' ', '-')}`}
                            className="text-sm font-semibold text-text-muted hover:text-primary transition-colors tracking-wide"
                        >
                            {item}
                        </Link>
                    ))}
                    {isAuthenticated && (
                        <span className="text-sm font-semibold text-text-muted">
                            Dashboard
                        </span>
                    )}
                </div>

                {/* Action Buttons - Desktop */}
                <div className="hidden lg:flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/dashboard"
                                className="w-11 h-11 border border-border-subtle rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light transition-all"
                                title="Dashboard"
                            >
                                <LayoutDashboard size={20} />
                            </Link>
                            <div className="h-4 w-[1px] bg-border-subtle" />
                            <div className="flex items-center gap-3 px-4 py-2 bg-bg-alt rounded-full border border-border-subtle">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                    {user?.firstName?.charAt(0)}
                                </div>
                                <span className="text-[13px] font-bold text-secondary uppercase tracking-wider">{user?.firstName}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-text-muted hover:text-red-500 p-2 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-bold text-secondary px-6 hover:text-primary transition-colors">
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
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Menu Slide-down */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-border-subtle p-8 lg:hidden animate-fade-in shadow-elite">
                    <div className="flex flex-col gap-8">
                        {['Find Doctors', 'About Platform', 'Specializations'].map(item => (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase().replace(' ', '-')}`}
                                className="text-xl font-bold text-secondary hover:text-primary no-underline"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <hr className="border-border-subtle" />
                        {isAuthenticated ? (
                            <div className="flex flex-col gap-6">
                                <Link to="/dashboard" className="flex items-center gap-3 text-lg font-bold text-secondary" onClick={() => setIsMenuOpen(false)}>
                                    <LayoutDashboard className="text-primary" /> Dashboard
                                </Link>
                                <button onClick={handleLogout} className="flex items-center gap-3 text-lg font-bold text-red-500">
                                    <LogOut /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="btn-elite btn-ghost w-full py-4 text-lg">Login</Button>
                                </Link>
                                <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="btn-elite btn-primary w-full py-4 text-lg">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
