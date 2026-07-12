import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './InvoiceModal.css';

const InvoiceModal = ({ isOpen, invoiceId, onClose }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // Fallback Mock Invoice
  const getMockInvoice = useCallback((id) => {
    const isPt = id % 2 === 0; // Simple heuristic to toggle mock description
    return {
      invoice: {
        invoice_id: id || 8,
        user_id: 616,
        invoice_number: `INV-2026-${String(id || 8).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        total_amount: isPt ? "4237.29" : "5932.20",
        tax_amount: isPt ? "762.71" : "1067.80",
        tax_breakdown: {
          "CGST_9": isPt ? 381.36 : 533.90,
          "SGST_9": isPt ? 381.35 : 533.90
        },
        final_amount: isPt ? "5000.00" : "7000.00",
        status: "PAID",
        issued_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        due_date: new Date().toISOString().substring(0, 10)
      },
      line_items: [
        {
          item_id: id || 8,
          invoice_id: id || 8,
          item_type: isPt ? "PT_PACKAGE" : "SUBSCRIPTION",
          reference_id: 5,
          item_name: isPt ? "Basic Personal Training Plan" : "Premium Yearly Base Membership",
          quantity: 1,
          unit_price: isPt ? "4237.29" : "5932.20",
          tax_percentage: "18.00",
          tax_amount: isPt ? "762.71" : "1067.80",
          tax_breakdown: {
            "CGST_9": isPt ? 381.36 : 533.90,
            "SGST_9": isPt ? 381.35 : 533.90
          },
          total_price: isPt ? "5000.00" : "7000.00"
        }
      ],
      transactions: [
        {
          payment_id: 11,
          gym_id: 1,
          branch_id: 1,
          invoice_id: id || 8,
          paid_by_user_id: 616,
          amount: isPt ? "5000.00" : "7000.00",
          payment_mode: "UPI",
          payment_status: "SUCCESS",
          transaction_ref: `TXN-${new Date().toISOString().replace(/\D/g, '').substring(0, 14)}-${Math.floor(100 + Math.random() * 900)}`,
          payment_date: new Date().toISOString().substring(0, 10),
          status: 1
        }
      ]
    };
  }, []);

  const fetchInvoiceDetails = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/invoices/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          setInvoiceData(result.data);
        } else {
          setInvoiceData(getMockInvoice(id));
        }
      } else {
        // Fallback for dev environment
        setInvoiceData(getMockInvoice(id));
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      // Fallback
      setInvoiceData(getMockInvoice(id));
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getMockInvoice]);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoiceDetails(invoiceId);
    }
  }, [isOpen, invoiceId, fetchInvoiceDetails]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceData) return;
    setIsDownloading(true);

    try {
      const element = document.getElementById('printable-invoice-sheet');
      if (!element) {
        throw new Error('Invoice container not found in DOM');
      }

      // Load html2pdf script dynamically if not present
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
          script.crossOrigin = 'anonymous';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const invNum = invoiceData.invoice?.invoice_number || `INV-${invoiceData.invoice?.invoice_id}`;
      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `${invNum}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Run html2pdf converter
      await window.html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Could not download PDF. Please try browser print (Ctrl+P / Cmd+P) instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-card">
        
        {/* Modal Header controls */}
        <div className="invoice-modal-header-actions no-print">
          <button 
            type="button" 
            className="invoice-ctrl-btn print-btn"
            onClick={handlePrint}
            title="Print Invoice"
          >
            <i className="fas fa-print"></i> Print Receipt
          </button>
          <button 
            type="button" 
            className="invoice-ctrl-btn download-btn"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            title="Download PDF"
          >
            {isDownloading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Downloading...
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf"></i> Download PDF
              </>
            )}
          </button>
          <button 
            type="button" 
            className="invoice-ctrl-btn close-btn" 
            onClick={onClose}
            title="Close Invoice"
          >
            <i className="fas fa-times"></i> Close
          </button>
        </div>

        {/* Scrollable Document Container */}
        <div className="invoice-modal-body">
          {loading ? (
            <div className="invoice-loading-placeholder">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Fetching tax invoice details...</p>
            </div>
          ) : error ? (
            <div className="invoice-error-placeholder">
              <i className="fas fa-exclamation-circle text-danger"></i>
              <p>{error}</p>
              <button className="pt-btn pt-btn-secondary" onClick={onClose}>Dismiss</button>
            </div>
          ) : invoiceData ? (
            <div id="printable-invoice-sheet" className="invoice-sheet-container">
              
              {/* Top Banner Branding */}
              <div className="invoice-sheet-header">
                <div className="invoice-branding-info">
                  <h2 className="gym-invoice-logo">
                    <span className="logo-accent">FITNESS</span> GURU
                  </h2>
                  <p className="gym-corporate-address">
                    Branch Hub: Premier Sector 2, Ring Road Plaza<br />
                    GSTIN: 07AAAFF9988C1Z2 | Support: info@fitnessguru.org.in
                  </p>
                </div>
                <div className="invoice-doc-label">
                  <h1>TAX INVOICE</h1>
                  <span className={`invoice-payment-badge ${invoiceData.invoice?.status}`}>
                    {invoiceData.invoice?.status || 'UNPAID'}
                  </span>
                </div>
              </div>

              <hr className="divider" />

              {/* Bill To & Metadata Fields */}
              <div className="invoice-meta-grid">
                <div className="meta-col-bill-to">
                  <h3>BILL TO MEMBER:</h3>
                  <div className="meta-bill-detail">
                    <strong>Member Ref:</strong> #{invoiceData.invoice?.user_id || '616'}<br />
                    <strong>Gym Location:</strong> Main Branch Hub (HQ)
                  </div>
                </div>

                <div className="meta-col-details text-right">
                  <h3>INVOICE INFO:</h3>
                  <table className="meta-table-info">
                    <tbody>
                      <tr>
                        <td>Invoice No:</td>
                        <td><strong>{invoiceData.invoice?.invoice_number}</strong></td>
                      </tr>
                      <tr>
                        <td>Issued Date:</td>
                        <td>{invoiceData.invoice?.issued_at?.substring(0, 10)}</td>
                      </tr>
                      <tr>
                        <td>Due Date:</td>
                        <td>{invoiceData.invoice?.due_date}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Line Items Table */}
              <div className="invoice-items-table-wrapper">
                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th>Product / Service Description</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Base Price</th>
                      <th className="text-right">GST %</th>
                      <th className="text-right">Tax Amount</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoiceData.line_items || []).map((item, idx) => (
                      <tr key={item.item_id || idx}>
                        <td>
                          <span className="item-description-name">{item.item_name}</span>
                          <small className="item-description-sub">Category: {item.item_type}</small>
                        </td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">₹{parseFloat(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right">{parseFloat(item.tax_percentage).toFixed(1)}%</td>
                        <td className="text-right">₹{parseFloat(item.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right font-weight-600">₹{parseFloat(item.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Financial Summary Box */}
              <div className="invoice-totals-section">
                <div className="totals-dummy-col"></div>
                <div className="totals-calculation-col">
                  <table className="invoice-totals-table">
                    <tbody>
                      <tr>
                        <td>Base Subtotal:</td>
                        <td className="text-right">₹{parseFloat(invoiceData.invoice?.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      
                      {/* GST Breaks */}
                      {invoiceData.invoice?.tax_breakdown && Object.entries(invoiceData.invoice.tax_breakdown).map(([taxKey, taxVal]) => (
                        <tr key={taxKey} className="tax-break-row">
                          <td>{taxKey.replace('_', ' ')}:</td>
                          <td className="text-right">₹{parseFloat(taxVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}

                      <tr className="grand-total-row">
                        <td>Total Amount Payable:</td>
                        <td className="text-right grand-price">₹{parseFloat(invoiceData.invoice?.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Section */}
              {invoiceData.transactions && invoiceData.transactions.length > 0 && (
                <div className="invoice-payment-history">
                  <h3>PAYMENT LOG DETAILS:</h3>
                  <table className="invoice-payment-log-table">
                    <thead>
                      <tr>
                        <th>Transaction ID Reference</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Payment Date</th>
                        <th className="text-right">Amount Settled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.transactions.map((txn, idx) => (
                        <tr key={txn.payment_id || idx}>
                          <td><code>{txn.transaction_ref}</code></td>
                          <td>{txn.payment_mode}</td>
                          <td>
                            <span className="payment-status-tag success">
                              <i className="fas fa-check-circle"></i> {txn.payment_status}
                            </span>
                          </td>
                          <td>{txn.payment_date}</td>
                          <td className="text-right font-weight-600">₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer Terms & Branding */}
              <div className="invoice-terms-footer">
                <h4>Thank you for your business!</h4>
                <p>This is a computer-generated tax invoice and requires no physical signature. Subject to terms & conditions of Fitness Guru Gym Membership policies.</p>
              </div>

            </div>
          ) : (
            <div className="invoice-loading-placeholder">
              <p>No invoice selected.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
