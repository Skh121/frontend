export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  BOOKS: 'books',
  HOME: 'home',
  SPORTS: 'sports',
  TOYS: 'toys',
  FOOD: 'food',
  BEAUTY: 'beauty',
  OTHER: 'other',
};

export const CATEGORY_LABELS = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  books: 'Books',
  home: 'Home & Garden',
  sports: 'Sports & Outdoors',
  toys: 'Toys & Games',
  food: 'Food & Beverages',
  beauty: 'Beauty & Personal Care',
  other: 'Other',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const STORAGE_KEYS = {
  USER: 'shopping_user',
  CART_COUNT: 'shopping_cart_count',
};

export const SESSION_IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes idle timeout
