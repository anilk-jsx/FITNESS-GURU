import React, { useState } from 'react';
import './BranchManagement.css';

const BranchManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Sample data for branches
    const [branches, setBranches] = useState([
        {
            branch_id: 1,
            gym_id: 1,
            branch_name: 'Bangalore Main',
            branch_code: 'BLR-MAIN',
            address: '123, MG Road, Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560001',
            phone: '080-12345678',
            email: 'bangalore.main@fitnessguru.com',
            manager_name: 'Rajesh Kumar',
            manager_phone: '9876543210',
            capacity: 200,
            facilities: 'Gym Equipment, Cardio Zone, Steam Room, Yoga Studio, Parking',
            operating_hours: '5:00 AM - 11:00 PM',
            monthly_rent: 150000,
            staff_count: 15,
            trainer_count: 8,
            member_count: 180,
            opening_date: '2020-01-15',
            status: 'ACTIVE'
        },
        {
            branch_id: 2,
            gym_id: 1,
            branch_name: 'Whitefield Branch',
            branch_code: 'BLR-WF',
            address: '45, ITPL Main Road, Whitefield, Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560066',
            phone: '080-87654321',
            email: 'whitefield@fitnessguru.com',
            manager_name: 'Priya Sharma',
            manager_phone: '9876543211',
            capacity: 150,
            facilities: 'Gym Equipment, Cardio Zone, Aerobics Studio, Parking',
            operating_hours: '6:00 AM - 10:00 PM',
            monthly_rent: 120000,
            staff_count: 12,
            trainer_count: 6,
            member_count: 135,
            opening_date: '2021-03-20',
            status: 'ACTIVE'
        },
        {
            branch_id: 3,
            gym_id: 1,
            branch_name: 'Koramangala Branch',
            branch_code: 'BLR-KRM',
            address: '78, 100 Feet Road, Koramangala, Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560034',
            phone: '080-23456789',
            email: 'koramangala@fitnessguru.com',
            manager_name: 'Amit Verma',
            manager_phone: '9876543212',
            capacity: 180,
            facilities: 'Gym Equipment, Cardio Zone, Zumba Studio, Steam Room, Sauna, Parking',
            operating_hours: '5:30 AM - 11:00 PM',
            monthly_rent: 140000,
            staff_count: 14,
            trainer_count: 7,
            member_count: 165,
            opening_date: '2020-09-10',
            status: 'ACTIVE'
        },
        {
            branch_id: 4,
            gym_id: 1,
            branch_name: 'Indiranagar Branch',
            branch_code: 'BLR-INR',
            address: '22, 100 Feet Road, Indiranagar, Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560038',
            phone: '080-34567890',
            email: 'indiranagar@fitnessguru.com',
            manager_name: 'Sneha Reddy',
            manager_phone: '9876543213',
            capacity: 120,
            facilities: 'Gym Equipment, Cardio Zone, CrossFit Area, Parking',
            operating_hours: '6:00 AM - 10:00 PM',
            monthly_rent: 110000,
            staff_count: 10,
            trainer_count: 5,
            member_count: 95,
            opening_date: '2022-01-15',
            status: 'ACTIVE'
        },
        {
            branch_id: 5,
            gym_id: 1,
            branch_name: 'HSR Layout Branch',
            branch_code: 'BLR-HSR',
            address: '56, Sector 2, HSR Layout, Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560102',
            phone: '080-45678901',
            email: 'hsr@fitnessguru.com',
            manager_name: 'Vikram Singh',
            manager_phone: '9876543214',
            capacity: 100,
            facilities: 'Gym Equipment, Cardio Zone, Yoga Studio',
            operating_hours: '6:00 AM - 9:00 PM',
            monthly_rent: 90000,
            staff_count: 8,
            trainer_count: 4,
            member_count: 75,
            opening_date: '2023-06-01',
            status: 'UNDER_MAINTENANCE'
        },
        {
            branch_id: 6,
            gym_id: 1,
            branch_name: 'Jayanagar Branch',
            branch_code: 'BLR-JYN',
            address: '34, 4th Block, Jayanagar, Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560041',
            phone: '080-56789012',
            email: 'jayanagar@fitnessguru.com',
            manager_name: 'Lakshmi Iyer',
            manager_phone: '9876543215',
            capacity: 90,
            facilities: 'Gym Equipment, Cardio Zone, Pilates Studio',
            operating_hours: '6:00 AM - 9:00 PM',
            monthly_rent: 85000,
            staff_count: 7,
            trainer_count: 4,
            member_count: 0,
            opening_date: '2024-02-01',
            status: 'INACTIVE'
        }
    ]);

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        gym_id: 1,
        branch_name: '',
        branch_code: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        phone: '',
        email: '',
        manager_name: '',
        manager_phone: '',
        capacity: '',
        facilities: '',
        operating_hours: '6:00 AM - 10:00 PM',
        monthly_rent: '',
        opening_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    // Filter branches
    const filteredBranches = branches.filter(branch => {
        const matchesSearch = 
            branch.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.branch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.manager_name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'ALL' || branch.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Get statistics
    const getStats = () => {
        const totalBranches = branches.length;
        const activeBranches = branches.filter(b => b.status === 'ACTIVE').length;
        const totalMembers = branches.reduce((sum, b) => sum + b.member_count, 0);
        const totalCapacity = branches.reduce((sum, b) => sum + b.capacity, 0);
        const totalStaff = branches.reduce((sum, b) => sum + b.staff_count, 0);
        const totalTrainers = branches.reduce((sum, b) => sum + b.trainer_count, 0);
        const occupancyRate = totalCapacity > 0 ? ((totalMembers / totalCapacity) * 100).toFixed(1) : 0;

        return { totalBranches, activeBranches, totalMembers, totalCapacity, totalStaff, totalTrainers, occupancyRate };
    };

    const stats = getStats();

    // Handlers
    const handleViewDetails = (branch) => {
        setSelectedBranch(branch);
        setShowDetailsModal(true);
    };

    const handleAddNew = () => {
        setFormData({
            gym_id: 1,
            branch_name: '',
            branch_code: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            phone: '',
            email: '',
            manager_name: '',
            manager_phone: '',
            capacity: '',
            facilities: '',
            operating_hours: '6:00 AM - 10:00 PM',
            monthly_rent: '',
            opening_date: new Date().toISOString().split('T')[0],
            status: 'ACTIVE'
        });
        setShowAddModal(true);
    };

    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setFormData({
            gym_id: branch.gym_id,
            branch_name: branch.branch_name,
            branch_code: branch.branch_code,
            address: branch.address,
            city: branch.city,
            state: branch.state,
            country: branch.country,
            pincode: branch.pincode,
            phone: branch.phone,
            email: branch.email,
            manager_name: branch.manager_name,
            manager_phone: branch.manager_phone,
            capacity: branch.capacity,
            facilities: branch.facilities,
            operating_hours: branch.operating_hours,
            monthly_rent: branch.monthly_rent,
            opening_date: branch.opening_date,
            status: branch.status
        });
        setShowEditModal(true);
    };

    const handleDelete = (branch) => {
        if (window.confirm(`Are you sure you want to delete ${branch.branch_name}?`)) {
            setBranches(branches.filter(b => b.branch_id !== branch.branch_id));
            alert('Branch deleted successfully!');
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const newBranch = {
            branch_id: branches.length + 1,
            ...formData,
            capacity: parseInt(formData.capacity),
            monthly_rent: parseFloat(formData.monthly_rent),
            staff_count: 0,
            trainer_count: 0,
            member_count: 0
        };
        setBranches([newBranch, ...branches]);
        alert('Branch added successfully!');
        setShowAddModal(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setBranches(branches.map(b =>
            b.branch_id === selectedBranch.branch_id
                ? { 
                    ...b, 
                    ...formData,
                    capacity: parseInt(formData.capacity),
                    monthly_rent: parseFloat(formData.monthly_rent)
                }
                : b
        ));
        alert('Branch updated successfully!');
        setShowEditModal(false);
    };

    const handleStatusChange = (branch, newStatus) => {
        setBranches(branches.map(b =>
            b.branch_id === branch.branch_id
                ? { ...b, status: newStatus }
                : b
        ));
        alert(`Branch status updated to ${newStatus}!`);
    };

    // Get badge classes
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'branch-status-active',
            'INACTIVE': 'branch-status-inactive',
            'UNDER_MAINTENANCE': 'branch-status-maintenance',
            'CLOSED': 'branch-status-closed'
        };
        return statusMap[status] || '';
    };

    return (
        <div className="branch-management">
            {/* Header */}
            <div className="branch-header">
                <div>
                    <h1 className="branch-title">Branch Management</h1>
                    <p className="branch-subtitle">Manage gym branches and locations</p>
                </div>
                <button className="branch-add-btn" onClick={handleAddNew}>
                    <i className="fas fa-plus"></i>
                    Add New Branch
                </button>
            </div>

            {/* Statistics Bar */}
            <div className="branch-stats-bar">
                <div className="branch-stat-item">
                    <i className="fas fa-building"></i>
                    <div>
                        <span className="branch-stat-label">Total Branches</span>
                        <span className="branch-stat-value">{stats.totalBranches}</span>
                    </div>
                </div>
                <div className="branch-stat-item">
                    <i className="fas fa-check-circle"></i>
                    <div>
                        <span className="branch-stat-label">Active Branches</span>
                        <span className="branch-stat-value">{stats.activeBranches}</span>
                    </div>
                </div>
                <div className="branch-stat-item">
                    <i className="fas fa-users"></i>
                    <div>
                        <span className="branch-stat-label">Total Members</span>
                        <span className="branch-stat-value">{stats.totalMembers}</span>
                    </div>
                </div>
                <div className="branch-stat-item">
                    <i className="fas fa-chart-line"></i>
                    <div>
                        <span className="branch-stat-label">Occupancy Rate</span>
                        <span className="branch-stat-value">{stats.occupancyRate}%</span>
                    </div>
                </div>
                <div className="branch-stat-item">
                    <i className="fas fa-user-tie"></i>
                    <div>
                        <span className="branch-stat-label">Total Staff</span>
                        <span className="branch-stat-value">{stats.totalStaff}</span>
                    </div>
                </div>
                <div className="branch-stat-item">
                    <i className="fas fa-dumbbell"></i>
                    <div>
                        <span className="branch-stat-label">Total Trainers</span>
                        <span className="branch-stat-value">{stats.totalTrainers}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="branch-filters">
                <div className="branch-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by name, code, city, address, manager..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="branch-clear-search" onClick={() => setSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="branch-filter">
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    <option value="CLOSED">Closed</option>
                </select>
                {filterStatus !== 'ALL' && (
                    <button 
                        className="branch-clear-filters"
                        onClick={() => setFilterStatus('ALL')}
                    >
                        <i className="fas fa-times"></i>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Branches Grid */}
            <div className="branch-grid">
                {filteredBranches.length === 0 ? (
                    <div className="branch-no-data">
                        <i className="fas fa-inbox"></i>
                        <p>No branches found</p>
                    </div>
                ) : (
                    filteredBranches.map((branch) => (
                        <div key={branch.branch_id} className="branch-card">
                            <div className="branch-card-header">
                                <div>
                                    <h3 className="branch-card-title">{branch.branch_name}</h3>
                                    <span className="branch-card-code">{branch.branch_code}</span>
                                </div>
                                <span className={`branch-status-badge ${getStatusBadgeClass(branch.status)}`}>
                                    {branch.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="branch-card-body">
                                <div className="branch-info-row">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{branch.address}</span>
                                </div>
                                <div className="branch-info-row">
                                    <i className="fas fa-city"></i>
                                    <span>{branch.city}, {branch.state} - {branch.pincode}</span>
                                </div>
                                <div className="branch-info-row">
                                    <i className="fas fa-phone"></i>
                                    <span>{branch.phone}</span>
                                </div>
                                <div className="branch-info-row">
                                    <i className="fas fa-envelope"></i>
                                    <span>{branch.email}</span>
                                </div>
                                <div className="branch-info-row">
                                    <i className="fas fa-user-shield"></i>
                                    <span>{branch.manager_name} - {branch.manager_phone}</span>
                                </div>
                                <div className="branch-info-row">
                                    <i className="fas fa-clock"></i>
                                    <span>{branch.operating_hours}</span>
                                </div>

                                <div className="branch-capacity-bar">
                                    <div className="branch-capacity-info">
                                        <span>Capacity: {branch.member_count} / {branch.capacity}</span>
                                        <span>{((branch.member_count / branch.capacity) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="branch-capacity-progress">
                                        <div 
                                            className="branch-capacity-fill"
                                            style={{ width: `${(branch.member_count / branch.capacity) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="branch-stats-row">
                                    <div className="branch-stat-box">
                                        <i className="fas fa-users"></i>
                                        <div>
                                            <span className="branch-stat-number">{branch.member_count}</span>
                                            <span className="branch-stat-text">Members</span>
                                        </div>
                                    </div>
                                    <div className="branch-stat-box">
                                        <i className="fas fa-user-tie"></i>
                                        <div>
                                            <span className="branch-stat-number">{branch.staff_count}</span>
                                            <span className="branch-stat-text">Staff</span>
                                        </div>
                                    </div>
                                    <div className="branch-stat-box">
                                        <i className="fas fa-dumbbell"></i>
                                        <div>
                                            <span className="branch-stat-number">{branch.trainer_count}</span>
                                            <span className="branch-stat-text">Trainers</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="branch-card-footer">
                                <button
                                    className="branch-action-btn view"
                                    onClick={() => handleViewDetails(branch)}
                                >
                                    <i className="fas fa-eye"></i>
                                    View Details
                                </button>
                                <button
                                    className="branch-action-btn edit"
                                    onClick={() => handleEdit(branch)}
                                >
                                    <i className="fas fa-edit"></i>
                                    Edit
                                </button>
                                <button
                                    className="branch-action-btn delete"
                                    onClick={() => handleDelete(branch)}
                                >
                                    <i className="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedBranch && (
                <div className="branch-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="branch-modal branch-modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="branch-modal-header">
                            <h2>
                                <i className="fas fa-building"></i>
                                Branch Details
                            </h2>
                            <button className="branch-modal-close" onClick={() => setShowDetailsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="branch-modal-body">
                            {/* Basic Information */}
                            <div className="branch-detail-section">
                                <h3><i className="fas fa-info-circle"></i> Basic Information</h3>
                                <div className="branch-detail-grid">
                                    <div className="branch-detail-item">
                                        <label>Branch Name</label>
                                        <span>{selectedBranch.branch_name}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Branch Code</label>
                                        <span>{selectedBranch.branch_code}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Opening Date</label>
                                        <span>{selectedBranch.opening_date}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Status</label>
                                        <span className={`branch-status-badge ${getStatusBadgeClass(selectedBranch.status)}`}>
                                            {selectedBranch.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Location Details */}
                            <div className="branch-detail-section">
                                <h3><i className="fas fa-map-marker-alt"></i> Location Details</h3>
                                <div className="branch-detail-grid">
                                    <div className="branch-detail-item branch-full-width">
                                        <label>Address</label>
                                        <span>{selectedBranch.address}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>City</label>
                                        <span>{selectedBranch.city}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>State</label>
                                        <span>{selectedBranch.state}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Country</label>
                                        <span>{selectedBranch.country}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Pincode</label>
                                        <span>{selectedBranch.pincode}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="branch-detail-section">
                                <h3><i className="fas fa-phone"></i> Contact Information</h3>
                                <div className="branch-detail-grid">
                                    <div className="branch-detail-item">
                                        <label>Phone</label>
                                        <span>{selectedBranch.phone}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Email</label>
                                        <span>{selectedBranch.email}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Manager</label>
                                        <span>{selectedBranch.manager_name}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Manager Phone</label>
                                        <span>{selectedBranch.manager_phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Details */}
                            <div className="branch-detail-section">
                                <h3><i className="fas fa-cogs"></i> Operational Details</h3>
                                <div className="branch-detail-grid">
                                    <div className="branch-detail-item">
                                        <label>Operating Hours</label>
                                        <span>{selectedBranch.operating_hours}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Capacity</label>
                                        <span>{selectedBranch.capacity} members</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Current Members</label>
                                        <span>{selectedBranch.member_count}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Occupancy Rate</label>
                                        <span>{((selectedBranch.member_count / selectedBranch.capacity) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Staff Count</label>
                                        <span>{selectedBranch.staff_count}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Trainer Count</label>
                                        <span>{selectedBranch.trainer_count}</span>
                                    </div>
                                    <div className="branch-detail-item">
                                        <label>Monthly Rent</label>
                                        <span>₹{selectedBranch.monthly_rent.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="branch-detail-item branch-full-width">
                                        <label>Facilities</label>
                                        <span>{selectedBranch.facilities}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="branch-detail-actions">
                                <button 
                                    className="branch-btn-secondary"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleEdit(selectedBranch);
                                    }}
                                >
                                    <i className="fas fa-edit"></i>
                                    Edit Branch
                                </button>
                                <button 
                                    className="branch-btn-status"
                                    onClick={() => {
                                        const newStatus = selectedBranch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                        handleStatusChange(selectedBranch, newStatus);
                                        setShowDetailsModal(false);
                                    }}
                                >
                                    <i className="fas fa-power-off"></i>
                                    {selectedBranch.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="branch-modal-overlay" onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                }}>
                    <div className="branch-modal branch-modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="branch-modal-header">
                            <h2>
                                <i className={`fas fa-${showAddModal ? 'plus' : 'edit'}`}></i>
                                {showAddModal ? 'Add New' : 'Edit'} Branch
                            </h2>
                            <button className="branch-modal-close" onClick={() => {
                                setShowAddModal(false);
                                setShowEditModal(false);
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="branch-modal-body">
                            {/* Basic Information */}
                            <div className="branch-form-section">
                                <h3>Basic Information</h3>
                                <div className="branch-form-grid">
                                    <div className="branch-form-group">
                                        <label>Gym ID *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.gym_id}
                                            onChange={(e) => setFormData({ ...formData, gym_id: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Branch Name *</label>
                                        <input
                                            type="text"
                                            value={formData.branch_name}
                                            onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                            placeholder="e.g., Bangalore Main"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Branch Code *</label>
                                        <input
                                            type="text"
                                            value={formData.branch_code}
                                            onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
                                            placeholder="e.g., BLR-MAIN"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Opening Date *</label>
                                        <input
                                            type="date"
                                            value={formData.opening_date}
                                            onChange={(e) => setFormData({ ...formData, opening_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Details */}
                            <div className="branch-form-section">
                                <h3>Location Details</h3>
                                <div className="branch-form-grid">
                                    <div className="branch-form-group branch-full-width">
                                        <label>Address *</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Enter complete address"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>State *</label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            placeholder="State"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Country *</label>
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            placeholder="Country"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Pincode *</label>
                                        <input
                                            type="text"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                            placeholder="6-digit pincode"
                                            pattern="[0-9]{6}"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="branch-form-section">
                                <h3>Contact Information</h3>
                                <div className="branch-form-grid">
                                    <div className="branch-form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Branch phone number"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="branch@fitnessguru.com"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Manager Name *</label>
                                        <input
                                            type="text"
                                            value={formData.manager_name}
                                            onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                                            placeholder="Manager full name"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Manager Phone *</label>
                                        <input
                                            type="tel"
                                            value={formData.manager_phone}
                                            onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
                                            placeholder="10-digit phone"
                                            pattern="[0-9]{10}"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Operational Details */}
                            <div className="branch-form-section">
                                <h3>Operational Details</h3>
                                <div className="branch-form-grid">
                                    <div className="branch-form-group">
                                        <label>Capacity *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            placeholder="Maximum member capacity"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group">
                                        <label>Monthly Rent (₹) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="100"
                                            value={formData.monthly_rent}
                                            onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                                            placeholder="Branch rental amount"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group branch-full-width">
                                        <label>Operating Hours *</label>
                                        <input
                                            type="text"
                                            value={formData.operating_hours}
                                            onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                                            placeholder="e.g., 6:00 AM - 10:00 PM"
                                            required
                                        />
                                    </div>
                                    <div className="branch-form-group branch-full-width">
                                        <label>Facilities *</label>
                                        <textarea
                                            value={formData.facilities}
                                            onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                                            rows="3"
                                            placeholder="List all facilities (comma separated)"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="branch-form-section">
                                <h3>Status</h3>
                                <div className="branch-form-grid">
                                    <div className="branch-form-group">
                                        <label>Status *</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            required
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="branch-modal-actions">
                                <button type="button" className="branch-btn-secondary" onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="branch-btn-primary">
                                    {showAddModal ? 'Add' : 'Update'} Branch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
