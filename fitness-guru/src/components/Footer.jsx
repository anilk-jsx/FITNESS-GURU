import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-col">
          <h3 className="footer-title">FITNESS GURU</h3>
          <p className="footer-desc">Transform your body, transform your life. Join the fitness revolution today.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook" className="footer-social"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram" className="footer-social"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="Twitter" className="footer-social"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="YouTube" className="footer-social"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#membership">Membership</a></li>
            <li><a href="#trainers">Trainers</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4 className="footer-heading">Contact Info</h4>
          <ul className="footer-contact">
            <li><i className="fas fa-phone"></i> (555) 123-4567</li>
            <li><i className="fas fa-envelope"></i> bharatfitnessguru@gmail.com</li>
            <li><i className="fas fa-map-marker-alt"></i> 123 Fitness Street<br />Workout City, WC 12345</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4 className="footer-heading">Opening Hours</h4>
          <ul className="footer-hours">
            <li>Monday - Friday: 5:00 AM - 11:00 PM</li>
            <li>Saturday: 6:00 AM - 10:00 PM</li>
            <li>Sunday: 7:00 AM - 9:00 PM</li>
            <li><b>24/7 Access for Premium+ Members</b></li>
          </ul>
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">© 2026 FITNESS GURU. All rights reserved.</div>
    </footer>
  );
}
