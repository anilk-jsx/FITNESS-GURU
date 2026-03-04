import React from "react";
import "./SectionDivider.css";
import logo from "../assets/FGlogo.png"

const REPEAT = 10; // enough copies for seamless scroll

export default function SectionDivider() {
  const items = Array.from({ length: REPEAT });

  return (
    <div className="sd-wrap">
      {/* ── Row 1 — horizontal, scrolls LEFT ── */}
      <div className="sd-row sd-row-hz">
        <div className="sd-track sd-track-left">
          {items.map((_, i) => (
            <span className="sd-item" key={i}>
              <img src={logo} alt="logo" className="sd-logo" />
              <span className="sd-label">FITNESS GURU</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Row 2 — tilted, scrolls RIGHT ── */}
      <div className="sd-row sd-row-tilt">
        <div className="sd-track sd-track-right">
          {items.map((_, i) => (
            <span className="sd-item" key={i}>
              <span className="sd-icon">💪</span>
              <span className="sd-label">TRANSFORM YOUR BODY, TRANSFORM YOUR LIFE</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}