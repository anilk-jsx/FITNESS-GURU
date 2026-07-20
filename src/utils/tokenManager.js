// Token Manager Utility
// Handles automatic token refresh for API calls

class TokenManager {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
    this.isRefreshing = false;
    this.failedQueue = [];
    this.SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours
    this.lastActivityTime = Date.now();
    this.setupSessionTimeout();
  }

  // Setup session timeout monitoring
  setupSessionTimeout() {
    if (typeof window !== 'undefined') {
      ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(event => {
        window.addEventListener(event, () => {
          this.lastActivityTime = Date.now();
        }, { passive: true });
      });
    }
  }

  // Check if session has timed out due to inactivity
  isSessionExpired() {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    return timeSinceLastActivity > this.SESSION_TIMEOUT_MS;
  }

  // Get access token from localStorage
  getAccessToken() {
    return localStorage.getItem('access_token') || '';
  }

  // Get refresh token from localStorage
  getRefreshToken() {
    return localStorage.getItem('refresh_token') || '';
  }

  // Set tokens in localStorage
  setTokens(accessToken, refreshToken = null) {
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Clear all tokens from localStorage
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // Process failed queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Store both access and refresh tokens (backend may rotate refresh token)
        this.setTokens(data.access_token, data.refresh_token);
        return data.access_token;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      if (this.getAccessToken()) {
        console.warn('Token refresh warning:', error?.message || error);
      } else {
        this.clearTokens();
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Make API call with automatic token refresh
  async apiCall(url, options = {}) {
    // Update activity timestamp on API call
    this.lastActivityTime = Date.now();

    // Check for session timeout
    if (this.isSessionExpired()) {
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired due to inactivity');
    }

    const accessToken = this.getAccessToken();

    // Add Authorization header if not present
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      // If token is expired (401), attempt refresh
      if (response.status === 401) {
        if (options.noAuthRedirect) {
          return response;
        }

        if (this.isRefreshing) {
          // If already refreshing, wait for it to complete
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(token => {
            config.headers['Authorization'] = `Bearer ${token}`;
            return fetch(url, config);
          });
        }

        this.isRefreshing = true;

        try {
          const newAccessToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          this.processQueue(null, newAccessToken);

          // Retry original request with new token
          config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return fetch(url, config);
        } catch (refreshError) {
          this.isRefreshing = false;
          this.processQueue(refreshError);
          if (options.noAuthRedirect) {
            return response;
          }
          throw refreshError;
        }
      }

      return response;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken || refreshToken);
  }

  // Check if token is valid (not expired or about to expire)
  isTokenValid() {
    if (!this.isAuthenticated()) {
      return false;
    }

    // Check for session timeout
    if (this.isSessionExpired()) {
      return false;
    }

    return true;
  }

  // Check if user is admin
  isAdmin() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role === 'ADMIN' || user.role === 'SUPER-ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'OWNER';
      } catch (error) {
        console.error('Error parsing user data:', error);
        return false;
      }
    }
    return false;
  }

  // Get user data
  getUserData() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  // Set user data
  setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  // Logout user
  logout() {
    this.clearTokens();
    window.location.href = '/login';
  }
}

// Create and export a singleton instance
export const tokenManager = new TokenManager();
export default tokenManager;