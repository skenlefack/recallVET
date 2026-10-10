// Set test environment variables before anything loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-long-enough-32chars';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-long-enough-32';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'recallvet_test';

// Suppress winston output in tests
jest.mock('../services/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));
