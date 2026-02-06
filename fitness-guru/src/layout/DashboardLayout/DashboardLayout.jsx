import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import TopAvatar from '../TopAvatar/TopAvatar';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeMobileMenu();
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Toggle - only show when sidebar is closed */}
      {!isMobileMenuOpen && (
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
        >
          <i className="fas fa-bars"></i>
        </button>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu}
      />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={handleOverlayClick}></div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <TopAvatar userData={userData} />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;