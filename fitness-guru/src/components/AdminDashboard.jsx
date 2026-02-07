import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    
    // Get active section from URL path
    const getActiveSection = () => {
        const path = location.pathname.split('/').pop();
        return path || 'dashboard';
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            alert('Logged out successfully! Redirecting to home page...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    };

    const showComingSoon = (feature) => {
        alert(`${feature} feature is coming soon! 🚀\n\nThis feature is currently under development and will be available in a future update.`);
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (window.innerWidth <= 768 && isMobileMenuOpen) {
                const sidebar = document.getElementById('sidebar');
                const toggle = document.getElementById('mobile-menu-toggle');
                
                if (sidebar && !sidebar.contains(event.target) && 
                    toggle && !toggle.contains(event.target)) {
                    setIsMobileMenuOpen(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    return (
        <div className="admin-dashboard">
            {/* Mobile Menu Toggle */}
            <button 
                className="mobile-menu-toggle" 
                id="mobile-menu-toggle"
                onClick={toggleMobileMenu}
            >
                <i className="fas fa-bars"></i>
            </button>

            {/* Sidebar */}
            <AdminSidebar 
                activeSection={getActiveSection()}
                handleLogout={handleLogout}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Main Content */}
            <div className="admin-main-content">
                {/* Top Right Avatar */}
                <div className="admin-top-avatar">
                    AD
                    <div className="admin-avatar-dropdown">
                        <div className="admin-avatar-info">
                            <div className="admin-avatar-name">Admin User</div>
                            <div className="admin-avatar-email">admin@fitnessguru.com</div>
                        </div>
                        <div className="admin-avatar-actions">
                            <button className="admin-avatar-link" onClick={() => showComingSoon('Admin Profile')}>
                                <i className="fas fa-user-shield"></i>
                                Admin Profile
                            </button>
                            <button className="admin-avatar-link" onClick={() => showComingSoon('System Settings')}>
                                <i className="fas fa-cog"></i>
                                System Settings
                            </button>
                            <button className="admin-avatar-link admin-logout-link" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nested Routes Content */}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminDashboard;