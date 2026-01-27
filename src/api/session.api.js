import apiClient from './client.js';

/**
 * Get all active sessions
 */
export const getMySessions = async () => {
  const { data } = await apiClient.get('/sessions');
  return data;
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId) => {
  const { data } = await apiClient.delete(`/sessions/${sessionId}`);
  return data;
};

/**
 * Revoke all sessions except current
 */
export const revokeAllSessions = async () => {
  const { data } = await apiClient.post('/sessions/revoke-all');
  return data;
};

/**
 * Get session statistics
 */
export const getSessionStats = async () => {
  const { data } = await apiClient.get('/sessions/stats');
  return data;
};

/**
 * Mark session as trusted
 */
export const trustSession = async (sessionId) => {
  const { data } = await apiClient.post(`/sessions/${sessionId}/trust`);
  return data;
};

export default {
  getMySessions,
  revokeSession,
  revokeAllSessions,
  getSessionStats,
  trustSession,
};
