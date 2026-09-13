const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createAnimal, updateAnimal } = require('../../../validators/clinic');

/**
 * @swagger
 * /v1/clinic/animals:
 *   get:
 *     summary: List animals with filtering and pagination
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, code, microchip, or owner name
 *       - in: query
 *         name: species_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: owner_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: alive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
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
 *         description: Paginated list of animals
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { search, species_id, owner_id, alive, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE a.tenant_id = ?';
  const params = [tenantId];

  if (search) {
    where += ' AND (a.name LIKE ? OR a.animal_code LIKE ? OR a.microchip_number LIKE ? OR p.display_name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (species_id) { where += ' AND a.species_id = ?'; params.push(species_id); }
  if (owner_id) { where += ' AND a.owner_party_id = ?'; params.push(owner_id); }
  if (alive !== undefined) { where += ' AND a.is_alive = ?'; params.push(alive === 'true' ? 1 : 0); }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) as total FROM rv_animal a LEFT JOIN rv_party p ON a.owner_party_id = p.id ${where}`, params
  );

  const [rows] = await db.query(
    `SELECT a.*, s.name_fr as species_name, s.code as species_code, b.name_fr as breed_name,
            p.display_name as owner_name, p.phone_primary as owner_phone
     FROM rv_animal a
     LEFT JOIN rv_species s ON a.species_id = s.id
     LEFT JOIN rv_breed b ON a.breed_id = b.id
     LEFT JOIN rv_party p ON a.owner_party_id = p.id
     ${where}
     ORDER BY a.updated_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );

  res.json({
    success: true, data: rows,
    pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) }
  });
}));

/**
 * @swagger
 * /v1/clinic/animals/{id}:
 *   get:
 *     summary: Get animal by ID
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Animal ID
 *     responses:
 *       200:
 *         description: Animal details with identifiers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Animal not found
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT a.*, s.name_fr as species_name, s.code as species_code, b.name_fr as breed_name,
            p.display_name as owner_name, p.phone_primary as owner_phone, p.id as owner_id
     FROM rv_animal a
     LEFT JOIN rv_species s ON a.species_id = s.id
     LEFT JOIN rv_breed b ON a.breed_id = b.id
     LEFT JOIN rv_party p ON a.owner_party_id = p.id
     WHERE a.id = ? AND a.tenant_id = ?`,
    [req.params.id, req.tenant.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Animal not found' });

  const [identifiers] = await db.query('SELECT * FROM rv_animal_identifier WHERE animal_id = ?', [req.params.id]);

  res.json({ success: true, data: { ...rows[0], identifiers } });
}));

/**
 * @swagger
 * /v1/clinic/animals:
 *   post:
 *     summary: Create a new animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [owner_party_id, species_id]
 *             properties:
 *               owner_party_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               species_id:
 *                 type: integer
 *               breed_id:
 *                 type: integer
 *               sex:
 *                 type: string
 *                 enum: [male, female, unknown]
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               microchip_number:
 *                 type: string
 *               weight_kg:
 *                 type: number
 *     responses:
 *       201:
 *         description: Animal created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/', createAnimal, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tenantId = req.tenant.id;
    const {
      owner_party_id, name, species_id, breed_id, sex, date_of_birth,
      estimated_age_months, color_markings, weight_kg, reproductive_status,
      microchip_number, tattoo_number, ear_tag_number, passport_number,
      photo_url, allergies, medical_history_summary, farm_id, herd_id, notes,
      identifiers
    } = req.body;

    // Generate animal code
    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_animal WHERE tenant_id = ?', [tenantId]);
    const animal_code = `ANI-${String(cnt + 1).padStart(6, '0')}`;

    const [result] = await conn.query(
      `INSERT INTO rv_animal (tenant_id, animal_code, owner_party_id, name, species_id, breed_id, sex,
        date_of_birth, estimated_age_months, color_markings, weight_kg, reproductive_status,
        microchip_number, tattoo_number, ear_tag_number, passport_number, photo_url,
        allergies, medical_history_summary, farm_id, herd_id, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, animal_code, owner_party_id, name || null, species_id, breed_id || null,
        sex || 'unknown', date_of_birth || null, estimated_age_months || null,
        color_markings || null, weight_kg || null, reproductive_status || 'unknown',
        microchip_number || null, tattoo_number || null, ear_tag_number || null,
        passport_number || null, photo_url || null, allergies || null,
        medical_history_summary || null, farm_id || null, herd_id || null,
        notes || null, req.user.id]
    );

    const animalId = result.insertId;

    if (identifiers && identifiers.length > 0) {
      for (const id of identifiers) {
        await conn.query(
          'INSERT INTO rv_animal_identifier (animal_id, identifier_type, identifier_value, applied_date, notes) VALUES (?, ?, ?, ?, ?)',
          [animalId, id.identifier_type, id.identifier_value, id.applied_date || null, id.notes || null]
        );
      }
    }

    await conn.commit();
    await logAudit(tenantId, req.user.id, 'animal', animalId, 'create', null, req.body, req.ip);

    res.status(201).json({ success: true, data: { id: animalId, animal_code } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

/**
 * @swagger
 * /v1/clinic/animals/{id}:
 *   put:
 *     summary: Update an existing animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               species_id:
 *                 type: integer
 *               breed_id:
 *                 type: integer
 *               sex:
 *                 type: string
 *               weight_kg:
 *                 type: number
 *               is_alive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Animal updated
 *       404:
 *         description: Animal not found
 */
router.put('/:id', updateAnimal, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const animalId = req.params.id;
    const tenantId = req.tenant.id;

    const [existing] = await conn.query('SELECT * FROM rv_animal WHERE id = ? AND tenant_id = ?', [animalId, tenantId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Animal not found' });

    const fields = ['owner_party_id', 'name', 'species_id', 'breed_id', 'sex', 'date_of_birth',
      'estimated_age_months', 'color_markings', 'weight_kg', 'reproductive_status',
      'microchip_number', 'tattoo_number', 'ear_tag_number', 'passport_number', 'photo_url',
      'allergies', 'medical_history_summary', 'is_alive', 'death_date', 'death_cause',
      'farm_id', 'herd_id', 'notes'];

    const updates = [];
    const values = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }

    if (updates.length > 0) {
      values.push(animalId, tenantId);
      await conn.query(`UPDATE rv_animal SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
    }

    if (req.body.identifiers) {
      await conn.query('DELETE FROM rv_animal_identifier WHERE animal_id = ?', [animalId]);
      for (const id of req.body.identifiers) {
        await conn.query(
          'INSERT INTO rv_animal_identifier (animal_id, identifier_type, identifier_value, applied_date, notes) VALUES (?, ?, ?, ?, ?)',
          [animalId, id.identifier_type, id.identifier_value, id.applied_date || null, id.notes || null]
        );
      }
    }

    await conn.commit();
    await logAudit(tenantId, req.user.id, 'animal', animalId, 'update', existing[0], req.body, req.ip);

    res.json({ success: true, message: 'Animal updated' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

module.exports = router;
