import React, { useState, useEffect, useRef } from "react";
import "./Trainers.css";

import hero1 from "../assets/heroImg/home7.avif";
import hero2 from "../assets/heroImg/home7.avif";
import hero3 from "../assets/heroImg/home7.avif";
import hero4 from "../assets/heroImg/home7.avif";

const trainers = [
  {
    name: "Diego Simsons",
    role: "Fitness Instructor",
    img: hero1,
    socials: {},
    message:
      "Certified strength and conditioning specialist with over 8 years of experience helping clients build muscle and improve overall performance.",
  },
  {
    name: "Mark Johnson",
    role: "CrossFit Expert, Nutrition",
    img: hero2,
    socials: {},
    message:
      "High-energy CrossFit coach skilled in high-intensity interval training and athletic performance development.",
  },
  {
    name: "Tom McClern",
    role: "Nutrition Specialized",
    img: hero3,
    socials: {},
    message:
      "Certified sports nutritionist helping clients optimize performance through personalized diet planning and balanced meal strategies.",
  },
  {
    name: "Julietta MoonWalk",
    role: "Strength & Core",
    img: hero4,
    socials: {},
    message:
      "Experienced instructor focussing on flexibility, mobility, and mental wellness through mindful movement practices.",
  },
];

function Trainers() {
  const [activeIndex, setActiveIndex] = useState(Math.floor(trainers.length / 2));
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      const cards = container.querySelectorAll(".trainer-card");
      let closest = 0;
      let closestOffset = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const offset = Math.abs(
          rect.left + rect.width / 2 - window.innerWidth / 2,
        );

        if (offset < closestOffset) {
          closestOffset = offset;
          closest = index;
        }
      });

      setActiveIndex(closest);
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
  const container = containerRef.current;
  const cards = container.querySelectorAll(".trainer-card");

  // Scroll to middle card on first load
  const middleIndex = Math.floor(cards.length / 2);
  const middleCard = cards[middleIndex];

  if (middleCard) {
    const cardOffset =
      middleCard.offsetLeft -
      container.offsetWidth / 2 +
      middleCard.offsetWidth / 2;

    container.scrollTo({
      left: cardOffset,
      behavior: "auto",
    });
  }

  const handleScroll = () => {
    let closest = 0;
    let closestOffset = Infinity;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const offset = Math.abs(
        rect.left + rect.width / 2 - window.innerWidth / 2
      );

      if (offset < closestOffset) {
        closestOffset = offset;
        closest = index;
      }
    });

    setActiveIndex(closest);
  };

  container.addEventListener("scroll", handleScroll);

  return () => container.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <section className="trainers-section" id="trainers">
      <div className="trainers-container">
        <div className="trainers-header">
          <span className="section-tag">Our Trainers</span>
          <h2 className="trainers-title">
            Meet Our <span className="highlight">Trainers</span>
          </h2>
          <p className="trainers-subtitle">
            Expertise. Passion. Results. Our certified trainers are here to
            guide and motivate you every step of the way.
          </p>
        </div>

        <div className="trainers-list" ref={containerRef}>
          {trainers.map((trainer, idx) => (
            <div
              className={`trainer-card fade-in-up ${
                idx === activeIndex ? "active" : "inactive"
              }`}
              key={idx}
            >
              <div className="card-inner">
                <div className="card-front">
                  <div
                    className="trainer-img-full"
                    style={{ backgroundImage: `url(${trainer.img})` }}
                  ></div>

                  <div className="trainer-info">
                    <h4 className="trainer-name">{trainer.name}</h4>
                    <p className="trainer-role">{trainer.role}</p>
                  </div>
                </div>

                <div className="card-back">
                  <p>{trainer.message}</p>
                  <div className="trainer-socials">
                    <a
                      href={trainer.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                      href={trainer.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      href={trainer.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a
                      href={trainer.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Trainers;
