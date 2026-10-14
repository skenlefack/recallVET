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

describe('Pharmacy - Suppliers routes', () => {
  describe('GET /api/v1/pharmacy/suppliers', () => {
    it('should list suppliers with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 1 }]]);
      db.query.mockResolvedValueOnce([[{ id: 1, name: 'Pharma Plus', contact_person: 'M. Dupont', city: 'Douala' }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/suppliers')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Pharma Plus');
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/v1/pharmacy/suppliers/:id', () => {
    it('should return supplier detail', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ id: 1, name: 'Pharma Plus', contact_person: 'M. Dupont', email: 'dupont@pharma.com' }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/suppliers/1')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Pharma Plus');
    });
  });

  describe('POST /api/v1/pharmacy/suppliers', () => {
    it('should create a supplier', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const res = await request(app)
        .post('/api/v1/pharmacy/suppliers')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Vet Supply Cameroun', contact_person: 'Mme Ngo', phone: '677123456' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(2);
    });

    it('should return 422 without name', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/pharmacy/suppliers')
        .set('Authorization', 'Bearer ' + token)
        .send({ contact_person: 'Quelqu\'un' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/pharmacy/suppliers/:id', () => {
    it('should update a supplier', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/v1/pharmacy/suppliers/1')
        .set('Authorization', 'Bearer ' + token)
        .send({ payment_terms_days: 60, city: 'Yaoundé' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Updated');
    });
  });
});
