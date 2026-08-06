import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';
import './AdminPayrollManagement.css';

const AdminPayrollManagement = () => {
    // Current theme and API settings
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'salaries'); // 'salaries' or 'commissions'

    useEffect(() => {
        if (tabParam && (tabParam === 'salaries' || tabParam === 'commissions')) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dropdown options lists
    const [branches, setBranches] = useState([]);
    const [trainers, setTrainers] = useState([]);

    // --- SALARIES STATE ---
    const [salariesList, setSalariesList] = useState([]);
    const [salariesPagination, setSalariesPagination] = useState({
        current_page: 1,
        limit: 20,
        total_records: 0,
        total_pages: 1
    });
    const [salariesMetrics, setSalariesMetrics] = useState({
        filtered_total_base_salary: "0.00",
        filtered_total_commissions: "0.00",
        filtered_total_bonuses: "0.00",
        filtered_total_deductions: "0.00",
        filtered_grand_net_payable: "0.00"
    });

    // Salaries Filters
    const [salaryFilters, setSalaryFilters] = useState({
        status: '',
        time_frame: 'current_month',
        pay_month: '',
        pay_year: '',
        employee_id: '',
        role: '',
        branch_id: '',
        includes_commission: false,
        page: 1,
        limit: 20
    });

    // --- COMMISSIONS STATE ---
    const [commissionsList, setCommissionsList] = useState([]);
    const [commissionsPagination, setCommissionsPagination] = useState({
        current_page: 1,
        limit: 20,
        total_records: 0,
        total_pages: 1
    });
    const [commissionsMetrics, setCommissionsMetrics] = useState({
        filtered_total_commission_amount: "0.00"
    });

    // Commissions Filters
    const [commissionFilters, setCommissionFilters] = useState({
        status: '',
        time_frame: 'current_month',
        month: '',
        year: '',
        trainer_id: '',
        branch_id: '',
        page: 1,
        limit: 20
    });

    // --- MODAL STATE ---
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [disburseModalOpen, setDisburseModalOpen] = useState(false);
    const [disbursePayload, setDisbursePayload] = useState({
        bonus: 0.00,
        deductions: 0.00,
        include_pt_commissions: true,
        payment_method: 'BANK_TRANSFER',
        remarks: ''
    });
    const [disburseResult, setDisburseResult] = useState(null);

    const [selectedCommission, setSelectedCommission] = useState(null);
    const [payEarlyModalOpen, setPayEarlyModalOpen] = useState(false);
    const [payEarlyPayload, setPayEarlyPayload] = useState({
        payment_method: 'BANK_TRANSFER',
        remarks: ''
    });
    const [payEarlyResult, setPayEarlyResult] = useState(null);

    // Fetch Branches & Trainers on Mount
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Fetch gym branches
                const branchRes = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/gym-branches`);
                if (branchRes.ok) {
                    const data = await branchRes.json();
                    const branchesData = data.data || data;
                    setBranches(Array.isArray(branchesData) ? branchesData : []);
                }

                // Fetch trainers
                const trainerRes = await tokenManager.apiCall(`${API_BASE_URL}/api/trainers`);
                if (trainerRes.ok) {
                    const data = await trainerRes.json();
                    const trainersData = data.data || data;
                    setTrainers(Array.isArray(trainersData) ? trainersData : []);
                }
            } catch (err) {
                console.error("Failed to load metadata dropdowns:", err);
            }
        };

        fetchMetadata();
    }, [API_BASE_URL]);

    // Fetch Salaries/Payrolls List
    const fetchSalaries = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Build query string
        const params = new URLSearchParams();
        if (salaryFilters.status) params.append('status', salaryFilters.status);
        if (salaryFilters.time_frame) params.append('time_frame', salaryFilters.time_frame);
        if (salaryFilters.pay_month) params.append('pay_month', salaryFilters.pay_month);
        if (salaryFilters.pay_year) params.append('pay_year', salaryFilters.pay_year);
        if (salaryFilters.employee_id) params.append('employee_id', salaryFilters.employee_id);
        if (salaryFilters.role) params.append('role', salaryFilters.role);
        if (salaryFilters.branch_id) params.append('branch_id', salaryFilters.branch_id);
        if (salaryFilters.includes_commission) params.append('includes_commission', 'true');
        params.append('page', salaryFilters.page.toString());
        params.append('limit', salaryFilters.limit.toString());

        try {
            const url = `${API_BASE_URL}/api/admin/payrolls?${params.toString()}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    setSalariesList(data.data.payrolls || []);
                    setSalariesPagination(data.data.pagination || {
                        current_page: 1,
                        limit: 20,
                        total_records: 0,
                        total_pages: 1
                    });
                    setSalariesMetrics(data.data.summary_metrics || {
                        filtered_total_base_salary: "0.00",
                        filtered_total_commissions: "0.00",
                        filtered_total_bonuses: "0.00",
                        filtered_total_deductions: "0.00",
                        filtered_grand_net_payable: "0.00"
                    });
                } else {
                    throw new Error(data.message || 'Failed to fetch payroll runs');
                }
            } else {
                throw new Error(`API returned HTTP ${res.status}`);
            }
        } catch (err) {
            console.error("Error fetching salaries:", err);
            setError("Payroll runs list is currently unavailable due to network connection failure.");
            setSalariesList([]);
            setSalariesMetrics({
                filtered_total_base_salary: "0.00",
                filtered_total_commissions: "0.00",
                filtered_total_bonuses: "0.00",
                filtered_total_deductions: "0.00",
                filtered_grand_net_payable: "0.00"
            });
            setSalariesPagination({
                current_page: 1,
                limit: 20,
                total_records: 0,
                total_pages: 1
            });
        } finally {
            setLoading(false);
        }
    }, [salaryFilters, API_BASE_URL]);

    // Fetch PT Commissions List
    const fetchCommissions = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Build query string
        const params = new URLSearchParams();
        if (commissionFilters.status) params.append('status', commissionFilters.status);
        if (commissionFilters.time_frame) params.append('time_frame', commissionFilters.time_frame);
        if (commissionFilters.month) params.append('month', commissionFilters.month);
        if (commissionFilters.year) params.append('year', commissionFilters.year);
        if (commissionFilters.trainer_id) params.append('trainer_id', commissionFilters.trainer_id);
        if (commissionFilters.branch_id) params.append('branch_id', commissionFilters.branch_id);
        params.append('page', commissionFilters.page.toString());
        params.append('limit', commissionFilters.limit.toString());

        try {
            const url = `${API_BASE_URL}/api/admin/trainer-commissions?${params.toString()}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    setCommissionsList(data.data.commissions || []);
                    setCommissionsPagination(data.data.pagination || {
                        current_page: 1,
                        limit: 20,
                        total_records: 0,
                        total_pages: 1
                    });
                    setCommissionsMetrics(data.data.summary_metrics || {
                        filtered_total_commission_amount: "0.00"
                    });
                } else {
                    throw new Error(data.message || 'Failed to fetch trainer commissions');
                }
            } else {
                throw new Error(`API returned HTTP ${res.status}`);
            }
        } catch (err) {
            console.error("Error fetching commissions:", err);
            setError("Trainer commissions audit list is currently unavailable due to network connection failure.");
            setCommissionsList([]);
            setCommissionsMetrics({
                filtered_total_commission_amount: "0.00"
            });
            setCommissionsPagination({
                current_page: 1,
                limit: 20,
                total_records: 0,
                total_pages: 1
            });
        } finally {
            setLoading(false);
        }
    }, [commissionFilters, API_BASE_URL]);

    // Trigger loading of data based on active tab
    useEffect(() => {
        if (activeTab === 'salaries') {
            fetchSalaries();
        } else {
            fetchCommissions();
        }
    }, [activeTab, fetchSalaries, fetchCommissions]);

    // Handle tab switching
    const handleTabChange = (tab) => {
        setSearchParams({ tab });
        setActiveTab(tab);
    };

    // Refresh active tab dataset
    const handleRefresh = () => {
        if (activeTab === 'salaries') {
            fetchSalaries();
        } else {
            fetchCommissions();
        }
    };

    // --- FILTERS LOGIC ---
    const handleSalaryFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setSalaryFilters(prev => ({
            ...prev,
            [name]: val,
            // If explicit month/year is selected, reset shortcut to custom/empty
            time_frame: (name === 'pay_month' || name === 'pay_year') && val !== '' ? '' : prev.time_frame,
            page: 1 // Reset to first page on change
        }));
    };

    const handleCommissionFilterChange = (e) => {
        const { name, value } = e.target;
        setCommissionFilters(prev => ({
            ...prev,
            [name]: value,
            time_frame: (name === 'month' || name === 'year') && value !== '' ? '' : prev.time_frame,
            page: 1
        }));
    };

    const clearSalaryFilters = () => {
        setSalaryFilters({
            status: '',
            time_frame: 'current_month',
            pay_month: '',
            pay_year: '',
            employee_id: '',
            role: '',
            branch_id: '',
            includes_commission: false,
            page: 1,
            limit: 20
        });
    };

    const clearCommissionFilters = () => {
        setCommissionFilters({
            status: '',
            time_frame: 'current_month',
            month: '',
            year: '',
            trainer_id: '',
            branch_id: '',
            page: 1,
            limit: 20
        });
    };

    // --- MODAL ACTION HANDLING ---

    // Disburse salary triggers
    const openDisburseModal = (payroll) => {
        setSelectedPayroll(payroll);
        setDisbursePayload({
            bonus: parseFloat(payroll.breakdown.bonus) || 0.00,
            deductions: parseFloat(payroll.breakdown.deductions) || 0.00,
            include_pt_commissions: payroll.includes_commission,
            payment_method: 'BANK_TRANSFER',
            remarks: `${payroll.pay_period.display_name} Salary Settlement`
        });
        setDisburseResult(null);
        setDisburseModalOpen(true);
    };

    const closeDisburseModal = () => {
        setDisburseModalOpen(false);
        setSelectedPayroll(null);
        setDisburseResult(null);
    };

    const handleDisburseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = `${API_BASE_URL}/api/admin/payroll/${selectedPayroll.payroll_id}/disburse`;
            const payload = {
                bonus: parseFloat(disbursePayload.bonus) || 0.00,
                deductions: parseFloat(disbursePayload.deductions) || 0.00,
                include_pt_commissions: disbursePayload.include_pt_commissions,
                payment_method: disbursePayload.payment_method,
                remarks: disbursePayload.remarks
            };

            const response = await tokenManager.apiCall(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setDisburseResult(result.data);
                // Refresh listing values
                fetchSalaries();
            } else {
                throw new Error(result.message || 'Salary disbursement failed.');
            }
        } catch (err) {
            console.error("Disbursement API failed:", err);
            setError("Salary disbursement service is currently unavailable due to network connection failure.");
        } finally {
            setLoading(false);
        }
    };

    // Pay early triggers
    const openPayEarlyModal = (commission) => {
        setSelectedCommission(commission);
        setPayEarlyPayload({
            payment_method: 'BANK_TRANSFER',
            remarks: `Early payout requested by trainer for festival`
        });
        setPayEarlyResult(null);
        setPayEarlyModalOpen(true);
    };

    const closePayEarlyModal = () => {
        setPayEarlyModalOpen(false);
        setSelectedCommission(null);
        setPayEarlyResult(null);
    };

    const handlePayEarlySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = `${API_BASE_URL}/api/admin/trainer-commissions/${selectedCommission.commission_id}/pay-early`;
            const payload = {
                payment_method: payEarlyPayload.payment_method,
                remarks: payEarlyPayload.remarks
            };

            const response = await tokenManager.apiCall(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setPayEarlyResult(result.data);
                // Refresh list values
                fetchCommissions();
            } else {
                throw new Error(result.message || 'PT commission payout failed.');
            }
        } catch (err) {
            console.error("Early Payout API failed:", err);
            setError("Early commission payout service is currently unavailable due to network connection failure.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate sum of base salaries, commissions, etc for card displays if API does not return it
    const formatCurrency = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="payroll-management-container">
            {/* Top Header Control Section */}
            <div className="payroll-header">
                <div className="payroll-title-section">
                    <h1>Payroll & Commission Audit</h1>
                    <p>Manage employee payroll runs, split ledger accounting disbursements, and trainer PT commission audits.</p>
                </div>
                <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Refresh
                </button>
            </div>


            {/* Tab Section Header */}
            <div className="payroll-tabs">
                <button 
                    className={`payroll-tab ${activeTab === 'salaries' ? 'active' : ''}`}
                    onClick={() => handleTabChange('salaries')}
                >
                    <i className="fas fa-money-bill-wave"></i> Salaries & Payroll Runs
                </button>
                <button 
                    className={`payroll-tab ${activeTab === 'commissions' ? 'active' : ''}`}
                    onClick={() => handleTabChange('commissions')}
                >
                    <i className="fas fa-dumbbell"></i> PT Commissions Audit
                </button>
            </div>

            {/* --- TAB 1: SALARIES --- */}
            {activeTab === 'salaries' && (
                <>
                    {/* KPI Stat Cards */}
                    <div className="payroll-stats-grid">
                        <div className="payroll-stat-card">
                            <div className="stat-icon indigo">
                                <i className="fas fa-hand-holding-usd"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">Net Payable</span>
                                <span className="stat-value">{formatCurrency(salariesMetrics.filtered_grand_net_payable)}</span>
                            </div>
                        </div>
                        <div className="payroll-stat-card">
                            <div className="stat-icon blue">
                                <i className="fas fa-wallet"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">Base Salaries</span>
                                <span className="stat-value">{formatCurrency(salariesMetrics.filtered_total_base_salary)}</span>
                            </div>
                        </div>
                        <div className="payroll-stat-card">
                            <div className="stat-icon green">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">PT Commissions</span>
                                <span className="stat-value">{formatCurrency(salariesMetrics.filtered_total_commissions)}</span>
                            </div>
                        </div>
                        <div className="payroll-stat-card">
                            <div className="stat-icon purple">
                                <i className="fas fa-gift"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">Total Bonuses</span>
                                <span className="stat-value">{formatCurrency(salariesMetrics.filtered_total_bonuses)}</span>
                            </div>
                        </div>
                        <div className="payroll-stat-card">
                            <div className="stat-icon red">
                                <i className="fas fa-percent"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">Deductions</span>
                                <span className="stat-value">{formatCurrency(salariesMetrics.filtered_total_deductions)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter controls */}
                    <div className="payroll-filter-bar">
                        <div className="filters-row">
                            <div className="filter-group">
                                <label>Status</label>
                                <select 
                                    name="status" 
                                    value={salaryFilters.status} 
                                    onChange={handleSalaryFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All States</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="PAID">Paid</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Time Frame</label>
                                <select 
                                    name="time_frame" 
                                    value={salaryFilters.time_frame} 
                                    onChange={handleSalaryFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="current_month">Current Month</option>
                                    <option value="previous_month">Previous Month</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="all">All Records</option>
                                    <option value="">Custom (Month/Year)</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Month</label>
                                <select 
                                    name="pay_month" 
                                    value={salaryFilters.pay_month} 
                                    onChange={handleSalaryFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i+1} value={i+1}>{new Date(2026, i, 1).toLocaleString('default', {month: 'long'})}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Year</label>
                                <select 
                                    name="pay_year" 
                                    value={salaryFilters.pay_year} 
                                    onChange={handleSalaryFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Role</label>
                                <select 
                                    name="role" 
                                    value={salaryFilters.role} 
                                    onChange={handleSalaryFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All Roles</option>
                                    <option value="TRAINER">Trainer</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="RECEPTIONIST">Receptionist</option>
                                    <option value="STAFF">General Staff</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Gym Branch</label>
                                <select 
                                    name="branch_id" 
                                    value={salaryFilters.branch_id} 
                                    onChange={handleSalaryFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All Branches</option>
                                    {(Array.isArray(branches) ? branches : []).map(b => (
                                        <option key={b.branch_id} value={b.branch_id}>{b.branch_name || `Branch #${b.branch_id}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group search">
                                <label>Employee ID</label>
                                <input 
                                    type="number"
                                    name="employee_id"
                                    value={salaryFilters.employee_id}
                                    placeholder="Filter by ID (e.g. 4)"
                                    onChange={handleSalaryFilterChange}
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        name="includes_commission" 
                                        checked={salaryFilters.includes_commission}
                                        onChange={handleSalaryFilterChange} 
                                    />
                                    Has PT Commission
                                </label>
                            </div>

                            <button className="clear-filters-btn" onClick={clearSalaryFilters}>
                                <i className="fas fa-filter-slash"></i> Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Salaries Table */}
                    <div className="payroll-table-container">
                        <div className="table-responsive">
                            <table className="payroll-table">
                                <thead>
                                    <tr>
                                        <th>Payroll ID</th>
                                        <th>Employee Details</th>
                                        <th>Branch</th>
                                        <th>Pay Period</th>
                                        <th>Base Salary</th>
                                        <th>Commission</th>
                                        <th>Bonus</th>
                                        <th>Deductions</th>
                                        <th>Net Payable</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="11">
                                                <div className="loading-view-wrapper">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    <span>Fetching salary records...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : salariesList.length === 0 ? (
                                        <tr>
                                            <td colSpan="11">
                                                <div className="empty-view-wrapper">
                                                    <i className="fas fa-folder-open"></i>
                                                    <h3>No payroll slips found</h3>
                                                    <p>Try adjusting your search criteria or time frame filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        salariesList.map(payroll => (
                                            <tr key={payroll.payroll_id}>
                                                <td>#{payroll.payroll_id}</td>
                                                <td>
                                                    <div className="employee-cell">
                                                        <span className="employee-name">{payroll.employee.name}</span>
                                                        <span className="employee-phone">
                                                            {payroll.employee.role} • {payroll.employee.phone} (ID: {payroll.employee.employee_id})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>Branch #{payroll.branch_id}</td>
                                                <td>{payroll.pay_period.display_name}</td>
                                                <td>{formatCurrency(payroll.breakdown.base_salary)}</td>
                                                <td>
                                                    {parseFloat(payroll.breakdown.commission_amount) > 0 ? (
                                                        <span style={{color: '#10b981', fontWeight: 600}}>
                                                            {formatCurrency(payroll.breakdown.commission_amount)}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td>{formatCurrency(payroll.breakdown.bonus)}</td>
                                                <td>{parseFloat(payroll.breakdown.deductions) > 0 ? `- ${formatCurrency(payroll.breakdown.deductions)}` : '—'}</td>
                                                <td style={{fontWeight: 700}}>{formatCurrency(payroll.net_payable)}</td>
                                                <td>
                                                    <span className={`status-badge ${payroll.status.toLowerCase()}`}>
                                                        {payroll.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {payroll.status === 'DRAFT' ? (
                                                        <button 
                                                            className="action-btn disburse" 
                                                            onClick={() => openDisburseModal(payroll)}
                                                        >
                                                            <i className="fas fa-check-circle"></i> Disburse
                                                        </button>
                                                    ) : (
                                                        <button className="action-btn" disabled>
                                                            Completed
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        {!loading && salariesList.length > 0 && (
                            <div className="payroll-pagination">
                                <div className="pagination-info">
                                    Showing page {salariesPagination.current_page} of {salariesPagination.total_pages} ({salariesPagination.total_records} records)
                                </div>
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn"
                                        disabled={salariesPagination.current_page === 1}
                                        onClick={() => setSalaryFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </button>
                                    <button 
                                        className="pagination-btn"
                                        disabled={salariesPagination.current_page >= salariesPagination.total_pages}
                                        onClick={() => setSalaryFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* --- TAB 2: PT COMMISSIONS --- */}
            {activeTab === 'commissions' && (
                <>
                    {/* KPI Stat Cards */}
                    <div className="payroll-stats-grid">
                        <div className="payroll-stat-card">
                            <div className="stat-icon green">
                                <i className="fas fa-coins"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">Audit Total Commissions</span>
                                <span className="stat-value">{formatCurrency(commissionsMetrics.filtered_total_commission_amount)}</span>
                            </div>
                        </div>
                        <div className="payroll-stat-card">
                            <div className="stat-icon orange">
                                <i className="fas fa-hourglass-half"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">Pending (Unpaid)</span>
                                <span className="stat-value">
                                    {formatCurrency(
                                        commissionsList
                                            .filter(c => c.status === 'UNPAID')
                                            .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0)
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="payroll-stat-card">
                            <div className="stat-icon blue">
                                <i className="fas fa-check-double"></i>
                            </div>
                            <div className="stat-details">
                                <span className="stat-label">Paid / Settled</span>
                                <span className="stat-value">
                                    {formatCurrency(
                                        commissionsList
                                            .filter(c => c.status === 'PAID')
                                            .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filter controls */}
                    <div className="payroll-filter-bar">
                        <div className="filters-row">
                            <div className="filter-group">
                                <label>Status</label>
                                <select 
                                    name="status" 
                                    value={commissionFilters.status} 
                                    onChange={handleCommissionFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All States</option>
                                    <option value="UNPAID">Unpaid</option>
                                    <option value="PAID">Paid</option>
                                    <option value="VOIDED">Voided</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Time Frame</label>
                                <select 
                                    name="time_frame" 
                                    value={commissionFilters.time_frame} 
                                    onChange={handleCommissionFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="current_month">Current Month</option>
                                    <option value="previous_month">Previous Month</option>
                                    <option value="all">All Records</option>
                                    <option value="">Custom (Month/Year)</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Month</label>
                                <select 
                                    name="month" 
                                    value={commissionFilters.month} 
                                    onChange={handleCommissionFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i+1} value={i+1}>{new Date(2026, i, 1).toLocaleString('default', {month: 'long'})}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Year</label>
                                <select 
                                    name="year" 
                                    value={commissionFilters.year} 
                                    onChange={handleCommissionFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Trainer</label>
                                <select 
                                    name="trainer_id" 
                                    value={commissionFilters.trainer_id} 
                                    onChange={handleCommissionFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All Trainers</option>
                                    {(Array.isArray(trainers) ? trainers : []).map(t => (
                                        <option key={t.employee_id} value={t.employee_id}>{t.name} (ID: {t.employee_id})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Gym Branch</label>
                                <select 
                                    name="branch_id" 
                                    value={commissionFilters.branch_id} 
                                    onChange={handleCommissionFilterChange} 
                                    className="filter-select"
                                >
                                    <option value="">All Branches</option>
                                    {(Array.isArray(branches) ? branches : []).map(b => (
                                        <option key={b.branch_id} value={b.branch_id}>{b.branch_name || `Branch #${b.branch_id}`}</option>
                                    ))}
                                </select>
                            </div>

                            <button className="clear-filters-btn" onClick={clearCommissionFilters}>
                                <i className="fas fa-filter-slash"></i> Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Commissions Table */}
                    <div className="payroll-table-container">
                        <div className="table-responsive">
                            <table className="payroll-table">
                                <thead>
                                    <tr>
                                        <th>Commission ID</th>
                                        <th>Trainer Name</th>
                                        <th>Invoice details</th>
                                        <th>Client Name</th>
                                        <th>Amount</th>
                                        <th>Earned At</th>
                                        <th>Settled At</th>
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
                                                    <span>Fetching commission audit records...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : commissionsList.length === 0 ? (
                                        <tr>
                                            <td colSpan="9">
                                                <div className="empty-view-wrapper">
                                                    <i className="fas fa-folder-open"></i>
                                                    <h3>No trainer commissions found</h3>
                                                    <p>Try adjusting your search criteria or filter properties.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        commissionsList.map(comm => (
                                            <tr key={comm.commission_id}>
                                                <td>#{comm.commission_id}</td>
                                                <td>
                                                    <span style={{fontWeight: 600}}>{comm.trainer_name}</span>
                                                    <span style={{fontSize: '0.75rem', color: '#64748b', display: 'block'}}>
                                                        Trainer ID: {comm.trainer_id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{fontFamily: 'monospace'}}>{comm.invoice_number}</span>
                                                    <span style={{fontSize: '0.75rem', color: '#64748b', display: 'block'}}>
                                                        ID: {comm.invoice_id}
                                                    </span>
                                                </td>
                                                <td>{comm.client_name}</td>
                                                <td style={{fontWeight: 700, color: '#10b981'}}>{formatCurrency(comm.commission_amount)}</td>
                                                <td>{comm.earned_at}</td>
                                                <td>{comm.paid_at ? comm.paid_at : <span style={{color: '#94a3b8'}}>Pending Payroll</span>}</td>
                                                <td>
                                                    <span className={`status-badge ${comm.status.toLowerCase()}`}>
                                                        {comm.status}
                                                    </span>
                                                    {comm.payroll_id && (
                                                        <span style={{display: 'block', fontSize: '0.7rem', color: '#64748b', marginTop: '2px'}}>
                                                            Linked Pay Run: #{comm.payroll_id}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {comm.status === 'UNPAID' ? (
                                                        <button 
                                                            className="action-btn pay-early" 
                                                            onClick={() => openPayEarlyModal(comm)}
                                                        >
                                                            <i className="fas fa-paper-plane"></i> Pay Early (Off-Cycle)
                                                        </button>
                                                    ) : (
                                                        <button className="action-btn" disabled>
                                                            Processed
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        {!loading && commissionsList.length > 0 && (
                            <div className="payroll-pagination">
                                <div className="pagination-info">
                                    Showing page {commissionsPagination.current_page} of {commissionsPagination.total_pages} ({commissionsPagination.total_records} records)
                                </div>
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn"
                                        disabled={commissionsPagination.current_page === 1}
                                        onClick={() => setCommissionFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </button>
                                    <button 
                                        className="pagination-btn"
                                        disabled={commissionsPagination.current_page >= commissionsPagination.total_pages}
                                        onClick={() => setCommissionFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* --- DIALOG MODAL 1: SALARY DISBURSEMENT --- */}
            {disburseModalOpen && selectedPayroll && (
                <div className="payroll-modal-overlay">
                    <div className="payroll-modal">
                        <div className="payroll-modal-header">
                            <h3>Disburse Staff Payroll Run</h3>
                            <button className="close-modal-btn" onClick={closeDisburseModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleDisburseSubmit}>
                            <div className="payroll-modal-body">
                                {!disburseResult ? (
                                    <>
                                        <div className="payroll-details-summary">
                                            <div className="summary-row">
                                                <span>Employee Name</span>
                                                <span style={{fontWeight: 600}}>{selectedPayroll.employee.name} ({selectedPayroll.employee.role})</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Base Salary</span>
                                                <span>{formatCurrency(selectedPayroll.breakdown.base_salary)}</span>
                                            </div>
                                            {selectedPayroll.includes_commission && (
                                                <div className="summary-row">
                                                    <span>PT Package Commission Cuts</span>
                                                    <span style={{color: '#10b981'}}>{formatCurrency(selectedPayroll.breakdown.commission_amount)}</span>
                                                </div>
                                            )}
                                            <div className="summary-row">
                                                <span>Period</span>
                                                <span>{selectedPayroll.pay_period.display_name}</span>
                                            </div>
                                            <div className="summary-row total">
                                                <span>Subtotal Base Net Payable</span>
                                                <span>{formatCurrency(
                                                    parseFloat(selectedPayroll.breakdown.base_salary) + 
                                                    parseFloat(selectedPayroll.breakdown.bonus) - 
                                                    parseFloat(selectedPayroll.breakdown.deductions) +
                                                    (disbursePayload.include_pt_commissions ? parseFloat(selectedPayroll.breakdown.commission_amount) : 0)
                                                )}</span>
                                            </div>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Bonus (Add-on Incentives)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    className="form-input" 
                                                    value={disbursePayload.bonus}
                                                    onChange={e => setDisbursePayload(prev => ({ ...prev, bonus: e.target.value }))}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Deductions (Taxes / Penalties)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    className="form-input" 
                                                    value={disbursePayload.deductions}
                                                    onChange={e => setDisbursePayload(prev => ({ ...prev, deductions: e.target.value }))}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Payment Method</label>
                                                <select 
                                                    className="form-select"
                                                    value={disbursePayload.payment_method}
                                                    onChange={e => setDisbursePayload(prev => ({ ...prev, payment_method: e.target.value }))}
                                                >
                                                    <option value="BANK_TRANSFER">Bank Transfer (IMPS/NEFT)</option>
                                                    <option value="CASH">Direct Cash</option>
                                                    <option value="UPI">UPI Instant Payment</option>
                                                    <option value="CHEQUE">Bank Cheque</option>
                                                </select>
                                            </div>

                                            {selectedPayroll.includes_commission && (
                                                <div className="form-group" style={{justifyContent: 'center'}}>
                                                    <label className="form-checkbox">
                                                        <input 
                                                            type="checkbox"
                                                            checked={disbursePayload.include_pt_commissions}
                                                            onChange={e => setDisbursePayload(prev => ({ ...prev, include_pt_commissions: e.target.checked }))}
                                                        />
                                                        Include PT Commissions (Settlement)
                                                    </label>
                                                </div>
                                            )}

                                            <div className="form-group full-width">
                                                <label>Remarks</label>
                                                <textarea 
                                                    className="form-textarea"
                                                    placeholder="Add accounting details or remarks..."
                                                    value={disbursePayload.remarks}
                                                    onChange={e => setDisbursePayload(prev => ({ ...prev, remarks: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="success-banner">
                                            <i className="fas fa-check-circle"></i>
                                            <h4>Salary Settlement Successful</h4>
                                            <p>Disbursement recorded, and master ledger updated with splits.</p>
                                        </div>

                                        <div className="payroll-details-summary">
                                            <div className="summary-row">
                                                <span>Settlement for</span>
                                                <span style={{fontWeight: 600}}>{disburseResult.employee_name}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Disbursed Amount</span>
                                                <span style={{fontWeight: 700}}>{formatCurrency(disburseResult.total_disbursed)}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Payment Mode</span>
                                                <span>{disburseResult.payment_method}</span>
                                            </div>
                                            {disburseResult.commissions_locked_count > 0 && (
                                                <div className="summary-row">
                                                    <span>PT Commissions Settle Count</span>
                                                    <span style={{color: '#10b981', fontWeight: 600}}>{disburseResult.commissions_locked_count} items locked</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ledger-section-title">Split Ledger Entries Created</div>
                                        <div className="ledger-entries-list">
                                            {disburseResult.ledger_entries_created.map(entry => (
                                                <div className="ledger-entry-card" key={entry.ledger_id}>
                                                    <div className="ledger-entry-info">
                                                        <div className="ledger-icon">
                                                            <i className="fas fa-file-invoice"></i>
                                                        </div>
                                                        <div className="ledger-desc">
                                                            <span className="ledger-desc-text">{entry.description}</span>
                                                            <span className="ledger-id">Ledger Entry #{entry.ledger_id} • Category: {entry.category}</span>
                                                        </div>
                                                    </div>
                                                    <div className="ledger-amount">-{formatCurrency(entry.amount)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="payroll-modal-footer">
                                {!disburseResult ? (
                                    <>
                                        <button type="button" className="btn btn-secondary" onClick={closeDisburseModal} disabled={loading}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Approve & Disburse
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" className="btn btn-primary" onClick={closeDisburseModal}>
                                        Done
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DIALOG MODAL 2: MANUAL EARLY COMMISSION PAYOUT --- */}
            {payEarlyModalOpen && selectedCommission && (
                <div className="payroll-modal-overlay">
                    <div className="payroll-modal">
                        <div className="payroll-modal-header">
                            <h3>Manual Off-Cycle PT Commission Payout</h3>
                            <button className="close-modal-btn" onClick={closePayEarlyModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handlePayEarlySubmit}>
                            <div className="payroll-modal-body">
                                {!payEarlyResult ? (
                                    <>
                                        <div className="payroll-details-summary">
                                            <div className="summary-row">
                                                <span>Trainer Name</span>
                                                <span style={{fontWeight: 600}}>{selectedCommission.trainer_name} (ID: {selectedCommission.trainer_id})</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Client Invoice Ref</span>
                                                <span style={{fontFamily: 'monospace'}}>{selectedCommission.invoice_number}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Gym Client</span>
                                                <span>{selectedCommission.client_name}</span>
                                            </div>
                                            <div className="summary-row total">
                                                <span>Commission Amount</span>
                                                <span style={{color: '#10b981'}}>{formatCurrency(selectedCommission.commission_amount)}</span>
                                            </div>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group full-width">
                                                <label>Disbursement Payment Method</label>
                                                <select 
                                                    className="form-select"
                                                    value={payEarlyPayload.payment_method}
                                                    onChange={e => setPayEarlyPayload(prev => ({ ...prev, payment_method: e.target.value }))}
                                                >
                                                    <option value="BANK_TRANSFER">Bank Transfer (Early Dispatch)</option>
                                                    <option value="CASH">Direct Cash Payment</option>
                                                    <option value="UPI">UPI Instant Payout</option>
                                                    <option value="CHEQUE">Bank Cheque Dispatch</option>
                                                </select>
                                            </div>

                                            <div className="form-group full-width">
                                                <label>Disbursement Remarks</label>
                                                <textarea 
                                                    className="form-textarea"
                                                    placeholder="Specify the reason (e.g. Early payout requested by trainer for Diwali festival)"
                                                    value={payEarlyPayload.remarks}
                                                    onChange={e => setPayEarlyPayload(prev => ({ ...prev, remarks: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="success-banner">
                                            <i className="fas fa-check-circle"></i>
                                            <h4>PT Commission Disbursed Early</h4>
                                            <p>Manual off-cycle payout complete and logged in financial ledger.</p>
                                        </div>

                                        <div className="payroll-details-summary">
                                            <div className="summary-row">
                                                <span>Commission ID</span>
                                                <span>#{payEarlyResult.commission_id}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Trainer ID</span>
                                                <span>#{payEarlyResult.trainer_id}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Amount Paid</span>
                                                <span style={{fontWeight: 700, color: '#10b981'}}>{formatCurrency(payEarlyResult.amount_paid)}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Disbursement Method</span>
                                                <span>{payEarlyResult.payment_method}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Ledger Reference ID</span>
                                                <span style={{fontWeight: 600}}>#{payEarlyResult.ledger_reference_id}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="payroll-modal-footer">
                                {!payEarlyResult ? (
                                    <>
                                        <button type="button" className="btn btn-secondary" onClick={closePayEarlyModal} disabled={loading}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-success" disabled={loading}>
                                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>} Disburse Early
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" className="btn btn-primary" onClick={closePayEarlyModal}>
                                        Done
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayrollManagement;
