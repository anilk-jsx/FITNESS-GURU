import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../../utils/tokenManager';
import TrainerDietPlans from './TrainerDietPlans';
import './TrainerPTRoster.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Full status → human label mapping (all 9 lifecycle states from API doc)
const STATUS_LABELS = {
  AVAILABLE:         'Open Slot',
  PENDING:           'Booked',
  ATTENDED:          'Attended',
  TRAINER_ABSENT:    'Trainer Absent',
  MEMBER_NO_SHOW:    'No-Show',
  DISPUTED:          'Disputed',
  RESOLVED_BY_ADMIN: 'Resolved',
  MUTUAL_ABSENCE:    'Mutual Absence',
  EXPIRED_UNCLAIMED: 'Expired',
};

const STATUS_CLASSES = {
  AVAILABLE:         'status-available',
  PENDING:           'status-booked',
  ATTENDED:          'status-attended',
  TRAINER_ABSENT:    'status-trainer-absent',
  MEMBER_NO_SHOW:    'status-no-show',
  DISPUTED:          'status-disputed',
  RESOLVED_BY_ADMIN: 'status-resolved',
  MUTUAL_ABSENCE:    'status-mutual',
  EXPIRED_UNCLAIMED: 'status-expired',
};

const getStatusLabel = (s) => STATUS_LABELS[s] || s || 'Unknown';
const getStatusClass = (s) => STATUS_CLASSES[s] || '';

const TrainerPTRoster = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const normalizedTab = (rawTab === 'assessments' || rawTab === 'assessment-workbench')
    ? 'assessment-workbench'
    : (rawTab || 'roster-desk');

  const [activeTab, setActiveTab] = useState(normalizedTab);

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

  // ─── TOAST ───────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // ─── DAYS DEFINITION ─────────────────────────────────────────────────────
  const daysDef = [
    { day_id: 1, label: 'Mon' },
    { day_id: 2, label: 'Tue' },
    { day_id: 3, label: 'Wed' },
    { day_id: 4, label: 'Thu' },
    { day_id: 5, label: 'Fri' },
    { day_id: 6, label: 'Sat' },
    { day_id: 7, label: 'Sun' },
  ];

  // ─── PT SLOTS (from API, with static fallback) ────────────────────────────
  const [ptSlots, setPtSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  const staticFallbackSlots = [
    { slot_id: 1,  slot_name: 'Morning Slot 1', start_time: '06:00:00', end_time: '07:30:00' },
    { slot_id: 2,  slot_name: 'Morning Slot 2', start_time: '07:30:00', end_time: '09:00:00' },
    { slot_id: 3,  slot_name: 'Morning Slot 3', start_time: '08:30:00', end_time: '10:30:00' },
    { slot_id: 4,  slot_name: 'Midday Slot 1',  start_time: '10:30:00', end_time: '12:00:00' },
    { slot_id: 5,  slot_name: 'Midday Slot 2',  start_time: '12:30:00', end_time: '15:00:00' },
    { slot_id: 6,  slot_name: 'Evening Slot 1', start_time: '15:00:00', end_time: '16:30:00' },
    { slot_id: 7,  slot_name: 'Evening Slot 2', start_time: '16:30:00', end_time: '18:00:00' },
    { slot_id: 8,  slot_name: 'Evening Slot 3', start_time: '18:00:00', end_time: '19:30:00' },
    { slot_id: 9,  slot_name: 'Night Slot 1',   start_time: '19:30:00', end_time: '21:00:00' },
  ];

  const fetchPtSlots = useCallback(async () => {
    setIsSlotsLoading(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt-slots`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
          setPtSlots(data.data);
          setIsSlotsLoading(false);
          return data.data;
        }
      }
    } catch (_) { /* fall through */ }
    setPtSlots(staticFallbackSlots);
    setIsSlotsLoading(false);
    return staticFallbackSlots;
  }, [API_BASE_URL]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── WEEKLY AVAILABILITY TEMPLATE ────────────────────────────────────────
  // templateMatrix: { dayId (int): [slot_id, slot_id, ...] }
  const buildEmptyMatrix = () =>
    daysDef.reduce((acc, d) => { acc[d.day_id] = []; return acc; }, {});

  const [templateMatrix, setTemplateMatrix] = useState({});
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // GET /api/trainer/availability/template
  // Response: { data: { "1": [{slot_id, slot_name, start_time, end_time},...], "2": [], ... } }
  const fetchAvailabilityTemplate = useCallback(async () => {
    setIsTemplateLoading(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/availability/template`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          // Convert API format { "1": [{slot_id: 16,...}] } → { 1: [16,...] }
          const matrix = buildEmptyMatrix();
          Object.entries(data.data).forEach(([dayStr, slots]) => {
            const dayId = parseInt(dayStr);
            if (matrix.hasOwnProperty(dayId)) {
              matrix[dayId] = Array.isArray(slots) ? slots.map(s => s.slot_id) : [];
            }
          });
          setTemplateMatrix(matrix);
          setIsTemplateLoading(false);
          return;
        }
      }
    } catch (_) { /* fall through */ }
    setTemplateMatrix(buildEmptyMatrix());
    setIsTemplateLoading(false);
  }, [API_BASE_URL]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load both slots & template on mount
  useEffect(() => {
    fetchPtSlots();
    fetchAvailabilityTemplate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTemplateSlot = (dayId, slotId) => {
    setTemplateMatrix(prev => {
      const current = prev[dayId] || [];
      const has = current.includes(slotId);
      return { ...prev, [dayId]: has ? current.filter(id => id !== slotId) : [...current, slotId] };
    });
  };

  // POST /api/trainer/availability/template
  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    const daysPayload = Object.keys(templateMatrix).map(dayId => ({
      day_of_week: parseInt(dayId),
      slots: templateMatrix[dayId],
    }));
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/availability/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: daysPayload }),
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

  // ─── DAILY ROSTER ─────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [rosterData, setRosterData] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // GET /api/trainer/roster?date=YYYY-MM-DD
  const fetchTrainerRoster = useCallback(async (dateStr) => {
    setIsLoadingRoster(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/roster?date=${dateStr}`);
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

  // Build assessment client list from roster
  const [rosterClients, setRosterClients] = useState([]);
  useEffect(() => {
    setRosterClients(prev => {
      const existingIds = new Set(prev.map(c => c.member_id));
      const newClients = rosterData
        .filter(r => r.member_id && !existingIds.has(r.member_id))
        .map(r => ({ member_id: r.member_id, member_name: r.member_name, member_email: r.member_email || '' }));
      return [...prev, ...newClients];
    });
  }, [rosterData]);

  // ─── API T1: INITIATE SESSION COMPLETION (PIN GENERATOR) ─────────────────
  // POST /api/trainer/session/complete  body: { schedule_id }
  const [activeHandshakeSchedule, setActiveHandshakeSchedule] = useState(null);
  const [generatedPin, setGeneratedPin] = useState(null);
  const [isCompletingSession, setIsCompletingSession] = useState(false);

  const handleInitiateHandshake = (schedule) => {
    setActiveHandshakeSchedule(schedule);
    setGeneratedPin(null);
  };

  // Reads body as text first so the raw server response is always visible in the console,
  // then parses as JSON. Returns null if body is empty or unparseable.
  const safeJson = async (res) => {
    try {
      const text = await res.text();
      console.log(`[API ${res.status}] raw body:`, text || '(empty)');
      if (!text || !text.trim()) return null;
      return JSON.parse(text);
    } catch (e) {
      console.warn('[safeJson] parse error:', e);
      return null;
    }
  };

  const handleGeneratePinSubmit = async (e) => {
    e.preventDefault();
    if (!activeHandshakeSchedule) return;
    setIsCompletingSession(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/session/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_id: activeHandshakeSchedule.schedule_id }),
      });
      const data = await safeJson(res);

      if (res.ok) {
        // Server returned 200 — extract PIN wherever it is in the response shape
        // API doc: { status: 'success', schedule_id, verification_pin }
        const pin = data?.verification_pin ?? data?.data?.verification_pin ?? null;
        if (pin !== null && pin !== undefined) {
          setGeneratedPin(pin);
          showToast('Completion handshake initiated! Share PIN with member.');
        } else if (data?.status === 'success' || data === null) {
          // 200 but no pin in body — server may have already set it;
          // re-fetch roster to pull the actual pin from the schedule row
          showToast('Session marked complete. Fetching PIN from roster...', 'success');
          try {
            const rosterRes = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/roster?date=${selectedDate}`);
            const rosterData = await safeJson(rosterRes);
            const updated = rosterData?.data?.find(s => s.schedule_id === activeHandshakeSchedule.schedule_id);
            if (updated?.verification_pin) {
              setGeneratedPin(updated.verification_pin);
            } else {
              // PIN not in roster yet — just show success and close
              showToast('Session completed! The member will receive the PIN in their app.', 'success');
              closeHandshakeModal();
            }
          } catch (_) {
            showToast('Session completed! Close this modal and refresh.', 'success');
            closeHandshakeModal();
          }
        } else {
          showToast(data?.message || `Failed (${res.status}). Please try again.`, 'error');
          console.error('[Complete Session] unexpected 200 body:', data);
        }
      } else {
        const msg = data?.message || `Server error (${res.status}). Please try again.`;
        showToast(msg, 'error');
        console.error('[Complete Session]', res.status, data);
      }
    } catch (err) {
      console.error('[Complete Session] threw:', err);
      showToast(`Request failed: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setIsCompletingSession(false);
    }
  };

  const closeHandshakeModal = () => {
    setActiveHandshakeSchedule(null);
    setGeneratedPin(null);
    fetchTrainerRoster(selectedDate);
  };

  // ─── API T2: RELEASE SESSION (SOFT CANCEL) ───────────────────────────────
  // POST /api/trainer/session/release  body: { schedule_id }
  const [isReleasing, setIsReleasing] = useState(false);

  const handleReleaseSession = async (schedule) => {
    if (!window.confirm(`Release booking for ${schedule.member_name}? This returns the slot to AVAILABLE without any credit penalty.`)) return;
    setIsReleasing(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/session/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_id: schedule.schedule_id }),
      });
      const data = await safeJson(res);
      if (res.ok && data?.status === 'success') {
        showToast('Session released. Slot is now AVAILABLE.');
        fetchTrainerRoster(selectedDate);
      } else {
        const msg = data?.message || `Server error (${res.status}).`;
        showToast(msg, 'error');
        console.error('[Release Session]', res.status, data);
      }
    } catch (err) {
      console.error('[Release Session] threw:', err);
      showToast(`Request failed: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setIsReleasing(false);
    }
  };

  // ─── API T3: FLAG CLIENT NO-SHOW ─────────────────────────────────────────
  // POST /api/trainer/session/no-show  body: { schedule_id, reason }
  const [noShowModal, setNoShowModal] = useState(null); // schedule object
  const [noShowReason, setNoShowReason] = useState('');
  const [isSubmittingNoShow, setIsSubmittingNoShow] = useState(false);

  const handleNoShowSubmit = async (e) => {
    e.preventDefault();
    if (!noShowModal) return;
    setIsSubmittingNoShow(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/session/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: noShowModal.schedule_id,
          reason: noShowReason || 'Client did not attend session.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('No-show flagged. 1 client credit consumed.');
        setNoShowModal(null);
        setNoShowReason('');
        fetchTrainerRoster(selectedDate);
      } else {
        showToast(data.message || 'Failed to flag no-show.', 'error');
      }
    } catch (_) {
      showToast('Network error. Could not flag no-show.', 'error');
    } finally {
      setIsSubmittingNoShow(false);
    }
  };

  // ─── ASSESSMENT WORKBENCH ─────────────────────────────────────────────────
  const [workbenchMemberId, setWorkbenchMemberId] = useState('');
  const [workbenchType, setWorkbenchType] = useState('PROGRESS');
  const [vitals, setVitals] = useState({ systolic: '', diastolic: '', hr: '' });
  const [circumferences, setCircumferences] = useState({ waist: '', lowerWaist: '', hip: '', chest: '', arms: '', thigh: '' });
  const [scores, setScores] = useState({ bodyComp: '', vitals: '', flexibility: '', measurements: '', trainerScore: '' });
  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  const overallScore =
    (parseInt(scores.bodyComp) || 0) +
    (parseInt(scores.vitals) || 0) +
    (parseInt(scores.flexibility) || 0) +
    (parseInt(scores.measurements) || 0) +
    (parseInt(scores.trainerScore) || 0);

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!workbenchMemberId) {
      showToast('Please select a client first.', 'error');
      return;
    }
    setIsSavingAssessment(true);
    try {
      const payload = {
        member_id: parseInt(workbenchMemberId),
        assessment_type: workbenchType,
        vitals: {
          systolic: parseInt(vitals.systolic) || null,
          diastolic: parseInt(vitals.diastolic) || null,
          heart_rate: parseInt(vitals.hr) || null,
        },
        circumferences: {
          waist: parseFloat(circumferences.waist) || null,
          lower_waist: parseFloat(circumferences.lowerWaist) || null,
          hip: parseFloat(circumferences.hip) || null,
          chest: parseFloat(circumferences.chest) || null,
          arms: parseFloat(circumferences.arms) || null,
          thigh: parseFloat(circumferences.thigh) || null,
        },
        scores: {
          body_composition: parseInt(scores.bodyComp) || null,
          vital_signs: parseInt(scores.vitals) || null,
          flexibility: parseInt(scores.flexibility) || null,
          measurements: parseInt(scores.measurements) || null,
          trainer_score: parseInt(scores.trainerScore) || null,
          overall: overallScore,
        },
      };
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handlePhotoUpload = (view, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos(prev => ({ ...prev, [view]: url }));
      showToast(`Uploaded ${view} view photo`);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
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
            <i className="fas fa-calendar-check text-primary"></i> PT Roster &amp; Assessment Workbench
          </h1>
          <p className="tr-subtitle">
            Manage weekly repeating shifts, execute session completion PIN handshakes, flag no-shows, and record client assessments.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tr-nav-tabs">
        <button className={`tr-tab-btn ${activeTab === 'roster-desk' ? 'active' : ''}`} onClick={() => handleTabChange('roster-desk')}>
          <i className="fas fa-clock"></i> 2.1 Baseline Scheduling &amp; Roster Desk
        </button>
        <button className={`tr-tab-btn ${activeTab === 'assessment-workbench' ? 'active' : ''}`} onClick={() => handleTabChange('assessment-workbench')}>
          <i className="fas fa-notes-medical"></i> 2.2 Multi-Metric Assessment Workbench
        </button>
        <button className={`tr-tab-btn ${activeTab === 'diet-plans' ? 'active' : ''}`} onClick={() => handleTabChange('diet-plans')}>
          <i className="fas fa-seedling"></i> Diet Plans Hub
        </button>
      </div>

      {/* ══ TAB 1: SCREEN 2.1 WEEKLY BASELINE SCHEDULING & ROSTER DESK ══ */}
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
                  <i className="fas fa-spinner fa-spin"></i> Loading template...
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
                {isSavingTemplate
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving Template...</>
                  : <><i className="fas fa-save"></i> Save Core Repeating Shifts</>
                }
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
                  <span>Slots appear once the admin generates a PT schedule for this week.</span>
                </div>
              ) : (
                <div className="roster-list-stack mt-3">
                  {rosterData.map(item => (
                    <div
                      key={item.schedule_id}
                      className={`roster-slot-card status-border-${item.session_status?.toLowerCase().replace(/_/g, '-')}`}
                    >
                      {/* Time */}
                      <div className="roster-time-col">
                        <i className="far fa-clock"></i>
                        <span>
                          {item.start_time ? item.start_time.substring(0, 5) : '--:--'} – {item.end_time ? item.end_time.substring(0, 5) : '--:--'}
                        </span>
                      </div>

                      {/* Member info */}
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

                      {/* Status + Actions */}
                      <div className="roster-action-col">
                        <span className={`status-tag ${getStatusClass(item.session_status)}`}>
                          {getStatusLabel(item.session_status)}
                        </span>

                        {/* PENDING → 3 actions: Complete (T1), Release (T2), No-Show (T3) */}
                        {item.member_name && item.session_status === 'PENDING' && (
                          <div className="action-btn-group">
                            <button
                              className="tr-btn tr-btn-outline-primary btn-sm"
                              onClick={() => handleInitiateHandshake(item)}
                              title="Generate PIN for session completion"
                            >
                              <i className="fas fa-key"></i> Complete
                            </button>
                            <button
                              className="tr-btn tr-btn-outline-warning btn-sm"
                              onClick={() => handleReleaseSession(item)}
                              disabled={isReleasing}
                              title="Release slot back to AVAILABLE (no credit penalty)"
                            >
                              <i className="fas fa-undo"></i> Release
                            </button>
                            <button
                              className="tr-btn tr-btn-outline-danger btn-sm"
                              onClick={() => { setNoShowModal(item); setNoShowReason(''); }}
                              title="Flag client no-show (consumes 1 credit)"
                            >
                              <i className="fas fa-user-slash"></i> No-Show
                            </button>
                          </div>
                        )}

                        {/* MEMBER_NO_SHOW → awaiting member dispute or admin resolution */}
                        {item.session_status === 'MEMBER_NO_SHOW' && (
                          <span className="pending-info-tag pending-info-warning">
                            <i className="fas fa-exclamation-triangle"></i> Awaiting member response
                          </span>
                        )}

                        {/* DISPUTED → awaiting admin arbitration */}
                        {item.session_status === 'DISPUTED' && (
                          <span className="pending-info-tag pending-info-danger">
                            <i className="fas fa-gavel"></i> Disputed — Admin review pending
                          </span>
                        )}

                        {/* TRAINER_ABSENT → member reported absence */}
                        {item.session_status === 'TRAINER_ABSENT' && (
                          <span className="pending-info-tag pending-info-warning">
                            <i className="fas fa-door-open"></i> Absence reported by member
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

      {/* ══ MODAL: SESSION COMPLETION HANDSHAKE (API T1) ══ */}
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

                <p className="modal-help-text">
                  <i className="fas fa-info-circle"></i> A 4-digit PIN will be generated and must be shown to the member. They enter it in their app to confirm attendance and deduct 1 credit.
                </p>

                <button type="submit" className="tr-btn tr-btn-primary btn-block" disabled={isCompletingSession}>
                  {isCompletingSession
                    ? <><i className="fas fa-spinner fa-spin"></i> Generating PIN...</>
                    : <><i className="fas fa-key"></i> Generate Validation PIN</>
                  }
                </button>
              </form>
            ) : (
              <div className="pin-generated-display text-center fade-in">
                <p className="pin-title">Share Validation Code with Member</p>
                <p className="pin-subtitle">Show this PIN to the member — they enter it in their app to finalise attendance</p>

                <div className="pin-digits-flex">
                  {String(generatedPin).padStart(4, '0').split('').map((digit, idx) => (
                    <div key={idx} className="pin-box">{digit}</div>
                  ))}
                </div>

                <div className="pin-info-notice">
                  <i className="fas fa-info-circle text-info"></i>
                  <span>
                    Once the member enters this PIN in their mobile app, the session status changes to <strong>ATTENDED</strong> and 1 credit is deducted from their wallet automatically.
                  </span>
                </div>

                <button className="tr-btn tr-btn-secondary btn-block mt-4" onClick={closeHandshakeModal}>
                  Close &amp; Refresh Roster
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL: FLAG NO-SHOW (API T3) ══ */}
      {noShowModal && (
        <div className="tr-modal-backdrop">
          <div className="tr-modal-card">
            <div className="modal-header-flex">
              <h3 className="modal-title">
                <i className="fas fa-user-slash text-danger"></i> Flag Client No-Show
              </h3>
              <button className="close-btn" onClick={() => setNoShowModal(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleNoShowSubmit} className="form-stack mt-3">
              <div className="session-summary-banner">
                <div><strong>Client:</strong> {noShowModal.member_name}</div>
                <div>
                  <strong>Time:</strong>{' '}
                  {noShowModal.start_time?.substring(0, 5)} – {noShowModal.end_time?.substring(0, 5)}
                </div>
                <div><strong>Date:</strong> {noShowModal.session_date}</div>
              </div>

              <div className="no-show-warning-box">
                <i className="fas fa-exclamation-triangle"></i>
                <span>This will <strong>immediately deduct 1 credit</strong> from the client's wallet. The member can contest this via their app, which will create a <strong>DISPUTED</strong> case for admin resolution.</span>
              </div>

              <div className="form-group">
                <label>Trainer Notes / Reason for No-Show</label>
                <textarea
                  className="tr-textarea"
                  rows="3"
                  placeholder="e.g. Client did not attend. I was present at the session location from 10:00–10:30 AM."
                  value={noShowReason}
                  onChange={(e) => setNoShowReason(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="tr-btn tr-btn-danger btn-block" disabled={isSubmittingNoShow}>
                {isSubmittingNoShow
                  ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                  : <><i className="fas fa-user-slash"></i> Confirm No-Show &amp; Deduct Credit</>
                }
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB 2: SCREEN 2.2 COMPREHENSIVE MULTI-METRIC ASSESSMENT WORKBENCH ══ */}
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
                <select className="tr-select" value={workbenchType} onChange={(e) => setWorkbenchType(e.target.value)}>
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
              {/* Left Column */}
              <div className="metrics-col">
                {/* SECTION A */}
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

                {/* SECTION B */}
                <div className="wb-section-box mt-3">
                  <h4 className="wb-section-title">Section B: Circumferences (cm)</h4>
                  <div className="wb-inputs-grid-3">
                    {[
                      { key: 'waist', label: 'Waist' },
                      { key: 'lowerWaist', label: 'Lower Waist' },
                      { key: 'hip', label: 'Hip' },
                      { key: 'chest', label: 'Chest' },
                      { key: 'arms', label: 'Arms' },
                      { key: 'thigh', label: 'Thigh' },
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

                {/* SECTION C */}
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

              {/* Right Column: Photos */}
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
                            <input type="file" accept="image/*" className="display-none"
                              onChange={(e) => handlePhotoUpload(view, e)} />
                            <i className="fas fa-cloud-upload-alt"></i>
                            <span>Upload {view.charAt(0).toUpperCase() + view.slice(1)} View</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="tr-btn tr-btn-primary btn-block mt-4" disabled={isSavingAssessment}>
                    {isSavingAssessment
                      ? <><i className="fas fa-spinner fa-spin"></i> Compiling...</>
                      : <><i className="fas fa-check-double"></i> Compile and Save Full Assessment</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ══ TAB 3: DIET PLANS HUB ══ */}
      {activeTab === 'diet-plans' && (
        <div className="tr-tab-content fade-in">
          <TrainerDietPlans />
        </div>
      )}
    </div>
  );
};

export default TrainerPTRoster;
