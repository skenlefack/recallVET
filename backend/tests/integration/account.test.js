// Ensure test env vars are set before any module loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-long-enough-32chars';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-long-enough-32';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_fake';

const { generateTestToken, testUser } = require('../helpers');

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
const bcrypt = require('bcryptjs');

describe('Account Routes', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = generateTestToken(testUser);
  });

  // ──────────────────────────────────────────────
  // GET /api/account/profile
  // ──────────────────────────────────────────────
  describe('GET /api/account/profile', () => {
    it('should return profile when authenticated', async () => {
      // 1. Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);
      // 2. Route handler: SELECT full profile
      db.query.mockResolvedValueOnce([[{
        id: testUser.id,
        email: testUser.email,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        phone: '+237600000000',
        role: testUser.role,
        preferred_language: 'fr',
        avatar_url: null,
        created_at: '2025-01-01'
      }]]);

      const res = await request(app)
        .get('/api/account/profile')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', testUser.email);
      expect(res.body.data).toHaveProperty('first_name', testUser.first_name);
    });
  });

  // ──────────────────────────────────────────────
  // PUT /api/account/profile
  // ──────────────────────────────────────────────
  describe('PUT /api/account/profile', () => {
    it('should update profile with valid data', async () => {
      // 1. Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);
      // 2. UPDATE profile
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/account/profile')
        .set('Authorization', 'Bearer ' + token)
        .send({
          first_name: 'Updated',
          last_name: 'Name',
          phone: '+237600000000',
          preferred_language: 'en'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/updated/i);
    });

    it('should return 422 with missing first_name', async () => {
      // Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);

      const res = await request(app)
        .put('/api/account/profile')
        .set('Authorization', 'Bearer ' + token)
        .send({
          first_name: '',
          last_name: 'Name'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // PUT /api/account/password
  // ──────────────────────────────────────────────
  describe('PUT /api/account/password', () => {
    it('should change password with valid current password', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);

      // 1. Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);
      // 2. SELECT password_hash
      db.query.mockResolvedValueOnce([[{ password_hash: '$2a$10$hashedpassword' }]]);
      // 3. UPDATE password
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/account/password')
        .set('Authorization', 'Bearer ' + token)
        .send({
          current_password: 'OldPassword123!',
          new_password: 'NewPassword456!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/updated/i);
    });

    it('should return 400 with wrong current password', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);

      // 1. Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);
      // 2. SELECT password_hash
      db.query.mockResolvedValueOnce([[{ password_hash: '$2a$10$hashedpassword' }]]);

      const res = await request(app)
        .put('/api/account/password')
        .set('Authorization', 'Bearer ' + token)
        .send({
          current_password: 'WrongPassword!',
          new_password: 'NewPassword456!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/incorrect/i);
    });

    it('should return 422 with short new password', async () => {
      // Auth middleware: SELECT user
      db.query.mockResolvedValueOnce([[testUser]]);

      const res = await request(app)
        .put('/api/account/password')
        .set('Authorization', 'Bearer ' + token)
        .send({
          current_password: 'OldPassword123!',
          new_password: 'short'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
