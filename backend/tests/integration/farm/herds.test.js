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

describe('Farm - Herds routes', () => {
  describe('GET /api/v1/farm/herds', () => {
    it('should list herds with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 2 }]]);
      db.query.mockResolvedValueOnce([[
        { id: 1, name: 'Troupeau A', farm_name: 'Ferme 1', species_name: 'Bovin', breed_name: 'Zébu' },
        { id: 2, name: 'Troupeau B', farm_name: 'Ferme 1', species_name: 'Ovin', breed_name: null }
      ]]);

      const res = await request(app)
        .get('/api/v1/farm/herds')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  describe('POST /api/v1/farm/herds', () => {
    it('should create a herd', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ insertId: 10 }]);

      const res = await request(app)
        .post('/api/v1/farm/herds')
        .set('Authorization', 'Bearer ' + token)
        .send({ farm_id: 1, name: 'Nouveau Troupeau', species_id: 1, head_count: 50 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(10);
    });

    it('should return 422 without farm_id', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/farm/herds')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'No Farm' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/farm/herds/:id', () => {
    it('should update a herd', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/v1/farm/herds/1')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Troupeau Renommé', head_count: 75 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Updated');
    });
  });

  describe('POST /api/v1/farm/herds/:id/adjust-headcount', () => {
    it('should adjust head count', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/api/v1/farm/herds/1/adjust-headcount')
        .set('Authorization', 'Bearer ' + token)
        .send({ head_count: 120 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Head count updated');
    });

    it('should return 422 without head_count', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/farm/herds/1/adjust-headcount')
        .set('Authorization', 'Bearer ' + token)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
