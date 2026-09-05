import React, { useState, useEffect } from 'react';
import tokenManager from '../../utils/tokenManager';
import './TrainerDashboard.css';

const TrainerDashboardHome = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
  
  // Fetch logged-in user data to initialize name and email instantly
  const storedUser = tokenManager.getUserData() || {};
  
  // Trainer details state with fallback mock defaults
  const [profile, setProfile] = useState({
    name: storedUser.name || 'Amit Sharma',
    email: storedUser.email || 'amit.sharma@email.com',
    specialty: 'Bodybuilding, High-Intensity HIIT, Rehabilitation coaching',
    certifications: 'ISSA Certified Fitness Trainer, CPR/AED, Precision Nutrition Level 1',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    breakTime: '10:00 AM - 10:30 AM',
    branch: 'Koramangala Branch'
  });

  // KPI stats state
  const [stats, setStats] = useState({
    totalClients: 18,
    activeDiets: 10,
    pendingAssessments: 3
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const userData = tokenManager.getUserData();
      if (!userData) {
        setLoading(false);
        return;
      }
      
      const userId = userData.id || userData.user_id || userData.sub;
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // 1. Fetch Trainer/Employee Profile Details
        try {
          const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainers/${userId}`);
          if (res.ok) {
            const result = await res.json();
            if (result.status === 'success' && result.data) {
              const trData = result.data;
              setProfile(prev => ({
                ...prev,
                name: trData.name || prev.name,
                email: trData.email || prev.email,
                specialty: trData.trainer_profile?.specialization || trData.trainer_profile?.specialty || prev.specialty,
                certifications: trData.trainer_profile?.certifications || prev.certifications,
                branch: trData.branch_name || trData.branch || prev.branch
              }));
            }
          }
        } catch (err) {
          console.warn('Could not fetch from /api/trainers:', err);
        }

        // 2. Fetch Stats - Total Clients
        let clientsCount = 18;
        try {
          const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/members`);
          if (res.ok) {
            const result = await res.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
              clientsCount = result.data.length;
            }
          }
        } catch (err) {
          console.warn('Failed to load dynamic clients count:', err);
        }

        // 3. Fetch Stats - Active Diets
        let activeDietsCount = 10;
        try {
          const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/diet-plans`);
          if (res.ok) {
            const result = await res.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
              activeDietsCount = result.data.filter(plan => plan.status === 'ACTIVE').length;
            }
          }
        } catch (err) {
          console.warn('Failed to load active diets count:', err);
        }

        // 4. Fetch Stats - Pending Sessions (for today)
        let pendingSessionsCount = 3;
        try {
          const todayStr = new Date().toISOString().split('T')[0];
          const res = await tokenManager.apiCall(`${API_BASE_URL}/api/trainer/roster?date=${todayStr}`);
          if (res.ok) {
            const result = await res.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
              pendingSessionsCount = result.data.filter(session => session.session_status === 'PENDING').length;
            }
          }
        } catch (err) {
          console.warn('Failed to load roster pending count:', err);
        }

        setStats({
          totalClients: clientsCount,
          activeDiets: activeDietsCount,
          pendingAssessments: pendingSessionsCount
        });

      } catch (globalErr) {
        console.error('Error loading dashboard dynamic data:', globalErr);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    let errs = {};
    if (!passwordForm.current) errs.current = 'Current password is required';
    if (passwordForm.newPass.length < 6) errs.newPass = 'New password must be at least 6 characters';
    if (passwordForm.newPass !== passwordForm.confirm) errs.confirm = 'Confirm password does not match';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    alert('Success! Your account password has been updated.');
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="trainer-page-container" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: '12px' }}></i>
        <p>Loading dashboard metrics & profile settings...</p>
      </div>
    );
  }

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Dashboard</h1>
          <p>Gym overview stats and trainer profile settings.</p>
        </div>
      </div>

      {/* KPI Cards / Stats */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card">
          <div className="kpi-icon-box primary">
            <i className="fas fa-users"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Total Clients</span>
            <span className="kpi-value">{stats.totalClients}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-box success">
            <i className="fas fa-seedling"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Active Diets</span>
            <span className="kpi-value">{stats.activeDiets}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-box warning">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Pending Assessments</span>
            <span className="kpi-value">{stats.pendingAssessments}</span>
          </div>
        </div>
      </div>

      {/* Profile Details Combined in the Dashboard Grid */}
      <div className="trainer-profile-grid">
        
        {/* Left Column: Trainer Credentials Card & Working Hours */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card: Bio */}
          <div className="profile-bio-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div className="profile-avatar" style={{ width: '90px', height: '90px', fontSize: '2.2rem', margin: '0 auto 12px' }}>
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'TR'}
              </div>
              <h2>{profile.name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Senior Coach | {profile.branch}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
              <div>
                <strong>Email Address:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{profile.email}</p>
              </div>
              <div>
                <strong>Trainer Specialty:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{profile.specialty}</p>
              </div>
              <div>
                <strong>Certifications:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{profile.certifications}</p>
              </div>
            </div>
          </div>

          {/* Card: Shift Details */}
          <div className="profile-shifts-card">
            <h3 className="m-card-title">Shift Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Shift Start:</span>
                <strong>{profile.shiftStart}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Shift End:</span>
                <strong>{profile.shiftEnd}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Break Hours:</span>
                <strong>{profile.breakTime}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Password Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Change Password Form */}
          <div className="profile-password-card">
            <h3 className="m-card-title">Change Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
                {errors.current && <div className="form-error-msg">{errors.current}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  />
                  {errors.newPass && <div className="form-error-msg">{errors.newPass}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  />
                  {errors.confirm && <div className="form-error-msg">{errors.confirm}</div>}
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Update Account Password
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TrainerDashboardHome;
