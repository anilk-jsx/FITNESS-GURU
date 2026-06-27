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
import BranchManagement from './components/BranchManagement';
import ContactManagement from './components/ContactManagement';
import FitnessAssessment from './components/FitnessAssessment';
import SectionDivider from './components/SectionDivider';
import AdminDietPlans from './components/AdminDietPlans';

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
import TrainerWorkoutPlans from './components/TrainerDashboard/TrainerWorkoutPlans';
import TrainerDietPlans from './components/TrainerDashboard/TrainerDietPlans';
import TrainerAttendance from './components/TrainerDashboard/TrainerAttendance';
import TrainerSchedule from './components/TrainerDashboard/TrainerSchedule';
import TrainerNotifications from './components/TrainerDashboard/TrainerNotifications';
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
        <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardHome />} />
          <Route path="members" element={<MemberManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="branches" element={<BranchManagement />} />
          <Route path="contacts" element={<ContactManagement />} />
          <Route path="fitness-assessments" element={<FitnessAssessment />} />
          <Route path="mapping" element={<UserTrainerMapping />} />
          <Route path="diet-plans" element={<AdminDietPlans />} />
        </Route>
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/trainer-dashboard" element={<ProtectedRoute trainerOnly><TrainerDashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TrainerDashboardHome />} />
          <Route path="clients" element={<TrainerClients />} />
          <Route path="assessments" element={<TrainerAssessments />} />
          <Route path="workout-plans" element={<TrainerWorkoutPlans />} />
          <Route path="diet-plans" element={<TrainerDietPlans />} />
          <Route path="attendance" element={<TrainerAttendance />} />
          <Route path="schedule" element={<TrainerSchedule />} />
          <Route path="notifications" element={<TrainerNotifications />} />
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
