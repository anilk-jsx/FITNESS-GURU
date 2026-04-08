import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import tokenManager from '../utils/tokenManager';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingPhysical, setIsEditingPhysical] = useState(false);
  const [attendanceView, setAttendanceView] = useState('monthly'); // daily, weekly, monthly
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    memberId: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    height: 170,
    weight: 70,
    fitnessLevel: 'BEGINNER',
    goalFocus: 'GENERAL_FITNESS',
    emergencyContact: '',
    address: '',
    city: '',
    state: '',
    profilePhoto: null,
    biometricEnrolled: false
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [physicalHistory] = useState([]);

  const fitnessLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const goalOptions = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'GENERAL'];
  const genderOptions = ['MALE', 'FEMALE', 'OTHER'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        if (!tokenManager.isAuthenticated()) {
          setError('No authentication token found');
          window.location.href = '/login';
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test-api.fitnessguru.org.in';

        // Get user ID from stored user data
        const storedUserData = tokenManager.getUserData();
        const userId = storedUserData?.userId || storedUserData?.id || storedUserData?.member_id || storedUserData?.user_id;

        if (!userId) {
          setError('User ID not found. Please login again.');
          tokenManager.clearTokens();
          window.location.href = '/login';
          return;
        }

        // Fetch member profile
        const response = await tokenManager.apiCall(`${API_BASE_URL}/api/members/view?user_id=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          const memberData = data.data;
          setUserData(memberData);

          // Update profile data with fetched user data
          setProfileData(prev => ({
            ...prev,
            name: memberData.name || '',
            email: memberData.email || '',
            phone: memberData.phone || '',
            memberId: `FG-${memberData.user_id}` || '',
            dob: memberData.date_of_birth || '',
            gender: memberData.gender || 'Male',
            bloodGroup: memberData.blood_group || 'O+',
            height: parseFloat(memberData.height_cm) || 170,
            weight: parseFloat(memberData.weight_kg) || 70,
            fitnessLevel: memberData.fitness_level || 'BEGINNER',
            goalFocus: memberData.goal_focus || 'GENERAL_FITNESS',
            emergencyContact: memberData.emergency_contact || '',
            address: memberData.address_line1 || '',
            city: memberData.city_name || '',
            state: memberData.state_name || ''
          }));

          setError(null);
        } else {
          setError(data.message || 'Failed to fetch profile');
          if (response.status === 401) {
            tokenManager.clearTokens();
            window.location.href = '/login';
          }
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    filterAttendanceByView();
  }, [attendanceView, selectedDate, attendanceData]);

  const filterAttendanceByView = () => {
    const selected = new Date(selectedDate);
    let filtered = [];

    if (attendanceView === 'daily') {
      filtered = attendanceData.filter(log => log.attendance_date === selectedDate);
    } else if (attendanceView === 'weekly') {
      const weekStart = new Date(selected);
      weekStart.setDate(selected.getDate() - selected.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      filtered = attendanceData.filter(log => {
        const logDate = new Date(log.attendance_date);
        return logDate >= weekStart && logDate <= weekEnd;
      });
    } else if (attendanceView === 'monthly') {
      filtered = attendanceData.filter(log => {
        const logDate = new Date(log.attendance_date);
        return logDate.getMonth() === selected.getMonth() && logDate.getFullYear() === selected.getFullYear();
      });
    }

    setFilteredAttendance(filtered);
  };

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        if (!tokenManager.isAuthenticated()) {
          return;
        }

        const storedUserData = tokenManager.getUserData();
        const userId = storedUserData?.userId || storedUserData?.id || storedUserData?.member_id || storedUserData?.user_id;

        if (!userId) {
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test-api.fitnessguru.org.in';

        // Fetch attendance for the selected date
        const sessionsResponse = await tokenManager.apiCall(
          `${API_BASE_URL}/api/attendance/userSessions?user_id=${userId}&date=${selectedDate}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const sessionsData = await sessionsResponse.json();

        if (sessionsResponse.ok && sessionsData.status === 'success') {
          const sessions = sessionsData.data.sessions || [];

          // Transform API response to internal format
          let transformedData = [];

          if (sessions.length > 0) {
            // Convert to internal format - there could be multiple sessions on same date
            transformedData = [{
              attendance_id: 1,
              attendance_date: selectedDate,
              total_sessions: sessions.length,
              total_duration_min: sessions.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0),
              status: sessions.length > 0 ? 'PRESENT' : 'ABSENT',
              sessions: sessions.map((s, i) => ({
                session_id: s.session_no || i + 1,
                check_in_time: s.check_in || '', // API format: "09:00 pm"
                check_out_time: s.check_out || null, // API format or null
                duration_min: parseInt(s.duration) || 0,
                source: s.device || 'DEVICE'
              }))
            }];
          }

          setAttendanceData(transformedData);
        }
      } catch (err) {
        console.error('Attendance fetch error:', err);
      }
    };

    fetchAttendanceData();
  }, [selectedDate]);

  const handlePhysicalUpdate = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePhysicalInfo = () => {
    // Here you would send the data to your backend API
    setIsEditingPhysical(false);
    alert('Physical information updated successfully! 🎉');
  };

  const getAttendanceStats = () => {
    const present = filteredAttendance.filter(log => log.status === 'PRESENT').length;
    const absent = filteredAttendance.filter(log => log.status === 'ABSENT').length;
    const total = filteredAttendance.length;
    const totalSessions = filteredAttendance.reduce((sum, log) => sum + log.total_sessions, 0);
    const totalDuration = filteredAttendance.reduce((sum, log) => sum + log.total_duration_min, 0);
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, totalSessions, totalDuration, percentage };
  };

  const navigateDate = (direction) => {
    const current = new Date(selectedDate);
    
    if (attendanceView === 'daily') {
      current.setDate(current.getDate() + direction);
    } else if (attendanceView === 'weekly') {
      current.setDate(current.getDate() + (direction * 7));
    } else if (attendanceView === 'monthly') {
      current.setMonth(current.getMonth() + direction);
    }
    
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const getDateRangeDisplay = () => {
    const selected = new Date(selectedDate);
    
    if (attendanceView === 'daily') {
      return selected.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (attendanceView === 'weekly') {
      const weekStart = new Date(selected);
      weekStart.setDate(selected.getDate() - selected.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return selected.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const formatHeight = (cm) => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${cm} cm (${feet}'${inches}")`;
  };

  const formatGoal = (goal) => {
    return goal.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateBMI = (weight, height) => {
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  return (
    <>
      {loading ? (
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      ) : error ? (
        <div className="profile-error">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      ) : !userData ? (
        <div className="profile-error">
          <i className="fas fa-user-slash"></i>
          <h3>No User Data</h3>
          <p>Unable to load user information</p>
        </div>
      ) : (
        <DashboardLayout userData={userData}>
      <div className="profile-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-nav">
            <Link to="/dashboard" className="back-button">
              <i className="fas fa-arrow-left"></i>
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="page-title">Profile & Attendance</h1>
          <p className="page-subtitle">
            Manage your personal information and track your fitness journey
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i>
            <span>Profile Management</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Attendance & Check-in</span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-content">
            {/* Profile Header */}
            <div className="profile-header-card">
              <div className="profile-photo-section">
                <div className="profile-photo">
                  <img 
                    src="/avatar.png" 
                    alt="Profile" 
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=ff6b35&color=fff&size=120&font-size=0.5`;
                    }}
                  />
                  <button className="photo-edit-btn" onClick={() => alert('Photo upload feature coming soon! 📷')}>
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
              </div>
              <div className="profile-summary">
                <h2>{profileData.name}</h2>
                <p className="member-id">Member ID: {profileData.memberId}</p>
                <div className="quick-stats">
                  <div className="stat-item">
                    <span className="stat-label">Fitness Level</span>
                    <span className="stat-value">{profileData.fitnessLevel}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Goal Focus</span>
                    <span className="stat-value">{formatGoal(profileData.goalFocus)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">BMI</span>
                    <span className="stat-value">
                      {((profileData.weight / ((profileData.height / 100) ** 2))).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                <div className="info-badge">
                  <i className="fas fa-info-circle"></i>
                  <span>Contact admin to update personal info</span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="profile-details-layout">
              {/* Left Column - Personal Information */}
              <div className="profile-left-column">
                <div className="info-card">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <span className="info-value">{profileData.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <span className="info-value">{profileData.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone Number</label>
                      <span className="info-value">{profileData.phone}</span>
                    </div>
                    <div className="info-item">
                      <label>Date of Birth</label>
                      <span className="info-value">
                        {profileData.dob
                          ? new Date(profileData.dob).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not Provided'
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Gender</label>
                      <span className="info-value">{profileData.gender}</span>
                    </div>
                    <div className="info-item">
                      <label>Blood Group</label>
                      <span className="info-value">{profileData.bloodGroup}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="info-card">
                  <h3>Contact & Emergency</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <label>Address</label>
                      <span className="info-value">
                        {profileData.address || profileData.city || profileData.state
                          ? `${profileData.address}${profileData.city ? ', ' + profileData.city : ''}${profileData.state ? ', ' + profileData.state : ''}`
                          : 'Not Provided'
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Emergency Contact</label>
                      <span className="info-value">{profileData.emergencyContact}</span>
                    </div>
                  </div>
                </div>

                {/* Biometric Enrollment */}
                <div className="info-card biometric-card">
                  <h3>Biometric Access</h3>
                  <div className="biometric-status">
                    <div className="status-indicator">
                      <div className={`status-dot ${profileData.biometricEnrolled ? 'enrolled' : 'pending'}`}></div>
                      <span className="status-text">
                        {profileData.biometricEnrolled ? 'Enrolled & Active' : 'Not Enrolled'}
                      </span>
                    </div>
                    <p className="biometric-description">
                      {profileData.biometricEnrolled 
                        ? 'Your biometric data is enrolled. Attendance is tracked automatically via biometric devices.'
                        : 'Contact front desk to enroll your biometric data for automatic attendance tracking.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Physical Information with History */}
              <div className="profile-right-column">
                <div className="info-card physical-card">
                  <div className="card-header-with-action">
                    <h3>Physical Information</h3>
                    {!isEditingPhysical ? (
                      <button className="btn-edit-small" onClick={() => setIsEditingPhysical(true)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    ) : (
                      <div className="edit-actions-inline">
                        <button className="btn-save-small" onClick={savePhysicalInfo}>
                          <i className="fas fa-check"></i> Save
                        </button>
                        <button className="btn-cancel-small" onClick={() => setIsEditingPhysical(false)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="physical-current">
                    <div className="physical-stats">
                      <div className="stat-box">
                        <label>Height</label>
                        {isEditingPhysical ? (
                          <input 
                            type="number" 
                            step="0.1"
                            value={profileData.height}
                            onChange={(e) => handlePhysicalUpdate('height', parseFloat(e.target.value))}
                            className="edit-input-small"
                          />
                        ) : (
                          <span className="stat-value-large">{profileData.height} <small>cm</small></span>
                        )}
                      </div>
                      <div className="stat-box">
                        <label>Weight</label>
                        {isEditingPhysical ? (
                          <input 
                            type="number" 
                            step="0.1"
                            value={profileData.weight}
                            onChange={(e) => handlePhysicalUpdate('weight', parseFloat(e.target.value))}
                            className="edit-input-small"
                          />
                        ) : (
                          <span className="stat-value-large">{profileData.weight} <small>kg</small></span>
                        )}
                      </div>
                      <div className="stat-box">
                        <label>BMI</label>
                        <span className="stat-value-large">{calculateBMI(profileData.weight, profileData.height)}</span>
                      </div>
                    </div>

                    <div className="physical-goals">
                      <div className="goal-item">
                        <label>Fitness Level</label>
                        {isEditingPhysical ? (
                          <select 
                            value={profileData.fitnessLevel}
                            onChange={(e) => handlePhysicalUpdate('fitnessLevel', e.target.value)}
                            className="edit-select"
                          >
                            {fitnessLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="info-value">{profileData.fitnessLevel}</span>
                        )}
                      </div>
                      <div className="goal-item">
                        <label>Goal Focus</label>
                        {isEditingPhysical ? (
                          <select 
                            value={profileData.goalFocus}
                            onChange={(e) => handlePhysicalUpdate('goalFocus', e.target.value)}
                            className="edit-select"
                          >
                            {goalOptions.map(goal => (
                              <option key={goal} value={goal}>{formatGoal(goal)}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="info-value">{formatGoal(profileData.goalFocus)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="physical-history">
                    <h4>Progress History</h4>
                    <div className="history-list">
                      {physicalHistory.length > 0 ? (
                        physicalHistory.map((record, index) => (
                          <div key={index} className="history-item">
                            <div className="history-date">
                              {new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                            <div className="history-stats">
                              <div className="history-stat">
                                <span className="history-label">Weight</span>
                                <span className="history-value">{record.weight} kg</span>
                                {index < physicalHistory.length - 1 && (
                                  <span className={`history-change ${record.weight < physicalHistory[index + 1].weight ? 'down' : 'up'}`}>
                                    {record.weight < physicalHistory[index + 1].weight ? '-' : '+'}
                                    {Math.abs(record.weight - physicalHistory[index + 1].weight).toFixed(1)} kg
                                  </span>
                                )}
                              </div>
                              <div className="history-stat">
                                <span className="history-label">BMI</span>
                                <span className="history-value">{record.bmi}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#999' }}>
                          <p>No progress history available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="attendance-content">
            {/* Attendance View Controls */}
            <div className="attendance-controls">
              <div className="view-selector">
                <button 
                  className={`view-btn ${attendanceView === 'daily' ? 'active' : ''}`}
                  onClick={() => setAttendanceView('daily')}
                >
                  <i className="fas fa-calendar-day"></i>
                  <span>Daily</span>
                </button>
                <button 
                  className={`view-btn ${attendanceView === 'weekly' ? 'active' : ''}`}
                  onClick={() => setAttendanceView('weekly')}
                >
                  <i className="fas fa-calendar-week"></i>
                  <span>Weekly</span>
                </button>
                <button 
                  className={`view-btn ${attendanceView === 'monthly' ? 'active' : ''}`}
                  onClick={() => setAttendanceView('monthly')}
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>Monthly</span>
                </button>
              </div>

              <div className="date-navigator">
                <button className="nav-btn" onClick={() => navigateDate(-1)}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="date-display">{getDateRangeDisplay()}</div>
                <button className="nav-btn" onClick={() => navigateDate(1)}>
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button className="today-btn" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                  <i className="fas fa-calendar-check"></i>
                  <span>Today</span>
                </button>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="attendance-stats-summary">
              <div className="stat-summary-card">
                <div className="stat-icon-circle present">
                  <i className="fas fa-check"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{getAttendanceStats().present}</div>
                  <div className="stat-label">Days Present</div>
                </div>
              </div>
              <div className="stat-summary-card">
                <div className="stat-icon-circle absent">
                  <i className="fas fa-times"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{getAttendanceStats().absent}</div>
                  <div className="stat-label">Days Absent</div>
                </div>
              </div>
              <div className="stat-summary-card">
                <div className="stat-icon-circle sessions">
                  <i className="fas fa-dumbbell"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{getAttendanceStats().totalSessions}</div>
                  <div className="stat-label">Total Sessions</div>
                </div>
              </div>
              <div className="stat-summary-card">
                <div className="stat-icon-circle duration">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{formatDuration(getAttendanceStats().totalDuration)}</div>
                  <div className="stat-label">Total Duration</div>
                </div>
              </div>
              <div className="stat-summary-card">
                <div className="stat-icon-circle percentage">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{getAttendanceStats().percentage}%</div>
                  <div className="stat-label">Attendance Rate</div>
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="attendance-records">
              <h3>Attendance Records</h3>
              
              {filteredAttendance.length > 0 ? (
                <div className="attendance-list-detailed">
                  {filteredAttendance.map((log) => (
                    <div key={log.attendance_id} className={`attendance-log-card ${log.status.toLowerCase()}`}>
                      <div className="log-header">
                        <div className="log-date-info">
                          <div className="log-date">
                            {new Date(log.attendance_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className={`log-status-badge ${log.status.toLowerCase()}`}>
                            {log.status === 'PRESENT' ? (
                              <><i className="fas fa-check-circle"></i> Present</>
                            ) : (
                              <><i className="fas fa-times-circle"></i> Absent</>
                            )}
                          </div>
                        </div>
                        <div className="log-summary">
                          <div className="summary-item">
                            <i className="fas fa-dumbbell"></i>
                            <span>{log.total_sessions} session{log.total_sessions !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="summary-item">
                            <i className="fas fa-clock"></i>
                            <span>{formatDuration(log.total_duration_min)}</span>
                          </div>
                        </div>
                      </div>

                      {log.sessions.length > 0 && (
                        <div className="log-sessions">
                          {log.sessions.map((session, index) => (
                            <div key={session.session_id} className="session-detail-item">
                              <div className="session-number-badge">#{index + 1}</div>
                              <div className="session-time-info">
                                <div className="session-time">
                                  <i className="fas fa-sign-in-alt"></i>
                                  {session.check_in_time && !session.check_in_time.includes('T')
                                    ? session.check_in_time
                                    : session.check_in_time
                                      ? new Date(session.check_in_time).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : 'N/A'
                                  }
                                </div>
                                {session.check_out_time && (
                                  <>
                                    <span className="time-separator">→</span>
                                    <div className="session-time">
                                      <i className="fas fa-sign-out-alt"></i>
                                      {session.check_out_time && !session.check_out_time.includes('T')
                                        ? session.check_out_time
                                        : new Date(session.check_out_time).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
                                      }
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="session-meta-info">
                                <span className="session-duration">
                                  <i className="fas fa-stopwatch"></i>
                                  {session.duration_min} min
                                </span>
                                <span className={`session-source-badge ${session.source.toLowerCase()}`}>
                                  {session.source}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <i className="fas fa-calendar-times"></i>
                  <p>No attendance records found for the selected period.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
        </DashboardLayout>
      )}
    </>
  );
};

export default Profile;