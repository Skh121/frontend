import apiClient from './client';

export const paymentAPI = {
  /**
   * Create payment intent for order
   */
  createPaymentIntent: async (orderId) => {
    const response = await apiClient.post('/payment/create-intent', {
      orderId,
    });
    return response.data;
  },
};

export default paymentAPI;
