import React from 'react';

const UpcomingClasses = ({ classes, onBook }) => (
  <div className="upcoming-classes">
    <div className="section-header">
      <h2 className="section-title">Upcoming Classes</h2>
      <a href="#" className="btn-pmary" onClick={onBook}>Book New Class</a>
    </div>
    <div className="classes-list">
      {classes.map((cls, idx) => (
        <div className="class-item" key={idx}>
          <div className="class-info">
            <h4>{cls.title}</h4>
            <p>Instructor: {cls.instructor}</p>
          </div>
          <div className="class-time">{cls.time}</div>
        </div>
      ))}
    </div>
  </div>
);

export default UpcomingClasses;
