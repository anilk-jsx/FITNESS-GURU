import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');

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

    const showSection = (sectionName) => {
        setActiveSection(sectionName);
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
                activeSection={activeSection}
                showSection={showSection}
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

                {/* Dashboard Section */}
                {activeSection === 'dashboard' && (
                    <div className="admin-section-content active">
                        {/* Page Header */}
                        <div className="admin-page-header">
                            <h1 className="admin-page-title">Admin Dashboard</h1>
                            <p className="admin-page-subtitle">Overview of key operational metrics and system health</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <div className="admin-stat-icon members">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div>
                                        <div className="admin-stat-title">Total Members</div>
                                    </div>
                                </div>
                                <div className="admin-stat-value">1,245</div>
                                <div className="admin-stat-subtitle">+12% from last month</div>
                                <div className="admin-stat-change">
                                    <span className="admin-change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +132 this month
                                    </span>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <div className="admin-stat-icon subscriptions">
                                        <i className="fas fa-credit-card"></i>
                                    </div>
                                    <div>
                                        <div className="admin-stat-title">Active Subscriptions</div>
                                    </div>
                                </div>
                                <div className="admin-stat-value">987</div>
                                <div className="admin-stat-subtitle">+8% from previous period</div>
                                <div className="admin-stat-change">
                                    <span className="admin-change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +76 this week
                                    </span>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <div className="admin-stat-icon revenue">
                                        <i className="fas fa-rupee-sign"></i>
                                    </div>
                                    <div>
                                        <div className="admin-stat-title">Monthly Revenue</div>
                                    </div>
                                </div>
                                <div className="admin-stat-value">₹12,34,000</div>
                                <div className="admin-stat-subtitle">+5.2% from previous month</div>
                                <div className="admin-stat-change">
                                    <span className="admin-change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +₹64,000 this month
                                    </span>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <div className="admin-stat-icon attendance">
                                        <i className="fas fa-chart-bar"></i>
                                    </div>
                                    <div>
                                        <div className="admin-stat-title">Attendance Summary</div>
                                    </div>
                                </div>
                                <div className="admin-stat-value">78%</div>
                                <div className="admin-stat-subtitle">Up 3% from yesterday</div>
                                <div className="admin-stat-change">
                                    <span className="admin-change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +3% today
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="admin-dashboard-section">
                            <h3 className="admin-section-title">Quick Actions</h3>
                            <div className="admin-quick-actions">
                                <button className="admin-action-btn" onClick={() => showComingSoon('Add New Member')}>
                                    <i className="fas fa-user-plus"></i>
                                    Add New Member
                                </button>
                                <button className="admin-action-btn secondary" onClick={() => showComingSoon('Manage Subscriptions')}>
                                    <i className="fas fa-credit-card"></i>
                                    Manage Subscriptions
                                </button>
                                <button className="admin-action-btn success" onClick={() => showComingSoon('View Attendance')}>
                                    <i className="fas fa-calendar-check"></i>
                                    View Attendance
                                </button>
                                <button className="admin-action-btn info" onClick={() => showComingSoon('Generate Report')}>
                                    <i className="fas fa-file-alt"></i>
                                    Generate Report
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholder sections for other menu items */}
                {activeSection === 'members' && (
                    <div className="admin-section-content active">
                        <div className="admin-page-header">
                            <h1 className="admin-page-title">Members Management</h1>
                            <p className="admin-page-subtitle">Manage gym members and their information</p>
                        </div>
                        <div className="admin-coming-soon">
                            <i className="fas fa-users"></i>
                            <h3>Members Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'subscriptions' && (
                    <div className="admin-section-content active">
                        <div className="admin-page-header">
                            <h1 className="admin-page-title">Subscription Management</h1>
                            <p className="admin-page-subtitle">Manage member subscriptions and plans</p>
                        </div>
                        <div className="admin-coming-soon">
                            <i className="fas fa-credit-card"></i>
                            <h3>Subscription Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'attendance' && (
                    <div className="admin-section-content active">
                        <div className="admin-page-header">
                            <h1 className="admin-page-title">Attendance Management</h1>
                            <p className="admin-page-subtitle">Track and manage member attendance</p>
                        </div>
                        <div className="admin-coming-soon">
                            <i className="fas fa-calendar-check"></i>
                            <h3>Attendance Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'staff' && (
                    <div className="admin-section-content active">
                        <div className="admin-page-header">
                            <h1 className="admin-page-title">Staff Management</h1>
                            <p className="admin-page-subtitle">Manage gym staff and trainers</p>
                        </div>
                        <div className="admin-coming-soon">
                            <i className="fas fa-user-tie"></i>
                            <h3>Staff Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'branches' && (
                    <div className="admin-section-content active">
                        <div className="admin-page-header">
                            <h1 className="admin-page-title">Branch Management</h1>
                            <p className="admin-page-subtitle">Manage multiple gym branches</p>
                        </div>
                        <div className="admin-coming-soon">
                            <i className="fas fa-building"></i>
                            <h3>Branch Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;