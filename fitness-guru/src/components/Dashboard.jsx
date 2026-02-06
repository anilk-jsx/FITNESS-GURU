import React from "react";
import DashboardLayout from "./DashboardLayout";
import styles from "./Dashboard.module.css";

const user = {
  name: "John Doe",
  email: "john.doe@example.com",
};

const classes = [
  { title: "Morning Yoga", instructor: "Sarah J.", time: "Mon, Oct 30 at 7:00 AM" },
  { title: "HIIT Express", instructor: "Mike R.", time: "Tue, Oct 31 at 5:30 PM" },
  { title: "Strength Training", instructor: "David L.", time: "Wed, Nov 1 at 5:30 PM" },
  { title: "Fitness Core", instructor: "Emma K.", time: "Fri, Nov 3 at 9:00 AM" },
];

export default function Dashboard() {
  return (
    <DashboardLayout user={user}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Welcome back, John Doe! Here's a quick overview of your FITNESS GURU activities.</p>
      </div>
      {/* User Profile Card */}
      <a href="/profile" style={{ textDecoration: "none", color: "inherit" }}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>JD</div>
          <div className={styles.userInfo}>
            <h3>John Doe</h3>
            <p>Premium Member • Joined March 2023</p>
          </div>
          <div style={{ marginLeft: "auto", color: "#ff6b35" }}>
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
      </a>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.subscription}`}><i className="fas fa-crown"></i></div>
            <div><div className={styles.statTitle}>Subscription Status</div></div>
          </div>
          <div className={styles.statValue}>Active</div>
          <div className={styles.statSubtitle}>Your current plan is valid until Nov 30, 2026</div>
          <div className={styles.statActions}>
            <button className={`${styles.btnSm} ${styles.btnOutline}`} onClick={() => alert('View History coming soon!')}>View History</button>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.attendance}`}><i className="fas fa-chart-line"></i></div>
            <div><div className={styles.statTitle}>Recent Attendance</div></div>
          </div>
          <div className={styles.statValue}>5 Workouts</div>
          <div className={styles.statSubtitle}>Last was on 2023-10-26</div>
          <div className={styles.statActions}>
            <button className={`${styles.btnSm} ${styles.btnOutline}`} onClick={() => alert('View History coming soon!')}>View History</button>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.profile}`}><i className="fas fa-user-check"></i></div>
            <div><div className={styles.statTitle}>Profile Completion</div></div>
          </div>
          <div className={styles.statValue}>85%</div>
          <div className={styles.statSubtitle}>Complete your profile to unlock all features</div>
          <div className={styles.statActions}>
            <a href="/profile" className={`${styles.btnSm} ${styles.btnOutline}`}>Update Profile</a>
          </div>
        </div>
      </div>
      {/* Upcoming Classes */}
      <div className={styles.upcomingClasses}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming Classes</h2>
          <button className={styles.btnPrimary} onClick={() => alert('Book New Class coming soon!')}>Book New Class</button>
        </div>
        <div className={styles.classesList}>
          {classes.map((cls, idx) => (
            <div className={styles.classItem} key={idx}>
              <div className={styles.classInfo}>
                <h4>{cls.title}</h4>
                <p>Instructor: {cls.instructor}</p>
              </div>
              <div className={styles.classTime}>{cls.time}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Action Cards */}
      <div className={styles.actionCards}>
        <div className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles.subscriptions}`}><i className="fas fa-credit-card"></i></div>
          <h3>Manage Subscriptions</h3>
          <p>Review your current plan, upgrade, or manage billing details.</p>
          <a href="/subscriptions" className={`${styles.btnFull} ${styles.btnPurple}`}>Go To Subscriptions</a>
        </div>
        <div className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles.profile}`}><i className="fas fa-user-cog"></i></div>
          <h3>View Profile & Attendance</h3>
          <p>Update personal information, check biometric status, and track your workout history.</p>
          <a href="/profile" className={`${styles.btnFull} ${styles.btnGreen}`}>Go To Profile</a>
        </div>
      </div>
    </DashboardLayout>
  );
}
