import { getCachedRecords, getCachedRecord, cacheRecords, queueMutation } from './offlineDb';
import { getStoreForEndpoint, getOnlineStatus } from './syncEngine';

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
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();
      if (!data.token) throw new Error('No token in refresh response');

      const stored = localStorage.getItem('rv_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.token = data.token;
        parsed.refreshToken = data.refreshToken;
        localStorage.setItem('rv_user', JSON.stringify(parsed));
      }

      return data.token;
    } catch (e) {
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
    if (endpoint === '/auth/refresh' || endpoint === '/auth/login' || endpoint === '/auth/register') {
      return res;
    }
    try {
      const newToken = await refreshAccessToken();
      const newOptions = { ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` } };
      return fetch(`${API_URL}${endpoint}`, newOptions);
    } catch (e) {
      return res;
    }
  }

  return res;
}

// --- Offline-aware GET: try network, fallback to IndexedDB ---

async function offlineGet(endpoint, token) {
  const store = getStoreForEndpoint(endpoint);

  if (getOnlineStatus()) {
    try {
      const res = await fetchWithRefresh(endpoint, {
        method: 'GET',
        headers: buildHeaders(token)
      });
      const json = await safeJson(res);

      // Cache successful list responses in IndexedDB
      if (json.success && store && Array.isArray(json.data)) {
        cacheRecords(store, json.data).catch(() => {});
      }

      return json;
    } catch (e) {
      // Network error — fall through to offline
    }
  }

  // Offline fallback: serve from IndexedDB
  if (store) {
    const tenantId = getTenantId();

    // Detail endpoint: /v1/clinic/animals/123
    const idMatch = endpoint.match(/\/(\d+)$/);
    if (idMatch) {
      const record = await getCachedRecord(store, parseInt(idMatch[1]));
      if (record) {
        return { success: true, data: record, _offline: true };
      }
      return { success: false, message: 'Not available offline', _offline: true };
    }

    // List endpoint
    const records = await getCachedRecords(store, tenantId);
    return {
      success: true,
      data: records,
      pagination: { total: records.length, page: 1, limit: records.length, totalPages: 1 },
      _offline: true
    };
  }

  return { success: false, message: 'You are offline', _offline: true };
}

// --- Offline-aware mutation: try network, queue if offline ---

async function offlineMutate(endpoint, method, data, token) {
  if (getOnlineStatus()) {
    try {
      const res = await fetchWithRefresh(endpoint, {
        method,
        headers: buildHeaders(token),
        body: JSON.stringify(data)
      });
      return safeJson(res);
    } catch (e) {
      // Network error — fall through to queue
    }
  }

  // Queue mutation for later sync
  await queueMutation(endpoint, method, data, token);
  return {
    success: true,
    message: 'Saved offline — will sync when connection returns',
    _offline: true,
    _queued: true
  };
}

const api = {
  async get(endpoint, token) {
    return offlineGet(endpoint, token);
  },

  async post(endpoint, data, token) {
    return offlineMutate(endpoint, 'POST', data, token);
  },

  async put(endpoint, data, token) {
    return offlineMutate(endpoint, 'PUT', data, token);
  },

  async delete(endpoint, token) {
    if (getOnlineStatus()) {
      try {
        const res = await fetchWithRefresh(endpoint, {
          method: 'DELETE',
          headers: buildHeaders(token)
        });
        return safeJson(res);
      } catch (e) {
        return { success: false, message: e.message };
      }
    }
    await queueMutation(endpoint, 'DELETE', null, token);
    return { success: true, message: 'Delete queued offline', _offline: true, _queued: true };
  },

  async upload(endpoint, formData, token) {
    // Uploads require network — cannot be queued offline
    if (!getOnlineStatus()) {
      return { success: false, message: 'File uploads require an internet connection', _offline: true };
    }
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
