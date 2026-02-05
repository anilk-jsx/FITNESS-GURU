import React, { useState } from "react";
import "./Signup.css";
import logo from "../assets/FGlogo.png";
import bgImg from "../assets/heroImg/home7.avif";
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
    // Gym member details
    age: "",
    gender: "",
    phone: "",
    address: "",
    goals: "",
    medical: ""
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
          <input
            type="password"
            className="signup-input"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <ul className="signup-password-rules">
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Contains at least one number</li>
          </ul>
          <label className="signup-label">Confirm Password</label>
          <input
            type="password"
            className="signup-input"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
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
                    <label className="signup-label">Age</label>
                    <input type="number" className="signup-input" name="age" min="12" max="100" value={form.age} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Gender</label>
                    <select className="signup-input" name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="signup-label">Phone</label>
                    <input type="tel" className="signup-input" name="phone" placeholder="1234567890" value={form.phone} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Address</label>
                    <input type="text" className="signup-input" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Fitness Goals</label>
                    <input type="text" className="signup-input" name="goals" placeholder="Your goals" value={form.goals} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="signup-label">Medical Conditions</label>
                    <input type="text" className="signup-input" name="medical" placeholder="Any medical conditions" value={form.medical} onChange={handleChange} />
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
