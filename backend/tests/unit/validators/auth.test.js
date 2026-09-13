const { validationResult } = require('express-validator');
const { register, login, forgotPassword, resetPassword } = require('../../../validators/auth');

async function runValidators(validators, body = {}, params = {}, query = {}) {
  const req = { body, params, query, headers: {} };
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
}

describe('Auth Validators', () => {
  describe('register', () => {
    it('should pass with valid data', async () => {
      const result = await runValidators(register, {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Jean',
        last_name: 'Dupont'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without email', async () => {
      const result = await runValidators(register, {
        password: 'password123',
        first_name: 'Jean',
        last_name: 'Dupont'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'email')).toBe(true);
    });

    it('should fail with short password', async () => {
      const result = await runValidators(register, {
        email: 'test@example.com',
        password: 'short',
        first_name: 'Jean',
        last_name: 'Dupont'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'password')).toBe(true);
    });

    it('should fail without first_name', async () => {
      const result = await runValidators(register, {
        email: 'test@example.com',
        password: 'password123',
        last_name: 'Dupont'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'first_name')).toBe(true);
    });
  });

  describe('login', () => {
    it('should pass with valid data', async () => {
      const result = await runValidators(login, {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without email', async () => {
      const result = await runValidators(login, {
        password: 'password123'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'email')).toBe(true);
    });

    it('should fail without password', async () => {
      const result = await runValidators(login, {
        email: 'test@example.com'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'password')).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should pass with valid email', async () => {
      const result = await runValidators(forgotPassword, {
        email: 'test@example.com'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const result = await runValidators(forgotPassword, {
        email: 'not-an-email'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'email')).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should pass with valid data', async () => {
      const result = await runValidators(resetPassword, {
        token: 'abc123',
        password: 'newpassword123'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without token', async () => {
      const result = await runValidators(resetPassword, {
        password: 'newpassword123'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'token')).toBe(true);
    });

    it('should fail with short password', async () => {
      const result = await runValidators(resetPassword, {
        token: 'abc123',
        password: 'short'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'password')).toBe(true);
    });
  });
});
