import {
  cacheRecords, getPendingMutations, markMutationSynced,
  getPendingCount, getLastSync, setLastSync
} from './offlineDb';
import { API_URL } from './api';

// Stores that support offline sync
const SYNCABLE_STORES = ['animals', 'parties', 'appointments', 'encounters', 'prescriptions', 'invoices', 'products'];

// Map API endpoints to IndexedDB store names
const ENDPOINT_STORE_MAP = {
  '/v1/clinic/animals': 'animals',
  '/v1/clinic/parties': 'parties',
  '/v1/clinic/appointments': 'appointments',
  '/v1/clinic/encounters': 'encounters',
  '/v1/clinic/prescriptions': 'prescriptions',
  '/v1/clinic/invoices': 'invoices',
  '/v1/pharmacy/products': 'products'
};

let isOnline = navigator.onLine;
let isSyncing = false;
let listeners = new Set();

// --- Connectivity detection ---

function updateOnlineStatus() {
  const wasOffline = !isOnline;
  isOnline = navigator.onLine;
  notifyListeners();

  // Auto-sync when coming back online
  if (wasOffline && isOnline) {
    syncAll();
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// --- Listener pattern for UI updates ---

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function notifyListeners() {
  const count = await getPendingCount();
  const state = { isOnline, isSyncing, pendingCount: count };
  listeners.forEach(fn => fn(state));
}

// --- Pull sync: fetch changes from server ---

async function pullChanges(token) {
  for (const store of SYNCABLE_STORES) {
    try {
      const since = await getLastSync(store);
      const params = new URLSearchParams();
      if (since) params.set('since', since);
      params.set('store', store);

      const res = await fetch(`${API_URL}/v1/sync/changes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Id': getTenantIdFromStorage()
        }
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        await cacheRecords(store, data.data);
        await setLastSync(store, data.syncTimestamp);
      } else if (data.success) {
        await setLastSync(store, data.syncTimestamp);
      }
    } catch (e) {
      // Network error during pull — skip this store
      console.warn(`Sync pull failed for ${store}:`, e.message);
    }
  }
}

// --- Push sync: replay pending mutations ---

async function pushMutations(token) {
  const mutations = await getPendingMutations();
  if (mutations.length === 0) return;

  for (const mutation of mutations) {
    try {
      const res = await fetch(`${API_URL}${mutation.endpoint}`, {
        method: mutation.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Tenant-Id': getTenantIdFromStorage()
        },
        body: mutation.body ? JSON.stringify(mutation.body) : undefined
      });

      if (res.ok || res.status === 422 || res.status === 409) {
        // Success or validation error (don't retry) or conflict (server wins)
        await markMutationSynced(mutation.id);
      }
      // 5xx errors: leave in queue for retry
    } catch (e) {
      // Network error: stop pushing, we're offline again
      console.warn('Push sync stopped — network error:', e.message);
      break;
    }
  }
}

// --- Full sync cycle ---

export async function syncAll() {
  if (isSyncing || !isOnline) return;

  const token = getTokenFromStorage();
  if (!token) return;

  isSyncing = true;
  notifyListeners();

  try {
    // Push first (send local changes), then pull (get server changes)
    await pushMutations(token);
    await pullChanges(token);
  } catch (e) {
    console.error('Sync error:', e);
  } finally {
    isSyncing = false;
    notifyListeners();
  }
}

// --- Determine which store an endpoint maps to ---

export function getStoreForEndpoint(endpoint) {
  // Match /v1/clinic/animals, /v1/clinic/animals/123, etc.
  for (const [pattern, store] of Object.entries(ENDPOINT_STORE_MAP)) {
    if (endpoint.startsWith(pattern)) return store;
  }
  return null;
}

// --- Getters ---

export function getOnlineStatus() {
  return isOnline;
}

// --- Helpers ---

function getTokenFromStorage() {
  try {
    const data = localStorage.getItem('rv_user');
    if (data) return JSON.parse(data).token || null;
  } catch (e) {}
  return null;
}

function getTenantIdFromStorage() {
  try {
    const data = localStorage.getItem('rv_tenant');
    if (data) return JSON.parse(data).id || null;
  } catch (e) {}
  return null;
}

// --- Initial sync on load (if online) ---

if (isOnline) {
  setTimeout(() => syncAll(), 3000);
}

// --- Periodic background sync (every 5 minutes when online) ---

setInterval(() => {
  if (isOnline && !isSyncing) {
    syncAll();
  }
}, 5 * 60 * 1000);
