// Ensure test env vars are set before any module loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-long-enough-32chars';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-long-enough-32';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_fake';

const { generateTestToken, testUser, superadminUser } = require('../helpers');

// Mock logger to suppress output
jest.mock('../../services/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Mock DB module
jest.mock('../../config/db', () => {
  const mockConn = {
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
  };
  return {
    query: jest.fn(),
    getConnection: jest.fn().mockResolvedValue(mockConn),
    _conn: mockConn,
    on: jest.fn()
  };
});

// Mock email service
jest.mock('../../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendInvitationEmail: jest.fn().mockResolvedValue(true)
}));

// Mock subscription service
jest.mock('../../services/subscriptionService', () => ({
  createTrialSubscription: jest.fn(),
  getTenantSubscription: jest.fn(),
  expireTrials: jest.fn()
}));

// Mock invitation service
jest.mock('../../services/invitationService', () => ({
  getInvitationByToken: jest.fn(),
  acceptInvitation: jest.fn()
}));

const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db');

describe('Admin Routes', () => {
  let adminToken;
  let userToken;

  beforeEach(() => {
    jest.clearAllMocks();
    adminToken = generateTestToken(superadminUser);
    userToken = generateTestToken(testUser);
  });

  // ──────────────────────────────────────────────
  // GET /api/admin/dashboard
  // ──────────────────────────────────────────────
  describe('GET /api/admin/dashboard', () => {
    it('should return stats for superadmin', async () => {
      // 1. Auth middleware: SELECT user (superadmin)
      db.query.mockResolvedValueOnce([[superadminUser]]);
      // 2-7. Dashboard stat queries (each returns [[{ count }]])
      db.query.mockResolvedValueOnce([[{ totalTenants: 10 }]]);
      db.query.mockResolvedValueOnce([[{ totalUsers: 25 }]]);
      db.query.mockResolvedValueOnce([[{ activeSubscriptions: 8 }]]);
      db.query.mockResolvedValueOnce([[{ trialSubscriptions: 5 }]]);
      db.query.mockResolvedValueOnce([[{ totalAnimals: 150 }]]);
      db.query.mockResolvedValueOnce([[{ totalParties: 40 }]]);
      // 8. Recent signups
      db.query.mockResolvedValueOnce([[
        { id: 1, email: 'user1@test.com', first_name: 'User', last_name: 'One', created_at: '2025-01-01' }
      ]]);
      // 9. Recent demo requests
      db.query.mockResolvedValueOnce([[
        { id: 1, full_name: 'Demo User', email: 'demo@test.com', practice_name: 'Clinic', status: 'pending', created_at: '2025-01-01' }
      ]]);

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toHaveProperty('totalTenants', 10);
      expect(res.body.data.stats).toHaveProperty('totalUsers', 25);
      expect(res.body.data.stats).toHaveProperty('activeSubscriptions', 8);
      expect(res.body.data).toHaveProperty('recentSignups');
      expect(res.body.data).toHaveProperty('recentDemos');
    });

    it('should return 403 for regular user', async () => {
      // Auth middleware: SELECT user (regular user)
      db.query.mockResolvedValueOnce([[testUser]]);

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/permission/i);
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/admin/tenants
  // ──────────────────────────────────────────────
  describe('GET /api/admin/tenants', () => {
    it('should return tenant list for superadmin', async () => {
      // 1. Auth middleware: SELECT user (superadmin)
      db.query.mockResolvedValueOnce([[superadminUser]]);
      // 2. COUNT total tenants
      db.query.mockResolvedValueOnce([[{ total: 2 }]]);
      // 3. SELECT tenants with pagination
      db.query.mockResolvedValueOnce([[
        {
          id: 1, name: 'Clinic A', slug: 'clinic-a', is_active: 1,
          sub_status: 'active', plan_name: 'Professional', trial_ends_at: null, user_count: 3,
          created_at: '2025-01-01'
        },
        {
          id: 2, name: 'Clinic B', slug: 'clinic-b', is_active: 1,
          sub_status: 'trialing', plan_name: 'Professional', trial_ends_at: '2025-02-01', user_count: 1,
          created_at: '2025-01-15'
        }
      ]]);

      const res = await request(app)
        .get('/api/admin/tenants')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.data[0]).toHaveProperty('name', 'Clinic A');
    });
  });

  // ──────────────────────────────────────────────
  // PUT /api/admin/tenants/:id/toggle
  // ──────────────────────────────────────────────
  describe('PUT /api/admin/tenants/:id/toggle', () => {
    it('should toggle tenant active status (active to inactive)', async () => {
      // 1. Auth middleware: SELECT user (superadmin)
      db.query.mockResolvedValueOnce([[superadminUser]]);
      // 2. SELECT tenant current status
      db.query.mockResolvedValueOnce([[{ is_active: 1 }]]);
      // 3. UPDATE tenant
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/admin/tenants/1/toggle')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deactivated/i);
    });

    it('should toggle tenant active status (inactive to active)', async () => {
      // 1. Auth middleware: SELECT user (superadmin)
      db.query.mockResolvedValueOnce([[superadminUser]]);
      // 2. SELECT tenant current status
      db.query.mockResolvedValueOnce([[{ is_active: 0 }]]);
      // 3. UPDATE tenant
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/admin/tenants/2/toggle')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/activated/i);
    });
  });
});
