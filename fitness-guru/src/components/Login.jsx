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
  const navigate = useNavigate();


  function handleSubmit(e) {
    e.preventDefault();
    if (email === "user@gmail.com" && password === "user@123") {
      setError("");
      navigate("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  }

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
          {error && <div style={{ color: "#ff6b35", marginBottom: 10, fontWeight: 600 }}>{error}</div>}
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
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="login-options">
            <a href="#" className="login-forgot">Forgot password?</a>
          </div>
          <button className="login-btn" type="submit">Login</button>
          <div className="login-signup">
            Don't have an account? <Link to="/signup" className="login-signup-link">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
