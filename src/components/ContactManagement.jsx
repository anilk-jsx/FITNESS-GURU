import React, { useState, useEffect } from 'react';
import './ContactManagement.css';
import { tokenManager } from '../utils/tokenManager';

const ContactManagement = () => {
    // Get current date in local timezone (not UTC)
    const getCurrentLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [filterService, setFilterService] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');

    // API data states
    const [contactData, setContactData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Network and retry states
    const [isOnline, setIsOnline] = useState(navigator.onLine || true);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

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

    // Enhanced API Functions with retry logic
    const fetchContactData = async (retryAttempt = 0) => {
        try {
            setLoading(true);
            clearMessages();

            if (!isOnline) {
                showError('You are offline. Please check your internet connection and try again.');
                return;
            }

            const queryParams = new URLSearchParams();
            queryParams.append('page', pagination.page.toString());
            queryParams.append('limit', pagination.limit.toString());

            const url = `${tokenManager.API_BASE_URL}/api/viewContactUs?${queryParams.toString()}`;

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

            if (data.status === 'success') {
                setContactData(data.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination?.total || 0
                }));
                setRetryCount(0); // Reset retry count on success

                if (data.data && data.data.length > 0) {
                    showSuccess(`Successfully loaded ${data.data.length} contact submissions`);
                } else {
                    showError('No contact submissions found.');
                }
            } else {
                throw new Error(data.message || 'Failed to fetch contact data');
            }

        } catch (error) {
            console.error('Error fetching contact data:', error);

            // Implement retry logic for network errors
            if (retryAttempt < maxRetries && (error.name === 'TypeError' && error.message.includes('fetch'))) {
                const delay = Math.pow(2, retryAttempt) * 1000;
                setTimeout(() => {
                    fetchContactData(retryAttempt + 1);
                }, delay);
                setRetryCount(retryAttempt + 1);
                showError(`Connection failed. Retrying... (${retryAttempt + 1}/${maxRetries})`);
                return;
            }

            // Handle specific error types with actionable messages
            let errorMessage = 'Failed to load contact submissions: ';

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Network connection failed. Please check your internet connection and try again.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage += 'Your session has expired. Please log out and log in again to continue.';
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                errorMessage += 'You do not have permission to view contact data. Please contact your administrator.';
            } else if (error.message.includes('404')) {
                errorMessage += 'Contact service is not available. Please try again later or contact support.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Server error occurred. Please try again in a few moments.';
            } else if (error.message.includes('timeout')) {
                errorMessage += 'Request timed out. Please check your connection and try again.';
            } else {
                errorMessage += error.message || 'An unexpected error occurred.';
            }

            showError(errorMessage);
            setContactData([]);
        } finally {
            setLoading(false);
        }
    };

    // useEffect to fetch data on component mount and pagination changes
    useEffect(() => {
        fetchContactData();
    }, [pagination.page, pagination.limit]);

    // Filter contact data
    const filteredContacts = contactData.filter(contact => {
        const matchesSearch =
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phone.includes(searchQuery) ||
            contact.message.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesService = filterService === 'ALL' || contact.service === filterService;

        const matchesDate = !filterDate || contact.created_at.includes(filterDate);

        return matchesSearch && matchesService && matchesDate;
    });

    // Get statistics
    const getStats = () => {
        const today = getCurrentLocalDate();
        const todayContacts = contactData.filter(contact =>
            contact.created_at && contact.created_at.split(' ')[0] === today
        );

        const totalContacts = contactData.length;
        const todayCount = todayContacts.length;

        // Count by service types
        const serviceCount = contactData.reduce((acc, contact) => {
            acc[contact.service] = (acc[contact.service] || 0) + 1;
            return acc;
        }, {});

        const topService = Object.keys(serviceCount).reduce((a, b) =>
            serviceCount[a] > serviceCount[b] ? a : b, 'N/A'
        );

        return { totalContacts, todayCount, topService, serviceCount };
    };

    const stats = getStats();

    // Handlers
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleClearFilters = () => {
        setFilterService('ALL');
        setFilterDate('');
        setSearchQuery('');
        clearMessages();
    };

    const formatDateTime = (datetime) => {
        if (!datetime) return 'N/A';
        const date = new Date(datetime);
        return date.toLocaleDateString('en-IN') + ' ' +
               date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getServiceBadgeClass = (service) => {
        const serviceMap = {
            'Personal Training': 'service-personal',
            'Membership Inquiry': 'service-membership',
            'Group Classes': 'service-group',
            'Other': 'service-other'
        };
        return serviceMap[service] || 'service-default';
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="contact-management">
            {/* Header */}
            <div className="contact-header">
                <div>
                    <h1 className="contact-title">Contact Management</h1>
                    <p className="contact-subtitle">
                        View and manage customer inquiries and contact submissions
                    </p>
                </div>
                <div className="contact-header-actions">
                    <button
                        onClick={() => {
                            clearMessages();
                            fetchContactData();
                        }}
                        className="contact-btn-secondary"
                        disabled={loading}
                        title="Refresh Data"
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                        Refresh
                        {retryCount > 0 && ` (Retry ${retryCount}/${maxRetries})`}
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="contact-stats-bar">
                <div className="contact-stat-item">
                    <i className="fas fa-envelope"></i>
                    <div>
                        <span className="contact-stat-label">Total Contacts</span>
                        <span className="contact-stat-value">{stats.totalContacts}</span>
                    </div>
                </div>
                <div className="contact-stat-item">
                    <i className="fas fa-calendar-day"></i>
                    <div>
                        <span className="contact-stat-label">Today's Inquiries</span>
                        <span className="contact-stat-value">{stats.todayCount}</span>
                    </div>
                </div>
                <div className="contact-stat-item">
                    <i className="fas fa-star"></i>
                    <div>
                        <span className="contact-stat-label">Top Service</span>
                        <span className="contact-stat-value">{stats.topService}</span>
                    </div>
                </div>
                <div className="contact-stat-item">
                    <i className="fas fa-users"></i>
                    <div>
                        <span className="contact-stat-label">Showing Results</span>
                        <span className="contact-stat-value">{filteredContacts.length}</span>
                    </div>
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
                        className="close-success-btn"
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
                                        fetchContactData();
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

            {/* Filters */}
            <div className="contact-filters">
                <div className="contact-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, or message..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="contact-clear-search" onClick={() => setSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="contact-filter"
                >
                    <option value="ALL">All Services</option>
                    <option value="Personal Training">Personal Training</option>
                    <option value="Membership Inquiry">Membership Inquiry</option>
                    <option value="Group Classes">Group Classes</option>
                    <option value="Other">Other</option>
                </select>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="contact-filter"
                    title="Filter by date"
                />
                {(filterService !== 'ALL' || filterDate || searchQuery) && (
                    <button
                        className="contact-clear-filters"
                        onClick={handleClearFilters}
                        title="Clear all filters"
                    >
                        <i className="fas fa-times"></i>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Contact Table */}
            <div className="contact-table-container">
                <table className="contact-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Contact Details</th>
                            <th>Service</th>
                            <th>Message</th>
                            <th>Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error && !loading ? (
                            <tr>
                                <td colSpan="5" className="contact-error">
                                    <div className="error-content-wrapper">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <p>{error}</p>
                                        <button onClick={() => fetchContactData()} className="contact-btn-primary contact-btn-sm">
                                            <i className="fas fa-redo"></i> Retry
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : loading ? (
                            <tr>
                                <td colSpan="5" className="contact-loading">
                                    <div className="loading-content">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <div className="loading-text">
                                            <span>Loading contact submissions...</span>
                                            {retryCount > 0 && <small>Retrying connection ({retryCount}/{maxRetries})</small>}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : !error && filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="contact-no-data">
                                    <div className="no-data-content">
                                        <i className="fas fa-inbox"></i>
                                        <div className="no-data-text">
                                            <span>No contact submissions found</span>
                                            {searchQuery && <small>Try adjusting your search filters</small>}
                                            {!isOnline && <small>You may be offline - check your connection</small>}
                                        </div>
                                        {!searchQuery && (
                                            <button
                                                onClick={() => fetchContactData()}
                                                className="reload-contacts-btn"
                                                disabled={loading}
                                            >
                                                <i className="fas fa-redo"></i>
                                                Reload Contacts
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td data-label="ID">#{contact.id}</td>
                                    <td data-label="Contact Details">
                                        <div className="contact-info">
                                            <strong>{contact.name}</strong>
                                            <span>{contact.email}</span>
                                            <span>{contact.phone}</span>
                                        </div>
                                    </td>
                                    <td data-label="Service">
                                        <span className={`service-badge ${getServiceBadgeClass(contact.service)}`}>
                                            {contact.service}
                                        </span>
                                    </td>
                                    <td data-label="Message">
                                        <div className="message-content">
                                            <p>{contact.message}</p>
                                        </div>
                                    </td>
                                    <td data-label="Date & Time">
                                        {formatDateTime(contact.created_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="contact-pagination">
                    <div className="pagination-info">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="pagination-btn"
                        >
                            <i className="fas fa-chevron-left"></i>
                            Previous
                        </button>

                        <div className="pagination-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={loading}
                                    className={`pagination-number ${pageNum === pagination.page ? 'active' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= totalPages || loading}
                            className="pagination-btn"
                        >
                            Next
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManagement;