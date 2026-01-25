import apiClient from "./client";

export const adminAPI = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  },

  // Products
  getAllProducts: async (params = {}) => {
    const response = await apiClient.get("/admin/products", { params });
    return response.data;
  },

  createProduct: async (data) => {
    // Check if data is FormData (file upload) or regular object
    if (data instanceof FormData) {
      const response = await apiClient.post("/admin/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }
    const response = await apiClient.post("/admin/products", data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    // Check if data is FormData (file upload) or regular object
    if (data instanceof FormData) {
      const response = await apiClient.put(`/admin/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }
    const response = await apiClient.put(`/admin/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Users
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  suspendUser: async (id, reason) => {
    const response = await apiClient.post(`/admin/users/${id}/suspend`, {
      reason,
    });
    return response.data;
  },

  unsuspendUser: async (id) => {
    const response = await apiClient.post(`/admin/users/${id}/unsuspend`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Orders
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get("/admin/orders", { params });
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, {
      status,
    });
    return response.data;
  },
};

export default adminAPI;
