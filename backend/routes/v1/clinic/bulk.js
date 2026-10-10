const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Parse CSV text into an array of objects using the header row as keys.
 */
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    obj._row = i + 1;
    rows.push(obj);
  }

  return rows;
}

/**
 * @swagger
 * /v1/clinic/bulk/animals:
 *   post:
 *     summary: Bulk import animals from CSV
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import summary
 */
router.post('/animals', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'CSV file is required.' });
  }

  const tenantId = req.tenant.id;
  const text = req.file.buffer.toString('utf-8');
  const rows = parseCSV(text);

  if (rows.length === 0) {
    return res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows.' });
  }

  // Preload species lookup
  const [speciesList] = await db.query('SELECT id, code FROM rv_species');
  const speciesMap = {};
  speciesList.forEach(s => { speciesMap[s.code.toLowerCase()] = s.id; });

  // Preload breed lookup
  const [breedList] = await db.query('SELECT id, name_fr, name_en, species_id FROM rv_breed');
  const breedMap = {};
  breedList.forEach(b => {
    breedMap[(b.name_fr || '').toLowerCase()] = b.id;
    breedMap[(b.name_en || '').toLowerCase()] = b.id;
  });

  // Preload owner lookup by party code within tenant
  const [partyList] = await db.query('SELECT id, client_code FROM rv_party WHERE tenant_id = ?', [tenantId]);
  const partyMap = {};
  partyList.forEach(p => { partyMap[(p.client_code || '').toLowerCase()] = p.id; });

  // Get current animal count for code generation
  const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM rv_animal WHERE tenant_id = ?', [tenantId]);
  let codeCounter = cnt;

  const conn = await db.getConnection();
  let imported = 0;
  let skipped = 0;
  const errors = [];

  try {
    await conn.beginTransaction();

    for (const row of rows) {
      try {
        // Validate required fields
        if (!row.name && !row.species_code) {
          errors.push({ row: row._row, message: 'name or species_code is required' });
          skipped++;
          continue;
        }

        const speciesId = row.species_code ? speciesMap[row.species_code.toLowerCase()] : null;
        if (row.species_code && !speciesId) {
          errors.push({ row: row._row, message: `Unknown species_code: ${row.species_code}` });
          skipped++;
          continue;
        }

        const breedId = row.breed_name ? (breedMap[row.breed_name.toLowerCase()] || null) : null;
        const ownerId = row.owner_code ? (partyMap[row.owner_code.toLowerCase()] || null) : null;

        if (row.owner_code && !ownerId) {
          errors.push({ row: row._row, message: `Unknown owner_code: ${row.owner_code}` });
          skipped++;
          continue;
        }

        codeCounter++;
        const animalCode = `ANI-${String(codeCounter).padStart(6, '0')}`;

        const sex = ['male', 'female', 'unknown'].includes((row.sex || '').toLowerCase())
          ? row.sex.toLowerCase() : 'unknown';

        const dob = row.date_of_birth || null;
        const microchip = row.microchip_number || null;

        await conn.query(
          `INSERT INTO rv_animal (tenant_id, animal_code, owner_party_id, name, species_id, breed_id, sex,
            date_of_birth, microchip_number, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [tenantId, animalCode, ownerId, row.name || null, speciesId, breedId, sex, dob, microchip, req.user.id]
        );

        imported++;
      } catch (err) {
        errors.push({ row: row._row, message: err.message });
        skipped++;
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  res.json({
    success: true,
    data: { imported, skipped, errors }
  });
}));

/**
 * @swagger
 * /v1/clinic/bulk/parties:
 *   post:
 *     summary: Bulk import parties from CSV
 *     tags: [Parties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import summary
 */
router.post('/parties', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'CSV file is required.' });
  }

  const tenantId = req.tenant.id;
  const text = req.file.buffer.toString('utf-8');
  const rows = parseCSV(text);

  if (rows.length === 0) {
    return res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows.' });
  }

  // Get current party count for code generation
  const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM rv_party WHERE tenant_id = ?', [tenantId]);
  let codeCounter = cnt;

  const conn = await db.getConnection();
  let imported = 0;
  let skipped = 0;
  const errors = [];

  try {
    await conn.beginTransaction();

    for (const row of rows) {
      try {
        if (!row.display_name) {
          errors.push({ row: row._row, message: 'display_name is required' });
          skipped++;
          continue;
        }

        const partyType = ['individual', 'organization', 'farm'].includes((row.party_type || '').toLowerCase())
          ? row.party_type.toLowerCase() : 'individual';

        codeCounter++;
        const partyCode = `PAR-${String(codeCounter).padStart(6, '0')}`;

        await conn.query(
          `INSERT INTO rv_party (tenant_id, party_code, display_name, party_type, phone_primary, email, city, country_code, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tenantId, partyCode, row.display_name, partyType,
            row.phone_primary || null, row.email || null,
            row.city || null, row.country_code || null,
            req.user.id
          ]
        );

        imported++;
      } catch (err) {
        errors.push({ row: row._row, message: err.message });
        skipped++;
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  res.json({
    success: true,
    data: { imported, skipped, errors }
  });
}));

module.exports = router;
