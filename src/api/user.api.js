import apiClient from './client.js';

/**
 * Get user profile
 */
export const getProfile = async () => {
  const { data } = await apiClient.get('/users/profile');
  return data;
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
  const { data } = await apiClient.put('/users/profile', profileData);
  return data;
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  const { data } = await apiClient.post('/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async () => {
  const { data } = await apiClient.delete('/users/profile/image');
  return data;
};

/**
 * Change password
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await apiClient.post('/users/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
};

/**
 * Enable email-based 2FA
 */
export const enable2FA = async () => {
  const { data } = await apiClient.post('/users/enable-2fa');
  return data;
};

/**
 * Disable email-based 2FA
 */
export const disable2FA = async () => {
  const { data } = await apiClient.post('/users/disable-2fa');
  return data;
};

/**
 * Get user's orders
 */
export const getUserOrders = async (params = {}) => {
  const { data } = await apiClient.get('/users/orders', { params });
  return data;
};

const userAPI = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  enable2FA,
  disable2FA,
  getUserOrders,
};

export default userAPI;
