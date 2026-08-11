import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './RenewSubscriptionModal.css';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / QR Code', icon: 'fas fa-qrcode', desc: 'GPay, PhonePe, Paytm' },
  { id: 'CARD', label: 'Card Payment', icon: 'fas fa-credit-card', desc: 'Debit & Credit Cards' },
  { id: 'CASH', label: 'Cash Payment', icon: 'fas fa-money-bill-wave', desc: 'Direct Gym Desk Cash' },
  { id: 'BANK_TRANSFER', label: 'Net Banking', icon: 'fas fa-university', desc: 'NEFT / RTGS Transfer' }
];

const RenewSubscriptionModal = ({
  isOpen,
  initialUserId,
  initialPlanId,
  memberData,
  onClose,
  onSuccess
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // Selection state
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || '');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');

  // Dropdown options
  const [membersList, setMembersList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Renewal Preview state
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Sync initial props
  useEffect(() => {
    if (initialUserId) setSelectedUserId(initialUserId);
    if (initialPlanId) setSelectedPlanId(initialPlanId);
  }, [initialUserId, initialPlanId]);

  // Fetch dropdown data if needed
  const fetchDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [membersRes, plansRes] = await Promise.all([
        tokenManager.apiCall(`${API_BASE_URL}/api/users/list`),
        tokenManager.apiCall(`${API_BASE_URL}/api/membershipPlan`)
      ]);

      if (membersRes.ok) {
        const mData = await membersRes.json();
        if (mData.status === 'success' && Array.isArray(mData.data)) {
          setMembersList(mData.data.filter(u => String(u.role).toUpperCase() === 'MEMBER'));
        }
      }

      if (plansRes.ok) {
        const pData = await plansRes.json();
        if (pData.status === 'success' && Array.isArray(pData.data)) {
          setPlansList(pData.data.filter(p => Number(p.status) === 1));
        }
      }
    } catch (err) {
      console.error('Error fetching dropdown data for renewal modal:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [API_BASE_URL]);

  // Fetch Renewal Preview
  const fetchRenewalPreview = useCallback(async (userId, planId) => {
    if (!userId || !planId) {
      setPreviewData(null);
      return;
    }

    setLoadingPreview(true);
    setPreviewError(null);
    try {
      const res = await tokenManager.apiCall(
        `${API_BASE_URL}/api/subscriptions/renewal-preview?user_id=${userId}&plan_id=${planId}`
      );
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setPreviewData(data.data);
      } else {
        setPreviewError(data.message || 'Failed to generate subscription renewal preview.');
        setPreviewData(null);
      }
    } catch (err) {
      console.error('Error fetching renewal preview:', err);
      setPreviewError('Network error while generating renewal preview.');
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      if (selectedUserId && selectedPlanId) {
        fetchRenewalPreview(selectedUserId, selectedPlanId);
      }
    } else {
      // Reset state on close
      setPreviewData(null);
      setPreviewError(null);
      setSubmitError(null);
      setTransactionRef('');
    }
  }, [isOpen, fetchDropdownData, selectedUserId, selectedPlanId, fetchRenewalPreview]);

  const handleMemberChange = (e) => {
    const uid = e.target.value;
    setSelectedUserId(uid);
    if (uid && selectedPlanId) {
      fetchRenewalPreview(uid, selectedPlanId);
    } else {
      setPreviewData(null);
    }
  };

  const handlePlanChange = (e) => {
    const pid = e.target.value;
    setSelectedPlanId(pid);
    if (selectedUserId && pid) {
      fetchRenewalPreview(selectedUserId, pid);
    } else {
      setPreviewData(null);
    }
  };

  const handleSubmitRenewal = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedPlanId) {
      setSubmitError('Please select both a Member and a Membership Plan.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        user_id: Number(selectedUserId),
        plan_id: Number(selectedPlanId),
        payment_method: paymentMethod,
        transaction_ref: transactionRef || undefined
      };

      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/subscriptions/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        if (onSuccess) {
          onSuccess(data);
        }
        onClose();
      } else {
        setSubmitError(data.message || 'Failed to renew subscription.');
      }
    } catch (err) {
      console.error('Error submitting subscription renewal:', err);
      setSubmitError('Network error while processing renewal transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="renew-modal-overlay">
      <div className="renew-modal-card">
        
        {/* Modal Header */}
        <div className="renew-modal-header">
          <div className="renew-title-group">
            <div className="renew-icon-wrapper">
              <i className="fas fa-sync-alt renew-icon"></i>
            </div>
            <div>
              <h3>Renew Membership Subscription</h3>
              <p className="renew-subtitle">Stack continuous access or reactivate member plan</p>
            </div>
          </div>
          <button type="button" className="renew-close-btn" onClick={onClose} title="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Form Wrapper */}
        <form onSubmit={handleSubmitRenewal} className="renew-modal-form">
          
          {/* Scrollable Modal Body */}
          <div className="renew-modal-body">

            {submitError && (
              <div className="renew-alert renew-alert-danger">
                <i className="fas fa-exclamation-circle"></i>
                <span>{submitError}</span>
              </div>
            )}

            {/* Member & Plan Selection Cards */}
            <div className="renew-selection-section">
              
              {/* Member Field */}
              <div className="renew-form-group">
                <label className="renew-label">
                  <i className="fas fa-user-circle text-primary"></i> Member User:
                </label>
                {memberData ? (
                  <div className="renew-static-card">
                    <div className="avatar-ring">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="static-member-info">
                      <strong>{memberData.name || memberData.user_name || `Member #${memberData.user_id}`}</strong>
                      <span>{memberData.email || memberData.reg_no || `User ID: #${memberData.user_id}`}</span>
                    </div>
                  </div>
                ) : (
                  <div className="renew-select-wrapper">
                    <select
                      className="renew-input-styled"
                      value={selectedUserId}
                      onChange={handleMemberChange}
                      required
                      disabled={loadingDropdowns}
                    >
                      <option value="">-- Choose Member --</option>
                      {membersList.map(m => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.name || `User #${m.user_id}`} ({m.email || m.phone || 'No Contact'})
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down select-chevron"></i>
                  </div>
                )}
              </div>

              {/* Plan Selector */}
              <div className="renew-form-group">
                <label className="renew-label">
                  <i className="fas fa-id-card text-accent"></i> Target Membership Plan:
                </label>
                <div className="renew-select-wrapper">
                  <select
                    className="renew-input-styled"
                    value={selectedPlanId}
                    onChange={handlePlanChange}
                    required
                    disabled={loadingDropdowns}
                  >
                    <option value="">-- Select Renewal Plan --</option>
                    {plansList.map(p => (
                      <option key={p.plan_id} value={p.plan_id}>
                        {p.plan_name} ({p.duration_months} Mo — ₹{Number(p.price).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down select-chevron"></i>
                </div>
              </div>

            </div>

            {/* Renewal Preview Card */}
            {loadingPreview ? (
              <div className="renew-preview-loading">
                <div className="spinner-pulse"></div>
                <span>Pre-calculating stacked dates & membership status...</span>
              </div>
            ) : previewError ? (
              <div className="renew-alert renew-alert-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{previewError}</span>
              </div>
            ) : previewData ? (
              <div className={`renew-preview-card ${previewData.membership_state}`}>
                
                <div className="preview-card-header">
                  <span className="preview-card-title">
                    <i className="fas fa-calendar-alt"></i> Date Projection & Strategy
                  </span>
                  <span className={`state-badge badge-${previewData.membership_state.toLowerCase()}`}>
                    {previewData.membership_state === 'EXPIRING_SOON' && '⚡ EXPIRING SOON (<= 7 Days)'}
                    {previewData.membership_state === 'ACTIVE' && '✓ ACTIVE'}
                    {previewData.membership_state === 'EXPIRED' && '⚠ EXPIRED'}
                  </span>
                </div>

                {/* Timeline Grid */}
                <div className="preview-dates-timeline">
                  
                  <div className="timeline-node current">
                    <span className="node-label">Current Plan End</span>
                    <span className="node-date">
                      {previewData.current_active_end_date || 'Expired'}
                    </span>
                    {previewData.current_days_remaining > 0 && (
                      <span className="days-remaining-pill">
                        {previewData.current_days_remaining} day{previewData.current_days_remaining > 1 ? 's' : ''} remaining
                      </span>
                    )}
                  </div>

                  <div className="timeline-connector">
                    <i className="fas fa-arrow-right connector-icon"></i>
                    <span className="connector-text">{previewData.renewal_type === 'STACKED_EXTENSION' ? 'Auto-Stack' : 'Fresh Start'}</span>
                  </div>

                  <div className="timeline-node next highlight">
                    <span className="node-label">New Renewal Period</span>
                    <span className="node-date">
                      {previewData.start_date} <span className="to-txt">to</span> {previewData.end_date}
                    </span>
                    <span className="duration-pill">
                      +{previewData.duration_months} Months ({previewData.renewal_type === 'STACKED_EXTENSION' ? 'Zero Day Loss' : 'Immediate Start'})
                    </span>
                  </div>

                </div>

                <div className="preview-strategy-info">
                  {previewData.renewal_type === 'STACKED_EXTENSION' ? (
                    <p>
                      <i className="fas fa-layer-group text-primary"></i> 
                      <span><strong>Stacked Extension:</strong> New plan starts automatically on <strong>{previewData.start_date}</strong> (day after current end date). The member keeps all <strong>{previewData.current_days_remaining} remaining days</strong> without overlap!</span>
                    </p>
                  ) : (
                    <p>
                      <i className="fas fa-bolt text-success"></i> 
                      <span><strong>Fresh Reactivation:</strong> Membership reactivates starting <strong>Today ({previewData.start_date})</strong> until <strong>{previewData.end_date}</strong> with instant access.</span>
                    </p>
                  )}
                </div>

                <div className="preview-price-summary">
                  <div className="price-info">
                    <span className="price-lbl">Total Amount Payable</span>
                    <span className="price-sub">Includes all applicable GST & Taxes</span>
                  </div>
                  <strong className="price-val">₹{Number(previewData.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>

              </div>
            ) : null}

            {/* Interactive Payment Method Cards */}
            <div className="renew-payment-section">
              <h4 className="section-title">Select Payment Mode</h4>
              
              <div className="payment-modes-grid">
                {PAYMENT_METHODS.map(mode => (
                  <div
                    key={mode.id}
                    className={`payment-mode-card ${paymentMethod === mode.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(mode.id)}
                  >
                    <div className="mode-icon-box">
                      <i className={mode.icon}></i>
                    </div>
                    <div className="mode-text">
                      <span className="mode-label">{mode.label}</span>
                      <span className="mode-desc">{mode.desc}</span>
                    </div>
                    {paymentMethod === mode.id && (
                      <div className="mode-check">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="renew-form-group mt-2">
                <label className="renew-label">Transaction Reference / Reference Notes (Optional):</label>
                <input
                  type="text"
                  className="renew-input-styled"
                  placeholder="e.g. UPI-9988776655, Cheque #1042, or Cash Receipt ID"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Sticky Modal Footer */}
          <div className="renew-modal-footer">
            <button type="button" className="renew-btn renew-btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="renew-btn renew-btn-primary"
              disabled={submitting || !previewData}
            >
              {submitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Processing Renewal...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i> Confirm & Execute Renewal
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default RenewSubscriptionModal;
