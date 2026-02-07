import React from 'react';
import './AdminSidebar.css';

const AdminSidebar = ({ 
    activeSection, 
    showSection, 
    handleLogout, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
}) => {
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
                    <button 
                        className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
                        onClick={() => showSection('dashboard')}
                    >
                        <i className="fas fa-home"></i>
                        Dashboard
                    </button>
                </div>
                <div className="nav-item">
                    <button 
                        className={`nav-link ${activeSection === 'members' ? 'active' : ''}`}
                        onClick={() => showSection('members')}
                    >
                        <i className="fas fa-users"></i>
                        Members Management
                    </button>
                </div>
                <div className="nav-item">
                    <button 
                        className={`nav-link ${activeSection === 'subscriptions' ? 'active' : ''}`}
                        onClick={() => showSection('subscriptions')}
                    >
                        <i className="fas fa-credit-card"></i>
                        Subscription Management
                    </button>
                </div>
                <div className="nav-item">
                    <button 
                        className={`nav-link ${activeSection === 'attendance' ? 'active' : ''}`}
                        onClick={() => showSection('attendance')}
                    >
                        <i className="fas fa-calendar-check"></i>
                        Attendance Management
                    </button>
                </div>
                <div className="nav-item">
                    <button 
                        className={`nav-link ${activeSection === 'staff' ? 'active' : ''}`}
                        onClick={() => showSection('staff')}
                    >
                        <i className="fas fa-user-tie"></i>
                        Staff Management
                    </button>
                </div>
                <div className="nav-item">
                    <button 
                        className={`nav-link ${activeSection === 'branches' ? 'active' : ''}`}
                        onClick={() => showSection('branches')}
                    >
                        <i className="fas fa-building"></i>
                        Branch Management
                    </button>
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