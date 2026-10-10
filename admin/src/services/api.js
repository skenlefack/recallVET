const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  try {
    const data = localStorage.getItem('rv_user');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.token || null;
    }
  } catch (e) {
    console.error('Error getting token:', e);
  }
  return null;
}

function getRefreshToken() {
  try {
    const data = localStorage.getItem('rv_user');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.refreshToken || null;
    }
  } catch (e) {}
  return null;
}

function getTenantId() {
  try {
    const data = localStorage.getItem('rv_tenant');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.id || null;
    }
  } catch (e) {}
  return null;
}

async function safeJson(res) {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : { success: false, message: 'Empty response' };
  } catch (e) {
    return { success: false, message: 'Invalid JSON response' };
  }
}

function buildHeaders(token, isJson = true) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isJson) headers['Content-Type'] = 'application/json';
  const tenantId = getTenantId();
  if (tenantId) headers['X-Tenant-Id'] = tenantId;
  return headers;
}

// --- Token refresh logic ---
let refreshPromise = null;

async function refreshAccessToken() {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) {
        throw new Error('Refresh failed');
      }

      const data = await res.json();
      if (!data.token) {
        throw new Error('No token in refresh response');
      }

      // Update tokens in localStorage while preserving user/tenants
      const stored = localStorage.getItem('rv_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.token = data.token;
        parsed.refreshToken = data.refreshToken;
        localStorage.setItem('rv_user', JSON.stringify(parsed));
      }

      return data.token;
    } catch (e) {
      // Refresh failed — clear auth and redirect to login
      localStorage.removeItem('rv_user');
      localStorage.removeItem('rv_tenant');
      window.location.href = '/login';
      throw e;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchWithRefresh(endpoint, options, isRetry = false) {
  const res = await fetch(`${API_URL}${endpoint}`, options);

  if (res.status === 401 && !isRetry) {
    // Don't try to refresh the refresh endpoint itself
    if (endpoint === '/auth/refresh' || endpoint === '/auth/login' || endpoint === '/auth/register') {
      return res;
    }

    try {
      const newToken = await refreshAccessToken();
      // Rebuild headers with the new token
      const newOptions = { ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` } };
      return fetch(`${API_URL}${endpoint}`, newOptions);
    } catch (e) {
      return res;
    }
  }

  return res;
}

const api = {
  async get(endpoint, token) {
    try {
      const res = await fetchWithRefresh(endpoint, {
        method: 'GET',
        headers: buildHeaders(token)
      });
      return safeJson(res);
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async post(endpoint, data, token) {
    try {
      const res = await fetchWithRefresh(endpoint, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify(data)
      });
      return safeJson(res);
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async put(endpoint, data, token) {
    try {
      const res = await fetchWithRefresh(endpoint, {
        method: 'PUT',
        headers: buildHeaders(token),
        body: JSON.stringify(data)
      });
      return safeJson(res);
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async delete(endpoint, token) {
    try {
      const res = await fetchWithRefresh(endpoint, {
        method: 'DELETE',
        headers: buildHeaders(token)
      });
      return safeJson(res);
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async upload(endpoint, formData, token) {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const tenantId = getTenantId();
      if (tenantId) headers['X-Tenant-Id'] = tenantId;
      const res = await fetchWithRefresh(endpoint, {
        method: 'POST',
        headers,
        body: formData
      });
      return safeJson(res);
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
};

export { api, getToken, getTenantId, API_URL };
export default api;
