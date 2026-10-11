const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createFarm, updateFarm } = require('../../../validators/farm');

router.get('/', asyncHandler(async (req, res) => {
  const { search, page = 1, limit: rawLimit = 25, near_lat, near_lng, radius_km } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE f.tenant_id = ?';
  const params = [req.tenant.id];

  const useGeo = near_lat && near_lng && radius_km;
  const lat = parseFloat(near_lat);
  const lng = parseFloat(near_lng);
  const radius = parseFloat(radius_km);

  if (useGeo) {
    where += ' AND f.gps_lat IS NOT NULL AND f.gps_lng IS NOT NULL';
  }

  if (search) { where += ' AND (f.name LIKE ? OR f.farm_code LIKE ? OR p.display_name LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }

  if (useGeo) {
    const distanceExpr = `(6371 * acos(LEAST(1.0, cos(radians(?)) * cos(radians(f.gps_lat)) * cos(radians(f.gps_lng) - radians(?)) + sin(radians(?)) * sin(radians(f.gps_lat)))))`;
    const geoParams = [lat, lng, lat];

    const countSql = `SELECT COUNT(*) as total FROM (
      SELECT f.id, ${distanceExpr} AS distance
      FROM rv_farm f LEFT JOIN rv_party p ON f.owner_party_id = p.id ${where}
      HAVING distance < ?
    ) geo_sub`;
    const [[{ total }]] = await db.query(countSql, [...geoParams, ...params, radius]);

    const dataSql = `SELECT f.*, p.display_name as owner_name,
            (SELECT COUNT(*) FROM rv_herd_lot h WHERE h.farm_id = f.id) as herd_count,
            ${distanceExpr} AS distance
     FROM rv_farm f LEFT JOIN rv_party p ON f.owner_party_id = p.id
     ${where}
     HAVING distance < ?
     ORDER BY distance LIMIT ? OFFSET ?`;
    const [rows] = await db.query(dataSql, [...geoParams, ...params, radius, limit, parseInt(offset)]);

    rows.forEach(r => { if (r.distance != null) r.distance = Math.round(r.distance * 100) / 100; });

    res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
  } else {
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_farm f LEFT JOIN rv_party p ON f.owner_party_id = p.id ${where}`, params);
    const [rows] = await db.query(
      `SELECT f.*, p.display_name as owner_name,
              (SELECT COUNT(*) FROM rv_herd_lot h WHERE h.farm_id = f.id) as herd_count
       FROM rv_farm f LEFT JOIN rv_party p ON f.owner_party_id = p.id
       ${where} ORDER BY f.updated_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, parseInt(offset)]
    );
    res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
  }
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT f.*, p.display_name as owner_name, p.phone_primary as owner_phone
     FROM rv_farm f LEFT JOIN rv_party p ON f.owner_party_id = p.id
     WHERE f.id = ? AND f.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [herds] = await db.query(
    `SELECT h.*, s.name_fr as species_name FROM rv_herd_lot h LEFT JOIN rv_species s ON h.species_id = s.id WHERE h.farm_id = ?`, [req.params.id]);
  res.json({ success: true, data: { ...rows[0], herds } });
}));

router.post('/', createFarm, validate, asyncHandler(async (req, res) => {
  const b = req.body;
  const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM rv_farm WHERE tenant_id = ?', [req.tenant.id]);
  const farm_code = `FRM-${String(cnt + 1).padStart(5, '0')}`;
  const [result] = await db.query(
    `INSERT INTO rv_farm (tenant_id, owner_party_id, name, farm_code, farm_type, total_area_ha, gps_lat, gps_lng, address_line, city, region, country_code, registration_number, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.tenant.id, b.owner_party_id, b.name, farm_code, b.farm_type || 'mixed', b.total_area_ha || null,
      b.gps_lat || null, b.gps_lng || null, b.address_line || null, b.city || null, b.region || null,
      b.country_code || 'CM', b.registration_number || null, b.notes || null, req.user.id]
  );
  await logAudit(req.tenant.id, req.user.id, 'farm', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId, farm_code } });
}));

router.put('/:id', updateFarm, validate, asyncHandler(async (req, res) => {
  const fields = ['owner_party_id', 'name', 'farm_type', 'total_area_ha', 'gps_lat', 'gps_lng', 'address_line', 'city', 'region', 'country_code', 'registration_number', 'notes', 'is_active'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (!updates.length) return res.json({ success: true });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_farm SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: 'Updated' });
}));

module.exports = router;
