import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopAvatar from './TopAvatar';
import DashboardHeader from './DashboardHeader';
import UserProfileCard from './UserProfileCard';
import StatsGrid from './StatsGrid';
import UpcomingClasses from './UpcomingClasses';
import ActionCards from './ActionCards';
import './DashboardPage.css';

const DashboardPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    membership: 'Premium Member',
    joined: 'March 2023',
  };
  const stats = [
    {
      iconClass: 'fas fa-crown',
      iconType: 'subscription',
      title: 'Subscription Status',
      value: 'Active',
      subtitle: 'Your current plan is valid until Nov 30, 2026',
      actionText: 'View History',
      onAction: () => alert('View History feature is coming soon! 🚀'),
    },
    {
      iconClass: 'fas fa-chart-line',
      iconType: 'attendance',
      title: 'Recent Attendance',
      value: '5 Workouts',
      subtitle: 'Last was on 2023-10-26',
      actionText: 'View History',
      onAction: () => alert('View History feature is coming soon! 🚀'),
    },
    {
      iconClass: 'fas fa-user-check',
      iconType: 'profile',
      title: 'Profile Completion',
      value: '85%',
      subtitle: 'Complete your profile to unlock all features',
      actionText: 'Update Profile',
      actionLink: '/profile',
    },
  ];
  const classes = [
    { title: 'Morning Yoga', instructor: 'Sarah J.', time: 'Mon, Oct 30 at 7:00 AM' },
    { title: 'HIIT Express', instructor: 'Mike R.', time: 'Tue, Oct 31 at 5:30 PM' },
    { title: 'Strength Training', instructor: 'David L.', time: 'Wed, Nov 1 at 5:30 PM' },
    { title: 'Fitness Core', instructor: 'Emma K.', time: 'Fri, Nov 3 at 9:00 AM' },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  return (
    <div>
      <button className="mobile-menu-toggle" id="mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        <i className="fas fa-bars"></i>
      </button>
      <Sidebar onLogout={handleLogout} mobileOpen={mobileOpen} toggleMobileMenu={() => setMobileOpen(!mobileOpen)} />
      <div className="main-content">
        <TopAvatar user={user} onLogout={handleLogout} />
        <DashboardHeader user={user} />
        <UserProfileCard user={user} />
        <StatsGrid stats={stats} />
        <UpcomingClasses classes={classes} onBook={() => alert('Book New Class feature is coming soon! 🚀')} />
        <ActionCards />
      </div>
    </div>
  );
};

export default DashboardPage;
