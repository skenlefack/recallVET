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

describe('Pharmacy - Products routes', () => {
  describe('GET /api/v1/pharmacy/products/categories', () => {
    it('should list categories', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[
        { id: 1, name_fr: 'Antibiotiques', name_en: 'Antibiotics', parent_id: null },
        { id: 2, name_fr: 'Vaccins', name_en: 'Vaccines', parent_id: null }
      ]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/products/categories')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/v1/pharmacy/products/categories', () => {
    it('should create a category', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ insertId: 3 }]);

      const res = await request(app)
        .post('/api/v1/pharmacy/products/categories')
        .set('Authorization', 'Bearer ' + token)
        .send({ name_fr: 'Antiparasitaires', name_en: 'Antiparasitics' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(3);
    });
  });

  describe('GET /api/v1/pharmacy/products', () => {
    it('should list products with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 1 }]]);
      db.query.mockResolvedValueOnce([[{
        id: 1, name: 'Ivermectine 1%', sku: 'IVM-001', category_name: 'Antiparasitaires', total_stock: 100
      }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/products')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Ivermectine 1%');
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/v1/pharmacy/products/:id', () => {
    it('should return product detail with suppliers', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ id: 1, name: 'Ivermectine 1%', category_name: 'Antiparasitaires' }]]);
      db.query.mockResolvedValueOnce([[{ id: 10, supplier_name: 'Pharma Plus', unit_cost: 5000 }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/products/1')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Ivermectine 1%');
      expect(res.body.data.suppliers).toHaveLength(1);
      expect(res.body.data.suppliers[0].supplier_name).toBe('Pharma Plus');
    });
  });

  describe('POST /api/v1/pharmacy/products', () => {
    it('should create a product', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ insertId: 5 }]);

      const res = await request(app)
        .post('/api/v1/pharmacy/products')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Amoxicilline 500mg', unit: 'comprimé', unit_price: 1500 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(5);
    });

    it('should return 422 without name', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/pharmacy/products')
        .set('Authorization', 'Bearer ' + token)
        .send({ unit_price: 1500 });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/pharmacy/products/:id', () => {
    it('should update a product', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/v1/pharmacy/products/1')
        .set('Authorization', 'Bearer ' + token)
        .send({ unit_price: 2000, reorder_level: 20 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Updated');
    });
  });
});
