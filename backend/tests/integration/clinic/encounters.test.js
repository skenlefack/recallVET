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

describe('GET /api/v1/clinic/encounters', () => {
  it('should return encounters list', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[{ total: 1 }]]);
    db.query.mockResolvedValueOnce([[{
      id: 1, animal_name: 'Rex', animal_code: 'ANI-000001', owner_name: 'Jean Dupont',
      encounter_type: 'consultation', status: 'draft', encounter_date: '2025-06-15'
    }]]);

    const res = await request(app)
      .get('/api/v1/clinic/encounters')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('GET /api/v1/clinic/encounters/:id', () => {
  it('should return encounter detail', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[{
      id: 1, animal_name: 'Rex', animal_code: 'ANI-000001', owner_name: 'Jean Dupont',
      encounter_type: 'consultation', status: 'draft', visit_reason: 'Vaccination annuelle',
      temperature_c: 38.5, weight_kg: 12.0
    }]]);

    const res = await request(app)
      .get('/api/v1/clinic/encounters/1')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.encounter_type).toBe('consultation');
  });
});

describe('POST /api/v1/clinic/encounters', () => {
  it('should create encounter', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .post('/api/v1/clinic/encounters')
      .set('Authorization', 'Bearer ' + token)
      .send({
        animal_id: 1,
        party_id: 1,
        vet_user_id: 1,
        encounter_type: 'consultation',
        visit_reason: 'Annual checkup',
        temperature_c: 38.5
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(5);
  });

  it('should return 422 without animal_id', async () => {
    mockAuthChain();

    const res = await request(app)
      .post('/api/v1/clinic/encounters')
      .set('Authorization', 'Bearer ' + token)
      .send({
        party_id: 1,
        vet_user_id: 1,
        encounter_type: 'consultation'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'animal_id')).toBe(true);
  });
});

describe('PUT /api/v1/clinic/encounters/:id', () => {
  it('should update encounter', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/v1/clinic/encounters/1')
      .set('Authorization', 'Bearer ' + token)
      .send({ clinical_findings: 'Normal vitals', status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Updated');
  });
});

describe('POST /api/v1/clinic/encounters/:id/sign', () => {
  it('should sign encounter', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/v1/clinic/encounters/1/sign')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Signed');
  });
});
