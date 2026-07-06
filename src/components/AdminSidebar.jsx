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
      {/* Original Logo & Branding Section */}
      <div className="logo-section">
        <a href="/" className="logo">
          <img src="/FGlogo.png" alt="FITNESS GURU Logo" />
          <span className="logo-title">FITNESS GURU</span>
        </a>
        <button className="sidebar-toggle-btn" aria-label="Toggle Sidebar">
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Navigation Menu with Original Items, Icons & Names */}
      <div className="nav-menu">
        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/members"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-users"></i>
            <span>Members Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/attendance"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Attendance Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/staff"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-user-tie"></i>
            <span>Employee Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/contacts"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-envelope"></i>
            <span>Contact Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/subscriptions"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-credit-card"></i>
            <span>Subscription Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/branches"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-building"></i>
            <span>Branch Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/mapping"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-link"></i>
            <span>User Trainer Mapping</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/pt-management"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-dumbbell"></i>
            <span>PT Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/gym-configuration"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-sliders-h"></i>
            <span>Gym Configuration</span>
          </NavLink>
        </div>
      </div>

      {/* Bottom Profile Card & Logout Section */}
      <div className="sidebar-footer">
        <div className="sidebar-profile-card">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" 
            alt="Admin User" 
            className="sidebar-profile-avatar" 
          />
          <div className="sidebar-profile-details">
            <span className="sidebar-profile-name">Admin User</span>
            <span className="sidebar-profile-role">Super Admin</span>
          </div>
          <button 
            type="button" 
            className="sidebar-logout-icon-btn" 
            onClick={handleLogout} 
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;