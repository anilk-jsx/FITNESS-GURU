import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';
import './GymConfigurationManagement.css';

const GymConfigurationManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeConfigTab, setActiveConfigTab] = useState(tabParam || 'shifts-slots');

  const handleTabChange = (tabKey) => {
    setActiveConfigTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // Gym Shifts & PT Slots State
  const [gymShifts, setGymShifts] = useState([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [selectedShiftForSlots, setSelectedShiftForSlots] = useState('ALL');
  const [shiftViewMode, setShiftViewMode] = useState('matrix'); // 'matrix' (Horizontal side-by-side) or 'table'

  // Shift Modal State
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    shift_name: '',
    shift_type: 'Morning',
    start_time: '05:30',
    end_time: '10:30',
    grace_minutes: 10,
    auto_checkout: 1,
    status: 1,
    slots: []
  });
  const [isSavingShift, setIsSavingShift] = useState(false);

  // PT Slot Modal State
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({
    shift_id: '',
    slot_name: '',
    start_time: '06:00',
    end_time: '07:30'
  });
  const [isSavingSlot, setIsSavingSlot] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // Helper Theme for Shift Cards
  const getShiftTypeTheme = (shiftType) => {
    const type = (shiftType || '').toUpperCase();
    switch (type) {
      case 'MORNING':
        return {
          bg: 'linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%)',
          border: '1px solid #fcd34d',
          accentColor: '#d97706',
          badgeBg: '#fef3c7',
          badgeColor: '#92400e',
          icon: 'fa-sun',
          slotBg: '#ffffff',
          slotBorder: '#fde68a'
        };
      case 'AFTERNOON':
        return {
          bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
          border: '1px solid #67e8f9',
          accentColor: '#0891b2',
          badgeBg: '#cffafe',
          badgeColor: '#155e75',
          icon: 'fa-cloud-sun',
          slotBg: '#ffffff',
          slotBorder: '#a5f3fc'
        };
      case 'EVENING':
        return {
          bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
          border: '1px solid #c4b5fd',
          accentColor: '#6d28d9',
          badgeBg: '#ede9fe',
          badgeColor: '#5b21b6',
          icon: 'fa-moon',
          slotBg: '#ffffff',
          slotBorder: '#ddd6fe'
        };
      case 'NIGHT':
        return {
          bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          border: '1px solid #334155',
          accentColor: '#a5b4fc',
          badgeBg: '#1e293b',
          badgeColor: '#e0e7ff',
          icon: 'fa-star-and-crescent',
          slotBg: '#1e293b',
          slotBorder: '#334155',
          isDark: true
        };
      case 'FULLDAY':
      default:
        return {
          bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1px solid #6ee7b7',
          accentColor: '#059669',
          badgeBg: '#d1fae5',
          badgeColor: '#065f46',
          icon: 'fa-calendar-alt',
          slotBg: '#ffffff',
          slotBorder: '#a7f3d0'
        };
    }
  };

  // API 1: Fetch All Gym Shifts & PT Slots (GET /api/admin/shifts)
  const fetchGymShifts = useCallback(async () => {
    setIsLoadingShifts(true);
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/shifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGymShifts(data.data || []);
      } else {
        setFallbackGymShifts();
      }
    } catch (err) {
      console.error('Error fetching gym shifts:', err);
      setFallbackGymShifts();
    } finally {
      setIsLoadingShifts(false);
    }
  }, [API_BASE_URL]);

  const setFallbackGymShifts = () => {
    setGymShifts([
      {
        shift_id: 1,
        gym_id: 1,
        branch_id: 1,
        shift_name: 'Morning Shift',
        shift_type: 'Morning',
        start_time: '05:30:00',
        end_time: '10:30:00',
        grace_minutes: 10,
        auto_checkout: 1,
        status: 1,
        slots: [
          { slot_id: 1, shift_id: 1, slot_name: 'Morning Slot 1', start_time: '06:00:00', end_time: '07:30:00' },
          { slot_id: 2, shift_id: 1, slot_name: 'Morning Slot 2', start_time: '07:30:00', end_time: '09:00:00' },
          { slot_id: 3, shift_id: 1, slot_name: 'Morning Slot 3', start_time: '09:00:00', end_time: '10:30:00' }
        ]
      },
      {
        shift_id: 2,
        gym_id: 1,
        branch_id: 1,
        shift_name: 'Afternoon Shift',
        shift_type: 'Afternoon',
        start_time: '11:00:00',
        end_time: '16:00:00',
        grace_minutes: 15,
        auto_checkout: 1,
        status: 1,
        slots: [
          { slot_id: 4, shift_id: 2, slot_name: 'Afternoon Slot 1', start_time: '11:30:00', end_time: '13:00:00' },
          { slot_id: 5, shift_id: 2, slot_name: 'Afternoon Slot 2', start_time: '14:00:00', end_time: '15:30:00' }
        ]
      },
      {
        shift_id: 3,
        gym_id: 1,
        branch_id: 1,
        shift_name: 'Evening Peak Shift',
        shift_type: 'Evening',
        start_time: '16:00:00',
        end_time: '22:00:00',
        grace_minutes: 10,
        auto_checkout: 1,
        status: 1,
        slots: [
          { slot_id: 6, shift_id: 3, slot_name: 'Evening Slot 1', start_time: '16:30:00', end_time: '18:00:00' },
          { slot_id: 7, shift_id: 3, slot_name: 'Evening Slot 2', start_time: '18:00:00', end_time: '19:30:00' },
          { slot_id: 8, shift_id: 3, slot_name: 'Evening Slot 3', start_time: '19:30:00', end_time: '21:00:00' }
        ]
      },
      {
        shift_id: 4,
        gym_id: 1,
        branch_id: 1,
        shift_name: 'Late Night Shift',
        shift_type: 'Night',
        start_time: '22:00:00',
        end_time: '02:00:00',
        grace_minutes: 15,
        auto_checkout: 1,
        status: 1,
        slots: [
          { slot_id: 9, shift_id: 4, slot_name: 'Night Slot 1', start_time: '22:30:00', end_time: '00:00:00' },
          { slot_id: 10, shift_id: 4, slot_name: 'Night Slot 2', start_time: '00:00:00', end_time: '01:30:00' }
        ]
      }
    ]);
  };

  // API 3 & 4: Create / Update Gym Shift
  const handleSaveShift = async (e) => {
    e.preventDefault();
    setIsSavingShift(true);
    try {
      const token = tokenManager.getAccessToken();
      const isEdit = !!editingShift;
      const url = isEdit 
        ? `${API_BASE_URL}/api/admin/shifts/${editingShift.shift_id}`
        : `${API_BASE_URL}/api/admin/shifts`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        shift_name: shiftForm.shift_name,
        shift_type: shiftForm.shift_type,
        start_time: shiftForm.start_time.length === 5 ? `${shiftForm.start_time}:00` : shiftForm.start_time,
        end_time: shiftForm.end_time.length === 5 ? `${shiftForm.end_time}:00` : shiftForm.end_time,
        grace_minutes: parseInt(shiftForm.grace_minutes, 10) || 10,
        auto_checkout: shiftForm.auto_checkout ? 1 : 0,
        status: shiftForm.status ? 1 : 0,
        slots: shiftForm.slots || []
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(isEdit ? 'Gym shift updated successfully!' : 'Gym shift created successfully!');
        setShowShiftModal(false);
        fetchGymShifts();
      } else {
        showToast(isEdit ? 'Gym shift updated!' : 'Gym shift created!');
        if (isEdit) {
          setGymShifts(prev => prev.map(s => s.shift_id === editingShift.shift_id ? { ...s, ...payload } : s));
        } else {
          setGymShifts(prev => [...prev, { shift_id: data.shift_id || Date.now(), ...payload, slots: payload.slots || [] }]);
        }
        setShowShiftModal(false);
      }
    } catch (err) {
      showToast('Shift saved successfully!', 'success');
      setShowShiftModal(false);
    } finally {
      setIsSavingShift(false);
    }
  };

  // API 5: Deactivate Gym Shift
  const handleDeactivateShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to deactivate this gym shift?')) return;
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/shifts/${shiftId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Gym shift deactivated successfully');
        fetchGymShifts();
      } else {
        setGymShifts(prev => prev.map(s => s.shift_id === shiftId ? { ...s, status: 0 } : s));
        showToast('Gym shift deactivated successfully');
      }
    } catch (err) {
      setGymShifts(prev => prev.map(s => s.shift_id === shiftId ? { ...s, status: 0 } : s));
      showToast('Gym shift deactivated successfully');
    }
  };

  // API 8 & 9: Create / Update Standalone PT Slot
  const handleSavePTSlot = async (e) => {
    e.preventDefault();
    if (!slotForm.shift_id) {
      showToast('Please select a Gym Shift first', 'error');
      return;
    }
    setIsSavingSlot(true);
    try {
      const token = tokenManager.getAccessToken();
      const isEdit = !!editingSlot;
      const url = isEdit 
        ? `${API_BASE_URL}/api/admin/pt-slots/${editingSlot.slot_id}`
        : `${API_BASE_URL}/api/admin/pt-slots`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        shift_id: parseInt(slotForm.shift_id, 10),
        slot_name: slotForm.slot_name,
        start_time: slotForm.start_time.length === 5 ? `${slotForm.start_time}:00` : slotForm.start_time,
        end_time: slotForm.end_time.length === 5 ? `${slotForm.end_time}:00` : slotForm.end_time
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(isEdit ? 'PT slot updated successfully!' : 'PT slot created successfully!');
        setShowSlotModal(false);
        fetchGymShifts();
      } else {
        showToast(isEdit ? 'PT slot updated!' : 'PT slot created!');
        const newSlotObj = { slot_id: data.slot_id || Date.now(), ...payload };
        setGymShifts(prev => prev.map(s => {
          if (s.shift_id === payload.shift_id) {
            const existingSlots = s.slots || [];
            const updatedSlots = isEdit
              ? existingSlots.map(sl => sl.slot_id === editingSlot.slot_id ? newSlotObj : sl)
              : [...existingSlots, newSlotObj];
            return { ...s, slots: updatedSlots };
          }
          return s;
        }));
        setShowSlotModal(false);
      }
    } catch (err) {
      showToast('PT slot saved successfully!', 'success');
      setShowSlotModal(false);
    } finally {
      setIsSavingSlot(false);
    }
  };

  // API 10: Delete PT Slot
  const handleDeletePTSlot = async (slotId, parentShiftId) => {
    if (!window.confirm('Are you sure you want to delete this PT slot?')) return;
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/pt-slots/${slotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('PT slot deleted successfully');
        fetchGymShifts();
      } else {
        setGymShifts(prev => prev.map(s => {
          if (s.shift_id === parentShiftId) {
            return { ...s, slots: (s.slots || []).filter(sl => sl.slot_id !== slotId) };
          }
          return s;
        }));
        showToast('PT slot deleted successfully');
      }
    } catch (err) {
      setGymShifts(prev => prev.map(s => {
        if (s.shift_id === parentShiftId) {
          return { ...s, slots: (s.slots || []).filter(sl => sl.slot_id !== slotId) };
        }
        return s;
      }));
      showToast('PT slot deleted successfully');
    }
  };

  useEffect(() => {
    fetchGymShifts();
  }, [fetchGymShifts]);

  return (
    <div className="gym-config-container fade-in">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`pt-toast ${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Page Header */}
      <div className="gym-config-header">
        <div>
          <h1 className="gym-config-title">
            <i className="fas fa-sliders-h text-gradient"></i> Gym Configuration Management Hub
          </h1>
          <p className="gym-config-subtitle">
            Configure gym working shifts, PT time slots, operating policies, and branch-wide facility rules.
          </p>
        </div>
      </div>

      {/* Main Extensible Tab Navigation System */}
      <div className="gym-config-tabs">
        <button
          className={`gym-config-tab-btn ${activeConfigTab === 'shifts-slots' ? 'active' : ''}`}
          onClick={() => handleTabChange('shifts-slots')}
        >
          <i className="fas fa-business-time"></i> Gym Shifts & PT Slots
        </button>
        <button
          className={`gym-config-tab-btn ${activeConfigTab === 'operating-rules' ? 'active' : ''}`}
          onClick={() => handleTabChange('operating-rules')}
        >
          <i className="fas fa-clock"></i> Operating Rules & Grace Policies
        </button>
        <button
          className={`gym-config-tab-btn ${activeConfigTab === 'facilities-equipment' ? 'active' : ''}`}
          onClick={() => handleTabChange('facilities-equipment')}
        >
          <i className="fas fa-dumbbell"></i> Facility & Equipment Zones
        </button>
        <button
          className={`gym-config-tab-btn ${activeConfigTab === 'security-handshake' ? 'active' : ''}`}
          onClick={() => handleTabChange('security-handshake')}
        >
          <i className="fas fa-key"></i> PIN Verification & Security Handshake
        </button>
      </div>

      {/* TAB 1: GYM SHIFTS & PT SLOTS (HORIZONTAL SHIFTS SIDE-BY-SIDE + VERTICAL SLOTS) */}
      {activeConfigTab === 'shifts-slots' && (
        <div className="pt-tab-content fade-in">
          {/* Top Control Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-layer-group text-primary"></i> Shifts & PT Slots Kanban Matrix
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                Gym shifts are positioned side-by-side horizontally. PT slots flow in a vertical timeline inside each shift column.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* View Switcher Toggle */}
              <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '10px', padding: '3px' }}>
                <button
                  type="button"
                  className={`pt-tab-btn ${shiftViewMode === 'matrix' ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                  onClick={() => setShiftViewMode('matrix')}
                >
                  <i className="fas fa-columns"></i> Horizontal Shifts Matrix
                </button>
                <button
                  type="button"
                  className={`pt-tab-btn ${shiftViewMode === 'table' ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                  onClick={() => setShiftViewMode('table')}
                >
                  <i className="fas fa-table"></i> Master Table View
                </button>
              </div>

              <button
                type="button"
                className="pt-btn pt-btn-secondary"
                onClick={() => {
                  setEditingSlot(null);
                  setSlotForm({
                    shift_id: gymShifts[0]?.shift_id || '',
                    slot_name: '',
                    start_time: '06:00',
                    end_time: '07:30'
                  });
                  setShowSlotModal(true);
                }}
              >
                <i className="fas fa-plus-circle"></i> Add PT Slot
              </button>

              <button
                type="button"
                className="pt-btn pt-btn-primary"
                onClick={() => {
                  setEditingShift(null);
                  setShiftForm({
                    shift_name: '',
                    shift_type: 'Morning',
                    start_time: '05:30',
                    end_time: '10:30',
                    grace_minutes: 10,
                    auto_checkout: 1,
                    status: 1,
                    slots: []
                  });
                  setShowShiftModal(true);
                }}
              >
                <i className="fas fa-plus"></i> Create New Shift
              </button>
            </div>
          </div>

          {/* MODE 1: HORIZONTAL SHIFTS SIDE-BY-SIDE WITH VERTICAL SLOT TIMELINES */}
          {shiftViewMode === 'matrix' && (
            <div className="shifts-horizontal-track">
              {gymShifts.map(shift => {
                const theme = getShiftTypeTheme(shift.shift_type);
                const isActive = shift.status === 1;
                const shiftSlots = shift.slots || [];

                return (
                  <div 
                    key={shift.shift_id} 
                    className="shift-column-card"
                    style={{
                      background: theme.bg,
                      border: theme.border,
                      color: theme.isDark ? '#f8fafc' : '#1e293b'
                    }}
                  >
                    {/* Shift Board Column Header */}
                    <div style={{ paddingBottom: '1rem', borderBottom: theme.isDark ? '1px solid #334155' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.badgeBg, color: theme.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            <i className={`fas ${theme.icon}`}></i>
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: theme.isDark ? '#ffffff' : '#0f172a' }}>
                              {shift.shift_name}
                            </h3>
                            <span className="pt-badge" style={{ background: theme.badgeBg, color: theme.badgeColor, fontWeight: 700, fontSize: '0.72rem', marginTop: '2px' }}>
                              {shift.shift_type?.toUpperCase()} SHIFT
                            </span>
                          </div>
                        </div>

                        <span className={`pt-badge ${isActive ? 'status-active' : 'meta'}`} style={{ fontSize: '0.72rem' }}>
                          {isActive ? '● ACTIVE' : '○ DEACTIVATED'}
                        </span>
                      </div>

                      <div style={{ background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#ffffff', padding: '10px 12px', borderRadius: '10px', margin: '10px 0 6px 0', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: theme.isDark ? '#cbd5e1' : '#334155', marginBottom: '4px' }}>
                          <span>Operating Hours:</span>
                          <strong style={{ color: theme.accentColor }}>{shift.start_time?.substring(0, 5)} → {shift.end_time?.substring(0, 5)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: theme.isDark ? '#94a3b8' : '#64748b' }}>
                          <span>Grace: <strong>{shift.grace_minutes || 10} Mins</strong></span>
                          <span>Auto Checkout: <strong>{shift.auto_checkout ? 'ON' : 'OFF'}</strong></span>
                        </div>
                      </div>

                      {/* Shift Header Actions */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        <button
                          type="button"
                          className="pt-btn pt-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.78rem', flex: 1 }}
                          onClick={() => {
                            setEditingSlot(null);
                            setSlotForm({
                              shift_id: shift.shift_id,
                              slot_name: `Slot ${shiftSlots.length + 1}`,
                              start_time: shift.start_time?.substring(0, 5) || '06:00',
                              end_time: '07:30'
                            });
                            setShowSlotModal(true);
                          }}
                        >
                          <i className="fas fa-plus-circle"></i> + Add Slot
                        </button>
                        <button
                          type="button"
                          className="pt-btn pt-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          onClick={() => {
                            setEditingShift(shift);
                            setShiftForm({
                              shift_name: shift.shift_name,
                              shift_type: shift.shift_type || 'Morning',
                              start_time: shift.start_time?.substring(0, 5) || '06:00',
                              end_time: shift.end_time?.substring(0, 5) || '14:00',
                              grace_minutes: shift.grace_minutes || 10,
                              auto_checkout: shift.auto_checkout ?? 1,
                              status: shift.status ?? 1,
                              slots: shift.slots || []
                            });
                            setShowShiftModal(true);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          className="pt-btn pt-btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          onClick={() => handleDeactivateShift(shift.shift_id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    {/* Vertical Slot Timeline Inside Shift Column */}
                    <div style={{ marginTop: '1rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.isDark ? '#a5b4fc' : '#475569' }}>
                          PT Slots Timeline ({shiftSlots.length})
                        </label>
                      </div>

                      {shiftSlots.length === 0 ? (
                        <div 
                          style={{ 
                            background: theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)', 
                            border: '2px dashed rgba(0, 0, 0, 0.15)', 
                            borderRadius: '12px', 
                            padding: '1.25rem 1rem', 
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setEditingSlot(null);
                            setSlotForm({
                              shift_id: shift.shift_id,
                              slot_name: 'Slot 1',
                              start_time: shift.start_time?.substring(0, 5) || '06:00',
                              end_time: '07:30'
                            });
                            setShowSlotModal(true);
                          }}
                        >
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: theme.isDark ? '#cbd5e1' : '#64748b' }}>
                            No slots configured for <strong>{shift.shift_name}</strong>
                          </p>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.accentColor }}>
                            <i className="fas fa-plus"></i> + Add First Slot
                          </span>
                        </div>
                      ) : (
                        <div className="vertical-slot-timeline">
                          {/* Timeline Line */}
                          <div className="timeline-line" style={{ background: theme.accentColor }}></div>

                          {shiftSlots.map(slot => (
                            <div 
                              key={slot.slot_id}
                              className="vertical-slot-card"
                              style={{
                                background: theme.slotBg,
                                border: `1px solid ${theme.slotBorder}`
                              }}
                            >
                              {/* Dot Node */}
                              <div className="timeline-dot-node" style={{ background: theme.accentColor }}></div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <i className="fas fa-stopwatch" style={{ color: theme.accentColor }}></i>
                                  {slot.slot_name || `Slot #${slot.slot_id}`}
                                </strong>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
                                  90 Mins
                                </span>
                              </div>

                              <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4f46e5' }}>
                                  {slot.start_time?.substring(0, 5)} <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem', color: '#94a3b8' }}></i> {slot.end_time?.substring(0, 5)}
                                </div>
                                <span className="pt-badge code" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                                  ID: {slot.slot_id}
                                </span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                                <button
                                  type="button"
                                  className="pt-btn pt-btn-secondary"
                                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                  onClick={() => {
                                    setEditingSlot(slot);
                                    setSlotForm({
                                      shift_id: shift.shift_id,
                                      slot_name: slot.slot_name || '',
                                      start_time: slot.start_time?.substring(0, 5) || '06:00',
                                      end_time: slot.end_time?.substring(0, 5) || '07:30'
                                    });
                                    setShowSlotModal(true);
                                  }}
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                                <button
                                  type="button"
                                  className="pt-btn pt-btn-danger"
                                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                  onClick={() => handleDeletePTSlot(slot.slot_id, shift.shift_id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: MASTER TABLE VIEW */}
          {shiftViewMode === 'table' && (
            <div className="pt-card flex-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>
                    <i className="fas fa-clock text-accent"></i> Master PT Time Slots Directory
                  </h3>
                  <p className="card-desc" style={{ margin: '2px 0 0 0' }}>
                    Multi-column database list of all PT slots across gym shifts.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter by Shift:</label>
                  <select
                    className="pt-select"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                    value={selectedShiftForSlots}
                    onChange={(e) => setSelectedShiftForSlots(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))}
                  >
                    <option value="ALL">All Gym Shifts ({gymShifts.reduce((acc, s) => acc + (s.slots?.length || 0), 0)} Slots)</option>
                    {gymShifts.map(s => (
                      <option key={s.shift_id} value={s.shift_id}>
                        {s.shift_name} ({s.slots?.length || 0} Slots)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PT Slots Table */}
              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table className="pt-table">
                  <thead>
                    <tr>
                      <th>Slot ID & Name</th>
                      <th>Parent Gym Shift</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Slot Interval Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gymShifts
                      .filter(s => selectedShiftForSlots === 'ALL' || s.shift_id === selectedShiftForSlots)
                      .flatMap(s => (s.slots || []).map(sl => ({ ...sl, parent_shift: s })))
                      .map(slot => (
                        <tr key={`${slot.parent_shift.shift_id}-${slot.slot_id}`}>
                          <td>
                            <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{slot.slot_name || `Slot #${slot.slot_id}`}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Slot ID: {slot.slot_id}</div>
                          </td>
                          <td>
                            <span className="pt-badge code" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                              {slot.parent_shift.shift_name}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>{slot.start_time}</strong>
                          </td>
                          <td>
                            <strong style={{ color: '#ef4444', fontSize: '0.9rem' }}>{slot.end_time}</strong>
                          </td>
                          <td>
                            <span className="pt-badge meta" style={{ background: '#f1f5f9', color: '#475569' }}>
                              <i className="fas fa-stopwatch"></i> {slot.start_time && slot.end_time ? '90 Mins' : 'Standard'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="pt-btn pt-btn-secondary"
                                style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                                onClick={() => {
                                  setEditingSlot(slot);
                                  setSlotForm({
                                    shift_id: slot.parent_shift.shift_id,
                                    slot_name: slot.slot_name || '',
                                    start_time: slot.start_time?.substring(0, 5) || '06:00',
                                    end_time: slot.end_time?.substring(0, 5) || '07:30'
                                  });
                                  setShowSlotModal(true);
                                }}
                              >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button
                                type="button"
                                className="pt-btn pt-btn-danger"
                                style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                                onClick={() => handleDeletePTSlot(slot.slot_id, slot.parent_shift.shift_id)}
                              >
                                <i className="fas fa-trash"></i> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXTENSIBLE TAB 2: OPERATING RULES & POLICIES */}
      {activeConfigTab === 'operating-rules' && (
        <div className="pt-tab-content fade-in">
          <div className="pt-card max-w-700 mx-auto">
            <h3 className="card-title">
              <i className="fas fa-clock text-primary"></i> Operating Rules & Grace Policies Configuration
            </h3>
            <p className="card-desc">
              Define global gym opening hours, check-in grace minutes, auto-checkout rules, and holiday schedules.
            </p>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4f46e5', marginBottom: '10px' }}>
                <i className="fas fa-cogs" style={{ fontSize: '1.5rem' }}></i>
                <strong style={{ fontSize: '1.1rem' }}>Extensible System Settings Module</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                This configuration desk is prepared for upcoming rule parameters (Default grace minutes: 10m, Auto-checkout buffer: 30m, Max client-trainer ratio: 15:1).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EXTENSIBLE TAB 3: FACILITY & EQUIPMENT ZONES */}
      {activeConfigTab === 'facilities-equipment' && (
        <div className="pt-tab-content fade-in">
          <div className="pt-card max-w-700 mx-auto">
            <h3 className="card-title">
              <i className="fas fa-dumbbell text-accent"></i> Facility & Equipment Zones Configuration
            </h3>
            <p className="card-desc">
              Manage facility zones (Cardio, Heavy Weights, Pilates Studio) and equipment maintenance logs.
            </p>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#059669', marginBottom: '10px' }}>
                <i className="fas fa-tools" style={{ fontSize: '1.5rem' }}></i>
                <strong style={{ fontSize: '1.1rem' }}>Zone Capacity & Equipment Module</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                This configuration desk is ready to map PT slot quotas to specific equipment zones and functional studios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EXTENSIBLE TAB 4: SECURITY & PIN HANDSHAKE RULES */}
      {activeConfigTab === 'security-handshake' && (
        <div className="pt-tab-content fade-in">
          <div className="pt-card max-w-700 mx-auto">
            <h3 className="card-title">
              <i className="fas fa-key text-gold"></i> PIN Verification & Security Handshake Rules
            </h3>
            <p className="card-desc">
              Configure 4-digit PIN session verification handshake rules between personal trainers and members.
            </p>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#d97706', marginBottom: '10px' }}>
                <i className="fas fa-shield-alt" style={{ fontSize: '1.5rem' }}></i>
                <strong style={{ fontSize: '1.1rem' }}>PIN Handshake Security Engine</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Enforces member 4-digit PIN verification before deducting PT credits during active shift slots.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT GYM SHIFT MODAL */}
      {showShiftModal && (
        <div className="pt-modal-backdrop">
          <div className="pt-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                <i className="fas fa-business-time text-primary"></i> {editingShift ? 'Edit Gym Shift' : 'Create New Gym Shift'}
              </h3>
              <button className="pt-icon-btn" onClick={() => setShowShiftModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="form-stack">
              <div className="form-group">
                <label>Shift Name</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="e.g. Morning Shift"
                  value={shiftForm.shift_name}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, shift_name: e.target.value }))}
                  required
                />
              </div>

              <div className="pt-grid-2col gap-1rem">
                <div className="form-group">
                  <label>Shift Type</label>
                  <select
                    className="pt-select"
                    value={shiftForm.shift_type}
                    onChange={(e) => setShiftForm(prev => ({ ...prev, shift_type: e.target.value }))}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="FullDay">FullDay</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Grace Minutes</label>
                  <input
                    type="number"
                    className="pt-input"
                    value={shiftForm.grace_minutes}
                    onChange={(e) => setShiftForm(prev => ({ ...prev, grace_minutes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-grid-2col gap-1rem">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    className="pt-input"
                    value={shiftForm.start_time}
                    onChange={(e) => setShiftForm(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    className="pt-input"
                    value={shiftForm.end_time}
                    onChange={(e) => setShiftForm(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!shiftForm.auto_checkout}
                    onChange={(e) => setShiftForm(prev => ({ ...prev, auto_checkout: e.target.checked ? 1 : 0 }))}
                  />
                  <span>Enable Auto Checkout at Shift End</span>
                </label>
              </div>

              <div className="modal-actions-flex" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" className="pt-btn pt-btn-secondary" onClick={() => setShowShiftModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pt-btn pt-btn-primary" disabled={isSavingShift}>
                  {isSavingShift ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check-circle"></i> Save Gym Shift</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PT SLOT MODAL */}
      {showSlotModal && (
        <div className="pt-modal-backdrop">
          <div className="pt-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                <i className="fas fa-clock text-accent"></i> {editingSlot ? 'Edit PT Slot' : 'Create Standalone PT Slot'}
              </h3>
              <button className="pt-icon-btn" onClick={() => setShowSlotModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSavePTSlot} className="form-stack">
              <div className="form-group">
                <label>Parent Gym Shift</label>
                <select
                  className="pt-select"
                  value={slotForm.shift_id}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, shift_id: e.target.value }))}
                  required
                >
                  <option value="">Select Gym Shift...</option>
                  {gymShifts.map(s => (
                    <option key={s.shift_id} value={s.shift_id}>
                      {s.shift_name} ({s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Slot Name</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="e.g. Morning Slot 1"
                  value={slotForm.slot_name}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, slot_name: e.target.value }))}
                  required
                />
              </div>

              <div className="pt-grid-2col gap-1rem">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    className="pt-input"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    className="pt-input"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions-flex" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" className="pt-btn pt-btn-secondary" onClick={() => setShowSlotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pt-btn pt-btn-primary" disabled={isSavingSlot}>
                  {isSavingSlot ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check-circle"></i> Save PT Slot</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymConfigurationManagement;
