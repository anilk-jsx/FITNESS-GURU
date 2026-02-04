import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Facilities from './components/Facilities'
import DirectorsMessage from './components/DirectorsMessage'
import Membership from './components/Membership'
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
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <div id="contact" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <h2 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '2rem' }}>Contact Section</h2>
          <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Contact information and form will be here.
          </p>
        </div>
      </div>
    </>
  )
}

export default App
