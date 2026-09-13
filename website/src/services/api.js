const API_BASE = '/api/public';

async function request(method, path, data = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) opts.body = JSON.stringify(data);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
}

export const api = {
  post: (path, data) => request('POST', path, data),
  get: (path) => request('GET', path),
};

export const submitContact = (data) => api.post('/contact', data);
export const submitDemoRequest = (data) => api.post('/demo-request', data);
export const subscribeNewsletter = (data) => api.post('/newsletter/subscribe', data);
export const getPlans = () => api.get('/plans');
