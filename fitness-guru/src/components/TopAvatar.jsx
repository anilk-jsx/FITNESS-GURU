import React, { useState } from 'react';

const TopAvatar = ({ user, onLogout }) => {
  const [dropdown, setDropdown] = useState(false);
  return (
    <div className="top-avatar" onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)}>
      <img src="/avatar.png" alt="User Avatar" />
      {dropdown && (
        <div className="avatar-dropdown">
          <div className="avatar-info">
            <div className="avatar-name">{user.name}</div>
            <div className="avatar-email">{user.email}</div>
          </div>
          <div className="avatar-actions">
            <a href="/profile" className="avatar-link">
              <i className="fas fa-user"></i>
              View Profile
            </a>
            <a href="/subscriptions" className="avatar-link">
              <i className="fas fa-credit-card"></i>
              Subscriptions
            </a>
            <a href="#" className="avatar-link" onClick={() => alert('Settings feature is coming soon! 🚀')}> 
              <i className="fas fa-cog"></i>
              Settings
            </a>
            <a href="/" className="avatar-link" onClick={onLogout} style={{ color: '#dc3545' }}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopAvatar;
