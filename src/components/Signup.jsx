import React, { useState, useEffect } from "react";
import "./Signup.css";
import logo from "../assets/FGlogo.png";
import bgImg from "../assets/heroImg/home7.avif";
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [step, setStep] = useState(1); // Multi-step form: 1 = basic info, 2 = additional details
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upperLower: false,
    number: false
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [form, setForm] = useState({
    // Step 1: Basic signup fields
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
    branch: "",
    // Step 2: Additional member details
    dob: "",
    gender: "",
    blood_group: "",
    height: "",
    weight: "",
    fitness_level: "",
    goal_focus: "",
    emergency_contact: "",
    address_line1: "",
    address_line2: "",
    country: 1,
    state: 1,
    district: 19,
    city: 1
  });
  const navigate = useNavigate();

  // Fetch branches from API
  const fetchBranches = async (gymId = 1) => {
    setBranchesLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test-api.fitnessguru.org.in';
      const response = await fetch(`${API_BASE_URL}/api/gymBranchList?gym_id=${gymId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setBranches(data.data);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      setBranches([]);
      setError("Unable to load branches. Please refresh the page.");
    } finally {
      setBranchesLoading(false);
    }
  };

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Check password rules in real-time
  const checkPasswordRules = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLengthValid = password.length >= 8;

    return {
      length: isLengthValid,
      upperLower: hasUpperCase && hasLowerCase,
      number: hasNumber
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Handle password rule validation
    if (name === "password") {
      const rules = checkPasswordRules(value);
      setPasswordRules(rules);
      setShowPasswordRules(value.length > 0);
    }
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLengthValid = password.length >= 8;

    if (!isLengthValid) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase || !hasLowerCase) {
      return "Password must contain both uppercase and lowercase letters";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate phone number (basic validation)
    if (form.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    // Validate branch selection
    if (!form.branch) {
      setError("Please select a branch");
      return;
    }

    // Move to step 2
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields in step 2
    if (!form.dob) {
      setError("Please enter your date of birth");
      return;
    }

    if (!form.gender) {
      setError("Please select your gender");
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test-api.fitnessguru.org.in';
      
      // Prepare data for addMember API with default values
      const memberData = {
        // Required fields
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        gym_id: 1,
        branch_id: parseInt(form.branch),
        status: 1,
        join_date: new Date().toISOString().split('T')[0],
        membership_plan: 1,
        dob: form.dob,
        gender: form.gender,
        
        // Optional fields with defaults
        blood_group: form.blood_group || 'O+',
        height: form.height ? parseFloat(form.height) : 170.0,
        weight: form.weight ? parseFloat(form.weight) : 70.0,
        fitness_level: form.fitness_level || 'BEGINNER',
        goal_focus: form.goal_focus || 'GENERAL_FITNESS',
        emergency_contact: form.emergency_contact || form.phone,
        
        // Address fields with defaults
        address_line1: form.address_line1 || 'Not Provided',
        address_line2: form.address_line2 || '',
        country: form.country ? parseInt(form.country) : 1,
        state: form.state ? parseInt(form.state) : 1,
        district: form.district ? parseInt(form.district) : 19,
        city: form.city ? parseInt(form.city) : 1,
      };

      const response = await fetch(`${API_BASE_URL}/api/members/addMember`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(memberData)
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 400) {
          setError(errorData?.message || "Invalid data provided. Please check your information.");
          return;
        } else if (response.status === 409) {
          setError(errorData?.message || "An account with this email or phone already exists.");
          return;
        } else if (response.status === 500) {
          setError("Server error. Please try again later or contact support.");
          return;
        } else {
          setError(errorData?.message || `Error: ${response.status}. Please try again.`);
          return;
        }
      }

      const data = await response.json();

      if (data.status === "success") {
        // Store tokens if provided, otherwise navigate to login
        if (data.tokens) {
          localStorage.setItem("access_token", data.tokens.access_token);
          localStorage.setItem("refresh_token", data.tokens.refresh_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/dashboard");
        } else {
          // If no tokens, registration successful but need to login
          navigate("/login", { state: { message: "Account created successfully! Please login." } });
        }
      } else {
        // Handle error response with success status
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      // Network errors, JSON parsing errors, etc.
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Unable to connect to the server. Please check your internet connection.");
      } else if (err.name === 'SyntaxError') {
        setError("Invalid response from server. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  return (
    <div className="signup-bg" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="signup-overlay"></div>
      <div className="signup-container">
        <button className="signup-close-btn" onClick={() => navigate('/') } aria-label="Close signup">&times;</button>
        
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form className="signup-form" onSubmit={handleContinue}>
            <img src={logo} alt="FG Logo" className="signup-logo" />
            <h2 className="signup-title">Create Account</h2>
            <p className="signup-step-indicator">Step 1 of 2 - Basic Information</p>
            
            <div className="signup-field-grid">
              <div>
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
              </div>
              
              <div>
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
              </div>
              
              <div>
                <label className="signup-label">Phone Number</label>
                <input
                  type="tel"
                  className="signup-input"
                  name="phone"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10,15}"
                  title="Please enter a valid phone number (10-15 digits)"
                />
              </div>
              
              <div>
                <label className="signup-label">Branch</label>
                <select
                  className="signup-input"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  required
                  disabled={branchesLoading}
                >
                  {branchesLoading ? (
                    <option value="">Loading branches...</option>
                  ) : (
                    <>
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_id.toString()}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              
              <div className="signup-full-width">
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
            
            {showPasswordRules && (
              <ul className="signup-password-rules">
                {!passwordRules.length && (
                  <li className="signup-password-rule-unsatisfied">
                    ❌ At least 8 characters long
                  </li>
                )}
                {!passwordRules.upperLower && (
                  <li className="signup-password-rule-unsatisfied">
                    ❌ Contains uppercase and lowercase letters
                  </li>
                )}
                {!passwordRules.number && (
                  <li className="signup-password-rule-unsatisfied">
                    ❌ Contains at least one number
                  </li>
                )}
                {passwordRules.length && passwordRules.upperLower && passwordRules.number && (
                  <li className="signup-password-rule-satisfied">
                    ✅ Password meets all requirements!
                  </li>
                )}
              </ul>
            )}
              </div>
            
              <div className="signup-full-width">
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
              </div>
            </div>
            
            <div className="signup-agree">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} required />
              <span>I agree to the <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Terms of Service</a> and <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>Privacy Policy</a></span>
            </div>
            
            {error && <div className="signup-error" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: '4px' }}>{error}</div>}
            
            <button className="signup-btn" type="submit">
              Continue
            </button>
            
            <div className="signup-login">
              Already have an account? <Link to="/login" className="signup-login-link">Login</Link>
            </div>
          </form>
        )}

        {/* Step 2: Additional Details */}
        {step === 2 && (
          <form className="signup-form" onSubmit={handleSubmit}>
            <img src={logo} alt="FG Logo" className="signup-logo" />
            <h2 className="signup-title">Additional Details</h2>
            <p className="signup-step-indicator">Step 2 of 2 - Complete Your Profile</p>
            
            <div className="signup-member-grid">
              <div>
                <label className="signup-label">Date of Birth *</label>
                <input 
                  type="date" 
                  className="signup-input" 
                  name="dob" 
                  value={form.dob} 
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="signup-label">Gender *</label>
                <select 
                  className="signup-input" 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="signup-label">Blood Group</label>
                <select 
                  className="signup-input" 
                  name="blood_group" 
                  value={form.blood_group} 
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
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
                <input 
                  type="number" 
                  className="signup-input" 
                  name="height" 
                  placeholder="170" 
                  step="0.1" 
                  min="50" 
                  max="300" 
                  value={form.height} 
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="signup-label">Weight (kg)</label>
                <input 
                  type="number" 
                  className="signup-input" 
                  name="weight" 
                  placeholder="70" 
                  step="0.1" 
                  min="20" 
                  max="300" 
                  value={form.weight} 
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="signup-label">Fitness Level</label>
                <select 
                  className="signup-input" 
                  name="fitness_level" 
                  value={form.fitness_level} 
                  onChange={handleChange}
                >
                  <option value="">Select Fitness Level</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCE">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="signup-label">Goal Focus</label>
                <select 
                  className="signup-input" 
                  name="goal_focus" 
                  value={form.goal_focus} 
                  onChange={handleChange}
                >
                  <option value="">Select Goal</option>
                  <option value="WEIGHT_LOSS">Weight Loss</option>
                  <option value="MUSCLE_GAIN">Muscle Gain</option>
                  <option value="STRENGTH">Strength</option>
                  <option value="ENDURANCE">Endurance</option>
                  <option value="GENERAL_FITNESS">General Fitness</option>
                </select>
              </div>
              
              <div>
                <label className="signup-label">Emergency Contact</label>
                <input 
                  type="tel" 
                  className="signup-input" 
                  name="emergency_contact" 
                  placeholder="1234567890"
                  pattern="[0-9]{10,15}"
                  value={form.emergency_contact} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="signup-full-width">
                <label className="signup-label">Address Line 1</label>
                <input 
                  type="text" 
                  className="signup-input" 
                  name="address_line1" 
                  placeholder="Building No, Street Name" 
                  value={form.address_line1} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="signup-full-width">
                <label className="signup-label">Address Line 2</label>
                <input 
                  type="text" 
                  className="signup-input" 
                  name="address_line2" 
                  placeholder="Landmark (Optional)" 
                  value={form.address_line2} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {error && <div className="signup-error" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: '4px' }}>{error}</div>}
            
            <div className="signup-button-group">
              <button 
                type="button" 
                className="signup-back-btn" 
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
              <button 
                className="signup-btn" 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="signup-policy-modal" onClick={() => setShowTerms(false)}>
          <div className="signup-policy-content" onClick={(e) => e.stopPropagation()}>
            <button className="signup-policy-close" onClick={() => setShowTerms(false)} aria-label="Close">&times;</button>
            <h2 className="signup-policy-title">Terms of Service</h2>
            <div className="signup-policy-body">
              <h3>1. Acceptance of Terms</h3>
              <p>By registering and using FITNESS GURU gym facilities, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not register or use our services.</p>

              <h3>2. Membership and Registration</h3>
              <p>You must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

              <h3>3. Gym Rules and Conduct</h3>
              <ul>
                <li>Members must follow all gym rules and staff instructions at all times</li>
                <li>Proper athletic attire and closed-toe shoes are required</li>
                <li>Equipment must be used properly and returned to designated areas after use</li>
                <li>Disruptive, offensive, or unsafe behavior is strictly prohibited</li>
                <li>Members must respect other members and maintain a clean environment</li>
              </ul>

              <h3>4. Health and Safety</h3>
              <p>You acknowledge that physical exercise involves inherent risks. You should consult with a physician before beginning any exercise program. FITNESS GURU is not responsible for any injuries sustained during the use of our facilities.</p>

              <h3>5. Payment and Fees</h3>
              <ul>
                <li>Membership fees must be paid in advance as per the selected plan</li>
                <li>Late payments may result in suspension of membership privileges</li>
                <li>All fees are non-refundable unless otherwise stated</li>
              </ul>

              <h3>6. Cancellation and Termination</h3>
              <p>Members may cancel their membership according to the terms of their specific membership plan. FITNESS GURU reserves the right to terminate memberships for violation of these terms or gym rules.</p>

              <h3>7. Limitation of Liability</h3>
              <p>FITNESS GURU shall not be liable for any indirect, incidental, or consequential damages arising from the use of our facilities or services.</p>

              <h3>8. Changes to Terms</h3>
              <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.</p>

              <p><strong>Last Updated:</strong> April 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="signup-policy-modal" onClick={() => setShowPrivacy(false)}>
          <div className="signup-policy-content" onClick={(e) => e.stopPropagation()}>
            <button className="signup-policy-close" onClick={() => setShowPrivacy(false)} aria-label="Close">&times;</button>
            <h2 className="signup-policy-title">Privacy Policy</h2>
            <div className="signup-policy-body">
              <h3>1. Information We Collect</h3>
              <p>We collect the following information when you register:</p>
              <ul>
                <li><strong>Personal Information:</strong> Name, email, phone number, date of birth, gender</li>
                <li><strong>Health Information:</strong> Height, weight, blood group, fitness level, health goals</li>
                <li><strong>Contact Information:</strong> Address, emergency contact details</li>
                <li><strong>Membership Information:</strong> Selected branch, membership plan, payment details</li>
              </ul>

              <h3>2. How We Use Your Information</h3>
              <p>Your information is used for:</p>
              <ul>
                <li>Managing your gym membership and account</li>
                <li>Providing personalized fitness programs and recommendations</li>
                <li>Communicating important updates about your membership</li>
                <li>Emergency contact purposes</li>
                <li>Improving our services and facilities</li>
                <li>Compliance with legal and regulatory requirements</li>
              </ul>

              <h3>3. Information Sharing</h3>
              <p>We do not sell or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul>
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>In emergency situations to protect your health and safety</li>
                <li>With service providers who assist in operating our facilities (under strict confidentiality agreements)</li>
              </ul>

              <h3>4. Data Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>

              <h3>5. Your Rights</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your information (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with relevant data protection authorities</li>
              </ul>

              <h3>6. Data Retention</h3>
              <p>We retain your information for as long as your membership is active and for a reasonable period thereafter as required by law or for legitimate business purposes.</p>

              <h3>7. Cookies and Tracking</h3>
              <p>Our website may use cookies to enhance your experience. You can control cookie preferences through your browser settings.</p>

              <h3>8. Children's Privacy</h3>
              <p>Our services are not intended for individuals under 16 years of age. We do not knowingly collect information from children without parental consent.</p>

              <h3>9. Changes to Privacy Policy</h3>
              <p>We may update this privacy policy periodically. We will notify you of significant changes via email or through our website.</p>

              <h3>10. Contact Us</h3>
              <p>If you have questions about this privacy policy or how we handle your information, please contact us at the gym reception or via our official communication channels.</p>

              <p><strong>Last Updated:</strong> April 2026</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}