jest.mock('../../../config/db', () => {
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
jest.mock('../../../services/auditService', () => ({ logAudit: jest.fn() }));
jest.mock('../../../services/emailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendInvitationEmail: jest.fn().mockResolvedValue(true)
}));

const request = require('supertest');
const app = require('../../../server');
const { generateTestToken, testUser } = require('../../helpers');
const db = require('../../../config/db');

const token = generateTestToken();

function mockAuthChain() {
  db.query.mockResolvedValueOnce([[testUser]]);
  db.query.mockResolvedValueOnce([[{
    id: 1, tenant_id: 1, structure_id: 1, site_id: 1, role: 'owner',
    tenant_name: 'Test', tenant_slug: 'test', default_currency: 'XAF', default_language: 'fr',
    structure_name: 'Test', structure_type: 'mixed', site_name: 'Main'
  }]]);
  db.query.mockResolvedValueOnce([[{
    id: 1, status: 'trialing', plan_id: 1, trial_ends_at: '2099-12-31',
    plan_code: 'professional', plan_name: 'Professional', features: null
  }]]);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Farm - Visits routes', () => {
  describe('GET /api/v1/farm/visits', () => {
    it('should list visits with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 1 }]]);
      db.query.mockResolvedValueOnce([[{
        id: 1, farm_name: 'Ferme Alpha', vet_name: 'Dr. Kamga', visit_date: '2026-01-15', status: 'completed'
      }]]);

      const res = await request(app)
        .get('/api/v1/farm/visits')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('POST /api/v1/farm/visits', () => {
    it('should create a visit', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ insertId: 5 }]);

      const res = await request(app)
        .post('/api/v1/farm/visits')
        .set('Authorization', 'Bearer ' + token)
        .send({ farm_id: 1, visit_date: '2026-03-01T08:00:00Z', visit_type: 'routine' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(5);
    });

    it('should return 422 without farm_id', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/farm/visits')
        .set('Authorization', 'Bearer ' + token)
        .send({ visit_date: '2026-03-01T08:00:00Z' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/farm/visits/:id', () => {
    it('should update a visit', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/v1/farm/visits/1')
        .set('Authorization', 'Bearer ' + token)
        .send({ status: 'in_progress', general_findings: 'Animaux en bonne santé' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Updated');
    });
  });

  describe('POST /api/v1/farm/visits/:id/close', () => {
    it('should close a visit', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/api/v1/farm/visits/1/close')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Visit closed');
    });
  });
});
