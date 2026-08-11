import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './RenewSubscriptionModal.css';

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
            <i className="fas fa-sync-alt renew-icon"></i>
            <div>
              <h3>Renew Membership Subscription</h3>
              <p className="renew-subtitle">Extend continuous access or reactivate member plan</p>
            </div>
          </div>
          <button type="button" className="renew-close-btn" onClick={onClose} title="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitRenewal} className="renew-modal-body">

          {submitError && (
            <div className="renew-alert renew-alert-danger">
              <i className="fas fa-exclamation-circle"></i>
              <span>{submitError}</span>
            </div>
          )}

          {/* Member & Plan Selector */}
          <div className="renew-form-grid">
            
            {/* Member Selector */}
            <div className="renew-form-group">
              <label className="renew-label">
                <i className="fas fa-user"></i> Member:
              </label>
              {memberData ? (
                <div className="renew-static-val">
                  <strong>{memberData.name || memberData.user_name || `Member #${memberData.user_id}`}</strong>
                  <span className="renew-subtext">{memberData.email || memberData.reg_no || ''}</span>
                </div>
              ) : (
                <select
                  className="renew-input"
                  value={selectedUserId}
                  onChange={handleMemberChange}
                  required
                  disabled={loadingDropdowns}
                >
                  <option value="">-- Select Member --</option>
                  {membersList.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.name || `User #${m.user_id}`} ({m.email || m.phone || 'No Email'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Plan Selector */}
            <div className="renew-form-group">
              <label className="renew-label">
                <i className="fas fa-id-card"></i> Membership Plan to Renew:
              </label>
              <select
                className="renew-input"
                value={selectedPlanId}
                onChange={handlePlanChange}
                required
                disabled={loadingDropdowns}
              >
                <option value="">-- Select Renewal Plan --</option>
                {plansList.map(p => (
                  <option key={p.plan_id} value={p.plan_id}>
                    {p.plan_name} ({p.duration_months} Mo - ₹{Number(p.price).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Renewal Preview Card */}
          {loadingPreview ? (
            <div className="renew-preview-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Calculating stacked dates & membership status...</span>
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
                  <i className="fas fa-calendar-check"></i> Renewal Date Projection
                </span>
                <span className={`state-badge badge-${previewData.membership_state.toLowerCase()}`}>
                  {previewData.membership_state === 'EXPIRING_SOON' && '⚡ EXPIRING SOON (<= 7d)'}
                  {previewData.membership_state === 'ACTIVE' && '✓ ACTIVE'}
                  {previewData.membership_state === 'EXPIRED' && '⚠ EXPIRED'}
                </span>
              </div>

              <div className="preview-dates-grid">
                
                <div className="date-block">
                  <span className="date-label">Current Plan End Date</span>
                  <span className="date-value text-muted">
                    {previewData.current_active_end_date || 'N/A (Expired)'}
                  </span>
                  {previewData.current_days_remaining > 0 && (
                    <span className="days-remaining-pill">
                      {previewData.current_days_remaining} day{previewData.current_days_remaining > 1 ? 's' : ''} left
                    </span>
                  )}
                </div>

                <div className="date-arrow">
                  <i className="fas fa-long-arrow-alt-right"></i>
                </div>

                <div className="date-block highlight">
                  <span className="date-label">New Subscription Period</span>
                  <span className="date-value">
                    {previewData.start_date} <span className="to-span">to</span> {previewData.end_date}
                  </span>
                  <span className="duration-pill">
                    +{previewData.duration_months} Months ({previewData.renewal_type === 'STACKED_EXTENSION' ? 'Stacked' : 'Fresh Start'})
                  </span>
                </div>

              </div>

              <div className="preview-strategy-info">
                {previewData.renewal_type === 'STACKED_EXTENSION' ? (
                  <p>
                    <i className="fas fa-layer-group text-primary"></i> 
                    <strong>Stacked Extension:</strong> The new plan will automatically start on <strong>{previewData.start_date}</strong> (day after current end date), ensuring <strong>zero day loss</strong> of the remaining {previewData.current_days_remaining} days.
                  </p>
                ) : (
                  <p>
                    <i className="fas fa-bolt text-success"></i> 
                    <strong>Fresh Reactivation:</strong> The new plan will start immediately today on <strong>{previewData.start_date}</strong> and restore full active gym privileges until <strong>{previewData.end_date}</strong>.
                  </p>
                )}
              </div>

              <div className="preview-price-summary">
                <span>Total Amount Payable (Incl. Taxes):</span>
                <strong>₹{Number(previewData.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>

            </div>
          ) : null}

          {/* Payment Section */}
          <div className="renew-payment-section">
            <h4>Payment Information</h4>
            <div className="renew-payment-grid">
              
              <div className="renew-form-group">
                <label className="renew-label">Payment Method:</label>
                <select
                  className="renew-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div className="renew-form-group">
                <label className="renew-label">Transaction Ref / Notes (Optional):</label>
                <input
                  type="text"
                  className="renew-input"
                  placeholder="e.g. UPI-9988776655 or Receipt #12"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* Modal Footer Actions */}
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
