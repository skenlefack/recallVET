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

describe('GET /api/v1/clinic/appointments', () => {
  it('should return appointments list', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[{ total: 1 }]]);
    db.query.mockResolvedValueOnce([[{
      id: 1, animal_name: 'Rex', animal_code: 'ANI-000001', owner_name: 'Jean Dupont',
      scheduled_date: '2025-06-15', start_time: '09:00', status: 'scheduled'
    }]]);

    const res = await request(app)
      .get('/api/v1/clinic/appointments')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('POST /api/v1/clinic/appointments', () => {
  it('should create appointment', async () => {
    mockAuthChain();
    // INSERT
    db.query.mockResolvedValueOnce([{ insertId: 10 }]);

    const res = await request(app)
      .post('/api/v1/clinic/appointments')
      .set('Authorization', 'Bearer ' + token)
      .send({
        animal_id: 1,
        party_id: 1,
        vet_user_id: 1,
        scheduled_date: '2025-07-01',
        appointment_type: 'consultation',
        start_time: '10:00'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(10);
  });

  it('should return 422 without animal_id', async () => {
    mockAuthChain();

    const res = await request(app)
      .post('/api/v1/clinic/appointments')
      .set('Authorization', 'Bearer ' + token)
      .send({
        vet_user_id: 1,
        scheduled_date: '2025-07-01'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'animal_id')).toBe(true);
  });
});

describe('PUT /api/v1/clinic/appointments/:id', () => {
  it('should update appointment', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/v1/clinic/appointments/1')
      .set('Authorization', 'Bearer ' + token)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Updated');
  });
});

describe('POST /api/v1/clinic/appointments/:id/check-in', () => {
  it('should check in appointment', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/v1/clinic/appointments/1/check-in')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Checked in');
  });
});

describe('POST /api/v1/clinic/appointments/:id/cancel', () => {
  it('should cancel appointment', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/v1/clinic/appointments/1/cancel')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Cancelled');
  });
});
