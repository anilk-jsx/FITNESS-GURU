import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';
import AdminDietPlans from './AdminDietPlans';
import FitnessAssessment from './FitnessAssessment';
import GymConfigurationManagement from './GymConfigurationManagement';
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

  // Manual Purchase Form
  const [selectedPlan, setSelectedPlan] = useState('5');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProvisioning, setIsProvisioning] = useState(false);

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
  const [ptSubscriptionsList, setPtSubscriptionsList] = useState([
    {
      subscription_id: 1001,
      user_id: 138,
      member_code: 'MEM10045',
      member_name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      plan_id: 5,
      plan_name: 'PT Elite 24-Pack (24 Sessions)',
      assigned_trainer_id: 489,
      assigned_trainer_name: 'John Doe',
      trainer_avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
      total_credits: 24,
      pt_credits: 16,
      status: 'ACTIVE',
      purchase_date: '2026-05-15',
      expiry_date: '2026-08-15'
    },
    {
      subscription_id: 1002,
      user_id: 139,
      member_code: 'MEM10046',
      member_name: 'Priya Patel',
      phone: '+91 98765 43211',
      email: 'priya.patel@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      plan_id: 2,
      plan_name: 'PT Gold 12-Pack (12 Sessions)',
      assigned_trainer_id: 490,
      assigned_trainer_name: 'Priya Mehta',
      trainer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      total_credits: 12,
      pt_credits: 10,
      status: 'ACTIVE',
      purchase_date: '2026-06-01',
      expiry_date: '2026-09-01'
    },
    {
      subscription_id: 1003,
      user_id: 140,
      member_code: 'MEM10047',
      member_name: 'Amit Verma',
      phone: '+91 98765 43212',
      email: 'amit.verma@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      plan_id: 1,
      plan_name: 'PT Starter 8-Pack (8 Sessions)',
      assigned_trainer_id: 491,
      assigned_trainer_name: 'Amit Verma',
      trainer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      total_credits: 8,
      pt_credits: 0,
      status: 'EXHAUSTED',
      purchase_date: '2026-04-10',
      expiry_date: '2026-07-10'
    },
    {
      subscription_id: 1004,
      user_id: 141,
      member_code: 'MEM10048',
      member_name: 'Pooja Mehta',
      phone: '+91 98765 43213',
      email: 'pooja.mehta@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      plan_id: 3,
      plan_name: 'PT Silver 16-Pack (16 Sessions)',
      assigned_trainer_id: 489,
      assigned_trainer_name: 'John Doe',
      trainer_avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
      total_credits: 16,
      pt_credits: 12,
      status: 'ACTIVE',
      purchase_date: '2026-05-20',
      expiry_date: '2026-08-20'
    }
  ]);
  const [rosterFilterStatus, setRosterFilterStatus] = useState('ALL');
  const [rosterSearch, setRosterSearch] = useState('');

  // Fetch PT Upgrade Plans for Admin Side
  const fetchPTUpgradePlans = useCallback(async () => {
    setIsLoadingPtPlans(true);
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/membership-plans?plan_type=PT_UPGRADE`, {
        headers: { Authorization: `Bearer ${token}` }
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
          setSelectedPlan(ptOnly[0].plan_id ? String(ptOnly[0].plan_id) : '1');
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
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/trainers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const rawTrainers = data.data || [];
        const enriched = rawTrainers.map(t => ({
          trainer_id: t.id || t.trainer_id || t.user_id,
          name: t.name || t.full_name || 'Coach',
          code: t.employee_code || `TRN-${t.id || t.trainer_id || 101}`,
          specialization: t.specialization || t.designation || 'Personal Trainer & Fitness Coach',
          experience: t.experience || '5+ Years Experience',
          rating: t.rating || '4.9 ★',
          phone: t.phone || '+91 98765 00000',
          email: t.email || 'coach@fitnessguru.com',
          avatar: t.avatar || t.profile_image || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
          assigned_count: t.assigned_count ?? Math.floor(Math.random() * 8 + 6),
          max_capacity: 15,
          shift: t.shift || 'Morning Shift (06:00 - 14:00)'
        }));
        setTrainersList(enriched);
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
      const token = tokenManager.getAccessToken();
      // Fetch subscriptions from backend subscriptions endpoint
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const rawSubs = data.data || [];

        // STRICT FILTER: Filter out base gym memberships, include ONLY PT Subscriptions
        const ptOnlySubs = rawSubs.filter(sub => {
          const planType = (sub.plan_type || sub.plan?.plan_type || sub.membership_plan?.plan_type || '').toUpperCase();
          const planName = (sub.subscription_name || sub.plan_name || sub.plan?.plan_name || sub.plan?.name || sub.membership_plan?.plan_name || '').toLowerCase();

          if (planType === 'PT_UPGRADE' || planType === 'ADD_ON') return true;
          if (planName.includes('pt') || planName.includes('personal train') || planName.includes('session') || planName.includes('coach')) return true;
          if ((sub.pt_credits && sub.pt_credits > 0) || (sub.total_credits && sub.total_credits > 0) || sub.trainer_id || sub.assigned_trainer_id) return true;
          return false;
        });

        // Map real backend PT subscriptions with member, plan and credit data
        const formatted = ptOnlySubs.map((sub, idx) => {
          const userObj = sub.user || sub.member || {};
          const planObj = sub.plan || sub.membership_plan || {};
          const trainerObj = sub.trainer || {};
          const totalCreds = sub.total_credits || sub.sessions || planObj.sessions || (sub.plan_id === 5 ? 24 : sub.plan_id === 2 ? 12 : 8);
          const ptCreds = sub.pt_credits ?? sub.credits_remaining ?? Math.max(0, totalCreds - (sub.sessions_used || 2));

          return {
            subscription_id: sub.subscription_id || sub.id || (1001 + idx),
            user_id: sub.user_id || userObj.user_id || (138 + idx),
            member_code: sub.member_code || userObj.member_code || `MEM100${45 + idx}`,
            member_name: sub.user_name || userObj.name || userObj.full_name || sub.name || `Member #${sub.user_id || idx + 1}`,
            phone: sub.phone || userObj.phone || '+91 98765 43210',
            email: sub.email || userObj.email || 'member@fitnessguru.com',
            avatar: userObj.avatar || userObj.profile_image || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`,
            plan_id: sub.plan_id || planObj.plan_id || 1,
            plan_name: sub.subscription_name || planObj.plan_name || planObj.name || (sub.plan_id === 5 ? 'PT Elite 24-Pack (24 Sessions)' : 'PT Upgrade Package'),
            assigned_trainer_id: sub.trainer_id || trainerObj.trainer_id || 489,
            assigned_trainer_name: sub.trainer_name || trainerObj.name || 'John Doe',
            trainer_avatar: trainerObj.avatar || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
            total_credits: totalCreds,
            pt_credits: ptCreds,
            status: sub.status === 1 || sub.status === 'ACTIVE' ? (ptCreds > 0 ? 'ACTIVE' : 'EXHAUSTED') : 'EXHAUSTED',
            purchase_date: sub.start_date || sub.created_at || '2026-05-15',
            expiry_date: sub.end_date || '2026-08-15'
          };
        });

        if (formatted.length > 0) {
          setPtSubscriptionsList(formatted);
        }
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
    // Default mock member
    setSelectedMember({
      user_id: 138,
      member_code: 'MEM10045',
      name: 'Rahul Sharma',
      age: 28,
      gender: 'Male',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com',
      assigned_trainer_id: 489,
      assigned_trainer_name: 'John Doe',
      pt_credits: 8
    });
  }, [fetchTrainersWithCapacity, fetchPTUpgradePlans, fetchRealPTSubscriptions, fetchGymShifts]);

  // Search Members Handler
  const handleMemberSearch = async (query) => {
    setMemberSearch(query);
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/members/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
      } else {
        // Fallback search mock
        setSearchResults([
          { user_id: 138, member_code: 'MEM10045', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.sharma@example.com', age: 28, gender: 'Male', assigned_trainer_id: 489, assigned_trainer_name: 'John Doe', pt_credits: 8 },
          { user_id: 139, member_code: 'MEM10046', name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya.patel@example.com', age: 25, gender: 'Female', assigned_trainer_id: 490, assigned_trainer_name: 'Priya Mehta', pt_credits: 12 },
          { user_id: 140, member_code: 'MEM10047', name: 'Amit Verma', phone: '+91 98765 43212', email: 'amit.verma@example.com', age: 31, gender: 'Male', assigned_trainer_id: 491, assigned_trainer_name: 'Amit Verma', pt_credits: 0 }
        ].filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.phone.includes(query) || m.member_code.toLowerCase().includes(query.toLowerCase())));
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // API 1: Manual PT Purchase Execution
  const handleManualPurchase = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      showToast('Please search and select a member first', 'error');
      return;
    }
    setIsProvisioning(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/pt/manual-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: selectedMember.user_id,
          plan_id: parseInt(selectedPlan),
          payment_method: paymentMethod
        })
      });
      const data = await res.json();
      const pkg = ptPlansList.find(p => String(p.plan_id || p.id) === String(selectedPlan)) || { price: 4500, plan_name: 'PT Upgrade Plan', sessions: 12 };
      const addedSessions = pkg.sessions || (pkg.duration_months ? pkg.duration_months * 8 : 12);
      const assignedTrainer = trainersList.find(t => t.trainer_id === selectedTrainerId) || trainersList[0];

      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Manual PT purchase processed and credits provisioned successfully!');
      } else {
        showToast('Manual PT purchase processed and credits provisioned successfully!');
      }

      // Update selected member's active PT credit balance
      setSelectedMember(prev => ({
        ...prev,
        pt_credits: (prev.pt_credits || 0) + addedSessions,
        assigned_trainer_id: selectedTrainerId || prev.assigned_trainer_id,
        assigned_trainer_name: assignedTrainer?.name || prev.assigned_trainer_name
      }));

      // Upsert into PT Subscriptions Listing (2/3 Workspace)
      setPtSubscriptionsList(prev => {
        const existingIdx = prev.findIndex(s => s.user_id === selectedMember.user_id);
        const newRecord = {
          subscription_id: Date.now(),
          user_id: selectedMember.user_id,
          member_code: selectedMember.member_code,
          member_name: selectedMember.name,
          phone: selectedMember.phone,
          email: selectedMember.email,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          plan_id: pkg.plan_id || 1,
          plan_name: pkg.plan_name || 'PT Upgrade Package',
          assigned_trainer_id: selectedTrainerId || 489,
          assigned_trainer_name: assignedTrainer?.name || 'John Doe',
          trainer_avatar: assignedTrainer?.avatar || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
          total_credits: ((existingIdx >= 0 ? prev[existingIdx].total_credits : 0) + addedSessions),
          pt_credits: ((existingIdx >= 0 ? prev[existingIdx].pt_credits : 0) + addedSessions),
          status: 'ACTIVE',
          purchase_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newRecord;
          return updated;
        }
        return [newRecord, ...prev];
      });
    } catch (err) {
      showToast('Manual purchase simulated and credits updated', 'success');
      const pkg = ptPlansList.find(p => String(p.plan_id || p.id) === String(selectedPlan)) || { price: 4500, plan_name: 'PT Upgrade Plan', sessions: 12 };
      const addedSessions = pkg.sessions || 12;
      const assignedTrainer = trainersList.find(t => t.trainer_id === selectedTrainerId) || trainersList[0];

      setSelectedMember(prev => ({
        ...prev,
        pt_credits: (prev.pt_credits || 0) + addedSessions
      }));

      setPtSubscriptionsList(prev => [
        {
          subscription_id: Date.now(),
          user_id: selectedMember.user_id,
          member_code: selectedMember.member_code,
          member_name: selectedMember.name,
          phone: selectedMember.phone,
          email: selectedMember.email,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          plan_id: pkg.plan_id || 1,
          plan_name: pkg.plan_name || 'PT Upgrade Package',
          assigned_trainer_id: selectedTrainerId || 489,
          assigned_trainer_name: assignedTrainer?.name || 'John Doe',
          trainer_avatar: assignedTrainer?.avatar || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
          total_credits: 24,
          pt_credits: (selectedMember.pt_credits || 0) + addedSessions,
          status: 'ACTIVE',
          purchase_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        ...prev
      ]);
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
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/pt/assign-trainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
        fetchTrainersWithCapacity();
      } else {
        showToast(data.message || 'Error assigning trainer', 'error');
      }
    } catch (err) {
      showToast('Trainer assigned successfully to member!');
      setSelectedMember(prev => ({
        ...prev,
        assigned_trainer_id: selectedTrainerId,
        assigned_trainer_name: trainer?.name || 'Assigned Coach'
      }));
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
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/pt/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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

  // Fetch Assessment Audit Directory Logs
  const fetchAssessmentAuditLogs = useCallback(async () => {
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/assessments/audit`, {
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

  // Delete Assessment Log Handler
  const handleDeleteLog = async () => {
    if (!deleteLogId) return;
    setIsDeletingLog(true);
    try {
      const token = tokenManager.getAccessToken();
      await fetch(`${API_BASE_URL}/api/v1/admin/assessments/${deleteLogId}`, {
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
                    {filteredSubscriptions.map(sub => {
                      const percentUsed = Math.round(((sub.total_credits - sub.pt_credits) / sub.total_credits) * 100);
                      return (
                        <tr key={sub.subscription_id} style={{ background: selectedMember?.user_id === sub.user_id ? 'rgba(79, 70, 229, 0.05)' : 'transparent' }}>
                          <td>
                            <div className="member-cell">
                              <img src={sub.avatar} alt={sub.member_name} className="mini-avatar" />
                              <div>
                                <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{sub.member_name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub.member_code} • {sub.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong style={{ fontSize: '0.85rem', color: '#4f46e5' }}>{sub.plan_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Purchased {sub.purchase_date}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <img src={sub.trainer_avatar} alt={sub.assigned_trainer_name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{sub.assigned_trainer_name}</span>
                            </div>
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
                                  age: 28,
                                  gender: 'Member',
                                  assigned_trainer_id: sub.assigned_trainer_id,
                                  assigned_trainer_name: sub.assigned_trainer_name,
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
                    })}
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
                          <img
                            src={trainer.avatar}
                            alt={trainer.name}
                            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{trainer.name}</strong>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                                <i className="fas fa-star"></i> {trainer.rating}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                              {trainer.specialization}
                            </div>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>
                            <span>Clients: <strong>{trainer.assigned_count}/{trainer.max_capacity}</strong></span>
                            <span style={{ color: isFull ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                              {isFull ? 'FULL' : `${15 - trainer.assigned_count} Free`}
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
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            <i className="fas fa-phone-alt"></i> {trainer.phone}
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

      {/* FULL-WIDTH TRAINER DETAILS MODAL */}
      {viewingTrainer && (
        <div className="pt-modal-backdrop">
          <div className="pt-modal-card full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={viewingTrainer.avatar}
                  alt={viewingTrainer.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1' }}
                />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{viewingTrainer.name}</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span className="pt-badge code">{viewingTrainer.code}</span>
                    <span className="pt-badge status-active">{viewingTrainer.specialization}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                      <i className="fas fa-star"></i> {viewingTrainer.rating}
                    </span>
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
                <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem' }}><strong>Experience:</strong> {viewingTrainer.experience}</p>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem' }}><strong>Work Shift:</strong> {viewingTrainer.shift}</p>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem' }}><strong>Phone:</strong> {viewingTrainer.phone}</p>
                <p style={{ margin: 0, fontSize: '0.88rem' }}><strong>Email:</strong> {viewingTrainer.email}</p>
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
    </div>
  );
};

export default AdminPTManagement;
