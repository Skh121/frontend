import apiClient from './client.js';

/**
 * Setup TOTP - Generate secret and QR code
 */
export const setupTOTP = async () => {
  const { data } = await apiClient.post('/totp/setup');
  return data;
};

/**
 * Verify TOTP token and enable TOTP
 */
export const verifyAndEnableTOTP = async (token) => {
  const { data } = await apiClient.post('/totp/verify', { token });
  return data;
};

/**
 * Disable TOTP
 */
export const disableTOTP = async (password) => {
  const { data } = await apiClient.post('/totp/disable', { password });
  return data;
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (password) => {
  const { data } = await apiClient.post('/totp/regenerate-backup-codes', { password });
  return data;
};

/**
 * Get TOTP status
 */
export const getTOTPStatus = async () => {
  const { data } = await apiClient.get('/totp/status');
  return data;
};

/**
 * Verify TOTP during login
 */
export const verifyTOTPLogin = async (email, token, useBackupCode = false) => {
  const { data } = await apiClient.post('/totp/verify-login', {
    email,
    token,
    useBackupCode,
  });
  return data;
};

export default {
  setupTOTP,
  verifyAndEnableTOTP,
  disableTOTP,
  regenerateBackupCodes,
  getTOTPStatus,
  verifyTOTPLogin,
};
