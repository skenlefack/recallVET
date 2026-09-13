// Ensure test env vars are set before any module loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-long-enough-32chars';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-long-enough-32';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_fake';

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

describe('Public Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // GET /api/public/plans
  // ──────────────────────────────────────────────
  describe('GET /api/public/plans', () => {
    it('should return plans list', async () => {
      const mockPlans = [
        {
          id: 1, code: 'starter', name_fr: 'Starter', name_en: 'Starter',
          price_monthly: 0, price_yearly: 0, currency: 'XAF',
          max_users: 1, max_animals: 50, max_structures: 1,
          features: null, trial_days: 14, sort_order: 1
        },
        {
          id: 2, code: 'professional', name_fr: 'Professionnel', name_en: 'Professional',
          price_monthly: 25000, price_yearly: 250000, currency: 'XAF',
          max_users: 5, max_animals: 500, max_structures: 3,
          features: '["sms","reports"]', trial_days: 14, sort_order: 2
        }
      ];

      db.query.mockResolvedValueOnce([mockPlans]);

      const res = await request(app)
        .get('/api/public/plans');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('code', 'starter');
      expect(res.body.data[1]).toHaveProperty('code', 'professional');
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/public/demo-request
  // ──────────────────────────────────────────────
  describe('POST /api/public/demo-request', () => {
    it('should submit demo request with valid data', async () => {
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/public/demo-request')
        .send({
          full_name: 'Dr. Jean Dupont',
          email: 'jean@clinic.com',
          phone: '+237600000000',
          practice_name: 'Clinique Vet',
          practice_type: 'clinic',
          country_code: 'CM',
          message: 'I would like a demo.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/submitted/i);
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 422 without email', async () => {
      const res = await request(app)
        .post('/api/public/demo-request')
        .send({
          full_name: 'Dr. Jean Dupont'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/public/contact
  // ──────────────────────────────────────────────
  describe('POST /api/public/contact', () => {
    it('should send contact message', async () => {
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/public/contact')
        .send({
          name: 'Jean Dupont',
          email: 'jean@example.com',
          subject: 'Question about pricing',
          message: 'How much does the professional plan cost?'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/sent/i);
    });

    it('should return 422 without name/email/message', async () => {
      const res = await request(app)
        .post('/api/public/contact')
        .send({
          email: 'jean@example.com'
          // missing name and message
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ──────────────────────────────────────────────
  // POST /api/public/newsletter/subscribe
  // ──────────────────────────────────────────────
  describe('POST /api/public/newsletter/subscribe', () => {
    it('should subscribe with valid email', async () => {
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/public/newsletter/subscribe')
        .send({ email: 'subscriber@example.com', language: 'fr' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/subscribed/i);
    });

    it('should return 422 with invalid email', async () => {
      const res = await request(app)
        .post('/api/public/newsletter/subscribe')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
