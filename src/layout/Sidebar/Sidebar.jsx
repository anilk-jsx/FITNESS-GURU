import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (accessToken && refreshToken) {
          await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              refresh_token: refreshToken
            })
          });
        }
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        // Clear local storage and redirect regardless of API result
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: 'fas fa-home',
      label: 'Dashboard'
    },
    {
      path: '/subscriptions',
      icon: 'fas fa-credit-card',
      label: 'Subscriptions'
    },
    {
      path: '/profile',
      icon: 'fas fa-user',
      label: 'Profile & Attendance'
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {isOpen && (
        <button className="sidebar-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      )}
      <div className="logo-section">
        <Link to="/" className="logo">
          <img src="/FGlogo.png" alt="FitnessGuru Logo" />
          <span>FITNESS GURU</span>
        </Link>
      </div>

      <div className="nav-menu">
        {navItems.map((item) => (
          <div key={item.path} className="nav-item">
            <Link 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={item.icon}></i>
              {item.label}
            </Link>
          </div>
        ))}
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

export default Sidebar;