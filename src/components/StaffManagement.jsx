import React, { useState, useEffect, useCallback } from 'react';
import './StaffManagement.css';
import { tokenManager } from '../utils/tokenManager';

const StaffManagement = () => {
    // Component State
    const [employees, setEmployees] = useState([]);
    const [gymBranches, setGymBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters and Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBranch, setFilterBranch] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDesignation, setFilterDesignation] = useState('ALL');
    const [filterEmploymentType, setFilterEmploymentType] = useState('ALL');
    const [trainersOnly, setTrainersOnly] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    // Modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Onboarding Form Type (STAFF or TRAINER)
    const [onboardType, setOnboardType] = useState('STAFF'); // STAFF, TRAINER

    // Form Data State
    const [formData, setFormData] = useState({
        branch_id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'STAFF',
        designation: 'RECEPTIONIST',
        employment_type: 'FULL_TIME',
        salary_type: 'MONTHLY',
        salary_amount: 0.00,
        joining_date: new Date().toISOString().split('T')[0],
        profile_photo: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        address: '',
        remarks: '',
        // Trainer Specific
        specialization: '',
        experience: 0,
        certifications: '',
        bio: '',
        showcase_photo: '',
        availability_status: 'AVAILABLE',
        rating: 0.0,
        instagram_url: '',
        facebook_url: '',
        linkedin_url: ''
    });

    // Form Documents State
    const [formDocuments, setFormDocuments] = useState([]); // Array of { id, type, name, number, url, isNew, isRemoved, isUpdated }
    const [newDocType, setNewDocType] = useState('AADHAAR');
    const [newDocName, setNewDocName] = useState('');
    const [newDocNumber, setNewDocNumber] = useState('');
    const [newDocUrl, setNewDocUrl] = useState('');
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    // Image upload states
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [showcaseImagePreview, setShowcaseImagePreview] = useState(null);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingShowcase, setIsUploadingShowcase] = useState(false);

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // Toast State
    const [toastMessage, setToastMessage] = useState({ type: '', message: '', show: false });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

    // Cloudinary details
    const CLOUDINARY_CLOUD_NAME = 'dbskq6d4i';
    const CLOUDINARY_UPLOAD_PRESET = 'trainer_uploads';

    // Toast helper
    const showToast = (message, type = 'info') => {
        setToastMessage({ type, message, show: true });
        setTimeout(() => {
            setToastMessage({ type: '', message: '', show: false });
        }, 4000);
    };

    // Fetch branches list
    const fetchGymBranches = useCallback(async () => {
        try {
            const url = `${API_BASE_URL}/api/gymBranchList?gym_id=1`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to load branches');
            const data = await response.json();
            if (data.status === 'success' && Array.isArray(data.data)) {
                setGymBranches(data.data);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, [API_BASE_URL]);

    // Fetch unified list of employees or trainers
    const fetchEmployeesList = useCallback(async (page = 1) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = tokenManager.getAccessToken();
            if (!token) {
                setError('Authentication required');
                setIsLoading(false);
                return;
            }

            // Decide which directory to fetch from based on filter
            const path = trainersOnly ? '/api/trainers' : '/api/employees';
            let url = `${API_BASE_URL}${path}?page=${page}&limit=${itemsPerPage}`;

            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            if (filterBranch !== 'ALL') {
                const branchObj = gymBranches.find(b => b.branch_name === filterBranch);
                if (branchObj) url += `&branch_id=${branchObj.branch_id}`;
            }
            if (filterStatus !== 'ALL') url += `&status=${filterStatus}`;
            
            if (!trainersOnly) {
                if (filterDesignation !== 'ALL') url += `&designation=${filterDesignation}`;
                if (filterEmploymentType !== 'ALL') url += `&employment_type=${filterEmploymentType}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                setEmployees(data.data || []);
                setCurrentPage(data.page || page);
                setTotalItems(data.total || 0);
                setTotalPages(Math.ceil((data.total || 0) / itemsPerPage) || 1);
            } else {
                throw new Error(data.message || 'Failed to fetch directory');
            }
        } catch (err) {
            console.error('Error loading employee directory:', err);
            setError(err.message || 'Failed to fetch employees list');
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL, trainersOnly, searchQuery, filterBranch, filterStatus, filterDesignation, filterEmploymentType, gymBranches, itemsPerPage]);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            await fetchGymBranches();
        };
        loadInitialData();
    }, [fetchGymBranches]);

    // Refresh list when filters, page or search query changes
    useEffect(() => {
        fetchEmployeesList(currentPage);
    }, [fetchEmployeesList, currentPage, trainersOnly]);

    // Reset page to 1 when filter parameters change
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    // Cloudinary upload logic
    const uploadToCloudinary = async (file) => {
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: uploadData }
            );

            const result = await response.json();
            if (result.secure_url) {
                return result.secure_url;
            } else {
                throw new Error(result.error?.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Cloudinary error:', err);
            showToast(`❌ Upload failed: ${err.message}`, 'error');
            return null;
        }
    };

    // Upload profile photo
    const handleProfilePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploadingProfile(true);
        setProfileImagePreview(URL.createObjectURL(file));

        const url = await uploadToCloudinary(file);
        setIsUploadingProfile(false);
        if (url) {
            setFormData(prev => ({ ...prev, profile_photo: url }));
            showToast('✅ Profile photo uploaded successfully', 'success');
        } else {
            setProfileImagePreview(null);
        }
    };

    // Upload showcase photo (trainer specific)
    const handleShowcasePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingShowcase(true);
        setShowcaseImagePreview(URL.createObjectURL(file));

        const url = await uploadToCloudinary(file);
        setIsUploadingShowcase(false);
        if (url) {
            setFormData(prev => ({ ...prev, showcase_photo: url }));
            showToast('✅ Trainer showcase photo uploaded successfully', 'success');
        } else {
            setShowcaseImagePreview(null);
        }
    };

    // Upload document helper
    const handleDocFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingDoc(true);
        showToast('📄 Uploading document...', 'info');

        const url = await uploadToCloudinary(file);
        setIsUploadingDoc(false);
        if (url) {
            setNewDocUrl(url);
            if (!newDocName) {
                setNewDocName(file.name.split('.')[0]);
            }
            showToast('✅ Document uploaded successfully', 'success');
        }
    };

    // Add document to list
    const handleAddDocumentToList = () => {
        if (!newDocUrl) {
            showToast('⚠️ Please upload a document file first', 'warning');
            return;
        }
        if (!newDocName) {
            showToast('⚠️ Please enter a document name', 'warning');
            return;
        }

        const newDoc = {
            id: Date.now(), // Temporary ID for list rendering
            document_type: newDocType,
            document_name: newDocName,
            document_number: newDocNumber,
            document_url: newDocUrl,
            isNew: true
        };

        setFormDocuments(prev => [...prev, newDoc]);
        
        // Reset doc inputs
        setNewDocName('');
        setNewDocNumber('');
        setNewDocUrl('');
        showToast('➕ Document added to checklist', 'success');
    };

    // Remove document from list
    const handleRemoveDocument = (doc) => {
        if (doc.isNew) {
            // Simply remove from array
            setFormDocuments(prev => prev.filter(d => d.id !== doc.id));
        } else {
            // Mark for REMOVE on save
            setFormDocuments(prev =>
                prev.map(d => (d.document_id === doc.document_id ? { ...d, isRemoved: true } : d))
            );
        }
        showToast('🗑️ Document marked for removal', 'info');
    };

    // View Details Card Click
    const handleViewDetails = async (employee) => {
        try {
            setIsLoadingDetails(true);
            setShowDetailsModal(true);
            setSelectedEmployee(null);

            const token = tokenManager.getAccessToken();
            if (!token) return;

            // Check if is a trainer based on designation or role
            const isTrainer = ['TRAINER', 'SENIOR_TRAINER', 'JUNIOR_TRAINER'].includes(employee.designation) || employee.role === 'TRAINER';
            const endpoint = isTrainer ? `/api/trainers/${employee.employee_id}` : `/api/employees/${employee.employee_id}`;

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile details');

            const result = await response.json();
            if (result.status === 'success') {
                setSelectedEmployee({
                    ...result.data,
                    employee_details: {
                        ...employee,
                        ...result.data.employee_details
                    },
                    isTrainerProfile: isTrainer
                });
            } else {
                throw new Error(result.message || 'Profile retrieval error');
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            showToast(`❌ Details error: ${error.message}`, 'error');
            setShowDetailsModal(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Open Add Modal
    const handleAddNew = () => {
        setOnboardType('STAFF');
        setFormData({
            branch_id: gymBranches[0]?.branch_id || '',
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'STAFF',
            designation: 'RECEPTIONIST',
            employment_type: 'FULL_TIME',
            salary_type: 'MONTHLY',
            salary_amount: 0,
            joining_date: new Date().toISOString().split('T')[0],
            profile_photo: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            address: '',
            remarks: '',
            specialization: '',
            experience: 0,
            certifications: '',
            bio: '',
            showcase_photo: '',
            availability_status: 'AVAILABLE',
            rating: 0.0,
            instagram_url: '',
            facebook_url: '',
            linkedin_url: ''
        });
        setFormDocuments([]);
        setProfileImagePreview(null);
        setShowcaseImagePreview(null);
        setShowPassword(false);
        setShowAddModal(true);
    };

    // Submit Onboard Employee / Trainer
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.branch_id) {
            showToast('⚠️ Please select a branch', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            const token = tokenManager.getAccessToken();
            if (!token) return;

            // Construct payload
            const payload = {
                branch_id: parseInt(formData.branch_id),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                designation: formData.designation,
                employment_type: formData.employment_type,
                salary_type: formData.salary_type,
                salary_amount: parseFloat(formData.salary_amount) || 0,
                joining_date: formData.joining_date,
                profile_photo: formData.profile_photo || null,
                emergency_contact_name: formData.emergency_contact_name || null,
                emergency_contact_phone: formData.emergency_contact_phone || null,
                address: formData.address || null,
                remarks: formData.remarks || null,
                documents: formDocuments
                    .filter(doc => !doc.isRemoved)
                    .map(doc => ({
                        document_type: doc.document_type,
                        document_name: doc.document_name,
                        document_number: doc.document_number || null,
                        document_url: doc.document_url
                    }))
            };

            let endpoint = '/api/employees/onboard';

            if (onboardType === 'TRAINER') {
                endpoint = '/api/trainers/onboard';
                payload.specialization = formData.specialization || null;
                payload.experience = parseFloat(formData.experience) || 0;
                payload.certifications = formData.certifications || null;
                payload.bio = formData.bio || null;
                payload.showcase_photo = formData.showcase_photo || null;
                payload.availability_status = formData.availability_status;
                payload.rating = parseFloat(formData.rating) || 0.0;
                payload.instagram_url = formData.instagram_url || null;
                payload.facebook_url = formData.facebook_url || null;
                payload.linkedin_url = formData.linkedin_url || null;
            } else {
                payload.role = formData.role;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.status === 'success') {
                showToast(`✅ ${onboardType === 'TRAINER' ? 'Trainer' : 'Employee'} onboarded successfully!`, 'success');
                setShowAddModal(false);
                fetchEmployeesList(1);
            } else {
                throw new Error(result.message || 'Onboarding request failed');
            }
        } catch (error) {
            console.error('Onboard error:', error);
            showToast(`❌ Onboard failed: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
    const handleEdit = async (employee) => {
        try {
            setIsLoadingDetails(true);
            const token = tokenManager.getAccessToken();
            if (!token) return;

            const isTrainer = ['TRAINER', 'SENIOR_TRAINER', 'JUNIOR_TRAINER'].includes(employee.designation) || employee.role === 'TRAINER';
            const endpoint = isTrainer ? `/api/trainers/${employee.employee_id}` : `/api/employees/${employee.employee_id}`;

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load profile details for editing');
            const result = await response.json();

            if (result.status === 'success') {
                const profile = result.data;
                const empDetails = profile.employee_details;
                
                setOnboardType(isTrainer ? 'TRAINER' : 'STAFF');
                setSelectedEmployee(profile);

                setFormData({
                    branch_id: profile.user_information?.branch_id || empDetails.branch_id || '',
                    name: empDetails.full_name || empDetails.name || '',
                    email: empDetails.email || '',
                    phone: empDetails.phone || '',
                    password: '', // Kept empty
                    role: profile.user_information?.role || 'STAFF',
                    designation: empDetails.designation || 'RECEPTIONIST',
                    employment_type: empDetails.employment_type || 'FULL_TIME',
                    salary_type: profile.salary_information?.salary_type || empDetails.salary_type || 'MONTHLY',
                    salary_amount: profile.salary_information?.salary_amount || empDetails.salary_amount || 0.00,
                    joining_date: empDetails.joining_date || '',
                    profile_photo: empDetails.profile_photo || '',
                    emergency_contact_name: empDetails.emergency_contact_name || '',
                    emergency_contact_phone: empDetails.emergency_contact_phone || '',
                    address: empDetails.address || '',
                    remarks: empDetails.remarks || '',
                    // Trainer details
                    specialization: profile.trainer_profile?.specialization || '',
                    experience: profile.trainer_profile?.experience || 0,
                    certifications: profile.trainer_profile?.certifications || '',
                    bio: profile.trainer_profile?.bio || '',
                    showcase_photo: profile.trainer_profile?.showcase_photo || '',
                    availability_status: profile.trainer_profile?.availability_status || 'AVAILABLE',
                    rating: profile.trainer_profile?.rating || 0.0,
                    instagram_url: profile.trainer_profile?.instagram_url || '',
                    facebook_url: profile.trainer_profile?.facebook_url || '',
                    linkedin_url: profile.trainer_profile?.linkedin_url || ''
                });

                setFormDocuments(profile.documents || []);
                setProfileImagePreview(empDetails.profile_photo || null);
                setShowcaseImagePreview(profile.trainer_profile?.showcase_photo || null);
                setShowEditModal(true);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Edit load error:', error);
            showToast(`❌ Failed to edit: ${error.message}`, 'error');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Submit Edit Details
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const token = tokenManager.getAccessToken();
            if (!token) return;

            const employeeId = selectedEmployee.employee_details.employee_id;
            const isTrainer = onboardType === 'TRAINER';

            // 1. Update basic employee details
            const employeePayload = {
                full_name: formData.name,
                phone: formData.phone,
                branch_id: parseInt(formData.branch_id),
                salary_amount: parseFloat(formData.salary_amount) || 0.0,
                address: formData.address,
                emergency_contact_name: formData.emergency_contact_name,
                emergency_contact_phone: formData.emergency_contact_phone,
                profile_photo: formData.profile_photo,
                remarks: formData.remarks
            };

            const empResponse = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeePayload)
            });

            const empResult = await empResponse.json();
            if (empResult.status !== 'success') {
                throw new Error(empResult.message || 'Failed to update employee details');
            }

            // 2. If Trainer, update trainer profile details
            if (isTrainer) {
                const trainerPayload = {
                    specialization: formData.specialization,
                    experience: parseFloat(formData.experience) || 0,
                    bio: formData.bio,
                    certifications: formData.certifications,
                    availability_status: formData.availability_status,
                    instagram_url: formData.instagram_url,
                    facebook_url: formData.facebook_url,
                    linkedin_url: formData.linkedin_url,
                    showcase_photo: formData.showcase_photo
                };

                const trResponse = await fetch(`${API_BASE_URL}/api/trainers/${employeeId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(trainerPayload)
                });

                const trResult = await trResponse.json();
                if (trResult.status !== 'success') {
                    throw new Error(trResult.message || 'Failed to update trainer details');
                }
            }

            // 3. Document modifications
            const docsToProcess = [];
            
            // Collect additions
            formDocuments.filter(d => d.isNew).forEach(d => {
                docsToProcess.push({
                    action: 'ADD',
                    document_type: d.document_type,
                    document_name: d.document_name,
                    document_number: d.document_number || null,
                    document_url: d.document_url
                });
            });

            // Collect removals
            formDocuments.filter(d => d.isRemoved && !d.isNew).forEach(d => {
                docsToProcess.push({
                    action: 'REMOVE',
                    document_id: d.document_id
                });
            });

            // Process document update if there are edits
            if (docsToProcess.length > 0) {
                const docResponse = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/documents`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ documents: docsToProcess })
                });

                const docResult = await docResponse.json();
                if (docResult.status !== 'success') {
                    showToast('⚠️ Basic profile saved, but document sync failed.', 'warning');
                }
            }

            showToast('✅ Profile updated successfully!', 'success');
            setShowEditModal(false);
            fetchEmployeesList(currentPage);
        } catch (error) {
            console.error('Update error:', error);
            showToast(`❌ Update failed: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update Status Call
    const handleStatusUpdate = async (employee, newStatus) => {
        try {
            const token = tokenManager.getAccessToken();
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/employees/${employee.employee_id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            if (result.status === 'success') {
                showToast(`✅ Status updated to ${newStatus}`, 'success');
                
                // Refresh listings or details view
                fetchEmployeesList(currentPage);
                if (selectedEmployee && selectedEmployee.employee_details.employee_id === employee.employee_id) {
                    setSelectedEmployee(prev => ({
                        ...prev,
                        employee_details: {
                            ...prev.employee_details,
                            status: newStatus
                        }
                    }));
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Status patch error:', error);
            showToast(`❌ Failed to update status: ${error.message}`, 'error');
        }
    };

    // Get badge styles
    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'badge-active';
            case 'ON_LEAVE': return 'badge-leave';
            case 'INACTIVE': return 'badge-inactive';
            case 'TERMINATED': return 'badge-terminated';
            default: return 'badge-inactive';
        }
    };

    const getAvailabilityClass = (avail) => {
        switch (avail) {
            case 'AVAILABLE': return 'avail-available';
            case 'BUSY': return 'avail-busy';
            case 'ON_LEAVE': return 'avail-leave';
            default: return 'avail-available';
        }
    };

    // Map branch_id to branch name
    const getBranchNameById = (id) => {
        const branchObj = gymBranches.find(b => b.branch_id === id);
        return branchObj ? branchObj.branch_name : 'N/A';
    };

    // Render stars helper
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalf = (rating || 0) % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<i key={i} className="fas fa-star text-warning"></i>);
            } else if (i === fullStars + 1 && hasHalf) {
                stars.push(<i key={i} className="fas fa-star-half-alt text-warning"></i>);
            } else {
                stars.push(<i key={i} className="far fa-star text-muted"></i>);
            }
        }
        return stars;
    };

    return (
        <div className="staff-management">
            {/* Toast System */}
            {toastMessage.show && (
                <div className={`toast-notification toast-${toastMessage.type}`}>
                    <p>{toastMessage.message}</p>
                </div>
            )}

            {/* Title Header */}
            <div className="staff-header">
                <div>
                    <h1 className="staff-title">
                        <i className="fas fa-user-friends"></i> Employees Management
                    </h1>
                    <p className="staff-subtitle">Onboard, manage documents, profiles and status of trainers and employees.</p>
                </div>
                <button className="staff-add-btn" onClick={handleAddNew}>
                    <i className="fas fa-plus"></i> Onboard Member
                </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="staff-stats-bar">
                <div className="staff-stat-item">
                    <i className="fas fa-id-card"></i>
                    <div>
                        <span className="staff-stat-label">Total Listings</span>
                        <span className="staff-stat-value">{totalItems}</span>
                    </div>
                </div>
                <div className="staff-stat-item">
                    <i className="fas fa-user-check"></i>
                    <div>
                        <span className="staff-stat-label">Active State</span>
                        <span className="staff-stat-value">
                            {employees.filter(e => e.status === 'ACTIVE').length} Active
                        </span>
                    </div>
                </div>
                <div className="staff-stat-item">
                    <i className="fas fa-dumbbell"></i>
                    <div>
                        <span className="staff-stat-label">Role Focus</span>
                        <span className="staff-stat-value">
                            {trainersOnly ? 'Trainers Mode' : 'All Roles'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters Navigation Panel */}
            <div className="staff-filters">
                <div className="staff-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by code, name, email, phone..."
                        value={searchQuery}
                        onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                    />
                    {searchQuery && (
                        <button className="staff-clear-search" onClick={() => handleFilterChange(setSearchQuery, '')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>

                <select 
                    value={filterBranch} 
                    onChange={(e) => handleFilterChange(setFilterBranch, e.target.value)} 
                    className="staff-filter"
                >
                    <option value="ALL">All Branches</option>
                    {gymBranches.map(b => (
                        <option key={b.branch_id} value={b.branch_name}>{b.branch_name}</option>
                    ))}
                </select>

                <select 
                    value={filterStatus} 
                    onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)} 
                    className="staff-filter"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="TERMINATED">Terminated</option>
                </select>

                {!trainersOnly && (
                    <>
                        <select 
                            value={filterDesignation} 
                            onChange={(e) => handleFilterChange(setFilterDesignation, e.target.value)} 
                            className="staff-filter"
                        >
                            <option value="ALL">All Designations</option>
                            <option value="OWNER">Owner</option>
                            <option value="BRANCH_MANAGER">Branch Manager</option>
                            <option value="SENIOR_TRAINER">Senior Trainer</option>
                            <option value="TRAINER">Trainer</option>
                            <option value="JUNIOR_TRAINER">Junior Trainer</option>
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="ACCOUNTANT">Accountant</option>
                            <option value="NUTRITIONIST">Nutritionist</option>
                            <option value="HOUSEKEEPING">Housekeeping</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="OTHER">Other Designation</option>
                        </select>

                        <select 
                            value={filterEmploymentType} 
                            onChange={(e) => handleFilterChange(setFilterEmploymentType, e.target.value)} 
                            className="staff-filter"
                        >
                            <option value="ALL">All Employments</option>
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERN">Intern</option>
                        </select>
                    </>
                )}

                <div className="trainers-only-filter">
                    <label className="switch-label">
                        <input
                            type="checkbox"
                            checked={trainersOnly}
                            onChange={(e) => handleFilterChange(setTrainersOnly, e.target.checked)}
                        />
                        <span className="switch-text"><i className="fas fa-dumbbell"></i> Trainers Only</span>
                    </label>
                </div>
            </div>

            {/* Listing Section */}
            <div className="staff-table-container">
                {isLoading ? (
                    <div className="staff-loading-state">
                        <i className="fas fa-circle-notch fa-spin"></i>
                        <p>Loading directory details...</p>
                    </div>
                ) : error ? (
                    <div className="staff-error-state">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>{error}</p>
                        <button className="staff-btn-secondary" onClick={() => fetchEmployeesList(currentPage)}>
                            <i className="fas fa-sync-alt"></i> Retry Query
                        </button>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="staff-no-data">
                        <i className="fas fa-folder-open"></i>
                        <p>No profiles found matching the active criteria.</p>
                    </div>
                ) : (
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Code / ID</th>
                                <th>Employee / Profile</th>
                                <th>Branch</th>
                                <th>Role / Designation</th>
                                {trainersOnly ? (
                                    <>
                                        <th>Specialization</th>
                                        <th>Rating & Experience</th>
                                        <th>Availability</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Employment</th>
                                        <th>Salary Info</th>
                                        <th>Joining Date</th>
                                    </>
                                )}
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => {
                                const isTrainer = ['TRAINER', 'SENIOR_TRAINER', 'JUNIOR_TRAINER'].includes(emp.designation) || emp.role === 'TRAINER';
                                return (
                                    <tr key={emp.employee_id}>
                                        <td className="font-code">
                                            {emp.employee_code || `#${emp.employee_id}`}
                                        </td>
                                        <td>
                                            <div className="staff-user-profile-wrapper">
                                                <div className="staff-user-avatar">
                                                    {emp.profile_photo ? (
                                                        <img src={emp.profile_photo} alt={emp.full_name || emp.name} className="staff-avatar-img" />
                                                    ) : (
                                                        <div className="staff-avatar-placeholder">
                                                            <i className="fas fa-user"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="staff-user-info">
                                                    <strong>{emp.full_name || emp.name || 'N/A'}</strong>
                                                    <span>{emp.email}</span>
                                                    <span>{emp.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="staff-branch-tag">
                                                {getBranchNameById(emp.branch_id)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`staff-role-badge ${isTrainer ? 'role-trainer' : 'role-staff'}`}>
                                                {emp.role || (isTrainer ? 'TRAINER' : 'STAFF')}
                                            </span>
                                            <div className="text-designation">{emp.designation}</div>
                                        </td>
                                        {trainersOnly ? (
                                            <>
                                                <td className="text-specialization" title={emp.specialization}>
                                                    {emp.specialization || 'General'}
                                                </td>
                                                <td>
                                                    <div className="trainer-rating-cell">
                                                        <span className="experience-yr">{emp.experience || 0} yrs exp</span>
                                                        <div className="stars-wrapper">{renderStars(emp.rating)}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`staff-status-badge ${getAvailabilityClass(emp.availability_status || 'AVAILABLE')}`}>
                                                        {(emp.availability_status || 'AVAILABLE').replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>
                                                    <span className="emp-type-tag">{emp.employment_type?.replace('_', ' ')}</span>
                                                </td>
                                                <td>
                                                    <strong className="salary-amount">₹{(emp.salary_amount || 0).toLocaleString('en-IN')}</strong>
                                                    <div className="text-salary-type">{emp.salary_type}</div>
                                                </td>
                                                <td className="date-field">
                                                    {emp.joining_date}
                                                </td>
                                            </>
                                        )}
                                        <td>
                                            <select 
                                                className={`status-select-inline ${getStatusClass(emp.status)}`}
                                                value={emp.status}
                                                onChange={(e) => handleStatusUpdate(emp, e.target.value)}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="ON_LEAVE">On Leave</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="TERMINATED">Terminated</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div className="staff-action-buttons">
                                                <button className="staff-action-btn view" title="View Profile" onClick={() => handleViewDetails(emp)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button className="staff-action-btn edit" title="Edit Profile" onClick={() => handleEdit(emp)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination panel */}
            {!isLoading && !error && totalPages > 1 && (
                <div className="staff-pagination">
                    <div className="staff-pagination-info">
                        Showing page {currentPage} of {totalPages} ({totalItems} records)
                    </div>
                    <div className="staff-pagination-controls">
                        <button
                            className="staff-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            <i className="fas fa-chevron-left"></i> Prev
                        </button>
                        <div className="staff-pagination-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    className={`staff-pagination-number ${p === currentPage ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            className="staff-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Profiles detail modal */}
            {showDetailsModal && (
                <div className="staff-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="staff-modal staff-modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <h2>
                                <i className={`fas fa-${selectedEmployee?.isTrainerProfile ? 'dumbbell' : 'user-tie'}`}></i>
                                {selectedEmployee?.isTrainerProfile ? 'Trainer Profile Summary' : 'Employee Profile Summary'}
                            </h2>
                            <button className="staff-modal-close" onClick={() => setShowDetailsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="staff-modal-body">
                            {isLoadingDetails || !selectedEmployee ? (
                                <div className="modal-loading-state">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Loading profile details...</p>
                                </div>
                            ) : (
                                <div className="profile-details-layout">
                                    {/* Left Sidebar Profile Section */}
                                    <div className="profile-details-left">
                                        <div className="profile-avatar-container">
                                            {selectedEmployee.employee_details.profile_photo ? (
                                                <img src={selectedEmployee.employee_details.profile_photo} alt={selectedEmployee.employee_details.full_name} className="profile-large-avatar" />
                                            ) : (
                                                <div className="profile-large-placeholder">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="profile-name-title">{selectedEmployee.employee_details.full_name}</h3>
                                        <span className={`staff-status-badge ${getStatusClass(selectedEmployee.employee_details.status)}`}>
                                            {selectedEmployee.employee_details.status}
                                        </span>
                                        <div className="profile-code-sub">{selectedEmployee.employee_details.employee_code}</div>
                                        
                                        {/* Status dropdown in modal */}
                                        <div className="quick-status-update">
                                            <label>Modify Status</label>
                                            <select 
                                                value={selectedEmployee.employee_details.status}
                                                className={`status-select-modal ${getStatusClass(selectedEmployee.employee_details.status)}`}
                                                onChange={(e) => handleStatusUpdate(selectedEmployee.employee_details, e.target.value)}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="ON_LEAVE">On Leave</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="TERMINATED">Terminated</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Right Section Details Tabs */}
                                    <div className="profile-details-right">
                                        {/* Standard details block */}
                                        <div className="details-section-group">
                                            <h4><i className="fas fa-info-circle"></i> Work & Account Info</h4>
                                            <div className="details-data-grid">
                                                <div className="data-item">
                                                    <label>Email ID</label>
                                                    <span>{selectedEmployee.employee_details.email}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Contact Phone</label>
                                                    <span>{selectedEmployee.employee_details.phone}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Designation</label>
                                                    <span>{selectedEmployee.employee_details.designation}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Branch Assigned</label>
                                                    <span>{getBranchNameById(selectedEmployee.employee_details.branch_id || selectedEmployee.user_information?.branch_id)}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Employment</label>
                                                    <span>{selectedEmployee.employee_details.employment_type?.replace('_', ' ')}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Joining Date</label>
                                                    <span>{selectedEmployee.employee_details.joining_date}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Salary Package</label>
                                                    <span>
                                                        ₹{(selectedEmployee.salary_information?.salary_amount || selectedEmployee.employee_details.salary_amount || 0).toLocaleString('en-IN')} / {selectedEmployee.salary_information?.salary_type || selectedEmployee.employee_details.salary_type || 'MONTHLY'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Trainer profile details layout */}
                                        {selectedEmployee.isTrainerProfile && selectedEmployee.trainer_profile && (
                                            <div className="details-section-group trainer-specific-group">
                                                <h4><i className="fas fa-dumbbell"></i> Special Trainer Information</h4>
                                                <div className="trainer-showcase-bar">
                                                    <div className="trainer-rating-show font-bold">
                                                        <span>Availability:</span>
                                                        <span className={`availability-banner ${getAvailabilityClass(selectedEmployee.trainer_profile.availability_status)}`}>
                                                            {selectedEmployee.trainer_profile.availability_status}
                                                        </span>
                                                    </div>
                                                    <div className="trainer-rating-show">
                                                        <span>Rating: </span>
                                                        <span className="rating-value">{selectedEmployee.trainer_profile.rating || '0.0'}</span>
                                                        <div className="stars-wrapper">{renderStars(selectedEmployee.trainer_profile.rating)}</div>
                                                    </div>
                                                </div>

                                                <div className="details-data-grid mt-3">
                                                    <div className="data-item data-full-width">
                                                        <label>Trainer Specializations</label>
                                                        <div className="specialization-pills-list">
                                                            {(selectedEmployee.trainer_profile.specialization || '').split(',').map((spec, i) => (
                                                                <span key={i} className="spec-pill">{spec.trim()}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="data-item">
                                                        <label>Experience (Years)</label>
                                                        <span>{selectedEmployee.trainer_profile.experience || 0} years coaching</span>
                                                    </div>
                                                    <div className="data-item data-full-width">
                                                        <label>Certifications</label>
                                                        <span className="text-certifications">{selectedEmployee.trainer_profile.certifications || 'None added'}</span>
                                                    </div>
                                                    <div className="data-item data-full-width">
                                                        <label>Biography</label>
                                                        <blockquote className="trainer-bio-quote">
                                                            "{selectedEmployee.trainer_profile.bio || 'Professional fitness coach at Fitness Guru.'}"
                                                        </blockquote>
                                                    </div>
                                                    {selectedEmployee.trainer_profile.showcase_photo && (
                                                        <div className="data-item data-full-width">
                                                            <label>Trainer Showcase Media</label>
                                                            <div className="showcase-photo-frame">
                                                                <img src={selectedEmployee.trainer_profile.showcase_photo} alt="Showcase Pose" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Social Handles */}
                                                    <div className="data-item data-full-width social-handles-section">
                                                        <label>Coach Social Media Handles</label>
                                                        <div className="social-links-flex">
                                                            {selectedEmployee.trainer_profile.instagram_url && (
                                                                <a href={selectedEmployee.trainer_profile.instagram_url} target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">
                                                                    <i className="fab fa-instagram"></i> Instagram
                                                                </a>
                                                            )}
                                                            {selectedEmployee.trainer_profile.facebook_url && (
                                                                <a href={selectedEmployee.trainer_profile.facebook_url} target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Facebook">
                                                                    <i className="fab fa-facebook"></i> Facebook
                                                                </a>
                                                            )}
                                                            {selectedEmployee.trainer_profile.linkedin_url && (
                                                                <a href={selectedEmployee.trainer_profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-icon linkedin" title="LinkedIn">
                                                                    <i className="fab fa-linkedin"></i> LinkedIn
                                                                </a>
                                                            )}
                                                            {!selectedEmployee.trainer_profile.instagram_url && !selectedEmployee.trainer_profile.facebook_url && !selectedEmployee.trainer_profile.linkedin_url && (
                                                                <span className="text-muted">No social links provided.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact & Personal details block */}
                                        <div className="details-section-group">
                                            <h4><i className="fas fa-home"></i> Contact & Address</h4>
                                            <div className="details-data-grid">
                                                <div className="data-item data-full-width">
                                                    <label>Full Residential Address</label>
                                                    <span>{selectedEmployee.employee_details.address || 'Not Provided'}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Emergency Contact Person</label>
                                                    <span>{selectedEmployee.employee_details.emergency_contact_name || 'Not Provided'}</span>
                                                </div>
                                                <div className="data-item">
                                                    <label>Emergency Contact Phone</label>
                                                    <span>{selectedEmployee.employee_details.emergency_contact_phone || 'Not Provided'}</span>
                                                </div>
                                                <div className="data-item data-full-width">
                                                    <label>Special Notes & Remarks</label>
                                                    <span>{selectedEmployee.employee_details.remarks || 'None'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documents details block */}
                                        <div className="details-section-group">
                                            <h4><i className="fas fa-file-invoice"></i> Verification Documents</h4>
                                            {(!selectedEmployee.documents || selectedEmployee.documents.length === 0) ? (
                                                <p className="no-docs-text">No documents uploaded.</p>
                                            ) : (
                                                <div className="docs-list-summary">
                                                    {selectedEmployee.documents.map((doc, idx) => (
                                                        <div key={idx} className="doc-summary-card">
                                                            <div className="doc-summary-meta">
                                                                <i className="fas fa-file-alt doc-icon"></i>
                                                                <div className="doc-name-num">
                                                                    <strong>{doc.document_name}</strong>
                                                                    <span>({doc.document_type}) {doc.document_number ? `- ${doc.document_number}` : ''}</span>
                                                                </div>
                                                            </div>
                                                            <div className="doc-actions-panel">
                                                                <span className={`doc-status-badge ${doc.verification_status}`}>
                                                                    {doc.verification_status}
                                                                </span>
                                                                <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="btn-view-doc">
                                                                    <i className="fas fa-external-link-alt"></i> View File
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Actions Panel */}
                                        <div className="profile-modal-actions-bar">
                                            <button className="staff-btn-primary" onClick={() => {
                                                setShowDetailsModal(false);
                                                handleEdit(selectedEmployee.employee_details);
                                            }}>
                                                <i className="fas fa-edit"></i> Edit Member Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Onboard / Edit Form Modal */}
            {(showAddModal || showEditModal) && (
                <div className="staff-modal-overlay" onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                }}>
                    <div className="staff-modal staff-modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <h2>
                                <i className={`fas fa-${showAddModal ? 'plus' : 'edit'}`}></i>
                                {showAddModal ? 'Onboard New Profile' : 'Modify Member Details'}
                            </h2>
                            <button className="staff-modal-close" onClick={() => {
                                setShowAddModal(false);
                                setShowEditModal(false);
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="staff-modal-body">
                            {/* General Toggle (Only visible in Add modal) */}
                            {showAddModal && (
                                <div className="onboard-toggle-section">
                                    <label className="toggle-heading">Select Onboarding Classification:</label>
                                    <div className="toggle-options-group">
                                        <button 
                                            type="button" 
                                            className={`toggle-option-btn ${onboardType === 'STAFF' ? 'active' : ''}`}
                                            onClick={() => {
                                                setOnboardType('STAFF');
                                                setFormData(prev => ({ ...prev, role: 'STAFF', designation: 'RECEPTIONIST' }));
                                            }}
                                        >
                                            <i className="fas fa-user-tie"></i> Administrative Staff
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`toggle-option-btn ${onboardType === 'TRAINER' ? 'active' : ''}`}
                                            onClick={() => {
                                                setOnboardType('TRAINER');
                                                setFormData(prev => ({ ...prev, role: 'TRAINER', designation: 'TRAINER' }));
                                            }}
                                        >
                                            <i className="fas fa-dumbbell"></i> Fitness Trainer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Section 1: Authentication Profile */}
                            <div className="staff-form-section">
                                <h3><i className="fas fa-key"></i> Login & Main Identity</h3>
                                <div className="staff-form-grid">
                                    <div className="staff-form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter name"
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@fitnessguru.com"
                                            disabled={showEditModal}
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Contact Phone *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="10-digit number"
                                            pattern="[0-9]{10}"
                                            required
                                        />
                                    </div>
                                    {showAddModal && (
                                        <div className="staff-form-group">
                                            <label>Access Password *</label>
                                            <div className="staff-password-input-wrapper">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="Enter login password"
                                                    required
                                                />
                                                <button 
                                                    type="button" 
                                                    className="staff-password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="staff-form-group">
                                        <label>Assign Gym Branch *</label>
                                        <select
                                            value={formData.branch_id}
                                            onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Choose Branch</option>
                                            {gymBranches.map(b => (
                                                <option key={b.branch_id} value={b.branch_id}>
                                                    {b.branch_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {onboardType === 'STAFF' && (
                                        <div className="staff-form-group">
                                            <label>Application Role *</label>
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                disabled={showEditModal}
                                                required
                                            >
                                                <option value="STAFF">Staff Access</option>
                                                <option value="BRANCH_MANAGER">Branch Manager Access</option>
                                                <option value="ADMIN">Administrator Access</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Work & Salary Details */}
                            <div className="staff-form-section">
                                <h3><i className="fas fa-briefcase"></i> Position & Remuneration</h3>
                                <div className="staff-form-grid">
                                    <div className="staff-form-group">
                                        <label>Designation Role *</label>
                                        {onboardType === 'TRAINER' ? (
                                            <select
                                                value={formData.designation}
                                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                required
                                            >
                                                <option value="TRAINER">Trainer</option>
                                                <option value="SENIOR_TRAINER">Senior Trainer</option>
                                                <option value="JUNIOR_TRAINER">Junior Trainer</option>
                                            </select>
                                        ) : (
                                            <select
                                                value={formData.designation}
                                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                required
                                            >
                                                <option value="OWNER">Owner</option>
                                                <option value="BRANCH_MANAGER">Branch Manager</option>
                                                <option value="RECEPTIONIST">Receptionist</option>
                                                <option value="ACCOUNTANT">Accountant</option>
                                                <option value="NUTRITIONIST">Nutritionist</option>
                                                <option value="HOUSEKEEPING">Housekeeping</option>
                                                <option value="MAINTENANCE">Maintenance</option>
                                                <option value="OTHER">Other Designation</option>
                                            </select>
                                        )}
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Employment Classification *</label>
                                        <select
                                            value={formData.employment_type}
                                            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                            required
                                        >
                                            <option value="FULL_TIME">Full Time</option>
                                            <option value="PART_TIME">Part Time</option>
                                            <option value="CONTRACT">Contract</option>
                                            <option value="INTERN">Intern</option>
                                        </select>
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Salary Frequency / Type *</label>
                                        <select
                                            value={formData.salary_type}
                                            onChange={(e) => setFormData({ ...formData, salary_type: e.target.value })}
                                            required
                                        >
                                            <option value="MONTHLY">Monthly Remuneration</option>
                                            <option value="HOURLY">Hourly Remuneration</option>
                                            <option value="PER_SESSION">Per Session Payment</option>
                                            <option value="COMMISSION">Commission Based</option>
                                        </select>
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Salary Amount (₹) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.salary_amount}
                                            onChange={(e) => setFormData({ ...formData, salary_amount: e.target.value })}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Joining Date *</label>
                                        <input
                                            type="date"
                                            value={formData.joining_date}
                                            onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                                            disabled={showEditModal}
                                            required
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Profile Image Photo</label>
                                        <div className="photo-upload-flex">
                                            {profileImagePreview && (
                                                <div className="form-avatar-preview">
                                                    <img src={profileImagePreview} alt="Profile preview" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                id="profile-img-file"
                                                onChange={handleProfilePhotoUpload} 
                                                className="display-none" 
                                            />
                                            <label htmlFor="profile-img-file" className="btn-file-select">
                                                {isUploadingProfile ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-image"></i> Select Profile File</>}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Trainer Specific details */}
                            {onboardType === 'TRAINER' && (
                                <div className="staff-form-section trainer-onboard-section">
                                    <h3><i className="fas fa-dumbbell"></i> Special Trainer Credentials</h3>
                                    <div className="staff-form-grid">
                                        <div className="staff-form-group staff-full-width">
                                            <label>Areas of Specialization (Comma separated) *</label>
                                            <input
                                                type="text"
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                placeholder="e.g. Weightlifting, Yoga, HIIT, Cardio"
                                                required
                                            />
                                        </div>
                                        <div className="staff-form-group">
                                            <label>Coaching Experience (Years) *</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                placeholder="e.g. 5.5"
                                                required
                                            />
                                        </div>
                                        <div className="staff-form-group">
                                            <label>Initial Availability State *</label>
                                            <select
                                                value={formData.availability_status}
                                                onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                                                required
                                            >
                                                <option value="AVAILABLE">Available</option>
                                                <option value="BUSY">Busy</option>
                                                <option value="ON_LEAVE">On Leave</option>
                                            </select>
                                        </div>
                                        <div className="staff-form-group staff-full-width">
                                            <label>List of Certifications *</label>
                                            <input
                                                type="text"
                                                value={formData.certifications}
                                                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                                placeholder="e.g. ACE CPT, Gold's Gym Academy Certificate"
                                                required
                                            />
                                        </div>
                                        <div className="staff-form-group staff-full-width">
                                            <label>Bio / Professional Summary *</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                rows="3"
                                                placeholder="Short trainer bio description..."
                                                required
                                            />
                                        </div>
                                        <div className="staff-form-group">
                                            <label>Trainer Showcase Media (Photo)</label>
                                            <div className="photo-upload-flex">
                                                {showcaseImagePreview && (
                                                    <div className="form-avatar-preview showcase-preview">
                                                        <img src={showcaseImagePreview} alt="Showcase preview" />
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    id="showcase-img-file"
                                                    onChange={handleShowcasePhotoUpload} 
                                                    className="display-none" 
                                                />
                                                <label htmlFor="showcase-img-file" className="btn-file-select">
                                                    {isUploadingShowcase ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-camera"></i> Select Showcase Pose</>}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="staff-form-group">
                                            <label>Instagram URL</label>
                                            <input
                                                type="url"
                                                value={formData.instagram_url}
                                                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                                                placeholder="https://instagram.com/username"
                                            />
                                        </div>
                                        <div className="staff-form-group">
                                            <label>Facebook URL</label>
                                            <input
                                                type="url"
                                                value={formData.facebook_url}
                                                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                                placeholder="https://facebook.com/username"
                                            />
                                        </div>
                                        <div className="staff-form-group">
                                            <label>LinkedIn URL</label>
                                            <input
                                                type="url"
                                                value={formData.linkedin_url}
                                                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 4: Address & Emergency Contacts */}
                            <div className="staff-form-section">
                                <h3><i className="fas fa-home"></i> Contact & Residential Details</h3>
                                <div className="staff-form-grid">
                                    <div className="staff-form-group staff-full-width">
                                        <label>Full Residential Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Street address, Flat number, City"
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Emergency Contact Person</label>
                                        <input
                                            type="text"
                                            value={formData.emergency_contact_name}
                                            onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                            placeholder="Emergency contact name"
                                        />
                                    </div>
                                    <div className="staff-form-group">
                                        <label>Emergency Contact Number</label>
                                        <input
                                            type="tel"
                                            value={formData.emergency_contact_phone}
                                            onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                            placeholder="10-digit emergency number"
                                            pattern="[0-9]{10}"
                                        />
                                    </div>
                                    <div className="staff-form-group staff-full-width">
                                        <label>Remarks & Internal Notes</label>
                                        <textarea
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            rows="2"
                                            placeholder="Any other notes regarding this employee onboarding..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Verification Documents (Uploader / Sync panel) */}
                            <div className="staff-form-section">
                                <h3><i className="fas fa-file-medical"></i> Verification Documents Management</h3>
                                <div className="docs-management-panel">
                                    {/* Document Adder Row */}
                                    <div className="doc-adder-row">
                                        <div className="doc-adder-group">
                                            <label>Document Category</label>
                                            <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)}>
                                                <option value="AADHAAR">Aadhaar Card</option>
                                                <option value="PAN">PAN Card</option>
                                                <option value="PASSPORT">Passport</option>
                                                <option value="DRIVING_LICENSE">Driving License</option>
                                                <option value="RESUME">Resume Curriculum</option>
                                                <option value="TRAINER_CERTIFICATION">Trainer Certification</option>
                                                <option value="OTHER">Other File</option>
                                            </select>
                                        </div>
                                        <div className="doc-adder-group">
                                            <label>Document Name *</label>
                                            <input
                                                type="text"
                                                value={newDocName}
                                                onChange={(e) => setNewDocName(e.target.value)}
                                                placeholder="e.g. Aadhaar Card File"
                                            />
                                        </div>
                                        <div className="doc-adder-group">
                                            <label>Document ID Number</label>
                                            <input
                                                type="text"
                                                value={newDocNumber}
                                                onChange={(e) => setNewDocNumber(e.target.value)}
                                                placeholder="Number (Optional)"
                                            />
                                        </div>
                                        <div className="doc-adder-group file-upload-group">
                                            <label>Upload File *</label>
                                            <div className="file-uploader-box">
                                                <input 
                                                    type="file" 
                                                    id="doc-file-input"
                                                    onChange={handleDocFileUpload} 
                                                    className="display-none" 
                                                />
                                                <label htmlFor="doc-file-input" className={`btn-upload-trigger ${newDocUrl ? 'has-uploaded' : ''}`}>
                                                    {isUploadingDoc ? (
                                                        <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
                                                    ) : newDocUrl ? (
                                                        <><i className="fas fa-check-circle"></i> File Uploaded</>
                                                    ) : (
                                                        <><i className="fas fa-cloud-upload-alt"></i> Upload PDF/Img</>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-add-doc-action"
                                            onClick={handleAddDocumentToList}
                                        >
                                            <i className="fas fa-plus"></i> Add
                                        </button>
                                    </div>

                                    {/* Document List Display */}
                                    <div className="form-docs-list-display">
                                        {formDocuments.filter(d => !d.isRemoved).length === 0 ? (
                                            <p className="no-docs-queued">No documents queued for upload.</p>
                                        ) : (
                                            <div className="docs-table-wrapper">
                                                <table className="docs-mini-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Category</th>
                                                            <th>Document Label</th>
                                                            <th>ID Number</th>
                                                            <th>File Link</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formDocuments.filter(d => !d.isRemoved).map((doc, idx) => (
                                                            <tr key={idx} className={doc.isNew ? 'row-new-doc' : ''}>
                                                                <td><strong>{doc.document_type}</strong></td>
                                                                <td>{doc.document_name}</td>
                                                                <td>{doc.document_number || 'N/A'}</td>
                                                                <td>
                                                                    <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="mini-link-view">
                                                                        <i className="fas fa-external-link-alt"></i> View Upload
                                                                    </a>
                                                                </td>
                                                                <td>
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn-mini-delete"
                                                                        onClick={() => handleRemoveDocument(doc)}
                                                                    >
                                                                        <i className="fas fa-trash-alt"></i> Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Action Controls */}
                            <div className="staff-modal-actions">
                                <button
                                    type="button"
                                    className="staff-btn-secondary"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="staff-btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Saving Profile...</>
                                    ) : (
                                        <>{showAddModal ? 'Onboard Member' : 'Save Changes'}</>
                                    )}
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
