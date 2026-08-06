import React, { useEffect, useRef, useState, useCallback } from "react";
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
      "What started as a small neighborhood training spot grew from passion and grit. We focused on real results and community — building something that truly mattered.",
    images: [img2018, img2020, img2021],
    icon: "🏋️",
  },
  {
    year: "2020",
    title: "Community Growth",
    description:
      "Membership expanded and we added classes, experienced trainers, and a stronger mission to support wellbeing. People came for fitness and stayed for the family.",
    images: [img2020, img2021, img2026],
    icon: "🤝",
  },
  {
    year: "2021",
    title: "Modern Expansion",
    description:
      "A modern facility, personalised plans, and technology-enabled tracking — all while keeping our original spirit. We grew bigger but stayed personal.",
    images: [img2021, img2026, img2018],
    icon: "🏢",
  },
  {
    year: "2026",
    title: "Future Vision",
    description:
      "Leading the fitness revolution with AI-powered training, virtual classes, and a global community network. The best is yet to come.",
    images: [img2026, img2018, img2020],
    icon: "🚀",
  },
];

/* ─────────── Path geometry (like the reference image) ─────────── */
const SVG_W = 1000;
const ROW_H = 520; // vertical space per event
const PAD_TOP = 60;
const SVG_H = ROW_H * TIMELINE_EVENTS.length + PAD_TOP + 60;

/*
  The reference image shows a thick road that snakes:
    top-center-right → turns LEFT → turns RIGHT → turns LEFT → …
  Each turn is where a checkpoint lives. The straight segments
  between turns have content on the open side.

  Waypoints alternate between right-side and left-side X positions.
  We start right, go left, go right, go left …
*/
const X_LEFT = 250;
const X_RIGHT = 750;

function buildSnakePath() {
  // Anchor points along the snake (checkpoint locations)
  const anchors = TIMELINE_EVENTS.map((_, i) => ({
    x: i % 2 === 0 ? X_RIGHT : X_LEFT,
    y: PAD_TOP + i * ROW_H + ROW_H * 0.5,
  }));

  // We extend a start point above first anchor and end point below last
  const startPt = { x: (X_LEFT + X_RIGHT) / 2, y: PAD_TOP };
  const endPt = {
    x: anchors[anchors.length - 1].x,
    y: PAD_TOP + TIMELINE_EVENTS.length * ROW_H + 30,
  };

  const all = [startPt, ...anchors, endPt];

  let d = `M ${all[0].x} ${all[0].y}`;
  for (let i = 1; i < all.length; i++) {
    const p = all[i - 1];
    const c = all[i];
    // Smooth S-curve: control handles keep their x, push y 70/30
    const cp1x = p.x;
    const cp1y = p.y + (c.y - p.y) * 0.7;
    const cp2x = c.x;
    const cp2y = p.y + (c.y - p.y) * 0.3;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${c.x} ${c.y}`;
  }
  return { d, anchors };
}

const { d: PATH_D, anchors: CHECKPOINTS } = buildSnakePath();

export default function About() {
  const sectionRef = useRef(null);
  const svgPathRef = useRef(null);
  const [reachedCheckpoints, setReachedCheckpoints] = useState(new Set());
  const pathLengthRef = useRef(0);

  useEffect(() => {
    if (svgPathRef.current) {
      pathLengthRef.current = svgPathRef.current.getTotalLength();
      svgPathRef.current.style.strokeDasharray = `${pathLengthRef.current}`;
      svgPathRef.current.style.strokeDashoffset = `${pathLengthRef.current}`;
    }
  }, []);

  const handleScroll = useCallback(() => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const winH = window.innerHeight;
      const totalDistance = rect.height;
      const currentPassed = winH * 0.5 - rect.top; 
      
      const progress = Math.min(1, Math.max(0, currentPassed / totalDistance));

      if (svgPathRef.current && pathLengthRef.current) {
        svgPathRef.current.style.strokeDashoffset = `${
          pathLengthRef.current * (1 - progress)
        }`;
      }

      const next = new Set();
      TIMELINE_EVENTS.forEach((_, i) => {
        if (progress >= (i + 0.2) / TIMELINE_EVENTS.length) next.add(i);
      });
      
      setReachedCheckpoints((prev) => {
        if (prev.size !== next.size) return next;
        for (const v of next) if (!prev.has(v)) return next;
        return prev;
      });
    }, []);

  useEffect(() => {
      window.addEventListener("scroll", handleScroll, true);
      handleScroll();  
      return () => window.removeEventListener("scroll", handleScroll, true);
    }, [handleScroll]);

  return (
      <section id="about" className="tl-section" ref={sectionRef}>
        <div className="tl-ambient">
          <span className="tl-blob tl-blob-1" />
          <span className="tl-blob tl-blob-2" />
          <span className="tl-blob tl-blob-3" />
          <span className="tl-blob tl-blob-4" />
        </div>

        <div className="tl-header">
          <p className="tl-subtitle">Milestones That Define Us</p>
          <h2 className="tl-title">Our Journey</h2>
        </div>

        <div className="tl-body" style={{ minHeight: SVG_H }}>
          {/* ── SVG snake path ── */}
          <div className="tl-svg-wrap">
            <svg
              className="tl-svg"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="xMidYMid meet"
              fill="none"
            >
              <defs>
                <filter id="pathGlow">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="cpGlow">
                  <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ff7a00" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* thick dull background road */}
              <path
                d={PATH_D}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* thinner centre dull line */}
              <path
                d={PATH_D}
                stroke="rgba(255,255,255,0.025)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="12 24"
                fill="none"
              />
              {/* illuminated glowing path */}
              <path
                ref={svgPathRef}
                d={PATH_D}
                className="tl-glow-path"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                filter="url(#pathGlow)"
              />

              {/* ── Checkpoint badges ON the path ── */}
              {CHECKPOINTS.map((cp, i) => {
                const reached = reachedCheckpoints.has(i);
                return (
                  <g
                    key={i}
                    className={`tl-cp-group ${reached ? "tl-cp-reached" : ""}`}
                  >
                    {/* outer aura */}
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r="50"
                      fill="url(#cpGlow)"
                      className="tl-cp-aura"
                      style={{ opacity: reached ? 1 : 0 }}
                    />
                    {/* filled badge circle */}
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r="32"
                      className={`tl-cp-badge ${reached ? "reached" : ""}`}
                    />
                    {/* inner ring */}
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r="26"
                      className={`tl-cp-inner ${reached ? "reached" : ""}`}
                    />
                    {/* year text inside badge */}
                    <text
                      x={cp.x}
                      y={cp.y + 6}
                      textAnchor="middle"
                      className={`tl-cp-year ${reached ? "reached" : ""}`}
                    >
                      {TIMELINE_EVENTS[i].year}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ── Content panels ── */}
          {TIMELINE_EVENTS.map((event, i) => {
            const reached = reachedCheckpoints.has(i);
            // even index → checkpoint on right → content on LEFT
            // odd index  → checkpoint on left  → content on RIGHT
            const isContentLeft = i % 2 === 0;
            return (
              <div
                key={i}
                className={`tl-panel ${
                  isContentLeft ? "tl-panel-left" : "tl-panel-right"
                } ${reached ? "tl-panel-visible" : ""}`}
                style={{ top: CHECKPOINTS[i].y }}
              >
                {/* Mobile checkpoint dot (visible ≤768px) */}
                <div className={`tl-mobile-dot ${reached ? "reached" : ""}`}>
                  <span className="tl-mobile-dot-year">{event.year}</span>
                </div>

                {/* Floating images */}
                <div className="tl-gallery">
                  {event.images.map((img, j) => (
                    <div
                      key={j}
                      className={`tl-float-img tl-float-img-${j} ${
                        reached ? "tl-float-img-visible" : ""
                      }`}
                    >
                      <img src={img} alt={`${event.title} ${j + 1}`} />
                    </div>
                  ))}
                  <div
                    className={`tl-gallery-glow ${reached ? "tl-gallery-glow-on" : ""}`}
                  />
                </div>

                {/* Text box */}
                <div
                  className={`tl-textbox ${reached ? "tl-textbox-visible" : ""}`}
                >
                  <div className="tl-textbox-accent" />
                  <span className="tl-textbox-year">{event.year}</span>
                  <h3 className="tl-textbox-title">{event.title}</h3>
                  <p className="tl-textbox-desc">{event.description}</p>
                  <div className="tl-textbox-icon">{event.icon}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
  );
}
