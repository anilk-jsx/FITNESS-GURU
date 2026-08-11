import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './RevertSubscriptionModal.css';

const REASON_OPTIONS = [
  'Accidental subscription purchase by member',
  'Duplicate billing / payment glitch',
  'Selected wrong membership plan',
  'Other'
];

const RevertSubscriptionModal = ({
  isOpen,
  invoiceId,
  invoiceData: initialInvoiceData,
  subscriptionDetails,
  onClose,
  onSuccess
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  const [invoice, setInvoice] = useState(initialInvoiceData?.invoice || null);
  const [lineItems, setLineItems] = useState(initialInvoiceData?.line_items || []);
  const [transactions, setTransactions] = useState(initialInvoiceData?.transactions || []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [customReasonText, setCustomReasonText] = useState('');
  
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [remainingTimeText, setRemainingTimeText] = useState('');
  const [isEligible, setIsEligible] = useState(true);

  // Fetch Invoice Details if not passed directly
  const fetchInvoiceDetails = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await tokenManager.apiCall(`${API_BASE_URL}/api/invoices/${id}`);
      if (res.ok) {
        const result = await res.json();
        if (result.status === 'success' && result.data) {
          setInvoice(result.data.invoice || null);
          setLineItems(result.data.line_items || []);
          setTransactions(result.data.transactions || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch invoice details:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSelectedReason(REASON_OPTIONS[0]);
      setCustomReasonText('');
      if (initialInvoiceData?.invoice) {
        setInvoice(initialInvoiceData.invoice);
        setLineItems(initialInvoiceData.line_items || []);
        setTransactions(initialInvoiceData.transactions || []);
      } else if (invoiceId) {
        fetchInvoiceDetails(invoiceId);
      }
    }
  }, [isOpen, invoiceId, initialInvoiceData, fetchInvoiceDetails]);

  // Calculate Time Remaining within 24-hour window
  useEffect(() => {
    const createdAtStr = invoice?.created_at || invoice?.issued_at || subscriptionDetails?.created_at || subscriptionDetails?.start_date;
    if (!createdAtStr) {
      setIsEligible(true);
      setRemainingTimeText('Within 24 Hours');
      return;
    }

    const createdTime = new Date(createdAtStr).getTime();
    if (isNaN(createdTime)) {
      setIsEligible(true);
      setRemainingTimeText('Within 24 Hours');
      return;
    }

    const now = new Date().getTime();
    const diffMs = Math.max(0, now - createdTime);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);

    if (hours < 24) {
      const remainingMinutes = (24 * 60) - totalMinutes;
      const remHours = Math.floor(remainingMinutes / 60);
      const remMins = remainingMinutes % 60;
      setIsEligible(true);
      setRemainingTimeText(`${remHours}h ${remMins}m remaining`);
    } else {
      setIsEligible(false);
      setRemainingTimeText(`Expired (${hours}h elapsed)`);
    }
  }, [invoice, subscriptionDetails]);

  if (!isOpen) return null;

  const targetInvoiceId = invoiceId || invoice?.invoice_id || subscriptionDetails?.invoice_id;

  const handleSubmitReversal = async (e) => {
    e.preventDefault();
    if (!targetInvoiceId) {
      setErrorMsg('No valid transaction record found.');
      return;
    }

    const finalReason = selectedReason === 'Other' ? customReasonText.trim() : selectedReason;
    if (!finalReason) {
      setErrorMsg('Please enter a custom reason for reversal.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const url = `${API_BASE_URL}/api/admin/finance/revert-subscription-24h`;
      const res = await tokenManager.apiCall(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: Number(targetInvoiceId),
          reason: finalReason
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === 'success') {
        setSuccessMsg(data.message || 'Subscription purchase successfully reverted.');
        setTimeout(() => {
          if (onSuccess) onSuccess(data);
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Reversal denied.');
      }
    } catch (err) {
      console.error('Error reverting subscription:', err);
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Human readable Member Name
  const memberName = (
    invoice?.user_name || 
    (invoice?.first_name ? `${invoice.first_name} ${invoice.last_name || ''}`.trim() : '') || 
    subscriptionDetails?.member_name || 
    subscriptionDetails?.name || 
    'Gym Member'
  );

  const memberRegNo = (
    invoice?.reg_no || 
    invoice?.registration_no || 
    subscriptionDetails?.reg_no || 
    (targetInvoiceId ? `FG-REG-${String(invoice?.user_id || subscriptionDetails?.user_id || targetInvoiceId).padStart(4, '0')}` : '')
  );

  // Human readable Contact (Email or Phone)
  const memberContact = (
    invoice?.email || 
    subscriptionDetails?.email || 
    invoice?.phone || 
    subscriptionDetails?.phone || 
    ''
  );

  // Human readable Plan Name
  const planName = lineItems[0]?.item_name || subscriptionDetails?.plan_name || 'Membership Subscription';

  // Amount & Payment Method
  const totalAmount = invoice?.final_amount || invoice?.total_amount || subscriptionDetails?.price || '0.00';
  const paymentMode = transactions[0]?.payment_mode || invoice?.payment_mode || subscriptionDetails?.payment_method;

  return (
    <div className="revert-modal-overlay">
      <div className="revert-modal-card">
        {/* Header */}
        <div className="revert-modal-header">
          <h2>Revert Subscription Purchase</h2>
          <button className="revert-close-btn" onClick={onClose} disabled={submitting}>&times;</button>
        </div>

        {/* Modal Content */}
        <div className="revert-modal-body">
          {loading ? (
            <div className="revert-loading">
              <i className="fas fa-spinner fa-spin"></i> Loading details...
            </div>
          ) : (
            <form onSubmit={handleSubmitReversal} className="revert-form">
              
              {/* 1. Time Remaining */}
              <div className={`time-remaining-bar ${isEligible ? 'eligible' : 'expired'}`}>
                <i className={`fas ${isEligible ? 'fa-clock' : 'fa-hourglass-end'}`}></i>
                <span><strong>Time Remaining:</strong> {remainingTimeText}</span>
              </div>

              {/* 2. User Details */}
              <div className="revert-detail-box">
                <span className="box-label"><i className="fas fa-user"></i> Member Details</span>
                <div className="box-value-main">{memberName}</div>
                {memberRegNo && <div className="box-value-sub"><strong>Reg No:</strong> {memberRegNo}</div>}
                {memberContact && <div className="box-value-sub"><strong>Email:</strong> {memberContact}</div>}
              </div>

              {/* 3. Price Details */}
              <div className="revert-detail-box">
                <span className="box-label"><i className="fas fa-tag"></i> Plan & Price Details</span>
                <div className="box-value-main">{planName}</div>
                <div className="price-tag">
                  ₹{parseFloat(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  {paymentMode && <span className="payment-mode-pill">{paymentMode}</span>}
                </div>
              </div>

              {/* 4. Reason Options & Custom Reason */}
              <div className="revert-detail-box">
                <label className="box-label" htmlFor="reason-select"><i className="fas fa-comment-alt"></i> Reason for Reversal</label>
                <select
                  id="reason-select"
                  className="revert-select"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  disabled={submitting}
                >
                  {REASON_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>

                {selectedReason === 'Other' && (
                  <textarea
                    rows={2}
                    className="revert-textarea"
                    placeholder="Enter custom reason..."
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    disabled={submitting}
                    required
                  />
                )}
              </div>

              {/* 5. System Action Consequences & Business Rule Warning */}
              <div className="revert-consequences-box">
                <div className="consequences-header">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>System Action Consequences Warning</span>
                </div>
                <ul className="consequences-list">
                  
                  <li>
                    <i className="fas fa-user-slash"></i>
                    <span>Subscription is <strong>DEACTIVATED</strong> & associated wallet credits <strong>REVOKED</strong>.</span>
                  </li>
                  <li>
                    <i className="fas fa-sitemap"></i>
                    <span>If no active Base Membership remains, dependent <strong>PT & Add-On plans</strong> will also be automatically <strong>DEACTIVATED</strong>.</span>
                  </li>
                  <li>
                    <i className="fas fa-calendar-alt"></i>
                    <span>If future stacked renewals exist, the earliest renewal will automatically shift to start <strong>TODAY</strong> to prevent access lockout.</span>
                  </li>
                </ul>
              </div>

              {/* Response Alerts */}
              {errorMsg && (
                <div className="revert-alert alert-error">
                  <i className="fas fa-exclamation-circle"></i> {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="revert-alert alert-success">
                  <i className="fas fa-check-circle"></i> {successMsg}
                </div>
              )}

              {/* Actions */}
              <div className="revert-modal-footer">
                <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-confirm" disabled={submitting || !isEligible}>
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                  ) : (
                    <><i className="fas fa-undo-alt"></i> Confirm Reversal</>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevertSubscriptionModal;
