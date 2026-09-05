import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './AttendanceManagement.css';
import { tokenManager } from '../utils/tokenManager';

const AttendanceManagement = () => {
    // Current local date in YYYY-MM-DD
    const getCurrentLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getPastDate = (daysAgo) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMonthStartDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };

    const todayDate = getCurrentLocalDate();

    // Role Filter Tab: 'ALL', 'MEMBER', 'EMPLOYEE'
    const [roleFilterTab, setRoleFilterTab] = useState('ALL');

    // Query Filters State
    const [searchQuery, setSearchQuery] = useState('');

    // Date Mode: 'single' (date=) or 'range' (from_date= & to_date=)
    const [dateMode, setDateMode] = useState('single');
    const [selectedDate, setSelectedDate] = useState(todayDate);
    const [fromDate, setFromDate] = useState(todayDate);
    const [toDate, setToDate] = useState(todayDate);
    const [datePreset, setDatePreset] = useState('today');

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [paginationData, setPaginationData] = useState({
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 1
    });

    // Main Data State
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Auto Refresh Toggle (5 Minutes interval)
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

    // Details Modal
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [recordDetailsLoading, setRecordDetailsLoading] = useState(false);
    const [recordFullDetails, setRecordFullDetails] = useState(null);

    // Toast Feedback
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
    };

    // Fetch Main Attendance List (GET /api/admin/attendance)
    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const query = new URLSearchParams();

            if (searchQuery.trim()) {
                query.append('search', searchQuery.trim());
            }

            if (dateMode === 'single') {
                if (selectedDate) query.append('date', selectedDate);
            } else {
                if (fromDate) query.append('from_date', fromDate);
                if (toDate) query.append('to_date', toDate);
            }

            query.append('page', page.toString());
            query.append('limit', limit.toString());

            const url = `${tokenManager.API_BASE_URL}/api/admin/attendance?${query.toString()}`;

            const response = await tokenManager.apiCall(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success' || data.success) {
                const list = data.data || [];
                setAttendanceList(list);
                if (data.pagination) {
                    setPaginationData(data.pagination);
                } else {
                    setPaginationData({
                        total: list.length,
                        page: page,
                        limit: limit,
                        total_pages: Math.max(1, Math.ceil(list.length / limit))
                    });
                }
            } else {
                throw new Error(data.message || 'Failed to retrieve attendance records.');
            }

            setLastRefreshedAt(new Date());
        } catch (err) {
            console.error('Error fetching attendance list:', err);
            setError(err.message || 'Error loading attendance. Please try again.');
            setAttendanceList([]);
        } finally {
            setLoading(false);
        }
    }, [
        searchQuery,
        dateMode,
        selectedDate,
        fromDate,
        toDate,
        page,
        limit
    ]);

    // Fetch Details for Single Attendance Record (GET /api/admin/attendance/details)
    const handleOpenRecordDetails = async (rec) => {
        setSelectedRecord(rec);
        setShowRecordModal(true);

        if (!rec.attendance_id) {
            setRecordFullDetails(rec);
            return;
        }

        try {
            setRecordDetailsLoading(true);
            setRecordFullDetails(null);

            const url = `${tokenManager.API_BASE_URL}/api/admin/attendance/details?attendance_id=${rec.attendance_id}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });

            if (res.ok) {
                const data = await res.json();
                if ((data.status === 'success' || data.success) && data.data) {
                    setRecordFullDetails(data.data);
                } else {
                    setRecordFullDetails(rec);
                }
            } else {
                setRecordFullDetails(rec);
            }
        } catch (err) {
            console.warn('Fallback to local record details:', err);
            setRecordFullDetails(rec);
        } finally {
            setRecordDetailsLoading(false);
        }
    };

    // Date Preset Selection Handler
    const handlePresetChange = (preset) => {
        setDatePreset(preset);
        setPage(1);

        if (preset === 'today') {
            setDateMode('single');
            setSelectedDate(todayDate);
            setFromDate(todayDate);
            setToDate(todayDate);
        } else if (preset === 'yesterday') {
            const yDate = getPastDate(1);
            setDateMode('single');
            setSelectedDate(yDate);
            setFromDate(yDate);
            setToDate(yDate);
        } else if (preset === 'last7') {
            setDateMode('range');
            setFromDate(getPastDate(7));
            setToDate(todayDate);
        } else if (preset === 'thisMonth') {
            setDateMode('range');
            setFromDate(getMonthStartDate());
            setToDate(todayDate);
        } else if (preset === 'range') {
            setDateMode('range');
        }
    };

    // Toggle between single date and date range mode
    const handleToggleDateMode = () => {
        if (dateMode === 'single') {
            setDateMode('range');
            setFromDate(selectedDate || todayDate);
            setToDate(todayDate);
            setDatePreset('custom');
        } else {
            setDateMode('single');
            setSelectedDate(fromDate || todayDate);
            setDatePreset('custom');
        }
        setPage(1);
    };

    // Reset All Filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setRoleFilterTab('ALL');
        setDateMode('single');
        setSelectedDate(todayDate);
        setFromDate(todayDate);
        setToDate(todayDate);
        setDatePreset('today');
        setPage(1);
    };

    const isFilterActive = searchQuery || datePreset !== 'today' || roleFilterTab !== 'ALL' || dateMode !== 'single' || selectedDate !== todayDate;

    // Filter by Role Tab (Client-side separation)
    const displayedAttendance = useMemo(() => {
        if (!attendanceList) return [];
        if (roleFilterTab === 'ALL') return attendanceList;
        if (roleFilterTab === 'MEMBER') {
            return attendanceList.filter((item) => {
                const role = (item.user_role || '').toUpperCase();
                return role === 'MEMBER';
            });
        }
        if (roleFilterTab === 'EMPLOYEE') {
            return attendanceList.filter((item) => {
                const role = (item.user_role || '').toUpperCase();
                return role !== 'MEMBER';
            });
        }
        return attendanceList;
    }, [attendanceList, roleFilterTab]);

    // Initial Load
    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Auto-refresh interval (5 minutes)
    useEffect(() => {
        if (!autoRefresh) return;
        const intervalId = setInterval(() => {
            fetchAttendance();
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [autoRefresh, fetchAttendance]);

    // Export current records to CSV
    const exportToCSV = () => {
        if (displayedAttendance.length === 0) {
            showToast('No attendance records to export', 'warning');
            return;
        }

        const headers = [
            'Attendance ID',
            'User ID',
            'User Name',
            'Role',
            'Email',
            'Phone',
            'Branch',
            'Gym',
            'Date',
            'Check In',
            'Check Out',
            'Duration (Min)',
            'Status',
            'Source',
            'Remarks'
        ];

        const rows = displayedAttendance.map((item) => [
            item.attendance_id || '',
            item.user_id || '',
            `"${(item.user_name || '').replace(/"/g, '""')}"`,
            item.user_role || '',
            item.user_email || '',
            item.user_phone || '',
            `"${(item.branch_name || '').replace(/"/g, '""')}"`,
            `"${(item.gym_name || '').replace(/"/g, '""')}"`,
            item.attendance_date || '',
            item.check_in_time || '',
            item.check_out_time || '',
            item.duration_min || '',
            item.check_out_time ? 'Checked Out' : 'Checked In',
            item.source || '',
            `"${(item.remarks || '').replace(/"/g, '""')}"`
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `Attendance_Export_${selectedDate || todayDate}_${Date.now()}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`Exported ${displayedAttendance.length} records to CSV`, 'success');
    };

    // Format time helpers
    const formatTimeOnly = (dateTimeStr) => {
        if (!dateTimeStr) return '--:--';
        try {
            const dateObj = new Date(dateTimeStr);
            if (isNaN(dateObj.getTime())) {
                if (dateTimeStr.includes(':')) {
                    const parts = dateTimeStr.split(':');
                    const hr = parseInt(parts[0], 10);
                    const min = parts[1];
                    const ampm = hr >= 12 ? 'PM' : 'AM';
                    const formattedHr = hr % 12 || 12;
                    return `${formattedHr}:${min} ${ampm}`;
                }
                return dateTimeStr;
            }
            return dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateTimeStr;
        }
    };

    const formatDurationDisplay = (min) => {
        if (!min || isNaN(min) || Number(min) <= 0) return '--';
        const minutes = Number(min);
        const hrs = Math.floor(minutes / 60);
        const remMin = minutes % 60;
        if (hrs > 0) {
            return `${hrs}h ${remMin > 0 ? `${remMin}m` : ''}`;
        }
        return `${remMin}m`;
    };

    const getRoleBadgeInfo = (role) => {
        const r = (role || 'MEMBER').toUpperCase();
        switch (r) {
            case 'MEMBER':
                return { label: 'Member', className: 'att-badge-member', icon: 'fa-user' };
            case 'TRAINER':
                return { label: 'Trainer', className: 'att-badge-trainer', icon: 'fa-dumbbell' };
            case 'STAFF':
                return { label: 'Staff', className: 'att-badge-staff', icon: 'fa-user-tie' };
            case 'ADMIN':
            case 'SUPER-ADMIN':
            case 'SUPER_ADMIN':
            case 'OWNER':
                return { label: 'Admin', className: 'att-badge-admin', icon: 'fa-shield-halved' };
            case 'MANAGER':
            case 'BRANCH_MANAGER':
                return { label: 'Manager', className: 'att-badge-manager', icon: 'fa-briefcase' };
            default:
                return { label: r, className: 'att-badge-default', icon: 'fa-id-badge' };
        }
    };

    const getSourceBadgeInfo = (source) => {
        const s = (source || 'DEVICE').toUpperCase();
        switch (s) {
            case 'DEVICE':
                return { label: 'Biometric / Device', className: 'source-device', icon: 'fa-fingerprint' };
            case 'MOBILE':
                return { label: 'Mobile App', className: 'source-mobile', icon: 'fa-mobile-screen-button' };
            case 'WEB':
                return { label: 'Web Portal', className: 'source-web', icon: 'fa-globe' };
            case 'DESKTOP':
                return { label: 'Desktop App', className: 'source-desktop', icon: 'fa-desktop' };
            case 'ADMIN':
                return { label: 'Admin Punch', className: 'source-admin', icon: 'fa-user-shield' };
            default:
                return { label: s, className: 'source-default', icon: 'fa-cube' };
        }
    };

    return (
        <div className="attendance-page-container">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`att-toast att-toast-${toast.type}`}>
                    <i
                        className={`fas ${
                            toast.type === 'success'
                                ? 'fa-check-circle'
                                : toast.type === 'error'
                                ? 'fa-exclamation-circle'
                                : toast.type === 'warning'
                                ? 'fa-exclamation-triangle'
                                : 'fa-info-circle'
                        }`}
                    ></i>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Compact Header */}
            <div className="att-compact-header">
                <div className="att-compact-title-group">
                    <h1 className="att-compact-title">Attendance Desk</h1>
                    <span className="att-compact-total-badge">
                        <strong>{paginationData.total || displayedAttendance.length}</strong> Entries
                    </span>
                    <span className="att-compact-sync-time">
                        <i className="fas fa-clock-rotate-left"></i> {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Compact Right Actions */}
                <div className="att-compact-actions">
                    {/* Auto Sync Toggle (5 min) */}
                    <button
                        type="button"
                        className={`att-compact-btn ${autoRefresh ? 'active' : ''}`}
                        onClick={() => {
                            setAutoRefresh(!autoRefresh);
                            showToast(
                                !autoRefresh
                                    ? 'Auto-sync enabled (every 5 min)'
                                    : 'Auto-sync paused',
                                'info'
                            );
                        }}
                        title="Auto-refresh every 5 minutes"
                    >
                        <i className={`fas fa-arrows-rotate ${autoRefresh ? 'fa-spin' : ''}`}></i>
                        <span>Auto-Sync 5m: <strong>{autoRefresh ? 'ON' : 'OFF'}</strong></span>
                    </button>

                    {/* Manual Refresh */}
                    <button
                        type="button"
                        className="att-compact-btn"
                        onClick={() => {
                            fetchAttendance();
                            showToast('Attendance refreshed', 'success');
                        }}
                        disabled={loading}
                        title="Refresh now"
                    >
                        <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`}></i>
                        <span>Refresh</span>
                    </button>

                    {/* Export CSV */}
                    <button
                        type="button"
                        className="att-compact-btn btn-export"
                        onClick={exportToCSV}
                        title="Download CSV"
                    >
                        <i className="fas fa-download"></i>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Main Attendance View */}
            <div className="att-main-view fade-in">
                {/* Single-Line Unified Filter Bar with both Single Date and Range filter */}
                <div className="att-single-line-filter-bar">
                    {/* 1. Role Filter Pills */}
                    <div className="att-role-segmented-control">
                        <button
                            type="button"
                            className={`role-seg-btn ${roleFilterTab === 'ALL' ? 'active' : ''}`}
                            onClick={() => setRoleFilterTab('ALL')}
                        >
                            <span>All Users</span>
                        </button>
                        <button
                            type="button"
                            className={`role-seg-btn ${roleFilterTab === 'MEMBER' ? 'active' : ''}`}
                            onClick={() => setRoleFilterTab('MEMBER')}
                        >
                            <span>Members</span>
                        </button>
                        <button
                            type="button"
                            className={`role-seg-btn ${roleFilterTab === 'EMPLOYEE' ? 'active' : ''}`}
                            onClick={() => setRoleFilterTab('EMPLOYEE')}
                        >
                            <span>Employees</span>
                        </button>
                    </div>

                    {/* 2. Search Input */}
                    <div className="att-single-line-search">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search name, phone, email..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="att-clear-btn"
                                onClick={() => {
                                    setSearchQuery('');
                                    setPage(1);
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    {/* 3. Quick Date Presets */}
                    <div className="att-date-presets-inline">
                        <button
                            type="button"
                            className={`preset-btn ${datePreset === 'today' && dateMode === 'single' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('today')}
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            className={`preset-btn ${datePreset === 'yesterday' && dateMode === 'single' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('yesterday')}
                        >
                            Yesterday
                        </button>
                        <button
                            type="button"
                            className={`preset-btn ${datePreset === 'last7' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('last7')}
                        >
                            7 Days
                        </button>
                        <button
                            type="button"
                            className={`preset-btn ${datePreset === 'thisMonth' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('thisMonth')}
                        >
                            Month
                        </button>
                    </div>

                    {/* 4. Date Mode Mode Toggle Pill */}
                    <button
                        type="button"
                        className={`att-mode-toggle-chip ${dateMode === 'range' ? 'is-range' : 'is-single'}`}
                        onClick={handleToggleDateMode}
                        title={dateMode === 'single' ? 'Switch to Date Range' : 'Switch to Single Date'}
                    >
                        <i className={`fas ${dateMode === 'single' ? 'fa-calendar-day' : 'fa-calendar-days'}`}></i>
                        <span>{dateMode === 'single' ? 'Single' : 'Range'}</span>
                    </button>

                    {/* 5. Date Picker Controls (Single Date or Range) */}
                    {dateMode === 'single' ? (
                        <div className="att-single-line-date-input">
                            <div className="att-input-with-icon">
                                <i className="fas fa-calendar-day"></i>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setDatePreset('custom');
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="att-range-inputs-inline">
                            <div className="att-input-with-icon">
                                <input
                                    type="date"
                                    value={fromDate}
                                    title="From date"
                                    onChange={(e) => {
                                        setFromDate(e.target.value);
                                        setDatePreset('custom');
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <span className="range-dash">-</span>
                            <div className="att-input-with-icon">
                                <input
                                    type="date"
                                    value={toDate}
                                    title="To date"
                                    onChange={(e) => {
                                        setToDate(e.target.value);
                                        setDatePreset('custom');
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* 6. Reset Filter Button (In the same line) */}
                    <button
                        type="button"
                        className={`att-inline-reset-btn ${isFilterActive ? 'active' : ''}`}
                        onClick={handleResetFilters}
                        disabled={!isFilterActive}
                        title="Reset all filters"
                    >
                        <i className="fas fa-rotate-left"></i>
                        <span>Reset</span>
                    </button>
                </div>

                {/* Table with tap-to-view details */}
                <div className="att-table-wrapper">
                    {loading ? (
                        <div className="att-state-loading">
                            <div className="att-spinner"></div>
                            <h3>Loading Attendance Records...</h3>
                        </div>
                    ) : error ? (
                        <div className="att-state-error">
                            <i className="fas fa-circle-exclamation"></i>
                            <h3>Could Not Load Attendance</h3>
                            <p>{error}</p>
                            <button
                                type="button"
                                className="att-btn-primary"
                                onClick={fetchAttendance}
                            >
                                <i className="fas fa-redo"></i> Retry
                            </button>
                        </div>
                    ) : displayedAttendance.length === 0 ? (
                        <div className="att-state-empty">
                            <i className="fas fa-clipboard-check empty-icon"></i>
                            <h3>No Attendance Records Found</h3>
                            <p>No punch records match your filters or selected date.</p>
                        </div>
                    ) : (
                        <div className="att-table-responsive">
                            <table className="att-main-table">
                                <thead>
                                    <tr>
                                        <th>User & Details</th>
                                        <th>Role</th>
                                        <th>Date & Check In</th>
                                        <th>Source</th>
                                        <th className="th-status">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedAttendance.map((rec) => {
                                        const roleInfo = getRoleBadgeInfo(rec.user_role);
                                        const sourceInfo = getSourceBadgeInfo(rec.source);
                                        const isCheckedIn =
                                            !rec.check_out_time ||
                                            rec.status === 'checked_in';

                                        return (
                                            <tr
                                                key={
                                                    rec.attendance_id ||
                                                    `${rec.user_id}-${rec.attendance_date}-${rec.check_in_time}`
                                                }
                                                className={`att-clickable-row ${isCheckedIn ? 'row-active-in' : ''}`}
                                                onClick={() => handleOpenRecordDetails(rec)}
                                                title="Tap to view full attendance details"
                                            >
                                                {/* User & Contact */}
                                                <td>
                                                    <div className="att-user-cell">
                                                        <div className="att-avatar-circle">
                                                            {(rec.user_name || 'U')
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="att-user-meta">
                                                            <span className="att-user-name">
                                                                {rec.user_name || 'User'}
                                                            </span>
                                                            <div className="att-user-sub-row">
                                                                <span className="att-regd-pill">
                                                                    ID: {rec.user_id || '--'}
                                                                </span>
                                                                {rec.user_phone && (
                                                                    <span className="att-user-phone">
                                                                        <i className="fas fa-phone"></i>{' '}
                                                                        {rec.user_phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {rec.user_email && (
                                                                <span className="att-user-email">
                                                                    {rec.user_email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td>
                                                    <span className={`att-badge ${roleInfo.className}`}>
                                                        <i className={`fas ${roleInfo.icon}`}></i>
                                                        <span>{roleInfo.label}</span>
                                                    </span>
                                                </td>

                                                {/* Date & Check In */}
                                                <td>
                                                    <div className="att-time-cell">
                                                        <span className="att-date-str">
                                                            {rec.attendance_date}
                                                        </span>
                                                        <span className="att-checkin-time">
                                                            <i className="fas fa-arrow-right-to-bracket text-success"></i>{' '}
                                                            {formatTimeOnly(rec.check_in_time)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Source */}
                                                <td>
                                                    <span className={`att-source-tag ${sourceInfo.className}`}>
                                                        <i className={`fas ${sourceInfo.icon}`}></i>
                                                        <span>{sourceInfo.label}</span>
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="td-status">
                                                    {isCheckedIn ? (
                                                        <span className="att-status-pill status-in">
                                                            <span className="live-dot"></span> Checked In
                                                        </span>
                                                    ) : (
                                                        <span className="att-status-pill status-out">
                                                            Checked Out
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {!loading && displayedAttendance.length > 0 && (
                        <div className="att-pagination-bar">
                            <div className="att-pagination-info">
                                <span>
                                    Page <strong>{paginationData.page || page}</strong> of{' '}
                                    <strong>{paginationData.total_pages || 1}</strong> (
                                    <strong>{paginationData.total || displayedAttendance.length}</strong> records)
                                </span>
                                <div className="att-limit-select-wrap">
                                    <span>Rows:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="att-pagination-controls">
                                <button
                                    type="button"
                                    className="att-page-btn"
                                    disabled={page <= 1}
                                    onClick={() => setPage(1)}
                                    title="First Page"
                                >
                                    <i className="fas fa-angles-left"></i>
                                </button>
                                <button
                                    type="button"
                                    className="att-page-btn"
                                    disabled={page <= 1}
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    title="Previous Page"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>

                                <span className="att-current-page-chip">
                                    {page} / {paginationData.total_pages || 1}
                                </span>

                                <button
                                    type="button"
                                    className="att-page-btn"
                                    disabled={page >= (paginationData.total_pages || 1)}
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.min(
                                                paginationData.total_pages || 1,
                                                prev + 1
                                            )
                                        )
                                    }
                                    title="Next Page"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                                <button
                                    type="button"
                                    className="att-page-btn"
                                    disabled={page >= (paginationData.total_pages || 1)}
                                    onClick={() =>
                                        setPage(paginationData.total_pages || 1)
                                    }
                                    title="Last Page"
                                >
                                    <i className="fas fa-angles-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ATTENDANCE RECORD DETAILS MODAL */}
            {showRecordModal && (
                <div
                    className="att-modal-overlay"
                    onClick={() => {
                        setShowRecordModal(false);
                        setRecordFullDetails(null);
                    }}
                >
                    <div
                        className="att-modal-container fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="att-modal-header">
                            <div className="modal-title-wrap">
                                <i className="fas fa-id-card-clip"></i>
                                <div>
                                    <h3>Attendance Details</h3>
                                    <span>Complete record & punch information</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="att-modal-close"
                                onClick={() => {
                                    setShowRecordModal(false);
                                    setRecordFullDetails(null);
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="att-modal-body">
                            {recordDetailsLoading ? (
                                <div className="att-modal-loading">
                                    <div className="att-spinner"></div>
                                    <p>Loading attendance details...</p>
                                </div>
                            ) : (
                                (() => {
                                    const data = recordFullDetails || selectedRecord;
                                    if (!data) return <p>No details available.</p>;
                                    const roleInfo = getRoleBadgeInfo(data.user_role);
                                    const sourceInfo = getSourceBadgeInfo(data.source);
                                    const isInside =
                                        !data.check_out_time ||
                                        data.status === 'checked_in';

                                    return (
                                        <div className="att-detail-sheet">
                                            {/* User Info Header Card */}
                                            <div className="modal-user-card">
                                                <div className="modal-user-avatar">
                                                    {(data.user_name || 'U')
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="modal-user-info">
                                                    <h4>{data.user_name || 'User'}</h4>
                                                    <div className="modal-user-chips">
                                                        <span className={`att-badge ${roleInfo.className}`}>
                                                            <i className={`fas ${roleInfo.icon}`}></i> {roleInfo.label}
                                                        </span>
                                                        <span className="mono-chip">ID: {data.user_id}</span>
                                                        {data.attendance_id && (
                                                            <span className="mono-chip">Record #{data.attendance_id}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Punch Timeline */}
                                            <div className="modal-timeline-card">
                                                <div className="timeline-node">
                                                    <div className="node-icon in">
                                                        <i className="fas fa-arrow-right-to-bracket"></i>
                                                    </div>
                                                    <div className="node-content">
                                                        <span className="node-title">Check In</span>
                                                        <span className="node-time">
                                                            {formatTimeOnly(data.check_in_time)}
                                                        </span>
                                                        <span className="node-sub">
                                                            {data.check_in_time || data.attendance_date}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="timeline-connector">
                                                    <div className="connector-line"></div>
                                                    <span className="connector-duration">
                                                        {isInside
                                                            ? 'Active (In Gym)'
                                                            : `Duration: ${formatDurationDisplay(data.duration_min)}`}
                                                    </span>
                                                </div>

                                                <div className="timeline-node">
                                                    <div className={`node-icon ${isInside ? 'active-pulse' : 'out'}`}>
                                                        <i
                                                            className={`fas ${
                                                                isInside
                                                                    ? 'fa-door-open'
                                                                    : 'fa-arrow-right-from-bracket'
                                                            }`}
                                                        ></i>
                                                    </div>
                                                    <div className="node-content">
                                                        <span className="node-title">Check Out</span>
                                                        <span className="node-time">
                                                            {isInside
                                                                ? 'Inside Gym'
                                                                : formatTimeOnly(data.check_out_time)}
                                                        </span>
                                                        <span className="node-sub">
                                                            {isInside
                                                                ? 'No checkout yet'
                                                                : data.check_out_time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meta Details Grid */}
                                            <div className="modal-info-grid">
                                                <div className="modal-info-item">
                                                    <span className="info-lbl">Date</span>
                                                    <span className="info-val">{data.attendance_date}</span>
                                                </div>
                                                <div className="modal-info-item">
                                                    <span className="info-lbl">Source Device</span>
                                                    <span className="info-val">
                                                        <i className={`fas ${sourceInfo.icon}`}></i> {sourceInfo.label}
                                                    </span>
                                                </div>
                                                <div className="modal-info-item">
                                                    <span className="info-lbl">Phone</span>
                                                    <span className="info-val">{data.user_phone || 'N/A'}</span>
                                                </div>
                                                <div className="modal-info-item">
                                                    <span className="info-lbl">Email</span>
                                                    <span className="info-val">{data.user_email || 'N/A'}</span>
                                                </div>
                                                <div className="modal-info-item">
                                                    <span className="info-lbl">Branch</span>
                                                    <span className="info-val">{data.branch_name || 'Main Branch'}</span>
                                                </div>
                                                <div className="modal-info-item">
                                                    <span className="info-lbl">Gym Name</span>
                                                    <span className="info-val">{data.gym_name || 'Fitness Guru'}</span>
                                                </div>
                                            </div>

                                            {data.remarks && (
                                                <div className="modal-remarks-box">
                                                    <span className="remarks-label">Remarks:</span>
                                                    <p>{data.remarks}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
