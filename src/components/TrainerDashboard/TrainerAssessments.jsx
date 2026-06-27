import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerAssessments = () => {
  // Mock assessments logs
  const [assessments, setAssessments] = useState([
    { id: 1, name: 'Rajesh Kumar', date: '2024-08-15', weight: 82.5, bmi: 25.4, fat: 22.1, muscle: 38.4 },
    { id: 2, name: 'Rajesh Kumar', date: '2024-09-15', weight: 79.8, bmi: 24.6, fat: 20.3, muscle: 39.2 },
    { id: 3, name: 'Rajesh Kumar', date: '2024-10-15', weight: 77.2, bmi: 23.8, fat: 18.5, muscle: 40.1 },
    { id: 4, name: 'Sneha Patel', date: '2024-08-05', weight: 64.0, bmi: 23.5, fat: 28.4, muscle: 32.1 },
    { id: 5, name: 'Sneha Patel', date: '2024-09-05', weight: 62.5, bmi: 22.9, fat: 26.2, muscle: 33.4 },
    { id: 6, name: 'Rahul Mehta', date: '2024-09-20', weight: 94.2, bmi: 29.1, fat: 31.0, muscle: 34.5 },
    { id: 7, name: 'Rahul Mehta', date: '2024-10-20', weight: 91.0, bmi: 28.1, fat: 28.5, muscle: 35.8 }
  ]);

  // Clients for select list
  const clientNames = ['Rajesh Kumar', 'Sneha Patel', 'Rahul Mehta', 'Ananya Roy'];

  // Modal and Compare state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compareClient, setCompareClient] = useState('Rajesh Kumar');
  const [compareSelection, setCompareSelection] = useState({ firstId: '', secondId: '' });
  const [compareResult, setCompareResult] = useState(null);

  // Forms state
  const [form, setForm] = useState({ name: '', date: '', weight: '', bmi: '', fat: '', muscle: '' });
  const [errors, setErrors] = useState({});

  // Search and Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientChart, setSelectedClientChart] = useState('Rajesh Kumar');

  // Filter list
  const filteredAssessments = assessments.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compare Handler
  const handleCompare = (e) => {
    e.preventDefault();
    const first = assessments.find(a => a.id === parseInt(compareSelection.firstId));
    const second = assessments.find(a => a.id === parseInt(compareSelection.secondId));
    
    if (first && second) {
      setCompareResult({
        weightDiff: (second.weight - first.weight).toFixed(1),
        bmiDiff: (second.bmi - first.bmi).toFixed(1),
        fatDiff: (second.fat - first.fat).toFixed(1),
        muscleDiff: (second.muscle - first.muscle).toFixed(1),
        firstDate: first.date,
        secondDate: second.date,
        firstVal: first,
        secondVal: second
      });
    }
  };

  // Create Assessment Handler
  const handleCreate = (e) => {
    e.preventDefault();
    let errs = {};
    if (!form.name) errs.name = 'Please select a client';
    if (!form.date) errs.date = 'Date is required';
    if (!form.weight || isNaN(form.weight)) errs.weight = 'Weight is required';
    if (!form.bmi || isNaN(form.bmi)) errs.bmi = 'BMI is required';
    if (!form.fat || isNaN(form.fat)) errs.fat = 'Body Fat % is required';
    if (!form.muscle || isNaN(form.muscle)) errs.muscle = 'Muscle Mass % is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newAssess = {
      id: assessments.length + 1,
      name: form.name,
      date: form.date,
      weight: parseFloat(form.weight),
      bmi: parseFloat(form.bmi),
      fat: parseFloat(form.fat),
      muscle: parseFloat(form.muscle)
    };

    setAssessments([newAssess, ...assessments]);
    setIsModalOpen(false);
    setForm({ name: '', date: '', weight: '', bmi: '', fat: '', muscle: '' });
    setErrors({});
    alert('Assessment added successfully!');
  };

  // Get records for comparing
  const compareOptions = assessments.filter(a => a.name === compareClient);

  // Data points for progress graph
  const chartData = assessments.filter(a => a.name === selectedClientChart).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Fitness Assessments</h1>
          <p>Track body stats progression, BMI ratings, fat percentages, and comparative charts.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus"></i> Add New Assessment
          </button>
        </div>
      </div>

      {/* Top Section: Progress Graphs & Compare Tool */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '30px' }}>
        
        {/* Graph Card */}
        <div className="m-card">
          <div className="chart-header">
            <div>
              <h3 className="m-card-title" style={{ marginBottom: '4px' }}>Physical Progress Graph</h3>
              <span className="chart-subtitle">Weight trend tracking over time</span>
            </div>
            <select 
              className="table-filter-select"
              value={selectedClientChart}
              onChange={(e) => setSelectedClientChart(e.target.value)}
            >
              {clientNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            {chartData.length >= 2 ? (
              <svg viewBox="0 0 500 200" width="100%" height="100%">
                {/* Grid */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
                
                {/* Labels */}
                <text x="20" y="25" fill="#94a3b8" fontSize="9" textAnchor="middle">100kg</text>
                <text x="20" y="95" fill="#94a3b8" fontSize="9" textAnchor="middle">75kg</text>
                <text x="20" y="165" fill="#94a3b8" fontSize="9" textAnchor="middle">50kg</text>
                
                {/* SVG path mapping */}
                {/* Formula: Map weight range 50 - 100 to y 160 - 20 */}
                {(() => {
                  let pathStr = "";
                  chartData.forEach((pt, index) => {
                    const step = 400 / (chartData.length - 1);
                    const x = 50 + index * step;
                    // weight y calculation
                    const y = 160 - ((pt.weight - 50) / 50) * 140;
                    if (index === 0) pathStr += `M ${x} ${y}`;
                    else pathStr += ` L ${x} ${y}`;
                  });
                  return (
                    <>
                      <path d={pathStr} fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeLinecap="round" />
                      {chartData.map((pt, index) => {
                        const step = 400 / (chartData.length - 1);
                        const x = 50 + index * step;
                        const y = 160 - ((pt.weight - 50) / 50) * 140;
                        return (
                          <g key={index}>
                            <circle cx={x} cy={y} r="5" fill="var(--primary-color)" stroke="#121214" strokeWidth="2" />
                            <text x={x} y={y - 12} fill="var(--text-primary)" fontSize="9" fontWeight="bold" textAnchor="middle">{pt.weight}kg</text>
                            <text x={x} y="180" fill="#64748b" fontSize="9" textAnchor="middle">{pt.date}</text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Please add at least 2 physical assessment records for this client to plot graphs.
              </div>
            )}
          </div>
        </div>

        {/* Compare Assessments Card */}
        <div className="m-card">
          <h3 className="m-card-title">Compare Tool</h3>
          <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Client</label>
              <select 
                className="form-select"
                value={compareClient}
                onChange={(e) => {
                  setCompareClient(e.target.value);
                  setCompareSelection({ firstId: '', secondId: '' });
                  setCompareResult(null);
                }}
              >
                {clientNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Initial Test</label>
                <select 
                  className="form-select"
                  value={compareSelection.firstId}
                  onChange={(e) => setCompareSelection({ ...compareSelection, firstId: e.target.value })}
                >
                  <option value="">Select Date</option>
                  {compareOptions.map(o => <option key={o.id} value={o.id}>{o.date} ({o.weight}kg)</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Latest Test</label>
                <select 
                  className="form-select"
                  value={compareSelection.secondId}
                  onChange={(e) => setCompareSelection({ ...compareSelection, secondId: e.target.value })}
                >
                  <option value="">Select Date</option>
                  {compareOptions.map(o => <option key={o.id} value={o.id}>{o.date} ({o.weight}kg)</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-secondary" style={{ width: '100%' }} disabled={!compareSelection.firstId || !compareSelection.secondId}>
              Compare Assessment Records
            </button>
          </form>

          {compareResult && (
            <div style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Comparing {compareResult.firstDate} vs {compareResult.secondDate}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.88rem' }}>
                <div>Weight change: <strong style={{ color: compareResult.weightDiff <= 0 ? 'var(--success)' : 'var(--danger)' }}>{compareResult.weightDiff} kg</strong></div>
                <div>BMI change: <strong style={{ color: compareResult.bmiDiff <= 0 ? 'var(--success)' : 'var(--danger)' }}>{compareResult.bmiDiff}</strong></div>
                <div>Body Fat change: <strong style={{ color: compareResult.fatDiff <= 0 ? 'var(--success)' : 'var(--danger)' }}>{compareResult.fatDiff}%</strong></div>
                <div>Muscle Mass change: <strong style={{ color: compareResult.muscleDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>{compareResult.muscleDiff}%</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="m-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="m-card-title" style={{ margin: 0 }}>Assessment Logs</h3>
          <div className="table-search-input-wrapper" style={{ minWidth: '220px' }}>
            <i className="fas fa-search table-search-icon"></i>
            <input 
              type="text" 
              placeholder="Search by client name..." 
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
                <th>Client Name</th>
                <th>Assessment Date</th>
                <th>Weight (kg)</th>
                <th>BMI Value</th>
                <th>Body Fat (%)</th>
                <th>Muscle Mass (%)</th>
                <th>Status Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.date}</td>
                  <td>{item.weight} kg</td>
                  <td>{item.bmi}</td>
                  <td>{item.fat}%</td>
                  <td>{item.muscle}%</td>
                  <td>
                    {item.bmi < 25 ? (
                      <span className="m-badge success">Normal Weight</span>
                    ) : (
                      <span className="m-badge warning">Overweight</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ASSESSMENT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Create Physical Assessment</h3>
              <button className="modal-close-btn" onClick={() => { setIsModalOpen(false); setErrors({}); }}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <select 
                    className="form-select"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  >
                    <option value="">Select Client</option>
                    {clientNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  {errors.name && <div className="form-error-msg">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Assessment Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                  {errors.date && <div className="form-error-msg">{errors.date}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 78.5"
                      className="form-input"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    />
                    {errors.weight && <div className="form-error-msg">{errors.weight}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">BMI</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 24.2"
                      className="form-input"
                      value={form.bmi}
                      onChange={(e) => setForm({ ...form, bmi: e.target.value })}
                    />
                    {errors.bmi && <div className="form-error-msg">{errors.bmi}</div>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Body Fat %</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 19.4"
                      className="form-input"
                      value={form.fat}
                      onChange={(e) => setForm({ ...form, fat: e.target.value })}
                    />
                    {errors.fat && <div className="form-error-msg">{errors.fat}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Muscle Mass %</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 39.6"
                      className="form-input"
                      value={form.muscle}
                      onChange={(e) => setForm({ ...form, muscle: e.target.value })}
                    />
                    {errors.muscle && <div className="form-error-msg">{errors.muscle}</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setIsModalOpen(false); setErrors({}); }}>Cancel</button>
                <button type="submit" className="btn-primary">Add Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerAssessments;
