/**
 * Admin Authentication Module
 * Handles session management and authentication
 */

const AdminAuth = (function() {
  const SESSION_KEY = 'admin_session';
  const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  const API_BASE = '/api/admin'; // Will be proxied through backend

  /**
   * Login with password
   */
  async function login(password) {
    try {
      // Try backend authentication first
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.token || 'authenticated', data.expiry);
        return true;
      }

      // If backend fails, check for demo mode
      if (isDemoMode()) {
        setSession('demo', Date.now() + SESSION_EXPIRY);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);

      // Demo mode fallback
      if (isDemoMode()) {
        setSession('demo', Date.now() + SESSION_EXPIRY);
        return true;
      }

      return false;
    }
  }

  /**
   * Logout current user
   */
  async function logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    clearSession();
    window.location.href = 'login.html';
  }

  /**
   * Check if user is authenticated
   */
  function isAuthenticated() {
    const session = getSession();
    return session && session.valid;
  }

  /**
   * Get current session
   */
  function getSession() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;

      const session = JSON.parse(data);

      // Check if expired
      if (Date.now() > session.expiry) {
        clearSession();
        return null;
      }

      return { ...session, valid: true };
    } catch (error) {
      console.error('Session parse error:', error);
      clearSession();
      return null;
    }
  }

  /**
   * Set session
   */
  function setSession(token, expiry) {
    const session = {
      token,
      expiry: expiry || Date.now() + SESSION_EXPIRY,
      created: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Clear session
   */
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * Check if running in demo mode (no backend)
   */
  function isDemoMode() {
    // Check if we're accessing via file:// or there's no API
    return window.location.protocol === 'file:' ||
           typeof API_BASE === 'undefined' ||
           localStorage.getItem('admin_demo_mode') === 'true';
  }

  /**
   * Enable demo mode
   */
  function enableDemoMode() {
    localStorage.setItem('admin_demo_mode', 'true');
  }

  /**
   * Disable demo mode
   */
  function disableDemoMode() {
    localStorage.removeItem('admin_demo_mode');
  }

  /**
   * Protect a page - redirect to login if not authenticated
   */
  function protectPage() {
    if (!isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  /**
   * Make authenticated API request
   */
  async function apiRequest(endpoint, options = {}) {
    const session = getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authorization header if we have a token
    if (session.token && session.token !== 'demo') {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (response.status === 401) {
      clearSession();
      window.location.href = 'login.html';
      throw new Error('Unauthorized');
    }

    return response;
  }

  /**
   * Get auth token for API requests
   */
  function getAuthToken() {
    const session = getSession();
    return session ? session.token : null;
  }

  // Public API
  return {
    login,
    logout,
    isAuthenticated,
    getSession,
    setSession,
    clearSession,
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    protectPage,
    apiRequest,
    getAuthToken
  };
})();

// Auto-protect pages on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only protect if not on login page
    if (!window.location.pathname.endsWith('login.html')) {
      AdminAuth.protectPage();
    }
  });
} else {
  if (!window.location.pathname.endsWith('login.html')) {
    AdminAuth.protectPage();
  }
}
