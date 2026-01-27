import apiClient from './client';

export const favoritesAPI = {
  /**
   * Get user's favorite products
   */
  getFavorites: async (params = {}) => {
    const response = await apiClient.get('/favorites', { params });
    return response.data;
  },

  /**
   * Toggle product in favorites
   */
  toggleFavorite: async (productId) => {
    const response = await apiClient.post('/favorites/toggle', { productId });
    return response.data;
  },

  /**
   * Check if product is favorited
   */
  checkFavorite: async (productId) => {
    const response = await apiClient.get(`/favorites/check/${productId}`);
    return response.data;
  },
};

export default favoritesAPI;
