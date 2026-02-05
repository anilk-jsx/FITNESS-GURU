
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
