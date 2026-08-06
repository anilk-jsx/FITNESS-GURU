import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tokenManager } from '../utils/tokenManager';
import InvoiceModal from './InvoiceModal';
import './SubscriptionManagement.css';

const ALLOWED_ENTITLEMENTS = [
    'GYM_ACCESS',
    'PT_1ON1',
    'GROUP_CLASS',
    'FACILITY_SAUNA',
    'FACILITY_STEAM_BATH',
    'ACCESS_WORKOUT_PLANS',
    'ACCESS_DIET_PLANS',
    'ACCESS_ASSESSMENTS',
    'ACCESS_NUTRITION_GUIDE'
];

const ENTITLEMENT_LABELS = {
    'GYM_ACCESS': 'Gym Access',
    'PT_1ON1': 'Personal Training (1-on-1)',
    'GROUP_CLASS': 'Group Classes',
    'FACILITY_SAUNA': 'Sauna Access',
    'FACILITY_STEAM_BATH': 'Steam Bath Access',
    'ACCESS_WORKOUT_PLANS': 'Workout Plans Access',
    'ACCESS_DIET_PLANS': 'Diet Plans Access',
    'ACCESS_ASSESSMENTS': 'Fitness Assessments',
    'ACCESS_NUTRITION_GUIDE': 'Nutrition Guide Access'
};

const formatEntitlementType = (type) => {
    return ENTITLEMENT_LABELS[type] || (type ? type.replace(/_/g, ' ') : '');
};

const PLAN_TYPES = [
    { label: 'Base Membership', value: 'BASE_MEMBERSHIP' },
    { label: 'PT Upgrade', value: 'PT_UPGRADE' },
    { label: 'Add-On', value: 'ADD_ON' }
];

const SubscriptionManagement = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

    // Role Guard Check
    const userData = tokenManager.getUserData();
    const isAuthorized = userData && (userData.role === 'ADMIN' || userData.role === 'SUPER-ADMIN' || userData.role === 'SUPER_ADMIN');

    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'subscriptions');

    useEffect(() => {
        if (tabParam && (tabParam === 'subscriptions' || tabParam === 'plans')) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
        setActiveTab(tab);
    };

    // Shared loading / message state
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // ==========================================
    // SCREEN 1 STATE: MEMBERSHIP PLANS
    // ==========================================
    const [plans, setPlans] = useState([]);
    const [planTypeFilter, setPlanTypeFilter] = useState('');
    const [planStatusFilter, setPlanStatusFilter] = useState('ALL'); // 'ALL', '1', '0'
    const [planSearchQuery, setPlanSearchQuery] = useState('');

    // Modal / Drawer state for Plan Create/Edit
    const [showPlanDrawer, setShowPlanDrawer] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null); // null for create
    const [planFormData, setPlanFormData] = useState({
        plan_name: '',
        plan_type: 'BASE_MEMBERSHIP',
        duration_months: 12,
        price: '',
        requires_membership: 0,
        status: 1,
        entitlements: []
    });

    // Entitlement Management Modal State (standalone endpoint API 6 / 7)
    const [showEntitlementModal, setShowEntitlementModal] = useState(false);
    const [selectedPlanForEntitlements, setSelectedPlanForEntitlements] = useState(null);
    const [entitlementsManageList, setEntitlementsManageList] = useState([]);

    // ==========================================
    // SCREEN 2 STATE: SUBSCRIPTIONS
    // ==========================================
    const [subscriptions, setSubscriptions] = useState([]);
    const [subStats, setSubStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [subStatusFilter, setSubStatusFilter] = useState('ALL'); // 'ALL', '1', '0', 'EXPIRING', '2'
    const [subPlanFilter, setSubPlanFilter] = useState('');
    const [subUserIdFilter, setSubUserIdFilter] = useState('');
    const [subSearchQuery, setSubSearchQuery] = useState('');
    const [expandedSubId, setExpandedSubId] = useState(null); // Expand wallet credits row ledger

    // Invoice View Modal state
    const [activeInvoiceId, setActiveInvoiceId] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    // Modal 2.2: Manual Subscription Provisioning Desk
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [membersList, setMembersList] = useState([]);
    const [branchesList, setBranchesList] = useState([]);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [provisionFormData, setProvisionFormData] = useState({
        user_id: '',
        plan_id: '',
        branch_id: '',
        start_date: '',
        payment_method: 'CASH',
        transaction_ref: ''
    });

    // Modal 2.3: Subscription Lifecycle Revision Panel
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);
    const [revisionFormData, setRevisionFormData] = useState({
        start_date: '',
        end_date: '',
        status: 1
    });

    // Flash message helper
    const showNotice = (msg, isErr = false) => {
        if (isErr) {
            setError(msg);
            setTimeout(() => setError(null), 5000);
        } else {
            setSuccessMessage(msg);
            setTimeout(() => setSuccessMessage(null), 4000);
        }
    };

    // ==========================================
    // API CALLS: MEMBERSHIP PLANS
    // ==========================================
    const fetchMembershipPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            if (planTypeFilter) queryParams.append('plan_type', planTypeFilter);
            if (planStatusFilter !== 'ALL') queryParams.append('status', planStatusFilter);

            const url = `${API_BASE_URL}/api/membership-plans?${queryParams.toString()}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                setPlans(data.data || []);
            } else {
                throw new Error(data.message || 'Failed to fetch membership plans');
            }
        } catch (err) {
            console.error('Error fetching plans:', err);
            setError(err.message || 'Failed to connect to backend server');
        } finally {
            setLoading(false);
        }
    };

    // API 3 & API 4: Create or Update Membership Plan
    const handleSavePlan = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        // Validation: required fields & entitlement checks
        if (!planFormData.plan_name.trim()) {
            showNotice('Plan Name is required', true);
            setActionLoading(false);
            return;
        }

        if (!planFormData.price || parseFloat(planFormData.price) <= 0) {
            showNotice('Please enter a valid price', true);
            setActionLoading(false);
            return;
        }

        // Validate entitlements: no duplicate types & quantity > 0
        const typesSeen = new Set();
        for (const ent of planFormData.entitlements) {
            if (!ent.entitlement_type) {
                showNotice('All entitlement rows must select a valid type', true);
                setActionLoading(false);
                return;
            }
            if (typesSeen.has(ent.entitlement_type)) {
                showNotice(`Duplicate entitlement type found: ${formatEntitlementType(ent.entitlement_type)}`, true);
                setActionLoading(false);
                return;
            }
            typesSeen.add(ent.entitlement_type);

            if (parseInt(ent.quantity) < 1 || parseInt(ent.valid_days) < 1) {
                showNotice(`Quantity and Valid Days must be at least 1 for ${formatEntitlementType(ent.entitlement_type)}`, true);
                setActionLoading(false);
                return;
            }
        }

        try {
            const isEdit = !!editingPlan;
            const url = isEdit
                ? `${API_BASE_URL}/api/admin/membership-plans/${editingPlan.plan_id}`
                : `${API_BASE_URL}/api/admin/membership-plans`;

            const method = isEdit ? 'PUT' : 'POST';

            const payload = {
                plan_name: planFormData.plan_name.trim(),
                plan_type: planFormData.plan_type,
                duration_months: parseInt(planFormData.duration_months, 10),
                price: parseFloat(planFormData.price),
                requires_membership: parseInt(planFormData.requires_membership, 10),
                status: parseInt(planFormData.status, 10),
                entitlements: planFormData.entitlements.map(e => ({
                    entitlement_type: e.entitlement_type,
                    quantity: parseInt(e.quantity, 10),
                    valid_days: parseInt(e.valid_days, 10)
                }))
            };

            const res = await tokenManager.apiCall(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotice(isEdit ? 'Membership plan updated successfully!' : 'Membership plan created successfully!');
                setShowPlanDrawer(false);
                setEditingPlan(null);
                fetchMembershipPlans();
            } else {
                throw new Error(data.message || 'Failed to save membership plan');
            }
        } catch (err) {
            console.error('Error saving plan:', err);
            showNotice(err.message, true);
        } finally {
            setActionLoading(false);
        }
    };

    // API 5: Soft Delete / Deactivate Membership Plan
    const handleDeactivatePlan = async (plan) => {
        if (!window.confirm(`Are you sure you want to deactivate plan "${plan.plan_name}"?`)) return;

        setActionLoading(true);
        try {
            const url = `${API_BASE_URL}/api/admin/membership-plans/${plan.plan_id}`;
            const res = await tokenManager.apiCall(url, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotice(`Plan "${plan.plan_name}" deactivated successfully`);
                fetchMembershipPlans();
            } else {
                throw new Error(data.message || 'Failed to deactivate plan');
            }
        } catch (err) {
            console.error('Error deactivating plan:', err);
            showNotice(err.message, true);
        } finally {
            setActionLoading(false);
        }
    };

    // API 6: Save Entitlements Batch for Plan
    const handleSaveEntitlementsBatch = async () => {
        if (!selectedPlanForEntitlements) return;
        setActionLoading(true);

        try {
            const url = `${API_BASE_URL}/api/admin/membership-plans/${selectedPlanForEntitlements.plan_id}/entitlements`;
            const payload = {
                entitlements: entitlementsManageList.map(e => ({
                    entitlement_type: e.entitlement_type,
                    quantity: parseInt(e.quantity, 10),
                    valid_days: parseInt(e.valid_days, 10)
                }))
            };

            const res = await tokenManager.apiCall(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                showNotice('Plan entitlements updated successfully!');
                setShowEntitlementModal(false);
                fetchMembershipPlans();
            } else {
                throw new Error(data.message || 'Failed to update entitlements');
            }
        } catch (err) {
            console.error('Error updating entitlements:', err);
            showNotice(err.message, true);
        } finally {
            setActionLoading(false);
        }
    };

    // API 7: Delete Single Entitlement from Plan
    const handleDeleteSingleEntitlement = async (entType) => {
        if (!selectedPlanForEntitlements) return;
        if (!window.confirm(`Remove entitlement "${formatEntitlementType(entType)}" from plan?`)) return;

        setActionLoading(true);
        try {
            const url = `${API_BASE_URL}/api/admin/membership-plans/${selectedPlanForEntitlements.plan_id}/entitlements/${entType}`;
            const res = await tokenManager.apiCall(url, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotice(`Entitlement '${formatEntitlementType(entType)}' removed successfully`);
                setEntitlementsManageList(prev => prev.filter(item => item.entitlement_type !== entType));
                fetchMembershipPlans();
            } else {
                throw new Error(data.message || 'Failed to remove entitlement');
            }
        } catch (err) {
            console.error('Error removing entitlement:', err);
            showNotice(err.message, true);
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // API CALLS: SUBSCRIPTIONS
    // ==========================================
    const fetchSubscriptionStats = async () => {
        setLoadingStats(true);
        try {
            const url = `${API_BASE_URL}/api/admin/subscriptions/stats`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data) {
                setSubStats(data.data);
            }
        } catch (err) {
            console.error('Error fetching subscription stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchSubscriptions = async () => {
        setLoading(true);
        setError(null);
        fetchSubscriptionStats();
        try {
            const queryParams = new URLSearchParams();
            if (subStatusFilter !== 'ALL') queryParams.append('status', subStatusFilter);
            if (subPlanFilter) queryParams.append('plan_id', subPlanFilter);
            if (subUserIdFilter) queryParams.append('user_id', subUserIdFilter);

            const url = `${API_BASE_URL}/api/admin/subscriptions?${queryParams.toString()}`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                setSubscriptions(data.data || []);
            } else {
                throw new Error(data.message || 'Failed to fetch subscriptions');
            }
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
            setError(err.message || 'Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    // Fetch member users for Manual Provisioning auto-complete lookup
    const fetchMembersList = async () => {
        try {
            const url = `${API_BASE_URL}/api/users/list?role=MEMBER&limit=1000`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setMembersList(data.data || data.users || []);
            }
        } catch (err) {
            console.warn('Could not fetch members list for provision lookup:', err);
        }
    };

    // Fetch gym branch list for branch selection dropdown
    const fetchBranchesList = async () => {
        try {
            const url = `${API_BASE_URL}/api/gymBranchList?gym_id=1`;
            const res = await tokenManager.apiCall(url, { method: 'GET' });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                const fetched = data.data || data.branches || [];
                setBranchesList(fetched);
                if (fetched.length > 0) {
                    const firstId = String(fetched[0].branch_id || fetched[0].id || '');
                    setProvisionFormData(prev => ({
                        ...prev,
                        branch_id: prev.branch_id || firstId
                    }));
                }
            }
        } catch (err) {
            console.warn('Could not fetch branch list for provision lookup:', err);
        }
    };

    // API: Purchase Gym Membership Subscription (Admin)
    const handleProvisionSubscription = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        if (!provisionFormData.user_id) {
            showNotice('Please select a Member', true);
            setActionLoading(false);
            return;
        }

        if (!provisionFormData.plan_id) {
            showNotice('Please select a Membership Plan', true);
            setActionLoading(false);
            return;
        }

        try {
            const payload = {
                user_id: parseInt(provisionFormData.user_id, 10),
                plan_id: parseInt(provisionFormData.plan_id, 10),
                gym_id: 1,
                payment_method: provisionFormData.payment_method || 'CASH'
            };

            if (provisionFormData.branch_id) payload.branch_id = parseInt(provisionFormData.branch_id, 10);
            if (provisionFormData.start_date) payload.start_date = provisionFormData.start_date;
            if (provisionFormData.transaction_ref) payload.transaction_ref = provisionFormData.transaction_ref;

            // Try primary endpoint POST /api/admin/subscriptions/purchase
            let url = `${API_BASE_URL}/api/admin/subscriptions/purchase`;
            let res = await tokenManager.apiCall(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Fallback to POST /api/admin/subscriptions if primary returns 404
            if (res.status === 404) {
                url = `${API_BASE_URL}/api/admin/subscriptions`;
                res = await tokenManager.apiCall(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotice('Subscription purchased & invoice generated successfully!');
                setShowProvisionModal(false);
                const firstBranch = branchesList.length > 0 ? String(branchesList[0].branch_id || branchesList[0].id || '') : '';
                setProvisionFormData({
                    user_id: '',
                    plan_id: '',
                    branch_id: firstBranch,
                    start_date: '',
                    payment_method: 'CASH',
                    transaction_ref: ''
                });

                const invId = data.invoice_id || (data.data && data.data.invoice_id);
                if (invId) {
                    setActiveInvoiceId(invId);
                    setShowInvoice(true);
                }

                fetchSubscriptions();
            } else {
                throw new Error(data.message || 'Failed to purchase subscription');
            }
        } catch (err) {
            console.error('Error purchasing subscription:', err);
            showNotice(err.message, true);
        } finally {
            setActionLoading(false);
        }
    };

    // API 11: Update Subscription Lifecycle Dates & Status
    const handleUpdateSubscriptionRevision = async (e) => {
        e.preventDefault();
        if (!editingSubscription) return;
        setActionLoading(true);

        try {
            const url = `${API_BASE_URL}/api/admin/subscriptions/${editingSubscription.subscription_id}`;
            const payload = {
                start_date: revisionFormData.start_date,
                end_date: revisionFormData.end_date,
                status: parseInt(revisionFormData.status, 10)
            };

            const res = await tokenManager.apiCall(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotice('Subscription lifecycle updated successfully!');
                setShowRevisionModal(false);
                setEditingSubscription(null);
                fetchSubscriptions();
            } else {
                throw new Error(data.message || 'Failed to update subscription');
            }
        } catch (err) {
            console.error('Error updating subscription lifecycle:', err);
            showNotice(err.message, true);
        } finally {
            setActionLoading(false);
        }
    };

    // API 12: Cancel / Deactivate Subscription
    const handleCancelSubscription = async (sub) => {
        if (!window.confirm(`Are you sure you want to cancel subscription #${sub.subscription_id} for ${sub.member_name || 'this member'}?`)) return;

        setActionLoading(true);
        try {
            const url = `${API_BASE_URL}/api/admin/subscriptions/${sub.subscription_id}/cancel`;
            const res = await tokenManager.apiCall(url, { method: 'PATCH' });
            let data = await res.json().catch(() => ({}));

            // Fallback to DELETE if PATCH returns 404 or unsupported
            if (!res.ok && res.status === 404) {
                const deleteUrl = `${API_BASE_URL}/api/admin/subscriptions/${sub.subscription_id}`;
                const deleteRes = await tokenManager.apiCall(deleteUrl, { method: 'DELETE' });
                data = await deleteRes.json();
            }

            if (data.status === 'success' || res.ok) {
                showNotice(`Subscription #${sub.subscription_id} canceled & wallet credits revoked successfully!`);
                fetchSubscriptions();
            } else {
                throw new Error(data.message || 'Failed to cancel subscription');
            }
        } catch (err) {
            console.error('Error canceling subscription:', err);
            showNotice(err.message, true);
        } finally {
            setActionLoading(false);
        }
    };

    // Initial Load Hooks
    useEffect(() => {
        if (activeTab === 'plans') {
            fetchMembershipPlans();
        } else {
            fetchSubscriptions();
            fetchMembershipPlans(); // populate plan lookup in provisioning modal
            fetchMembersList();
            fetchBranchesList();
        }
    }, [activeTab, planTypeFilter, planStatusFilter, subStatusFilter, subPlanFilter, subUserIdFilter]);

    // ==========================================
    // FORM HELPERS & FACTORY HANDLERS
    // ==========================================
    const openProvisionModal = () => {
        const firstBranch = branchesList.length > 0 ? String(branchesList[0].branch_id || branchesList[0].id || '') : '';
        setProvisionFormData(prev => ({
            ...prev,
            branch_id: prev.branch_id || firstBranch
        }));
        setShowProvisionModal(true);
    };

    const openCreatePlanDrawer = () => {
        setEditingPlan(null);
        setPlanFormData({
            plan_name: '',
            plan_type: 'BASE_MEMBERSHIP',
            duration_months: 12,
            price: '',
            requires_membership: 0,
            status: 1,
            entitlements: [
                { entitlement_type: 'GYM_ACCESS', quantity: 365, valid_days: 365 }
            ]
        });
        setShowPlanDrawer(true);
    };

    const openEditPlanDrawer = (plan) => {
        setEditingPlan(plan);
        setPlanFormData({
            plan_name: plan.plan_name || '',
            plan_type: plan.plan_type || 'BASE_MEMBERSHIP',
            duration_months: plan.duration_months || 12,
            price: plan.price || '',
            requires_membership: plan.requires_membership ?? 0,
            status: plan.status ?? 1,
            entitlements: plan.entitlements ? JSON.parse(JSON.stringify(plan.entitlements)) : []
        });
        setShowPlanDrawer(true);
    };

    const openEntitlementManageModal = (plan) => {
        setSelectedPlanForEntitlements(plan);
        setEntitlementsManageList(plan.entitlements ? JSON.parse(JSON.stringify(plan.entitlements)) : []);
        setShowEntitlementModal(true);
    };

    const openRevisionModal = (sub) => {
        setEditingSubscription(sub);
        setRevisionFormData({
            start_date: sub.start_date || '',
            end_date: sub.end_date || '',
            status: sub.status ?? 1
        });
        setShowRevisionModal(true);
    };

    // Entitlement Factory Row Handlers (Plan Drawer)
    const handleAddEntitlementRow = () => {
        const unused = ALLOWED_ENTITLEMENTS.find(type =>
            !planFormData.entitlements.some(e => e.entitlement_type === type)
        ) || ALLOWED_ENTITLEMENTS[0];

        setPlanFormData(prev => ({
            ...prev,
            entitlements: [
                { entitlement_type: unused, quantity: 30, valid_days: 30, isNew: true },
                ...prev.entitlements
            ]
        }));
    };

    const handleUpdateEntitlementRow = (index, field, value) => {
        setPlanFormData(prev => {
            const updated = [...prev.entitlements];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, entitlements: updated };
        });
    };

    const handleRemoveEntitlementRow = (index) => {
        setPlanFormData(prev => ({
            ...prev,
            entitlements: prev.entitlements.filter((_, i) => i !== index)
        }));
    };

    // Entitlement Factory Row Handlers (Standalone Entitlements Modal)
    const handleAddManageEntitlementRow = () => {
        const unused = ALLOWED_ENTITLEMENTS.find(type =>
            !entitlementsManageList.some(e => e.entitlement_type === type)
        ) || ALLOWED_ENTITLEMENTS[0];

        setEntitlementsManageList(prev => [
            { entitlement_type: unused, quantity: 30, valid_days: 30, isNew: true },
            ...prev
        ]);
    };

    const handleUpdateManageEntitlementRow = (index, field, value) => {
        setEntitlementsManageList(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Filter calculations
    const filteredPlans = plans.filter(p =>
        p.plan_name.toLowerCase().includes(planSearchQuery.toLowerCase()) ||
        p.plan_type.toLowerCase().includes(planSearchQuery.toLowerCase())
    );

    const filteredSubscriptions = subscriptions.filter(sub => {
        const query = subSearchQuery.toLowerCase().trim();
        const memberName = (sub.member_name || '').toLowerCase();
        const memberEmail = (sub.member_email || '').toLowerCase();
        const memberPhone = (sub.member_phone || '');
        const planName = (sub.plan_name || sub.subscription_name || '').toLowerCase();
        const subIdStr = (sub.subscription_id || '').toString();
        const userIdStr = (sub.user_id || '').toString();

        const matchesQuery = !query ||
            memberName.includes(query) ||
            memberEmail.includes(query) ||
            memberPhone.includes(query) ||
            planName.includes(query) ||
            subIdStr.includes(query) ||
            userIdStr.includes(query);

        // Frontend Status Filter Logic
        let matchesStatus = true;
        const today = new Date().toISOString().split('T')[0];
        const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        if (subStatusFilter === '1' || subStatusFilter === 'ACTIVE') {
            matchesStatus = sub.status === 1 && (!sub.end_date || sub.end_date >= today);
        } else if (subStatusFilter === 'EXPIRING') {
            matchesStatus = sub.status === 1 && sub.end_date && sub.end_date >= today && sub.end_date <= in7Days;
        } else if (subStatusFilter === '0' || subStatusFilter === 'EXPIRED') {
            matchesStatus = sub.status === 0 || (sub.end_date && sub.end_date < today);
        } else if (subStatusFilter === '2' || subStatusFilter === 'FROZEN') {
            matchesStatus = sub.status === 2;
        }

        // Plan Filter Logic
        let matchesPlan = true;
        if (subPlanFilter) {
            matchesPlan = String(sub.plan_id) === String(subPlanFilter);
        }

        return matchesQuery && matchesStatus && matchesPlan;
    });

    const filteredMembersForLookup = membersList.filter(m => {
        const term = memberSearchTerm.toLowerCase();
        const name = `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.name || '';
        const email = m.email || '';
        const phone = m.phone || m.phone_number || '';
        return name.toLowerCase().includes(term) || email.toLowerCase().includes(term) || phone.includes(term);
    });

    // If unauthorized role, render access denied guardrail
    if (!isAuthorized) {
        return (
            <div className="sub-management-unauthorized">
                <div className="unauthorized-card">
                    <i className="fas fa-user-lock"></i>
                    <h2>Access Restricted</h2>
                    <p>You require <strong>ADMIN</strong> or <strong>SUPER-ADMIN</strong> permissions to access Membership Plans & Subscriptions Management.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="subscription-management">
            {/* Page Header */}
            <div className="sub-header">
                <div>
                    <h1 className="sub-title">Membership & Subscriptions Operations</h1>
                    <p className="sub-subtitle">Manage membership plans, entitlement features, and member subscription lifecycles</p>
                </div>
                <div className="sub-header-actions">
                    {activeTab === 'plans' ? (
                        <button className="sub-btn sub-btn-primary" onClick={openCreatePlanDrawer}>
                            <i className="fas fa-plus"></i> Create Membership Plan
                        </button>
                    ) : (
                        <button className="sub-btn sub-btn-primary" onClick={openProvisionModal}>
                            <i className="fas fa-user-plus"></i> Provision Member Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Floating Alert Toast Widget Container */}
            <div className="sub-alert-container">
                {error && (
                    <div className="sub-alert sub-alert-danger">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>&times;</button>
                    </div>
                )}
                {successMessage && (
                    <div className="sub-alert sub-alert-success">
                        <i className="fas fa-check-circle"></i>
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage(null)}>&times;</button>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="sub-tabs">
                <button
                    className={`sub-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => handleTabChange('subscriptions')}
                >
                    <i className="fas fa-id-card"></i>
                    Subscriptions Operations Desk
                    <span className="sub-tab-count">{subscriptions.length}</span>
                </button>
                <button
                    className={`sub-tab ${activeTab === 'plans' ? 'active' : ''}`}
                    onClick={() => handleTabChange('plans')}
                >
                    <i className="fas fa-tags"></i>
                    Subscriptions & Entitlements Catalog
                    <span className="sub-tab-count">{plans.length}</span>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: MEMBERSHIP PLANS CATALOG & WORKBENCH */}
            {/* ========================================================================= */}
            {activeTab === 'plans' && (
                <div className="plans-workbench">
                    {/* Filters & Search Toolbar */}
                    <div className="sub-filter-bar">
                        <div className="sub-search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search plans by name or type..."
                                value={planSearchQuery}
                                onChange={(e) => setPlanSearchQuery(e.target.value)}
                            />
                            {planSearchQuery && (
                                <button className="clear-btn" onClick={() => setPlanSearchQuery('')}>&times;</button>
                            )}
                        </div>

                        <div className="sub-filter-controls">
                            <select
                                value={planTypeFilter}
                                onChange={(e) => setPlanTypeFilter(e.target.value)}
                                className="sub-select"
                            >
                                <option value="">All Plan Types</option>
                                {PLAN_TYPES.map(pt => (
                                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                                ))}
                            </select>

                            <select
                                value={planStatusFilter}
                                onChange={(e) => setPlanStatusFilter(e.target.value)}
                                className="sub-select"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="1">Active Only</option>
                                <option value="0">Inactive Only</option>
                            </select>

                            <button className="sub-btn sub-btn-secondary" onClick={fetchMembershipPlans}>
                                <i className="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Plans Cards Grid */}
                    {loading ? (
                        <div className="sub-loading-container">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading Membership Plans & Entitlements...</p>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="sub-empty-state">
                            <i className="fas fa-box-open"></i>
                            <h3>No Membership Plans Found</h3>
                            <p>No plans match the selected filter criteria or none have been created yet.</p>
                            <button className="sub-btn sub-btn-primary" onClick={openCreatePlanDrawer}>
                                <i className="fas fa-plus"></i> Create First Plan
                            </button>
                        </div>
                    ) : (
                        <div className="plans-grid">
                            {filteredPlans.map(plan => (
                                <div key={plan.plan_id} className={`plan-card ${plan.status === 0 ? 'inactive-plan' : ''}`}>
                                    <div className="plan-card-header">
                                        <div>
                                            <span className={`plan-type-badge type-${plan.plan_type}`}>
                                                {plan.plan_type ? plan.plan_type.replace('_', ' ') : 'BASE'}
                                            </span>
                                            <h3 className="plan-title">{plan.plan_name}</h3>
                                        </div>
                                        <span className={`status-pill ${plan.status === 1 ? 'status-active' : 'status-inactive'}`}>
                                            {plan.status === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="plan-card-pricing">
                                        <span className="price-symbol">₹</span>
                                        <span className="price-amount">{parseFloat(plan.price).toLocaleString('en-IN')}</span>
                                        <span className="price-duration">/ {plan.duration_months} Months</span>
                                    </div>

                                    <div className="plan-meta-info">
                                        <span><i className="fas fa-layer-group"></i> Gym ID: {plan.gym_id || 1}</span>
                                        <span><i className="fas fa-building"></i> Branch ID: {plan.branch_id || 1}</span>
                                        <span>
                                            <i className="fas fa-lock"></i> Requires Base: {plan.requires_membership === 1 ? 'Yes' : 'No'}
                                        </span>
                                    </div>

                                    {/* Inline Entitlements Tags */}
                                    <div className="plan-entitlements-section">
                                        <div className="entitlements-header">
                                            <span>Configured Features & Entitlements</span>
                                            <button
                                                className="edit-entitlements-link"
                                                onClick={() => openEntitlementManageModal(plan)}
                                                title="Manage Entitlements API"
                                            >
                                                <i className="fas fa-cog"></i> Edit Array
                                            </button>
                                        </div>
                                        <div className="entitlements-tags-list">
                                            {plan.entitlements && plan.entitlements.length > 0 ? (
                                                plan.entitlements.map((ent, idx) => (
                                                    <span key={idx} className="entitlement-tag">
                                                        <i className="fas fa-check-circle"></i>
                                                        <strong>{formatEntitlementType(ent.entitlement_type)}</strong>
                                                        <span className="ent-qty">{ent.quantity} qty ({ent.valid_days}d)</span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="no-entitlements">No entitlements configured</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="plan-card-actions">
                                        <button className="sub-btn sub-btn-outline" onClick={() => openEditPlanDrawer(plan)}>
                                            <i className="fas fa-edit"></i> Edit Plan
                                        </button>
                                        {plan.status === 1 ? (
                                            <button className="sub-btn sub-btn-danger-outline" onClick={() => handleDeactivatePlan(plan)}>
                                                <i className="fas fa-ban"></i> Deactivate
                                            </button>
                                        ) : (
                                            <button className="sub-btn sub-btn-success-outline" onClick={() => openEditPlanDrawer(plan)}>
                                                <i className="fas fa-check"></i> Reactivate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: MASTER SUBSCRIPTIONS & OPERATIONS DESK */}
            {/* ========================================================================= */}
            {activeTab === 'subscriptions' && (
                <div className="subscriptions-workbench">
                    {/* Top Subscription Statistics Cards Grid */}
                    <div className="sub-stats-grid">
                        <div 
                            className={`sub-stat-card ${subStatusFilter === 'ALL' ? 'active-card' : ''}`}
                            onClick={() => setSubStatusFilter('ALL')}
                            title="Show All Subscriptions"
                        >
                            <div className="sub-stat-icon bg-sub-blue">
                                <i className="fas fa-id-card"></i>
                            </div>
                            <div className="sub-stat-details">
                                <span className="sub-stat-val">{subStats?.total_subscriptions ?? subscriptions.length}</span>
                                <span className="sub-stat-lbl">Total Subscriptions</span>
                            </div>
                        </div>

                        <div 
                            className={`sub-stat-card ${subStatusFilter === '1' || subStatusFilter === 'ACTIVE' ? 'active-card' : ''}`}
                            onClick={() => setSubStatusFilter(subStatusFilter === '1' || subStatusFilter === 'ACTIVE' ? 'ALL' : '1')}
                            title="Filter Active Subscriptions"
                        >
                            <div className="sub-stat-icon bg-sub-green">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="sub-stat-details">
                                <span className="sub-stat-val">{subStats?.active_subscriptions ?? 0}</span>
                                <span className="sub-stat-lbl">Active</span>
                            </div>
                        </div>

                        <div 
                            className={`sub-stat-card ${subStatusFilter === 'EXPIRING' ? 'active-card' : ''}`}
                            onClick={() => setSubStatusFilter(subStatusFilter === 'EXPIRING' ? 'ALL' : 'EXPIRING')}
                            title="Filter Expiring Soon (Next 7 Days)"
                        >
                            <div className="sub-stat-icon bg-sub-orange">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="sub-stat-details">
                                <span className="sub-stat-val">{subStats?.expiring_soon_subscriptions ?? 0}</span>
                                <span className="sub-stat-lbl">Expiring Soon</span>
                            </div>
                        </div>

                        <div 
                            className={`sub-stat-card ${subStatusFilter === '0' || subStatusFilter === 'EXPIRED' ? 'active-card' : ''}`}
                            onClick={() => setSubStatusFilter(subStatusFilter === '0' || subStatusFilter === 'EXPIRED' ? 'ALL' : '0')}
                            title="Filter Expired / Canceled Subscriptions"
                        >
                            <div className="sub-stat-icon bg-sub-red">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <div className="sub-stat-details">
                                <span className="sub-stat-val">{subStats?.expired_subscriptions ?? 0}</span>
                                <span className="sub-stat-lbl">Expired / Canceled</span>
                            </div>
                        </div>

                        <div 
                            className={`sub-stat-card ${subStatusFilter === '2' || subStatusFilter === 'FROZEN' ? 'active-card' : ''}`}
                            onClick={() => setSubStatusFilter(subStatusFilter === '2' || subStatusFilter === 'FROZEN' ? 'ALL' : '2')}
                            title="Filter Frozen Subscriptions"
                        >
                            <div className="sub-stat-icon bg-sub-purple">
                                <i className="fas fa-snowflake"></i>
                            </div>
                            <div className="sub-stat-details">
                                <span className="sub-stat-val">{subStats?.frozen_subscriptions ?? 0}</span>
                                <span className="sub-stat-lbl">Frozen</span>
                            </div>
                        </div>

                        <div className="sub-stat-card">
                            <div className="sub-stat-icon bg-sub-cyan">
                                <i className="fas fa-user-plus"></i>
                            </div>
                            <div className="sub-stat-details">
                                <span className="sub-stat-val">{subStats?.new_subscriptions_this_month ?? 0}</span>
                                <span className="sub-stat-lbl">New This Month</span>
                            </div>
                        </div>

                        <div className="sub-stat-card">
                            <div className="sub-stat-icon bg-sub-emerald">
                                <i className="fas fa-indian-rupee-sign"></i>
                            </div>
                            <div className="sub-stat-details">
                                <span className="sub-stat-val">₹{new Intl.NumberFormat('en-IN').format(subStats?.total_revenue ?? subStats?.total_subscription_revenue ?? 0)}</span>
                                <span className="sub-stat-lbl">Total Revenue</span>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar & Filters */}
                    <div className="sub-filter-bar">
                        <div className="sub-search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search by Member Name, Email, Phone, Plan, or Sub ID..."
                                value={subSearchQuery}
                                onChange={(e) => setSubSearchQuery(e.target.value)}
                            />
                            {subSearchQuery && (
                                <button className="clear-btn" onClick={() => setSubSearchQuery('')}>&times;</button>
                            )}
                        </div>

                        <div className="sub-filter-controls">
                            <select
                                value={subStatusFilter}
                                onChange={(e) => setSubStatusFilter(e.target.value)}
                                className="sub-select"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="1">Active Only</option>
                                <option value="EXPIRING">Expiring Soon (7 Days)</option>
                                <option value="0">Expired / Canceled Only</option>
                                <option value="2">Frozen Only</option>
                            </select>

                            <select
                                value={subPlanFilter}
                                onChange={(e) => setSubPlanFilter(e.target.value)}
                                className="sub-select"
                            >
                                <option value="">All Membership Plans</option>
                                {plans.map(p => (
                                    <option key={p.plan_id} value={p.plan_id}>{p.plan_name}</option>
                                ))}
                            </select>

                            <button className="sub-btn sub-btn-secondary" onClick={fetchSubscriptions}>
                                <i className="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Subscriptions Registry Table */}
                    {loading ? (
                        <div className="sub-loading-container">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading Active Subscriptions & Wallet Credits...</p>
                        </div>
                    ) : filteredSubscriptions.length === 0 ? (
                        <div className="sub-empty-state">
                            <i className="fas fa-user-slash"></i>
                            <h3>No Subscriptions Found</h3>
                            <p>No subscription records match your search filter criteria.</p>
                            <button className="sub-btn sub-btn-primary" onClick={openProvisionModal}>
                                <i className="fas fa-user-plus"></i> Provision New Subscription
                            </button>
                        </div>
                    ) : (
                        <div className="sub-table-container">
                            <table className="sub-table">
                                <thead>
                                    <tr>
                                        <th>Sub ID</th>
                                        <th>Member Details</th>
                                        <th>Plan Name</th>
                                        <th>Invoice / Receipt</th>
                                        <th>Plan Type</th>
                                        <th>Price & Duration</th>
                                        <th>Validity Period</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubscriptions.map(sub => {
                                        const isExpanded = expandedSubId === sub.subscription_id;
                                        const credits = sub.wallet_credits || [];

                                        // Robust Plan Information Resolution
                                        const matchedPlan = plans.find(p => String(p.plan_id) === String(sub.plan_id) || String(p.id) === String(sub.plan_id));

                                        const resolvedPlanName = sub.plan_name ||
                                            sub.subscription_name ||
                                            sub.plan?.plan_name ||
                                            sub.plan?.name ||
                                            sub.membership_plan?.plan_name ||
                                            sub.membership_plan?.name ||
                                            matchedPlan?.plan_name ||
                                            (sub.plan_id ? `Membership Plan #${sub.plan_id}` : 'Gold Annual PT + Diet Combo');

                                        const resolvedPlanType = sub.plan_type ||
                                            sub.plan?.plan_type ||
                                            sub.membership_plan?.plan_type ||
                                            matchedPlan?.plan_type ||
                                            'BASE_MEMBERSHIP';

                                        const resolvedPrice = sub.plan_price ??
                                            sub.price ??
                                            sub.plan?.price ??
                                            matchedPlan?.price ??
                                            0;

                                        const resolvedDuration = sub.duration_months ??
                                            sub.duration ??
                                            sub.plan?.duration_months ??
                                            matchedPlan?.duration_months ??
                                            0;

                                        const resolvedInvoiceId = sub.invoice_id || (sub.invoices && sub.invoices[0]?.invoice_id) || sub.subscription_id;
                                        const resolvedInvoiceNum = sub.invoice_number || (sub.invoices && sub.invoices[0]?.invoice_number);

                                        return (
                                            <React.Fragment key={sub.subscription_id}>
                                                <tr className={`sub-row ${isExpanded ? 'row-expanded' : ''}`}>
                                                    <td>
                                                        <span className="sub-id-badge">#{sub.subscription_id}</span>
                                                    </td>
                                                    <td>
                                                        <div className="member-cell">
                                                            <strong className="member-name">{sub.member_name || `User #${sub.user_id}`}</strong>
                                                            <span className="member-email">{sub.member_email || '—'}</span>
                                                            <span className="member-phone">{sub.member_phone || ''}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="plan-name-cell">
                                                            <i className="fas fa-certificate plan-icon"></i>
                                                            <strong className="plan-name-title">{resolvedPlanName}</strong>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {resolvedInvoiceNum ? (
                                                            <button
                                                                type="button"
                                                                className="sub-btn sub-btn-xs sub-btn-outline"
                                                                onClick={() => {
                                                                    setActiveInvoiceId(resolvedInvoiceId);
                                                                    setShowInvoice(true);
                                                                }}
                                                                title="View Tax Invoice"
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                                            >
                                                                <i className="fas fa-file-invoice" style={{ color: '#4f46e5' }}></i>
                                                                {resolvedInvoiceNum}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="sub-btn sub-btn-xs sub-btn-outline"
                                                                onClick={() => {
                                                                    setActiveInvoiceId(resolvedInvoiceId);
                                                                    setShowInvoice(true);
                                                                }}
                                                                title="View Tax Invoice"
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                                            >
                                                                <i className="fas fa-file-invoice" style={{ color: '#4f46e5' }}></i>
                                                                {`INV #${resolvedInvoiceId}`}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`plan-type-badge type-${resolvedPlanType}`}>
                                                            {resolvedPlanType ? resolvedPlanType.replace('_', ' ') : 'BASE'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="price-duration-cell">
                                                            <span className="price-amount-text">₹{parseFloat(resolvedPrice).toLocaleString('en-IN')}</span>
                                                            <span className="duration-months-text">{resolvedDuration} Months</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="date-cell">
                                                            <span><i className="far fa-calendar-alt"></i> <strong>Start:</strong> {sub.start_date || '—'}</span>
                                                            <span><i className="far fa-calendar-check"></i> <strong>End:</strong> {sub.end_date || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${sub.status === 1 ? 'status-active' : 'status-canceled'}`}>
                                                            {sub.status === 1 ? 'Active' : 'Canceled'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <button
                                                                className={`sub-btn sub-btn-xs ${isExpanded ? 'sub-btn-primary' : 'sub-btn-outline'}`}
                                                                onClick={() => setExpandedSubId(isExpanded ? null : sub.subscription_id)}
                                                                title="View Provisioned Wallet Credits"
                                                            >
                                                                <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-wallet'}`}></i>
                                                                {isExpanded ? ' Hide Wallet' : ` Wallet (${credits.length})`}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Wallet Credit Ledger Panel */}
                                                {isExpanded && (
                                                    <tr className="ledger-expanded-row">
                                                        <td colSpan="9">
                                                            <div className="ledger-drawer">
                                                                <div className="ledger-header">
                                                                    <div>
                                                                        <h4>
                                                                            <i className="fas fa-wallet"></i> Provisioned Client Wallet Credits Ledger
                                                                        </h4>
                                                                        <div className="ledger-plan-details" style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                            <span className={`plan-type-badge type-${resolvedPlanType}`}>
                                                                                {resolvedPlanType ? resolvedPlanType.replace('_', ' ') : 'BASE'}
                                                                            </span>
                                                                            <strong style={{ color: '#1e1b4b', fontSize: '0.95rem' }}>
                                                                                {resolvedPlanName}
                                                                            </strong>
                                                                            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>— ₹{parseFloat(resolvedPrice).toLocaleString('en-IN')} / {resolvedDuration}m</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="ledger-sub-meta">Subscription ID #{sub.subscription_id} | Member ID: {sub.user_id}</span>
                                                                </div>

                                                                {credits.length === 0 ? (
                                                                    <p className="no-credits-msg">No active wallet credits provisioned for this subscription.</p>
                                                                ) : (
                                                                    <div className="credits-grid">
                                                                        {credits.map((credit, cIdx) => (
                                                                            <div key={credit.credit_id || cIdx} className={`credit-card ${credit.status === 0 ? 'credit-revoked' : ''}`}>
                                                                                <div className="credit-card-header">
                                                                                    <span className="credit-type">{formatEntitlementType(credit.entitlement_type)}</span>
                                                                                    <span className={`credit-status ${credit.status === 1 ? 'active' : 'revoked'}`}>
                                                                                        {credit.status === 1 ? 'Active' : 'Revoked'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="credit-balances">
                                                                                    <div className="balance-item">
                                                                                        <span className="bal-label">Remaining:</span>
                                                                                        <span className="bal-val val-remaining">{credit.remaining_quantity}</span>
                                                                                    </div>
                                                                                    <div className="balance-divider">/</div>
                                                                                    <div className="balance-item">
                                                                                        <span className="bal-label">Original:</span>
                                                                                        <span className="bal-val val-original">{credit.original_quantity}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="credit-footer">
                                                                                    <span><i className="far fa-clock"></i> Expires: {credit.expiration_date || sub.end_date || 'N/A'}</span>
                                                                                    {credit.is_unlimited === 1 && (
                                                                                        <span className="unlimited-badge">Unlimited</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 1.2: UNIFIED PLAN CREATION & MODIFICATION DRAWER */}
            {/* ========================================================================= */}
            {showPlanDrawer && (
                <div className="sub-modal-overlay">
                    <div className="sub-modal-content plan-drawer-content">
                        <div className="sub-modal-header">
                            <h2>
                                <i className={`fas ${editingPlan ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                                {editingPlan ? 'Edit Membership Plan & Entitlements' : 'Create New Membership Plan'}
                            </h2>
                            <button className="close-btn" onClick={() => setShowPlanDrawer(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSavePlan} className="sub-modal-form">
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Plan Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gold Annual PT + Diet Combo"
                                        value={planFormData.plan_name}
                                        onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Plan Type <span className="req">*</span></label>
                                    <select
                                        value={planFormData.plan_type}
                                        onChange={(e) => setPlanFormData({ ...planFormData, plan_type: e.target.value })}
                                        required
                                    >
                                        {PLAN_TYPES.map(pt => (
                                            <option key={pt.value} value={pt.value}>{pt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Duration (Months) <span className="req">*</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={planFormData.duration_months}
                                        onChange={(e) => setPlanFormData({ ...planFormData, duration_months: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price (₹) <span className="req">*</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="15000.00"
                                        value={planFormData.price}
                                        onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={planFormData.status}
                                        onChange={(e) => setPlanFormData({ ...planFormData, status: parseInt(e.target.value, 10) })}
                                    >
                                        <option value={1}>1 - Active</option>
                                        <option value={0}>0 - Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={planFormData.requires_membership === 1}
                                        onChange={(e) => setPlanFormData({ ...planFormData, requires_membership: e.target.checked ? 1 : 0 })}
                                    />
                                    Requires Active Base Membership First
                                </label>
                            </div>

                            {/* DYNAMIC ENTITLEMENT FACTORY ARRAY */}
                            <div className="entitlement-factory-section">
                                <div className="factory-header">
                                    <h3>Configured Feature Entitlements</h3>
                                    <button
                                        type="button"
                                        className="sub-btn sub-btn-xs sub-btn-primary"
                                        onClick={handleAddEntitlementRow}
                                    >
                                        <i className="fas fa-plus"></i> Add Entitlement
                                    </button>
                                </div>

                                {planFormData.entitlements.length === 0 ? (
                                    <p className="no-factory-msg">No entitlements added. Click "+ Add Entitlement" to grant features.</p>
                                ) : (
                                    <div className="factory-rows-container">
                                        {planFormData.entitlements.map((ent, idx) => (
                                            <div key={ent.entitlement_type || idx} className={`factory-row ${ent.isNew ? 'newly-added-row' : ''}`}>
                                                <div className="factory-col col-type">
                                                    <label>Entitlement Type</label>
                                                    <select
                                                        value={ent.entitlement_type}
                                                        onChange={(e) => handleUpdateEntitlementRow(idx, 'entitlement_type', e.target.value)}
                                                    >
                                                        {ALLOWED_ENTITLEMENTS.map(type => (
                                                            <option key={type} value={type}>{formatEntitlementType(type)}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="factory-col col-qty">
                                                    <label>Quantity</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={ent.quantity}
                                                        onChange={(e) => handleUpdateEntitlementRow(idx, 'quantity', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="factory-col col-days">
                                                    <label>Valid Days</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={ent.valid_days}
                                                        onChange={(e) => handleUpdateEntitlementRow(idx, 'valid_days', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="factory-col col-action">
                                                    <label>&nbsp;</label>
                                                    <button
                                                        type="button"
                                                        className="remove-row-btn"
                                                        onClick={() => handleRemoveEntitlementRow(idx)}
                                                        title="Remove Row"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="sub-modal-footer">
                                <button type="button" className="sub-btn sub-btn-secondary" onClick={() => setShowPlanDrawer(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="sub-btn sub-btn-primary" disabled={actionLoading}>
                                    {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                    {editingPlan ? ' Update Membership Plan' : ' Save Membership Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 6/7: STANDALONE ENTITLEMENTS MANAGEMENT MODAL */}
            {/* ========================================================================= */}
            {showEntitlementModal && selectedPlanForEntitlements && (
                <div className="sub-modal-overlay">
                    <div className="sub-modal-content">
                        <div className="sub-modal-header">
                            <h2>
                                <i className="fas fa-cogs"></i> Manage Plan Entitlements
                            </h2>
                            <button className="close-btn" onClick={() => setShowEntitlementModal(false)}>&times;</button>
                        </div>

                        <div className="sub-modal-body">
                            <p className="modal-sub-info">
                                Modifying entitlements for: <strong>{selectedPlanForEntitlements.plan_name}</strong> (Plan ID: {selectedPlanForEntitlements.plan_id})
                            </p>

                            <div className="factory-header" style={{ marginTop: '1rem' }}>
                                <h3>Active Entitlements List</h3>
                                <button
                                    type="button"
                                    className="sub-btn sub-btn-xs sub-btn-primary"
                                    onClick={handleAddManageEntitlementRow}
                                >
                                    <i className="fas fa-plus"></i> Add Entitlement
                                </button>
                            </div>

                            <div className="factory-rows-container">
                                {entitlementsManageList.map((ent, idx) => (
                                    <div key={ent.entitlement_type || idx} className={`factory-row ${ent.isNew ? 'newly-added-row' : ''}`}>
                                        <div className="factory-col col-type">
                                            <label>Entitlement Type</label>
                                            <select
                                                value={ent.entitlement_type}
                                                onChange={(e) => handleUpdateManageEntitlementRow(idx, 'entitlement_type', e.target.value)}
                                            >
                                                {ALLOWED_ENTITLEMENTS.map(type => (
                                                    <option key={type} value={type}>{formatEntitlementType(type)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="factory-col col-qty">
                                            <label>Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={ent.quantity}
                                                onChange={(e) => handleUpdateManageEntitlementRow(idx, 'quantity', e.target.value)}
                                            />
                                        </div>

                                        <div className="factory-col col-days">
                                            <label>Valid Days</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={ent.valid_days}
                                                onChange={(e) => handleUpdateManageEntitlementRow(idx, 'valid_days', e.target.value)}
                                            />
                                        </div>

                                        <div className="factory-col col-action">
                                            <label>&nbsp;</label>
                                            <button
                                                type="button"
                                                className="remove-row-btn"
                                                onClick={() => handleDeleteSingleEntitlement(ent.entitlement_type)}
                                                title="Delete single entitlement from API"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sub-modal-footer">
                            <button className="sub-btn sub-btn-secondary" onClick={() => setShowEntitlementModal(false)}>
                                Close
                            </button>
                            <button
                                className="sub-btn sub-btn-primary"
                                onClick={handleSaveEntitlementsBatch}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                &nbsp;Save Entitlements Batch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2.2: MANUAL SUBSCRIPTION PROVISIONING DESK */}
            {/* ========================================================================= */}
            {showProvisionModal && (
                <div className="sub-modal-overlay">
                    <div className="sub-modal-content">
                        <div className="sub-modal-header">
                            <h2>
                                <i className="fas fa-user-plus"></i> Purchase Gym Membership Subscription
                            </h2>
                            <button className="close-btn" onClick={() => setShowProvisionModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleProvisionSubscription} className="sub-modal-form">
                            <p className="modal-sub-info">
                                Select a registered member user and membership plan to issue an active subscription and tax invoice.
                            </p>

                            {/* Member Search Lookup */}
                            <div className="form-group">
                                <label>Search Member User <span className="req">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Type member name, email, phone or User ID to filter..."
                                    value={memberSearchTerm}
                                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                                    style={{ marginBottom: '0.5rem' }}
                                />
                                <select
                                    value={provisionFormData.user_id}
                                    onChange={(e) => setProvisionFormData({ ...provisionFormData, user_id: e.target.value })}
                                    required
                                    size={filteredMembersForLookup.length > 0 ? Math.min(5, filteredMembersForLookup.length + 1) : 1}
                                    className="member-select-list"
                                >
                                    <option value="">-- Select Registered Member --</option>
                                    {filteredMembersForLookup.map(m => {
                                        const uid = m.user_id || m.id;
                                        const name = `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.name || `User #${uid}`;
                                        return (
                                            <option key={uid} value={uid}>
                                                #{uid} - {name} ({m.email || m.phone || 'Member'})
                                            </option>
                                        );
                                    })}
                                </select>
                                {membersList.length === 0 && (
                                    <small className="help-text">Directly enter numeric User ID if list is empty.</small>
                                )}
                            </div>

                            {/* Plan Catalog Dropdown */}
                            <div className="form-group">
                                <label>Membership Plan <span className="req">*</span></label>
                                <select
                                    value={provisionFormData.plan_id}
                                    onChange={(e) => setProvisionFormData({ ...provisionFormData, plan_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Active Membership Plan --</option>
                                    {plans.filter(p => p.status === 1).map(p => (
                                        <option key={p.plan_id} value={p.plan_id}>
                                            {p.plan_name} — ₹{parseFloat(p.price).toLocaleString('en-IN')} ({p.duration_months} Months)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Method & Transaction Reference */}
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={provisionFormData.payment_method}
                                        onChange={(e) => setProvisionFormData({ ...provisionFormData, payment_method: e.target.value })}
                                    >
                                        <option value="CASH">CASH</option>
                                        <option value="CARD">CARD</option>
                                        <option value="UPI">UPI</option>
                                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                                        <option value="ONLINE">ONLINE</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Transaction Reference <small>(Optional)</small></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TXN123456789"
                                        value={provisionFormData.transaction_ref}
                                        onChange={(e) => setProvisionFormData({ ...provisionFormData, transaction_ref: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Gym Branch Select Dropdown */}
                            <div className="form-group">
                                <label>Gym Branch <small>(Optional - auto-resolved if omitted)</small></label>
                                <select
                                    value={provisionFormData.branch_id}
                                    onChange={(e) => setProvisionFormData({ ...provisionFormData, branch_id: e.target.value })}
                                >
                                    <option value="">-- Select Gym Branch--</option>
                                    {branchesList.map(b => {
                                        const bId = b.branch_id || b.id;
                                        const bName = b.branch_name || b.name || `Branch #${bId}`;
                                        return (
                                            <option key={bId} value={bId}>
                                                {bName} {b.city_name ? `(${b.city_name})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Optional Start Date */}
                            <div className="form-group">
                                <label>Start Date <small>(Optional - defaults to today; end date auto-calculated from plan duration)</small></label>
                                <input
                                    type="date"
                                    value={provisionFormData.start_date}
                                    onChange={(e) => setProvisionFormData({ ...provisionFormData, start_date: e.target.value })}
                                />
                            </div>

                            <div className="sub-modal-footer">
                                <button type="button" className="sub-btn sub-btn-secondary" onClick={() => setShowProvisionModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="sub-btn sub-btn-primary" disabled={actionLoading}>
                                    {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-receipt"></i>}
                                    &nbsp;Proceed
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2.3: SUBSCRIPTION LIFECYCLE REVISION PANEL */}
            {/* ========================================================================= */}
            {showRevisionModal && editingSubscription && (
                <div className="sub-modal-overlay">
                    <div className="sub-modal-content">
                        <div className="sub-modal-header">
                            <h2>
                                <i className="fas fa-calendar-alt"></i> Subscription Lifecycle Revision Panel
                            </h2>
                            <button className="close-btn" onClick={() => setShowRevisionModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleUpdateSubscriptionRevision} className="sub-modal-form">
                            <p className="modal-sub-info">
                                Revising Subscription <strong>#{editingSubscription.subscription_id}</strong> for Member: <strong>{editingSubscription.member_name || editingSubscription.user_id}</strong>
                            </p>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Start Date <span className="req">*</span></label>
                                    <input
                                        type="date"
                                        value={revisionFormData.start_date}
                                        onChange={(e) => setRevisionFormData({ ...revisionFormData, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date <span className="req">*</span></label>
                                    <input
                                        type="date"
                                        value={revisionFormData.end_date}
                                        onChange={(e) => setRevisionFormData({ ...revisionFormData, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Subscription Status</label>
                                <select
                                    value={revisionFormData.status}
                                    onChange={(e) => setRevisionFormData({ ...revisionFormData, status: parseInt(e.target.value, 10) })}
                                >
                                    <option value={1}>1 - Active</option>
                                    <option value={0}>0 - Canceled / Inactive</option>
                                </select>
                            </div>

                            <div className="sub-modal-footer">
                                <button type="button" className="sub-btn sub-btn-secondary" onClick={() => setShowRevisionModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="sub-btn sub-btn-primary" disabled={actionLoading}>
                                    {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                    &nbsp;Save Revision & Adjust Credit Lifecycles
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tax Invoice Modal */}
            {showInvoice && activeInvoiceId && (
                <InvoiceModal
                    isOpen={showInvoice}
                    invoiceId={activeInvoiceId}
                    onClose={() => {
                        setShowInvoice(false);
                        setActiveInvoiceId(null);
                    }}
                />
            )}
        </div>
    );
};

export default SubscriptionManagement;
