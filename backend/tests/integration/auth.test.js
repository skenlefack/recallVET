// Ensure test env vars are set before any module loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-long-enough-32chars';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-long-enough-32';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_fake';

const { generateTestToken, generateTestRefreshToken, testUser } = require('../helpers');

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

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock subscription service
jest.mock('../../services/subscriptionService', () => ({
  createTrialSubscription: jest.fn().mockResolvedValue({ id: 1 }),
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
const bcrypt = require('bcryptjs');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/register
  // ──────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    const validBody = {
      email: 'new@recallvet.com',
      password: 'Password123!',
      first_name: 'New',
      last_name: 'User',
      practice_name: 'My Clinic',
      practice_type: 'clinic',
      country_code: 'CM',
      preferred_language: 'fr'
    };

    it('should register successfully with valid data', async () => {
      const conn = db._conn;
      // 1. Check duplicate email - no existing user
      conn.query.mockResolvedValueOnce([[]]);
      // 2. Insert user
      conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
      // 3. Insert tenant
      conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
      // 4. Insert structure
      conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
      // 5. Insert site
      conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
      // 6. Insert user_tenant
      conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // 7. Select plan
      conn.query.mockResolvedValueOnce([[{ id: 1, trial_days: 14 }]]);
      // 8. Insert subscription
      conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
      // 9. Insert stock location
      conn.query.mockResolvedValueOnce([{ insertId: 1 }]);

      // Pool-level query: store refresh token
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('new@recallvet.com');
      expect(res.body.data.tenant).toHaveProperty('id');
      expect(conn.beginTransaction).toHaveBeenCalled();
      expect(conn.commit).toHaveBeenCalled();
    });

    it('should return 422 with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validBody, email: '' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validBody, password: 'short' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 if email already exists', async () => {
      const conn = db._conn;
      // Duplicate check returns existing user
      conn.query.mockResolvedValueOnce([[{ id: 5 }]]);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validBody);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/login
  // ──────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    const loginBody = { email: 'test@recallvet.com', password: 'Password123!' };
    const dbUser = {
      ...testUser,
      password_hash: '$2a$10$hashedpassword',
      failed_login_attempts: 0,
      locked_until: null
    };

    it('should login successfully', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);
      // 1. SELECT user
      db.query.mockResolvedValueOnce([[dbUser]]);
      // 2. UPDATE reset failed attempts
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // 3. SELECT tenants
      db.query.mockResolvedValueOnce([[{
        tenant_id: 1, rv_role: 'owner', tenant_name: 'Test Clinic', tenant_slug: 'test-clinic'
      }]]);
      // 4. INSERT refresh token
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('test@recallvet.com');
      expect(res.body.data.tenants).toHaveLength(1);
    });

    it('should return 422 with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123!' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with wrong password', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      // SELECT user
      db.query.mockResolvedValueOnce([[dbUser]]);
      // UPDATE failed attempts
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginBody);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 423 if account locked', async () => {
      const lockedUser = {
        ...dbUser,
        locked_until: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
      // SELECT user
      db.query.mockResolvedValueOnce([[lockedUser]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginBody);

      expect(res.status).toBe(423);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/locked/i);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/refresh
  // ──────────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = generateTestRefreshToken(testUser);

      // 1. SELECT refresh token
      db.query.mockResolvedValueOnce([[{ id: 1, token: refreshToken, user_id: testUser.id }]]);
      // 2. UPDATE revoke old token
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // 3. SELECT user
      db.query.mockResolvedValueOnce([[{ id: testUser.id, email: testUser.email, role: testUser.role, status: 'active' }]]);
      // 4. INSERT new refresh token
      db.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 422 without refreshToken', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/forgot-password
  // ──────────────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    it('should always return success (anti-enumeration)', async () => {
      // User not found
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/if an account exists/i);
    });

    it('should return 422 without email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/reset-password
  // ──────────────────────────────────────────────
  describe('POST /api/auth/reset-password', () => {
    it('should reset successfully with valid token', async () => {
      // 1. SELECT password reset
      db.query.mockResolvedValueOnce([[{ id: 1, user_id: 1, token: 'validtoken' }]]);
      // 2. UPDATE user password
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // 3. UPDATE password_resets set used
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // 4. Revoke refresh tokens
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'validtoken', password: 'NewPassword123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/reset successfully/i);
    });

    it('should return 422 with short password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'validtoken', password: 'short' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/auth/me
  // ──────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return user info when authenticated', async () => {
      const token = generateTestToken(testUser);

      // 1. Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);
      // 2. Route handler: SELECT tenants
      db.query.mockResolvedValueOnce([[{
        tenant_id: 1, rv_role: 'owner', tenant_name: 'Test Clinic', tenant_slug: 'test-clinic'
      }]]);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.tenants).toBeInstanceOf(Array);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/logout
  // ──────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should logout and revoke tokens', async () => {
      const token = generateTestToken(testUser);

      // 1. Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);
      // 2. Revoke refresh tokens
      db.query.mockResolvedValueOnce([{ affectedRows: 2 }]);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/logged out/i);
    });
  });
});
