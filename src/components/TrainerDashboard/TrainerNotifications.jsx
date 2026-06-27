import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerNotifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'workout', title: 'Workout Program Started', desc: 'Rahul Mehta began the Push-Pull-Legs active split.', time: '10 mins ago', read: false },
    { id: 2, type: 'assessment', title: 'Physical Assessment Due', desc: 'Sneha Patel has an assessment due today.', time: '2 hours ago', read: false },
    { id: 3, type: 'checkin', title: 'Biometric Check-in Logged', desc: 'Rajesh Kumar checked in at Koramangala Branch.', time: '5 hours ago', read: false },
    { id: 4, type: 'diet', title: 'Diet Recommendations Request', desc: 'Ananya Roy requested vegetarian options for Evening Snacks.', time: 'Yesterday', read: true },
    { id: 5, type: 'membership', title: 'Membership Expiry Warning', desc: 'Amit Verma\'s basic plan quarterly basic expired.', time: '2 days ago', read: true }
  ]);

  const [filter, setFilter] = useState('All');

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    alert('All notifications marked as read.');
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, read: !n.read };
      }
      return n;
    }));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
    return true;
  });

  const getIcon = (type) => {
    if (type === 'workout') return <i className="fas fa-dumbbell"></i>;
    if (type === 'assessment') return <i className="fas fa-clipboard-list"></i>;
    if (type === 'diet') return <i className="fas fa-apple-alt"></i>;
    return <i className="fas fa-info-circle"></i>;
  };

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Notifications Center</h1>
          <p>View gym check-ins feed, assessment reminders, and workout feedback logs.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={handleMarkAllRead}>
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="m-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['All', 'Unread', 'Read'].map(tab => (
            <button 
              key={tab}
              className={`btn-pagination ${filter === tab ? 'active' : ''}`}
              style={{
                background: filter === tab ? 'var(--primary-light)' : 'transparent',
                color: filter === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                border: filter === tab ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '20px'
              }}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map(n => (
            <div 
              key={n.id} 
              className={`m-card notification-widget-item ${!n.read ? 'unread' : ''}`}
              style={{ padding: '20px', border: '1px solid var(--border-color)', cursor: 'default' }}
            >
              <div className="notification-widget-icon" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                {getIcon(n.type)}
              </div>
              <div className="notification-widget-text">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 className="notification-widget-title" style={{ fontSize: '1rem' }}>{n.title}</h4>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn-icon" 
                      style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
                      onClick={() => handleToggleRead(n.id)}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                    >
                      <i className={`fas ${n.read ? 'fa-envelope' : 'fa-envelope-open'}`}></i>
                    </button>
                    <button 
                      className="btn-icon" 
                      style={{ width: '24px', height: '24px', fontSize: '0.8rem', color: 'var(--danger)' }}
                      onClick={() => handleDelete(n.id)}
                      title="Delete"
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <p className="notification-widget-desc" style={{ fontSize: '0.9rem', marginTop: '4px' }}>{n.desc}</p>
                <span className="notification-widget-time" style={{ fontSize: '0.78rem' }}>{n.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="m-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
            <i className="far fa-bell-slash" style={{ fontSize: '3rem', marginBottom: '14px', opacity: 0.3 }}></i>
            <p>No notifications found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerNotifications;
