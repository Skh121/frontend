import apiClient from './client';

export const cartAPI = {
  /**
   * Get user's cart
   */
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  /**
   * Add item to cart
   */
  addToCart: async (productId, quantity) => {
    const response = await apiClient.post('/cart/items', {
      productId,
      quantity,
    });
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (productId, quantity) => {
    const response = await apiClient.put('/cart/items', {
      productId,
      quantity,
    });
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (productId) => {
    const response = await apiClient.delete('/cart/items', {
      data: { productId },
    });
    return response.data;
  },

  /**
   * Clear cart
   */
  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },
};

export default cartAPI;
