/**
 * Seed script: Cabinet Vétérinaire "VetCare Douala" - Données de démonstration
 * Usage: node seeds/demo-clinic.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'recallvet',
    password: process.env.DB_PASSWORD || 'devpassword',
    database: process.env.DB_NAME || 'recallvet'
  });

  const tenantId = 1; // Clinique Demo tenant
  const userId = 2;   // demo@recallvet.com
  const siteId = 1;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const today = new Date().toISOString().split('T')[0];

  console.log('🏥 Seeding cabinet VetCare Douala...\n');

  // ── Update tenant info ──
  await conn.query(`UPDATE rv_tenant SET name = 'VetCare Douala', country_code = 'CM', default_currency = 'XAF', timezone = 'Africa/Douala' WHERE id = ?`, [tenantId]);
  console.log('✅ Tenant mis à jour: VetCare Douala');

  // ── Clients (Parties) ──
  const clients = [
    ['individual', 'Mbarga Jean-Pierre', 'Jean-Pierre', 'Mbarga', '+237 691 234 567', 'jpmbarga@gmail.com', 'Douala', 'Littoral', 'CM'],
    ['individual', 'Nkoulou Marie-Claire', 'Marie-Claire', 'Nkoulou', '+237 677 890 123', 'mnkoulou@yahoo.fr', 'Douala', 'Littoral', 'CM'],
    ['individual', 'Fotso Emmanuel', 'Emmanuel', 'Fotso', '+237 699 456 789', 'efotso@gmail.com', 'Douala', 'Littoral', 'CM'],
    ['individual', 'Tchamba Adeline', 'Adeline', 'Tchamba', '+237 670 111 222', 'atchamba@hotmail.com', 'Yaoundé', 'Centre', 'CM'],
    ['individual', 'Eyinga Paul', 'Paul', 'Eyinga', '+237 655 333 444', 'peyinga@gmail.com', 'Douala', 'Littoral', 'CM'],
    ['individual', 'Ngono Solange', 'Solange', 'Ngono', '+237 694 555 666', 'sngono@gmail.com', 'Buea', 'Sud-Ouest', 'CM'],
    ['individual', 'Kamga Yves', 'Yves', 'Kamga', '+237 678 777 888', null, 'Bafoussam', 'Ouest', 'CM'],
    ['organization', 'Ferme Agropastorale du Moungo', null, null, '+237 699 000 111', 'contact@fermemoungo.cm', 'Nkongsamba', 'Littoral', 'CM'],
    ['individual', 'Atangana Rose', 'Rose', 'Atangana', '+237 656 222 333', 'ratangana@gmail.com', 'Douala', 'Littoral', 'CM'],
    ['individual', 'Njoya Ibrahim', 'Ibrahim', 'Njoya', '+237 671 444 555', 'injoya@gmail.com', 'Foumban', 'Ouest', 'CM'],
    ['organization', 'Élevage Moderne Bamenda', null, null, '+237 677 666 777', 'info@elevage-bamenda.cm', 'Bamenda', 'Nord-Ouest', 'CM'],
    ['individual', 'Messi Carine', 'Carine', 'Messi', '+237 698 888 999', 'cmessi@gmail.com', 'Douala', 'Littoral', 'CM'],
  ];

  const partyIds = [];
  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    const code = `CLI-CM-${String(i + 1).padStart(5, '0')}`;
    const [r] = await conn.query(
      `INSERT INTO rv_party (tenant_id, client_code, party_type, display_name, first_name, last_name, phone_primary, email, city, region, country_code, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [tenantId, code, c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], userId]
    );
    partyIds.push(r.insertId);
  }
  console.log(`✅ ${partyIds.length} clients créés`);

  // ── Animaux ──
  // Get species IDs
  const [speciesRows] = await conn.query('SELECT id, code FROM rv_species');
  const sp = {};
  speciesRows.forEach(s => { sp[s.code] = s.id; });

  const [breedRows] = await conn.query('SELECT id, code, species_id FROM rv_breed');
  const br = {};
  breedRows.forEach(b => { br[`${b.species_id}-${b.code}`] = b.id; });

  const animals = [
    // [owner_idx, name, species_code, breed_code, sex, dob, weight, microchip]
    [0, 'Rex', 'CAN', 'BGER', 'M', '2020-03-15', 32, '250269800123456'],
    [0, 'Bella', 'CAN', 'LABR', 'F', '2021-06-20', 28, '250269800123457'],
    [1, 'Minou', 'FEL', 'PERS', 'M', '2022-01-10', 4.5, null],
    [1, 'Princesse', 'FEL', 'SIAM', 'F', '2021-11-05', 3.8, null],
    [2, 'Sultan', 'CAN', 'ROTT', 'M', '2019-08-12', 45, '250269800789012'],
    [3, 'Moka', 'CAN', 'LOCL', 'F', '2022-04-30', 15, null],
    [4, 'Whisky', 'CAN', 'PITT', 'M', '2020-12-01', 30, '250269800345678'],
    [5, 'Nala', 'FEL', 'LOCL', 'F', '2023-02-14', 3.2, null],
    [8, 'Simba', 'CAN', 'BGER', 'M', '2021-09-25', 35, '250269800567890'],
    [9, 'Bijou', 'FEL', 'PERS', 'F', '2022-07-18', 4, null],
    [11, 'Rocky', 'CAN', 'ROTT', 'M', '2020-05-05', 42, '250269800901234'],
    [11, 'Luna', 'CAN', 'LABR', 'F', '2022-11-11', 25, null],
    [4, 'Caramel', 'FEL', 'LOCL', 'M', '2023-06-01', 3.5, null],
    [2, 'Max', 'CAN', 'LOCL', 'M', '2021-01-20', 18, null],
    [3, 'Coco', 'FEL', 'LOCL', 'F', '2023-03-15', 2.8, null],
  ];

  const animalIds = [];
  for (let i = 0; i < animals.length; i++) {
    const a = animals[i];
    const code = `ANI-${String(i + 1).padStart(6, '0')}`;
    const speciesId = sp[a[2]];
    const breedId = br[`${speciesId}-${a[3]}`] || null;
    const [r] = await conn.query(
      `INSERT INTO rv_animal (tenant_id, animal_code, owner_party_id, name, species_id, breed_id, sex, date_of_birth, weight_kg, microchip_number, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [tenantId, code, partyIds[a[0]], a[1], speciesId, breedId, a[4], a[5], a[6], a[7], userId]
    );
    animalIds.push(r.insertId);
  }
  console.log(`✅ ${animalIds.length} animaux créés`);

  // ── Rendez-vous ──
  const futureDate = (days) => {
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const pastDate = (days) => {
    const d = new Date(); d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const appointments = [
    [animalIds[0], partyIds[0], 'consultation', futureDate(1), '09:00', '09:30', 'normal', 'scheduled', 'Contrôle annuel'],
    [animalIds[2], partyIds[1], 'vaccination', futureDate(1), '10:00', '10:15', 'normal', 'scheduled', 'Rappel vaccin rage'],
    [animalIds[4], partyIds[2], 'consultation', futureDate(2), '11:00', '11:30', 'urgent', 'scheduled', 'Boiterie patte arrière'],
    [animalIds[6], partyIds[4], 'surgery', futureDate(3), '14:00', '15:00', 'normal', 'confirmed', 'Castration programmée'],
    [animalIds[1], partyIds[0], 'vaccination', futureDate(4), '09:30', '09:45', 'normal', 'scheduled', 'Vaccin DHPP'],
    [animalIds[8], partyIds[8], 'consultation', pastDate(1), '10:00', '10:30', 'normal', 'completed', 'Consultation dermatologique'],
    [animalIds[10], partyIds[11], 'consultation', pastDate(2), '14:00', '14:30', 'urgent', 'completed', 'Vomissements répétés'],
    [animalIds[5], partyIds[3], 'follow_up', futureDate(5), '16:00', '16:30', 'normal', 'scheduled', 'Suivi post-opératoire'],
  ];

  const apptIds = [];
  for (const a of appointments) {
    const [r] = await conn.query(
      `INSERT INTO rv_appointment (tenant_id, site_id, animal_id, party_id, vet_user_id, appointment_type, scheduled_date, start_time, end_time, urgency_level, status, reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, siteId, a[0], a[1], userId, a[2], a[3], a[4], a[5], a[6], a[7], a[8], userId]
    );
    apptIds.push(r.insertId);
  }
  console.log(`✅ ${apptIds.length} rendez-vous créés`);

  // ── Consultations (encounters) ──
  const encounters = [
    [animalIds[8], partyIds[8], pastDate(1), 'consultation', 'Prurit généralisé depuis 2 semaines', 38.5, 80, 22, 35, 'Lésions cutanées diffuses, alopécie zones de grattage', 'Dermatite allergique probable', 'DERM-001', 'open', 'completed'],
    [animalIds[10], partyIds[11], pastDate(2), 'consultation', 'Vomissements depuis 24h, abattement', 39.2, 120, 28, 40, 'Déshydratation modérée, abdomen sensible à la palpation', 'Gastro-entérite aiguë', 'DIG-001', 'open', 'signed'],
    [animalIds[0], partyIds[0], pastDate(5), 'consultation', 'Contrôle annuel de routine', 38.2, 75, 18, 32, 'Bon état général, dents propres, oreilles nettes', 'Animal en bonne santé', null, 'resolved', 'signed'],
    [animalIds[3], partyIds[1], pastDate(10), 'vaccination', 'Rappel vaccinal annuel', 38.8, 160, 30, 3.8, 'RAS', null, null, 'resolved', 'signed'],
    [animalIds[6], partyIds[4], pastDate(15), 'consultation', 'Boiterie membre postérieur gauche', 38.6, 90, 20, 30, 'Gonflement articulaire genou gauche, douleur à la flexion', 'Arthrose débutante', 'MUSC-001', 'open', 'completed'],
  ];

  const encIds = [];
  for (const e of encounters) {
    const [r] = await conn.query(
      `INSERT INTO rv_encounter (tenant_id, site_id, animal_id, party_id, vet_user_id, encounter_date, encounter_type, visit_reason, temperature_c, heart_rate_bpm, resp_rate_bpm, weight_kg, clinical_findings, diagnostic_hypotheses, primary_diagnosis_code, case_status, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, siteId, e[0], e[1], userId, e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9], e[10], e[11], e[12], e[13], userId]
    );
    encIds.push(r.insertId);
  }
  console.log(`✅ ${encIds.length} consultations créées`);

  // ── Vaccinations ──
  const vaccinations = [
    [animalIds[0], pastDate(30), 'Vaccin antirabique Rabisin', 'Boehringer', 'LOT-2024-A1', '2026-12-31', 'IM', 1, futureDate(335)],
    [animalIds[0], pastDate(30), 'DHPP Eurican', 'Boehringer', 'LOT-2024-B2', '2026-06-30', 'SC', 2, futureDate(335)],
    [animalIds[1], pastDate(60), 'Vaccin antirabique Rabisin', 'Boehringer', 'LOT-2024-A3', '2026-12-31', 'IM', 1, futureDate(305)],
    [animalIds[2], pastDate(90), 'Vaccin Typhus félin Purevax', 'Boehringer', 'LOT-2024-C1', '2026-09-30', 'SC', 1, futureDate(275)],
    [animalIds[3], pastDate(10), 'Coryza félin Feligen', 'Virbac', 'LOT-2024-D2', '2027-03-31', 'SC', 2, futureDate(355)],
    [animalIds[4], pastDate(180), 'Vaccin antirabique Nobivac', 'MSD', 'LOT-2024-E1', '2027-01-31', 'IM', 1, futureDate(185)],
    [animalIds[8], pastDate(45), 'DHPP Eurican', 'Boehringer', 'LOT-2024-F3', '2026-08-30', 'SC', 3, futureDate(320)],
    [animalIds[10], pastDate(120), 'Vaccin antirabique Rabisin', 'Boehringer', 'LOT-2024-G1', '2026-11-30', 'IM', 1, futureDate(245)],
  ];

  for (const v of vaccinations) {
    await conn.query(
      `INSERT INTO rv_vaccination_event (tenant_id, animal_id, product_name, manufacturer, lot_number, expiry_date, vaccination_date, route, dose_number, next_due_date, administered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, v[0], v[2], v[3], v[4], v[5], v[1], v[6], v[7], v[8], userId]
    );
  }
  console.log(`✅ ${vaccinations.length} vaccinations créées`);

  // ── Prescriptions ──
  const rx1 = await conn.query(
    `INSERT INTO rv_prescription (tenant_id, encounter_id, animal_id, party_id, prescriber_user_id, prescription_number, prescription_date, status, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
    [tenantId, encIds[0], animalIds[8], partyIds[8], userId, 'RX-00001', pastDate(1), futureDate(29)]
  );
  const rxId1 = rx1[0].insertId;
  await conn.query(`INSERT INTO rv_prescription_line (prescription_id, product_name, dosage, dosage_unit, frequency, duration_days, quantity, route, instructions) VALUES
    (?, 'Prednisolone 5mg', '0.5', 'mg/kg', '2x/jour', 10, 20, 'oral', 'Donner avec la nourriture, matin et soir'),
    (?, 'Cetirizine 10mg', '10', 'mg', '1x/jour', 14, 14, 'oral', 'Un comprimé le soir'),
    (?, 'Shampoing Douxo Calm', null, null, '2x/semaine', 21, 1, 'topical', 'Laisser poser 10 min puis rincer')`,
    [rxId1, rxId1, rxId1]
  );

  const rx2 = await conn.query(
    `INSERT INTO rv_prescription (tenant_id, encounter_id, animal_id, party_id, prescriber_user_id, prescription_number, prescription_date, status, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
    [tenantId, encIds[1], animalIds[10], partyIds[11], userId, 'RX-00002', pastDate(2), futureDate(12)]
  );
  const rxId2 = rx2[0].insertId;
  await conn.query(`INSERT INTO rv_prescription_line (prescription_id, product_name, dosage, dosage_unit, frequency, duration_days, quantity, route, instructions) VALUES
    (?, 'Metoclopramide 10mg', '0.3', 'mg/kg', '3x/jour', 5, 15, 'oral', 'Donner 30 min avant les repas'),
    (?, 'Smecta', '1', 'sachet', '2x/jour', 5, 10, 'oral', 'Diluer dans un peu d eau'),
    (?, 'Solution de réhydratation orale', null, null, 'à volonté', 3, 5, 'oral', 'Proposer régulièrement')`,
    [rxId2, rxId2, rxId2]
  );
  console.log('✅ 2 ordonnances créées (6 lignes)');

  // ── Factures ──
  const inv1 = await conn.query(
    `INSERT INTO rv_invoice (tenant_id, site_id, party_id, animal_id, encounter_id, invoice_number, invoice_date, subtotal, tax_amount, total_amount, currency, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'XAF', 'paid', ?)`,
    [tenantId, siteId, partyIds[8], animalIds[8], encIds[0], 'INV-00001', pastDate(1), 25000, 0, 25000, userId]
  );
  await conn.query(`INSERT INTO rv_invoice_line (invoice_id, description, quantity, unit_price, line_total) VALUES
    (?, 'Consultation dermatologique', 1, 15000, 15000),
    (?, 'Raclage cutané + examen microscopique', 1, 5000, 5000),
    (?, 'Prescription médicamenteuse', 1, 5000, 5000)`,
    [inv1[0].insertId, inv1[0].insertId, inv1[0].insertId]
  );
  await conn.query(`INSERT INTO rv_payment (tenant_id, invoice_id, amount, payment_method, payment_date, received_by) VALUES (?, ?, 25000, 'mobile_money', ?, ?)`,
    [tenantId, inv1[0].insertId, pastDate(1), userId]
  );

  const inv2 = await conn.query(
    `INSERT INTO rv_invoice (tenant_id, site_id, party_id, animal_id, encounter_id, invoice_number, invoice_date, subtotal, tax_amount, total_amount, currency, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'XAF', 'sent', ?)`,
    [tenantId, siteId, partyIds[11], animalIds[10], encIds[1], 'INV-00002', pastDate(2), 35000, 0, 35000, userId]
  );
  await conn.query(`INSERT INTO rv_invoice_line (invoice_id, description, quantity, unit_price, line_total) VALUES
    (?, 'Consultation urgence', 1, 20000, 20000),
    (?, 'Perfusion intraveineuse', 1, 10000, 10000),
    (?, 'Médicaments anti-émétiques', 1, 5000, 5000)`,
    [inv2[0].insertId, inv2[0].insertId, inv2[0].insertId]
  );
  console.log('✅ 2 factures créées (1 payée, 1 en attente)');

  // ── Produits pharmacie ──
  const products = [
    ['Amoxicilline 500mg', 'AMX-500', 'Antibiotique à large spectre', 'tablet', 3500, 19.25],
    ['Prednisolone 5mg', 'PRED-5', 'Corticostéroïde anti-inflammatoire', 'tablet', 2500, 19.25],
    ['Ivermectine 1%', 'IVM-1', 'Antiparasitaire injectable', 'bottle', 8500, 19.25],
    ['Vaccin Rabisin', 'VAC-RAB', 'Vaccin antirabique inactivé', 'dose', 12000, 0],
    ['Eurican DHPP', 'VAC-DHPP', 'Vaccin polyvalent chien', 'dose', 15000, 0],
    ['Frontline Spray', 'FRONT-SP', 'Anti-puces et tiques', 'bottle', 9500, 19.25],
    ['Metacam 1.5mg/ml', 'META-15', 'Anti-inflammatoire non stéroïdien', 'bottle', 7800, 19.25],
    ['Cetirizine 10mg', 'CETI-10', 'Antihistaminique', 'tablet', 1200, 19.25],
    ['Douxo Calm Shampoing', 'DOUX-CAL', 'Shampoing dermatologique', 'bottle', 12500, 19.25],
    ['Smecta vétérinaire', 'SMEC-VET', 'Pansement digestif', 'sachet', 500, 0],
    ['NaCl 0.9% perfusion', 'NACL-09', 'Solution de perfusion isotonique', 'bottle', 2000, 0],
    ['Metoclopramide 10mg', 'METO-10', 'Anti-émétique', 'tablet', 1500, 19.25],
  ];

  const prodIds = [];
  for (const p of products) {
    const [r] = await conn.query(
      `INSERT INTO rv_product (tenant_id, name, sku, description, unit, unit_price, vat_rate, is_active, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 10)`,
      [tenantId, p[0], p[1], p[2], p[3], p[4], p[5]]
    );
    prodIds.push(r.insertId);
  }
  console.log(`✅ ${prodIds.length} produits pharmacie créés`);

  // ── Fournisseurs ──
  const [sup1] = await conn.query(
    `INSERT INTO rv_supplier (tenant_id, name, contact_person, email, phone, city, country_code, payment_terms_days) VALUES (?, 'Pharma-Vet Cameroun', 'M. Tchikoua', 'commandes@pharmavet.cm', '+237 233 456 789', 'Douala', 'CM', 30)`,
    [tenantId]
  );
  const [sup2] = await conn.query(
    `INSERT INTO rv_supplier (tenant_id, name, contact_person, email, phone, city, country_code, payment_terms_days) VALUES (?, 'AfriVet Distribution', 'Mme Diallo', 'info@afrivet-dist.com', '+237 222 987 654', 'Douala', 'CM', 45)`,
    [tenantId]
  );
  console.log('✅ 2 fournisseurs créés');

  // ── Stock (lots) ──
  const locationId = 1; // Stock principal
  const stockLots = [
    [prodIds[0], 'LOT-AMX-2024', 'B001', '2026-06-30', 200, 3500],
    [prodIds[1], 'LOT-PRED-2024', 'B002', '2026-09-30', 150, 2500],
    [prodIds[2], 'LOT-IVM-2024', 'B003', '2027-03-31', 30, 8500],
    [prodIds[3], 'LOT-RAB-2024', 'B004', '2026-12-31', 50, 12000],
    [prodIds[4], 'LOT-DHPP-2024', 'B005', '2026-10-31', 40, 15000],
    [prodIds[5], 'LOT-FRONT-2024', 'B006', '2027-06-30', 25, 9500],
    [prodIds[6], 'LOT-META-2024', 'B007', '2026-08-30', 20, 7800],
    [prodIds[7], 'LOT-CETI-2024', 'B008', '2027-01-31', 100, 1200],
    [prodIds[8], 'LOT-DOUX-2024', 'B009', '2027-12-31', 15, 12500],
    [prodIds[9], 'LOT-SMEC-2024', 'B010', '2027-06-30', 80, 500],
    [prodIds[10], 'LOT-NACL-2024', 'B011', '2026-11-30', 50, 2000],
    [prodIds[11], 'LOT-METO-2024', 'B012', '2027-02-28', 60, 1500],
  ];

  for (const sl of stockLots) {
    await conn.query(
      `INSERT INTO rv_stock_lot (tenant_id, product_id, location_id, lot_number, batch_number, expiry_date, quantity_on_hand, unit_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, sl[0], locationId, sl[1], sl[2], sl[3], sl[4], sl[5]]
    );
  }
  console.log(`✅ ${stockLots.length} lots de stock créés`);

  // ── Ferme ──
  const [farm1Result] = await conn.query(
    `INSERT INTO rv_farm (tenant_id, owner_party_id, name, farm_code, farm_type, total_area_ha, city, region, country_code, created_by) VALUES (?, ?, 'Ferme Pastorale du Moungo', 'FRM-00001', 'mixed', 25, 'Nkongsamba', 'Littoral', 'CM', ?)`,
    [tenantId, partyIds[7], userId]
  );
  const farmId1 = farm1Result.insertId;
  const [farm2Result] = await conn.query(
    `INSERT INTO rv_farm (tenant_id, owner_party_id, name, farm_code, farm_type, total_area_ha, city, region, country_code, created_by) VALUES (?, ?, 'Ranch Bamenda Hills', 'FRM-00002', 'mixed', 50, 'Bamenda', 'Nord-Ouest', 'CM', ?)`,
    [tenantId, partyIds[10], userId]
  );
  const farmId2 = farm2Result.insertId;
  console.log('✅ 2 fermes créées');

  // ── Troupeaux ──
  await conn.query(
    `INSERT INTO rv_herd_lot (tenant_id, farm_id, name, species_id, breed_id, purpose, head_count) VALUES
      (?, ?, 'Troupeau bovin laitier', ?, ?, 'dairy', 35),
      (?, ?, 'Lot caprins', ?, NULL, 'fattening', 80),
      (?, ?, 'Poulailler pondeuses', ?, NULL, 'layer', 500)`,
    [tenantId, farmId1, sp['BOV'], br[`${sp['BOV']}-HOLS`], tenantId, farmId1, sp['CAP'], tenantId, farmId1, sp['GAL']]
  );
  await conn.query(
    `INSERT INTO rv_herd_lot (tenant_id, farm_id, name, species_id, breed_id, purpose, head_count) VALUES
      (?, ?, 'Bovins Ndama', ?, ?, 'fattening', 60),
      (?, ?, 'Ovins Djallonké', ?, ?, 'fattening', 120)`,
    [tenantId, farmId2, sp['BOV'], br[`${sp['BOV']}-NDMA`], tenantId, farmId2, sp['OVI'], br[`${sp['OVI']}-DJAL`]]
  );
  console.log('✅ 5 troupeaux créés');

  // ── Visites ferme ──
  await conn.query(
    `INSERT INTO rv_farm_visit (tenant_id, farm_id, vet_user_id, visit_date, visit_type, general_findings, recommendations, status, created_by) VALUES
      (?, ?, ?, ?, 'routine', 'Troupeau en bon état général. 2 vaches en gestation avancée. Vaccination à jour.', 'Prévoir prophylaxie antiparasitaire dans 2 semaines.', 'completed', ?),
      (?, ?, ?, ?, 'vaccination_campaign', 'Campagne de vaccination charbon réalisée sur 35 bovins et 80 caprins.', 'Rappel dans 6 mois. Surveiller réactions post-vaccinales.', 'completed', ?)`,
    [tenantId, farmId1, userId, pastDate(15), userId, tenantId, farmId1, userId, pastDate(7), userId]
  );
  console.log('✅ 2 visites de ferme créées');

  // ── Événements sanitaires ──
  await conn.query(
    `INSERT INTO rv_health_event (tenant_id, farm_id, event_date, event_type, disease_suspected, animals_affected, animals_dead, symptoms, actions_taken, status, created_by) VALUES
      (?, ?, ?, 'disease_outbreak', 'Coccidiose', 5, 0, 'Diarrhée chez jeunes caprins, perte de poids', 'Traitement au sulfadiméthoxine, isolation des malades', 'resolved', ?)`,
    [tenantId, farmId1, pastDate(20), userId]
  );
  console.log('✅ 1 événement sanitaire créé');

  // ── Notifications ──
  await conn.query(
    `INSERT INTO rv_notification (tenant_id, user_id, type, title, body) VALUES
      (?, ?, 'info', 'Bienvenue sur RecallVET !', 'Votre cabinet VetCare Douala est prêt. Explorez toutes les fonctionnalités.'),
      (?, ?, 'warning', 'Rappels de vaccination', '3 animaux ont des vaccinations arrivant à échéance ce mois-ci.'),
      (?, ?, 'info', 'Stock: produits à surveiller', '2 produits ont un stock inférieur au seuil de réapprovisionnement.')`,
    [tenantId, userId, tenantId, userId, tenantId, userId]
  );
  console.log('✅ 3 notifications créées');

  console.log('\n🎉 Seed terminé ! Cabinet VetCare Douala prêt avec:');
  console.log(`   • 12 clients`);
  console.log(`   • 15 animaux (chiens, chats)`);
  console.log(`   • 8 rendez-vous`);
  console.log(`   • 5 consultations`);
  console.log(`   • 8 vaccinations`);
  console.log(`   • 2 ordonnances (6 lignes)`);
  console.log(`   • 2 factures (1 payée, 1 en attente)`);
  console.log(`   • 12 produits pharmacie`);
  console.log(`   • 2 fournisseurs`);
  console.log(`   • 12 lots de stock`);
  console.log(`   • 2 fermes, 5 troupeaux`);
  console.log(`   • 2 visites, 1 événement sanitaire`);
  console.log(`   • 3 notifications`);

  await conn.end();
}

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
