import { useState, useEffect } from 'react';
import './Hero.css';

// Import local hero images
import home1 from '../assets/heroImg/home1.jpg';
import home2 from '../assets/heroImg/home2.jpg';
import home3 from '../assets/heroImg/home3.jpg';
import home4 from '../assets/heroImg/home4.jpg';
import home6 from '../assets/heroImg/home6.jpg';
import home7 from '../assets/heroImg/home7.avif';
import home8 from '../assets/heroImg/home8.jpg';
import home9 from '../assets/heroImg/home9.jpg'

const Hero = () => {
  const backgroundImages = [
    home1,
    home2,
    home3,
    home4,
    home6,
    home7,
    home8,
    home9
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Calculate next image index dynamically
  const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // After transition completes, update current image
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % backgroundImages.length
        );
        setIsTransitioning(false);
      }, 1000);
      
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-background-container">
        <div 
          className={`hero-background current ${isTransitioning ? 'fade-out' : ''}`}
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${backgroundImages[currentImageIndex]})` 
          }}
        />
        <div 
          className={`hero-background next ${isTransitioning ? 'fade-in' : ''}`}
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${backgroundImages[nextImageIndex]})` 
          }}
        />
      </div>
      
      {/* Image indicators */}
      <div className="hero-indicators">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => {
              if (index !== currentImageIndex && !isTransitioning) {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentImageIndex(index);
                  setIsTransitioning(false);
                }, 1000);
              }
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <h1>Transform Your <span className="highlight-orange">Body</span>,<br />Transform Your <span className="highlight-orange">Life</span></h1>
        <p className="hero-description">
          <span className="word">Join</span> <span className="word">thousands</span> <span className="word">who</span> <span className="word">have</span> <span className="word">already</span> <span className="word">started</span> <span className="word">their</span> <span className="word">fitness</span> <span className="word">journey</span> <span className="word">with</span> <span className="word highlight">FITNESS</span> <span className="word highlight">GURU.</span><br/>
          <span className="word">State-of-the-art</span> <span className="word">equipment,</span> <span className="word">expert</span> <span className="word">trainers,</span> <span className="word">and</span> <span className="word">a</span> <span className="word">supportive</span> <span className="word">community</span> <span className="word">await</span> <span className="word">you.</span>
        </p>
        <div className="hero-buttons">
          <a 
            href="#membership" 
            className="btn-primary"
            onClick={(e) => { e.preventDefault(); handleScrollToSection('membership'); }}
          >
            Start Your Journey
          </a>
          <a 
            href="#about" 
            className="btn-secondary"
            onClick={(e) => { e.preventDefault(); handleScrollToSection('about'); }}
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;