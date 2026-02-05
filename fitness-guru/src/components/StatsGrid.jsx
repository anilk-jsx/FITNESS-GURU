import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats }) => (
  <div className="stats-grid">
    {stats.map((stat, idx) => (
      <StatCard key={idx} {...stat} />
    ))}
  </div>
);

export default StatsGrid;
