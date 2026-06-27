import React, { useState, useEffect } from 'react';
import tokenManager from '../../utils/tokenManager';
import './TrainerDashboard.css';

const TrainerDietPlans = () => {
  // 1. Roles & Current User
  const [trainerData, setTrainerData] = useState(null);

  // 2. Members Directory
  const [members, setMembers] = useState([
    { id: 'M-1001', name: 'Rahul Sharma', age: 28, weight: 70, height: 175, gender: 'Male', trainer: 'Raj Verma' },
    { id: 'M-1002', name: 'Anita Verma', age: 26, weight: 58, height: 162, gender: 'Female', trainer: 'Amit Sharma' },
    { id: 'M-1003', name: 'Vikram Singh', age: 31, weight: 82, height: 180, gender: 'Male', trainer: 'Raj Verma' },
    { id: 'M-1004', name: 'Pooja Mehta', age: 24, weight: 54, height: 165, gender: 'Female', trainer: 'Raj Verma' },
    { id: 'M-1005', name: 'Sandeep Kumar', age: 29, weight: 76, height: 172, gender: 'Male', trainer: 'Amit Sharma' },
    { id: 'M-1006', name: 'Neha Gupta', age: 27, weight: 62, height: 160, gender: 'Female', trainer: 'Amit Sharma' },
    { id: 'M-1007', name: 'Arjun Patel', age: 33, weight: 88, height: 185, gender: 'Male', trainer: 'Amit Sharma' }
  ]);

  // Selected member inside directory sidebar
  const [selectedMemberId, setSelectedMemberId] = useState('M-1002');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // 3. Diet Plans State List
  const [dietPlans, setDietPlans] = useState([
    {
      id: 1,
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
      meals: [
        {
          id: 101,
          mealTitle: 'Breakfast',
          mealTime: '08:30 AM',
          mealItems: [
            { food: 'Oats', quantity: 100, unit: 'g' },
            { food: 'Milk', quantity: 200, unit: 'ml' },
            { food: 'Bananas', quantity: 2, unit: 'pcs' }
          ],
          notes: 'High carb pre workout meal'
        },
        {
          id: 102,
          mealTitle: 'Lunch',
          mealTime: '01:30 PM',
          mealItems: [
            { food: 'Chicken Breast', quantity: 150, unit: 'g' },
            { food: 'Brown Rice', quantity: 150, unit: 'g' }
          ],
          notes: 'Standard post workout lunch'
        }
      ],
      recommendations: {
        sections: [
          { title: 'Foods to Avoid', icon: 'fa-ban', items: ['Refined Sugar', 'Processed Foods'] },
          { title: 'Supplements', icon: 'fa-capsules', items: ['Creatine 5g', 'Omega 3 Fish Oil'] }
        ]
      }
    },
    {
      id: 2,
      memberId: 'M-1002',
      trainerName: 'Amit Sharma',
      planName: 'Lean Bulking Phase',
      goal: 'Muscle Gain',
      duration: 90,
      startDate: '2024-05-01',
      endDate: '2024-07-30',
      waterIntake: 5.0,
      sleepHours: 8.0,
      status: 'Active',
      trainerComments: 'Ensure strict meal adherence.',
      createdOn: '2024-05-01',
      meals: [
        {
          id: 103,
          mealTitle: 'Morning Empty Stomach',
          mealTime: '06:00 AM',
          mealItems: [
            { food: 'Lemon Water', quantity: 1, unit: 'glass' },
            { food: 'Almonds', quantity: 6, unit: 'pcs' }
          ],
          notes: 'Cleansing boost'
        },
        {
          id: 104,
          mealTitle: 'Post Workout Shake',
          mealTime: '09:00 AM',
          mealItems: [
            { food: 'Whey Protein', quantity: 1, unit: 'scoop' },
            { food: 'Oats', quantity: 60, unit: 'g' }
          ],
          notes: 'Consume within 30 minutes of training'
        }
      ],
      recommendations: {
        sections: [
          { title: 'Daily Activities', icon: 'fa-walking', items: ['10,000 steps minimum', 'Walk 30 minutes'] },
          { title: 'Extra Tips', icon: 'fa-lightbulb', items: ['Drink warm water', 'Sleep before 11 PM'] }
        ]
      }
    },
    {
      id: 3,
      memberId: 'M-1005',
      trainerName: 'Amit Sharma',
      planName: 'Fat Loss Diet Plan',
      goal: 'Fat Loss',
      duration: 45,
      startDate: '2024-08-01',
      endDate: '2024-09-15',
      waterIntake: 4.0,
      sleepHours: 7.5,
      status: 'Active',
      trainerComments: 'Caloric deficit is critical.',
      createdOn: '2024-08-01',
      meals: [
        {
          id: 105,
          mealTitle: 'Breakfast',
          mealTime: '08:00 AM',
          mealItems: [
            { food: 'Egg Whites', quantity: 4, unit: 'pcs' },
            { food: 'Whole wheat toast', quantity: 2, unit: 'slices' }
          ],
          notes: ''
        }
      ],
      recommendations: {
        sections: [
          { title: 'Foods to Avoid', icon: 'fa-ban', items: ['Soda Drinks', 'Bakery products'] }
        ]
      }
    }
  ]);

  // Selected plan in list view
  const [selectedPlanId, setSelectedPlanId] = useState(2);

  // Active view tabs (All, Active, Expired/Completed, Drafts)
  const [currentTab, setCurrentTab] = useState('All');

  // Screen View Mode: 'list' (History list) or 'create' / 'edit' (Form Builder)
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit'

  // Expanded state for recommendation cards
  const [expandedSections, setExpandedSections] = useState({});

  // 4. Form States for creating/editing diet plan
  const [planForm, setPlanForm] = useState({
    id: null,
    memberId: '',
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
  const [editingMealIndex, setEditingMealIndex] = useState(null); // index in mealsList or null for new
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

  useEffect(() => {
    const user = tokenManager.getUserData();
    if (user) {
      setTrainerData(user);
    }
  }, []);

  // Filter members list based on current trainer (Amit Sharma) and search query
  const assignedMembers = members.filter(m => m.trainer === 'Amit Sharma');
  const filteredMembers = assignedMembers.filter(m => 
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

  const selectedPlan = dietPlans.find(p => p.id === selectedPlanId) || memberPlans[0];

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
      // Find matching member for this plan
      const targetPlan = prev.find(x => x.id === id);
      if (!targetPlan) return p;
      
      if (p.memberId === targetPlan.memberId) {
        if (p.id === id) {
          return { ...p, status: 'Active' };
        } else if (p.status === 'Active') {
          return { ...p, status: 'Completed' }; // Autocomplete previous
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
    alert('Plan template cloned successfully as Draft!');
  };

  // 5. Create / Edit Screen Triggers
  const triggerCreateView = () => {
    setPlanForm({
      id: null,
      memberId: selectedMemberId,
      planName: '',
      goal: 'Fat Loss',
      duration: '30',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      waterIntake: '3.5',
      sleepHours: '8.0',
      status: 'Draft',
      trainerComments: ''
    });
    setMealsList([]);
    setRecsSections([
      { title: 'Foods to Avoid', icon: 'fa-ban', items: ['Processed Food', 'Sugary Drinks'] },
      { title: 'Daily Activities', icon: 'fa-walking', items: ['Walk 30 minutes'] }
    ]);
    setViewMode('create');
  };

  const triggerEditView = (plan) => {
    setPlanForm({
      id: plan.id,
      memberId: plan.memberId,
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

  // 6. Modal Functions: Meals Builder
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

  // 7. Modal Functions: Recommendations Section Builder
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

  // 8. Main Form Builder Submission & Validation
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
      trainerName: trainerData?.name || 'Trainer',
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
    <div className="trainer-page-container" style={{ padding: 0 }}>
      
      {/* -------------------- VIEW 1: HISTORY LIST & METRICS -------------------- */}
      {viewMode === 'list' && (
        <>
          <div className="page-header">
            <div className="page-header-titles">
              <h1>Diet Plans</h1>
              <p>Assign nutritional splits, calendar schedules, and macro instructions to members.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', minHeight: '650px' }}>
            
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
                {filteredMembers.map(m => (
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
                      <p className="client-sub-txt">{m.id}</p>
                    </div>
                    {dietPlans.some(p => p.memberId === m.id && p.status === 'Active') && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', alignSelf: 'center' }}></span>
                    )}
                  </div>
                ))}
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
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                        ID: {selectedMember.id} | {selectedMember.age} Years | {selectedMember.gender} | {selectedMember.weight} kg | {selectedMember.height} cm
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned Trainer</span>
                      <div style={{ fontWeight: 600 }}>{selectedMember.trainer}</div>
                    </div>
                    <div className="profile-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', background: '#3b82f6' }}>
                      {selectedMember.trainer.split(' ').map(n=>n[0]).join('')}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid split of Diet plans history + Active details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
                
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
                    {['All Diet Plans', 'Active Plans', 'Expired Plans', 'Drafts'].map(tab => (
                      <button 
                        key={tab}
                        className={`btn-pagination ${currentTab === tab ? 'active' : ''}`}
                        style={{
                          background: currentTab === tab ? 'var(--primary-light)' : 'transparent',
                          color: currentTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                          border: currentTab === tab ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem'
                        }}
                        onClick={() => setCurrentTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="table-responsive-wrapper">
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
                            <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPlanId(p.id)}>
                              <td>
                                <div style={{ fontWeight: 600 }}>{p.planName}</div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.goal}</span>
                              </td>
                              <td>{p.duration} Days</td>
                              <td>
                                <span style={{ fontSize: '0.8rem' }}>{p.startDate} to {p.endDate}</span>
                              </td>
                              <td>
                                <span className={`m-badge ${p.status === 'Active' ? 'success' : (p.status === 'Draft' ? 'warning' : 'primary')}`}>
                                  {p.status}
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
                                  {p.status !== 'Active' && p.status !== 'Completed' && (
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
                  </div>
                </div>

                {/* Right Details Card */}
                <div>
                  {selectedPlan ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Active overview metrics */}
                      <div className="m-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedPlan.planName}</h4>
                          <span className={`m-badge ${selectedPlan.status === 'Active' ? 'success' : 'primary'}`} style={{ fontSize: '0.65rem' }}>{selectedPlan.status}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Duration: {selectedPlan.duration} Days ({selectedPlan.startDate} to {selectedPlan.endDate})</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Created By: {selectedPlan.trainerName} | Created On: {selectedPlan.createdOn}</p>
                        
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
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedPlan.goal}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Meals Timeline preview card */}
                      <div className="m-card">
                        <h3 className="m-card-title">Meal Timeline Plan</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                          {selectedPlan.meals && selectedPlan.meals.length > 0 ? (
                            selectedPlan.meals.map((meal, index) => (
                              <div key={index} className="schedule-card-item" style={{ alignItems: 'flex-start' }}>
                                <div className="schedule-card-time" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', width: '70px', height: '44px' }}>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>{meal.mealTime}</span>
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
                          {selectedPlan.recommendations?.sections?.map((section, secIdx) => (
                            <div key={secIdx} className="recommendation-section-card">
                              <div className="section-card-header" onClick={() => toggleSection(secIdx)}>
                                <div className="section-card-title-group">
                                  <div className="section-card-icon-circle"><i className={`fas ${section.icon || 'fa-apple-alt'}`}></i></div>
                                  <h4 style={{ fontSize: '0.9rem' }}>{section.title}</h4>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span className="section-card-badge">{section.items?.length || 0}</span>
                                  <i className={`fas ${expandedSections[secIdx] ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
                                </div>
                              </div>
                              {expandedSections[secIdx] && (
                                <div className="section-card-body">
                                  <ul className="section-items-list">
                                    {section.items?.map((item, itemIdx) => (
                                      <li key={itemIdx} className="section-item-li">{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}

                          {selectedPlan.trainerComments && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                              <strong style={{ fontSize: '0.88rem' }}>Coach comments:</strong>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                                "{selectedPlan.trainerComments}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="m-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Select a diet plan to preview details.
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </>
      )}

      {/* -------------------- VIEW 2: FORM BUILDER (CREATE / EDIT) -------------------- */}
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure detailed meal splits and activities recommendations split for {selectedMember?.name}.</p>
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
                <div className="static-info-row"><span>Age:</span><strong>{selectedMember?.age} Years</strong></div>
                <div className="static-info-row"><span>Weight:</span><strong>{selectedMember?.weight} kg</strong></div>
                <div className="static-info-row"><span>Height:</span><strong>{selectedMember?.height} cm</strong></div>
              </div>

              {/* Form Metadata */}
              <div className="form-group">
                <label className="form-label">Plan Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Lean Bulk Diet"
                  value={planForm.planName}
                  onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                />
                {formErrors.planName && <div className="form-error-msg">{formErrors.planName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Goal *</label>
                <select 
                  className="form-select"
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
                  <label className="form-label">End Date *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={planForm.endDate}
                    onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })}
                  />
                  {formErrors.endDate && <div className="form-error-msg">{formErrors.endDate}</div>}
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
                    <div key={index} className="schedule-card-item" style={{ alignItems: 'flex-start', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                      <div className="schedule-card-time" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', width: '70px', height: '44px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>{meal.mealTime}</span>
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
                    No meals scheduled yet. Click "+ Add Meal" above to build a workout split daily diet.
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Recommendations & Comments */}
            <div className="m-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
                <h3 className="m-card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Recommendations</h3>
                <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={openAddRecSection}>
                  <i className="fas fa-plus"></i> Add Section
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {recsSections.map((sec, index) => (
                  <div key={index} className="recommendation-section-card">
                    <div className="section-card-header" style={{ padding: '10px 14px' }}>
                      <div className="section-card-title-group">
                        <div className="section-card-icon-circle" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}><i className={`fas ${sec.icon}`}></i></div>
                        <h4 style={{ fontSize: '0.85rem' }}>{sec.title}</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span className="section-card-badge" style={{ fontSize: '0.7rem' }}>{sec.items.length}</span>
                        <button type="button" className="btn-icon" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }} onClick={() => openEditRecSection(index)}>
                          <i className="far fa-edit"></i>
                        </button>
                        <button type="button" className="btn-icon" style={{ width: '22px', height: '22px', fontSize: '0.7rem', color: 'var(--danger)' }} onClick={() => handleDeleteRecSection(index)}>
                          <i className="far fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                <button type="button" className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                <button type="button" className="btn-secondary" onClick={() => handleSavePlanForm('Draft')}>Save as Draft</button>
                <button type="button" className="btn-primary" onClick={() => handleSavePlanForm('Active')}>Save & Assign Plan</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- MEAL MODAL -------------------- */}
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
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 08:30 AM"
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

      {/* -------------------- RECOMMENDATIONS MODAL -------------------- */}
      {isRecModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingRecIndex !== null ? 'Edit Section' : 'Add Section'}</h3>
              <button className="modal-close-btn" onClick={() => setIsRecModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRecSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Section Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Foods to Avoid, Daily Activities"
                    value={recForm.title}
                    onChange={(e) => setRecForm({ ...recForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Section Icon</label>
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
                        className="btn-secondary"
                        style={{
                          padding: '10px 0',
                          background: recForm.icon === item.val ? 'var(--primary-color)' : 'transparent',
                          color: recForm.icon === item.val ? 'white' : 'var(--text-secondary)',
                          borderColor: recForm.icon === item.val ? 'var(--primary-color)' : 'var(--border-color)',
                          fontSize: '1rem',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                        onClick={() => setRecForm({ ...recForm, icon: item.val })}
                      >
                        <i className={`fas ${item.icon}`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <strong style={{ fontSize: '0.88rem' }}>Bullet Recommendations *</strong>
                  <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={addRecItemRow}>
                    <i className="fas fa-plus"></i> Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', marginBottom: '20px' }}>
                  {recForm.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
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
                        <button type="button" className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => removeRecItemRow(idx)}>
                          <i className="far fa-trash-alt"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsRecModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Section</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainerDietPlans;
