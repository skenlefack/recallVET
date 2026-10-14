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
  db.query.mockResolvedValueOnce([[testUser]]); // auth
  db.query.mockResolvedValueOnce([[{
    id: 1, tenant_id: 1, structure_id: 1, site_id: 1, role: 'owner',
    tenant_name: 'Test Clinic', tenant_slug: 'test', default_currency: 'XAF', default_language: 'fr',
    structure_name: 'Test', structure_type: 'mixed', site_name: 'Main'
  }]]); // tenant
  db.query.mockResolvedValueOnce([[{
    id: 1, status: 'trialing', plan_id: 1, trial_ends_at: '2099-12-31',
    plan_code: 'professional', plan_name: 'Professional', features: '{}'
  }]]); // subscription
}

function mockPlanLimitPass() {
  // checkPlanLimit: subscription query returns null limit → unlimited
  db.query.mockResolvedValueOnce([[{ max_users: null, max_animals: null, max_structures: null }]]);
}

beforeEach(() => {
  jest.clearAllMocks();
  db.query.mockReset();
  db._conn.query.mockReset();
  db.getConnection.mockResolvedValue(db._conn);
});

describe('GET /api/v1/clinic/animals', () => {
  it('should return paginated animals list', async () => {
    mockAuthChain();
    // COUNT query
    db.query.mockResolvedValueOnce([[{ total: 2 }]]);
    // SELECT query
    db.query.mockResolvedValueOnce([[
      { id: 1, name: 'Rex', animal_code: 'ANI-000001', species_name: 'Chien', owner_name: 'Jean Dupont' },
      { id: 2, name: 'Mimi', animal_code: 'ANI-000002', species_name: 'Chat', owner_name: 'Marie Claire' }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/animals')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.page).toBe(1);
  });
});

describe('GET /api/v1/clinic/animals/:id', () => {
  it('should return animal by id', async () => {
    mockAuthChain();
    // Animal SELECT
    db.query.mockResolvedValueOnce([[{
      id: 1, name: 'Rex', animal_code: 'ANI-000001', species_name: 'Chien',
      owner_name: 'Jean Dupont', owner_id: 10, tenant_id: 1
    }]]);
    // Identifiers query
    db.query.mockResolvedValueOnce([[
      { id: 1, animal_id: 1, identifier_type: 'microchip', identifier_value: '123456789' }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/animals/1')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Rex');
    expect(res.body.data.identifiers).toHaveLength(1);
  });

  it('should return 404 for non-existent animal', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/api/v1/clinic/animals/999')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Animal not found');
  });
});

describe('POST /api/v1/clinic/animals', () => {
  it('should create animal with valid data', async () => {
    mockAuthChain();
    mockPlanLimitPass();
    const conn = db._conn;
    // COUNT for code generation
    conn.query.mockResolvedValueOnce([[{ cnt: 5 }]]);
    // INSERT
    conn.query.mockResolvedValueOnce([{ insertId: 6 }]);

    const res = await request(app)
      .post('/api/v1/clinic/animals')
      .set('Authorization', 'Bearer ' + token)
      .send({ owner_party_id: 1, species_id: 1, name: 'Buddy', sex: 'M' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(6);
    expect(res.body.data.animal_code).toBe('ANI-000006');
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
  });

  it('should return 422 without owner_party_id', async () => {
    mockAuthChain();
    mockPlanLimitPass();

    const res = await request(app)
      .post('/api/v1/clinic/animals')
      .set('Authorization', 'Bearer ' + token)
      .send({ species_id: 1, name: 'Buddy' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'owner_party_id')).toBe(true);
  });
});

describe('PUT /api/v1/clinic/animals/:id', () => {
  it('should update animal', async () => {
    mockAuthChain();
    const conn = db._conn;
    // SELECT existing
    conn.query.mockResolvedValueOnce([[{ id: 1, name: 'Rex', tenant_id: 1 }]]);
    // UPDATE
    conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/v1/clinic/animals/1')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Rex Updated', weight_kg: 12.5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Animal updated');
    expect(conn.commit).toHaveBeenCalled();
  });

  it('should return 404 for non-existent animal', async () => {
    mockAuthChain();
    const conn = db._conn;
    conn.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .put('/api/v1/clinic/animals/999')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
