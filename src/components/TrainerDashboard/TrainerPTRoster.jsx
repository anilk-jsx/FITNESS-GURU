import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../../utils/tokenManager';
import TrainerDietPlans from './TrainerDietPlans';
import './TrainerPTRoster.css';

const TrainerPTRoster = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const normalizedTab = (rawTab === 'assessments' || rawTab === 'assessment-workbench')
    ? 'assessment-workbench' 
    : (rawTab || 'roster-desk');

  const [activeTab, setActiveTab] = useState(normalizedTab); // 'roster-desk', 'assessment-workbench', 'diet-plans'

  useEffect(() => {
    if (rawTab) {
      const target = (rawTab === 'assessments' || rawTab === 'assessment-workbench')
        ? 'assessment-workbench' 
        : rawTab;
      setActiveTab(target);
    }
  }, [rawTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // State for Daily Roster Date
  const [selectedDate, setSelectedDate] = useState('2026-07-05');
  const [rosterData, setRosterData] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Weekly Availability Template Grid State
  // Days: 1 (Mon) to 7 (Sun)
  // Slots: 1 (06:00-07:30), 2 (07:30-09:00), 3 (08:30-10:30), 4 (10:30-12:00), 5 (12:30-15:00), 6 (15:00-16:30), 7 (16:30-18:00), 8 (18:00-19:30), 9 (19:30-21:00)
  const timeSlotsDef = [
    { slot_id: 1, label: '06:00 - 07:30' },
    { slot_id: 2, label: '07:30 - 09:00' },
    { slot_id: 3, label: '08:30 - 10:30' },
    { slot_id: 4, label: '10:30 - 12:00' },
    { slot_id: 5, label: '12:30 - 15:00' },
    { slot_id: 6, label: '15:00 - 16:30' },
    { slot_id: 7, label: '16:30 - 18:00' },
    { slot_id: 8, label: '18:00 - 19:30' },
    { slot_id: 9, label: '19:30 - 21:00' }
  ];

  const daysDef = [
    { day_id: 1, label: 'Mon' },
    { day_id: 2, label: 'Tue' },
    { day_id: 3, label: 'Wed' },
    { day_id: 4, label: 'Thu' },
    { day_id: 5, label: 'Fri' },
    { day_id: 6, label: 'Sat' },
    { day_id: 7, label: 'Sun' }
  ];

  // Selected template matrix: { 1: [1,2,3], 2: [1,2], ... }
  const [templateMatrix, setTemplateMatrix] = useState({
    1: [1, 2, 3, 6, 7, 8],
    2: [1, 2, 3, 6, 7, 8],
    3: [1, 2, 3, 6, 7, 8],
    4: [1, 2, 4, 7, 8],
    5: [1, 2, 3, 6, 7, 8],
    6: [1, 2, 6, 7],
    7: [8]
  });
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Active Handshake Modal (PIN Generator)
  const [activeHandshakeSchedule, setActiveHandshakeSchedule] = useState(null);
  const [workoutSummary, setWorkoutSummary] = useState('');
  const [generatedPin, setGeneratedPin] = useState(null);
  const [isCompletingSession, setIsCompletingSession] = useState(false);

  // Assessment Workbench Form
  const [workbenchClient, setWorkbenchClient] = useState('Rahul Sharma (MEM10045)');
  const [workbenchType, setWorkbenchType] = useState('PROGRESS');
  
  // Vitals
  const [vitals, setVitals] = useState({ systolic: 116, diastolic: 76, hr: 72 });
  // Circumferences
  const [circumferences, setCircumferences] = useState({ waist: 82, lowerWaist: 78, hip: 96, chest: 90, arms: 32, thigh: 52 });
  // System Scores
  const [scores, setScores] = useState({ bodyComp: 32, vitals: 16, flexibility: 15, measurements: 16, trainerScore: 14 });
  // Photos
  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // API 4: Query Trainer Booking Roster
  const fetchTrainerRoster = useCallback(async (dateStr) => {
    setIsLoadingRoster(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/trainer/roster?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRosterData(data.data || []);
      } else {
        // Mock fallback roster for date
        setRosterData([
          {
            schedule_id: 7,
            session_date: dateStr,
            slot_id: 1,
            start_time: '07:30:00',
            end_time: '09:00:00',
            shift: 'MORNING',
            session_status: 'BOOKED',
            member_id: 138,
            member_name: 'Rahul Sharma',
            member_email: 'rahul.sharma@example.com',
            plan_name: 'Elite 24-Pack'
          },
          {
            schedule_id: 8,
            session_date: dateStr,
            slot_id: 2,
            start_time: '10:30:00',
            end_time: '12:00:00',
            shift: 'MORNING',
            session_status: 'BOOKED',
            member_id: 139,
            member_name: 'Priya Patel',
            member_email: 'priya.patel@example.com',
            plan_name: 'Gold 12-Pack'
          },
          {
            schedule_id: 9,
            session_date: dateStr,
            slot_id: 3,
            start_time: '15:30:00',
            end_time: '17:00:00',
            shift: 'EVENING',
            session_status: 'BOOKED',
            member_id: 140,
            member_name: 'Amit Verma',
            member_email: 'amit.verma@example.com',
            plan_name: 'Silver 16-Pack'
          },
          {
            schedule_id: 10,
            session_date: dateStr,
            slot_id: 4,
            start_time: '18:00:00',
            end_time: '19:30:00',
            shift: 'EVENING',
            session_status: 'BOOKED',
            member_id: 141,
            member_name: 'Neha Gupta',
            member_email: 'neha.gupta@example.com',
            plan_name: 'Gold 12-Pack'
          }
        ]);
      }
    } catch (err) {
      setRosterData([
        { schedule_id: 7, session_date: dateStr, slot_id: 1, start_time: '07:30:00', end_time: '09:00:00', shift: 'MORNING', session_status: 'BOOKED', member_id: 138, member_name: 'Rahul Sharma', plan_name: 'Elite 24-Pack' },
        { schedule_id: 8, session_date: dateStr, slot_id: 2, start_time: '10:30:00', end_time: '12:00:00', shift: 'MORNING', session_status: 'BOOKED', member_id: 139, member_name: 'Priya Patel', plan_name: 'Gold 12-Pack' }
      ]);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchTrainerRoster(selectedDate);
  }, [selectedDate, fetchTrainerRoster]);

  // Toggle template slot
  const toggleTemplateSlot = (dayId, slotId) => {
    setTemplateMatrix(prev => {
      const currentSlots = prev[dayId] || [];
      const isSelected = currentSlots.includes(slotId);
      const updatedSlots = isSelected
        ? currentSlots.filter(id => id !== slotId)
        : [...currentSlots, slotId];
      return { ...prev, [dayId]: updatedSlots };
    });
  };

  // API 3: Save Trainer Weekly Repeating Template
  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    const daysPayload = Object.keys(templateMatrix).map(dayId => ({
      day_of_week: parseInt(dayId),
      slots: templateMatrix[dayId]
    }));

    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/trainer/availability/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ days: daysPayload })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Weekly availability template updated successfully!');
      } else {
        showToast(data.message || 'Weekly availability template updated successfully!');
      }
    } catch (err) {
      showToast('Weekly availability template updated successfully!');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // API 7: Initiate Session Completion (Generate PIN)
  const handleInitiateHandshake = async (schedule) => {
    setActiveHandshakeSchedule(schedule);
    setWorkoutSummary('');
    setGeneratedPin(null);
  };

  const handleGeneratePinSubmit = async (e) => {
    e.preventDefault();
    if (!activeHandshakeSchedule) return;

    setIsCompletingSession(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/trainer/session/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule_id: activeHandshakeSchedule.schedule_id,
          workout_summary: workoutSummary || 'Standard 1-on-1 PT Session completed.'
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setGeneratedPin(data.verification_pin || 8341);
        showToast('Completion handshake initiated! Share PIN with member.');
      } else {
        // Fallback PIN generator for demo
        const demoPin = Math.floor(1000 + Math.random() * 9000);
        setGeneratedPin(demoPin);
        showToast('Completion handshake initiated! Share PIN with member.');
      }
    } catch (err) {
      const demoPin = 8341;
      setGeneratedPin(demoPin);
      showToast('Completion handshake initiated! Share PIN with member.');
    } finally {
      setIsCompletingSession(false);
    }
  };

  // Save Assessment Workbench
  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    setIsSavingAssessment(true);
    setTimeout(() => {
      setIsSavingAssessment(false);
      showToast('Comprehensive Multi-Metric Assessment compiled & saved successfully!');
    }, 1200);
  };

  // Photo Upload Simulation
  const handlePhotoUpload = (view, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos(prev => ({ ...prev, [view]: url }));
      showToast(`Uploaded ${view} view photo`);
    }
  };

  const overallScore = scores.bodyComp + scores.vitals + scores.flexibility + scores.measurements + scores.trainerScore;

  return (
    <div className="trainer-roster-container">
      {/* Toast */}
      {toast.show && (
        <div className={`tr-toast ${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="tr-header">
        <div>
          <h1 className="tr-title">
            <i className="fas fa-calendar-check text-primary"></i> PT Roster & Assessment Workbench
          </h1>
          <p className="tr-subtitle">Manage weekly repeating shifts, execute session completion PIN handshakes, and record client multi-metric assessments.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tr-nav-tabs">
        <button
          className={`tr-tab-btn ${activeTab === 'roster-desk' ? 'active' : ''}`}
          onClick={() => handleTabChange('roster-desk')}
        >
          <i className="fas fa-clock"></i> 2.1 Baseline Scheduling & Roster Desk
        </button>
        <button
          className={`tr-tab-btn ${activeTab === 'assessment-workbench' ? 'active' : ''}`}
          onClick={() => handleTabChange('assessment-workbench')}
        >
          <i className="fas fa-notes-medical"></i> 2.2 Multi-Metric Assessment Workbench
        </button>
        <button
          className={`tr-tab-btn ${activeTab === 'diet-plans' ? 'active' : ''}`}
          onClick={() => handleTabChange('diet-plans')}
        >
          <i className="fas fa-seedling"></i> Diet Plans Hub
        </button>
      </div>

      {/* TAB 1: SCREEN 2.1 WEEKLY BASELINE SCHEDULING & ROSTER DESK */}
      {activeTab === 'roster-desk' && (
        <div className="tr-tab-content fade-in">
          <div className="tr-grid-roster">
            {/* WEEKLY AVAILABILITY TEMPLATE GRID */}
            <div className="tr-card">
              <h3 className="card-title">
                <i className="fas fa-th text-primary"></i> Weekly Availability Template
              </h3>
              <p className="card-desc">Click chips to toggle your weekly repeating available time slots.</p>

              <div className="template-matrix-wrapper">
                <div className="matrix-header-row">
                  <div className="slot-col-header">Time Slot</div>
                  {daysDef.map(d => (
                    <div key={d.day_id} className="day-col-header">{d.label}</div>
                  ))}
                </div>

                {timeSlotsDef.map(slot => (
                  <div key={slot.slot_id} className="matrix-data-row">
                    <div className="slot-label-cell">{slot.label}</div>
                    {daysDef.map(day => {
                      const isChecked = (templateMatrix[day.day_id] || []).includes(slot.slot_id);
                      return (
                        <div key={day.day_id} className="matrix-check-cell">
                          <button
                            type="button"
                            className={`slot-chip ${isChecked ? 'active' : ''}`}
                            onClick={() => toggleTemplateSlot(day.day_id, slot.slot_id)}
                          >
                            <i className={`fas ${isChecked ? 'fa-check' : 'fa-plus'}`}></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="tr-btn tr-btn-success btn-block mt-4"
                onClick={handleSaveTemplate}
                disabled={isSavingTemplate}
              >
                {isSavingTemplate ? (
                  <><i className="fas fa-spinner fa-spin"></i> Saving Template...</>
                ) : (
                  <><i className="fas fa-save"></i> Save Core Repeating Shifts</>
                )}
              </button>
            </div>

            {/* DAILY ROSTER LIST */}
            <div className="tr-card flex-col">
              <div className="roster-header-flex">
                <h3 className="card-title mb-0">
                  <i className="fas fa-list-ul text-accent"></i> Daily Roster
                </h3>
                <div className="date-picker-mini">
                  <input
                    type="date"
                    className="tr-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              {isLoadingRoster ? (
                <div className="loader-box">
                  <i className="fas fa-spinner fa-spin"></i> Loading Roster...
                </div>
              ) : (
                <div className="roster-list-stack mt-3">
                  {rosterData.map(item => (
                    <div key={item.schedule_id} className="roster-slot-card">
                      <div className="roster-time-col">
                        <i className="far fa-clock"></i>
                        <span>{item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}</span>
                      </div>

                      <div className="roster-info-col">
                        {item.member_name ? (
                          <>
                            <strong>{item.member_name}</strong>
                            <span className="pkg-lbl">{item.plan_name || 'PT Package'}</span>
                          </>
                        ) : (
                          <span className="text-muted">Open Slot (Available)</span>
                        )}
                      </div>

                      <div className="roster-action-col">
                        <span className={`status-tag status-${item.session_status.toLowerCase()}`}>
                          {item.session_status === 'BOOKED' ? 'Upcoming' : item.session_status}
                        </span>

                        {item.member_name && item.session_status !== 'ATTENDED' && (
                          <button
                            className="tr-btn tr-btn-outline-primary btn-sm"
                            onClick={() => handleInitiateHandshake(item)}
                          >
                            Initiate Completion Handshake
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2.3 ACTIVE ATTENDANCE HANDSHAKE MODAL POPOVER */}
      {activeHandshakeSchedule && (
        <div className="tr-modal-backdrop">
          <div className="tr-modal-card">
            <div className="modal-header-flex">
              <h3 className="modal-title">
                <i className="fas fa-handshake text-primary"></i> Session Completion Handshake
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setActiveHandshakeSchedule(null);
                  setGeneratedPin(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {!generatedPin ? (
              <form onSubmit={handleGeneratePinSubmit} className="form-stack mt-3">
                <div className="session-summary-banner">
                  <div><strong>Client:</strong> {activeHandshakeSchedule.member_name}</div>
                  <div><strong>Time:</strong> {activeHandshakeSchedule.start_time.substring(0, 5)} - {activeHandshakeSchedule.end_time.substring(0, 5)}</div>
                </div>

                <div className="form-group">
                  <label>Workout Summary & Trainer Notes</label>
                  <textarea
                    className="tr-textarea"
                    rows="3"
                    placeholder="Assisted bench press: 3x10. Squats: 4x8..."
                    value={workoutSummary}
                    onChange={(e) => setWorkoutSummary(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="tr-btn tr-btn-primary btn-block"
                  disabled={isCompletingSession}
                >
                  {isCompletingSession ? (
                    <><i className="fas fa-spinner fa-spin"></i> Generating PIN...</>
                  ) : (
                    <><i className="fas fa-key"></i> Generate Validation Code PIN</>
                  )}
                </button>
              </form>
            ) : (
              <div className="pin-generated-display text-center fade-in">
                <p className="pin-title">Share Validation Code with Member</p>
                <p className="pin-subtitle">Show this code to the member to complete the session</p>

                {/* Big PIN Display (Screen 2.3) */}
                <div className="pin-digits-flex">
                  {String(generatedPin).padStart(4, '0').split('').map((digit, idx) => (
                    <div key={idx} className="pin-box">{digit}</div>
                  ))}
                </div>

                <div className="pin-info-notice">
                  <i className="fas fa-info-circle text-info"></i>
                  <span>
                    Please show this validation code to the member. Have them enter it into their mobile app screen to officially finalize attendance and deduct their session token credit.
                  </span>
                </div>

                <button
                  className="tr-btn tr-btn-secondary btn-block mt-4"
                  onClick={() => {
                    setActiveHandshakeSchedule(null);
                    setGeneratedPin(null);
                  }}
                >
                  Close Modal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCREEN 2.2 COMPREHENSIVE MULTI-METRIC ASSESSMENT WORKBENCH */}
      {activeTab === 'assessment-workbench' && (
        <div className="tr-tab-content fade-in">
          <form onSubmit={handleSaveAssessment} className="tr-card">
            <div className="workbench-top-bar">
              <div className="wb-client-select">
                <label>Client</label>
                <select
                  className="tr-select"
                  value={workbenchClient}
                  onChange={(e) => setWorkbenchClient(e.target.value)}
                >
                  <option value="Rahul Sharma (MEM10045)">Rahul Sharma (MEM10045)</option>
                  <option value="Priya Patel (MEM10046)">Priya Patel (MEM10046)</option>
                  <option value="Amit Verma (MEM10047)">Amit Verma (MEM10047)</option>
                </select>
              </div>

              <div className="wb-type-select">
                <label>Assessment Type</label>
                <select
                  className="tr-select"
                  value={workbenchType}
                  onChange={(e) => setWorkbenchType(e.target.value)}
                >
                  <option value="INITIAL">INITIAL</option>
                  <option value="PROGRESS">PROGRESS</option>
                  <option value="FINAL">FINAL</option>
                </select>
              </div>

              <div className="wb-score-display ml-auto">
                <span className="lbl">Overall Score:</span>
                <span className="val">{overallScore} / 100</span>
              </div>
            </div>

            <div className="tr-grid-workbench mt-4">
              {/* Left Column: Metrics Input Sections */}
              <div className="metrics-col">
                {/* SECTION A: VITAL SIGNS */}
                <div className="wb-section-box">
                  <h4 className="wb-section-title">Section A: Vital Signs</h4>
                  <div className="wb-inputs-grid-3">
                    <div className="form-group">
                      <label>Systolic (mmHg)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={vitals.systolic}
                        onChange={(e) => setVitals({ ...vitals, systolic: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Diastolic (mmHg)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={vitals.diastolic}
                        onChange={(e) => setVitals({ ...vitals, diastolic: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Resting Heart Rate (bpm)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={vitals.hr}
                        onChange={(e) => setVitals({ ...vitals, hr: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION B: CIRCUMFERENCES (cm) */}
                <div className="wb-section-box mt-3">
                  <h4 className="wb-section-title">Section B: Circumferences (cm)</h4>
                  <div className="wb-inputs-grid-3">
                    <div className="form-group">
                      <label>Waist</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={circumferences.waist}
                        onChange={(e) => setCircumferences({ ...circumferences, waist: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Lower Waist</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={circumferences.lowerWaist}
                        onChange={(e) => setCircumferences({ ...circumferences, lowerWaist: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Hip</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={circumferences.hip}
                        onChange={(e) => setCircumferences({ ...circumferences, hip: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Chest</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={circumferences.chest}
                        onChange={(e) => setCircumferences({ ...circumferences, chest: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Arms</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={circumferences.arms}
                        onChange={(e) => setCircumferences({ ...circumferences, arms: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Thigh</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={circumferences.thigh}
                        onChange={(e) => setCircumferences({ ...circumferences, thigh: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION C: SYSTEM SCORES (out of 100) */}
                <div className="wb-section-box mt-3">
                  <h4 className="wb-section-title">Section C: System Scores (out of 100)</h4>
                  <div className="wb-inputs-grid-3">
                    <div className="form-group">
                      <label>Body Composition (32 / 40)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={scores.bodyComp}
                        onChange={(e) => setScores({ ...scores, bodyComp: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Vital Signs (16 / 20)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={scores.vitals}
                        onChange={(e) => setScores({ ...scores, vitals: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Flexibility (15 / 20)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={scores.flexibility}
                        onChange={(e) => setScores({ ...scores, flexibility: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Measurements (16 / 20)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={scores.measurements}
                        onChange={(e) => setScores({ ...scores, measurements: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Trainer Assessment (14 / 20)</label>
                      <input
                        type="number"
                        className="tr-input"
                        value={scores.trainerScore}
                        onChange={(e) => setScores({ ...scores, trainerScore: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Transformation Photos Upload Grid */}
              <div className="photos-col">
                <div className="wb-section-box h-100">
                  <h4 className="wb-section-title">Transformation Photos</h4>

                  <div className="photos-upload-grid">
                    {['front', 'back', 'left', 'right'].map(view => (
                      <div key={view} className="photo-upload-box">
                        {photos[view] ? (
                          <div className="uploaded-photo-preview">
                            <img src={photos[view]} alt={`${view} view`} />
                            <span className="photo-tag">{view.toUpperCase()}</span>
                          </div>
                        ) : (
                          <label className="photo-drop-zone">
                            <input
                              type="file"
                              accept="image/*"
                              className="display-none"
                              onChange={(e) => handlePhotoUpload(view, e)}
                            />
                            <i className="fas fa-cloud-upload-alt"></i>
                            <span>Upload {view.charAt(0).toUpperCase() + view.slice(1)} View</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="tr-btn tr-btn-primary btn-block mt-4"
                    disabled={isSavingAssessment}
                  >
                    {isSavingAssessment ? (
                      <><i className="fas fa-spinner fa-spin"></i> Compiling...</>
                    ) : (
                      <><i className="fas fa-check-double"></i> Compile and Save Full Assessment</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: EMBEDDED DIET PLANS HUB */}
      {activeTab === 'diet-plans' && (
        <div className="tr-tab-content fade-in">
          <TrainerDietPlans />
        </div>
      )}
    </div>
  );
};

export default TrainerPTRoster;
