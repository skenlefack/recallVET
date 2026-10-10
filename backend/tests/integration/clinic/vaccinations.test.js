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

describe('GET /api/v1/clinic/vaccinations', () => {
  it('should return vaccinations list', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[{ total: 2 }]]);
    db.query.mockResolvedValueOnce([[
      { id: 1, product_name: 'Rabigen', animal_name: 'Rex', vaccination_date: '2025-06-01' },
      { id: 2, product_name: 'Nobivac DHPPi', animal_name: 'Mimi', vaccination_date: '2025-06-02' }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/vaccinations')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });
});

describe('POST /api/v1/clinic/vaccinations', () => {
  it('should create vaccination', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ insertId: 3 }]);

    const res = await request(app)
      .post('/api/v1/clinic/vaccinations')
      .set('Authorization', 'Bearer ' + token)
      .send({
        animal_id: 1,
        product_name: 'Rabigen Mono',
        vaccination_date: '2025-07-01',
        route: 'SC',
        dose_number: 1,
        lot_number: 'LOT-123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(3);
  });

  it('should return 422 without animal_id', async () => {
    mockAuthChain();

    const res = await request(app)
      .post('/api/v1/clinic/vaccinations')
      .set('Authorization', 'Bearer ' + token)
      .send({
        product_name: 'Rabigen Mono',
        vaccination_date: '2025-07-01'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'animal_id')).toBe(true);
  });
});

describe('PUT /api/v1/clinic/vaccinations/:id', () => {
  it('should update vaccination', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/v1/clinic/vaccinations/1')
      .set('Authorization', 'Bearer ' + token)
      .send({ notes: 'No adverse reaction', dose_number: 2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Updated');
  });
});
