import React, { useState } from "react";
import "./Signup.css";
import logo from "../assets/FGlogo.png";
import bgImg from "../assets/heroImg/home7.avif";
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
    branch: "",
    // Gym member profile details
    dob: "",
    gender: "",
    blood_group: "",
    height_cm: "",
    weight_kg: "",
    fitness_level: "",
    goal_focus: "",
    emergency_contact: "",
    address: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Signup logic here
  };

  return (
    <div className="signup-bg" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="signup-overlay"></div>
      <div className="signup-container">
        <button className="signup-close-btn" onClick={() => navigate('/') } aria-label="Close signup">&times;</button>
        <form className="signup-form" onSubmit={handleSubmit}>
          <img src={logo} alt="FG Logo" className="signup-logo" />
          <h2 className="signup-title">Create Account</h2>
          <label className="signup-label">Full Name</label>
          <input
            type="text"
            className="signup-input"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label className="signup-label">Email</label>
          <input
            type="email"
            className="signup-input"
            name="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label className="signup-label">Password</label>
          <div className="signup-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="signup-input"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="signup-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
          <ul className="signup-password-rules">
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Contains at least one number</li>
          </ul>
          <label className="signup-label">Confirm Password</label>
          <div className="signup-password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="signup-input"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="signup-password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
          <label className="signup-label">Branch</label>
          <select 
            className="signup-input" 
            name="branch" 
            value={form.branch} 
            onChange={handleChange}
            required
          >
            <option value="">Select Branch</option>
            <option value="downtown">Downtown Branch</option>
            <option value="north">North Branch</option>
            <option value="south">South Branch</option>
            <option value="east">East Branch</option>
            <option value="west">West Branch</option>
          </select>
          <button
            type="button"
            className="signup-member-btn"
            onClick={() => setShowMemberForm((v) => !v)}
          >
            {showMemberForm ? "- Hide Gym Member Details" : "+ Add Gym Member Details (Optional)"}
          </button>
          {showMemberForm && (
            <div className="signup-member-modal">
              <div className="signup-member-modal-content">
                <button className="signup-member-close" onClick={() => setShowMemberForm(false)} aria-label="Close member details">&times;</button>
                <h3 className="signup-member-title">Gym Member Details</h3>
                <div className="signup-member-grid">
                  <div>
                    <label className="signup-label">Date of Birth</label>
                    <input type="date" className="signup-input" name="dob" value={form.dob} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Gender</label>
                    <select className="signup-input" name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="signup-label">Blood Group</label>
                    <select className="signup-input" name="blood_group" value={form.blood_group} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="signup-label">Height (cm)</label>
                    <input type="number" className="signup-input" name="height_cm" placeholder="170" step="0.01" min="50" max="300" value={form.height_cm} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Weight (kg)</label>
                    <input type="number" className="signup-input" name="weight_kg" placeholder="70" step="0.01" min="20" max="300" value={form.weight_kg} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Fitness Level</label>
                    <select className="signup-input" name="fitness_level" value={form.fitness_level} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="signup-label">Goal Focus</label>
                    <select className="signup-input" name="goal_focus" value={form.goal_focus} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="WEIGHT_LOSS">Weight Loss</option>
                      <option value="MUSCLE_GAIN">Muscle Gain</option>
                      <option value="STRENGTH">Strength</option>
                      <option value="ENDURANCE">Endurance</option>
                      <option value="GENERAL">General Fitness</option>
                    </select>
                  </div>
                  <div>
                    <label className="signup-label">Emergency Contact</label>
                    <input type="tel" className="signup-input" name="emergency_contact" placeholder="1234567890" value={form.emergency_contact} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Address</label>
                    <textarea className="signup-input" name="address" placeholder="Enter your address" rows="2" value={form.address} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="signup-agree">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} required />
            <span>I agree to the <a href="#" className="signup-link">Terms of Service</a> and <a href="#" className="signup-link">Privacy Policy</a></span>
          </div>
          <button className="signup-btn" type="submit">Create Account</button>
          <div className="signup-login">
            Already have an account? <Link to="/login" className="signup-login-link">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
