import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Subscriptions from './components/Subscriptions';
import Profile from './components/Profile';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
