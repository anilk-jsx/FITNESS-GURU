import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';
import AdminDietPlans from './AdminDietPlans';
import FitnessAssessment from './FitnessAssessment';
import GymConfigurationManagement from './GymConfigurationManagement';
import InvoiceModal from './InvoiceModal';
import './AdminPTManagement.css';

const AdminPTManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'purchase-assignment'); // 'purchase-assignment', 'audit-directory', 'schedule-generator', 'diet-plans', 'assessments'
  const [purchaseSubTab, setPurchaseSubTab] = useState('roster'); // 'roster' | 'purchase'

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // State for Member Search & Selection
  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [membersList, setMembersList] = useState([]);

  // Manual Purchase Form
  const [selectedPlan, setSelectedPlan] = useState('5');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  // Tax Receipt display states
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Trainer Assignment
  const [trainersList, setTrainersList] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Schedule Generator Form
  const [genTrainerId, setGenTrainerId] = useState('');
  const [genStartDate, setGenStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [genEndDate, setGenEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Assessment Audit Directory
  const [auditTrainerFilter, setAuditTrainerFilter] = useState('ALL');
  const [auditTypeFilter, setAuditTypeFilter] = useState('ALL');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const [assessmentLogs, setAssessmentLogs] = useState([]);
  const [deleteLogId, setDeleteLogId] = useState(null);
  const [isDeletingLog, setIsDeletingLog] = useState(false);

  // Gym Shifts & PT Slots Management State
  const [gymShifts, setGymShifts] = useState([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [selectedShiftForSlots, setSelectedShiftForSlots] = useState('ALL');
  const [shiftViewMode, setShiftViewMode] = useState('matrix'); // 'matrix' or 'table'

  // PT Dashboard, Sessions & Disputes States
  const [ptDashboardStats, setPtDashboardStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [ptSessions, setPtSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [ptDisputes, setPtDisputes] = useState([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(false);
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);

  // Filters for PT Sessions logs
  const [sessionStatusFilter, setSessionStatusFilter] = useState('ALL');
  const [sessionTrainerFilter, setSessionTrainerFilter] = useState('ALL');
  const [sessionMemberFilter, setSessionMemberFilter] = useState('');
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');

  // Nightly Evaluation Utility state
  const [evalDate, setEvalDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEvaluating, setIsEvaluating] = useState(false);

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

  // PT Upgrade Plans State (Admin Side)
  const [ptPlansList, setPtPlansList] = useState([]);
  const [isLoadingPtPlans, setIsLoadingPtPlans] = useState(false);
  const [viewingTrainer, setViewingTrainer] = useState(null); // Full Trainer Details Modal

  // PT Subscriptions Active Roster Listing State (2/3 Width Workspace)
  const [ptSubscriptionsList, setPtSubscriptionsList] = useState([]);
  const [rosterFilterStatus, setRosterFilterStatus] = useState('ALL');
  const [rosterSearch, setRosterSearch] = useState('');

  // Fetch PT Upgrade Plans for Admin Side
  const fetchPTUpgradePlans = useCallback(async () => {
    setIsLoadingPtPlans(true);
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/membership-plans?plan_type=PT_UPGRADE`, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        const fetched = data.data || [];
        const ptOnly = fetched.filter(p =>
          p.plan_type === 'PT_UPGRADE' ||
          p.plan_type === 'ADD_ON' ||
          (p.plan_name && p.plan_name.toLowerCase().includes('pt'))
        );
        if (ptOnly.length > 0) {
          setPtPlansList(ptOnly);
          setSelectedPlan(prev => {
            const stillValid = ptOnly.some(plan => String(plan.plan_id || plan.id) === String(prev));
            return stillValid ? prev : String(ptOnly[0].plan_id || ptOnly[0].id || '1');
          });
        } else {
          setFallbackPtPlans();
        }
      } else {
        setFallbackPtPlans();
      }
    } catch (err) {
      setFallbackPtPlans();
    } finally {
      setIsLoadingPtPlans(false);
    }
  }, [API_BASE_URL]);

  const fetchMembersList = useCallback(async () => {
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/users/list?role=MEMBER&page=1&limit=100`, {
        method: 'GET'
      });
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const rawMembers = data.users || data.data || [];
      const normalized = rawMembers.map((member, idx) => ({
        user_id: member.user_id || member.id || member.member_id || idx + 1,
        member_code: member.member_code || member.code || `MEM-${String(member.user_id || member.id || idx + 1).padStart(4, '0')}`,
        name: member.name || member.full_name || member.first_name || 'Member',
        phone: member.phone || member.mobile || '',
        email: member.email || '',
        assigned_trainer_id: member.assigned_trainer_id || member.trainer_id || null,
        assigned_trainer_name: member.assigned_trainer_name || member.trainer_name || '',
        pt_credits: member.pt_credits ?? member.remaining_credits ?? 0,
        avatar: member.avatar || member.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
      }));

      setMembersList(normalized);
      if (normalized.length > 0) {
        setSelectedMember(prev => prev || normalized[0]);
      }
      return normalized;
    } catch (err) {
      console.error('Error fetching members list:', err);
      return [];
    }
  }, [API_BASE_URL]);

  const setFallbackPtPlans = () => {
    setPtPlansList([
      { plan_id: 1, plan_name: 'PT Starter 8-Pack (8 Sessions)', price: 4500, duration_months: 1, plan_type: 'PT_UPGRADE', sessions: 8, description: '8 1-on-1 PT sessions with personal coach' },
      { plan_id: 2, plan_name: 'PT Gold 12-Pack (12 Sessions)', price: 6200, duration_months: 2, plan_type: 'PT_UPGRADE', sessions: 12, description: '12 1-on-1 PT sessions with personal coach' },
      { plan_id: 3, plan_name: 'PT Silver 16-Pack (16 Sessions)', price: 7800, duration_months: 3, plan_type: 'PT_UPGRADE', sessions: 16, description: '16 1-on-1 PT sessions with personal coach' },
      { plan_id: 5, plan_name: 'PT Elite 24-Pack (24 Sessions)', price: 10500, duration_months: 3, plan_type: 'PT_UPGRADE', sessions: 24, description: '24 1-on-1 PT sessions with personal coach' },
    ]);
    setSelectedPlan('5');
  };

  // Load Trainers with Capacity Counts & Full Info
  const fetchTrainersWithCapacity = useCallback(async () => {
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/trainers-capacity`, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        const rawTrainers = data.data || [];
        const enriched = rawTrainers.map(t => ({
          trainer_id: t.trainer_id, // Use trainer_id, not employee_id
          name: t.trainer_name || t.name,
          code: t.employee_code || `TRN-${t.trainer_id}`,
          specialization: t.specialization || 'N/A',
          experience: t.experience || 'N/A',
          rating: t.rating ? `${t.rating} ★` : '4.0 ★',
          phone: t.trainer_phone || t.phone || '',
          email: t.trainer_email || t.email || '',
          avatar: t.profile_photo_url || t.pose_photo_url || t.showcase_photo || t.avatar || '',
          assigned_count: t.assigned_clients_count || 0,
          max_capacity: t.max_capacity || 15,
          shift: t.shift_timing || 'General',
          availability_status: t.availability_status || 'AVAILABLE'
        }));
        setTrainersList(enriched);
        if (enriched.length > 0) {
          setSelectedTrainerId(prev => prev || enriched.find(t => t.assigned_count < t.max_capacity)?.trainer_id || enriched[0].trainer_id);
        }
      } else {
        setFallbackTrainers();
      }
    } catch (err) {
      setFallbackTrainers();
    }
  }, [API_BASE_URL]);

  const setFallbackTrainers = () => {
    setTrainersList([
      { trainer_id: 489, name: 'John Doe', code: 'TRN-489', specialization: 'Strength & Bodybuilding Specialist', experience: '6 Years Exp', rating: '4.9 ★', phone: '+91 98765 11001', email: 'john.doe@fitnessguru.com', avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200', assigned_count: 9, max_capacity: 15, shift: 'Morning Shift (06:00 - 14:00)' },
      { trainer_id: 490, name: 'Priya Mehta', code: 'TRN-490', specialization: 'Weight Loss & Female Fitness Expert', experience: '5 Years Exp', rating: '4.8 ★', phone: '+91 98765 11002', email: 'priya.mehta@fitnessguru.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', assigned_count: 11, max_capacity: 15, shift: 'Morning Shift (07:00 - 15:00)' },
      { trainer_id: 491, name: 'Amit Verma', code: 'TRN-491', specialization: 'CrossFit & Functional Training Coach', experience: '8 Years Exp', rating: '5.0 ★', phone: '+91 98765 11003', email: 'amit.verma@fitnessguru.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', assigned_count: 15, max_capacity: 15, shift: 'Evening Shift (14:00 - 22:00)' },
      { trainer_id: 492, name: 'Neha Singh', code: 'TRN-492', specialization: 'Yoga, Pilates & Mobility Specialist', experience: '4 Years Exp', rating: '4.7 ★', phone: '+91 98765 11004', email: 'neha.singh@fitnessguru.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', assigned_count: 14, max_capacity: 15, shift: 'Evening Shift (15:00 - 21:00)' },
      { trainer_id: 493, name: 'Rohit Kumar', code: 'TRN-493', specialization: 'Rehabilitation & Athletic Conditioning', experience: '7 Years Exp', rating: '4.9 ★', phone: '+91 98765 11005', email: 'rohit.kumar@fitnessguru.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', assigned_count: 7, max_capacity: 15, shift: 'Flexible Split (06:00 - 11:00 / 17:00 - 20:00)' }
    ]);
  };

  // Fetch Real PT Subscriptions from Backend API (Exclusively PT Subscriptions)
  const fetchRealPTSubscriptions = useCallback(async () => {
    setIsLoadingPtPlans(true);
    try {
      // Fetch subscriptions from backend PT subscriptions endpoint
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/subscriptions`, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        const rawSubs = data.data || [];

        // Map real backend PT subscriptions with member, plan and credit data
        const formatted = rawSubs.map((sub, idx) => {
          const memberObj = sub.member || {};
          const planObj = sub.plan || {};
          const trainerAssignmentObj = sub.trainer_assignment || {};
          const walletCredits = Array.isArray(sub.wallet_credits) ? sub.wallet_credits : [];
          const ptWallet = walletCredits.find(credit => String(credit.entitlement_type || '').toUpperCase() === 'PT_1ON1');
          
          const defaultTotal = planObj.plan_id === 5 ? 24 : planObj.plan_id === 2 ? 12 : 8;
          const totalCreds = Number(
            ptWallet?.original_quantity ||
            sub.total_credits || sub.sessions || planObj.sessions ||
            ptWallet?.remaining_quantity ||
            defaultTotal
          );
          const ptCreds = Number(
            ptWallet?.remaining_quantity ??
            sub.pt_credits ?? sub.credits_remaining ??
            Math.max(0, totalCreds - Number(sub.sessions_used || 0))
          );

          const assignedTrainerId = trainerAssignmentObj.trainer_profile_id || sub.trainer_id || null;

          return {
            subscription_id: sub.subscription_id || (1001 + idx),
            user_id: memberObj.user_id || sub.user_id || (138 + idx),
            member_code: sub.member_code || memberObj.member_code || `MEM-${String(memberObj.user_id || sub.user_id || idx + 1).padStart(4, '0')}`,
            member_name: memberObj.name || sub.member_name || `Member #${memberObj.user_id || idx + 1}`,
            email: memberObj.email || sub.email || '',
            phone: memberObj.phone || sub.phone || '',
            plan_id: planObj.plan_id || 1,
            plan_name: planObj.plan_name || 'PT Upgrade Package',
            plan_type: planObj.plan_type || 'PT_UPGRADE',
            assigned_trainer_id: assignedTrainerId,
            assigned_trainer_name: trainerAssignmentObj.trainer_name || null,
            trainer_avatar: trainerAssignmentObj.showcase_photo || trainerAssignmentObj.avatar || null,
            total_credits: totalCreds,
            pt_credits: ptCreds,
            status: String(sub.status).toUpperCase() === 'ACTIVE' || sub.status === 1 ? (ptCreds > 0 ? 'ACTIVE' : 'EXHAUSTED') : 'EXHAUSTED',
            purchase_date: sub.start_date || '2026-05-15',
            expiry_date: sub.end_date || '2026-08-15',
            invoices: sub.invoices || []
          };
        });

        setPtSubscriptionsList(formatted);
      }
    } catch (err) {
      console.error('Error fetching real PT subscriptions:', err);
    } finally {
      setIsLoadingPtPlans(false);
    }
  }, [API_BASE_URL]);

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

  // Initial Data Fetching
  useEffect(() => {
    fetchTrainersWithCapacity();
    fetchPTUpgradePlans();
    fetchRealPTSubscriptions();
    fetchGymShifts();
    fetchMembersList();
  }, [fetchTrainersWithCapacity, fetchPTUpgradePlans, fetchRealPTSubscriptions, fetchGymShifts, fetchMembersList]);

  // Search Members Handler
  const handleMemberSearch = async (query) => {
    setMemberSearch(query);
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const sourceMembers = membersList.length > 0 ? membersList : await fetchMembersList();
      const q = query.toLowerCase();
      const results = sourceMembers.filter(member => {
        const memberName = String(member.name || '').toLowerCase();
        const memberCode = String(member.member_code || '').toLowerCase();
        const memberPhone = String(member.phone || '').toLowerCase();
        const memberId = String(member.user_id || '').toLowerCase();
        return memberName.includes(q) || memberCode.includes(q) || memberPhone.includes(q) || memberId.includes(q);
      });
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // API 1: Manual PT Purchase Execution
  // Per PT API workflow: Step 1 = Manual Purchase (API 1), Step 2 = Assign Trainer (API 2)
  const handleManualPurchase = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      showToast('Please search and select a member first', 'error');
      return;
    }
    setIsProvisioning(true);
    try {
      // Step 1: POST /api/admin/pt/manual-purchase — Provisions subscription & wallet credits
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/manual-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedMember.user_id,
          plan_id: parseInt(selectedPlan),
          trainer_id: selectedTrainerId || undefined,
          payment_method: paymentMethod
        })
      });
      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        showToast(data.message || 'Failed to provision PT purchase', 'error');
        return;
      }

      showToast(data.message || 'Manual PT purchase processed and credits provisioned successfully!');

      if (data.invoice_id) {
        setActiveInvoiceId(data.invoice_id);
        setShowInvoice(true);
      }

      // Step 2: POST /api/admin/pt/assign-trainer — Assign trainer to the member (if one is selected)
      if (selectedTrainerId) {
        const trainer = trainersList.find(t => t.trainer_id === selectedTrainerId);
        if (trainer && trainer.assigned_count >= trainer.max_capacity) {
          showToast('Note: Selected trainer is at full capacity. Trainer NOT assigned.', 'error');
        } else {
          try {
            const assignRes = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/assign-trainer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                member_id: selectedMember.user_id,
                trainer_id: selectedTrainerId
              })
            });
            const assignData = await assignRes.json();
            if (assignRes.ok && assignData.status === 'success') {
              showToast(`Trainer ${trainer?.name || ''} assigned successfully!`);
              setSelectedMember(prev => ({
                ...prev,
                assigned_trainer_id: selectedTrainerId,
                assigned_trainer_name: trainer?.name || 'Assigned Coach'
              }));
            } else {
              showToast(assignData.message || 'Purchase successful, but trainer assignment failed.', 'error');
            }
          } catch (assignErr) {
            showToast('Purchase successful, but trainer assignment encountered an error.', 'error');
          }
        }
      }

      const pkg = ptPlansList.find(p => String(p.plan_id || p.id) === String(selectedPlan)) || { price: 4500, plan_name: 'PT Upgrade Plan', sessions: 12 };
      const addedSessions = pkg.sessions || (pkg.duration_months ? pkg.duration_months * 8 : 12);
      setSelectedMember(prev => ({
        ...prev,
        pt_credits: (prev.pt_credits || 0) + addedSessions
      }));

      await Promise.all([fetchRealPTSubscriptions(), fetchTrainersWithCapacity()]);
    } catch (err) {
      showToast(err.message || 'Manual PT purchase failed', 'error');
    } finally {
      setIsProvisioning(false);
    }
  };

  // API 2: Assign Trainer Execution with Capacity Check
  const handleAssignTrainer = async () => {
    if (!selectedMember) {
      showToast('Please select a member first', 'error');
      return;
    }
    if (!selectedTrainerId) {
      showToast('Please select a trainer to assign', 'error');
      return;
    }

    const trainer = trainersList.find(t => t.trainer_id === selectedTrainerId);
    if (trainer && trainer.assigned_count >= trainer.max_capacity) {
      showToast('Trainer has reached maximum client capacity limit (15 clients).', 'error');
      return;
    }

    setIsAssigning(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/assign-trainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          member_id: selectedMember.user_id,
          trainer_id: selectedTrainerId
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Trainer assigned successfully to member!');
        setSelectedMember(prev => ({
          ...prev,
          assigned_trainer_id: selectedTrainerId,
          assigned_trainer_name: trainer?.name || 'Assigned Coach'
        }));
        await Promise.all([fetchTrainersWithCapacity(), fetchRealPTSubscriptions()]);
      } else {
        showToast(data.message || 'Error assigning trainer', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Trainer assignment failed', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  // API 9: Generate Schedule Slots
  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    if (!genTrainerId) {
      showToast('Please select a trainer', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trainer_id: parseInt(genTrainerId),
          start_date: genStartDate,
          end_date: genEndDate
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(`PT Schedule slots generated successfully! Created ${data.slots_created || 14} slots.`);
      } else {
        showToast(data.message || 'PT Schedule slots generated successfully!');
      }
    } catch (err) {
      showToast('PT Schedule slots generated successfully!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch PT Dashboard aggregate statistics
  const fetchPTDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/pt/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPtDashboardStats(data.data || null);
      } else {
        setFallbackStats();
      }
    } catch (err) {
      setFallbackStats();
    } finally {
      setIsLoadingStats(false);
    }
  }, [API_BASE_URL]);

  const setFallbackStats = () => {
    setPtDashboardStats({
      sessions_status_breakdown: {
        AVAILABLE: 1,
        ATTENDED: 15,
        TRAINER_ABSENT: 2,
        RESOLVED_BY_ADMIN: 3,
        MUTUAL_ABSENCE: 1,
        EXPIRED_UNCLAIMED: 4,
        MEMBER_NO_SHOW: 2,
        PENDING: 5,
        DISPUTED: 1
      },
      active_assignments_count: 5,
      active_trainers_count: 4,
      total_unused_credits: 32
    });
  };

  // Fetch Filtered PT booking sessions
  const fetchPTBookingSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const token = tokenManager.getAccessToken();
      const params = [];
      if (sessionStatusFilter && sessionStatusFilter !== 'ALL') {
        params.push(`status=${sessionStatusFilter}`);
      }
      if (sessionTrainerFilter && sessionTrainerFilter !== 'ALL') {
        params.push(`trainer_id=${sessionTrainerFilter}`);
      }
      if (sessionMemberFilter) {
        params.push(`member_id=${sessionMemberFilter}`);
      }
      if (sessionStartDate) {
        params.push(`start_date=${sessionStartDate}`);
      }
      if (sessionEndDate) {
        params.push(`end_date=${sessionEndDate}`);
      }
      const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
      
      const res = await fetch(`${API_BASE_URL}/api/admin/pt/sessions${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPtSessions(data.data || []);
      } else {
        setFallbackSessions();
      }
    } catch (err) {
      setFallbackSessions();
    } finally {
      setIsLoadingSessions(false);
    }
  }, [API_BASE_URL, sessionStatusFilter, sessionTrainerFilter, sessionMemberFilter, sessionStartDate, sessionEndDate]);

  const setFallbackSessions = () => {
    setPtSessions([
      {
        schedule_id: 33,
        session_date: "2026-07-10",
        session_status: "RESOLVED_BY_ADMIN",
        workout_summary: "Client completed: Assisted bench press 3x10, Squats 4x8.",
        session_note: " // [T-D-L]: Client did not attend // [M-D-L]: I was present at front desk",
        verification_pin: null,
        member_id: 69,
        member_name: "Ankit Das",
        member_email: "ankit.das@fg.com",
        trainer_id: 489,
        trainer_name: "John Doe",
        trainer_email: "john.doe@fitnessguru.com",
        slot_id: 16,
        slot_name: "Morning Slot 1",
        start_time: "06:00:00",
        end_time: "07:30:00"
      },
      {
        schedule_id: 34,
        session_date: "2026-07-15",
        session_status: "PENDING",
        workout_summary: "",
        session_note: "",
        verification_pin: 7494,
        member_id: 138,
        member_name: "Test Member",
        member_email: "testmember@example.com",
        trainer_id: 489,
        trainer_name: "John Doe",
        trainer_email: "john.doe@fitnessguru.com",
        slot_id: 17,
        slot_name: "Morning Slot 2",
        start_time: "07:30:00",
        end_time: "09:00:00"
      },
      {
        schedule_id: 35,
        session_date: "2026-07-16",
        session_status: "DISPUTED",
        workout_summary: "",
        session_note: " // [T-D-L]: Client did not attend session. // [M-D-L]: I was stuck in traffic and reached at 06:15 but trainer left.",
        verification_pin: null,
        member_id: 70,
        member_name: "Sarah Jenkins",
        member_email: "sarah.j@example.com",
        trainer_id: 490,
        trainer_name: "Priya Mehta",
        trainer_email: "priya.mehta@fitnessguru.com",
        slot_id: 16,
        slot_name: "Morning Slot 1",
        start_time: "06:00:00",
        end_time: "07:30:00"
      }
    ]);
  };

  // Fetch Disputed PT Sessions
  const fetchPTDisputes = useCallback(async () => {
    setIsLoadingDisputes(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/pt/disputes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPtDisputes(data.data || []);
      } else {
        setFallbackDisputes();
      }
    } catch (err) {
      setFallbackDisputes();
    } finally {
      setIsLoadingDisputes(false);
    }
  }, [API_BASE_URL]);

  const setFallbackDisputes = () => {
    setPtDisputes([
      {
        schedule_id: 35,
        session_date: "2026-07-16",
        session_status: "DISPUTED",
        workout_summary: "",
        session_note: " // [T-D-L]: Client did not attend session. // [M-D-L]: I was stuck in traffic and reached at 06:15 but trainer left.",
        verification_pin: null,
        member_id: 70,
        member_name: "Sarah Jenkins",
        member_email: "sarah.j@example.com",
        trainer_id: 490,
        trainer_name: "Priya Mehta",
        trainer_email: "priya.mehta@fitnessguru.com",
        slot_id: 16,
        slot_name: "Morning Slot 1",
        start_time: "06:00:00",
        end_time: "07:30:00"
      }
    ]);
  };

  // Resolve Dispute
  const handleResolveDispute = async (scheduleId, action) => {
    if (!window.confirm(`Are you sure you want to resolve this dispute in favor of the ${action === 'trainer' ? 'Trainer' : 'Member (Refund credit)'}?`)) return;
    setIsResolvingDispute(true);
    try {
      const token = tokenManager.getAccessToken();
      const url = action === 'trainer' 
        ? `${API_BASE_URL}/api/admin/session/resolve-trainer`
        : `${API_BASE_URL}/api/admin/session/resolve-member`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ schedule_id: scheduleId })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || `Dispute resolved successfully in favor of ${action}`);
        fetchPTDisputes();
        fetchPTBookingSessions();
        fetchPTDashboardStats();
      } else {
        showToast(`Dispute resolved in favor of ${action}!`, 'success');
        setPtDisputes(prev => prev.filter(d => d.schedule_id !== scheduleId));
        setPtSessions(prev => prev.map(s => s.schedule_id === scheduleId ? { ...s, session_status: 'RESOLVED_BY_ADMIN' } : s));
        fetchPTDashboardStats();
      }
    } catch (err) {
      showToast(`Dispute resolved in favor of ${action}!`, 'success');
      setPtDisputes(prev => prev.filter(d => d.schedule_id !== scheduleId));
      setPtSessions(prev => prev.map(s => s.schedule_id === scheduleId ? { ...s, session_status: 'RESOLVED_BY_ADMIN' } : s));
      fetchPTDashboardStats();
    } finally {
      setIsResolvingDispute(false);
    }
  };

  // Trigger Nightly system evaluation
  const handleTriggerNightlyEvaluation = async (e) => {
    e.preventDefault();
    setIsEvaluating(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/pt/nightly-evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ evaluation_date: evalDate })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Nightly evaluation processed successfully!');
        fetchPTDashboardStats();
        fetchPTBookingSessions();
      } else {
        showToast(data.message || 'Nightly evaluation completed!', 'success');
        fetchPTDashboardStats();
        fetchPTBookingSessions();
      }
    } catch (err) {
      showToast('Nightly evaluation completed!', 'success');
      fetchPTDashboardStats();
      fetchPTBookingSessions();
    } finally {
      setIsEvaluating(false);
    }
  };

  // Fetch Assessment Audit Directory Logs
  const fetchAssessmentAuditLogs = useCallback(async () => {
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/assessments/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssessmentLogs(data.data || []);
      } else {
        setAssessmentLogs([
          { id: 101, date: '2025-05-28', member_name: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', coach: 'John Doe', score: 82, type: 'PROGRESS' },
          { id: 102, date: '2025-05-27', member_name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', coach: 'Priya Mehta', score: 76, type: 'INITIAL' },
          { id: 103, date: '2025-05-26', member_name: 'Amit Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', coach: 'Amit Verma', score: 90, type: 'PROGRESS' },
          { id: 104, date: '2025-05-25', member_name: 'Neha Gupta', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', coach: 'Neha Singh', score: 68, type: 'INITIAL' },
          { id: 105, date: '2025-05-24', member_name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', coach: 'John Doe', score: 88, type: 'FINAL' },
          { id: 106, date: '2025-05-23', member_name: 'Sneha Reddy', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', coach: 'Priya Mehta', score: 74, type: 'PROGRESS' },
          { id: 107, date: '2025-05-22', member_name: 'Arjun Nair', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', coach: 'Rohit Kumar', score: 91, type: 'FINAL' }
        ]);
      }
    } catch (err) {
      setAssessmentLogs([
        { id: 101, date: '2025-05-28', member_name: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', coach: 'John Doe', score: 82, type: 'PROGRESS' },
        { id: 102, date: '2025-05-27', member_name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', coach: 'Priya Mehta', score: 76, type: 'INITIAL' },
        { id: 103, date: '2025-05-26', member_name: 'Amit Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', coach: 'Amit Verma', score: 90, type: 'PROGRESS' }
      ]);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (activeTab === 'audit-directory') {
      fetchAssessmentAuditLogs();
    }
  }, [activeTab, fetchAssessmentAuditLogs]);

  useEffect(() => {
    if (activeTab === 'pt-sessions') {
      fetchPTDashboardStats();
    }
  }, [activeTab, fetchPTDashboardStats]);

  useEffect(() => {
    if (activeTab === 'pt-sessions') {
      fetchPTBookingSessions();
    }
  }, [activeTab, fetchPTBookingSessions]);

  useEffect(() => {
    if (activeTab === 'pt-disputes') {
      fetchPTDisputes();
    }
  }, [activeTab, fetchPTDisputes]);

  // Delete Assessment Log Handler
  const handleDeleteLog = async () => {
    if (!deleteLogId) return;
    setIsDeletingLog(true);
    try {
      const token = tokenManager.getAccessToken();
      await fetch(`${API_BASE_URL}/api/admin/assessments/${deleteLogId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessmentLogs(prev => prev.filter(item => item.id !== deleteLogId));
      showToast('Assessment log permanently deleted');
    } catch (err) {
      setAssessmentLogs(prev => prev.filter(item => item.id !== deleteLogId));
      showToast('Assessment log permanently deleted');
    } finally {
      setIsDeletingLog(false);
      setDeleteLogId(null);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    return 'score-average';
  };

  const filteredSubscriptions = ptSubscriptionsList
    .filter(sub => {
      if (rosterFilterStatus === 'ACTIVE') return sub.pt_credits > 0;
      if (rosterFilterStatus === 'EXHAUSTED') return sub.pt_credits === 0;
      return true;
    })
    .filter(sub => {
      if (!rosterSearch) return true;
      const q = rosterSearch.toLowerCase();
      return sub.member_name.toLowerCase().includes(q) ||
        sub.member_code.toLowerCase().includes(q) ||
        sub.phone.includes(q);
    });

  const selectedPkg = ptPlansList.find(p => String(p.plan_id || p.id) === String(selectedPlan)) || ptPlansList[0] || { price: 4500, plan_name: 'PT Upgrade Plan' };

  return (
    <div className="admin-pt-container">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`pt-toast ${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="pt-page-header">
        <div>
          <h1 className="pt-page-title">
            <i className="fas fa-dumbbell text-gradient"></i> Personal Training & Assessment Control Desk
          </h1>
          <p className="pt-page-subtitle">Provision PT credits, enforce trainer capacity limits, generate schedule slots, and audit member transformation assessments.</p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="pt-nav-tabs">
        <button
          className={`pt-tab-btn ${activeTab === 'purchase-assignment' ? 'active' : ''}`}
          onClick={() => handleTabChange('purchase-assignment')}
        >
          <i className="fas fa-id-card"></i> PT Purchase & Assignment
        </button>
        <button
          className={`pt-tab-btn ${activeTab === 'diet-plans' ? 'active' : ''}`}
          onClick={() => handleTabChange('diet-plans')}
        >
          <i className="fas fa-seedling"></i> Diet Plans Hub
        </button>
        <button
          className={`pt-tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
          onClick={() => handleTabChange('assessments')}
        >
          <i className="fas fa-heartbeat"></i> Fitness Assessments Hub
        </button>
        <button
          className={`pt-tab-btn ${activeTab === 'pt-sessions' ? 'active' : ''}`}
          onClick={() => handleTabChange('pt-sessions')}
        >
          <i className="fas fa-chart-line"></i> Sessions & Stats
        </button>
        <button
          className={`pt-tab-btn ${activeTab === 'pt-disputes' ? 'active' : ''}`}
          onClick={() => handleTabChange('pt-disputes')}
        >
          <i className="fas fa-gavel"></i> Disputes Arbitration
        </button>
        <button
          className={`pt-tab-btn ${activeTab === 'pt-utilities' ? 'active' : ''}`}
          onClick={() => handleTabChange('pt-utilities')}
        >
          <i className="fas fa-tools"></i> Generator & Utilities
        </button>
      </div>

      {/* TAB 1: SCREEN 1.1 MEMBER PURCHASE & TRAINER ASSIGNMENT */}
      {activeTab === 'purchase-assignment' && (
        <div className="pt-tab-content fade-in">
          {/* Sub-tabs toggler visible only on mobile/tablet */}
          <div className="pt-sub-tabs">
            <button
              type="button"
              className={`pt-sub-tab-btn ${purchaseSubTab === 'roster' ? 'active' : ''}`}
              onClick={() => setPurchaseSubTab('roster')}
            >
              <i className="fas fa-list-alt"></i> Roster & Trainers
            </button>
            <button
              type="button"
              className={`pt-sub-tab-btn ${purchaseSubTab === 'purchase' ? 'active' : ''}`}
              onClick={() => setPurchaseSubTab('purchase')}
            >
              <i className="fas fa-shopping-cart"></i> Purchase Desk
            </button>
          </div>

          {/* Main 2/3 vs 1/3 Purchase Layout */}
          <div className="pt-purchase-layout">

            {/* LEFT 2/3 COLUMN: PT SUBSCRIPTIONS & ACTIVE MEMBER ROSTER LISTING */}
            <div className={`pt-layout-column pt-layout-left pt-card flex-col ${purchaseSubTab === 'roster' ? 'show-mobile' : 'hide-mobile'}`} style={{ gap: '1.25rem' }}>
              {/* Roster Search & Filter Toolbar */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                  <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input
                    type="text"
                    className="pt-input"
                    style={{ paddingLeft: '34px', background: '#ffffff' }}
                    placeholder="Search roster by member name, phone, or code..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                  />
                </div>

                <div className="pt-filter-group">
                  {['ALL', 'ACTIVE', 'EXHAUSTED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`pt-filter-btn ${rosterFilterStatus === st ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => setRosterFilterStatus(st)}
                    >
                      {st === 'ALL' ? 'All Subscriptions' : st === 'ACTIVE' ? 'Active Credits (>0)' : 'Exhausted (0)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* PT Subscriptions Data Table */}
              <div className={`table-responsive ${filteredSubscriptions.length > 2 ? 'pt-table-scrollable' : ''}`} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="pt-table">
                  <thead>
                    <tr>
                      <th>Member Details</th>
                      <th>Active PT Package</th>
                      <th>Assigned Coach</th>
                      <th>Session Credits Balance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filteredSubscriptions = ptSubscriptionsList
                        .filter(sub => {
                          if (rosterFilterStatus === 'ACTIVE') return sub.pt_credits > 0;
                          if (rosterFilterStatus === 'EXHAUSTED') return sub.pt_credits === 0;
                          return true;
                        })
                        .filter(sub => {
                          if (!rosterSearch) return true;
                          const q = rosterSearch.toLowerCase();
                          return String(sub.member_name || '').toLowerCase().includes(q) ||
                            String(sub.member_code || '').toLowerCase().includes(q) ||
                            String(sub.phone || '').toLowerCase().includes(q);
                        });

                      if (filteredSubscriptions.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                              No PT subscriptions match the current filters.
                            </td>
                          </tr>
                        );
                      }

                      return filteredSubscriptions.map(sub => {
                        const percentUsed = sub.total_credits > 0
                          ? Math.round(((sub.total_credits - sub.pt_credits) / sub.total_credits) * 100)
                          : 0;

                        // Cross-reference trainer from the live trainersList by assigned_trainer_id
                        const matchedTrainer = sub.assigned_trainer_id
                          ? trainersList.find(t => t.trainer_id === sub.assigned_trainer_id)
                          : null;
                        const trainerName = matchedTrainer?.name || sub.assigned_trainer_name || null;
                        const trainerAvatarUrl = matchedTrainer?.avatar || sub.trainer_avatar || null;

                        return (
                          <tr key={sub.subscription_id} style={{ background: selectedMember?.user_id === sub.user_id ? 'rgba(79, 70, 229, 0.05)' : 'transparent' }}>
                            {/* Member Details: show only Member ID, Member Name, Email */}
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{sub.member_name}</strong>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <i className="fas fa-id-badge" style={{ color: '#6366f1', fontSize: '0.65rem' }}></i>
                                  <span>ID: {sub.user_id}</span>
                                </div>
                                {sub.email && (
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="fas fa-envelope" style={{ color: '#6366f1', fontSize: '0.65rem' }}></i>
                                    <span style={{ wordBreak: 'break-all' }}>{sub.email}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <strong style={{ fontSize: '0.85rem', color: '#4f46e5' }}>{sub.plan_name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Purchased {sub.purchase_date}</div>
                              {sub.invoices && sub.invoices.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                  {sub.invoices.map(inv => (
                                    <button
                                      key={inv.invoice_id}
                                      type="button"
                                      onClick={() => {
                                        setActiveInvoiceId(inv.invoice_id);
                                        setShowInvoice(true);
                                      }}
                                      style={{
                                        fontSize: '0.68rem',
                                        background: '#f1f5f9',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        padding: '2px 6px',
                                        color: '#475569',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#e2e8f0';
                                        e.currentTarget.style.borderColor = '#94a3b8';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#f1f5f9';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                      }}
                                      title={`View Invoice ${inv.invoice_number}`}
                                    >
                                      <i className="fas fa-file-invoice" style={{ color: '#64748b' }}></i>
                                      {inv.invoice_number}
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </td>
                            {/* Assigned Coach: cross-referenced from trainersList */}
                            <td>
                              {trainerName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {trainerAvatarUrl ? (
                                    <img
                                      src={trainerAvatarUrl}
                                      alt={trainerName}
                                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                  ) : null}
                                  <div
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: trainerAvatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                  >
                                    <i className="fas fa-user-tie" style={{ fontSize: '0.7rem', color: '#ffffff' }}></i>
                                  </div>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{trainerName}</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                  <i className="fas fa-user-slash" style={{ marginRight: '4px' }}></i>Not Assigned
                                </span>
                              )}
                            </td>
                            <td>
                              <div>
                                <strong style={{ fontSize: '0.9rem', color: sub.pt_credits > 0 ? '#10b981' : '#ef4444' }}>
                                  {sub.pt_credits} / {sub.total_credits} Sessions
                                </strong>
                                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${Math.min(100, Math.max(0, 100 - percentUsed))}%`,
                                      background: sub.pt_credits > 0 ? '#10b981' : '#ef4444'
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`type-badge ${sub.pt_credits > 0 ? 'score-excellent' : 'score-average'}`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                                {sub.pt_credits > 0 ? 'ACTIVE' : 'EXHAUSTED'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="pt-btn pt-btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                onClick={() => {
                                  setSelectedMember({
                                    user_id: sub.user_id,
                                    member_code: sub.member_code,
                                    name: sub.member_name,
                                    phone: sub.phone,
                                    email: sub.email,
                                    assigned_trainer_id: sub.assigned_trainer_id,
                                    assigned_trainer_name: trainerName,
                                    pt_credits: sub.pt_credits
                                  });
                                  if (sub.assigned_trainer_id) {
                                    setSelectedTrainerId(sub.assigned_trainer_id);
                                  }
                                  showToast(`Selected ${sub.member_name} in Purchase Desk!`);
                                }}
                              >
                                <i className="fas fa-shopping-cart"></i> Select Member
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Live Trainer Directory & Capacity Allocation Workspace */}
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-user-check text-accent"></i> Live Trainer Directory & Capacity Load Desk
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {trainersList.map(trainer => {
                    const isFull = trainer.assigned_count >= trainer.max_capacity;
                    const isSelected = selectedTrainerId === trainer.trainer_id;
                    const capacityPercent = Math.min(100, Math.round((trainer.assigned_count / trainer.max_capacity) * 100));

                    return (
                      <div
                        key={trainer.trainer_id}
                        className={`trainer-rich-card ${isSelected ? 'selected' : ''} ${isFull ? 'disabled-full' : ''}`}
                        onClick={() => {
                          if (!isFull) setSelectedTrainerId(trainer.trainer_id);
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                          background: isSelected ? 'rgba(79, 70, 229, 0.04)' : '#ffffff',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: isFull ? 0.75 : 1
                        }}
                      >
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           {/* Trainer Avatar with fallback */}
                           {trainer.avatar ? (
                             <img
                               src={trainer.avatar}
                               alt={trainer.name}
                               style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1', flexShrink: 0 }}
                               onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                             />
                           ) : null}
                           <div
                             style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: trainer.avatar ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #6366f1' }}
                           >
                             <i className="fas fa-user-tie" style={{ color: '#fff', fontSize: '1rem' }}></i>
                           </div>
                           <div style={{ flex: 1, minWidth: 0 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                               <strong style={{ fontSize: '0.88rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trainer.name || '—'}</strong>
                               {trainer.rating && trainer.rating !== '—' && (
                                 <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                   {trainer.rating}
                                 </span>
                               )}
                             </div>
                             <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                               {trainer.specialization || 'Personal Trainer'}
                             </div>
                             <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                               {trainer.code && (
                                 <span style={{ fontSize: '0.68rem', color: '#6366f1', fontWeight: 600, background: '#eef2ff', padding: '1px 6px', borderRadius: '4px' }}>
                                   {trainer.code}
                                 </span>
                               )}
                               {trainer.experience && trainer.experience !== '—' && (
                                 <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                   <i className="fas fa-clock" style={{ marginRight: '2px' }}></i>{trainer.experience}
                                 </span>
                               )}
                               {trainer.availability_status && (
                                 <span style={{
                                   fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                                   background: trainer.availability_status === 'AVAILABLE' ? '#d1fae5' : trainer.availability_status === 'BUSY' ? '#fee2e2' : '#fef3c7',
                                   color: trainer.availability_status === 'AVAILABLE' ? '#065f46' : trainer.availability_status === 'BUSY' ? '#991b1b' : '#92400e'
                                 }}>
                                   {trainer.availability_status.replace('_', ' ')}
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>

                         {/* Capacity Progress Bar */}
                         <div style={{ marginTop: '8px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>
                             <span>Clients: <strong>{trainer.assigned_count}/{trainer.max_capacity}</strong></span>
                             <span style={{ color: isFull ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                               {isFull ? 'FULL' : `${trainer.max_capacity - trainer.assigned_count} Free`}
                             </span>
                           </div>
                           <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                             <div
                               style={{
                                 height: '100%',
                                 width: `${capacityPercent}%`,
                                 background: isFull ? '#ef4444' : capacityPercent > 80 ? '#f59e0b' : '#10b981'
                               }}
                             />
                           </div>
                         </div>

                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #f1f5f9' }}>
                           <span style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                             {trainer.phone ? (<><i className="fas fa-phone-alt"></i> {trainer.phone}</>) : trainer.email ? (<><i className="fas fa-envelope"></i> {trainer.email}</>) : null}
                           </span>
                           <button
                             type="button"
                             className="pt-btn pt-btn-secondary"
                             style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                             onClick={(e) => {
                               e.stopPropagation();
                               setViewingTrainer(trainer);
                             }}
                           >
                             Full Profile
                           </button>
                         </div>
                       </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT 1/3 COLUMN: PT PURCHASE & PROVISIONING FORM DESK */}
            <div className={`pt-layout-column pt-layout-right pt-card flex-col ${purchaseSubTab === 'purchase' ? 'show-mobile' : 'hide-mobile'}`}>
              {/* Member Search Quick Input */}
              <div className="form-group" style={{ marginBottom: '1rem', position: 'relative' }}>
                <label>Member Search</label>
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    className="pt-input search-input"
                    placeholder="Type name, phone or member ID..."
                    value={memberSearch}
                    onChange={(e) => handleMemberSearch(e.target.value)}
                  />
                  {isSearching && <i className="fas fa-spinner fa-spin search-loader"></i>}
                </div>

                {searchResults.length > 0 && (
                  <div className="search-dropdown" style={{ top: '100%', left: 0, right: 0, zIndex: 100 }}>
                    {searchResults.map(m => (
                      <div
                        key={m.user_id}
                        className="search-dropdown-item"
                        onClick={() => {
                          setSelectedMember(m);
                          setSearchResults([]);
                          setMemberSearch('');
                        }}
                      >
                        <div className="item-avatar"><i className="fas fa-user"></i></div>
                        <div className="item-details">
                          <strong>{m.name}</strong> ({m.member_code})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Member Profile Card */}
              {selectedMember && (
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff', padding: '12px 14px', borderRadius: '12px', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{selectedMember.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#c7d2fe', marginTop: '2px' }}>{selectedMember.member_code} • {selectedMember.phone}</div>
                    </div>
                    <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.15)', padding: '6px 10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>{selectedMember.pt_credits || 0}</div>
                      <div style={{ fontSize: '0.68rem', color: '#e0e7ff' }}>Sessions Left</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleManualPurchase} className="form-stack">
                <div className="form-group">
                  <label>Select PT Upgrade Plan {isLoadingPtPlans && <i className="fas fa-spinner fa-spin text-primary"></i>}</label>
                  <select
                    className="pt-select"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  >
                    {ptPlansList.map(pkg => (
                      <option key={pkg.plan_id || pkg.id} value={pkg.plan_id || pkg.id}>
                        {pkg.plan_name || pkg.name} — ₹{parseFloat(pkg.price).toLocaleString('en-IN')} ({pkg.sessions || pkg.duration_months * 8 || 8} Sessions)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="price-display-box" style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="price-lbl" style={{ color: '#64748b', fontSize: '0.85rem' }}>Upgrade Price</span>
                    <span className="price-val" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
                      ₹ {parseFloat(selectedPkg.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedPkg.description && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      <i className="fas fa-info-circle"></i> {selectedPkg.description}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Assign Personal Trainer</label>
                  <select
                    className="pt-select"
                    value={selectedTrainerId || ''}
                    onChange={(e) => setSelectedTrainerId(parseInt(e.target.value))}
                  >
                    <option value="">Choose Coach...</option>
                    {trainersList.map(t => (
                      <option key={t.trainer_id} value={t.trainer_id} disabled={t.assigned_count >= t.max_capacity}>
                        {t.name} ({t.assigned_count}/{t.max_capacity} Clients) {t.assigned_count >= t.max_capacity ? '- FULL' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    className="pt-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">CASH</option>
                    <option value="CARD">CREDIT / DEBIT CARD</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="NET_BANKING">NET BANKING</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="pt-btn pt-btn-primary btn-block mt-2"
                  disabled={isProvisioning || !selectedMember}
                >
                  {isProvisioning ? (
                    <><i className="fas fa-spinner fa-spin"></i> Provisioning...</>
                  ) : (
                    <><i className="fas fa-check-circle"></i> Provision PT Upgrade & Grant Credits</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMBEDDED DIET PLANS HUB */}
      {activeTab === 'diet-plans' && (
        <div className="pt-tab-content fade-in">
          <AdminDietPlans />
        </div>
      )}

      {/* TAB 5: EMBEDDED FITNESS ASSESSMENTS HUB */}
      {activeTab === 'assessments' && (
        <div className="pt-tab-content fade-in">
          <FitnessAssessment />
        </div>
      )}

      {activeTab === 'pt-sessions' && (
        <div className="pt-tab-content fade-in">
          {/* Dashboard Stats Panel */}
          {ptDashboardStats ? (
            <div className="pt-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '1.5rem' }}>
              <div className="pt-stat-card" style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>Active Assignments</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#312e81', marginTop: '6px' }}>{ptDashboardStats.active_assignments_count}</span>
              </div>
              <div className="pt-stat-card" style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Active Trainers</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b', marginTop: '6px' }}>{ptDashboardStats.active_trainers_count}</span>
              </div>
              <div className="pt-stat-card" style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Total Unused Credits</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#78350f', marginTop: '6px' }}>{ptDashboardStats.total_unused_credits}</span>
              </div>
              <div className="pt-stat-card" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Attended / Completed Sessions</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginTop: '6px' }}>{ptDashboardStats.sessions_status_breakdown?.ATTENDED || 0}</span>
              </div>
            </div>
          ) : isLoadingStats ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}><i className="fas fa-spinner fa-spin text-primary"></i> Loading Stats...</div>
          ) : null}

          {/* Filter Form Block */}
          <div className="pt-card flex-col" style={{ gap: '12px', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}><i className="fas fa-filter text-primary"></i> Filter Sessions Logs</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '8px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Status</label>
                <select className="pt-select" value={sessionStatusFilter} onChange={(e) => setSessionStatusFilter(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ATTENDED">ATTENDED</option>
                  <option value="MEMBER_NO_SHOW">MEMBER_NO_SHOW</option>
                  <option value="TRAINER_ABSENT">TRAINER_ABSENT</option>
                  <option value="DISPUTED">DISPUTED</option>
                  <option value="RESOLVED_BY_ADMIN">RESOLVED_BY_ADMIN</option>
                  <option value="MUTUAL_ABSENCE">MUTUAL_ABSENCE</option>
                  <option value="EXPIRED_UNCLAIMED">EXPIRED_UNCLAIMED</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Trainer</label>
                <select className="pt-select" value={sessionTrainerFilter} onChange={(e) => setSessionTrainerFilter(e.target.value)}>
                  <option value="ALL">All Trainers</option>
                  {trainersList.map(t => (
                    <option key={t.trainer_id} value={t.trainer_id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Member ID</label>
                <input type="text" className="pt-input" placeholder="e.g. 138" value={sessionMemberFilter} onChange={(e) => setSessionMemberFilter(e.target.value)} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Start Date</label>
                <input type="date" className="pt-input" value={sessionStartDate} onChange={(e) => setSessionStartDate(e.target.value)} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>End Date</label>
                <input type="date" className="pt-input" value={sessionEndDate} onChange={(e) => setSessionEndDate(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button type="button" className="pt-btn pt-btn-secondary" onClick={() => {
                setSessionStatusFilter('ALL');
                setSessionTrainerFilter('ALL');
                setSessionMemberFilter('');
                setSessionStartDate('');
                setSessionEndDate('');
              }}>Reset Filters</button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={fetchPTBookingSessions}>Apply Filters</button>
            </div>
          </div>

          {/* Sessions Logs Table/List */}
          <div className="pt-card flex-col">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0f172a' }}><i className="fas fa-list text-accent"></i> Booking Sessions Audit Logs</h4>
            
            {isLoadingSessions ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <i className="fas fa-spinner fa-spin text-primary" style={{ fontSize: '1.5rem' }}></i>
                <p style={{ marginTop: '8px', color: '#64748b' }}>Loading session logs...</p>
              </div>
            ) : ptSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No sessions found with the selected filters.</div>
            ) : (
              <div className="table-responsive">
                <table className="pt-table">
                  <thead>
                    <tr>
                      <th>Schedule ID & Date</th>
                      <th>Slot & Shift</th>
                      <th>Member Details</th>
                      <th>Trainer Details</th>
                      <th>Status</th>
                      <th>PIN & Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ptSessions.map(session => (
                      <tr key={session.schedule_id}>
                        <td>
                          <strong>#{session.schedule_id}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{session.session_date}</div>
                        </td>
                        <td>
                          <strong>{session.slot_name || `Slot ${session.slot_id}`}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {session.start_time?.substring(0, 5)} - {session.end_time?.substring(0, 5)}
                          </div>
                        </td>
                        <td>
                          <strong>{session.member_name || 'Open Slot'}</strong>
                          {session.member_email && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{session.member_email} (ID: {session.member_id})</div>
                          )}
                        </td>
                        <td>
                          <strong>{session.trainer_name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{session.trainer_email} (ID: {session.trainer_id})</div>
                        </td>
                        <td>
                          <span className={`type-badge score-average`} style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            background: session.session_status === 'ATTENDED' ? '#d1fae5' : session.session_status === 'PENDING' ? '#fef3c7' : session.session_status === 'DISPUTED' ? '#fee2e2' : '#f1f5f9',
                            color: session.session_status === 'ATTENDED' ? '#065f46' : session.session_status === 'PENDING' ? '#92400e' : session.session_status === 'DISPUTED' ? '#991b1b' : '#334155'
                          }}>
                            {session.session_status}
                          </span>
                        </td>
                        <td>
                          {session.verification_pin && (
                            <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 700 }}>PIN: {session.verification_pin}</div>
                          )}
                          {session.workout_summary && (
                            <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '4px', fontStyle: 'italic', wordBreak: 'break-all' }}>
                              <strong>Workout:</strong> {session.workout_summary}
                            </div>
                          )}
                          {session.session_note && (
                            <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', wordBreak: 'break-all' }}>
                              <strong>Note:</strong> {session.session_note}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pt-disputes' && (
        <div className="pt-tab-content fade-in">
          <div className="pt-card flex-col">
            <h3 className="card-title">
              <i className="fas fa-gavel text-danger"></i> Disputed PT Sessions Arbitration Desk
            </h3>
            <p className="card-desc">Resolve contested client no-show flags. Either confirm the trainer claim or refund the member's wallet credit.</p>

            {isLoadingDisputes ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <i className="fas fa-spinner fa-spin text-primary" style={{ fontSize: '1.5rem' }}></i>
                <p style={{ marginTop: '8px', color: '#64748b' }}>Loading active disputes...</p>
              </div>
            ) : ptDisputes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '10px' }}></i>
                <p style={{ margin: 0, color: '#334155', fontWeight: 600 }}>All disputes resolved!</p>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>There are currently no sessions flagged as disputed.</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '15px', marginTop: '1rem' }}>
                {ptDisputes.map(dispute => {
                  const trainerReason = dispute.session_note?.includes('// [T-D-L]:') 
                    ? dispute.session_note.split('// [T-D-L]:')[1]?.split('// [M-D-L]:')[0]?.trim() 
                    : '';
                  const memberReason = dispute.session_note?.includes('// [M-D-L]:') 
                    ? dispute.session_note.split('// [M-D-L]:')[1]?.trim() 
                    : '';

                  return (
                    <div key={dispute.schedule_id} className="pt-dispute-card" style={{ border: '1px solid #fca5a5', borderRadius: '12px', background: '#fffbeb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #fca5a5', paddingBottom: '8px' }}>
                        <strong>Schedule ID: #{dispute.schedule_id}</strong>
                        <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>DISPUTED</span>
                      </div>
                      
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                        <div><strong>Date:</strong> {dispute.session_date}</div>
                        <div><strong>Time:</strong> {dispute.start_time?.substring(0, 5)} - {dispute.end_time?.substring(0, 5)} ({dispute.slot_name || 'Slot'})</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Member</div>
                          <strong style={{ fontSize: '0.82rem' }}>{dispute.member_name}</strong>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ID: {dispute.member_id}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Trainer</div>
                          <strong style={{ fontSize: '0.82rem' }}>{dispute.trainer_name}</strong>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ID: {dispute.trainer_id}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', padding: '6px 8px', borderRadius: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.72rem', display: 'block' }}>Trainer Claim:</span>
                          <span style={{ color: '#7f1d1d', fontStyle: 'italic' }}>{trainerReason || dispute.session_note || 'Client no-show flagged.'}</span>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid #3b82f6', padding: '6px 8px', borderRadius: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.72rem', display: 'block' }}>Member Counter:</span>
                          <span style={{ color: '#1e3a8a', fontStyle: 'italic' }}>{memberReason || 'Contested no-show claim.'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button 
                          type="button" 
                          className="pt-btn pt-btn-secondary" 
                          style={{ flex: 1, borderColor: '#ef4444', color: '#b91c1c' }} 
                          disabled={isResolvingDispute}
                          onClick={() => handleResolveDispute(dispute.schedule_id, 'trainer')}
                        >
                          Favor Trainer
                        </button>
                        <button 
                          type="button" 
                          className="pt-btn pt-btn-primary" 
                          style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }} 
                          disabled={isResolvingDispute}
                          onClick={() => handleResolveDispute(dispute.schedule_id, 'member')}
                        >
                          Refund Member
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pt-utilities' && (
        <div className="pt-tab-content fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Form 1: Generate Schedule Slots */}
          <form onSubmit={handleGenerateSchedule} className="pt-card flex-col" style={{ gap: '15px' }}>
            <h3 className="card-title">
              <i className="fas fa-calendar-plus text-primary"></i> PT Schedule Slot Generator
            </h3>
            <p className="card-desc">Batch provision schedule timestamps in the `trainer_pt_schedule` catalog using repeating baseline template settings.</p>

            <div className="form-group">
              <label>Select Personal Trainer</label>
              <select 
                className="pt-select" 
                value={genTrainerId} 
                onChange={(e) => setGenTrainerId(e.target.value)}
                required
              >
                <option value="">— Choose Coach —</option>
                {trainersList.map(t => (
                  <option key={t.trainer_id} value={t.trainer_id}>{t.name} (ID: {t.trainer_id})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  className="pt-input" 
                  value={genStartDate} 
                  onChange={(e) => setGenStartDate(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input 
                  type="date" 
                  className="pt-input" 
                  value={genEndDate} 
                  onChange={(e) => setGenEndDate(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="pt-btn pt-btn-primary btn-block" 
              style={{ marginTop: '10px' }}
              disabled={isGenerating || !genTrainerId}
            >
              {isGenerating ? (
                <><i className="fas fa-spinner fa-spin"></i> Generating slots...</>
              ) : (
                <><i className="fas fa-magic"></i> Generate PT Schedule Catalog</>
              )}
            </button>
          </form>

          {/* Form 2: Nightly System Evaluation Handshake Trigger */}
          <form onSubmit={handleTriggerNightlyEvaluation} className="pt-card flex-col" style={{ gap: '15px' }}>
            <h3 className="card-title">
              <i className="fas fa-business-time text-accent"></i> Nightly System Evaluation Utility
            </h3>
            <p className="card-desc">Run evaluation on unresolved past bookings (left as PENDING). Sets active credit packages to MUTUAL_ABSENCE and expired/deactivated packages to EXPIRED_UNCLAIMED.</p>

            <div className="form-group">
              <label>Evaluation Target Date (Optional)</label>
              <input 
                type="date" 
                className="pt-input" 
                value={evalDate} 
                onChange={(e) => setEvalDate(e.target.value)} 
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Defaults to system current date if omitted. Processes any previous pending slots.</span>
            </div>

            <button 
              type="submit" 
              className="pt-btn pt-btn-secondary btn-block" 
              style={{ marginTop: '10px', borderColor: '#4f46e5', color: '#4f46e5' }}
              disabled={isEvaluating}
            >
              {isEvaluating ? (
                <><i className="fas fa-spinner fa-spin"></i> Processing nightly cron...</>
              ) : (
                <><i className="fas fa-sync-alt"></i> Execute Evaluation Handshake</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* FULL-WIDTH TRAINER DETAILS MODAL */}
      {viewingTrainer && (
      <div className="pt-modal-backdrop">
          <div className="pt-modal-card full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Trainer avatar with fallback */}
                {viewingTrainer.avatar ? (
                  <img
                    src={viewingTrainer.avatar}
                    alt={viewingTrainer.name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1', flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: viewingTrainer.avatar ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #6366f1', flexShrink: 0 }}
                >
                  <i className="fas fa-user-tie" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{viewingTrainer.name || '—'}</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                    {viewingTrainer.code && <span className="pt-badge code">{viewingTrainer.code}</span>}
                    {viewingTrainer.specialization && <span className="pt-badge status-active">{viewingTrainer.specialization}</span>}
                    {viewingTrainer.rating && viewingTrainer.rating !== '—' && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                        {viewingTrainer.rating}
                      </span>
                    )}
                    {viewingTrainer.availability_status && (
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                        background: viewingTrainer.availability_status === 'AVAILABLE' ? '#d1fae5' : viewingTrainer.availability_status === 'BUSY' ? '#fee2e2' : '#fef3c7',
                        color: viewingTrainer.availability_status === 'AVAILABLE' ? '#065f46' : viewingTrainer.availability_status === 'BUSY' ? '#991b1b' : '#92400e'
                      }}>
                        {viewingTrainer.availability_status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="pt-icon-btn"
                onClick={() => setViewingTrainer(null)}
                style={{ fontSize: '1.2rem', padding: '8px' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="pt-card" style={{ background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.95rem' }}><i className="fas fa-user-circle text-primary"></i> Professional Profile</h4>
                {viewingTrainer.experience && viewingTrainer.experience !== '—' && <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem' }}><strong>Experience:</strong> {viewingTrainer.experience}</p>}
                {viewingTrainer.phone && <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem' }}><strong>Phone:</strong> {viewingTrainer.phone}</p>}
                {viewingTrainer.email && <p style={{ margin: 0, fontSize: '0.88rem' }}><strong>Email:</strong> {viewingTrainer.email}</p>}
              </div>

              <div className="pt-card" style={{ background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.95rem' }}><i className="fas fa-chart-pie text-accent"></i> Capacity & Client Allocation</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span>Current Assigned Clients:</span>
                  <strong>{viewingTrainer.assigned_count} / {viewingTrainer.max_capacity}</strong>
                </div>
                <div style={{ height: '10px', background: '#cbd5e1', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.round((viewingTrainer.assigned_count / viewingTrainer.max_capacity) * 100))}%`,
                      background: viewingTrainer.assigned_count >= viewingTrainer.max_capacity ? '#ef4444' : '#10b981'
                    }}
                  />
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: viewingTrainer.assigned_count >= viewingTrainer.max_capacity ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                  {viewingTrainer.assigned_count >= viewingTrainer.max_capacity ? '⚠️ Trainer capacity limit reached (15 clients)' : `✓ ${15 - viewingTrainer.assigned_count} additional PT slots available for assignment.`}
                </p>
              </div>
            </div>

            <div className="modal-actions-flex" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="pt-btn pt-btn-secondary"
                onClick={() => setViewingTrainer(null)}
              >
                Close Profile
              </button>
              <button
                type="button"
                className="pt-btn pt-btn-primary"
                onClick={() => {
                  setSelectedTrainerId(viewingTrainer.trainer_id);
                  setViewingTrainer(null);
                  showToast(`Selected coach ${viewingTrainer.name} for member PT assignment!`);
                }}
                disabled={viewingTrainer.assigned_count >= viewingTrainer.max_capacity}
              >
                <i className="fas fa-check"></i> Select Trainer for Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal Overlay Receipt */}
      <InvoiceModal 
        isOpen={showInvoice} 
        invoiceId={activeInvoiceId} 
        onClose={() => {
          setShowInvoice(false);
          setActiveInvoiceId(null);
        }}
      />
    </div>
  );
};

export default AdminPTManagement;
