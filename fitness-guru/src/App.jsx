import { useState } from 'react'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>
        <h1>FITNESS GURU - React App</h1>
        <p>Navbar component has been successfully converted to React!</p>
        <div id="home">Home Section</div>
        <div id="about" style={{ marginTop: '200px' }}>About Section</div>
        <div id="membership" style={{ marginTop: '200px' }}>Membership Section</div>
        <div id="contact" style={{ marginTop: '200px' }}>Contact Section</div>
      </div>
    </>
  )
}

export default App
