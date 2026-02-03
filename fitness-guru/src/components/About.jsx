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
        
        // Determine active event and transition progress
        const eventProgress = progress * (TIMELINE_EVENTS.length - 1)
        const currentIndex = Math.floor(eventProgress)
        const transitionProgress = eventProgress - currentIndex
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
        
        // Update CSS custom properties for continuous transitions
        container.style.setProperty('--scroll-progress', progress)
        container.style.setProperty('--active-event', currentIndex)
        container.style.setProperty('--transition-progress', transitionProgress)
        container.style.setProperty('--event-progress', eventProgress)
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
                  transform: `translateX(${scrollProgress * 30 * (index - activeEventIndex)}px) scale(${index === activeEventIndex ? 1.05 : 0.95})`,
                }}
              >
                {event.images.map((img, imgIndex) => (
                  <img 
                    key={imgIndex} 
                    src={img} 
                    alt={`${event.title} bg ${imgIndex}`}
                    className={`bg-image bg-image-${imgIndex + 1} animate-on-scroll`}
                    style={{
                      '--delay': `${imgIndex * 0.2}s`,
                      '--initial-x': `${(imgIndex - 1) * 150}px`,
                      '--initial-y': `${(imgIndex % 2 === 0 ? -80 : 80)}px`
                    }}
                  />
                ))}
              </div>

              {/* Foreground Content - Full speed */}
              <div className="event-content">
                <div 
                  className="event-year"
                  style={{
                    opacity: Math.max(0, 1 - Math.abs(index - scrollProgress * (TIMELINE_EVENTS.length - 1)) * 0.8),
                    transform: `translate(-50%, -50%) scale(${0.8 + 0.4 * Math.max(0, 1 - Math.abs(index - scrollProgress * (TIMELINE_EVENTS.length - 1)))})`
                  }}
                >
                  IN {event.year}...
                </div>
                
                <div className="event-images">
                  {event.images.map((img, imgIndex) => {
                    // Calculate continuous movement between slides
                    const eventProgress = scrollProgress * (TIMELINE_EVENTS.length - 1)
                    const distanceFromActive = index - eventProgress
                    const isInTransition = Math.abs(distanceFromActive) <= 1
                    
                    // Different layouts for each slide
                    const slideLayouts = {
                      0: [ // 1990 - Scattered triangle layout
                        { x: 15, y: 20 },
                        { x: 70, y: 35 },
                        { x: 45, y: 70 }
                      ],
                      1: [ // 2000 - Linear diagonal
                        { x: 25, y: 15 },
                        { x: 50, y: 40 },
                        { x: 75, y: 65 }
                      ],
                      2: [ // 2015 - Circular arrangement
                        { x: 20, y: 50 },
                        { x: 60, y: 25 },
                        { x: 65, y: 75 }
                      ],
                      3: [ // 2024 - Modern grid
                        { x: 10, y: 30 },
                        { x: 55, y: 20 },
                        { x: 80, y: 60 }
                      ]
                    }
                    
                    const layout = slideLayouts[index] || slideLayouts[0]
                    const basePos = layout[imgIndex] || { x: 50, y: 50 }
                    
                    // Calculate transition offset based on scroll
                    let offsetX = 0
                    let offsetY = 0
                    let scale = 1
                    let rotation = 0
                    
                    if (isInTransition) {
                      const transitionFactor = 1 - Math.abs(distanceFromActive)
                      
                      // Different starting positions (not from corners)
                      const startingPositions = {
                        0: { x: -200, y: 300, rotation: -90 },  // From bottom-left
                        1: { x: 400, y: -100, rotation: 180 }, // From top-right
                        2: { x: 0, y: -200, rotation: 45 }     // From top-center
                      }
                      
                      const start = startingPositions[imgIndex] || { x: 0, y: 0, rotation: 0 }
                      
                      // Interpolate between starting and final positions
                      offsetX = start.x * (1 - transitionFactor)
                      offsetY = start.y * (1 - transitionFactor)
                      rotation = start.rotation * (1 - transitionFactor)
                      scale = 0.4 + (0.6 * transitionFactor)
                    }
                    
                    return (
                      <div 
                        key={imgIndex} 
                        className={`event-image-card card-${imgIndex + 1} continuous-transition`}
                        style={{
                          left: `calc(${basePos.x}% + ${offsetX}px)`,
                          top: `calc(${basePos.y}% + ${offsetY}px)`,
                          transform: `rotate(${rotation}deg) scale(${scale})`,
                          transition: 'all 0.4s ease-out'
                        }}
                      >
                        <img src={img} alt={`${event.title} ${imgIndex + 1}`} />
                      </div>
                    )
                  })}
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
