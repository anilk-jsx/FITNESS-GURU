import React from 'react';

const Sidebar = ({ onLogout, mobileOpen, toggleMobileMenu }) => (
  <div className={`sidebar${mobileOpen ? ' mobile-open' : ''}`} id="sidebar">
    <div className="logo-section">
      <a href="/" className="logo">
        <img src="/FGlogo.png" alt="FitnessGuru Logo" />
        <span>FITNESS GURU</span>
      </a>
    </div>
    <div className="nav-menu">
      <div className="nav-item">
        <a href="#" className="nav-link active">
          <i className="fas fa-home"></i>
          Dashboard
        </a>
      </div>
      <div className="nav-item">
        <a href="/subscriptions" className="nav-link">
          <i className="fas fa-credit-card"></i>
          Subscriptions
        </a>
      </div>
      <div className="nav-item">
        <a href="/profile" className="nav-link">
          <i className="fas fa-user"></i>
          Profile & Attendance
        </a>
      </div>
    </div>
    <div className="logout-section">
      <a href="/" className="logout-btn" onClick={onLogout}>
        <i className="fas fa-sign-out-alt"></i>
        Logout
      </a>
    </div>
  </div>
);

export default Sidebar;
