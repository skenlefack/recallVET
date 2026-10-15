import Dexie from 'dexie';

const db = new Dexie('RecallVET');

db.version(1).stores({
  // Cached API data (read-only offline)
  animals: 'id, tenant_id, owner_party_id, species_id, name, animal_code, updated_at',
  parties: 'id, tenant_id, display_name, phone_primary, updated_at',
  appointments: 'id, tenant_id, animal_id, party_id, appointment_date, status, updated_at',
  encounters: 'id, tenant_id, animal_id, party_id, encounter_date, updated_at',
  prescriptions: 'id, tenant_id, encounter_id, animal_id, updated_at',
  invoices: 'id, tenant_id, party_id, invoice_number, status, updated_at',
  products: 'id, tenant_id, name, sku, updated_at',

  // Offline mutation queue
  pendingMutations: '++id, endpoint, method, status, created_at',

  // Sync metadata
  syncMeta: 'key'
});

/**
 * Save a batch of records from the API into IndexedDB
 */
export async function cacheRecords(storeName, records) {
  if (!db[storeName] || !records?.length) return;
  await db[storeName].bulkPut(records);
}

/**
 * Get all cached records for a store, optionally filtered by tenant
 */
export async function getCachedRecords(storeName, tenantId) {
  if (!db[storeName]) return [];
  if (tenantId) {
    return db[storeName].where('tenant_id').equals(tenantId).toArray();
  }
  return db[storeName].toArray();
}

/**
 * Get a single cached record by ID
 */
export async function getCachedRecord(storeName, id) {
  if (!db[storeName]) return null;
  return db[storeName].get(id);
}

/**
 * Queue a mutation for later sync
 */
export async function queueMutation(endpoint, method, body, token) {
  return db.pendingMutations.add({
    endpoint,
    method,
    body,
    token,
    status: 'pending',
    created_at: new Date().toISOString()
  });
}

/**
 * Get all pending mutations in FIFO order
 */
export async function getPendingMutations() {
  return db.pendingMutations.where('status').equals('pending').sortBy('created_at');
}

/**
 * Mark a mutation as synced
 */
export async function markMutationSynced(id) {
  return db.pendingMutations.delete(id);
}

/**
 * Get count of pending mutations
 */
export async function getPendingCount() {
  return db.pendingMutations.where('status').equals('pending').count();
}

/**
 * Get/set last sync timestamp per store
 */
export async function getLastSync(storeName) {
  const meta = await db.syncMeta.get(storeName);
  return meta?.value || null;
}

export async function setLastSync(storeName, timestamp) {
  await db.syncMeta.put({ key: storeName, value: timestamp });
}

/**
 * Clear all offline data (for logout)
 */
export async function clearOfflineData() {
  const storeNames = ['animals', 'parties', 'appointments', 'encounters', 'prescriptions', 'invoices', 'products', 'pendingMutations', 'syncMeta'];
  for (const store of storeNames) {
    await db[store].clear();
  }
}

export default db;
