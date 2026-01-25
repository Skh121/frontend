import apiClient from './client.js';

/**
 * Get user's activity logs
 */
export const getMyActivity = async (params = {}) => {
  const { data } = await apiClient.get('/audit/my-activity', { params });
  return data;
};

/**
 * Get user's login history
 */
export const getLoginHistory = async (params = {}) => {
  const { data } = await apiClient.get('/audit/login-history', { params });
  return data;
};

/**
 * Get user's security events
 */
export const getMySecurityEvents = async (params = {}) => {
  const { data } = await apiClient.get('/audit/security-events', { params });
  return data;
};

/**
 * Get user's activity statistics
 */
export const getMyStats = async () => {
  const { data } = await apiClient.get('/audit/stats');
  return data;
};

/**
 * Admin: Get all audit logs
 */
export const getAllLogs = async (params = {}) => {
  const { data } = await apiClient.get('/audit/admin/logs', { params });
  return data;
};

/**
 * Admin: Get security events
 */
export const getSecurityEvents = async (params = {}) => {
  const { data } = await apiClient.get('/audit/admin/security-events', { params });
  return data;
};

/**
 * Admin: Get failed login attempts
 */
export const getFailedLogins = async (params = {}) => {
  const { data } = await apiClient.get('/audit/admin/failed-logins', { params });
  return data;
};

/**
 * Admin: Get audit statistics
 */
export const getAuditStats = async () => {
  const { data } = await apiClient.get('/audit/admin/stats');
  return data;
};

/**
 * Admin: Get user's audit logs
 */
export const getUserLogs = async (userId, params = {}) => {
  const { data } = await apiClient.get(`/audit/admin/user/${userId}`, { params });
  return data;
};

export default {
  getMyActivity,
  getLoginHistory,
  getMySecurityEvents,
  getMyStats,
  getAllLogs,
  getSecurityEvents,
  getFailedLogins,
  getAuditStats,
  getUserLogs,
};
