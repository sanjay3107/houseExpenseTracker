/**
 * API configuration file
 * This file centralizes API URL access for the application
 */

// Get the API URL from environment variables
// Use environment variable with fallback only for development
export const API_URL = import.meta.env.VITE_API_URL || '';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_URL}/api/auth/register`,
    LOGIN: `${API_URL}/api/auth/login`,
    LOGOUT: `${API_URL}/api/auth/logout`,
    RESET_PASSWORD: `${API_URL}/api/auth/reset-password`,
    VERIFY_TOKEN: `${API_URL}/api/auth/verify-token`,
  },
  // House endpoints
  HOUSE: {
    DETAILS: `${API_URL}/api/house-details`,
  },
  // Expense endpoints
  EXPENSES: {
    ALL: `${API_URL}/api/expenses`,
    CATEGORIES: `${API_URL}/api/expense-categories`,
  },
  // Loan calculator endpoints
  LOAN: {
    CALCULATE: `${API_URL}/api/loan-calculator/amortization-schedule`,
    PREPAYMENT: `${API_URL}/api/loan-calculator/prepayment-impact`,
  },
};

export default API_ENDPOINTS;
