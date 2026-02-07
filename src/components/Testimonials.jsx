import React, { useState } from "react";
import "./Testimonials.css";


import home7 from "../assets/heroImg/home7.avif";
import home1 from "../assets/heroImg/home1.jpg";
import home2 from "../assets/heroImg/home2.jpg";
import home3 from "../assets/heroImg/home3.jpg";

// Add more images as needed. For demo, reusing the same image with different testimonials.

const testimonialsData = [
  {
    image: home7,
    text: "Join this fitness center, the best choice that I've made. They are very professional and give you suggestions about what food and nutrition that you can eat, diverse fitness attempts.",
    name: "Jonathan Edward",
    role: "Athlete"
  },
  {
    image: home1,
    text: "The trainers here are extremely knowledgeable and supportive. My performance has improved a lot since I joined! Highly recommend to anyone serious about fitness.",
    name: "Priya Sharma",
    role: "Fitness Enthusiast"
  },
  {
    image: home2,
    text: "Amazing environment and top-notch equipment. The personalized plans helped me reach my goals faster than I expected.",
    name: "Rahul Mehra",
    role: "Bodybuilder"
  },
  {
    image: home3,
    text: "I love the group classes and the energy here! The staff is always friendly and the facilities are always clean.",
    name: "Sonia Patel",
    role: "Yoga Practitioner"
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const total = testimonialsData.length;

  const prevTestimonial = () => setCurrent((prev) => (prev - 1 + total) % total);
  const nextTestimonial = () => setCurrent((prev) => (prev + 1) % total);

  const { image, text, name, role } = testimonialsData[current];

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-header">
        <span className="section-tag">Testimonials</span>
        <h2 className="testimonials-title">
          <span>What Say</span> <span className="highlight">About Our Clients</span>
        </h2>
      </div>
      <div className="testimonials-content">
        <div className="testimonial-image">
          <img src={image} alt={name} />
        </div>
        <div className="testimonial-text-block">
          <p className="testimonial-text">“ {text} ”</p>
          <div className="testimonial-client">
            <span className="testimonial-name">{name}</span>
            <span className="testimonial-role">{role}</span>
          </div>
          <div className="testimonial-arrows">
            <button className="arrow-btn" onClick={prevTestimonial} aria-label="Previous testimonial">
              <span className="arrow left">&#8592;</span>
            </button>
            <button className="arrow-btn" onClick={nextTestimonial} aria-label="Next testimonial">
              <span className="arrow right">&#8594;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
