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

describe('Farm - Farms routes', () => {
  describe('GET /api/v1/farm/farms', () => {
    it('should list farms with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 1 }]]);
      db.query.mockResolvedValueOnce([[{ id: 1, name: 'Ferme Alpha', farm_code: 'FRM-00001', owner_name: 'Jean', herd_count: 3 }]]);

      const res = await request(app)
        .get('/api/v1/farm/farms')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Ferme Alpha');
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/v1/farm/farms/:id', () => {
    it('should return farm detail with herds', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ id: 1, name: 'Ferme Alpha', owner_name: 'Jean', owner_phone: '699000000' }]]);
      db.query.mockResolvedValueOnce([[{ id: 10, name: 'Troupeau Bovin', species_name: 'Bovin' }]]);

      const res = await request(app)
        .get('/api/v1/farm/farms/1')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Ferme Alpha');
      expect(res.body.data.herds).toHaveLength(1);
      expect(res.body.data.herds[0].name).toBe('Troupeau Bovin');
    });
  });

  describe('POST /api/v1/farm/farms', () => {
    it('should create a farm with valid data', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ cnt: 5 }]]);
      db.query.mockResolvedValueOnce([{ insertId: 6 }]);

      const res = await request(app)
        .post('/api/v1/farm/farms')
        .set('Authorization', 'Bearer ' + token)
        .send({ owner_party_id: 1, name: 'Nouvelle Ferme', farm_type: 'dairy' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(6);
      expect(res.body.data.farm_code).toBe('FRM-00006');
    });

    it('should return 422 without owner_party_id', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/farm/farms')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Missing Owner' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 without name', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/farm/farms')
        .set('Authorization', 'Bearer ' + token)
        .send({ owner_party_id: 1 });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/farm/farms/:id', () => {
    it('should update a farm', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/v1/farm/farms/1')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Ferme Mise a Jour' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Updated');
    });
  });
});
