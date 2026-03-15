import React, { useState, useEffect } from 'react';
import './ManualAttendanceEntry.css';
import tokenManager from '../utils/tokenManager';

const ManualAttendanceEntry = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, CHECKED_IN, NOT_CHECKED_IN
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
  }, [pagination.page, filterBranch, selectedDate]);

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

      if (!response.ok) throw new Error("Failed to fetch session status");

      const data = await response.json();
      const sessions = data.status === "success" ? data.data : [];

      const sessionInfo = {
        hasCheckedIn: sessions.length > 0,
        hasCheckedOut: sessions.length > 0 && sessions.some((s) => s.check_out_time),
        sessions: sessions,
      };

      setUserSessions((prev) => ({
        ...prev,
        [userId]: sessionInfo,
      }));

      return sessionInfo;
    } catch (err) {
      console.error(`Error fetching session status for user ${userId}:`, err);
      return { hasCheckedIn: false, hasCheckedOut: false, sessions: [] };
    } finally {
      setSessionsLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Check-in user
  const handleCheckIn = async (user) => {
    try {
      setActionLoading((prev) => ({ ...prev, [user.user_id]: true }));

      const checkInTime = new Date().toLocaleString("sv-SE").replace(" ", "T");

      const payload = {
        user_id: user.user_id,
        gym_id: 1,
        branch_id: user.branch_id || 1,
        shift_id: 1,
        device_id: 1,
        attendance_date: selectedDate,
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check in");
      }

      const data = await response.json();
      if (data.status === "success") {
        alert(`${user.name} checked in successfully!`);
        // Update session cache
        setUserSessions((prev) => ({
          ...prev,
          [user.user_id]: { hasCheckedIn: true, hasCheckedOut: false, sessions: [] },
        }));
      } else {
        throw new Error(data.message || "Failed to check in");
      }
    } catch (err) {
      console.error("Error checking in user:", err);
      alert(`Failed to check in: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.user_id]: false }));
    }
  };

  // Check-out user
  const handleCheckOut = async (user) => {
    try {
      setActionLoading((prev) => ({ ...prev, [user.user_id]: true }));

      const checkOutTime = new Date().toLocaleString("sv-SE").replace(" ", "T");

      const payload = {
        user_id: user.user_id,
        gym_id: 1,
        branch_id: user.branch_id || 1,
        shift_id: 1,
        device_id: 1,
        attendance_date: selectedDate,
        status: "ON_TIME",
        check_in_time: userSessions[user.user_id]?.sessions[0]?.check_in_time || checkOutTime,
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check out");
      }

      const data = await response.json();
      if (data.status === "success") {
        alert(`${user.name} checked out successfully!`);
        // Update session cache
        setUserSessions((prev) => ({
          ...prev,
          [user.user_id]: { hasCheckedIn: true, hasCheckedOut: true, sessions: [] },
        }));
      } else {
        throw new Error(data.message || "Failed to check out");
      }
    } catch (err) {
      console.error("Error checking out user:", err);
      alert(`Failed to check out: ${err.message}`);
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
          if (filterStatus === "CHECKED_IN" && !sessionStatus.hasCheckedIn) return null;
          if (filterStatus === "NOT_CHECKED_IN" && sessionStatus.hasCheckedIn) return null;
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

  // Get action button for user
  const getActionButton = (user) => {
    const sessionStatus = userSessions[user.user_id];
    const isLoading = actionLoading[user.user_id];
    const isSessionLoading = sessionsLoading[user.user_id];

    if (isSessionLoading) {
      return (
        <button className="action-btn loading" disabled>
          <i className="fas fa-spinner fa-spin"></i>
          Loading...
        </button>
      );
    }

    if (!sessionStatus) {
      return (
        <button
          className="action-btn check-in"
          onClick={() => {
            fetchUserSessionStatus(user.user_id).then((status) => {
              if (status.hasCheckedIn) {
                handleCheckOut(user);
              } else {
                handleCheckIn(user);
              }
            });
          }}
          disabled={isLoading}
        >
          <i className="fas fa-sync"></i>
          Checking...
        </button>
      );
    }

    if (sessionStatus.hasCheckedIn && sessionStatus.hasCheckedOut) {
      return (
        <button className="action-btn completed" disabled>
          <i className="fas fa-check-circle"></i>
          Checked Out
        </button>
      );
    }

    if (sessionStatus.hasCheckedIn && !sessionStatus.hasCheckedOut) {
      return (
        <button
          className="action-btn check-out"
          onClick={() => handleCheckOut(user)}
          disabled={isLoading}
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

    // Not checked in
    return (
      <button
        className="action-btn check-in"
        onClick={() => handleCheckIn(user)}
        disabled={isLoading}
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
          Manual Attendance Entry
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
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-input"
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
                const statusDisplay = !sessionStatus
                  ? "Loading..."
                  : sessionStatus.hasCheckedIn && sessionStatus.hasCheckedOut
                  ? "Checked Out"
                  : sessionStatus.hasCheckedIn
                  ? "Checked In"
                  : "Not Checked In";

                return (
                  <tr key={user.user_id}>
                    <td className="user-name">
                      <i className="fas fa-user-circle"></i>
                      {user.name}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.branch_name || "N/A"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          sessionStatus?.hasCheckedOut
                            ? "completed"
                            : sessionStatus?.hasCheckedIn
                            ? "checked-in"
                            : "not-checked"
                        }`}
                      >
                        {statusDisplay}
                      </span>
                    </td>
                    <td className="action-cell" onClick={() => fetchUserSessionStatus(user.user_id)}>
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
