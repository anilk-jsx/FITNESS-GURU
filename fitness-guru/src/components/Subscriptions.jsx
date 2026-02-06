import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import './Subscriptions.css';

const Subscriptions = () => {
  const [currentPricing, setCurrentPricing] = useState('quarterly');
  
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  const currentPlan = {
    name: 'Premium Membership',
    price: 6749,
    period: 'quarterly',
    status: 'Active',
    expiryDate: 'Nov 30, 2026'
  };

  const plans = {
    basic: {
      name: 'Basic Membership',
      monthly: 1499,
      quarterly: 4047, // 10% off monthly
      annual: 15112, // 16% off monthly
      features: [
        'Access to gym equipment',
        'Locker facility',
        'Basic fitness assessment',
        'Standard operating hours',
        'Emergency support'
      ]
    },
    premium: {
      name: 'Premium Membership',
      monthly: 2499,
      quarterly: 6749, // 10% off monthly
      annual: 25191, // 16% off monthly
      features: [
        'All Basic features',
        'Personal trainer consultation',
        'Group fitness classes',
        'Nutrition guidance',
        'Extended operating hours',
        'Priority support',
        'Guest pass (2 per month)'
      ]
    },
    elite: {
      name: 'Elite Membership',
      monthly: 3999,
      quarterly: 10798, // 10% off monthly
      annual: 40309, // 16% off monthly
      features: [
        'All Premium features',
        'Dedicated personal trainer',
        'Customized meal plans',
        'Biometric assessments',
        '24/7 gym access',
        'VIP locker room',
        'Unlimited guest passes',
        'Priority class booking'
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
    if (currentPricing === 'quarterly') return 'Save 10% vs monthly';
    if (currentPricing === 'annual') return 'Save 16% vs monthly - Best Value!';
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
            <button className="btn-manage" onClick={() => alert('Manage subscription features coming soon!')}>
              <i className="fas fa-cog"></i>
              Manage Subscription
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

      {/* Pricing Toggle */}
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
          💰 Save 10% with quarterly billing!
        </div>
        <div className={`discount-message ${currentPricing === 'annual' ? 'show' : ''}`}>
          🎉 Save 16% with annual billing - Best Value!
        </div>
      </div>

      {/* Membership Plans */}
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
    </DashboardLayout>
  );
};

export default Subscriptions;