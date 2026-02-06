import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
    classType: '',
    location: ''
  });
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 987-6543',
    memberId: 'GMFLW-2023-4567',
    dob: '1990-05-15',
    gender: 'MALE',
    bloodGroup: 'O+',
    height: 175.5,
    weight: 72.5,
    fitnessLevel: 'INTERMEDIATE',
    goalFocus: 'MUSCLE_GAIN',
    emergencyContact: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
    profilePhoto: null,
    biometricEnrolled: false
  });

  const userData = {
    name: profileData.name,
    email: profileData.email
  };

  // Sample attendance data
  const attendanceData = [
    { id: 1, date: '2026-02-06', time: '08:30 AM', class: 'Morning Yoga', location: 'Studio A', status: 'Attended', checkInTime: '08:28 AM', method: 'QR Code' },
    { id: 2, date: '2026-02-05', time: '06:00 PM', class: 'Weightlifting', location: 'Main Hall', status: 'Attended', checkInTime: '05:58 PM', method: 'Biometric' },
    { id: 3, date: '2026-02-04', time: '07:30 AM', class: 'Zumba Dance', location: 'Studio B', status: 'Missed', checkInTime: null, method: null },
    { id: 4, date: '2026-02-03', time: '05:00 PM', class: 'Spin Class', location: 'Cycle Room', status: 'Attended', checkInTime: '04:55 PM', method: 'QR Code' },
    { id: 5, date: '2026-02-02', time: '09:00 AM', class: 'Cardio Blast', location: 'Main Hall', status: 'Attended', checkInTime: '08:59 AM', method: 'Biometric' },
    { id: 6, date: '2026-02-01', time: '07:00 PM', class: 'Morning Yoga', location: 'Studio A', status: 'Attended', checkInTime: '06:58 PM', method: 'Manual' }
  ];

  const fitnessLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const goalOptions = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'GENERAL'];
  const genderOptions = ['MALE', 'FEMALE', 'OTHER'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    // Initialize with current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setAttendanceFilters({
      ...attendanceFilters,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    });

    setFilteredAttendance(attendanceData);
  }, []);

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = () => {
    // Here you would send the data to your backend API
    setIsEditing(false);
    alert('Profile updated successfully! 🎉');
    console.log('Profile data to save:', profileData);
  };

  const handleBiometricEnrollment = () => {
    if (profileData.biometricEnrolled) {
      alert('You are already enrolled in biometric system! ✅');
      return;
    }
    
    if (confirm('Do you want to start biometric enrollment? Please visit the front desk to complete the process.')) {
      // Simulate enrollment process
      setTimeout(() => {
        setProfileData(prev => ({ ...prev, biometricEnrolled: true }));
        alert('Biometric enrollment initiated! Please complete the process at the front desk. 📱');
      }, 1000);
    }
  };

  const handleDailyCheckIn = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Simulate check-in process
    alert(`✅ Check-in successful!\n\nTime: ${currentTime}\nDate: ${now.toLocaleDateString()}\nMethod: QR Code`);
    
    // Here you would send check-in data to backend
    console.log('Check-in data:', {
      memberId: profileData.memberId,
      checkInTime: now.toISOString(),
      method: 'manual'
    });
  };

  const handleQRScan = () => {
    alert('📱 QR Scanner will be opened here.\n\nIn the actual app, this would:\n• Open camera for QR scanning\n• Validate QR code\n• Record attendance automatically');
  };

  const applyAttendanceFilters = () => {
    let filtered = [...attendanceData];

    if (attendanceFilters.startDate && attendanceFilters.endDate) {
      filtered = filtered.filter(record => {
        return record.date >= attendanceFilters.startDate && record.date <= attendanceFilters.endDate;
      });
    }

    if (attendanceFilters.classType) {
      filtered = filtered.filter(record => record.class === attendanceFilters.classType);
    }

    if (attendanceFilters.location) {
      filtered = filtered.filter(record => record.location === attendanceFilters.location);
    }

    setFilteredAttendance(filtered);
  };

  const formatHeight = (cm) => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${cm} cm (${feet}'${inches}")`;
  };

  const formatGoal = (goal) => {
    return goal.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAttendanceStats = () => {
    const total = filteredAttendance.length;
    const attended = filteredAttendance.filter(r => r.status === 'Attended').length;
    const missed = total - attended;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return { total, attended, missed, percentage };
  };

  return (
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
            Profile Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <i className="fas fa-calendar-check"></i>
            Attendance & Check-in
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
                {!isEditing ? (
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="btn-save" onClick={saveProfile}>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </button>
                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                      <i className="fas fa-times"></i>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="profile-details-grid">
              {/* Personal Information */}
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => handleProfileUpdate('name', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.name}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.email}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.phone}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Date of Birth</label>
                    {isEditing ? (
                      <input 
                        type="date" 
                        value={profileData.dob}
                        onChange={(e) => handleProfileUpdate('dob', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{new Date(profileData.dob).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Gender</label>
                    {isEditing ? (
                      <select 
                        value={profileData.gender}
                        onChange={(e) => handleProfileUpdate('gender', e.target.value)}
                        className="edit-select"
                      >
                        {genderOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="info-value">{profileData.gender}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Blood Group</label>
                    {isEditing ? (
                      <select 
                        value={profileData.bloodGroup}
                        onChange={(e) => handleProfileUpdate('bloodGroup', e.target.value)}
                        className="edit-select"
                      >
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="info-value">{profileData.bloodGroup}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical Information */}
              <div className="info-card">
                <h3>Physical Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Height (cm)</label>
                    {isEditing ? (
                      <input 
                        type="number" 
                        step="0.1"
                        value={profileData.height}
                        onChange={(e) => handleProfileUpdate('height', parseFloat(e.target.value))}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{formatHeight(profileData.height)}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Weight (kg)</label>
                    {isEditing ? (
                      <input 
                        type="number" 
                        step="0.1"
                        value={profileData.weight}
                        onChange={(e) => handleProfileUpdate('weight', parseFloat(e.target.value))}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.weight} kg</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Fitness Level</label>
                    {isEditing ? (
                      <select 
                        value={profileData.fitnessLevel}
                        onChange={(e) => handleProfileUpdate('fitnessLevel', e.target.value)}
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
                  <div className="info-item">
                    <label>Goal Focus</label>
                    {isEditing ? (
                      <select 
                        value={profileData.goalFocus}
                        onChange={(e) => handleProfileUpdate('goalFocus', e.target.value)}
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

              {/* Contact Information */}
              <div className="info-card">
                <h3>Contact & Emergency</h3>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <label>Address</label>
                    {isEditing ? (
                      <textarea 
                        value={profileData.address}
                        onChange={(e) => handleProfileUpdate('address', e.target.value)}
                        className="edit-textarea"
                        rows="3"
                      />
                    ) : (
                      <span className="info-value">{profileData.address}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Emergency Contact</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        value={profileData.emergencyContact}
                        onChange={(e) => handleProfileUpdate('emergencyContact', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.emergencyContact}</span>
                    )}
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
                      {profileData.biometricEnrolled ? 'Enrolled' : 'Not Enrolled'}
                    </span>
                  </div>
                  <p className="biometric-description">
                    {profileData.biometricEnrolled 
                      ? 'You can use biometric scanning for quick gym access and attendance tracking.'
                      : 'Enroll your biometric data for seamless gym access and automatic attendance tracking.'
                    }
                  </p>
                  {!profileData.biometricEnrolled && (
                    <button className="btn-enroll" onClick={handleBiometricEnrollment}>
                      <i className="fas fa-fingerprint"></i>
                      Enroll Biometric
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="attendance-content">
            {/* Check-in Section */}
            <div className="checkin-section">
              <div className="checkin-cards">
                <div className="checkin-card daily-checkin">
                  <div className="checkin-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="checkin-info">
                    <h3>Daily Check-in</h3>
                    <p>Mark your arrival at the gym</p>
                  </div>
                  <button className="btn-checkin" onClick={handleDailyCheckIn}>
                    <i className="fas fa-check"></i>
                    Check In
                  </button>
                </div>

                <div className="checkin-card qr-scan">
                  <div className="checkin-icon">
                    <i className="fas fa-qrcode"></i>
                  </div>
                  <div className="checkin-info">
                    <h3>QR Code Scanner</h3>
                    <p>Scan QR code for quick access</p>
                  </div>
                  <button className="btn-qr" onClick={handleQRScan}>
                    <i className="fas fa-camera"></i>
                    Scan QR
                  </button>
                </div>

                <div className="checkin-card biometric-sync">
                  <div className="checkin-icon">
                    <i className="fas fa-fingerprint"></i>
                  </div>
                  <div className="checkin-info">
                    <h3>Biometric Sync</h3>
                    <p>Automatic attendance tracking</p>
                  </div>
                  <div className={`sync-status ${profileData.biometricEnrolled ? 'active' : 'inactive'}`}>
                    {profileData.biometricEnrolled ? (
                      <span><i className="fas fa-check-circle"></i> Active</span>
                    ) : (
                      <span><i className="fas fa-exclamation-circle"></i> Setup Required</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="attendance-stats">
                <h3>This Month's Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{getAttendanceStats().total}</div>
                    <div className="stat-label">Total Sessions</div>
                  </div>
                  <div className="stat-card attended">
                    <div className="stat-number">{getAttendanceStats().attended}</div>
                    <div className="stat-label">Attended</div>
                  </div>
                  <div className="stat-card missed">
                    <div className="stat-number">{getAttendanceStats().missed}</div>
                    <div className="stat-label">Missed</div>
                  </div>
                  <div className="stat-card percentage">
                    <div className="stat-number">{getAttendanceStats().percentage}%</div>
                    <div className="stat-label">Attendance Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="attendance-history">
              <h3>Attendance History</h3>
              
              {/* Filters */}
              <div className="attendance-filters">
                <div className="filter-group">
                  <label>Date Range</label>
                  <div className="date-range">
                    <input 
                      type="date" 
                      value={attendanceFilters.startDate}
                      onChange={(e) => setAttendanceFilters(prev => ({...prev, startDate: e.target.value}))}
                      className="filter-input"
                    />
                    <span>to</span>
                    <input 
                      type="date" 
                      value={attendanceFilters.endDate}
                      onChange={(e) => setAttendanceFilters(prev => ({...prev, endDate: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Class Type</label>
                  <select 
                    value={attendanceFilters.classType}
                    onChange={(e) => setAttendanceFilters(prev => ({...prev, classType: e.target.value}))}
                    className="filter-select"
                  >
                    <option value="">All Classes</option>
                    <option value="Morning Yoga">Morning Yoga</option>
                    <option value="Weightlifting">Weightlifting</option>
                    <option value="Zumba Dance">Zumba Dance</option>
                    <option value="Spin Class">Spin Class</option>
                    <option value="Cardio Blast">Cardio Blast</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Location</label>
                  <select 
                    value={attendanceFilters.location}
                    onChange={(e) => setAttendanceFilters(prev => ({...prev, location: e.target.value}))}
                    className="filter-select"
                  >
                    <option value="">All Locations</option>
                    <option value="Studio A">Studio A</option>
                    <option value="Studio B">Studio B</option>
                    <option value="Main Hall">Main Hall</option>
                    <option value="Cycle Room">Cycle Room</option>
                  </select>
                </div>
                <button className="btn-apply-filters" onClick={applyAttendanceFilters}>
                  <i className="fas fa-filter"></i>
                  Apply Filters
                </button>
              </div>

              {/* Attendance Table */}
              <div className="table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Class</th>
                      <th>Location</th>
                      <th>Check-in</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map(record => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.time}</td>
                        <td>{record.class}</td>
                        <td>{record.location}</td>
                        <td>{record.checkInTime || '-'}</td>
                        <td>
                          {record.method && (
                            <span className={`method-badge ${record.method.toLowerCase().replace(' ', '-')}`}>
                              {record.method}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredAttendance.length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-calendar-times"></i>
                    <p>No attendance records found for the selected filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;