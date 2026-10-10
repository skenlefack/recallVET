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

const api = {
  async get(endpoint, token) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
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
      const res = await fetch(`${API_URL}${endpoint}`, {
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
      const res = await fetch(`${API_URL}${endpoint}`, {
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
      const res = await fetch(`${API_URL}${endpoint}`, {
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
      const res = await fetch(`${API_URL}${endpoint}`, {
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
