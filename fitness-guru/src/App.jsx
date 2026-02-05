import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Facilities from './components/Facilities'
import DirectorsMessage from './components/DirectorsMessage'
import Membership from './components/Membership'
import Contact from './components/Contact'
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import './App.css'

import Trainers from './components/Trainers'

function App() {

  return (
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
  )
}

export default App
