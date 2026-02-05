import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Facilities from './components/Facilities'
import DirectorsMessage from './components/DirectorsMessage'
import Membership from './components/Membership'
import Contact from './components/Contact'
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
      <Contact />
    </>
  )
}

export default App
