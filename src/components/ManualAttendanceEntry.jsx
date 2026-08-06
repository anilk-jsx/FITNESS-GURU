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
    const [success, setSuccess] = useState(''); // Add success message state
    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [gymId, setGymId] = useState(null);

    // Track user sessions for today
    const [userSessions, setUserSessions] = useState({});
    const [processingUsers, setProcessingUsers] = useState(new Set());
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [sessionLoadProgress, setSessionLoadProgress] = useState({ current: 0, total: 0 }); // Add progress tracking

    // Network and retry states
    const [isOnline, setIsOnline] = useState(navigator.onLine || true);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Get current date in local timezone (not UTC)
    const getCurrentLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const currentDate = getCurrentLocalDate();

    // Utility functions for better UX
    const showSuccess = (message) => {
        setSuccess(message);
        setError(''); // Clear any existing errors
        setTimeout(() => setSuccess(''), 5000); // Auto-hide after 5 seconds
    };

    const showError = (message, autoHide = true) => {
        setError(message);
        setSuccess(''); // Clear any existing success messages
        if (autoHide) {
            setTimeout(() => setError(''), 8000); // Auto-hide after 8 seconds
        }
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    // Network monitoring
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => {
            setIsOnline(false);
            showError('You are offline. Some features may not work properly.', false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Mock shift data - Using actual database shift IDs to avoid foreign key constraint violations
    const mockShifts = [
        {
            id: 1,
            shiftName: 'Morning',
            startTime: '00:00 AM',
            endTime: '12:59 PM',
            isActive: true,
            description: 'Kickstart your day with an energetic early morning session.'
        },
        {
            id: 2,
            shiftName: 'Evening',
            startTime: '02:00 PM',
            endTime: '11:59 PM',
            isActive: true,
            description: 'Evening power session.'
        }
    ];

    // Convert time string to minutes for comparison
    const timeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    };

    // Get current shift based on current time
    const getCurrentShift = () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        for (const shift of mockShifts) {
            if (!shift.isActive) continue;

            const startMinutes = timeToMinutes(shift.startTime);
            let endMinutes = timeToMinutes(shift.endTime);

            // Handle overnight shifts (like evening going to next day)
            if (endMinutes < startMinutes) {
                if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
                    return shift;
                }
            } else {
                if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                    return shift;
                }
            }
        }

        return null;
    };

    // Enhanced API Functions with retry logic
    const fetchGymBranches = async (retryAttempt = 0) => {
        try {
            setBranchesLoading(true);
            const userData = tokenManager.getUserData();

            if (!userData || !userData.gym_id) {
                showError('User session expired. Please login again to continue.');
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
                setRetryCount(0); // Reset retry count on success
            } else {
                throw new Error(data.message || 'Failed to fetch gym branches');
            }
        } catch (error) {
            console.error('Error fetching gym branches:', error);

            if (retryAttempt < maxRetries && isOnline) {
                // Retry with exponential backoff
                const delay = Math.pow(2, retryAttempt) * 1000;
                setTimeout(() => {
                    fetchGymBranches(retryAttempt + 1);
                }, delay);
                setRetryCount(retryAttempt + 1);
            } else {
                const errorMessage = !isOnline
                    ? 'Unable to load branches due to network connection.'
                    : `Failed to load gym branches: ${error.message || 'Unknown error'}`;
                showError(errorMessage);
            }
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
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    const fetchUsers = async (retryAttempt = 0) => {
        try {
            setLoading(true);
            clearMessages();

            if (!isOnline) {
                showError('You are offline. Please check your internet connection and try again.');
                return;
            }

            // Using the provided API endpoint
            const url = 'https://api.fitnessguru.org.in/api/users/list';

            const response = await tokenManager.apiCall(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different possible response structures
            let usersList = [];

            if (data.status === 'success') {
                if (Array.isArray(data.data)) {
                    usersList = data.data;
                } else if (Array.isArray(data.users)) {
                    usersList = data.users;
                } else if (data.data && typeof data.data === 'object') {
                    usersList = Object.values(data.data).flat().filter(item =>
                        item && typeof item === 'object' && (item.user_id || item.id)
                    );
                }
            } else if (Array.isArray(data)) {
                usersList = data;
            } else if (data.data && Array.isArray(data.data)) {
                usersList = data.data;
            }

            // Ensure we have a valid array
            if (!Array.isArray(usersList)) {
                usersList = [];
            }

            setUsers(usersList);
            setRetryCount(0); // Reset retry count on success

            // Initialize session data to empty state for immediate rendering
            initializeEmptyUserSessions(usersList);

            // Load session data in background after users are displayed
            if (usersList.length > 0) {
                loadUserSessionsInBackground(usersList);
                showSuccess(`Successfully loaded ${usersList.length} users for ${currentDate}`);
            } else {
                showError('No users found. The user database appears to be empty or you may not have permission to view users.');
            }

        } catch (error) {
            console.error('Error fetching users:', error);

            // Implement retry logic for network errors
            if (retryAttempt < maxRetries && (error.name === 'TypeError' && error.message.includes('fetch'))) {
                const delay = Math.pow(2, retryAttempt) * 1000;
                setTimeout(() => {
                    fetchUsers(retryAttempt + 1);
                }, delay);
                setRetryCount(retryAttempt + 1);
                showError(`Connection failed. Retrying... (${retryAttempt + 1}/${maxRetries})`);
                return;
            }

            // Handle specific error types with actionable messages
            let errorMessage = 'Failed to load users: ';

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Network connection failed. Please check your internet connection and try again.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage += 'Your session has expired. Please log out and log in again to continue.';
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                errorMessage += 'You do not have permission to view user data. Please contact your administrator.';
            } else if (error.message.includes('404')) {
                errorMessage += 'User service is not available. Please try again later or contact support.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Server error occurred. Please try again in a few moments.';
            } else if (error.message.includes('timeout')) {
                errorMessage += 'Request timed out. Please check your connection and try again.';
            } else {
                errorMessage += error.message || 'An unexpected error occurred.';
            }

            showError(errorMessage);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Initialize empty user sessions state for immediate rendering
    const initializeEmptyUserSessions = (usersList) => {
        if (!Array.isArray(usersList)) {
            return;
        }

        const sessions = {};
        usersList.forEach(user => {
            const userId = user.user_id || user.id;
            if (userId) {
                sessions[userId] = {
                    isCheckedIn: false,
                    sessions: [],
                    totalSessions: 0,
                    lastSession: null,
                    attendanceSummary: null,
                    currentSessionStart: null,
                    loaded: false // Flag to indicate if session data is loaded
                };
            }
        });
        setUserSessions(sessions);
    };

    // Enhanced session loading with progress tracking
    const loadUserSessionsInBackground = async (usersList) => {
        setLoadingSessions(true);
        setSessionLoadProgress({ current: 0, total: usersList.length });

        // Process users in smaller batches to avoid overwhelming the API
        const batchSize = 10;
        const batches = [];

        for (let i = 0; i < usersList.length; i += batchSize) {
            batches.push(usersList.slice(i, i + batchSize));
        }

        let processedCount = 0;

        try {
            // Process each batch in parallel
            for (const batch of batches) {
                const promises = batch.map(async (user) => {
                    const userId = user.user_id || user.id;
                    if (!userId) return;

                    try {
                        const sessionData = await fetchUserSessions(userId, currentDate);
                        const { isCheckedIn, totalSessions, lastSession } = analyzeSessionData(sessionData);

                        // Update session data for this specific user
                        setUserSessions(prev => ({
                            ...prev,
                            [userId]: {
                                isCheckedIn: isCheckedIn,
                                sessions: sessionData?.sessions || [],
                                totalSessions: totalSessions,
                                lastSession: lastSession,
                                attendanceSummary: sessionData?.attendance_summary || null,
                                currentSessionStart: isCheckedIn ? (lastSession?.check_in || null) : null,
                                loaded: true
                            }
                        }));
                    } catch (error) {
                        // Mark this user's session as loaded with error state
                        setUserSessions(prev => ({
                            ...prev,
                            [userId]: {
                                isCheckedIn: false,
                                sessions: [],
                                totalSessions: 0,
                                lastSession: null,
                                attendanceSummary: null,
                                currentSessionStart: null,
                                loaded: true,
                                loadError: true
                            }
                        }));
                    }
                });

                // Wait for current batch to complete before starting next batch
                await Promise.all(promises);

                processedCount += batch.length;
                setSessionLoadProgress({ current: processedCount, total: usersList.length });
            }

            showSuccess(`Session data loaded for all users`);
        } catch (error) {
            console.error('Error loading user sessions:', error);
            showError(`Failed to load session data: ${error.message || 'Unknown error'}`);
        } finally {
            setLoadingSessions(false);
            setSessionLoadProgress({ current: 0, total: 0 });
        }
    };

    // Initialize user sessions state with real API data (legacy - now unused)
    const initializeUserSessions = async (usersList) => {
        setLoadingSessions(true);

        if (!Array.isArray(usersList)) {
            setLoadingSessions(false);
            return;
        }

        const sessions = {};

        // Fetch session data for each user
        for (const user of usersList) {
            const userId = user.user_id || user.id;
            if (userId) {
                const sessionData = await fetchUserSessions(userId, currentDate);
                const { isCheckedIn, totalSessions, lastSession } = analyzeSessionData(sessionData);

                sessions[userId] = {
                    isCheckedIn: isCheckedIn,
                    sessions: sessionData?.sessions || [],
                    totalSessions: totalSessions,
                    lastSession: lastSession,
                    attendanceSummary: sessionData?.attendance_summary || null,
                    currentSessionStart: isCheckedIn ? (lastSession?.check_in || null) : null,
                    loaded: true
                };
            }
        }

        setUserSessions(sessions);
        setLoadingSessions(false);
    };

    // Refresh session data for a specific user
    const refreshUserSession = async (userId) => {
        try {
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
                    currentSessionStart: isCheckedIn ? (lastSession?.check_in || null) : null,
                    loaded: true
                }
            }));
        } catch (error) {
            // If refresh fails, keep the current state but mark as loaded
            setUserSessions(prev => ({
                ...prev,
                [userId]: {
                    ...prev[userId],
                    loaded: true
                }
            }));
        }
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
                return [];
            }

            return users.filter(user => {
                if (!user || typeof user !== 'object') {
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

                return matchesSearch && matchesRole && matchesBranch && matchesStatus;
            });
        } catch (error) {
            return [];
        }
    };

    const filteredUsers = getFilteredUsers();

    // Enhanced check-in with comprehensive feedback
    const handleCheckIn = async (user) => {
        const userId = user.user_id || user.id;
        const userName = user.name || user.user_name || 'Unknown User';

        // Pre-validation checks with user-friendly messages
        if (!isOnline) {
            showError('Cannot check in while offline. Please check your internet connection.');
            return;
        }

        // Check if current time falls within any active shift
        const currentShift = getCurrentShift();
        if (!currentShift) {
            const currentTime = new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            showError(`Cannot check in ${userName} at ${currentTime}. No active shift available. Check-in is available during Morning (12:00 AM - 12:59 PM) or Evening (2:00 PM - 11:59 PM) shifts.`);
            return;
        }

        // Check if user is already processing
        if (processingUsers.has(userId)) {
            showError('Please wait, another operation is in progress for this user.');
            return;
        }

        setProcessingUsers(prev => new Set(prev).add(userId));
        clearMessages();

        try {
            // Get user's gym_id and branch_id
            const userData = tokenManager.getUserData();
            if (!userData || !userData.gym_id) {
                throw new Error('Session expired. Please login again to continue.');
            }

            // Validate required user data
            if (!userId) {
                throw new Error('Invalid user information. Please refresh and try again.');
            }

            // Ensure branch_id is a valid number
            let branchId = user.branch_id;
            if (!branchId || isNaN(parseInt(branchId))) {
                branchId = 1;
            } else {
                branchId = parseInt(branchId);
            }

            // Ensure gym_id is a valid number
            let gymId = userData.gym_id;
            if (!gymId || isNaN(parseInt(gymId))) {
                throw new Error('Invalid gym information. Please contact administrator.');
            } else {
                gymId = parseInt(gymId);
            }

            const requestBody = {
                user_id: parseInt(userId),
                gym_id: gymId,
                branch_id: branchId,
                shift_id: currentShift.id,
                device_id: 1, // Default device_id for admin entry
                status: 'ON_TIME', // Default status
                source: 'ADMIN_ENTRY',
                remarks: `Manual attendance entry by admin during ${currentShift.shiftName} shift`
            };

            const response = await tokenManager.apiCall(`${tokenManager.API_BASE_URL}/api/attendance/checkIn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok && (data.status === 'success' || data.success)) {
                // Success - refresh session data to get updated status
                await refreshUserSession(userId);

                const currentTime = new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                showSuccess(`✅ ${userName} successfully checked in at ${currentTime} during ${currentShift.shiftName} shift`);
            } else {
                throw new Error(data.message || data.error || `Check-in failed (HTTP ${response.status})`);
            }

        } catch (error) {
            console.error('Check-in error:', error);

            let errorMessage = `Failed to check in ${userName}: `;

            if (error.message.includes('400')) {
                errorMessage += 'Invalid request data. Please check user information and try again.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage += 'Session expired. Please logout and login again.';
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                errorMessage += 'You do not have permission to perform this action. Contact your administrator.';
            } else if (error.message.includes('409') || error.message.toLowerCase().includes('already')) {
                errorMessage += 'User is already checked in. Please refresh to see the latest status.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Server error occurred. Please try again in a few moments.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage += 'Network connection failed. Please check your connection and try again.';
            } else {
                errorMessage += error.message || 'An unexpected error occurred.';
            }

            showError(errorMessage);
        } finally {
            setProcessingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Enhanced check-out with comprehensive feedback
    const handleCheckOut = async (user) => {
        const userId = user.user_id || user.id;
        const userName = user.name || user.user_name || 'Unknown User';

        // Pre-validation checks
        if (!isOnline) {
            showError('Cannot check out while offline. Please check your internet connection.');
            return;
        }

        if (processingUsers.has(userId)) {
            showError('Please wait, another operation is in progress for this user.');
            return;
        }

        setProcessingUsers(prev => new Set(prev).add(userId));
        clearMessages();

        try {
            // Validate user data
            if (!userId) {
                throw new Error('Invalid user information. Please refresh and try again.');
            }

            const requestBody = {
                user_id: parseInt(userId)
            };

            // Use the correct checkout API endpoint and method from actual API specification
            const response = await tokenManager.apiCall(`${tokenManager.API_BASE_URL}/api/attendance/checkOut`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok && (data.status === 'success' || data.success)) {
                // Success - refresh session data to get updated status
                await refreshUserSession(userId);

                const currentTime = new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                showSuccess(`✅ ${userName} successfully checked out at ${currentTime}`);
            } else {
                throw new Error(data.message || data.error || `Check-out failed (HTTP ${response.status})`);
            }

        } catch (error) {
            console.error('Check-out error:', error);

            let errorMessage = `Failed to check out ${userName}: `;

            if (error.message.includes('400')) {
                errorMessage += 'Invalid request data. Please try again.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage += 'Session expired. Please logout and login again.';
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                errorMessage += 'You do not have permission to perform this action. Contact your administrator.';
            } else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                errorMessage += 'No active check-in session found for this user. Please refresh to see the latest status.';
            } else if (error.message.includes('409') || error.message.toLowerCase().includes('already')) {
                errorMessage += 'User is already checked out. Please refresh to see the latest status.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Server error occurred. Please try again in a few moments.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage += 'Network connection failed. Please check your connection and try again.';
            } else {
                errorMessage += error.message || 'An unexpected error occurred.';
            }

            showError(errorMessage);
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

        // Show loading indicator if session data hasn't been loaded yet
        if (!userSessionData.loaded && loadingSessions) {
            return 'Loading...';
        }

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

        // Show loading state
        if (!userSessionData.loaded && loadingSessions) {
            return 'status-loading';
        }

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
                    {(() => {
                        const currentShift = getCurrentShift();
                        const currentTime = new Date().toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });

                        if (currentShift) {
                            return (
                                <div className="shift-info">
                                    <i className="fas fa-clock"></i>
                                    <span>Current: {currentShift.shiftName} Shift ({currentShift.startTime} - {currentShift.endTime})</span>
                                    <span className="current-time">• {currentTime}</span>
                                </div>
                            );
                        } else {
                            return (
                                <div className="shift-info no-shift">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <span>No active shift at {currentTime}</span>
                                    <span className="shift-help">Check-in available during: Morning (12:00 AM - 12:59 PM), Evening (2:00 PM - 11:59 PM)</span>
                                </div>
                            );
                        }
                    })()}
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
                            clearMessages();
                            await fetchUsers(); // This will also reload sessions with enhanced feedback
                        }}
                        disabled={loading || loadingSessions}
                        title="Refresh Users & Session Data for Current Date"
                    >
                        <i className={`fas fa-sync-alt ${loading || loadingSessions ? 'fa-spin' : ''}`}></i>
                        {loadingSessions ?
                            `Loading Sessions... ${sessionLoadProgress.current}/${sessionLoadProgress.total}` :
                            'Refresh'}
                        {retryCount > 0 && ` (Retry ${retryCount}/${maxRetries})`}
                    </button>
                </div>
            </div>

            {/* Network Status */}
            {!isOnline && (
                <div className="network-status offline">
                    <i className="fas fa-wifi-slash"></i>
                    <span>You are currently offline. Some features may not work properly.</span>
                    <button
                        onClick={() => {
                            if (navigator.onLine) {
                                setIsOnline(true);
                                clearMessages();
                                showSuccess('Connection restored! You can now use all features.');
                            } else {
                                showError('Still offline. Please check your internet connection.');
                            }
                        }}
                        className="retry-connection-btn"
                    >
                        <i className="fas fa-redo"></i>
                        Check Connection
                    </button>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="success-message">
                    <i className="fas fa-check-circle"></i>
                    {success}
                    <button
                        onClick={() => setSuccess('')}
                        style={{
                            marginLeft: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#27ae60',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                        }}
                        title="Close"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Enhanced Error Message */}
            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div className="error-content">
                        <span>{error}</span>
                        <div className="error-actions">
                            {error.includes('Network') || error.includes('connection') ? (
                                <button
                                    onClick={() => {
                                        clearMessages();
                                        fetchUsers();
                                    }}
                                    className="retry-btn"
                                    disabled={loading}
                                >
                                    <i className="fas fa-redo"></i>
                                    Retry
                                </button>
                            ) : null}
                            {error.includes('session') || error.includes('login') ? (
                                <button
                                    onClick={() => {
                                        // Redirect to login or refresh page
                                        window.location.reload();
                                    }}
                                    className="refresh-page-btn"
                                >
                                    <i className="fas fa-refresh"></i>
                                    Refresh Page
                                </button>
                            ) : null}
                            <button
                                onClick={clearMessages}
                                className="close-error-btn"
                                title="Close"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Indicator for Session Loading */}
            {loadingSessions && sessionLoadProgress.total > 0 && (
                <div className="progress-indicator">
                    <div className="progress-info">
                        <span>Loading session data...</span>
                        <span>{sessionLoadProgress.current}/{sessionLoadProgress.total}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${(sessionLoadProgress.current / sessionLoadProgress.total) * 100}%`
                            }}
                        ></div>
                    </div>
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
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="loading-indicator">
                                    <div className="loading-content">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <div className="loading-text">
                                            <span>Loading users...</span>
                                            {retryCount > 0 && <small>Retrying connection ({retryCount}/{maxRetries})</small>}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data-message">
                                    <div className="no-data-content">
                                        <i className="fas fa-inbox"></i>
                                        <div className="no-data-text">
                                            <span>No users found</span>
                                            {searchQuery && <small>Try adjusting your search filters</small>}
                                            {!isOnline && <small>You may be offline - check your connection</small>}
                                        </div>
                                        {!searchQuery && (
                                            <button
                                                onClick={() => fetchUsers()}
                                                className="reload-users-btn"
                                                disabled={loading}
                                            >
                                                <i className="fas fa-redo"></i>
                                                Reload Users
                                            </button>
                                        )}
                                    </div>
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
                                            <div className="session-info">
                                                {userSessionData?.loaded === false && loadingSessions ? (
                                                    <div className="session-loading">
                                                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '0.8rem' }}></i>
                                                        <span>Loading...</span>
                                                    </div>
                                                ) : userSessionData?.loadError ? (
                                                    <div className="session-error">
                                                        <span className="error-text">Load failed</span>
                                                        <button
                                                            onClick={() => refreshUserSession(userId)}
                                                            className="retry-session-btn"
                                                            title="Retry loading session data"
                                                        >
                                                            <i className="fas fa-redo"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="session-count">
                                                        {userSessionData?.totalSessions || 0}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Action" className="action-cell">
                                            {isCheckedIn ? (
                                                <button
                                                    className="action-btn check-out"
                                                    onClick={() => handleCheckOut(user)}
                                                    disabled={isProcessing || (!userSessionData?.loaded && loadingSessions)}
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
                                                (() => {
                                                    const currentShift = getCurrentShift();
                                                    const isShiftActive = currentShift !== null;
                                                    const isDisabled = isProcessing || (!userSessionData?.loaded && loadingSessions) || !isShiftActive;

                                                    return (
                                                        <button
                                                            className={`action-btn check-in ${!isShiftActive ? 'disabled-no-shift' : ''}`}
                                                            onClick={() => handleCheckIn(user)}
                                                            disabled={isDisabled}
                                                            title={!isShiftActive ? 'No active shift available' : 'Check In'}
                                                        >
                                                            {isProcessing ? (
                                                                <>
                                                                    <i className="fas fa-spinner fa-spin"></i>
                                                                    Processing...
                                                                </>
                                                            ) : !isShiftActive ? (
                                                                <>
                                                                    <i className="fas fa-ban"></i>
                                                                    No active shift
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-sign-in-alt"></i>
                                                                    Check In
                                                                </>
                                                            )}
                                                        </button>
                                                    );
                                                })()
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