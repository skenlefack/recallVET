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

describe('Pharmacy - Sales routes', () => {
  describe('GET /api/v1/pharmacy/sales', () => {
    it('should list sales with pagination', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ total: 1 }]]);
      db.query.mockResolvedValueOnce([[{
        id: 1, sale_number: 'SALE-00001', total_amount: 15000, party_name: 'Client X',
        sold_by_name: 'testuser', status: 'completed'
      }]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/sales')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].sale_number).toBe('SALE-00001');
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/v1/pharmacy/sales/:id', () => {
    it('should return sale with lines', async () => {
      mockAuthChain();
      db.query.mockResolvedValueOnce([[{ id: 1, sale_number: 'SALE-00001', total_amount: 15000, status: 'completed' }]]);
      db.query.mockResolvedValueOnce([[
        { id: 10, product_name: 'Ivermectine', quantity: 2, unit_price: 5000, line_total: 10000 },
        { id: 11, product_name: 'Amoxicilline', quantity: 1, unit_price: 5000, line_total: 5000 }
      ]]);

      const res = await request(app)
        .get('/api/v1/pharmacy/sales/1')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sale_number).toBe('SALE-00001');
      expect(res.body.data.lines).toHaveLength(2);
    });
  });

  describe('POST /api/v1/pharmacy/sales', () => {
    it('should create a retail sale with lines', async () => {
      mockAuthChain();
      // Transaction route uses conn.query
      db._conn.query
        // COUNT for sale_number
        .mockResolvedValueOnce([[{ cnt: 3 }]])
        // INSERT sale
        .mockResolvedValueOnce([{ insertId: 4 }])
        // INSERT sale line
        .mockResolvedValueOnce([{ insertId: 20 }])
        // SELECT lot FOR UPDATE
        .mockResolvedValueOnce([[{ id: 1, quantity_on_hand: 100, location_id: 1 }]])
        // UPDATE lot quantity
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        // INSERT stock movement
        .mockResolvedValueOnce([{ insertId: 30 }]);

      const res = await request(app)
        .post('/api/v1/pharmacy/sales')
        .set('Authorization', 'Bearer ' + token)
        .send({
          party_id: 1,
          payment_method: 'cash',
          lines: [
            { product_id: 1, lot_id: 1, quantity: 2, unit_price: 5000, discount: 0 }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(4);
      expect(res.body.data.sale_number).toBe('SALE-00004');
      expect(res.body.data.total_amount).toBe(10000);
      expect(db._conn.beginTransaction).toHaveBeenCalled();
      expect(db._conn.commit).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/pharmacy/sales/:id/void', () => {
    it('should void a completed sale', async () => {
      mockAuthChain();
      // Transaction route uses conn.query
      db._conn.query
        // SELECT sale
        .mockResolvedValueOnce([[{ id: 1, status: 'completed', total_amount: 10000 }]])
        // SELECT sale lines
        .mockResolvedValueOnce([[{ id: 10, product_id: 1, lot_id: 1, quantity: 2 }]])
        // UPDATE lot (restore stock)
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        // INSERT reverse stock movement
        .mockResolvedValueOnce([{ insertId: 31 }])
        // UPDATE sale status to voided
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/api/v1/pharmacy/sales/1/void')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Sale voided');
      expect(db._conn.beginTransaction).toHaveBeenCalled();
      expect(db._conn.commit).toHaveBeenCalled();
    });
  });
});
