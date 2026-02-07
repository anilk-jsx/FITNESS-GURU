import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Subscriptions from './components/Subscriptions';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import MemberManagement from './components/MemberManagement';
import SubscriptionManagement from './components/SubscriptionManagement';
import AttendanceManagement from './components/AttendanceManagement';
import StaffManagement from './components/StaffManagement';
import BranchManagement from './components/BranchManagement';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Facilities from './components/Facilities';
import DirectorsMessage from './components/DirectorsMessage';
import Membership from './components/Membership';
import Contact from './components/Contact';
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import Trainers from './components/Trainers';
import Login from './components/Login';
import './App.css';

// Admin Dashboard Child Components
const AdminDashboardHome = () => (
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
            <p className="admin-stat-value">1,245</p>
          </div>
        </div>
        <p className="admin-stat-subtitle">+12% from last month</p>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-header">
          <div className="admin-stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <i className="fas fa-dumbbell"></i>
          </div>
          <div>
            <h3 className="admin-stat-title">Active Subscriptions</h3>
            <p className="admin-stat-value">987</p>
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
            <p className="admin-stat-value">₹12,34,000</p>
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
            <p className="admin-stat-value">78%</p>
          </div>
        </div>
        <p className="admin-stat-subtitle">Average attendance rate</p>
      </div>
    </div>
    <div className="admin-dashboard-section">
      <h2 className="admin-section-title">Quick Actions</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-btn" onClick={() => window.location.href = '/admin-dashboard/members'}>
          <i className="fas fa-user-plus"></i>
          <span>Add Member</span>
        </button>
        <button className="admin-action-btn" onClick={() => window.location.href = '/admin-dashboard/subscriptions'}>
          <i className="fas fa-credit-card"></i>
          <span>Manage Subscriptions</span>
        </button>
        <button className="admin-action-btn" onClick={() => window.location.href = '/admin-dashboard/attendance'}>
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardHome />} />
          <Route path="members" element={<MemberManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="branches" element={<BranchManagement />} />
        </Route>
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/*" element={
          <>
            <Navbar />
            <Hero />
            <About />
            <Facilities />
            <DirectorsMessage />
            <Membership />
            <Trainers />
            <Testimonials />
            <Contact />
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App
