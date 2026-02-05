import React from 'react';

const UserProfileCard = ({ user }) => (
  <a href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div className="user-profile" style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}>
      <div className="user-avatar">{user.initials}</div>
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.membership} • Joined {user.joined}</p>
      </div>
      <div style={{ marginLeft: 'auto', color: '#ff6b35' }}>
        <i className="fas fa-arrow-right"></i>
      </div>
    </div>
  </a>
);

export default UserProfileCard;
