import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import tokenManager from '../../utils/tokenManager';
import './TopAvatar.css';

const TopAvatar = ({ userData = { name: 'John Doe', email: 'john.doe@example.com' } }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            body: JSON.stringify({
              refresh_token: refreshToken
            })
          });
        }
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        // Use tokenManager logout method
        tokenManager.logout();
      }
    }
  };

  const showComingSoon = (feature) => {
    alert(`${feature} feature is coming soon! 🚀\n\nThis feature is currently under development and will be available in a future update.`);
  };

  return (
    <div 
      className="top-avatar"
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <img src="/avatar.png" alt={`${userData.name} Avatar`} />
      <div className={`avatar-dropdown ${isDropdownOpen ? 'open' : ''}`}>
        <div className="avatar-info">
          <div className="avatar-name">{userData.name}</div>
          <div className="avatar-email">{userData.email}</div>
        </div>
        <div className="avatar-actions">
          <Link to="/profile" className="avatar-link">
            <i className="fas fa-user"></i>
            View Profile
          </Link>
          <Link to="/subscriptions" className="avatar-link">
            <i className="fas fa-credit-card"></i>
            Subscriptions
          </Link>
          <button className="avatar-link" onClick={() => showComingSoon('Settings')}>
            <i className="fas fa-cog"></i>
            Settings
          </button>
          <button 
            className="avatar-link logout-link" 
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopAvatar;