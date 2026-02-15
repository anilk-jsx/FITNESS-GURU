import React from 'react';
import Navbar from '../Navbar/Navbar';
import './DashboardLayout.css';

/**
 * DashboardLayout Component - Main layout wrapper for all dashboard pages
 * 
 * Backend Integration Notes:
 * - userData prop should come from authentication context
 * - Add authentication check to redirect to login if not authenticated
 * - Integration with user profile API for real user data
 * - Add loading state while fetching user data
 */

const DashboardLayout = ({ children, userData }) => {
  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <Navbar userData={userData} />

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;