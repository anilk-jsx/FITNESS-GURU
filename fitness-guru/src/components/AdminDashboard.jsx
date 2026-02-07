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
            <div className="main-content">
                {/* Top Right Avatar */}
                <div className="top-avatar">
                    AD
                    <div className="avatar-dropdown">
                        <div className="avatar-info">
                            <div className="avatar-name">Admin User</div>
                            <div className="avatar-email">admin@fitnessguru.com</div>
                        </div>
                        <div className="avatar-actions">
                            <button className="avatar-link" onClick={() => showComingSoon('Admin Profile')}>
                                <i className="fas fa-user-shield"></i>
                                Admin Profile
                            </button>
                            <button className="avatar-link" onClick={() => showComingSoon('System Settings')}>
                                <i className="fas fa-cog"></i>
                                System Settings
                            </button>
                            <button className="avatar-link logout-link" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Section */}
                {activeSection === 'dashboard' && (
                    <div className="section-content active">
                        {/* Page Header */}
                        <div className="page-header">
                            <h1 className="page-title">Admin Dashboard</h1>
                            <p className="page-subtitle">Overview of key operational metrics and system health</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon members">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div>
                                        <div className="stat-title">Total Members</div>
                                    </div>
                                </div>
                                <div className="stat-value">1,245</div>
                                <div className="stat-subtitle">+12% from last month</div>
                                <div className="stat-change">
                                    <span className="change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +132 this month
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon subscriptions">
                                        <i className="fas fa-credit-card"></i>
                                    </div>
                                    <div>
                                        <div className="stat-title">Active Subscriptions</div>
                                    </div>
                                </div>
                                <div className="stat-value">987</div>
                                <div className="stat-subtitle">+8% from previous period</div>
                                <div className="stat-change">
                                    <span className="change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +76 this week
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon revenue">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                    <div>
                                        <div className="stat-title">Monthly Revenue</div>
                                    </div>
                                </div>
                                <div className="stat-value">$12,340</div>
                                <div className="stat-subtitle">+5.2% from previous month</div>
                                <div className="stat-change">
                                    <span className="change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +$640 this month
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon attendance">
                                        <i className="fas fa-chart-bar"></i>
                                    </div>
                                    <div>
                                        <div className="stat-title">Attendance Summary</div>
                                    </div>
                                </div>
                                <div className="stat-value">78%</div>
                                <div className="stat-subtitle">Up 3% from yesterday</div>
                                <div className="stat-change">
                                    <span className="change-positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +3% today
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="dashboard-section">
                            <h3 className="section-title">Quick Actions</h3>
                            <div className="quick-actions">
                                <button className="action-btn" onClick={() => showComingSoon('Add New Member')}>
                                    <i className="fas fa-user-plus"></i>
                                    Add New Member
                                </button>
                                <button className="action-btn secondary" onClick={() => showComingSoon('Manage Subscriptions')}>
                                    <i className="fas fa-credit-card"></i>
                                    Manage Subscriptions
                                </button>
                                <button className="action-btn success" onClick={() => showComingSoon('View Attendance')}>
                                    <i className="fas fa-calendar-check"></i>
                                    View Attendance
                                </button>
                                <button className="action-btn info" onClick={() => showComingSoon('Generate Report')}>
                                    <i className="fas fa-file-alt"></i>
                                    Generate Report
                                </button>
                            </div>
                        </div>

                        {/* Bottom Grid: Recent Activity & Device Status */}
                        <div className="bottom-grid">
                            {/* Recent System Activity */}
                            <div className="dashboard-section">
                                <h3 className="section-title">Recent System Activity</h3>
                                <div className="activity-list">
                                    <div className="activity-item">
                                        <div className="activity-icon success">
                                            <i className="fas fa-user-plus"></i>
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-title">New member registered: Jane Doe</div>
                                            <div className="activity-time">Admin User • 2 hours ago</div>
                                        </div>
                                        <div className="activity-status status-success">Success</div>
                                    </div>

                                    <div className="activity-item">
                                        <div className="activity-icon info">
                                            <i className="fas fa-credit-card"></i>
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-title">Subscription upgraded: John Smith</div>
                                            <div className="activity-time">Admin User • 5 hours ago</div>
                                        </div>
                                        <div className="activity-status status-info">Info</div>
                                    </div>

                                    <div className="activity-item">
                                        <div className="activity-icon warning">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-title">Biometric device offline: Entrance 1</div>
                                            <div className="activity-time">System Alert • Yesterday</div>
                                        </div>
                                        <div className="activity-status status-warning">Warning</div>
                                    </div>

                                    <div className="activity-item">
                                        <div className="activity-icon success">
                                            <i className="fas fa-chart-line"></i>
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-title">Report generated: Monthly Financials</div>
                                            <div className="activity-time">Admin User • 2 days ago</div>
                                        </div>
                                        <div className="activity-status status-success">Success</div>
                                    </div>
                                </div>
                            </div>

                            {/* Biometric Device Status */}
                            <div className="dashboard-section">
                                <h3 className="section-title">Biometric Device Status</h3>
                                <div className="device-list">
                                    <div className="device-item">
                                        <div className="device-info">
                                            <div className="device-icon">
                                                <i className="fas fa-fingerprint"></i>
                                            </div>
                                            <div className="device-details">
                                                <h4>Main Entrance Scanner</h4>
                                                <div className="device-location">Service Area</div>
                                            </div>
                                        </div>
                                        <div className="device-status status-online">Online</div>
                                    </div>

                                    <div className="device-item">
                                        <div className="device-info">
                                            <div className="device-icon">
                                                <i className="fas fa-weight"></i>
                                            </div>
                                            <div className="device-details">
                                                <h4>Weight Room Scanner</h4>
                                                <div className="device-location">Strength Zone</div>
                                            </div>
                                        </div>
                                        <div className="device-status status-offline">Offline</div>
                                    </div>

                                    <div className="device-item">
                                        <div className="device-info">
                                            <div className="device-icon">
                                                <i className="fas fa-running"></i>
                                            </div>
                                            <div className="device-details">
                                                <h4>Studio A Scanner</h4>
                                                <div className="device-location">Studio A</div>
                                            </div>
                                        </div>
                                        <div className="device-status status-syncing">Syncing</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholder sections for other menu items */}
                {activeSection === 'members' && (
                    <div className="section-content active">
                        <div className="page-header">
                            <h1 className="page-title">Members Management</h1>
                            <p className="page-subtitle">Manage gym members and their information</p>
                        </div>
                        <div className="coming-soon">
                            <i className="fas fa-users"></i>
                            <h3>Members Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'subscriptions' && (
                    <div className="section-content active">
                        <div className="page-header">
                            <h1 className="page-title">Subscription Management</h1>
                            <p className="page-subtitle">Manage member subscriptions and plans</p>
                        </div>
                        <div className="coming-soon">
                            <i className="fas fa-credit-card"></i>
                            <h3>Subscription Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'attendance' && (
                    <div className="section-content active">
                        <div className="page-header">
                            <h1 className="page-title">Attendance Management</h1>
                            <p className="page-subtitle">Track and manage member attendance</p>
                        </div>
                        <div className="coming-soon">
                            <i className="fas fa-calendar-check"></i>
                            <h3>Attendance Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'staff' && (
                    <div className="section-content active">
                        <div className="page-header">
                            <h1 className="page-title">Staff Management</h1>
                            <p className="page-subtitle">Manage gym staff and trainers</p>
                        </div>
                        <div className="coming-soon">
                            <i className="fas fa-user-tie"></i>
                            <h3>Staff Management</h3>
                            <p>This section is under development and will be available soon!</p>
                        </div>
                    </div>
                )}

                {activeSection === 'branches' && (
                    <div className="section-content active">
                        <div className="page-header">
                            <h1 className="page-title">Branch Management</h1>
                            <p className="page-subtitle">Manage multiple gym branches</p>
                        </div>
                        <div className="coming-soon">
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