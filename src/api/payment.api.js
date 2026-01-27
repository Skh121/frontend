import apiClient from "./client";

export const paymentAPI = {
  /**
   * Create payment intent for order
   */
  createPaymentIntent: async (orderId) => {
    const response = await apiClient.post("/payment/create-intent", {
      orderId,
    });
    return response.data;
  },

  /**
   * Manually confirm payment and complete order
   * Fallback for when webhooks don't work (e.g., localhost development)
   */
  confirmPayment: async (orderId) => {
    const response = await apiClient.post("/payment/confirm-payment", {
      orderId,
    });
    return response.data;
  },
};

export default paymentAPI;
