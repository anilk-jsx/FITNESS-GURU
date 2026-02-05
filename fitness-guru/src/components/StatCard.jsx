import React from 'react';

const StatCard = ({ iconClass, iconType, title, value, subtitle, actionText, actionLink, onAction }) => (
  <div className="stat-card">
    <div className="stat-header">
      <div className={`stat-icon ${iconType}`}>
        <i className={iconClass}></i>
      </div>
      <div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-subtitle">{subtitle}</div>
    <div className="stat-actions">
      {actionLink ? (
        <a href={actionLink} className="btn-sm btn-outline">{actionText}</a>
      ) : (
        <a href="#" className="btn-sm btn-outline" onClick={onAction}>{actionText}</a>
      )}
    </div>
  </div>
);

export default StatCard;
