import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import tokenManager from '../../utils/tokenManager';
import './TrainerDashboard.css';

const TrainerDashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Authenticate check
    if (!tokenManager.isTokenValid()) {
      tokenManager.clearTokens();
      navigate('/login');
      return;
    }

    const storedUser = tokenManager.getUserData();
    if (storedUser?.role !== 'TRAINER') {
      navigate('/dashboard');
      return;
    }
    setUserData(storedUser);
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        const accessToken = tokenManager.getAccessToken();
        const refreshToken = tokenManager.getRefreshToken();
        if (accessToken && refreshToken) {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
        }
      } catch (err) {
        // Silently capture
      } finally {
        tokenManager.logout();
      }
    }
  };

  const menuItems = [
    { path: '/trainer-dashboard/dashboard', icon: 'fas fa-house', label: 'Dashboard' },
    { path: '/trainer-dashboard/pt-roster', icon: 'fas fa-calendar-check', label: 'PT Roster & Management' },
    { path: '/trainer-dashboard/clients', icon: 'fas fa-users', label: 'Clients' },
  ];

  return (
    <div className="trainer-panel-layout">
      {/* Mobile overlay for sidebar */}
      {isMobileSidebarOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`trainer-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <a href="#" className="sidebar-logo-container">
            <img src="/FGlogo.png" alt="FitnessGuru Logo" className="sidebar-logo" />
            <span className="sidebar-title">FITNESS GURU</span>
          </a>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`fas ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav-container">
          <ul className="sidebar-nav">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <i className={`${item.icon} nav-link-icon`}></i>
                  <span className="nav-link-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
            {userData?.name ? userData.name.split(' ').map(n=>n[0]).join('') : 'TR'}
          </div>
          <div className="sidebar-footer-info">
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{userData?.name || 'Trainer'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>COACH PORTAL</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="trainer-main-area">
        {/* Floating Top Controls */}
        <div className="floating-top-controls">
          <button 
            className="mobile-sidebar-toggle-btn"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            title="Toggle Menu"
          >
            <i className="fas fa-bars"></i>
          </button>

          <div ref={profileRef} className="app-bar-profile-dropdown">
            <div className="profile-dropdown-trigger" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
              <div className="profile-avatar">
                {userData?.name ? userData.name.split(' ').map(n=>n[0]).join('') : 'TR'}
              </div>
              <i className="fas fa-chevron-down dropdown-chevron"></i>
            </div>

            {isProfileDropdownOpen && (
              <ul className="dropdown-menu-list">
                <div className="dropdown-menu-header">
                  <div className="dropdown-header-name">{userData?.name || 'Trainer'}</div>
                  <div className="dropdown-header-email">{userData?.email || 'trainer@fitnessguru.org.in'}</div>
                </div>
                <li>
                  <NavLink to="/trainer-dashboard/dashboard" className="dropdown-item-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <i className="far fa-user"></i> My Profile
                  </NavLink>
                </li>
                <li>
                  <a href="#" className="dropdown-item-link logout-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Page Content Render Area */}
        <main className="trainer-page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TrainerDashboardLayout;
