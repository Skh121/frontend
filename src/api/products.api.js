import apiClient from "./client";

export const productsAPI = {
  /**
   * Get all products with filters
   */
  getProducts: async (params = {}) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  /**
   * Get single product
   */
  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit = 8) => {
    const response = await apiClient.get("/products/featured", {
      params: { limit },
    });
    return response.data;
  },
};

export default productsAPI;
