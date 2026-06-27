import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import tokenManager from '../../utils/tokenManager';
import './TrainerDashboard.css';

const TrainerDashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
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
    { path: '/trainer-dashboard/clients', icon: 'fas fa-users', label: 'Clients' },
    { path: '/trainer-dashboard/assessments', icon: 'fas fa-clipboard-list', label: 'Fitness Assessments' },
    { path: '/trainer-dashboard/workout-plans', icon: 'fas fa-dumbbell', label: 'Workout Plans' },
    { path: '/trainer-dashboard/diet-plans', icon: 'fas fa-seedling', label: 'Diet Plans' },
    { path: '/trainer-dashboard/attendance', icon: 'fas fa-calendar-check', label: 'Attendance' },
    { path: '/trainer-dashboard/schedule', icon: 'fas fa-calendar-alt', label: 'Schedule' },
    { path: '/trainer-dashboard/notifications', icon: 'fas fa-bell', label: 'Notifications' },
    { path: '/trainer-dashboard/profile', icon: 'fas fa-user-circle', label: 'Profile' },
  ];

  return (
    <div className="trainer-panel-layout">
      {/* Sidebar */}
      <aside className={`trainer-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
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
            <i className={`fas ${isSidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </button>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="sidebar-nav">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
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
        {/* Top App Bar */}
        <header className="top-app-bar">
          <div className="app-bar-left">
            <div className="global-search-wrapper">
              <i className="fas fa-search global-search-icon"></i>
              <input 
                type="text" 
                placeholder="Search clients, plans, dates..." 
                className="global-search-input"
              />
            </div>
          </div>

          <div className="app-bar-right">
            {/* Notification trigger */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button 
                className="app-bar-action-btn"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                title="Notifications"
              >
                <i className="far fa-bell" style={{ fontSize: '1.2rem' }}></i>
                <span className="notification-badge">3</span>
              </button>

              {isNotifDropdownOpen && (
                <div className="dropdown-menu-list" style={{ width: '300px', right: 0 }}>
                  <div className="dropdown-menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Notifications</span>
                    <NavLink to="/trainer-dashboard/notifications" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none' }} onClick={() => setIsNotifDropdownOpen(false)}>View all</NavLink>
                  </div>
                  <div className="notification-widget-item unread">
                    <div className="notification-widget-icon"><i className="fas fa-dumbbell"></i></div>
                    <div className="notification-widget-text">
                      <div className="notification-widget-title">New Workout Assigned</div>
                      <div className="notification-widget-desc">Rahul Mehta has started the Hypertrophy split.</div>
                      <div className="notification-widget-time">10 mins ago</div>
                    </div>
                  </div>
                  <div className="notification-widget-item unread">
                    <div className="notification-widget-icon"><i className="fas fa-clipboard-list"></i></div>
                    <div className="notification-widget-text">
                      <div className="notification-widget-title">Pending Assessment</div>
                      <div className="notification-widget-desc">Sneha Patel has an assessment due today.</div>
                      <div className="notification-widget-time">2 hours ago</div>
                    </div>
                  </div>
                  <div className="notification-widget-item">
                    <div className="notification-widget-icon"><i className="fas fa-calendar-check"></i></div>
                    <div className="notification-widget-text">
                      <div className="notification-widget-title">Attendance Checked-In</div>
                      <div className="notification-widget-desc">Rajesh Kumar checked in at Koramangala.</div>
                      <div className="notification-widget-time">Yesterday</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile trigger */}
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
                    <NavLink to="/trainer-dashboard/profile" className="dropdown-item-link" onClick={() => setIsProfileDropdownOpen(false)}>
                      <i className="far fa-user"></i> My Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/trainer-dashboard/dashboard" className="dropdown-item-link" onClick={() => setIsProfileDropdownOpen(false)}>
                      <i className="fas fa-chart-line"></i> Dashboard
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
        </header>

        {/* Page Content Render Area */}
        <main className="trainer-page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TrainerDashboardLayout;
