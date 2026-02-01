import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Hero />
      <div style={{ paddingTop: '50px', minHeight: '200vh', background: '#f8f9fa' }}>
        <div id="about" style={{ paddingTop: '50px', textAlign: 'center' }}>
          <h2 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '2rem' }}>About Section</h2>
          <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            This is where the About section will go. The hero section above has automatic 
            background image transitions every 5 seconds with smooth animations.
          </p>
        </div>
        <div id="membership" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <h2 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '2rem' }}>Membership Section</h2>
          <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Membership plans and pricing will be displayed here.
          </p>
        </div>
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
