import React, { useEffect, useRef, useState } from 'react'
import './DirectorsMessage.css'
import directorImg from '../assets/heroImg/home9.jpg'

const DirectorsMessage = () => {
  const [inView, setInView] = useState(false)
  const sectionRef = useRef(null)
  const messageRef = useRef(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  
  const message = "In today's fast-paced world, fitness isn't just a luxury—it's a necessity. At Fitness Guru, we understand the challenges of maintaining your health while juggling career, family, and personal goals. Our mission is simple: to be your trusted partner in transforming not just your body, but your entire approach to wellness. We believe that everyone deserves access to world-class fitness guidance, regardless of their schedule or starting point. Through innovative training methods, personalized coaching, and a supportive community, we're here to help you reclaim your strength, energy, and confidence. Because when you invest in your fitness, you're investing in every aspect of your life."

  const words = message.split(' ')

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      {
        threshold: 0.3,
        rootMargin: '-50px'
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setCurrentWordIndex(prev => {
            if (prev < words.length - 1) {
              return prev + 1
            } else {
              clearInterval(interval)
              return prev
            }
          })
        }, 150)
        
        return () => clearInterval(interval)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [inView, words.length])

  return (
    <section 
      ref={sectionRef}
      className={`directors-message-section ${inView ? 'in-view' : ''}`}
    >
      {/* Background Elements */}
      <div className="directors-bg-elements">
        <div className="directors-circle directors-circle-1"></div>
        <div className="directors-circle directors-circle-2"></div>
        <div className="directors-gradient-overlay"></div>
      </div>

      <div className="directors-container">
        {/* Section Header */}
        <div className="directors-header">
          <span className="directors-tag">Leadership</span>
          <h2 className="directors-title">
            A Message from Our <span className="highlight">Director</span>
          </h2>
          <p className="directors-subtitle">
            Inspiring transformation in our fast-paced world
          </p>
        </div>

        {/* Main Content */}
        <div className="directors-content">
          {/* Director Image */}
          <div className="directors-image-container">
            <div className="directors-image-wrapper">
              <img 
                src={directorImg} 
                alt="Fitness Guru Director" 
                className="directors-image"
              />
              <div className="directors-image-overlay"></div>
            </div>
            <div className="directors-info">
              <h3 className="directors-name">Roshan Das</h3>
              <p className="directors-position">Founder & Director</p>
              <div className="directors-credentials">
                <span className="credential">Master Trainer</span>
                <span className="credential">Wellness Coach</span>
                <span className="credential">Nutrition Expert</span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="directors-message-container">
            <div className="directors-quote-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z" />
              </svg>
            </div>
            
            <div 
              ref={messageRef}
              className="directors-message-text"
            >
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`message-word ${index <= currentWordIndex ? 'visible' : ''}`}
                  style={{ '--delay': `${index * 0.05}s` }}
                >
                  {word}
                  {index < words.length - 1 && ' '}
                </span>
              ))}
            </div>

            <div className="directors-signature">
              <div className="signature-line"></div>
              <span className="signature-text">Roshan Das</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="directors-cta">
          <button className="directors-cta-btn">
            Start Your Journey
            <svg className="btn-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
          <p className="directors-cta-text">
            Join thousands who have already transformed their lives
          </p>
        </div>
      </div>
    </section>
  )
}

export default DirectorsMessage