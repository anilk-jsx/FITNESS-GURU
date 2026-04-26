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
        </Route>
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
            <h1>HELLO WORLD</h1>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App
