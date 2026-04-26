import React, { useState } from 'react';
import './UserTrainerMapping.css';

const UserTrainerMapping = () => {
    const [activeTab, setActiveTab] = useState('mappings'); // mappings, requests
    const [searchQuery, setSearchQuery] = useState('');

    // Mappings state
    const [mappings, setMappings] = useState([
        {
            mapping_id: 1,
            member_id: 1001,
            member_name: 'Rajesh Kumar',
            member_email: 'rajesh.kumar@email.com',
            member_phone: '9876543210',
            trainer_id: 201,
            trainer_name: 'Amit Sharma',
            trainer_email: 'amit.sharma@email.com',
            branch_name: 'Koramangala Branch',
            start_date: '2024-01-15',
            end_date: null,
            status: 'ACTIVE',
            session_count: 24,
            notes: 'Focus on strength training',
        },
        {
            mapping_id: 2,
            member_id: 1002,
            member_name: 'Priya Sharma',
            member_email: 'priya.sharma@email.com',
            member_phone: '9876543211',
            trainer_id: 202,
            trainer_name: 'Vikram Singh',
            trainer_email: 'vikram.singh@email.com',
            branch_name: 'Whitefield Branch',
            start_date: '2024-02-10',
            end_date: null,
            status: 'ACTIVE',
            session_count: 18,
            notes: 'Weight loss program',
        },
        {
            mapping_id: 3,
            member_id: 1003,
            member_name: 'Amit Verma',
            member_email: 'amit.verma@email.com',
            member_phone: '9876543212',
            trainer_id: 203,
            trainer_name: 'Neha Kapoor',
            trainer_email: 'neha.kapoor@email.com',
            branch_name: 'Bangalore Main',
            start_date: '2024-03-01',
            end_date: '2024-11-30',
            status: 'INACTIVE',
            session_count: 40,
            notes: 'Completed program',
        },
        {
            mapping_id: 4,
            member_id: 1004,
            member_name: 'Sneha Patel',
            member_email: 'sneha.patel@email.com',
            member_phone: '9876543213',
            trainer_id: 201,
            trainer_name: 'Amit Sharma',
            trainer_email: 'amit.sharma@email.com',
            branch_name: 'Koramangala Branch',
            start_date: '2024-08-01',
            end_date: null,
            status: 'ACTIVE',
            session_count: 12,
            notes: 'Post-pregnancy fitness',
        },
        {
            mapping_id: 5,
            member_id: 1005,
            member_name: 'Rahul Mehta',
            member_email: 'rahul.mehta@email.com',
            member_phone: '9876543214',
            trainer_id: 202,
            trainer_name: 'Vikram Singh',
            trainer_email: 'vikram.singh@email.com',
            branch_name: 'Whitefield Branch',
            start_date: '2024-09-15',
            end_date: null,
            status: 'PENDING',
            session_count: 0,
            notes: 'Awaiting onboarding',
        },
        {
            mapping_id: 6,
            member_id: 1006,
            member_name: 'Kavita Singh',
            member_email: 'kavita.singh@email.com',
            member_phone: '9876543215',
            trainer_id: 204,
            trainer_name: 'Rohan Das',
            trainer_email: 'rohan.das@email.com',
            branch_name: 'Bangalore Main',
            start_date: '2024-05-01',
            end_date: '2024-10-01',
            status: 'TRANSFERRED',
            session_count: 30,
            notes: 'Transferred to Amit Sharma',
        },
    ]);

    // Transfer requests state
    const [transferRequests, setTransferRequests] = useState([
        {
            request_id: 1,
            mapping_id: 1,
            member_id: 1001,
            member_name: 'Rajesh Kumar',
            branch_name: 'Koramangala Branch',
            current_trainer: 'Amit Sharma',
            requested_trainer: 'Vikram Singh',
            reason: 'Schedule conflict with current trainer',
            request_status: 'REQUESTED',
            created_at: '2024-12-10 10:30:00',
        },
        {
            request_id: 2,
            mapping_id: 2,
            member_id: 1002,
            member_name: 'Priya Sharma',
            branch_name: 'Whitefield Branch',
            current_trainer: 'Vikram Singh',
            requested_trainer: 'Neha Kapoor',
            reason: 'Prefer female trainer',
            request_status: 'APPROVED',
            approved_at: '2024-11-20 09:00:00',
            created_at: '2024-11-18 14:00:00',
        },
        {
            request_id: 3,
            mapping_id: 5,
            member_id: 1005,
            member_name: 'Rahul Mehta',
            branch_name: 'Whitefield Branch',
            current_trainer: 'Vikram Singh',
            requested_trainer: 'Rohan Das',
            reason: 'Specialization in marathon training needed',
            request_status: 'REJECTED',
            created_at: '2024-12-01 08:00:00',
        },
        {
            request_id: 4,
            mapping_id: 4,
            member_id: 1004,
            member_name: 'Sneha Patel',
            branch_name: 'Koramangala Branch',
            current_trainer: 'Amit Sharma',
            requested_trainer: 'Neha Kapoor',
            reason: 'Personal preference',
            request_status: 'REQUESTED',
            created_at: '2024-12-12 16:00:00',
        },
    ]);

    // Modal states
    const [showMappingDetails, setShowMappingDetails] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showTransferDetailsModal, setShowTransferDetailsModal] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        member_name: '',
        member_email: '',
        member_phone: '',
        member_id: '',
        trainer_name: '',
        trainer_email: '',
        trainer_id: '',
        branch_name: '',
        start_date: '',
        notes: '',
    });

    const [transferFormData, setTransferFormData] = useState({
        requested_trainer: '',
        reason: '',
    });

    // Trainers list
    const trainers = [
        { id: 201, name: 'Amit Sharma', branch: 'Koramangala Branch' },
        { id: 202, name: 'Vikram Singh', branch: 'Whitefield Branch' },
        { id: 203, name: 'Neha Kapoor', branch: 'Bangalore Main' },
        { id: 204, name: 'Rohan Das', branch: 'Bangalore Main' },
    ];

    // Filter mappings
    const filteredMappings = mappings.filter(m =>
        m.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.trainer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.member_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mapping_id.toString().includes(searchQuery)
    );

    // Filter transfer requests
    const filteredTransfers = transferRequests.filter(t =>
        t.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.current_trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.requested_trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.request_id.toString().includes(searchQuery)
    );

    // Stats
    const getStats = () => {
        const activeCount = mappings.filter(m => m.status === 'ACTIVE').length;
        const inactiveCount = mappings.filter(m => m.status === 'INACTIVE').length;
        const pendingTransfers = transferRequests.filter(t => t.request_status === 'REQUESTED').length;
        const totalSessions = mappings.reduce((sum, m) => sum + m.session_count, 0);
        const uniqueTrainers = new Set(mappings.filter(m => m.status === 'ACTIVE').map(m => m.trainer_id)).size;
        return { activeCount, inactiveCount, pendingTransfers, totalSessions, uniqueTrainers };
    };

    const stats = getStats();

    const getStatusBadgeClass = (status) => {
        const map = {
            'ACTIVE': 'utm-status-active',
            'INACTIVE': 'utm-status-inactive',
            'PENDING': 'utm-status-pending',
            'TRANSFERRED': 'utm-status-transferred',
            'REQUESTED': 'utm-status-requested',
            'APPROVED': 'utm-status-approved',
            'REJECTED': 'utm-status-rejected',
        };
        return map[status] || '';
    };

    // Handlers
    const handleViewMapping = (mapping) => {
        setSelectedMapping(mapping);
        setShowMappingDetails(true);
    };

    const handleAddMapping = () => {
        setFormData({
            member_name: '', member_email: '', member_phone: '',
            member_id: '', trainer_name: '', trainer_email: '',
            trainer_id: '', branch_name: '',
            start_date: new Date().toISOString().split('T')[0], notes: '',
        });
        setIsEditing(false);
        setShowAddEditModal(true);
    };

    const handleEditMapping = (mapping) => {
        setSelectedMapping(mapping);
        setFormData({ ...mapping });
        setIsEditing(true);
        setShowAddEditModal(true);
    };

    const handleDeactivateMapping = (mapping) => {
        if (window.confirm(`Deactivate mapping for ${mapping.member_name}?`)) {
            setMappings(mappings.map(m =>
                m.mapping_id === mapping.mapping_id
                    ? { ...m, status: 'INACTIVE', end_date: new Date().toISOString().split('T')[0] }
                    : m
            ));
            alert('Mapping deactivated successfully!');
        }
    };

    const handleTransferRequest = (mapping) => {
        setSelectedMapping(mapping);
        setTransferFormData({ requested_trainer: '', reason: '' });
        setShowTransferModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            setMappings(mappings.map(m =>
                m.mapping_id === selectedMapping.mapping_id ? { ...m, ...formData } : m
            ));
            alert('Mapping updated successfully!');
        } else {
            const newMapping = {
                mapping_id: mappings.length + 1,
                ...formData,
                status: 'PENDING',
                session_count: 0,
            };
            setMappings([newMapping, ...mappings]);
            alert('Mapping created successfully!');
        }
        setShowAddEditModal(false);
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        const newRequest = {
            request_id: transferRequests.length + 1,
            mapping_id: selectedMapping.mapping_id,
            member_id: selectedMapping.member_id,
            member_name: selectedMapping.member_name,
            branch_name: selectedMapping.branch_name,
            current_trainer: selectedMapping.trainer_name,
            requested_trainer: transferFormData.requested_trainer,
            reason: transferFormData.reason,
            request_status: 'REQUESTED',
            created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
        };
        setTransferRequests([newRequest, ...transferRequests]);
        alert('Transfer request submitted successfully!');
        setShowTransferModal(false);
    };

    const handleApproveTransfer = (transfer) => {
        if (window.confirm(`Approve transfer request for ${transfer.member_name}?`)) {
            setTransferRequests(transferRequests.map(t =>
                t.request_id === transfer.request_id
                    ? { ...t, request_status: 'APPROVED', approved_at: new Date().toISOString().replace('T', ' ').split('.')[0] }
                    : t
            ));
            setMappings(mappings.map(m =>
                m.mapping_id === transfer.mapping_id
                    ? { ...m, trainer_name: transfer.requested_trainer, status: 'TRANSFERRED' }
                    : m
            ));
            alert('Transfer approved!');
        }
    };

    const handleRejectTransfer = (transfer) => {
        if (window.confirm(`Reject transfer request for ${transfer.member_name}?`)) {
            setTransferRequests(transferRequests.map(t =>
                t.request_id === transfer.request_id
                    ? { ...t, request_status: 'REJECTED' }
                    : t
            ));
            alert('Transfer rejected!');
        }
    };

    return (
        <div className="user-trainer-mapping">
            {/* Header */}
            <div className="utm-header">
                <div>
                    <h1 className="utm-title">User Trainer Mapping</h1>
                    <p className="utm-subtitle">Manage member-trainer assignments, transfers, and session tracking</p>
                </div>
            </div>

            {/* Stats */}
            <div className="utm-stats-bar">
                <div className="utm-stat-item">
                    <i className="fas fa-link"></i>
                    <div>
                        <span className="utm-stat-label">Active Mappings</span>
                        <span className="utm-stat-value">{stats.activeCount}</span>
                    </div>
                </div>
                <div className="utm-stat-item">
                    <i className="fas fa-user-slash"></i>
                    <div>
                        <span className="utm-stat-label">Inactive</span>
                        <span className="utm-stat-value">{stats.inactiveCount}</span>
                    </div>
                </div>
                <div className="utm-stat-item">
                    <i className="fas fa-exchange-alt"></i>
                    <div>
                        <span className="utm-stat-label">Pending Transfers</span>
                        <span className="utm-stat-value">{stats.pendingTransfers}</span>
                    </div>
                </div>
                <div className="utm-stat-item">
                    <i className="fas fa-dumbbell"></i>
                    <div>
                        <span className="utm-stat-label">Total Sessions</span>
                        <span className="utm-stat-value">{stats.totalSessions}</span>
                    </div>
                </div>
                <div className="utm-stat-item">
                    <i className="fas fa-chalkboard-teacher"></i>
                    <div>
                        <span className="utm-stat-label">Active Trainers</span>
                        <span className="utm-stat-value">{stats.uniqueTrainers}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="utm-tabs">
                <button
                    className={`utm-tab ${activeTab === 'mappings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mappings')}
                >
                    <i className="fas fa-users"></i>
                    Mappings
                </button>
                <button
                    className={`utm-tab ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    <i className="fas fa-exchange-alt"></i>
                    Transfer Requests
                    {stats.pendingTransfers > 0 && (
                        <span className="utm-badge">{stats.pendingTransfers}</span>
                    )}
                </button>
            </div>

            {/* Search & Actions */}
            <div className="utm-search-section">
                <div className="utm-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder={
                            activeTab === 'mappings'
                                ? 'Search by member, trainer, branch...'
                                : 'Search transfer requests...'
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="utm-clear-search" onClick={() => setSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                {activeTab === 'mappings' && (
                    <button className="utm-add-btn" onClick={handleAddMapping}>
                        <i className="fas fa-plus"></i>
                        Add Mapping
                    </button>
                )}
            </div>

            {/* Mappings Table */}
            {activeTab === 'mappings' && (
                <div className="utm-table-container">
                    <table className="utm-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Member Details</th>
                                <th>Trainer Details</th>
                                <th>Branch</th>
                                <th>Start Date</th>
                                <th>Sessions</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMappings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="utm-no-data">
                                        <i className="fas fa-inbox"></i>
                                        <p>No mappings found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMappings.map((mapping) => (
                                    <tr key={mapping.mapping_id}>
                                        <td>#{mapping.mapping_id}</td>
                                        <td>
                                            <div className="utm-user-info">
                                                <strong>{mapping.member_name}</strong>
                                                <span>{mapping.member_email}</span>
                                                <span>{mapping.member_phone}</span>
                                                <span className="utm-id-tag">ID: {mapping.member_id}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="utm-user-info">
                                                <strong>{mapping.trainer_name}</strong>
                                                <span>{mapping.trainer_email}</span>
                                                <span className="utm-trainer-tag">ID: {mapping.trainer_id}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="utm-branch-tag">{mapping.branch_name}</span>
                                        </td>
                                        <td>
                                            <div className="utm-date-info">
                                                <span>{mapping.start_date}</span>
                                                {mapping.end_date && (
                                                    <>
                                                        <span>to</span>
                                                        <span>{mapping.end_date}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="utm-session-count">{mapping.session_count}</span>
                                        </td>
                                        <td>
                                            <span className={`utm-status-badge ${getStatusBadgeClass(mapping.status)}`}>
                                                {mapping.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="utm-action-buttons">
                                                <button
                                                    className="utm-action-btn view"
                                                    onClick={() => handleViewMapping(mapping)}
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    className="utm-action-btn edit"
                                                    onClick={() => handleEditMapping(mapping)}
                                                    title="Edit"
                                                    disabled={mapping.status === 'INACTIVE'}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="utm-action-btn transfer"
                                                    onClick={() => handleTransferRequest(mapping)}
                                                    title="Request Transfer"
                                                    disabled={mapping.status !== 'ACTIVE'}
                                                >
                                                    <i className="fas fa-exchange-alt"></i>
                                                </button>
                                                <button
                                                    className="utm-action-btn deactivate"
                                                    onClick={() => handleDeactivateMapping(mapping)}
                                                    title="Deactivate"
                                                    disabled={mapping.status === 'INACTIVE'}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transfer Requests Table */}
            {activeTab === 'requests' && (
                <div className="utm-table-container">
                    <table className="utm-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Member Details</th>
                                <th>Current Trainer</th>
                                <th>Requested Trainer</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Requested On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransfers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="utm-no-data">
                                        <i className="fas fa-inbox"></i>
                                        <p>No transfer requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransfers.map((transfer) => (
                                    <tr key={transfer.request_id}>
                                        <td>#{transfer.request_id}</td>
                                        <td>
                                            <div className="utm-user-info">
                                                <strong>{transfer.member_name}</strong>
                                                <span className="utm-branch-tag">{transfer.branch_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="utm-trainer-cell">
                                                <i className="fas fa-user-tie"></i>
                                                {transfer.current_trainer}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="utm-trainer-cell requested">
                                                <i className="fas fa-user-tie"></i>
                                                {transfer.requested_trainer}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="utm-reason">
                                                {transfer.reason.length > 50 ? transfer.reason.substring(0, 50) + '...' : transfer.reason}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`utm-status-badge ${getStatusBadgeClass(transfer.request_status)}`}>
                                                {transfer.request_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="utm-date-text">{transfer.created_at}</span>
                                        </td>
                                        <td>
                                            <div className="utm-action-buttons">
                                                <button
                                                    className="utm-action-btn view"
                                                    onClick={() => { setSelectedTransfer(transfer); setShowTransferDetailsModal(true); }}
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                {transfer.request_status === 'REQUESTED' && (
                                                    <>
                                                        <button
                                                            className="utm-action-btn approve"
                                                            onClick={() => handleApproveTransfer(transfer)}
                                                            title="Approve"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button
                                                            className="utm-action-btn reject"
                                                            onClick={() => handleRejectTransfer(transfer)}
                                                            title="Reject"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mapping Details Modal */}
            {showMappingDetails && selectedMapping && (
                <div className="utm-modal-overlay" onClick={() => setShowMappingDetails(false)}>
                    <div className="utm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="utm-modal-header">
                            <h2><i className="fas fa-id-card"></i> Mapping Details</h2>
                            <button className="utm-modal-close" onClick={() => setShowMappingDetails(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="utm-modal-body">
                            <div className="utm-detail-section">
                                <h3><i className="fas fa-user"></i> Member Information</h3>
                                <div className="utm-detail-grid">
                                    <div className="utm-detail-item">
                                        <label>Name</label>
                                        <span>{selectedMapping.member_name}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Member ID</label>
                                        <span>#{selectedMapping.member_id}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Email</label>
                                        <span>{selectedMapping.member_email}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Phone</label>
                                        <span>{selectedMapping.member_phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="utm-detail-section">
                                <h3><i className="fas fa-chalkboard-teacher"></i> Trainer Information</h3>
                                <div className="utm-detail-grid">
                                    <div className="utm-detail-item">
                                        <label>Trainer Name</label>
                                        <span>{selectedMapping.trainer_name}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Trainer ID</label>
                                        <span>#{selectedMapping.trainer_id}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Branch</label>
                                        <span>{selectedMapping.branch_name}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Email</label>
                                        <span>{selectedMapping.trainer_email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="utm-detail-section">
                                <h3><i className="fas fa-info-circle"></i> Mapping Status</h3>
                                <div className="utm-detail-grid">
                                    <div className="utm-detail-item">
                                        <label>Status</label>
                                        <span className={`utm-status-badge ${getStatusBadgeClass(selectedMapping.status)}`}>
                                            {selectedMapping.status}
                                        </span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Sessions Completed</label>
                                        <span>{selectedMapping.session_count}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Start Date</label>
                                        <span>{selectedMapping.start_date}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>End Date</label>
                                        <span>{selectedMapping.end_date || 'Ongoing'}</span>
                                    </div>
                                    {selectedMapping.notes && (
                                        <div className="utm-detail-item utm-full-width">
                                            <label>Notes</label>
                                            <span>{selectedMapping.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Mapping Modal */}
            {showAddEditModal && (
                <div className="utm-modal-overlay" onClick={() => setShowAddEditModal(false)}>
                    <div className="utm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="utm-modal-header">
                            <h2>
                                <i className={`fas fa-${isEditing ? 'edit' : 'plus'}`}></i>
                                {isEditing ? 'Edit Mapping' : 'Add New Mapping'}
                            </h2>
                            <button className="utm-modal-close" onClick={() => setShowAddEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="utm-modal-body">
                            <div className="utm-form-section-title">
                                <i className="fas fa-user"></i> Member Details
                            </div>
                            <div className="utm-form-row">
                                <div className="utm-form-group">
                                    <label>Member Name *</label>
                                    <input
                                        type="text"
                                        value={formData.member_name}
                                        onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                                        placeholder="e.g., Rajesh Kumar"
                                        required
                                    />
                                </div>
                                <div className="utm-form-group">
                                    <label>Member ID *</label>
                                    <input
                                        type="number"
                                        value={formData.member_id}
                                        onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                                        placeholder="e.g., 1001"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="utm-form-row">
                                <div className="utm-form-group">
                                    <label>Member Email</label>
                                    <input
                                        type="email"
                                        value={formData.member_email}
                                        onChange={(e) => setFormData({ ...formData, member_email: e.target.value })}
                                        placeholder="member@email.com"
                                    />
                                </div>
                                <div className="utm-form-group">
                                    <label>Member Phone</label>
                                    <input
                                        type="text"
                                        value={formData.member_phone}
                                        onChange={(e) => setFormData({ ...formData, member_phone: e.target.value })}
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            <div className="utm-form-section-title">
                                <i className="fas fa-chalkboard-teacher"></i> Trainer Details
                            </div>
                            <div className="utm-form-row">
                                <div className="utm-form-group">
                                    <label>Select Trainer *</label>
                                    <select
                                        value={formData.trainer_id}
                                        onChange={(e) => {
                                            const trainer = trainers.find(t => t.id === parseInt(e.target.value));
                                            setFormData({
                                                ...formData,
                                                trainer_id: e.target.value,
                                                trainer_name: trainer ? trainer.name : '',
                                            });
                                        }}
                                        required
                                    >
                                        <option value="">Select Trainer</option>
                                        {trainers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} — {t.branch}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="utm-form-group">
                                    <label>Branch *</label>
                                    <select
                                        value={formData.branch_name}
                                        onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Branch</option>
                                        <option value="Bangalore Main">Bangalore Main</option>
                                        <option value="Whitefield Branch">Whitefield Branch</option>
                                        <option value="Koramangala Branch">Koramangala Branch</option>
                                    </select>
                                </div>
                            </div>

                            <div className="utm-form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="utm-form-group">
                                <label>Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Add any notes about this mapping..."
                                />
                            </div>

                            <div className="utm-modal-actions">
                                <button type="button" className="utm-btn-secondary" onClick={() => setShowAddEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="utm-btn-primary">
                                    {isEditing ? 'Update Mapping' : 'Create Mapping'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Request Modal */}
            {showTransferModal && selectedMapping && (
                <div className="utm-modal-overlay" onClick={() => setShowTransferModal(false)}>
                    <div className="utm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="utm-modal-header">
                            <h2><i className="fas fa-exchange-alt"></i> Request Trainer Transfer</h2>
                            <button className="utm-modal-close" onClick={() => setShowTransferModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleTransferSubmit} className="utm-modal-body">
                            <div className="utm-form-group">
                                <label>Member</label>
                                <input type="text" value={selectedMapping.member_name} disabled />
                            </div>
                            <div className="utm-form-group">
                                <label>Current Trainer</label>
                                <input type="text" value={selectedMapping.trainer_name} disabled />
                            </div>
                            <div className="utm-form-group">
                                <label>New Trainer *</label>
                                <select
                                    value={transferFormData.requested_trainer}
                                    onChange={(e) => setTransferFormData({ ...transferFormData, requested_trainer: e.target.value })}
                                    required
                                >
                                    <option value="">Select New Trainer</option>
                                    {trainers
                                        .filter(t => t.name !== selectedMapping.trainer_name)
                                        .map(t => (
                                            <option key={t.id} value={t.name}>{t.name} — {t.branch}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="utm-form-group">
                                <label>Reason for Transfer *</label>
                                <textarea
                                    value={transferFormData.reason}
                                    onChange={(e) => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                                    rows="3"
                                    placeholder="Please provide a reason for the transfer request..."
                                    required
                                />
                            </div>
                            <div className="utm-modal-actions">
                                <button type="button" className="utm-btn-secondary" onClick={() => setShowTransferModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="utm-btn-primary">
                                    Submit Transfer Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Details Modal */}
            {showTransferDetailsModal && selectedTransfer && (
                <div className="utm-modal-overlay" onClick={() => setShowTransferDetailsModal(false)}>
                    <div className="utm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="utm-modal-header">
                            <h2><i className="fas fa-exchange-alt"></i> Transfer Request Details</h2>
                            <button className="utm-modal-close" onClick={() => setShowTransferDetailsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="utm-modal-body">
                            <div className="utm-detail-section">
                                <h3><i className="fas fa-user"></i> Member Information</h3>
                                <div className="utm-detail-grid">
                                    <div className="utm-detail-item">
                                        <label>Name</label>
                                        <span>{selectedTransfer.member_name}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Branch</label>
                                        <span>{selectedTransfer.branch_name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="utm-detail-section">
                                <h3><i className="fas fa-exchange-alt"></i> Transfer Information</h3>
                                <div className="utm-detail-grid">
                                    <div className="utm-detail-item">
                                        <label>Current Trainer</label>
                                        <span>{selectedTransfer.current_trainer}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Requested Trainer</label>
                                        <span>{selectedTransfer.requested_trainer}</span>
                                    </div>
                                    <div className="utm-detail-item utm-full-width">
                                        <label>Reason</label>
                                        <span>{selectedTransfer.reason}</span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Status</label>
                                        <span className={`utm-status-badge ${getStatusBadgeClass(selectedTransfer.request_status)}`}>
                                            {selectedTransfer.request_status}
                                        </span>
                                    </div>
                                    <div className="utm-detail-item">
                                        <label>Requested On</label>
                                        <span>{selectedTransfer.created_at}</span>
                                    </div>
                                    {selectedTransfer.approved_at && (
                                        <div className="utm-detail-item">
                                            <label>Approved On</label>
                                            <span>{selectedTransfer.approved_at}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTrainerMapping;
