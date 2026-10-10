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
const db = require('../../../config/db');
const { generateTestToken, testUser } = require('../../helpers');

const token = generateTestToken();

function mockAuthChain() {
  db.query.mockResolvedValueOnce([[testUser]]);
  db.query.mockResolvedValueOnce([[{
    id: 1, tenant_id: 1, structure_id: 1, site_id: 1, role: 'owner',
    tenant_name: 'Test Clinic', tenant_slug: 'test', default_currency: 'XAF', default_language: 'fr',
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

describe('GET /api/v1/clinic/invoices', () => {
  it('should return invoices list', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[{ total: 2 }]]);
    db.query.mockResolvedValueOnce([[
      { id: 1, invoice_number: 'INV-00001', party_name: 'Jean Dupont', total_amount: 15000, status: 'draft' },
      { id: 2, invoice_number: 'INV-00002', party_name: 'Marie Claire', total_amount: 25000, status: 'paid' }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/invoices')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });
});

describe('GET /api/v1/clinic/invoices/:id', () => {
  it('should return invoice with lines and payments', async () => {
    mockAuthChain();
    // Invoice
    db.query.mockResolvedValueOnce([[{
      id: 1, invoice_number: 'INV-00001', party_name: 'Jean Dupont',
      total_amount: 15000, status: 'partially_paid', currency: 'XAF'
    }]]);
    // Lines
    db.query.mockResolvedValueOnce([[
      { id: 1, invoice_id: 1, description: 'Consultation', quantity: 1, unit_price: 10000, line_total: 10000 },
      { id: 2, invoice_id: 1, description: 'Vaccin antirabique', quantity: 1, unit_price: 5000, line_total: 5000 }
    ]]);
    // Payments
    db.query.mockResolvedValueOnce([[
      { id: 1, invoice_id: 1, amount: 10000, payment_method: 'cash', payment_date: '2025-06-15' }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/invoices/1')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoice_number).toBe('INV-00001');
    expect(res.body.data.lines).toHaveLength(2);
    expect(res.body.data.payments).toHaveLength(1);
  });
});

describe('POST /api/v1/clinic/invoices', () => {
  it('should create invoice with line items', async () => {
    mockAuthChain();
    const conn = db._conn;
    // COUNT for number
    conn.query.mockResolvedValueOnce([[{ cnt: 5 }]]);
    // INSERT invoice
    conn.query.mockResolvedValueOnce([{ insertId: 6 }]);
    // INSERT line 1
    conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
    // INSERT line 2
    conn.query.mockResolvedValueOnce([{ insertId: 2 }]);

    const res = await request(app)
      .post('/api/v1/clinic/invoices')
      .set('Authorization', 'Bearer ' + token)
      .send({
        party_id: 1,
        invoice_date: '2025-07-01',
        lines: [
          { description: 'Consultation', quantity: 1, unit_price: 10000, tax_rate: 0 },
          { description: 'Vaccin', quantity: 1, unit_price: 5000, tax_rate: 19.25 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(6);
    expect(res.body.data.invoice_number).toBe('INV-00006');
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
  });

  it('should return 422 without party_id', async () => {
    mockAuthChain();

    const res = await request(app)
      .post('/api/v1/clinic/invoices')
      .set('Authorization', 'Bearer ' + token)
      .send({ invoice_date: '2025-07-01' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'party_id')).toBe(true);
  });
});

describe('POST /api/v1/clinic/invoices/:id/pay', () => {
  it('should record payment', async () => {
    mockAuthChain();
    const conn = db._conn;
    // SELECT invoice
    conn.query.mockResolvedValueOnce([[{ id: 1, total_amount: 15000, status: 'draft', tenant_id: 1 }]]);
    // INSERT payment
    conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
    // SUM total_paid
    conn.query.mockResolvedValueOnce([[{ total_paid: 15000 }]]);
    // UPDATE invoice status
    conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/v1/clinic/invoices/1/pay')
      .set('Authorization', 'Bearer ' + token)
      .send({ amount: 15000, payment_method: 'cash' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Payment recorded');
    expect(res.body.data.status).toBe('paid');
    expect(res.body.data.total_paid).toBe(15000);
    expect(conn.commit).toHaveBeenCalled();
  });

  it('should return 422 without amount', async () => {
    mockAuthChain();

    const res = await request(app)
      .post('/api/v1/clinic/invoices/1/pay')
      .set('Authorization', 'Bearer ' + token)
      .send({ payment_method: 'cash' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'amount')).toBe(true);
  });
});
