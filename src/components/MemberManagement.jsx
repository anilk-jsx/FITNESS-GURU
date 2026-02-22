import React, { useState, useEffect } from 'react';
import './MemberManagement.css';

const MemberManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showMemberProfile, setShowMemberProfile] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    
    // API state management
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0
    });
    
    // Filter states
    const [filters, setFilters] = useState({
        role: 'MEMBER', // Default to MEMBER role for member management
        status: '', // All statuses
        gym_id: '',
        branch_id: ''
    });
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

    // Location and branch data - state management
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [branches, setBranches] = useState([]);
    
    // Loading states for dropdowns
    const [dropdownLoading, setDropdownLoading] = useState({
        countries: false,
        states: false,
        districts: false,
        cities: false,
        branches: false
    });

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

    // API Configuration
    const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
    
    // Build full paths - check if they match your server structure
    const buildApiUrl = (endpoint) => {
        // If using the production URL, endpoints might be directly under /api/
        // If using localhost, they might be under /fitness-guru/api/
        const isLocalhost = API_BASE_URL.includes('localhost');
        const basePath = isLocalhost ? '/fitness-guru/api' : '/api';
        return `${API_BASE_URL}${basePath}/${endpoint}`;
    };
    
    // Get access token from localStorage or context
    const getAccessToken = () => {
        return localStorage.getItem('access_token') || '';
    };
    
    // Fetch countries from API
    const fetchCountries = async () => {
        setDropdownLoading(prev => ({ ...prev, countries: true }));
        try {
            const apiUrl = buildApiUrl('countryList');
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                setCountries(data.data); // API returns data.data, not data.countries
                console.log('Countries loaded:', data.data.length, 'items');
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (err) {
            console.error('Error fetching countries:', err.message);
            // Fallback to default data
            setCountries([{ country_id: 1, country_name: 'India' }]);
        } finally {
            setDropdownLoading(prev => ({ ...prev, countries: false }));
        }
    };
    
    // Fetch states from API
    const fetchStates = async () => {
        setDropdownLoading(prev => ({ ...prev, states: true }));
        try {
            const apiUrl = buildApiUrl('stateList');
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                setStates(data.data); // API returns data.data, not data.states
                console.log('States loaded:', data.data.length, 'items');
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (err) {
            console.error('Error fetching states:', err.message);
            // Fallback to default data
            setStates([
                { state_id: 1, state_name: 'Karnataka', country_id: 1 },
                { state_id: 2, state_name: 'Maharashtra', country_id: 1 },
                { state_id: 3, state_name: 'Tamil Nadu', country_id: 1 },
                { state_id: 4, state_name: 'Delhi', country_id: 1 }
            ]);
        } finally {
            setDropdownLoading(prev => ({ ...prev, states: false }));
        }
    };
    
    // Fetch districts from API
    const fetchDistricts = async () => {
        setDropdownLoading(prev => ({ ...prev, districts: true }));
        try {
            const apiUrl = buildApiUrl('districtList');
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                setDistricts(data.data); // API returns data.data, not data.districts
                console.log('Districts loaded:', data.data.length, 'items');
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (err) {
            console.error('Error fetching districts:', err.message);
            // Fallback to default data
            setDistricts([
                { district_id: 1, district_name: 'Bangalore Urban', state_id: 1, country_id: 1 },
                { district_id: 2, district_name: 'Bangalore Rural', state_id: 1, country_id: 1 },
                { district_id: 3, district_name: 'Mumbai', state_id: 2, country_id: 1 },
                { district_id: 4, district_name: 'Pune', state_id: 2, country_id: 1 },
                { district_id: 5, district_name: 'Chennai', state_id: 3, country_id: 1 },
                { district_id: 6, district_name: 'Central Delhi', state_id: 4, country_id: 1 }
            ]);
        } finally {
            setDropdownLoading(prev => ({ ...prev, districts: false }));
        }
    };
    
    // Fetch gym branches from API
    const fetchBranches = async () => {
        setDropdownLoading(prev => ({ ...prev, branches: true }));
        try {
            const apiUrl = buildApiUrl('gymBranchList');
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                setBranches(data.data); // API returns data.data, not data.branches
                console.log('Branches loaded:', data.data.length, 'items');
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (err) {
            console.error('Error fetching branches:', err.message);
            console.warn('Using fallback branch data due to backend API issue');
            // Fallback to default data - Backend API has issues
            setBranches([
                { branch_id: 1, branch_name: 'Main Branch', city_id: 1, city_name: 'Bangalore', address: 'MG Road' },
                { branch_id: 2, branch_name: 'North Branch', city_id: 2, city_name: 'Whitefield', address: 'ITPL Main Road' },
                { branch_id: 3, branch_name: 'South Branch', city_id: 3, city_name: 'Koramangala', address: '5th Block' }
            ]);
        } finally {
            setDropdownLoading(prev => ({ ...prev, branches: false }));
        }
    };
    
    // Fetch members from API
    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const queryParams = new URLSearchParams({
                role: filters.role,
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });
            
            // Add optional filters if they exist
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.gym_id) queryParams.append('gym_id', filters.gym_id);
            if (filters.branch_id) queryParams.append('branch_id', filters.branch_id);
            
            const response = await fetch(buildApiUrl(`users/list?${queryParams}`), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setMembers(data.users || data.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.meta?.total || data.total || 0
                }));
            } else {
                throw new Error(data.message || 'Failed to fetch members');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    };
    
    // Effect to fetch members on component mount and when filters/pagination change
    useEffect(() => {
        fetchMembers();
    }, [filters, pagination.page, pagination.limit]);
    
    // Effect to fetch dropdown data on component mount
    useEffect(() => {
        fetchCountries();
        fetchStates();
        fetchDistricts();
        fetchBranches();
        initializeMockCities(); // Initialize cities with mock data since no API endpoint
        
        // Clean debug function - available in console as window.testAPI()
        if (typeof window !== 'undefined') {
            window.testAPI = () => {
                console.log('=== API Test Results ===');
                console.log('Countries:', countries);
                console.log('States:', states);
                console.log('Districts:', districts);
                console.log('Branches:', branches);
                console.log('Cities:', cities);
            };
        }
    }, []);
    
    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        // Reset to first page when filters change
        setPagination(prev => ({ ...prev, page: 1 }));
    };
    
    // Handle pagination changes
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };
    
    // Handle limit changes
    const handleLimitChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    // Filter members based on search query (client-side filtering for current page)
    const filteredMembers = members.filter(member => {
        const query = searchQuery.toLowerCase();
        return (
            member.name?.toLowerCase().includes(query) ||
            member.email?.toLowerCase().includes(query) ||
            member.phone?.includes(searchQuery) ||
            member.user_id?.toString().includes(searchQuery)
        );
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(pagination.total / pagination.limit);

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
    // Note: There's no cityList API endpoint, using mock data for now
    // TODO: Add cityList API endpoint or handle cities differently
    const getFilteredCities = () => {
        return cities.filter(city => city.district_id === parseInt(addFormData.district_id));
    };
    
    // Initialize cities with mock data since no API endpoint exists
    const initializeMockCities = () => {
        setCities([
            { city_id: 1, city_name: 'Bangalore', district_id: 1, state_id: 1, country_id: 1 },
            { city_id: 2, city_name: 'Mysore', district_id: 2, state_id: 1, country_id: 1 },
            { city_id: 3, city_name: 'Mumbai', district_id: 3, state_id: 2, country_id: 1 },
            { city_id: 4, city_name: 'Pune', district_id: 4, state_id: 2, country_id: 1 },
            { city_id: 5, city_name: 'Chennai', district_id: 5, state_id: 3, country_id: 1 },
            { city_id: 6, city_name: 'Delhi', district_id: 6, state_id: 4, country_id: 1 }
        ]);
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

    const handleAddMember = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Prepare member data for API call
            const memberData = {
                name: addFormData.name,
                email: addFormData.email,
                phone: addFormData.phone,
                password: addFormData.password,
                gym_id: 1, // Default gym_id - you may want to make this dynamic
                branch_id: parseInt(addFormData.branch_id),
                status: addFormData.status === 'ACTIVE' ? 1 : 0,
                join_date: addFormData.join_date,
                membership_plan: parseInt(addFormData.plan_id),
                dob: addFormData.dob,
                gender: addFormData.gender,
                blood_group: addFormData.blood_group,
                height: parseFloat(addFormData.height_cm) || 0,
                weight: parseFloat(addFormData.weight_kg) || 0,
                fitness_level: addFormData.fitness_level,
                goal_focus: addFormData.goal_focus,
                country: parseInt(addFormData.country_id),
                state: parseInt(addFormData.state_id),
                district: parseInt(addFormData.district_id),
                city: parseInt(addFormData.city_id),
                address_line1: addFormData.address_line1,
                address_line2: addFormData.address_line2,
                emergency_contact: addFormData.emergency_contact
            };
            
            const response = await fetch(buildApiUrl('addMember'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                alert(`Member ${addFormData.name} has been added successfully! 🎉`);
                
                // Reset form and close modal
                setShowAddModal(false);
                setAddFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'MEMBER',
                    branch_id: '',
                    join_date: new Date().toISOString().split('T')[0],
                    status: 'ACTIVE',
                    plan_id: '',
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
                
                // Refresh the members list
                fetchMembers();
            } else {
                throw new Error(data.message || 'Failed to add member');
            }
        } catch (err) {
            console.error('Error adding member:', err);
            alert(`Failed to add member: ${err.message}`);
        } finally {
            setLoading(false);
        }
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
                        placeholder="Search by name, email, phone, or ID..."
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
                
                {/* Filter Controls */}
                <div className="member-filters">
                    <select
                        className="member-filter-select"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                    
                    <select
                        className="member-filter-select"
                        value={filters.branch_id}
                        onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                        disabled={dropdownLoading.branches}
                    >
                        {dropdownLoading.branches ? (
                            <option value="">Loading branches...</option>
                        ) : (
                            <>
                                <option value="">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch.branch_id} value={branch.branch_id}>
                                        {branch.branch_name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                    
                    <button 
                        className="member-refresh-btn" 
                        onClick={() => fetchMembers()}
                        disabled={loading}
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                        Refresh
                    </button>
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
                    <span>Total: <strong>{pagination.total}</strong></span>
                </div>
                <div className="member-stat-item">
                    <i className="fas fa-search"></i>
                    <span>Found: <strong>{filteredMembers.length}</strong></span>
                </div>
                <div className="member-stat-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Active: <strong>{members.filter(m => m.status === 'ACTIVE').length}</strong></span>
                </div>
                {loading && (
                    <div className="member-stat-item loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading...</span>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="member-error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Error: {error}</span>
                    <button onClick={() => fetchMembers()}>
                        <i className="fas fa-retry"></i>
                        Retry
                    </button>
                </div>
            )}

            {/* Members Table */}
            <div className="member-table-container">
                {loading ? (
                    <div className="member-loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading members...</p>
                    </div>
                ) : filteredMembers.length > 0 ? (
                    <>
                        <table className="member-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Join Date</th>
                                    <th>Branch ID</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.user_id}>
                                        <td className="member-id-cell">#{member.user_id}</td>
                                        <td className="member-name-cell">
                                            <i className="fas fa-user-circle"></i>
                                            {member.name}
                                        </td>
                                        <td>{member.email}</td>
                                        <td>{member.phone}</td>
                                        <td>{formatDate(member.createdDate)}</td>
                                        <td>{member.branch_id || 'N/A'}</td>
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
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination Controls */}
                        <div className="member-pagination">
                            <div className="member-pagination-info">
                                <span>
                                    Showing {filteredMembers.length} of {pagination.total} members 
                                    (Page {pagination.page} of {totalPages})
                                </span>
                            </div>
                            
                            <div className="member-pagination-controls">
                                <select
                                    className="member-pagination-limit"
                                    value={pagination.limit}
                                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                                
                                <button
                                    className="member-pagination-btn"
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1}
                                >
                                    <i className="fas fa-angle-double-left"></i>
                                </button>
                                
                                <button
                                    className="member-pagination-btn"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    <i className="fas fa-angle-left"></i>
                                </button>
                                
                                <span className="member-pagination-current">
                                    Page {pagination.page}
                                </span>
                                
                                <button
                                    className="member-pagination-btn"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= totalPages}
                                >
                                    <i className="fas fa-angle-right"></i>
                                </button>
                                
                                <button
                                    className="member-pagination-btn"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={pagination.page >= totalPages}
                                >
                                    <i className="fas fa-angle-double-right"></i>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="member-empty-state">
                        <i className="fas fa-users-slash"></i>
                        <h3>No Members Found</h3>
                        <p>
                            {searchQuery 
                                ? `No members match your search "${searchQuery}"` 
                                : 'No members available with current filters'
                            }
                        </p>
                        {searchQuery && (
                            <button 
                                className="member-clear-search-btn"
                                onClick={() => setSearchQuery('')}
                            >
                                Clear Search
                            </button>
                        )}
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
                                        <label>User ID</label>
                                        <span>#{selectedMember.user_id}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Email</label>
                                        <span>{selectedMember.email}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Phone</label>
                                        <span>{selectedMember.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Role</label>
                                        <span>{selectedMember.role}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Status</label>
                                        <span className={`member-status-badge ${getStatusBadgeClass(selectedMember.status)}`}>
                                            {selectedMember.status}
                                        </span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Join Date</label>
                                        <span>{formatDate(selectedMember.createdDate)}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Gym ID</label>
                                        <span>{selectedMember.gym_id || 'Not assigned'}</span>
                                    </div>
                                    <div className="member-profile-item">
                                        <label>Branch ID</label>
                                        <span>{selectedMember.branch_id || 'Not assigned'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Details Notice */}
                            <div className="member-profile-section">
                                <h3 className="member-profile-section-title">
                                    <i className="fas fa-info-circle"></i>
                                    Additional Profile Information
                                </h3>
                                <div className="member-profile-notice">
                                    <p>
                                        <i className="fas fa-exclamation-circle"></i>
                                        Detailed profile information (physical stats, goals, etc.) requires 
                                        additional API integration for member profiles.
                                    </p>
                                    <button 
                                        className="member-profile-edit-btn"
                                        onClick={() => {
                                            closeMemberProfile();
                                            handleEditMember(selectedMember);
                                        }}
                                    >
                                        <i className="fas fa-edit"></i>
                                        Edit Member Details
                                    </button>
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
                                                disabled={dropdownLoading.branches}
                                            >
                                                {dropdownLoading.branches ? (
                                                    <option value="">Loading branches...</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select Branch</option>
                                                        {branches.map(branch => (
                                                            <option key={branch.branch_id} value={branch.branch_id}>
                                                                {branch.branch_name} - {branch.city_name}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
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
                                                disabled={dropdownLoading.countries}
                                            >
                                                {dropdownLoading.countries ? (
                                                    <option value="">Loading countries...</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select Country</option>
                                                        {countries.map(country => (
                                                            <option key={country.country_id} value={country.country_id}>
                                                                {country.country_name}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>State *</label>
                                            <select
                                                name="state_id"
                                                value={addFormData.state_id}
                                                onChange={handleAddFormChange}
                                                required
                                                disabled={!addFormData.country_id || dropdownLoading.states}
                                            >
                                                {dropdownLoading.states ? (
                                                    <option value="">Loading states...</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select State</option>
                                                        {getFilteredStates().map(state => (
                                                            <option key={state.state_id} value={state.state_id}>
                                                                {state.state_name}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div className="member-form-group">
                                            <label>District *</label>
                                            <select
                                                name="district_id"
                                                value={addFormData.district_id}
                                                onChange={handleAddFormChange}
                                                required
                                                disabled={!addFormData.state_id || dropdownLoading.districts}
                                            >
                                                {dropdownLoading.districts ? (
                                                    <option value="">Loading districts...</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select District</option>
                                                        {getFilteredDistricts().map(district => (
                                                            <option key={district.district_id} value={district.district_id}>
                                                                {district.district_name}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
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
