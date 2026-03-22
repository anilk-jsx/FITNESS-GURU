import React, { useState, useEffect } from 'react';
import './ManualAttendanceEntry.css';
import { tokenManager } from '../utils/tokenManager';

const ManualAttendanceEntry = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterBranch, setFilterBranch] = useState('ALL');

    // API data states
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [gymId, setGymId] = useState(null);

    // Track user sessions for today
    const [userSessions, setUserSessions] = useState({});
    const [processingUsers, setProcessingUsers] = useState(new Set());
    const [loadingSessions, setLoadingSessions] = useState(false);

    // Get current date
    const currentDate = new Date().toISOString().split('T')[0];

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

    const fetchUserSessions = async (userId, date) => {
        try {
            const url = `${tokenManager.API_BASE_URL}/api/attendance/userSessions?user_id=${userId}&date=${date}`;

            const response = await tokenManager.apiCall(url, {
                method: 'GET'
            });

            const data = await response.json();

            if (data.status === 'success' && data.data) {
                return data.data;
            } else {
                console.warn(`No session data found for user ${userId} on ${date}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching sessions for user ${userId}:`, error);
            return null;
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            // Using the provided API endpoint
            const url = 'https://test-api.fitnessguru.org.in/api/users/list';

            const response = await tokenManager.apiCall(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            // Handle different possible response structures
            let usersList = [];

            if (data.status === 'success') {
                if (Array.isArray(data.data)) {
                    usersList = data.data;
                } else if (Array.isArray(data.users)) {
                    usersList = data.users;
                } else if (data.data && typeof data.data === 'object') {
                    // If data.data is an object, try to extract array from it
                    usersList = Object.values(data.data).flat().filter(item =>
                        item && typeof item === 'object' && (item.user_id || item.id)
                    );
                }
            } else if (Array.isArray(data)) {
                usersList = data;
            } else if (data.data && Array.isArray(data.data)) {
                usersList = data.data;
            }

            console.log('Processed usersList:', usersList); // Debug log

            // Debug: Log the structure of the first user and branch mapping
            if (usersList.length > 0) {
                console.log('First user structure:', usersList[0]);
                console.log('Available fields in first user:', Object.keys(usersList[0]));

                // Specifically check for branch_id field
                const firstUser = usersList[0];
                console.log('User branch_id:', firstUser.branch_id);
                console.log('Available branches for mapping:', branches);

                if (branches.length > 0) {
                    console.log('Branch mapping example:', {
                        user_branch_id: firstUser.branch_id,
                        mapped_branch_name: getBranchName(firstUser.branch_id)
                    });
                }
            }

            // Ensure we have a valid array
            if (!Array.isArray(usersList)) {
                console.warn('Expected array but got:', typeof usersList, usersList);
                usersList = [];
            }

            setUsers(usersList);
            if (usersList.length > 0) {
                await initializeUserSessions(usersList);
            }

            if (usersList.length === 0 && !error) {
                // If no users found, set a helpful message but don't treat it as an error
                setError('No users found. This might be because the API returned empty data or the user list is genuinely empty.');

                // Optional: Add some mock data for testing (remove in production)
                const mockUsers = [
                    {
                        id: 1,
                        name: 'Test Member 1',
                        email: 'member1@example.com',
                        phone: '1234567890',
                        role: 'MEMBER',
                        branch_id: 1 // Using branch_id to match API structure
                    },
                    {
                        id: 2,
                        name: 'Test Trainer 1',
                        email: 'trainer1@example.com',
                        phone: '0987654321',
                        role: 'TRAINER',
                        branch_id: 2 // Using branch_id to match API structure
                    },
                    {
                        id: 3,
                        name: 'Test Staff 1',
                        email: 'staff1@example.com',
                        phone: '5555555555',
                        role: 'STAFF',
                        branch_id: 1 // Using branch_id to match API structure
                    }
                ];

                // Uncomment below lines to use mock data for testing
                // setUsers(mockUsers);
                // await initializeUserSessions(mockUsers);
                // setError('Using mock data for testing - Check console for API response structure');
            }
        } catch (error) {
            console.error('Error fetching users:', error);

            let errorMessage = 'Failed to fetch users: ';

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Network error. Please check your internet connection.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage += 'Authentication failed. Please log in again.';
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                errorMessage += 'You do not have permission to access user data.';
            } else if (error.message.includes('404')) {
                errorMessage += 'API endpoint not found.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Server error. Please try again later.';
            } else {
                errorMessage += error.message || 'Unknown error occurred.';
            }

            setError(errorMessage);
            setUsers([]); // Ensure users is always an array
        } finally {
            setLoading(false);
        }
    };

    // Initialize user sessions state with real API data
    const initializeUserSessions = async (usersList) => {
        console.log('Initializing sessions for:', usersList); // Debug log
        setLoadingSessions(true);

        // Ensure usersList is an array
        if (!Array.isArray(usersList)) {
            console.warn('initializeUserSessions received non-array:', typeof usersList, usersList);
            setLoadingSessions(false);
            return;
        }

        const sessions = {};

        // Fetch session data for each user
        for (const user of usersList) {
            const userId = user.user_id || user.id;
            if (userId) {
                // Fetch current session data for today
                const sessionData = await fetchUserSessions(userId, currentDate);

                // Determine current status based on session data
                const { isCheckedIn, totalSessions, lastSession } = analyzeSessionData(sessionData);

                sessions[userId] = {
                    isCheckedIn: isCheckedIn,
                    sessions: sessionData?.sessions || [],
                    totalSessions: totalSessions,
                    lastSession: lastSession,
                    attendanceSummary: sessionData?.attendance_summary || null,
                    currentSessionStart: isCheckedIn ? (lastSession?.check_in || null) : null
                };

                console.log(`User ${user.name || user.user_name} session status:`, {
                    userId,
                    isCheckedIn,
                    totalSessions,
                    hasSessionData: !!sessionData
                });
            } else {
                console.warn('User without ID found:', user);
            }
        }

        setUserSessions(sessions);
        setLoadingSessions(false);
        console.log('Initialized user sessions with API data:', sessions); // Debug log
    };

    // Refresh session data for a specific user
    const refreshUserSession = async (userId) => {
        const sessionData = await fetchUserSessions(userId, currentDate);
        const { isCheckedIn, totalSessions, lastSession } = analyzeSessionData(sessionData);

        setUserSessions(prev => ({
            ...prev,
            [userId]: {
                isCheckedIn: isCheckedIn,
                sessions: sessionData?.sessions || [],
                totalSessions: totalSessions,
                lastSession: lastSession,
                attendanceSummary: sessionData?.attendance_summary || null,
                currentSessionStart: isCheckedIn ? (lastSession?.check_in || null) : null
            }
        }));
    };

    // Helper function to get branch name from branch_id
    const getBranchName = (branchId) => {
        if (!branchId || !Array.isArray(branches) || branches.length === 0) {
            return 'N/A';
        }

        // Convert branchId to number for consistent comparison
        const numericBranchId = parseInt(branchId);
        if (isNaN(numericBranchId)) {
            return 'N/A';
        }

        const branch = branches.find(b =>
            b.branch_id === numericBranchId ||
            b.branch_id === branchId ||
            parseInt(b.branch_id) === numericBranchId
        );

        return branch ? branch.branch_name : `Unknown (ID: ${branchId})`;
    };

    // Analyze session data to determine current user status
    const analyzeSessionData = (sessionData) => {
        if (!sessionData || !sessionData.sessions || sessionData.sessions.length === 0) {
            return {
                isCheckedIn: false,
                totalSessions: 0,
                lastSession: null
            };
        }

        const sessions = sessionData.sessions;
        const totalSessions = sessions.length;
        const lastSession = sessions[sessions.length - 1]; // Get the most recent session

        // If the last session has no check_out time (null), user is currently checked in
        const isCheckedIn = lastSession && lastSession.check_out === null;

        return {
            isCheckedIn: isCheckedIn,
            totalSessions: totalSessions,
            lastSession: lastSession
        };
    };
    useEffect(() => {
        const fetchData = async () => {
            // Fetch branches first, then users so we can map branch names
            await fetchGymBranches();
            await fetchUsers();
        };

        fetchData();
    }, []);

    // Filter users based on search and filters
    const getFilteredUsers = () => {
        try {
            if (!Array.isArray(users)) {
                console.warn('Users is not an array:', users);
                return [];
            }

            return users.filter(user => {
                if (!user || typeof user !== 'object') {
                    console.warn('Invalid user object:', user);
                    return false;
                }

                // Filter out admin and super_admin roles
                const userRole = (user.role || user.role_type || '').toLowerCase();
                if (userRole === 'admin' || userRole === 'super_admin') {
                    return false;
                }

                const matchesSearch =
                    (user.name || user.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (user.phone || '').includes(searchQuery);

                const matchesRole = filterRole === 'ALL' || user.role === filterRole || user.role_type === filterRole;

                // Updated branch matching to use branch_id mapping
                const userBranchId = user.branch_id;
                const userBranchName = getBranchName(userBranchId);

                console.log(`User ${user.name || user.user_name} branch mapping:`, {
                    branch_id: userBranchId,
                    mapped_branch_name: userBranchName,
                    available_branches: branches.map(b => ({ id: b.branch_id, name: b.branch_name }))
                });

                const matchesBranch = filterBranch === 'ALL' || userBranchName === filterBranch;

                // Filter by attendance status - simplified to only check checked in/not checked in
                const userId = user.user_id || user.id;
                const userSessionData = userSessions[userId];
                let matchesStatus = true;

                if (filterStatus === 'CHECKED_IN') {
                    matchesStatus = userSessionData?.isCheckedIn || false;
                } else if (filterStatus === 'NOT_CHECKED') {
                    matchesStatus = !userSessionData?.isCheckedIn;
                }
                // Removed 'COMPLETED' status filter

                return matchesSearch && matchesRole && matchesBranch && matchesStatus;
            });
        } catch (error) {
            console.error('Error filtering users:', error);
            return [];
        }
    };

    const filteredUsers = getFilteredUsers();

    // Handle check-in
    const handleCheckIn = async (user) => {
        const userId = user.user_id || user.id;

        setProcessingUsers(prev => new Set(prev).add(userId));

        try {
            // TODO: Replace with actual check-in API call
            // const response = await tokenManager.apiCall(`${tokenManager.API_BASE_URL}/api/attendance/check-in`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ user_id: userId, date: currentDate })
            // });

            // Simulate API call for now
            console.log(`Simulating check-in for user ${user.name || user.user_name} (ID: ${userId})`);

            // Wait a bit to simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Refresh session data from API to get real status
            await refreshUserSession(userId);

            console.log(`${user.name || user.user_name} checked in successfully`);

        } catch (error) {
            console.error('Error during check-in:', error);
            const errorMessage = `Failed to check in ${user.name || user.user_name}: ${error.message || 'Unknown error'}`;
            setError(errorMessage);
            // Auto close error after 5 seconds
            setTimeout(() => setError(''), 5000);
        } finally {
            setProcessingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Handle check-out
    const handleCheckOut = async (user) => {
        const userId = user.user_id || user.id;

        setProcessingUsers(prev => new Set(prev).add(userId));

        try {
            // TODO: Replace with actual check-out API call
            // const response = await tokenManager.apiCall(`${tokenManager.API_BASE_URL}/api/attendance/check-out`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ user_id: userId, date: currentDate })
            // });

            // Simulate API call for now
            console.log(`Simulating check-out for user ${user.name || user.user_name} (ID: ${userId})`);

            // Wait a bit to simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Refresh session data from API to get real status
            await refreshUserSession(userId);

            console.log(`${user.name || user.user_name} checked out successfully`);

        } catch (error) {
            console.error('Error during check-out:', error);
            const errorMessage = `Failed to check out ${user.name || user.user_name}: ${error.message || 'Unknown error'}`;
            setError(errorMessage);
            // Auto close error after 5 seconds
            setTimeout(() => setError(''), 5000);
        } finally {
            setProcessingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Get user status for display
    const getUserStatus = (user) => {
        const userId = user.user_id || user.id;
        const userSessionData = userSessions[userId];

        if (!userSessionData) return 'Not Checked In';

        if (userSessionData.isCheckedIn) {
            // Show current session info if available
            const currentSessionStart = userSessionData.lastSession?.check_in;
            return `Checked In${currentSessionStart ? ` (since ${currentSessionStart})` : ''}`;
        } else if (userSessionData.totalSessions > 0) {
            // Show completed sessions count
            return `${userSessionData.totalSessions} session${userSessionData.totalSessions > 1 ? 's' : ''} completed`;
        } else {
            return 'Not Checked In';
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (user) => {
        const userId = user.user_id || user.id;
        const userSessionData = userSessions[userId];

        if (!userSessionData) return 'status-not-checked';

        if (userSessionData.isCheckedIn) {
            return 'status-checked-in';
        } else {
            return 'status-not-checked';
        }
    };

    const getRoleBadgeClass = (role) => {
        const roleMap = {
            'MEMBER': 'role-member',
            'TRAINER': 'role-trainer',
            'STAFF': 'role-staff'
        };
        return roleMap[role] || 'role-member';
    };

    return (
        <div className="manual-attendance-entry">
            {/* Header */}
            <div className="entry-header">
                <div className="entry-header-content">
                    <h2>
                        <i className="fas fa-user-plus"></i>
                        Manual Attendance Entry
                    </h2>
                    <p className="entry-subtitle">Mark attendance for {currentDate}</p>
                </div>
                <button className="close-btn" onClick={onClose} title="Close">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Filters */}
            <div className="entry-filters">
                <div className="filter-row">
                    <div className="search-filter">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="filter-input"
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="filter-input"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="MEMBER">Members</option>
                        <option value="TRAINER">Trainers</option>
                        <option value="STAFF">Staff</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-input"
                    >
                        <option value="ALL">All Status</option>
                        <option value="NOT_CHECKED">Not Checked In</option>
                        <option value="CHECKED_IN">Checked In</option>
                    </select>

                    <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="filter-input"
                        disabled={branchesLoading}
                    >
                        <option value="ALL">{branchesLoading ? 'Loading branches...' : 'All Branches'}</option>
                        {branches.map((branch) => (
                            <option key={branch.branch_id} value={branch.branch_name}>
                                {branch.branch_name}
                            </option>
                        ))}
                    </select>

                    <button
                        className="refresh-btn"
                        onClick={async () => {
                            await fetchUsers();
                        }}
                        disabled={loading || loadingSessions}
                        title="Refresh Users & Sessions"
                    >
                        <i className={`fas fa-sync-alt ${loading || loadingSessions ? 'fa-spin' : ''}`}></i>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                    <button
                        onClick={() => setError('')}
                        style={{
                            marginLeft: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#c0392b',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                        }}
                        title="Close"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    {error.includes('format') && (
                        <details style={{ marginTop: '10px' }}>
                            <summary>Debug Info</summary>
                            <p>Users data type: {typeof users}</p>
                            <p>Users length: {Array.isArray(users) ? users.length : 'N/A'}</p>
                            <p>Sample user keys: {Array.isArray(users) && users[0] ? Object.keys(users[0]).join(', ') : 'N/A'}</p>
                        </details>
                    )}
                </div>
            )}

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User Details</th>
                            <th>Role</th>
                            <th>Branch</th>
                            <th>Status</th>
                            <th>Sessions</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading || loadingSessions ? (
                            <tr>
                                <td colSpan="6" className="loading-indicator">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {loading ? 'Loading users...' : 'Loading session data...'}
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data-message">
                                    <i className="fas fa-inbox"></i>
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const userId = user.user_id || user.id;
                                const isProcessing = processingUsers.has(userId);
                                const userSessionData = userSessions[userId];
                                const isCheckedIn = userSessionData?.isCheckedIn || false;

                                return (
                                    <tr key={userId}>
                                        <td data-label="User Details">
                                            <div className="user-info">
                                                <strong>{user.name || user.user_name}</strong>
                                                <span>{user.email}</span>
                                                <span>{user.phone}</span>
                                            </div>
                                        </td>
                                        <td data-label="Role">
                                            <span className={`role-badge ${getRoleBadgeClass(user.role || user.role_type)}`}>
                                                {user.role || user.role_type}
                                            </span>
                                        </td>
                                        <td data-label="Branch">
                                            {getBranchName(user.branch_id)}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`status-badge ${getStatusBadgeClass(user)}`}>
                                                {getUserStatus(user)}
                                            </span>
                                        </td>
                                        <td data-label="Sessions">
                                            <span className="session-count">
                                                {userSessionData?.totalSessions || 0}
                                            </span>
                                        </td>
                                        <td data-label="Action" className="action-cell">
                                            {isCheckedIn ? (
                                                <button
                                                    className="action-btn check-out"
                                                    onClick={() => handleCheckOut(user)}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin"></i>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-sign-out-alt"></i>
                                                            Check Out
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-btn check-in"
                                                    onClick={() => handleCheckIn(user)}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin"></i>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-sign-in-alt"></i>
                                                            Check In
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManualAttendanceEntry;