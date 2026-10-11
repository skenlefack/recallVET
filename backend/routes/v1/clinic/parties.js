const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createParty, updateParty } = require('../../../validators/clinic');

/**
 * @swagger
 * /v1/clinic/parties:
 *   get:
 *     summary: List parties (clients/contacts) with search and pagination
 *     tags: [Parties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, phone, or email
 *       - in: query
 *         name: party_type
 *         schema:
 *           type: string
 *           enum: [individual, company, farm, government]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Paginated list of parties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { search, party_type, page = 1, limit: rawLimit = 25, near_lat, near_lng, radius_km } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;

  const useGeo = near_lat && near_lng && radius_km;
  const lat = parseFloat(near_lat);
  const lng = parseFloat(near_lng);
  const radius = parseFloat(radius_km);

  let where = 'WHERE p.tenant_id = ?';
  const params = [tenantId];

  if (useGeo) {
    where += ' AND p.geo_lat IS NOT NULL AND p.geo_lng IS NOT NULL';
  }

  if (search) {
    where += ' AND (p.display_name LIKE ? OR p.phone_primary LIKE ? OR p.email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (party_type) {
    where += ' AND p.party_type = ?';
    params.push(party_type);
  }

  if (useGeo) {
    // Use Haversine formula for proximity search
    const distanceExpr = `(6371 * acos(LEAST(1.0, cos(radians(?)) * cos(radians(p.geo_lat)) * cos(radians(p.geo_lng) - radians(?)) + sin(radians(?)) * sin(radians(p.geo_lat)))))`;
    const geoParams = [lat, lng, lat];

    const countSql = `SELECT COUNT(*) as total FROM (
      SELECT p.id, ${distanceExpr} AS distance
      FROM rv_party p ${where}
      HAVING distance < ?
    ) geo_sub`;
    const [[{ total }]] = await db.query(countSql, [...geoParams, ...params, radius]);

    const dataSql = `SELECT p.*,
            (SELECT COUNT(*) FROM rv_animal a WHERE a.owner_party_id = p.id AND a.is_alive = 1) as animal_count,
            ${distanceExpr} AS distance
     FROM rv_party p ${where}
     HAVING distance < ?
     ORDER BY distance
     LIMIT ? OFFSET ?`;
    const [rows] = await db.query(dataSql, [...geoParams, ...params, radius, limit, parseInt(offset)]);

    // Round distance to 2 decimals
    rows.forEach(r => { if (r.distance != null) r.distance = Math.round(r.distance * 100) / 100; });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total, page: parseInt(page), limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } else {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM rv_party p ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT p.*,
              (SELECT COUNT(*) FROM rv_animal a WHERE a.owner_party_id = p.id AND a.is_alive = 1) as animal_count
       FROM rv_party p ${where}
       ORDER BY p.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, parseInt(offset)]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total, page: parseInt(page), limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
}));

// GET /api/v1/clinic/parties/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.* FROM rv_party p WHERE p.id = ? AND p.tenant_id = ?`,
    [req.params.id, req.tenant.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Party not found' });

  // Get contacts
  const [contacts] = await db.query('SELECT * FROM rv_party_contact WHERE party_id = ?', [req.params.id]);
  // Get addresses
  const [addresses] = await db.query('SELECT * FROM rv_address WHERE party_id = ?', [req.params.id]);
  // Get animals
  const [animals] = await db.query(
    `SELECT a.*, s.name_fr as species_name, b.name_fr as breed_name
     FROM rv_animal a
     LEFT JOIN rv_species s ON a.species_id = s.id
     LEFT JOIN rv_breed b ON a.breed_id = b.id
     WHERE a.owner_party_id = ? ORDER BY a.created_at DESC`,
    [req.params.id]
  );

  res.json({
    success: true,
    data: { ...rows[0], contacts, addresses, animals }
  });
}));

/**
 * @swagger
 * /v1/clinic/parties:
 *   post:
 *     summary: Create a new party (client or contact)
 *     tags: [Parties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [display_name]
 *             properties:
 *               party_type:
 *                 type: string
 *                 enum: [individual, company, farm, government]
 *               display_name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone_primary:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               country_code:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       201:
 *         description: Party created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/', createParty, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tenantId = req.tenant.id;
    const {
      party_type, display_name, first_name, last_name, legal_name,
      customer_segment, phone_primary, phone_secondary, whatsapp_number,
      email, country_code, region, city, geo_lat, geo_lng,
      preferred_currency, credit_limit, preferred_channel, notes,
      data_processing_consent, contacts, addresses
    } = req.body;

    // Generate client code
    const [[{ cnt }]] = await conn.query(
      'SELECT COUNT(*) as cnt FROM rv_party WHERE tenant_id = ?', [tenantId]
    );
    const client_code = `CLI-${(country_code || 'CM').toUpperCase()}-${String(cnt + 1).padStart(5, '0')}`;

    const [result] = await conn.query(
      `INSERT INTO rv_party (tenant_id, client_code, party_type, display_name, first_name, last_name,
        legal_name, customer_segment, phone_primary, phone_secondary, whatsapp_number, email,
        country_code, region, city, geo_lat, geo_lng, preferred_currency, credit_limit,
        preferred_channel, data_processing_consent, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, client_code, party_type, display_name, first_name || null, last_name || null,
        legal_name || null, customer_segment || 'private', phone_primary || null,
        phone_secondary || null, whatsapp_number || null, email || null,
        country_code || 'CM', region || null, city || null, geo_lat || null, geo_lng || null,
        preferred_currency || req.tenant.currency, credit_limit || 0,
        preferred_channel || null, data_processing_consent ? 1 : 0, notes || null, req.user.id]
    );

    const partyId = result.insertId;

    // Insert contacts
    if (contacts && contacts.length > 0) {
      for (const c of contacts) {
        await conn.query(
          'INSERT INTO rv_party_contact (party_id, contact_type, contact_value, is_primary, label) VALUES (?, ?, ?, ?, ?)',
          [partyId, c.contact_type, c.contact_value, c.is_primary ? 1 : 0, c.label || null]
        );
      }
    }

    // Insert addresses
    if (addresses && addresses.length > 0) {
      for (const a of addresses) {
        await conn.query(
          `INSERT INTO rv_address (party_id, address_type, line1, line2, city, region, postal_code, country_code, gps_lat, gps_lng, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [partyId, a.address_type || 'home', a.line1 || null, a.line2 || null, a.city || null,
            a.region || null, a.postal_code || null, a.country_code || 'CM',
            a.gps_lat || null, a.gps_lng || null, a.is_primary ? 1 : 0]
        );
      }
    }

    await conn.commit();
    await logAudit(tenantId, req.user.id, 'party', partyId, 'create', null, req.body, req.ip);

    res.status(201).json({ success: true, data: { id: partyId, client_code } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

// PUT /api/v1/clinic/parties/:id
router.put('/:id', updateParty, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const partyId = req.params.id;
    const tenantId = req.tenant.id;

    // Verify ownership
    const [existing] = await conn.query('SELECT * FROM rv_party WHERE id = ? AND tenant_id = ?', [partyId, tenantId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Party not found' });

    const {
      party_type, display_name, first_name, last_name, legal_name,
      customer_segment, phone_primary, phone_secondary, whatsapp_number,
      email, country_code, region, city, geo_lat, geo_lng,
      preferred_currency, credit_limit, preferred_channel, notes, status,
      data_processing_consent, contacts, addresses
    } = req.body;

    await conn.query(
      `UPDATE rv_party SET party_type=?, display_name=?, first_name=?, last_name=?, legal_name=?,
        customer_segment=?, phone_primary=?, phone_secondary=?, whatsapp_number=?, email=?,
        country_code=?, region=?, city=?, geo_lat=?, geo_lng=?, preferred_currency=?,
        credit_limit=?, preferred_channel=?, data_processing_consent=?, notes=?, status=?
       WHERE id = ? AND tenant_id = ?`,
      [party_type || existing[0].party_type, display_name || existing[0].display_name,
        first_name ?? existing[0].first_name, last_name ?? existing[0].last_name,
        legal_name ?? existing[0].legal_name, customer_segment || existing[0].customer_segment,
        phone_primary ?? existing[0].phone_primary, phone_secondary ?? existing[0].phone_secondary,
        whatsapp_number ?? existing[0].whatsapp_number, email ?? existing[0].email,
        country_code || existing[0].country_code, region ?? existing[0].region,
        city ?? existing[0].city, geo_lat ?? existing[0].geo_lat, geo_lng ?? existing[0].geo_lng,
        preferred_currency || existing[0].preferred_currency, credit_limit ?? existing[0].credit_limit,
        preferred_channel ?? existing[0].preferred_channel,
        data_processing_consent != null ? (data_processing_consent ? 1 : 0) : existing[0].data_processing_consent,
        notes ?? existing[0].notes,
        status || existing[0].status, partyId, tenantId]
    );

    // Replace contacts if provided
    if (contacts) {
      await conn.query('DELETE FROM rv_party_contact WHERE party_id = ?', [partyId]);
      for (const c of contacts) {
        await conn.query(
          'INSERT INTO rv_party_contact (party_id, contact_type, contact_value, is_primary, label) VALUES (?, ?, ?, ?, ?)',
          [partyId, c.contact_type, c.contact_value, c.is_primary ? 1 : 0, c.label || null]
        );
      }
    }

    // Replace addresses if provided
    if (addresses) {
      await conn.query('DELETE FROM rv_address WHERE party_id = ?', [partyId]);
      for (const a of addresses) {
        await conn.query(
          `INSERT INTO rv_address (party_id, address_type, line1, line2, city, region, postal_code, country_code, gps_lat, gps_lng, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [partyId, a.address_type || 'home', a.line1 || null, a.line2 || null, a.city || null,
            a.region || null, a.postal_code || null, a.country_code || 'CM',
            a.gps_lat || null, a.gps_lng || null, a.is_primary ? 1 : 0]
        );
      }
    }

    await conn.commit();
    await logAudit(tenantId, req.user.id, 'party', partyId, 'update', existing[0], req.body, req.ip);

    res.json({ success: true, message: 'Party updated' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

// DELETE /api/v1/clinic/parties/:id (soft delete via status)
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    "UPDATE rv_party SET status = 'archived' WHERE id = ? AND tenant_id = ?",
    [req.params.id, req.tenant.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Party not found' });
  await logAudit(req.tenant.id, req.user.id, 'party', req.params.id, 'delete', null, null, req.ip);
  res.json({ success: true, message: 'Party archived' });
}));

module.exports = router;
