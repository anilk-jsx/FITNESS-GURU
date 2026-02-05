import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Facilities from './components/Facilities'
import DirectorsMessage from './components/DirectorsMessage'
import Membership from './components/Membership'
import Contact from './components/Contact'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Facilities />
      <DirectorsMessage />
      <Membership />
      <Contact />
    </>
  )
}

export default App
