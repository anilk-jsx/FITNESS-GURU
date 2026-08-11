import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './RenewSubscriptionModal.css';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / QR Code', icon: 'fas fa-qrcode' },
  { id: 'CARD', label: 'Card Payment', icon: 'fas fa-credit-card' },
  { id: 'CASH', label: 'Cash Payment', icon: 'fas fa-money-bill-wave' },
  { id: 'BANK_TRANSFER', label: 'Net Banking', icon: 'fas fa-university' }
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
    if (initialUserId) setSelectedUserId(String(initialUserId));
    if (initialPlanId) setSelectedPlanId(String(initialPlanId));
  }, [initialUserId, initialPlanId]);

  // Fetch dropdown data (Members & Active Membership Plans)
  const fetchDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [membersRes, plansRes] = await Promise.all([
        tokenManager.apiCall(`${API_BASE_URL}/api/users/list?role=MEMBER&limit=1000`),
        tokenManager.apiCall(`${API_BASE_URL}/api/membership-plans?status=1`)
      ]);

      if (membersRes.ok) {
        const mData = await membersRes.json();
        const rawMembers = mData.data || mData.users || (Array.isArray(mData) ? mData : []);
        if (Array.isArray(rawMembers)) {
          setMembersList(rawMembers);
        }
      }

      if (plansRes.ok) {
        const pData = await plansRes.json();
        const rawPlans = pData.data || pData.plans || (Array.isArray(pData) ? pData : []);
        if (Array.isArray(rawPlans)) {
          setPlansList(rawPlans.filter(p => String(p.status) === '1' || p.status === 1 || p.status === undefined));
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
        
        {/* Minimal Header */}
        <div className="renew-modal-header">
          <div>
            <h3>Renew Membership Subscription</h3>
            <p className="renew-subtitle">Stack continuous access or reactivate member plan</p>
          </div>
          <button type="button" className="renew-close-btn" onClick={onClose} title="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitRenewal} className="renew-modal-form">
          
          <div className="renew-modal-body">

            {submitError && (
              <div className="renew-alert renew-alert-danger">
                <i className="fas fa-exclamation-circle"></i>
                <span>{submitError}</span>
              </div>
            )}

            {/* Member & Plan Selection */}
            <div className="renew-selection-grid">
              
              {/* Member Selection */}
              <div className="renew-form-group">
                <label className="renew-label">Member:</label>
                {memberData ? (
                  <div className="renew-static-info">
                    <strong>{memberData.name || memberData.user_name || `Member #${memberData.user_id}`}</strong>
                    <span>{memberData.email || memberData.reg_no || `User ID #${memberData.user_id}`}</span>
                  </div>
                ) : (
                  <select
                    className="renew-select"
                    value={selectedUserId}
                    onChange={handleMemberChange}
                    required
                    disabled={loadingDropdowns}
                  >
                    <option value="">-- Select Member --</option>
                    {membersList.map(m => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || `User #${m.user_id}`} ({m.email || m.phone || 'No Email'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Plan Selection */}
              <div className="renew-form-group">
                <label className="renew-label">Membership Plan:</label>
                <select
                  className="renew-select"
                  value={selectedPlanId}
                  onChange={handlePlanChange}
                  required
                  disabled={loadingDropdowns}
                >
                  <option value="">-- Select Plan to Renew --</option>
                  {plansList.map(p => (
                    <option key={p.plan_id} value={p.plan_id}>
                      {p.plan_name} ({p.duration_months} Mo — ₹{Number(p.price).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Live Renewal Preview Card */}
            {loadingPreview ? (
              <div className="renew-loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Calculating renewal strategy & date projections...</span>
              </div>
            ) : previewError ? (
              <div className="renew-alert renew-alert-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{previewError}</span>
              </div>
            ) : previewData ? (
              <div className={`renew-preview-card ${previewData.membership_state}`}>
                
                <div className="preview-card-top">
                  <span className="preview-card-title">Renewal Summary</span>
                  <span className={`state-badge badge-${previewData.membership_state.toLowerCase()}`}>
                    {previewData.membership_state === 'EXPIRING_SOON' && '⚡ EXPIRING SOON'}
                    {previewData.membership_state === 'ACTIVE' && '✓ ACTIVE'}
                    {previewData.membership_state === 'EXPIRED' && '⚠ EXPIRED'}
                  </span>
                </div>

                <div className="preview-timeline">
                  <div className="timeline-col">
                    <span className="col-lbl">Current Expiry</span>
                    <strong className="col-val">{previewData.current_active_end_date || 'Expired'}</strong>
                    {previewData.current_days_remaining > 0 && (
                      <span className="rem-days">{previewData.current_days_remaining} days left</span>
                    )}
                  </div>

                  <div className="timeline-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>

                  <div className="timeline-col highlight">
                    <span className="col-lbl">New Subscription Period</span>
                    <strong className="col-val">{previewData.start_date} → {previewData.end_date}</strong>
                    <span className="type-tag">
                      {previewData.renewal_type === 'STACKED_EXTENSION' ? 'Stacked Extension (Zero Day Loss)' : 'Fresh Reactivation (Starts Today)'}
                    </span>
                  </div>
                </div>

                <div className="preview-payable-row">
                  <span>Total Amount Payable (Incl. Taxes)</span>
                  <strong className="payable-price">₹{Number(previewData.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>

              </div>
            ) : null}

            {/* Payment Method Selector */}
            <div className="renew-payment-group">
              <label className="renew-label">Payment Method:</label>
              
              <div className="payment-options-grid">
                {PAYMENT_METHODS.map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`payment-option-btn ${paymentMethod === mode.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(mode.id)}
                  >
                    <i className={mode.icon}></i>
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>

              <div className="renew-form-group mt-2">
                <label className="renew-label">Transaction Reference (Optional):</label>
                <input
                  type="text"
                  className="renew-input"
                  placeholder="e.g. UPI Ref #, Cheque No., or Cash Receipt ID"
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
                  <i className="fas fa-spinner fa-spin"></i> Processing Renewal...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i> Confirm Renewal
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
