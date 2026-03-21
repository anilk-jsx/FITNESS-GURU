import React, { useState, useEffect } from 'react';
import { tokenManager } from '../utils/tokenManager';
import './AdminDashboard.css';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    loading: true,
    error: null
  });

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
  
  // Fetch total members count from API with token refresh handling
  const fetchMemberStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/users/list?role=MEMBER&page=1&limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setStats(prev => ({
          ...prev,
          totalMembers: data.meta?.total || 0,
          loading: false
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch member stats');
      }
    } catch (err) {
      console.error('Error fetching member stats:', err);
      setStats(prev => ({
        ...prev,
        error: err.message,
        loading: false
      }));
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchMemberStats();
  }, []);
  
  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleQuickAction = (path) => {
    window.location.href = path;
  };

  return (
    <div className="admin-section-content active">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Overview of your gym management system</p>
      </div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <i className="fas fa-users"></i>
            </div>
            <div>
              <h3 className="admin-stat-title">Total Members</h3>
              <p className="admin-stat-value">
                {stats.loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : stats.error ? (
                  <span style={{color: '#e74c3c', fontSize: '0.8rem'}}>Error</span>
                ) : (
                  formatNumber(stats.totalMembers)
                )}
              </p>
            </div>
          </div>
          <p className="admin-stat-subtitle">
            {stats.error ? (
              <span style={{color: '#e74c3c'}}>
                Failed to load data
                <button 
                  onClick={fetchMemberStats}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </span>
            ) : (
              'Live member count'
            )}
          </p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <i className="fas fa-dumbbell"></i>
            </div>
            <div>
              <h3 className="admin-stat-title">Active Subscriptions</h3>
              <p className="admin-stat-value">0</p>
            </div>
          </div>
          <p className="admin-stat-subtitle">Current active members</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <i className="fas fa-rupee-sign"></i>
            </div>
            <div>
              <h3 className="admin-stat-title">Monthly Revenue</h3>
              <p className="admin-stat-value">0</p>
            </div>
          </div>
          <p className="admin-stat-subtitle">This month's earnings</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
              <i className="fas fa-chart-line"></i>
            </div>
            <div>
              <h3 className="admin-stat-title">Attendance</h3>
              <p className="admin-stat-value">100%</p>
            </div>
          </div>
          <p className="admin-stat-subtitle">Average attendance rate</p>
        </div>
      </div>
      <div className="admin-dashboard-section">
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="admin-quick-actions">
          <button className="admin-action-btn" onClick={() => handleQuickAction('/admin-dashboard/members')}>
            <i className="fas fa-user-plus"></i>
            <span>Add Member</span>
          </button>
          <button className="admin-action-btn" onClick={() => handleQuickAction('/admin-dashboard/subscriptions')}>
            <i className="fas fa-credit-card"></i>
            <span>Manage Subscriptions</span>
          </button>
          <button className="admin-action-btn" onClick={() => handleQuickAction('/admin-dashboard/attendance')}>
            <i className="fas fa-calendar-check"></i>
            <span>View Attendance</span>
          </button>
          <button className="admin-action-btn" onClick={() => alert('Report generation coming soon!')}>
            <i className="fas fa-file-alt"></i>
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;