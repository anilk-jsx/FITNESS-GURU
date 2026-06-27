import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerProfile = () => {
  // Mock trainer details
  const [profile, setProfile] = useState({
    name: 'Amit Sharma',
    email: 'amit.sharma@email.com',
    specialty: 'Bodybuilding, High-Intensity HIIT, Rehabilitation coaching',
    certifications: 'ISSA Certified Fitness Trainer, CPR/AED, Precision Nutrition Level 1',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    breakTime: '10:00 AM - 10:30 AM',
    branch: 'Koramangala Branch'
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [errors, setErrors] = useState({});

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

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Trainer Profile</h1>
          <p>Manage shift times, view trainer credentials, and edit account settings.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
        
        {/* Left Column: Trainer Credentials Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card: Bio */}
          <div className="m-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div className="profile-avatar" style={{ width: '90px', height: '90px', fontSize: '2.2rem', margin: '0 auto 12px' }}>
                AS
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

          {/* Card: Shift / Working hours */}
          <div className="m-card">
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
          <div className="m-card">
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

          {/* Account Settings Placeholder */}
          <div className="m-card">
            <h3 className="m-card-title">Portal Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Enable Email Digests for newly assigned clients
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Enable Browser push notifications for Biometric Check-ins
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TrainerProfile;
