import React from 'react';

const DashboardHeader = ({ user }) => (
  <div className="dashboard-header">
    <h1 className="dashboard-title">Dashboard</h1>
    <p className="dashboard-subtitle">Welcome back, {user.name}! Here's a quick overview of your FITNESS GURU activities.</p>
  </div>
);

export default DashboardHeader;
