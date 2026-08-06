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
            <i className="fas fa-chevron-left"></i> Assessments
          </button>
          <span className="mad-breadcrumb-divider">/</span>
          <span className="mad-breadcrumb-active">Assessment Details</span>
        </div>

        <div className="mad-action-block">
          <button className="mad-btn-secondary">
            <i className="fas fa-download"></i> Download Report
          </button>
          <button className="mad-btn-icon-only">
            <i className="fas fa-ellipsis-h"></i>
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
              <span className="mad-meta-pill">{memberAge} yrs</span>
              <span className="mad-meta-pill">{memberGender}</span>
            </p>
            <p className="mad-meta-contact">
              <a href={`mailto:${memberEmail}`}><i className="far fa-envelope"></i> {memberEmail}</a>
              <span><i className="fas fa-phone-alt"></i> {memberPhone}</span>
            </p>
          </div>
        </div>

        {/* Top Right Header Section: Dates and Overall Score */}
        <div className="mad-header-stats">
          <div className="mad-header-info-list">
            <div>
              <i className="far fa-calendar-alt"></i> <span>{latestAssess.date}</span>
            </div>
            <div>
              <i className="far fa-user"></i> <span>Coach: {latestAssess.trainer}</span>
            </div>
            <div>
              <i className="fas fa-clipboard-list"></i> <span>Test 5 of 5</span>
            </div>
          </div>

          <div className="mad-score-card-modern">
            <div className="mad-score-content">
              <span className="mad-score-label">Overall Score</span>
              <div className="mad-score-value">
                {latestAssess.overallScore}<span>/100</span>
              </div>
              <span className="mad-score-rating">{latestAssess.rating}</span>
            </div>
            <MiniCircularGauge score={latestAssess.overallScore} max={100} />
          </div>
        </div>
      </div>

      {/* Modern Navigation tabs */}
      <div className="mad-tabs-container">
        <button
          className={`mad-tab-pill ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <i className="fas fa-chart-pie"></i> Details
        </button>
        <button
          className={`mad-tab-pill ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-chart-line"></i> History & Progress
        </button>
        <button
          className={`mad-tab-pill ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          <i className="fas fa-sliders-h"></i> Parameters
        </button>
      </div>

      {/* Tab 1: Assessment Details */}
      {activeTab === 'details' && (
        <div className="mad-tab-content fade-in">

          {/* Quick Score Overview Cards */}
          <div className="mad-kpi-grid">
            <div className="mad-kpi-card body_composition">
              <div className="mad-kpi-icon"><i className="fas fa-weight-hanging"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Body Comp</span>
                <div className="mad-kpi-score">40<span>/40</span></div>
                <span className="mad-kpi-rating">Excellent</span>
              </div>
            </div>

            <div className="mad-kpi-card vital_signs">
              <div className="mad-kpi-icon"><i className="fas fa-heartbeat"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Vital Signs</span>
                <div className="mad-kpi-score">16<span>/20</span></div>
                <span className="mad-kpi-rating">Good</span>
              </div>
            </div>

            <div className="mad-kpi-card flexibility">
              <div className="mad-kpi-icon"><i className="fas fa-child"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Flexibility</span>
                <div className="mad-kpi-score">16<span>/20</span></div>
                <span className="mad-kpi-rating">Good</span>
              </div>
            </div>

            <div className="mad-kpi-card body_measurements">
              <div className="mad-kpi-icon"><i className="fas fa-ruler-horizontal"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Measurements</span>
                <div className="mad-kpi-score">9<span>/10</span></div>
                <span className="mad-kpi-rating">Excellent</span>
              </div>
            </div>

            <div className="mad-kpi-card trainer_assessment">
              <div className="mad-kpi-icon"><i className="fas fa-user-check"></i></div>
              <div className="mad-kpi-info">
                <span className="mad-kpi-title">Coach Rating</span>
                <div className="mad-kpi-score">10<span>/10</span></div>
                <span className="mad-kpi-rating">Excellent</span>
              </div>
            </div>
          </div>

          {/* 3-Column Card Grid Layout */}
          <div className="mad-grid-dashboard">

            {/* Card 1: Body Composition */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-weight-hanging icon-green"></i> Body Composition</h2>
                <span className="mad-card-score badge-green">40/40</span>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">BMI</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{bodyCompDetails.bmi.value}</span>
                    <span className="mad-stat-points">20 pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Normal (18.5 - 24.9)</div>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Body Fat %</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{bodyCompDetails.bodyFat.value}%</span>
                    <span className="mad-stat-points">20 pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Excellent (10 - 20%)</div>
              </div>
              <div className="mad-advice-alert success">
                <i className="fas fa-info-circle"></i> {bodyCompDetails.bmi.note}
              </div>
            </div>

            {/* Card 2: Vital Signs */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-heartbeat icon-blue"></i> Vital Signs</h2>
                <span className="mad-card-score badge-blue">16/20</span>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Blood Pressure</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{vitalsDetails.bloodPressure.systolic}/{vitalsDetails.bloodPressure.diastolic} <small>mmHg</small></span>
                    <span className="mad-stat-points">8 pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Normal (90-120 / 60-80)</div>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Resting Heart Rate</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{vitalsDetails.heartRate.value} <small>bpm</small></span>
                    <span className="mad-stat-points">8 pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Normal (60-80 bpm)</div>
              </div>
              <div className="mad-advice-alert info">
                <i className="fas fa-heart"></i> {vitalsDetails.bloodPressure.note}
              </div>
            </div>

            {/* Card 3: Flexibility */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-child icon-purple"></i> Flexibility</h2>
                <span className="mad-card-score badge-purple">16/20</span>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Sit & Reach</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{flexibilityDetails.sitReach.value} <small>cm</small></span>
                    <span className="mad-stat-points">8 pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Good</div>
              </div>
              <div className="mad-stat-group">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">Shoulder Flex</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{flexibilityDetails.shoulder.value}</span>
                    <span className="mad-stat-points">8 pts</span>
                  </div>
                </div>
                <div className="mad-stat-status"><i className="fas fa-check-circle"></i> Good</div>
              </div>
              <div className="mad-advice-alert purple">
                <i className="fas fa-running"></i> {flexibilityDetails.sitReach.note}
              </div>
            </div>

            {/* Card 4: Body Measurements */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-ruler-horizontal icon-warning"></i> Measurements</h2>
                <span className="mad-card-score badge-warning">9/10</span>
              </div>
              <div className="mad-measurements-grid">
                <div><span>Mid-Waist</span> <strong>{bodyMeasurementsDetails.midWaist} cm</strong></div>
                <div><span>Lower-Waist</span> <strong>{bodyMeasurementsDetails.lowerWaist} cm</strong></div>
                <div><span>Hip</span> <strong>{bodyMeasurementsDetails.hip} cm</strong></div>
                <div><span>Chest</span> <strong>{bodyMeasurementsDetails.chest} cm</strong></div>
                <div><span>Arm</span> <strong>{bodyMeasurementsDetails.arm} cm</strong></div>
                <div><span>Thigh</span> <strong>{bodyMeasurementsDetails.thigh} cm</strong></div>
                <div className="col-span-2"><span>Shoulder Width</span> <strong>{bodyMeasurementsDetails.shoulderWidth} cm</strong></div>
              </div>

              <div className="mad-ratio-section">
                <div className="mad-stat-row">
                  <span className="mad-stat-name">W/H Ratio</span>
                  <div className="mad-stat-value-group">
                    <span className="mad-stat-val">{bodyMeasurementsDetails.ratio}</span>
                    <span className="mad-stat-points">10 pts</span>
                  </div>
                </div>
                <div className="mad-progress-track">
                  <div className="mad-progress-fill success" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 5: Health History */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-notes-medical icon-danger"></i> Health History</h2>
              </div>
              <div className="mad-history-list">
                <div className="mad-history-item">
                  <span>Major Health Issues</span>
                  <div className="mad-history-badge">
                    {healthHistoryDetails.majorIssues} <i className="fas fa-check-circle"></i>
                  </div>
                </div>
                <div className="mad-history-item">
                  <span>Recent Surgery</span>
                  <div className="mad-history-badge">
                    {healthHistoryDetails.recentSurgery} <i className="fas fa-check-circle"></i>
                  </div>
                </div>
              </div>
              <div className="mad-advice-alert success push-bottom">
                <i className="fas fa-shield-check"></i> {healthHistoryDetails.note}
              </div>
            </div>

            {/* Card 6: Fitness Scores List */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-chart-line icon-accent"></i> Score Breakdown</h2>
                <span className="mad-card-score badge-neutral">100 Total</span>
              </div>
              <div className="mad-score-breakdown">
                <div className="mad-score-row"><span>Body Composition</span> <strong>40/40</strong></div>
                <div className="mad-score-row"><span>Vital Signs</span> <strong>16/20</strong></div>
                <div className="mad-score-row"><span>Flexibility</span> <strong>16/20</strong></div>
                <div className="mad-score-row"><span>Body Measurement</span> <strong>9/10</strong></div>
                <div className="mad-score-row"><span>Trainer Assessment</span> <strong>10/10</strong></div>
                <div className="mad-score-row total">
                  <span>Overall Fitness Score</span>
                  <strong>85/100</strong>
                </div>
              </div>
            </div>

            {/* Card 7: Trainer Assessment */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-user-check icon-teal"></i> Coach Assessment</h2>
                <span className="mad-card-score badge-teal">10/10</span>
              </div>
              <div className="mad-coach-grid">
                <div className="mad-coach-metric"><span>Posture</span> <strong>{trainerAssessmentDetails.posture}</strong></div>
                <div className="mad-coach-metric"><span>Mobility</span> <strong>{trainerAssessmentDetails.mobility}</strong></div>
                <div className="mad-coach-metric col-span-2"><span>Observation</span> <strong>{trainerAssessmentDetails.observation}</strong></div>
              </div>
              <div className="mad-advice-alert teal push-bottom">
                <i className="fas fa-quote-left"></i> "{trainerAssessmentDetails.comment}"
              </div>
            </div>

            {/* Card 8: Photos Card */}
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

            {/* Card 9: Assessment Timeline Stepper */}
            <div className="mad-modern-card col-span-2">
              <div className="mad-card-header">
                <h2 className="mad-card-title"><i className="fas fa-history icon-purple"></i> Timeline</h2>
              </div>
              <div className="mad-timeline-modern">
                <div className="mad-timeline-line"></div>
                {assessmentHistory.slice().reverse().map((step) => {
                  let statusTheme = 'danger';
                  if (step.overallScore >= 80) statusTheme = 'success';
                  else if (step.overallScore >= 60) statusTheme = 'info';
                  else if (step.overallScore >= 50) statusTheme = 'warning';

                  return (
                    <div className="mad-timeline-node-wrapper" key={step.id}>
                      <span className="mad-t-date">{step.date.split(',')[0]}</span>
                      <div className={`mad-t-node ${statusTheme}`}></div>
                      <span className="mad-t-score">{step.overallScore}</span>
                      <span className="mad-t-rating">{step.rating}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 10: Score Progress & Mini Trend Chart */}
            <div className="mad-modern-card accent-glow">
              <div className="mad-card-header">
                <h2 className="mad-card-title">Trend Snapshot</h2>
              </div>
              <div className="mad-snapshot-flex">
                <div className="mad-snapshot-data">
                  <span className="mad-snap-val">+{latestAssess.overallScore - assessmentHistory[4].overallScore}</span>
                  <span className="mad-snap-lbl">Points Gained</span>
                </div>

                {/* Modern Mini Area Chart */}
                <div className="mad-mini-chart">
                  <svg viewBox="0 0 100 60" width="100%" height="100%">
                    <defs>
                      <linearGradient id="miniArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-success)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--accent-success)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 5 50 L 28 41 L 51 37 L 74 27 L 95 20 L 95 60 L 5 60 Z"
                      fill="url(#miniArea)"
                    />
                    <path
                      d="M 5 50 L 28 41 L 51 37 L 74 27 L 95 20"
                      fill="none"
                      stroke="var(--accent-success)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="95" cy="20" r="4" fill="var(--bg-card)" stroke="var(--accent-success)" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Metadata stats bar */}
          <div className="mad-footer-stats">
            <div className="mad-f-items">
              <span className="mad-f-tag"><i className="fas fa-list"></i> 33 Params</span>
              <span className="mad-f-tag success"><i className="fas fa-check-double"></i> 19 Required</span>
              <span className="mad-f-tag"><i className="fas fa-check-circle"></i> 31 Completed</span>
              <span className="mad-f-tag info"><i className="fas fa-robot"></i> 2 Auto-calc</span>
            </div>
            <div className="mad-f-note">Scores mapped to most recent test data.</div>
          </div>
        </div>
      )}

      {/* Tab 2: Assessment History & Progress */}
      {activeTab === 'history' && (
        <div className="mad-tab-content fade-in">

          {/* Progress KPI Summaries */}
          <div className="mad-history-kpis">
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Total Growth</span>
              <div className="mad-hkpi-val text-success">+20 <small>pts</small></div>
            </div>
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Peak Score</span>
              <div className="mad-hkpi-val text-accent">85/100</div>
            </div>
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Average Score</span>
              <div className="mad-hkpi-val">72/100</div>
            </div>
            <div className="mad-hkpi-card">
              <span className="mad-hkpi-lbl">Total Tests</span>
              <div className="mad-hkpi-val">5</div>
            </div>
          </div>

          <div className="mad-charts-layout">
            {/* Chart 1: Overall Score Trend with Area Fill */}
            <div className="mad-modern-card">
              <div className="mad-card-header">
                <div>
                  <h3 className="mad-chart-title">Growth Trajectory</h3>
                  <p className="mad-chart-subtitle">Dec 2023 - May 2024</p>
                </div>
              </div>
              <div className="mad-chart-canvas">
                <svg viewBox="0 0 500 200" width="100%" height="100%">
                  <defs>
                    <linearGradient id="mainGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-success)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--accent-success)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-light)" strokeDasharray="4 4" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="var(--border-light)" strokeDasharray="4 4" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="var(--border-light)" strokeDasharray="4 4" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border-solid)" strokeWidth="1" />

                  <text x="30" y="24" fill="var(--text-muted)" fontSize="10" textAnchor="end">100</text>
                  <text x="30" y="84" fill="var(--text-muted)" fontSize="10" textAnchor="end">60</text>
                  <text x="30" y="144" fill="var(--text-muted)" fontSize="10" textAnchor="end">30</text>

                  {/* Area Fill */}
                  <path
                    d="M 60 102.5 L 160 83 L 260 72.5 L 360 53 L 460 42.5 L 460 170 L 60 170 Z"
                    fill="url(#mainGlow)"
                  />

                  {/* Line */}
                  <path
                    d="M 60 102.5 L 160 83 L 260 72.5 L 360 53 L 460 42.5"
                    fill="none"
                    stroke="var(--accent-success)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Nodes */}
                  <circle cx="60" cy="102.5" r="4" fill="var(--bg-card)" stroke="var(--accent-success)" strokeWidth="2" />
                  <circle cx="160" cy="83" r="4" fill="var(--bg-card)" stroke="var(--accent-success)" strokeWidth="2" />
                  <circle cx="260" cy="72.5" r="4" fill="var(--bg-card)" stroke="var(--accent-success)" strokeWidth="2" />
                  <circle cx="360" cy="53" r="4" fill="var(--bg-card)" stroke="var(--accent-success)" strokeWidth="2" />
                  <circle cx="460" cy="42.5" r="5" fill="var(--accent-success)" stroke="var(--bg-card)" strokeWidth="2" />

                  {/* Node Labels */}
                  <text x="60" y="90" fill="var(--text-main)" fontSize="10" fontWeight="600" textAnchor="middle">45</text>
                  <text x="160" y="70" fill="var(--text-main)" fontSize="10" fontWeight="600" textAnchor="middle">58</text>
                  <text x="260" y="60" fill="var(--text-main)" fontSize="10" fontWeight="600" textAnchor="middle">65</text>
                  <text x="360" y="40" fill="var(--text-main)" fontSize="10" fontWeight="600" textAnchor="middle">78</text>
                  <text x="460" y="28" fill="var(--accent-success)" fontSize="11" fontWeight="bold" textAnchor="middle">85</text>

                  {/* Axis Labels */}
                  <text x="60" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Dec</text>
                  <text x="160" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Jan</text>
                  <text x="260" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Mar</text>
                  <text x="360" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Apr</text>
                  <text x="460" y="190" fill="var(--text-main)" fontSize="10" fontWeight="600" textAnchor="middle">May</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Category Trend */}
            <div className="mad-modern-card">
              <div className="mad-card-header col-layout">
                <h3 className="mad-chart-title">Category Breakdown</h3>
                <div className="mad-chart-legend">
                  <span className="lg-dot green">Body</span>
                  <span className="lg-dot blue">Vitals</span>
                  <span className="lg-dot purple">Flex</span>
                  <span className="lg-dot warning">Meas.</span>
                  <span className="lg-dot teal">Coach</span>
                </div>
              </div>
              <div className="mad-chart-canvas">
                <svg viewBox="0 0 500 200" width="100%" height="100%">
                  <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-light)" strokeDasharray="4 4" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="var(--border-light)" strokeDasharray="4 4" />
                  <line x1="40" y1="160" x2="480" y2="160" stroke="var(--border-solid)" strokeWidth="1" />

                  <path d="M 60 83 L 160 69 L 260 62 L 360 41 L 460 20" fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 76 L 160 62 L 260 48 L 360 34 L 460 20" fill="none" stroke="var(--accent-info)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 104 L 160 90 L 260 76 L 360 62 L 460 48" fill="none" stroke="var(--accent-purple)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 76 L 160 62 L 260 48 L 360 34 L 460 34" fill="none" stroke="var(--accent-warning)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 60 62 L 160 48 L 260 34 L 360 34 L 460 20" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round" />

                  <text x="60" y="185" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Dec</text>
                  <text x="160" y="185" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Jan</text>
                  <text x="260" y="185" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Mar</text>
                  <text x="360" y="185" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Apr</text>
                  <text x="460" y="185" fill="var(--text-main)" fontSize="10" fontWeight="600" textAnchor="middle">May</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Assessment History Table */}
          <div className="mad-modern-card no-pad">
            <div className="mad-card-header pad-xy">
              <h3 className="mad-table-title">Assessment Records</h3>
            </div>
            <div className="mad-table-responsive">
              <table className="mad-modern-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Score</th>
                    <th>Rating</th>
                    <th>Change</th>
                    <th>Trainer</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentHistory.map((item, idx) => (
                    <tr key={item.id}>
                      <td>
                        <div className="td-date-stack">
                          <span className="dt">{item.date}</span>
                          <span className="tm">{item.time}</span>
                        </div>
                        {idx === 0 && <span className="mad-badge-pill new">Current</span>}
                      </td>
                      <td><span className="mad-score-chip">{item.overallScore}/100</span></td>
                      <td><span className="mad-text-rating">{item.rating}</span></td>
                      <td>
                        {item.improvement === '-' ? (
                          <span className="text-muted">-</span>
                        ) : (
                          <span className={`mad-trend-pill ${item.isUp ? 'up' : 'down'}`}>
                            <i className={`fas ${item.isUp ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i> {item.improvement}
                          </span>
                        )}
                      </td>
                      <td>{item.trainer}</td>
                      <td className="text-right">
                        <button className="mad-action-btn" onClick={() => setActiveTab('details')}><i className="far fa-eye"></i></button>
                        <button className="mad-action-btn"><i className="fas fa-download"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Parameters */}
      {activeTab === 'parameters' && (
        <div className="mad-tab-content fade-in">
          <div className="mad-param-header">
            <div>
              <h2 className="mad-page-title">System Parameters</h2>
              <p className="mad-page-subtitle">Database schema configuration & mapped fields</p>
            </div>
            <button className="mad-btn-secondary">
              <i className="fas fa-code"></i> View Schema
            </button>
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