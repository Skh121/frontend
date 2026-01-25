import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getCSRFToken, fetchCSRFToken } from '../utils/csrf';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add CSRF token
apiClient.interceptors.request.use(
  async (config) => {
    // Skip CSRF for GET requests
    if (config.method !== 'get') {
      let csrfToken = getCSRFToken();

      // Fetch CSRF token if not available
      if (!csrfToken) {
        csrfToken = await fetchCSRFToken();
      }

      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token
        await apiClient.post('/auth/refresh');

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle CSRF token errors - fetch new token and retry
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      try {
        await fetchCSRFToken();
        return apiClient(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
