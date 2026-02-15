import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import './Dashboard.css';

/**
 * Dashboard Component - Member Dashboard Page
 * 
 * Backend Integration Notes:
 * - ✅ User profile data fetched from GET /api/users/profile
 * - API Endpoints still needed:
 *   - GET /api/member/attendance/stats - Attendance statistics
 *   - GET /api/member/attendance/recent - Recent attendance sessions
 *   - GET /api/member/subscription - Current subscription details
 * - ✅ Loading states and error handling implemented
 * - ✅ Token validation and redirect on 401
 * - TODO: Implement real-time data refresh
 */

// Dashboard Components
const DashboardHeader = ({ userName, memberSince }) => (
  <div className="dashboard-header">
    <div className="header-content">
      <div>
        <h1 className="dashboard-title">Welcome back, {userName}! 👋</h1>
        <p className="dashboard-subtitle">
          Member since {memberSince}
        </p>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, iconClass, title, value, subtitle, linkTo }) => (
  <div className={`stat-card ${iconClass}`}>
    <div className="stat-icon-wrapper">
      <div className={`stat-icon ${iconClass}`}>
        <i className={icon}></i>
      </div>
    </div>
    <div className="stat-content">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
    {linkTo && (
      <div className="stat-action">
        <Link to={linkTo} className="stat-btn">
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    )}
  </div>
);

const AttendanceChart = ({ recentSessions }) => {
  // Group sessions by date
  const groupedSessions = recentSessions.reduce((acc, session) => {
    const date = new Date(session.check_in_time).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  return (
    <div className="attendance-chart-card">
      <div className="card-header">
        <h3 className="card-title">Recent Attendance</h3>
        <Link to="/profile" className="card-link">
          View All <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
      <div className="chart-container">
        {Object.keys(groupedSessions).length > 0 ? (
          <div className="attendance-list">
            {Object.entries(groupedSessions).map(([date, sessions], index) => (
              <div key={index} className="attendance-day-group">
                <div className="attendance-date-header">
                  <div className="date-badge">
                    <div className="date-day">{new Date(date).getDate()}</div>
                    <div className="date-month">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className="date-info">
                    <div className="date-weekday">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className="session-count">
                      {sessions.length} session{sessions.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="sessions-list">
                  {sessions.map((session, sessionIndex) => (
                    <div key={sessionIndex} className="session-item">
                      <div className="session-number">#{sessionIndex + 1}</div>
                      <div className="session-details">
                        <div className="session-time">
                          {new Date(session.check_in_time).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {session.check_out_time && ` - ${new Date(session.check_out_time).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}`}
                        </div>
                        <div className="session-meta">
                          {session.duration_min && <span>{session.duration_min} mins</span>}
                          <span className="separator">•</span>
                          <span className={`source-badge ${session.source?.toLowerCase()}`}>
                            {session.source}
                          </span>
                        </div>
                      </div>
                      <div className="session-status">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-calendar-times"></i>
            <p>No recent attendance records</p>
            <p className="empty-subtitle">Start your fitness journey today!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickActionsCard = ({ actions }) => (
  <div className="quick-actions-card">
    <h3 className="card-title">Quick Actions</h3>
    <div className="actions-grid">
      {actions.map((action, index) => (
        <Link key={index} to={action.link} className="action-item">
          <div className={`action-icon ${action.color}`}>
            <i className={action.icon}></i>
          </div>
          <div className="action-text">
            <div className="action-title">{action.title}</div>
            <div className="action-subtitle">{action.subtitle}</div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock dashboard data - Replace with API calls
  const [dashboardData] = useState({
    member: {
      join_date: '2024-03-15',
      status: 'ACTIVE'
    },
    subscription: {
      plan_name: 'Premium Plan',
      status: 'ACTIVE',
      start_date: '2024-03-15',
      end_date: '2026-03-15',
      days_remaining: 380,
      freeze_status: 'NONE',
      freeze_days: 0
    },
    attendance: {
      total_sessions_this_month: 18,
      total_duration_this_month: 1320, // minutes
      current_streak: 5, // consecutive days
      last_check_in: '2026-02-14T18:30:00',
      avg_duration: 73 // minutes
    },
    profile: {
      completion: 85,
      missing_fields: ['emergency_contact', 'fitness_level']
    },
    recent_sessions: [
      {
        session_id: 1,
        check_in_time: '2026-02-14T06:30:00',
        check_out_time: '2026-02-14T07:45:00',
        duration_min: 75,
        source: 'DEVICE'
      },
      {
        session_id: 2,
        check_in_time: '2026-02-14T18:00:00',
        check_out_time: '2026-02-14T19:20:00',
        duration_min: 80,
        source: 'DEVICE'
      },
      {
        session_id: 3,
        check_in_time: '2026-02-13T07:00:00',
        check_out_time: '2026-02-13T08:15:00',
        duration_min: 75,
        source: 'MOBILE'
      },
      {
        session_id: 4,
        check_in_time: '2026-02-13T17:30:00',
        check_out_time: '2026-02-13T19:00:00',
        duration_min: 90,
        source: 'WEB'
      },
      {
        session_id: 5,
        check_in_time: '2026-02-12T06:00:00',
        check_out_time: '2026-02-12T07:30:00',
        duration_min: 90,
        source: 'DEVICE'
      },
      {
        session_id: 6,
        check_in_time: '2026-02-11T06:30:00',
        check_out_time: '2026-02-11T08:00:00',
        duration_min: 90,
        source: 'DEVICE'
      }
    ]
  });

  const quickActions = [
    {
      icon: 'fas fa-qrcode',
      color: 'orange',
      title: 'Check In',
      subtitle: 'Scan QR or manual entry',
      link: '/profile?tab=attendance'
    },
    {
      icon: 'fas fa-user-edit',
      color: 'blue',
      title: 'Update Profile',
      subtitle: 'Complete your information',
      link: '/profile'
    },
    {
      icon: 'fas fa-crown',
      color: 'purple',
      title: 'Manage Plan',
      subtitle: 'View & renew subscription',
      link: '/subscriptions'
    },
    {
      icon: 'fas fa-clock',
      color: 'green',
      title: 'Freeze Request',
      subtitle: 'Pause your membership',
      link: '/subscriptions?action=freeze'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('Profile data:', data);
        if (response.ok && data.status === 'success') {
          setUserData(data.user);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch profile');
          // If token is invalid, redirect to login
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Add fade-in animation
    const cards = document.querySelectorAll('.stat-card, .attendance-chart-card, .quick-actions-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }, [userData]);

  return (
    <>
      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : error ? (
        <div className="dashboard-error">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      ) : !userData ? (
        <div className="dashboard-error">
          <i className="fas fa-user-slash"></i>
          <h3>No User Data</h3>
          <p>Unable to load user information</p>
        </div>
      ) : (
        <DashboardLayout userData={userData}>
          <DashboardHeader 
            userName={userData.name} 
            memberSince={formatDate(dashboardData.member.join_date)}
          />

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="fas fa-crown"
          iconClass="subscription"
          title="Subscription"
          value={dashboardData.subscription.plan_name}
          subtitle={`Expires ${formatDate(dashboardData.subscription.end_date)}`}
          linkTo="/subscriptions"
        />

        <StatCard
          icon="fas fa-dumbbell"
          iconClass="workouts"
          title="This Month"
          value={`${dashboardData.attendance.total_sessions_this_month} Sessions`}
          subtitle={formatDuration(dashboardData.attendance.total_duration_this_month)}
          linkTo="/profile?tab=attendance"
        />

        <StatCard
          icon="fas fa-fire"
          iconClass="streak"
          title="Current Streak"
          value={`${dashboardData.attendance.current_streak} Days`}
          subtitle={null}
          linkTo="/profile?tab=attendance"
        />

        <StatCard
          icon="fas fa-user-check"
          iconClass="profile"
          title="Profile"
          value={`${dashboardData.profile.completion}%`}
          subtitle={dashboardData.profile.completion === 100 ? 'Complete' : 'Incomplete'}
          linkTo="/profile"
        />
      </div>

      {/* Recent Attendance and Quick Actions */}
      <div className="dashboard-grid">
        <AttendanceChart recentSessions={dashboardData.recent_sessions} />
        <QuickActionsCard actions={quickActions} />
      </div>
        </DashboardLayout>
      )}
    </>
  );
};

export default Dashboard;