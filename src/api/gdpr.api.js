import apiClient from './client.js';

/**
 * Export all user data
 */
export const exportUserData = async () => {
  const { data } = await apiClient.get('/gdpr/export-data');
  return data;
};

/**
 * Check account deletion eligibility
 */
export const getDeletionEligibility = async () => {
  const { data } = await apiClient.get('/gdpr/deletion-eligibility');
  return data;
};

/**
 * Request account deletion
 */
export const requestAccountDeletion = async (password, confirmation) => {
  const { data } = await apiClient.post('/gdpr/request-deletion', {
    password,
    confirmation,
  });
  return data;
};

export default {
  exportUserData,
  getDeletionEligibility,
  requestAccountDeletion,
};
