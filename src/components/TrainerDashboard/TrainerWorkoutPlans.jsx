import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerWorkoutPlans = () => {
  // Mock workout templates
  const [plans, setPlans] = useState([
    {
      id: 1,
      title: 'Hypertrophy Split',
      level: 'Intermediate',
      status: 'Active',
      duration: '8 Weeks',
      memberCount: 4,
      days: [
        { dayName: 'Day 1: Chest & Triceps', exercises: [{ name: 'Incline Bench Press', sets: 4, reps: '8-10' }, { name: 'Dumbbell Flyes', sets: 3, reps: '12' }, { name: 'Tricep Pushdowns', sets: 4, reps: '12' }] },
        { dayName: 'Day 2: Back & Biceps', exercises: [{ name: 'Lat Pulldowns', sets: 4, reps: '10' }, { name: 'Seated Cable Rows', sets: 3, reps: '12' }, { name: 'Barbell Bicep Curls', sets: 4, reps: '10' }] },
        { dayName: 'Day 3: Rest Day', exercises: [] },
        { dayName: 'Day 4: Legs & Shoulders', exercises: [{ name: 'Barbell Squats', sets: 4, reps: '8' }, { name: 'Leg Press', sets: 3, reps: '12' }, { name: 'Overhead Press', sets: 4, reps: '10' }] }
      ]
    },
    {
      id: 2,
      title: 'Cardio Core Blast',
      level: 'Beginner',
      status: 'Active',
      duration: '4 Weeks',
      memberCount: 2,
      days: [
        { dayName: 'Day 1: High Intensity HIIT', exercises: [{ name: 'Treadmill Sprints', sets: 5, reps: '30s on / 30s off' }, { name: 'Kettlebell Swings', sets: 4, reps: '45s' }, { name: 'Mountain Climbers', sets: 4, reps: '30s' }] },
        { dayName: 'Day 2: Core Strength', exercises: [{ name: 'Plank Hold', sets: 3, reps: '60s' }, { name: 'Hanging Knee Raises', sets: 3, reps: '15' }, { name: 'Russian Twists', sets: 3, reps: '20' }] }
      ]
    },
    {
      id: 3,
      title: 'Strength Starter',
      level: 'Beginner',
      status: 'Completed',
      duration: '6 Weeks',
      memberCount: 0,
      days: [
        { dayName: 'Day 1: Fullbody Compound', exercises: [{ name: 'Squats', sets: 5, reps: '5' }, { name: 'Bench Press', sets: 5, reps: '5' }, { name: 'Barbell Rows', sets: 5, reps: '5' }] }
      ]
    }
  ]);

  // Selected plan details
  const [selectedPlanId, setSelectedPlanId] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', level: 'Beginner', duration: '6 Weeks', status: 'Active' });
  const [daysForm, setDaysForm] = useState([
    { dayName: 'Day 1: Fullbody', exercisesText: 'Squats: 3 sets of 10 reps\nBench Press: 3 sets of 10 reps' }
  ]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Filter templates
  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle plan create
  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Plan title is required');
      return;
    }

    const structuredDays = daysForm.map(d => {
      const parsedExercises = d.exercisesText.split('\n').filter(line => line.includes(':')).map(line => {
        const parts = line.split(':');
        const name = parts[0].trim();
        const detailParts = parts[1].split('sets of');
        const sets = parseInt(detailParts[0]) || 3;
        const reps = detailParts[1] ? detailParts[1].replace('reps', '').trim() : '10';
        return { name, sets, reps };
      });
      return { dayName: d.dayName, exercises: parsedExercises };
    });

    const newPlan = {
      id: plans.length + 1,
      title: form.title,
      level: form.level,
      status: form.status,
      duration: form.duration,
      memberCount: 0,
      days: structuredDays
    };

    setPlans([...plans, newPlan]);
    setSelectedPlanId(newPlan.id);
    setIsModalOpen(false);
    setForm({ title: '', level: 'Beginner', duration: '6 Weeks', status: 'Active' });
    setDaysForm([{ dayName: 'Day 1: Fullbody', exercisesText: 'Squats: 3 sets of 10 reps\nBench Press: 3 sets of 10 reps' }]);
    alert('Workout plan template created successfully!');
  };

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Workout Plans</h1>
          <p>Design, customize, and structure routines for chest splits, fat losses or rehabilitation.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus"></i> Create Template
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '30px', minHeight: '550px' }}>
        {/* Left Column: Plan list */}
        <div className="clients-list-panel">
          <div className="search-box-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search plan templates..." 
              className="client-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <button 
              className={`btn-pagination ${statusFilter === 'All' ? 'active' : ''}`}
              style={{ background: statusFilter === 'All' ? 'var(--primary-light)' : 'transparent', color: statusFilter === 'All' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
              onClick={() => setStatusFilter('All')}
            >
              All
            </button>
            <button 
              className={`btn-pagination ${statusFilter === 'Active' ? 'active' : ''}`}
              style={{ background: statusFilter === 'Active' ? 'var(--primary-light)' : 'transparent', color: statusFilter === 'Active' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </button>
            <button 
              className={`btn-pagination ${statusFilter === 'Completed' ? 'active' : ''}`}
              style={{ background: statusFilter === 'Completed' ? 'var(--primary-light)' : 'transparent', color: statusFilter === 'Completed' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
              onClick={() => setStatusFilter('Completed')}
            >
              Completed
            </button>
          </div>

          <div className="clients-list-scrollable">
            {filteredPlans.map(plan => (
              <div 
                key={plan.id}
                className={`client-row-item ${selectedPlanId === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <div className="client-avatar-placeholder" style={{ backgroundColor: plan.status === 'Active' ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                  <i className="fas fa-dumbbell" style={{ fontSize: '0.9rem' }}></i>
                </div>
                <div className="client-brief-info">
                  <h4>{plan.title}</h4>
                  <p className="client-sub-txt">{plan.duration} | {plan.level}</p>
                  <span className={`m-badge ${plan.status === 'Active' ? 'success' : 'danger'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    {plan.status}
                  </span>
                </div>
                <i className="fas fa-chevron-right arrow-indicator"></i>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Split Exercises Scheduler */}
        <div className="client-details-panel">
          {selectedPlan ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h2>{selectedPlan.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Difficulty: <strong>{selectedPlan.level}</strong> | Duration: <strong>{selectedPlan.duration}</strong>
                  </p>
                </div>
                <span className="m-badge primary">Mapped Members: {selectedPlan.memberCount}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedPlan.days.map((day, idx) => (
                  <div key={idx} className="m-card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-color)', marginBottom: '14px' }}>
                      {day.dayName}
                    </h3>
                    
                    {day.exercises.length > 0 ? (
                      <div className="table-responsive-wrapper">
                        <table className="m-table" style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <thead>
                            <tr>
                              <th style={{ background: 'transparent' }}>Exercise</th>
                              <th style={{ background: 'transparent' }}>Target Sets</th>
                              <th style={{ background: 'transparent' }}>Target Repetitions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.exercises.map((ex, exIdx) => (
                              <tr key={exIdx}>
                                <td style={{ fontWeight: 600 }}>{ex.name}</td>
                                <td>{ex.sets} sets</td>
                                <td>{ex.reps} reps</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Rest Day. No exercises assigned.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-client-selected-state">
              <i className="fas fa-dumbbell"></i>
              <h3>Select a Plan Template</h3>
              <p>Click on any workout plan template on the left panel to edit exercises split details.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE WORKOUT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container large">
            <div className="modal-header">
              <h3>Create Workout Plan Template</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreatePlan}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Plan Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Strength Phase A"
                      className="form-input"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level Category</label>
                    <select 
                      className="form-select"
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Plan Duration</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 8 Weeks"
                      className="form-input"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Day 1 Form */}
                <h4 style={{ margin: '15px 0 10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Configure Day Split</h4>
                {daysForm.map((d, index) => (
                  <div key={index} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Day Schedule Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Day 1: Push Routine"
                        className="form-input"
                        value={d.dayName}
                        onChange={(e) => {
                          const updated = [...daysForm];
                          updated[index].dayName = e.target.value;
                          setDaysForm(updated);
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Exercises split (format: Name : Sets sets of Reps reps)</label>
                      <textarea
                        rows="3"
                        className="form-textarea"
                        placeholder="Incline Chest Press: 3 sets of 10 reps&#10;Flat Dumbbell Press: 3 sets of 12 reps"
                        value={d.exercisesText}
                        onChange={(e) => {
                          const updated = [...daysForm];
                          updated[index].exercisesText = e.target.value;
                          setDaysForm(updated);
                        }}
                      ></textarea>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ width: '100%', marginTop: '10px' }}
                  onClick={() => setDaysForm([...daysForm, { dayName: `Day ${daysForm.length + 1}: Split`, exercisesText: '' }])}
                >
                  <i className="fas fa-plus"></i> Add Split Day
                </button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerWorkoutPlans;
