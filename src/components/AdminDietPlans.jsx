import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './AdminPTManagement.css';

const GOAL_OPTIONS = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain' },
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'ENDURANCE', label: 'Endurance' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness' }
];

const getGoalLabel = (goalValue) => {
  const found = GOAL_OPTIONS.find(opt => opt.value === goalValue);
  return found ? found.label : goalValue || 'N/A';
};

const getStatusBadgeClass = (status) => {
  const normStatus = (status || '').toUpperCase();
  if (normStatus === 'ACTIVE') return 'score-excellent';
  if (normStatus === 'DRAFT') return 'score-average';
  if (normStatus === 'COMPLETED') return 'score-good';
  return 'score-good';
};

const displayVal = (val, suffix = '') => {
  if (val === null || val === undefined || val === 0 || val === '0' || val === '') return 'N/A';
  return `${val}${suffix}`;
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const parts = time24.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
};

const parseApiMealItems = (rawItems) => {
  let items = [];
  try {
    const parsed = typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems;
    items = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
  } catch {
    items = [];
  }

  return items.map(item => {
    const rawName = item.name || item.food || '';
    const rawQty = String(item.quantity || '');

    let quantity = rawQty;
    let unit = item.unit || 'g';

    const match = rawQty.match(/^([\d.]+)\s*(.*)$/);
    if (match) {
      quantity = match[1];
      const parsedUnit = match[2].trim().toLowerCase();
      if (parsedUnit) {
        unit = parsedUnit;
      }
    }

    return {
      food: rawName,
      quantity: quantity,
      unit: unit
    };
  });
};

const AdminDietPlans = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.fitnessguru.org.in";

  // --- Dynamic State ---
  const [members, setMembers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlanMeals, setSelectedPlanMeals] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [assignedTrainerName, setAssignedTrainerName] = useState('None');
  const [assignedTrainerId, setAssignedTrainerId] = useState('');
  const [memberProfile, setMemberProfile] = useState(null);

  // --- Loading / Async UI States ---
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  // --- Directory & Search State ---
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // --- Selection and Details Panel State ---
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [openPreviewAccordion, setOpenPreviewAccordion] = useState('overview'); // 'overview' | 'meals' | 'guidelines'
  const [currentTab, setCurrentTab] = useState('All'); // 'All' | 'Active' | 'Expired Plans' | 'Drafts'

  // --- Screen View Mode ---
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'edit'

  // --- Form States for creating/editing diet plan ---
  const [planForm, setPlanForm] = useState({
    id: null,
    memberId: '',
    trainerId: '',
    goal: 'WEIGHT_LOSS',
    duration: '30',
    startDate: '',
    waterIntake: '3.5',
    sleepHours: '8.0',
    status: 'DRAFT',
    trainerComments: ''
  });

  const [mealsList, setMealsList] = useState([]);
  const [deletedMealIds, setDeletedMealIds] = useState([]);
  const [recommendationsList, setRecommendationsList] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // --- Toast Notification State ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);


  // --- Meal Form Modal State ---
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [mealForm, setMealForm] = useState({
    mealTitle: '',
    mealTime: '08:00',
    notes: '',
    mealItems: [{ food: '', quantity: '', unit: 'g' }]
  });

  // --- Fetch Initial Data: Members, Subscriptions, Trainers, and PT Mappings ---
  const fetchInitialData = useCallback(async () => {
    setLoadingMembers(true);
    try {
      // 1. Fetch trainers, PT mappings, and subscriptions concurrently
      const [trainersRes, mappingsRes, subsRes] = await Promise.all([
        tokenManager.apiCall(`${API_BASE_URL}/api/trainers?page=1&limit=100`, { method: 'GET' }).catch(() => null),
        tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/trainers-members`, { method: 'GET' }).catch(() => null),
        tokenManager.apiCall(`${API_BASE_URL}/api/admin/subscriptions`, { method: 'GET' }).catch(() => null)
      ]);

      let trainersList = [];
      if (trainersRes && trainersRes.ok) {
        const tData = await trainersRes.json();
        trainersList = tData.data || tData.trainers || (Array.isArray(tData) ? tData : []);
        setTrainers(trainersList);
      }

      let mappingsList = [];
      if (mappingsRes && mappingsRes.ok) {
        const mData = await mappingsRes.json();
        mappingsList = mData.data || [];
      }

      let subsList = [];
      if (subsRes && subsRes.ok) {
        const sData = await subsRes.json();
        subsList = sData.data || [];
        setSubscriptions(subsList);
      }

      // 2. Fetch Members list
      const membersRes = await tokenManager.apiCall(
        `${API_BASE_URL}/api/users/list?role=MEMBER&page=1&limit=1000`,
        { method: 'GET' }
      );
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const rawMembers = membersData.users || membersData.data || [];
        
        const normalized = rawMembers.map((m, idx) => {
          const userId = m.user_id || m.id || idx + 1;

          // Cross-reference trainer assignments if missing
          let trainerId = m.assigned_trainer_id || m.trainer_id || null;
          let trainerName = m.assigned_trainer_name || m.trainer_name || '';

          if (!trainerId) {
            const resolvedMapping = mappingsList.find(map =>
              map.members?.some(mm => String(mm.member_user_id) === String(userId))
            );
            if (resolvedMapping) {
              trainerId = resolvedMapping.trainer_id;
            }
          }

          if (trainerId) {
            const tr = trainersList.find(t => String(t.id) === String(trainerId));
            if (tr) {
              trainerName = tr.name || tr.full_name || trainerName;
            }
          }

          return {
            id: userId,
            name: m.name || 'Member',
            email: m.email || '',
            phone: m.phone || '',
            gender: m.gender || 'Not specified',
            dob: m.dob || '',
            weight: m.weight_kg || m.weight || 0,
            height: m.height_cm || m.height || 0,
            trainer: trainerName || 'None',
            trainer_id: trainerId
          };
        });

        setMembers(normalized);
      }
    } catch (err) {
      console.error('Failed to load initial admin diet plan data:', err);
    } finally {
      setLoadingMembers(false);
    }
  }, [API_BASE_URL]);

  const fetchLatestAssessment = useCallback(async (memberId) => {
    if (!memberId) {
      setLatestAssessment(null);
      return;
    }
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/members/${memberId}/assessments/latest`, {
        method: 'GET'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setLatestAssessment(data.data);
        } else {
          setLatestAssessment(null);
        }
      } else {
        setLatestAssessment(null);
      }
    } catch (err) {
      console.error('Failed to load latest assessment:', err);
      setLatestAssessment(null);
    }
  }, [API_BASE_URL]);

  const fetchAssignedTrainer = useCallback(async (memberId) => {
    if (!memberId) {
      setAssignedTrainerName('None');
      setAssignedTrainerId('');
      return;
    }
    try {
      const mappingsRes = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/trainers-members`, { method: 'GET' });
      if (mappingsRes.ok) {
        const mData = await mappingsRes.json();
        const mappingsList = mData.data || [];
        const resolvedMapping = mappingsList.find(map =>
          map.members?.some(mm => String(mm.member_user_id) === String(memberId))
        );
        if (resolvedMapping) {
          const trId = resolvedMapping.trainer_id;
          setAssignedTrainerId(trId);
          const tr = trainers.find(t => String(t.trainer_id || t.id || t.trainer_profile_id || t.user_id || t.trainer_user_id) === String(trId));
          setAssignedTrainerName(tr ? (tr.name || tr.full_name || 'Trainer') : 'Trainer');
        } else {
          setAssignedTrainerName('None');
          setAssignedTrainerId('');
        }
      } else {
        setAssignedTrainerName('None');
        setAssignedTrainerId('');
      }
    } catch (err) {
      console.error('Failed to fetch assigned trainer:', err);
      setAssignedTrainerName('None');
      setAssignedTrainerId('');
    }
  }, [API_BASE_URL, trainers]);

  const fetchMemberProfileDetails = useCallback(async (memberId) => {
    if (!memberId) {
      setMemberProfile(null);
      return;
    }
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/members/view?user_id=${memberId}`, {
        method: 'GET'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setMemberProfile(data.data);
        } else {
          setMemberProfile(null);
        }
      } else {
        setMemberProfile(null);
      }
    } catch (err) {
      console.error('Failed to load member profile details:', err);
      setMemberProfile(null);
    }
  }, [API_BASE_URL]);

  // Load initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- Resolve Member Active Subscription & Entitlements ---
  const getMemberSubscription = useCallback((memberId) => {
    if (!memberId) return null;
    const sub = subscriptions.find(s => 
      String(s.user_id) === String(memberId) && 
      (s.status === 1 || String(s.status) === '1')
    );
    if (!sub) return null;

    const hasDietAccess = sub.wallet_credits?.some(credit => 
      credit.entitlement_type === 'ACCESS_DIET_PLANS' && 
      (credit.status === 1 || String(credit.status) === '1')
    ) || (sub.plan_name && sub.plan_name.toLowerCase().includes('diet'));

    return {
      planName: sub.plan_name || 'Active Membership',
      hasDietAccess: !!hasDietAccess
    };
  }, [subscriptions]);

  // Auto-select first member who has active diet plan entitlement
  useEffect(() => {
    if (members.length > 0 && subscriptions.length > 0) {
      const entitled = members.filter(m => {
        const sub = getMemberSubscription(m.id);
        return sub && sub.hasDietAccess;
      });
      if (entitled.length > 0) {
        const currentSub = getMemberSubscription(selectedMemberId);
        if (!selectedMemberId || !currentSub || !currentSub.hasDietAccess) {
          setSelectedMemberId(entitled[0].id);
        }
      } else if (!selectedMemberId) {
        setSelectedMemberId(members[0].id);
      }
    }
  }, [members, subscriptions, selectedMemberId, getMemberSubscription]);

  const selectedMember = members.find(m => String(m.id) === String(selectedMemberId));
  const memberSubscription = getMemberSubscription(selectedMemberId);

  // --- Fetch Diet Plans for the selected member ---
  const fetchMemberPlans = useCallback(async (memberId) => {
    if (!memberId) return;
    setLoadingPlans(true);
    setSelectedPlanId(null);
    setSelectedPlanMeals([]);
    try {
      const res = await tokenManager.apiCall(
        `${API_BASE_URL}/api/admin/diet-plans?member_id=${memberId}`,
        { method: 'GET' }
      );
      const data = await res.json();
      if (res.ok && data.status === 'success' && Array.isArray(data.data)) {
        setDietPlans(data.data);
      } else {
        setDietPlans([]);
      }
    } catch (err) {
      console.error('Failed to load diet plans for member:', err);
      setDietPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [API_BASE_URL]);

  // Load plans whenever selected member changes
  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberPlans(selectedMemberId);
      fetchLatestAssessment(selectedMemberId);
      fetchAssignedTrainer(selectedMemberId);
      fetchMemberProfileDetails(selectedMemberId);
    } else {
      setLatestAssessment(null);
      setAssignedTrainerName('None');
      setAssignedTrainerId('');
      setMemberProfile(null);
    }
  }, [selectedMemberId, fetchMemberPlans, fetchLatestAssessment, fetchAssignedTrainer, fetchMemberProfileDetails]);

  // --- Fetch meals for selected preview plan ---
  const fetchPlanMeals = useCallback(async (planId) => {
    if (!planId) {
      setSelectedPlanMeals([]);
      return;
    }
    setLoadingMeals(true);
    try {
      const res = await tokenManager.apiCall(
        `${API_BASE_URL}/api/admin/diet-plans/${planId}/meals`,
        { method: 'GET' }
      );
      if (!res.ok) {
        setSelectedPlanMeals([]);
        return;
      }
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setSelectedPlanMeals(data.data);
      } else {
        setSelectedPlanMeals([]);
      }
    } catch (err) {
      console.error('Failed to load plan meals:', err);
      setSelectedPlanMeals([]);
    } finally {
      setLoadingMeals(false);
    }
  }, [API_BASE_URL]);

  // Load meals when preview selection changes
  useEffect(() => {
    if (selectedPlanId) {
      fetchPlanMeals(selectedPlanId);
    } else {
      setSelectedPlanMeals([]);
    }
  }, [selectedPlanId, fetchPlanMeals]);

  // --- Directory Sidebar Searching ---
  // Show only those members who have active diet plan entitlement
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      String(m.id).toLowerCase().includes(searchMemberQuery.toLowerCase());
    if (!matchesSearch) return false;

    const sub = getMemberSubscription(m.id);
    return sub && sub.hasDietAccess;
  });

  // --- Table Filters mapping to backend statuses ---
  // API statuses: ACTIVE, DRAFT, COMPLETED, CANCELLED
  const filteredPlans = dietPlans.filter(p => {
    const status = (p.status || '').toUpperCase();
    if (currentTab === 'Active') return status === 'ACTIVE';
    if (currentTab === 'Expired Plans') return status === 'COMPLETED' || status === 'CANCELLED';
    if (currentTab === 'Drafts') return status === 'DRAFT';
    return true;
  });

  const selectedPlan = dietPlans.find(p => p.diet_plan_id === selectedPlanId);

  // --- Helper Date Calculator for Form ---
  const getEstimatedEndDate = (startDateStr, durationDays) => {
    if (!startDateStr || !durationDays) return '';
    try {
      const start = new Date(startDateStr);
      start.setDate(start.getDate() + parseInt(durationDays, 10));
      return start.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // --- API Action handlers: Delete, Activate, Clone ---
  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this diet plan? This will cascade to delete all its meals.')) return;
    try {
      const res = await tokenManager.apiCall(
        `${API_BASE_URL}/api/admin/diet-plans/${planId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Diet plan deleted successfully!', 'success');
        if (selectedPlanId === planId) {
          setSelectedPlanId(null);
        }
        fetchMemberPlans(selectedMemberId);
      } else {
        showToast(data.message || 'Failed to delete diet plan.', 'error');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Network or server error deleting diet plan.', 'error');
    }
  };

  const handleActivatePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to activate this diet plan?')) return;
    try {
      const res = await tokenManager.apiCall(
        `${API_BASE_URL}/api/admin/diet-plans/${planId}/activate`,
        { method: 'PATCH' }
      );
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Diet plan activated successfully!', 'success');
        fetchMemberPlans(selectedMemberId);
      } else {
        showToast(data.message || 'Failed to activate diet plan.', 'error');
      }
    } catch (err) {
      console.error('Activation failed:', err);
      showToast('Network or server error activating diet plan.', 'error');
    }
  };


  // --- Screen View Triggers ---
  const triggerCreateView = () => {
    setPlanForm({
      id: null,
      memberId: selectedMemberId,
      trainerId: assignedTrainerId ? String(assignedTrainerId) : (selectedMember?.trainer_id ? String(selectedMember.trainer_id) : ''),
      goal: 'WEIGHT_LOSS',
      duration: '30',
      startDate: new Date().toISOString().split('T')[0],
      waterIntake: '3.5',
      sleepHours: '8.0',
      status: 'DRAFT',
      trainerComments: ''
    });
    setMealsList([]);
    setDeletedMealIds([]);
    setRecommendationsList([
      'Drink 3-4 liters of water daily',
      'Avoid sugar and carbonated beverages',
      'Sleep 7-8 hours daily'
    ]);
    setViewMode('create');
  };

  const triggerEditView = (plan) => {
    setPlanForm({
      id: plan.diet_plan_id,
      memberId: plan.member_id,
      trainerId: plan.trainer_id ? String(plan.trainer_id) : (assignedTrainerId ? String(assignedTrainerId) : ''),
      goal: plan.goal || 'WEIGHT_LOSS',
      duration: String(plan.duration_days || 30),
      startDate: plan.start_date || '',
      waterIntake: String(plan.water_intake_l || 3.5),
      sleepHours: String(plan.sleep_hours || 8.0),
      status: plan.status || 'DRAFT',
      trainerComments: plan.trainer_comments || ''
    });

    // Populate meals and recommendations
    setDeletedMealIds([]);
    let recs = [];
    if (plan.recommendations) {
      try {
        recs = typeof plan.recommendations === 'string'
          ? JSON.parse(plan.recommendations)
          : plan.recommendations;
      } catch {
        recs = Array.isArray(plan.recommendations) ? plan.recommendations : [];
      }
    }
    setRecommendationsList(recs);

    // Fetch details meals to populate the list in edit mode
    const loadFormMeals = async () => {
      try {
        const res = await tokenManager.apiCall(
          `${API_BASE_URL}/api/admin/diet-plans/${plan.diet_plan_id}/meals`,
          { method: 'GET' }
        );
        if (!res.ok) {
          setMealsList([]);
          return;
        }
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          const formattedMeals = data.data.map(m => {
            return {
              meal_id: m.meal_id,
              mealTitle: m.meal_title,
              mealTime: m.meal_time ? m.meal_time.substring(0, 5) : '08:00',
              mealItems: parseApiMealItems(m.meal_items),
              notes: m.notes || ''
            };
          });
          setMealsList(formattedMeals);
        } else {
          setMealsList([]);
        }
      } catch (e) {
        console.error('Failed to load plan meals for edit view:', e);
        setMealsList([]);
      }
    };
    loadFormMeals();
    setViewMode('edit');
  };

  // --- Meal Modal Handlers ---
  const openAddMeal = () => {
    setEditingMealIndex(null);
    setMealForm({
      mealTitle: '',
      mealTime: '08:00',
      notes: '',
      mealItems: [{ food: '', quantity: '', unit: 'g' }]
    });
    setIsMealModalOpen(true);
  };

  const openEditMeal = (index) => {
    setEditingMealIndex(index);
    setMealForm({ ...mealsList[index] });
    setIsMealModalOpen(true);
  };

  const handleDeleteMeal = (index) => {
    const target = mealsList[index];
    if (target.meal_id) {
      setDeletedMealIds(prev => [...prev, target.meal_id]);
    }
    setMealsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateMeal = (index) => {
    const meal = mealsList[index];
    const duplicated = {
      ...meal,
      meal_id: null, // Treat as new
      mealTitle: `${meal.mealTitle} (Copy)`
    };
    setMealsList([...mealsList, duplicated]);
  };

  const addFoodItemRow = () => {
    setMealForm(prev => ({
      ...prev,
      mealItems: [...prev.mealItems, { food: '', quantity: '', unit: 'g' }]
    }));
  };

  const removeFoodItemRow = (idx) => {
    setMealForm(prev => ({
      ...prev,
      mealItems: prev.mealItems.filter((_, i) => i !== idx)
    }));
  };

  const handleMealSubmit = (e) => {
    e.preventDefault();
    if (!mealForm.mealTitle.trim()) {
      alert('Meal title is required');
      return;
    }
    const emptyFood = mealForm.mealItems.some(item => !item.food.trim() || !item.quantity);
    if (emptyFood) {
      alert('All food rows must contain valid items and quantities');
      return;
    }

    if (editingMealIndex !== null) {
      setMealsList(prev => prev.map((m, i) => i === editingMealIndex ? mealForm : m));
    } else {
      setMealsList([...mealsList, mealForm]);
    }
    setIsMealModalOpen(false);
  };

  // --- Recommendations Row Builder ---
  const handleRecommendationChange = (index, value) => {
    const updated = [...recommendationsList];
    updated[index] = value;
    setRecommendationsList(updated);
  };

  const addRecommendationRow = () => {
    setRecommendationsList([...recommendationsList, '']);
  };

  const removeRecommendationRow = (index) => {
    setRecommendationsList(prev => prev.filter((_, i) => i !== index));
  };

  // --- Save / Submit Plan Form Handler ---
  const handleSavePlanForm = async (statusArg) => {
    let errs = {};
    if (!planForm.duration || isNaN(planForm.duration) || parseInt(planForm.duration, 10) <= 0) {
      errs.duration = 'Valid duration days required';
    }
    if (!planForm.startDate) errs.startDate = 'Start date is required';
    const parsedTrainerId = parseInt(planForm.trainerId, 10);
    if (!planForm.trainerId || isNaN(parsedTrainerId) || parsedTrainerId <= 0) {
      errs.trainerId = 'Creator trainer is required';
    }

    if (mealsList.length === 0) {
      showToast('A diet plan must contain at least one meal', 'error');
      return;
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      showToast('Please review form validation warnings', 'error');
      return;
    }

    // --- Subscription check & Alert confirmation logic ---
    if (statusArg === 'ACTIVE' && (!memberSubscription || !memberSubscription.hasDietAccess)) {
      const proceed = window.confirm(
        'WARNING: This member does not have an active subscription with Diet Plan entitlements. ' +
        'Do you still want to activate and assign this plan?'
      );
      if (!proceed) return;
    }

    const cleanRecommendations = recommendationsList.filter(r => r && r.trim() !== '');

    const planPayload = {
      member_id: parseInt(planForm.memberId, 10),
      trainer_id: parseInt(planForm.trainerId, 10),
      goal: planForm.goal,
      duration_days: parseInt(planForm.duration, 10),
      start_date: planForm.startDate,
      water_intake_l: parseFloat(planForm.waterIntake) || 3.5,
      sleep_hours: parseFloat(planForm.sleepHours) || 8.0,
      recommendations: cleanRecommendations,
      trainer_comments: planForm.trainerComments,
      status: statusArg
    };

    setSavingPlan(true);

    try {
      if (viewMode === 'create') {
        // 1. Create Diet Plan
        const planRes = await tokenManager.apiCall(
          `${API_BASE_URL}/api/admin/diet-plans`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planPayload)
          }
        );
        const planData = await planRes.json();
        if (planData.status !== 'success') {
          throw new Error(planData.message || 'Failed to create plan.');
        }

        const newPlanId = planData.diet_plan_id;

        // 2. Create associated meals
        for (const meal of mealsList) {
          const mealPayload = {
            meal_title: meal.mealTitle,
            meal_time: meal.mealTime.length === 5 ? `${meal.mealTime}:00` : meal.mealTime,
            meal_items: meal.mealItems.map(item => ({
              name: item.food,
              quantity: `${item.quantity}${item.unit || 'g'}`
            })),
            notes: meal.notes || ''
          };
          const mealRes = await tokenManager.apiCall(
            `${API_BASE_URL}/api/admin/diet-plans/${newPlanId}/meals`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mealPayload)
            }
          );
          if (!mealRes.ok) {
            const errData = await mealRes.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to create meal: ${meal.mealTitle}`);
          }
        }

        showToast(`Diet plan successfully created as ${statusArg}!`, 'success');
      } else if (viewMode === 'edit') {
        // 1. Update Diet Plan Details
        const planRes = await tokenManager.apiCall(
          `${API_BASE_URL}/api/admin/diet-plans/${planForm.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planPayload)
          }
        );
        const planData = await planRes.json();
        if (planData.status !== 'success') {
          throw new Error(planData.message || 'Failed to update plan.');
        }

        // 2. Delete removed meals
        for (const mealId of deletedMealIds) {
          await tokenManager.apiCall(
            `${API_BASE_URL}/api/admin/meals/${mealId}`,
            { method: 'DELETE' }
          );
        }

        // 3. Reconcile existing / new meals
        for (const meal of mealsList) {
          const mealPayload = {
            meal_title: meal.mealTitle,
            meal_time: meal.mealTime.length === 5 ? `${meal.mealTime}:00` : meal.mealTime,
            meal_items: meal.mealItems.map(item => ({
              name: item.food,
              quantity: `${item.quantity}${item.unit || 'g'}`
            })),
            notes: meal.notes || ''
          };

          if (meal.meal_id) {
            // Update existing meal
            const mealRes = await tokenManager.apiCall(
              `${API_BASE_URL}/api/admin/meals/${meal.meal_id}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mealPayload)
              }
            );
            if (!mealRes.ok) {
              const errData = await mealRes.json().catch(() => ({}));
              throw new Error(errData.message || `Failed to update meal: ${meal.mealTitle}`);
            }
          } else {
            // Create new meal
            const mealRes = await tokenManager.apiCall(
              `${API_BASE_URL}/api/admin/diet-plans/${planForm.id}/meals`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mealPayload)
              }
            );
            if (!mealRes.ok) {
              const errData = await mealRes.json().catch(() => ({}));
              throw new Error(errData.message || `Failed to create meal: ${meal.mealTitle}`);
            }
          }
        }

        showToast(`Diet plan successfully saved as ${statusArg}!`, 'success');
      }

      setViewMode('list');
      fetchMemberPlans(selectedMemberId);
      setFormErrors({});
    } catch (err) {
      console.error('Save failed:', err);
      showToast(err.message || 'Failed to save diet plan.', 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="admin-pt-container" style={{ padding: 0 }}>
      {/* --- VIEW 1: LIST VIEW --- */}
      {viewMode === 'list' && (
        <>
          <div className="pt-purchase-layout" style={{ gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginTop: '0.5rem', alignItems: 'start' }}>
            {/* Sidebar Member directory */}
            <div className="pt-card flex-col" style={{ gap: '1rem', alignSelf: 'start' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                <i className="fas fa-users text-accent" style={{ marginRight: '6px' }}></i> Members Directory
              </h3>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
                <input
                  type="text"
                  placeholder="Search members by name or ID..."
                  className="pt-input"
                  style={{ paddingLeft: '34px' }}
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                />
              </div>
              <div style={{ marginTop: '4px', maxHeight: '435px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {loadingMembers ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.1rem' }}></i>
                    <p style={{ marginTop: '6px', fontSize: '0.8rem' }}>Loading directory...</p>
                  </div>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map(m => {
                    const isSelected = String(selectedMemberId) === String(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => { setSelectedMemberId(m.id); setSelectedPlanId(null); setViewMode('list'); }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                          background: isSelected ? 'rgba(79, 70, 229, 0.04)' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isSelected ? '#4f46e5' : '#e2e8f0',
                          color: isSelected ? '#ffffff' : '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}>
                          {m.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{m.email || m.id}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '10px' }}>No members found.</p>
                )}
              </div>
            </div>

            {/* Main view panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Selected Member Header Card */}
              {selectedMember && (
                <div className="pt-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff', padding: '16px 20px', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                      {selectedMember.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'white' }}>{selectedMember.name}</h2>
                        {memberSubscription ? (
                          memberSubscription.hasDietAccess ? (
                            <span className="pt-badge status-active" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.72rem', border: '1px solid rgba(16,185,129,0.3)' }}>
                              <i className="fas fa-check-circle"></i> Diet Entitlement Active ({memberSubscription.planName})
                            </span>
                          ) : (
                            <span className="pt-badge" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', fontSize: '0.72rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                              <i className="fas fa-exclamation-circle"></i> Lacks Diet Entitlement ({memberSubscription.planName})
                            </span>
                          )
                        ) : (
                          <span className="pt-badge" style={{ background: 'rgba(100, 116, 139, 0.25)', color: '#94a3b8', fontSize: '0.72rem', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
                            <i className="fas fa-exclamation-triangle"></i> No Active Subscription
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#c7d2fe', fontSize: '0.8rem', margin: '6px 0 0 0' }}>
                        ID: {selectedMember.id} • {calculateAge(memberProfile?.date_of_birth || memberProfile?.dob || selectedMember.dob) !== 'N/A' ? `${calculateAge(memberProfile?.date_of_birth || memberProfile?.dob || selectedMember.dob)} Years` : 'Age N/A'} • {memberProfile?.gender || selectedMember.gender || 'N/A'} • {displayVal(latestAssessment?.weight_kg || memberProfile?.weight_kg || memberProfile?.weight || selectedMember.weight, ' kg')} • {displayVal(latestAssessment?.height_cm || memberProfile?.height_cm || memberProfile?.height || selectedMember.height, ' cm')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                      <span style={{ color: '#c7d2fe' }}>Assigned Trainer</span>
                      <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>{assignedTrainerName}</div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                      {assignedTrainerName.split(' ').filter(Boolean).map(n => n[0]).join('')}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid split of Diet plans history + Active details */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedPlanId ? '1.8fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start', transition: 'all 0.3s ease-out' }}>
                {/* Diet Plans History Table */}
                <div className="pt-card flex-col" style={{ gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Diet Plan Records</h3>
                    <button className="pt-btn pt-btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={triggerCreateView} disabled={!selectedMemberId}>
                      <i className="fas fa-plus"></i> Create Diet Plan
                    </button>
                  </div>

                  {/* Status filter tabs */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0 8px 0' }}>
                    {['All Diet Plans', 'Active Plans', 'Expired Plans', 'Drafts'].map(tab => {
                      const isTabActive = (tab === 'All Diet Plans' && currentTab === 'All') ||
                        (tab === 'Active Plans' && currentTab === 'Active') ||
                        (tab === 'Expired Plans' && currentTab === 'Expired Plans') ||
                        (tab === 'Drafts' && currentTab === 'Drafts');
                      return (
                        <button
                          key={tab}
                          type="button"
                          className={`pt-filter-btn ${isTabActive ? 'active' : ''}`}
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          onClick={() => setCurrentTab(tab === 'All Diet Plans' ? 'All' : tab === 'Active Plans' ? 'Active' : tab === 'Expired Plans' ? 'Expired Plans' : 'Drafts')}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <table className="pt-table">
                      <thead>
                        <tr>
                          <th>Goal / Plan</th>
                          <th>Duration</th>
                          <th>Dates</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingPlans ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                              <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading plans...
                            </td>
                          </tr>
                        ) : filteredPlans.length > 0 ? (
                          filteredPlans.map(p => {
                            const pStatus = (p.status || 'DRAFT').toUpperCase();
                            return (
                              <tr
                                key={p.diet_plan_id}
                                style={{ cursor: 'pointer', background: selectedPlanId === p.diet_plan_id ? 'rgba(79, 70, 229, 0.03)' : 'transparent' }}
                                onClick={() => setSelectedPlanId(selectedPlanId === p.diet_plan_id ? null : p.diet_plan_id)}
                              >
                                <td>
                                  <div style={{ fontWeight: 600, color: '#334155' }}>{getGoalLabel(p.goal)} Diet Plan</div>
                                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>By: {p.trainer_name || 'Admin'}</span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{p.duration_days} Days</td>
                                <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                                  <span>{p.start_date} to {p.end_date}</span>
                                </td>
                                <td>
                                  <span className={`type-badge ${getStatusBadgeClass(p.status)}`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                                    {pStatus}
                                  </span>
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <button className="pt-icon-btn" style={{ color: '#0284c7' }} title="View Plan Details" onClick={() => setSelectedPlanId(p.diet_plan_id)}>
                                      <i className="far fa-eye"></i>
                                    </button>
                                    <button className="pt-icon-btn" style={{ color: '#4f46e5' }} title="Edit Plan" onClick={() => triggerEditView(p)}>
                                      <i className="far fa-edit"></i>
                                    </button>
                                    <button className="pt-icon-btn text-danger" title="Delete" onClick={() => handleDeletePlan(p.diet_plan_id)}>
                                      <i className="far fa-trash-alt"></i>
                                    </button>
                                    {pStatus !== 'ACTIVE' && pStatus !== 'COMPLETED' && (
                                      <button className="pt-btn pt-btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '6px' }} onClick={() => handleActivatePlan(p.diet_plan_id)}>
                                        Activate
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                              No plans matching current filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Details Panel Accordion */}
                {selectedPlanId && selectedPlan && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Panel Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Plan Preview Details</span>
                      <button
                        onClick={() => setSelectedPlanId(null)}
                        className="pt-icon-btn"
                        style={{
                          background: '#f1f5f9',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        title="Close Preview"
                      >
                        <i className="fas fa-times" style={{ color: '#475569', fontSize: '0.9rem' }}></i>
                      </button>
                    </div>

                    {/* Accordion 1: Plan Overview */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        onClick={() => setOpenPreviewAccordion(openPreviewAccordion === 'overview' ? null : 'overview')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                          border: '1px solid #cbd5e1',
                          borderLeft: '4px solid #4f46e5',
                          borderRadius: openPreviewAccordion === 'overview' ? '8px 8px 0 0' : '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          fontWeight: 600
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            <i className="fas fa-file-alt"></i>
                          </div>
                          <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600, color: '#334155' }}>
                            {getGoalLabel(selectedPlan.goal)} Plan
                          </h4>
                        </div>
                        <i className={`fas ${openPreviewAccordion === 'overview' ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#64748b', fontSize: '0.75rem' }}></i>
                      </div>
                      {openPreviewAccordion === 'overview' && (
                        <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Duration: {selectedPlan.duration_days} Days</span>
                            <span className={`type-badge ${getStatusBadgeClass(selectedPlan.status)}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>{(selectedPlan.status || 'DRAFT').toUpperCase()}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Dates: {selectedPlan.start_date} to {selectedPlan.end_date}</p>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Created By: {selectedPlan.trainer_name || 'Admin'}</p>

                          <h4 style={{ fontSize: '0.82rem', margin: '8px 0 2px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', color: '#334155', fontWeight: 600 }}>Overview Metrics</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}><i className="fas fa-tint"></i></div>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Water Intake</div>
                                <strong style={{ fontSize: '0.82rem', color: '#334155' }}>{selectedPlan.water_intake_l} Liters / Day</strong>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}><i className="fas fa-moon"></i></div>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sleep Duration</div>
                                <strong style={{ fontSize: '0.82rem', color: '#334155' }}>{selectedPlan.sleep_hours} Hours / Night</strong>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}><i className="fas fa-bullseye"></i></div>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Assigned Goal</div>
                                <strong style={{ fontSize: '0.82rem', color: '#334155' }}>{getGoalLabel(selectedPlan.goal)}</strong>
                              </div>
                            </div>
                          </div>

                          {selectedPlan.trainer_comments && (
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                              <strong style={{ fontSize: '0.8rem', color: '#334155' }}>Coach comments:</strong>
                              <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', margin: 0, fontStyle: 'italic' }}>
                                "{selectedPlan.trainer_comments}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Accordion 2: Meal Timeline Plan */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        onClick={() => setOpenPreviewAccordion(openPreviewAccordion === 'meals' ? null : 'meals')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                          border: '1px solid #cbd5e1',
                          borderLeft: '4px solid #6366f1',
                          borderRadius: openPreviewAccordion === 'meals' ? '8px 8px 0 0' : '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          fontWeight: 600
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            <i className="fas fa-clock"></i>
                          </div>
                          <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600, color: '#334155' }}>
                            Meal Timeline Plan
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                            {selectedPlanMeals.length}
                          </span>
                          <i className={`fas ${openPreviewAccordion === 'meals' ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#64748b', fontSize: '0.75rem' }}></i>
                        </div>
                      </div>
                      {openPreviewAccordion === 'meals' && (
                        <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                          {loadingMeals ? (
                            <div style={{ textAlign: 'center', padding: '10px', color: '#64748b' }}>
                              <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading meals...
                            </div>
                          ) : selectedPlanMeals.length > 0 ? (
                            selectedPlanMeals.map((meal, index) => {
                              const items = parseApiMealItems(meal.meal_items);
                              return (
                                <div key={index} style={{ display: 'flex', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px' }}>
                                  <div style={{ background: '#e0e7ff', color: '#4f46e5', width: '65px', height: '38px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 'bold', flexShrink: 0 }}>
                                    {meal.meal_time ? formatTime12h(meal.meal_time) : '08:00 AM'}
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{meal.meal_title}</div>
                                    <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '0.78rem', color: '#475569' }}>
                                      {items.map((item, itemIdx) => (
                                        <li key={itemIdx}>{item.food} - {item.quantity} {item.unit}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.8rem', margin: 0 }}>No meals defined in this plan.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Accordion 3: Trainer Guidelines (Recommendations) */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        onClick={() => setOpenPreviewAccordion(openPreviewAccordion === 'guidelines' ? null : 'guidelines')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                          border: '1px solid #cbd5e1',
                          borderLeft: '4px solid #6366f1',
                          borderRadius: openPreviewAccordion === 'guidelines' ? '10px 10px 0 0' : '10px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          fontWeight: 600
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            <i className="fas fa-list-ol"></i>
                          </div>
                          <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600, color: '#334155' }}>
                            Diet Guidelines
                          </h4>
                        </div>
                        <i className={`fas ${openPreviewAccordion === 'guidelines' ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#64748b', fontSize: '0.75rem' }}></i>
                      </div>
                      {openPreviewAccordion === 'guidelines' && (
                        <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 10px 10px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                          {(() => {
                            let recs = [];
                            try {
                              recs = typeof selectedPlan.recommendations === 'string'
                                ? JSON.parse(selectedPlan.recommendations)
                                : selectedPlan.recommendations || [];
                            } catch {
                              recs = Array.isArray(selectedPlan.recommendations) ? selectedPlan.recommendations : [];
                            }
                            return recs.length > 0 ? (
                              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {recs.map((item, itemIdx) => (
                                  <li key={itemIdx} style={{ listStyleType: 'none', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <i className="fas fa-check-circle" style={{ color: '#10b981', marginTop: '3px', fontSize: '0.85rem' }}></i>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.8rem', margin: 0 }}>No recommendations defined in this plan.</p>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- VIEW 2: CREATE / EDIT VIEW --- */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div style={{ marginTop: '0.5rem' }}>
          {/* Header */}
          <div className="pt-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', padding: '14px 20px' }}>
            <button className="pt-icon-btn" onClick={() => setViewMode('list')} style={{ background: '#f1f5f9', borderRadius: '50%', padding: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-arrow-left" style={{ color: '#475569' }}></i>
            </button>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{viewMode === 'create' ? 'Create Diet Plan' : 'Edit Diet Plan'}</h2>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Configure detailed meal splits and recommendations globally for {selectedMember?.name}.</p>
            </div>
          </div>

          {/* Builder Form Grid */}
          <div className="diet-builder-grid">
            {/* Column 1: Member Info & Plan Details */}
            <div className="pt-card flex-col" style={{ gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#0f172a', fontWeight: 700 }}>Plan Details</h3>

              {/* Member static details */}
              <div className="static-info-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px', color: '#334155' }}>Target Member Info</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>Name:</span><strong style={{ color: '#1e293b' }}>{selectedMember?.name || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>Age:</span><strong style={{ color: '#1e293b' }}>{calculateAge(memberProfile?.date_of_birth || memberProfile?.dob || selectedMember?.dob) !== 'N/A' ? `${calculateAge(memberProfile?.date_of_birth || memberProfile?.dob || selectedMember?.dob)} Years` : 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>Weight:</span><strong style={{ color: '#1e293b' }}>{displayVal(latestAssessment?.weight_kg || memberProfile?.weight_kg || memberProfile?.weight || selectedMember?.weight, ' kg')}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}><span style={{ color: '#64748b' }}>Height:</span><strong style={{ color: '#1e293b' }}>{displayVal(latestAssessment?.height_cm || memberProfile?.height_cm || memberProfile?.height || selectedMember?.height, ' cm')}</strong></div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Goal *</label>
                <select
                  className="pt-select"
                  value={planForm.goal}
                  onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
                >
                  {GOAL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Creator Trainer *</label>
                <select
                  className="pt-select"
                  value={String(planForm.trainerId || '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlanForm(prev => ({ ...prev, trainerId: val }));
                  }}
                >
                  <option value="">Select Trainer</option>
                  {trainers.map((t, index) => {
                    const tId = String(t.trainer_id || t.id || t.trainer_profile_id || t.user_id || t.trainer_user_id || '');
                    return (
                      <option key={tId || `tr-${index}`} value={tId}>
                        {t.name || t.full_name || 'Trainer'} (Trainer)
                      </option>
                    );
                  })}
                </select>
                {formErrors.trainerId && <div className="form-error-msg" style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '2px' }}>{formErrors.trainerId}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Duration (Days) *</label>
                <input
                  type="number"
                  className="pt-input"
                  placeholder="e.g. 30"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                />
                {formErrors.duration && <div className="form-error-msg" style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '2px' }}>{formErrors.duration}</div>}
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Start Date *</label>
                  <input
                    type="date"
                    className="pt-input"
                    value={planForm.startDate}
                    onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
                  />
                  {formErrors.startDate && <div className="form-error-msg" style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '2px' }}>{formErrors.startDate}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>End Date (Est.)</label>
                  <input
                    type="text"
                    className="pt-input"
                    disabled
                    style={{ background: '#f1f5f9', color: '#64748b' }}
                    value={getEstimatedEndDate(planForm.startDate, planForm.duration)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Water Intake (L/Day)</label>
                  <input
                    type="text"
                    className="pt-input"
                    placeholder="e.g. 3.5"
                    value={planForm.waterIntake}
                    onChange={(e) => setPlanForm({ ...planForm, waterIntake: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Sleep (Hours/Night)</label>
                  <input
                    type="text"
                    className="pt-input"
                    placeholder="e.g. 8"
                    value={planForm.sleepHours}
                    onChange={(e) => setPlanForm({ ...planForm, sleepHours: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Diet Plan Meals Timeline */}
            <div className="pt-card flex-col" style={{ gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Diet Plan Meals</h3>
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px' }} onClick={openAddMeal}>
                  <i className="fas fa-plus"></i> Add Meal
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px', maxHeight: '420px', overflowY: 'auto' }}>
                {mealsList.length > 0 ? (
                  mealsList.map((meal, index) => (
                    <div key={index} style={{ display: 'flex', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', position: 'relative' }}>
                      <div style={{ background: '#e0e7ff', color: '#4f46e5', width: '65px', height: '38px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 'bold', flexShrink: 0 }}>
                        {formatTime12h(meal.mealTime)}
                      </div>
                      <div style={{ paddingRight: '60px', minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '0.88rem', margin: 0, fontWeight: 600, color: '#0f172a' }}>{meal.mealTitle}</h4>
                        <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '0.78rem', color: '#475569' }}>
                          {(meal.mealItems || []).map((item, itemIdx) => (
                            <li key={itemIdx}>{item.food} - {item.quantity} {item.unit}</li>
                          ))}
                        </ul>
                        {meal.notes && <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0', fontStyle: 'italic' }}>Notes: {meal.notes}</p>}
                      </div>

                      {/* Action buttons inside card */}
                      <div style={{ position: 'absolute', right: '8px', top: '8px', display: 'flex', gap: '2px' }}>
                        <button type="button" className="pt-icon-btn" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }} onClick={() => openEditMeal(index)}>
                          <i className="far fa-edit"></i>
                        </button>
                        <button type="button" className="pt-icon-btn" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }} onClick={() => handleDuplicateMeal(index)}>
                          <i className="far fa-clone"></i>
                        </button>
                        <button type="button" className="pt-icon-btn text-danger" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }} onClick={() => handleDeleteMeal(index)}>
                          <i className="far fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                    No meals scheduled yet. Click "+ Add Meal" above to build a diet split.
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Recommendations & Comments */}
            <div className="pt-card flex-col" style={{ gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Recommendations</h3>
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px' }} onClick={addRecommendationRow}>
                  <i className="fas fa-plus"></i> Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {recommendationsList.map((rec, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{index + 1}.</span>
                    <input
                      type="text"
                      className="pt-input"
                      placeholder="e.g. Avoid carbonated soda"
                      value={rec}
                      onChange={(e) => handleRecommendationChange(index, e.target.value)}
                      required
                    />
                    {recommendationsList.length > 1 && (
                      <button type="button" className="pt-icon-btn text-danger" onClick={() => removeRecommendationRow(index)}>
                        <i className="far fa-trash-alt"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Trainer Comments</label>
                <textarea
                  rows="4"
                  className="pt-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Follow this plan strictly. Review progress in 15 days..."
                  value={planForm.trainerComments}
                  onChange={(e) => setPlanForm({ ...planForm, trainerComments: e.target.value })}
                ></textarea>
              </div>

              {/* Action row */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 'auto' }}>
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => setViewMode('list')} disabled={savingPlan}>Cancel</button>
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => handleSavePlanForm('DRAFT')} disabled={savingPlan}>
                  {savingPlan ? 'Saving...' : 'Save as Draft'}
                </button>
                <button type="button" className="pt-btn pt-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => handleSavePlanForm('ACTIVE')} disabled={savingPlan}>
                  {savingPlan ? 'Saving...' : 'Save & Assign Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MEAL MODAL --- */}
      {isMealModalOpen && (
        <div className="pt-modal-backdrop">
          <div className="pt-modal-card" style={{ maxWidth: '600px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{editingMealIndex !== null ? 'Edit Meal' : 'Add Meal'}</h3>
              <button className="pt-icon-btn" onClick={() => setIsMealModalOpen(false)} style={{ fontSize: '1.2rem' }}>&times;</button>
            </div>
            <form onSubmit={handleMealSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Meal Title *</label>
                    <input
                      type="text"
                      className="pt-input"
                      placeholder="e.g. Breakfast, Pre Workout"
                      value={mealForm.mealTitle}
                      onChange={(e) => setMealForm({ ...mealForm, mealTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Meal Time *</label>
                    <input
                      type="time"
                      className="pt-input"
                      value={mealForm.mealTime}
                      onChange={(e) => setMealForm({ ...mealForm, mealTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#334155' }}>Food Items *</strong>
                  <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={addFoodItemRow}>
                    <i className="fas fa-plus"></i> Add Item
                  </button>
                </div>

                <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table className="pt-table">
                    <thead>
                      <tr>
                        <th style={{ padding: '8px 12px' }}>Food Item</th>
                        <th style={{ padding: '8px 12px' }}>Quantity</th>
                        <th style={{ padding: '8px 12px' }}>Unit</th>
                        <th style={{ width: '40px', padding: '8px 12px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealForm.mealItems.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              className="pt-input"
                              placeholder="e.g. Rolled Oats"
                              value={item.food || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMealForm(prev => ({
                                  ...prev,
                                  mealItems: prev.mealItems.map((item, i) => i === idx ? { ...item, food: val } : item)
                                }));
                              }}
                              required
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              className="pt-input"
                              placeholder="e.g. 100"
                              value={item.quantity === null || item.quantity === undefined ? '' : item.quantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMealForm(prev => ({
                                  ...prev,
                                  mealItems: prev.mealItems.map((item, i) => i === idx ? { ...item, quantity: val } : item)
                                }));
                              }}
                              required
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <select
                              className="pt-select"
                              value={item.unit || 'g'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMealForm(prev => ({
                                  ...prev,
                                  mealItems: prev.mealItems.map((item, i) => i === idx ? { ...item, unit: val } : item)
                                }));
                              }}
                            >
                              <option value="g">g</option>
                              <option value="ml">ml</option>
                              <option value="pcs">pcs</option>
                              <option value="slices">slices</option>
                              <option value="glass">glass</option>
                              <option value="scoop">scoop</option>
                            </select>
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                            {mealForm.mealItems.length > 1 && (
                              <button type="button" className="pt-icon-btn text-danger" style={{ padding: '4px' }} onClick={() => removeFoodItemRow(idx)}>
                                <i className="far fa-trash-alt"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Notes (Optional)</label>
                  <textarea
                    rows="3"
                    className="pt-input"
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    placeholder="e.g. Take with 1 glass warm water"
                    value={mealForm.notes}
                    onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => setIsMealModalOpen(false)}>Cancel</button>
                <button type="submit" className="pt-btn pt-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Save Meal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 99999,
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} style={{ fontSize: '1rem' }}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminDietPlans;
