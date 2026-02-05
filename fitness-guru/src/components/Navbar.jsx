import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleNavLinkClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    closeMobileMenu();
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <nav>
          <a href="#" className="logo">
            <img src="/FGlogo.png" alt="FitnessGuru Logo" />
            FITNESS GURU
          </a>
          <ul className="nav-links">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); handleNavLinkClick('home'); }}>Home</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); handleNavLinkClick('about'); }}>About</a></li>
            <li><a href="#membership" onClick={(e) => { e.preventDefault(); handleNavLinkClick('membership'); }}>Membership</a></li>
            <li><a href="#testimonials" onClick={(e) => { e.preventDefault(); handleNavLinkClick('testimonials'); }}>Testimonials</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); handleNavLinkClick('contact'); }}>Contact</a></li>
          </ul>
          <div className="nav-buttons">
            <Link to="/login" className="login-button">Login</Link>
          </div>
          <button 
            className="mobile-menu" 
            onClick={handleMobileMenuToggle}
          >
            <i className="fas fa-bars"></i>
          </button>
        </nav>
      </header>

      {/* Mobile Navigation Sidebar */}
      <div className={`mobile-nav-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-nav-logo">
            <img src="/FGlogo.png" alt="FitnessGuru Logo" />
            FITNESS GURU
          </div>
          <button className="mobile-close" onClick={closeMobileMenu}>
            &times;
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li>
            <a href="#home" onClick={(e) => { e.preventDefault(); handleNavLinkClick('home'); }}>
              <i className="fas fa-home"></i> Home
            </a>
          </li>
          <li>
            <a href="#about" onClick={(e) => { e.preventDefault(); handleNavLinkClick('about'); }}>
              <i className="fas fa-info-circle"></i> About
            </a>
          </li>
          <li>
            <a href="#membership" onClick={(e) => { e.preventDefault(); handleNavLinkClick('membership'); }}>
              <i className="fas fa-credit-card"></i> Membership
            </a>
          </li>
          <li>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); handleNavLinkClick('testimonials'); }}>
              <i className="fas fa-comment-dots"></i> Testimonials
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => { e.preventDefault(); handleNavLinkClick('contact'); }}>
              <i className="fas fa-envelope"></i> Contact
            </a>
          </li>
        </ul>
        <div className="mobile-nav-buttons">
          <Link to="/login" className="mobile-login-btn">Login</Link>
        </div>
      </div>

      {/* Navigation Overlay */}
      <div 
        className={`nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      ></div>
    </>
  );
};

export default Navbar;