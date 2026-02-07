import React, { useState } from 'react';
import './MemberManagement.css';

const MemberManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showMemberProfile, setShowMemberProfile] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [addFormData, setAddFormData] = useState({
        // User fields
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'MEMBER',
        // Member fields
        branch_id: '',
        join_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        // Membership plan
        plan_id: '',
        // Profile fields
        dob: '',
        gender: 'MALE',
        blood_group: 'O+',
        height_cm: '',
        weight_kg: '',
        fitness_level: 'BEGINNER',
        goal_focus: 'GENERAL',
        emergency_contact: '',
        // Address fields
        address_line1: '',
        address_line2: '',
        country_id: '1',
        state_id: '',
        district_id: '',
        city_id: ''
    });

    // Location data (in production, fetch from API)
    const [countries] = useState([
        { country_id: 1, country_name: 'India' }
    ]);

    const [states] = useState([
        { state_id: 1, state_name: 'Karnataka', country_id: 1 },
        { state_id: 2, state_name: 'Maharashtra', country_id: 1 },
        { state_id: 3, state_name: 'Tamil Nadu', country_id: 1 },
        { state_id: 4, state_name: 'Delhi', country_id: 1 }
    ]);

    const [districts] = useState([
        { district_id: 1, district_name: 'Bangalore Urban', state_id: 1, country_id: 1 },
        { district_id: 2, district_name: 'Bangalore Rural', state_id: 1, country_id: 1 },
        { district_id: 3, district_name: 'Mumbai', state_id: 2, country_id: 1 },
        { district_id: 4, district_name: 'Pune', state_id: 2, country_id: 1 },
        { district_id: 5, district_name: 'Chennai', state_id: 3, country_id: 1 },
        { district_id: 6, district_name: 'Central Delhi', state_id: 4, country_id: 1 }
    ]);

    const [cities] = useState([
        { city_id: 1, city_name: 'Bangalore', district_id: 1, state_id: 1, country_id: 1 },
        { city_id: 2, city_name: 'Whitefield', district_id: 1, state_id: 1, country_id: 1 },
        { city_id: 3, city_name: 'Koramangala', district_id: 1, state_id: 1, country_id: 1 },
        { city_id: 4, city_name: 'Mumbai', district_id: 3, state_id: 2, country_id: 1 },
        { city_id: 5, city_name: 'Pune', district_id: 4, state_id: 2, country_id: 1 },
        { city_id: 6, city_name: 'Chennai', district_id: 5, state_id: 3, country_id: 1 },
        { city_id: 7, city_name: 'Delhi', district_id: 6, state_id: 4, country_id: 1 }
    ]);

    // Gym branches (in production, fetch from API)
    const [branches] = useState([
        { branch_id: 1, branch_name: 'Main Branch', city_id: 1, city_name: 'Bangalore', address: 'MG Road' },
        { branch_id: 2, branch_name: 'North Branch', city_id: 2, city_name: 'Whitefield', address: 'ITPL Main Road' },
        { branch_id: 3, branch_name: 'South Branch', city_id: 3, city_name: 'Koramangala', address: '5th Block' },
        { branch_id: 4, branch_name: 'Mumbai Branch', city_id: 4, city_name: 'Mumbai', address: 'Andheri West' },
        { branch_id: 5, branch_name: 'Pune Branch', city_id: 5, city_name: 'Pune', address: 'Koregaon Park' }
    ]);

    // Membership plans (in production, fetch from API)
    const [membershipPlans] = useState([
        { plan_id: 1, gym_id: 1, branch_id: null, plan_name: 'Monthly Basic', duration_days: 30, price: 1500.00, description: 'Basic gym access for 1 month', is_active: true },
        { plan_id: 2, gym_id: 1, branch_id: null, plan_name: 'Quarterly Standard', duration_days: 90, price: 4000.00, description: 'Standard gym access for 3 months with 10% discount', is_active: true },
        { plan_id: 3, gym_id: 1, branch_id: null, plan_name: 'Half-Yearly Premium', duration_days: 180, price: 7500.00, description: 'Premium gym access for 6 months with personal trainer', is_active: true },
        { plan_id: 4, gym_id: 1, branch_id: null, plan_name: 'Annual Elite', duration_days: 365, price: 14000.00, description: 'Elite gym access for 1 year with diet plan and personal trainer', is_active: true },
        { plan_id: 5, gym_id: 1, branch_id: 1, plan_name: 'Main Branch Special', duration_days: 90, price: 3500.00, description: 'Special quarterly plan for Main Branch only', is_active: true },
        { plan_id: 6, gym_id: 1, branch_id: 2, plan_name: 'North Branch Weekend', duration_days: 30, price: 1200.00, description: 'Weekend only access for North Branch', is_active: true },
        { plan_id: 7, gym_id: 1, branch_id: null, plan_name: 'Student Monthly', duration_days: 30, price: 1200.00, description: 'Discounted monthly plan for students', is_active: true }
    ]);

    // Sample members data (would come from database/API in production)
    const [members, setMembers] = useState([
        {
            member_id: 1001,
            user_id: 501,
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@gmail.com',
            phone: '+91 98765 43210',
            join_date: '2024-01-15',
            status: 'ACTIVE',
            branch_name: 'Main Branch',
            plan_name: 'Quarterly Standard',
            plan_duration: 90,
            plan_price: 4000.00,
            profile: {
                dob: '1995-06-20',
                gender: 'MALE',
                blood_group: 'O+',
                height_cm: 175.5,
                weight_kg: 72.3,
                fitness_level: 'INTERMEDIATE',
                goal_focus: 'MUSCLE_GAIN',
                emergency_contact: '+91 98765 11111',
                address: '123, MG Road, Bangalore, Karnataka - 560001'
            }
        },
        {
            member_id: 1002,
            user_id: 502,
            name: 'Priya Sharma',
            email: 'priya.sharma@gmail.com',
            phone: '+91 98765 43211',
            join_date: '2024-02-10',
            status: 'ACTIVE',
            branch_name: 'Main Branch',
            plan_name: 'Monthly Basic',
            plan_duration: 30,
            plan_price: 1500.00,
            profile: {
                dob: '1998-03-15',
                gender: 'FEMALE',
                blood_group: 'A+',
                height_cm: 162.0,
                weight_kg: 58.5,
                fitness_level: 'BEGINNER',
                goal_focus: 'WEIGHT_LOSS',
                emergency_contact: '+91 98765 22222',
                address: '456, Brigade Road, Bangalore, Karnataka - 560025'
            }
        },
        {
            member_id: 1003,
            user_id: 503,
            name: 'Amit Patel',
            email: 'amit.patel@gmail.com',
            phone: '+91 98765 43212',
            join_date: '2023-11-20',
            status: 'ACTIVE',
            branch_name: 'North Branch',
            plan_name: 'Annual Elite',
            plan_duration: 365,
            plan_price: 14000.00,
            profile: {
                dob: '1992-08-10',
                gender: 'MALE',
                blood_group: 'B+',
                height_cm: 180.0,
                weight_kg: 85.0,
                fitness_level: 'ADVANCED',
                goal_focus: 'STRENGTH',
                emergency_contact: '+91 98765 33333',
                address: '789, Whitefield, Bangalore, Karnataka - 560066'
            }
        },
        {
            member_id: 1004,
            user_id: 504,
            name: 'Sneha Reddy',
            email: 'sneha.reddy@gmail.com',
            phone: '+91 98765 43213',
            join_date: '2024-03-05',
            status: 'INACTIVE',
            branch_name: 'Main Branch',
            plan_name: 'Half-Yearly Premium',
            plan_duration: 180,
            plan_price: 7500.00,
            profile: {
                dob: '1996-12-25',
                gender: 'FEMALE',
                blood_group: 'AB+',
                height_cm: 168.0,
                weight_kg: 62.0,
                fitness_level: 'INTERMEDIATE',
                goal_focus: 'ENDURANCE',
                emergency_contact: '+91 98765 44444',
                address: '321, Koramangala, Bangalore, Karnataka - 560034'
            }
        },
        {
            member_id: 1005,
            user_id: 505,
            name: 'Vikram Singh',
            email: 'vikram.singh@gmail.com',
            phone: '+91 98765 43214',
            join_date: '2024-01-28',
            status: 'SUSPENDED',
            branch_name: 'South Branch',
            plan_name: 'Quarterly Standard',
            plan_duration: 90,
            plan_price: 4000.00,
            profile: {
                dob: '1990-04-18',
                gender: 'MALE',
                blood_group: 'O-',
                height_cm: 178.0,
                weight_kg: 90.0,
                fitness_level: 'ADVANCED',
                goal_focus: 'GENERAL',
                emergency_contact: '+91 98765 55555',
                address: '654, Jayanagar, Bangalore, Karnataka - 560041'
            }
        },
        {
            member_id: 1006,
            user_id: 506,
            name: 'Ananya Iyer',
            email: 'ananya.iyer@gmail.com',
            phone: '+91 98765 43215',
            join_date: '2024-02-20',
            status: 'ACTIVE',
            branch_name: 'North Branch',
            plan_name: 'Student Monthly',
            plan_duration: 30,
            plan_price: 1200.00,
            profile: {
                dob: '1999-07-30',
                gender: 'FEMALE',
                blood_group: 'A-',
                height_cm: 165.0,
                weight_kg: 55.0,
                fitness_level: 'BEGINNER',
                goal_focus: 'GENERAL',
                emergency_contact: '+91 98765 66666',
                address: '987, Indiranagar, Bangalore, Karnataka - 560038'
            }
        }
    ]);

    // Filter members based on search query
    const filteredMembers = members.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.member_id.toString().includes(searchQuery) ||
        member.branch_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewProfile = (member) => {
        setSelectedMember(member);
        setShowMemberProfile(true);
    };

    const handleEditMember = (member) => {
        setEditFormData({
            member_id: member.member_id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            status: member.status,
            branch_name: member.branch_name,
            dob: member.profile.dob,
            gender: member.profile.gender,
            blood_group: member.profile.blood_group,
            height_cm: member.profile.height_cm,
            weight_kg: member.profile.weight_kg,
            fitness_level: member.profile.fitness_level,
            goal_focus: member.profile.goal_focus,
            emergency_contact: member.profile.emergency_contact,
            address: member.profile.address
        });
        setShowEditModal(true);
        setShowMemberProfile(false);
    };

    const handleDeleteMember = (member) => {
        if (window.confirm(`Are you sure you want to delete member: ${member.name}?\n\nThis action cannot be undone.`)) {
            setMembers(members.filter(m => m.member_id !== member.member_id));
            alert(`Member ${member.name} has been deleted successfully!`);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        
        // Update member in the list
        setMembers(members.map(member => {
            if (member.member_id === editFormData.member_id) {
                return {
                    ...member,
                    name: editFormData.name,
                    email: editFormData.email,
                    phone: editFormData.phone,
                    status: editFormData.status,
                    branch_name: editFormData.branch_name,
                    profile: {
                        ...member.profile,
                        dob: editFormData.dob,
                        gender: editFormData.gender,
                        blood_group: editFormData.blood_group,
                        height_cm: parseFloat(editFormData.height_cm),
                        weight_kg: parseFloat(editFormData.weight_kg),
                        fitness_level: editFormData.fitness_level,
                        goal_focus: editFormData.goal_focus,
                        emergency_contact: editFormData.emergency_contact,
                        address: editFormData.address
                    }
                };
            }
            return member;
        }));

        alert('Member information updated successfully!');
        setShowEditModal(false);
        setEditFormData(null);
    };

    const closeMemberProfile = () => {
        setShowMemberProfile(false);
        setSelectedMember(null);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditFormData(null);
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'ACTIVE': return 'status-active';
            case 'INACTIVE': return 'status-inactive';
            case 'SUSPENDED': return 'status-suspended';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const showComingSoon = (feature) => {
        alert(`${feature} feature is coming soon! 🚀\n\nThis feature is currently under development and will be available in a future update.`);
    };

    // Get filtered states based on selected country
    const getFilteredStates = () => {
        return states.filter(state => state.country_id === parseInt(addFormData.country_id));
    };

    // Get filtered districts based on selected state
    const getFilteredDistricts = () => {
        return districts.filter(district => district.state_id === parseInt(addFormData.state_id));
    };

    // Get filtered cities based on selected district
    const getFilteredCities = () => {
        return cities.filter(city => city.district_id === parseInt(addFormData.district_id));
    };

    // Get available plans based on selected branch (gym-wide plans + branch-specific plans)
    const getAvailablePlans = () => {
        if (!addFormData.branch_id) return [];
        
        return membershipPlans.filter(plan => 
            plan.is_active && (
                plan.branch_id === null || // Gym-wide plans
                plan.branch_id === parseInt(addFormData.branch_id) // Branch-specific plans
            )
        );
    };

    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setAddFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Reset dependent fields when parent changes
            if (name === 'country_id') {
                updated.state_id = '';
                updated.district_id = '';
                updated.city_id = '';
            } else if (name === 'state_id') {
                updated.district_id = '';
                updated.city_id = '';
            } else if (name === 'district_id') {
                updated.city_id = '';
            } else if (name === 'branch_id') {
                // Reset plan selection when branch changes
                updated.plan_id = '';
            }
            
            return updated;
        });
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        
        // Generate new IDs (in production, these come from backend)
        const newMemberId = members.length > 0 ? Math.max(...members.map(m => m.member_id)) + 1 : 1001;
        const newUserId = members.length > 0 ? Math.max(...members.map(m => m.user_id)) + 1 : 501;
        
        // Get branch details
        const selectedBranch = branches.find(b => b.branch_id === parseInt(addFormData.branch_id));
        
        // Get plan details
        const selectedPlan = membershipPlans.find(p => p.plan_id === parseInt(addFormData.plan_id));
        
        // Get location details
        const selectedCity = cities.find(c => c.city_id === parseInt(addFormData.city_id));
        const selectedDistrict = districts.find(d => d.district_id === parseInt(addFormData.district_id));
        const selectedState = states.find(s => s.state_id === parseInt(addFormData.state_id));
        
        // Build full address
        const fullAddress = [
            addFormData.address_line1,
            addFormData.address_line2,
            selectedCity?.city_name,
            selectedDistrict?.district_name,
            selectedState?.state_name,
            'India'
        ].filter(Boolean).join(', ');
        
        // Create new member object
        const newMember = {
            member_id: newMemberId,
            user_id: newUserId,
            nlan_name: selectedPlan?.plan_name || 'No Plan',
            plan_duration: selectedPlan?.duration_days || 0,
            plan_price: selectedPlan?.price || 0,
            pame: addFormData.name,
            email: addFormData.email,
            phone: addFormData.phone,
            join_date: addFormData.join_date,
            status: addFormData.status,
            branch_name: selectedBranch?.branch_name || 'Unknown Branch',
            profile: {
                dob: addFormData.dob,
                gender: addFormData.gender,
                blood_group: addFormData.blood_group,
                height_cm: parseFloat(addFormData.height_cm) || 0,
                weight_kg: parseFloat(addFormData.weight_kg) || 0,
                fitness_level: addFormData.fitness_level,
                goal_focus: addFormData.goal_focus,
                emergency_contact: addFormData.emergency_contact,
                address: fullAddress
            }
        };
        
        // Add to members list
        setMembers([...members, newMember]);
        
        alert(`Member ${addFormData.name} has been added successfully! 🎉`);
        
        // Reset form and close modal
        setShowAddModal(false);
        setAddFormData({
            name: '',
            email: '',
            plan_id: '',
            phone: '',
            password: '',
            role: 'MEMBER',
            branch_id: '',
            join_date: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            dob: '',
            gender: 'MALE',
            blood_group: 'O+',
            height_cm: '',
            weight_kg: '',
            fitness_level: 'BEGINNER',
            goal_focus: 'GENERAL',
            emergency_contact: '',
            address_line1: '',
            address_line2: '',
            country_id: '1',
            state_id: '',
            district_id: '',
            city_id: ''
        });
    };

    const openAddModal = () => {
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    return (
        <div className="member-management">
            <div className="member-page-header">
                <h1 className="member-page-title">Members Management</h1>
                <p className="member-page-subtitle">Manage gym members and their information</p>
            </div>

            {/* Search and Actions Bar */}
            <div className="member-actions-bar">
                <div className="member-search-container">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        className="member-search-input"
                        placeholder="Search by name, email, phone, ID, or branch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button 
                            className="member-search-clear"
                            onClick={() => setSearchQuery('')}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <button className="member-add-btn" onClick={openAddModal}>
                    <i className="fas fa-user-plus"></i>
                    Add New Member
                </button>
            </div>

            {/* Members Stats */}
            <div className="member-stats-bar">
                <div className="member-stat-item">
                    <i className="fas fa-users"></i>
                    <span>Total: <strong>{members.length}</strong></span>
                </div>
                <div className="member-stat-item">
                    <i className="fas fa-search"></i>
                    <span>Found: <strong>{filteredMembers.length}</strong></span>
                </div>
                <div className="member-stat-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Active: <strong>{members.filter(m => m.status === 'ACTIVE').length}</strong></span>
                </div>
            </div>

            {/* Members Table */}
            <div className="member-table-container">
                {filteredMembers.length > 0 ? (
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th>Member ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Join Date</th>
                                <th>Branch</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member) => (
                                <tr key={member.member_id}>
                                    <td className="member-id-cell">#{member.member_id}</td>
                                    <td className="member-name-cell">
                                        <i className="fas fa-user-circle"></i>
                                        {member.name}
                                    </td>
                                    <td>{member.email}</td>
                                    <td>{member.phone}</td>
                                    <td>{formatDate(member.join_date)}</td>
                                    <td>{member.branch_name}</td>
                                    <td>
                                        <span className={`member-status-badge ${getStatusBadgeClass(member.status)}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="member-actions-cell">
                                        <button 
                                            className="member-action-icon member-view-btn"
                                            onClick={() => handleViewProfile(member)}
                                            title="View Profile"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            className="member-action-icon member-edit-btn"
                                            onClick={() => handleEditMember(member)}
                                            title="Edit Member"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="member-action-icon member-delete-btn"
                                            onClick={() => handleDeleteMember(member)}
                                            title="Delete Member"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="member-no-results">
                        <i className="fas fa-search"></i>
                        <h3>No Members Found</h3>
                        <p>No members match your search criteria "{searchQuery}"</p>
                        <button className="member-clear-search-btn" onClick={() => setSearchQuery('')}>
                            Clear Search
                        </button>
                    </div>
                )}
            </div>

            {/* Member Profile Modal */}
            {showMemberProfile && selectedMember && (
                <div className="member-modal-overlay" onClick={closeMemberProfile}>
                    <div className="member-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="member-modal-header">
                            <h2>
                                <i className="fas fa-user-circle"></i>
                                Member Profile
                            </h2>
                            <button className="member-modal-close" onClick={closeMemberProfile}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="member-modal-body">
                            {/* Basic Information */}
                            <div className="member-profile-section">
                                <h3 className="member-profile-section-title">
                                    <i className="fas fa-info-circle"></i>
                                    Basic Information
                                </h3>
                                <div className="member-profile-grid">
                                    <div className="member-profile-item">
                                        <label>Full Name</label>
                                        <span>{selectedMember.name}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Member ID</label>
                                        <span>#{selectedMember.member_id}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Email</label>
                                        <span>{selectedMember.email}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Phone</label>
                                        <span>{selectedMember.phone}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Date of Birth</label>
                                        <span>{formatDate(selectedMember.profile.dob)}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Gender</label>
                                        <span>{selectedMember.profile.gender}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Blood Group</label>
                                        <span>{selectedMember.profile.blood_group}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Physical Information */}
                            <div className="member-profile-section">
                                <h3 className="member-profile-section-title">
                                    <i className="fas fa-weight"></i>
                                    Physical Information
                                </h3>
                                <div className="member-profile-grid">
                                    <div className="member-profile-item">
                                        <label>Height</label>
                                        <span>{selectedMember.profile.height_cm} cm</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Weight</label>
                                        <span>{selectedMember.profile.weight_kg} kg</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fitness Information */}
                            <div className="member-profile-section">
                                <h3 className="member-profile-section-title">
                                    <i className="fas fa-dumbbell"></i>
                                    Fitness Information
                                </h3>
                                <div className="member-profile-grid">
                                    <div className="member-profile-item">
                                        <label>Fitness Level</label>
                                        <span className="member-fitness-badge">
                                            {selectedMember.profile.fitness_level}
                                        </span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Goal Focus</label>
                                        <span className="member-goal-badge">
                                            {selectedMember.profile.goal_focus.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Membership Information */}
                            <div className="member-profile-section">
                                <h3 className="member-profile-section-title">
                                    <i className="fas fa-id-card"></i>
                                    Membership Information
                                </h3>
                                <div className="member-profile-grid">
                                    <div className="member-profile-item">
                                        <label>Join Date</label>
                                        <span>{formatDate(selectedMember.join_date)}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Branch</label>
                                        <span>{selectedMember.branch_name}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Status</label>
                                        <span className={`member-status-badge ${getStatusBadgeClass(selectedMember.status)}`}>
                                            {selectedMember.status}
                                        </span>
                                    </div>
                                    {selectedMember.plan_name && (
                                        <>
                                            <div className="member-profile-item">
                                                <label>Membership Plan</label>
                                                <span className="member-goal-badge">{selectedMember.plan_name}</span>
                                            </div>
                                            <div className="member-profile-item">
                                                <label>Plan Duration</label>
                                                <span>{selectedMember.plan_duration} days</span>
                                            </div>
                                            <div className="member-profile-item">
                                                <label>Plan Price</label>
                                                <span style={{ color: '#27ae60', fontWeight: '600' }}>₹{selectedMember.plan_price}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="member-profile-section">
                                <h3 className="member-profile-section-title">
                                    <i className="fas fa-phone"></i>
                                    Emergency Contact
                                </h3>
                                <div className="member-profile-grid">
                                    <div className="member-profile-item">
                                        <label>Emergency Phone</label>
                                        <span>{selectedMember.profile.emergency_contact}</span>
                                    </div>
                                    <div className="member-profile-item member-full-width">
                                        <label>Address</label>
                                        <span>{selectedMember.profile.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="member-modal-footer">
                            <button className="member-modal-btn member-edit" onClick={() => {
                                closeMemberProfile();
                                handleEditMember(selectedMember);
                            }}>
                                <i className="fas fa-edit"></i>
                                Edit Member
                            </button>
                            <button className="member-modal-btn member-close" onClick={closeMemberProfile}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {showEditModal && editFormData && (
                <div className="member-modal-overlay" onClick={closeEditModal}>
                    <div className="member-modal-content member-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="member-modal-header">
                            <h2>
                                <i className="fas fa-user-edit"></i>
                                Edit Member Information
                            </h2>
                            <button className="member-modal-close" onClick={closeEditModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveChanges} className="member-edit-form">
                            <div className="member-modal-body">
                                {/* Basic Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-info-circle"></i>
                                        Basic Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editFormData.name}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editFormData.email}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Phone *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editFormData.phone}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={editFormData.dob}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Gender</label>
                                            <select
                                                name="gender"
                                                value={editFormData.gender}
                                                onChange={handleFormChange}
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>Blood Group</label>
                                            <select
                                                name="blood_group"
                                                value={editFormData.blood_group}
                                                onChange={handleFormChange}
                                            >
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Physical Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-weight"></i>
                                        Physical Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Height (cm)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="height_cm"
                                                value={editFormData.height_cm}
                                                onChange={handleFormChange}
                                                placeholder="175.5"
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Weight (kg)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="weight_kg"
                                                value={editFormData.weight_kg}
                                                onChange={handleFormChange}
                                                placeholder="70.5"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Fitness Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-dumbbell"></i>
                                        Fitness Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Fitness Level</label>
                                            <select
                                                name="fitness_level"
                                                value={editFormData.fitness_level}
                                                onChange={handleFormChange}
                                            >
                                                <option value="BEGINNER">Beginner</option>
                                                <option value="INTERMEDIATE">Intermediate</option>
                                                <option value="ADVANCED">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>Goal Focus</label>
                                            <select
                                                name="goal_focus"
                                                value={editFormData.goal_focus}
                                                onChange={handleFormChange}
                                            >
                                                <option value="WEIGHT_LOSS">Weight Loss</option>
                                                <option value="MUSCLE_GAIN">Muscle Gain</option>
                                                <option value="STRENGTH">Strength</option>
                                                <option value="ENDURANCE">Endurance</option>
                                                <option value="GENERAL">General Fitness</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Membership Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-id-card"></i>
                                        Membership Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Branch</label>
                                            <select
                                                name="branch_name"
                                                value={editFormData.branch_name}
                                                onChange={handleFormChange}
                                            >
                                                <option value="Main Branch">Main Branch</option>
                                                <option value="North Branch">North Branch</option>
                                                <option value="South Branch">South Branch</option>
                                                <option value="East Branch">East Branch</option>
                                                <option value="West Branch">West Branch</option>
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                value={editFormData.status}
                                                onChange={handleFormChange}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="SUSPENDED">Suspended</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-phone"></i>
                                        Emergency Contact
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Emergency Phone</label>
                                            <input
                                                type="tel"
                                                name="emergency_contact"
                                                value={editFormData.emergency_contact}
                                                onChange={handleFormChange}
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <div className="member-form-group member-full-width">
                                            <label>Address</label>
                                            <textarea
                                                name="address"
                                                value={editFormData.address}
                                                onChange={handleFormChange}
                                                rows="3"
                                                placeholder="Enter full address"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="member-modal-footer">
                                <button type="submit" className="member-modal-btn member-save">
                                    <i className="fas fa-save"></i>
                                    Save Changes
                                </button>
                                <button type="button" className="member-modal-btn member-cancel" onClick={closeEditModal}>
                                    <i className="fas fa-times"></i>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="member-modal-overlay" onClick={closeAddModal}>
                    <div className="member-modal-content member-edit-modal member-add-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="member-modal-header">
                            <h2>
                                <i className="fas fa-user-plus"></i>
                                Add New Member
                            </h2>
                            <button className="member-modal-close" onClick={closeAddModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddMember} className="member-edit-form">
                            <div className="member-modal-body">
                                {/* User Account Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-user"></i>
                                        User Account Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={addFormData.name}
                                                onChange={handleAddFormChange}
                                                required
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={addFormData.email}
                                                onChange={handleAddFormChange}
                                                required
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Phone *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={addFormData.phone}
                                                onChange={handleAddFormChange}
                                                required
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Password *</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={addFormData.password}
                                                onChange={handleAddFormChange}
                                                required
                                                placeholder="Enter password"
                                                minLength="6"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Membership Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-id-card"></i>
                                        Membership Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Branch *</label>
                                            <select
                                                name="branch_id"
                                                value={addFormData.branch_id}
                                                onChange={handleAddFormChange}
                                                required
                                            >
                                                <option value="">Select Branch</option>
                                                {branches.map(branch => (
                                                    <option key={branch.branch_id} value={branch.branch_id}>
                                                        {branch.branch_name} - {branch.city_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>Join Date *</label>
                                            <input
                                                type="date"
                                                name="join_date"
                                                value={addFormData.join_date}
                                                onChange={handleAddFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                value={addFormData.status}
                                                onChange={handleAddFormChange}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="SUSPENDED">Suspended</option>
                                            </select>
                                        </div>
                                        <div className="member-form-group member-full-width">
                                            <label>Membership Plan *</label>
                                            <select
                                                name="plan_id"
                                                value={addFormData.plan_id}
                                                onChange={handleAddFormChange}
                                                required
                                                disabled={!addFormData.branch_id}
                                            >
                                                <option value="">Select Membership Plan</option>
                                                {getAvailablePlans().map(plan => (
                                                    <option key={plan.plan_id} value={plan.plan_id}>
                                                        {plan.plan_name} - ₹{plan.price} ({plan.duration_days} days)
                                                        {plan.branch_id && ' - Branch Exclusive'}
                                                    </option>
                                                ))}
                                            </select>
                                            {addFormData.plan_id && (
                                                <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                                                    {membershipPlans.find(p => p.plan_id === parseInt(addFormData.plan_id))?.description}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-info-circle"></i>
                                        Personal Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={addFormData.dob}
                                                onChange={handleAddFormChange}
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Gender</label>
                                            <select
                                                name="gender"
                                                value={addFormData.gender}
                                                onChange={handleAddFormChange}
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>Blood Group</label>
                                            <select
                                                name="blood_group"
                                                value={addFormData.blood_group}
                                                onChange={handleAddFormChange}
                                            >
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Physical Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-weight"></i>
                                        Physical Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Height (cm)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="height_cm"
                                                value={addFormData.height_cm}
                                                onChange={handleAddFormChange}
                                                placeholder="175.5"
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Weight (kg)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="weight_kg"
                                                value={addFormData.weight_kg}
                                                onChange={handleAddFormChange}
                                                placeholder="70.5"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Fitness Goals */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-dumbbell"></i>
                                        Fitness Goals
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Fitness Level</label>
                                            <select
                                                name="fitness_level"
                                                value={addFormData.fitness_level}
                                                onChange={handleAddFormChange}
                                            >
                                                <option value="BEGINNER">Beginner</option>
                                                <option value="INTERMEDIATE">Intermediate</option>
                                                <option value="ADVANCED">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>Goal Focus</label>
                                            <select
                                                name="goal_focus"
                                                value={addFormData.goal_focus}
                                                onChange={handleAddFormChange}
                                            >
                                                <option value="WEIGHT_LOSS">Weight Loss</option>
                                                <option value="MUSCLE_GAIN">Muscle Gain</option>
                                                <option value="STRENGTH">Strength</option>
                                                <option value="ENDURANCE">Endurance</option>
                                                <option value="GENERAL">General Fitness</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-map-marked-alt"></i>
                                        Address Information
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Country *</label>
                                            <select
                                                name="country_id"
                                                value={addFormData.country_id}
                                                onChange={handleAddFormChange}
                                                required
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map(country => (
                                                    <option key={country.country_id} value={country.country_id}>
                                                        {country.country_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>State *</label>
                                            <select
                                                name="state_id"
                                                value={addFormData.state_id}
                                                onChange={handleAddFormChange}
                                                required
                                                disabled={!addFormData.country_id}
                                            >
                                                <option value="">Select State</option>
                                                {getFilteredStates().map(state => (
                                                    <option key={state.state_id} value={state.state_id}>
                                                        {state.state_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>District *</label>
                                            <select
                                                name="district_id"
                                                value={addFormData.district_id}
                                                onChange={handleAddFormChange}
                                                required
                                                disabled={!addFormData.state_id}
                                            >
                                                <option value="">Select District</option>
                                                {getFilteredDistricts().map(district => (
                                                    <option key={district.district_id} value={district.district_id}>
                                                        {district.district_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>City *</label>
                                            <select
                                                name="city_id"
                                                value={addFormData.city_id}
                                                onChange={handleAddFormChange}
                                                required
                                                disabled={!addFormData.district_id}
                                            >
                                                <option value="">Select City</option>
                                                {getFilteredCities().map(city => (
                                                    <option key={city.city_id} value={city.city_id}>
                                                        {city.city_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>Address Line 1 *</label>
                                            <input
                                                type="text"
                                                name="address_line1"
                                                value={addFormData.address_line1}
                                                onChange={handleAddFormChange}
                                                required
                                                placeholder="Building/House No., Street"
                                            />
                                        </div>
                                        <div className="member-form-group">
                                            <label>Address Line 2</label>
                                            <input
                                                type="text"
                                                name="address_line2"
                                                value={addFormData.address_line2}
                                                onChange={handleAddFormChange}
                                                placeholder="Landmark, Area"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="member-form-section">
                                    <h3 className="member-form-section-title">
                                        <i className="fas fa-phone-alt"></i>
                                        Emergency Contact
                                    </h3>
                                    <div className="member-form-grid">
                                        <div className="member-form-group">
                                            <label>Emergency Phone</label>
                                            <input
                                                type="tel"
                                                name="emergency_contact"
                                                value={addFormData.emergency_contact}
                                                onChange={handleAddFormChange}
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="member-modal-footer">
                                <button type="submit" className="member-modal-btn member-save">
                                    <i className="fas fa-user-plus"></i>
                                    Add Member
                                </button>
                                <button type="button" className="member-modal-btn member-cancel" onClick={closeAddModal}>
                                    <i className="fas fa-times"></i>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberManagement;
