import React from 'react';

const ActionCards = () => (
  <div className="action-cards">
    <div className="action-card">
      <div className="action-icon subscriptions">
        <i className="fas fa-credit-card"></i>
      </div>
      <h3>Manage Subscriptions</h3>
      <p>Review your current plan, upgrade, or manage billing details.</p>
      <a href="/subscriptions" className="btn-full btn-purple">Go To Subscriptions</a>
    </div>
    <div className="action-card">
      <div className="action-icon profile">
        <i className="fas fa-user-cog"></i>
      </div>
      <h3>View Profile & Attendance</h3>
      <p>Update personal information, check biometric status, and track your workout history.</p>
      <a href="/profile" className="btn-full btn-green">Go To Profile</a>
    </div>
  </div>
);

export default ActionCards;
