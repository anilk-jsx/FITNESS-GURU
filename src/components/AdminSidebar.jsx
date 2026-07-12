import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ 
  handleLogout, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) => {
  const location = useLocation();

  // Auto-expand group if currently active on that path
  const [isFinanceOpen, setIsFinanceOpen] = useState(location.pathname === '/admin-dashboard/finance');
  const [isPayrollOpen, setIsPayrollOpen] = useState(location.pathname === '/admin-dashboard/payroll');
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(location.pathname === '/admin-dashboard/subscriptions');
  const [isPtOpen, setIsPtOpen] = useState(location.pathname === '/admin-dashboard/pt-management');
  const [isStoreOpen, setIsStoreOpen] = useState(location.pathname === '/admin-dashboard/store-management');

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`} id="sidebar">
      {/* Original Logo & Branding Section */}
      <div className="logo-section">
        <a href="/" className="logo">
          <img src="/FGlogo.png" alt="FITNESS GURU Logo" />
          <span className="logo-title">FITNESS GURU</span>
        </a>
      </div>

      {/* Navigation Menu with Original Items, Icons & Names */}
      <div className="nav-menu">
        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/members"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-users"></i>
            <span>Members Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/attendance"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Attendance Management</span>
          </NavLink>
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/staff"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-user-tie"></i>
            <span>Employee Management</span>
          </NavLink>
        </div>

        {/* Collapsible Payroll Management Group */}
        <div className="nav-item">
          <div 
            className={`sidebar-group-header ${isPayrollOpen ? 'open' : ''}`}
            onClick={() => setIsPayrollOpen(!isPayrollOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-file-invoice-dollar main-icon"></i>
              <span>Payroll Management</span>
            </div>
            <i className="fas fa-chevron-right chevron-icon"></i>
          </div>

          {isPayrollOpen && (
            <div className="sidebar-sub-menu">
              <NavLink 
                to="/admin-dashboard/payroll?tab=salaries"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/payroll' && (location.search.includes('tab=salaries') || location.search === '') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-money-bill-wave"></i>
                <span>Salaries & Runs</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/payroll?tab=commissions"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/payroll' && location.search.includes('tab=commissions') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-percent"></i>
                <span>PT Commissions</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Collapsible Finance & Accounting Group */}
        <div className="nav-item">
          <div 
            className={`sidebar-group-header ${isFinanceOpen ? 'open' : ''}`}
            onClick={() => setIsFinanceOpen(!isFinanceOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-coins main-icon"></i>
              <span>Finance & Accounting</span>
            </div>
            <i className="fas fa-chevron-right chevron-icon"></i>
          </div>

          {isFinanceOpen && (
            <div className="sidebar-sub-menu">
              <NavLink 
                to="/admin-dashboard/finance?tab=summary"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/finance' && (location.search.includes('tab=summary') || location.search === '') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-chart-line"></i>
                <span>Executive P&L</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/finance?tab=opex"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/finance' && location.search.includes('tab=opex') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-file-invoice-dollar"></i>
                <span>Operating Expenses</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/finance?tab=ledger"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/finance' && location.search.includes('tab=ledger') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-university"></i>
                <span>Master Ledger</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/contacts"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-envelope"></i>
            <span>Contact Management</span>
          </NavLink>
        </div>

        {/* Collapsible Subscription Management Group */}
        <div className="nav-item">
          <div 
            className={`sidebar-group-header ${isSubscriptionOpen ? 'open' : ''}`}
            onClick={() => setIsSubscriptionOpen(!isSubscriptionOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-credit-card main-icon"></i>
              <span>Subscription Management</span>
            </div>
            <i className="fas fa-chevron-right chevron-icon"></i>
          </div>

          {isSubscriptionOpen && (
            <div className="sidebar-sub-menu">
              <NavLink 
                to="/admin-dashboard/subscriptions?tab=subscriptions"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/subscriptions' && (location.search.includes('tab=subscriptions') || location.search === '') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-id-card"></i>
                <span>Subscriptions Desk</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/subscriptions?tab=plans"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/subscriptions' && location.search.includes('tab=plans') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-tags"></i>
                <span>Entitlements Catalog</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/branches"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-building"></i>
            <span>Branch Management</span>
          </NavLink>
        </div>

        {/* Collapsible PT Management Group */}
        <div className="nav-item">
          <div 
            className={`sidebar-group-header ${isPtOpen ? 'open' : ''}`}
            onClick={() => setIsPtOpen(!isPtOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-dumbbell main-icon"></i>
              <span>PT Management</span>
            </div>
            <i className="fas fa-chevron-right chevron-icon"></i>
          </div>

          {isPtOpen && (
            <div className="sidebar-sub-menu">
              <NavLink 
                to="/admin-dashboard/pt-management?tab=purchase-assignment"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/pt-management' && (location.search.includes('tab=purchase-assignment') || location.search === '') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-calendar-alt"></i>
                <span>Purchase & Roster</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/pt-management?tab=diet-plans"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/pt-management' && location.search.includes('tab=diet-plans') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-utensils"></i>
                <span>Diet Plans</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/pt-management?tab=assessments"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/pt-management' && location.search.includes('tab=assessments') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-heartbeat"></i>
                <span>Assessments</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-item">
          <NavLink 
            to="/admin-dashboard/gym-configuration"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-sliders-h"></i>
            <span>Gym Configuration</span>
          </NavLink>
        </div>

        {/* Collapsible Store & Inventory Group */}
        <div className="nav-item">
          <div 
            className={`sidebar-group-header ${isStoreOpen ? 'open' : ''}`}
            onClick={() => setIsStoreOpen(!isStoreOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-store main-icon"></i>
              <span>Store & Inventory</span>
            </div>
            <i className="fas fa-chevron-right chevron-icon"></i>
          </div>

          {isStoreOpen && (
            <div className="sidebar-sub-menu">
              <NavLink 
                to="/admin-dashboard/store-management?tab=stocks"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/store-management' && (location.search.includes('tab=stocks') || location.search === '') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-boxes"></i>
                <span>Inventory Stock</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/store-management?tab=pos"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/store-management' && location.search.includes('tab=pos') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-cash-register"></i>
                <span>POS Desk</span>
              </NavLink>

              <NavLink 
                to="/admin-dashboard/store-management?tab=restock"
                className={() => `sidebar-sub-link ${location.pathname === '/admin-dashboard/store-management' && location.search.includes('tab=restock') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-truck-loading"></i>
                <span>Procurement</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile Card & Logout Section */}
      <div className="sidebar-footer">
        <div className="sidebar-profile-card">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" 
            alt="Admin User" 
            className="sidebar-profile-avatar" 
          />
          <div className="sidebar-profile-details">
            <span className="sidebar-profile-name">Admin User</span>
            <span className="sidebar-profile-role">Super Admin</span>
          </div>
          <button 
            type="button" 
            className="sidebar-logout-icon-btn" 
            onClick={handleLogout} 
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;