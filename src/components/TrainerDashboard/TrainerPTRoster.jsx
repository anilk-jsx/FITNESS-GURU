import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../../utils/tokenManager';
import TrainerDietPlans from './TrainerDietPlans';
import './TrainerPTRoster.css';

// --- Helpers ---
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

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

  // ─── SLOTS & DAYS ─────────────────────────────────────────────────────────

  const daysDef = [
    { day_id: 1, label: 'Mon' },
    { day_id: 2, label: 'Tue' },
    { day_id: 3, label: 'Wed' },
    { day_id: 4, label: 'Thu' },
    { day_id: 5, label: 'Fri' },
    { day_id: 6, label: 'Sat' },
    { day_id: 7, label: 'Sun' }
  ];

  // Dynamic PT slots fetched from API
  const [ptSlots, setPtSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  const fetchPtSlots = useCallback(async () => {
    setIsSlotsLoading(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/pt-slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          setPtSlots(data.data);
          setIsSlotsLoading(false);
          return data.data;
        }
      }
    } catch (_) { /* fall through to fallback */ }
    // Fallback static slots
    const fallback = [
      { slot_id: 1, slot_name: 'Morning Slot 1', start_time: '06:00:00', end_time: '07:30:00' },
      { slot_id: 2, slot_name: 'Morning Slot 2', start_time: '07:30:00', end_time: '09:00:00' },
      { slot_id: 3, slot_name: 'Morning Slot 3', start_time: '08:30:00', end_time: '10:30:00' },
      { slot_id: 4, slot_name: 'Midday Slot 1',  start_time: '10:30:00', end_time: '12:00:00' },
      { slot_id: 5, slot_name: 'Midday Slot 2',  start_time: '12:30:00', end_time: '15:00:00' },
      { slot_id: 6, slot_name: 'Evening Slot 1', start_time: '15:00:00', end_time: '16:30:00' },
      { slot_id: 7, slot_name: 'Evening Slot 2', start_time: '16:30:00', end_time: '18:00:00' },
      { slot_id: 8, slot_name: 'Evening Slot 3', start_time: '18:00:00', end_time: '19:30:00' },
      { slot_id: 9, slot_name: 'Night Slot 1',   start_time: '19:30:00', end_time: '21:00:00' }
    ];
    setPtSlots(fallback);
    setIsSlotsLoading(false);
    return fallback;
  }, [API_BASE_URL]);

  // ─── WEEKLY AVAILABILITY TEMPLATE ─────────────────────────────────────────
  const [templateMatrix, setTemplateMatrix] = useState({});
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);

  const buildEmptyMatrix = () =>
    daysDef.reduce((acc, d) => { acc[d.day_id] = []; return acc; }, {});

  // Reconstruct existing template from current week's roster
  const fetchExistingTemplate = useCallback(async (slots) => {
    setIsTemplateLoading(true);
    try {
      const token = tokenManager.getAccessToken();
      const today = new Date();
      const dow = today.getDay();
      const diffToMon = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMon);
      const matrix = buildEmptyMatrix();
      const slotIds = (slots || []).map(s => s.slot_id);
      await Promise.all(
        daysDef.map(async ({ day_id }) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + (day_id - 1));
          const dateStr = toLocalDateString(date);
          const res = await fetch(`${API_BASE_URL}/api/trainer/roster?date=${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) return;
          const data = await res.json();
          if (data.status === 'success' && Array.isArray(data.data)) {
            const activeSlots = data.data
              .map(s => s.slot_id)
              .filter(id => slotIds.includes(id));
            matrix[day_id] = [...new Set(activeSlots)];
          }
        })
      );
      setTemplateMatrix(matrix);
    } catch (_) {
      setTemplateMatrix(buildEmptyMatrix());
    } finally {
      setIsTemplateLoading(false);
    }
  }, [API_BASE_URL]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load slots then template on mount
  useEffect(() => {
    fetchPtSlots().then(slots => { fetchExistingTemplate(slots); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── DAILY ROSTER ──────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [rosterData, setRosterData] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Active Handshake Modal (PIN Generator)
  const [activeHandshakeSchedule, setActiveHandshakeSchedule] = useState(null);
  const [workoutSummary, setWorkoutSummary] = useState('');
  const [generatedPin, setGeneratedPin] = useState(null);
  const [isCompletingSession, setIsCompletingSession] = useState(false);

  // Assessment Workbench
  const [rosterClients, setRosterClients] = useState([]);
  const [workbenchMemberId, setWorkbenchMemberId] = useState('');
  const [workbenchType, setWorkbenchType] = useState('PROGRESS');
  const [vitals, setVitals] = useState({ systolic: '', diastolic: '', hr: '' });
  const [circumferences, setCircumferences] = useState({ waist: '', lowerWaist: '', hip: '', chest: '', arms: '', thigh: '' });
  const [scores, setScores] = useState({ bodyComp: '', vitals: '', flexibility: '', measurements: '', trainerScore: '' });
  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // Build roster client list from loaded roster data
  useEffect(() => {
    setRosterClients(prev => {
      const existingIds = new Set(prev.map(c => c.member_id));
      const newClients = rosterData
        .filter(r => r.member_id && !existingIds.has(r.member_id))
        .map(r => ({ member_id: r.member_id, member_name: r.member_name, member_email: r.member_email || '' }));
      return [...prev, ...newClients];
    });
  }, [rosterData]);

  // Status helpers
  const getStatusLabel = (status) => {
    switch (status) {
      case 'BOOKED':    return 'Upcoming';
      case 'PENDING':   return 'Pending PIN';
      case 'ATTENDED':  return 'Attended';
      case 'AVAILABLE': return 'Open Slot';
      default:          return status || 'Unknown';
    }
  };
  const getStatusClass = (status) => {
    switch (status) {
      case 'BOOKED':    return 'status-booked';
      case 'PENDING':   return 'status-pending';
      case 'ATTENDED':  return 'status-attended';
      case 'AVAILABLE': return 'status-available';
      default:          return '';
    }
  };

  // API 4: Query Trainer Booking Roster
  const fetchTrainerRoster = useCallback(async (dateStr) => {
    setIsLoadingRoster(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/trainer/roster?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setRosterData(data.data || []);
          return;
        }
      }
      setRosterData([]);
    } catch (_) {
      setRosterData([]);
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
      const current = prev[dayId] || [];
      const has = current.includes(slotId);
      return { ...prev, [dayId]: has ? current.filter(id => id !== slotId) : [...current, slotId] };
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
      const res = await fetch(`${API_BASE_URL}/api/trainer/availability/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days: daysPayload })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Weekly availability template updated successfully!');
      } else {
        showToast(data.message || 'Failed to save template.', 'error');
      }
    } catch (_) {
      showToast('Could not reach server. Please try again.', 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // API 7: Initiate Session Completion (Generate PIN)
  const handleInitiateHandshake = (schedule) => {
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
      const res = await fetch(`${API_BASE_URL}/api/trainer/session/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          schedule_id: activeHandshakeSchedule.schedule_id,
          workout_summary: workoutSummary || 'Standard 1-on-1 PT Session completed.'
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setGeneratedPin(data.verification_pin);
        showToast('Completion handshake initiated! Share PIN with member.');
      } else {
        showToast(data.message || 'Failed to generate PIN.', 'error');
      }
    } catch (_) {
      showToast('Network error. Could not generate PIN.', 'error');
    } finally {
      setIsCompletingSession(false);
    }
  };

  // Close handshake modal & refresh roster
  const closeHandshakeModal = () => {
    setActiveHandshakeSchedule(null);
    setGeneratedPin(null);
    setWorkoutSummary('');
    fetchTrainerRoster(selectedDate);
  };

  // Save Assessment — real API call
  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!workbenchMemberId) {
      showToast('Please select a client first.', 'error');
      return;
    }
    setIsSavingAssessment(true);
    try {
      const token = tokenManager.getAccessToken();
      const payload = {
        member_id: parseInt(workbenchMemberId),
        assessment_type: workbenchType,
        vitals: {
          systolic: parseInt(vitals.systolic) || null,
          diastolic: parseInt(vitals.diastolic) || null,
          heart_rate: parseInt(vitals.hr) || null
        },
        circumferences: {
          waist: parseFloat(circumferences.waist) || null,
          lower_waist: parseFloat(circumferences.lowerWaist) || null,
          hip: parseFloat(circumferences.hip) || null,
          chest: parseFloat(circumferences.chest) || null,
          arms: parseFloat(circumferences.arms) || null,
          thigh: parseFloat(circumferences.thigh) || null
        },
        scores: {
          body_composition: parseInt(scores.bodyComp) || null,
          vital_signs: parseInt(scores.vitals) || null,
          flexibility: parseInt(scores.flexibility) || null,
          measurements: parseInt(scores.measurements) || null,
          trainer_score: parseInt(scores.trainerScore) || null,
          overall: overallScore
        }
      };
      const res = await fetch(`${API_BASE_URL}/api/trainer/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && (data.status === 'success' || res.status === 201)) {
        showToast('Comprehensive Multi-Metric Assessment compiled & saved successfully!');
        setVitals({ systolic: '', diastolic: '', hr: '' });
        setCircumferences({ waist: '', lowerWaist: '', hip: '', chest: '', arms: '', thigh: '' });
        setScores({ bodyComp: '', vitals: '', flexibility: '', measurements: '', trainerScore: '' });
        setPhotos({ front: null, back: null, left: null, right: null });
      } else {
        showToast(data.message || 'Assessment could not be saved.', 'error');
      }
    } catch (_) {
      showToast('Could not reach server. Please try again.', 'error');
    } finally {
      setIsSavingAssessment(false);
    }
  };

  // Photo Upload
  const handlePhotoUpload = (view, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos(prev => ({ ...prev, [view]: url }));
      showToast(`Uploaded ${view} view photo`);
    }
  };

  const overallScore = (parseInt(scores.bodyComp) || 0)
    + (parseInt(scores.vitals) || 0)
    + (parseInt(scores.flexibility) || 0)
    + (parseInt(scores.measurements) || 0)
    + (parseInt(scores.trainerScore) || 0);

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

              {isSlotsLoading || isTemplateLoading ? (
                <div className="loader-box">
                  <i className="fas fa-spinner fa-spin"></i> Loading slots...
                </div>
              ) : (
                <div className="template-matrix-wrapper">
                  <div className="matrix-header-row">
                    <div className="slot-col-header">Time Slot</div>
                    {daysDef.map(d => (
                      <div key={d.day_id} className="day-col-header">{d.label}</div>
                    ))}
                  </div>

                  {ptSlots.map(slot => (
                    <div key={slot.slot_id} className="matrix-data-row">
                      <div className="slot-label-cell">
                        {slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}
                      </div>
                      {daysDef.map(day => {
                        const isChecked = (templateMatrix[day.day_id] || []).includes(slot.slot_id);
                        return (
                          <div key={day.day_id} className="matrix-check-cell">
                            <button
                              type="button"
                              className={`slot-chip ${isChecked ? 'active' : ''}`}
                              onClick={() => toggleTemplateSlot(day.day_id, slot.slot_id)}
                              title={`${day.label} ${slot.start_time.substring(0, 5)}–${slot.end_time.substring(0, 5)}`}
                            >
                              <i className={`fas ${isChecked ? 'fa-check' : 'fa-plus'}`}></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="tr-btn tr-btn-success btn-block mt-4"
                onClick={handleSaveTemplate}
                disabled={isSavingTemplate || isSlotsLoading || isTemplateLoading}
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
              ) : rosterData.length === 0 ? (
                <div className="empty-roster-state">
                  <i className="fas fa-calendar-times"></i>
                  <p>No sessions scheduled for this date.</p>
                  <span>Slots will appear here once schedule is generated by admin.</span>
                </div>
              ) : (
                <div className="roster-list-stack mt-3">
                  {rosterData.map(item => (
                    <div key={item.schedule_id} className={`roster-slot-card status-border-${item.session_status?.toLowerCase()}`}>
                      <div className="roster-time-col">
                        <i className="far fa-clock"></i>
                        <span>
                          {item.start_time ? item.start_time.substring(0, 5) : '--:--'} – {item.end_time ? item.end_time.substring(0, 5) : '--:--'}
                        </span>
                      </div>

                      <div className="roster-info-col">
                        {item.member_name ? (
                          <>
                            <strong>{item.member_name}</strong>
                            {item.member_email && <span className="member-email-lbl">{item.member_email}</span>}
                            {item.plan_name && <span className="pkg-lbl">{item.plan_name}</span>}
                          </>
                        ) : (
                          <span className="text-muted">Open Slot — Available for Booking</span>
                        )}
                      </div>

                      <div className="roster-action-col">
                        <span className={`status-tag ${getStatusClass(item.session_status)}`}>
                          {getStatusLabel(item.session_status)}
                        </span>

                        {item.member_name && item.session_status === 'BOOKED' && (
                          <button
                            className="tr-btn tr-btn-outline-primary btn-sm"
                            onClick={() => handleInitiateHandshake(item)}
                          >
                            <i className="fas fa-handshake"></i> Complete Session
                          </button>
                        )}

                        {item.member_name && item.session_status === 'PENDING' && (
                          <span className="pending-info-tag">
                            <i className="fas fa-hourglass-half"></i> Awaiting member PIN
                          </span>
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
              <button className="close-btn" onClick={closeHandshakeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {!generatedPin ? (
              <form onSubmit={handleGeneratePinSubmit} className="form-stack mt-3">
                <div className="session-summary-banner">
                  <div><strong>Client:</strong> {activeHandshakeSchedule.member_name}</div>
                  <div>
                    <strong>Time:</strong>{' '}
                    {activeHandshakeSchedule.start_time?.substring(0, 5)} – {activeHandshakeSchedule.end_time?.substring(0, 5)}
                  </div>
                  <div><strong>Date:</strong> {activeHandshakeSchedule.session_date}</div>
                </div>

                <div className="form-group">
                  <label>Workout Summary &amp; Trainer Notes</label>
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
                  onClick={closeHandshakeModal}
                >
                  Close &amp; Refresh Roster
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
                  value={workbenchMemberId}
                  onChange={(e) => setWorkbenchMemberId(e.target.value)}
                  required
                >
                  <option value="">— Select a Client —</option>
                  {rosterClients.length > 0 ? (
                    rosterClients.map(client => (
                      <option key={client.member_id} value={client.member_id}>
                        {client.member_name}{client.member_email ? ` (${client.member_email})` : ''}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">No clients found — check roster dates</option>
                  )}
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
                      <input type="number" min="60" max="250" className="tr-input" placeholder="e.g. 120"
                        value={vitals.systolic} onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Diastolic (mmHg)</label>
                      <input type="number" min="40" max="150" className="tr-input" placeholder="e.g. 80"
                        value={vitals.diastolic} onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Resting Heart Rate (bpm)</label>
                      <input type="number" min="30" max="220" className="tr-input" placeholder="e.g. 72"
                        value={vitals.hr} onChange={(e) => setVitals({ ...vitals, hr: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* SECTION B: CIRCUMFERENCES (cm) */}
                <div className="wb-section-box mt-3">
                  <h4 className="wb-section-title">Section B: Circumferences (cm)</h4>
                  <div className="wb-inputs-grid-3">
                    {[
                      { key: 'waist', label: 'Waist' },
                      { key: 'lowerWaist', label: 'Lower Waist' },
                      { key: 'hip', label: 'Hip' },
                      { key: 'chest', label: 'Chest' },
                      { key: 'arms', label: 'Arms' },
                      { key: 'thigh', label: 'Thigh' }
                    ].map(({ key, label }) => (
                      <div key={key} className="form-group">
                        <label>{label}</label>
                        <input type="number" step="0.1" min="0" className="tr-input" placeholder="cm"
                          value={circumferences[key]}
                          onChange={(e) => setCircumferences({ ...circumferences, [key]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION C: SYSTEM SCORES (out of 100) */}
                <div className="wb-section-box mt-3">
                  <h4 className="wb-section-title">Section C: System Scores (out of 100)</h4>
                  <div className="wb-inputs-grid-3">
                    <div className="form-group">
                      <label>Body Composition (max 40)</label>
                      <input type="number" min="0" max="40" className="tr-input" placeholder="0 – 40"
                        value={scores.bodyComp} onChange={(e) => setScores({ ...scores, bodyComp: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Vital Signs (max 20)</label>
                      <input type="number" min="0" max="20" className="tr-input" placeholder="0 – 20"
                        value={scores.vitals} onChange={(e) => setScores({ ...scores, vitals: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Flexibility (max 20)</label>
                      <input type="number" min="0" max="20" className="tr-input" placeholder="0 – 20"
                        value={scores.flexibility} onChange={(e) => setScores({ ...scores, flexibility: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Measurements (max 20)</label>
                      <input type="number" min="0" max="20" className="tr-input" placeholder="0 – 20"
                        value={scores.measurements} onChange={(e) => setScores({ ...scores, measurements: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Trainer Assessment (max 20)</label>
                      <input type="number" min="0" max="20" className="tr-input" placeholder="0 – 20"
                        value={scores.trainerScore} onChange={(e) => setScores({ ...scores, trainerScore: e.target.value })} />
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
                            <button
                              type="button"
                              className="photo-remove-btn"
                              onClick={() => setPhotos(prev => ({ ...prev, [view]: null }))}
                            >
                              <i className="fas fa-times"></i>
                            </button>
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
