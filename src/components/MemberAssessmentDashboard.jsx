import React, { useState } from 'react';
import './MemberAssessmentDashboard.css';

const MemberAssessmentDashboard = ({ member, onBack, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('details'); // details, history, parameters

  // Custom fallback details if not fully provided by parent
  const memberName = member?.name || 'Alex Johnson';
  const memberEmail = member?.email || 'alex.johnson@email.com';
  const memberPhone = member?.phone || '+1 555 123 4567';
  const memberId = member?.user_id || 'AJ12345';
  const memberGender = member?.gender || 'Male';
  const memberAge = member?.age || 28;
  const trainerName = member?.trainer || 'John Trainer';

  // Mock historical data mapping to the mockup screens
  const assessmentHistory = [
    {
      id: 5,
      date: 'May 15, 2024',
      time: '2:30 PM',
      overallScore: 85,
      rating: 'Very Good',
      improvement: '+20',
      improvementRaw: 20,
      isUp: true,
      trainer: trainerName,
      bodyComp: 40,
      vitals: 16,
      flexibility: 16,
      bodyMeasurements: 9,
      trainerScore: 10
    },
    {
      id: 4,
      date: 'Apr 15, 2024',
      time: '11:15 AM',
      overallScore: 78,
      rating: 'Good',
      improvement: '+13',
      improvementRaw: 13,
      isUp: true,
      trainer: trainerName,
      bodyComp: 34,
      vitals: 15,
      flexibility: 14,
      bodyMeasurements: 9,
      trainerScore: 9
    },
    {
      id: 3,
      date: 'Mar 15, 2024',
      time: '4:45 PM',
      overallScore: 65,
      rating: 'Good',
      improvement: '+7',
      improvementRaw: 7,
      isUp: true,
      trainer: trainerName,
      bodyComp: 28,
      vitals: 14,
      flexibility: 12,
      bodyMeasurements: 8,
      trainerScore: 9
    },
    {
      id: 2,
      date: 'Jan 15, 2024',
      time: '10:30 AM',
      overallScore: 58,
      rating: 'Average',
      improvement: '+13',
      improvementRaw: 13,
      isUp: true,
      trainer: trainerName,
      bodyComp: 26,
      vitals: 12,
      flexibility: 10,
      bodyMeasurements: 7,
      trainerScore: 8
    },
    {
      id: 1,
      date: 'Dec 15, 2023',
      time: '3:20 PM',
      overallScore: 45,
      rating: 'Average',
      improvement: '-',
      improvementRaw: 0,
      isUp: false,
      trainer: trainerName,
      bodyComp: 22,
      vitals: 12,
      flexibility: 8,
      bodyMeasurements: 6,
      trainerScore: 7
    }
  ];

  // Latest assessment details mapping
  const latestAssess = assessmentHistory[0];

  // Detailed breakdown structure matching image 1
  const bodyCompDetails = {
    bmi: {
      height: 175,
      weight: 70,
      value: 22.9,
      rating: 'Normal',
      points: '20/20',
      note: 'Great! Your body composition is within the healthy range.'
    },
    bodyFat: {
      value: 18,
      rating: 'Excellent',
      points: '20/20',
      note: 'Body fat percentage is excellent for your age and gender.'
    },
    muscleMass: 55.4
  };

  const vitalsDetails = {
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
      status: 'Normal',
      points: '8/10',
      rating: 'Normal',
      note: 'Your vital signs are good.'
    },
    heartRate: {
      value: 72,
      status: 'Normal',
      points: '8/10',
      rating: 'Normal',
      note: 'Resting heart rate is optimal (60-80 bpm).'
    }
  };

  const flexibilityDetails = {
    sitReach: {
      value: 28,
      rating: 'Good',
      points: '8/10',
      note: 'Good flexibility. Keep stretching to improve further.'
    },
    shoulder: {
      value: 'Good',
      rating: 'Good',
      points: '8/10',
      note: 'Good shoulder flexibility.'
    }
  };

  const bodyMeasurementsDetails = {
    midWaist: 82,
    lowerWaist: 84,
    hip: 94,
    chest: 100,
    arm: 32,
    thigh: 52,
    shoulderWidth: 42,
    ratio: 0.87,
    rating: 'Excellent',
    points: '10/10'
  };

  const healthHistoryDetails = {
    majorIssues: 'No',
    recentSurgery: 'No',
    note: 'No major health issues reported.'
  };

  const trainerAssessmentDetails = {
    posture: 'Excellent',
    mobility: 'Excellent',
    observation: 'Excellent',
    rating: 'Excellent',
    points: '10/10',
    comment: 'Excellent overall fitness. Great posture, mobility and movement quality.'
  };

  // 6 Photo Slots for gallery matching image 1
  const bodyPhotos = [
    { label: 'Front View', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
    { label: 'Back View', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
    { label: 'Left Side View', url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80' },
    { label: 'Right Side View', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80' },
    { label: 'Close-up Front', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80' },
    { label: 'Close-up Back', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80' }
  ];

  // 33 Parameters List organized by categories matching image 2
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
        { id: 7, name: 'major_health_issues', type: 'varchar(100)', required: true, notes: 'utf8mb4_general_ci' },
        { id: 8, name: 'recent_surgery', type: 'varchar(100)', required: true, notes: 'utf8mb4_general_ci' }
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
    },
    {
      category: 'Photos',
      subtitle: 'Assessment photos from different views',
      icon: 'fas fa-camera',
      params: [
        { id: 31, name: 'Front_view_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' },
        { id: 31, name: 'back_view_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' },
        { id: 31, name: 'left_side_view_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' },
        { id: 31, name: 'right_side_view_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' },
        { id: 31, name: 'closeup_front_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' },
        { id: 31, name: 'closeup_back_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' },
        { id: 31, name: 'closeup_left_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' },
        { id: 31, name: 'closeup_right_photo', type: 'varchar(255)', required: false, notes: 'Photo Path / URL' }
      ]
    },
    {
      category: 'Assessment Timeline',
      subtitle: 'Record tracking information',
      icon: 'fas fa-history',
      params: [
        { id: 31, name: 'last_assessment_date', type: 'date', required: false, notes: '-' }
      ]
    }
  ];

  // Helper to draw mini overall score gauge ring in header
  const MiniCircularGauge = ({ score, max }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / max) * circumference;

    return (
      <div className="mad-gauge-mini">
        <svg className="mad-gauge-mini-svg" width="54" height="54" viewBox="0 0 54 54">
          <circle className="mad-gauge-mini-bg" cx="27" cy="27" r={radius} />
          <circle 
            className="mad-gauge-mini-fill" 
            cx="27" 
            cy="27" 
            r={radius} 
            stroke="#22c55e"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="mad-gauge-mini-icon">
          <i className="fas fa-chart-line"></i>
        </div>
      </div>
    );
  };

  return (
    <div className="mad-dashboard-wrapper">
      {/* Breadcrumb Navigation Bar */}
      <div className="mad-top-nav-bar">
        <div className="mad-breadcrumb">
          <button className="mad-breadcrumb-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Assessments
          </button>
          <span>&gt;</span>
          <span className="mad-breadcrumb-active">Assessment Details</span>
        </div>
        
        <div className="mad-action-block">
          <button className="mad-btn-secondary">
            <i className="fas fa-download"></i> Download Report
          </button>
          <button className="mad-btn-icon-only">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="mad-header-row">
        <div className="mad-profile-block">
          <div className="mad-avatar-container">
            <span className="mad-avatar-placeholder">
              {memberName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </span>
          </div>
          <div className="mad-profile-details">
            <h1 className="mad-member-name">
              {memberName}
              <span className="mad-status-badge">Active Member</span>
            </h1>
            <p className="mad-meta-text">
              <span><strong>ID:</strong> {memberId}</span>
              <span>•</span>
              <span><strong>Age:</strong> {memberAge} years</span>
              <span>•</span>
              <span><strong>Gender:</strong> {memberGender}</span>
            </p>
            <p className="mad-meta-contact">
              <span><i className="far fa-envelope"></i> <a href={`mailto:${memberEmail}`}>{memberEmail}</a></span>
              <span><i className="fas fa-phone-alt"></i> {memberPhone}</span>
            </p>
          </div>
        </div>

        {/* Top Right Header Section: Dates and Overall Score */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <div style={{ marginBottom: '4px' }}>
              <i className="far fa-calendar-alt"></i> <strong>Assessment Date:</strong> {latestAssess.date} {latestAssess.time}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <i className="far fa-user"></i> <strong>Trainer:</strong> {latestAssess.trainer}
            </div>
            <div>
              <i className="fas fa-history"></i> <strong>Assessments Taken:</strong> 5
            </div>
          </div>

          <div className="mad-score-section">
            <div className="mad-score-box">
              <div className="mad-score-label">Overall Fitness Score</div>
              <div className="mad-score-num">{latestAssess.overallScore}<span>/100</span></div>
              <div className="mad-score-rating">{latestAssess.rating}</div>
            </div>
            <MiniCircularGauge score={latestAssess.overallScore} max={100} />
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="mad-tabs-bar">
        <button 
          className={`mad-tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Assessment Details
        </button>
        <button 
          className={`mad-tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Assessment History & Progress
        </button>
        <button 
          className={`mad-tab-button ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Assessment Parameters
        </button>
      </div>

      {/* Tab 1: Assessment Details */}
      {activeTab === 'details' && (
        <div className="mad-tab-content">
          
          {/* Quick Score Overview Cards */}
          <div className="mad-categories-grid">
            <div className="mad-category-kpi-card body_composition">
              <div className="mad-category-kpi-header">
                <span className="mad-category-kpi-title">Body Composition</span>
                <i className="fas fa-weight-hanging" style={{ color: '#10b981' }}></i>
              </div>
              <div className="mad-category-kpi-score">40<span>/40</span></div>
              <span className="mad-category-kpi-rating" style={{ color: '#10b981' }}>Excellent</span>
            </div>

            <div className="mad-category-kpi-card vital_signs">
              <div className="mad-category-kpi-header">
                <span className="mad-category-kpi-title">Vital Signs</span>
                <i className="fas fa-heartbeat" style={{ color: '#3b82f6' }}></i>
              </div>
              <div className="mad-category-kpi-score">16<span>/20</span></div>
              <span className="mad-category-kpi-rating" style={{ color: '#3b82f6' }}>Good</span>
            </div>

            <div className="mad-category-kpi-card flexibility">
              <div className="mad-category-kpi-header">
                <span className="mad-category-kpi-title">Flexibility</span>
                <i className="fas fa-child" style={{ color: '#8b5cf6' }}></i>
              </div>
              <div className="mad-category-kpi-score">16<span>/20</span></div>
              <span className="mad-category-kpi-rating" style={{ color: '#8b5cf6' }}>Good</span>
            </div>

            <div className="mad-category-kpi-card body_measurements">
              <div className="mad-category-kpi-header">
                <span className="mad-category-kpi-title">Measurements</span>
                <i className="fas fa-ruler-horizontal" style={{ color: '#f59e0b' }}></i>
              </div>
              <div className="mad-category-kpi-score">9<span>/10</span></div>
              <span className="mad-category-kpi-rating" style={{ color: '#f59e0b' }}>Excellent</span>
            </div>

            <div className="mad-category-kpi-card trainer_assessment">
              <div className="mad-category-kpi-header">
                <span className="mad-category-kpi-title">Trainer Rating</span>
                <i className="fas fa-user-check" style={{ color: '#06b6d4' }}></i>
              </div>
              <div className="mad-category-kpi-score">10<span>/10</span></div>
              <span className="mad-category-kpi-rating" style={{ color: '#06b6d4' }}>Excellent</span>
            </div>
          </div>

          {/* 3-Column Card Grid Layout */}
          <div className="mad-grid-dashboard">
            
            {/* Card 1: Body Composition */}
            <div className="mad-section-card">
              <h2 className="mad-section-title body_composition">
                <i className="fas fa-weight-hanging"></i> Body Composition <span>40/40</span>
              </h2>
              <div className="mad-stat-group">
                <div className="mad-stat-info">
                  <span className="mad-stat-name">BMI (20)</span>
                  <span className="mad-stat-value">{bodyCompDetails.bmi.value}<span className="mad-stat-value-badge">20/20</span></span>
                </div>
                <div className="mad-stat-status-row">
                  <i className="fas fa-check-circle"></i> <span>Normal (18.5 - 24.9)</span>
                </div>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-info">
                  <span className="mad-stat-name">Body Fat % (20)</span>
                  <span className="mad-stat-value">{bodyCompDetails.bodyFat.value}%<span className="mad-stat-value-badge">20/20</span></span>
                </div>
                <div className="mad-stat-status-row">
                  <i className="fas fa-check-circle"></i> <span>Excellent (10 - 20%)</span>
                </div>
              </div>
              <div className="mad-advice-box green">
                <i className="fas fa-star"></i>
                <span>Great! Your body composition is within the healthy range.</span>
              </div>
            </div>

            {/* Card 2: Vital Signs */}
            <div className="mad-section-card">
              <h2 className="mad-section-title vital_signs">
                <i className="fas fa-heartbeat"></i> Vital Signs <span>16/20</span>
              </h2>
              <div className="mad-stat-group">
                <div className="mad-stat-info">
                  <span className="mad-stat-name">Blood Pressure (10)</span>
                  <span className="mad-stat-value">{vitalsDetails.bloodPressure.systolic}/{vitalsDetails.bloodPressure.diastolic} <span style={{ fontSize: '0.78rem', color: '#64748b' }}>mmHg</span><span className="mad-stat-value-badge">8/10</span></span>
                </div>
                <div className="mad-stat-status-row">
                  <i className="fas fa-check-circle"></i> <span>Normal (90-120 / 60-80)</span>
                </div>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-info">
                  <span className="mad-stat-name">Resting Heart Rate (10)</span>
                  <span className="mad-stat-value">{vitalsDetails.heartRate.value} <span style={{ fontSize: '0.78rem', color: '#64748b' }}>bpm</span><span className="mad-stat-value-badge">8/10</span></span>
                </div>
                <div className="mad-stat-status-row">
                  <i className="fas fa-check-circle"></i> <span>Normal (60-80 bpm)</span>
                </div>
              </div>
              <div className="mad-advice-box blue">
                <i className="fas fa-heart"></i>
                <span>Your vital signs are good.</span>
              </div>
            </div>

            {/* Card 3: Flexibility */}
            <div className="mad-section-card">
              <h2 className="mad-section-title flexibility">
                <i className="fas fa-child"></i> Flexibility <span>16/20</span>
              </h2>
              <div className="mad-stat-group">
                <div className="mad-stat-info">
                  <span className="mad-stat-name">Sit &amp; Reach (10)</span>
                  <span className="mad-stat-value">{flexibilityDetails.sitReach.value} <span style={{ fontSize: '0.78rem', color: '#64748b' }}>cm</span><span className="mad-stat-value-badge">8/10</span></span>
                </div>
                <div className="mad-stat-status-row">
                  <i className="fas fa-check-circle"></i> <span>Good</span>
                </div>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-info">
                  <span className="mad-stat-name">Shoulder Flexibility (10)</span>
                  <span className="mad-stat-value">{flexibilityDetails.shoulder.value}<span className="mad-stat-value-badge">8/10</span></span>
                </div>
                <div className="mad-stat-status-row">
                  <i className="fas fa-check-circle"></i> <span>Good</span>
                </div>
              </div>
              <div className="mad-advice-box purple">
                <i className="fas fa-running"></i>
                <span>Good flexibility. Keep stretching to improve further.</span>
              </div>
            </div>

            {/* Card 4: Body Measurements */}
            <div className="mad-section-card">
              <h2 className="mad-section-title body_measurements">
                <i className="fas fa-ruler-horizontal"></i> Body Measurements <span>9/10</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                <div><strong>Mid-Waist:</strong> {bodyMeasurementsDetails.midWaist} cm</div>
                <div><strong>Lower-Waist:</strong> {bodyMeasurementsDetails.lowerWaist} cm</div>
                <div><strong>Hip:</strong> {bodyMeasurementsDetails.hip} cm</div>
                <div><strong>Chest:</strong> {bodyMeasurementsDetails.chest} cm</div>
                <div><strong>Arm:</strong> {bodyMeasurementsDetails.arm} cm</div>
                <div><strong>Thigh:</strong> {bodyMeasurementsDetails.thigh} cm</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Shoulder Width:</strong> {bodyMeasurementsDetails.shoulderWidth} cm</div>
              </div>
              <div className="mad-stat-group" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <div className="mad-stat-info">
                  <span className="mad-stat-name">Waist-to-Hip Ratio</span>
                  <span className="mad-stat-value">{bodyMeasurementsDetails.ratio}<span className="mad-stat-value-badge">10/10</span></span>
                </div>
                <div className="mad-range-bar-track" style={{ marginTop: '4px' }}>
                  <div className="mad-range-bar-fill" style={{ width: '40%', backgroundColor: '#10b981' }}></div>
                </div>
                <div className="mad-range-labels">
                  <span style={{ color: '#10b981' }}>&lt; 0.90 Excellent</span>
                  <span style={{ color: '#f59e0b' }}>0.90 - 0.99 Good</span>
                  <span style={{ color: '#ef4444' }}>&ge; 1.00 Improve</span>
                </div>
              </div>
              <div className="mad-advice-box orange" style={{ marginTop: 0 }}>
                <i className="fas fa-info-circle"></i>
                <span>Excellent! Your waist-to-hip ratio is in the optimal range.</span>
              </div>
            </div>

            {/* Card 5: Health History */}
            <div className="mad-section-card">
              <h2 className="mad-section-title health_history">
                <i className="fas fa-notes-medical"></i> Health History
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mad-stat-name">Major Health Issues</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>{healthHistoryDetails.majorIssues} <i className="fas fa-check-circle" style={{ color: '#22c55e' }}></i></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mad-stat-name">Recent Surgery</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>{healthHistoryDetails.recentSurgery} <i className="fas fa-check-circle" style={{ color: '#22c55e' }}></i></span>
                </div>
              </div>
              <div className="mad-advice-box green" style={{ marginTop: 'auto' }}>
                <i className="fas fa-shield-alt"></i>
                <span>No major health issues reported.</span>
              </div>
            </div>

            {/* Card 6: Fitness Scores List */}
            <div className="mad-section-card">
              <h2 className="mad-section-title fitness_scores">
                <i className="fas fa-chart-line"></i> Fitness Scores <span>100 Total</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Body Composition Score</span>
                  <strong>40/40</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vital Signs Score</span>
                  <strong>16/20</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Flexibility Score</span>
                  <strong>16/20</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Body Measurement Score</span>
                  <strong>9/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Trainer Assessment Score</span>
                  <strong>10/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', color: '#22c55e' }}>
                  <span><strong>Overall Fitness Score</strong></span>
                  <strong>85/100</strong>
                </div>
              </div>
            </div>

            {/* Card 7: Trainer Assessment */}
            <div className="mad-section-card">
              <h2 className="mad-section-title trainer_assessment">
                <i className="fas fa-user-check"></i> Trainer Assessment <span>10/10</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                <div><strong>Posture:</strong> {trainerAssessmentDetails.posture}</div>
                <div><strong>Mobility:</strong> {trainerAssessmentDetails.mobility}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Overall Obs:</strong> {trainerAssessmentDetails.observation}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                <span>Trainer Rating</span>
                <strong style={{ color: '#22c55e' }}>{trainerAssessmentDetails.rating} <span className="mad-stat-value-badge">10/10</span></strong>
              </div>
              <div className="mad-advice-box teal" style={{ marginTop: 0 }}>
                <i className="fas fa-quote-left"></i>
                <span>{trainerAssessmentDetails.comment}</span>
              </div>
            </div>

            {/* Card 8: Photos Card (Spans 2 columns on desktop) */}
            <div className="mad-section-card mad-col-span-2">
              <h2 className="mad-section-title photos">
                <i className="fas fa-camera"></i> Photos <span>Assessment Logs</span>
              </h2>
              <div className="mad-photos-grid-scrollable">
                {bodyPhotos.map((photo, i) => (
                  <div className="mad-photo-card-mini" key={i}>
                    <div className="mad-photo-image-wrapper-mini">
                      <img src={photo.url} alt={photo.label} />
                    </div>
                    <div className="mad-photo-label-mini-footer">{photo.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 9: Assessment Timeline Stepper (Spans 2 columns on desktop) */}
            <div className="mad-section-card mad-col-span-2">
              <h2 className="mad-section-title timeline">
                <i className="fas fa-history"></i> Assessment Timeline <span>History Logs</span>
              </h2>
              <div className="mad-timeline-stepper">
                <div className="mad-timeline-line"></div>
                {assessmentHistory.map((step) => {
                  let colorClass = 'blue';
                  if (step.overallScore >= 80) colorClass = 'green';
                  else if (step.overallScore >= 60) colorClass = 'blue';
                  else if (step.overallScore >= 50) colorClass = 'orange';
                  else colorClass = 'red';

                  return (
                    <div className="mad-timeline-step" key={step.id}>
                      <span className="mad-timeline-date">{step.date.split(',')[0]}</span>
                      <div className={`mad-timeline-node ${colorClass}`}></div>
                      <span className="mad-timeline-score">{step.overallScore}/100</span>
                      <span className="mad-timeline-rating">{step.rating}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 10: Score Progress & Mini Trend Chart */}
            <div className="mad-section-card">
              <h2 className="mad-section-title" style={{ color: '#ff6b35' }}>
                <i className="fas fa-chart-line"></i> Score Progress
              </h2>
              <div className="mad-score-progress-card">
                <div className="mad-score-progress-kpi">
                  <div className="mad-score-progress-val">+{latestAssess.overallScore - assessmentHistory[4].overallScore}</div>
                  <div className="mad-score-progress-lbl">Improvement</div>
                  <div className="mad-score-progress-desc">Last 5 Tests</div>
                </div>

                {/* Mini trend chart */}
                <div style={{ width: '100px', height: '60px' }}>
                  <svg viewBox="0 0 100 60" width="100%" height="100%">
                    <path 
                      d="M 5 50 L 28 41 L 51 37 L 74 27 L 95 20" 
                      fill="none" 
                      stroke="#22c55e" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    <circle cx="5" cy="50" r="2.5" fill="#22c55e" />
                    <circle cx="28" cy="41" r="2.5" fill="#22c55e" />
                    <circle cx="51" cy="37" r="2.5" fill="#22c55e" />
                    <circle cx="74" cy="27" r="2.5" fill="#22c55e" />
                    <circle cx="95" cy="20" r="2.5" fill="#22c55e" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Metadata stats bar */}
          <div className="mad-footer-stats-bar">
            <div className="mad-footer-stats-left">
              <div className="mad-footer-stat-item">
                <i className="fas fa-list-ol"></i> Total Parameters: <strong>33</strong>
              </div>
              <span>•</span>
              <div className="mad-footer-stat-item required">
                <i className="fas fa-check-double"></i> Required Parameters: <strong>19</strong>
              </div>
              <span>•</span>
              <div className="mad-footer-stat-item">
                <i className="fas fa-calculator"></i> Completed: <strong>31</strong>
              </div>
              <span>•</span>
              <div className="mad-footer-stat-item">
                <i className="fas fa-cogs"></i> Auto Calculated: <strong>2 (BMI, Scores)</strong>
              </div>
            </div>
            <div>
              <i className="fas fa-info-circle"></i> Note: Scores are based on current assessment data.
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Assessment History & Progress */}
      {activeTab === 'history' && (
        <div className="mad-tab-content">
          
          {/* Progress KPI Summaries */}
          <div className="mad-progress-kpi-row">
            <div className="mad-progress-kpi-card">
              <span className="mad-progress-kpi-lbl">Overall Progress</span>
              <div className="mad-progress-kpi-val improvement">+20</div>
              <span className="mad-progress-kpi-desc">Points Improvement</span>
            </div>
            
            <div className="mad-progress-kpi-card">
              <span className="mad-progress-kpi-lbl">Best Score</span>
              <div className="mad-progress-kpi-val" style={{ color: '#ff6b35' }}>85/100</div>
              <span className="mad-progress-kpi-desc">May 15, 2024</span>
            </div>

            <div className="mad-progress-kpi-card">
              <span className="mad-progress-kpi-lbl">Average Score</span>
              <div className="mad-progress-kpi-val">72/100</div>
              <span className="mad-progress-kpi-desc">Across 5 tests</span>
            </div>

            <div className="mad-progress-kpi-card">
              <span className="mad-progress-kpi-lbl">Consistency</span>
              <div className="mad-progress-kpi-val" style={{ color: '#10b981' }}>Good</div>
              <span className="mad-progress-kpi-desc">Steady improvement</span>
            </div>

            <div className="mad-progress-kpi-card">
              <span className="mad-progress-kpi-lbl">Tests Taken</span>
              <div className="mad-progress-kpi-val">5</div>
              <span className="mad-progress-kpi-desc">Last 12 months</span>
            </div>
          </div>

          {/* Trend Charts Section */}
          <div className="mad-charts-layout">
            
            {/* Chart 1: Overall Score Trend */}
            <div className="mad-chart-card">
              <div className="mad-chart-header">
                <h3 className="mad-chart-title">Overall Score Trend</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Dec 2023 - May 2024</span>
              </div>
              <div className="mad-chart-canvas-wrapper" style={{ height: '220px' }}>
                <svg viewBox="0 0 500 200" width="100%" height="100%">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
                  
                  {/* Axis values */}
                  <text x="25" y="24" fill="#64748b" fontSize="9" textAnchor="end">100</text>
                  <text x="25" y="84" fill="#64748b" fontSize="9" textAnchor="end">60</text>
                  <text x="25" y="144" fill="#64748b" fontSize="9" textAnchor="end">30</text>

                  {/* Draw Curve Path */}
                  <path 
                    d="M 60 102.5 L 160 83 L 260 72.5 L 360 53 L 460 42.5" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  {/* Data Points */}
                  <circle cx="60" cy="102.5" r="5" fill="#22c55e" stroke="#0c0c0e" strokeWidth="2.5" />
                  <text x="60" y="90" fill="#ffffff" fontSize="9.5" fontWeight="700" textAnchor="middle">45</text>
                  <text x="60" y="185" fill="#64748b" fontSize="8.5" textAnchor="middle">Dec 15</text>

                  <circle cx="160" cy="83" r="5" fill="#22c55e" stroke="#0c0c0e" strokeWidth="2.5" />
                  <text x="160" y="70" fill="#ffffff" fontSize="9.5" fontWeight="700" textAnchor="middle">58</text>
                  <text x="160" y="185" fill="#64748b" fontSize="8.5" textAnchor="middle">Jan 15</text>

                  <circle cx="260" cy="72.5" r="5" fill="#22c55e" stroke="#0c0c0e" strokeWidth="2.5" />
                  <text x="260" y="60" fill="#ffffff" fontSize="9.5" fontWeight="700" textAnchor="middle">65</text>
                  <text x="260" y="185" fill="#64748b" fontSize="8.5" textAnchor="middle">Mar 15</text>

                  <circle cx="360" cy="53" r="5" fill="#22c55e" stroke="#0c0c0e" strokeWidth="2.5" />
                  <text x="360" y="40" fill="#ffffff" fontSize="9.5" fontWeight="700" textAnchor="middle">78</text>
                  <text x="360" y="185" fill="#64748b" fontSize="8.5" textAnchor="middle">Apr 15</text>

                  <circle cx="460" cy="42.5" r="5" fill="#22c55e" stroke="#0c0c0e" strokeWidth="2.5" />
                  <text x="460" y="28" fill="#ffffff" fontSize="9.5" fontWeight="700" textAnchor="middle">85</text>
                  <text x="460" y="185" fill="#64748b" fontSize="8.5" textAnchor="middle">May 15</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Category Trend curves */}
            <div className="mad-chart-card">
              <div className="mad-chart-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <h3 className="mad-chart-title">Score Trend by Category</h3>
                <div className="mad-chart-legend">
                  <div className="mad-legend-item">
                    <span className="mad-legend-dot" style={{ backgroundColor: '#10b981' }}></span> Body Comp
                  </div>
                  <div className="mad-legend-item">
                    <span className="mad-legend-dot" style={{ backgroundColor: '#3b82f6' }}></span> Vitals
                  </div>
                  <div className="mad-legend-item">
                    <span className="mad-legend-dot" style={{ backgroundColor: '#8b5cf6' }}></span> Flexibility
                  </div>
                  <div className="mad-legend-item">
                    <span className="mad-legend-dot" style={{ backgroundColor: '#f59e0b' }}></span> Measurements
                  </div>
                  <div className="mad-legend-item">
                    <span className="mad-legend-dot" style={{ backgroundColor: '#06b6d4' }}></span> Coach Rating
                  </div>
                </div>
              </div>
              <div className="mad-chart-canvas-wrapper" style={{ height: '220px' }}>
                <svg viewBox="0 0 500 200" width="100%" height="100%">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                  <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />

                  {/* Lines mapping */}
                  <path d="M 60 83 L 160 69 L 260 62 L 360 41 L 460 20" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 76 L 160 62 L 260 48 L 360 34 L 460 20" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 104 L 160 90 L 260 76 L 360 62 L 460 48" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 76 L 160 62 L 260 48 L 360 34 L 460 34" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 62 L 160 48 L 260 34 L 360 34 L 460 20" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Date labels */}
                  <text x="60" y="180" fill="#64748b" fontSize="8.5" textAnchor="middle">Dec 15</text>
                  <text x="160" y="180" fill="#64748b" fontSize="8.5" textAnchor="middle">Jan 15</text>
                  <text x="260" y="180" fill="#64748b" fontSize="8.5" textAnchor="middle">Mar 15</text>
                  <text x="360" y="180" fill="#64748b" fontSize="8.5" textAnchor="middle">Apr 15</text>
                  <text x="460" y="180" fill="#64748b" fontSize="8.5" textAnchor="middle">May 15</text>
                </svg>
              </div>
            </div>

          </div>

          {/* Assessment History Table */}
          <div className="mad-section-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Assessment History</h3>
            </div>
            <div className="mad-history-table-wrapper">
              <table className="mad-history-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Overall Score</th>
                    <th>Rating</th>
                    <th>Change vs Previous</th>
                    <th>Trainer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentHistory.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>
                        {item.date} <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '4px' }}>{item.time}</span>
                        {idx === 0 && <span className="mad-history-badge latest" style={{ marginLeft: '4px' }}>Latest</span>}
                      </td>
                      <td>
                        <span className="mad-history-badge">{item.overallScore}/100</span>
                      </td>
                      <td>{item.rating}</td>
                      <td>
                        {item.improvement === '-' ? (
                          <span style={{ color: '#64748b' }}>-</span>
                        ) : (
                          <span className={`mad-trend-indicator ${item.isUp ? 'up' : 'down'}`}>
                            <i className={`fas ${item.isUp ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i> {item.improvement}
                          </span>
                        )}
                      </td>
                      <td>{item.trainer}</td>
                      <td>
                        <button className="mad-btn-icon" title="View details" onClick={() => setActiveTab('details')}>
                          <i className="far fa-eye"></i>
                        </button>
                        <button className="mad-btn-icon" title="Download report">
                          <i className="fas fa-download"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Comparison Matrix */}
          <div className="mad-section-card" style={{ padding: 0, overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Detailed Comparison</h3>
            </div>
            <div className="mad-matrix-table-wrapper">
              <table className="mad-matrix-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Dec 15, 2023</th>
                    <th>Jan 15, 2024</th>
                    <th>Mar 15, 2024</th>
                    <th>Apr 15, 2024</th>
                    <th>May 15, 2024</th>
                    <th>Change (First &rarr; Latest)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="mad-matrix-category-cell">
                      <span className="mad-legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                      Body Composition (40 pts)
                    </td>
                    <td>22/40 (55%)</td>
                    <td>26/40 (65%)</td>
                    <td>28/40 (70%)</td>
                    <td>34/40 (85%)</td>
                    <td>40/40 (100%)</td>
                    <td className="mad-matrix-change-col">+18 (45%)</td>
                  </tr>
                  <tr>
                    <td className="mad-matrix-category-cell">
                      <span className="mad-legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                      Vital Signs (20 pts)
                    </td>
                    <td>12/20 (60%)</td>
                    <td>14/20 (70%)</td>
                    <td>16/20 (80%)</td>
                    <td>18/20 (90%)</td>
                    <td>20/20 (100%)</td>
                    <td className="mad-matrix-change-col">+8 (40%)</td>
                  </tr>
                  <tr>
                    <td className="mad-matrix-category-cell">
                      <span className="mad-legend-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                      Flexibility (20 pts)
                    </td>
                    <td>8/20 (40%)</td>
                    <td>10/20 (50%)</td>
                    <td>12/20 (60%)</td>
                    <td>14/20 (70%)</td>
                    <td>16/20 (80%)</td>
                    <td className="mad-matrix-change-col">+8 (40%)</td>
                  </tr>
                  <tr>
                    <td className="mad-matrix-category-cell">
                      <span className="mad-legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                      Body Measurements (10 pts)
                    </td>
                    <td>6/10 (60%)</td>
                    <td>7/10 (70%)</td>
                    <td>8/10 (80%)</td>
                    <td>9/10 (90%)</td>
                    <td>9/10 (90%)</td>
                    <td className="mad-matrix-change-col">+3 (30%)</td>
                  </tr>
                  <tr>
                    <td className="mad-matrix-category-cell">
                      <span className="mad-legend-dot" style={{ backgroundColor: '#06b6d4' }}></span>
                      Trainer Assessment (10 pts)
                    </td>
                    <td>7/10 (70%)</td>
                    <td>8/10 (80%)</td>
                    <td>9/10 (90%)</td>
                    <td>9/10 (90%)</td>
                    <td>10/10 (100%)</td>
                    <td className="mad-matrix-change-col">+3 (30%)</td>
                  </tr>
                  <tr className="mad-matrix-total-row">
                    <td>Overall Score (100 pts)</td>
                    <td>45/100 (45%)</td>
                    <td>58/100 (58%)</td>
                    <td>65/100 (65%)</td>
                    <td>78/100 (78%)</td>
                    <td>85/100 (85%)</td>
                    <td className="mad-matrix-change-col">+40 (44%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Assessment Parameters organized exactly as in screenshot 2 */}
      {activeTab === 'parameters' && (
        <div className="mad-tab-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Assessment Parameters</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Organized by categories</p>
            </div>
            <button className="mad-btn-secondary">
              <i className="fas fa-balance-scale"></i> View Scoring System
            </button>
          </div>

          <div className="mad-parameters-grid-layout">
            {parameterSchema.map((cat, i) => (
              <div className="mad-parameter-category-card" key={i}>
                <h3 className="mad-parameter-category-title">
                  <i className={cat.icon}></i> {cat.category}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="mad-parameter-table">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}>#</th>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'center' }}>Req</th>
                        <th>Default / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.params.map((p, idx) => (
                        <tr key={idx}>
                          <td>{p.id}</td>
                          <td style={{ fontWeight: 600, color: '#ff6b35' }}>{p.name}</td>
                          <td style={{ color: '#94a3b8' }}>{p.type}</td>
                          <td style={{ textAlign: 'center' }}>
                            {p.required ? <i className="fas fa-check-circle mad-parameter-required-icon"></i> : <span style={{ color: '#64748b' }}>-</span>}
                          </td>
                          <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Parameters bottom stats bar */}
          <div className="mad-footer-stats-bar">
            <div className="mad-footer-stats-left">
              <div className="mad-footer-stat-item">
                <i className="fas fa-list-ol"></i> Total Parameters: <strong>33</strong>
              </div>
              <span>•</span>
              <div className="mad-footer-stat-item required">
                <i className="fas fa-check-double"></i> Required Parameters: <strong>19</strong>
              </div>
              <span>•</span>
              <div className="mad-footer-stat-item">
                <i className="fas fa-cogs"></i> Auto Generated: <strong>2 (member_id, bmi)</strong>
              </div>
            </div>
            <div>
              <i className="fas fa-info-circle"></i> Note: Fields without ID are calculated or photo uploads.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberAssessmentDashboard;
