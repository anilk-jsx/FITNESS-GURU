import React, { useState, useEffect, useCallback, useRef } from 'react';
import tokenManager from '../utils/tokenManager';
import './RenewSubscriptionModal.css';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / QR Code', icon: 'fas fa-qrcode' },
  { id: 'CARD', label: 'Card Payment', icon: 'fas fa-credit-card' },
  { id: 'CASH', label: 'Cash Payment', icon: 'fas fa-money-bill-wave' },
  { id: 'BANK_TRANSFER', label: 'Net Banking', icon: 'fas fa-university' }
];

// UTC-safe date addition helper
const addDays = (dateStr, days = 1) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(Date.UTC(year, month, day));
  if (isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

const RenewSubscriptionModal = ({
  isOpen,
  initialUserId,
  initialPlanId,
  memberData,
  isMemberPortal = false,
  onClose,
  onSuccess
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // Selection state
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || '');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');

  // Start Date Mode state: 'RECOMMENDED' or 'CUSTOM'
  const [startDateMode, setStartDateMode] = useState('RECOMMENDED');
  const [customStartDate, setCustomStartDate] = useState('');

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

  // Debounce ref for date change
  const debounceTimerRef = useRef(null);

  // Format today's date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Sync initial props
  useEffect(() => {
    if (initialUserId) setSelectedUserId(String(initialUserId));
    if (initialPlanId) setSelectedPlanId(String(initialPlanId));
  }, [initialUserId, initialPlanId]);

  // Fetch dropdown data (Members & Active Membership Plans)
  const fetchDropdownData = useCallback(async () => {
    if (isMemberPortal && memberData) return; // Self-service already has member context

    setLoadingDropdowns(true);
    try {
      const [membersRes, plansRes] = await Promise.all([
        tokenManager.apiCall(`${API_BASE_URL}/api/users/list?role=MEMBER&limit=1000`),
        tokenManager.apiCall(`${API_BASE_URL}/api/membership-plans?status=1&plan_type=BASE_MEMBERSHIP`)
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
          setPlansList(rawPlans.filter(p =>
            (String(p.status) === '1' || p.status === 1 || p.status === undefined) &&
            (!p.plan_type || String(p.plan_type).toUpperCase() === 'BASE_MEMBERSHIP')
          ));
        }
      }
    } catch (err) {
      console.error('Error fetching dropdown data for renewal modal:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [API_BASE_URL, isMemberPortal, memberData]);

  // Fetch Renewal Preview API
  const fetchRenewalPreview = useCallback(async (userId, planId, customDate = null) => {
    if (!userId || !planId) {
      setPreviewData(null);
      return;
    }

    setLoadingPreview(true);
    setPreviewError(null);
    try {
      let url = `${API_BASE_URL}/api/subscriptions/renewal-preview?user_id=${userId}&plan_id=${planId}`;
      if (customDate) {
        url += `&custom_start_date=${encodeURIComponent(customDate)}`;
      }

      const res = await tokenManager.apiCall(url);
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const pData = data.data || {};
        setPreviewData(pData);
        // If we fetched default preview and haven't set a custom date yet, initialize it
        if (!customDate && pData.default_start_date) {
          setCustomStartDate(pData.default_start_date);
        }
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

  // Initial fetch on open or selection change
  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      if (selectedUserId && selectedPlanId) {
        const dateParam = startDateMode === 'CUSTOM' ? customStartDate : null;
        fetchRenewalPreview(selectedUserId, selectedPlanId, dateParam);
      }
    } else {
      setPreviewData(null);
      setPreviewError(null);
      setSubmitError(null);
      setTransactionRef('');
      setStartDateMode('RECOMMENDED');
      setCustomStartDate('');
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    }
  }, [isOpen, fetchDropdownData, selectedUserId, selectedPlanId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Member selection change
  const handleMemberChange = (e) => {
    const uid = e.target.value;
    setSelectedUserId(uid);
    setStartDateMode('RECOMMENDED');
    if (uid && selectedPlanId) {
      fetchRenewalPreview(uid, selectedPlanId, null);
    } else {
      setPreviewData(null);
    }
  };

  // Handle Plan selection change
  const handlePlanChange = (e) => {
    const pid = e.target.value;
    setSelectedPlanId(pid);
    if (selectedUserId && pid) {
      const dateParam = startDateMode === 'CUSTOM' ? customStartDate : null;
      fetchRenewalPreview(selectedUserId, pid, dateParam);
    } else {
      setPreviewData(null);
    }
  };

  // Selected member object from props or dropdown list
  const currentMemberObj = memberData || membersList.find(m => String(m.user_id) === String(selectedUserId)) || {};

  // Check if member has an active subscription ending in the future
  const isActiveOrExpiring = previewData?.membership_state === 'ACTIVE' || previewData?.membership_state === 'EXPIRING_SOON';

  // Last subscription end date (active or past expired)
  const rawLastEndDate = previewData?.last_subscription_end_date
    || previewData?.expired_end_date
    || (isActiveOrExpiring ? previewData?.current_active_end_date : null)
    || (Array.isArray(previewData?.stacked_subscriptions) && previewData.stacked_subscriptions.length > 0
        ? previewData.stacked_subscriptions[previewData.stacked_subscriptions.length - 1]?.end_date
        : null)
    || (currentMemberObj?.end_date && currentMemberObj.end_date !== 'N/A' && currentMemberObj.end_date !== 'None' ? currentMemberObj.end_date : null);

  const lastSubscriptionEndDate = rawLastEndDate && rawLastEndDate !== 'Expired / None' && rawLastEndDate !== 'None'
    ? rawLastEndDate
    : null;

  // Determine minimum allowed start date:
  // Backdating is allowed only strictly after the expiration of the last subscription
  let calculatedMinDate = '';
  if (isMemberPortal) {
    // Member self-service: strictly no backdating
    if (isActiveOrExpiring && lastSubscriptionEndDate) {
      calculatedMinDate = addDays(lastSubscriptionEndDate, 1);
    } else {
      calculatedMinDate = todayStr;
    }
  } else {
    // Admin / Staff:
    if (isActiveOrExpiring && lastSubscriptionEndDate) {
      // If currently active, renewal must start strictly after the active subscription ends
      calculatedMinDate = addDays(lastSubscriptionEndDate, 1);
    } else if (lastSubscriptionEndDate) {
      // If expired, backdating is allowed, but strictly after the expired subscription's end date
      calculatedMinDate = addDays(lastSubscriptionEndDate, 1);
    } else {
      // If member has no prior subscription history, allow backdating (to join date or open)
      calculatedMinDate = currentMemberObj?.date_of_joining || currentMemberObj?.join_date || '';
    }
  }

  // Handle Start Date Mode Change (Recommended vs Custom)
  const handleModeChange = (mode) => {
    setStartDateMode(mode);
    setSubmitError(null);
    if (mode === 'RECOMMENDED') {
      if (selectedUserId && selectedPlanId) {
        fetchRenewalPreview(selectedUserId, selectedPlanId, null);
      }
    } else {
      // Switching to custom: use existing custom date or default start date
      let targetDate = customStartDate || previewData?.default_start_date || previewData?.start_date || todayStr;
      if (calculatedMinDate && targetDate < calculatedMinDate) {
        targetDate = calculatedMinDate;
      }
      setCustomStartDate(targetDate);
      if (selectedUserId && selectedPlanId) {
        fetchRenewalPreview(selectedUserId, selectedPlanId, targetDate);
      }
    }
  };

  // Handle Datepicker input change with 300ms debounce
  const handleCustomDateChange = (e) => {
    const newDate = e.target.value;
    setCustomStartDate(newDate);
    setSubmitError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!newDate || !selectedUserId || !selectedPlanId) return;

    // Enforce backdate restriction: only allow dates after expiration of last subscription
    if (calculatedMinDate && newDate < calculatedMinDate) {
      setSubmitError(
        `Start date cannot be on or before the last subscription's expiration date (${lastSubscriptionEndDate || 'join date'}). Earliest allowed renewal date is ${calculatedMinDate}.`
      );
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchRenewalPreview(selectedUserId, selectedPlanId, newDate);
    }, 300);
  };

  // Submit Renewal
  const handleSubmitRenewal = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedPlanId) {
      setSubmitError('Please select both a Member and a Membership Plan.');
      return;
    }

    // Validate date boundary before submission
    if (startDateMode === 'CUSTOM' && customStartDate) {
      if (calculatedMinDate && customStartDate < calculatedMinDate) {
        setSubmitError(
          `Invalid Start Date: The custom start date (${customStartDate}) cannot be on or before the last subscription's expiration date (${lastSubscriptionEndDate || 'join date'}). Earliest allowed start date is ${calculatedMinDate}.`
        );
        return;
      }
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

      if (startDateMode === 'CUSTOM' && customStartDate) {
        payload.custom_start_date = customStartDate;
      }

      const endpoint = isMemberPortal
        ? `${API_BASE_URL}/api/member/subscriptions/renew`
        : `${API_BASE_URL}/api/admin/subscriptions/renew`;

      const res = await tokenManager.apiCall(endpoint, {
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

  // Determine effective renewal status dynamically based on current projected start date
  const getEffectiveRenewalStatus = () => {
    if (!previewData) {
      return {
        type: 'FRESH_REACTIVATION',
        label: 'FRESH_REACTIVATION (Starts Today)',
        timelineTag: 'Fresh Reactivation (Starts Today)',
        badgeClass: 'badge-fresh',
        icon: 'fas fa-bolt'
      };
    }

    const rawType = previewData.renewal_type;
    const startDate = previewData.start_date || customStartDate || todayStr;

    // 1. Stacked Extension (consecutive with zero gap)
    if (rawType === 'STACKED_EXTENSION') {
      return {
        type: 'STACKED_EXTENSION',
        label: 'STACKED_EXTENSION (Consecutive - No Gap)',
        timelineTag: `Continuous Renewal (Starts ${startDate})`,
        badgeClass: 'badge-stacked',
        icon: 'fas fa-link'
      };
    }

    // 2. Deferred Renewal (active member scheduling with gap)
    if (rawType === 'DEFERRED_RENEWAL') {
      return {
        type: 'DEFERRED_RENEWAL',
        label: 'DEFERRED_RENEWAL (Scheduled with Gap)',
        timelineTag: `Scheduled Renewal (Starts ${startDate})`,
        badgeClass: 'badge-deferred',
        icon: 'fas fa-calendar-plus'
      };
    }

    // 3. Backdated Reactivation (past date)
    if (rawType === 'BACKDATED_REACTIVATION' || previewData.is_backdated || startDate < todayStr) {
      return {
        type: 'BACKDATED_REACTIVATION',
        label: 'BACKDATED_REACTIVATION (Retroactive)',
        timelineTag: `Retroactive Reactivation (Starts ${startDate})`,
        badgeClass: 'badge-backdated',
        icon: 'fas fa-history'
      };
    }

    // 4. Future Scheduled Reactivation (future date > today for inactive/expired member)
    if (rawType === 'FUTURE_REACTIVATION' || rawType === 'SCHEDULED_REACTIVATION' || startDate > todayStr) {
      return {
        type: 'FUTURE_REACTIVATION',
        label: `FUTURE_REACTIVATION (Starts ${startDate})`,
        timelineTag: `Future Reactivation (Starts ${startDate})`,
        badgeClass: 'badge-future',
        icon: 'fas fa-calendar-alt'
      };
    }

    // 5. Fresh Reactivation (starts today)
    return {
      type: 'FRESH_REACTIVATION',
      label: 'FRESH_REACTIVATION (Starts Today)',
      timelineTag: 'Fresh Reactivation (Starts Today)',
      badgeClass: 'badge-fresh',
      icon: 'fas fa-bolt'
    };
  };

  const currentStatus = getEffectiveRenewalStatus();
  const effectiveStartDate = previewData?.start_date || customStartDate || todayStr;
  const isFutureDate = effectiveStartDate > todayStr;
  const isBackdatedDate = effectiveStartDate < todayStr;
  const hasGap = previewData?.gap_days && previewData.gap_days > 0;

  // Helper to render renewal type badge
  const renderRenewalTypeBadge = () => {
    return (
      <span className={`renewal-type-badge ${currentStatus.badgeClass}`}>
        <i className={currentStatus.icon}></i> {currentStatus.label}
      </span>
    );
  };

  return (
    <div className="renew-modal-overlay" onClick={onClose}>
      <div className="renew-modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Minimal Header */}
        <div className="renew-modal-header">
          <div>
            <h3>Renew Membership Subscription</h3>
            <p className="renew-subtitle">Preview date calculations, stack continuous access, or customize start schedule</p>
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
                    <span>{memberData.email || memberData.phone || `User ID #${memberData.user_id}`}</span>
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
                <label className="renew-label">Base Membership Plan:</label>
                <select
                  className="renew-select"
                  value={selectedPlanId}
                  onChange={handlePlanChange}
                  required
                  disabled={loadingDropdowns}
                >
                  <option value="">-- Select Base Plan to Renew --</option>
                  {plansList.map(p => (
                    <option key={p.plan_id} value={p.plan_id}>
                      {p.plan_name} ({p.duration_months} Mo — ₹{Number(p.price).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Start Date Options (Interactive Mode Selection) */}
            <div className="renew-date-options-box">
              <label className="renew-label renew-section-heading">
                <i className="fas fa-calendar-alt"></i> Start Date Options
              </label>

              <div className="date-mode-cards">
                {/* Option 1: Recommended Immediate Consecutive */}
                <label className={`date-mode-card ${startDateMode === 'RECOMMENDED' ? 'active' : ''}`}>
                  <div className="mode-radio-wrap">
                    <input
                      type="radio"
                      name="startDateMode"
                      value="RECOMMENDED"
                      checked={startDateMode === 'RECOMMENDED'}
                      onChange={() => handleModeChange('RECOMMENDED')}
                    />
                  </div>
                  <div className="mode-content">
                    <div className="mode-title-row">
                      <strong className="mode-title">Recommended: Immediate Consecutive Renewal</strong>
                      <span className="mode-rec-tag">Recommended</span>
                    </div>
                    <div className="mode-desc">
                      Starts:{' '}
                      <strong>
                        {previewData?.default_start_date || previewData?.start_date || 'Calculated Automatically'}
                      </strong>{' '}
                      <em>(No gap in membership)</em>
                    </div>
                  </div>
                </label>

                {/* Option 2: Custom Start Date */}
                <label className={`date-mode-card ${startDateMode === 'CUSTOM' ? 'active' : ''}`}>
                  <div className="mode-radio-wrap">
                    <input
                      type="radio"
                      name="startDateMode"
                      value="CUSTOM"
                      checked={startDateMode === 'CUSTOM'}
                      onChange={() => handleModeChange('CUSTOM')}
                    />
                  </div>
                  <div className="mode-content">
                    <strong className="mode-title">Custom Start Date</strong>
                    <div className="mode-desc">Schedule for a future date or record a retroactive renewal</div>

                    {startDateMode === 'CUSTOM' && (
                      <div className="custom-datepicker-container" onClick={(e) => e.stopPropagation()}>
                        <div className="datepicker-row">
                          <label className="picker-lbl">Select Date:</label>
                          <input
                            type="date"
                            className="renew-input renew-date-input"
                            value={customStartDate}
                            min={calculatedMinDate || undefined}
                            onChange={handleCustomDateChange}
                            required={startDateMode === 'CUSTOM'}
                          />
                        </div>
                        {calculatedMinDate && (
                          <span className="picker-hint">
                            {isActiveOrExpiring && lastSubscriptionEndDate ? (
                              <>
                                <i className="fas fa-lock"></i> Current plan active until <strong>{lastSubscriptionEndDate}</strong>. Renewal can start on or after <strong>{calculatedMinDate}</strong>.
                              </>
                            ) : lastSubscriptionEndDate ? (
                              <>
                                <i className="fas fa-calendar-check"></i> Last subscription expired on <strong>{lastSubscriptionEndDate}</strong>. Backdating allowed on or after <strong>{calculatedMinDate}</strong>.
                              </>
                            ) : isMemberPortal ? (
                              <>
                                <i className="fas fa-info-circle"></i> As a member, dates cannot be set prior to today ({todayStr}).
                              </>
                            ) : (
                              <>
                                <i className="fas fa-info-circle"></i> Earliest allowed start date is <strong>{calculatedMinDate}</strong>.
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Dynamic Gap / Future / Retroactive Warning Banners */}
              {hasGap && startDateMode === 'CUSTOM' && (
                <div className="renew-gap-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div>
                    <strong>{previewData.gap_days}-Day Coverage Gap:</strong> Member will be inactive from{' '}
                    <span>{previewData.gap_start_date || previewData.current_active_end_date || 'previous expiry'}</span> to{' '}
                    <span>{previewData.start_date}</span>.
                  </div>
                </div>
              )}

              {isFutureDate && !hasGap && startDateMode === 'CUSTOM' && (
                <div className="renew-gap-warning renew-future-warning">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <strong>Future Scheduled Reactivation:</strong> Membership will activate on{' '}
                    <span>{effectiveStartDate}</span>.
                  </div>
                </div>
              )}

              {isBackdatedDate && startDateMode === 'CUSTOM' && (
                <div className="renew-gap-warning renew-retro-warning">
                  <i className="fas fa-history"></i>
                  <div>
                    <strong>Retroactive Start Date:</strong> Membership coverage starts retroactively on{' '}
                    <span>{effectiveStartDate}</span>.
                  </div>
                </div>
              )}
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
              <div className={`renew-preview-card ${previewData.membership_state || 'ACTIVE'}`}>

                <div className="preview-card-top">
                  <span className="preview-card-title">
                    <i className="fas fa-receipt"></i> Preview Summary
                  </span>
                  {renderRenewalTypeBadge()}
                </div>

                {/* Existing Stacked Subscriptions Chain (If Any) */}
                {Array.isArray(previewData.stacked_subscriptions) && previewData.stacked_subscriptions.length > 0 && (
                  <div className="stacked-chain-box">
                    <div className="stacked-chain-header">
                      <i className="fas fa-list-ol"></i> Existing Active Subscriptions ({previewData.total_stacked_count || previewData.stacked_subscriptions.length})
                    </div>
                    <ul className="stacked-chain-list">
                      {previewData.stacked_subscriptions.map((s, idx) => (
                        <li key={s.subscription_id || idx} className="stacked-chain-item">
                          <span className="item-num">#{idx + 1}</span>
                          <span className="item-name">{s.plan_name || 'Base Membership'}</span>
                          <span className="item-dates">{s.start_date} → <strong>{s.end_date}</strong></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="preview-timeline">
                  <div className="timeline-col">
                    <span className="col-lbl">Current Expiry / Baseline</span>
                    <strong className="col-val">{previewData.current_active_end_date || 'Expired / None'}</strong>
                    {previewData.current_days_remaining > 0 && (
                      <span className="rem-days">{previewData.current_days_remaining} days active</span>
                    )}
                  </div>

                  <div className="timeline-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>

                  <div className="timeline-col highlight">
                    <span className="col-lbl">Projected Subscription Period</span>
                    <strong className="col-val">{previewData.start_date} → {previewData.end_date}</strong>
                    <span className="type-tag">
                      {currentStatus.timelineTag}
                    </span>
                  </div>
                </div>

                {/* Tax and Total Payable Breakdown */}
                <div className="preview-payable-row">
                  <div className="payable-tax-details">
                    <span className="payable-main-label">Total Payable:</span>
                    <small className="payable-sub-label">
                      {previewData.tax_details
                        ? `Base: ₹${Number(previewData.tax_details.base_amount || 0).toFixed(2)} (CGST 9% + SGST 9%)`
                        : '(Incl. CGST 9% + SGST 9% Taxes)'}
                    </small>
                  </div>
                  <strong className="payable-price">
                    ₹{Number(previewData.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
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
              disabled={submitting || !previewData || loadingPreview}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing Renewal...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i> Confirm & Renew Plan
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
