import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import './Subscriptions.css';

const Subscriptions = () => {
  const [currentPricing, setCurrentPricing] = useState('quarterly');
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeFormData, setFreezeFormData] = useState({
    reason: '',
    requested_days: '',
    start_date: ''
  });
  const [submittedFreezeData, setSubmittedFreezeData] = useState(null);
  
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  const currentPlan = {
    name: 'Premium Membership',
    price: 6499,
    period: 'quarterly',
    status: 'Active',
    expiryDate: 'Nov 30, 2026'
  };

  const plans = {
    basic: {
      name: 'Basic Membership',
      monthly: 1499,
      quarterly: 3999, // 10% off monthly
      annual: 14999, // 17% off monthly
      savings: { quarterly: '10%', annual: '17%' },
      features: [
        'Full gym access',
        'Locker room facilities',
        'Basic fitness assessment',
        'Mobile app access',
        'Community support'
      ]
    },
    premium: {
      name: 'Premium Membership',
      monthly: 2499,
      quarterly: 6499, // 13% off monthly
      annual: 23999, // 20% off monthly
      savings: { quarterly: '13%', annual: '20%' },
      features: [
        'Everything in Basic',
        'Group fitness classes',
        'Personal training session',
        'Wellness center access',
        'Nutrition consultation',
        'Guest passes (2/month)'
      ]
    },
    elite: {
      name: 'Elite Membership',
      monthly: 3999,
      quarterly: 10499, // 12% off monthly
      annual: 38999, // 19% off monthly
      savings: { quarterly: '12%', annual: '19%' },
      features: [
        'Everything in Premium',
        'Unlimited personal training',
        'Priority class booking',
        'Massage therapy sessions',
        'Custom meal planning',
        'VIP locker room access'
      ]
    }
  };

  const handlePricingToggle = (pricing) => {
    setCurrentPricing(pricing);
  };

  const selectPlan = (planKey, planName, price) => {
    const periodText = currentPricing === 'monthly' ? 'Monthly' : 
                      currentPricing === 'quarterly' ? 'Quarterly' : 'Annual';
    
    if (window.confirm(`Are you sure you want to select the ${planName} ${periodText} plan for ₹${price.toLocaleString()}?`)) {
      alert(`Great choice! You selected the ${planName} ${periodText} plan. Redirecting to checkout...`);
      // Here you would integrate with payment gateway
      setTimeout(() => {
        alert('🎉 Subscription updated successfully!');
      }, 2000);
    }
  };

  const formatPrice = (amount) => {
    return amount.toLocaleString('en-IN');
  };

  const getSavingsText = (planKey) => {
    const plan = plans[planKey];
    if (currentPricing === 'quarterly') return `Save ${plan.savings.quarterly} vs monthly`;
    if (currentPricing === 'annual') return `Save ${plan.savings.annual} vs monthly - Best Value!`;
    return '';
  };

  const getCurrentPrice = (plan) => {
    return plan[currentPricing];
  };

  const getPeriodText = () => {
    switch(currentPricing) {
      case 'monthly': return 'per month';
      case 'quarterly': return 'per quarter';
      case 'annual': return 'per year';
      default: return 'per quarter';
    }
  };

  // Freeze subscription handlers
  const handleFreezeInputChange = (e) => {
    const { name, value } = e.target;
    setFreezeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFreezeSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!freezeFormData.reason.trim()) {
      alert('Please provide a reason for freezing the subscription.');
      return;
    }
    if (!freezeFormData.requested_days || freezeFormData.requested_days <= 0) {
      alert('Please enter a valid number of days.');
      return;
    }
    if (!freezeFormData.start_date) {
      alert('Please select a start date.');
      return;
    }

    // Calculate end date
    const startDate = new Date(freezeFormData.start_date);
    const endDate = new Date(startDate.getTime() + (parseInt(freezeFormData.requested_days) * 24 * 60 * 60 * 1000));
    
    const freezeData = {
      ...freezeFormData,
      end_date: endDate.toISOString().split('T')[0],
      subscription_id: currentPlan.id || 1, // In real app, get from current plan
      member_id: userData.id || 1, // In real app, get from user data
      gym_id: 1, // In real app, get from user's gym
      branch_id: 1, // In real app, get from user's branch
      freeze_status: 'REQUESTED',
      requested_days: parseInt(freezeFormData.requested_days)
    };

    setSubmittedFreezeData(freezeData);
    setShowFreezeModal(false);
    
    // Reset form
    setFreezeFormData({
      reason: '',
      requested_days: '',
      start_date: ''
    });
    
    alert('Freeze request submitted successfully! Your request is pending approval.');
  };

  const closeFreezeModal = () => {
    setShowFreezeModal(false);
    setFreezeFormData({
      reason: '',
      requested_days: '',
      start_date: ''
    });
  };

  useEffect(() => {
    // Add animation to cards on mount
    const cards = document.querySelectorAll('.membership-card, .current-subscription');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }, []);

  return (
    <DashboardLayout userData={userData}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-nav">
          <Link to="/dashboard" className="back-button">
            <i className="fas fa-arrow-left"></i>
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <h1 className="page-title">Choose Your Membership Plan</h1>
        <p className="page-subtitle">
          Unlock your full potential with FITNESS GURU. Select the perfect plan tailored to your fitness journey.
        </p>
      </div>

      {/* Current Subscription */}
      <div className="current-subscription">
        <div className="current-badge">CURRENT PLAN</div>
        <div className="current-plan-info">
          <div className="plan-details">
            <h3>{currentPlan.name}</h3>
            <div className="plan-price">
              ₹{formatPrice(currentPlan.price)}
            </div>
            <div className="plan-billing">Billed {currentPlan.period}</div>
            <div className="plan-status">
              <i className="fas fa-check-circle"></i>
              <span>{currentPlan.status} until {currentPlan.expiryDate}</span>
            </div>
          </div>
          <div className="plan-actions">
            <button 
              className="btn-upgrade-main" 
              onClick={() => setShowUpgradePlans(!showUpgradePlans)}
            >
              <i className={`fas ${showUpgradePlans ? 'fa-times' : 'fa-arrow-up'}`}></i>
              {showUpgradePlans ? 'Close Plans' : 'Upgrade Plan'}
            </button>
            <button className="btn-manage" onClick={() => setShowFreezeModal(true)}>
              <i className="fas fa-snowflake"></i>
              Freeze Subscription
            </button>
            <button className="btn-cancel" onClick={() => {
              if (window.confirm('Are you sure you want to cancel your subscription?')) {
                alert('Subscription cancellation initiated. You will receive a confirmation email.');
              }
            }}>
              <i className="fas fa-times"></i>
              Cancel Plan
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Toggle - Only show when upgrade is clicked */}
      {showUpgradePlans && (
      <div className="pricing-toggle-section">
        <div className="pricing-toggle">
          <div className={`toggle-container ${currentPricing}`}>
            <div className="toggle-slider"></div>
            <div 
              className="toggle-option monthly" 
              onClick={() => handlePricingToggle('monthly')}
            >
              Monthly
            </div>
            <div 
              className="toggle-option quarterly" 
              onClick={() => handlePricingToggle('quarterly')}
            >
              Quarterly
            </div>
            <div 
              className="toggle-option annually" 
              onClick={() => handlePricingToggle('annual')}
            >
              Annually
            </div>
          </div>
        </div>
        
        {/* Discount Messages */}
        <div className={`discount-message ${currentPricing === 'quarterly' ? 'show' : ''}`}>
          💰 Save up to 13% with quarterly billing!
        </div>
        <div className={`discount-message ${currentPricing === 'annual' ? 'show' : ''}`}>
          🎉 Save up to 20% with annual billing - Best Value!
        </div>
      </div>
      )}

      {/* Membership Plans - Only show when upgrade is clicked */}
      {showUpgradePlans && (
      <div className="membership-plans">
        {/* Basic Plan */}
        <div className="membership-card">
          <h3 className="plan-name">{plans.basic.name}</h3>
          <div className="plan-price-display">
            <span className="plan-price-large">
              ₹{formatPrice(getCurrentPrice(plans.basic))}
            </span>
            <div className="plan-period">{getPeriodText()}</div>
            {currentPricing !== 'monthly' && (
              <div className="plan-savings">{getSavingsText('basic')}</div>
            )}
          </div>
          <ul className="plan-features">
            {plans.basic.features.map((feature, index) => (
              <li key={index}>
                <i className="fas fa-check"></i>
                {feature}
              </li>
            ))}
          </ul>
          <button 
            className="plan-button btn-select" 
            onClick={() => selectPlan('basic', plans.basic.name, getCurrentPrice(plans.basic))}
          >
            Select Plan
          </button>
        </div>

        {/* Premium Plan (Current) */}
        <div className={`membership-card featured ${currentPricing === 'quarterly' ? 'current' : ''}`}>
          {currentPricing === 'quarterly' && (
            <div className="plan-badge current-plan-badge">CURRENT PLAN</div>
          )}
          <h3 className="plan-name">{plans.premium.name}</h3>
          <div className="plan-price-display">
            <span className="plan-price-large">
              ₹{formatPrice(getCurrentPrice(plans.premium))}
            </span>
            <div className="plan-period">{getPeriodText()}</div>
            {currentPricing !== 'monthly' && (
              <div className="plan-savings">
                {getSavingsText('premium')}
                {currentPricing === 'quarterly' && ' - CURRENT'}
              </div>
            )}
          </div>
          <ul className="plan-features">
            {plans.premium.features.map((feature, index) => (
              <li key={index}>
                <i className="fas fa-check"></i>
                {feature}
              </li>
            ))}
          </ul>
          <button 
            className={`plan-button ${
              currentPricing === 'quarterly' ? 'btn-current' : 'btn-select'
            }`}
            onClick={
              currentPricing === 'quarterly' 
                ? undefined 
                : () => selectPlan('premium', plans.premium.name, getCurrentPrice(plans.premium))
            }
            disabled={currentPricing === 'quarterly'}
          >
            {currentPricing === 'quarterly' ? 'Current Plan' : 'Select Plan'}
          </button>
        </div>

        {/* Elite Plan */}
        <div className="membership-card">
          <div className="plan-badge">MOST POPULAR</div>
          <h3 className="plan-name">{plans.elite.name}</h3>
          <div className="plan-price-display">
            <span className="plan-price-large">
              ₹{formatPrice(getCurrentPrice(plans.elite))}
            </span>
            <div className="plan-period">{getPeriodText()}</div>
            {currentPricing !== 'monthly' && (
              <div className="plan-savings">{getSavingsText('elite')}</div>
            )}
          </div>
          <ul className="plan-features">
            {plans.elite.features.map((feature, index) => (
              <li key={index}>
                <i className="fas fa-check"></i>
                {feature}
              </li>
            ))}
          </ul>
          <button 
            className="plan-button btn-upgrade" 
            onClick={() => selectPlan('elite', plans.elite.name, getCurrentPrice(plans.elite))}
          >
            Upgrade to Elite
          </button>
        </div>
      </div>
      )}

      {/* Freeze Subscription Modal */}
      {showFreezeModal && (
        <div className="freeze-modal-overlay" onClick={closeFreezeModal}>
          <div className="freeze-modal" onClick={(e) => e.stopPropagation()}>
            <div className="freeze-modal-header">
              <h3>
                <i className="fas fa-snowflake"></i>
                Freeze Subscription
              </h3>
              <button className="close-modal" onClick={closeFreezeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleFreezeSubmit} className="freeze-form">
              <div className="form-group">
                <label htmlFor="reason">Reason for Freezing *</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={freezeFormData.reason}
                  onChange={handleFreezeInputChange}
                  placeholder="Please explain why you need to freeze your subscription..."
                  required
                  rows="4"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="requested_days">Number of Days *</label>
                  <input
                    type="number"
                    id="requested_days"
                    name="requested_days"
                    value={freezeFormData.requested_days}
                    onChange={handleFreezeInputChange}
                    placeholder="e.g., 30"
                    min="1"
                    max="90"
                    required
                  />
                  <small>Maximum 90 days allowed</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="start_date">Start Date *</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={freezeFormData.start_date}
                    onChange={handleFreezeInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="freeze-info">
                {freezeFormData.start_date && freezeFormData.requested_days && (
                  <div className="calculated-info">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Freeze period: {freezeFormData.start_date} to {
                        new Date(
                          new Date(freezeFormData.start_date).getTime() + 
                          (parseInt(freezeFormData.requested_days || 0) * 24 * 60 * 60 * 1000)
                        ).toISOString().split('T')[0]
                      }
                    </span>
                  </div>
                )}
                <div className="freeze-terms">
                  <p><i className="fas fa-exclamation-triangle"></i> Please note:</p>
                  <ul>
                    <li>Your subscription will be paused for the requested period</li>
                    <li>Gym access will be suspended during the freeze period</li>
                    <li>Your subscription end date will be extended accordingly</li>
                    <li>Freeze requests require admin approval</li>
                  </ul>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancel-form" onClick={closeFreezeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-freeze">
                  <i className="fas fa-paper-plane"></i>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submitted Freeze Request Details */}
      {submittedFreezeData && (
        <div className="freeze-request-section">
          <div className="freeze-request-header">
            <div className="freeze-success-indicator">
              <i className="fas fa-check-circle"></i>
              <div>
                <h3>Freeze Request Submitted</h3>
                <p>Your subscription freeze request is pending approval</p>
              </div>
            </div>
            <button 
              className="btn-dismiss-request" 
              onClick={() => setSubmittedFreezeData(null)}
              title="Dismiss notification"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="freeze-request-content">
            <div className="freeze-request-details">
              <h4>
                <i className="fas fa-snowflake"></i>
                Request Details
              </h4>
              
              <div className="request-details-grid">
                <div className="detail-row">
                  <div className="detail-label">Reason</div>
                  <div className="detail-value">{submittedFreezeData.reason}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Duration</div>
                  <div className="detail-value">{submittedFreezeData.requested_days} days</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Start Date</div>
                  <div className="detail-value">{submittedFreezeData.start_date}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">End Date</div>
                  <div className="detail-value">{submittedFreezeData.end_date}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className="status-badge requested">{submittedFreezeData.freeze_status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="freeze-request-info">
              <div className="info-card">
                <h4>
                  <i className="fas fa-info-circle"></i>
                  What happens next?
                </h4>
                <ul>
                  <li>Your request has been sent to gym administration</li>
                  <li>You'll receive an email notification once reviewed</li>
                  <li>If approved, freeze will activate on the start date</li>
                  <li>Subscription end date will be extended accordingly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Subscriptions;