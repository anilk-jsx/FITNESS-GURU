import React, { useEffect, useRef, useState } from 'react'
import './Facilities.css'
import img1 from '../assets/heroImg/home1.jpg'
import img2 from '../assets/heroImg/home2.jpg'
import img3 from '../assets/heroImg/home3.jpg'
import img4 from '../assets/heroImg/home4.jpg'
import img6 from '../assets/heroImg/home6.jpg'
import img8 from '../assets/heroImg/home8.jpg'

const FACILITY_CATEGORIES = [
  {
    id: 1,
    title: 'Cardio Equipment',
    description: 'State-of-the-art cardiovascular machines for optimal heart health and endurance training.',
    image: img1,
    equipment: [
      { name: 'Treadmills', specs: 'Commercial Grade • Variable Incline • Heart Rate Monitoring', count: 12 },
      { name: 'Ellipticals', specs: 'Low Impact • Full Body • Multiple Programs', count: 8 },
      { name: 'Stationary Bikes', specs: 'Spin Class Ready • Adjustable Resistance • Performance Tracking', count: 15 },
      { name: 'Rowing Machines', specs: 'Full Body Workout • Real Water Resistance • Olympic Grade', count: 6 }
    ],
    accent: '#ff6b35'
  },
  {
    id: 2,
    title: 'Strength Training',
    description: 'Professional-grade strength equipment designed for serious muscle building and power development.',
    image: img2,
    equipment: [
      { name: 'Free Weights', specs: 'Olympic Barbells • Complete Dumbbell Set • Premium Steel', count: 50 },
      { name: 'Power Racks', specs: 'Multi-Station • Safety Bars • Pull-Up Integration', count: 6 },
      { name: 'Cable Machines', specs: 'Dual Stack • Multiple Attachments • Smooth Operation', count: 8 },
      { name: 'Bench Press', specs: 'Olympic Standard • Adjustable • Competition Grade', count: 4 }
    ],
    accent: '#e74c3c'
  },
  {
    id: 3,
    title: 'Functional Training',
    description: 'Versatile training zones equipped for functional movements, HIIT, and athletic performance.',
    image: img3,
    equipment: [
      { name: 'Battle Ropes', specs: 'Heavy Duty • Multiple Weights • Anchor Points', count: 8 },
      { name: 'Kettlebells', specs: 'Cast Iron • Competition Grade • Full Weight Range', count: 25 },
      { name: 'Medicine Balls', specs: 'Slam Balls • Wall Balls • Weighted Training', count: 20 },
      { name: 'Suspension Trainers', specs: 'TRX Systems • Anchor Points • Group Training Ready', count: 12 }
    ],
    accent: '#3498db'
  },
  {
    id: 4,
    title: 'Recovery & Wellness',
    description: 'Advanced recovery facilities to optimize your training results and overall wellness.',
    image: img4,
    equipment: [
      { name: 'Sauna', specs: 'Finnish Style • Infrared Technology • Relaxation Zone', count: 2 },
      { name: 'Ice Bath', specs: 'Cold Therapy • Temperature Control • Recovery Focused', count: 1 },
      { name: 'Massage Chairs', specs: 'Full Body • Multiple Programs • Stress Relief', count: 4 },
      { name: 'Stretching Area', specs: 'Yoga Mats • Foam Rollers • Mobility Tools', count: 1 }
    ],
    accent: '#9b59b6'
  },
  {
    id: 5,
    title: 'Group Fitness',
    description: 'Spacious studios equipped for various group classes and community training sessions.',
    image: img6,
    equipment: [
      { name: 'Yoga Studio', specs: 'Mirrored Walls • Sound System • Climate Controlled', count: 1 },
      { name: 'Spin Studio', specs: '20 Bikes • Immersive Audio • LED Lighting', count: 1 },
      { name: 'HIIT Zone', specs: 'Open Space • Timer Systems • Equipment Storage', count: 1 },
      { name: 'Boxing Area', specs: 'Heavy Bags • Speed Bags • Training Equipment', count: 1 }
    ],
    accent: '#f39c12'
  },
  {
    id: 6,
    title: 'Technology Integration',
    description: 'Cutting-edge fitness technology to track, analyze, and optimize your workout performance.',
    image: img8,
    equipment: [
      { name: 'Fitness Apps', specs: 'Workout Tracking • Progress Analytics • Social Features', count: 1 },
      { name: 'Heart Rate Zones', specs: 'Real-time Monitoring • Zone Training • Performance Data', count: 1 },
      { name: 'Virtual Training', specs: 'AI Coaching • Form Analysis • Personalized Programs', count: 1 },
      { name: 'Body Composition', specs: 'InBody Scanner • Detailed Analysis • Progress Tracking', count: 1 }
    ],
    accent: '#1abc9c'
  }
]

export default function Facilities() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % FACILITY_CATEGORIES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCategoryClick = (index) => {
    setActiveCategory(index)
  }

  return (
    <section ref={sectionRef} className={`facilities-section ${isInView ? 'in-view' : ''}`}>
      <div className="facilities-container">
        {/* Header Section */}
        <div className="facilities-header">
          <div className="header-content">
            <span className="section-tag">Our Facilities</span>
            <h2 className="facilities-title">
              World-Class <span className="highlight">Equipment</span>
            </h2>
            <p className="facilities-subtitle">
              Experience fitness like never before with our premium equipment, 
              cutting-edge technology, and expertly designed training environments.
            </p>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="categories-nav">
          {FACILITY_CATEGORIES.map((category, index) => (
            <button
              key={category.id}
              className={`category-btn ${index === activeCategory ? 'active' : ''}`}
              onClick={() => handleCategoryClick(index)}
              style={{
                '--accent-color': category.accent,
                '--delay': `${index * 0.1}s`
              }}
            >
              <span className="btn-text">{category.title}</span>
              <div className="btn-indicator" />
            </button>
          ))}
        </div>

        {/* Main Content Display */}
        <div className="facilities-showcase">
          {FACILITY_CATEGORIES.map((category, index) => (
            <div
              key={category.id}
              className={`facility-card ${index === activeCategory ? 'active' : ''}`}
              ref={(el) => (cardRefs.current[index] = el)}
              style={{
                '--accent-color': category.accent,
                '--card-delay': `${index * 0.15}s`
              }}
            >
              <div className="card-background">
                <img src={category.image} alt={category.title} className="card-bg-image" />
                <div className="card-overlay" />
              </div>
              
              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">{category.title}</h3>
                  <p className="card-description">{category.description}</p>
                </div>
                
                <div className="equipment-grid">
                  {category.equipment.map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      className="equipment-item"
                      style={{
                        '--item-delay': `${itemIndex * 0.1}s`
                      }}
                    >
                      <div className="equipment-header">
                        <h4 className="equipment-name">{item.name}</h4>
                        <span className="equipment-count">×{item.count}</span>
                      </div>
                      <p className="equipment-specs">{item.specs}</p>
                      <div className="equipment-indicator" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card-decorations">
                <div className="decoration decoration-1" />
                <div className="decoration decoration-2" />
                <div className="decoration decoration-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="facilities-stats">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Equipment Pieces</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">6</div>
            <div className="stat-label">Specialized Zones</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Access Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Uptime Guarantee</div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-element element-1" />
        <div className="floating-element element-2" />
        <div className="floating-element element-3" />
      </div>
    </section>
  )
}