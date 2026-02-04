import React, { useEffect, useRef, useState } from 'react'
import '../App.css'
import './About.css'
// Import different images for each timeline era
import img2018_1 from '../assets/heroImg/home1.jpg'
import img2018_2 from '../assets/heroImg/home2.jpg'
import img2018_3 from '../assets/heroImg/home3.jpg'
import img2020_1 from '../assets/heroImg/home4.jpg'
import img2020_2 from '../assets/heroImg/home6.jpg'
import img2020_3 from '../assets/heroImg/home7.avif'
import img2021_1 from '../assets/heroImg/home8.jpg'
import img2021_2 from '../assets/heroImg/home9.jpg'
import img2021_3 from '../assets/heroImg/home1.jpg'
import img2026_1 from '../assets/heroImg/home2.jpg'
import img2026_2 from '../assets/heroImg/home3.jpg'
import img2026_3 from '../assets/heroImg/home4.jpg'

const TIMELINE_EVENTS = [
  {
    id: 1,
    year: '2018',
    title: 'Our Beginning',
    description: 'What started as a small neighborhood training spot grew from passion and grit. We focused on real results and community.',
    images: [img2018_1, img2018_2, img2018_3],
    bgColor: '#0a0a0a',
  },
  {
    id: 2,
    year: '2020',
    title: 'Community Growth', 
    description: 'Membership expanded and we added classes, experienced trainers, and a stronger mission to support wellbeing.',
    images: [img2020_1, img2020_2, img2020_3],
    bgColor: '#0f0f0f',
  },
  {
    id: 3,
    year: '2021',
    title: 'Modern Expansion',
    description: 'A modern facility, personalised plans, and technology-enabled tracking — all while keeping our original spirit.',
    images: [img2021_1, img2021_2, img2021_3],
    bgColor: '#141414',
  },
  {
    id: 4,
    year: '2026',
    title: 'Future Vision',
    description: 'Leading the fitness revolution with AI-powered training, virtual classes, and a global community network.',
    images: [img2026_1, img2026_2, img2026_3],
    bgColor: '#0d0d0d',
  },
]

export default function About() {
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const svgRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeEventIndex, setActiveEventIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768
    }
    return false
  })
  const [mobileScrollProgress, setMobileScrollProgress] = useState(0)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    const svg = svgRef.current
    
    if (!container) return
    
    // Only check for desktop refs when not on mobile
    if (!isMobile && (!track || !svg)) return

    function handleScroll() {
      const rect = container.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Mobile behavior: simple vertical scroll progress
      if (isMobile) {
        const containerTop = container.offsetTop
        const containerHeight = container.offsetHeight
        const scrollTop = window.pageYOffset
        const scrollFromTop = scrollTop - containerTop
        
        // Only start showing images after scrolling into the section
        const progress = Math.max(0, Math.min(1, scrollFromTop / (containerHeight - windowHeight)))
        setMobileScrollProgress(progress)
        return
      }
      
      // Desktop behavior: Pin calculation when container top reaches viewport top
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        // Calculate scroll progress through the pinned section
        const totalScrollDistance = rect.height - windowHeight
        const scrolled = Math.abs(rect.top)
        const progress = Math.min(scrolled / totalScrollDistance, 1)
        
        setScrollProgress(progress)
        
        // Determine active event and transition progress with smoother interpolation
        const eventProgress = progress * (TIMELINE_EVENTS.length - 1)
        const currentIndex = Math.floor(eventProgress)
        const transitionProgress = eventProgress - currentIndex
        
        // Smooth transition curve
        const smoothProgress = transitionProgress < 0.5 
          ? 2 * transitionProgress * transitionProgress 
          : 1 - 2 * (1 - transitionProgress) * (1 - transitionProgress)
        
        setActiveEventIndex(currentIndex)
        
        // Smoother horizontal track animation
        const trackWidth = track.scrollWidth - window.innerWidth
        const translateX = -(progress * trackWidth)
        track.style.transform = `translateX(${translateX}px)`
        
        // SVG path animation with smoother timing
        const path = svg.querySelector('.timeline-path')
        if (path) {
          const pathLength = path.getTotalLength()
          const dashOffset = pathLength * (1 - progress)
          path.style.strokeDashoffset = dashOffset
        }
        
        // Update CSS custom properties for continuous transitions
        container.style.setProperty('--scroll-progress', progress)
        container.style.setProperty('--active-event', currentIndex)
        container.style.setProperty('--transition-progress', smoothProgress)
        container.style.setProperty('--event-progress', eventProgress)
      }
    }

    // Initialize SVG path (only for desktop)
    if (!isMobile) {
      const path = svg?.querySelector('.timeline-path')
      if (path) {
        const pathLength = path.getTotalLength()
        path.style.strokeDasharray = pathLength
        path.style.strokeDashoffset = pathLength
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isMobile]) // Always include isMobile as dependency

  return (
    <section id="about" ref={containerRef} className={`timeline-container ${isMobile ? 'mobile-layout' : ''}`}>
      {isMobile ? (
        // Mobile Layout: Static background with flowing images
        <div className="mobile-timeline">
          {/* Static Background Content */}
          <div className="mobile-bg-content">
            <div className="mobile-hero-text">
              <h1>FITNESS GURU</h1>
              <h2>THE JOURNEY SO FAR</h2>
              <p>
                FitnessGuru united 1,500+ registered users with
                4,000+ community providers united through growth
                and collaboration. In just 3 action-packed years we
                built 1000+ groundbreaking industry
                connections and pushed the boundaries. This
                year, we're going even bigger and bolder than ever.
                <br /><br />
                <strong>FitnessGuru</strong>
              </p>
            </div>
          </div>
          
          {/* Flowing Images Container */}
          <div className="mobile-images-flow">
            {TIMELINE_EVENTS.flatMap((event, eventIndex) => 
              event.images.map((img, imgIndex) => {
                const imageIndex = eventIndex * 3 + imgIndex
                
                // Position in two columns with varied positioning for each row
                const isLeftColumn = imageIndex % 2 === 0
                const rowIndex = Math.floor(imageIndex / 2)
                
                // Different speed multipliers for varied movement (declare early)
                const speedVariations = [1.2, 0.8, 1.5, 0.6, 1.0, 0.9, 1.3, 0.7, 1.1, 1.4, 0.5, 1.6]
                const speedMultiplier = speedVariations[imageIndex % speedVariations.length]
                
                // Different horizontal positions for each row to create varied layout
                const rowPositions = [
                  { left: '10%', right: '60%' },  // Row 0 - contained within bounds
                  { left: '15%', right: '55%' },  // Row 1 - safer positioning
                  { left: '12%', right: '58%' },  // Row 2 - moderate
                  { left: '18%', right: '52%' },  // Row 3 - more centered
                  { left: '14%', right: '56%' },  // Row 4 - balanced
                  { left: '16%', right: '54%' }   // Row 5 - contained
                ]
                
                const currentRowPos = rowPositions[rowIndex % rowPositions.length]
                
                // Reduce horizontal offset to keep images within bounds
                const speedOffset = (speedMultiplier - 1) * 2 // Smaller offset to stay in bounds
                const baseLeft = isLeftColumn ? currentRowPos.left : currentRowPos.right
                
                // Ensure position stays within 5% to 75% of screen width
                const rawLeftPercent = parseFloat(baseLeft.replace('%', '')) + speedOffset
                const constrainedLeftPercent = Math.max(5, Math.min(75, rawLeftPercent))
                const leftPosition = `${constrainedLeftPercent}%`
                
                // Continuous movement: images start from below viewport and move up
                // More spacing between images to prevent overlap
                const startY = 800 + (imageIndex * 200) + (Math.sin(imageIndex) * 100) // Varied starting positions
                
                const scrollOffset = mobileScrollProgress * 1200 * speedMultiplier
                const finalY = startY - scrollOffset
                
                // Always visible but only when in reasonable viewport range
                const viewportWidth = window.innerWidth || 390 // Default mobile width
                const imageWidth = 200 // Width of our images
                
                // Ensure images don't go outside screen boundaries
                const maxLeftPosition = viewportWidth - imageWidth - 20 // 20px margin
                const finalLeftPercent = Math.min(constrainedLeftPercent, (maxLeftPosition / viewportWidth) * 100)
                
                const isInViewport = finalY > -300 && finalY < window.innerHeight + 200
                const imageOpacity = isInViewport ? 1 : 0
                
                return (
                  <div 
                    key={`${eventIndex}-${imgIndex}`}
                    className="mobile-flow-image"
                    style={{
                      transform: `translateY(${finalY}px)`,
                      left: `${finalLeftPercent}%`,
                      opacity: imageOpacity,
                      transition: 'opacity 0.3s ease-in-out, transform 0.1s ease-out',
                      zIndex: Math.floor(10 + (finalY / -100)), // Dynamic z-index based on position
                      willChange: 'transform, opacity'
                    }}
                  >
                    <img src={img} alt={`${event.title} ${imgIndex + 1}`} />
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        // Desktop Layout: Original timeline behavior
        <>
          {/* Layer 1: Viewport Pin */}
          <div className="timeline-viewport">
        
        {/* Layer 3: SVG Thread */}
        <svg ref={svgRef} className="timeline-svg" viewBox="0 0 4000 100">
          <path 
            className="timeline-path"
            d={`M 0 50 Q 1000 50 1000 50 T 2020 50 T 3000 50 T 4000 50`}
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
              {/* Animated background elements */}
              <div className="animated-bg-elements">
                <div 
                  className="bg-circle bg-circle-1"
                  style={{
                    animationDelay: `${index * 0.5}s`
                  }}
                />
                <div 
                  className="bg-circle bg-circle-2"
                  style={{
                    animationDelay: `${index * 0.3 + 0.2}s`
                  }}
                />
                <div 
                  className="bg-circle bg-circle-3"
                  style={{
                    animationDelay: `${index * 0.7 + 0.4}s`
                  }}
                />
              </div>

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
                    // Calculate continuous movement between slides with smoother interpolation
                    const eventProgress = scrollProgress * (TIMELINE_EVENTS.length - 1)
                    const distanceFromActive = index - eventProgress
                    const isInTransition = Math.abs(distanceFromActive) <= 1.5 // Wider transition zone
                    
                    // Different layouts for each slide
                    const slideLayouts = {
                      0: [ // 2018 - Scattered triangle layout
                        { x: 15, y: 20 },
                        { x: 70, y: 35 },
                        { x: 45, y: 70 }
                      ],
                      1: [ // 2020 - Linear diagonal
                        { x: 25, y: 15 },
                        { x: 50, y: 40 },
                        { x: 75, y: 65 }
                      ],
                      2: [ // 2021 - Circular arrangement
                        { x: 20, y: 50 },
                        { x: 60, y: 25 },
                        { x: 65, y: 75 }
                      ],
                      3: [ // 2026 - Modern grid
                        { x: 10, y: 30 },
                        { x: 55, y: 20 },
                        { x: 80, y: 60 }
                      ]
                    }
                    
                    const layout = slideLayouts[index] || slideLayouts[0]
                    const basePos = layout[imgIndex] || { x: 50, y: 50 }
                    
                    // Calculate transition offset with smoother curves
                    let offsetX = 0
                    let offsetY = 0
                    let scale = 1
                    let rotation = 0
                    
                    if (isInTransition) {
                      // Smoother transition factor using ease-in-out curve
                      const rawFactor = 1 - Math.abs(distanceFromActive) / 1.5
                      const transitionFactor = rawFactor < 0.5 
                        ? 2 * rawFactor * rawFactor 
                        : 1 - 2 * (1 - rawFactor) * (1 - rawFactor)
                      
                      // Different starting positions with varied timing
                      const startingPositions = {
                        0: { x: -250, y: 350, rotation: -120 },  // From bottom-left with more rotation
                        1: { x: 450, y: -150, rotation: 200 },  // From top-right 
                        2: { x: -50, y: -250, rotation: 60 }    // From top-center
                      }
                      
                      const start = startingPositions[imgIndex] || { x: 0, y: 0, rotation: 0 }
                      
                      // Smooth interpolation with momentum
                      const momentum = 1 + (Math.sin(transitionFactor * Math.PI) * 0.1)
                      offsetX = start.x * (1 - transitionFactor) * momentum
                      offsetY = start.y * (1 - transitionFactor) * momentum
                      rotation = start.rotation * (1 - transitionFactor)
                      scale = 0.3 + (0.7 * transitionFactor)
                    }
                    
                    return (
                      <div 
                        key={imgIndex} 
                        className={`event-image-card card-${imgIndex + 1} continuous-transition`}
                        style={{
                          left: `calc(${basePos.x}% + ${offsetX}px)`,
                          top: `calc(${basePos.y}% + ${offsetY}px)`,
                          transform: `rotate(${rotation}deg) scale(${scale})`,
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
        </>
      )}
    </section>
  )
}
