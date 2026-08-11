import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MemberManagement.css";
import tokenManager from "../utils/tokenManager";
import { normalizeGender, toIntOrNull, isActiveStatus, findMatchingPlan } from "../utils/fieldUtils";
// Import eye icons for password visibility toggle
import eyeIcon from "../assets/icons8-eye-50.png";
import eyeSlashIcon from "../assets/icons8-invisible-48.png";
import InvoiceModal from "./InvoiceModal";

const renderFieldValue = (val, fallback = "Not provided") => {
  if (val === null || val === undefined) {
    return <span className="not-provided-tag"><i className="fas fa-minus-circle"></i> {fallback}</span>;
  }
  const str = String(val).trim();
  if (str === "" || str === "N/A" || str === "Not provided" || str === "Not specified" || str === "Not assigned" || str === "Unassigned" || str === "0") {
    return <span className="not-provided-tag"><i className="fas fa-minus-circle"></i> {fallback}</span>;
  }
  return <span className="field-value-provided">{str}</span>;
};

const calculateProfileCompletion = (member) => {
  if (!member) return { percentage: 0, filledCount: 0, totalCount: 15, level: 'low' };
  
  const fields = [
    { name: 'Full Name', value: member.name },
    { name: 'Registration Number', value: member.registration_number },
    { name: 'Email', value: member.email },
    { name: 'Phone', value: member.phone },
    { name: 'Gender', value: member.gender },
    { name: 'Date of Birth', value: member.date_of_birth },
    { name: 'Blood Group', value: member.blood_group },
    { name: 'Height', value: member.height_cm },
    { name: 'Weight', value: member.weight_kg },
    { name: 'Fitness Level', value: member.fitness_level },
    { name: 'Goal Focus', value: member.goal_focus },
    { name: 'Emergency Contact', value: member.emergency_contact },
    { name: 'Address', value: member.address_line1 },
    { name: 'City', value: member.city_name || member.city_id },
    { name: 'State', value: member.state_name || member.state_id },
  ];

  const filledCount = fields.filter(f => {
    if (f.value === null || f.value === undefined) return false;
    const str = String(f.value).trim().toLowerCase();
    return str !== '' && str !== 'not provided' && str !== 'not specified' && str !== 'not assigned' && str !== 'unassigned' && str !== '0' && str !== 'null';
  }).length;

  const totalCount = fields.length;
  const percentage = Math.round((filledCount / totalCount) * 100);

  let level = 'low';
  if (percentage >= 80) level = 'high';
  else if (percentage >= 50) level = 'medium';

  return { percentage, filledCount, totalCount, level };
};

const MemberManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [showMemberProfile, setShowMemberProfile] = useState(false);
  const [memberDetailsLoading, setMemberDetailsLoading] = useState(false);
  const [memberDetailsError, setMemberDetailsError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Tax Receipt display states
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Navigate to Member Subscriptions Desk
  const handleNavigateToSubscription = useCallback((userId) => {
    setShowMemberProfile(false);
    navigate(`/admin-dashboard/subscriptions?search=${encodeURIComponent(userId)}`);
  }, [navigate]);

  // Password visibility state for add member form
  const [showPassword, setShowPassword] = useState(false);

  // Password visibility state for edit member form
  const [showEditNewPassword, setShowEditNewPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

  // Notification/Toast state for better UX
  const [notification, setNotification] = useState(null);

  // Show notification with auto-dismiss
  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), duration);
  };

  // API state management
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    role: "MEMBER", // Default to MEMBER role for member management
    status: "", // All statuses
    gym_id: "",
    branch_id: "",
  });
  const [addFormData, setAddFormData] = useState({
    // User fields
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "MEMBER",
    registration_number: "",
    // Member fields
    branch_id: "",
    join_date: new Date().toISOString().split("T")[0],
    status: "",
    // Membership plan
    plan_id: "",
    payment_method: "UPI",
    // Profile fields
    dob: "",
    gender: "",
    blood_group: "",
    height_cm: "",
    weight_kg: "",
    fitness_level: "",
    goal_focus: "",
    emergency_contact: "",
    // Address fields
    address_line1: "",
    address_line2: "",
    country_id: "1",
    state_id: "",
    district: "",
    city: "",
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
    branches: false,
    membershipPlans: false,
  });

  // Membership plans - fetch from API
  const [membershipPlans, setMembershipPlans] = useState([]);

  // Form validation states
  const [addFormErrors, setAddFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  // API Configuration
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.fitnessguru.org.in";

  // Build full paths - check if they match your server structure
  const buildApiUrl = (endpoint) => {
    // If using the production URL, endpoints might be directly under /api/
    // If using localhost, they might be under /fitness-guru/api/
    const isLocalhost = API_BASE_URL.includes("localhost");
    const basePath = isLocalhost ? "/fitness-guru/api" : "/api";
    return `${API_BASE_URL}${basePath}/${endpoint}`;
  };

  const isActiveStatus = (value) => {
    if (value === 1 || value === "1") return true;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toUpperCase();
      return normalized === "ACTIVE" || normalized === "TRUE";
    }
    return false;
  };

  const toIntOrNull = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const normalizeMembershipPlan = (plan, index) => {
    const normalizedPlan = {
      ...plan,
      plan_id: plan.plan_id !== undefined && plan.plan_id !== null ? plan.plan_id : plan.plan_name,
      branch_id: toIntOrNull(plan.branch_id),
      gym_id: toIntOrNull(plan.gym_id),
      is_active: plan.status === "ACTIVE" || plan.status === 1 || isActiveStatus(plan.status),
      plan_name: plan.plan_name || `Plan ${index + 1}`,
      plan_type: plan.plan_type || "BASE_MEMBERSHIP",
    };

    return normalizedPlan;
  };

  const getPlanOptionValue = (plan) => {
    if (plan.plan_id !== undefined && plan.plan_id !== null && plan.plan_id !== "") {
      return String(plan.plan_id);
    }
    return plan.plan_name || "";
  };

  const isBranchMatched = (planBranchId, selectedBranchId) => {
    if (planBranchId === null || planBranchId === undefined || planBranchId === "") {
      return true;
    }
    return String(planBranchId) === String(selectedBranchId);
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    setDropdownLoading((prev) => ({ ...prev, countries: true }));
    try {
      const apiUrl = buildApiUrl("countryList");
      const response = await tokenManager.apiCall(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setCountries(data.data); // API returns data.data, not data.countries
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (err) {
      // Fallback to default data
      setCountries([{ country_id: 1, country_name: "India" }]);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, countries: false }));
    }
  };

  // Fetch states from API
  const fetchStates = async (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }

    setDropdownLoading((prev) => ({ ...prev, states: true }));
    try {
      const apiUrl = buildApiUrl(`stateList?country_id=${countryId}`);
      const response = await tokenManager.apiCall(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setStates(data.data);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (err) {
      setStates([]);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, states: false }));
    }
  };

  // Fetch districts from API
  const fetchDistricts = async (stateId) => {
    if (!stateId) {
      setDistricts([]);
      return;
    }

    setDropdownLoading((prev) => ({ ...prev, districts: true }));
    try {
      const apiUrl = buildApiUrl(`districtList?state_id=${stateId}`);
      const response = await tokenManager.apiCall(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setDistricts(data.data);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (err) {
      setDistricts([]);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  // Fetch gym branches from API
  const fetchBranches = async (gymId = 1) => {
    setDropdownLoading((prev) => ({ ...prev, branches: true }));
    try {
      const apiUrl = buildApiUrl(`gymBranchList?gym_id=${gymId}`);
      const response = await tokenManager.apiCall(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setBranches(data.data);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (err) {
      setBranches([]);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, branches: false }));
    }
  };

  // Fetch membership plans from API
  const fetchMembershipPlans = async (gymId = 1, branchId) => {
    // Both gymId and branchId are required for this API
    if (!gymId || !branchId) {
      setMembershipPlans([]);
      return;
    }

    setDropdownLoading((prev) => ({ ...prev, membershipPlans: true }));
    try {
      let url = buildApiUrl(
        `membership-plans?gym_id=${gymId}&branch_id=${branchId}&plan_type=BASE_MEMBERSHIP`,
      );

      let response = await tokenManager.apiCall(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        url = buildApiUrl(`membershipPlan?gym_id=${gymId}&branch_id=${branchId}`);
        response = await tokenManager.apiCall(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        const rawPlans = result.data || result.plans || [];
        const normalizedPlans = rawPlans.map(normalizeMembershipPlan);
        setMembershipPlans(normalizedPlans);
      } else {
        throw new Error(result.message || "Failed to fetch membership plans");
      }
    } catch (error) {
      setMembershipPlans([]);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, membershipPlans: false }));
    }
  };

  // Fetch cities from API
  const fetchCities = async (districtId) => {
    if (!districtId) {
      setCities([]);
      return;
    }

    setDropdownLoading((prev) => ({ ...prev, cities: true }));
    try {
      const response = await tokenManager.apiCall(
        buildApiUrl(`cityList?district_id=${districtId}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === "success") {
        setCities(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch cities");
      }
    } catch (error) {
      setCities([]);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  // Fetch members from API
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        role: filters.role,
      });

      // Add optional filters if they exist
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.gym_id) queryParams.append("gym_id", filters.gym_id);
      if (filters.branch_id) queryParams.append("branch_id", filters.branch_id);

      const response = await tokenManager.apiCall(
        buildApiUrl(`members/viewAllMembers?${queryParams}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const memberList = data.data || data.users || [];
        setMembers(memberList);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch members when filters change
  useEffect(() => {
    fetchMembers();
  }, [filters]);

  // Effect to fetch dropdown data on component mount
  useEffect(() => {
    fetchCountries();
    fetchBranches(1); // Fetch branches for gym_id = 1
    // Note: membershipPlans will be fetched when user selects a branch

    // Clean debug function - available in console as window.testAPI()
    if (typeof window !== "undefined") {
      window.testAPI = () => {
      };
    }
  }, []);

  // Effect to fetch states when country changes in add form
  useEffect(() => {
    if (addFormData.country_id) {
      fetchStates(addFormData.country_id);
    }
  }, [addFormData.country_id]);

  // Effect to fetch districts when state changes in add form
  useEffect(() => {
    if (addFormData.state_id) {
      fetchDistricts(addFormData.state_id);
    }
  }, [addFormData.state_id]);

  // Effect to fetch states when country changes in edit form
  useEffect(() => {
    if (editFormData?.country) {
      fetchStates(editFormData.country);
    }
  }, [editFormData?.country]);

  // Effect to fetch districts when state changes in edit form
  useEffect(() => {
    if (editFormData?.state) {
      fetchDistricts(editFormData.state);
    }
  }, [editFormData?.state]);

  // Effect to fetch cities when district changes in add form
  useEffect(() => {
    if (addFormData.district) {
      fetchCities(addFormData.district);
    }
  }, [addFormData.district]);

  // Effect to fetch cities when district changes in edit form
  useEffect(() => {
    if (editFormData?.district && !isNaN(Number(editFormData.district))) {
      fetchCities(editFormData.district);
    }
  }, [editFormData?.district]);

  // Auto-resolve State ID when states array loads
  useEffect(() => {
    if (showEditModal && editFormData && states.length > 0) {
      const currentState = editFormData.state || editFormData.state_name;
      if (currentState) {
        const found = states.find(
          (s) =>
            String(s.state_id || s.id) === String(currentState) ||
            s.state_name?.toLowerCase() === String(currentState).toLowerCase()
        );
        if (found) {
          const resolvedStateId = String(found.state_id || found.id);
          if (editFormData.state !== resolvedStateId) {
            setEditFormData((prev) => ({ ...prev, state: resolvedStateId }));
            fetchDistricts(resolvedStateId);
          }
        }
      }
    }
  }, [showEditModal, states.length]);

  // Auto-resolve District ID when districts array loads
  useEffect(() => {
    if (showEditModal && editFormData && districts.length > 0) {
      const currentDistrict = editFormData.district || editFormData.district_name;
      if (currentDistrict) {
        const found = districts.find(
          (d) =>
            String(d.district_id || d.id) === String(currentDistrict) ||
            d.district_name?.toLowerCase() === String(currentDistrict).toLowerCase()
        );
        if (found) {
          const resolvedDistrictId = String(found.district_id || found.id);
          if (editFormData.district !== resolvedDistrictId) {
            setEditFormData((prev) => ({ ...prev, district: resolvedDistrictId }));
            fetchCities(resolvedDistrictId);
          }
        }
      }
    }
  }, [showEditModal, districts.length]);

  // Auto-resolve City ID when cities array loads
  useEffect(() => {
    if (showEditModal && editFormData && cities.length > 0) {
      const currentCity = editFormData.city || editFormData.city_name;
      if (currentCity) {
        const found = cities.find(
          (c) =>
            String(c.city_id || c.id) === String(currentCity) ||
            c.city_name?.toLowerCase() === String(currentCity).toLowerCase()
        );
        if (found) {
          const resolvedCityId = String(found.city_id || found.id);
          if (editFormData.city !== resolvedCityId) {
            setEditFormData((prev) => ({ ...prev, city: resolvedCityId }));
          }
        }
      }
    }
  }, [showEditModal, cities.length]);

  // Real-time duplicate registration number validation for Edit Modal
  useEffect(() => {
    if (showEditModal && editFormData) {
      const regNum = editFormData.registration_number !== undefined && editFormData.registration_number !== null
        ? editFormData.registration_number.toString().trim()
        : "";
      const currentUserId = editFormData.user_id !== undefined && editFormData.user_id !== null
        ? editFormData.user_id.toString().trim()
        : "";

      if (regNum) {
        const duplicate = members.find((m) => {
          const mReg = (m.registration_number ?? m.reg_no ?? m.registration_no ?? m.reg_number ?? "").toString().trim();
          const mId = (m.user_id ?? m.id ?? m.member_id ?? "").toString().trim();
          return mReg === regNum && mId !== currentUserId;
        });

        if (duplicate) {
          setEditFormErrors((prev) => {
            const warningMsg = `Warning: Registration number "${regNum}" is already assigned to member ${duplicate.name || 'another member'}`;
            if (prev.registration_number === warningMsg) return prev;
            return { ...prev, registration_number: warningMsg };
          });
        } else {
          setEditFormErrors((prev) => {
            if (!prev.registration_number) return prev;
            const updated = { ...prev };
            delete updated.registration_number;
            return updated;
          });
        }
      } else {
        setEditFormErrors((prev) => {
          if (!prev.registration_number) return prev;
          const updated = { ...prev };
          delete updated.registration_number;
          return updated;
        });
      }
    }
  }, [showEditModal, editFormData?.registration_number, editFormData?.user_id, members]);

  // Real-time duplicate registration number validation for Add Modal
  useEffect(() => {
    if (showAddModal && addFormData) {
      const regNum = addFormData.registration_number !== undefined && addFormData.registration_number !== null
        ? addFormData.registration_number.toString().trim()
        : "";
      if (regNum) {
        const duplicate = members.find((m) => {
          const mReg = (m.registration_number ?? m.reg_no ?? m.registration_no ?? m.reg_number ?? "").toString().trim();
          return mReg === regNum;
        });

        if (duplicate) {
          setAddFormErrors((prev) => {
            const warningMsg = `Warning: Registration number "${regNum}" is already assigned to member ${duplicate.name || 'another member'}`;
            if (prev.registration_number === warningMsg) return prev;
            return { ...prev, registration_number: warningMsg };
          });
        } else {
          setAddFormErrors((prev) => {
            if (!prev.registration_number) return prev;
            const updated = { ...prev };
            delete updated.registration_number;
            return updated;
          });
        }
      } else {
        setAddFormErrors((prev) => {
          if (!prev.registration_number) return prev;
          const updated = { ...prev };
          delete updated.registration_number;
          return updated;
        });
      }
    }
  }, [showAddModal, addFormData?.registration_number, members]);

  // Effect to fetch membership plans when branch changes
  useEffect(() => {
    if (addFormData.branch_id || editFormData?.branch_id) {
      const branchId = addFormData.branch_id || editFormData?.branch_id;
      fetchMembershipPlans(1, branchId);
    }
  }, [addFormData.branch_id, editFormData?.branch_id]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Return members matching search query
  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true; // Return all if no search
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.phone?.includes(searchQuery) ||
      member.user_id?.toString().includes(searchQuery) ||
      member.registration_number?.toString().includes(searchQuery)
    );
  });

  // Fetch detailed member information
  const fetchMemberDetails = async (userId) => {
    setMemberDetailsLoading(true);
    setMemberDetailsError(null);

    try {
      const response = await tokenManager.apiCall(
        buildApiUrl(`members/view?user_id=${userId}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setMemberDetails(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch member details");
      }
    } catch (err) {
      setMemberDetailsError(err.message);
    } finally {
      setMemberDetailsLoading(false);
    }
  };

  const handleViewProfile = (member) => {
    setSelectedMember(member);
    setMemberDetails(member);
    setShowMemberProfile(true);
  };

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatHeight = (heightCm) => {
    if (!heightCm) return "Not provided";
    const feet = Math.floor(heightCm / 30.48);
    const inches = Math.round((heightCm % 30.48) / 2.54);
    return `${heightCm} cm (${feet}'${inches}")`;
  };

  const formatWeight = (weightKg) => {
    if (!weightKg) return "Not provided";
    return `${weightKg} kg`;
  };

  // Password visibility toggle function
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 1:
      case "ACTIVE":
        return "status-active";
      case 0:
      case "INACTIVE":
        return "status-inactive";
      default:
        return "status-default";
    }
  };

  const formatSubscriptionStatus = (status) => {
    return isActiveStatus(status) ? "Active" : "Inactive";
  };

  const handleEditMember = (member) => {
    let detailedMember = member;

    // Debug membership plan resolution
    const userPlanName = detailedMember.plan_name || "";

    // Function to find matching plan in available membership plans
    const findMatchingPlan = (userPlanName, availablePlans) => {
      if (!userPlanName || !availablePlans.length) return "";

      // Direct match on plan_name (exact match)
      const matchingPlan = availablePlans.find(plan =>
        plan.plan_name === userPlanName
      );

      if (matchingPlan) {
        const result = getPlanOptionValue(matchingPlan);
        // Ensure we return a string, not an object
        return typeof result === 'string' ? result : matchingPlan.plan_name;
      } else {
        return "";
      }
    };

    // Normalize gender value to match dropdown options (MALE, FEMALE, OTHER)
    const normalizedGender = (() => {
      const genderValue = detailedMember.gender || "";
      if (!genderValue) return "";

      const lowerGender = String(genderValue).toLowerCase();
      if (lowerGender === 'male' || lowerGender === 'm') return 'MALE';
      if (lowerGender === 'female' || lowerGender === 'f') return 'FEMALE';
      if (lowerGender === 'other' || lowerGender === 'o') return 'OTHER';

      // If it's already in correct format, use as-is
      if (['MALE', 'FEMALE', 'OTHER'].includes(String(genderValue))) return String(genderValue);

      return ""; // Empty if unrecognized
    })();

    // Normalize fitness level from database enum to UI dropdown values
    const normalizedFitnessLevel = (() => {
      const fitnessValue = detailedMember.fitness_level || "";
      if (!fitnessValue) return "";

      if (fitnessValue === "BEGINEER" || fitnessValue === "BEGINNER") return "BEGINNER";
      if (fitnessValue === "INTERMEDIATE") return "INTERMEDIATE";
      if (fitnessValue === "ADVANCE" || fitnessValue === "ADVANCED") return "ADVANCED";

      return String(fitnessValue);
    })();

    // Normalize goal focus from database enum to UI dropdown values
    const normalizedGoalFocus = (() => {
      const goalValue = detailedMember.goal_focus || "";
      if (!goalValue) return "";

      if (goalValue === "GENERAL" || goalValue === "GENERAL_FITNESS") return "GENERAL_FITNESS";
      if (goalValue === "WEIGHT_LOSS") return "WEIGHT_LOSS";
      if (goalValue === "FAT_LOSS") return "FAT_LOSS";
      if (goalValue === "MUSCLE_GAIN") return "MUSCLE_GAIN";
      if (goalValue === "STRENGTH") return "STRENGTH";
      if (goalValue === "ENDURANCE") return "ENDURANCE";

      return String(goalValue);
    })();

    const formData = {
      user_id: detailedMember.user_id,
      registration_number: detailedMember.registration_number || "",
      name: detailedMember.name || "",
      email: detailedMember.email || "",
      phone: detailedMember.phone || "",
      status:
        detailedMember.status === 1 || detailedMember.status === "1" || detailedMember.status === "ACTIVE"
          ? "ACTIVE"
          : detailedMember.status === 0 || detailedMember.status === "0" || detailedMember.status === "INACTIVE"
            ? "INACTIVE"
            : detailedMember.status === 2 || detailedMember.status === "2" || detailedMember.status === "SUSPENDED"
              ? "SUSPENDED"
              : "ACTIVE",

      // Profile information - format as YYYY-MM-DD for HTML5 date inputs
      dob: detailedMember.dob
        ? String(detailedMember.dob).split("T")[0]
        : detailedMember.date_of_birth
          ? String(detailedMember.date_of_birth).split("T")[0]
          : "",
      gender: normalizedGender,
      blood_group: detailedMember.blood_group || "",

      // Physical stats
      height:
        detailedMember.height !== undefined && detailedMember.height !== null
          ? detailedMember.height
          : parseFloat(detailedMember.height_cm) || "",
      weight:
        detailedMember.weight !== undefined && detailedMember.weight !== null
          ? detailedMember.weight
          : parseFloat(detailedMember.weight_kg) || "",
      fitness_level: normalizedFitnessLevel,
      goal_focus: normalizedGoalFocus,

      // Gym and membership
      branch_id: detailedMember.branch_id ? String(detailedMember.branch_id) : "",
      membership_plan_raw: userPlanName,
      join_date: detailedMember.join_date
        ? String(detailedMember.join_date).split("T")[0]
        : detailedMember.date_of_joining
          ? String(detailedMember.date_of_joining).split("T")[0]
          : "",

      // Contact and address
      emergency_contact: detailedMember.emergency_contact || "",
      country: detailedMember.country !== undefined && detailedMember.country !== null ? String(detailedMember.country) : detailedMember.country_id !== undefined && detailedMember.country_id !== null ? String(detailedMember.country_id) : "1",
      state: detailedMember.state !== undefined && detailedMember.state !== null ? String(detailedMember.state) : detailedMember.state_id !== undefined && detailedMember.state_id !== null ? String(detailedMember.state_id) : "",
      state_name: detailedMember.state_name || (typeof detailedMember.state === "string" ? detailedMember.state : ""),
      district: detailedMember.district !== undefined && detailedMember.district !== null ? String(detailedMember.district) : detailedMember.district_id !== undefined && detailedMember.district_id !== null ? String(detailedMember.district_id) : "",
      district_name: detailedMember.district_name || (typeof detailedMember.district === "string" ? detailedMember.district : ""),
      city: detailedMember.city !== undefined && detailedMember.city !== null ? String(detailedMember.city) : detailedMember.city_id !== undefined && detailedMember.city_id !== null ? String(detailedMember.city_id) : "",
      city_name: detailedMember.city_name || (typeof detailedMember.city === "string" ? detailedMember.city : ""),
      address_line1: detailedMember.address_line1 || "",
      address_line2: detailedMember.address_line2 || "",

      // Password fields (optional)
      new_password: "",
      confirm_password: "",
    };

    // Clear any existing validation errors
    setEditFormErrors({});

    // Open modal immediately
    setEditFormData(formData);
    setShowEditModal(true);

    // Trigger cascading fetches for member location
    Promise.allSettled([
      fetchBranches(1),
      formData.branch_id ? fetchMembershipPlans(1, formData.branch_id) : Promise.resolve(),
      fetchStates(formData.country || "1"),
      formData.state ? fetchDistricts(formData.state) : Promise.resolve(),
      formData.district ? fetchCities(formData.district) : Promise.resolve(),
    ]).catch((dropdownError) => {
    });

    setShowMemberProfile(false);
  };

  const handleDeleteMember = (member) => {
    if (
      window.confirm(
        `Are you sure you want to delete member: ${member.name}?\n\nThis action cannot be undone.`,
      )
    ) {
      setMembers(members.filter((m) => m.member_id !== member.member_id));
      showNotification(`Member ${member.name} has been deleted successfully!`, 'success');
    }
  };

  // useEffect to handle plan matching when membership plans are loaded
  React.useEffect(() => {
    if (editFormData?.branch_id && editFormData?.membership_plan_raw && membershipPlans.length > 0) {
      const availablePlans = getAvailablePlans(editFormData.branch_id);
      const matchingPlanId = findMatchingPlan(editFormData.membership_plan_raw, availablePlans);

      if (matchingPlanId && matchingPlanId !== editFormData.membership_plan) {
        setEditFormData(prev => ({
          ...prev,
          membership_plan: typeof matchingPlanId === 'string' ? matchingPlanId : matchingPlanId.plan_name || ""
        }));
      }
    }
  }, [editFormData?.branch_id, editFormData?.membership_plan_raw, membershipPlans.length]);

  // Enhanced form change handler for edit form
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Clear validation error for this field when user starts typing/selecting (except registration_number managed by useEffect)
    if (editFormErrors[name] && name !== "registration_number") {
      setEditFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    setEditFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Reset dependent fields when parent changes (for location dropdowns)
      if (name === "country") {
        updated.state = "";
        updated.district = "";
        updated.city = "";
        if (value) fetchStates(value);
      } else if (name === "state") {
        updated.district = "";
        updated.city = "";
        if (value) fetchDistricts(value);
      } else if (name === "district") {
        updated.city = "";
        if (value) fetchCities(value);
      } else if (name === "branch_id") {
        // Reset plan selection when branch changes
        updated.membership_plan = "";
        // Fetch membership plans for the selected branch
        if (value) {
          fetchMembershipPlans(1, value);
        } else {
          setMembershipPlans([]);
        }
      }

      return updated;
    });
  };

  // Form validation functions
  const validateAddForm = (formData) => {
    const errors = {};

    // Required field validation
    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    if (!formData.password?.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (!formData.branch_id) {
      errors.branch_id = "Please select a branch";
    }

    if (!formData.status) {
      errors.status = "Please select a status";
    }

    if (!formData.plan_id) {
      errors.plan_id = "Please select a membership plan";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    }

    if (!formData.gender) {
      errors.gender = "Please select gender";
    }

    if (!formData.country_id) {
      errors.country_id = "Please select country";
    }

    if (!formData.state_id) {
      errors.state_id = "Please select state";
    }

    if (!formData.district) {
      errors.district = "Please select district";
    }

    if (!formData.city) {
      errors.city = "Please select city";
    }

    // Registration number validation (Required + Unique)
    if (!formData.registration_number?.toString().trim()) {
      errors.registration_number = "Registration number is required";
    } else {
      const regNum = formData.registration_number.toString().trim();
      const duplicate = members.find(
        (m) => m.registration_number?.toString().trim() === regNum
      );
      if (duplicate) {
        errors.registration_number = `Warning: Registration number "${regNum}" is already assigned to member ${duplicate.name}`;
      }
    }

    return errors;
  };

  const validateEditForm = (formData) => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!formData.branch_id) {
      errors.branch_id = "Please select a branch";
    }

    if (!formData.country) {
      errors.country = "Please select country";
    }

    if (!formData.state) {
      errors.state = "Please select state";
    }

    if (!formData.district) {
      errors.district = "Please select district";
    }

    if (!formData.city) {
      errors.city = "Please select city";
    }

    // Registration number validation (Required + Unique)
    if (!formData.registration_number?.toString().trim()) {
      errors.registration_number = "Registration number is required";
    } else {
      const regNum = formData.registration_number.toString().trim();
      const currentUserId = (formData.user_id ?? formData.id ?? "").toString().trim();
      const duplicate = members.find((m) => {
        const mReg = (m.registration_number ?? m.reg_no ?? m.registration_no ?? m.reg_number ?? "").toString().trim();
        const mId = (m.user_id ?? m.id ?? m.member_id ?? "").toString().trim();
        return mReg === regNum && mId !== currentUserId;
      });
      if (duplicate) {
        errors.registration_number = `Warning: Registration number "${regNum}" is already assigned to member ${duplicate.name || 'another member'}`;
      }
    }

    // Password validation if passwords are provided
    if (formData.new_password || formData.confirm_password) {
      if (formData.new_password !== formData.confirm_password) {
        errors.new_password = "New password and confirm password do not match";
        errors.confirm_password = "Passwords do not match";
      }
      if (formData.new_password && formData.new_password.length < 6) {
        errors.new_password = "Password must be at least 6 characters long";
      }
    }

    return errors;
  };

  // Validation error message component
  const ValidationError = ({ error }) => {
    if (!error) return null;
    return (
      <div className="validation-error-message">
        <i className="fas fa-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    );
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setEditFormErrors({}); // Clear previous errors

    if (!editFormData) return;

    // Validate form
    const errors = validateEditForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      const firstError = Object.values(errors)[0];
      showNotification(`Validation Error: ${firstError}`, 'error');
      return;
    }

    setLoading(true);

    try {
      // Prepare update data matching Section 3 (Update Member API) specification
      // Ensure all expected array keys exist in payload so PHP backend array access won't throw Undefined Array Key Warnings
      const updateData = {
        user_id: editFormData.user_id,
        registration_number: editFormData.registration_number ? parseInt(editFormData.registration_number, 10) : 0,

        // Basic user information
        name: editFormData.name ? editFormData.name.trim() : "",
        email: editFormData.email ? editFormData.email.trim() : "",
        phone: editFormData.phone ? editFormData.phone.trim() : "",
        branch_id: editFormData.branch_id ? parseInt(editFormData.branch_id, 10) : 0,
        status: editFormData.status === "ACTIVE" ? 1 : editFormData.status === "INACTIVE" ? 0 : editFormData.status === "SUSPENDED" ? 2 : 1,

        // Profile information
        join_date: editFormData.join_date || "",
        dob: editFormData.dob || "",
        gender: editFormData.gender || "",
        blood_group: editFormData.blood_group || "",

        // Physical stats
        height: editFormData.height !== "" && editFormData.height !== null && editFormData.height !== undefined ? parseFloat(editFormData.height) : 0,
        weight: editFormData.weight !== "" && editFormData.weight !== null && editFormData.weight !== undefined ? parseFloat(editFormData.weight) : 0,
        fitness_level: editFormData.fitness_level || "",
        goal_focus: editFormData.goal_focus || "",

        // Contact and address
        emergency_contact: editFormData.emergency_contact || "",
        country: editFormData.country ? parseInt(editFormData.country, 10) : 1,
        state: editFormData.state ? parseInt(editFormData.state, 10) : 0,
        district: editFormData.district ? parseInt(editFormData.district, 10) : 0,
        city: editFormData.city ? parseInt(editFormData.city, 10) : 0,
        address_line1: editFormData.address_line1 || "",
        address_line2: editFormData.address_line2 || "",
      };

      // Only include password fields if user actively typed a new password
      if (editFormData.new_password && editFormData.new_password.trim() !== "") {
        updateData.new_password = editFormData.new_password;
        updateData.confirm_password = editFormData.confirm_password;
      }


      const apiUrl = buildApiUrl("members/updateMember");

      const response = await tokenManager.apiCall(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const responseText = await response.text();

      // Extract JSON string from responseText (stripping PHP warning HTML output if present)
      let result = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = JSON.parse(responseText);
        }
      } catch (parseErr) {
      }

      if (response.status === 401 && result.message && result.message.toLowerCase().includes("invalid or expired token")) {
        throw new Error("Session expired or invalid token. Please log out and log in again.");
      }

      if (response.ok && (result.status === "success" || response.status === 200)) {
        showNotification(result.message || "Member details updated successfully! 🎉", 'success');
        setShowEditModal(false);
        setEditFormData(null);
        setEditFormErrors({});
        fetchMembers();
      } else {
        let errorMsg = result.message || `Failed to update member (HTTP ${response.status})`;
        const lowerMsg = errorMsg.toLowerCase();
        if (lowerMsg.includes("registration") || lowerMsg.includes("duplicate") || lowerMsg.includes("reg_no")) {
          errorMsg = "Warning: Registration number already exists for another member";
          setEditFormErrors(prev => ({ ...prev, registration_number: errorMsg }));
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.message || "";
      const isWarning = errorMsg.toLowerCase().includes("registration") || errorMsg.toLowerCase().includes("duplicate");
      showNotification(errorMsg, isWarning ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeMemberProfile = () => {
    setShowMemberProfile(false);
    setSelectedMember(null);
    setMemberDetails(null);
    setMemberDetailsError(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData(null);
    setEditFormErrors({}); // Clear validation errors when closing
  };

  const showComingSoon = (feature) => {
    showNotification(`${feature} feature is coming soon! 🚀 This feature is currently under development and will be available in a future update.`, 'info', 7000);
  };

  // Get filtered states based on selected country
  const getFilteredStates = () => {
    return states.filter(
      (state) => state.country_id === parseInt(addFormData.country_id),
    );
  };

  // Get filtered districts based on selected state
  const getFilteredDistricts = () => {
    return districts.filter(
      (district) => district.state_id === parseInt(addFormData.state_id),
    );
  };

  // Get filtered cities based on selected district
  const getFilteredCities = () => {
    return cities.filter(
      (city) =>
        city.district_id === parseInt(addFormData.district) &&
        isActiveStatus(city.status),
    );
  };

  // Helper functions for edit form dropdowns
  const getEditFilteredStates = () => {
    if (!editFormData?.country) return states;
    const countryId = String(editFormData.country);
    return states.filter((state) => {
      const cId = String(state.country_id ?? state.country ?? "1");
      return cId === countryId;
    });
  };

  const getEditFilteredDistricts = () => {
    if (!editFormData?.state) return districts;
    const stateId = String(editFormData.state);
    return districts.filter((district) => {
      const sId = String(district.state_id ?? district.state ?? "");
      return sId === stateId;
    });
  };

  const getEditFilteredCities = () => {
    if (!editFormData?.district) return cities;
    const districtId = String(editFormData.district);
    return cities.filter((city) => {
      const dId = String(city.district_id ?? city.district ?? "");
      const matchesDistrict = !dId || dId === districtId;
      const isActive = city.status === undefined || city.status === null || isActiveStatus(city.status);
      return matchesDistrict && isActive;
    });
  };

  // Get available plans based on selected branch (gym-wide plans + branch-specific plans) filtered by BASE_MEMBERSHIP
  const getAvailablePlans = (selectedBranchId) => {
    return membershipPlans.filter(
      (plan) =>
        plan.is_active &&
        isBranchMatched(plan.branch_id, selectedBranchId) &&
        (plan.plan_type ? plan.plan_type === "BASE_MEMBERSHIP" : true),
    );
  };

  // Get branch name from branch_id
  const getBranchName = (branchId) => {
    if (!branchId) return "N/A";
    const branch = branches.find((b) => String(b.branch_id) === String(branchId));
    return branch ? branch.branch_name : `Branch ${branchId}`;
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;

    // Clear validation error for this field when user starts typing/selecting (except registration_number managed by useEffect)
    if (addFormErrors[name] && name !== "registration_number") {
      setAddFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    setAddFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Reset dependent fields when parent changes
      if (name === "country_id") {
        updated.state_id = "";
        updated.district = "";
        updated.city = "";
      } else if (name === "state_id") {
        updated.district = "";
        updated.city = "";
      } else if (name === "district") {
        updated.city = "";
      } else if (name === "branch_id") {
        // Reset plan selection when branch changes
        updated.plan_id = "";
        // Fetch membership plans for the selected branch
        if (value) {
          fetchMembershipPlans(1, value);
        } else {
          // Clear membership plans if no branch selected
          setMembershipPlans([]);
        }
      }

      return updated;
    });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddFormErrors({}); // Clear previous errors

    // Validate form
    const errors = validateAddForm(addFormData);
    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }

    setLoading(true);

    try {


      // Handle membership plan ID mapping
      let membershipPlanId = null;
      if (addFormData.plan_id) {
        const selectedPlan = membershipPlans.find(plan =>
          String(plan.plan_id) === String(addFormData.plan_id) ||
          getPlanOptionValue(plan) === addFormData.plan_id ||
          plan.plan_name === addFormData.plan_id
        );

        if (selectedPlan && selectedPlan.plan_id && !isNaN(Number(selectedPlan.plan_id))) {
          membershipPlanId = Number(selectedPlan.plan_id);
        } else if (selectedPlan) {
          const planMap = {
            'Monthly Plan': 1,
            'Quarterly Plan': 2,
            'Yearly Plan': 3
          };
          membershipPlanId = planMap[selectedPlan.plan_name] || 1;
        } else if (!isNaN(Number(addFormData.plan_id))) {
          membershipPlanId = Number(addFormData.plan_id);
        } else {
          membershipPlanId = 1;
        }
      }

      // Prepare member data for API call matching the updated API spec
      const memberData = {
        name: addFormData.name || "",
        email: addFormData.email || "",
        phone: addFormData.phone || "",
        password: addFormData.password || "",
        gym_id: 1, // Default gym_id
        branch_id: parseInt(addFormData.branch_id) || 1,
        status: addFormData.status === "ACTIVE" ? 1 : addFormData.status === "INACTIVE" ? 0 : addFormData.status === "SUSPENDED" ? 2 : 1,
        registration_number: addFormData.registration_number ? parseInt(addFormData.registration_number, 10) : null,
        join_date:
          addFormData.join_date || new Date().toISOString().split("T")[0],
        membership_plan: membershipPlanId,
        payment_method: addFormData.payment_method || "UPI",
        dob: addFormData.dob || "",
        gender: addFormData.gender || "",
        blood_group: addFormData.blood_group || "",
        height: parseFloat(addFormData.height_cm) || 0,
        weight: parseFloat(addFormData.weight_kg) || 0,
        fitness_level: addFormData.fitness_level || "",
        goal_focus: addFormData.goal_focus || "",
        country: parseInt(addFormData.country_id) || 1,
        state: parseInt(addFormData.state_id) || 1,
        district: parseInt(addFormData.district) || 1,
        city: parseInt(addFormData.city) || 1,
        address_line1: addFormData.address_line1 || "",
        address_line2: addFormData.address_line2 || "",
        emergency_contact: addFormData.emergency_contact || "",
      };

      const response = await tokenManager.apiCall(
        buildApiUrl("members/addMember"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberData),
        },
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        const lowerMsg = errorMessage.toLowerCase();
        if (lowerMsg.includes("registration") || lowerMsg.includes("duplicate") || lowerMsg.includes("reg_no")) {
          errorMessage = "Warning: Registration number already exists for another member";
          setAddFormErrors(prev => ({ ...prev, registration_number: errorMessage }));
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.status === "success") {
        showNotification(`Member ${addFormData.name} has been added successfully! 🎉`, 'success');

        // Reset form and close modal
        setShowAddModal(false);
        setAddFormErrors({}); // Clear validation errors on success

        if (data.invoice_id) {
          setActiveInvoiceId(data.invoice_id);
          setShowInvoice(true);
        }
        setAddFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "MEMBER",
          registration_number: "",
          branch_id: "",
          join_date: new Date().toISOString().split("T")[0],
          status: "",
          plan_id: "",
          payment_method: "UPI",
          dob: "",
          gender: "",
          blood_group: "",
          height_cm: "",
          weight_kg: "",
          fitness_level: "",
          goal_focus: "",
          emergency_contact: "",
          address_line1: "",
          address_line2: "",
          country_id: "1",
          state_id: "",
          district: "",
          city: "",
        });

        // Refresh the members list
        fetchMembers();
      } else {
        throw new Error(data.message || "Failed to add member");
      }
    } catch (err) {

      // Enhanced error messages for better UX
      let errorMessage = "Failed to add member. Please try again.";

      if (err.message.includes('duplicate') || err.message.includes('already exists')) {
        errorMessage = "A member with this email or phone number already exists.";
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message.includes('validation') || err.message.includes('required')) {
        errorMessage = "Please check all required fields and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    // Reset form data with current date
    setAddFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "MEMBER",
      registration_number: "",
      branch_id: "",
      join_date: new Date().toISOString().split("T")[0], // Current date
      status: "",
      plan_id: "",
      payment_method: "UPI",
      dob: "",
      gender: "",
      blood_group: "",
      height_cm: "",
      weight_kg: "",
      fitness_level: "",
      goal_focus: "",
      emergency_contact: "",
      address_line1: "",
      address_line2: "",
      country_id: "1",
      state_id: "",
      district: "",
      city: "",
    });

    // Clear any existing validation errors
    setAddFormErrors({});

    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddFormErrors({}); // Clear validation errors when closing
  };

  // Toast Notification Component
  const ToastNotification = () => {
    if (!notification) return null;

    const getToastClass = (type) => {
      switch (type) {
        case 'success': return 'fg-toast fg-toast-success';
        case 'error': return 'fg-toast fg-toast-error';
        case 'warning': return 'fg-toast fg-toast-warning';
        default: return 'fg-toast fg-toast-info';
      }
    };

    const getToastIcon = (type) => {
      switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        default: return 'fas fa-info-circle';
      }
    };

    const getToastTitle = (type) => {
      switch (type) {
        case 'success': return 'Success';
        case 'error': return 'Error';
        case 'warning': return 'Warning';
        default: return 'Information';
      }
    };

    return (
      <div className="fg-toast-container">
        <div className={getToastClass(notification.type)}>
          <div className="fg-toast-icon">
            <i className={getToastIcon(notification.type)}></i>
          </div>
          <div className="fg-toast-body">
            <h4 className="fg-toast-title">{getToastTitle(notification.type)}</h4>
            <p className="fg-toast-message">{notification.message}</p>
          </div>
          <button
            className="fg-toast-close"
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="member-management">
      <ToastNotification />
      <div className="member-page-header">
        <h1 className="member-page-title">Members Management</h1>
        <p className="member-page-subtitle">
          Manage gym members and their information
        </p>
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
              onClick={() => setSearchQuery("")}
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
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            className="member-filter-select"
            value={filters.branch_id}
            onChange={(e) => handleFilterChange("branch_id", e.target.value)}
            disabled={dropdownLoading.branches}
          >
            {dropdownLoading.branches ? (
              <option value="">Loading branches...</option>
            ) : (
              <>
                <option value="">All Branches</option>
                {branches.map((branch) => (
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
            <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
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
          <span>
            TOTAL MEMBERS
            <strong>{members.length}</strong>
          </span>
        </div>
        <div className="member-stat-item">
          <i className="fas fa-search"></i>
          <span>
            FOUND RECORDS
            <strong>{filteredMembers.length}</strong>
          </span>
        </div>
        <div className="member-stat-item">
          <i className="fas fa-check-circle"></i>
          <span>
            ACTIVE MEMBERS
            <strong>
              {members.filter((m) => isActiveStatus(m.status)).length}
            </strong>
          </span>
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
            <div className="member-loader-spinner-wrapper">
              <div className="member-loader-ring"></div>
              <div className="member-loader-pulse"></div>
            </div>
            <p className="member-loader-text">Loading member records...</p>
            <div className="member-skeleton-table">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={`skel-${idx}`} className="member-skeleton-row">
                  <div className="member-skeleton-cell skel-short"></div>
                  <div className="member-skeleton-cell skel-medium"></div>
                  <div className="member-skeleton-cell skel-long"></div>
                  <div className="member-skeleton-cell skel-medium"></div>
                  <div className="member-skeleton-cell skel-short"></div>
                  <div className="member-skeleton-cell skel-badge"></div>
                  <div className="member-skeleton-cell skel-actions"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredMembers.length > 0 ? (
          <>
            <table className="member-table">
              <thead>
                <tr>
                  <th>Reg No.</th>
                  <th>Name</th>
                  <th>Email / Phone</th>
                  <th>Plan</th>
                  <th>Join Date</th>
                  <th>Branch</th>
                  <th>Trainer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr key={`member-${member.user_id || 'idx'}-${member.registration_number || member.subscription_id || index}-${index}`}>
                    <td className="member-reg-cell">
                      {member.registration_number ? `#${member.registration_number}` : "N/A"}
                    </td>
                    <td className="member-name-cell">
                      <i className="fas fa-user-circle"></i>
                      {member.name}
                    </td>
                    <td>
                      <div className="member-contact-info">
                        <div>{member.email}</div>
                        <small>{member.phone}</small>
                      </div>
                    </td>
                    <td>{member.plan_name || (member.membership_plan ? `Plan #${member.membership_plan}` : "N/A")}</td>
                    <td>{formatDate(member.date_of_joining || member.createdDate || member.join_date)}</td>
                    <td>{member.branch_name || getBranchName(member.branch_id)}</td>
                    <td>{member.trainer_name || "Unassigned"}</td>
                    <td>
                      <span
                        className={`member-status-badge ${getStatusBadgeClass(member.status)}`}
                      >
                        {isActiveStatus(member.status) ? "Active" : "Inactive"}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
          </>
        ) : (
          <div className="member-empty-state">
            <i className="fas fa-users-slash"></i>
            <h3>No Members Found</h3>
            <p>
              {searchQuery
                ? `No members match your search "${searchQuery}"`
                : "No members available with current filters"}
            </p>
            {searchQuery && (
              <button
                className="member-clear-search-btn"
                onClick={() => setSearchQuery("")}
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
          <div
            className="member-modal-content member-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="member-modal-header">
              <h2>
                <i className="fas fa-user-circle"></i>
                Member Profile - {selectedMember.name}
              </h2>
              <button
                className="member-modal-close"
                onClick={closeMemberProfile}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="member-modal-body">
              {memberDetailsLoading && (
                <div className="member-details-loading-state">
                  <div className="member-loader-spinner-wrapper">
                    <div className="member-loader-ring"></div>
                    <div className="member-loader-pulse"></div>
                  </div>
                  <p className="member-loader-text">Loading profile details...</p>
                </div>
              )}

              {memberDetailsError && (
                <div className="member-error-state">
                  <div className="member-error-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <h4>Error Loading Member Details</h4>
                  <p>{memberDetailsError}</p>
                  <button
                    className="member-retry-btn"
                    onClick={() => fetchMemberDetails(selectedMember.user_id)}
                  >
                    <i className="fas fa-redo"></i>
                    Retry
                  </button>
                </div>
              )}

              {memberDetails && !memberDetailsLoading && (
                <>
                  {/* Profile Completion Meter Card */}
                  {(() => {
                    const { percentage, filledCount, totalCount, level } = calculateProfileCompletion(memberDetails);
                    return (
                      <div className={`profile-completion-card level-${level}`}>
                        <div className="completion-info">
                          <div className="completion-title">
                            <i className="fas fa-chart-pie" style={{ color: level === 'high' ? '#10b981' : level === 'medium' ? '#f59e0b' : '#ef4444' }}></i>
                            Profile Completion
                            <span className={`completion-badge badge-${level}`}>{percentage}%</span>
                          </div>
                          <div className="completion-subtitle">
                            {filledCount} of {totalCount} key profile details completed
                          </div>
                        </div>
                        <div className="completion-bar-container">
                          <div
                            className={`completion-bar-fill fill-${level}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Basic Information */}
                  <div className="member-profile-section">
                    <h3 className="member-profile-section-title">
                      <i className="fas fa-info-circle"></i>
                      Basic Information
                    </h3>
                    <div className="member-profile-grid">
                      <div className="member-profile-item">
                        <label>Full Name</label>
                        <span>{renderFieldValue(memberDetails.name, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Reg No.</label>
                        <span style={{ fontWeight: 600, color: '#ff6b35' }}>
                          {memberDetails.registration_number ? `#${memberDetails.registration_number}` : renderFieldValue(null, "Not assigned")}
                        </span>
                      </div>
                      <div className="member-profile-item">
                        <label>User ID</label>
                        <span>#{memberDetails.user_id}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Email</label>
                        <span>{renderFieldValue(memberDetails.email, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Phone</label>
                        <span>{renderFieldValue(memberDetails.phone, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Gender</label>
                        <span>{renderFieldValue(memberDetails.gender, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Date of Birth</label>
                        <span>{memberDetails.date_of_birth ? formatDate(memberDetails.date_of_birth) : renderFieldValue(null, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Blood Group</label>
                        <span>{renderFieldValue(memberDetails.blood_group, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Status</label>
                        <span
                          className={`member-status-badge ${getStatusBadgeClass(memberDetails.status)}`}
                        >
                          {memberDetails.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Stats */}
                  <div className="member-profile-section">
                    <h3 className="member-profile-section-title">
                      <i className="fas fa-dumbbell"></i>
                      Physical Stats & Fitness
                    </h3>
                    <div className="member-profile-grid">
                      <div className="member-profile-item">
                        <label>Height</label>
                        <span>{memberDetails.height_cm ? formatHeight(memberDetails.height_cm) : renderFieldValue(null, "Not specified")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Weight</label>
                        <span>{memberDetails.weight_kg ? formatWeight(memberDetails.weight_kg) : renderFieldValue(null, "Not specified")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Fitness Level</label>
                        <span>{renderFieldValue(memberDetails.fitness_level, "Not specified")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Goal Focus</label>
                        <span>{renderFieldValue(memberDetails.goal_focus, "Not specified")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Emergency Contact</label>
                        <span>{renderFieldValue(memberDetails.emergency_contact, "Not provided")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gym & Membership */}
                  <div className="member-profile-section">
                    <h3 className="member-profile-section-title">
                      <i className="fas fa-building"></i>
                      Gym & Membership
                    </h3>
                    <div className="member-profile-grid">
                      <div className="member-profile-item">
                        <label>Gym</label>
                        <span>{renderFieldValue(memberDetails.gym_name, "N/A")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Branch</label>
                        <span>{renderFieldValue(memberDetails.branch_name, "N/A")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Date of Joining</label>
                        <span>{memberDetails.date_of_joining ? formatDate(memberDetails.date_of_joining) : renderFieldValue(null, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Membership Plan</label>
                        <span>{renderFieldValue(memberDetails.plan_name, "Not assigned")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Assigned Trainer</label>
                        <span>
                          {memberDetails.trainer_name ? `${memberDetails.trainer_name} (${memberDetails.trainer_phone || 'N/A'})` : renderFieldValue(null, "Unassigned")}
                        </span>
                      </div>
                      {memberDetails.days_remaining !== undefined && memberDetails.days_remaining !== null && (
                        <div className="member-profile-item">
                          <label>Days Remaining</label>
                          <span style={{ fontWeight: 600, color: '#27ae60' }}>
                            {memberDetails.days_remaining} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Subscription (Interactive Pointer Card) */}
                  <div
                    className="member-profile-section subscription-pointer-card"
                    onClick={() => handleNavigateToSubscription(memberDetails.user_id)}
                    title="Tap to jump to Subscriptions Desk for this member"
                  >
                    <div className="sub-card-header-row">
                      <h3 className="member-profile-section-title" style={{ margin: 0 }}>
                        <i className="fas fa-credit-card"></i>
                        Current Subscription
                      </h3>
                      <span className="sub-pointer-link-badge">
                        <i className="fas fa-external-link-alt"></i> Manage Subscriptions Desk <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>

                    {memberDetails.subscription_id ? (
                      <div className="member-profile-grid" style={{ marginTop: '1rem' }}>
                        <div className="member-profile-item">
                          <label>Subscription ID</label>
                          <span>#{memberDetails.subscription_id}</span>
                        </div>
                        <div className="member-profile-item">
                          <label>Plan Name</label>
                          <span>{renderFieldValue(memberDetails.plan_name, "N/A")}</span>
                        </div>
                        <div className="member-profile-item">
                          <label>Duration</label>
                          <span>{memberDetails.duration_months ? `${memberDetails.duration_months} month(s)` : renderFieldValue(null, "N/A")}</span>
                        </div>
                        <div className="member-profile-item">
                          <label>Start Date</label>
                          <span>{memberDetails.start_date ? formatDate(memberDetails.start_date) : renderFieldValue(null, "N/A")}</span>
                        </div>
                        <div className="member-profile-item">
                          <label>End Date</label>
                          <span>{memberDetails.end_date ? formatDate(memberDetails.end_date) : renderFieldValue(null, "N/A")}</span>
                        </div>
                        <div className="member-profile-item">
                          <label>Subscription Status</label>
                          <span
                            className={`member-status-badge ${getStatusBadgeClass(memberDetails.subscription_status)}`}
                          >
                            {formatSubscriptionStatus(memberDetails.subscription_status)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {renderFieldValue(null, "No Active Subscription")}
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Provision Subscription &rarr;</span>
                      </div>
                    )}
                  </div>

                  {/* Address Information */}
                  <div className="member-profile-section">
                    <h3 className="member-profile-section-title">
                      <i className="fas fa-map-marker-alt"></i>
                      Address Information
                    </h3>
                    <div className="member-profile-grid">
                      <div className="member-profile-item">
                        <label>Address Line 1</label>
                        <span>{renderFieldValue(memberDetails.address_line1, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Address Line 2</label>
                        <span>{renderFieldValue(memberDetails.address_line2, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>City</label>
                        <span>{renderFieldValue(memberDetails.city_name, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>District</label>
                        <span>{renderFieldValue(memberDetails.district_name, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>State</label>
                        <span>{renderFieldValue(memberDetails.state_name, "Not provided")}</span>
                      </div>
                      <div className="member-profile-item">
                        <label>Country</label>
                        <span>{renderFieldValue(memberDetails.country_name, "Not provided")}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="member-modal-footer">
              <button
                className="member-modal-btn member-edit"
                onClick={() => {
                  closeMemberProfile();
                  handleEditMember(selectedMember);
                }}
                disabled={memberDetailsLoading}
              >
                <i className="fas fa-edit"></i>
                Edit Member
              </button>
              <button
                className="member-modal-btn member-close"
                onClick={closeMemberProfile}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editFormData && (
        <div className="member-modal-overlay" onClick={closeEditModal}>
          <div
            className="member-modal-content member-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
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
                {/* User Account Information */}
                <div className="member-form-section">
                  <h3 className="member-form-section-title">
                    <i className="fas fa-user"></i>
                    User Account Information
                  </h3>
                  <div className="member-form-grid">
                    <div className="member-form-group">
                      <label>User ID (Read-only)</label>
                      <input
                        type="text"
                        value={`#${editFormData.user_id}`}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', fontWeight: 600, color: '#667eea' }}
                      />
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={editFormErrors.registration_number} />
                      <label>Registration Number *</label>
                      <input
                        type="number"
                        name="registration_number"
                        value={editFormData.registration_number}
                        onChange={handleFormChange}
                        placeholder="e.g. 1001"
                        required
                      />
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={editFormErrors.name} />
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
                      <ValidationError error={editFormErrors.email} />
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
                      <ValidationError error={editFormErrors.phone} />
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleFormChange}
                        required
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
                      <ValidationError error={editFormErrors.branch_id} />
                      <label>Branch *</label>
                      <select
                        name="branch_id"
                        value={editFormData.branch_id}
                        onChange={handleFormChange}
                        disabled={dropdownLoading.branches}
                        required
                      >
                        {dropdownLoading.branches ? (
                          <option key="loading-branches-edit" value="">
                            Loading branches...
                          </option>
                        ) : (
                          <>
                            <option key="select-branch-edit" value="">
                              Select Branch
                            </option>
                            {branches.map((branch) => (
                              <option
                                key={branch.branch_id}
                                value={branch.branch_id}
                              >
                                {branch.branch_name} -{" "}
                                {branch.city_name || branch.address}
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
                        value={editFormData.join_date}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="member-form-group">
                      <label>Current Plan (Read-only)</label>
                      <input
                        type="text"
                        value={editFormData.membership_plan_raw || "Assigned Plan"}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      />
                      <small style={{ color: '#7f8c8d', fontSize: '0.78rem', marginTop: '0.25rem', display: 'block' }}>
                        Membership plans are managed via the Subscriptions module.
                      </small>
                    </div>
                    <div className="member-form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleFormChange}
                      >
                        <option value="">Select Status</option>
                        <option key="ACTIVE-edit-status" value="ACTIVE">
                          Active
                        </option>
                        <option key="INACTIVE-edit-status" value="INACTIVE">
                          Inactive
                        </option>
                        <option key="SUSPENDED-edit-status" value="SUSPENDED">
                          Suspended
                        </option>
                      </select>
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
                      <ValidationError error={editFormErrors.dob} />
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={editFormData.dob}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={editFormErrors.gender} />
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={editFormData.gender || ""}
                        onChange={handleFormChange}
                      >
                        <option key="SELECT-GENDER-edit" value="">
                          Select Gender
                        </option>
                        <option key="MALE-edit" value="MALE">
                          Male
                        </option>
                        <option key="FEMALE-edit" value="FEMALE">
                          Female
                        </option>
                        <option key="OTHER-edit" value="OTHER">
                          Other
                        </option>
                      </select>
                    </div>
                    <div className="member-form-group">
                      <label>Blood Group</label>
                      <select
                        name="blood_group"
                        value={editFormData.blood_group}
                        onChange={handleFormChange}
                      >
                        <option key="SELECT-BLOOD-GROUP-edit" value="">
                          Select Blood Group
                        </option>
                        <option key="A+-edit" value="A+">
                          A+
                        </option>
                        <option key="A--edit" value="A-">
                          A-
                        </option>
                        <option key="B+-edit" value="B+">
                          B+
                        </option>
                        <option key="B--edit" value="B-">
                          B-
                        </option>
                        <option key="O+-edit" value="O+">
                          O+
                        </option>
                        <option key="O--edit" value="O-">
                          O-
                        </option>
                        <option key="AB+-edit" value="AB+">
                          AB+
                        </option>
                        <option key="AB--edit" value="AB-">
                          AB-
                        </option>
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
                        name="height"
                        value={editFormData.height}
                        onChange={handleFormChange}
                        placeholder="175.5"
                      />
                    </div>
                    <div className="member-form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="weight"
                        value={editFormData.weight}
                        onChange={handleFormChange}
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
                        value={editFormData.fitness_level}
                        onChange={handleFormChange}
                      >
                        <option key="SELECT-FITNESS-LEVEL-edit" value="">
                          Select Fitness Level
                        </option>
                        <option key="BEGINNER-edit" value="BEGINNER">
                          Beginner
                        </option>
                        <option key="INTERMEDIATE-edit" value="INTERMEDIATE">
                          Intermediate
                        </option>
                        <option key="ADVANCED-edit" value="ADVANCED">
                          Advanced
                        </option>
                      </select>
                    </div>
                    <div className="member-form-group">
                      <label>Goal Focus</label>
                      <select
                        name="goal_focus"
                        value={editFormData.goal_focus}
                        onChange={handleFormChange}
                      >
                        <option key="SELECT-GOAL-FOCUS-edit" value="">
                          Select Goal Focus
                        </option>
                        <option key="WEIGHT_LOSS-edit" value="WEIGHT_LOSS">
                          Weight Loss
                        </option>
                        <option key="FAT_LOSS-edit" value="FAT_LOSS">
                          Fat Loss
                        </option>
                        <option key="MUSCLE_GAIN-edit" value="MUSCLE_GAIN">
                          Muscle Gain
                        </option>
                        <option key="STRENGTH-edit" value="STRENGTH">
                          Strength
                        </option>
                        <option key="ENDURANCE-edit" value="ENDURANCE">
                          Endurance
                        </option>
                        <option key="GENERAL_FITNESS-edit" value="GENERAL_FITNESS">
                          General Fitness
                        </option>
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
                      <ValidationError error={editFormErrors.country} />
                      <label>Country *</label>
                      <select
                        name="country"
                        value={editFormData.country}
                        onChange={handleFormChange}
                        disabled={dropdownLoading.countries}
                        required
                      >
                        {dropdownLoading.countries ? (
                          <option key="loading-countries-edit" value="">
                            Loading countries...
                          </option>
                        ) : (
                          <>
                            <option key="select-country-edit" value="">
                              Select Country
                            </option>
                            {countries.map((country) => (
                              <option
                                key={country.country_id}
                                value={country.country_id}
                              >
                                {country.country_name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={editFormErrors.state} />
                      <label>State *</label>
                      <select
                        name="state"
                        value={String(editFormData.state || "")}
                        onChange={handleFormChange}
                        disabled={
                          !editFormData.country || dropdownLoading.states
                        }
                        required
                      >
                        {dropdownLoading.states ? (
                          <option key="loading-states-edit" value="">
                            Loading states...
                          </option>
                        ) : (
                          <>
                            <option key="select-state-edit" value="">
                              Select State
                            </option>
                            {getEditFilteredStates().map((state) => (
                              <option
                                key={`edit-state-${state.state_id || state.id}`}
                                value={String(state.state_id || state.id)}
                              >
                                {state.state_name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={editFormErrors.district} />
                      <label>District *</label>
                      <select
                        name="district"
                        value={String(editFormData.district || "")}
                        onChange={handleFormChange}
                        disabled={
                          !editFormData.state || dropdownLoading.districts
                        }
                        required
                      >
                        {dropdownLoading.districts ? (
                          <option key="loading-districts-edit" value="">
                            Loading districts...
                          </option>
                        ) : (
                          <>
                            <option key="select-district-edit" value="">
                              Select District
                            </option>
                            {getEditFilteredDistricts().map((district) => (
                              <option
                                key={`edit-district-${district.district_id || district.id}`}
                                value={String(district.district_id || district.id)}
                              >
                                {district.district_name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={editFormErrors.city} />
                      <label>City *</label>
                      <select
                        name="city"
                        value={String(editFormData.city || "")}
                        onChange={handleFormChange}
                        disabled={
                          !editFormData.district || dropdownLoading.cities
                        }
                        required
                      >
                        {dropdownLoading.cities ? (
                          <option key="loading-cities-edit" value="">
                            Loading cities...
                          </option>
                        ) : (
                          <>
                            <option key="select-city-edit" value="">
                              Select City
                            </option>
                            {getEditFilteredCities().map((city) => (
                              <option
                                key={`edit-city-${city.city_id || city.id}`}
                                value={String(city.city_id || city.id)}
                              >
                                {city.city_name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <div className="member-form-group member-full-width">
                      <label>Address Line 1</label>
                      <input
                        type="text"
                        name="address_line1"
                        value={editFormData.address_line1}
                        onChange={handleFormChange}
                        placeholder="Building, Street Address"
                      />
                    </div>
                    <div className="member-form-group member-full-width">
                      <label>Address Line 2</label>
                      <input
                        type="text"
                        name="address_line2"
                        value={editFormData.address_line2}
                        onChange={handleFormChange}
                        placeholder="Landmark, Area (Optional)"
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
                        value={editFormData.emergency_contact}
                        onChange={handleFormChange}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change Section (Optional) */}
                <div className="member-form-section">
                  <h3 className="member-form-section-title">
                    <i className="fas fa-lock"></i>
                    Password Change (Optional)
                  </h3>
                  <div className="member-form-grid">
                    <div className="member-form-group">
                      <label>New Password</label>
                      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                        <input
                          type={showEditNewPassword ? "text" : "password"}
                          name="new_password"
                          value={editFormData.new_password}
                          onChange={handleFormChange}
                          placeholder="Leave blank to keep current password"
                          minLength="6"
                          style={{
                            paddingRight: '45px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditNewPassword(!showEditNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                          }}
                          tabIndex={-1}
                          title={showEditNewPassword ? "Hide password" : "Show password"}
                        >
                          <img
                            src={showEditNewPassword ? eyeIcon : eyeSlashIcon}
                            alt={showEditNewPassword ? "Hide password" : "Show password"}
                            style={{ width: '20px', height: '20px', opacity: 0.7 }}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="member-form-group">
                      <label>Confirm New Password</label>
                      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                        <input
                          type={showEditConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          value={editFormData.confirm_password}
                          onChange={handleFormChange}
                          placeholder="Confirm new password"
                          minLength="6"
                          style={{
                            paddingRight: '45px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                          }}
                          tabIndex={-1}
                          title={showEditConfirmPassword ? "Hide password" : "Show password"}
                        >
                          <img
                            src={showEditConfirmPassword ? eyeIcon : eyeSlashIcon}
                            alt={showEditConfirmPassword ? "Hide password" : "Show password"}
                            style={{ width: '20px', height: '20px', opacity: 0.7 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="member-form-note">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Leave password fields blank to keep the current password
                      unchanged.
                    </span>
                  </div>
                </div>
              </div>

              <div className="member-modal-footer">
                <button
                  type="submit"
                  className="member-modal-btn member-save"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="member-modal-btn member-cancel"
                  onClick={closeEditModal}
                  disabled={loading}
                >
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
          <div
            className="member-modal-content member-edit-modal member-add-modal"
            onClick={(e) => e.stopPropagation()}
          >
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
                      <ValidationError error={addFormErrors.registration_number} />
                      <label>Registration Number *</label>
                      <input
                        type="number"
                        name="registration_number"
                        value={addFormData.registration_number}
                        onChange={handleAddFormChange}
                        placeholder="e.g. 1001"
                        required
                      />
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={addFormErrors.name} />
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
                      <ValidationError error={addFormErrors.email} />
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
                      <ValidationError error={addFormErrors.phone} />
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
                      <ValidationError error={addFormErrors.password} />
                      <label>Password *</label>
                      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={addFormData.password}
                          onChange={handleAddFormChange}
                          required
                          placeholder="Enter password"
                          minLength="6"
                          style={{
                            paddingRight: '45px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                          }}
                          tabIndex={-1}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          <img
                            src={showPassword ? eyeIcon : eyeSlashIcon}
                            alt={showPassword ? "Hide password" : "Show password"}
                            style={{ width: '20px', height: '20px', opacity: 0.7 }}
                          />
                        </button>
                      </div>
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
                      <ValidationError error={addFormErrors.branch_id} />
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
                            {branches.map((branch) => (
                              <option
                                key={branch.branch_id}
                                value={branch.branch_id}
                              >
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
                      <ValidationError error={addFormErrors.status} />
                      <label>Status</label>
                      <select
                        name="status"
                        value={addFormData.status}
                        onChange={handleAddFormChange}
                      >
                        <option value="">Select Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </div>
                    <div className="member-form-group">
                      <label>Payment Method *</label>
                      <select
                        name="payment_method"
                        value={addFormData.payment_method}
                        onChange={handleAddFormChange}
                        required
                      >
                        <option value="UPI">UPI</option>
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card / POS</option>
                        <option value="NET_BANKING">Net Banking</option>
                      </select>
                    </div>
                    <div className="member-form-group member-full-width">
                      <ValidationError error={addFormErrors.plan_id} />
                      <label>Membership Plan *</label>
                      <select
                        name="plan_id"
                        value={addFormData.plan_id}
                        onChange={handleAddFormChange}
                        required
                        disabled={!addFormData.branch_id}
                      >
                        <option key="select-plan" value="">
                          Select Membership Plan
                        </option>
                        {getAvailablePlans(addFormData.branch_id).map((plan, index) => (
                          <option
                            key={`plan-${plan.plan_id ?? plan.plan_name}-${index}`}
                            value={getPlanOptionValue(plan)}
                          >
                            {plan.plan_name}
                          </option>
                        ))}
                      </select>
                      {addFormData.plan_id && (
                        <small
                          style={{
                            color: "#7f8c8d",
                            marginTop: "0.5rem",
                            display: "block",
                          }}
                        >
                          {
                            membershipPlans.find(
                              (p) => {
                                // Try multiple comparison approaches
                                const pValue = getPlanOptionValue(p);
                                const selectedValue = String(addFormData.plan_id);
                                return pValue === selectedValue || p.plan_name === selectedValue;
                              },
                            )?.description
                          }
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
                      <ValidationError error={addFormErrors.dob} />
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={addFormData.dob}
                        onChange={handleAddFormChange}
                      />
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={addFormErrors.gender} />
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={addFormData.gender}
                        onChange={handleAddFormChange}
                        required
                      >
                        <option key="SELECT-GENDER" value="">
                          Select Gender
                        </option>
                        <option key="MALE" value="MALE">
                          Male
                        </option>
                        <option key="FEMALE" value="FEMALE">
                          Female
                        </option>
                        <option key="OTHER" value="OTHER">
                          Other
                        </option>
                      </select>
                    </div>
                    <div className="member-form-group">
                      <label>Blood Group</label>
                      <select
                        name="blood_group"
                        value={addFormData.blood_group}
                        onChange={handleAddFormChange}
                        required
                      >
                        <option key="SELECT-BLOOD-GROUP" value="">
                          Select Blood Group
                        </option>
                        <option key="A+" value="A+">
                          A+
                        </option>
                        <option key="A-" value="A-">
                          A-
                        </option>
                        <option key="B+" value="B+">
                          B+
                        </option>
                        <option key="B-" value="B-">
                          B-
                        </option>
                        <option key="O+" value="O+">
                          O+
                        </option>
                        <option key="O-" value="O-">
                          O-
                        </option>
                        <option key="AB+" value="AB+">
                          AB+
                        </option>
                        <option key="AB-" value="AB-">
                          AB-
                        </option>
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
                        required
                      >
                        <option key="SELECT-FITNESS-LEVEL" value="">
                          Select Fitness Level
                        </option>
                        <option key="BEGINNER" value="BEGINNER">
                          Beginner
                        </option>
                        <option key="INTERMEDIATE" value="INTERMEDIATE">
                          Intermediate
                        </option>
                        <option key="ADVANCED" value="ADVANCED">
                          Advanced
                        </option>
                      </select>
                    </div>
                    <div className="member-form-group">
                      <label>Goal Focus</label>
                      <select
                        name="goal_focus"
                        value={addFormData.goal_focus}
                        onChange={handleAddFormChange}
                        required
                      >
                        <option key="SELECT-GOAL-FOCUS" value="">
                          Select Goal Focus
                        </option>
                        <option key="WEIGHT_LOSS" value="WEIGHT_LOSS">
                          Weight Loss
                        </option>
                        <option key="FAT_LOSS" value="FAT_LOSS">
                          Fat Loss
                        </option>
                        <option key="MUSCLE_GAIN" value="MUSCLE_GAIN">
                          Muscle Gain
                        </option>
                        <option key="STRENGTH" value="STRENGTH">
                          Strength
                        </option>
                        <option key="ENDURANCE" value="ENDURANCE">
                          Endurance
                        </option>
                        <option key="GENERAL_FITNESS" value="GENERAL_FITNESS">
                          General Fitness
                        </option>
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
                      <ValidationError error={addFormErrors.country_id} />
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
                            {countries.map((country) => (
                              <option
                                key={country.country_id}
                                value={country.country_id}
                              >
                                {country.country_name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={addFormErrors.state_id} />
                      <label>State *</label>
                      <select
                        name="state_id"
                        value={addFormData.state_id}
                        onChange={handleAddFormChange}
                        required
                        disabled={
                          !addFormData.country_id || dropdownLoading.states
                        }
                      >
                        {dropdownLoading.states ? (
                          <option value="">Loading states...</option>
                        ) : (
                          <>
                            <option value="">Select State</option>
                            {getFilteredStates().map((state) => (
                              <option
                                key={state.state_id}
                                value={state.state_id}
                              >
                                {state.state_name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={addFormErrors.district} />
                      <label>District *</label>
                      <select
                        name="district"
                        value={addFormData.district}
                        onChange={handleAddFormChange}
                        required
                        disabled={
                          !addFormData.state_id || dropdownLoading.districts
                        }
                      >
                        {dropdownLoading.districts ? (
                          <option value="">Loading districts...</option>
                        ) : (
                          <>
                            <option value="">Select District</option>
                            {getFilteredDistricts().map((district) => (
                              <option
                                key={district.district_id}
                                value={district.district_id}
                              >
                                {district.district_name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <div className="member-form-group">
                      <ValidationError error={addFormErrors.city} />
                      <label>City *</label>
                      <select
                        name="city"
                        value={addFormData.city}
                        onChange={handleAddFormChange}
                        required
                        disabled={!addFormData.district}
                      >
                        <option key="select-city" value="">
                          Select City
                        </option>
                        {getFilteredCities().map((city) => (
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
                <button
                  type="button"
                  className="member-modal-btn member-cancel"
                  onClick={closeAddModal}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification />

      {/* Invoice Modal Popup */}
      <InvoiceModal
        isOpen={showInvoice}
        invoiceId={activeInvoiceId}
        onClose={() => {
          setShowInvoice(false);
          setActiveInvoiceId(null);
        }}
      />
    </div>
  );
};

export default MemberManagement;
