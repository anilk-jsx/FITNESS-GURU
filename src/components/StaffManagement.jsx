import React, { useState, useEffect, useCallback } from 'react';
import './StaffManagement.css';
import { tokenManager } from '../utils/tokenManager';

const StaffManagement = () => {
    const [activeTab, setActiveTab] = useState('trainers'); // trainers, staff
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBranch, setFilterBranch] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);
    const [trainersError, setTrainersError] = useState(null);
    const [gymBranches, setGymBranches] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTrainers, setTotalTrainers] = useState(0);
    const [itemsPerPage] = useState(10);
    const [currentStaffPage, setCurrentStaffPage] = useState(1);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

    // Map shift ID to shift name - Only 2 shifts
    const getShiftName = (shiftId) => {
        const shiftMap = {
            1: 'Morning Shift',
            2: 'Evening Shift'
        };
        return shiftMap[shiftId] || 'NA';
    };

    // Convert API availability status to component format
    const getAvailabilityStatus = (apiStatus) => {
        const availabilityMap = {
            'Available': 'AVAILABLE',
            'On Break': 'ON_BREAK',
            'Off Duty': 'OFF_DUTY',
            'On Booking': 'ON_BOOKING',
            'AVAILABLE': 'AVAILABLE',
            'ON_BREAK': 'ON_BREAK',
            'OFF_DUTY': 'OFF_DUTY',
            'ON_BOOKING': 'ON_BOOKING'
        };
        return availabilityMap[apiStatus] || 'AVAILABLE';
    };

    // Convert API status to component format - Only Active and Inactive
    const getStatus = (apiStatus) => {
        if (apiStatus === 1 || apiStatus === 'Active' || apiStatus === 'ACTIVE') {
            return 'ACTIVE';
        }
        return 'INACTIVE';
    };

    // Fetch gym branches from API
    const fetchGymBranches = useCallback(async () => {
        try {
            const url = `${API_BASE_URL}/api/gymBranchList?gym_id=1`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status === 'success' && Array.isArray(data.data)) {
                setGymBranches(data.data);
                console.log('Gym branches fetched:', data.data);
                return data.data;
            } else {
                console.error('Invalid gym branches response:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching gym branches:', error);
            return [];
        }
    }, [API_BASE_URL]);

    // Fetch trainers from API
    const fetchTrainers = useCallback(async (branches = [], page = 1) => {
        try {
            setIsLoadingTrainers(true);
            setTrainersError(null);

            const token = tokenManager.getAccessToken();
            if (!token) {
                setTrainersError('No authentication token found');
                setIsLoadingTrainers(false);
                return;
            }

            const url = `${API_BASE_URL}/api/trainer/getTrainers?page=${page}&limit=${10}&gym_id=1&status=Active`;
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

            if (data.status === 'success' && Array.isArray(data.data)) {
                // Transform trainers with current branch data
                const transformedTrainers = data.data.map(apiTrainer => {
                    const branch = branches.find(b => b.branch_id === apiTrainer.branch_id);
                    const branchName = branch ? branch.branch_name : 'NA';

                    return {
                        trainer_id: apiTrainer.trainer_id || 'NA',
                        user_id: apiTrainer.user_id || 'NA',
                        name: apiTrainer.name || 'NA',
                        email: apiTrainer.email || 'NA',
                        phone: apiTrainer.phone || 'NA',
                        branch_name: branchName,
                        specialization: apiTrainer.specialization || 'NA',
                        experience_years: apiTrainer.experience ? parseFloat(apiTrainer.experience) : 0,
                        certifications: apiTrainer.certifications || 'NA',
                        bio: apiTrainer.bio || 'NA',
                        total_clients: 0,
                        shift_name: getShiftName(apiTrainer.shift_id),
                        availability_status: getAvailabilityStatus(apiTrainer.availability),
                        profile_photo_url: apiTrainer.profile_photo || null,
                        joining_date: apiTrainer.join_date || 'NA',
                        status: getStatus(apiTrainer.status),
                        gym_id: apiTrainer.gym_id || 'NA',
                        branch_id: apiTrainer.branch_id || 'NA',
                        shift_id: apiTrainer.shift_id || 'NA'
                    };
                });
                setTrainers(transformedTrainers);

                // Handle pagination info from API response
                if (data.pagination) {
                    setCurrentPage(data.pagination.page || 1);
                    setTotalPages(Math.ceil(data.pagination.total / 10) || 1);
                    setTotalTrainers(data.pagination.total || 0);
                }

                console.log('Trainers fetched and transformed:', transformedTrainers);
            } else {
                setTrainersError('Invalid API response format');
            }
        } catch (error) {
            console.error('Error fetching trainers:', error);
            setTrainersError(error.message || 'Failed to fetch trainers');
        } finally {
            setIsLoadingTrainers(false);
        }
    }, [API_BASE_URL]);

    // Fetch gym branches first, then trainers
    useEffect(() => {
        const loadData = async () => {
            const branches = await fetchGymBranches();
            await fetchTrainers(branches, currentPage);
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset pagination when filters/search changes
    useEffect(() => {
        setCurrentPage(1);
        setCurrentStaffPage(1);
    }, [searchQuery, filterBranch, filterStatus]);

    // Reset staff page when switching tabs
    useEffect(() => {
        setCurrentStaffPage(1);
    }, [activeTab]);

    // Handle page change
    const handlePageChange = async (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            const branches = gymBranches.length > 0 ? gymBranches : await fetchGymBranches();
            await fetchTrainers(branches, page);
        }
    };

    // Trainers state - will be populated from API
    const [trainers, setTrainers] = useState([]);

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

    // Image preview state
    const [trainerImagePreview, setTrainerImagePreview] = useState(null);
    const [isSubmittingTrainer, setIsSubmittingTrainer] = useState(false);
    const [isDraggingImage, setIsDraggingImage] = useState(false);

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);

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

    // Calculate pagination for staff (client-side)
    const staffTotalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice(
        (currentStaffPage - 1) * itemsPerPage,
        currentStaffPage * itemsPerPage
    );

    // For trainers, we apply pagination to the already-paginated API data before filtering
    // If user searches/filters, we'll need to fetch all trainers first (or paginate client-side)
    // For now, we apply filters to the current page and show pagination info
    const paginatedTrainers = filteredTrainers;

    // Get statistics
    const getStats = () => {
        const activeTrainers = trainers.filter(t => t.status === 'ACTIVE').length;
        const activeStaff = staff.filter(s => s.status === 'ACTIVE').length;
        const totalClients = trainers.reduce((sum, t) => sum + t.total_clients, 0);
        const availableTrainers = trainers.filter(t => t.availability_status === 'AVAILABLE').length;
        const fullTimeStaff = staff.filter(s => s.salary_type === 'FULL_TIME').length;
        const inactiveStaff = staff.filter(s => s.status === 'INACTIVE').length;

        return { activeTrainers, activeStaff, totalClients, availableTrainers, fullTimeStaff, inactiveStaff };
    };

    const stats = getStats();

    // Cloudinary upload configuration
    const CLOUDINARY_CLOUD_NAME = 'dbskq6d4i'; // Replace with your Cloudinary cloud name
    const CLOUDINARY_UPLOAD_PRESET = 'trainer_uploads'; // Replace with your unsigned preset

    // Upload image to Cloudinary
    const uploadToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            console.log('📤 Uploading image to Cloudinary...');
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.secure_url) {
                console.log('✅ Image uploaded successfully:', data.secure_url);
                return data.secure_url;
            } else {
                throw new Error('Failed to get image URL from Cloudinary');
            }
        } catch (error) {
            console.error('❌ Cloudinary upload error:', error);
            return null;
        }
    };

    // Handle trainer image upload
    const handleTrainerImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            try {
                // Show preview immediately
                const reader = new FileReader();
                reader.onload = (event) => {
                    setTrainerImagePreview(event.target.result);
                };
                reader.readAsDataURL(file);

                // Upload to Cloudinary
                const imageUrl = await uploadToCloudinary(file);

                if (imageUrl) {
                    setTrainerFormData({
                        ...trainerFormData,
                        profile_photo_url: imageUrl
                    });
                    console.log('✅ Trainer image URL set:', imageUrl);
                } else {
                    alert('⚠️ Failed to upload image to Cloudinary. Please try again.');
                    setTrainerImagePreview(null);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Error uploading image. Please try again.');
            }
        } else {
            alert('Please select a valid image file');
        }
    };

    // Drag and drop handlers
    const handleImageDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(true);
    };

    const handleImageDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                // Show preview immediately
                const reader = new FileReader();
                reader.onload = (event) => {
                    setTrainerImagePreview(event.target.result);
                };
                reader.readAsDataURL(file);

                // Upload to Cloudinary
                uploadToCloudinary(file).then((imageUrl) => {
                    if (imageUrl) {
                        setTrainerFormData({
                            ...trainerFormData,
                            profile_photo_url: imageUrl
                        });
                        console.log('✅ Dropped image URL set:', imageUrl);
                    } else {
                        alert('⚠️ Failed to upload image. Please try again.');
                        setTrainerImagePreview(null);
                    }
                });
            } else {
                alert('Please drop an image file');
            }
        }
    };

    // Add trainer API call
    const addTrainerToAPI = async (formData) => {
        try {
            const token = tokenManager.getAccessToken();
            if (!token) {
                alert('❌ No authentication token found');
                return false;
            }

            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                gym_id: formData.gym_id,
                branch_id: formData.branch_id,
                shift_id: formData.shift_id,
                joining_date: formData.joining_date,
                specialization: formData.specialization,
                experience: parseFloat(formData.experience_years),
                availability: formData.availability_status,
                certifications: formData.certifications,
                bio: formData.bio,
                profile_photo: formData.profile_photo_url || null,
                status: formData.status === 'ACTIVE' ? 'Active' : 'Inactive'
            };

            console.log('📤 Sending API Request');
            console.log('URL:', `${API_BASE_URL}/api/trainer/addTrainer`);
            console.log('Token Present:', !!token);
            console.log('Payload Fields:', Object.keys(payload));

            const url = `${API_BASE_URL}/api/trainer/addTrainer`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 Response Status:', response.status, response.statusText);

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('❌ Failed to parse response as JSON');
                const text = await response.text();
                console.error('Response Text:', text);
                throw new Error(`Invalid response format: ${response.statusText}`);
            }

            console.log('📥 Response Data:', data);

            // Check if response indicates success (even if status code is not ok)
            if (data?.status === 'success' || data?.status === 'ok') {
                alert('✅ Trainer added successfully!');
                console.log('✅ Trainer added successfully');
                // Refresh trainers list
                const branches = gymBranches.length > 0 ? gymBranches : await fetchGymBranches();
                await fetchTrainers(branches, currentPage);
                return true;
            }

            // Handle error responses
            if (!response.ok || data?.status === 'error' || data?.status === 'failed') {
                const errorMsg = data?.message || data?.error || data?.errors || `API error: ${response.status} ${response.statusText}`;
                console.error('❌ API Error:', errorMsg);
                console.error('Full Error Data:', data);
                throw new Error(errorMsg);
            }

            // If we get here with unexpected status
            console.warn('⚠️ Unexpected response:', data);
            throw new Error('Unexpected response from server');
        } catch (error) {
            console.error('❌ Error in addTrainerToAPI:', error.message);
            console.error('Error Stack:', error.stack);
            alert(`❌ Failed to add trainer: ${error.message}`);
            return false;
        }
    };

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
            setTrainerImagePreview(null);
            setShowPassword(false);
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

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (activeTab === 'trainers') {
            // Validate required fields
            if (!trainerFormData.name) {
                alert('Please enter trainer name');
                return;
            }
            if (!trainerFormData.email) {
                alert('Please enter email');
                return;
            }
            if (!trainerFormData.phone) {
                alert('Please enter phone number');
                return;
            }
            if (!trainerFormData.password) {
                alert('Please enter password');
                return;
            }
            if (!trainerFormData.branch_id) {
                alert('Please select branch');
                return;
            }
            if (!trainerFormData.specialization) {
                alert('Please enter specialization');
                return;
            }
            if (!trainerFormData.experience_years) {
                alert('Please enter experience');
                return;
            }
            if (!trainerFormData.certifications) {
                alert('Please enter certifications');
                return;
            }
            if (!trainerFormData.bio) {
                alert('Please enter bio');
                return;
            }
            if (!trainerFormData.profile_photo_url) {
                alert('Please upload profile photo');
                return;
            }

            setIsSubmittingTrainer(true);
            const success = await addTrainerToAPI(trainerFormData);
            setIsSubmittingTrainer(false);
            if (success) {
                setShowAddModal(false);
                setTrainerImagePreview(null);
                setTrainerFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'TRAINER',
                    gym_id: 1,
                    branch_id: 1,
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
            }
        } else {
            const newStaff = {
                staff_id: staff.length + 1,
                user_id: 3000 + staff.length + 1,
                ...staffFormData,
                salary_monthly: parseFloat(staffFormData.salary_monthly)
            };
            setStaff([newStaff, ...staff]);
            alert('Staff member added successfully!');
            setShowAddModal(false);
        }
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
                    <i className="fas fa-ban"></i>
                    <div>
                        <span className="staff-stat-label">Inactive Staff</span>
                        <span className="staff-stat-value">{stats.inactiveStaff}</span>
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
                    {gymBranches.map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_name}>
                            {branch.branch_name}
                        </option>
                    ))}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="staff-filter">
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
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
                {isLoadingTrainers && (
                    <div className="staff-loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading trainers...</p>
                    </div>
                )}
                {trainersError && activeTab === 'trainers' && (
                    <div className="staff-error-state">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>{trainersError}</p>
                        <button className="staff-btn-secondary" onClick={fetchTrainers}>
                            <i className="fas fa-redo"></i>
                            Retry
                        </button>
                    </div>
                )}
                {!isLoadingTrainers && !trainersError && (
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
                            {(activeTab === 'trainers' ? paginatedTrainers : paginatedStaff).length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'trainers' ? '10' : '10'} className="staff-no-data">
                                        <i className="fas fa-inbox"></i>
                                        <p>No {activeTab === 'trainers' ? 'trainers' : 'staff members'} found</p>
                                    </td>
                                </tr>
                            ) : (
                                (activeTab === 'trainers' ? paginatedTrainers : paginatedStaff).map((item) => (
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
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoadingTrainers && !trainersError && (
                <div className="staff-pagination">
                    <div className="staff-pagination-info">
                        {activeTab === 'trainers'
                            ? `Page ${currentPage} of ${totalPages} • ${totalTrainers} Trainers`
                            : `Page ${currentStaffPage} of ${staffTotalPages} • ${filteredStaff.length} Members`}
                    </div>
                    <div className="staff-pagination-controls">
                        <button
                            className="staff-pagination-btn"
                            onClick={() => activeTab === 'trainers' ? handlePageChange(currentPage - 1) : setCurrentStaffPage(currentStaffPage - 1)}
                            disabled={activeTab === 'trainers' ? currentPage === 1 : currentStaffPage === 1}
                            title="Previous Page"
                        >
                            <i className="fas fa-chevron-left"></i>
                            <span>Prev</span>
                        </button>

                        <div className="staff-pagination-numbers">
                            {Array.from({
                                length: activeTab === 'trainers' ? totalPages : staffTotalPages
                            }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`staff-pagination-number ${
                                        page === (activeTab === 'trainers' ? currentPage : currentStaffPage) ? 'active' : ''
                                    }`}
                                    onClick={() => activeTab === 'trainers' ? handlePageChange(page) : setCurrentStaffPage(page)}
                                    title={`Go to page ${page}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="staff-pagination-btn"
                            onClick={() => activeTab === 'trainers' ? handlePageChange(currentPage + 1) : setCurrentStaffPage(currentStaffPage + 1)}
                            disabled={activeTab === 'trainers' ? currentPage === totalPages : currentStaffPage === staffTotalPages}
                            title="Next Page"
                        >
                            <span>Next</span>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}

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
                            {/* Trainer Header with Photo and Basic Info */}
                            {activeTab === 'trainers' && (
                                <div className="staff-trainer-header">
                                    {/* Profile Photo */}
                                    <div className="staff-photo-section">
                                        <div className="staff-profile-photo-container">
                                            {selectedItem.profile_photo_url ? (
                                                <img
                                                    src={selectedItem.profile_photo_url}
                                                    alt={selectedItem.name}
                                                    className="staff-profile-photo"
                                                />
                                            ) : (
                                                <div className="staff-profile-photo-placeholder">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Basic Information */}
                                    <div className="staff-trainer-basic-info">
                                        <h2 className="staff-trainer-name">{selectedItem.name}</h2>
                                        <p className="staff-trainer-specialization">{selectedItem.specialization}</p>
                                        <div className="staff-trainer-quick-info">
                                            <div className="staff-quick-info-item">
                                                <span className="staff-quick-info-label">Email</span>
                                                <span className="staff-quick-info-value">{selectedItem.email}</span>
                                            </div>
                                            <div className="staff-quick-info-item">
                                                <span className="staff-quick-info-label">Phone</span>
                                                <span className="staff-quick-info-value">{selectedItem.phone}</span>
                                            </div>
                                            <div className="staff-quick-info-item">
                                                <span className="staff-quick-info-label">Branch</span>
                                                <span className="staff-quick-info-value">{selectedItem.branch_name}</span>
                                            </div>
                                            <div className="staff-quick-info-item">
                                                <span className="staff-quick-info-label">Shift</span>
                                                <span className="staff-quick-info-value">{selectedItem.shift_name}</span>
                                            </div>
                                            <div className="staff-quick-info-item">
                                                <span className="staff-quick-info-label">Joining Date</span>
                                                <span className="staff-quick-info-value">{selectedItem.joining_date}</span>
                                            </div>
                                            <div className="staff-quick-info-item">
                                                <span className="staff-quick-info-label">Status</span>
                                                <span className={`staff-status-badge ${getStatusBadgeClass(selectedItem.status)}`}>
                                                    {selectedItem.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Personal Information for Staff */}
                            {activeTab !== 'trainers' && (
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
                            )}

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
                    setShowPassword(false);
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
                                setShowPassword(false);
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
                                        <div className="staff-password-input-wrapper">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={activeTab === 'trainers' ? trainerFormData.password : staffFormData.password}
                                                onChange={(e) => activeTab === 'trainers'
                                                    ? setTrainerFormData({ ...trainerFormData, password: e.target.value })
                                                    : setStaffFormData({ ...staffFormData, password: e.target.value })}
                                                placeholder="Enter password"
                                                required={showAddModal}
                                            />
                                            <button
                                                type="button"
                                                className="staff-password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                title={showPassword ? "Hide password" : "Show password"}
                                            >
                                                <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
                                            </button>
                                        </div>
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
                                            <option value="">Select a Branch</option>
                                            {gymBranches.map((branch) => (
                                                <option key={branch.branch_id} value={branch.branch_id}>
                                                    {branch.branch_id} - {branch.branch_name}
                                                </option>
                                            ))}
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
                                                <label>Profile Photo *</label>
                                                <div
                                                    className={`staff-image-upload-zone ${isDraggingImage ? 'dragging' : ''} ${trainerImagePreview ? 'has-image' : ''}`}
                                                    onDragOver={handleImageDragOver}
                                                    onDragLeave={handleImageDragLeave}
                                                    onDrop={handleImageDrop}
                                                >
                                                    <div className="staff-image-display-section">
                                                        <div className="staff-image-preview-box">
                                                            {trainerImagePreview ? (
                                                                <>
                                                                    <img src={trainerImagePreview} alt="Preview" className="staff-image-preview-img" />
                                                                    <div className="staff-image-overlay">
                                                                        <label htmlFor="trainer-image-input" className="staff-image-change-btn">
                                                                            <i className="fas fa-edit"></i>
                                                                            Change
                                                                        </label>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="staff-image-placeholder">
                                                                    <i className="fas fa-cloud-upload-alt"></i>
                                                                    <p className="staff-upload-title">Upload Profile Photo</p>
                                                                    <p className="staff-upload-subtitle">Drag and drop or click to browse</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <input
                                                        id="trainer-image-input"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleTrainerImageUpload}
                                                        style={{ display: 'none' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                    <div className="staff-image-actions">
                                                        <label htmlFor="trainer-image-input" className="staff-image-upload-label">
                                                            <i className="fas fa-plus"></i>
                                                            {trainerImagePreview ? 'Change' : 'Upload'}
                                                        </label>
                                                        {trainerImagePreview && (
                                                            <button
                                                                type="button"
                                                                className="staff-image-remove-btn"
                                                                onClick={() => {
                                                                    setTrainerImagePreview(null);
                                                                    setTrainerFormData({ ...trainerFormData, profile_photo_url: '' });
                                                                }}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
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
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="staff-modal-actions">
                                <button type="button" className="staff-btn-secondary" onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setShowPassword(false);
                                }} disabled={isSubmittingTrainer && activeTab === 'trainers'}>
                                    Cancel
                                </button>
                                <button type="submit" className="staff-btn-primary" disabled={isSubmittingTrainer && activeTab === 'trainers'}>
                                    {isSubmittingTrainer && activeTab === 'trainers' ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            {showAddModal ? 'Adding...' : 'Updating...'}
                                        </>
                                    ) : (
                                        <>
                                            {showAddModal ? 'Add' : 'Update'} {activeTab === 'trainers' ? 'Trainer' : 'Staff'}
                                        </>
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
