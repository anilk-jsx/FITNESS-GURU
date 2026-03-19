import React, { useState, useEffect } from 'react';
import './ManualAttendanceEntry.css';
import tokenManager from '../utils/tokenManager';

const ManualAttendanceEntry = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, CHECKED_IN, NOT_CHECKED_IN
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]); // Fixed to current date

  // API data states
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // User sessions cache to track check-in status
  const [userSessions, setUserSessions] = useState({});
  const [sessionsLoading, setSessionsLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "https://api.fitnessguru.org.in";

  const buildApiUrl = (endpoint) => {
    const isLocalhost = API_BASE_URL.includes("localhost");
    const basePath = isLocalhost ? "/fitness-guru/api" : "/api";
    return `${API_BASE_URL}${basePath}/${endpoint}`;
  };

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
    fetchUsers();
  }, []);

  // Fetch users when filters or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filterBranch]);

  // Helper function to get branch name from branch ID
  const getBranchName = (branchId) => {
    if (!branchId || !branches.length) return "N/A";

    // Convert both to strings for comparison to handle type mismatches
    const branch = branches.find(b =>
      String(b.branch_id) === String(branchId)
    );

    return branch ? branch.branch_name : `Branch ID: ${branchId}`;
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const response = await tokenManager.apiCall(buildApiUrl("gymBranchList?gym_id=1"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch branches");

      const data = await response.json();
      if (data.status === "success") {
        setBranches(data.data || []);
        console.log("Branches loaded:", data.data || []);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  // Fetch users/members list
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("role", "MEMBER"); // Only fetch members

      if (filterBranch) {
        queryParams.append("branch_id", filterBranch);
      }

      let apiUrl = buildApiUrl(`users/list?${queryParams.toString()}`);
      console.log("Fetching users from:", apiUrl);

      let response = await tokenManager.apiCall(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response status:", response.status, "OK:", response.ok);

      // If users/list endpoint doesn't exist (404), try alternative endpoint
      if (response.status === 404) {
        console.log("users/list endpoint not found, trying members/list...");
        apiUrl = buildApiUrl(`members/list?${queryParams.toString()}`);
        response = await tokenManager.apiCall(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Users API Response:", data);

      if (data.status === "success") {
        const usersList = data.users || data.members || data.data || [];
        setUsers(usersList);

        // Log first user to check data structure
        if (usersList.length > 0) {
          console.log("Sample user data:", usersList[0]);
          console.log("Available branches:", branches);
        }

        setPagination((prev) => ({
          ...prev,
          total: data.meta?.total || data.total || data.pagination?.total || usersList.length,
        }));
        console.log("Users loaded:", usersList.length);
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user session details to determine check-in status
  const fetchUserSessionStatus = async (userId) => {
    if (userSessions[userId]) {
      return userSessions[userId]; // Return cached data
    }

    try {
      setSessionsLoading((prev) => ({ ...prev, [userId]: true }));

      const response = await tokenManager.apiCall(
        buildApiUrl(`attendance/userSessions?user_id=${userId}&date=${selectedDate}`),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No sessions found for this date - user not checked in
          const sessionInfo = {
            isCheckedIn: false,
            sessions: [],
            lastSession: null,
          };

          setUserSessions((prev) => ({
            ...prev,
            [userId]: sessionInfo,
          }));

          return sessionInfo;
        }
        throw new Error("Failed to fetch session status");
      }

      const data = await response.json();
      // Extract sessions from data.sessions as per API response structure
      const sessions = data.status === "success" ? (data.data?.sessions || []) : [];

      // Determine status based on the last session
      const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
      const isCheckedIn = lastSession && (lastSession.check_out === null || lastSession.check_out === undefined || lastSession.check_out === "");

      const sessionInfo = {
        isCheckedIn,
        sessions: sessions,
        lastSession: lastSession,
      };

      setUserSessions((prev) => ({
        ...prev,
        [userId]: sessionInfo,
      }));

      return sessionInfo;
    } catch (err) {
      console.error(`Error fetching session status for user ${userId}:`, err);
      const errorSessionInfo = { isCheckedIn: false, sessions: [], lastSession: null };

      setUserSessions((prev) => ({
        ...prev,
        [userId]: errorSessionInfo,
      }));

      return errorSessionInfo;
    } finally {
      setSessionsLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Check-in user
  const handleCheckIn = async (user) => {
    try {
      setActionLoading((prev) => ({ ...prev, [user.user_id]: true }));

      // Format timestamp as "YYYY-MM-DD HH:MM:SS" format expected by API
      const checkInTime = new Date().toLocaleString("sv-SE").replace("T", " ");

      const payload = {
        user_id: user.user_id,
        gym_id: 1,
        branch_id: user.branch_id || 1,
        shift_id: user.shift_id || 3, // Default to 3 as per API example
        device_id: 1,
        attendance_date: selectedDate, // Current date only
        status: "ON_TIME",
        check_in_time: checkInTime,
        source: "MANUAL",
        remarks: "Manual check-in entry",
      };

      console.log("Check-in payload:", payload);

      const response = await tokenManager.apiCall(
        buildApiUrl("attendance/checkIn"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to check in";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Handle specific error codes
          if (response.status === 400) {
            errorMessage = `Invalid request: ${errorMessage}`;
          } else if (response.status === 401) {
            errorMessage = "You are not authorized. Please log in again.";
          } else if (response.status === 409) {
            errorMessage = `User is already checked in: ${errorMessage}`;
          } else if (response.status === 500) {
            errorMessage = "Server error. Please try again later.";
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Server returned error ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.status === "success") {
        alert(`${user.name} checked in successfully at ${checkInTime}!`);

        // Update session cache with new check-in session
        setUserSessions((prev) => {
          const currentSessions = prev[user.user_id]?.sessions || [];
          const newSession = {
            session_no: currentSessions.length + 1,
            device: "",
            check_in: checkInTime,
            check_out: null,
            duration: null
          };

          return {
            ...prev,
            [user.user_id]: {
              isCheckedIn: true,
              sessions: [...currentSessions, newSession],
              lastSession: newSession,
            },
          };
        });
      } else {
        throw new Error(data.message || "Failed to check in");
      }
    } catch (err) {
      console.error("Error checking in user:", err);

      // Provide user-friendly error messages
      let userMessage = err.message;
      if (err.message.includes("network") || err.message.includes("fetch")) {
        userMessage = "Network error. Please check your connection and try again.";
      } else if (err.message.includes("timeout")) {
        userMessage = "Request timeout. Please try again.";
      }

      alert(`Failed to check in ${user.name}: ${userMessage}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.user_id]: false }));
    }
  };

  // Check-out user
  const handleCheckOut = async (user) => {
    try {
      setActionLoading((prev) => ({ ...prev, [user.user_id]: true }));

      // Check if user has a valid check-in session
      const userSessionData = userSessions[user.user_id];
      if (!userSessionData || !userSessionData.isCheckedIn || !userSessionData.lastSession) {
        throw new Error("User must be checked in before checking out");
      }

      // Format timestamp as "YYYY-MM-DD HH:MM:SS" format expected by API
      const checkOutTime = new Date().toLocaleString("sv-SE").replace("T", " ");

      // Get the original check-in time from the last session
      const checkInTime = userSessionData.lastSession.check_in;
      if (!checkInTime) {
        throw new Error("Could not find check-in time. Please refresh and try again.");
      }

      const payload = {
        user_id: user.user_id,
        gym_id: 1,
        branch_id: user.branch_id || 1,
        shift_id: user.shift_id || 3, // Default to 3 as per API example
        device_id: 1,
        attendance_date: selectedDate, // Current date only
        status: "ON_TIME",
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        source: "MANUAL",
        remarks: "Manual check-out entry",
      };

      console.log("Check-out payload:", payload);

      const response = await tokenManager.apiCall(
        buildApiUrl(`attendance/checkOut?user_id=${user.user_id}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to check out";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Handle specific error codes
          if (response.status === 400) {
            errorMessage = `Invalid request: ${errorMessage}`;
          } else if (response.status === 401) {
            errorMessage = "You are not authorized. Please log in again.";
          } else if (response.status === 404) {
            errorMessage = "Check-in session not found. Please check in first.";
          } else if (response.status === 409) {
            errorMessage = `User is already checked out: ${errorMessage}`;
          } else if (response.status === 500) {
            errorMessage = "Server error. Please try again later.";
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Server returned error ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.status === "success") {
        alert(`${user.name} checked out successfully at ${checkOutTime}!`);

        // Update session cache with checkout time - user is now ready for next check-in
        setUserSessions((prev) => {
          const currentData = prev[user.user_id];
          const updatedSessions = currentData.sessions.map((session, index) => {
            // Update the last session with check-out time
            if (index === currentData.sessions.length - 1) {
              return {
                ...session,
                check_out: checkOutTime
              };
            }
            return session;
          });

          return {
            ...prev,
            [user.user_id]: {
              isCheckedIn: false, // User is now available for next check-in
              sessions: updatedSessions,
              lastSession: updatedSessions[updatedSessions.length - 1],
            },
          };
        });
      } else {
        throw new Error(data.message || "Failed to check out");
      }
    } catch (err) {
      console.error("Error checking out user:", err);

      // Provide user-friendly error messages
      let userMessage = err.message;
      if (err.message.includes("network") || err.message.includes("fetch")) {
        userMessage = "Network error. Please check your connection and try again.";
      } else if (err.message.includes("timeout")) {
        userMessage = "Request timeout. Please try again.";
      }

      alert(`Failed to check out ${user.name}: ${userMessage}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.user_id]: false }));
    }
  };

  // Filter users based on search and filters
  const getFilteredUsers = async () => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery);

      const matchesBranch =
        !filterBranch || user.branch_id?.toString() === filterBranch;

      return matchesSearch && matchesBranch;
    });

    // Apply status filter
    if (filterStatus !== "ALL") {
      filtered = await Promise.all(
        filtered.map(async (user) => {
          const sessionStatus = userSessions[user.user_id] || (await fetchUserSessionStatus(user.user_id));
          if (filterStatus === "CHECKED_IN" && !sessionStatus.isCheckedIn) return null;
          if (filterStatus === "NOT_CHECKED_IN" && sessionStatus.isCheckedIn) return null;
          return user;
        })
      );
      filtered = filtered.filter((u) => u !== null);
    }

    return filtered;
  };

  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    getFilteredUsers().then(setFilteredUsers);
  }, [users, searchQuery, filterBranch, filterStatus, userSessions]);

  // Automatically fetch session status for all visible users
  useEffect(() => {
    if (filteredUsers.length > 0) {
      filteredUsers.forEach(user => {
        if (!userSessions[user.user_id] && !sessionsLoading[user.user_id]) {
          fetchUserSessionStatus(user.user_id);
        }
      });
    }
  }, [filteredUsers]);

  // Also fetch session status when users are initially loaded
  useEffect(() => {
    if (users.length > 0) {
      users.forEach(user => {
        if (!userSessions[user.user_id] && !sessionsLoading[user.user_id]) {
          fetchUserSessionStatus(user.user_id);
        }
      });
    }
  }, [users]);

  // Get action button for user
  const getActionButton = (user) => {
    const sessionStatus = userSessions[user.user_id];
    const isLoading = actionLoading[user.user_id];
    const isSessionLoading = sessionsLoading[user.user_id];

    // Show loading while fetching session data or performing actions
    if (isSessionLoading || (!sessionStatus && isLoading)) {
      return (
        <button className="action-btn loading" disabled>
          <i className="fas fa-spinner fa-spin"></i>
          Loading...
        </button>
      );
    }

    // If no session data yet and not loading, show loading state
    if (!sessionStatus) {
      return (
        <button className="action-btn loading" disabled>
          <i className="fas fa-spinner fa-spin"></i>
          Loading...
        </button>
      );
    }

    // If user is currently checked in (has active session)
    if (sessionStatus.isCheckedIn) {
      return (
        <button
          className="action-btn check-out"
          onClick={() => handleCheckOut(user)}
          disabled={isLoading}
          title={`Checked in at: ${sessionStatus.lastSession?.check_in}`}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Checking Out...
            </>
          ) : (
            <>
              <i className="fas fa-sign-out-alt"></i>
              Check Out
            </>
          )}
        </button>
      );
    }

    // User is not currently checked in (ready for check-in)
    return (
      <button
        className="action-btn check-in"
        onClick={() => handleCheckIn(user)}
        disabled={isLoading}
        title="Check in this user"
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Checking In...
          </>
        ) : (
          <>
            <i className="fas fa-sign-in-alt"></i>
            Check In
          </>
        )}
      </button>
    );
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="manual-attendance-entry">
      <div className="entry-header">
        <h2>
          <i className="fas fa-clock"></i>
          Manual Attendance Entry - {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      </div>

      {/* Filters */}
      <div className="entry-filters">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Date (Current Day Only)</label>
          <input
            type="date"
            value={selectedDate}
            disabled
            className="filter-input disabled"
            title="Manual attendance can only be entered for the current day"
          />
        </div>

        <div className="filter-group">
          <label>Branch</label>
          <select
            value={filterBranch}
            onChange={(e) => {
              setFilterBranch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="filter-input"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.branch_id} value={branch.branch_id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="filter-input"
          >
            <option value="ALL">All Users</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="NOT_CHECKED_IN">Not Checked In</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-data-message">No users found</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const sessionStatus = userSessions[user.user_id];
                const isLoading = actionLoading[user.user_id] || sessionsLoading[user.user_id];

                let statusDisplay, statusClass, statusTitle;

                if (isLoading) {
                  statusDisplay = "Loading...";
                  statusClass = "loading";
                  statusTitle = "Fetching current status";
                } else if (!sessionStatus) {
                  statusDisplay = "Loading...";
                  statusClass = "loading";
                  statusTitle = "Fetching current status";
                } else if (sessionStatus.isCheckedIn) {
                  statusDisplay = "Checked In";
                  statusClass = "checked-in";
                  statusTitle = `Checked in at: ${sessionStatus.lastSession?.check_in}`;
                } else {
                  statusDisplay = "Not Checked In";
                  statusClass = "not-checked";
                  statusTitle = "Ready to check in";
                }

                return (
                  <tr key={user.user_id}>
                    <td className="user-name">
                      <i className="fas fa-user-circle"></i>
                      {user.name}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{getBranchName(user.branch_id)}</td>
                    <td>
                      <span
                        className={`status-badge ${statusClass}`}
                        title={statusTitle}
                      >
                        {isLoading && <i className="fas fa-spinner fa-spin status-icon"></i>}
                        {statusDisplay}
                      </span>
                    </td>
                    <td className="action-cell">
                      {getActionButton(user)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} users
        </div>

        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>

          <div className="page-info">
            Page {pagination.page} of {totalPages}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="pagination-btn"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>

          <select
            value={pagination.limit}
            onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            className="limit-select"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendanceEntry;
