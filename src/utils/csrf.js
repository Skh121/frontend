import { apiClient } from '../api/client';

let csrfToken = null;

/**
 * Fetch CSRF token from server
 */
export const fetchCSRFToken = async () => {
  try {
    const response = await apiClient.get('/csrf-token');
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

/**
 * Get current CSRF token
 */
export const getCSRFToken = () => csrfToken;

/**
 * Set CSRF token
 */
export const setCSRFToken = (token) => {
  csrfToken = token;
};
