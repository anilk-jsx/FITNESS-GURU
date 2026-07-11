import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import tokenManager from '../utils/tokenManager';
import './Dashboard.css';

/**
 * Dashboard Component - Member Dashboard Page
 *
 * Backend Integration:
 * - ✅ User profile data fetched from GET /api/members/view?user_id={userId}
 * - ✅ Attendance sessions fetched from GET /api/attendance/userSessions?user_id={userId}&date={date}
 * - ✅ Dashboard stats calculated from fetched data
 * - ✅ Loading states and error handling implemented
 * - ✅ Token validation and redirect on 401
 * - ✅ Real-time data refresh on component mount
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
  // Group sessions by date (handle both formats: with timestamps and without)
  const groupedSessions = recentSessions.reduce((acc, session) => {
    let dateKey;
    if (session.check_in && !session.check_in.includes('T')) {
      // Format: "09:00 pm" - use today's date
      dateKey = new Date().toISOString().split('T')[0];
    } else if (session.check_in_time) {
      dateKey = new Date(session.check_in_time).toISOString().split('T')[0];
    } else {
      dateKey = new Date().toISOString().split('T')[0];
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
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
                      <div className="session-number">#{session.session_no || sessionIndex + 1}</div>
                      <div className="session-details">
                        <div className="session-time">
                          {session.check_in || 'N/A'}
                          {session.check_out && ` - ${session.check_out}`}
                        </div>
                        <div className="session-meta">
                          {session.duration && <span>{session.duration} mins</span>}
                          {session.duration && session.device && <span className="separator">•</span>}
                          {session.device && (
                            <span className={`source-badge ${session.device?.toLowerCase()}`}>
                              {session.device}
                            </span>
                          )}
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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quickActions = [
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
    },
    {
      icon: 'fas fa-shopping-bag',
      color: 'orange',
      title: 'Store Shop',
      subtitle: 'Buy supplements & gear',
      link: '/store'
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

  // Get membership plan name from plan ID
  const getPlanName = (planId) => {
    const plans = {
      1: 'Monthly Plan',
      2: 'Quarterly Plan',
      3: 'Yearly Plan'
    };
    return plans[planId] || 'Standard Plan';
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile) => {
    const requiredFields = [
      'name', 'email', 'phone', 'date_of_birth', 'gender',
      'blood_group', 'height_cm', 'weight_kg', 'fitness_level', 'goal_focus'
    ];

    const filledFields = requiredFields.filter(field =>
      profile[field] && profile[field] !== '' && profile[field] !== null && profile[field] !== 'Not Provided'
    ).length;

    return Math.round((filledFields / requiredFields.length) * 100);
  };

  // Fetch user profile and attendance data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (!tokenManager.isAuthenticated()) {
          setError('No authentication token found');
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

        // Get user ID from stored user data
        const storedUserData = tokenManager.getUserData();
        const userId = storedUserData?.userId || storedUserData?.id || storedUserData?.member_id || storedUserData?.user_id;

        if (!userId) {
          setError('User ID not found. Please login again.');
          tokenManager.clearTokens();
          window.location.href = '/login';
          return;
        }

        // Fetch member profile
        const profileResponse = await tokenManager.apiCall(
          `${API_BASE_URL}/api/members/view?user_id=${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const profileData = await profileResponse.json();

        if (!profileResponse.ok || profileData.status !== 'success') {
          if (profileResponse.status === 401) {
            tokenManager.clearTokens();
            window.location.href = '/login';
          }
          setError(profileData.message || 'Failed to fetch profile');
          return;
        }

        const memberData = profileData.data;
        setUserData(memberData);

        // Fetch attendance sessions for today
        const today = new Date().toISOString().split('T')[0];
        const sessionsResponse = await tokenManager.apiCall(
          `${API_BASE_URL}/api/attendance/userSessions?user_id=${userId}&date=${today}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const sessionsData = await sessionsResponse.json();

        const sessions = sessionsData.status === 'success' ? (sessionsData.data.sessions || []) : [];

        // Calculate dashboard stats
        const profileCompletion = calculateProfileCompletion(memberData);

        // Calculate days remaining
        const endDate = new Date(memberData.end_date);
        const today_date = new Date();
        const daysRemaining = Math.ceil((endDate - today_date) / (1000 * 60 * 60 * 24));

        const dashData = {
          member: {
            join_date: memberData.date_of_joining || new Date().toISOString().split('T')[0],
            status: memberData.status === 1 ? 'ACTIVE' : 'INACTIVE'
          },
          subscription: {
            plan_name: memberData.plan_name || getPlanName(memberData.membership_plan),
            status: memberData.subscription_status === 1 ? 'ACTIVE' : 'INACTIVE',
            start_date: memberData.start_date || new Date().toISOString().split('T')[0],
            end_date: memberData.end_date || new Date().toISOString().split('T')[0],
            days_remaining: Math.max(0, daysRemaining),
            freeze_status: 'NONE',
            freeze_days: 0
          },
          attendance: {
            total_sessions_this_month: sessions.length || 0,
            total_duration_this_month: sessions.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0),
            current_streak: 1, // Would need more data history to calculate accurately
            last_check_in: sessions.length > 0 ? sessions[0].check_in : null,
            avg_duration: sessions.length > 0
              ? Math.round(sessions.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0) / sessions.length)
              : 0
          },
          profile: {
            completion: profileCompletion,
            missing_fields: []
          },
          recent_sessions: sessions,
          memberData: memberData
        };

        setDashboardData(dashData);
        setError(null);
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      ) : !userData || !dashboardData ? (
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
              title="Today"
              value={`${dashboardData.attendance.total_sessions_this_month} Sessions`}
              subtitle={formatDuration(dashboardData.attendance.total_duration_this_month)}
              linkTo="/profile?tab=attendance"
            />

            <StatCard
              icon="fas fa-fire"
              iconClass="streak"
              title="Avg Duration"
              value={`${dashboardData.attendance.avg_duration} mins`}
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