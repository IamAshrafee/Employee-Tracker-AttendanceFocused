import api from "./api";

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login user
   */
  async login(email, password, deviceInfo) {
    const response = await api.post("/auth/login", {
      email,
      password,
      deviceInfo,
    });

    // Store token and user info
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Register user (admin only)
   */
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get device info for tracking
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  },
};
