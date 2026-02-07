import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ 
    handleLogout, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
}) => {
    const handleNavClick = () => {
        if (window.innerWidth <= 768) {
            setIsMobileMenuOpen(false);
        }
    };
    return (
        <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`} id="sidebar">
            <div className="logo-section">
                <a href="/" className="logo">
                    <img src="/FGlogo.png" alt="FITNESS GURU Logo" />
                    <span>FITNESS GURU</span>
                </a>
            </div>

            <div className="nav-menu">
                <div className="nav-item">
                    <NavLink 
                        to="/admin-dashboard/dashboard"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        <i className="fas fa-home"></i>
                        Dashboard
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink 
                        to="/admin-dashboard/members"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        <i className="fas fa-users"></i>
                        Members Management
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink 
                        to="/admin-dashboard/subscriptions"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        <i className="fas fa-credit-card"></i>
                        Subscription Management
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink 
                        to="/admin-dashboard/attendance"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        <i className="fas fa-calendar-check"></i>
                        Attendance Management
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink 
                        to="/admin-dashboard/staff"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        <i className="fas fa-user-tie"></i>
                        Staff Management
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink 
                        to="/admin-dashboard/branches"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        <i className="fas fa-building"></i>
                        Branch Management
                    </NavLink>
                </div>
            </div>

            <div className="logout-section">
                <button className="logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;