import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import logo from "../assets/FGlogo.png";
import { Link } from 'react-router-dom';
import bgImg from "../assets/heroImg/home7.avif"; // Use your preferred background image


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Admin login validation
    if (email === "admin@fg.com" && password === "admin@123") {
      setError("");
      console.log('Admin login success, navigating to /admin-dashboard');
      navigate("/admin-dashboard");
    }
    // User login validation
    else if (email === "user@gmail.com" && password === "user@123") {
      setError("");
      console.log('User login success, navigating to /dashboard');
      navigate("/dashboard");
    } 
    else {
      setError("Invalid email or password.");
      console.log('Login failed');
    }
  };

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="login-overlay"></div>
      <div className="login-container">
        <button className="login-close-btn" onClick={() => navigate('/') } aria-label="Close login">
          &times;
        </button>
        <form className="login-form" onSubmit={handleSubmit}>
          <img src={logo} alt="FG Logo" className="login-logo" />
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Sign in to your account.</p>
          <label className="login-label">Email</label>
          <input
            type="email"
            className="login-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="login-label">Password</label>
          <div className="login-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="login-password-toggle"
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
          <div className="login-options">
            <a href="#" className="login-forgot">Forgot password?</a>
          </div>
          {error && <div className="login-error" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
          <button className="login-btn" type="submit">Login</button>
          <div className="login-signup">
            Don't have an account? <Link to="/signup" className="login-signup-link">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
