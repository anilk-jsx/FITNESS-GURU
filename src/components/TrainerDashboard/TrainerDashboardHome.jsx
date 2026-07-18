import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerDashboardHome = () => {
  // Mock data lists
  const [clients] = useState([
    { id: 1, name: 'Rajesh Kumar' },
    { id: 2, name: 'Sneha Patel' },
    { id: 3, name: 'Rahul Mehta' },
    { id: 4, name: 'Ananya Roy' },
  ]);

  // Modal active states
  const [activeModal, setActiveModal] = useState(null); // 'assessment', 'diet'
  
  // Forms state
  const [assessmentForm, setAssessmentForm] = useState({ client: '', weight: '', bmi: '', bodyFat: '', muscleMass: '' });
  const [dietForm, setDietForm] = useState({ client: '', calories: '', protein: '', duration: '' });
  
  // Validation errors
  const [errors, setErrors] = useState({});

  // Timeline (Only assessment & diet related activities)
  const [activities] = useState([
    { id: 1, type: 'assessment', title: 'Assessment Completed', desc: 'Recorded BMI & body fat details for Rajesh Kumar', time: '1 hour ago', dotClass: 'success' },
    { id: 2, type: 'diet', title: 'Diet Recommendation Updated', desc: 'Modified daily protein intake to 140g for Ananya Roy', time: 'Yesterday', dotClass: 'info' }
  ]);

  // Validations & Submissions
  const validateForm = (formType, data) => {
    let errs = {};
    if (!data.client) errs.client = 'Please select a client';
    
    if (formType === 'assessment') {
      if (!data.weight || isNaN(data.weight)) errs.weight = 'Valid weight is required';
      if (!data.bmi || isNaN(data.bmi)) errs.bmi = 'Valid BMI is required';
      if (!data.bodyFat || isNaN(data.bodyFat)) errs.bodyFat = 'Valid Body Fat % is required';
    } else if (formType === 'diet') {
      if (!data.calories || isNaN(data.calories)) errs.calories = 'Valid calorie count is required';
      if (!data.protein || isNaN(data.protein)) errs.protein = 'Valid protein in grams is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e, formType) => {
    e.preventDefault();
    let isValid = false;

    if (formType === 'assessment') {
      isValid = validateForm('assessment', assessmentForm);
    } else if (formType === 'diet') {
      isValid = validateForm('diet', dietForm);
    }

    if (isValid) {
      alert(`Success! ${formType.toUpperCase()} action has been submitted. Check details in dashboard logs.`);
      setActiveModal(null);
      setErrors({});
      // Reset forms
      setAssessmentForm({ client: '', weight: '', bmi: '', bodyFat: '', muscleMass: '' });
      setDietForm({ client: '', calories: '', protein: '', duration: '' });
    }
  };

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Dashboard</h1>
          <p>Gym overview stats, active plans progress, and quick action widgets.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={() => setActiveModal('assessment')}>
            <i className="fas fa-plus"></i> New Assessment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="m-card kpi-card">
          <div className="kpi-icon-box primary">
            <i className="fas fa-users"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Total Clients</span>
            <span className="kpi-value">18</span>
          </div>
        </div>
        <div className="m-card kpi-card">
          <div className="kpi-icon-box success">
            <i className="fas fa-seedling"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Active Diets</span>
            <span className="kpi-value">10</span>
          </div>
        </div>
        <div className="m-card kpi-card">
          <div className="kpi-icon-box warning">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Pending Assessments</span>
            <span className="kpi-value">3</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Chart: Member Growth */}
        <div className="m-card">
          <div className="chart-header">
            <div>
              <h3 className="m-card-title" style={{ marginBottom: '4px' }}>Member Growth</h3>
              <span className="chart-subtitle">Monthly client registrations</span>
            </div>
            <span className="m-badge primary">Yearly</span>
          </div>
          {/* Custom SVG Line Chart */}
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 500 200" width="100%" height="100%">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              <line x1="40" y1="65" x2="480" y2="65" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              <line x1="40" y1="155" x2="480" y2="155" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              <line x1="40" y1="155" x2="480" y2="155" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
              
              {/* Axes Labels */}
              <text x="15" y="25" fill="#94a3b8" fontSize="10" textAnchor="middle">16</text>
              <text x="15" y="70" fill="#94a3b8" fontSize="10" textAnchor="middle">12</text>
              <text x="15" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle">8</text>
              <text x="15" y="160" fill="#94a3b8" fontSize="10" textAnchor="middle">4</text>
              
              {/* Line Paths */}
              <path 
                d="M 60 155 Q 120 110, 180 135 T 300 80 T 420 50 L 460 30" 
                fill="none" 
                stroke="var(--primary-color)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              
              {/* Area Under the Line */}
              <path 
                d="M 60 155 Q 120 110, 180 135 T 300 80 T 420 50 L 460 30 L 460 155 Z" 
                fill="url(#primary-gradient)" 
                opacity="0.12" 
              />
              
              {/* Dots */}
              <circle cx="60" cy="155" r="5" fill="var(--primary-color)" stroke="#121214" strokeWidth="2" />
              <circle cx="140" cy="120" r="5" fill="var(--primary-color)" stroke="#121214" strokeWidth="2" />
              <circle cx="220" cy="130" r="5" fill="var(--primary-color)" stroke="#121214" strokeWidth="2" />
              <circle cx="300" cy="80" r="5" fill="var(--primary-color)" stroke="#121214" strokeWidth="2" />
              <circle cx="380" cy="60" r="5" fill="var(--primary-color)" stroke="#121214" strokeWidth="2" />
              <circle cx="460" cy="30" r="5" fill="var(--primary-color)" stroke="#121214" strokeWidth="2" />
              
              {/* X Labels */}
              <text x="60" y="178" fill="#64748b" fontSize="10" textAnchor="middle">Jan</text>
              <text x="140" y="178" fill="#64748b" fontSize="10" textAnchor="middle">Mar</text>
              <text x="220" y="178" fill="#64748b" fontSize="10" textAnchor="middle">May</text>
              <text x="300" y="178" fill="#64748b" fontSize="10" textAnchor="middle">Jul</text>
              <text x="380" y="178" fill="#64748b" fontSize="10" textAnchor="middle">Sep</text>
              <text x="460" y="178" fill="#64748b" fontSize="10" textAnchor="middle">Nov</text>
              
              {/* Gradients Definitions */}
              <defs>
                <linearGradient id="primary-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" />
                  <stop offset="100%" stopColor="rgba(12, 12, 14, 0)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Dashboard Bottom Grid */}
      <div className="dashboard-bottom-grid">
        {/* Left Column: Quick Actions Panel & Activity Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions Panel */}
          <div className="m-card">
            <h3 className="m-card-title">Quick Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setActiveModal('assessment')}>
                <i className="fas fa-plus"></i> New Assessment
              </button>
              <button className="btn-secondary" onClick={() => setActiveModal('diet')}>
                <i className="fas fa-apple-alt"></i> Assign Diet Plan
              </button>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="m-card">
            <h3 className="m-card-title">Recent Activity Log</h3>
            <div className="timeline-container">
              {activities.map(act => (
                <div key={act.id} className="timeline-item">
                  <div className={`timeline-dot ${act.dotClass}`}></div>
                  <div className="timeline-content">
                    <span className="timeline-title">{act.title}</span>
                    <span className="timeline-desc">{act.desc}</span>
                    <span className="timeline-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Progress Rings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Progress rings */}
          <div className="m-card">
            <h3 className="m-card-title">Assessment Progress</h3>
            <div className="progress-rings-container">
              <div style={{ textAlign: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeDasharray="75, 100" strokeLinecap="round" />
                  <text x="18" y="20.35" fill="var(--text-primary)" fontSize="7" fontWeight="bold" textAnchor="middle">75%</text>
                </svg>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>Assessments Done</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--secondary-color)" strokeWidth="3" strokeDasharray="85, 100" strokeLinecap="round" />
                  <text x="18" y="20.35" fill="var(--text-primary)" fontSize="7" fontWeight="bold" textAnchor="middle">85%</text>
                </svg>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>Active Diets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MODALS CONTAINER */}
      {activeModal && (
        <div className="modal-overlay">
          {/* Modal: New Assessment */}
          {activeModal === 'assessment' && (
            <div className="modal-container">
              <div className="modal-header">
                <h3>New Fitness Assessment</h3>
                <button className="modal-close-btn" onClick={() => { setActiveModal(null); setErrors({}); }}>&times;</button>
              </div>
              <form onSubmit={(e) => handleFormSubmit(e, 'assessment')}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Client Name</label>
                    <select 
                      className="form-select"
                      value={assessmentForm.client}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, client: e.target.value })}
                    >
                      <option value="">Select a Client</option>
                      {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    {errors.client && <div className="form-error-msg">{errors.client}</div>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Weight (kg)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 74.5"
                        className="form-input" 
                        value={assessmentForm.weight}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, weight: e.target.value })}
                      />
                      {errors.weight && <div className="form-error-msg">{errors.weight}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">BMI</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 23.4"
                        className="form-input" 
                        value={assessmentForm.bmi}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, bmi: e.target.value })}
                      />
                      {errors.bmi && <div className="form-error-msg">{errors.bmi}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Body Fat %</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 16.5"
                        className="form-input" 
                        value={assessmentForm.bodyFat}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, bodyFat: e.target.value })}
                      />
                      {errors.bodyFat && <div className="form-error-msg">{errors.bodyFat}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Muscle Mass %</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 42.1"
                        className="form-input" 
                        value={assessmentForm.muscleMass}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, muscleMass: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => { setActiveModal(null); setErrors({}); }}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Assessment</button>
                </div>
              </form>
            </div>
          )}

          {/* Modal: Assign Diet */}
          {activeModal === 'diet' && (
            <div className="modal-container">
              <div className="modal-header">
                <h3>Assign Diet Plan</h3>
                <button className="modal-close-btn" onClick={() => { setActiveModal(null); setErrors({}); }}>&times;</button>
              </div>
              <form onSubmit={(e) => handleFormSubmit(e, 'diet')}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Client Name</label>
                    <select 
                      className="form-select"
                      value={dietForm.client}
                      onChange={(e) => setDietForm({ ...dietForm, client: e.target.value })}
                    >
                      <option value="">Select a Client</option>
                      {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    {errors.client && <div className="form-error-msg">{errors.client}</div>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Daily Calories Goal (kcal)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2400"
                        className="form-input"
                        value={dietForm.calories}
                        onChange={(e) => setDietForm({ ...dietForm, calories: e.target.value })}
                      />
                      {errors.calories && <div className="form-error-msg">{errors.calories}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Daily Protein Goal (g)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 140"
                        className="form-input"
                        value={dietForm.protein}
                        onChange={(e) => setDietForm({ ...dietForm, protein: e.target.value })}
                      />
                      {errors.protein && <div className="form-error-msg">{errors.protein}</div>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (weeks)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 8"
                      className="form-input"
                      value={dietForm.duration}
                      onChange={(e) => setDietForm({ ...dietForm, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => { setActiveModal(null); setErrors({}); }}>Cancel</button>
                  <button type="submit" className="btn-primary">Assign Diet</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerDashboardHome;
