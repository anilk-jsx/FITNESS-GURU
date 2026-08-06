import React, { useState } from 'react';
import './AdminPTManagement.css';

const AdminDietPlans = () => {
  // Members List (All members, in Admin Panel)
  const [members, setMembers] = useState([
    { id: 'M-1001', name: 'Rahul Sharma', age: 28, weight: 70, height: 175, gender: 'Male', trainer: 'Raj Verma', pt_credits: 8, is_pt_active: true },
    { id: 'M-1002', name: 'Anita Verma', age: 26, weight: 58, height: 162, gender: 'Female', trainer: 'Amit Sharma', pt_credits: 12, is_pt_active: true },
    { id: 'M-1003', name: 'Vikram Singh', age: 31, weight: 82, height: 180, gender: 'Male', trainer: 'Raj Verma', pt_credits: 0, is_pt_active: false },
    { id: 'M-1004', name: 'Pooja Mehta', age: 24, weight: 54, height: 165, gender: 'Female', trainer: 'Raj Verma', pt_credits: 16, is_pt_active: true },
    { id: 'M-1005', name: 'Sandeep Kumar', age: 29, weight: 76, height: 172, gender: 'Male', trainer: 'Amit Sharma', pt_credits: 4, is_pt_active: true },
    { id: 'M-1006', name: 'Neha Gupta', age: 27, weight: 62, height: 160, gender: 'Female', trainer: 'Amit Sharma', pt_credits: 0, is_pt_active: false },
    { id: 'M-1007', name: 'Arjun Patel', age: 33, weight: 88, height: 185, gender: 'Male', trainer: 'Amit Sharma', pt_credits: 24, is_pt_active: true }
  ]);

  // Trainers List (All trainers, in Admin Panel)
  const trainersList = ['Raj Verma', 'Amit Sharma', 'Neha Kapoor', 'Rohan Das'];

  // Selected member inside directory sidebar
  const [selectedMemberId, setSelectedMemberId] = useState('M-1001');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Diet Plans State List
  const [dietPlans, setDietPlans] = useState([
    {
      id: 1,
      memberId: 'M-1001',
      trainerName: 'Raj Verma',
      planName: 'Fat Loss Diet Plan',
      goal: 'Fat Loss',
      duration: 45,
      startDate: '2024-05-01',
      endDate: '2024-06-15',
      waterIntake: 4.0,
      sleepHours: 7.0,
      status: 'Active',
      trainerComments: 'Follow this plan strictly. Review after 15 days.',
      createdOn: '2024-05-01',
      meals: [
        {
          id: 101,
          mealTitle: 'Morning Empty Stomach',
          mealTime: '06:00 AM',
          mealItems: [
            { food: 'ginger paste', quantity: 1, unit: 'spoon' },
            { food: 'turmeric', quantity: 1, unit: 'spoon' },
            { food: 'Lemon water', quantity: 1, unit: 'glass' },
            { food: 'soaked almonds', quantity: 3, unit: 'pcs' }
          ],
          notes: ''
        },
        {
          id: 102,
          mealTitle: 'Pre Workout',
          mealTime: '07:30 AM',
          mealItems: [
            { food: 'chana', quantity: 50, unit: 'g' },
            { food: 'Black coffee (without sugar)', quantity: 1, unit: 'cup' },
            { food: 'Half banana', quantity: 0.5, unit: 'pcs' }
          ],
          notes: 'Have 20-30 minutes before workout'
        },
        {
          id: 103,
          mealTitle: 'Post Workout',
          mealTime: '09:30 AM',
          mealItems: [
            { food: 'oats', quantity: 100, unit: 'g' },
            { food: 'milk', quantity: 150, unit: 'ml' }
          ],
          notes: ''
        },
        {
          id: 104,
          mealTitle: 'Mid Morning',
          mealTime: '11:30 AM',
          mealItems: [
            { food: 'egg whites', quantity: 3, unit: 'pcs' },
            { food: 'apple', quantity: 1, unit: 'pcs' }
          ],
          notes: ''
        },
        {
          id: 105,
          mealTitle: 'Lunch',
          mealTime: '02:00 PM',
          mealItems: [
            { food: 'rice', quantity: 150, unit: 'g' },
            { food: 'dal', quantity: 100, unit: 'g' },
            { food: 'paneer', quantity: 100, unit: 'g' }
          ],
          notes: ''
        },
        {
          id: 106,
          mealTitle: 'Evening Snack',
          mealTime: '05:30 PM',
          mealItems: [
            { food: 'poha', quantity: 100, unit: 'g' }
          ],
          notes: ''
        },
        {
          id: 107,
          mealTitle: 'Dinner',
          mealTime: '08:30 PM',
          mealItems: [
            { food: 'See options', quantity: 1, unit: 'pcs' }
          ],
          notes: ''
        }
      ],
      recommendations: {
        sections: [
          { title: 'Foods to Avoid', icon: 'fa-ban', items: ['Cold Drinks', 'Bakery Items', 'Fried Foods'] },
          { title: 'Daily Activities', icon: 'fa-walking', items: ['Walk 30 Minutes', '10000 Steps'] },
          { title: 'Supplements', icon: 'fa-capsules', items: ['Fish Oil', 'Whey Protein'] },
          { title: 'Precautions', icon: 'fa-exclamation-triangle', items: ['Proper hydration', 'Salt restriction'] },
          { title: 'Extra Tips', icon: 'fa-lightbulb', items: ['Drink 4L Water', 'Sleep before 11 PM'] }
        ]
      }
    },
    {
      id: 2,
      memberId: 'M-1002',
      trainerName: 'Amit Sharma',
      planName: 'Muscle Gain Diet Plan',
      goal: 'Muscle Gain',
      duration: 60,
      startDate: '2024-02-10',
      endDate: '2024-04-10',
      waterIntake: 4.5,
      sleepHours: 8.0,
      status: 'Completed',
      trainerComments: 'Focus on progressive load. Consume meals on time.',
      createdOn: '2024-02-10',
      meals: [],
      recommendations: { sections: [] }
    }
  ]);

  // Selected plan in list view
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [openPreviewAccordion, setOpenPreviewAccordion] = useState('overview'); // 'overview' | 'meals' | 'guidelines'

  // Active view tabs (All, Active, Expired/Completed, Drafts)
  const [currentTab, setCurrentTab] = useState('All');

  // Screen View Mode: 'list' or 'create' / 'edit'
  const [viewMode, setViewMode] = useState('list');

  // Expanded state for recommendation cards
  const [expandedSections, setExpandedSections] = useState({});

  // Form States for creating/editing diet plan
  const [planForm, setPlanForm] = useState({
    id: null,
    memberId: '',
    trainerName: 'Super Admin',
    planName: '',
    goal: 'Fat Loss',
    duration: '',
    startDate: '',
    endDate: '',
    waterIntake: '',
    sleepHours: '',
    status: 'Draft',
    trainerComments: ''
  });

  const [mealsList, setMealsList] = useState([]);
  const [recsSections, setRecsSections] = useState([]);

  // Meal Form Modal State
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [mealForm, setMealForm] = useState({
    mealTitle: '',
    mealTime: '08:00 AM',
    notes: '',
    mealItems: [{ food: '', quantity: '', unit: 'g' }]
  });

  // Recommendation Section Modal State
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingRecIndex, setEditingRecIndex] = useState(null);
  const [recForm, setRecForm] = useState({
    title: '',
    icon: 'fa-ban',
    items: ['']
  });

  const [formErrors, setFormErrors] = useState({});

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchMemberQuery.toLowerCase())
  );

  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Filter plans table based on selected member and status tab
  const memberPlans = dietPlans.filter(p => p.memberId === selectedMemberId);
  const filteredPlans = memberPlans.filter(p => {
    if (currentTab === 'Active') return p.status === 'Active';
    if (currentTab === 'Expired Plans') return p.status === 'Completed' || p.status === 'Cancelled';
    if (currentTab === 'Drafts') return p.status === 'Draft';
    return true;
  });

  const selectedPlan = dietPlans.find(p => p.id === selectedPlanId);

  // Helper toggle section
  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Helper business actions
  const handleDeletePlan = (id) => {
    if (window.confirm('Are you sure you want to delete this diet plan?')) {
      setDietPlans(prev => prev.filter(p => p.id !== id));
      if (selectedPlanId === id) {
        setSelectedPlanId(null);
      }
    }
  };

  const handleActivatePlan = (id) => {
    setDietPlans(prev => prev.map(p => {
      const targetPlan = prev.find(x => x.id === id);
      if (!targetPlan) return p;

      if (p.memberId === targetPlan.memberId) {
        if (p.id === id) {
          return { ...p, status: 'Active' };
        } else if (p.status === 'Active') {
          return { ...p, status: 'Completed' };
        }
      }
      return p;
    }));
  };

  const handleClonePlan = (plan) => {
    const cloned = {
      ...plan,
      id: dietPlans.length + 1,
      planName: `${plan.planName} (Copy)`,
      status: 'Draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    };
    setDietPlans([cloned, ...dietPlans]);
    alert('Plan cloned as Draft!');
  };

  // Create / Edit Screen Triggers
  const triggerCreateView = () => {
    setPlanForm({
      id: null,
      memberId: selectedMemberId,
      trainerName: selectedMember?.trainer || 'Super Admin',
      planName: '',
      goal: 'Fat Loss',
      duration: '45',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      waterIntake: '4.0',
      sleepHours: '8.0',
      status: 'Draft',
      trainerComments: ''
    });
    setMealsList([]);
    setRecsSections([
      { title: 'Foods to Avoid', icon: 'fa-ban', items: ['Cold Drinks', 'Bakery Items'] },
      { title: 'Daily Activities', icon: 'fa-walking', items: ['Walk 30 Minutes', '10000 Steps'] }
    ]);
    setViewMode('create');
  };

  const triggerEditView = (plan) => {
    setPlanForm({
      id: plan.id,
      memberId: plan.memberId,
      trainerName: plan.trainerName,
      planName: plan.planName,
      goal: plan.goal,
      duration: plan.duration.toString(),
      startDate: plan.startDate,
      endDate: plan.endDate,
      waterIntake: plan.waterIntake.toString(),
      sleepHours: plan.sleepHours.toString(),
      status: plan.status,
      trainerComments: plan.trainerComments
    });
    setMealsList(plan.meals || []);
    setRecsSections(plan.recommendations?.sections || []);
    setViewMode('edit');
  };

  // Modal Functions: Meals Builder
  const openAddMeal = () => {
    setEditingMealIndex(null);
    setMealForm({
      mealTitle: '',
      mealTime: '08:00 AM',
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
    setMealsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateMeal = (index) => {
    const meal = mealsList[index];
    const duplicated = {
      ...meal,
      mealTitle: `${meal.mealTitle} (Copy)`,
      id: Date.now()
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
      setMealsList([...mealsList, { ...mealForm, id: Date.now() }]);
    }
    setIsMealModalOpen(false);
  };

  // Modal Functions: Recommendations Section Builder
  const openAddRecSection = () => {
    setEditingRecIndex(null);
    setRecForm({
      title: '',
      icon: 'fa-ban',
      items: ['']
    });
    setIsRecModalOpen(true);
  };

  const openEditRecSection = (index) => {
    setEditingRecIndex(index);
    setRecForm({ ...recsSections[index] });
    setIsRecModalOpen(true);
  };

  const handleDeleteRecSection = (index) => {
    setRecsSections(prev => prev.filter((_, i) => i !== index));
  };

  const addRecItemRow = () => {
    setRecForm(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const removeRecItemRow = (idx) => {
    setRecForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleRecSubmit = (e) => {
    e.preventDefault();
    if (!recForm.title.trim()) {
      alert('Section title is required');
      return;
    }
    const emptyItem = recForm.items.some(item => !item.trim());
    if (emptyItem) {
      alert('Please fill out all bullet entries or remove empty rows');
      return;
    }

    if (editingRecIndex !== null) {
      setRecsSections(prev => prev.map((r, i) => i === editingRecIndex ? recForm : r));
    } else {
      setRecsSections([...recsSections, recForm]);
    }
    setIsRecModalOpen(false);
  };

  // Main Form Builder Submission & Validation
  const handleSavePlanForm = (statusArg) => {
    let errs = {};
    if (!planForm.planName.trim()) errs.planName = 'Plan name is required';
    if (!planForm.duration || isNaN(planForm.duration)) errs.duration = 'Valid duration days required';
    if (!planForm.startDate) errs.startDate = 'Start date is required';
    if (!planForm.endDate) errs.endDate = 'End date is required';
    if (new Date(planForm.startDate) > new Date(planForm.endDate)) {
      errs.endDate = 'Start date cannot be after end date';
    }
    if (mealsList.length === 0) {
      alert('A diet plan must contain at least one meal');
      return;
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      alert('Please review form validation warnings');
      return;
    }

    const payload = {
      id: planForm.id || (dietPlans.length + 1),
      memberId: planForm.memberId,
      trainerName: planForm.trainerName,
      planName: planForm.planName,
      goal: planForm.goal,
      duration: parseInt(planForm.duration),
      startDate: planForm.startDate,
      endDate: planForm.endDate,
      waterIntake: parseFloat(planForm.waterIntake) || 4.0,
      sleepHours: parseFloat(planForm.sleepHours) || 8.0,
      status: statusArg,
      trainerComments: planForm.trainerComments,
      createdOn: new Date().toISOString().split('T')[0],
      meals: mealsList,
      recommendations: { sections: recsSections }
    };

    if (planForm.id) {
      setDietPlans(prev => prev.map(p => p.id === planForm.id ? payload : p));
    } else {
      setDietPlans([payload, ...dietPlans]);
    }

    // Auto-complete previous if this new one is marked Active
    if (statusArg === 'Active') {
      setDietPlans(prev => prev.map(p => {
        if (p.memberId === planForm.memberId && p.id !== payload.id && p.status === 'Active') {
          return { ...p, status: 'Completed' };
        }
        return p;
      }));
    }

    setViewMode('list');
    setSelectedPlanId(payload.id);
    setFormErrors({});
    alert(`Diet plan successfully saved as ${statusArg}!`);
  };

  return (
    <div className="admin-pt-container" style={{ padding: 0 }}>
      {/* -------------------- VIEW 1: HISTORY LIST & METRICS -------------------- */}
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
              <div style={{ marginTop: '4px', maxHeight: filteredMembers.length > 7 ? '435px' : 'none', overflowY: filteredMembers.length > 7 ? 'auto' : 'visible', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredMembers.map(m => {
                  const isSelected = selectedMemberId === m.id;
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
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{m.id}</div>
                      </div>
                      {dietPlans.some(p => p.memberId === m.id && p.status === 'Active') && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%'}}></span>
                      )}
                    </div>
                  );
                })}
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
                        <span className="pt-badge status-active" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.7rem' }}>Active Member</span>
                        {selectedMember.pt_credits > 0 ? (
                          <span className="pt-badge" style={{ background: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24', fontSize: '0.7rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                            <i className="fas fa-dumbbell"></i> PT Active ({selectedMember.pt_credits} Credits)
                          </span>
                        ) : (
                          <span className="pt-badge" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', fontSize: '0.7rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <i className="fas fa-exclamation-triangle"></i> PT Inactive
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#c7d2fe', fontSize: '0.8rem', margin: '6px 0 0 0' }}>
                        ID: {selectedMember.id} • {selectedMember.age} Years • {selectedMember.gender} • {selectedMember.weight} kg • {selectedMember.height} cm
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                      <span style={{ color: '#c7d2fe' }}>Assigned Trainer</span>
                      <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>{selectedMember.trainer}</div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                      {selectedMember.trainer.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid split of Diet plans history + Active details */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedPlan ? '1.8fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start', transition: 'all 0.3s ease-out' }}>
                {/* Diet Plans History Table */}
                <div className="pt-card flex-col" style={{ gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Diet Plan Records</h3>
                    <button className="pt-btn pt-btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={triggerCreateView}>
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
                        {filteredPlans.length > 0 ? (
                          filteredPlans.map(p => (
                            <tr
                              key={p.id}
                              style={{ cursor: 'pointer', background: selectedPlanId === p.id ? 'rgba(79, 70, 229, 0.03)' : 'transparent' }}
                              onClick={() => setSelectedPlanId(selectedPlanId === p.id ? null : p.id)}
                            >
                              <td>
                                <div style={{ fontWeight: 600, color: '#334155' }}>{p.planName}</div>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.goal} (By: {p.trainerName})</span>
                              </td>
                              <td style={{ fontWeight: 600 }}>{p.duration} Days</td>
                              <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                                <span>{p.startDate} to {p.endDate}</span>
                              </td>
                              <td>
                                <span className={`type-badge ${p.status === 'Active' ? 'score-excellent' : p.status === 'Draft' ? 'score-average' : 'score-good'}`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                                  {p.status.toUpperCase()}
                                </span>
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className="pt-icon-btn" style={{ color: '#4f46e5' }} title="Edit Plan" onClick={() => triggerEditView(p)}>
                                    <i className="far fa-edit"></i>
                                  </button>
                                  <button className="pt-icon-btn" style={{ color: '#10b981' }} title="Clone/Copy" onClick={() => handleClonePlan(p)}>
                                    <i className="far fa-clone"></i>
                                  </button>
                                  <button className="pt-icon-btn text-danger" title="Delete" onClick={() => handleDeletePlan(p.id)}>
                                    <i className="far fa-trash-alt"></i>
                                  </button>
                                  {p.status !== 'Active' && p.status !== 'Completed' && (
                                    <button className="pt-btn pt-btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '6px' }} onClick={() => handleActivatePlan(p.id)}>
                                      Activate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
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

                {/* Right Details Panel (collapsible accordion) */}
                {selectedPlan && (
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
                            {selectedPlan.planName}
                          </h4>
                        </div>
                        <i className={`fas ${openPreviewAccordion === 'overview' ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#64748b', fontSize: '0.75rem' }}></i>
                      </div>
                      {openPreviewAccordion === 'overview' && (
                        <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Duration: {selectedPlan.duration} Days</span>
                            <span className={`type-badge ${selectedPlan.status === 'Active' ? 'score-excellent' : 'score-good'}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>{selectedPlan.status.toUpperCase()}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Dates: {selectedPlan.startDate} to {selectedPlan.endDate}</p>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Created By: {selectedPlan.trainerName} on {selectedPlan.createdOn}</p>

                          <h4 style={{ fontSize: '0.82rem', margin: '8px 0 2px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', color: '#334155', fontWeight: 600 }}>Overview Metrics</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}><i className="fas fa-tint"></i></div>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Water Intake</div>
                                <strong style={{ fontSize: '0.82rem', color: '#334155' }}>{selectedPlan.waterIntake} Liters / Day</strong>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}><i className="fas fa-moon"></i></div>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sleep Duration</div>
                                <strong style={{ fontSize: '0.82rem', color: '#334155' }}>{selectedPlan.sleepHours} Hours / Night</strong>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}><i className="fas fa-bullseye"></i></div>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Assigned Goal</div>
                                <strong style={{ fontSize: '0.82rem', color: '#334155' }}>{selectedPlan.goal}</strong>
                              </div>
                            </div>
                          </div>

                          {selectedPlan.trainerComments && (
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                              <strong style={{ fontSize: '0.8rem', color: '#334155' }}>Coach comments:</strong>
                              <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', margin: 0, fontStyle: 'italic' }}>
                                "{selectedPlan.trainerComments}"
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
                            {selectedPlan.meals?.length || 0}
                          </span>
                          <i className={`fas ${openPreviewAccordion === 'meals' ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#64748b', fontSize: '0.75rem' }}></i>
                        </div>
                      </div>
                      {openPreviewAccordion === 'meals' && (
                        <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                          {selectedPlan.meals && selectedPlan.meals.length > 0 ? (
                            selectedPlan.meals.map((meal, index) => (
                              <div key={index} style={{ display: 'flex', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px' }}>
                                <div style={{ background: '#e0e7ff', color: '#4f46e5', width: '65px', height: '38px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
                                  {meal.mealTime}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{meal.mealTitle}</div>
                                  <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '0.78rem', color: '#475569' }}>
                                    {meal.mealItems.map((item, itemIdx) => (
                                      <li key={itemIdx}>{item.food} - {item.quantity} {item.unit}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.8rem', margin: 0 }}>No meals defined in this plan.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Accordion 3: Trainer Guidelines */}
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
                            Trainer Guidelines
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                            {selectedPlan.recommendations?.sections?.length || 0}
                          </span>
                          <i className={`fas ${openPreviewAccordion === 'guidelines' ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#64748b', fontSize: '0.75rem' }}></i>
                        </div>
                      </div>
                      {openPreviewAccordion === 'guidelines' && (
                        <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 10px 10px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                          {selectedPlan.recommendations?.sections?.map((section, secIdx) => (
                            <div key={secIdx} className="recommendation-section-card" style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                              <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f1f5f9', cursor: 'pointer' }}
                                onClick={() => toggleSection(secIdx)}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                    <i className={`fas ${section.icon || 'fa-apple-alt'}`}></i>
                                  </div>
                                  <h4 style={{ fontSize: '0.8rem', margin: 0, fontWeight: 600, color: '#334155' }}>{section.title}</h4>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>{section.items?.length || 0}</span>
                                  <i className={`fas ${expandedSections[secIdx] ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#64748b', fontSize: '0.75rem' }}></i>
                                </div>
                              </div>
                              {expandedSections[secIdx] && (
                                <div style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#f8fafc' }}>
                                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                                    {section.items?.map((item, itemIdx) => (
                                      <li key={itemIdx} style={{ marginBottom: '4px' }}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
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

      {/* -------------------- VIEW 2: FORM BUILDER (CREATE / EDIT) -------------------- */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>Name:</span><strong style={{ color: '#1e293b' }}>{selectedMember?.name}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>Age:</span><strong style={{ color: '#1e293b' }}>{selectedMember?.age} Years</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>Weight:</span><strong style={{ color: '#1e293b' }}>{selectedMember?.weight} kg</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}><span style={{ color: '#64748b' }}>Height:</span><strong style={{ color: '#1e293b' }}>{selectedMember?.height} cm</strong></div>
              </div>

              {/* Form Metadata */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Plan Name *</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="e.g. Lean Bulk Diet"
                  value={planForm.planName}
                  onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                />
                {formErrors.planName && <div className="form-error-msg" style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '2px' }}>{formErrors.planName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Goal *</label>
                <select
                  className="pt-select"
                  value={planForm.goal}
                  onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
                >
                  <option value="Fat Loss">Fat Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Strength">Strength</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Creator Trainer *</label>
                <select
                  className="pt-select"
                  value={planForm.trainerName}
                  onChange={(e) => setPlanForm({ ...planForm, trainerName: e.target.value })}
                >
                  <option value="Super Admin">Super Admin (Admin)</option>
                  {trainersList.map(t => <option key={t} value={t}>{t} (Trainer)</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Duration (Days) *</label>
                <input
                  type="number"
                  className="pt-input"
                  placeholder="e.g. 45"
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
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>End Date *</label>
                  <input
                    type="date"
                    className="pt-input"
                    value={planForm.endDate}
                    onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })}
                  />
                  {formErrors.endDate && <div className="form-error-msg" style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '2px' }}>{formErrors.endDate}</div>}
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Water Intake (L/Day)</label>
                  <input
                    type="text"
                    className="pt-input"
                    placeholder="e.g. 4.0"
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {mealsList.length > 0 ? (
                  mealsList.map((meal, index) => (
                    <div key={index} style={{ display: 'flex', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', position: 'relative' }}>
                      <div style={{ background: '#e0e7ff', color: '#4f46e5', width: '65px', height: '38px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
                        {meal.mealTime}
                      </div>
                      <div style={{ paddingRight: '60px', minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '0.88rem', margin: 0, fontWeight: 600, color: '#0f172a' }}>{meal.mealTitle}</h4>
                        <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '0.78rem', color: '#475569' }}>
                          {meal.mealItems.map((item, itemIdx) => (
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
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px' }} onClick={openAddRecSection}>
                  <i className="fas fa-plus"></i> Add Section
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recsSections.map((sec, index) => (
                  <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}><i className={`fas ${sec.icon}`}></i></div>
                        <h4 style={{ fontSize: '0.8rem', margin: 0, fontWeight: 600, color: '#334155' }}>{sec.title}</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        <span style={{ background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, marginRight: '4px' }}>{sec.items.length}</span>
                        <button type="button" className="pt-icon-btn" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }} onClick={() => openEditRecSection(index)}>
                          <i className="far fa-edit"></i>
                        </button>
                        <button type="button" className="pt-icon-btn text-danger" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }} onClick={() => handleDeleteRecSection(index)}>
                          <i className="far fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
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
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => setViewMode('list')}>Cancel</button>
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => handleSavePlanForm('Draft')}>Save as Draft</button>
                <button type="button" className="pt-btn pt-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => handleSavePlanForm('Active')}>Save & Assign Plan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MEAL MODAL -------------------- */}
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
                      type="text"
                      className="pt-input"
                      placeholder="e.g. 08:30 AM"
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
                              value={item.food}
                              onChange={(e) => {
                                const updated = [...mealForm.mealItems];
                                updated[idx].food = e.target.value;
                                setMealForm({ ...mealForm, mealItems: updated });
                              }}
                              required
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              className="pt-input"
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
                          <td style={{ padding: '6px 8px' }}>
                            <select
                              className="pt-select"
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

      {/* -------------------- RECOMMENDATIONS MODAL -------------------- */}
      {isRecModalOpen && (
        <div className="pt-modal-backdrop">
          <div className="pt-modal-card" style={{ maxWidth: '480px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{editingRecIndex !== null ? 'Edit Section' : 'Add Section'}</h3>
              <button className="pt-icon-btn" onClick={() => setIsRecModalOpen(false)} style={{ fontSize: '1.2rem' }}>&times;</button>
            </div>
            <form onSubmit={handleRecSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Section Title *</label>
                  <input
                    type="text"
                    className="pt-input"
                    placeholder="e.g. Foods to Avoid, Daily Activities"
                    value={recForm.title}
                    onChange={(e) => setRecForm({ ...recForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Section Icon</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {[
                      { val: 'fa-ban', icon: 'fa-ban' },
                      { val: 'fa-walking', icon: 'fa-walking' },
                      { val: 'fa-capsules', icon: 'fa-capsules' },
                      { val: 'fa-exclamation-triangle', icon: 'fa-exclamation-triangle' },
                      { val: 'fa-lightbulb', icon: 'fa-lightbulb' },
                      { val: 'fa-tint', icon: 'fa-tint' }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        className="pt-btn pt-btn-secondary"
                        style={{
                          padding: '8px 0',
                          background: recForm.icon === item.val ? '#4f46e5' : 'transparent',
                          color: recForm.icon === item.val ? 'white' : '#475569',
                          borderColor: recForm.icon === item.val ? '#4f46e5' : '#cbd5e1',
                          fontSize: '1rem',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '38px',
                          borderRadius: '8px'
                        }}
                        onClick={() => setRecForm({ ...recForm, icon: item.val })}
                      >
                        <i className={`fas ${item.icon}`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#334155' }}>Bullet Recommendations *</strong>
                  <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={addRecItemRow}>
                    <i className="fas fa-plus"></i> Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
                  {recForm.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="pt-input"
                        placeholder="e.g. Avoid carbonated soda"
                        value={item}
                        onChange={(e) => {
                          const updated = [...recForm.items];
                          updated[idx] = e.target.value;
                          setRecForm({ ...recForm, items: updated });
                        }}
                        required
                      />
                      {recForm.items.length > 1 && (
                        <button type="button" className="pt-icon-btn text-danger" style={{ padding: '4px' }} onClick={() => removeRecItemRow(idx)}>
                          <i className="far fa-trash-alt"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                <button type="button" className="pt-btn pt-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => setIsRecModalOpen(false)}>Cancel</button>
                <button type="submit" className="pt-btn pt-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Save Section</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDietPlans;
