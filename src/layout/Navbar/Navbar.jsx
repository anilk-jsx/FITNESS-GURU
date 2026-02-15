import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userData = { name: 'John Doe', email: 'john.doe@example.com' } }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/dashboard" className="navbar-logo">
          <img src="/FGlogo.png" alt="FitnessGuru Logo" className="logo-image" />
          <span className="logo-text">FITNESS GURU</span>
        </Link>

        {/* User Info & Dropdown */}
        <div 
          ref={dropdownRef}
          className="navbar-user"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div className="user-display" onClick={toggleDropdown}>
            <div className="user-avatar">
              <img src="/avatar.png" alt={userData.name} className="avatar-image" />
            </div>
            <span className="user-name">{userData.name}</span>
            <i className="fas fa-chevron-down dropdown-icon"></i>
          </div>
          
          <div className={`user-dropdown ${isDropdownOpen ? 'active' : ''}`}>
            <div className="dropdown-header">
              <div className="dropdown-avatar">
                {userData.profilePhoto ? (
                  <img src={userData.profilePhoto} alt={userData.name} />
                ) : (
                  <span>{getInitials(userData.name)}</span>
                )}
              </div>
              <div className="dropdown-info">
                <div className="dropdown-name">{userData.name}</div>
                <div className="dropdown-email">{userData.email}</div>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <div className="dropdown-menu">
              <Link to="/dashboard" className="dropdown-item">
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </Link>
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                <span>Profile & Attendance</span>
              </Link>
              <Link to="/subscriptions" className="dropdown-item">
                <i className="fas fa-credit-card"></i>
                <span>Subscriptions</span>
              </Link>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
