import React, { useState } from 'react';
import './StaffManagement.css';

const StaffManagement = () => {
    const [activeTab, setActiveTab] = useState('trainers'); // trainers, staff
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBranch, setFilterBranch] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Trainers state with sample data
    const [trainers, setTrainers] = useState([
        {
            trainer_id: 1,
            user_id: 2001,
            name: 'Amit Sharma',
            email: 'amit.sharma@fitnessguru.com',
            phone: '9876543220',
            branch_name: 'Koramangala Branch',
            specialization: 'Strength Training, Bodybuilding',
            experience_years: 8.5,
            certifications: 'ACE Personal Trainer, NASM CPT',
            bio: 'Experienced trainer specializing in strength training and bodybuilding. Helped 200+ clients achieve their fitness goals.',
            total_clients: 25,
            shift_name: 'Morning Shift',
            availability_status: 'AVAILABLE',
            profile_photo_url: null,
            joining_date: '2020-03-15',
            status: 'ACTIVE'
        },
        {
            trainer_id: 2,
            user_id: 2002,
            name: 'Priya Menon',
            email: 'priya.menon@fitnessguru.com',
            phone: '9876543221',
            branch_name: 'Whitefield Branch',
            specialization: 'Yoga, Pilates, Flexibility Training',
            experience_years: 6.0,
            certifications: 'RYT 500, Pilates Mat Certification',
            bio: 'Certified yoga instructor with expertise in therapeutic yoga and pilates.',
            total_clients: 30,
            shift_name: 'Evening Shift',
            availability_status: 'AVAILABLE',
            profile_photo_url: null,
            joining_date: '2021-06-01',
            status: 'ACTIVE'
        },
        {
            trainer_id: 3,
            user_id: 2003,
            name: 'Vikram Singh',
            email: 'vikram.singh@fitnessguru.com',
            phone: '9876543222',
            branch_name: 'Bangalore Main',
            specialization: 'CrossFit, HIIT, Functional Training',
            experience_years: 10.0,
            certifications: 'CrossFit Level 2, NSCA CSCS',
            bio: 'Elite CrossFit trainer with a decade of experience. Former athlete turned coach.',
            total_clients: 20,
            shift_name: 'Morning Shift',
            availability_status: 'ON_BOOKING',
            profile_photo_url: null,
            joining_date: '2019-01-10',
            status: 'ACTIVE'
        },
        {
            trainer_id: 4,
            user_id: 2004,
            name: 'Sneha Reddy',
            email: 'sneha.reddy@fitnessguru.com',
            phone: '9876543223',
            branch_name: 'Koramangala Branch',
            specialization: 'Weight Loss, Cardio, Nutrition',
            experience_years: 4.5,
            certifications: 'ACE Personal Trainer, Precision Nutrition',
            bio: 'Passionate about helping clients achieve sustainable weight loss through balanced fitness and nutrition.',
            total_clients: 18,
            shift_name: 'Evening Shift',
            availability_status: 'AVAILABLE',
            profile_photo_url: null,
            joining_date: '2022-09-01',
            status: 'ACTIVE'
        },
        {
            trainer_id: 5,
            user_id: 2005,
            name: 'Rahul Kapoor',
            email: 'rahul.kapoor@fitnessguru.com',
            phone: '9876543224',
            branch_name: 'Whitefield Branch',
            specialization: 'Sports Performance, Athletic Training',
            experience_years: 7.0,
            certifications: 'NSCA CSCS, USA Weightlifting Level 1',
            bio: 'Former national-level athlete specializing in sports performance and conditioning.',
            total_clients: 15,
            shift_name: 'Morning Shift',
            availability_status: 'ON_BREAK',
            profile_photo_url: null,
            joining_date: '2020-08-15',
            status: 'ACTIVE'
        },
        {
            trainer_id: 6,
            user_id: 2006,
            name: 'Deepa Nair',
            email: 'deepa.nair@fitnessguru.com',
            phone: '9876543225',
            branch_name: 'Bangalore Main',
            specialization: 'Senior Fitness, Rehabilitation',
            experience_years: 5.0,
            certifications: 'ACE Senior Fitness Specialist, Rehabilitation',
            bio: 'Specializing in senior fitness and post-injury rehabilitation programs.',
            total_clients: 12,
            shift_name: 'Morning Shift',
            availability_status: 'OFF_DUTY',
            profile_photo_url: null,
            joining_date: '2021-11-20',
            status: 'INACTIVE'
        }
    ]);

    // Staff state with sample data
    const [staff, setStaff] = useState([
        {
            staff_id: 1,
            user_id: 3001,
            name: 'Ramesh Kumar',
            email: 'ramesh.kumar@fitnessguru.com',
            phone: '9876543230',
            branch_name: 'Koramangala Branch',
            designation: 'Front Desk Manager',
            department: 'Operations',
            shift_name: 'Morning Shift',
            salary_monthly: 35000,
            salary_type: 'FULL_TIME',
            joining_date: '2021-01-15',
            access_level: 'MEDIUM',
            status: 'ACTIVE'
        },
        {
            staff_id: 2,
            user_id: 3002,
            name: 'Anjali Desai',
            email: 'anjali.desai@fitnessguru.com',
            phone: '9876543231',
            branch_name: 'Whitefield Branch',
            designation: 'Receptionist',
            department: 'Front Desk',
            shift_name: 'Evening Shift',
            salary_monthly: 25000,
            salary_type: 'FULL_TIME',
            joining_date: '2022-03-10',
            access_level: 'LOW',
            status: 'ACTIVE'
        },
        {
            staff_id: 3,
            user_id: 3003,
            name: 'Suresh Babu',
            email: 'suresh.babu@fitnessguru.com',
            phone: '9876543232',
            branch_name: 'Bangalore Main',
            designation: 'Maintenance Supervisor',
            department: 'Facilities',
            shift_name: 'Full Day',
            salary_monthly: 30000,
            salary_type: 'FULL_TIME',
            joining_date: '2020-06-01',
            access_level: 'MEDIUM',
            status: 'ACTIVE'
        },
        {
            staff_id: 4,
            user_id: 3004,
            name: 'Lakshmi Iyer',
            email: 'lakshmi.iyer@fitnessguru.com',
            phone: '9876543233',
            branch_name: 'Koramangala Branch',
            designation: 'Nutritionist',
            department: 'Health & Wellness',
            shift_name: 'Morning Shift',
            salary_monthly: 45000,
            salary_type: 'FULL_TIME',
            joining_date: '2021-09-15',
            access_level: 'MEDIUM',
            status: 'ACTIVE'
        },
        {
            staff_id: 5,
            user_id: 3005,
            name: 'Arun Menon',
            email: 'arun.menon@fitnessguru.com',
            phone: '9876543234',
            branch_name: 'Whitefield Branch',
            designation: 'Housekeeping Staff',
            department: 'Facilities',
            shift_name: 'Morning Shift',
            salary_monthly: 20000,
            salary_type: 'PART_TIME',
            joining_date: '2023-01-10',
            access_level: 'LOW',
            status: 'ACTIVE'
        },
        {
            staff_id: 6,
            user_id: 3006,
            name: 'Divya Krishnan',
            email: 'divya.krishnan@fitnessguru.com',
            phone: '9876543235',
            branch_name: 'Bangalore Main',
            designation: 'Sales Executive',
            department: 'Sales & Marketing',
            shift_name: 'Full Day',
            salary_monthly: 30000,
            salary_type: 'FULL_TIME',
            joining_date: '2022-07-20',
            access_level: 'MEDIUM',
            status: 'ON_LEAVE'
        },
        {
            staff_id: 7,
            user_id: 3007,
            name: 'Karthik Rao',
            email: 'karthik.rao@fitnessguru.com',
            phone: '9876543236',
            branch_name: 'Koramangala Branch',
            designation: 'IT Support',
            department: 'Technology',
            shift_name: 'Full Day',
            salary_monthly: 40000,
            salary_type: 'CONTRACT',
            joining_date: '2023-02-01',
            access_level: 'HIGH',
            status: 'ACTIVE'
        }
    ]);

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form data for trainers
    const [trainerFormData, setTrainerFormData] = useState({
        // User fields
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'TRAINER',
        gym_id: 1,
        branch_id: 1,
        // Trainer fields
        specialization: '',
        experience_years: '',
        certifications: '',
        bio: '',
        shift_id: 1,
        availability_status: 'AVAILABLE',
        profile_photo_url: '',
        joining_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    // Form data for staff
    const [staffFormData, setStaffFormData] = useState({
        // User fields
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'STAFF',
        gym_id: 1,
        branch_id: 1,
        // Staff fields
        designation: '',
        department: '',
        shift_id: 1,
        salary_monthly: '',
        salary_type: 'FULL_TIME',
        joining_date: new Date().toISOString().split('T')[0],
        access_level: 'LOW',
        status: 'ACTIVE'
    });

    // Filter data
    const filteredTrainers = trainers.filter(trainer => {
        const matchesSearch = 
            trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trainer.phone.includes(searchQuery) ||
            trainer.specialization.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesBranch = filterBranch === 'ALL' || trainer.branch_name === filterBranch;
        const matchesStatus = filterStatus === 'ALL' || trainer.status === filterStatus;

        return matchesSearch && matchesBranch && matchesStatus;
    });

    const filteredStaff = staff.filter(member => {
        const matchesSearch = 
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.phone.includes(searchQuery) ||
            member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.department.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesBranch = filterBranch === 'ALL' || member.branch_name === filterBranch;
        const matchesStatus = filterStatus === 'ALL' || member.status === filterStatus;

        return matchesSearch && matchesBranch && matchesStatus;
    });

    // Get statistics
    const getStats = () => {
        const activeTrainers = trainers.filter(t => t.status === 'ACTIVE').length;
        const activeStaff = staff.filter(s => s.status === 'ACTIVE').length;
        const totalClients = trainers.reduce((sum, t) => sum + t.total_clients, 0);
        const availableTrainers = trainers.filter(t => t.availability_status === 'AVAILABLE').length;
        const fullTimeStaff = staff.filter(s => s.salary_type === 'FULL_TIME').length;
        const onLeave = staff.filter(s => s.status === 'ON_LEAVE').length;

        return { activeTrainers, activeStaff, totalClients, availableTrainers, fullTimeStaff, onLeave };
    };

    const stats = getStats();

    // Handlers
    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setShowDetailsModal(true);
    };

    const handleAddNew = () => {
        if (activeTab === 'trainers') {
            setTrainerFormData({
                // User fields
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'TRAINER',
                gym_id: 1,
                branch_id: 1,
                // Trainer fields
                specialization: '',
                experience_years: '',
                certifications: '',
                bio: '',
                shift_id: 1,
                availability_status: 'AVAILABLE',
                profile_photo_url: '',
                joining_date: new Date().toISOString().split('T')[0],
                status: 'ACTIVE'
            });
        } else {
            setStaffFormData({
                // User fields
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'STAFF',
                gym_id: 1,
                branch_id: 1,
                // Staff fields
                designation: '',
                department: '',
                shift_id: 1,
                salary_monthly: '',
                salary_type: 'FULL_TIME',
                joining_date: new Date().toISOString().split('T')[0],
                access_level: 'LOW',
                status: 'ACTIVE'
            });
        }
        setShowAddModal(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        if (activeTab === 'trainers') {
            setTrainerFormData({
                // User fields
                name: item.name,
                email: item.email,
                phone: item.phone,
                password: '', // Don't prefill password for security
                role: 'TRAINER',
                gym_id: item.gym_id || 1,
                branch_id: item.branch_id || 1,
                // Trainer fields
                specialization: item.specialization,
                experience_years: item.experience_years,
                certifications: item.certifications,
                bio: item.bio,
                shift_id: item.shift_id || 1,
                availability_status: item.availability_status,
                profile_photo_url: item.profile_photo_url || '',
                joining_date: item.joining_date,
                status: item.status
            });
        } else {
            setStaffFormData({
                // User fields
                name: item.name,
                email: item.email,
                phone: item.phone,
                password: '', // Don't prefill password for security
                role: 'STAFF',
                gym_id: item.gym_id || 1,
                branch_id: item.branch_id || 1,
                // Staff fields
                designation: item.designation,
                department: item.department,
                shift_id: item.shift_id || 1,
                salary_monthly: item.salary_monthly,
                salary_type: item.salary_type,
                joining_date: item.joining_date,
                access_level: item.access_level,
                status: item.status
            });
        }
        setShowEditModal(true);
    };

    const handleDelete = (item) => {
        const itemType = activeTab === 'trainers' ? 'trainer' : 'staff member';
        if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
            if (activeTab === 'trainers') {
                setTrainers(trainers.filter(t => t.trainer_id !== item.trainer_id));
            } else {
                setStaff(staff.filter(s => s.staff_id !== item.staff_id));
            }
            alert(`${itemType} deleted successfully!`);
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'trainers') {
            const newTrainer = {
                trainer_id: trainers.length + 1,
                user_id: 2000 + trainers.length + 1,
                ...trainerFormData,
                total_clients: 0,
                profile_photo_url: null
            };
            setTrainers([newTrainer, ...trainers]);
            alert('Trainer added successfully!');
        } else {
            const newStaff = {
                staff_id: staff.length + 1,
                user_id: 3000 + staff.length + 1,
                ...staffFormData,
                salary_monthly: parseFloat(staffFormData.salary_monthly)
            };
            setStaff([newStaff, ...staff]);
            alert('Staff member added successfully!');
        }
        setShowAddModal(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'trainers') {
            setTrainers(trainers.map(t =>
                t.trainer_id === selectedItem.trainer_id
                    ? { ...t, ...trainerFormData }
                    : t
            ));
            alert('Trainer updated successfully!');
        } else {
            setStaff(staff.map(s =>
                s.staff_id === selectedItem.staff_id
                    ? { ...s, ...staffFormData, salary_monthly: parseFloat(staffFormData.salary_monthly) }
                    : s
            ));
            alert('Staff member updated successfully!');
        }
        setShowEditModal(false);
    };

    const handleStatusChange = (item, newStatus) => {
        if (activeTab === 'trainers') {
            setTrainers(trainers.map(t =>
                t.trainer_id === item.trainer_id
                    ? { ...t, status: newStatus }
                    : t
            ));
        } else {
            setStaff(staff.map(s =>
                s.staff_id === item.staff_id
                    ? { ...s, status: newStatus }
                    : s
            ));
        }
        alert(`Status updated to ${newStatus}!`);
    };

    // Get badge classes
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'staff-status-active',
            'INACTIVE': 'staff-status-inactive',
            'SUSPENDED': 'staff-status-suspended',
            'ON_LEAVE': 'staff-status-leave'
        };
        return statusMap[status] || '';
    };

    const getAvailabilityBadgeClass = (status) => {
        const statusMap = {
            'AVAILABLE': 'staff-avail-available',
            'ON_BREAK': 'staff-avail-break',
            'OFF_DUTY': 'staff-avail-off',
            'ON_BOOKING': 'staff-avail-booking'
        };
        return statusMap[status] || '';
    };

    const getSalaryTypeBadgeClass = (type) => {
        const typeMap = {
            'FULL_TIME': 'staff-salary-full',
            'PART_TIME': 'staff-salary-part',
            'CONTRACT': 'staff-salary-contract'
        };
        return typeMap[type] || '';
    };

    const getAccessLevelBadgeClass = (level) => {
        const levelMap = {
            'LOW': 'staff-access-low',
            'MEDIUM': 'staff-access-medium',
            'HIGH': 'staff-access-high'
        };
        return levelMap[level] || '';
    };

    return (
        <div className="staff-management">
            {/* Header */}
            <div className="staff-header">
                <div>
                    <h1 className="staff-title">Staff Management</h1>
                    <p className="staff-subtitle">Manage trainers and staff members across all branches</p>
                </div>
                <button className="staff-add-btn" onClick={handleAddNew}>
                    <i className="fas fa-plus"></i>
                    Add {activeTab === 'trainers' ? 'Trainer' : 'Staff'}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="staff-stats-bar">
                <div className="staff-stat-item">
                    <i className="fas fa-dumbbell"></i>
                    <div>
                        <span className="staff-stat-label">Active Trainers</span>
                        <span className="staff-stat-value">{stats.activeTrainers}</span>
                    </div>
                </div>
                <div className="staff-stat-item">
                    <i className="fas fa-users"></i>
                    <div>
                        <span className="staff-stat-label">Active Staff</span>
                        <span className="staff-stat-value">{stats.activeStaff}</span>
                    </div>
                </div>
                <div className="staff-stat-item">
                    <i className="fas fa-user-check"></i>
                    <div>
                        <span className="staff-stat-label">Total Clients</span>
                        <span className="staff-stat-value">{stats.totalClients}</span>
                    </div>
                </div>
                <div className="staff-stat-item">
                    <i className="fas fa-clock"></i>
                    <div>
                        <span className="staff-stat-label">Available Trainers</span>
                        <span className="staff-stat-value">{stats.availableTrainers}</span>
                    </div>
                </div>
                <div className="staff-stat-item">
                    <i className="fas fa-briefcase"></i>
                    <div>
                        <span className="staff-stat-label">Full-Time Staff</span>
                        <span className="staff-stat-value">{stats.fullTimeStaff}</span>
                    </div>
                </div>
                <div className="staff-stat-item">
                    <i className="fas fa-umbrella-beach"></i>
                    <div>
                        <span className="staff-stat-label">On Leave</span>
                        <span className="staff-stat-value">{stats.onLeave}</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="staff-tabs">
                <button
                    className={`staff-tab ${activeTab === 'trainers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trainers')}
                >
                    <i className="fas fa-dumbbell"></i>
                    Trainers
                    <span className="staff-tab-count">{trainers.length}</span>
                </button>
                <button
                    className={`staff-tab ${activeTab === 'staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff')}
                >
                    <i className="fas fa-user-tie"></i>
                    Staff Members
                    <span className="staff-tab-count">{staff.length}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="staff-filters">
                <div className="staff-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder={activeTab === 'trainers' 
                            ? 'Search by name, email, phone, specialization...' 
                            : 'Search by name, email, phone, designation, department...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="staff-clear-search" onClick={() => setSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="staff-filter">
                    <option value="ALL">All Branches</option>
                    <option value="Bangalore Main">Bangalore Main</option>
                    <option value="Whitefield Branch">Whitefield Branch</option>
                    <option value="Koramangala Branch">Koramangala Branch</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="staff-filter">
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    {activeTab === 'staff' && <option value="ON_LEAVE">On Leave</option>}
                </select>
                {(filterBranch !== 'ALL' || filterStatus !== 'ALL') && (
                    <button 
                        className="staff-clear-filters"
                        onClick={() => {
                            setFilterBranch('ALL');
                            setFilterStatus('ALL');
                        }}
                    >
                        <i className="fas fa-times"></i>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Content Table */}
            <div className="staff-table-container">
                <table className="staff-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name & Contact</th>
                            <th>Branch</th>
                            {activeTab === 'trainers' ? (
                                <>
                                    <th>Specialization</th>
                                    <th>Experience</th>
                                    <th>Clients</th>
                                    <th>Availability</th>
                                </>
                            ) : (
                                <>
                                    <th>Designation</th>
                                    <th>Department</th>
                                    <th>Salary Type</th>
                                    <th>Access Level</th>
                                </>
                            )}
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(activeTab === 'trainers' ? filteredTrainers : filteredStaff).length === 0 ? (
                            <tr>
                                <td colSpan={activeTab === 'trainers' ? '10' : '10'} className="staff-no-data">
                                    <i className="fas fa-inbox"></i>
                                    <p>No {activeTab === 'trainers' ? 'trainers' : 'staff members'} found</p>
                                </td>
                            </tr>
                        ) : (
                            (activeTab === 'trainers' ? filteredTrainers : filteredStaff).map((item) => (
                                <tr key={activeTab === 'trainers' ? item.trainer_id : item.staff_id}>
                                    <td>#{activeTab === 'trainers' ? item.trainer_id : item.staff_id}</td>
                                    <td>
                                        <div className="staff-user-info">
                                            <strong>{item.name}</strong>
                                            <span>{item.email}</span>
                                            <span>{item.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="staff-branch-tag">{item.branch_name}</span>
                                        {item.shift_name && (
                                            <span className="staff-shift-tag">{item.shift_name}</span>
                                        )}
                                    </td>
                                    {activeTab === 'trainers' ? (
                                        <>
                                            <td>
                                                <div className="staff-specialization">
                                                    {item.specialization.length > 40 
                                                        ? item.specialization.substring(0, 40) + '...' 
                                                        : item.specialization}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="staff-experience">{item.experience_years} years</span>
                                            </td>
                                            <td>
                                                <span className="staff-client-count">{item.total_clients}</span>
                                            </td>
                                            <td>
                                                <span className={`staff-avail-badge ${getAvailabilityBadgeClass(item.availability_status)}`}>
                                                    {item.availability_status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{item.designation}</td>
                                            <td>{item.department}</td>
                                            <td>
                                                <span className={`staff-salary-badge ${getSalaryTypeBadgeClass(item.salary_type)}`}>
                                                    {item.salary_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`staff-access-badge ${getAccessLevelBadgeClass(item.access_level)}`}>
                                                    {item.access_level}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    <td>
                                        <span className={`staff-status-badge ${getStatusBadgeClass(item.status)}`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="staff-action-buttons">
                                            <button
                                                className="staff-action-btn view"
                                                onClick={() => handleViewDetails(item)}
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="staff-action-btn edit"
                                                onClick={() => handleEdit(item)}
                                                title="Edit"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="staff-action-btn delete"
                                                onClick={() => handleDelete(item)}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedItem && (
                <div className="staff-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="staff-modal staff-modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <h2>
                                <i className={`fas fa-${activeTab === 'trainers' ? 'dumbbell' : 'user-tie'}`}></i>
                                {activeTab === 'trainers' ? 'Trainer' : 'Staff'} Details
                            </h2>
                            <button className="staff-modal-close" onClick={() => setShowDetailsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="staff-modal-body">
                            {/* Personal Information */}
                            <div className="staff-detail-section">
                                <h3><i className="fas fa-user"></i> Personal Information</h3>
                                <div className="staff-detail-grid">
                                    <div className="staff-detail-item">
                                        <label>Name</label>
                                        <span>{selectedItem.name}</span>
                                    </div>
                                    <div className="staff-detail-item">
                                        <label>Email</label>
                                        <span>{selectedItem.email}</span>
                                    </div>
                                    <div className="staff-detail-item">
                                        <label>Phone</label>
                                        <span>{selectedItem.phone}</span>
                                    </div>
                                    <div className="staff-detail-item">
                                        <label>Branch</label>
                                        <span>{selectedItem.branch_name}</span>
                                    </div>
                                    <div className="staff-detail-item">
                                        <label>Shift</label>
                                        <span>{selectedItem.shift_name}</span>
                                    </div>
                                    <div className="staff-detail-item">
                                        <label>Joining Date</label>
                                        <span>{selectedItem.joining_date}</span>
                                    </div>
                                </div>
                            </div>

                            {activeTab === 'trainers' ? (
                                <>
                                    {/* Professional Information */}
                                    <div className="staff-detail-section">
                                        <h3><i className="fas fa-certificate"></i> Professional Information</h3>
                                        <div className="staff-detail-grid">
                                            <div className="staff-detail-item staff-full-width">
                                                <label>Specialization</label>
                                                <span>{selectedItem.specialization}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Experience</label>
                                                <span>{selectedItem.experience_years} years</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Total Clients</label>
                                                <span>{selectedItem.total_clients}</span>
                                            </div>
                                            <div className="staff-detail-item staff-full-width">
                                                <label>Certifications</label>
                                                <span>{selectedItem.certifications}</span>
                                            </div>
                                            <div className="staff-detail-item staff-full-width">
                                                <label>Bio</label>
                                                <span>{selectedItem.bio}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Information */}
                                    <div className="staff-detail-section">
                                        <h3><i className="fas fa-info-circle"></i> Status Information</h3>
                                        <div className="staff-detail-grid">
                                            <div className="staff-detail-item">
                                                <label>Availability</label>
                                                <span className={`staff-avail-badge ${getAvailabilityBadgeClass(selectedItem.availability_status)}`}>
                                                    {selectedItem.availability_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Status</label>
                                                <span className={`staff-status-badge ${getStatusBadgeClass(selectedItem.status)}`}>
                                                    {selectedItem.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Work Information */}
                                    <div className="staff-detail-section">
                                        <h3><i className="fas fa-briefcase"></i> Work Information</h3>
                                        <div className="staff-detail-grid">
                                            <div className="staff-detail-item">
                                                <label>Designation</label>
                                                <span>{selectedItem.designation}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Department</label>
                                                <span>{selectedItem.department}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Salary (Monthly)</label>
                                                <span>₹{selectedItem.salary_monthly.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Salary Type</label>
                                                <span className={`staff-salary-badge ${getSalaryTypeBadgeClass(selectedItem.salary_type)}`}>
                                                    {selectedItem.salary_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Access Level</label>
                                                <span className={`staff-access-badge ${getAccessLevelBadgeClass(selectedItem.access_level)}`}>
                                                    {selectedItem.access_level}
                                                </span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Status</label>
                                                <span className={`staff-status-badge ${getStatusBadgeClass(selectedItem.status)}`}>
                                                    {selectedItem.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Quick Actions */}
                            <div className="staff-detail-actions">
                                <button 
                                    className="staff-btn-secondary"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleEdit(selectedItem);
                                    }}
                                >
                                    <i className="fas fa-edit"></i>
                                    Edit Details
                                </button>
                                <button 
                                    className="staff-btn-status"
                                    onClick={() => {
                                        const newStatus = selectedItem.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                        handleStatusChange(selectedItem, newStatus);
                                        setShowDetailsModal(false);
                                    }}
                                >
                                    <i className="fas fa-power-off"></i>
                                    {selectedItem.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="staff-modal-overlay" onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                }}>
                    <div className="staff-modal staff-modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <h2>
                                <i className={`fas fa-${showAddModal ? 'plus' : 'edit'}`}></i>
                                {showAddModal ? 'Add New' : 'Edit'} {activeTab === 'trainers' ? 'Trainer' : 'Staff'}
                            </h2>
                            <button className="staff-modal-close" onClick={() => {
                                setShowAddModal(false);
                                setShowEditModal(false);
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="staff-modal-body">
                            {/* Personal Information - User Table Fields */}
                            <div className="staff-form-section">
                                <h3>Personal Information (User Account)</h3>
                                <div className="staff-form-grid">
                                    <div className="staff-form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            value={activeTab === 'trainers' ? trainerFormData.name : staffFormData.name}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, name: e.target.value })
                                                : setStaffFormData({ ...staffFormData, name: e.target.value })}
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={activeTab === 'trainers' ? trainerFormData.email : staffFormData.email}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, email: e.target.value })
                                                : setStaffFormData({ ...staffFormData, email: e.target.value })}
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            value={activeTab === 'trainers' ? trainerFormData.phone : staffFormData.phone}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, phone: e.target.value })
                                                : setStaffFormData({ ...staffFormData, phone: e.target.value })}
                                            placeholder="10-digit phone number"
                                            pattern="[0-9]{10}"
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>{showAddModal ? 'Password *' : 'Password (leave blank to keep current)'}</label>
                                        <input
                                            type="password"
                                            value={activeTab === 'trainers' ? trainerFormData.password : staffFormData.password}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, password: e.target.value })
                                                : setStaffFormData({ ...staffFormData, password: e.target.value })}
                                            placeholder="Enter password"
                                            required={showAddModal}
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Gym ID *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={activeTab === 'trainers' ? trainerFormData.gym_id : staffFormData.gym_id}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, gym_id: parseInt(e.target.value) })
                                                : setStaffFormData({ ...staffFormData, gym_id: parseInt(e.target.value) })}
                                            placeholder="Gym ID"
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Branch ID *</label>
                                        <select
                                            value={activeTab === 'trainers' ? trainerFormData.branch_id : staffFormData.branch_id}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, branch_id: parseInt(e.target.value) })
                                                : setStaffFormData({ ...staffFormData, branch_id: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value="1">1 - Bangalore Main</option>
                                            <option value="2">2 - Whitefield Branch</option>
                                            <option value="3">3 - Koramangala Branch</option>
                                        </select>
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Shift ID *</label>
                                        <select
                                            value={activeTab === 'trainers' ? trainerFormData.shift_id : staffFormData.shift_id}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, shift_id: parseInt(e.target.value) })
                                                : setStaffFormData({ ...staffFormData, shift_id: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value="1">1 - Morning Shift</option>
                                            <option value="2">2 - Evening Shift</option>
                                            <option value="3">3 - Full Day</option>
                                        </select>
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Joining Date *</label>
                                        <input
                                            type="date"
                                            value={activeTab === 'trainers' ? trainerFormData.joining_date : staffFormData.joining_date}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, joining_date: e.target.value })
                                                : setStaffFormData({ ...staffFormData, joining_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {activeTab === 'trainers' ? (
                                <>
                                    {/* Professional Information */}
                                    <div className="staff-form-section">
                                        <h3>Professional Information</h3>
                                        <div className="staff-form-grid">
                                            <div className="staff-form-group staff-full-width">
                                                <label>Specialization *</label>
                                                <input
                                                    type="text"
                                                    value={trainerFormData.specialization}
                                                    onChange={(e) => setTrainerFormData({ ...trainerFormData, specialization: e.target.value })}
                                                    placeholder="e.g., Strength Training, Yoga, CrossFit"
                                                    required
                                                />
                                            </div>
                                            <div className="staff-form-group">
                                                <label>Experience (Years) *</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={trainerFormData.experience_years}
                                                    onChange={(e) => setTrainerFormData({ ...trainerFormData, experience_years: e.target.value })}
                                                    placeholder="e.g., 5.5"
                                                    required
                                                />
                                            </div>
                                            <div className="staff-form-group">
                                                <label>Availability *</label>
                                                <select
                                                    value={trainerFormData.availability_status}
                                                    onChange={(e) => setTrainerFormData({ ...trainerFormData, availability_status: e.target.value })}
                                                    required
                                                >
                                                    <option value="AVAILABLE">Available</option>
                                                    <option value="ON_BREAK">On Break</option>
                                                    <option value="OFF_DUTY">Off Duty</option>
                                                    <option value="ON_BOOKING">On Booking</option>
                                                </select>
                                            </div>
                                            <div className="staff-form-group staff-full-width">
                                                <label>Certifications *</label>
                                                <input
                                                    type="text"
                                                    value={trainerFormData.certifications}
                                                    onChange={(e) => setTrainerFormData({ ...trainerFormData, certifications: e.target.value })}
                                                    placeholder="e.g., ACE Personal Trainer, NASM CPT"
                                                    required
                                                />
                                            </div>
                                            <div className="staff-form-group staff-full-width">
                                                <label>Bio *</label>
                                                <textarea
                                                    value={trainerFormData.bio}
                                                    onChange={(e) => setTrainerFormData({ ...trainerFormData, bio: e.target.value })}
                                                    rows="3"
                                                    placeholder="Brief professional bio..."
                                                    required
                                                />
                                            </div>
                                            <div className="staff-form-group staff-full-width">
                                                <label>Profile Photo URL</label>
                                                <input
                                                    type="text"
                                                    value={trainerFormData.profile_photo_url}
                                                    onChange={(e) => setTrainerFormData({ ...trainerFormData, profile_photo_url: e.target.value })}
                                                    placeholder="https://example.com/photo.jpg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Work Information */}
                                    <div className="staff-form-section">
                                        <h3>Work Information</h3>
                                        <div className="staff-form-grid">
                                            <div className="staff-form-group">
                                                <label>Designation *</label>
                                                <input
                                                    type="text"
                                                    value={staffFormData.designation}
                                                    onChange={(e) => setStaffFormData({ ...staffFormData, designation: e.target.value })}
                                                    placeholder="e.g., Front Desk Manager"
                                                    required
                                                />
                                            </div>
                                            <div className="staff-form-group">
                                                <label>Department *</label>
                                                <input
                                                    type="text"
                                                    value={staffFormData.department}
                                                    onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                                                    placeholder="e.g., Operations"
                                                    required
                                                />
                                            </div>
                                            <div className="staff-form-group">
                                                <label>Monthly Salary (₹) *</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={staffFormData.salary_monthly}
                                                    onChange={(e) => setStaffFormData({ ...staffFormData, salary_monthly: e.target.value })}
                                                    placeholder="e.g., 35000"
                                                    required
                                                />
                                            </div>
                                            <div className="staff-form-group">
                                                <label>Salary Type *</label>
                                                <select
                                                    value={staffFormData.salary_type}
                                                    onChange={(e) => setStaffFormData({ ...staffFormData, salary_type: e.target.value })}
                                                    required
                                                >
                                                    <option value="FULL_TIME">Full Time</option>
                                                    <option value="PART_TIME">Part Time</option>
                                                    <option value="CONTRACT">Contract</option>
                                                </select>
                                            </div>
                                            <div className="staff-form-group">
                                                <label>Access Level *</label>
                                                <select
                                                    value={staffFormData.access_level}
                                                    onChange={(e) => setStaffFormData({ ...staffFormData, access_level: e.target.value })}
                                                    required
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Status */}
                            <div className="staff-form-section">
                                <h3>Status</h3>
                                <div className="staff-form-grid">
                                    <div className="staff-form-group">
                                        <label>Status *</label>
                                        <select
                                            value={activeTab === 'trainers' ? trainerFormData.status : staffFormData.status}
                                            onChange={(e) => activeTab === 'trainers'
                                                ? setTrainerFormData({ ...trainerFormData, status: e.target.value })
                                                : setStaffFormData({ ...staffFormData, status: e.target.value })}
                                            required
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="SUSPENDED">Suspended</option>
                                            {activeTab === 'staff' && <option value="ON_LEAVE">On Leave</option>}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="staff-modal-actions">
                                <button type="button" className="staff-btn-secondary" onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="staff-btn-primary">
                                    {showAddModal ? 'Add' : 'Update'} {activeTab === 'trainers' ? 'Trainer' : 'Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
