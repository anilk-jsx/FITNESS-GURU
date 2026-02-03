import React, { useEffect, useRef, useState } from 'react'
import '../App.css'
import './About.css'
import img1 from '../assets/heroImg/home7.avif'

const TIMELINE_EVENTS = [
  {
    id: 1,
    year: '1990',
    title: 'Our Beginning',
    description: 'What started as a small neighborhood training spot grew from passion and grit. We focused on real results and community.',
    images: [img1, img1, img1],
    bgColor: '#0b0b0b',
  },
  {
    id: 2,
    year: '2000',
    title: 'Community Growth', 
    description: 'Membership expanded and we added classes, experienced trainers, and a stronger mission to support wellbeing.',
    images: [img1, img1, img1],
    bgColor: '#1a1a1a',
  },
  {
    id: 3,
    year: '2015',
    title: 'Modern Expansion',
    description: 'A modern facility, personalised plans, and technology-enabled tracking — all while keeping our original spirit.',
    images: [img1, img1, img1],
    bgColor: '#2a2a2a',
  },
  {
    id: 4,
    year: '2024',
    title: 'Future Vision',
    description: 'Leading the fitness revolution with AI-powered training, virtual classes, and a global community network.',
    images: [img1, img1, img1],
    bgColor: '#0a0a0a',
  },
]

export default function About() {
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const svgRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeEventIndex, setActiveEventIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    const svg = svgRef.current
    
    if (!container || !track || !svg) return

    function handleScroll() {
      const rect = container.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Pin calculation: when container top reaches viewport top
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        // Calculate scroll progress through the pinned section
        const totalScrollDistance = rect.height - windowHeight
        const scrolled = Math.abs(rect.top)
        const progress = Math.min(scrolled / totalScrollDistance, 1)
        
        setScrollProgress(progress)
        
        // Determine active event based on progress
        const eventProgress = progress * (TIMELINE_EVENTS.length - 1)
        const currentIndex = Math.min(Math.floor(eventProgress), TIMELINE_EVENTS.length - 1)
        setActiveEventIndex(currentIndex)
        
        // Horizontal track animation
        const trackWidth = track.scrollWidth - window.innerWidth
        const translateX = -(progress * trackWidth)
        track.style.transform = `translateX(${translateX}px)`
        
        // SVG path animation
        const path = svg.querySelector('.timeline-path')
        if (path) {
          const pathLength = path.getTotalLength()
          const dashOffset = pathLength * (1 - progress)
          path.style.strokeDashoffset = dashOffset
        }
      }
    }

    // Initialize SVG path
    const path = svg.querySelector('.timeline-path')
    if (path) {
      const pathLength = path.getTotalLength()
      path.style.strokeDasharray = pathLength
      path.style.strokeDashoffset = pathLength
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <section ref={containerRef} className="timeline-container">
      {/* Layer 1: Viewport Pin */}
      <div className="timeline-viewport">
        
        {/* Layer 3: SVG Thread */}
        <svg ref={svgRef} className="timeline-svg" viewBox="0 0 4000 100">
          <path 
            className="timeline-path"
            d={`M 0 50 Q 1000 50 1000 50 T 2000 50 T 3000 50 T 4000 50`}
            stroke="#ff6b35"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Layer 2: Horizontal Track */}
        <div ref={trackRef} className="timeline-track">
          {TIMELINE_EVENTS.map((event, index) => (
            <div 
              key={event.id} 
              className={`timeline-event ${index === activeEventIndex ? 'active' : ''}`}
              style={{ backgroundColor: event.bgColor }}
            >
              {/* Layer 4: Parallax Content */}
              
              {/* Background Layer - Slow parallax */}
              <div 
                className="event-background"
                style={{ 
                  transform: `translateX(${scrollProgress * 50 * (index - activeEventIndex)}px) scale(${index === activeEventIndex ? 1.1 : 0.9})`,
                  opacity: index === activeEventIndex ? 0.3 : 0.1 
                }}
              >
                {event.images.map((img, imgIndex) => (
                  <img 
                    key={imgIndex} 
                    src={img} 
                    alt={`${event.title} bg ${imgIndex}`}
                    className={`bg-image bg-image-${imgIndex + 1}`}
                  />
                ))}
              </div>

              {/* Foreground Content - Full speed */}
              <div className="event-content">
                <div className="event-year">IN {event.year}...</div>
                
                <div className="event-images">
                  {event.images.map((img, imgIndex) => (
                    <div 
                      key={imgIndex} 
                      className={`event-image-card card-${imgIndex + 1}`}
                      style={{
                        transform: `scale(${index === activeEventIndex ? 1 : 0.8}) translateZ(${index === activeEventIndex ? '20px' : '0'})`,
                        filter: index === activeEventIndex ? 'blur(0)' : 'blur(1px)'
                      }}
                    >
                      <img src={img} alt={`${event.title} ${imgIndex + 1}`} />
                    </div>
                  ))}
                </div>

                <div className="event-text">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
