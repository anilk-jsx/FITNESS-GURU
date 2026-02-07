import React, { useState } from 'react';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
    const [activeTab, setActiveTab] = useState('subscriptions'); // subscriptions, freezes, plans
    const [searchQuery, setSearchQuery] = useState('');

    // Subscriptions state
    const [subscriptions, setSubscriptions] = useState([
        {
            subscription_id: 1,
            member_id: 1001,
            member_name: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '9876543210',
            branch_name: 'Koramangala Branch',
            plan_name: 'Premium Annual',
            plan_price: 24999,
            start_date: '2024-01-15',
            end_date: '2025-01-14',
            status: 'ACTIVE',
            freeze_status: 'NONE',
            freeze_days: 0,
            renewal_count: 0,
            trainer_name: 'Amit Sharma'
        },
        {
            subscription_id: 2,
            member_id: 1002,
            member_name: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            phone: '9876543211',
            branch_name: 'Whitefield Branch',
            plan_name: 'Basic Monthly',
            plan_price: 2999,
            start_date: '2024-11-01',
            end_date: '2024-12-01',
            status: 'EXPIRED',
            freeze_status: 'NONE',
            freeze_days: 0,
            renewal_count: 2,
            trainer_name: null
        },
        {
            subscription_id: 3,
            member_id: 1003,
            member_name: 'Amit Verma',
            email: 'amit.verma@email.com',
            phone: '9876543212',
            branch_name: 'Bangalore Main',
            plan_name: 'Standard Quarterly',
            plan_price: 8999,
            start_date: '2024-10-01',
            end_date: '2024-12-31',
            status: 'ACTIVE',
            freeze_status: 'REQUESTED',
            freeze_days: 0,
            renewal_count: 0,
            trainer_name: 'Vikram Singh'
        },
        {
            subscription_id: 4,
            member_id: 1004,
            member_name: 'Sneha Patel',
            email: 'sneha.patel@email.com',
            phone: '9876543213',
            branch_name: 'Koramangala Branch',
            plan_name: 'Premium Semi Annual',
            plan_price: 14999,
            start_date: '2024-08-01',
            end_date: '2025-02-01',
            status: 'ACTIVE',
            freeze_status: 'ACTIVE',
            freeze_days: 15,
            renewal_count: 1,
            trainer_name: 'Amit Sharma'
        },
        {
            subscription_id: 5,
            member_id: 1005,
            member_name: 'Rahul Mehta',
            email: 'rahul.mehta@email.com',
            phone: '9876543214',
            branch_name: 'Whitefield Branch',
            plan_name: 'Basic Monthly',
            plan_price: 2999,
            start_date: '2024-11-15',
            end_date: '2024-12-15',
            status: 'ACTIVE',
            freeze_status: 'NONE',
            freeze_days: 0,
            renewal_count: 5,
            trainer_name: null
        },
        {
            subscription_id: 6,
            member_id: 1006,
            member_name: 'Kavita Singh',
            email: 'kavita.singh@email.com',
            phone: '9876543215',
            branch_name: 'Bangalore Main',
            plan_name: 'Premium Annual',
            plan_price: 24999,
            start_date: '2024-03-01',
            end_date: '2025-03-01',
            status: 'SUSPENDED',
            freeze_status: 'NONE',
            freeze_days: 0,
            renewal_count: 0,
            trainer_name: 'Vikram Singh'
        }
    ]);

    // Freeze requests state
    const [freezeRequests, setFreezeRequests] = useState([
        {
            freeze_id: 1,
            subscription_id: 3,
            member_id: 1003,
            member_name: 'Amit Verma',
            branch_name: 'Bangalore Main',
            plan_name: 'Standard Quarterly',
            reason: 'Going on vacation to Goa for 2 weeks',
            requested_days: 14,
            start_date: '2024-12-20',
            end_date: '2025-01-03',
            freeze_status: 'REQUESTED',
            created_at: '2024-12-10 10:30:00'
        },
        {
            freeze_id: 2,
            subscription_id: 7,
            member_id: 1007,
            member_name: 'Deepak Kumar',
            branch_name: 'Koramangala Branch',
            plan_name: 'Premium Annual',
            reason: 'Medical reasons - recovering from surgery',
            requested_days: 30,
            start_date: '2024-12-01',
            end_date: '2024-12-31',
            freeze_status: 'REQUESTED',
            created_at: '2024-11-28 14:20:00'
        },
        {
            freeze_id: 3,
            subscription_id: 4,
            member_id: 1004,
            member_name: 'Sneha Patel',
            branch_name: 'Koramangala Branch',
            plan_name: 'Premium Semi Annual',
            reason: 'Work travel to USA',
            requested_days: 15,
            start_date: '2024-11-15',
            end_date: '2024-11-30',
            freeze_status: 'APPROVED',
            approved_at: '2024-11-14 09:00:00',
            created_at: '2024-11-10 16:45:00'
        },
        {
            freeze_id: 4,
            subscription_id: 8,
            member_id: 1008,
            member_name: 'Anita Desai',
            branch_name: 'Whitefield Branch',
            plan_name: 'Standard Quarterly',
            reason: 'Family emergency',
            requested_days: 7,
            start_date: '2024-11-20',
            end_date: '2024-11-27',
            freeze_status: 'COMPLETED',
            approved_at: '2024-11-19 11:30:00',
            created_at: '2024-11-18 13:15:00'
        },
        {
            freeze_id: 5,
            subscription_id: 9,
            member_id: 1009,
            member_name: 'Vikas Gupta',
            branch_name: 'Bangalore Main',
            plan_name: 'Basic Monthly',
            reason: 'Personal reasons',
            requested_days: 10,
            start_date: '2024-12-05',
            end_date: '2024-12-15',
            freeze_status: 'REJECTED',
            created_at: '2024-12-03 08:00:00'
        }
    ]);

    // Membership plans state
    const [membershipPlans, setMembershipPlans] = useState([
        {
            plan_id: 1,
            plan_name: 'Basic Monthly',
            duration_days: 30,
            price: 2999,
            description: 'Access to gym equipment and group classes',
            is_active: true,
            branch_id: null,
            branch_name: 'All Branches'
        },
        {
            plan_id: 2,
            plan_name: 'Standard Quarterly',
            duration_days: 90,
            price: 8999,
            description: 'Gym access + 2 personal training sessions per month',
            is_active: true,
            branch_id: null,
            branch_name: 'All Branches'
        },
        {
            plan_id: 3,
            plan_name: 'Premium Semi Annual',
            duration_days: 180,
            price: 14999,
            description: 'Full gym access + 4 PT sessions/month + Diet consultation',
            is_active: true,
            branch_id: null,
            branch_name: 'All Branches'
        },
        {
            plan_id: 4,
            plan_name: 'Premium Annual',
            duration_days: 365,
            price: 24999,
            description: 'Ultimate package: Unlimited gym access + 8 PT sessions/month + Diet plan + Spa access',
            is_active: true,
            branch_id: null,
            branch_name: 'All Branches'
        },
        {
            plan_id: 5,
            plan_name: 'Koramangala Special',
            duration_days: 90,
            price: 9999,
            description: 'Exclusive access to Koramangala branch with premium amenities',
            is_active: true,
            branch_id: 3,
            branch_name: 'Koramangala Branch'
        },
        {
            plan_id: 6,
            plan_name: 'Weekend Warrior',
            duration_days: 30,
            price: 1999,
            description: 'Weekend-only access (Sat & Sun)',
            is_active: true,
            branch_id: null,
            branch_name: 'All Branches'
        },
        {
            plan_id: 7,
            plan_name: 'Student Plan',
            duration_days: 30,
            price: 1499,
            description: 'Special discounted plan for students with valid ID',
            is_active: false,
            branch_id: null,
            branch_name: 'All Branches'
        }
    ]);

    // Modal states
    const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [showFreezeModal, setShowFreezeModal] = useState(false);
    const [showFreezeDetailsModal, setShowFreezeDetailsModal] = useState(false);
    const [selectedFreeze, setSelectedFreeze] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isEditingPlan, setIsEditingPlan] = useState(false);

    // Form data
    const [renewalFormData, setRenewalFormData] = useState({
        plan_id: '',
        start_date: '',
        remarks: ''
    });

    const [freezeFormData, setFreezeFormData] = useState({
        reason: '',
        requested_days: '',
        start_date: ''
    });

    const [planFormData, setPlanFormData] = useState({
        plan_name: '',
        duration_days: '',
        price: '',
        description: '',
        is_active: true,
        branch_id: null
    });

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.phone.includes(searchQuery) ||
        sub.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.subscription_id.toString().includes(searchQuery)
    );

    // Filter freeze requests
    const filteredFreezeRequests = freezeRequests.filter(freeze =>
        freeze.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freeze.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freeze.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freeze.freeze_id.toString().includes(searchQuery)
    );

    // Filter plans
    const filteredPlans = membershipPlans.filter(plan =>
        plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.branch_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers for Subscriptions
    const handleViewSubscription = (subscription) => {
        setSelectedSubscription(subscription);
        setShowSubscriptionDetails(true);
    };

    const handleRenewSubscription = (subscription) => {
        setSelectedSubscription(subscription);
        setRenewalFormData({
            plan_id: subscription.plan_name,
            start_date: new Date().toISOString().split('T')[0],
            remarks: ''
        });
        setShowRenewalModal(true);
    };

    const handleFreezeSubscription = (subscription) => {
        setSelectedSubscription(subscription);
        setFreezeFormData({
            reason: '',
            requested_days: '',
            start_date: new Date().toISOString().split('T')[0]
        });
        setShowFreezeModal(true);
    };

    const handleCancelSubscription = (subscription) => {
        if (window.confirm(`Are you sure you want to cancel subscription for ${subscription.member_name}?`)) {
            setSubscriptions(subscriptions.map(sub =>
                sub.subscription_id === subscription.subscription_id
                    ? { ...sub, status: 'CANCELLED' }
                    : sub
            ));
            alert('Subscription cancelled successfully!');
        }
    };

    const handleRenewalSubmit = (e) => {
        e.preventDefault();
        alert('Subscription renewed successfully!');
        setShowRenewalModal(false);
        // Update subscription status
        setSubscriptions(subscriptions.map(sub =>
            sub.subscription_id === selectedSubscription.subscription_id
                ? { ...sub, status: 'ACTIVE', renewal_count: sub.renewal_count + 1 }
                : sub
        ));
    };

    const handleFreezeSubmit = (e) => {
        e.preventDefault();
        const newFreeze = {
            freeze_id: freezeRequests.length + 1,
            subscription_id: selectedSubscription.subscription_id,
            member_id: selectedSubscription.member_id,
            member_name: selectedSubscription.member_name,
            branch_name: selectedSubscription.branch_name,
            plan_name: selectedSubscription.plan_name,
            reason: freezeFormData.reason,
            requested_days: parseInt(freezeFormData.requested_days),
            start_date: freezeFormData.start_date,
            end_date: new Date(new Date(freezeFormData.start_date).getTime() + parseInt(freezeFormData.requested_days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            freeze_status: 'REQUESTED',
            created_at: new Date().toISOString().replace('T', ' ').split('.')[0]
        };
        setFreezeRequests([newFreeze, ...freezeRequests]);
        setSubscriptions(subscriptions.map(sub =>
            sub.subscription_id === selectedSubscription.subscription_id
                ? { ...sub, freeze_status: 'REQUESTED' }
                : sub
        ));
        alert('Freeze request submitted successfully!');
        setShowFreezeModal(false);
    };

    // Handlers for Freeze Requests
    const handleViewFreezeDetails = (freeze) => {
        setSelectedFreeze(freeze);
        setShowFreezeDetailsModal(true);
    };

    const handleApproveFreeze = (freeze) => {
        if (window.confirm(`Approve freeze request for ${freeze.member_name}?`)) {
            setFreezeRequests(freezeRequests.map(f =>
                f.freeze_id === freeze.freeze_id
                    ? { ...f, freeze_status: 'APPROVED', approved_at: new Date().toISOString().replace('T', ' ').split('.')[0] }
                    : f
            ));
            setSubscriptions(subscriptions.map(sub =>
                sub.subscription_id === freeze.subscription_id
                    ? { ...sub, freeze_status: 'APPROVED', freeze_days: freeze.requested_days }
                    : sub
            ));
            alert('Freeze request approved!');
        }
    };

    const handleRejectFreeze = (freeze) => {
        if (window.confirm(`Reject freeze request for ${freeze.member_name}?`)) {
            setFreezeRequests(freezeRequests.map(f =>
                f.freeze_id === freeze.freeze_id
                    ? { ...f, freeze_status: 'REJECTED' }
                    : f
            ));
            setSubscriptions(subscriptions.map(sub =>
                sub.subscription_id === freeze.subscription_id
                    ? { ...sub, freeze_status: 'NONE' }
                    : sub
            ));
            alert('Freeze request rejected!');
        }
    };

    const handleActivateFreeze = (freeze) => {
        if (window.confirm(`Activate freeze for ${freeze.member_name}?`)) {
            setFreezeRequests(freezeRequests.map(f =>
                f.freeze_id === freeze.freeze_id
                    ? { ...f, freeze_status: 'ACTIVE' }
                    : f
            ));
            setSubscriptions(subscriptions.map(sub =>
                sub.subscription_id === freeze.subscription_id
                    ? { ...sub, freeze_status: 'ACTIVE' }
                    : sub
            ));
            alert('Freeze activated successfully!');
        }
    };

    // Handlers for Plans
    const handleAddPlan = () => {
        setPlanFormData({
            plan_name: '',
            duration_days: '',
            price: '',
            description: '',
            is_active: true,
            branch_id: null
        });
        setIsEditingPlan(false);
        setShowPlanModal(true);
    };

    const handleEditPlan = (plan) => {
        setSelectedPlan(plan);
        setPlanFormData({
            plan_name: plan.plan_name,
            duration_days: plan.duration_days,
            price: plan.price,
            description: plan.description,
            is_active: plan.is_active,
            branch_id: plan.branch_id
        });
        setIsEditingPlan(true);
        setShowPlanModal(true);
    };

    const handleDeletePlan = (plan) => {
        if (window.confirm(`Are you sure you want to delete "${plan.plan_name}"?`)) {
            setMembershipPlans(membershipPlans.filter(p => p.plan_id !== plan.plan_id));
            alert('Plan deleted successfully!');
        }
    };

    const handleTogglePlanStatus = (plan) => {
        setMembershipPlans(membershipPlans.map(p =>
            p.plan_id === plan.plan_id
                ? { ...p, is_active: !p.is_active }
                : p
        ));
    };

    const handlePlanSubmit = (e) => {
        e.preventDefault();
        if (isEditingPlan) {
            setMembershipPlans(membershipPlans.map(p =>
                p.plan_id === selectedPlan.plan_id
                    ? { ...p, ...planFormData }
                    : p
            ));
            alert('Plan updated successfully!');
        } else {
            const newPlan = {
                plan_id: membershipPlans.length + 1,
                ...planFormData,
                branch_name: planFormData.branch_id ? 'Branch Specific' : 'All Branches'
            };
            setMembershipPlans([...membershipPlans, newPlan]);
            alert('Plan added successfully!');
        }
        setShowPlanModal(false);
    };

    // Get statistics
    const getStats = () => {
        const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
        const expiredCount = subscriptions.filter(s => s.status === 'EXPIRED').length;
        const freezeRequestsCount = freezeRequests.filter(f => f.freeze_status === 'REQUESTED').length;
        const activePlansCount = membershipPlans.filter(p => p.is_active).length;
        const totalRevenue = subscriptions
            .filter(s => s.status === 'ACTIVE')
            .reduce((sum, s) => sum + s.plan_price, 0);

        return { activeCount, expiredCount, freezeRequestsCount, activePlansCount, totalRevenue };
    };

    const stats = getStats();

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'status-active',
            'EXPIRED': 'status-expired',
            'SUSPENDED': 'status-suspended',
            'CANCELLED': 'status-cancelled',
            'REQUESTED': 'status-requested',
            'APPROVED': 'status-approved',
            'COMPLETED': 'status-completed',
            'REJECTED': 'status-rejected',
            'NONE': 'status-none'
        };
        return statusMap[status] || '';
    };

    return (
        <div className="subscription-management">
            {/* Header with Stats */}
            <div className="sub-header">
                <div>
                    <h1 className="sub-title">Subscription Management</h1>
                    <p className="sub-subtitle">Manage member subscriptions, freeze requests, and membership plans</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="sub-stats-bar">
                <div className="sub-stat-item">
                    <i className="fas fa-check-circle"></i>
                    <div>
                        <span className="sub-stat-label">Active Subscriptions</span>
                        <span className="sub-stat-value">{stats.activeCount}</span>
                    </div>
                </div>
                <div className="sub-stat-item">
                    <i className="fas fa-clock"></i>
                    <div>
                        <span className="sub-stat-label">Expired</span>
                        <span className="sub-stat-value">{stats.expiredCount}</span>
                    </div>
                </div>
                <div className="sub-stat-item">
                    <i className="fas fa-pause-circle"></i>
                    <div>
                        <span className="sub-stat-label">Pending Freezes</span>
                        <span className="sub-stat-value">{stats.freezeRequestsCount}</span>
                    </div>
                </div>
                <div className="sub-stat-item">
                    <i className="fas fa-tags"></i>
                    <div>
                        <span className="sub-stat-label">Active Plans</span>
                        <span className="sub-stat-value">{stats.activePlansCount}</span>
                    </div>
                </div>
                <div className="sub-stat-item">
                    <i className="fas fa-rupee-sign"></i>
                    <div>
                        <span className="sub-stat-label">Total Revenue</span>
                        <span className="sub-stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sub-tabs">
                <button
                    className={`sub-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscriptions')}
                >
                    <i className="fas fa-users"></i>
                    Subscriptions
                </button>
                <button
                    className={`sub-tab ${activeTab === 'freezes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('freezes')}
                >
                    <i className="fas fa-pause-circle"></i>
                    Freeze Requests
                    {stats.freezeRequestsCount > 0 && (
                        <span className="sub-badge">{stats.freezeRequestsCount}</span>
                    )}
                </button>
                <button
                    className={`sub-tab ${activeTab === 'plans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plans')}
                >
                    <i className="fas fa-tags"></i>
                    Membership Plans
                </button>
            </div>

            {/* Search Bar */}
            <div className="sub-search-section">
                <div className="sub-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder={
                            activeTab === 'subscriptions' ? 'Search by name, email, phone, plan...' :
                            activeTab === 'freezes' ? 'Search freeze requests...' :
                            'Search membership plans...'
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="sub-clear-search" onClick={() => setSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                {activeTab === 'plans' && (
                    <button className="sub-add-btn" onClick={handleAddPlan}>
                        <i className="fas fa-plus"></i>
                        Add New Plan
                    </button>
                )}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'subscriptions' && (
                <div className="sub-table-container">
                    <table className="sub-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Member Details</th>
                                <th>Plan Details</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Freeze Status</th>
                                <th>Renewals</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="sub-no-data">
                                        <i className="fas fa-inbox"></i>
                                        <p>No subscriptions found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((subscription) => (
                                    <tr key={subscription.subscription_id}>
                                        <td>#{subscription.subscription_id}</td>
                                        <td>
                                            <div className="sub-member-info">
                                                <strong>{subscription.member_name}</strong>
                                                <span>{subscription.email}</span>
                                                <span>{subscription.phone}</span>
                                                <span className="sub-branch-tag">{subscription.branch_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="sub-plan-info">
                                                <strong>{subscription.plan_name}</strong>
                                                <span>₹{subscription.plan_price.toLocaleString('en-IN')}</span>
                                                {subscription.trainer_name && (
                                                    <span className="sub-trainer">Trainer: {subscription.trainer_name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="sub-date-info">
                                                <span>{subscription.start_date}</span>
                                                <span>to</span>
                                                <span>{subscription.end_date}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`sub-status-badge ${getStatusBadgeClass(subscription.status)}`}>
                                                {subscription.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`sub-status-badge ${getStatusBadgeClass(subscription.freeze_status)}`}>
                                                {subscription.freeze_status}
                                            </span>
                                            {subscription.freeze_days > 0 && (
                                                <span className="sub-freeze-days">{subscription.freeze_days} days</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="sub-renewal-count">{subscription.renewal_count}x</span>
                                        </td>
                                        <td>
                                            <div className="sub-action-buttons">
                                                <button
                                                    className="sub-action-btn view"
                                                    onClick={() => handleViewSubscription(subscription)}
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    className="sub-action-btn renew"
                                                    onClick={() => handleRenewSubscription(subscription)}
                                                    title="Renew"
                                                    disabled={subscription.status === 'CANCELLED'}
                                                >
                                                    <i className="fas fa-redo"></i>
                                                </button>
                                                <button
                                                    className="sub-action-btn freeze"
                                                    onClick={() => handleFreezeSubscription(subscription)}
                                                    title="Freeze"
                                                    disabled={subscription.status !== 'ACTIVE' || subscription.freeze_status !== 'NONE'}
                                                >
                                                    <i className="fas fa-pause"></i>
                                                </button>
                                                <button
                                                    className="sub-action-btn cancel"
                                                    onClick={() => handleCancelSubscription(subscription)}
                                                    title="Cancel"
                                                    disabled={subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED'}
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

            {activeTab === 'freezes' && (
                <div className="sub-table-container">
                    <table className="sub-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Member Details</th>
                                <th>Plan</th>
                                <th>Reason</th>
                                <th>Duration</th>
                                <th>Freeze Period</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFreezeRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="sub-no-data">
                                        <i className="fas fa-inbox"></i>
                                        <p>No freeze requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredFreezeRequests.map((freeze) => (
                                    <tr key={freeze.freeze_id}>
                                        <td>#{freeze.freeze_id}</td>
                                        <td>
                                            <div className="sub-member-info">
                                                <strong>{freeze.member_name}</strong>
                                                <span className="sub-branch-tag">{freeze.branch_name}</span>
                                            </div>
                                        </td>
                                        <td>{freeze.plan_name}</td>
                                        <td>
                                            <div className="sub-reason">
                                                {freeze.reason.length > 50 ? freeze.reason.substring(0, 50) + '...' : freeze.reason}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="sub-duration-badge">{freeze.requested_days} days</span>
                                        </td>
                                        <td>
                                            <div className="sub-date-info">
                                                <span>{freeze.start_date}</span>
                                                <span>to</span>
                                                <span>{freeze.end_date}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`sub-status-badge ${getStatusBadgeClass(freeze.freeze_status)}`}>
                                                {freeze.freeze_status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="sub-action-buttons">
                                                <button
                                                    className="sub-action-btn view"
                                                    onClick={() => handleViewFreezeDetails(freeze)}
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                {freeze.freeze_status === 'REQUESTED' && (
                                                    <>
                                                        <button
                                                            className="sub-action-btn approve"
                                                            onClick={() => handleApproveFreeze(freeze)}
                                                            title="Approve"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button
                                                            className="sub-action-btn reject"
                                                            onClick={() => handleRejectFreeze(freeze)}
                                                            title="Reject"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </>
                                                )}
                                                {freeze.freeze_status === 'APPROVED' && (
                                                    <button
                                                        className="sub-action-btn activate"
                                                        onClick={() => handleActivateFreeze(freeze)}
                                                        title="Activate"
                                                    >
                                                        <i className="fas fa-play"></i>
                                                    </button>
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

            {activeTab === 'plans' && (
                <div className="sub-plans-grid">
                    {filteredPlans.length === 0 ? (
                        <div className="sub-no-data">
                            <i className="fas fa-inbox"></i>
                            <p>No membership plans found</p>
                        </div>
                    ) : (
                        filteredPlans.map((plan) => (
                            <div key={plan.plan_id} className={`sub-plan-card ${!plan.is_active ? 'inactive' : ''}`}>
                                <div className="sub-plan-header">
                                    <h3>{plan.plan_name}</h3>
                                    <span className={`sub-plan-status ${plan.is_active ? 'active' : 'inactive'}`}>
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="sub-plan-price">
                                    <span className="price">₹{plan.price.toLocaleString('en-IN')}</span>
                                    <span className="duration">{plan.duration_days} days</span>
                                </div>
                                <p className="sub-plan-description">{plan.description}</p>
                                <div className="sub-plan-branch">
                                    <i className="fas fa-map-marker-alt"></i>
                                    {plan.branch_name}
                                </div>
                                <div className="sub-plan-actions">
                                    <button
                                        className="sub-plan-action-btn edit"
                                        onClick={() => handleEditPlan(plan)}
                                    >
                                        <i className="fas fa-edit"></i>
                                        Edit
                                    </button>
                                    <button
                                        className="sub-plan-action-btn toggle"
                                        onClick={() => handleTogglePlanStatus(plan)}
                                    >
                                        <i className={`fas fa-${plan.is_active ? 'pause' : 'play'}`}></i>
                                        {plan.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        className="sub-plan-action-btn delete"
                                        onClick={() => handleDeletePlan(plan)}
                                    >
                                        <i className="fas fa-trash"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Subscription Details Modal */}
            {showSubscriptionDetails && selectedSubscription && (
                <div className="sub-modal-overlay" onClick={() => setShowSubscriptionDetails(false)}>
                    <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sub-modal-header">
                            <h2><i className="fas fa-id-card"></i> Subscription Details</h2>
                            <button className="sub-modal-close" onClick={() => setShowSubscriptionDetails(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="sub-modal-body">
                            <div className="sub-detail-section">
                                <h3><i className="fas fa-user"></i> Member Information</h3>
                                <div className="sub-detail-grid">
                                    <div className="sub-detail-item">
                                        <label>Name</label>
                                        <span>{selectedSubscription.member_name}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Email</label>
                                        <span>{selectedSubscription.email}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Phone</label>
                                        <span>{selectedSubscription.phone}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Branch</label>
                                        <span>{selectedSubscription.branch_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="sub-detail-section">
                                <h3><i className="fas fa-credit-card"></i> Plan Information</h3>
                                <div className="sub-detail-grid">
                                    <div className="sub-detail-item">
                                        <label>Plan Name</label>
                                        <span>{selectedSubscription.plan_name}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Price</label>
                                        <span>₹{selectedSubscription.plan_price.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Start Date</label>
                                        <span>{selectedSubscription.start_date}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>End Date</label>
                                        <span>{selectedSubscription.end_date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="sub-detail-section">
                                <h3><i className="fas fa-info-circle"></i> Status Information</h3>
                                <div className="sub-detail-grid">
                                    <div className="sub-detail-item">
                                        <label>Subscription Status</label>
                                        <span className={`sub-status-badge ${getStatusBadgeClass(selectedSubscription.status)}`}>
                                            {selectedSubscription.status}
                                        </span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Freeze Status</label>
                                        <span className={`sub-status-badge ${getStatusBadgeClass(selectedSubscription.freeze_status)}`}>
                                            {selectedSubscription.freeze_status}
                                        </span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Freeze Days</label>
                                        <span>{selectedSubscription.freeze_days} days</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Renewal Count</label>
                                        <span>{selectedSubscription.renewal_count} times</span>
                                    </div>
                                    {selectedSubscription.trainer_name && (
                                        <div className="sub-detail-item">
                                            <label>Personal Trainer</label>
                                            <span>{selectedSubscription.trainer_name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Renewal Modal */}
            {showRenewalModal && selectedSubscription && (
                <div className="sub-modal-overlay" onClick={() => setShowRenewalModal(false)}>
                    <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sub-modal-header">
                            <h2><i className="fas fa-redo"></i> Renew Subscription</h2>
                            <button className="sub-modal-close" onClick={() => setShowRenewalModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleRenewalSubmit} className="sub-modal-body">
                            <div className="sub-form-group">
                                <label>Member</label>
                                <input type="text" value={selectedSubscription.member_name} disabled />
                            </div>
                            <div className="sub-form-group">
                                <label>Current Plan</label>
                                <input type="text" value={`${selectedSubscription.plan_name} - ₹${selectedSubscription.plan_price}`} disabled />
                            </div>
                            <div className="sub-form-group">
                                <label>New Plan *</label>
                                <select
                                    value={renewalFormData.plan_id}
                                    onChange={(e) => setRenewalFormData({ ...renewalFormData, plan_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Plan</option>
                                    {membershipPlans.filter(p => p.is_active).map(plan => (
                                        <option key={plan.plan_id} value={plan.plan_id}>
                                            {plan.plan_name} - ₹{plan.price} ({plan.duration_days} days)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sub-form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    value={renewalFormData.start_date}
                                    onChange={(e) => setRenewalFormData({ ...renewalFormData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="sub-form-group">
                                <label>Remarks</label>
                                <textarea
                                    value={renewalFormData.remarks}
                                    onChange={(e) => setRenewalFormData({ ...renewalFormData, remarks: e.target.value })}
                                    rows="3"
                                    placeholder="Add any additional notes..."
                                />
                            </div>
                            <div className="sub-modal-actions">
                                <button type="button" className="sub-btn-secondary" onClick={() => setShowRenewalModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="sub-btn-primary">
                                    Renew Subscription
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Freeze Modal */}
            {showFreezeModal && selectedSubscription && (
                <div className="sub-modal-overlay" onClick={() => setShowFreezeModal(false)}>
                    <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sub-modal-header">
                            <h2><i className="fas fa-pause"></i> Request Freeze</h2>
                            <button className="sub-modal-close" onClick={() => setShowFreezeModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleFreezeSubmit} className="sub-modal-body">
                            <div className="sub-form-group">
                                <label>Member</label>
                                <input type="text" value={selectedSubscription.member_name} disabled />
                            </div>
                            <div className="sub-form-group">
                                <label>Plan</label>
                                <input type="text" value={selectedSubscription.plan_name} disabled />
                            </div>
                            <div className="sub-form-group">
                                <label>Reason for Freeze *</label>
                                <textarea
                                    value={freezeFormData.reason}
                                    onChange={(e) => setFreezeFormData({ ...freezeFormData, reason: e.target.value })}
                                    rows="3"
                                    placeholder="Please provide a reason for freeze request..."
                                    required
                                />
                            </div>
                            <div className="sub-form-group">
                                <label>Requested Days *</label>
                                <input
                                    type="number"
                                    value={freezeFormData.requested_days}
                                    onChange={(e) => setFreezeFormData({ ...freezeFormData, requested_days: e.target.value })}
                                    min="1"
                                    max="90"
                                    placeholder="Enter number of days (1-90)"
                                    required
                                />
                            </div>
                            <div className="sub-form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    value={freezeFormData.start_date}
                                    onChange={(e) => setFreezeFormData({ ...freezeFormData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="sub-modal-actions">
                                <button type="button" className="sub-btn-secondary" onClick={() => setShowFreezeModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="sub-btn-primary">
                                    Submit Freeze Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Freeze Details Modal */}
            {showFreezeDetailsModal && selectedFreeze && (
                <div className="sub-modal-overlay" onClick={() => setShowFreezeDetailsModal(false)}>
                    <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sub-modal-header">
                            <h2><i className="fas fa-pause-circle"></i> Freeze Request Details</h2>
                            <button className="sub-modal-close" onClick={() => setShowFreezeDetailsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="sub-modal-body">
                            <div className="sub-detail-section">
                                <h3><i className="fas fa-user"></i> Member Information</h3>
                                <div className="sub-detail-grid">
                                    <div className="sub-detail-item">
                                        <label>Name</label>
                                        <span>{selectedFreeze.member_name}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Branch</label>
                                        <span>{selectedFreeze.branch_name}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Plan</label>
                                        <span>{selectedFreeze.plan_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="sub-detail-section">
                                <h3><i className="fas fa-info-circle"></i> Freeze Information</h3>
                                <div className="sub-detail-grid">
                                    <div className="sub-detail-item">
                                        <label>Reason</label>
                                        <span>{selectedFreeze.reason}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Requested Days</label>
                                        <span>{selectedFreeze.requested_days} days</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Start Date</label>
                                        <span>{selectedFreeze.start_date}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>End Date</label>
                                        <span>{selectedFreeze.end_date}</span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Status</label>
                                        <span className={`sub-status-badge ${getStatusBadgeClass(selectedFreeze.freeze_status)}`}>
                                            {selectedFreeze.freeze_status}
                                        </span>
                                    </div>
                                    <div className="sub-detail-item">
                                        <label>Requested On</label>
                                        <span>{selectedFreeze.created_at}</span>
                                    </div>
                                    {selectedFreeze.approved_at && (
                                        <div className="sub-detail-item">
                                            <label>Approved On</label>
                                            <span>{selectedFreeze.approved_at}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Add/Edit Modal */}
            {showPlanModal && (
                <div className="sub-modal-overlay" onClick={() => setShowPlanModal(false)}>
                    <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sub-modal-header">
                            <h2>
                                <i className={`fas fa-${isEditingPlan ? 'edit' : 'plus'}`}></i>
                                {isEditingPlan ? 'Edit Plan' : 'Add New Plan'}
                            </h2>
                            <button className="sub-modal-close" onClick={() => setShowPlanModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handlePlanSubmit} className="sub-modal-body">
                            <div className="sub-form-group">
                                <label>Plan Name *</label>
                                <input
                                    type="text"
                                    value={planFormData.plan_name}
                                    onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                                    placeholder="e.g., Premium Annual"
                                    required
                                />
                            </div>
                            <div className="sub-form-row">
                                <div className="sub-form-group">
                                    <label>Duration (Days) *</label>
                                    <input
                                        type="number"
                                        value={planFormData.duration_days}
                                        onChange={(e) => setPlanFormData({ ...planFormData, duration_days: e.target.value })}
                                        min="1"
                                        placeholder="e.g., 365"
                                        required
                                    />
                                </div>
                                <div className="sub-form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={planFormData.price}
                                        onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g., 24999"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="sub-form-group">
                                <label>Description *</label>
                                <textarea
                                    value={planFormData.description}
                                    onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                                    rows="3"
                                    placeholder="Describe the plan features and benefits..."
                                    required
                                />
                            </div>
                            <div className="sub-form-group">
                                <label>Branch (Optional)</label>
                                <select
                                    value={planFormData.branch_id || ''}
                                    onChange={(e) => setPlanFormData({ ...planFormData, branch_id: e.target.value || null })}
                                >
                                    <option value="">All Branches</option>
                                    <option value="1">Bangalore Main</option>
                                    <option value="2">Whitefield Branch</option>
                                    <option value="3">Koramangala Branch</option>
                                </select>
                            </div>
                            <div className="sub-form-group">
                                <label className="sub-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={planFormData.is_active}
                                        onChange={(e) => setPlanFormData({ ...planFormData, is_active: e.target.checked })}
                                    />
                                    <span>Plan is active</span>
                                </label>
                            </div>
                            <div className="sub-modal-actions">
                                <button type="button" className="sub-btn-secondary" onClick={() => setShowPlanModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="sub-btn-primary">
                                    {isEditingPlan ? 'Update Plan' : 'Add Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
