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
    plan_code: 'professional', plan_name: 'Professional', features: '{}'
  }]]);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Farm - Health Events routes', () => {
  describe('GET /api/v1/farm/health-events', () => {
    it('should list health events with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 2 }]]);
      db.query.mockResolvedValueOnce([[
        { id: 1, farm_name: 'Ferme Alpha', herd_name: 'Troupeau A', event_type: 'disease', status: 'active' },
        { id: 2, farm_name: 'Ferme Alpha', herd_name: null, event_type: 'observation', status: 'resolved' }
      ]]);

      const res = await request(app)
        .get('/api/v1/farm/health-events')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  describe('POST /api/v1/farm/health-events', () => {
    it('should create a health event', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ insertId: 3 }]);

      const res = await request(app)
        .post('/api/v1/farm/health-events')
        .set('Authorization', 'Bearer ' + token)
        .send({
          farm_id: 1,
          event_date: '2026-02-10T10:00:00Z',
          event_type: 'disease',
          disease_suspected: 'Fièvre aphteuse',
          animals_affected: 5,
          animals_dead: 1
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(3);
    });

    it('should return 422 without farm_id', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/farm/health-events')
        .set('Authorization', 'Bearer ' + token)
        .send({ event_date: '2026-02-10T10:00:00Z' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/farm/health-events/:id', () => {
    it('should update a health event', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/v1/farm/health-events/1')
        .set('Authorization', 'Bearer ' + token)
        .send({ animals_affected: 8, actions_taken: 'Quarantaine mise en place' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Updated');
    });
  });

  describe('POST /api/v1/farm/health-events/:id/escalate', () => {
    it('should escalate a health event', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/api/v1/farm/health-events/1/escalate')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Escalated');
    });
  });

  describe('POST /api/v1/farm/health-events/:id/resolve', () => {
    it('should resolve a health event', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/api/v1/farm/health-events/1/resolve')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Resolved');
    });
  });
});
