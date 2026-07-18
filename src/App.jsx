import React from 'react';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Subscriptions from './components/Subscriptions';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import AdminDashboardHome from './components/AdminDashboardHome';
import MemberManagement from './components/MemberManagement';
import SubscriptionManagement from './components/SubscriptionManagement';
import AttendanceManagement from './components/AttendanceManagement';
import StaffManagement from './components/StaffManagement';
import AdminPayrollManagement from './components/AdminPayrollManagement';
import AdminFinanceManagement from './components/AdminFinanceManagement';
import BranchManagement from './components/BranchManagement';
import ContactManagement from './components/ContactManagement';
import FitnessAssessment from './components/FitnessAssessment';
import SectionDivider from './components/SectionDivider';
import AdminDietPlans from './components/AdminDietPlans';
import AdminPTManagement from './components/AdminPTManagement';
import GymConfigurationManagement from './components/GymConfigurationManagement';
import MemberPTModule from './components/MemberPTModule';
import AdminStoreManagement from './components/AdminStoreManagement';
import MemberStoreCatalog from './components/MemberStoreCatalog';

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
import UserTrainerMapping from './components/UserTrainerMapping';
import TrainerDashboardLayout from './components/TrainerDashboard/TrainerDashboardLayout';
import TrainerDashboardHome from './components/TrainerDashboard/TrainerDashboardHome';
import TrainerClients from './components/TrainerDashboard/TrainerClients';
import TrainerAssessments from './components/TrainerDashboard/TrainerAssessments';
import TrainerDietPlans from './components/TrainerDashboard/TrainerDietPlans';
import TrainerPTRoster from './components/TrainerDashboard/TrainerPTRoster';
import TrainerProfile from './components/TrainerDashboard/TrainerProfile';
import ProtectedRoute from './utils/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pt-sessions" element={<ProtectedRoute><MemberPTModule /></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><MemberStoreCatalog /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardHome />} />
          <Route path="members" element={<MemberManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="payroll" element={<AdminPayrollManagement />} />
          <Route path="finance" element={<AdminFinanceManagement />} />
          <Route path="branches" element={<BranchManagement />} />
          <Route path="contacts" element={<ContactManagement />} />
          <Route path="fitness-assessments" element={<Navigate to="/admin-dashboard/pt-management?tab=assessments" replace />} />
          <Route path="mapping" element={<UserTrainerMapping />} />
          <Route path="pt-management" element={<AdminPTManagement />} />
          <Route path="gym-configuration" element={<GymConfigurationManagement />} />
          <Route path="store-management" element={<AdminStoreManagement />} />
          <Route path="gym-shifts" element={<Navigate to="/admin-dashboard/gym-configuration?tab=shifts-slots" replace />} />
          <Route path="diet-plans" element={<Navigate to="/admin-dashboard/pt-management?tab=diet-plans" replace />} />
        </Route>
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/trainer-dashboard" element={<ProtectedRoute trainerOnly><TrainerDashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TrainerDashboardHome />} />
          <Route path="pt-roster" element={<TrainerPTRoster />} />
          <Route path="clients" element={<TrainerClients />} />
          <Route path="assessments" element={<Navigate to="/trainer-dashboard/pt-roster?tab=assessments" replace />} />
          <Route path="diet-plans" element={<Navigate to="/trainer-dashboard/pt-roster?tab=diet-plans" replace />} />
          <Route path="profile" element={<TrainerProfile />} />
        </Route>
        <Route path="/*" element={
          <>
            <Navbar />
            <Hero />
            <SectionDivider />
            <About />
            <SectionDivider />
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
