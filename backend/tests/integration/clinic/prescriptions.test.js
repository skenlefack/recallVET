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

describe('GET /api/v1/clinic/prescriptions', () => {
  it('should return prescriptions list', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[{ total: 1 }]]);
    db.query.mockResolvedValueOnce([[{
      id: 1, prescription_number: 'RX-00001', animal_name: 'Rex', owner_name: 'Jean Dupont',
      status: 'active', prescription_date: '2025-06-15'
    }]]);

    const res = await request(app)
      .get('/api/v1/clinic/prescriptions')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('GET /api/v1/clinic/prescriptions/:id', () => {
  it('should return prescription with lines', async () => {
    mockAuthChain();
    // Prescription
    db.query.mockResolvedValueOnce([[{
      id: 1, prescription_number: 'RX-00001', animal_name: 'Rex', owner_name: 'Jean Dupont',
      status: 'active', prescription_date: '2025-06-15'
    }]]);
    // Lines
    db.query.mockResolvedValueOnce([[
      { id: 1, prescription_id: 1, product_name: 'Amoxicillin', dosage: '250mg', frequency: 'BID', duration_days: 7 },
      { id: 2, prescription_id: 1, product_name: 'Metacam', dosage: '0.1mg/kg', frequency: 'SID', duration_days: 5 }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/prescriptions/1')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.prescription_number).toBe('RX-00001');
    expect(res.body.data.lines).toHaveLength(2);
  });
});

describe('POST /api/v1/clinic/prescriptions', () => {
  it('should create prescription with lines', async () => {
    mockAuthChain();
    const conn = db._conn;
    // COUNT for number
    conn.query.mockResolvedValueOnce([[{ cnt: 10 }]]);
    // INSERT prescription
    conn.query.mockResolvedValueOnce([{ insertId: 11 }]);
    // INSERT line 1
    conn.query.mockResolvedValueOnce([{ insertId: 1 }]);
    // INSERT line 2
    conn.query.mockResolvedValueOnce([{ insertId: 2 }]);

    const res = await request(app)
      .post('/api/v1/clinic/prescriptions')
      .set('Authorization', 'Bearer ' + token)
      .send({
        animal_id: 1,
        party_id: 1,
        prescription_date: '2025-07-01',
        lines: [
          { product_name: 'Amoxicillin', dosage: '250mg', frequency: 'BID', duration_days: 7 },
          { product_name: 'Metacam', dosage: '0.1mg/kg', frequency: 'SID', duration_days: 5 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(11);
    expect(res.body.data.prescription_number).toBe('RX-00011');
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
  });

  it('should return 422 without animal_id', async () => {
    mockAuthChain();

    const res = await request(app)
      .post('/api/v1/clinic/prescriptions')
      .set('Authorization', 'Bearer ' + token)
      .send({ party_id: 1 });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'animal_id')).toBe(true);
  });
});

describe('POST /api/v1/clinic/prescriptions/:id/void', () => {
  it('should void prescription', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/v1/clinic/prescriptions/1/void')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Voided');
  });
});
