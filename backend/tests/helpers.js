const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-long-enough-32chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-long-enough-32';

/**
 * Generate a valid JWT access token for testing
 */
function generateTestToken(user = {}) {
  const payload = {
    id: user.id || 1,
    email: user.email || 'test@recallvet.com',
    role: user.role || 'user'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Generate a valid refresh token for testing
 */
function generateTestRefreshToken(user = {}) {
  return jwt.sign(
    { id: user.id || 1, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Default test user returned by mocked auth middleware
 */
const testUser = {
  id: 1,
  email: 'test@recallvet.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'user',
  status: 'active',
  preferred_language: 'fr',
  avatar_url: null
};

/**
 * Superadmin test user
 */
const superadminUser = {
  id: 99,
  email: 'admin@recallvet.com',
  first_name: 'Super',
  last_name: 'Admin',
  role: 'superadmin',
  status: 'active',
  preferred_language: 'fr',
  avatar_url: null
};

/**
 * Default test tenant
 */
const testTenant = {
  id: 1,
  name: 'Test Clinic',
  slug: 'test-clinic',
  currency: 'XAF',
  language: 'fr'
};

/**
 * Default test subscription
 */
const testSubscription = {
  id: 1,
  status: 'trialing',
  planCode: 'professional',
  planName: 'Professional',
  features: null
};

/**
 * Create a mock DB pool that returns configurable results.
 * Use: const db = createMockDb(); db.setQueryResult([rows]);
 */
function createMockDb() {
  const results = [];
  let callIndex = 0;

  const mockConn = {
    query: jest.fn(async () => {
      const result = results[callIndex] || [[], []];
      callIndex++;
      return result;
    }),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
  };

  const mockPool = {
    query: jest.fn(async () => {
      const result = results[callIndex] || [[], []];
      callIndex++;
      return result;
    }),
    getConnection: jest.fn(async () => mockConn),
    _conn: mockConn,
    _reset: () => { callIndex = 0; results.length = 0; },
    _addResult: (rows, fields) => { results.push([rows, fields || []]); }
  };

  return mockPool;
}

module.exports = {
  generateTestToken,
  generateTestRefreshToken,
  testUser,
  superadminUser,
  testTenant,
  testSubscription,
  createMockDb
};
