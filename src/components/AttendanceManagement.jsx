import React, { useState } from 'react';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');
    const [filterBranch, setFilterBranch] = useState('ALL');

    // Attendance logs state with sample data
    const [attendanceLogs, setAttendanceLogs] = useState([
        {
            attendance_id: 1,
            user_id: 1001,
            user_name: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '9876543210',
            role_type: 'MEMBER',
            branch_name: 'Koramangala Branch',
            shift_name: 'Morning Shift',
            attendance_date: '2024-12-15',
            total_sessions: 1,
            total_duration_min: 90,
            status: 'ON_TIME',
            sessions: [
                {
                    session_id: 1,
                    session_no: 1,
                    check_in_time: '2024-12-15 06:30:00',
                    check_out_time: '2024-12-15 08:00:00',
                    duration_min: 90,
                    source: 'DEVICE',
                    remarks: null
                }
            ]
        },
        {
            attendance_id: 2,
            user_id: 1002,
            user_name: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            phone: '9876543211',
            role_type: 'MEMBER',
            branch_name: 'Whitefield Branch',
            shift_name: 'Evening Shift',
            attendance_date: '2024-12-15',
            total_sessions: 2,
            total_duration_min: 120,
            status: 'ON_TIME',
            sessions: [
                {
                    session_id: 2,
                    session_no: 1,
                    check_in_time: '2024-12-15 10:00:00',
                    check_out_time: '2024-12-15 11:00:00',
                    duration_min: 60,
                    source: 'DEVICE',
                    remarks: null
                },
                {
                    session_id: 3,
                    session_no: 2,
                    check_in_time: '2024-12-15 18:00:00',
                    check_out_time: '2024-12-15 19:00:00',
                    duration_min: 60,
                    source: 'WEB',
                    remarks: 'Manual check-in'
                }
            ]
        },
        {
            attendance_id: 3,
            user_id: 2001,
            user_name: 'Amit Sharma',
            email: 'amit.sharma@email.com',
            phone: '9876543220',
            role_type: 'TRAINER',
            branch_name: 'Koramangala Branch',
            shift_name: 'Morning Shift',
            attendance_date: '2024-12-15',
            total_sessions: 1,
            total_duration_min: 480,
            status: 'ON_TIME',
            sessions: [
                {
                    session_id: 4,
                    session_no: 1,
                    check_in_time: '2024-12-15 06:00:00',
                    check_out_time: '2024-12-15 14:00:00',
                    duration_min: 480,
                    source: 'DEVICE',
                    remarks: null
                }
            ]
        },
        {
            attendance_id: 4,
            user_id: 1003,
            user_name: 'Amit Verma',
            email: 'amit.verma@email.com',
            phone: '9876543212',
            role_type: 'MEMBER',
            branch_name: 'Bangalore Main',
            shift_name: 'Morning Shift',
            attendance_date: '2024-12-15',
            total_sessions: 1,
            total_duration_min: 45,
            status: 'EARLY_OUT',
            sessions: [
                {
                    session_id: 5,
                    session_no: 1,
                    check_in_time: '2024-12-15 07:00:00',
                    check_out_time: '2024-12-15 07:45:00',
                    duration_min: 45,
                    source: 'DEVICE',
                    remarks: 'Left early due to emergency'
                }
            ]
        },
        {
            attendance_id: 5,
            user_id: 1004,
            user_name: 'Sneha Patel',
            email: 'sneha.patel@email.com',
            phone: '9876543213',
            role_type: 'MEMBER',
            branch_name: 'Koramangala Branch',
            shift_name: 'Evening Shift',
            attendance_date: '2024-12-15',
            total_sessions: 1,
            total_duration_min: 75,
            status: 'LATE',
            sessions: [
                {
                    session_id: 6,
                    session_no: 1,
                    check_in_time: '2024-12-15 19:30:00',
                    check_out_time: '2024-12-15 20:45:00',
                    duration_min: 75,
                    source: 'DEVICE',
                    remarks: 'Arrived 30 minutes late'
                }
            ]
        },
        {
            attendance_id: 6,
            user_id: 3001,
            user_name: 'Vikram Singh',
            email: 'vikram.singh@email.com',
            phone: '9876543230',
            role_type: 'STAFF',
            branch_name: 'Bangalore Main',
            shift_name: 'Full Day',
            attendance_date: '2024-12-15',
            total_sessions: 1,
            total_duration_min: 540,
            status: 'ON_TIME',
            sessions: [
                {
                    session_id: 7,
                    session_no: 1,
                    check_in_time: '2024-12-15 08:00:00',
                    check_out_time: '2024-12-15 17:00:00',
                    duration_min: 540,
                    source: 'DEVICE',
                    remarks: null
                }
            ]
        },
        {
            attendance_id: 7,
            user_id: 1005,
            user_name: 'Rahul Mehta',
            email: 'rahul.mehta@email.com',
            phone: '9876543214',
            role_type: 'MEMBER',
            branch_name: 'Whitefield Branch',
            shift_name: 'Morning Shift',
            attendance_date: '2024-12-14',
            total_sessions: 1,
            total_duration_min: 60,
            status: 'PARTIAL',
            sessions: [
                {
                    session_id: 8,
                    session_no: 1,
                    check_in_time: '2024-12-14 06:30:00',
                    check_out_time: '2024-12-14 07:30:00',
                    duration_min: 60,
                    source: 'DEVICE',
                    remarks: 'Partial attendance'
                }
            ]
        },
        {
            attendance_id: 8,
            user_id: 1006,
            user_name: 'Kavita Singh',
            email: 'kavita.singh@email.com',
            phone: '9876543215',
            role_type: 'MEMBER',
            branch_name: 'Bangalore Main',
            shift_name: 'Evening Shift',
            attendance_date: '2024-12-14',
            total_sessions: 0,
            total_duration_min: 0,
            status: 'ABSENT',
            sessions: []
        },
        {
            attendance_id: 9,
            user_id: 1007,
            user_name: 'Deepak Kumar',
            email: 'deepak.kumar@email.com',
            phone: '9876543216',
            role_type: 'MEMBER',
            branch_name: 'Koramangala Branch',
            shift_name: null,
            attendance_date: '2024-12-14',
            total_sessions: 1,
            total_duration_min: 120,
            status: 'MANUAL_ENTRY',
            sessions: [
                {
                    session_id: 9,
                    session_no: 1,
                    check_in_time: '2024-12-14 10:00:00',
                    check_out_time: '2024-12-14 12:00:00',
                    duration_min: 120,
                    source: 'ADMIN_ENTRY',
                    remarks: 'Manually added by admin - device malfunction'
                }
            ]
        }
    ]);

    // Modal states
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [showManualEntryModal, setShowManualEntryModal] = useState(false);

    // Manual entry form data
    const [manualEntryData, setManualEntryData] = useState({
        user_name: '',
        role_type: 'MEMBER',
        branch_name: 'Bangalore Main',
        attendance_date: new Date().toISOString().split('T')[0],
        check_in_time: '',
        check_out_time: '',
        remarks: ''
    });

    // Filter attendance logs
    const filteredLogs = attendanceLogs.filter(log => {
        const matchesSearch = 
            log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.phone.includes(searchQuery) ||
            log.branch_name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = filterRole === 'ALL' || log.role_type === filterRole;
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
    const handleViewSessions = (attendance) => {
        setSelectedAttendance(attendance);
        setShowSessionsModal(true);
    };

    const handleManualEntry = () => {
        setManualEntryData({
            user_name: '',
            role_type: 'MEMBER',
            branch_name: 'Bangalore Main',
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
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="att-filter">
                    <option value="ALL">All Branches</option>
                    <option value="Bangalore Main">Bangalore Main</option>
                    <option value="Whitefield Branch">Whitefield Branch</option>
                    <option value="Koramangala Branch">Koramangala Branch</option>
                </select>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="att-filter"
                />
                {(filterDate || filterRole !== 'ALL' || filterStatus !== 'ALL' || filterBranch !== 'ALL') && (
                    <button 
                        className="att-clear-filters"
                        onClick={() => {
                            setFilterRole('ALL');
                            setFilterStatus('ALL');
                            setFilterDate('');
                            setFilterBranch('ALL');
                        }}
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
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="att-no-data">
                                    <i className="fas fa-inbox"></i>
                                    <p>No attendance records found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.attendance_id}>
                                    <td data-label="ID">#{log.attendance_id}</td>
                                    <td data-label="User Details">
                                        <div className="att-user-info">
                                            <strong>{log.user_name}</strong>
                                            <span>{log.email}</span>
                                            <span>{log.phone}</span>
                                        </div>
                                    </td>
                                    <td data-label="Role">
                                        <span className={`att-role-badge ${getRoleBadgeClass(log.role_type)}`}>
                                            {log.role_type}
                                        </span>
                                    </td>
                                    <td data-label="Branch">
                                        <span className="att-branch-tag">{log.branch_name}</span>
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
                <div className="att-modal-overlay" onClick={() => setShowSessionsModal(false)}>
                    <div className="att-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="att-modal-header">
                            <h2><i className="fas fa-list"></i> Attendance Sessions</h2>
                            <button className="att-modal-close" onClick={() => setShowSessionsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="att-modal-body">
                            {/* User Info */}
                            <div className="att-detail-section">
                                <h3><i className="fas fa-user"></i> User Information</h3>
                                <div className="att-detail-grid">
                                    <div className="att-detail-item">
                                        <label>Name</label>
                                        <span>{selectedAttendance.user_name}</span>
                                    </div>
                                    <div className="att-detail-item">
                                        <label>Email</label>
                                        <span>{selectedAttendance.email}</span>
                                    </div>
                                    <div className="att-detail-item">
                                        <label>Phone</label>
                                        <span>{selectedAttendance.phone}</span>
                                    </div>
                                    <div className="att-detail-item">
                                        <label>Role</label>
                                        <span className={`att-role-badge ${getRoleBadgeClass(selectedAttendance.role_type)}`}>
                                            {selectedAttendance.role_type}
                                        </span>
                                    </div>
                                    <div className="att-detail-item">
                                        <label>Branch</label>
                                        <span>{selectedAttendance.branch_name}</span>
                                    </div>
                                    <div className="att-detail-item">
                                        <label>Date</label>
                                        <span>{selectedAttendance.attendance_date}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="att-detail-section">
                                <h3><i className="fas fa-chart-bar"></i> Attendance Summary</h3>
                                <div className="att-detail-grid">
                                    <div className="att-detail-item">
                                        <label>Total Sessions</label>
                                        <span>{selectedAttendance.total_sessions}</span>
                                    </div>
                                    <div className="att-detail-item">
                                        <label>Total Duration</label>
                                        <span>{formatDuration(selectedAttendance.total_duration_min)}</span>
                                    </div>
                                    <div className="att-detail-item">
                                        <label>Status</label>
                                        <span className={`att-status-badge ${getStatusBadgeClass(selectedAttendance.status)}`}>
                                            {selectedAttendance.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sessions List */}
                            <div className="att-detail-section">
                                <h3><i className="fas fa-clock"></i> Session Details</h3>
                                {selectedAttendance.sessions.length === 0 ? (
                                    <div className="att-no-sessions">
                                        <i className="fas fa-calendar-times"></i>
                                        <p>No sessions recorded</p>
                                    </div>
                                ) : (
                                    <div className="att-sessions-list">
                                        {selectedAttendance.sessions.map((session) => (
                                            <div key={session.session_id} className="att-session-card">
                                                <div className="att-session-header">
                                                    <span className="att-session-number">Session #{session.session_no}</span>
                                                    <span className={`att-source-badge source-${session.source.toLowerCase()}`}>
                                                        {session.source}
                                                    </span>
                                                </div>
                                                <div className="att-session-times">
                                                    <div className="att-time-item">
                                                        <i className="fas fa-sign-in-alt"></i>
                                                        <div>
                                                            <label>Check In</label>
                                                            <span>{formatDateTime(session.check_in_time)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="att-time-separator">
                                                        <i className="fas fa-arrow-right"></i>
                                                    </div>
                                                    <div className="att-time-item">
                                                        <i className="fas fa-sign-out-alt"></i>
                                                        <div>
                                                            <label>Check Out</label>
                                                            <span>{formatDateTime(session.check_out_time)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="att-session-duration">
                                                    <i className="fas fa-hourglass-half"></i>
                                                    <span>Duration: {formatDuration(session.duration_min || 0)}</span>
                                                </div>
                                                {session.remarks && (
                                                    <div className="att-session-remarks">
                                                        <i className="fas fa-comment"></i>
                                                        <span>{session.remarks}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                    >
                                        <option value="Bangalore Main">Bangalore Main</option>
                                        <option value="Whitefield Branch">Whitefield Branch</option>
                                        <option value="Koramangala Branch">Koramangala Branch</option>
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
