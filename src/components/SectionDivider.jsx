import React from "react";
import "./SectionDivider.css";

export default function SectionDivider() {
  return (
    <div className="section-divider">
      <div className="divider-line left" />
      <div className="divider-center">
        <span className="divider-icon">🔥</span>
        <span className="divider-text">FITNESS GURU</span>
      </div>
      <div className="divider-line right" />
    </div>
  );
}