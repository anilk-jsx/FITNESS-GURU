import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../../utils/tokenManager';
import './TrainerDashboard.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const API_BASE_URL = tokenManager.API_BASE_URL;

const GOAL_OPTIONS = [
  { value: 'FAT_LOSS', label: 'Fat Loss' },
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'WEIGHT_GAIN', label: 'Weight Gain' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain' },
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness' },
];

const STATUS_MAP = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const PLAN_TABS = [
  { id: 'ALL', label: 'All Diet Plans' },
  { id: 'ACTIVE', label: 'Active Plans' },
  { id: 'EXPIRED', label: 'Expired Plans' },
  { id: 'DRAFTS', label: 'Drafts' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const goalLabel = (val) => GOAL_OPTIONS.find(g => g.value === val)?.label || val;
const statusLabel = (val) => STATUS_MAP[val] || val;

/** Convert 24h "HH:MM:SS" to "h:MM AM/PM" */
const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
};

/** Calculate end date from start + duration */
const calculateEndDate = (startDate, durationDays) => {
  if (!startDate || !durationDays) return '';
  const start = new Date(startDate);
  start.setDate(start.getDate() + parseInt(durationDays, 10));
  return start.toISOString().split('T')[0];
};

// ─── API → Component Normalizers ─────────────────────────────────────────────
const normalizeMeal = (m) => ({
  id: m.meal_id,
  dietPlanId: m.diet_plan_id,
  mealOrder: m.meal_order,
  mealTitle: m.meal_title,
  mealTime: m.meal_time || '',
  mealItems: typeof m.meal_items === 'string' ? JSON.parse(m.meal_items) : (m.meal_items || []),
  notes: m.notes || '',
});

const normalizePlan = (p) => ({
  id: p.diet_plan_id,
  memberId: p.member_id,
  memberName: p.member_name || '',
  trainerId: p.trainer_id,
  trainerName: p.trainer_name || '',
  goal: p.goal,
  duration: p.duration_days,
  waterIntake: p.water_intake_l,
  sleepHours: p.sleep_hours,
  recommendations: typeof p.recommendations === 'string' ? JSON.parse(p.recommendations) : (p.recommendations || []),
  trainerComments: p.trainer_comments || '',
  startDate: p.start_date,
  endDate: p.end_date || '',
  status: p.status,
  createdBy: p.created_by,
  creatorName: p.creator_name || '',
  meals: (p.meals || []).map(normalizeMeal),
  mealsLoaded: !!(p.meals && p.meals.length >= 0),
});

const normalizeMember = (m) => ({
  id: m.user_id,
  name: m.name,
  email: m.email || '',
  phone: m.phone || '',
  status: m.status,
  dateOfJoining: m.date_of_joining || '',
  gender: m.gender || '',
  fitnessLevel: m.fitness_level || '',
  goalFocus: m.goal_focus || '',
  pt_credits: m.pt_credits || 0,
});

// ─── Component ───────────────────────────────────────────────────────────────
const TrainerDietPlans = () => {
  // 1. Current user
  const [trainerData, setTrainerData] = useState(null);

  // 2. Members Directory (from API)
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // 3. Diet Plans (from API)
  const [dietPlans, setDietPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [currentTab, setCurrentTab] = useState('ALL');

  // 4. Screen View Mode
  const [viewMode, setViewMode] = useState('list');

  // 5. Form States for creating/editing
  const [planForm, setPlanForm] = useState({
    id: null,
    memberId: '',
    goal: 'FAT_LOSS',
    duration: '',
    startDate: '',
    waterIntake: '',
    sleepHours: '',
    status: 'DRAFT',
    trainerComments: '',
  });
  const [mealsList, setMealsList] = useState([]);
  const [deletedMealIds, setDeletedMealIds] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [saving, setSaving] = useState(false);

  // 6. Meal Form Modal State
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [mealForm, setMealForm] = useState({
    mealTitle: '',
    mealTime: '08:00',
    notes: '',
    mealItems: [{ food: '', quantity: '', unit: 'g' }],
  });

  const [formErrors, setFormErrors] = useState({});

  // ─── API Fetch Functions ─────────────────────────────────────────────────
  const fetchAssignedMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/members`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        const normalized = data.data.map(normalizeMember);
        setMembers(normalized);
        // Auto-select the first member
        if (normalized.length > 0 && !selectedMemberId) {
          setSelectedMemberId(normalized[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assigned members:', err);
      alert('Failed to load assigned members. Please refresh the page.');
    } finally {
      setMembersLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMemberDietPlans = useCallback(async (memberId) => {
    if (!memberId) return;
    setPlansLoading(true);
    setDietPlans([]);
    setSelectedPlanId(null);
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/members/${memberId}/diet-plans`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        const normalized = data.data.map(normalizePlan);
        setDietPlans(normalized);
        // Auto-select the active plan, or first plan
        if (normalized.length > 0) {
          const activePlan = normalized.find(p => p.status === 'ACTIVE');
          setSelectedPlanId(activePlan ? activePlan.id : normalized[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch diet plans:', err);
      alert('Failed to load diet plans.');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchPlanMeals = useCallback(async (planId) => {
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/diet-plans/${planId}/meals`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        const meals = data.data.map(normalizeMeal);
        setDietPlans(prev => prev.map(p =>
          p.id === planId ? { ...p, meals, mealsLoaded: true } : p
        ));
      }
    } catch (err) {
      console.error('Failed to fetch plan meals:', err);
    }
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = tokenManager.getUserData();
    if (user) setTrainerData(user);
    fetchAssignedMembers();
  }, [fetchAssignedMembers]);

  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberDietPlans(selectedMemberId);
    }
  }, [selectedMemberId, fetchMemberDietPlans]);

  // ─── Derived Data ────────────────────────────────────────────────────────
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    String(m.id).toLowerCase().includes(searchMemberQuery.toLowerCase())
  );

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const memberPlans = dietPlans;
  const filteredPlans = memberPlans.filter(p => {
    if (currentTab === 'ACTIVE') return p.status === 'ACTIVE';
    if (currentTab === 'EXPIRED') return p.status === 'COMPLETED' || p.status === 'CANCELLED';
    if (currentTab === 'DRAFTS') return p.status === 'DRAFT';
    return true;
  });

  const selectedPlan = dietPlans.find(p => p.id === selectedPlanId) || null;

  // ─── Plan Selection Handler ──────────────────────────────────────────────
  const handleSelectPlan = async (planId) => {
    setSelectedPlanId(planId);
    const plan = dietPlans.find(p => p.id === planId);
    if (plan && !plan.mealsLoaded) {
      await fetchPlanMeals(planId);
    }
  };

  // ─── CRUD Handlers ───────────────────────────────────────────────────────
  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/diet-plans/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Diet plan deleted successfully.');
        if (selectedPlanId === id) setSelectedPlanId(null);
        fetchMemberDietPlans(selectedMemberId);
      } else {
        alert(data.message || 'Failed to delete diet plan.');
      }
    } catch (err) {
      console.error('Delete plan failed:', err);
      alert('Failed to delete diet plan. Please try again.');
    }
  };

  const handleActivatePlan = async (id) => {
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/diet-plans/${id}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Diet plan activated successfully.');
        fetchMemberDietPlans(selectedMemberId);
      } else {
        alert(data.message || 'Failed to activate diet plan.');
      }
    } catch (err) {
      console.error('Activate plan failed:', err);
      alert('Failed to activate diet plan. Please try again.');
    }
  };

  const handleClonePlan = async (plan) => {
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/diet-plans/${plan.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Plan template cloned successfully as Draft!');
        fetchMemberDietPlans(selectedMemberId);
      } else {
        alert(data.message || 'Failed to clone diet plan.');
      }
    } catch (err) {
      console.error('Clone plan failed:', err);
      alert('Failed to clone diet plan. Please try again.');
    }
  };

  // ─── Create / Edit Screen Triggers ───────────────────────────────────────
  const triggerCreateView = () => {
    setPlanForm({
      id: null,
      memberId: selectedMemberId,
      goal: 'FAT_LOSS',
      duration: '30',
      startDate: new Date().toISOString().split('T')[0],
      waterIntake: '3.5',
      sleepHours: '8.0',
      status: 'DRAFT',
      trainerComments: '',
    });
    setMealsList([]);
    setDeletedMealIds([]);
    setRecommendations(['Drink 3-4 liters of water daily', 'Avoid processed food']);
    setViewMode('create');
    setFormErrors({});
  };

  const triggerEditView = (plan) => {
    setPlanForm({
      id: plan.id,
      memberId: plan.memberId,
      goal: plan.goal,
      duration: String(plan.duration),
      startDate: plan.startDate,
      waterIntake: String(plan.waterIntake),
      sleepHours: String(plan.sleepHours),
      status: plan.status,
      trainerComments: plan.trainerComments,
    });
    setMealsList(plan.meals || []);
    setDeletedMealIds([]);
    setRecommendations(plan.recommendations || []);
    setViewMode('edit');
    setFormErrors({});
  };

  // ─── Meal Modal Functions ────────────────────────────────────────────────
  const openAddMeal = () => {
    setEditingMealIndex(null);
    setMealForm({
      mealTitle: '',
      mealTime: '08:00',
      notes: '',
      mealItems: [{ food: '', quantity: '', unit: 'g' }],
    });
    setIsMealModalOpen(true);
  };

  const openEditMeal = (index) => {
    setEditingMealIndex(index);
    const meal = mealsList[index];
    setMealForm({
      ...meal,
      // Ensure mealTime is in HH:MM format for time input
      mealTime: meal.mealTime ? meal.mealTime.substring(0, 5) : '08:00',
    });
    setIsMealModalOpen(true);
  };

  const handleDeleteMeal = (index) => {
    const meal = mealsList[index];
    // Track ID for API deletion when editing an existing plan
    if (meal.id && viewMode === 'edit') {
      setDeletedMealIds(prev => [...prev, meal.id]);
    }
    setMealsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateMeal = (index) => {
    const meal = mealsList[index];
    const duplicated = {
      ...meal,
      mealTitle: `${meal.mealTitle} (Copy)`,
      id: undefined, // New meal, will be created on save
    };
    setMealsList([...mealsList, duplicated]);
  };

  const addFoodItemRow = () => {
    setMealForm(prev => ({
      ...prev,
      mealItems: [...prev.mealItems, { food: '', quantity: '', unit: 'g' }],
    }));
  };

  const removeFoodItemRow = (idx) => {
    setMealForm(prev => ({
      ...prev,
      mealItems: prev.mealItems.filter((_, i) => i !== idx),
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

    // Normalize time to HH:MM:SS for consistent storage
    const normalizedMeal = {
      ...mealForm,
      mealTime: mealForm.mealTime.length === 5 ? `${mealForm.mealTime}:00` : mealForm.mealTime,
    };

    if (editingMealIndex !== null) {
      setMealsList(prev => prev.map((m, i) => i === editingMealIndex ? { ...m, ...normalizedMeal } : m));
    } else {
      setMealsList([...mealsList, { ...normalizedMeal, id: undefined }]);
    }
    setIsMealModalOpen(false);
  };

  // ─── Recommendations Handlers ────────────────────────────────────────────
  const addRecommendation = () => {
    setRecommendations(prev => [...prev, '']);
  };

  const updateRecommendation = (idx, value) => {
    setRecommendations(prev => prev.map((r, i) => i === idx ? value : r));
  };

  const removeRecommendation = (idx) => {
    setRecommendations(prev => prev.filter((_, i) => i !== idx));
  };

  // ─── Main Form Save Handler ──────────────────────────────────────────────
  const handleSavePlanForm = async (statusArg) => {
    // Validation
    let errs = {};
    if (!planForm.duration || isNaN(planForm.duration)) errs.duration = 'Valid duration days required';
    if (!planForm.startDate) errs.startDate = 'Start date is required';
    if (mealsList.length === 0) {
      alert('A diet plan must contain at least one meal');
      return;
    }
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      alert('Please review form validation warnings');
      return;
    }

    // Filter out empty recommendations
    const cleanRecommendations = recommendations.filter(r => r.trim() !== '');

    setSaving(true);
    try {
      if (viewMode === 'create') {
        // ── CREATE: POST plan, then POST each meal ──
        const planPayload = {
          goal: planForm.goal,
          duration_days: parseInt(planForm.duration, 10),
          start_date: planForm.startDate,
          water_intake_l: parseFloat(planForm.waterIntake) || 3.5,
          sleep_hours: parseFloat(planForm.sleepHours) || 8.0,
          recommendations: cleanRecommendations,
          trainer_comments: planForm.trainerComments,
          status: statusArg,
        };

        const planRes = await tokenManager.apiCall(
          `${API_BASE_URL}/api/trainer/members/${planForm.memberId}/diet-plans`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planPayload),
          }
        );
        const planData = await planRes.json();

        if (planData.status !== 'success') {
          alert(planData.message || 'Failed to create diet plan.');
          setSaving(false);
          return;
        }

        const newPlanId = planData.diet_plan_id;

        // Create each meal under the new plan
        for (const meal of mealsList) {
          const mealPayload = {
            meal_title: meal.mealTitle,
            meal_time: meal.mealTime.length === 5 ? `${meal.mealTime}:00` : meal.mealTime,
            meal_items: meal.mealItems.map(item => ({
              food: item.food,
              quantity: Number(item.quantity),
              unit: item.unit,
            })),
            notes: meal.notes || '',
          };

          await tokenManager.apiCall(
            `${API_BASE_URL}/api/trainer/diet-plans/${newPlanId}/meals`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mealPayload),
            }
          );
        }

        alert(`Diet plan successfully created as ${statusLabel(statusArg)}!`);
        setViewMode('list');
        fetchMemberDietPlans(selectedMemberId);

      } else if (viewMode === 'edit') {
        // ── EDIT: PUT plan, then reconcile meals ──
        const planPayload = {
          goal: planForm.goal,
          duration_days: parseInt(planForm.duration, 10),
          start_date: planForm.startDate,
          water_intake_l: parseFloat(planForm.waterIntake) || 3.5,
          sleep_hours: parseFloat(planForm.sleepHours) || 8.0,
          recommendations: cleanRecommendations,
          trainer_comments: planForm.trainerComments,
          status: statusArg,
        };

        const planRes = await tokenManager.apiCall(
          `${API_BASE_URL}/api/trainer/diet-plans/${planForm.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planPayload),
          }
        );
        const planData = await planRes.json();

        if (planData.status !== 'success') {
          alert(planData.message || 'Failed to update diet plan.');
          setSaving(false);
          return;
        }

        // Delete removed meals
        for (const mealId of deletedMealIds) {
          await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/meals/${mealId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Update existing meals / Create new meals
        for (const meal of mealsList) {
          const mealPayload = {
            meal_title: meal.mealTitle,
            meal_time: meal.mealTime.length === 5 ? `${meal.mealTime}:00` : meal.mealTime,
            meal_items: meal.mealItems.map(item => ({
              food: item.food,
              quantity: Number(item.quantity),
              unit: item.unit,
            })),
            notes: meal.notes || '',
          };

          if (meal.id) {
            // Update existing meal
            await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/meals/${meal.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mealPayload),
            });
          } else {
            // Create new meal
            await tokenManager.apiCall(
              `${API_BASE_URL}/api/trainer/diet-plans/${planForm.id}/meals`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mealPayload),
              }
            );
          }
        }

        alert(`Diet plan successfully updated as ${statusLabel(statusArg)}!`);
        setViewMode('list');
        fetchMemberDietPlans(selectedMemberId);
      }
    } catch (err) {
      console.error('Save plan failed:', err);
      alert('Failed to save diet plan. Please try again.');
    } finally {
      setSaving(false);
      setFormErrors({});
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── RENDER ────────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      
      {/* ────────────────── VIEW 1: HISTORY LIST & METRICS ────────────────── */}
      {viewMode === 'list' && (
        <>
          <div className="page-header">
            <div className="page-header-titles">
              <h1>Diet Plans</h1>
              <p>Assign nutritional splits, calendar schedules, and macro instructions to members.</p>
            </div>
          </div>

          <div className="diet-plans-layout">
            
            {/* Sidebar Member directory */}
            <div className="clients-list-panel" style={{ height: 'auto', alignSelf: 'stretch' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '10px' }}>Members</h3>
              <div className="search-box-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  className="client-search-input"
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                />
              </div>
              <div className="clients-list-scrollable" style={{ marginTop: '12px' }}>
                {membersLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.2rem' }}></i>
                    <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Loading members...</p>
                  </div>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map(m => (
                    <div 
                      key={m.id}
                      className={`client-row-item ${selectedMemberId === m.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedMemberId(m.id); setViewMode('list'); }}
                    >
                      <div className="profile-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                        {m.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div className="client-brief-info">
                        <h4>{m.name}</h4>
                        <p className="client-sub-txt">ID: {m.id}</p>
                      </div>
                      {dietPlans.some(p => p.memberId === m.id && p.status === 'ACTIVE') && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', alignSelf: 'center' }}></span>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px' }}>No members found.</p>
                )}
              </div>
            </div>

            {/* Main view panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Selected Member Header Card */}
              {selectedMember && (
                <div className="m-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="profile-avatar" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                      {selectedMember.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedMember.name}</h2>
                        <span className="m-badge success" style={{ fontSize: '0.7rem' }}>Active Member</span>
                        {selectedMember.pt_credits > 0 ? (
                          <span className="m-badge success" style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                            <i className="fas fa-dumbbell"></i> PT Active ({selectedMember.pt_credits} Credits)
                          </span>
                        ) : (
                          <span className="m-badge danger" style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <i className="fas fa-exclamation-triangle"></i> PT Inactive (0 Credits)
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                        ID: {selectedMember.id} | {selectedMember.gender}{selectedMember.fitnessLevel ? ` | Level: ${selectedMember.fitnessLevel}` : ''}{selectedMember.goalFocus ? ` | Goal: ${goalLabel(selectedMember.goalFocus)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned Trainer</span>
                      <div style={{ fontWeight: 600 }}>{trainerData?.name || 'Trainer'}</div>
                    </div>
                    <div className="profile-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', background: '#3b82f6' }}>
                      {(trainerData?.name || 'T').split(' ').map(n=>n[0]).join('')}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid split of Diet plans history + Active details */}
              <div className="diet-plans-split-grid">
                
                {/* Diet Plans History Table */}
                <div className="m-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="m-card-title" style={{ margin: 0 }}>Diet Plans</h3>
                    <button className="btn-primary" onClick={triggerCreateView}>
                      <i className="fas fa-plus"></i> Create Diet Plan
                    </button>
                  </div>

                  {/* Status filter tabs */}
                  <div className="trainer-tabs-container" style={{ marginBottom: '16px' }}>
                    {PLAN_TABS.map(tab => (
                      <button 
                        key={tab.id}
                        className={`btn-pagination ${currentTab === tab.id ? 'active' : ''}`}
                        style={{
                          background: currentTab === tab.id ? 'var(--primary-light)' : 'transparent',
                          color: currentTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                          border: currentTab === tab.id ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem'
                        }}
                        onClick={() => setCurrentTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="table-responsive-wrapper">
                    {plansLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.4rem' }}></i>
                        <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>Loading diet plans...</p>
                      </div>
                    ) : (
                      <table className="m-table">
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
                          {filteredPlans.length > 0 ? (
                            filteredPlans.map(p => (
                              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectPlan(p.id)}>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{goalLabel(p.goal)} Diet Plan</div>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{goalLabel(p.goal)}</span>
                                </td>
                                <td>{p.duration} Days</td>
                                <td>
                                  <span style={{ fontSize: '0.8rem' }}>{p.startDate}{p.endDate ? ` to ${p.endDate}` : ''}</span>
                                </td>
                                <td>
                                  <span className={`m-badge ${p.status === 'ACTIVE' ? 'success' : (p.status === 'DRAFT' ? 'warning' : (p.status === 'CANCELLED' ? 'danger' : 'primary'))}`}>
                                    {statusLabel(p.status)}
                                  </span>
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                  <div className="m-table-actions">
                                    <button className="btn-icon" title="Edit Plan" onClick={() => triggerEditView(p)}>
                                      <i className="far fa-edit"></i>
                                    </button>
                                    <button className="btn-icon" title="Clone/Copy" onClick={() => handleClonePlan(p)}>
                                      <i className="far fa-clone"></i>
                                    </button>
                                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => handleDeletePlan(p.id)}>
                                      <i className="far fa-trash-alt"></i>
                                    </button>
                                    {p.status !== 'ACTIVE' && p.status !== 'COMPLETED' && (
                                      <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => handleActivatePlan(p.id)}>
                                        Activate
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                No plans matching current filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Right Details Card */}
                <div>
                  {selectedPlan ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Active overview metrics */}
                      <div className="m-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{goalLabel(selectedPlan.goal)} Diet Plan</h4>
                          <span className={`m-badge ${selectedPlan.status === 'ACTIVE' ? 'success' : (selectedPlan.status === 'DRAFT' ? 'warning' : 'primary')}`} style={{ fontSize: '0.65rem' }}>{statusLabel(selectedPlan.status)}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Duration: {selectedPlan.duration} Days ({selectedPlan.startDate}{selectedPlan.endDate ? ` to ${selectedPlan.endDate}` : ''})</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Created By: {selectedPlan.creatorName || selectedPlan.trainerName}</p>
                        
                        <h4 style={{ fontSize: '0.95rem', margin: '20px 0 12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Overview Metrics</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="kpi-icon-box primary" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}><i className="fas fa-tint"></i></div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Water Intake</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedPlan.waterIntake} Liters / Day</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="kpi-icon-box secondary" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}><i className="fas fa-moon"></i></div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sleep Duration</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedPlan.sleepHours} Hours / Night</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="kpi-icon-box success" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}><i className="fas fa-bullseye"></i></div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Goal</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{goalLabel(selectedPlan.goal)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Meals Timeline preview card */}
                      <div className="m-card">
                        <h3 className="m-card-title">Meal Timeline Plan</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                          {selectedPlan.mealsLoaded === false ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                              <i className="fas fa-spinner fa-spin"></i> Loading meals...
                            </div>
                          ) : selectedPlan.meals && selectedPlan.meals.length > 0 ? (
                            selectedPlan.meals.map((meal, index) => (
                              <div key={meal.id || index} className="schedule-card-item" style={{ alignItems: 'flex-start' }}>
                                <div className="schedule-card-time" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', width: '70px', height: '44px' }}>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>{formatTime12h(meal.mealTime)}</span>
                                </div>
                                <div className="schedule-card-info" style={{ paddingTop: '2px' }}>
                                  <h4 style={{ fontSize: '0.9rem' }}>{meal.mealTitle}</h4>
                                  <ul className="meal-items-list-bullet" style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                                    {meal.mealItems.map((item, itemIdx) => (
                                      <li key={itemIdx}>{item.food} - {item.quantity} {item.unit}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No meals defined in this plan.</p>
                          )}
                        </div>
                      </div>

                      {/* Recommendations and Trainer comments */}
                      <div className="m-card">
                        <h3 className="m-card-title">Trainer Guidelines</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                          {selectedPlan.recommendations && selectedPlan.recommendations.length > 0 ? (
                            <div className="recommendation-section-card">
                              <div className="section-card-header" style={{ padding: '10px 14px' }}>
                                <div className="section-card-title-group">
                                  <div className="section-card-icon-circle"><i className="fas fa-clipboard-list"></i></div>
                                  <h4 style={{ fontSize: '0.9rem' }}>Recommendations</h4>
                                </div>
                                <span className="section-card-badge">{selectedPlan.recommendations.length}</span>
                              </div>
                              <div className="section-card-body">
                                <ul className="section-items-list">
                                  {selectedPlan.recommendations.map((rec, idx) => (
                                    <li key={idx} className="section-item-li">{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recommendations added.</p>
                          )}

                          {selectedPlan.trainerComments && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                              <strong style={{ fontSize: '0.88rem' }}>Coach comments:</strong>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                                &quot;{selectedPlan.trainerComments}&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="m-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {plansLoading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Loading...</>
                      ) : (
                        'Select a diet plan to preview details.'
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </>
      )}

      {/* ────────────────── VIEW 2: FORM BUILDER (CREATE / EDIT) ────────────────── */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div style={{ animation: 'viewFadeIn 0.3s ease-out' }}>
          {/* Header */}
          <div className="page-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="btn-icon" onClick={() => setViewMode('list')} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }}>
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h1 style={{ fontSize: '1.6rem' }}>{viewMode === 'create' ? 'Create Diet Plan' : 'Edit Diet Plan'}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure detailed meal splits and activity recommendations for {selectedMember?.name}.</p>
              </div>
            </div>
          </div>

          {/* Builder Form Grid */}
          <div className="diet-builder-grid">
            
            {/* Column 1: Member Info & Plan Details */}
            <div className="m-card">
              <h3 className="m-card-title" style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Plan Details</h3>
              
              {/* Member static details */}
              <div className="static-info-card" style={{ marginTop: '14px' }}>
                <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '10px' }}>Target Member Info</strong>
                <div className="static-info-row"><span>Name:</span><strong>{selectedMember?.name}</strong></div>
                <div className="static-info-row"><span>Gender:</span><strong>{selectedMember?.gender || 'N/A'}</strong></div>
                <div className="static-info-row"><span>Fitness Level:</span><strong>{selectedMember?.fitnessLevel || 'N/A'}</strong></div>
                <div className="static-info-row"><span>Goal Focus:</span><strong>{selectedMember?.goalFocus ? goalLabel(selectedMember.goalFocus) : 'N/A'}</strong></div>
              </div>

              {/* Form Metadata */}
              <div className="form-group">
                <label className="form-label">Goal *</label>
                <select 
                  className="form-select"
                  value={planForm.goal}
                  onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
                >
                  {GOAL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Days) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 45"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                />
                {formErrors.duration && <div className="form-error-msg">{formErrors.duration}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={planForm.startDate}
                    onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
                  />
                  {formErrors.startDate && <div className="form-error-msg">{formErrors.startDate}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">End Date (Calculated)</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={calculateEndDate(planForm.startDate, planForm.duration)}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Water Intake (L/Day)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 4.0"
                    value={planForm.waterIntake}
                    onChange={(e) => setPlanForm({ ...planForm, waterIntake: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sleep (Hours/Night)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 8"
                    value={planForm.sleepHours}
                    onChange={(e) => setPlanForm({ ...planForm, sleepHours: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Diet Plan Meals Timeline */}
            <div className="m-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
                <h3 className="m-card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Diet Plan Meals</h3>
                <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={openAddMeal}>
                  <i className="fas fa-plus"></i> Add Meal
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mealsList.length > 0 ? (
                  mealsList.map((meal, index) => (
                    <div key={meal.id || index} className="schedule-card-item" style={{ alignItems: 'flex-start', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                      <div className="schedule-card-time" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', width: '70px', height: '44px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>{formatTime12h(meal.mealTime)}</span>
                      </div>
                      <div className="schedule-card-info" style={{ paddingRight: '60px' }}>
                        <h4 style={{ fontSize: '0.92rem' }}>{meal.mealTitle}</h4>
                        <ul className="meal-items-list-bullet" style={{ marginTop: '4px', fontSize: '0.82rem' }}>
                          {meal.mealItems.map((item, itemIdx) => (
                            <li key={itemIdx}>{item.food} - {item.quantity} {item.unit}</li>
                          ))}
                        </ul>
                        {meal.notes && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>Notes: {meal.notes}</p>}
                      </div>
                      
                      {/* Action buttons inside card */}
                      <div style={{ position: 'absolute', right: '12px', top: '12px', display: 'flex', gap: '4px' }}>
                        <button type="button" className="btn-icon" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }} onClick={() => openEditMeal(index)}>
                          <i className="far fa-edit"></i>
                        </button>
                        <button type="button" className="btn-icon" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }} onClick={() => handleDuplicateMeal(index)}>
                          <i className="far fa-clone"></i>
                        </button>
                        <button type="button" className="btn-icon" style={{ width: '24px', height: '24px', fontSize: '0.75rem', color: 'var(--danger)' }} onClick={() => handleDeleteMeal(index)}>
                          <i className="far fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No meals scheduled yet. Click &quot;+ Add Meal&quot; above to build a workout split daily diet.
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Recommendations & Comments */}
            <div className="m-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
                <h3 className="m-card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Recommendations</h3>
                <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={addRecommendation}>
                  <i className="fas fa-plus"></i> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: '18px' }}>{idx + 1}.</span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Avoid carbonated soda"
                        value={rec}
                        onChange={(e) => updateRecommendation(idx, e.target.value)}
                      />
                      <button type="button" className="btn-icon" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => removeRecommendation(idx)}>
                        <i className="far fa-trash-alt"></i>
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    No recommendations added yet. Click &quot;+ Add&quot; to add dietary recommendations.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Trainer Comments</label>
                <textarea 
                  rows="4" 
                  className="form-textarea"
                  placeholder="Follow this plan strictly. Review progress in 15 days..."
                  value={planForm.trainerComments}
                  onChange={(e) => setPlanForm({ ...planForm, trainerComments: e.target.value })}
                ></textarea>
              </div>

              {/* Action row */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setViewMode('list')} disabled={saving}>Cancel</button>
                <button type="button" className="btn-secondary" onClick={() => handleSavePlanForm('DRAFT')} disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save as Draft'}
                </button>
                <button type="button" className="btn-primary" onClick={() => handleSavePlanForm('ACTIVE')} disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save & Assign Plan'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────── MEAL MODAL ────────────────── */}
      {isMealModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container large" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{editingMealIndex !== null ? 'Edit Meal' : 'Add Meal'}</h3>
              <button className="modal-close-btn" onClick={() => setIsMealModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleMealSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Meal Title *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Breakfast, Pre Workout"
                      value={mealForm.mealTitle}
                      onChange={(e) => setMealForm({ ...mealForm, mealTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meal Time *</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      value={mealForm.mealTime}
                      onChange={(e) => setMealForm({ ...mealForm, mealTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <strong style={{ fontSize: '0.88rem' }}>Food Items *</strong>
                  <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={addFoodItemRow}>
                    <i className="fas fa-plus"></i> Add Item
                  </button>
                </div>

                <table className="food-items-table">
                  <thead>
                    <tr>
                      <th>Food Item</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealForm.mealItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. Rolled Oats"
                            value={item.food}
                            onChange={(e) => {
                              const updated = [...mealForm.mealItems];
                              updated[idx].food = e.target.value;
                              setMealForm({ ...mealForm, mealItems: updated });
                            }}
                            required
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. 100"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...mealForm.mealItems];
                              updated[idx].quantity = e.target.value;
                              setMealForm({ ...mealForm, mealItems: updated });
                            }}
                            required
                          />
                        </td>
                        <td>
                          <select 
                            className="form-select"
                            value={item.unit}
                            onChange={(e) => {
                              const updated = [...mealForm.mealItems];
                              updated[idx].unit = e.target.value;
                              setMealForm({ ...mealForm, mealItems: updated });
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
                        <td>
                          {mealForm.mealItems.length > 1 && (
                            <button type="button" className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => removeFoodItemRow(idx)}>
                              <i className="far fa-trash-alt"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea 
                    rows="3" 
                    className="form-textarea" 
                    placeholder="e.g. Take with 1 glass warm water"
                    value={mealForm.notes}
                    onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsMealModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Meal</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainerDietPlans;
