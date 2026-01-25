import apiClient from './client';

export const ordersAPI = {
  /**
   * Create order from cart
   */
  createOrder: async (data) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrder: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Get user's orders
   */
  getUserOrders: async (params = {}) => {
    const response = await apiClient.get('/users/orders', { params });
    return response.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id, reason) => {
    const response = await apiClient.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

export default ordersAPI;
