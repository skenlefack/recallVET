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

describe('Pharmacy - Stock routes', () => {
  describe('GET /api/v1/pharmacy/stock/locations', () => {
    it('should list stock locations', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[
        { id: 1, name: 'Pharmacie principale', location_type: 'main_store' },
        { id: 2, name: 'Chambre froide', location_type: 'cold_room' }
      ]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/stock/locations')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/v1/pharmacy/stock/locations', () => {
    it('should create a stock location', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([{ insertId: 3 }]);

      const res = await request(app)
        .post('/api/v1/pharmacy/stock/locations')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Véhicule terrain', location_type: 'vehicle' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(3);
    });
  });

  describe('GET /api/v1/pharmacy/stock/levels', () => {
    it('should return aggregated stock levels', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{
        product_id: 1, product_name: 'Ivermectine', sku: 'IVM-001', unit: 'ml',
        reorder_level: 10, total_on_hand: 500, total_reserved: 20, earliest_expiry: '2027-06-30', lot_count: 3
      }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/stock/levels')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].total_on_hand).toBe(500);
    });
  });

  describe('GET /api/v1/pharmacy/stock/lots', () => {
    it('should list stock lots with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 1 }]]);
      db.query.mockResolvedValueOnce([[{
        id: 1, product_name: 'Ivermectine', sku: 'IVM-001', location_name: 'Pharmacie principale',
        lot_number: 'LOT-2026-01', quantity_on_hand: 200, expiry_date: '2027-06-30'
      }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/stock/lots')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('POST /api/v1/pharmacy/stock/movements', () => {
    it('should create a stock movement', async () => {
      mockAuthChain();
      // Transaction route uses conn.query
      db._conn.query.mockResolvedValueOnce([[{ id: 1, quantity_on_hand: 100 }]]);  // SELECT lot FOR UPDATE
      db._conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);                // UPDATE lot
      db._conn.query.mockResolvedValueOnce([{ insertId: 7 }]);                    // INSERT movement

      const res = await request(app)
        .post('/api/v1/pharmacy/stock/movements')
        .set('Authorization', 'Bearer ' + token)
        .send({
          movement_type: 'adjustment_out',
          product_id: 1,
          lot_id: 1,
          quantity: 5,
          reason: 'Correction inventaire'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(7);
      expect(db._conn.beginTransaction).toHaveBeenCalled();
      expect(db._conn.commit).toHaveBeenCalled();
    });

    it('should return 422 without movement_type', async () => {
      mockAuthChain();

      const res = await request(app)
        .post('/api/v1/pharmacy/stock/movements')
        .set('Authorization', 'Bearer ' + token)
        .send({ product_id: 1, quantity: 5 });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/pharmacy/stock/movements', () => {
    it('should list stock movements with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 1 }]]);
      db.query.mockResolvedValueOnce([[{
        id: 1, product_name: 'Ivermectine', movement_type: 'adjustment_out',
        quantity: 5, performed_by_name: 'testuser'
      }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/stock/movements')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });
});
