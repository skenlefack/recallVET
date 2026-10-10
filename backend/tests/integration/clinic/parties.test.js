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

describe('GET /api/v1/clinic/parties', () => {
  it('should return paginated parties', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([[{ total: 2 }]]);
    db.query.mockResolvedValueOnce([[
      { id: 1, display_name: 'Jean Dupont', party_type: 'individual', animal_count: 2 },
      { id: 2, display_name: 'Ferme Centrale', party_type: 'organization', animal_count: 10 }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/parties')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });
});

describe('GET /api/v1/clinic/parties/:id', () => {
  it('should return party with contacts, addresses, and animals', async () => {
    mockAuthChain();
    // Party
    db.query.mockResolvedValueOnce([[{
      id: 1, display_name: 'Jean Dupont', party_type: 'individual', tenant_id: 1
    }]]);
    // Contacts
    db.query.mockResolvedValueOnce([[
      { id: 1, party_id: 1, contact_type: 'phone', contact_value: '+237600000000' }
    ]]);
    // Addresses
    db.query.mockResolvedValueOnce([[
      { id: 1, party_id: 1, address_type: 'home', city: 'Douala' }
    ]]);
    // Animals
    db.query.mockResolvedValueOnce([[
      { id: 1, name: 'Rex', species_name: 'Chien' }
    ]]);

    const res = await request(app)
      .get('/api/v1/clinic/parties/1')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.display_name).toBe('Jean Dupont');
    expect(res.body.data.contacts).toHaveLength(1);
    expect(res.body.data.addresses).toHaveLength(1);
    expect(res.body.data.animals).toHaveLength(1);
  });
});

describe('POST /api/v1/clinic/parties', () => {
  it('should create party with valid data', async () => {
    mockAuthChain();
    const conn = db._conn;
    // COUNT for code
    conn.query.mockResolvedValueOnce([[{ cnt: 3 }]]);
    // INSERT
    conn.query.mockResolvedValueOnce([{ insertId: 4 }]);

    const res = await request(app)
      .post('/api/v1/clinic/parties')
      .set('Authorization', 'Bearer ' + token)
      .send({
        display_name: 'Marie Claire',
        party_type: 'individual',
        phone_primary: '+237600111222'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(4);
    expect(res.body.data.client_code).toBe('CLI-CM-00004');
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
  });

  it('should return 422 without display_name', async () => {
    mockAuthChain();

    const res = await request(app)
      .post('/api/v1/clinic/parties')
      .set('Authorization', 'Bearer ' + token)
      .send({ party_type: 'individual' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'display_name')).toBe(true);
  });
});

describe('PUT /api/v1/clinic/parties/:id', () => {
  it('should update party', async () => {
    mockAuthChain();
    const conn = db._conn;
    // SELECT existing
    conn.query.mockResolvedValueOnce([[{
      id: 1, display_name: 'Jean Dupont', party_type: 'individual', tenant_id: 1,
      first_name: 'Jean', last_name: 'Dupont', legal_name: null, customer_segment: 'private',
      phone_primary: null, phone_secondary: null, whatsapp_number: null, email: null,
      country_code: 'CM', region: null, city: null, geo_lat: null, geo_lng: null,
      preferred_currency: 'XAF', credit_limit: 0, preferred_channel: null, notes: null, status: 'active'
    }]]);
    // UPDATE
    conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/v1/clinic/parties/1')
      .set('Authorization', 'Bearer ' + token)
      .send({ display_name: 'Jean Dupont Jr', party_type: 'individual' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Party updated');
    expect(conn.commit).toHaveBeenCalled();
  });
});

describe('DELETE /api/v1/clinic/parties/:id', () => {
  it('should soft-delete (archive) party', async () => {
    mockAuthChain();
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete('/api/v1/clinic/parties/1')
      .set('Authorization', 'Bearer ' + token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Party archived');
  });
});
