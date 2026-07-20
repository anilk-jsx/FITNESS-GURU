import React, { useState, useEffect, useCallback, useMemo } from 'react';
import tokenManager from '../utils/tokenManager';
import './MemberAssessmentDashboard.css';

const MemberAssessmentDashboard = ({ member, initialAssessmentId = null, onBack, isAdmin = false }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // --- Component State ---
  const [activeTab, setActiveTab] = useState('details'); // details, history, parameters
  const [loading, setLoading] = useState(true);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(initialAssessmentId);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [trainersMembersList, setTrainersMembersList] = useState([]);

  // --- Member Identification ---
  const memberName = memberProfile?.name || memberProfile?.full_name || member?.name || member?.full_name || 'Member';
  const memberEmail = memberProfile?.email || member?.email || 'N/A';
  const memberPhone = memberProfile?.phone || member?.phone || 'N/A';
  const memberId = member?.user_id || member?.id || memberProfile?.user_id || memberProfile?.id || '';
  const memberGender = memberProfile?.gender || member?.gender || 'Male';

  // --- Age Calculation Helper ---
  const calculateAge = useCallback((dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 'N/A';
  }, []);

  // --- Dynamic Age derived from date_of_birth ---
  const memberAge = useMemo(() => {
    if (member?.age && typeof member.age === 'number') return member.age;
    const dob = memberProfile?.date_of_birth || memberProfile?.dob || member?.date_of_birth || member?.dob;
    return calculateAge(dob);
  }, [member, memberProfile, calculateAge]);

  // --- 1. Fetch History, Member Details & Assigned Trainers API ---
  const fetchData = useCallback(async () => {
    if (!memberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userData = tokenManager.getUserData();
      const userRole = (userData?.role || '').toUpperCase();
      const isAdminRole = ['ADMIN', 'SUPER-ADMIN', 'SUPER_ADMIN', 'OWNER'].includes(userRole);

      // Concurrently fetch assessments history, full member details, and PT trainers-members assignments safely
      const fetchPromises = [
        tokenManager.apiCall(`${API_BASE_URL}/api/members/${memberId}/assessments`, { method: 'GET', noAuthRedirect: true }).catch(() => null),
        tokenManager.apiCall(`${API_BASE_URL}/api/members/view?user_id=${memberId}`, { method: 'GET', noAuthRedirect: true }).catch(() => null)
      ];

      if (isAdminRole) {
        fetchPromises.push(
          tokenManager.apiCall(`${API_BASE_URL}/api/admin/pt/trainers-members`, { method: 'GET', noAuthRedirect: true }).catch(() => null)
        );
      }

      const results = await Promise.all(fetchPromises);
      const historyRes = results[0];
      const profileRes = results[1];
      const ptRes = isAdminRole ? results[2] : null;

      let historyList = [];
      if (historyRes && historyRes.ok) {
        const hData = await historyRes.json();
        historyList = hData.data || (Array.isArray(hData) ? hData : []);
      }
      setAssessmentHistory(historyList);

      if (profileRes && profileRes.ok) {
        const pData = await profileRes.json();
        setMemberProfile(pData.data || pData);
      } else {
        setMemberProfile(null);
      }

      if (ptRes && ptRes.ok) {
        const ptData = await ptRes.json();
        setTrainersMembersList(ptData.data || (Array.isArray(ptData) ? ptData : []));
      } else {
        setTrainersMembersList([]);
      }

      // Determine target assessment ID to display
      let targetId = selectedAssessmentId || initialAssessmentId;
      if (!targetId && historyList.length > 0) {
        targetId = historyList[0].assessment_id;
      }

      if (targetId) {
        setSelectedAssessmentId(targetId);
        const detailRes = await tokenManager.apiCall(`${API_BASE_URL}/api/assessments/${targetId}`, { method: 'GET', noAuthRedirect: true }).catch(() => null);
        if (detailRes && detailRes.ok) {
          const dData = await detailRes.json();
          setSelectedAssessment(dData.data || dData);
        } else {
          // Fallback to history list item if detail call fails
          const found = historyList.find(a => String(a.assessment_id) === String(targetId));
          setSelectedAssessment(found || null);
        }
      } else {
        // Attempt latest assessment fetch as fallback
        const latestRes = await tokenManager.apiCall(`${API_BASE_URL}/api/members/${memberId}/assessments/latest`, { method: 'GET', noAuthRedirect: true }).catch(() => null);
        if (latestRes && latestRes.ok) {
          const lData = await latestRes.json();
          const latestObj = lData.data || lData;
          setSelectedAssessment(latestObj);
          if (latestObj?.assessment_id) {
            setSelectedAssessmentId(latestObj.assessment_id);
          }
        } else {
          setSelectedAssessment(null);
        }
      }
    } catch (err) {
      console.error('Error loading assessment dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, memberId, selectedAssessmentId, initialAssessmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle selecting a specific historical assessment
  const handleSelectAssessment = async (id) => {
    setSelectedAssessmentId(id);
    setLoading(true);
    try {
      const detailRes = await tokenManager.apiCall(`${API_BASE_URL}/api/assessments/${id}`, { method: 'GET', noAuthRedirect: true }).catch(() => null);
      if (detailRes && detailRes.ok) {
        const dData = await detailRes.json();
        setSelectedAssessment(dData.data || dData);
      } else {
        const found = assessmentHistory.find(a => String(a.assessment_id) === String(id));
        setSelectedAssessment(found || null);
      }
      setActiveTab('details');
    } catch (err) {
      console.error('Error fetching assessment detail:', id, err);
    } finally {
      setLoading(false);
    }
  };

  // --- Dynamic Assigned Trainer resolution from /api/admin/pt/trainers-members ---
  const assignedTrainerName = useMemo(() => {
    if (trainersMembersList && Array.isArray(trainersMembersList) && trainersMembersList.length > 0) {
      // Search if this member ID is listed under any trainer's assigned members array
      const foundTrainer = trainersMembersList.find(tr =>
        tr.members?.some(m =>
          String(m.member_user_id) === String(memberId) ||
          String(m.member_profile_id) === String(memberId) ||
          String(m.member_id) === String(memberId)
        )
      );
      if (foundTrainer) {
        return foundTrainer.trainer_name || foundTrainer.name;
      }

      // Match by trainer_id if present in assessment record
      if (selectedAssessment?.trainer_id) {
        const foundById = trainersMembersList.find(tr =>
          String(tr.trainer_id) === String(selectedAssessment.trainer_id) ||
          String(tr.trainer_user_id) === String(selectedAssessment.trainer_id)
        );
        if (foundById) {
          return foundById.trainer_name || foundById.name;
        }
      }
    }

    return selectedAssessment?.trainer_name ||
           memberProfile?.assigned_trainer_name ||
           memberProfile?.trainer_name ||
           member?.assigned_trainer_name ||
           member?.trainer_name ||
           member?.trainer ||
           'Unassigned';
  }, [trainersMembersList, memberId, selectedAssessment, memberProfile, member]);

  // --- 2. Dynamic Metric Calculations & Scoring Rubric Mapping ---
  const metrics = useMemo(() => {
    if (!selectedAssessment) return null;
    const isMale = (memberGender || 'Male').toLowerCase() === 'male';

    const heightCm = selectedAssessment.height_cm
      ? parseFloat(selectedAssessment.height_cm)
      : (memberProfile?.height_cm ? parseFloat(memberProfile.height_cm) : (member?.height_cm ? parseFloat(member.height_cm) : 'N/A'));

    const weightKg = selectedAssessment.weight_kg
      ? parseFloat(selectedAssessment.weight_kg)
      : (memberProfile?.weight_kg ? parseFloat(memberProfile.weight_kg) : (member?.weight_kg ? parseFloat(member.weight_kg) : 'N/A'));

    const hNum = typeof heightCm === 'number' ? heightCm : 175;
    const wNum = typeof weightKg === 'number' ? weightKg : 70;
    const hM = hNum / 100;
    const bmiVal = parseFloat(selectedAssessment.bmi) || (hM > 0 ? wNum / (hM * hM) : 22.0);
    const bodyFatVal = parseFloat(selectedAssessment.body_fat_percent) || 20.0;
    const muscleMassVal = parseFloat(selectedAssessment.muscle_mass_kg) || 0.0;

    // Body Composition Breakdown (Max 40)
    const idealFatMid = isMale ? 17.0 : 23.0;
    const fatPoints = Math.max(0, 25 - (Math.abs(bodyFatVal - idealFatMid) * 1.5));
    const bmiPoints = Math.max(0, 15 - (Math.abs(bmiVal - 22.0) * 1.2));
    const bodyCompScore = parseFloat(selectedAssessment.body_composition_score) || (Math.max(0, Math.min(40, fatPoints + bmiPoints)));

    let bmiRating = 'Normal';
    if (bmiVal < 18.5) bmiRating = 'Underweight';
    else if (bmiVal <= 24.9) bmiRating = 'Normal';
    else if (bmiVal <= 29.9) bmiRating = 'Overweight';
    else bmiRating = 'Obese';

    // Vital Signs Breakdown (Max 20)
    const rhr = parseInt(selectedAssessment.resting_heart_rate, 10) || 70;
    let rhrPts = 6;
    if (rhr <= 60) rhrPts = 10;
    else if (rhr <= 70) rhrPts = 8;
    else if (rhr <= 80) rhrPts = 6;
    else rhrPts = 3;

    const sys = parseInt(selectedAssessment.blood_pressure_systolic, 10) || 120;
    const dia = parseInt(selectedAssessment.blood_pressure_diastolic, 10) || 80;
    const bpPenalty = (Math.abs(sys - 120) / 10) + (Math.abs(dia - 80) / 5);
    const bpPts = Math.max(0, 10 - bpPenalty);
    const vitalsScore = parseFloat(selectedAssessment.vital_signs_score) || (Math.max(0, Math.min(20, rhrPts + bpPts)));

    // Flexibility Breakdown (Max 20)
    const sitReach = parseFloat(selectedAssessment.sit_and_reach_cm) || 30.0;
    const shFlex = parseFloat(selectedAssessment.shoulder_flexibility_cm) || 20.0;
    const flexPts = ((sitReach / 40) * 10) + ((shFlex / 30) * 10);
    const flexibilityScore = parseFloat(selectedAssessment.flexibility_score) || (Math.max(0, Math.min(20, flexPts)));

    // Body Measurements Breakdown (Max 10)
    const midWaist = parseFloat(selectedAssessment.mid_waist_circumference_cm) || 80.0;
    const lowerWaist = parseFloat(selectedAssessment.lower_waist_circumference_cm) || 0.0;
    const hip = parseFloat(selectedAssessment.hip_circumference_cm) || 95.0;
    const chest = parseFloat(selectedAssessment.chest_circumference_cm) || 0.0;
    const arm = parseFloat(selectedAssessment.arm_circumference_cm) || 0.0;
    const thigh = parseFloat(selectedAssessment.thigh_circumference_cm) || 0.0;
    const shoulderWidth = parseFloat(selectedAssessment.shoulder_width_cm) || 0.0;

    const whr = hip > 0 ? (midWaist / hip) : 0.85;
    let whrPts = 6;
    if (isMale) {
      if (whr <= 0.90) whrPts = 10;
      else if (whr <= 0.99) whrPts = 6;
      else whrPts = 2;
    } else {
      if (whr <= 0.85) whrPts = 10;
      else if (whr <= 0.89) whrPts = 6;
      else whrPts = 2;
    }
    const bodyMeasurementScore = parseFloat(selectedAssessment.body_measurement_score) || (Math.max(0, Math.min(10, whrPts)));

    // Health History Fields
    const majorHealthIssues = selectedAssessment.major_health_issues ||
                              selectedAssessment.major_issues ||
                              memberProfile?.major_health_issues ||
                              memberProfile?.health_issues ||
                              member?.major_health_issues ||
                              'None Reported';

    const recentSurgery = selectedAssessment.recent_surgery ||
                          selectedAssessment.surgery ||
                          memberProfile?.recent_surgery ||
                          member?.recent_surgery ||
                          'None Reported';

    // Trainer Rating Breakdown (Max 10)
    const trainerScore = parseFloat(selectedAssessment.trainer_assessment_score) || 8.0;

    // Overall Score
    const overallScore = parseFloat(selectedAssessment.overall_fitness_score) || (bodyCompScore + vitalsScore + flexibilityScore + bodyMeasurementScore + trainerScore);

    let overallRating = 'Excellent';
    if (overallScore >= 80) overallRating = 'Excellent';
    else if (overallScore >= 60) overallRating = 'Good';
    else overallRating = 'Needs Improvement';

    return {
      bmi: bmiVal.toFixed(2),
      bmiRating,
      bmiPoints: bmiPoints.toFixed(1),
      heightCm,
      weightKg,
      bodyFat: bodyFatVal.toFixed(1),
      fatPoints: fatPoints.toFixed(1),
      muscleMass: muscleMassVal.toFixed(1),
      sys,
      dia,
      bpPts: bpPts.toFixed(1),
      rhr,
      rhrPts,
      sitReach,
      sitPts: Math.min(10, (sitReach / 40) * 10).toFixed(1),
      shFlex,
      shPts: Math.min(10, (shFlex / 30) * 10).toFixed(1),
      midWaist,
      lowerWaist,
      hip,
      chest,
      arm,
      thigh,
      shoulderWidth,
      whr: whr.toFixed(2),
      whrPts,
      majorHealthIssues,
      recentSurgery,
      bodyCompScore: bodyCompScore.toFixed(1),
      vitalsScore: vitalsScore.toFixed(1),
      flexibilityScore: flexibilityScore.toFixed(1),
      bodyMeasurementScore: bodyMeasurementScore.toFixed(1),
      trainerScore: trainerScore.toFixed(1),
      overallScore: overallScore.toFixed(1),
      overallRating,
      trainerComments: selectedAssessment.trainer_comments || 'No specific comments recorded.',
      date: selectedAssessment.assessment_date || 'N/A',
      nextAssessmentDate: selectedAssessment.next_assessment_date || null,
      assessmentType: selectedAssessment.assessment_type || 'INITIAL',
      trainerName: assignedTrainerName
    };
  }, [selectedAssessment, memberGender, memberProfile, member, assignedTrainerName]);

  // --- 3. Dynamic Progress Timeline & Chart Data ---
  const sortedHistory = useMemo(() => {
    return [...assessmentHistory].sort((a, b) => new Date(a.assessment_date || 0) - new Date(b.assessment_date || 0));
  }, [assessmentHistory]);

  const historyKPIs = useMemo(() => {
    if (sortedHistory.length === 0) {
      return { totalGrowth: '0', peakScore: '0', avgScore: '0', count: 0 };
    }
    const scores = sortedHistory.map(a => parseFloat(a.overall_fitness_score) || 0);
    const oldest = scores[0];
    const newest = scores[scores.length - 1];
    const totalGrowth = (newest - oldest).toFixed(1);
    const peakScore = Math.max(...scores).toFixed(1);
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    return { totalGrowth: (totalGrowth >= 0 ? `+${totalGrowth}` : totalGrowth), peakScore, avgScore, count: sortedHistory.length };
  }, [sortedHistory]);

  // Dynamic SVG Trajectory Coordinates
  const svgTrajectory = useMemo(() => {
    if (sortedHistory.length === 0) return { pathD: '', areaD: '', points: [] };
    const points = sortedHistory.map((item, idx) => {
      const stepX = sortedHistory.length === 1 ? 250 : 60 + (idx * (400 / (sortedHistory.length - 1)));
      const score = parseFloat(item.overall_fitness_score) || 50;
      // Score range 0..100 maps to SVG Y range 160..30
      const stepY = 160 - ((score / 100) * 130);
      return { x: stepX, y: stepY, score: score.toFixed(1), date: item.assessment_date || 'N/A', id: item.assessment_id, type: item.assessment_type };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;
    return { pathD, areaD, points };
  }, [sortedHistory]);

  // Photo gallery URLs from selected assessment if available
  const bodyPhotos = useMemo(() => {
    if (!selectedAssessment) return [];
    const photos = [];
    if (selectedAssessment.front_view_photo) photos.push({ label: 'Front View', url: selectedAssessment.front_view_photo });
    if (selectedAssessment.back_view_photo) photos.push({ label: 'Back View', url: selectedAssessment.back_view_photo });
    if (selectedAssessment.left_side_view_photo) photos.push({ label: 'Left Side View', url: selectedAssessment.left_side_view_photo });
    if (selectedAssessment.right_side_view_photo) photos.push({ label: 'Right Side View', url: selectedAssessment.right_side_view_photo });
    if (selectedAssessment.closeup_front_photo) photos.push({ label: 'Close-up Front', url: selectedAssessment.closeup_front_photo });
    if (selectedAssessment.closeup_back_photo) photos.push({ label: 'Close-up Back', url: selectedAssessment.closeup_back_photo });
    return photos;
  }, [selectedAssessment]);

  // --- 33 Parameters Database Reference Schema ---
  const parameterSchema = [
    {
      category: 'Member Information',
      subtitle: 'Basic details about the member',
      icon: 'fas fa-user-circle',
      params: [
        { id: 1, name: 'member_id', type: 'int(20)', required: true, notes: 'Auto Increment' },
        { id: 2, name: 'trainer_id', type: 'int(20)', required: true, notes: '-' },
        { id: 3, name: 'assessment_date', type: 'date', required: true, notes: 'Current Date' },
        { id: 4, name: 'next_assessment_date', type: 'date', required: false, notes: '-' },
        { id: 32, name: 'created_at', type: 'datetime', required: true, notes: 'Current Timestamp' },
        { id: 33, name: 'updated_at', type: 'datetime', required: true, notes: 'On Update Current Timestamp' }
      ]
    },
    {
      category: 'Body Composition',
      subtitle: 'Measures related to body composition',
      icon: 'fas fa-weight-hanging',
      params: [
        { id: 9, name: 'bmi', type: 'decimal(5,2)', required: true, notes: 'Stored Generated' },
        { id: 13, name: 'body_fat_percent', type: 'decimal(5,2)', required: true, notes: '-' },
        { id: 14, name: 'muscle_mass_kg', type: 'decimal(5,2)', required: false, notes: '-' }
      ]
    },
    {
      category: 'Vital Signs',
      subtitle: 'Basic vital health indicators',
      icon: 'fas fa-heartbeat',
      params: [
        { id: 10, name: 'blood_pressure_systolic', type: 'int(11)', required: true, notes: '-' },
        { id: 11, name: 'blood_pressure_diastolic', type: 'int(11)', required: true, notes: '-' },
        { id: 12, name: 'resting_heart_rate', type: 'int(11)', required: true, notes: '-' }
      ]
    },
    {
      category: 'Flexibility',
      subtitle: 'Flexibility and range of motion tests',
      icon: 'fas fa-child',
      params: [
        { id: 15, name: 'sit_and_reach_cm', type: 'decimal(5,2)', required: true, notes: '-' },
        { id: 16, name: 'shoulder_flexibility_cm', type: 'decimal(5,2)', required: true, notes: '-' }
      ]
    },
    {
      category: 'Body Measurements',
      subtitle: 'Body measurements and circumferences',
      icon: 'fas fa-ruler-horizontal',
      params: [
        { id: 17, name: 'mid_waist_circumference_cm', type: 'decimal(5,2)', required: true, notes: '-' },
        { id: 18, name: 'lower_waist_circumference_cm', type: 'decimal(5,2)', required: false, notes: '-' },
        { id: 19, name: 'hip_circumference_cm', type: 'decimal(5,2)', required: true, notes: '-' },
        { id: 20, name: 'chest_circumference_cm', type: 'decimal(5,2)', required: false, notes: '-' },
        { id: 21, name: 'arm_circumference_cm', type: 'decimal(5,2)', required: false, notes: '-' },
        { id: 22, name: 'thigh_circumference_cm', type: 'decimal(5,2)', required: false, notes: '-' },
        { id: 23, name: 'shoulder_width_cm', type: 'decimal(5,2)', required: false, notes: '-' }
      ]
    },
    {
      category: 'Health History',
      subtitle: 'Medical history and conditions',
      icon: 'fas fa-notes-medical',
      params: [
        { id: 7, name: 'major_health_issues', type: 'varchar(100)', required: false, notes: '-' },
        { id: 8, name: 'recent_surgery', type: 'varchar(100)', required: false, notes: '-' }
      ]
    },
    {
      category: 'Fitness Scores',
      subtitle: 'Calculated scores based on assessment',
      icon: 'fas fa-chart-line',
      params: [
        { id: 24, name: 'body_composition_score', type: 'decimal(5,2)', required: false, notes: 'Score out of 40' },
        { id: 25, name: 'vital_signs_score', type: 'decimal(5,2)', required: false, notes: 'Score out of 20' },
        { id: 26, name: 'flexibility_score', type: 'decimal(5,2)', required: false, notes: 'Score out of 20' },
        { id: 27, name: 'body_measurement_score', type: 'decimal(5,2)', required: false, notes: 'Score out of 10' },
        { id: 28, name: 'trainer_assessment_score', type: 'decimal(5,2)', required: false, notes: 'Score out of 10' },
        { id: 29, name: 'overall_fitness_score', type: 'decimal(5,2)', required: false, notes: 'Total out of 100' }
      ]
    },
    {
      category: 'Trainer Assessment',
      subtitle: "Trainer's overall evaluation",
      icon: 'fas fa-user-check',
      params: [
        { id: 30, name: 'trainer_comments', type: 'text', required: false, notes: 'utf8mb4_general_ci' }
      ]
    }
  ];

  // Circular gauge component
  const MiniCircularGauge = ({ score = 0, max = 100 }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((parseFloat(score) || 0) / max) * circumference;

    return (
      <div className="mad-gauge-mini">
        <svg className="mad-gauge-mini-svg" width="60" height="60" viewBox="0 0 60 60">
          <circle className="mad-gauge-mini-bg" cx="30" cy="30" r={radius} />
          <circle
            className="mad-gauge-mini-fill"
            cx="30"
            cy="30"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="mad-gauge-mini-icon">
          <i className="fas fa-bolt"></i>
        </div>
      </div>
    );
  };

  return (
    <div className={`mad-dashboard-wrapper ${isAdmin ? 'mad-light-theme' : 'mad-dark-theme'}`}>
      {/* Breadcrumb Navigation Bar */}
      <div className="mad-top-nav-bar">
        <div className="mad-breadcrumb">
          <button className="mad-breadcrumb-back" onClick={onBack}>
            <i className="fas fa-chevron-left"></i> Assessments Hub
          </button>
          <span className="mad-breadcrumb-divider">/</span>
          <span className="mad-breadcrumb-active">Scorecard Report</span>
        </div>

        <div className="mad-action-block">
          <button className="mad-btn-secondary" onClick={() => window.print()}>
            <i className="fas fa-print"></i> Print Report
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="mad-header-card">
        <div className="mad-profile-block">
          <div className="mad-avatar-container">
            <span className="mad-avatar-placeholder">
              {memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="mad-profile-details">
            <h1 className="mad-member-name">
              {memberName}
              <span className="mad-status-badge">Active</span>
            </h1>
            <p className="mad-meta-text">
              <span className="mad-meta-pill">ID: {memberId}</span>
              <span className="mad-meta-pill">{memberAge !== 'N/A' ? `${memberAge} yrs` : 'Age N/A'}</span>
              <span className="mad-meta-pill">{memberGender}</span>
              <span className="mad-meta-pill">Height: {metrics ? (typeof metrics.heightCm === 'number' ? `${metrics.heightCm} cm` : metrics.heightCm) : 'N/A'}</span>
              <span className="mad-meta-pill">Weight: {metrics ? (typeof metrics.weightKg === 'number' ? `${metrics.weightKg} kg` : metrics.weightKg) : 'N/A'}</span>
            </p>
            <p className="mad-meta-contact">
              <a href={`mailto:${memberEmail}`}><i className="far fa-envelope"></i> {memberEmail}</a>
              <span><i className="fas fa-phone-alt"></i> {memberPhone}</span>
            </p>
          </div>
        </div>

        {/* Header Stats Section */}
        <div className="mad-header-stats">
          <div className="mad-header-info-list">
            <div>
              <i className="far fa-calendar-alt"></i> <span>Date: {metrics ? metrics.date : 'N/A'}</span>
            </div>
            <div>
              <i className="far fa-user"></i> <span>Coach: {assignedTrainerName}</span>
            </div>
            <div>
              <i className="fas fa-clipboard-list"></i> <span>Type: {metrics ? metrics.assessmentType : 'INITIAL'}</span>
            </div>
            {metrics?.nextAssessmentDate && (
              <div>
                <i className="far fa-calendar-check"></i> <span>Next Due: {metrics.nextAssessmentDate}</span>
              </div>
            )}
          </div>

          <div className="mad-score-card-modern">
            <div className="mad-score-content">
              <span className="mad-score-label">Overall Score</span>
              <div className="mad-score-value">
                {metrics ? metrics.overallScore : '0'}<span>/100</span>
              </div>
              <span className="mad-score-rating">{metrics ? metrics.overallRating : 'No Data'}</span>
            </div>
            <MiniCircularGauge score={metrics ? metrics.overallScore : 0} max={100} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mad-tabs-container">
        <button
          className={`mad-tab-pill ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <i className="fas fa-chart-pie"></i> Details & Breakdown
        </button>
        <button
          className={`mad-tab-pill ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-chart-line"></i> History & Progress ({assessmentHistory.length})
        </button>
        <button
          className={`mad-tab-pill ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          <i className="fas fa-sliders-h"></i> Database Parameters
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px' }}></i>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading fitness assessment scorecard details...</p>
        </div>
      )}

      {/* Empty State when no assessments exist */}
      {!loading && !selectedAssessment && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px 0' }}>
          <i className="fas fa-clipboard-check" style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '16px' }}></i>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b' }}>No Fitness Assessment Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 20px auto' }}>
            There are currently no recorded fitness assessment details available for member <strong>{memberName}</strong>.
          </p>
          <button className="mad-btn-secondary" onClick={onBack}>
            <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i> Back to Assessment Hub
          </button>
        </div>
      )}

      {/* TAB 1: Assessment Details */}
      {!loading && selectedAssessment && metrics && activeTab === 'details' && (
        <div className="mad-tab-content fade-in">

          {/* Quick Score Overview KPI Cards */}
          <div className="mad-kpi-grid">
            <div className="mad-kpi-card body_composition">
              <div className="mad-kpi-icon"><i className="fas fa-weight-hanging"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Body Comp</span>
                <div className="mad-kpi-score">{metrics.bodyCompScore}<span>/40</span></div>
                <span className="mad-kpi-rating">{metrics.bmiRating}</span>
              </div>
            </div>

            <div className="mad-kpi-card vital_signs">
              <div className="mad-kpi-icon"><i className="fas fa-heartbeat"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Vital Signs</span>
                <div className="mad-kpi-score">{metrics.vitalsScore}<span>/20</span></div>
                <span className="mad-kpi-rating">{parseFloat(metrics.vitalsScore) >= 16 ? 'Excellent' : 'Normal'}</span>
              </div>
            </div>

            <div className="mad-kpi-card flexibility">
              <div className="mad-kpi-icon"><i className="fas fa-child"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Flexibility</span>
                <div className="mad-kpi-score">{metrics.flexibilityScore}<span>/20</span></div>
                <span className="mad-kpi-rating">{parseFloat(metrics.flexibilityScore) >= 14 ? 'Good' : 'Needs Work'}</span>
              </div>
            </div>

            <div className="mad-kpi-card body_measurements">
              <div className="mad-kpi-icon"><i className="fas fa-ruler-horizontal"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Measurements</span>
                <div className="mad-kpi-score">{metrics.bodyMeasurementScore}<span>/10</span></div>
                <span className="mad-kpi-rating">{parseFloat(metrics.bodyMeasurementScore) >= 8 ? 'Optimal' : 'Average'}</span>
              </div>
            </div>

            <div className="mad-kpi-card trainer_assessment">
              <div className="mad-kpi-icon"><i className="fas fa-user-check"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Coach Rating</span>
                <div className="mad-kpi-score">{metrics.trainerScore}<span>/10</span></div>
                <span className="mad-kpi-rating">{parseFloat(metrics.trainerScore) >= 8 ? 'Excellent' : 'Good'}</span>
              </div>
            </div>
          </div>

          {/* Detailed Scorecard Grid */}
          <div className="mad-grid-dashboard">

            {/* Card 1: Body Composition */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-weight-hanging icon-green"></i> Body Composition</h2>
                <span className="mad-card-score badge-green">{metrics.bodyCompScore}/40</span>
              </div>

              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Height & Weight</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">
                      {typeof metrics.heightCm === 'number' ? `${metrics.heightCm} cm` : metrics.heightCm} • {typeof metrics.weightKg === 'number' ? `${metrics.weightKg} kg` : metrics.weightKg}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">BMI (Body Mass Index)</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{metrics.bmi} <small>kg/m²</small></span>
                    <span className="mad-stat-points">{metrics.bmiPoints} pts</span>
                  </div>
                </div>
                <div className="mad-stat-status">
                  <i className="fas fa-check-circle"></i> Rating: {metrics.bmiRating} (Target: 18.5 - 24.9)
                </div>
              </div>

              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Body Fat Percentage</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{metrics.bodyFat}%</span>
                    <span className="mad-stat-points">{metrics.fatPoints} pts</span>
                  </div>
                </div>
                <div className="mad-stat-status">
                  <i className="fas fa-info-circle"></i> Ideal Baseline: {memberGender === 'Female' ? '21% - 25%' : '14% - 20%'}
                </div>
              </div>

              {metrics.muscleMass > 0 && (
                <div className="mad-stat-group">
                  <div className="mad-stat-row">
                    <span className="mad-stat-name">Muscle Mass</span>
                    <div className="mad-stat-value-group">
                      <span className="mad-stat-val">{metrics.muscleMass} <small>kg</small></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Vital Signs */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-heartbeat icon-blue"></i> Vital Signs</h2>
                <span className="mad-card-score badge-blue">{metrics.vitalsScore}/20</span>
              </div>

              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Blood Pressure</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{metrics.sys}/{metrics.dia} <small>mmHg</small></span>
                    <span className="mad-stat-points">{metrics.bpPts} pts</span>
                  </div>
                </div>
                <div className="mad-stat-status">
                  <i className="fas fa-check-circle"></i> Standard Ideal: 120/80 mmHg
                </div>
              </div>

              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Resting Heart Rate</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{metrics.rhr} <small>bpm</small></span>
                    <span className="mad-stat-points">{metrics.rhrPts} pts</span>
                  </div>
                </div>
                <div className="mad-stat-status">
                  <i className="fas fa-heart"></i> RHR Benchmark: &le;60 (10 pts), 61-70 (8 pts), 71-80 (6 pts)
                </div>
              </div>
            </div>

            {/* Card 3: Flexibility */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-child icon-purple"></i> Flexibility</h2>
                <span className="mad-card-score badge-purple">{metrics.flexibilityScore}/20</span>
              </div>

              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Sit & Reach Test</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{metrics.sitReach} <small>cm</small></span>
                    <span className="mad-stat-points">{metrics.sitPts} pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Target Max: 40 cm</div>
              </div>

              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Shoulder Flexibility</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{metrics.shFlex} <small>cm</small></span>
                    <span className="mad-stat-points">{metrics.shPts} pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Target Max: 30 cm</div>
              </div>
            </div>

            {/* Card 4: Body Measurements */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-ruler-horizontal icon-warning"></i> Measurements</h2>
                <span className="mad-card-score badge-warning">{metrics.bodyMeasurementScore}/10</span>
              </div>

              <div className="mad-measurements-grid">
                <div><span>Mid-Waist</span> <strong>{metrics.midWaist} cm</strong></div>
                <div><span>Hip</span> <strong>{metrics.hip} cm</strong></div>
                {metrics.lowerWaist > 0 && <div><span>Lower-Waist</span> <strong>{metrics.lowerWaist} cm</strong></div>}
                {metrics.chest > 0 && <div><span>Chest</span> <strong>{metrics.chest} cm</strong></div>}
                {metrics.arm > 0 && <div><span>Arm</span> <strong>{metrics.arm} cm</strong></div>}
                {metrics.thigh > 0 && <div><span>Thigh</span> <strong>{metrics.thigh} cm</strong></div>}
                {metrics.shoulderWidth > 0 && <div className="col-span-2"><span>Shoulder Width</span> <strong>{metrics.shoulderWidth} cm</strong></div>}
              </div>

              <div className="mad-ratio-section" style={{ marginTop: '12px' }}>
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Waist-to-Hip Ratio (WHR)</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{metrics.whr}</span>
                    <span className="mad-stat-points">{metrics.whrPts} pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Health History */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-notes-medical icon-danger"></i> Health History</h2>
              </div>
              <div className="mad-history-list">
                <div className="mad-history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>Major Health Issues</span>
                  <strong style={{ fontSize: '0.85rem', color: metrics.majorHealthIssues === 'None Reported' ? '#059669' : '#dc2626' }}>
                    {metrics.majorHealthIssues}
                  </strong>
                </div>
                <div className="mad-history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>Recent Surgery</span>
                  <strong style={{ fontSize: '0.85rem', color: metrics.recentSurgery === 'None Reported' ? '#059669' : '#dc2626' }}>
                    {metrics.recentSurgery}
                  </strong>
                </div>
              </div>
              <div className="mad-advice-alert info push-bottom" style={{ marginTop: '10px' }}>
                <i className="fas fa-shield-alt" style={{ marginRight: '6px' }}></i>
                {metrics.majorHealthIssues === 'None Reported' && metrics.recentSurgery === 'None Reported'
                  ? 'No major health risks or surgical contraindications reported.'
                  : 'Please consider medical background when assigning workout intensity.'}
              </div>
            </div>

            {/* Card 6: Score Breakdown Summary */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-chart-line icon-accent"></i> Score Breakdown</h2>
                <span className="mad-card-score badge-neutral">100 Total</span>
              </div>

              <div className="mad-score-breakdown">
                <div className="mad-score-row"><span>Body Composition</span> <strong>{metrics.bodyCompScore} / 40</strong></div>
                <div className="mad-score-row"><span>Vital Signs</span> <strong>{metrics.vitalsScore} / 20</strong></div>
                <div className="mad-score-row"><span>Flexibility</span> <strong>{metrics.flexibilityScore} / 20</strong></div>
                <div className="mad-score-row"><span>Body Measurement</span> <strong>{metrics.bodyMeasurementScore} / 10</strong></div>
                <div className="mad-score-row"><span>Trainer Rating</span> <strong>{metrics.trainerScore} / 10</strong></div>
                <div className="mad-score-row total">
                  <span>Overall Fitness Score</span>
                  <strong>{metrics.overallScore} / 100</strong>
                </div>
              </div>
            </div>

            {/* Card 7: Coach Assessment & Comments */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-user-check icon-teal"></i> Coach Evaluation</h2>
                <span className="mad-card-score badge-teal">{metrics.trainerScore}/10</span>
              </div>

              <div className="mad-advice-alert teal push-bottom" style={{ marginTop: '10px' }}>
                <i className="fas fa-quote-left" style={{ marginRight: '6px' }}></i> "{metrics.trainerComments}"
              </div>
            </div>

            {/* Card 8: Progress Photos (if uploaded) */}
            {bodyPhotos.length > 0 && (
              <div className="mad-modern-card col-span-2">
                <div className="mad-card-header">
                  <h2 className="mad-card-title"><i className="fas fa-camera icon-blue"></i> Progress Gallery</h2>
                </div>
                <div className="mad-gallery-scroll">
                  {bodyPhotos.map((photo, i) => (
                    <div className="mad-gallery-item" key={i}>
                      <img src={photo.url} alt={photo.label} loading="lazy" />
                      <div className="mad-gallery-overlay"><span>{photo.label}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 2: Assessment History & Progress */}
      {!loading && activeTab === 'history' && (
        <div className="mad-tab-content fade-in">

          {/* History KPIs */}
          <div className="mad-history-kpis">
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Total Growth</span>
              <div className="mad-hkpi-val text-success">{historyKPIs.totalGrowth} <small>pts</small></div>
            </div>
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Peak Score</span>
              <div className="mad-hkpi-val text-accent">{historyKPIs.peakScore} / 100</div>
            </div>
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Average Score</span>
              <div className="mad-hkpi-val">{historyKPIs.avgScore} / 100</div>
            </div>
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Recorded Assessments</span>
              <div className="mad-hkpi-val">{historyKPIs.count}</div>
            </div>
          </div>

          {/* Dynamic SVG Trajectory Chart */}
          {sortedHistory.length > 0 && (
            <div className="mad-modern-card" style={{ marginBottom: '20px' }}>
              <div className="mad-card-header">
                <div>
                  <h3 className="mad-chart-title">Overall Score Trajectory</h3>
                  <p className="mad-chart-subtitle">Historical Progression for {memberName}</p>
                </div>
              </div>

              <div className="mad-chart-canvas">
                <svg viewBox="0 0 500 200" width="100%" height="100%">
                  <defs>
                    <linearGradient id="mainGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-success)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--accent-success)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="480" y2="30" stroke="var(--border-light)" strokeDasharray="4 4" />
                  <line x1="40" y1="95" x2="480" y2="95" stroke="var(--border-light)" strokeDasharray="4 4" />
                  <line x1="40" y1="160" x2="480" y2="160" stroke="var(--border-solid)" strokeWidth="1" />

                  <text x="30" y="34" fill="var(--text-muted)" fontSize="10" textAnchor="end">100</text>
                  <text x="30" y="99" fill="var(--text-muted)" fontSize="10" textAnchor="end">50</text>
                  <text x="30" y="164" fill="var(--text-muted)" fontSize="10" textAnchor="end">0</text>

                  {/* Dynamic Area Fill */}
                  {svgTrajectory.areaD && (
                    <path d={svgTrajectory.areaD} fill="url(#mainGlow)" />
                  )}

                  {/* Dynamic Line */}
                  {svgTrajectory.pathD && (
                    <path
                      d={svgTrajectory.pathD}
                      fill="none"
                      stroke="var(--accent-success)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Dynamic Nodes & Labels */}
                  {svgTrajectory.points.map((p) => (
                    <g key={p.id || p.x} onClick={() => handleSelectAssessment(p.id)} style={{ cursor: 'pointer' }}>
                      <circle cx={p.x} cy={p.y} r="5" fill="var(--accent-success)" stroke="#ffffff" strokeWidth="2" />
                      <text x={p.x} y={p.y - 10} fill="var(--text-main)" fontSize="11" fontWeight="bold" textAnchor="middle">{p.score}</text>
                      <text x={p.x} y="180" fill="var(--text-muted)" fontSize="9" textAnchor="middle">{p.date}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}

          {/* Assessment History Records Table */}
          <div className="mad-modern-card no-pad">
            <div className="mad-card-header pad-xy">
              <h3 className="mad-table-title">Assessment History Log</h3>
            </div>

            <div className="mad-table-responsive">
              <table className="mad-modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Overall Score</th>
                    <th>Rating</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.length > 0 ? (
                    sortedHistory.map((item) => {
                      const score = parseFloat(item.overall_fitness_score) || 0;
                      const isSelected = String(item.assessment_id) === String(selectedAssessmentId);

                      return (
                        <tr key={item.assessment_id} style={{ background: isSelected ? 'rgba(79, 70, 229, 0.06)' : 'transparent' }}>
                          <td>
                            <div className="td-date-stack">
                              <span className="dt">{item.assessment_date || 'N/A'}</span>
                            </div>
                            {isSelected && <span className="mad-badge-pill new">Viewing</span>}
                          </td>
                          <td>
                            <span className="pt-badge" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>
                              {item.assessment_type || 'INITIAL'}
                            </span>
                          </td>
                          <td>
                            <span className="mad-score-chip">{score.toFixed(1)} / 100</span>
                          </td>
                          <td>
                            <span className="mad-text-rating">{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}</span>
                          </td>
                          <td className="text-right">
                            <button
                              className="mad-action-btn"
                              title="View Assessment Scorecard"
                              onClick={() => handleSelectAssessment(item.assessment_id)}
                            >
                              <i className="far fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic' }}>
                        No historical assessment records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Database Parameters */}
      {activeTab === 'parameters' && (
        <div className="mad-tab-content fade-in">
          <div className="mad-param-header">
            <div>
              <h2 className="mad-page-title">Database Schema Parameters</h2>
              <p className="mad-page-subtitle">33 physical fitness indicators & normalization fields defined in backend schema</p>
            </div>
          </div>

          <div className="mad-params-masonry">
            {parameterSchema.map((cat, i) => (
              <div className="mad-modern-card param-card" key={i}>
                <div className="mad-card-header param-header">
                  <div className="mad-param-icon-box">
                    <i className={cat.icon}></i>
                  </div>
                  <div>
                    <h3 className="mad-param-cat-name">{cat.category}</h3>
                    <p className="mad-param-cat-sub">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="mad-table-responsive param">
                  <table className="mad-modern-table condensed">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Field Name</th>
                        <th>Type</th>
                        <th className="text-center">Req</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.params.map((p, idx) => (
                        <tr key={idx}>
                          <td className="text-muted">{p.id}</td>
                          <td className="font-mono field-name">{p.name}</td>
                          <td className="text-muted text-sm">{p.type}</td>
                          <td className="text-center">
                            {p.required ? <i className="fas fa-asterisk text-danger" style={{ fontSize: '0.6rem' }}></i> : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberAssessmentDashboard;