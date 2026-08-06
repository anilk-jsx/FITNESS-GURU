import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerAttendance = () => {
  const [attendance, setAttendance] = useState([
    { id: 1, name: 'Rajesh Kumar', date: '2024-10-25', time: '08:30 AM', type: 'Personal Training', device: 'Biometric' },
    { id: 2, name: 'Rahul Mehta', date: '2024-10-25', time: '10:15 AM', type: 'General Workout', device: 'Mobile QR' },
    { id: 3, name: 'Sneha Patel', date: '2024-10-25', time: '04:45 PM', type: 'Group Yoga Class', device: 'Manual' },
    { id: 4, name: 'Ananya Roy', date: '2024-10-24', time: '06:00 PM', type: 'Personal Training', device: 'Biometric' },
    { id: 5, name: 'Rajesh Kumar', date: '2024-10-24', time: '08:00 AM', type: 'Personal Training', device: 'Biometric' }
  ]);

  const [form, setForm] = useState({ client: '', time: '', type: 'Personal Training' });
  const [selectedDate, setSelectedDate] = useState('2024-10-25');
  const [searchQuery, setSearchQuery] = useState('');

  const clientNames = ['Rajesh Kumar', 'Sneha Patel', 'Rahul Mehta', 'Ananya Roy'];

  // Filters
  const filteredLogs = attendance.filter(log => {
    const matchesDate = log.date === selectedDate;
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const handleCheckIn = (e) => {
    e.preventDefault();
    if (!form.client || !form.time) {
      alert('Please fill out client and check-in time');
      return;
    }

    const newLog = {
      id: attendance.length + 1,
      name: form.client,
      date: selectedDate,
      time: form.time,
      type: form.type,
      device: 'Manual Entry'
    };

    setAttendance([newLog, ...attendance]);
    setForm({ client: '', time: '', type: 'Personal Training' });
    alert('Member check-in successful!');
  };

  // Quick Calendar Mocks
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Attendance Management</h1>
          <p>Scan checks, log manual trainer session attendances, and view logs.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr', gap: '30px' }}>
        
        {/* Left Column: Stats & Manual Check-in */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Manual Attendance Form */}
          <div className="m-card">
            <h3 className="m-card-title">Manual Check-in</h3>
            <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
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

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Check-in Time</label>
                  <input 
                    type="time" 
                    className="form-input"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Workout Category</label>
                  <select 
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="Personal Training">Personal Training</option>
                    <option value="General Gym Split">General Gym Split</option>
                    <option value="Cardio Fitness">Cardio Fitness</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Check-in Member
              </button>
            </form>
          </div>

          {/* Quick Statistics */}
          <div className="m-card">
            <h3 className="m-card-title">Attendance Statistics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Daily average check-ins:</span>
                <strong>14 members</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Peak hours:</span>
                <strong>06:00 AM & 06:30 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active weekly rate:</span>
                <strong style={{ color: 'var(--success)' }}>94.2%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Calendar & Log Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Calendar Widget */}
          <div className="m-card" style={{ padding: '20px' }}>
            <div className="chart-header" style={{ marginBottom: '14px' }}>
              <h3 className="m-card-title" style={{ margin: 0 }}>Calendar View</h3>
              <strong>October 2024</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              {daysInMonth.map(day => {
                const dayStr = `2024-10-${day.toString().padStart(2, '0')}`;
                const isSelected = dayStr === selectedDate;
                const hasLogs = attendance.some(a => a.date === dayStr);

                return (
                  <button 
                    key={day}
                    style={{
                      padding: '8px 0',
                      border: '1px solid var(--border-color)',
                      background: isSelected ? 'var(--primary-color)' : (hasLogs ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.02)'),
                      color: isSelected ? '#ffffff' : (hasLogs ? 'var(--primary-color)' : 'var(--text-primary)'),
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                    onClick={() => setSelectedDate(dayStr)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Table Logs */}
          <div className="m-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Logs for {selectedDate}</h3>
              <div className="table-search-input-wrapper" style={{ minWidth: '180px' }}>
                <i className="fas fa-search table-search-icon"></i>
                <input 
                  type="text" 
                  placeholder="Filter name..." 
                  className="table-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="m-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Time</th>
                    <th>Split Category</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 600 }}>{log.name}</td>
                        <td>{log.time}</td>
                        <td>{log.type}</td>
                        <td><span className="m-badge primary" style={{ fontSize: '0.65rem' }}>{log.device}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        No check-ins recorded for this day.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TrainerAttendance;
