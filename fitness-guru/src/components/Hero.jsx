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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500); // Half second for fade out, then change image and fade in
      
    }, 5000); // Change image every 5 seconds

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
      <div 
        className={`hero-background ${isTransitioning ? 'fade-out' : 'fade-in'}`}
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${backgroundImages[currentImageIndex]})` 
        }}
      />
      
      {/* Image indicators */}
      <div className="hero-indicators">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentImageIndex(index);
                setIsTransitioning(false);
              }, 250);
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <h1>Transform Your <span className="highlight-orange">Body</span>,<br />Transform Your <span className="highlight-orange">Life</span></h1>
        <p className="hero-description">
          Join thousands who have already started their fitness journey with FITNESS GURU. 
          State-of-the-art equipment, expert trainers, and a supportive community await you.
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