import apiClient from './client';

export const authAPI = {
  /**
   * Register new user
   */
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Verify email with PIN
   */
  verifyEmail: async (email, pin) => {
    const response = await apiClient.post('/auth/verify-email', { email, pin });
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password, captchaToken) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
      captchaToken,
    });
    return response.data;
  },

  /**
   * Verify 2FA code
   */
  verify2FA: async (email, code) => {
    const response = await apiClient.post('/auth/verify-2fa', { email, code });
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email, captchaToken) => {
    const response = await apiClient.post('/auth/forgot-password', {
      email,
      captchaToken,
    });
    return response.data;
  },

  /**
   * Reset password
   */
  resetPassword: async (token, password) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
};

export default authAPI;
