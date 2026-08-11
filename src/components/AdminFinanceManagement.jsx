import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';
import RevertSubscriptionModal from './RevertSubscriptionModal';
import './AdminFinanceManagement.css';

const AdminFinanceManagement = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read tab from query parameters, default to 'summary'
    const activeTab = searchParams.get('tab') || 'summary';
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Global Context filters
    const [branchId, setBranchId] = useState('');
    const [branches, setBranches] = useState([]);
    
    // --- EXECUTIVE P&L STATE ---
    const getInitialDates = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0);
        const pad = (n) => String(n).padStart(2, '0');
        return {
            start: `${y}-${pad(m + 1)}-01`,
            end: `${y}-${pad(m + 1)}-${pad(end.getDate())}`
        };
    };

    const initialDates = getInitialDates();
    const [plPeriod, setPlPeriod] = useState({ start_date: initialDates.start, end_date: initialDates.end, branch_id: '' });
    const [plRevenue, setPlRevenue] = useState({
        membership_and_pt_sales: "0.00",
        store_product_sales: "0.00",
        adjustments_inflow: "0.00",
        gross_revenue: "0.00"
    });
    const [plExpense, setPlExpense] = useState({
        cogs_inventory_procurement: "0.00",
        staff_and_trainer_payroll: "0.00",
        operating_expenses_opex: "0.00",
        refunds_issued: "0.00",
        adjustments_outflow: "0.00",
        total_expenses: "0.00"
    });
    const [plNet, setPlNet] = useState({
        net_operating_profit: "0.00",
        profit_margin_percentage: "0.00"
    });
    const [plDateShortcut, setPlDateShortcut] = useState('current_month');
    const [plStartDate, setPlStartDate] = useState(initialDates.start);
    const [plEndDate, setPlEndDate] = useState(initialDates.end);


    // --- OPEX STATE ---
    const [opexList, setOpexList] = useState([]);
    const [opexPagination, setOpexPagination] = useState({ current_page: 1, limit: 20, total_records: 0, total_pages: 1 });
    const [opexMetrics, setOpexMetrics] = useState({ filtered_total_opex_amount: "0.00" });
    const [opexFilters, setOpexFilters] = useState({
        category_tag: '',
        time_frame: 'current_month',
        start_date: '',
        end_date: '',
        vendor_name: '',
        page: 1,
        limit: 20
    });

    // OpEx Modals
    const [logExpenseOpen, setLogExpenseOpen] = useState(false);
    const [logExpensePayload, setLogExpensePayload] = useState({
        title: '',
        category_tag: 'RENT',
        amount: '',
        payment_method: 'UPI',
        vendor_name: '',
        receipt_ref: '',
        receipt_url: '',
        expense_date: new Date().toISOString().split('T')[0],
        branch_id: ''
    });
    const [receiptFilePreview, setReceiptFilePreview] = useState(null);

    const [cancelExpenseOpen, setCancelExpenseOpen] = useState(false);
    const [selectedOpexToCancel, setSelectedOpexToCancel] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');

    // --- MASTER LEDGER STATE ---
    const [ledgerList, setLedgerList] = useState([]);
    const [ledgerPagination, setLedgerPagination] = useState({ current_page: 1, limit: 50, total_records: 0, total_pages: 1 });
    const [ledgerMetrics, setLedgerMetrics] = useState({
        period_total_inflow: "0.00",
        period_total_outflow: "0.00",
        period_net_cashflow: "0.00"
    });
    const [ledgerFilters, setLedgerFilters] = useState({
        transaction_type: '', // '', 'INFLOW', 'OUTFLOW'
        category: '', // '', 'REVENUE', 'COGS', 'PAYROLL', 'OPEX', 'REFUND', 'ADJUSTMENT'
        payment_method: '',
        start_date: '',
        end_date: '',
        page: 1,
        limit: 50
    });

    // Ledger Manual Adjustment Modal
    const [ledgerAdjustmentOpen, setLedgerAdjustmentOpen] = useState(false);
    const [adjustmentPayload, setAdjustmentPayload] = useState({
        transaction_type: 'OUTFLOW',
        amount: '',
        payment_method: 'CASH',
        description: '',
        branch_id: ''
    });

    // 24-Hour Purchase Reversal Modal State
    const [showRevertSubModal, setShowRevertSubModal] = useState(false);

    // Fetch branches list on mount
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/gym-branches`);
                if (res.ok) {
                    const data = await res.json();
                    setBranches(data.data || data || []);
                }
            } catch (err) {
                console.error("Failed to load branches dropdown option:", err);
                setBranches([]);
            }
        };
        fetchBranches();
    }, [API_BASE_URL]);

    // Format currency to INR style
    const formatCurrency = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Tab switcher
    const handleTabClick = (tab) => {
        setSearchParams({ tab });
        setError(null);
    };

    // --- API 1: FETCH EXECUTIVE SUMMARY ---
    const fetchSummary = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (plStartDate) params.append('start_date', plStartDate);
        if (plEndDate) params.append('end_date', plEndDate);
        if (branchId) params.append('branch_id', branchId);

        try {
            const url = `${API_BASE_URL}/api/admin/finance/summary?${params.toString()}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });

            if (res.ok) {
                const result = await res.json();
                if (result.status === 'success') {
                    setPlPeriod(result.data.period || { start_date: plStartDate, end_date: plEndDate, branch_id: branchId });
                    setPlRevenue(result.data.revenue_breakdown || {});
                    setPlExpense(result.data.expense_breakdown || {});
                    setPlNet(result.data.net_position || {});
                } else {
                    throw new Error(result.message || 'Failed to load executive summary');
                }
            } else {
                throw new Error(`API returned HTTP ${res.status}`);
            }
        } catch (err) {
            console.error("Error fetching P&L summary:", err);
            setError("Financial Executive Summary is currently unavailable due to network connection failure.");
            setPlRevenue({
                membership_and_pt_sales: "0.00",
                store_product_sales: "0.00",
                adjustments_inflow: "0.00",
                gross_revenue: "0.00"
            });
            setPlExpense({
                cogs_inventory_procurement: "0.00",
                staff_and_trainer_payroll: "0.00",
                operating_expenses_opex: "0.00",
                refunds_issued: "0.00",
                adjustments_outflow: "0.00",
                total_expenses: "0.00"
            });
            setPlNet({
                net_operating_profit: "0.00",
                profit_margin_percentage: "0.00"
            });
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, branchId, plStartDate, plEndDate]);

    // Handle date shortcuts for P&L Summary
    const handleShortcutChange = (e) => {
        const shortcut = e.target.value;
        setPlDateShortcut(shortcut);

        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const pad = (n) => String(n).padStart(2, '0');

        if (shortcut === 'current_month') {
            const end = new Date(y, m + 1, 0);
            setPlStartDate(`${y}-${pad(m + 1)}-01`);
            setPlEndDate(`${y}-${pad(m + 1)}-${pad(end.getDate())}`);
        } else if (shortcut === 'previous_month') {
            const prevMonthDate = new Date(y, m - 1, 1);
            const py = prevMonthDate.getFullYear();
            const pm = prevMonthDate.getMonth();
            const end = new Date(py, pm + 1, 0);
            setPlStartDate(`${py}-${pad(pm + 1)}-01`);
            setPlEndDate(`${py}-${pad(pm + 1)}-${pad(end.getDate())}`);
        } else if (shortcut === 'last_3_months') {
            const start3 = new Date(y, m - 2, 1);
            const py = start3.getFullYear();
            const pm = start3.getMonth();
            const end = new Date(y, m + 1, 0);
            setPlStartDate(`${py}-${pad(pm + 1)}-01`);
            setPlEndDate(`${y}-${pad(m + 1)}-${pad(end.getDate())}`);
        }
    };


    // --- API 2: FETCH OPEX LOGS ---
    const fetchOpex = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (opexFilters.category_tag) params.append('category_tag', opexFilters.category_tag);
        if (opexFilters.time_frame) params.append('time_frame', opexFilters.time_frame);
        if (opexFilters.start_date) params.append('start_date', opexFilters.start_date);
        if (opexFilters.end_date) params.append('end_date', opexFilters.end_date);
        if (opexFilters.vendor_name) params.append('vendor_name', opexFilters.vendor_name);
        if (branchId) params.append('branch_id', branchId);
        params.append('page', opexFilters.page.toString());
        params.append('limit', opexFilters.limit.toString());

        try {
            const url = `${API_BASE_URL}/api/admin/opex?${params.toString()}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });

            if (res.ok) {
                const result = await res.json();
                if (result.status === 'success') {
                    setOpexList(result.data.expenses || []);
                    setOpexPagination(result.data.pagination || { current_page: 1, limit: 20, total_records: 0, total_pages: 1 });
                    setOpexMetrics(result.data.summary_metrics || { filtered_total_opex_amount: "0.00" });
                } else {
                    throw new Error(result.message || 'Failed to fetch operating expenses');
                }
            } else {
                throw new Error(`API HTTP ${res.status}`);
            }
        } catch (err) {
            console.error("Error fetching opex logs:", err);
            setError("Operational Expenses list is currently unavailable due to network connection failure.");
            setOpexList([]);
            setOpexMetrics({ filtered_total_opex_amount: "0.00" });
            setOpexPagination({ current_page: 1, limit: 20, total_records: 0, total_pages: 1 });
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, branchId, opexFilters]);

    // Handle OpEx Filters changes
    const handleOpexFilterChange = (e) => {
        const { name, value } = e.target;
        setOpexFilters(prev => ({
            ...prev,
            [name]: value,
            // Clear explicit dates if timeframe shortcut is changed
            start_date: name === 'time_frame' && value !== '' ? '' : prev.start_date,
            end_date: name === 'time_frame' && value !== '' ? '' : prev.end_date,
            time_frame: (name === 'start_date' || name === 'end_date') && value !== '' ? '' : prev.time_frame,
            page: 1
        }));
    };

    // --- API 3: LOG OPERATING EXPENSE ---
    const handleLogExpenseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...logExpensePayload,
            amount: parseFloat(logExpensePayload.amount),
            branch_id: parseInt(logExpensePayload.branch_id) || parseInt(branchId) || 1
        };

        try {
            const url = `${API_BASE_URL}/api/admin/opex/log`;
            const res = await tokenManager.apiCall(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setLogExpenseOpen(false);
                fetchOpex(); // reload list
                setLogExpensePayload({
                    title: '',
                    category_tag: 'RENT',
                    amount: '',
                    payment_method: 'UPI',
                    vendor_name: '',
                    receipt_ref: '',
                    receipt_url: '',
                    expense_date: new Date().toISOString().split('T')[0],
                    branch_id: ''
                });
                setReceiptFilePreview(null);
            } else {
                throw new Error(data.message || 'Failed to log operating expense');
            }
        } catch (err) {
            console.error("Log opex failed:", err);
            setError("Failed to record Operating Expense: Service is currently unavailable due to network connection failure.");
        } finally {
            setLoading(false);
        }
    };

    // --- API 4: CANCEL / VOID EXPENSE ---
    const handleCancelExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOpexToCancel) return;

        setLoading(true);
        setError(null);

        try {
            const url = `${API_BASE_URL}/api/admin/opex/${selectedOpexToCancel.opex_id}/cancel`;
            const res = await tokenManager.apiCall(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cancellation_reason: cancellationReason })
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setCancelExpenseOpen(false);
                setSelectedOpexToCancel(null);
                setCancellationReason('');
                fetchOpex();
            } else {
                throw new Error(data.message || 'Failed to cancel operating expense');
            }
        } catch (err) {
            console.error("Void opex failed:", err);
            setError("Failed to void Operating Expense: Service is currently unavailable due to network connection failure.");
        } finally {
            setLoading(false);
        }
    };

    // --- API 5: FETCH MASTER FINANCIAL LEDGER ---
    const fetchLedger = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (ledgerFilters.transaction_type) params.append('transaction_type', ledgerFilters.transaction_type);
        if (ledgerFilters.category) params.append('category', ledgerFilters.category);
        if (ledgerFilters.payment_method) params.append('payment_method', ledgerFilters.payment_method);
        if (ledgerFilters.start_date) params.append('start_date', ledgerFilters.start_date);
        if (ledgerFilters.end_date) params.append('end_date', ledgerFilters.end_date);
        if (branchId) params.append('branch_id', branchId);
        params.append('page', ledgerFilters.page.toString());
        params.append('limit', ledgerFilters.limit.toString());

        try {
            const url = `${API_BASE_URL}/api/admin/finance/ledger?${params.toString()}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });

            if (res.ok) {
                const result = await res.json();
                if (result.status === 'success') {
                    setLedgerList(result.data.ledger_entries || []);
                    setLedgerPagination(result.data.pagination || { current_page: 1, limit: 50, total_records: 0, total_pages: 1 });
                    setLedgerMetrics(result.data.summary_metrics || {
                        period_total_inflow: "0.00",
                        period_total_outflow: "0.00",
                        period_net_cashflow: "0.00"
                    });
                } else {
                    throw new Error(result.message || 'Failed to fetch financial ledger');
                }
            } else {
                throw new Error(`API HTTP ${res.status}`);
            }
        } catch (err) {
            console.error("Error fetching financial ledger:", err);
            setError("Financial Ledger audit logs are currently unavailable due to network connection failure.");
            setLedgerList([]);
            setLedgerMetrics({
                period_total_inflow: "0.00",
                period_total_outflow: "0.00",
                period_net_cashflow: "0.00"
            });
            setLedgerPagination({ current_page: 1, limit: 50, total_records: 0, total_pages: 1 });
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, branchId, ledgerFilters]);

    // Handle ledger filter adjustments
    const handleLedgerFilterChange = (name, value) => {
        setLedgerFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1
        }));
    };

    // --- API 6: LOG MANUAL ADJUSTMENT ---
    const handleAdjustmentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...adjustmentPayload,
            amount: parseFloat(adjustmentPayload.amount),
            branch_id: parseInt(adjustmentPayload.branch_id) || parseInt(branchId) || 1
        };

        try {
            const url = `${API_BASE_URL}/api/admin/finance/ledger/adjust`;
            const res = await tokenManager.apiCall(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setLedgerAdjustmentOpen(false);
                fetchLedger(); // refresh list
                setAdjustmentPayload({
                    transaction_type: 'OUTFLOW',
                    amount: '',
                    payment_method: 'CASH',
                    description: '',
                    branch_id: ''
                });
            } else {
                throw new Error(data.message || 'Adjustment creation failed');
            }
        } catch (err) {
            console.error("Manual adjustment failed:", err);
            setError("Failed to execute manual financial adjustment: Service is currently unavailable due to network connection failure.");
        } finally {
            setLoading(false);
        }
    };

    // Load data based on Active Tab
    useEffect(() => {
        if (activeTab === 'summary') {
            fetchSummary();
        } else if (activeTab === 'opex') {
            fetchOpex();
        } else if (activeTab === 'ledger') {
            fetchLedger();
        }
    }, [activeTab, fetchSummary, fetchOpex, fetchLedger]);

    // Handle CSV Exports
    const exportLedgerToCSV = () => {
        if (ledgerList.length === 0) return alert('No ledger entries available to export.');

        // CSV headers
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Ledger ID,Timestamp,Direction,Category,Description,Payment Mode,Amount\n";

        // Add records
        ledgerList.forEach(l => {
            const flowSymbol = l.transaction_type === 'INFLOW' ? '+' : '-';
            const row = [
                `#${l.ledger_id}`,
                `"${l.created_at}"`,
                l.transaction_type,
                l.category,
                `"${l.description.replace(/"/g, '""')}"`,
                l.payment_method,
                `"${flowSymbol}₹${parseFloat(l.amount).toFixed(2)}"`
            ];
            csvContent += row.join(",") + "\n";
        });

        // Trigger file download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ledger_export_branch_${branchId || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // File input change for receipts
    const handleReceiptFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFilePreview(file.name);
            setLogExpensePayload(prev => ({
                ...prev,
                receipt_url: `https://api.yourgym.com/uploads/opex/${file.name}`
            }));
        }
    };

    return (
        <div className="finance-management-container">
            {/* Top Bar Context Controls */}
            <div className="finance-header">
                <div className="finance-title-section">
                    <h1>Finance & Accounting Dashboard</h1>
                    <p>Review business operational summaries, analyze profit breakdown, log operating bills, and verify immutable ledger audits.</p>
                </div>

                <div className="finance-global-controls">
                    <select 
                        className="finance-select"
                        value={branchId}
                        onChange={e => {
                            setBranchId(e.target.value);
                            setOpexFilters(prev => ({ ...prev, page: 1 }));
                            setLedgerFilters(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">All Branches (HQ Aggregate)</option>
                        {branches.map(b => (
                            <option key={b.branch_id} value={b.branch_id}>{b.branch_name || `Branch #${b.branch_id}`}</option>
                        ))}
                    </select>

                    <button
                        className="finance-btn"
                        onClick={() => setShowRevertSubModal(true)}
                        title="Revert Accidental Subscription Purchase within 24 Hours"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)'
                        }}
                    >
                        <i className="fas fa-undo-alt"></i> Revert 24h Subscription
                    </button>

                    <button 
                        className="finance-btn btn-white"
                        onClick={() => {
                            if (activeTab === 'summary') fetchSummary();
                            else if (activeTab === 'opex') fetchOpex();
                            else if (activeTab === 'ledger') fetchLedger();
                        }}
                        disabled={loading}
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Sync Data
                    </button>
                </div>
            </div>

            {/* Error notice banner */}
            {error && (
                <div className="payroll-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Tab navigation headers */}
            <div className="finance-tabs-nav">
                <button 
                    className={`finance-tab-trigger ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => handleTabClick('summary')}
                >
                    <i className="fas fa-chart-line"></i> Executive P&L Overview
                </button>
                <button 
                    className={`finance-tab-trigger ${activeTab === 'opex' ? 'active' : ''}`}
                    onClick={() => handleTabClick('opex')}
                >
                    <i className="fas fa-file-invoice"></i> Operating Expenses (OpEx)
                </button>
                <button 
                    className={`finance-tab-trigger ${activeTab === 'ledger' ? 'active' : ''}`}
                    onClick={() => handleTabClick('ledger')}
                >
                    <i className="fas fa-university"></i> Master Ledger Audit
                </button>
            </div>

            {/* --- TAB 1: EXECUTIVE FINANCIAL OVERVIEW --- */}
            {activeTab === 'summary' && (
                <>
                    {/* Time Frame Controls for overview */}
                    <div className="finance-toolbar">
                        <div className="toolbar-filters">
                            <div className="filter-group" style={{minWidth: '150px'}}>
                                <label style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block'}}>Date Shortcut</label>
                                <select 
                                    className="finance-select"
                                    style={{width: '100%', padding: '0.45rem 0.75rem'}}
                                    value={plDateShortcut}
                                    onChange={handleShortcutChange}
                                >
                                    <option value="current_month">Current Month (July 2026)</option>
                                    <option value="previous_month">Previous Month (June 2026)</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="">Custom Date Range</option>
                                </select>
                            </div>

                            {plDateShortcut === '' && (
                                <>
                                    <div className="filter-group" style={{minWidth: '140px'}}>
                                        <label style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block'}}>Start Date</label>
                                        <input 
                                            type="date" 
                                            className="toolbar-search-input" 
                                            style={{padding: '0.4rem 0.6rem'}}
                                            value={plStartDate}
                                            onChange={e => setPlStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="filter-group" style={{minWidth: '140px'}}>
                                        <label style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block'}}>End Date</label>
                                        <input 
                                            type="date" 
                                            className="toolbar-search-input" 
                                            style={{padding: '0.4rem 0.6rem'}}
                                            value={plEndDate}
                                            onChange={e => setPlEndDate(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="finance-global-controls">
                            <button className="finance-btn btn-indigo" onClick={() => setLogExpenseOpen(true)}>
                                <i className="fas fa-plus"></i> Log Expense
                            </button>
                            <button className="finance-btn btn-emerald" onClick={() => setLedgerAdjustmentOpen(true)}>
                                <i className="fas fa-sliders-h"></i> Manual Adjustment
                            </button>
                        </div>
                    </div>

                    {/* Executive Top Cards */}
                    <div className="finance-metrics-row">
                        <div className="finance-metric-card">
                            <div className="metric-stripe green"></div>
                            <div className="metric-icon-wrap green">
                                <i className="fas fa-hand-holding-usd"></i>
                            </div>
                            <div className="metric-meta">
                                <span className="metric-title">Gross Revenue</span>
                                <span className="metric-amount" style={{color: '#10b981'}}>
                                    {formatCurrency(plRevenue.gross_revenue)}
                                </span>
                            </div>
                        </div>

                        <div className="finance-metric-card">
                            <div className="metric-stripe red"></div>
                            <div className="metric-icon-wrap red">
                                <i className="fas fa-file-invoice-dollar"></i>
                            </div>
                            <div className="metric-meta">
                                <span className="metric-title">Total Expenses</span>
                                <span className="metric-amount" style={{color: '#ef4444'}}>
                                    {formatCurrency(plExpense.total_expenses)}
                                </span>
                            </div>
                        </div>

                        <div className="finance-metric-card">
                            <div className="metric-stripe blue"></div>
                            <div className="metric-icon-wrap blue">
                                <i className="fas fa-award"></i>
                            </div>
                            <div className="metric-meta">
                                <span className="metric-title">Net Operating Profit</span>
                                <span className="metric-amount">
                                    {formatCurrency(plNet.net_operating_profit)}
                                    <span className="margin-badge">
                                        Margin: {plNet.profit_margin_percentage}%
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Visual Charts */}
                    <div className="finance-charts-grid">
                        <div className="chart-card">
                            <div className="chart-card-header">
                                <div>
                                    <h3>Revenue Streams Breakdown</h3>
                                    <span className="chart-subtitle">Direct distribution of positive gym incoming cash flows</span>
                                </div>
                            </div>
                            <div className="bar-chart-list">
                                <div className="chart-row">
                                    <div className="chart-row-labels">
                                        <span className="chart-label-name">Membership Plans & PT Package Sales</span>
                                        <span className="chart-label-value">{formatCurrency(plRevenue.membership_and_pt_sales)}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill indigo" style={{ 
                                            width: `${parseFloat(plRevenue.gross_revenue) > 0 ? (parseFloat(plRevenue.membership_and_pt_sales) / parseFloat(plRevenue.gross_revenue)) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-row-labels">
                                        <span className="chart-label-name">Store Product Sales (POS)</span>
                                        <span className="chart-label-value">{formatCurrency(plRevenue.store_product_sales)}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill cyan" style={{ 
                                            width: `${parseFloat(plRevenue.gross_revenue) > 0 ? (parseFloat(plRevenue.store_product_sales) / parseFloat(plRevenue.gross_revenue)) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-row-labels">
                                        <span className="chart-label-name">Inflow Adjustments</span>
                                        <span className="chart-label-value">{formatCurrency(plRevenue.adjustments_inflow)}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill emerald" style={{ 
                                            width: `${parseFloat(plRevenue.gross_revenue) > 0 ? (parseFloat(plRevenue.adjustments_inflow) / parseFloat(plRevenue.gross_revenue)) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-card-header">
                                <div>
                                    <h3>Operational Expense Breakdown</h3>
                                    <span className="chart-subtitle">Division of company cash outflows across categories</span>
                                </div>
                            </div>
                            <div className="bar-chart-list">
                                <div className="chart-row">
                                    <div className="chart-row-labels">
                                        <span className="chart-label-name">Staff & Trainer Payroll Distributions</span>
                                        <span className="chart-label-value">{formatCurrency(plExpense.staff_and_trainer_payroll)}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill rose" style={{ 
                                            width: `${parseFloat(plExpense.total_expenses) > 0 ? (parseFloat(plExpense.staff_and_trainer_payroll) / parseFloat(plExpense.total_expenses)) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-row-labels">
                                        <span className="chart-label-name">Inventory restock procurement (COGS)</span>
                                        <span className="chart-label-value">{formatCurrency(plExpense.cogs_inventory_procurement)}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill amber" style={{ 
                                            width: `${parseFloat(plExpense.total_expenses) > 0 ? (parseFloat(plExpense.cogs_inventory_procurement) / parseFloat(plExpense.total_expenses)) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-row-labels">
                                        <span className="chart-label-name">Operating Expenses (OpEx bills)</span>
                                        <span className="chart-label-value">{formatCurrency(plExpense.operating_expenses_opex)}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill violet" style={{ 
                                            width: `${parseFloat(plExpense.total_expenses) > 0 ? (parseFloat(plExpense.operating_expenses_opex) / parseFloat(plExpense.total_expenses)) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-row-labels">
                                        <span className="chart-label-name">Refunds & Outflow Adjustments</span>
                                        <span className="chart-label-value">{formatCurrency(parseFloat(plExpense.refunds_issued) + parseFloat(plExpense.adjustments_outflow))}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill emerald" style={{ 
                                            width: `${parseFloat(plExpense.total_expenses) > 0 ? ((parseFloat(plExpense.refunds_issued) + parseFloat(plExpense.adjustments_outflow)) / parseFloat(plExpense.total_expenses)) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* --- TAB 2: OPERATING EXPENSES (OPEX) --- */}
            {activeTab === 'opex' && (
                <>
                    {/* Dynamic total highlight banner */}
                    <div className="slim-metric-banner">
                        <i className="fas fa-calculator"></i>
                        <span>Filtered total Operational Expenses:</span>
                        <span className="amount">{formatCurrency(opexMetrics.filtered_total_opex_amount)}</span>
                    </div>

                    {/* Filter controls toolbar */}
                    <div className="finance-toolbar">
                        <div className="toolbar-filters">
                            <div className="filter-group" style={{minWidth: '130px'}}>
                                <select 
                                    name="time_frame" 
                                    value={opexFilters.time_frame} 
                                    onChange={handleOpexFilterChange}
                                    className="finance-select"
                                    style={{width: '100%'}}
                                >
                                    <option value="current_month">Current Month</option>
                                    <option value="previous_month">Previous Month</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="all">All Dates</option>
                                    <option value="">Custom dates</option>
                                </select>
                            </div>

                            {opexFilters.time_frame === '' && (
                                <>
                                    <input 
                                        type="date" 
                                        name="start_date" 
                                        value={opexFilters.start_date} 
                                        onChange={handleOpexFilterChange}
                                        className="toolbar-search-input" 
                                        style={{width: '135px', padding: '0.45rem 0.65rem'}}
                                    />
                                    <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>to</span>
                                    <input 
                                        type="date" 
                                        name="end_date" 
                                        value={opexFilters.end_date} 
                                        onChange={handleOpexFilterChange}
                                        className="toolbar-search-input" 
                                        style={{width: '135px', padding: '0.45rem 0.65rem'}}
                                    />
                                </>
                            )}

                            <div className="toolbar-search">
                                <i className="fas fa-search"></i>
                                <input 
                                    type="text" 
                                    name="vendor_name"
                                    value={opexFilters.vendor_name}
                                    onChange={handleOpexFilterChange}
                                    placeholder="Search by vendor name..." 
                                    className="toolbar-search-input"
                                />
                            </div>
                        </div>

                        <button className="finance-btn btn-indigo" onClick={() => setLogExpenseOpen(true)}>
                            <i className="fas fa-plus"></i> Log New Expense
                        </button>
                    </div>

                    {/* Category tag filter pills */}
                    <div className="category-pills-row">
                        {[
                            { tag: '', display: 'All Categories' },
                            { tag: 'RENT', display: 'Rent' },
                            { tag: 'UTILITIES', display: 'Utilities' },
                            { tag: 'MAINTENANCE', display: 'Maintenance' },
                            { tag: 'MARKETING', display: 'Marketing' },
                            { tag: 'SUPPLIES', display: 'Supplies' },
                            { tag: 'OTHER', display: 'Other Bills' }
                        ].map(c => (
                            <button 
                                key={c.tag}
                                className={`category-pill ${opexFilters.category_tag === c.tag ? 'active' : ''}`}
                                onClick={() => setOpexFilters(prev => ({ ...prev, category_tag: c.tag, page: 1 }))}
                            >
                                {c.display}
                            </button>
                        ))}
                    </div>

                    {/* Table View */}
                    <div className="payroll-table-container">
                        <div className="table-responsive">
                            <table className="payroll-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Expense Details</th>
                                        <th>Category</th>
                                        <th>Payment Mode</th>
                                        <th>Vendor / Ref</th>
                                        <th>Receipt</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9">
                                                <div className="loading-view-wrapper">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    <span>Fetching operational expenses...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : opexList.length === 0 ? (
                                        <tr>
                                            <td colSpan="9">
                                                <div className="empty-view-wrapper">
                                                    <i className="fas fa-folder-open"></i>
                                                    <h3>No opex records found</h3>
                                                    <p>Create a new operating expense entry to populate logs.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        opexList.map(op => (
                                            <tr key={op.opex_id} style={{ opacity: op.status === 'CANCELLED' ? 0.6 : 1 }}>
                                                <td>{op.expense_date}</td>
                                                <td>
                                                    <div className="employee-cell">
                                                        <span className="employee-name">{op.title}</span>
                                                        <span className="employee-phone">Branch ID: {op.branch_id} • ID: #{op.opex_id}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`category-badge ${op.category_tag.toLowerCase()}`}>
                                                        {op.category_tag}
                                                    </span>
                                                </td>
                                                <td>{op.payment_method}</td>
                                                <td>
                                                    <div className="employee-cell">
                                                        <span className="employee-name" style={{fontWeight: 500}}>{op.vendor_name}</span>
                                                        <span className="employee-phone">Ref: {op.receipt_ref || '—'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {op.receipt_url ? (
                                                        <a href={op.receipt_url} target="_blank" rel="noopener noreferrer" className="receipt-link-btn" title="View Receipt">
                                                            <i className="fas fa-paperclip"></i>
                                                        </a>
                                                    ) : <span style={{color: '#94a3b8'}}>—</span>}
                                                </td>
                                                <td style={{fontWeight: 700}}>{formatCurrency(op.amount)}</td>
                                                <td>
                                                    <span className={`status-badge ${op.status === 'ACTIVE' ? 'paid' : 'voided'}`}>
                                                        {op.status}
                                                    </span>
                                                    {op.cancellation_reason && (
                                                        <span style={{display: 'block', fontSize: '0.7rem', color: '#64748b', marginTop: '2px', maxWidth: '160px'}}>
                                                            Reason: {op.cancellation_reason}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {op.status === 'ACTIVE' ? (
                                                        <button 
                                                            className="action-btn"
                                                            style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                                                            onClick={() => {
                                                                setSelectedOpexToCancel(op);
                                                                setCancellationReason('');
                                                                setCancelExpenseOpen(true);
                                                            }}
                                                        >
                                                            <i className="fas fa-ban"></i> Void
                                                        </button>
                                                    ) : <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>Reversed</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        {!loading && opexList.length > 0 && (
                            <div className="payroll-pagination">
                                <div className="pagination-info">
                                    Showing page {opexPagination.current_page} of {opexPagination.total_pages} ({opexPagination.total_records} records)
                                </div>
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn"
                                        disabled={opexPagination.current_page === 1}
                                        onClick={() => setOpexFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </button>
                                    <button 
                                        className="pagination-btn"
                                        disabled={opexPagination.current_page >= opexPagination.total_pages}
                                        onClick={() => setOpexFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* --- TAB 3: MASTER FINANCIAL LEDGER --- */}
            {activeTab === 'ledger' && (
                <>
                    {/* High-level dynamic summary stats banner */}
                    <div className="finance-metrics-row" style={{marginBottom: '1.5rem'}}>
                        <div className="finance-metric-card" style={{padding: '1rem'}}>
                            <div className="metric-icon-wrap green" style={{width: '38px', height: '38px', fontSize: '1rem'}}><i className="fas fa-arrow-down"></i></div>
                            <div className="metric-meta">
                                <span className="metric-title">Period Inflow</span>
                                <span className="metric-amount" style={{color: '#10b981', fontSize: '1.2rem'}}>{formatCurrency(ledgerMetrics.period_total_inflow)}</span>
                            </div>
                        </div>
                        <div className="finance-metric-card" style={{padding: '1rem'}}>
                            <div className="metric-icon-wrap red" style={{width: '38px', height: '38px', fontSize: '1rem'}}><i className="fas fa-arrow-up"></i></div>
                            <div className="metric-meta">
                                <span className="metric-title">Period Outflow</span>
                                <span className="metric-amount" style={{color: '#ef4444', fontSize: '1.2rem'}}>{formatCurrency(ledgerMetrics.period_total_outflow)}</span>
                            </div>
                        </div>
                        <div className="finance-metric-card" style={{padding: '1rem'}}>
                            <div className="metric-icon-wrap blue" style={{width: '38px', height: '38px', fontSize: '1rem'}}><i className="fas fa-balance-scale"></i></div>
                            <div className="metric-meta">
                                <span className="metric-title">Net Cashflow</span>
                                <span className="metric-amount" style={{fontSize: '1.2rem'}}>{formatCurrency(ledgerMetrics.period_net_cashflow)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Advanced filter toolbar */}
                    <div className="finance-toolbar">
                        <div className="toolbar-filters">
                            {/* Direction Inflow/Outflow buttons */}
                            <div className="flow-direction-toggles">
                                <button 
                                    className={`direction-toggle-btn all ${ledgerFilters.transaction_type === '' ? 'active' : ''}`}
                                    onClick={() => handleLedgerFilterChange('transaction_type', '')}
                                >
                                    All Flows
                                </button>
                                <button 
                                    className={`direction-toggle-btn inflow ${ledgerFilters.transaction_type === 'INFLOW' ? 'active' : ''}`}
                                    onClick={() => handleLedgerFilterChange('transaction_type', 'INFLOW')}
                                >
                                    <i className="fas fa-arrow-down"></i> Inflows
                                </button>
                                <button 
                                    className={`direction-toggle-btn outflow ${ledgerFilters.transaction_type === 'OUTFLOW' ? 'active' : ''}`}
                                    onClick={() => handleLedgerFilterChange('transaction_type', 'OUTFLOW')}
                                >
                                    <i className="fas fa-arrow-up"></i> Outflows
                                </button>
                            </div>

                            {/* Bucket select */}
                            <select 
                                className="finance-select"
                                value={ledgerFilters.category}
                                onChange={e => handleLedgerFilterChange('category', e.target.value)}
                            >
                                <option value="">All Buckets (Categories)</option>
                                <option value="REVENUE">Revenue</option>
                                <option value="COGS">COGS (Inventory Cost)</option>
                                <option value="PAYROLL">Payroll Disbursements</option>
                                <option value="OPEX">OpEx Bills</option>
                                <option value="REFUND">Refunds</option>
                                <option value="ADJUSTMENT">Adjustments</option>
                            </select>

                            {/* Payment mode */}
                            <select 
                                className="finance-select"
                                value={ledgerFilters.payment_method}
                                onChange={e => handleLedgerFilterChange('payment_method', e.target.value)}
                            >
                                <option value="">All Payment Modes</option>
                                <option value="CASH">Cash</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="CARD">Card</option>
                            </select>

                            {/* Date ranges */}
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                                <input 
                                    type="date" 
                                    className="toolbar-search-input" 
                                    style={{padding: '0.45rem 0.6rem', width: '135px'}}
                                    value={ledgerFilters.start_date}
                                    onChange={e => handleLedgerFilterChange('start_date', e.target.value)}
                                />
                                <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>to</span>
                                <input 
                                    type="date" 
                                    className="toolbar-search-input" 
                                    style={{padding: '0.45rem 0.6rem', width: '135px'}}
                                    value={ledgerFilters.end_date}
                                    onChange={e => handleLedgerFilterChange('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="finance-global-controls">
                            <button className="finance-btn btn-white" onClick={exportLedgerToCSV} title="Download CSV">
                                <i className="fas fa-file-csv"></i> Export CSV
                            </button>
                            <button className="finance-btn btn-emerald" onClick={() => setLedgerAdjustmentOpen(true)}>
                                <i className="fas fa-plus"></i> Manual Adjustment
                            </button>
                        </div>
                    </div>

                    {/* Immutable table audit logs */}
                    <div className="payroll-table-container">
                        <div className="table-responsive">
                            <table className="payroll-table">
                                <thead>
                                    <tr>
                                        <th>Ledger ID</th>
                                        <th>Timestamp</th>
                                        <th>Flow</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Ref Entity</th>
                                        <th>Payment Mode</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8">
                                                <div className="loading-view-wrapper">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    <span>Analyzing ledger audit trail...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : ledgerList.length === 0 ? (
                                        <tr>
                                            <td colSpan="8">
                                                <div className="empty-view-wrapper">
                                                    <i className="fas fa-folder-open"></i>
                                                    <h3>Ledger logs empty</h3>
                                                    <p>Audit trail has no matched entries. Clear filters to see complete history.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        ledgerList.map(l => (
                                            <tr key={l.ledger_id}>
                                                <td>#{l.ledger_id}</td>
                                                <td>{l.created_at}</td>
                                                <td>
                                                    <span className={`direction-indicator ${l.transaction_type.toLowerCase()}`}>
                                                        {l.transaction_type === 'INFLOW' ? (
                                                            <>
                                                                <i className="fas fa-arrow-alt-circle-down"></i> INFLOW
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-arrow-alt-circle-up"></i> OUTFLOW
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`category-badge ${l.category.toLowerCase()}`}>
                                                        {l.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{l.description}</span>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                                                        Branch ID: {l.branch_id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{l.reference_table.replace('_', ' ')}</span>
                                                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                        Ref ID: #{l.reference_id}
                                                    </span>
                                                </td>
                                                <td>{l.payment_method}</td>
                                                <td>
                                                    <span className={`amount-text ${l.transaction_type.toLowerCase()}`}>
                                                        {l.transaction_type === 'INFLOW' ? '+' : '-'}{formatCurrency(l.amount)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        {!loading && ledgerList.length > 0 && (
                            <div className="payroll-pagination">
                                <div className="pagination-info">
                                    Showing page {ledgerPagination.current_page} of {ledgerPagination.total_pages} ({ledgerPagination.total_records} records)
                                </div>
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn"
                                        disabled={ledgerPagination.current_page === 1}
                                        onClick={() => setLedgerFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </button>
                                    <button 
                                        className="pagination-btn"
                                        disabled={ledgerPagination.current_page >= ledgerPagination.total_pages}
                                        onClick={() => setLedgerFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* --- DIALOG MODAL 1: LOG EXPENSE --- */}
            {logExpenseOpen && (
                <div className="payroll-modal-overlay">
                    <div className="payroll-modal">
                        <div className="payroll-modal-header">
                            <h3>Log New Operating Expense</h3>
                            <button className="close-modal-btn" onClick={() => setLogExpenseOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleLogExpenseSubmit}>
                            <div className="payroll-modal-body">
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Expense Title / Description *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. Monthly Electricity Bill & Backup Generator Fuel"
                                            className="form-input"
                                            value={logExpensePayload.title}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Category Tag *</label>
                                        <select 
                                            className="form-select"
                                            value={logExpensePayload.category_tag}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, category_tag: e.target.value }))}
                                        >
                                            <option value="RENT">Rent</option>
                                            <option value="UTILITIES">Utilities</option>
                                            <option value="MAINTENANCE">Maintenance</option>
                                            <option value="MARKETING">Marketing</option>
                                            <option value="SUPPLIES">Supplies</option>
                                            <option value="OTHER">Other Expense</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Amount (INR) *</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            required 
                                            placeholder="0.00"
                                            className="form-input"
                                            value={logExpensePayload.amount}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, amount: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Payment Method *</label>
                                        <select 
                                            className="form-select"
                                            value={logExpensePayload.payment_method}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, payment_method: e.target.value }))}
                                        >
                                            <option value="UPI">UPI</option>
                                            <option value="CASH">Cash</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                            <option value="CARD">Card</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Expense Date *</label>
                                        <input 
                                            type="date" 
                                            required 
                                            className="form-input"
                                            value={logExpensePayload.expense_date}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, expense_date: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Vendor Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. DHBVN Power Supply"
                                            className="form-input"
                                            value={logExpensePayload.vendor_name}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, vendor_name: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Receipt Reference #</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. ELEC-2026-07"
                                            className="form-input"
                                            value={logExpensePayload.receipt_ref}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, receipt_ref: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Gym Branch *</label>
                                        <select 
                                            className="form-select"
                                            value={logExpensePayload.branch_id}
                                            onChange={e => setLogExpensePayload(prev => ({ ...prev, branch_id: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map(b => (
                                                <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Digital Receipt Photo / Bill</label>
                                        <div className="receipt-dropzone" onClick={() => document.getElementById('receipt-file-input').click()}>
                                            <i className="fas fa-cloud-upload-alt"></i>
                                            <span>Click to browse images or drop receipt PDF here</span>
                                            <input 
                                                id="receipt-file-input"
                                                type="file" 
                                                accept="image/*,application/pdf"
                                                style={{ display: 'none' }}
                                                onChange={handleReceiptFileChange}
                                            />
                                        </div>
                                        {receiptFilePreview && (
                                            <div className="dropzone-preview">
                                                <span><i className="fas fa-file-image"></i> {receiptFilePreview}</span>
                                                <button type="button" onClick={() => setReceiptFilePreview(null)}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="payroll-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setLogExpenseOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Log Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DIALOG MODAL 2: CANCEL OPEX EXPENSE --- */}
            {cancelExpenseOpen && selectedOpexToCancel && (
                <div className="payroll-modal-overlay">
                    <div className="payroll-modal">
                        <div className="payroll-modal-header" style={{ borderBottomColor: '#fee2e2', background: '#fef2f2' }}>
                            <h3 style={{ color: '#b91c1c' }}>Void Operational Expense Bill</h3>
                            <button className="close-modal-btn" onClick={() => setCancelExpenseOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCancelExpenseSubmit}>
                            <div className="payroll-modal-body">
                                <div className="payroll-details-summary" style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#9f1239' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>WARNING: Voiding this opex log cannot be undone.</p>
                                    <div className="summary-row" style={{ borderBottomColor: '#fecdd3' }}>
                                        <span>Title</span>
                                        <span style={{ fontWeight: 600 }}>{selectedOpexToCancel.title}</span>
                                    </div>
                                    <div className="summary-row" style={{ borderBottomColor: '#fecdd3' }}>
                                        <span>Amount</span>
                                        <span style={{ fontWeight: 700 }}>{formatCurrency(selectedOpexToCancel.amount)}</span>
                                    </div>
                                    <div className="summary-row" style={{ borderBottomColor: 'transparent' }}>
                                        <span>Vendor</span>
                                        <span>{selectedOpexToCancel.vendor_name}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Reason for Cancellation *</label>
                                    <textarea 
                                        className="form-textarea"
                                        required
                                        placeholder="Explain the reason for auditing compliance (e.g. Typographical error in bill amount)..."
                                        value={cancellationReason}
                                        onChange={e => setCancellationReason(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="payroll-modal-footer" style={{ background: '#fef2f2' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setCancelExpenseOpen(false)}>
                                    Keep Active
                                </button>
                                <button type="submit" className="btn btn-danger" style={{ backgroundColor: '#ef4444', color: '#ffffff' }} disabled={loading}>
                                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Confirm Void & Settle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DIALOG MODAL 3: MANUAL ADJUSTMENT --- */}
            {ledgerAdjustmentOpen && (
                <div className="payroll-modal-overlay">
                    <div className="payroll-modal">
                        <div className="payroll-modal-header">
                            <h3>Log Manual Accounting Adjustment</h3>
                            <button className="close-modal-btn" onClick={() => setLedgerAdjustmentOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAdjustmentSubmit}>
                            <div className="payroll-modal-body">
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Adjustment Flow Direction *</label>
                                        <div className="adjustment-direction-row">
                                            <label className="adjustment-radio-label inflow">
                                                <input 
                                                    type="radio" 
                                                    name="transaction_type" 
                                                    value="INFLOW"
                                                    checked={adjustmentPayload.transaction_type === 'INFLOW'}
                                                    onChange={e => setAdjustmentPayload(prev => ({ ...prev, transaction_type: e.target.value }))}
                                                />
                                                <i className="fas fa-arrow-down"></i> INFLOW (Add funds / Reconcile surplus)
                                            </label>
                                            <label className="adjustment-radio-label outflow">
                                                <input 
                                                    type="radio" 
                                                    name="transaction_type" 
                                                    value="OUTFLOW"
                                                    checked={adjustmentPayload.transaction_type === 'OUTFLOW'}
                                                    onChange={e => setAdjustmentPayload(prev => ({ ...prev, transaction_type: e.target.value }))}
                                                />
                                                <i className="fas fa-arrow-up"></i> OUTFLOW (Deduct funds / Reconcile shortage)
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Amount *</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            required 
                                            placeholder="0.00"
                                            className="form-input"
                                            value={adjustmentPayload.amount}
                                            onChange={e => setAdjustmentPayload(prev => ({ ...prev, amount: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Payment Method *</label>
                                        <select 
                                            className="form-select"
                                            value={adjustmentPayload.payment_method}
                                            onChange={e => setAdjustmentPayload(prev => ({ ...prev, payment_method: e.target.value }))}
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Gym Branch *</label>
                                        <select 
                                            className="form-select"
                                            value={adjustmentPayload.branch_id}
                                            onChange={e => setAdjustmentPayload(prev => ({ ...prev, branch_id: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map(b => (
                                                <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Audit Compliance Reason *</label>
                                        <textarea 
                                            className="form-textarea"
                                            required
                                            placeholder="Detailed audit explanation for executing adjustment (e.g. Petty cash shortage reconciliation for Tuesday morning)..."
                                            value={adjustmentPayload.description}
                                            onChange={e => setAdjustmentPayload(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="payroll-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setLedgerAdjustmentOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Apply Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* 24-Hour Purchase Reversal Modal */}
            {showRevertSubModal && (
                <RevertSubscriptionModal
                    isOpen={showRevertSubModal}
                    onClose={() => setShowRevertSubModal(false)}
                    onSuccess={() => {
                        setShowRevertSubModal(false);
                        if (activeTab === 'summary') fetchSummary();
                        else if (activeTab === 'ledger') fetchLedger();
                    }}
                />
            )}
        </div>
    );
};

export default AdminFinanceManagement;
