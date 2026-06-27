import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerSchedule = () => {
  // Weekly sessions
  const [sessions, setSessions] = useState([
    { id: 1, name: 'Rajesh Kumar', day: 'Monday', time: '08:30 AM', duration: '60 mins', type: 'Weight training', status: 'Completed' },
    { id: 2, name: 'Sneha Patel', day: 'Monday', time: '04:30 PM', duration: '45 mins', type: 'Rehab mobility', status: 'Scheduled' },
    { id: 3, name: 'Rahul Mehta', day: 'Tuesday', time: '10:15 AM', duration: '60 mins', type: 'HIIT Cardio', status: 'Scheduled' },
    { id: 4, name: 'Ananya Roy', day: 'Wednesday', time: '06:00 PM', duration: '60 mins', type: 'Pilates core', status: 'Scheduled' },
    { id: 5, name: 'Rajesh Kumar', day: 'Thursday', time: '08:30 AM', duration: '60 mins', type: 'Chest split', status: 'Scheduled' }
  ]);

  // Selected Day tab filter
  const [activeDay, setActiveDay] = useState('Monday');
  const [selectedSession, setSelectedSession] = useState(null); // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [form, setForm] = useState({ client: '', day: 'Monday', time: '08:00 AM', duration: '60 mins', type: 'Personal Training' });
  const clientNames = ['Rajesh Kumar', 'Sneha Patel', 'Rahul Mehta', 'Ananya Roy'];

  const filteredSessions = sessions.filter(s => s.day === activeDay);

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!form.client) {
      alert('Please select a client');
      return;
    }

    const newSession = {
      id: sessions.length + 1,
      name: form.client,
      day: form.day,
      time: form.time,
      duration: form.duration,
      type: form.type,
      status: 'Scheduled'
    };

    setSessions([...sessions, newSession]);
    setIsAddModalOpen(false);
    setForm({ client: '', day: 'Monday', time: '08:00 AM', duration: '60 mins', type: 'Personal Training' });
    alert('Session booked successfully!');
  };

  const handleToggleStatus = (id) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const next = s.status === 'Scheduled' ? 'Completed' : 'Scheduled';
        return { ...s, status: next };
      }
      return s;
    }));
    setSelectedSession(null);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Weekly Schedule</h1>
          <p>Organize, manage, and book training slots for your clients.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-calendar-plus"></i> Book Training Session
          </button>
        </div>
      </div>

      {/* Week Days Tabs */}
      <div className="m-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {daysOfWeek.map(day => (
              <button 
                key={day}
                className={`btn-pagination ${activeDay === day ? 'active' : ''}`}
                style={{
                  background: activeDay === day ? 'var(--primary-color)' : 'transparent',
                  color: activeDay === day ? '#ffffff' : 'var(--text-secondary)',
                  border: activeDay === day ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  padding: '8px 16px',
                  borderRadius: '20px'
                }}
                onClick={() => setActiveDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-color)' }}>
            {filteredSessions.length} Scheduled Sessions
          </span>
        </div>
      </div>

      {/* Schedule Table list */}
      <div className="m-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <table className="m-table">
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Client Name</th>
                <th>Session Duration</th>
                <th>Workout Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map(session => (
                  <tr key={session.id}>
                    <td style={{ fontWeight: 600 }}><i className="far fa-clock"></i> {session.time}</td>
                    <td>{session.name}</td>
                    <td>{session.duration}</td>
                    <td><span className="workout-type-tag">{session.type}</span></td>
                    <td>
                      <span className={`m-badge ${session.status === 'Completed' ? 'success' : 'primary'}`}>
                        {session.status}
                      </span>
                    </td>
                    <td>
                      <div className="m-table-actions">
                        <button className="btn-icon" onClick={() => setSelectedSession(session)} title="View Details">
                          <i className="fas fa-info-circle"></i>
                        </button>
                        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleToggleStatus(session.id)}>
                          {session.status === 'Completed' ? 'Reopen' : 'Complete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No sessions scheduled for {activeDay}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SESSION DETAILS MODAL */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Training Session Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedSession(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
                <div><strong>Client Name:</strong> {selectedSession.name}</div>
                <div><strong>Time Slot:</strong> {selectedSession.day}, {selectedSession.time} ({selectedSession.duration})</div>
                <div><strong>Workout Goal:</strong> {selectedSession.type}</div>
                <div><strong>Session Status:</strong> <span className={`m-badge ${selectedSession.status === 'Completed' ? 'success' : 'primary'}`}>{selectedSession.status}</span></div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                  <h4 style={{ fontSize: '0.88rem', marginBottom: '4px' }}>Special Instructions</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Review client's physical limits, hydrate regularly during splits, ensure proper breathing under heavy loads.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedSession(null)}>Close</button>
              <button className="btn-danger" onClick={() => handleToggleStatus(selectedSession.id)}>
                {selectedSession.status === 'Completed' ? 'Reopen Session' : 'Mark Completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOK TRAINING MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Book training session</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddSession}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <select 
                    className="form-select"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                  >
                    <option value="">Select a Client</option>
                    {clientNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Day Schedule</label>
                  <select 
                    className="form-select"
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                  >
                    {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <select 
                      className="form-select"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    >
                      <option value="30 mins">30 mins</option>
                      <option value="45 mins">45 mins</option>
                      <option value="60 mins">60 mins</option>
                      <option value="90 mins">90 mins</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Workout Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chest hypertrophies, deadlifts Split"
                    className="form-input"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Book Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerSchedule;
