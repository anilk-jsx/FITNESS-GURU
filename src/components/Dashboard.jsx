import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import './Dashboard.css';

/**
 * Dashboard Component - User Dashboard Page
 * 
 * Backend Integration Notes:
 * - userData: Will be fetched from user context/authentication service
 * - dashboardData: Should be fetched from API endpoints:
 *   - GET /api/user/subscription - for subscription status
 *   - GET /api/user/attendance - for attendance data
 *   - GET /api/user/profile - for profile completion
 *   - GET /api/classes/upcoming - for upcoming classes
 * - All mock data should be replaced with actual API calls
 * - Add loading states and error handling for API calls
 * - Implement proper user authentication check before rendering
 */

// Dashboard Components
const DashboardHeader = ({ userName }) => (
  <div className="dashboard-header">
    <h1 className="dashboard-title">Dashboard</h1>
    <p className="dashboard-subtitle">
      Welcome back, {userName}! Here's a quick overview of your FITNESS GURU activities.
    </p>
  </div>
);

const UserProfile = ({ userData }) => (
  <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div 
      className="user-profile" 
      style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div className="user-avatar-img">
        <img src="/avatar.png" alt={userData.name} />
      </div>
      <div className="user-info">
        <h3>{userData.name}</h3>
        <p>{userData.membershipType} • Joined {userData.joinDate}</p>
      </div>
      <div style={{ marginLeft: 'auto', color: '#ff6b35' }}>
        <i className="fas fa-arrow-right"></i>
      </div>
    </div>
  </Link>
);

const StatCard = ({ icon, iconClass, title, value, subtitle, actionText, onAction }) => (
  <div className="stat-card">
    <div className="stat-header">
      <div className={`stat-icon ${iconClass}`}>
        <i className={icon}></i>
      </div>
      <div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-subtitle">{subtitle}</div>
    <div className="stat-actions">
      <button className="btn-sm btn-outline" onClick={onAction}>
        {actionText}
      </button>
    </div>
  </div>
);

const ClassItem = ({ className, instructor, time }) => (
  <div className="class-item">
    <div className="class-info">
      <h4>{className}</h4>
      <p>Instructor: {instructor}</p>
    </div>
    <div className="class-time">{time}</div>
  </div>
);

const ActionCard = ({ icon, iconClass, title, description, buttonText, buttonClass, linkTo }) => (
  <div className="action-card">
    <div className={`action-icon ${iconClass}`}>
      <i className={icon}></i>
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
    <Link to={linkTo} className={`btn-full ${buttonClass}`}>
      {buttonText}
    </Link>
  </div>
);

const Dashboard = () => {
  // Mock user data - this will come from backend/context in the future
  const [userData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    membershipType: 'Premium Member',
    joinDate: 'March 2023'
  });

  // Mock dashboard data - this will come from API calls in the future
  const [dashboardData] = useState({
    subscription: {
      status: 'Active',
      expiryDate: 'Nov 30, 2026'
    },
    attendance: {
      recentWorkouts: 5,
      lastWorkout: '2023-10-26'
    },
    profile: {
      completion: 85
    },
    upcomingClasses: [
      {
        id: 1,
        name: 'Morning Yoga',
        instructor: 'Sarah J.',
        time: 'Mon, Oct 30 at 7:00 AM'
      },
      {
        id: 2,
        name: 'HIIT Express',
        instructor: 'Mike R.',
        time: 'Tue, Oct 31 at 5:30 PM'
      },
      {
        id: 3,
        name: 'Strength Training',
        instructor: 'David L.',
        time: 'Wed, Nov 1 at 5:30 PM'
      },
      {
        id: 4,
        name: 'Fitness Core',
        instructor: 'Emma K.',
        time: 'Fri, Nov 3 at 9:00 AM'
      }
    ]
  });

  const showComingSoon = (feature) => {
    alert(`${feature} feature is coming soon! 🚀\n\nThis feature is currently under development and will be available in a future update.`);
  };

  // Add loading states to buttons
  const handleButtonClick = (originalText, button, callback) => {
    const originalTextContent = button.textContent;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
    button.textContent = 'Loading...';
    
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      button.textContent = originalTextContent;
      if (callback) callback();
    }, 2000);
  };

  useEffect(() => {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.stat-card, .action-card, .upcoming-classes');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }, []);

  return (
    <DashboardLayout userData={userData}>
      <DashboardHeader userName={userData.name} />
      
      <UserProfile userData={userData} />

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="fas fa-crown"
          iconClass="subscription"
          title="Subscription Status"
          value={dashboardData.subscription.status}
          subtitle={`Your current plan is valid until ${dashboardData.subscription.expiryDate}`}
          actionText="View History"
          onAction={() => showComingSoon('View History')}
        />

        <StatCard
          icon="fas fa-chart-line"
          iconClass="attendance"
          title="Recent Attendance"
          value={`${dashboardData.attendance.recentWorkouts} Workouts`}
          subtitle={`Last was on ${dashboardData.attendance.lastWorkout}`}
          actionText="View History"
          onAction={() => showComingSoon('View History')}
        />

        <StatCard
          icon="fas fa-user-check"
          iconClass="profile"
          title="Profile Completion"
          value={`${dashboardData.profile.completion}%`}
          subtitle="Complete your profile to unlock all features"
          actionText="Update Profile"
          onAction={() => window.location.href = '/profile'}
        />
      </div>

      {/* Upcoming Classes */}
      <div className="upcoming-classes">
        <div className="section-header">
          <h2 className="section-title">Upcoming Classes</h2>
          <button 
            className="btn-primary" 
            onClick={() => showComingSoon('Book New Class')}
          >
            Book New Class
          </button>
        </div>
        
        <div className="classes-list">
          {dashboardData.upcomingClasses.map((classItem) => (
            <ClassItem
              key={classItem.id}
              className={classItem.name}
              instructor={classItem.instructor}
              time={classItem.time}
            />
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards">
        <ActionCard
          icon="fas fa-credit-card"
          iconClass="subscriptions"
          title="Manage Subscriptions"
          description="Review your current plan, upgrade, or manage billing details."
          buttonText="Go To Subscriptions"
          buttonClass="btn-purple"
          linkTo="/subscriptions"
        />

        <ActionCard
          icon="fas fa-user-cog"
          iconClass="profile"
          title="View Profile & Attendance"
          description="Update personal information, check biometric status, and track your workout history."
          buttonText="Go To Profile"
          buttonClass="btn-green"
          linkTo="/profile"
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;