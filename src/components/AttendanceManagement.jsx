import React, { useState, useEffect } from 'react';
import './AttendanceManagement.css';
import { tokenManager } from '../utils/tokenManager';

const AttendanceManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterBranch, setFilterBranch] = useState('ALL');

    // API data states
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionsData, setSessionsData] = useState(null);
    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [gymId, setGymId] = useState(null);

    // Modal states
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [showManualEntryModal, setShowManualEntryModal] = useState(false);

    // Manual entry form data
    const [manualEntryData, setManualEntryData] = useState({
        user_name: '',
        role_type: 'MEMBER',
        branch_name: '',
        attendance_date: new Date().toISOString().split('T')[0],
        check_in_time: '',
        check_out_time: '',
        remarks: ''
    });

    // API Functions
    const fetchGymBranches = async () => {
        try {
            setBranchesLoading(true);
            const userData = tokenManager.getUserData();
            
            if (!userData || !userData.gym_id) {
                console.error('No gym_id found in user data');
                return;
            }
            
            setGymId(userData.gym_id);
            
            const url = `${tokenManager.API_BASE_URL}/api/gymBranchList?gym_id=${userData.gym_id}`;
            
            const response = await tokenManager.apiCall(url, {
                method: 'GET'
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setBranches(data.data || []);
            } else {
                console.error('Failed to fetch gym branches:', data.message);
            }
        } catch (error) {
            console.error('Error fetching gym branches:', error);
        } finally {
            setBranchesLoading(false);
        }
    };

    const fetchAttendanceLogs = async () => {
        try {
            setLoading(true);
            setError('');
            
            const queryParams = new URLSearchParams();
            
            // Always pass from_date and to_date
            const dateToUse = filterDate || new Date().toISOString().split('T')[0];
            queryParams.append('from_date', dateToUse);
            queryParams.append('to_date', dateToUse);
            
            // Add other filters if needed
            if (filterBranch && filterBranch !== 'ALL') {
                const selectedBranch = branches.find(branch => branch.branch_name === filterBranch);
                if (selectedBranch) {
                    queryParams.append('branch_id', selectedBranch.branch_id.toString());
                }
            }
            
            queryParams.append('page', pagination.page.toString());
            queryParams.append('limit', pagination.limit.toString());
            
            const url = `${tokenManager.API_BASE_URL}/api/attendance/viewAttendanceList?${queryParams.toString()}`;
            
            const response = await tokenManager.apiCall(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setAttendanceLogs(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch attendance logs');
            }
        } catch (error) {
            console.error('Error fetching attendance logs:', error);
            setError('Failed to fetch attendance logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserSessions = async (userId, date) => {
        try {
            setSessionsLoading(true);
            
            const url = `${tokenManager.API_BASE_URL}/api/attendance/userSessions?user_id=${userId}&date=${date}`;
            
            const response = await tokenManager.apiCall(url, {
                method: 'GET'
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setSessionsData(data.data);
            } else {
                setError(data.message || 'Failed to fetch user sessions');
                setSessionsData(null);
            }
        } catch (error) {
            console.error('Error fetching user sessions:', error);
            setError('Failed to fetch user sessions. Please try again.');
            setSessionsData(null);
        } finally {
            setSessionsLoading(false);
        }
    };

    // useEffect to fetch data on component mount and filter changes
    useEffect(() => {
        fetchGymBranches();
    }, []);
    
    useEffect(() => {
        if (branches.length > 0) {
            fetchAttendanceLogs();
        }
    }, [pagination.page, pagination.limit, filterDate, filterBranch, branches]);

    // Filter attendance logs
    const filteredLogs = attendanceLogs.filter(log => {
        const matchesSearch = 
            log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.phone.includes(searchQuery) ||
            log.branch_name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = filterRole === 'ALL' || log.role === filterRole;
        const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
        const matchesDate = !filterDate || log.attendance_date === filterDate;
        const matchesBranch = filterBranch === 'ALL' || log.branch_name === filterBranch;

        return matchesSearch && matchesRole && matchesStatus && matchesDate && matchesBranch;
    });

    // Get statistics
    const getStats = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = attendanceLogs.filter(log => log.attendance_date === today);
        
        const totalPresent = todayLogs.filter(log => log.status !== 'ABSENT').length;
        const totalAbsent = todayLogs.filter(log => log.status === 'ABSENT').length;
        const onTime = todayLogs.filter(log => log.status === 'ON_TIME').length;
        const late = todayLogs.filter(log => log.status === 'LATE').length;
        const avgDuration = todayLogs.length > 0
            ? Math.round(todayLogs.reduce((sum, log) => sum + log.total_duration_min, 0) / todayLogs.length)
            : 0;

        const attendanceRate = todayLogs.length > 0
            ? Math.round((totalPresent / todayLogs.length) * 100)
            : 0;

        return { totalPresent, totalAbsent, onTime, late, avgDuration, attendanceRate };
    };

    const stats = getStats();

    // Handlers
    const handleViewSessions = async (attendance) => {
        setSelectedAttendance(attendance);
        setShowSessionsModal(true);
        setSessionsData(null); // Clear previous data
        // Fetch sessions for this user and date
        await fetchUserSessions(attendance.user_id, attendance.attendance_date);
    };

    const handleDateFilterChange = (date) => {
        setFilterDate(date);
        // The useEffect will automatically refetch when filterDate changes
    };

    const handleCloseSessionsModal = () => {
        setShowSessionsModal(false);
        setSelectedAttendance(null);
        setSessionsData(null);
        setError(''); // Clear any error messages
    };

    const handleManualEntry = () => {
        setManualEntryData({
            user_name: '',
            role_type: 'MEMBER',
            branch_name: '',
            attendance_date: new Date().toISOString().split('T')[0],
            check_in_time: '',
            check_out_time: '',
            remarks: ''
        });
        setShowManualEntryModal(true);
    };

    const handleManualEntrySubmit = (e) => {
        e.preventDefault();
        
        const checkIn = new Date(`${manualEntryData.attendance_date}T${manualEntryData.check_in_time}`);
        const checkOut = manualEntryData.check_out_time 
            ? new Date(`${manualEntryData.attendance_date}T${manualEntryData.check_out_time}`)
            : null;
        
        const duration = checkOut 
            ? Math.round((checkOut - checkIn) / (1000 * 60))
            : 0;

        const newLog = {
            attendance_id: attendanceLogs.length + 1,
            user_id: 9000 + attendanceLogs.length,
            user_name: manualEntryData.user_name,
            email: `${manualEntryData.user_name.toLowerCase().replace(' ', '.')}@email.com`,
            phone: '9800000000',
            role_type: manualEntryData.role_type,
            branch_name: manualEntryData.branch_name,
            shift_name: null,
            attendance_date: manualEntryData.attendance_date,
            total_sessions: 1,
            total_duration_min: duration,
            status: 'MANUAL_ENTRY',
            sessions: [{
                session_id: attendanceLogs.length + 1,
                session_no: 1,
                check_in_time: `${manualEntryData.attendance_date} ${manualEntryData.check_in_time}:00`,
                check_out_time: checkOut ? `${manualEntryData.attendance_date} ${manualEntryData.check_out_time}:00` : null,
                duration_min: duration,
                source: 'ADMIN_ENTRY',
                remarks: manualEntryData.remarks
            }]
        };

        setAttendanceLogs([newLog, ...attendanceLogs]);
        alert('Manual attendance entry added successfully!');
        setShowManualEntryModal(false);
    };

    const handleDeleteAttendance = (attendance) => {
        if (window.confirm(`Delete attendance record for ${attendance.user_name} on ${attendance.attendance_date}?`)) {
            setAttendanceLogs(attendanceLogs.filter(log => log.attendance_id !== attendance.attendance_id));
            alert('Attendance record deleted successfully!');
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ON_TIME': 'att-status-on-time',
            'LATE': 'att-status-late',
            'EARLY_OUT': 'att-status-early-out',
            'ABSENT': 'att-status-absent',
            'PARTIAL': 'att-status-partial',
            'MANUAL_ENTRY': 'att-status-manual'
        };
        return statusMap[status] || '';
    };

    const getRoleBadgeClass = (role) => {
        const roleMap = {
            'MEMBER': 'att-role-member',
            'TRAINER': 'att-role-trainer',
            'STAFF': 'att-role-staff'
        };
        return roleMap[role] || '';
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatDateTime = (datetime) => {
        if (!datetime) return 'N/A';
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="attendance-management">
            {/* Header */}
            <div className="att-header">
                <div>
                    <h1 className="att-title">Attendance Management</h1>
                    <p className="att-subtitle">Track and manage member, trainer, and staff attendance</p>
                </div>
                <div className="att-header-actions">
                    <button 
                        onClick={handleManualEntry}
                        className="att-btn-primary"
                        title="Add Manual Entry"
                    >
                        <i className="fas fa-plus"></i>
                        Manual Entry
                    </button>
                    <button 
                        onClick={fetchAttendanceLogs} 
                        className="att-btn-secondary"
                        disabled={loading}
                        title="Refresh Data"
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="att-stats-bar">
                <div className="att-stat-item">
                    <i className="fas fa-user-check"></i>
                    <div>
                        <span className="att-stat-label">Present Today</span>
                        <span className="att-stat-value">{stats.totalPresent}</span>
                    </div>
                </div>
                <div className="att-stat-item">
                    <i className="fas fa-user-times"></i>
                    <div>
                        <span className="att-stat-label">Absent Today</span>
                        <span className="att-stat-value">{stats.totalAbsent}</span>
                    </div>
                </div>
                <div className="att-stat-item">
                    <i className="fas fa-clock"></i>
                    <div>
                        <span className="att-stat-label">On Time</span>
                        <span className="att-stat-value">{stats.onTime}</span>
                    </div>
                </div>
                <div className="att-stat-item">
                    <i className="fas fa-exclamation-circle"></i>
                    <div>
                        <span className="att-stat-label">Late</span>
                        <span className="att-stat-value">{stats.late}</span>
                    </div>
                </div>
                <div className="att-stat-item">
                    <i className="fas fa-hourglass-half"></i>
                    <div>
                        <span className="att-stat-label">Avg Duration</span>
                        <span className="att-stat-value">{formatDuration(stats.avgDuration)}</span>
                    </div>
                </div>
                <div className="att-stat-item">
                    <i className="fas fa-percentage"></i>
                    <div>
                        <span className="att-stat-label">Attendance Rate</span>
                        <span className="att-stat-value">{stats.attendanceRate}%</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="att-filters">
                <div className="att-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, branch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="att-clear-search" onClick={() => setSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="att-filter">
                    <option value="ALL">All Roles</option>
                    <option value="MEMBER">Members</option>
                    <option value="TRAINER">Trainers</option>
                    <option value="STAFF">Staff</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="att-filter">
                    <option value="ALL">All Status</option>
                    <option value="ON_TIME">On Time</option>
                    <option value="LATE">Late</option>
                    <option value="EARLY_OUT">Early Out</option>
                    <option value="ABSENT">Absent</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="MANUAL_ENTRY">Manual Entry</option>
                </select>
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="att-filter" disabled={branchesLoading}>
                    <option value="ALL">{branchesLoading ? 'Loading branches...' : 'All Branches'}</option>
                    {branches.map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_name}>
                            {branch.branch_name}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="att-filter"
                />
                {(filterDate !== new Date().toISOString().split('T')[0] || filterRole !== 'ALL' || filterStatus !== 'ALL' || filterBranch !== 'ALL' || searchQuery) && (
                    <button 
                        className="att-clear-filters"
                        onClick={() => {
                            setFilterRole('ALL');
                            setFilterStatus('ALL');
                            setFilterDate(new Date().toISOString().split('T')[0]);
                            setFilterBranch('ALL');
                            setSearchQuery('');
                            // Data will be refetched automatically by useEffect
                        }}
                        title="Clear all filters"
                    >
                        <i className="fas fa-times"></i>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Attendance Table */}
            <div className="att-table-container">
                <table className="att-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Details</th>
                            <th>Role</th>
                            <th>Branch</th>
                            <th>Date</th>
                            <th>Sessions</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error && (
                            <tr>
                                <td colSpan="9" className="att-error">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <p>{error}</p>
                                    <button onClick={fetchAttendanceLogs} className="att-btn-primary att-btn-sm">
                                        <i className="fas fa-redo"></i> Retry
                                    </button>
                                </td>
                            </tr>
                        )}
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="att-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Loading attendance records...</p>
                                </td>
                            </tr>
                        ) : !error && filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="att-no-data">
                                    <i className="fas fa-inbox"></i>
                                    <p>No attendance records found</p>
                                </td>
                            </tr>
                        ) : !error && (
                            filteredLogs.map((log) => (
                                <tr key={log.attendance_id}>
                                    <td data-label="ID">#{log.attendance_id}</td>
                                    <td data-label="User Details">
                                        <div className="att-user-info">
                                            <strong>{log.user_name}</strong>
                                            <span>{log.phone}</span>
                                            <span>{log.gender} - {log.date_of_birth}</span>
                                        </div>
                                    </td>
                                    <td data-label="Role">
                                        <span className={`att-role-badge ${getRoleBadgeClass(log.role)}`}>
                                            {log.role}
                                        </span>
                                    </td>
                                    <td data-label="Branch">
                                        <span className="att-branch-tag">{log.branch_name}</span>
                                        <div className="att-location-info">
                                            <small>{log.district_name}, {log.state_name}</small>
                                        </div>
                                        {log.shift_name && (
                                            <span className="att-shift-tag">{log.shift_name}</span>
                                        )}
                                    </td>
                                    <td data-label="Date">{log.attendance_date}</td>
                                    <td data-label="Sessions">
                                        <span className="att-session-count">{log.total_sessions}</span>
                                    </td>
                                    <td data-label="Duration">
                                        <span className="att-duration">{formatDuration(log.total_duration_min)}</span>
                                    </td>
                                    <td data-label="Status">
                                        <span className={`att-status-badge ${getStatusBadgeClass(log.status)}`}>
                                            {log.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="att-action-buttons">
                                            <button
                                                className="att-action-btn view"
                                                onClick={() => handleViewSessions(log)}
                                                title="View Sessions"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="att-action-btn mark"
                                                onClick={() => alert(`Mark attendance feature for ${log.user_name} coming soon!`)}
                                                title="Mark Attendance"
                                            >
                                                <i className="fas fa-user-check"></i>
                                            </button>
                                            {log.status === 'MANUAL_ENTRY' && (
                                                <button
                                                    className="att-action-btn delete"
                                                    onClick={() => handleDeleteAttendance(log)}
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Sessions Modal */}
            {showSessionsModal && selectedAttendance && (
                <div className="att-modal-overlay" onClick={handleCloseSessionsModal}>
                    <div className="att-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="att-modal-header">
                            <h2><i className="fas fa-list"></i> Attendance Sessions</h2>
                            <button className="att-modal-close" onClick={handleCloseSessionsModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="att-modal-body">
                            {sessionsLoading ? (
                                <div className="att-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Loading sessions...</p>
                                </div>
                            ) : sessionsData ? (
                                <>
                                    {/* User Info */}
                                    <div className="att-detail-section">
                                        <h3><i className="fas fa-user"></i> User Information</h3>
                                        <div className="att-detail-grid">
                                            <div className="att-detail-item">
                                                <label>Name</label>
                                                <span>{sessionsData.user.name}</span>
                                            </div>
                                            <div className="att-detail-item">
                                                <label>Email</label>
                                                <span>{sessionsData.user.email}</span>
                                            </div>
                                            <div className="att-detail-item">
                                                <label>Phone</label>
                                                <span>{sessionsData.user.phone}</span>
                                            </div>
                                            <div className="att-detail-item">
                                                <label>Role</label>
                                                <span className={`att-role-badge ${getRoleBadgeClass(sessionsData.user.role)}`}>
                                                    {sessionsData.user.role}
                                                </span>
                                            </div>
                                            <div className="att-detail-item">
                                                <label>Branch</label>
                                                <span>{sessionsData.user.branch}</span>
                                            </div>
                                            <div className="att-detail-item">
                                                <label>Date</label>
                                                <span>{sessionsData.user.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="att-detail-section">
                                        <h3><i className="fas fa-chart-bar"></i> Attendance Summary</h3>
                                        <div className="att-detail-grid">
                                            <div className="att-detail-item">
                                                <label>Total Sessions</label>
                                                <span>{sessionsData.attendance_summary.total_sessions}</span>
                                            </div>
                                            <div className="att-detail-item">
                                                <label>Total Duration</label>
                                                <span>{sessionsData.attendance_summary.total_duration} minutes</span>
                                            </div>
                                            <div className="att-detail-item">
                                                <label>Status</label>
                                                <span className={`att-status-badge ${getStatusBadgeClass(sessionsData.attendance_summary.status)}`}>
                                                    {sessionsData.attendance_summary.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sessions List */}
                                    <div className="att-detail-section">
                                        <h3><i className="fas fa-clock"></i> Session Details</h3>
                                        {sessionsData.sessions.length === 0 ? (
                                            <div className="att-no-sessions">
                                                <i className="fas fa-calendar-times"></i>
                                                <p>No sessions recorded</p>
                                            </div>
                                        ) : (
                                            <div className="att-sessions-list">
                                                {sessionsData.sessions.map((session, index) => (
                                                    <div key={index} className="att-session-card">
                                                        <div className="att-session-header">
                                                            <span className="att-session-number">Session #{session.session_no}</span>
                                                            <span className={`att-source-badge source-${session.device.toLowerCase()}`}>
                                                                {session.device}
                                                            </span>
                                                        </div>
                                                        <div className="att-session-times">
                                                            <div className="att-time-item">
                                                                <i className="fas fa-sign-in-alt"></i>
                                                                <div>
                                                                    <label>Check In</label>
                                                                    <span>{session.check_in}</span>
                                                                </div>
                                                            </div>
                                                            <div className="att-time-separator">
                                                                <i className="fas fa-arrow-right"></i>
                                                            </div>
                                                            <div className="att-time-item">
                                                                <i className="fas fa-sign-out-alt"></i>
                                                                <div>
                                                                    <label>Check Out</label>
                                                                    <span>{session.check_out}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="att-session-duration">
                                                            <i className="fas fa-hourglass-half"></i>
                                                            <span>Duration: {session.duration}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="att-no-data">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <p>Failed to load session data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Entry Modal */}
            {showManualEntryModal && (
                <div className="att-modal-overlay" onClick={() => setShowManualEntryModal(false)}>
                    <div className="att-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="att-modal-header">
                            <h2><i className="fas fa-plus"></i> Manual Attendance Entry</h2>
                            <button className="att-modal-close" onClick={() => setShowManualEntryModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleManualEntrySubmit} className="att-modal-body">
                            <div className="att-form-group">
                                <label>User Name *</label>
                                <input
                                    type="text"
                                    value={manualEntryData.user_name}
                                    onChange={(e) => setManualEntryData({ ...manualEntryData, user_name: e.target.value })}
                                    placeholder="Enter user name"
                                    required
                                />
                            </div>
                            <div className="att-form-row">
                                <div className="att-form-group">
                                    <label>Role *</label>
                                    <select
                                        value={manualEntryData.role_type}
                                        onChange={(e) => setManualEntryData({ ...manualEntryData, role_type: e.target.value })}
                                        required
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="TRAINER">Trainer</option>
                                        <option value="STAFF">Staff</option>
                                    </select>
                                </div>
                                <div className="att-form-group">
                                    <label>Branch *</label>
                                    <select
                                        value={manualEntryData.branch_name}
                                        onChange={(e) => setManualEntryData({ ...manualEntryData, branch_name: e.target.value })}
                                        required
                                        disabled={branchesLoading}
                                    >
                                        <option value="">{branchesLoading ? 'Loading branches...' : 'Select Branch'}</option>
                                        {branches.map((branch) => (
                                            <option key={branch.branch_id} value={branch.branch_name}>
                                                {branch.branch_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="att-form-group">
                                <label>Attendance Date *</label>
                                <input
                                    type="date"
                                    value={manualEntryData.attendance_date}
                                    onChange={(e) => setManualEntryData({ ...manualEntryData, attendance_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="att-form-row">
                                <div className="att-form-group">
                                    <label>Check In Time *</label>
                                    <input
                                        type="time"
                                        value={manualEntryData.check_in_time}
                                        onChange={(e) => setManualEntryData({ ...manualEntryData, check_in_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="att-form-group">
                                    <label>Check Out Time</label>
                                    <input
                                        type="time"
                                        value={manualEntryData.check_out_time}
                                        onChange={(e) => setManualEntryData({ ...manualEntryData, check_out_time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="att-form-group">
                                <label>Remarks *</label>
                                <textarea
                                    value={manualEntryData.remarks}
                                    onChange={(e) => setManualEntryData({ ...manualEntryData, remarks: e.target.value })}
                                    rows="3"
                                    placeholder="Reason for manual entry..."
                                    required
                                />
                            </div>
                            <div className="att-modal-actions">
                                <button type="button" className="att-btn-secondary" onClick={() => setShowManualEntryModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="att-btn-primary">
                                    Add Attendance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
