import React from "react";
import "./SectionDivider.css";

export default function SectionDivider() {
  return (
    <div className="section-divider">
      <div className="section-divider-bar">
        <span className="section-divider-glow" />
        <div className="section-divider-center">
          <span className="section-divider-icon">🔥</span>
          <span className="section-divider-text">FITNESS GURU</span>
        </div>
        <span className="section-divider-glow" />
      </div>
    </div>
  );
}