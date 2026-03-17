/**
 * Utility functions for form field normalization and validation
 */

// Gender constants and normalization
export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];

export const normalizeGender = (value) => {
  if (!value) return '';

  const normalized = String(value).toLowerCase().trim();
  if (normalized === 'male' || normalized === 'm') return 'MALE';
  if (normalized === 'female' || normalized === 'f') return 'FEMALE';
  if (normalized === 'other' || normalized === 'o') return 'OTHER';

  // If already in correct format, return as-is
  if (GENDER_OPTIONS.includes(String(value))) return String(value);

  return ''; // Return empty for unrecognized values
};

// String normalization utilities
export const normalizeString = (value) => value?.trim() || '';
export const normalizeForSearch = (value) => value?.toLowerCase()?.trim() || '';

// Data conversion utilities
export const toIntOrNull = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const toFloatOrNull = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

// Status normalization
export const isActiveStatus = (value) => {
  if (value === 1 || value === "1" || value === true) return true;
  if (value === 0 || value === "0" || value === false) return false;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'active' || normalized === 'true' || normalized === '1';
  }
  return false;
};

// Plan matching utility
export const findMatchingPlan = (userPlanName, availablePlans) => {
  if (!userPlanName || !availablePlans.length) return null;

  return availablePlans.find(plan => plan.plan_name === userPlanName);
};