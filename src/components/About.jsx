import React, { useEffect, useRef, useState } from "react";
import "./About.css";

import img2018 from "../assets/heroImg/home1.jpg";
import img2020 from "../assets/heroImg/home4.jpg";
import img2021 from "../assets/heroImg/home8.jpg";
import img2026 from "../assets/heroImg/home2.jpg";

const TIMELINE_EVENTS = [
  {
    year: "2018",
    title: "Our Beginning",
    description:
      "What started as a small neighborhood training spot grew from passion and grit. We focused on real results and community.",
    images: [img2018, img2020, img2021],
  },
  {
    year: "2020",
    title: "Community Growth",
    description:
      "Membership expanded and we added classes, experienced trainers, and a stronger mission to support wellbeing.",
    images: [img2020, img2021, img2018],
  },
  {
    year: "2021",
    title: "Modern Expansion",
    description:
      "A modern facility, personalised plans, and technology-enabled tracking — all while keeping our original spirit.",
    images: [img2021, img2018, img2020],
  },
  {
    year: "2026",
    title: "Future Vision",
    description:
      "Leading the fitness revolution with AI-powered training, virtual classes, and a global community network.",
    images: [img2026, img2020, img2018],
  },
];

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          const index = Number(visibleEntries[0].target.dataset.index);
          setActiveIndex(index);
        }
      },
      {
        threshold: [0.3, 0.5, 0.7],
        rootMargin: "-20% 0px -20% 0px",
      },
    );

    itemsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="timeline-section-container">
      <div className="animated-bubbles">
        <span className="bubble bubble-1"></span>
        <span className="bubble bubble-2"></span>
        <span className="bubble bubble-3"></span>
        <span className="bubble bubble-4"></span>
        <span className="bubble bubble-5"></span>
      </div>

      <div className="timeline-header">
        <h2>Our Journey</h2>
      </div>

      <div className="vertical-timeline">
        <div className="timeline-spine" />

        {TIMELINE_EVENTS.map((event, index) => (
          <div
            key={index}
            ref={(el) => (itemsRef.current[index] = el)}
            data-index={index}
            className={`timeline-item ${index === activeIndex ? "active" : ""}`}
          >
            <div className="timeline-marker">
              <div className="marker-dot" />
            </div>

            <div className="timeline-content">
              <div className="content-left">
                <div className="year-range">
                  <h2 className="year-badge">{event.year}</h2>
                </div>
                <div className="text-content">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>

              <div className="content-right">
                <div className="images-collage">
                  {event.images.map((img, imgIndex) => (
                    <div
                      key={imgIndex}
                      className={`collage-image collage-${imgIndex}`}
                    >
                      <img src={img} alt={`${event.title} ${imgIndex + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
