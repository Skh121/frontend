import apiClient from "./client";

export const authAPI = {
  /**
   * Register new user
   */
  register: async (data) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  /**
   * Verify email with PIN
   */
  verifyEmail: async (email, pin) => {
    const response = await apiClient.post("/auth/verify-email", { email, pin });
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password, captchaToken) => {
    const response = await apiClient.post("/auth/login", {
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
    const response = await apiClient.post("/auth/verify-2fa", { email, code });
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email, captchaToken) => {
    const response = await apiClient.post("/auth/forgot-password", {
      email,
      captchaToken,
    });
    return response.data;
  },

  /**
   * Reset password
   */
  resetPassword: async (token, password) => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    const response = await apiClient.post("/auth/refresh");
    return response.data;
  },

  /**
   * Enable email-based 2FA
   */
  enable2FA: async () => {
    const response = await apiClient.post("/users/enable-2fa");
    return response.data;
  },

  /**
   * Disable email-based 2FA
   */
  disable2FA: async () => {
    const response = await apiClient.post("/users/disable-2fa");
    return response.data;
  },

  // ========== TOTP/MFA Functions ==========

  /**
   * Setup TOTP (get QR code and secret)
   */
  setupTOTP: async () => {
    const response = await apiClient.post("/totp/setup");
    return response.data;
  },

  /**
   * Verify TOTP code and enable TOTP
   */
  verifyTOTP: async (code) => {
    const response = await apiClient.post("/totp/verify", { token: code });
    return response.data;
  },

  /**
   * Verify TOTP code during login
   */
  verifyTOTPLogin: async (email, code, isBackupCode = false) => {
    const response = await apiClient.post("/totp/verify-login", {
      email,
      token: code,
      useBackupCode: isBackupCode,
    });
    return response.data;
  },

  /**
   * Disable TOTP
   */
  disableTOTP: async (password) => {
    const response = await apiClient.post("/totp/disable", { password });
    return response.data;
  },

  /**
   * Get TOTP status
   */
  getTOTPStatus: async () => {
    const response = await apiClient.get("/totp/status");
    return response.data;
  },

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: async (password) => {
    const response = await apiClient.post("/totp/regenerate-backup-codes", {
      password,
    });
    return response.data;
  },

  // ========== OAuth Functions ==========

  /**
   * Google OAuth login/signup
   */
  googleAuth: async (credential) => {
    const response = await apiClient.post("/auth/google", { credential });
    return response.data;
  },
};

// Named exports for convenience
export const enable2FA = authAPI.enable2FA;
export const disable2FA = authAPI.disable2FA;
export const setupTOTP = authAPI.setupTOTP;
export const verifyTOTP = authAPI.verifyTOTP;
export const verifyTOTPLogin = authAPI.verifyTOTPLogin;
export const disableTOTP = authAPI.disableTOTP;
export const getTOTPStatus = authAPI.getTOTPStatus;
export const regenerateBackupCodes = authAPI.regenerateBackupCodes;
export const googleAuth = authAPI.googleAuth;

export default authAPI;
