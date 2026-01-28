import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { getCSRFToken, fetchCSRFToken } from "../utils/csrf";
import useAuthStore from "../store/authStore";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise = null;

// Only these routes are strictly blocked from triggering the refresh/retry logic
const REFRESH_META_ROUTES = ["/auth/refresh", "/csrf-token"];

// Request interceptor - add CSRF token
apiClient.interceptors.request.use(
  async (config) => {
    // Skip CSRF logic for GET requests
    if (config.method !== "get") {
      let csrfToken = getCSRFToken();

      // For standard 'business' routes (not logic-meta routes like refresh),
      // ensure we have a token if it's missing.
      if (
        !csrfToken &&
        !REFRESH_META_ROUTES.some((route) => config.url?.includes(route))
      ) {
        csrfToken = await fetchCSRFToken();
      }

      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh and retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // guard: if no config or already retried more than once, just fail
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Check for specific idle timeout code
      if (error.response?.data?.code === "SESSION_IDLE_TIMEOUT") {
        console.warn("Session idle timeout detected.");
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/login") {
          const message = error.response.data.message || "Session expired due to inactivity.";
          window.location.href = `/login?message=${encodeURIComponent(message)}`;
        }
        return Promise.reject(error);
      }

      // Standard 401 handling with refresh attempt
      // We do NOT retry if the failed request WAS a refresh request itself (to avoid infinite loop)
      if (
        !originalRequest.url?.includes("/auth/refresh") &&
        !originalRequest.url?.includes("/auth/login")
      ) {
        originalRequest._retry = true; // Mark as retried IMMEDIATELY

        if (isRefreshing) {
          try {
            // Wait for the single refresh promise to resolve
            await refreshPromise;
            return apiClient(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        // We are the "leader" request starting the refresh
        isRefreshing = true;

        // Create a singleton promise for the refresh
        refreshPromise = (async () => {
          try {
            await apiClient.post("/auth/refresh");
            return true;
          } catch (refreshError) {
            // Force logout on refresh failure
            console.warn("Refresh token failed. Clearing session.");
            useAuthStore.getState().clearUser();

            if (
              window.location.pathname !== "/login" &&
              window.location.pathname !== "/register"
            ) {
              window.location.href = "/login";
            }
            throw refreshError;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();

        await refreshPromise;
        return apiClient(originalRequest);
      }

      // If we are here, it's a 401 from login or refresh which should be rejected
      return Promise.reject(error);
    }

    // Handle PASSWORD_EXPIRED
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "PASSWORD_EXPIRED"
    ) {
      originalRequest._retry = true;
      if (window.location.pathname !== "/change-password") {
        alert(
          "Your password has expired. Please change your password to continue.",
        );
        window.location.href = "/change-password";
      }
      return Promise.reject(error);
    }

    // Handle CSRF token errors
    const isCsrfError =
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("csrf");

    if (isCsrfError && !originalRequest.url?.includes("/csrf-token")) {
      originalRequest._retry = true;
      try {
        await fetchCSRFToken();
        return apiClient(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
