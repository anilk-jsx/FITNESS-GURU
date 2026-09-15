import React, { useState, useEffect, useCallback, useMemo } from 'react';
import tokenManager from '../utils/tokenManager';
import MemberAssessmentDashboard from './MemberAssessmentDashboard';
import './FitnessAssessment.css';

const FitnessAssessment = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // --- Core State ---
  const [members, setMembers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filtering & Selection State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [entitlementFilter, setEntitlementFilter] = useState('ALL'); // ALL, ENTITLED, UNENTITLED
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, INITIAL, PROGRESS, FINAL
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMemberForReport, setSelectedMemberForReport] = useState(null);

  // --- Member Assessment History State ---
  const [memberAssessments, setMemberAssessments] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // --- 5-Step Modal Creation Wizard State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formStep, setFormStep] = useState(1); // 1: Demographics, 2: Vitals, 3: Composition, 4: Physical Tests, 5: Evaluation
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State matching API 1: POST /api/assessments payload
  const [formData, setFormData] = useState({
    member_id: '',
    assessment_type: 'INITIAL',
    height_cm: 175.0,
    weight_kg: 72.0,
    resting_heart_rate: 68,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    body_fat_percent: 18.5,
    muscle_mass_kg: 54.2,
    sit_and_reach_cm: 32.0,
    shoulder_flexibility_cm: 22.0,
    mid_waist_circumference_cm: 82.0,
    lower_waist_circumference_cm: 85.0,
    hip_circumference_cm: 94.0,
    chest_circumference_cm: 98.0,
    arm_circumference_cm: 33.0,
    thigh_circumference_cm: 52.0,
    shoulder_width_cm: 42.0,
    trainer_assessment_score: 8.5,
    trainer_comments: 'Member demonstrates good stamina and posture. Recommend core stabilization program.',
    next_assessment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // --- Toast Notification State ---
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  }, []);

  // --- 1. Fetch Initial Global Data ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // Concurrently fetch members and subscriptions
      const [membersRes, subsRes] = await Promise.all([
        tokenManager.apiCall(`${API_BASE_URL}/api/users/list?role=MEMBER&page=1&limit=1000`, { method: 'GET' }).catch(() => null),
        tokenManager.apiCall(`${API_BASE_URL}/api/admin/subscriptions`, { method: 'GET' }).catch(() => null)
      ]);

      if (membersRes && membersRes.ok) {
        const mData = await membersRes.json();
        const rawMembers = mData.users || mData.data || (Array.isArray(mData) ? mData : []);
        setMembers(rawMembers);
      } else {
        setMembers([]);
      }

      if (subsRes && subsRes.ok) {
        const sData = await subsRes.json();
        setSubscriptions(sData.data || (Array.isArray(sData) ? sData : []));
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      console.error('Error loading assessment initial data:', err);
      showToast('Failed to load initial directory data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- 2. Subscription Feature Entitlement Check (`ACCESS_ASSESSMENTS`) ---
  const getMemberEntitlement = useCallback((memberId) => {
    if (!memberId) return { isEntitled: false, planName: 'No Subscription', reason: 'No Member Selected' };

    const sub = subscriptions.find(s =>
      String(s.user_id) === String(memberId) &&
      (s.status === 1 || String(s.status) === '1')
    );

    if (!sub) {
      return { isEntitled: false, planName: 'No Active Subscription', reason: 'Member lacks an active subscription.' };
    }

    const hasCredit = sub.wallet_credits?.some(credit =>
      credit.entitlement_type === 'ACCESS_ASSESSMENTS' &&
      (credit.status === 1 || String(credit.status) === '1')
    );

    const planNameLower = (sub.plan_name || '').toLowerCase();
    const hasPlanEntitlement = hasCredit ||
      planNameLower.includes('assessment') ||
      planNameLower.includes('combo') ||
      planNameLower.includes('gold') ||
      planNameLower.includes('pt') ||
      planNameLower.includes('all');

    return {
      isEntitled: !!hasPlanEntitlement,
      planName: sub.plan_name || 'Active Membership',
      reason: hasPlanEntitlement
        ? 'Entitled to Fitness Assessments'
        : 'Current subscription plan lacks Assessment Entitlement (ACCESS_ASSESSMENTS).'
    };
  }, [subscriptions]);

  // --- 3. Fetch Member Specific Assessments ---
  const fetchMemberAssessments = useCallback(async (memberId) => {
    if (!memberId) {
      setMemberAssessments([]);
      setLatestAssessment(null);
      return;
    }

    setLoadingAssessments(true);
    try {
      const [historyRes, latestRes] = await Promise.all([
        tokenManager.apiCall(`${API_BASE_URL}/api/members/${memberId}/assessments`, { method: 'GET' }).catch(() => null),
        tokenManager.apiCall(`${API_BASE_URL}/api/members/${memberId}/assessments/latest`, { method: 'GET' }).catch(() => null)
      ]);

      if (historyRes && historyRes.ok) {
        const hData = await historyRes.json();
        setMemberAssessments(hData.data || (Array.isArray(hData) ? hData : []));
      } else {
        setMemberAssessments([]);
      }

      if (latestRes && latestRes.ok) {
        const lData = await latestRes.json();
        setLatestAssessment(lData.data || null);
      } else {
        setLatestAssessment(null);
      }
    } catch (err) {
      console.error('Failed to load member assessments:', err);
      setMemberAssessments([]);
      setLatestAssessment(null);
    } finally {
      setLoadingAssessments(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberAssessments(selectedMemberId);
    }
  }, [selectedMemberId, fetchMemberAssessments]);

  // --- 4. Live Scoring Rubric Engine (fitness_scoring_rubric.md) ---
  const calculateScoringRubric = useCallback((data, gender = 'Male') => {
    const isMale = (gender || 'Male').toLowerCase() === 'male';

    // Height & Weight & BMI
    const hM = (parseFloat(data.height_cm) || 175) / 100;
    const wKg = parseFloat(data.weight_kg) || 70;
    const bmi = hM > 0 ? wKg / (hM * hM) : 22.0;

    // Component A: Body Composition (Max 40)
    // Body Fat Penalty (25 pts max)
    const idealFatMid = isMale ? 17.0 : 23.0;
    const bodyFat = parseFloat(data.body_fat_percent) || 20.0;
    const fatPoints = Math.max(0, 25 - (Math.abs(bodyFat - idealFatMid) * 1.5));

    // BMI Penalty (15 pts max)
    const bmiPoints = Math.max(0, 15 - (Math.abs(bmi - 22.0) * 1.2));
    const bodyCompScore = Math.max(0, Math.min(40, fatPoints + bmiPoints));

    // Component B: Vital Signs (Max 20)
    // RHR Points (10 pts max)
    const rhr = parseInt(data.resting_heart_rate, 10) || 70;
    let rhrPoints = 6;
    if (rhr <= 60) rhrPoints = 10;
    else if (rhr <= 70) rhrPoints = 8;
    else if (rhr <= 80) rhrPoints = 6;
    else rhrPoints = 3;

    // BP Penalty (10 pts max)
    const sys = parseInt(data.blood_pressure_systolic, 10) || 120;
    const dia = parseInt(data.blood_pressure_diastolic, 10) || 80;
    const bpPenalty = (Math.abs(sys - 120) / 10) + (Math.abs(dia - 80) / 5);
    const bpPoints = Math.max(0, 10 - bpPenalty);
    const vitalsScore = Math.max(0, Math.min(20, rhrPoints + bpPoints));

    // Component C: Flexibility Score (Max 20)
    const sitReach = parseFloat(data.sit_and_reach_cm) || 30.0;
    const shFlex = parseFloat(data.shoulder_flexibility_cm) || 20.0;
    const flexCalc = ((sitReach / 40) * 10) + ((shFlex / 30) * 10);
    const flexibilityScore = Math.max(0, Math.min(20, flexCalc));

    // Component D: Body Measurement Score (Max 10)
    const waist = parseFloat(data.mid_waist_circumference_cm) || 80.0;
    const hip = parseFloat(data.hip_circumference_cm) || 95.0;
    const whr = hip > 0 ? waist / hip : 0.85;

    let whrPoints = 6;
    if (isMale) {
      if (whr <= 0.90) whrPoints = 10;
      else if (whr <= 0.99) whrPoints = 6;
      else whrPoints = 2;
    } else {
      if (whr <= 0.85) whrPoints = 10;
      else if (whr <= 0.89) whrPoints = 6;
      else whrPoints = 2;
    }
    const bodyMeasurementScore = Math.max(0, Math.min(10, whrPoints));

    // Component E: Trainer Assessment Score (Max 10)
    const trainerScore = Math.max(0, Math.min(10, parseFloat(data.trainer_assessment_score) || 8.0));

    // Overall Aggregate Score
    const overallScore = bodyCompScore + vitalsScore + flexibilityScore + bodyMeasurementScore + trainerScore;

    return {
      bmi: bmi.toFixed(1),
      whr: whr.toFixed(2),
      bodyCompScore: bodyCompScore.toFixed(2),
      vitalsScore: vitalsScore.toFixed(2),
      flexibilityScore: flexibilityScore.toFixed(2),
      bodyMeasurementScore: bodyMeasurementScore.toFixed(2),
      trainerScore: trainerScore.toFixed(2),
      overallScore: overallScore.toFixed(1)
    };
  }, []);

  // --- 5. Modal & Wizard Handlers ---
  const handleOpenCreateModal = (memberId = '') => {
    const targetMemberId = memberId || selectedMemberId || (members[0]?.user_id || members[0]?.id || '');
    if (!targetMemberId) {
      showToast('No member selected to take assessment.', 'error');
      return;
    }

    const entitlement = getMemberEntitlement(targetMemberId);
    if (!entitlement.isEntitled) {
      showToast(`Cannot create assessment: ${entitlement.reason}`, 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      member_id: String(targetMemberId),
      height_cm: latestAssessment?.height_cm ? parseFloat(latestAssessment.height_cm) : 175.0,
      weight_kg: latestAssessment?.weight_kg ? parseFloat(latestAssessment.weight_kg) : 72.0,
      assessment_type: 'PROGRESS'
    }));

    setFormStep(1);
    setShowCreateModal(true);
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSubmitAssessment = async (e) => {
    if (e) e.preventDefault();
    if (!formData.member_id) {
      showToast('Please select a member first.', 'error');
      setFormStep(1);
      return;
    }

    // Boundary sanitization guardrails
    if (parseFloat(formData.height_cm) <= 0 || parseFloat(formData.height_cm) > 300) {
      showToast('Please enter a valid height between 50 cm and 300 cm.', 'error');
      setFormStep(1);
      return;
    }
    if (parseFloat(formData.weight_kg) <= 0 || parseFloat(formData.weight_kg) > 500) {
      showToast('Please enter a valid weight between 10 kg and 500 kg.', 'error');
      setFormStep(1);
      return;
    }
    if (parseFloat(formData.body_fat_percent) < 0 || parseFloat(formData.body_fat_percent) > 100) {
      showToast('Body Fat Percentage must be between 0% and 100%.', 'error');
      setFormStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        member_id: parseInt(formData.member_id, 10),
        assessment_type: formData.assessment_type,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        resting_heart_rate: parseInt(formData.resting_heart_rate, 10),
        blood_pressure_systolic: parseInt(formData.blood_pressure_systolic, 10),
        blood_pressure_diastolic: parseInt(formData.blood_pressure_diastolic, 10),
        body_fat_percent: parseFloat(formData.body_fat_percent),
        muscle_mass_kg: parseFloat(formData.muscle_mass_kg) || 0.0,
        sit_and_reach_cm: parseFloat(formData.sit_and_reach_cm),
        shoulder_flexibility_cm: parseFloat(formData.shoulder_flexibility_cm),
        mid_waist_circumference_cm: parseFloat(formData.mid_waist_circumference_cm),
        lower_waist_circumference_cm: parseFloat(formData.lower_waist_circumference_cm) || 0.0,
        hip_circumference_cm: parseFloat(formData.hip_circumference_cm),
        chest_circumference_cm: parseFloat(formData.chest_circumference_cm) || 0.0,
        arm_circumference_cm: parseFloat(formData.arm_circumference_cm) || 0.0,
        thigh_circumference_cm: parseFloat(formData.thigh_circumference_cm) || 0.0,
        shoulder_width_cm: parseFloat(formData.shoulder_width_cm) || 0.0,
        trainer_assessment_score: parseFloat(formData.trainer_assessment_score),
        trainer_comments: formData.trainer_comments || '',
        next_assessment_date: formData.next_assessment_date
      };

      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        const computedScore = resData.overall_fitness_score || rubricScores.overallScore;
        showToast(`Fitness Assessment successfully saved! Overall Score: ${computedScore} / 100`, 'success');
        setShowCreateModal(false);
        setFormStep(1);

        // Refresh assessment records if creating for currently selected member
        if (String(formData.member_id) === String(selectedMemberId)) {
          fetchMemberAssessments(formData.member_id);
        }
      } else {
        showToast(resData.message || 'Failed to save fitness assessment.', 'error');
      }
    } catch (err) {
      console.error('Error creating assessment:', err);
      showToast('Network error submitting fitness assessment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 6. Derived Filters ---
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const mId = m.user_id || m.id;
      const query = searchQuery.toLowerCase();
      const matchesQuery = (m.name || '').toLowerCase().includes(query) ||
        (m.email || '').toLowerCase().includes(query) ||
        (m.phone || '').includes(query) ||
        String(mId).includes(query);

      if (!matchesQuery) return false;

      const entitlement = getMemberEntitlement(mId);
      if (entitlementFilter === 'ENTITLED' && !entitlement.isEntitled) return false;
      if (entitlementFilter === 'UNENTITLED' && entitlement.isEntitled) return false;

      return true;
    });
  }, [members, searchQuery, entitlementFilter, getMemberEntitlement]);

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find(m => String(m.user_id || m.id) === String(selectedMemberId));
  }, [members, selectedMemberId]);

  const selectedMemberEntitlement = useMemo(() => {
    if (!selectedMemberId) return null;
    return getMemberEntitlement(selectedMemberId);
  }, [selectedMemberId, getMemberEntitlement]);

  const targetModalMember = useMemo(() => {
    if (!formData.member_id) return null;
    return members.find(m => String(m.user_id || m.id) === String(formData.member_id));
  }, [members, formData.member_id]);

  const rubricScores = useMemo(() => {
    return calculateScoringRubric(formData, targetModalMember?.gender || 'Male');
  }, [calculateScoringRubric, formData, targetModalMember]);

  // If detailed report modal dashboard is active, render MemberAssessmentDashboard
  if (selectedMemberForReport) {
    const reportMember = selectedMemberForReport.member || selectedMemberForReport;
    const initialAssessmentId = selectedMemberForReport.assessmentId || null;

    return (
      <MemberAssessmentDashboard
        member={reportMember}
        initialAssessmentId={initialAssessmentId}
        onBack={() => setSelectedMemberForReport(null)}
        isAdmin={true}
      />
    );
  }

  return (
    <div className="fa-container fade-in">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`pt-toast ${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Summary KPI Cards Bar */}
      <div className="fa-kpi-bar">
        <div className="fa-kpi-card">
          <div className="fa-kpi-icon icon-indigo">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <div className="fa-kpi-val">{members.length}</div>
            <div className="fa-kpi-lbl">Total Registered Members</div>
          </div>
        </div>

        <div className="fa-kpi-card">
          <div className="fa-kpi-icon icon-emerald">
            <i className="fas fa-user-check"></i>
          </div>
          <div>
            <div className="fa-kpi-val">
              {members.filter(m => getMemberEntitlement(m.user_id || m.id).isEntitled).length}
            </div>
            <div className="fa-kpi-lbl">Assessment Entitled</div>
          </div>
        </div>

        <div className="fa-kpi-card">
          <div className="fa-kpi-icon icon-amber">
            <i className="fas fa-award"></i>
          </div>
          <div>
            <div className="fa-kpi-val">
              {latestAssessment?.overall_fitness_score ? `${latestAssessment.overall_fitness_score} / 100` : '81.5 / 100'}
            </div>
            <div className="fa-kpi-lbl">Active Fitness Score</div>
          </div>
        </div>
      </div>

      {/* Toolbar & Search Controls */}
      <div className="fa-controls-bar">
        <div className="fa-search-group">
          <i className="fas fa-search fa-search-icon"></i>
          <input
            type="text"
            className="fa-search-input"
            placeholder="Search members by name, phone, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="fa-search-clear" onClick={() => setSearchQuery('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="fa-filter-group">
          <span className="fa-filter-label">Feature Entitlement</span>
          <select
            className="fa-select"
            value={entitlementFilter}
            onChange={(e) => setEntitlementFilter(e.target.value)}
          >
            <option value="ALL">All Entitlement Statuses</option>
            <option value="ENTITLED">Entitled Only (ACCESS_ASSESSMENTS)</option>
            <option value="UNENTITLED">Unentitled Only</option>
          </select>
        </div>

        <div className="fa-filter-group">
          <span className="fa-filter-label">Assessment Type</span>
          <select
            className="fa-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Assessment Types</option>
            <option value="INITIAL">INITIAL Assessment</option>
            <option value="PROGRESS">PROGRESS Assessment</option>
            <option value="FINAL">FINAL Assessment</option>
          </select>
        </div>
      </div>

      {/* Main Split Grid: Left Member List | Right Selected Member Dashboard & History */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedMemberId ? '1fr 1.6fr' : '1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left Column: Members List Directory */}
        <div className="pt-card" style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Member Directory</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Showing {filteredMembers.length} members</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '8px' }}></i>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading member directory & entitlements...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No members found matching filter criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '650px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredMembers.map((m) => {
                const mId = m.user_id || m.id;
                const entitlement = getMemberEntitlement(mId);
                const isSelected = String(mId) === String(selectedMemberId);

                return (
                  <div
                    key={mId}
                    onClick={() => setSelectedMemberId(mId)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(79, 70, 229, 0.04)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isSelected ? '#4f46e5' : '#e0e7ff',
                        color: isSelected ? '#ffffff' : '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        {(m.name || 'M').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.name || 'Member'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          ID: {mId} • {entitlement.planName}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      {entitlement.isEntitled ? (
                        <span className="pt-badge status-active" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                          <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Entitled
                        </span>
                      ) : (
                        <span className="pt-badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: 600 }}>
                          <i className="fas fa-lock" style={{ marginRight: '4px' }}></i> Lacks Access
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Member Assessment Workspace */}
        {selectedMemberId && selectedMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Selected Member Header Card */}
            <div className="pt-card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff', padding: '18px 22px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                  {(selectedMember.name || 'M').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>{selectedMember.name}</h2>
                    {selectedMemberEntitlement?.isEntitled ? (
                      <span className="pt-badge" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.72rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <i className="fas fa-check-circle"></i> Assessment Entitled ({selectedMemberEntitlement.planName})
                      </span>
                    ) : (
                      <span className="pt-badge" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', fontSize: '0.72rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <i className="fas fa-exclamation-circle"></i> Lacks Entitlement ({selectedMemberEntitlement?.planName})
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#c7d2fe', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    ID: {selectedMemberId} • {selectedMember.email || 'No email'} • {selectedMember.phone || 'No phone'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleOpenCreateModal(selectedMemberId)}
                  disabled={!selectedMemberEntitlement?.isEntitled}
                  className="pt-btn"
                  style={{
                    background: selectedMemberEntitlement?.isEntitled ? '#4f46e5' : '#475569',
                    color: '#ffffff',
                    opacity: selectedMemberEntitlement?.isEntitled ? 1 : 0.6,
                    cursor: selectedMemberEntitlement?.isEntitled ? 'pointer' : 'not-allowed',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                  title={selectedMemberEntitlement?.isEntitled ? 'Take New Assessment' : selectedMemberEntitlement?.reason}
                >
                  <i className="fas fa-plus-circle" style={{ marginRight: '6px' }}></i> Take Assessment
                </button>
              </div>
            </div>

            {/* Unentitled Notice Warning Banner */}
            {!selectedMemberEntitlement?.isEntitled && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#991b1b' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.2rem', color: '#ef4444' }}></i>
                <div style={{ fontSize: '0.82rem' }}>
                  <strong>Assessment Feature Locked for this Member:</strong>
                  <div style={{ marginTop: '2px' }}>{selectedMemberEntitlement?.reason}. Upgrade the member's subscription to include the <code>ACCESS_ASSESSMENTS</code> entitlement to enable assessment entry.</div>
                </div>
              </div>
            )}

            {/* Latest Assessment Overview Metrics Card */}
            {latestAssessment && (
              <div className="pt-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Latest Assessment Metrics ({latestAssessment.assessment_date || 'Recent'})
                  </h3>
                  <button
                    className="pt-btn pt-btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '6px' }}
                    onClick={() => setSelectedMemberForReport({ member: selectedMember, assessmentId: latestAssessment?.assessment_id })}
                  >
                    View Full Scorecard <i className="fas fa-arrow-right" style={{ marginLeft: '4px' }}></i>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>OVERALL SCORE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: parseFloat(latestAssessment.overall_fitness_score) >= 80 ? '#10b981' : parseFloat(latestAssessment.overall_fitness_score) >= 60 ? '#f59e0b' : '#ef4444', marginTop: '2px' }}>
                      {latestAssessment.overall_fitness_score} / 100
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>BODY COMP</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                      {latestAssessment.body_composition_score || '32.5'} / 40
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>VITALS</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                      {latestAssessment.vital_signs_score || '16.0'} / 20
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>FLEXIBILITY</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                      {latestAssessment.flexibility_score || '15.5'} / 20
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>MEASUREMENTS</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                      {latestAssessment.body_measurement_score || '9.0'} / 10
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment History Table */}
            <div className="pt-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Assessment History Timeline</h3>

              {loadingAssessments ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading assessments...
                </div>
              ) : memberAssessments.length > 0 ? (
                <div className="pt-table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="pt-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Fitness Score</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberAssessments.map((a, idx) => (
                        <tr key={a.assessment_id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b' }}>
                            {a.assessment_date || 'N/A'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span className="pt-badge" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>
                              {a.assessment_type || 'INITIAL'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: parseFloat(a.overall_fitness_score) >= 80 ? '#10b981' : '#f59e0b' }}>
                            {a.overall_fitness_score} / 100
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <button
                              className="pt-icon-btn"
                              style={{ color: '#4f46e5' }}
                              title="View Full Report"
                              onClick={() => setSelectedMemberForReport({ member: selectedMember, assessmentId: a.assessment_id })}
                            >
                              <i className="far fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>
                  No historical fitness assessments recorded yet for this member.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 7. Multi-Step Assessment Creation Modal Wizard */}
      {showCreateModal && (
        <div className="pt-modal-overlay fade-in" style={{ zIndex: 1100 }}>
          <div className="pt-modal" style={{ maxWidth: '750px', width: '90%', borderRadius: '16px', padding: '24px', background: '#ffffff' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  New Fitness Assessment — Step {formStep} of 5
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Target Member: <strong>{targetModalMember?.name || 'Selected Member'}</strong> (ID: {formData.member_id})
                </p>
              </div>
              <button className="pt-icon-btn" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times" style={{ color: '#64748b' }}></i>
              </button>
            </div>

            {/* Wizard Step Progress Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '4px' }}>
              {[
                { step: 1, label: 'Demographics' },
                { step: 2, label: 'Vitals' },
                { step: 3, label: 'Composition' },
                { step: 4, label: 'Physical Tests' },
                { step: 5, label: 'Evaluation' }
              ].map(s => (
                <div
                  key={s.step}
                  onClick={() => setFormStep(s.step)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: formStep === s.step ? '#4f46e5' : formStep > s.step ? '#e0e7ff' : '#f1f5f9',
                    color: formStep === s.step ? '#ffffff' : formStep > s.step ? '#4338ca' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Step {s.step}: {s.label}
                </div>
              ))}
            </div>

            {/* Form Wizard Step Content */}
            <form onSubmit={handleSubmitAssessment}>
              {/* STEP 1: Demographics & Type */}
              {formStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Assessment Type *</label>
                      <select
                        className="fa-select"
                        style={{ width: '100%' }}
                        value={formData.assessment_type}
                        onChange={(e) => handleInputChange('assessment_type', e.target.value)}
                      >
                        <option value="INITIAL">INITIAL Assessment</option>
                        <option value="PROGRESS">PROGRESS Assessment</option>
                        <option value="FINAL">FINAL Assessment</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Next Assessment Date</label>
                      <input
                        type="date"
                        className="fa-search-input"
                        value={formData.next_assessment_date}
                        onChange={(e) => handleInputChange('next_assessment_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Height (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.height_cm}
                        onChange={(e) => handleInputChange('height_cm', e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Weight (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.weight_kg}
                        onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                      <span>Calculated BMI: <strong>{rubricScores.bmi} kg/m²</strong></span>
                      <span>Target Ideal Baseline: <strong>18.5 - 24.9</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Vital Signs */}
              {formStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Resting Heart Rate (RHR bpm) *</label>
                    <input
                      type="number"
                      className="fa-search-input"
                      value={formData.resting_heart_rate}
                      onChange={(e) => handleInputChange('resting_heart_rate', e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      Optimal RHR: ≤ 60 bpm (10 pts), 61-70 bpm (8 pts), 71-80 bpm (6 pts), &gt;80 bpm (3 pts).
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Blood Pressure Systolic (mmHg) *</label>
                      <input
                        type="number"
                        className="fa-search-input"
                        value={formData.blood_pressure_systolic}
                        onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Blood Pressure Diastolic (mmHg) *</label>
                      <input
                        type="number"
                        className="fa-search-input"
                        value={formData.blood_pressure_diastolic}
                        onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      Calculated Vital Signs Sub-Score: <strong>{rubricScores.vitalsScore} / 20.00</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Body Composition */}
              {formStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Body Fat % *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.body_fat_percent}
                        onChange={(e) => handleInputChange('body_fat_percent', e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Muscle Mass (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.muscle_mass_kg}
                        onChange={(e) => handleInputChange('muscle_mass_kg', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      Calculated Body Composition Sub-Score: <strong>{rubricScores.bodyCompScore} / 40.00</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Physical Tests & Circumferences */}
              {formStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Sit & Reach Test (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.sit_and_reach_cm}
                        onChange={(e) => handleInputChange('sit_and_reach_cm', e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Shoulder Flexibility (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.shoulder_flexibility_cm}
                        onChange={(e) => handleInputChange('shoulder_flexibility_cm', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Mid Waist (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.mid_waist_circumference_cm}
                        onChange={(e) => handleInputChange('mid_waist_circumference_cm', e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Hip (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.hip_circumference_cm}
                        onChange={(e) => handleInputChange('hip_circumference_cm', e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Chest (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="fa-search-input"
                        value={formData.chest_circumference_cm}
                        onChange={(e) => handleInputChange('chest_circumference_cm', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                    <span>Waist-to-Hip Ratio (WHR): <strong>{rubricScores.whr}</strong></span>
                    <span>Flexibility Sub-Score: <strong>{rubricScores.flexibilityScore} / 20.00</strong></span>
                  </div>
                </div>
              )}

              {/* STEP 5: Evaluation & Live Rubric Score Breakdown */}
              {formStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Trainer Assessment Score (0.0 - 10.0) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="fa-search-input"
                      value={formData.trainer_assessment_score}
                      onChange={(e) => handleInputChange('trainer_assessment_score', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Trainer Evaluation & Recommendations</label>
                    <textarea
                      rows="3"
                      className="fa-search-input"
                      style={{ height: 'auto', padding: '10px' }}
                      value={formData.trainer_comments}
                      onChange={(e) => handleInputChange('trainer_comments', e.target.value)}
                    ></textarea>
                  </div>

                  {/* Live Rubric Aggregate Summary Card */}
                  <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c7d2fe' }}>LIVE FITNESS SCORING ENGINE RUBRIC</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{rubricScores.overallScore} / 100</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.72rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '6px' }}>
                        <div>Body Comp</div>
                        <strong>{rubricScores.bodyCompScore} / 40</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '6px' }}>
                        <div>Vitals</div>
                        <strong>{rubricScores.vitalsScore} / 20</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '6px' }}>
                        <div>Flexibility</div>
                        <strong>{rubricScores.flexibilityScore} / 20</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '6px' }}>
                        <div>Measurement</div>
                        <strong>{rubricScores.bodyMeasurementScore} / 10</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '6px' }}>
                        <div>Trainer Score</div>
                        <strong>{rubricScores.trainerScore} / 10</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Footer Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <div>
                  {formStep > 1 && (
                    <button
                      type="button"
                      className="pt-btn pt-btn-secondary"
                      onClick={() => setFormStep(prev => prev - 1)}
                    >
                      <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i> Previous
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="pt-btn pt-btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>

                  {formStep < 5 ? (
                    <button
                      type="button"
                      className="pt-btn"
                      style={{ background: '#4f46e5', color: '#ffffff' }}
                      onClick={() => setFormStep(prev => prev + 1)}
                    >
                      Next Step <i className="fas fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="pt-btn"
                      style={{ background: '#10b981', color: '#ffffff' }}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i> Submit Assessment
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default FitnessAssessment;
