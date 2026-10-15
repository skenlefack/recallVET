/**
 * Seed 2 cabinets vétérinaires réalistes via l'API REST.
 * Teste tous les endpoints de création (parties, animaux, RDV, consultations, vaccinations, factures, fermes, pharmacie).
 *
 * Usage: node seeds/seed-two-clinics.js
 */
require('dotenv').config();

const API = process.env.API_URL || 'https://api.recallvet.com/api';
let TOKEN = null;
let TENANT_ID = null;

async function api(method, endpoint, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {}),
      ...(TENANT_ID ? { 'X-Tenant-Id': String(TENANT_ID) } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${endpoint}`, opts);
  const data = await res.json();
  if (!data.success && res.status !== 422) {
    console.error(`  ❌ ${method} ${endpoint}:`, data.message || res.status);
  }
  return data;
}

async function login(email, password) {
  const res = await api('POST', '/auth/login', { email, password });
  if (res.success && res.data) {
    TOKEN = res.data.token;
    TENANT_ID = res.data.tenants?.[0]?.id;
    console.log(`✅ Connecté: ${email} (tenant: ${TENANT_ID})`);
    return true;
  }
  console.error(`❌ Login échoué: ${email}`, res.message);
  return false;
}

async function register(data) {
  const res = await api('POST', '/auth/register', data);
  if (res.success && res.data) {
    TOKEN = res.data.token;
    TENANT_ID = res.data.tenants?.[0]?.id;
    console.log(`✅ Cabinet créé: ${data.practice_name} (tenant: ${TENANT_ID})`);
    return true;
  }
  console.error(`❌ Inscription échouée:`, res.message);
  return false;
}

// ══════════════════════════════════════════════
//  CABINET 1: Clinique Vétérinaire SantéAnimal
//  Localisation: Douala, Cameroun
//  Spécialité: Animaux de compagnie
// ══════════════════════════════════════════════
async function seedCabinet1() {
  console.log('\n🏥 ══════ CABINET 1: SantéAnimal Douala ══════\n');

  const registered = await register({
    email: 'dr.nguema@santeanimal.cm',
    password: 'Vet@Douala2024',
    first_name: 'Hervé',
    last_name: 'Nguema',
    phone: '+237 691 100 200',
    practice_name: 'Clinique Vétérinaire SantéAnimal',
    practice_type: 'clinic',
    country_code: 'CM',
    preferred_language: 'fr'
  });
  if (!registered) return;

  // ── CLIENTS ──
  console.log('\n📋 Création des clients...');
  const clients = [
    { display_name: 'Mbarga Jean-Pierre', party_type: 'individual', first_name: 'Jean-Pierre', last_name: 'Mbarga', phone_primary: '+237 691 234 567', email: 'jpmbarga@gmail.com', city: 'Douala', region: 'Littoral' },
    { display_name: 'Nkoulou Marie-Claire', party_type: 'individual', first_name: 'Marie-Claire', last_name: 'Nkoulou', phone_primary: '+237 677 890 123', email: 'mnkoulou@yahoo.fr', city: 'Douala', region: 'Littoral' },
    { display_name: 'Fotso Emmanuel', party_type: 'individual', first_name: 'Emmanuel', last_name: 'Fotso', phone_primary: '+237 699 456 789', city: 'Douala', region: 'Littoral' },
    { display_name: 'Tchamba Adeline', party_type: 'individual', first_name: 'Adeline', last_name: 'Tchamba', phone_primary: '+237 670 111 222', city: 'Yaoundé', region: 'Centre' },
    { display_name: 'Eyinga Paul', party_type: 'individual', first_name: 'Paul', last_name: 'Eyinga', phone_primary: '+237 655 333 444', email: 'peyinga@gmail.com', city: 'Douala', region: 'Littoral' },
    { display_name: 'Ngono Solange', party_type: 'individual', first_name: 'Solange', last_name: 'Ngono', phone_primary: '+237 694 555 666', city: 'Buea', region: 'Sud-Ouest' },
  ];
  const partyIds = [];
  for (const c of clients) {
    const r = await api('POST', '/v1/clinic/parties', c);
    partyIds.push(r.data?.id);
    console.log(`  ✅ Client: ${c.display_name} → ${r.data?.client_code || 'ERR'}`);
  }

  // ── ANIMAUX ──
  console.log('\n🐾 Création des animaux...');
  const animals = [
    { owner_party_id: partyIds[0], species_id: 1, name: 'Rex', sex: 'M', breed_id: 1, weight_kg: 28, date_of_birth: '2020-03-15', color_markings: 'Noir et feu', microchip_number: '250269812345678' },
    { owner_party_id: partyIds[0], species_id: 2, name: 'Minette', sex: 'F', weight_kg: 4.2, date_of_birth: '2022-07-10', color_markings: 'Tigrée grise' },
    { owner_party_id: partyIds[1], species_id: 1, name: 'Princesse', sex: 'neutered_F', weight_kg: 12, date_of_birth: '2019-11-20', color_markings: 'Blanche' },
    { owner_party_id: partyIds[2], species_id: 1, name: 'Tyson', sex: 'M', weight_kg: 35, date_of_birth: '2021-01-05', color_markings: 'Bringé' },
    { owner_party_id: partyIds[2], species_id: 2, name: 'Caramel', sex: 'M', weight_kg: 5.5, date_of_birth: '2023-02-14', color_markings: 'Roux' },
    { owner_party_id: partyIds[3], species_id: 1, name: 'Luna', sex: 'F', weight_kg: 8, date_of_birth: '2023-06-01', color_markings: 'Crème' },
    { owner_party_id: partyIds[4], species_id: 2, name: 'Moustache', sex: 'neutered_M', weight_kg: 6, date_of_birth: '2020-09-12', color_markings: 'Noir et blanc' },
    { owner_party_id: partyIds[5], species_id: 1, name: 'Simba', sex: 'M', weight_kg: 22, date_of_birth: '2022-04-18', color_markings: 'Fauve' },
  ];
  const animalIds = [];
  for (const a of animals) {
    const r = await api('POST', '/v1/clinic/animals', a);
    animalIds.push(r.data?.id);
    console.log(`  ✅ Animal: ${a.name} (${a.sex}) → ${r.data?.animal_code || 'ERR'}`);
  }

  // ── RENDEZ-VOUS ──
  console.log('\n📅 Création des rendez-vous...');
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Get user ID for vet assignment
  const profile = await api('GET', '/account/profile');
  const vetId = profile.data?.id || 1;

  const appointments = [
    { animal_id: animalIds[0], party_id: partyIds[0], vet_user_id: vetId, scheduled_date: today, start_time: '09:00', appointment_type: 'consultation', reason: 'Boiterie patte avant droite' },
    { animal_id: animalIds[1], party_id: partyIds[0], vet_user_id: vetId, scheduled_date: today, start_time: '10:00', appointment_type: 'vaccination', reason: 'Rappel vaccin annuel' },
    { animal_id: animalIds[2], party_id: partyIds[1], vet_user_id: vetId, scheduled_date: today, start_time: '11:00', appointment_type: 'follow_up', reason: 'Contrôle post-opératoire' },
    { animal_id: animalIds[3], party_id: partyIds[2], vet_user_id: vetId, scheduled_date: tomorrow, start_time: '09:30', appointment_type: 'consultation', reason: 'Diarrhée depuis 3 jours' },
    { animal_id: animalIds[5], party_id: partyIds[3], vet_user_id: vetId, scheduled_date: tomorrow, start_time: '14:00', appointment_type: 'vaccination', reason: 'Primo-vaccination chiot' },
  ];
  const apptIds = [];
  for (const a of appointments) {
    const r = await api('POST', '/v1/clinic/appointments', a);
    apptIds.push(r.data?.id);
    console.log(`  ✅ RDV: ${a.scheduled_date} ${a.start_time} — ${a.reason}`);
  }

  // ── CONSULTATIONS ──
  console.log('\n🩺 Création des consultations...');
  const encounters = [
    {
      animal_id: animalIds[0], party_id: partyIds[0], vet_user_id: vetId,
      encounter_date: `${yesterday}T09:00:00`, encounter_type: 'consultation',
      visit_reason: 'Boiterie membre antérieur droit depuis 2 jours',
      temperature_c: 38.8, heart_rate_bpm: 90, resp_rate_bpm: 22, weight_kg: 28,
      clinical_findings: 'Douleur à la palpation du coude droit. Léger gonflement articulaire. Pas de crépitation. Flexion/extension douloureuse.',
      diagnostic_hypotheses: 'Arthrite du coude, possible entorse',
      clinical_plan: 'Anti-inflammatoire (Meloxicam 0.1mg/kg/j pendant 5j), repos strict 10 jours, contrôle dans 7 jours',
      owner_instructions: 'Repos complet, pas de course ni escaliers. Donner le médicament avec la nourriture.',
      follow_up_date: tomorrow,
      status: 'completed', case_status: 'open'
    },
    {
      animal_id: animalIds[2], party_id: partyIds[1], vet_user_id: vetId,
      encounter_date: `${yesterday}T11:00:00`, encounter_type: 'follow_up',
      visit_reason: 'Contrôle post-stérilisation J+10',
      temperature_c: 38.5, heart_rate_bpm: 80, weight_kg: 12,
      clinical_findings: 'Cicatrice propre, pas de rougeur, pas d\'écoulement. Bon état général.',
      clinical_plan: 'Retrait des points. Fin du traitement antibiotique.',
      status: 'completed', case_status: 'closed'
    },
    {
      animal_id: animalIds[4], party_id: partyIds[2], vet_user_id: vetId,
      encounter_date: `${today}T10:30:00`, encounter_type: 'consultation',
      visit_reason: 'Vomissements et léthargie depuis hier soir',
      temperature_c: 39.8, heart_rate_bpm: 160, resp_rate_bpm: 30, weight_kg: 5.3,
      clinical_findings: 'Chat abattu, déshydratation modérée (pli de peau 3s), muqueuses pâles, abdomen tendu à la palpation.',
      diagnostic_hypotheses: 'Gastro-entérite aiguë, à écarter: obstruction, intoxication',
      lab_tests_requested: ['Hématologie complète', 'Biochimie (urée, créatinine, glycémie)'],
      clinical_plan: 'Fluidothérapie SC, antiémétique (Maropitant), diète 24h puis réalimentation progressive',
      status: 'in_progress', case_status: 'open'
    },
  ];
  const encounterIds = [];
  for (const e of encounters) {
    const r = await api('POST', '/v1/clinic/encounters', e);
    encounterIds.push(r.data?.id);
    console.log(`  ✅ Consultation: ${e.visit_reason.substring(0, 50)}...`);
  }

  // ── VACCINATIONS ──
  console.log('\n💉 Création des vaccinations...');
  const vaccinations = [
    { animal_id: animalIds[0], product_name: 'Nobivac DHPPi', vaccination_date: '2024-03-15', manufacturer: 'MSD', lot_number: 'A1234B', route: 'SC', injection_site: 'Épaule droite', next_due_date: '2025-03-15', notes: 'Rappel annuel' },
    { animal_id: animalIds[0], product_name: 'Rabisin', vaccination_date: '2024-03-15', manufacturer: 'Boehringer', lot_number: 'R5678C', route: 'SC', injection_site: 'Épaule gauche', next_due_date: '2025-03-15', certificate_needed: true },
    { animal_id: animalIds[1], product_name: 'Feligen CRP', vaccination_date: '2024-07-10', manufacturer: 'Virbac', lot_number: 'F9012D', route: 'SC', next_due_date: '2025-07-10' },
    { animal_id: animalIds[5], product_name: 'Nobivac Puppy DP', vaccination_date: today, manufacturer: 'MSD', lot_number: 'P3456E', route: 'SC', dose_number: 1, injection_site: 'Cuisse gauche', next_due_date: new Date(Date.now() + 21*86400000).toISOString().split('T')[0], notes: 'Primo-vaccination, rappel dans 3 semaines' },
  ];
  for (const v of vaccinations) {
    const r = await api('POST', '/v1/clinic/vaccinations', v);
    console.log(`  ✅ Vaccin: ${v.product_name} → ${v.animal_id ? 'Animal #' + v.animal_id : 'ERR'}`);
  }

  // ── FACTURES ──
  console.log('\n💰 Création des factures...');
  const invoices = [
    {
      party_id: partyIds[0], animal_id: animalIds[0], invoice_date: yesterday,
      lines: [
        { description: 'Consultation générale', quantity: 1, unit_price: 15000 },
        { description: 'Radiographie coude', quantity: 1, unit_price: 25000 },
        { description: 'Meloxicam 1.5mg/ml - 30ml', quantity: 1, unit_price: 8500 },
      ]
    },
    {
      party_id: partyIds[1], animal_id: animalIds[2], invoice_date: yesterday,
      lines: [
        { description: 'Contrôle post-opératoire', quantity: 1, unit_price: 10000 },
        { description: 'Retrait points de suture', quantity: 1, unit_price: 5000 },
      ]
    },
    {
      party_id: partyIds[2], animal_id: animalIds[4], invoice_date: today,
      lines: [
        { description: 'Consultation urgence', quantity: 1, unit_price: 20000 },
        { description: 'Fluidothérapie SC (500ml)', quantity: 1, unit_price: 12000 },
        { description: 'Injection Maropitant (Cerenia)', quantity: 1, unit_price: 8000 },
        { description: 'Analyses laboratoire', quantity: 1, unit_price: 30000 },
      ]
    },
  ];
  for (const inv of invoices) {
    const r = await api('POST', '/v1/clinic/invoices', inv);
    console.log(`  ✅ Facture: ${r.data?.invoice_number || 'ERR'} — ${inv.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0).toLocaleString()} XAF`);
  }

  // ── PRODUITS PHARMACIE ──
  console.log('\n💊 Création des produits pharmacie...');
  const products = [
    { name: 'Amoxicilline 500mg', sku: 'AMOX-500', description: 'Antibiotique large spectre', unit: 'comprimé', selling_price: 150, vat_rate: 0, reorder_level: 50 },
    { name: 'Meloxicam 1.5mg/ml', sku: 'MELOX-15', description: 'Anti-inflammatoire suspension buvable', unit: 'flacon 30ml', selling_price: 8500, reorder_level: 10 },
    { name: 'Nobivac DHPPi', sku: 'VAC-DHPPI', description: 'Vaccin chien polyvalent', unit: 'dose', selling_price: 12000, reorder_level: 20 },
    { name: 'Rabisin', sku: 'VAC-RAGE', description: 'Vaccin antirabique', unit: 'dose', selling_price: 8000, reorder_level: 20 },
    { name: 'Feligen CRP', sku: 'VAC-FELI', description: 'Vaccin chat typhus-coryza', unit: 'dose', selling_price: 10000, reorder_level: 15 },
    { name: 'Ivermectine 1%', sku: 'IVER-1', description: 'Antiparasitaire injectable', unit: 'flacon 50ml', selling_price: 5000, reorder_level: 10 },
    { name: 'Frontline Combo L', sku: 'FRONT-L', description: 'Antiparasitaire externe grand chien', unit: 'pipette', selling_price: 6500, reorder_level: 25 },
    { name: 'Cerenia 10mg', sku: 'CERE-10', description: 'Maropitant - antiémétique', unit: 'injection', selling_price: 8000, reorder_level: 10 },
  ];
  for (const p of products) {
    const r = await api('POST', '/v1/pharmacy/products', p);
    console.log(`  ✅ Produit: ${p.name} — ${p.selling_price} XAF`);
  }

  console.log('\n✅ Cabinet SantéAnimal Douala terminé!\n');
}

// ══════════════════════════════════════════════
//  CABINET 2: AgroVet Bafoussam
//  Localisation: Bafoussam, Cameroun
//  Spécialité: Élevage + animaux de compagnie
// ══════════════════════════════════════════════
async function seedCabinet2() {
  console.log('\n🏥 ══════ CABINET 2: AgroVet Bafoussam ══════\n');

  TOKEN = null;
  TENANT_ID = null;

  const registered = await register({
    email: 'dr.kamga@agrovet-baf.cm',
    password: 'Vet@Bafou2024',
    first_name: 'François',
    last_name: 'Kamga',
    phone: '+237 678 200 300',
    practice_name: 'AgroVet Bafoussam',
    practice_type: 'mixed',
    country_code: 'CM',
    preferred_language: 'fr'
  });
  if (!registered) return;

  const profile = await api('GET', '/account/profile');
  const vetId = profile.data?.id || 1;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ── CLIENTS ──
  console.log('\n📋 Création des clients...');
  const clients = [
    { display_name: 'Tagne Pierre', party_type: 'individual', first_name: 'Pierre', last_name: 'Tagne', phone_primary: '+237 677 100 200', city: 'Bafoussam', region: 'Ouest' },
    { display_name: 'Kouamo Béatrice', party_type: 'individual', first_name: 'Béatrice', last_name: 'Kouamo', phone_primary: '+237 699 300 400', city: 'Bafoussam', region: 'Ouest' },
    { display_name: 'Coopérative Agro-Pastorale Noun', party_type: 'organization', phone_primary: '+237 670 500 600', email: 'coop.noun@gmail.com', city: 'Foumban', region: 'Ouest' },
    { display_name: 'Nganou Samuel', party_type: 'farm_owner', first_name: 'Samuel', last_name: 'Nganou', phone_primary: '+237 655 700 800', city: 'Dschang', region: 'Ouest' },
    { display_name: 'Simo Théophile', party_type: 'individual', first_name: 'Théophile', last_name: 'Simo', phone_primary: '+237 694 900 100', city: 'Mbouda', region: 'Ouest' },
  ];
  const partyIds = [];
  for (const c of clients) {
    const r = await api('POST', '/v1/clinic/parties', c);
    partyIds.push(r.data?.id);
    console.log(`  ✅ Client: ${c.display_name} → ${r.data?.client_code || 'ERR'}`);
  }

  // ── ANIMAUX ──
  console.log('\n🐾 Création des animaux...');
  const animals = [
    { owner_party_id: partyIds[0], species_id: 1, name: 'Brutus', sex: 'M', weight_kg: 40, date_of_birth: '2021-06-01', color_markings: 'Fauve, masque noir' },
    { owner_party_id: partyIds[1], species_id: 2, name: 'Blanchette', sex: 'F', weight_kg: 3.5, date_of_birth: '2023-01-20', color_markings: 'Blanche' },
    { owner_party_id: partyIds[1], species_id: 1, name: 'Django', sex: 'M', weight_kg: 18, date_of_birth: '2022-08-10', color_markings: 'Noir' },
    { owner_party_id: partyIds[4], species_id: 1, name: 'Fifi', sex: 'neutered_F', weight_kg: 5, date_of_birth: '2021-12-25', color_markings: 'Beige et blanc' },
  ];
  const animalIds = [];
  for (const a of animals) {
    const r = await api('POST', '/v1/clinic/animals', a);
    animalIds.push(r.data?.id);
    console.log(`  ✅ Animal: ${a.name} → ${r.data?.animal_code || 'ERR'}`);
  }

  // ── FERMES ──
  console.log('\n🚜 Création des fermes...');
  const farms = [
    { owner_party_id: partyIds[3], name: 'Ferme Avicole Nganou', farm_type: 'poultry', total_area_ha: 5, city: 'Dschang', region: 'Ouest', gps_lat: 5.45, gps_lng: 10.06 },
    { owner_party_id: partyIds[2], name: 'Ranch Bovin Noun', farm_type: 'ranch', total_area_ha: 50, city: 'Foumban', region: 'Ouest', gps_lat: 5.72, gps_lng: 10.90 },
  ];
  const farmIds = [];
  for (const f of farms) {
    const r = await api('POST', '/v1/farm/farms', f);
    farmIds.push(r.data?.id);
    console.log(`  ✅ Ferme: ${f.name} → ${r.data?.farm_code || 'ERR'}`);
  }

  // ── TROUPEAUX ──
  console.log('\n🐄 Création des troupeaux...');
  const herds = [
    { farm_id: farmIds[0], name: 'Poulets de chair - Bâtiment A', species_id: 3, head_count: 2000 },
    { farm_id: farmIds[0], name: 'Poules pondeuses', species_id: 3, head_count: 500 },
    { farm_id: farmIds[1], name: 'Troupeau Bovin laitier', species_id: 4, head_count: 80 },
    { farm_id: farmIds[1], name: 'Veaux d\'engraissement', species_id: 4, head_count: 30 },
  ];
  for (const h of herds) {
    const r = await api('POST', '/v1/farm/herds', h);
    console.log(`  ✅ Troupeau: ${h.name} — ${h.head_count} têtes`);
  }

  // ── VISITES FERME ──
  console.log('\n📋 Création des visites...');
  const visits = [
    { farm_id: farmIds[0], visit_date: `${yesterday}T08:00:00Z`, visit_type: 'routine', general_findings: 'Taux de mortalité normal (0.5%). Alimentation correcte. Litière propre.' },
    { farm_id: farmIds[1], visit_date: `${today}T07:30:00Z`, visit_type: 'sanitary_control', general_findings: 'Contrôle sanitaire trimestriel. 3 bovins présentent des signes de dermatophilose.' },
  ];
  for (const v of visits) {
    const r = await api('POST', '/v1/farm/visits', v);
    console.log(`  ✅ Visite: ${v.visit_type} — ${v.visit_date.split('T')[0]}`);
  }

  // ── ÉVÉNEMENTS SANITAIRES ──
  console.log('\n⚠️ Création des événements sanitaires...');
  const events = [
    { farm_id: farmIds[1], event_type: 'disease_outbreak', event_date: today, description: 'Dermatophilose détectée sur 3 bovins du troupeau laitier. Lésions croûteuses sur le dos et les membres.', affected_count: 3, status: 'active' },
  ];
  for (const e of events) {
    const r = await api('POST', '/v1/farm/health-events', e);
    console.log(`  ✅ Événement: ${e.event_type} — ${e.affected_count} animaux affectés`);
  }

  // ── RDV ──
  console.log('\n📅 Création des rendez-vous...');
  const appointments = [
    { animal_id: animalIds[0], party_id: partyIds[0], vet_user_id: vetId, scheduled_date: today, start_time: '08:30', appointment_type: 'consultation', reason: 'Plaie à la patte arrière' },
    { animal_id: animalIds[1], party_id: partyIds[1], vet_user_id: vetId, scheduled_date: today, start_time: '10:00', appointment_type: 'vaccination', reason: 'Vaccin annuel chat' },
    { animal_id: animalIds[3], party_id: partyIds[4], vet_user_id: vetId, scheduled_date: tomorrow, start_time: '09:00', appointment_type: 'consultation', reason: 'Perte d\'appétit' },
  ];
  for (const a of appointments) {
    const r = await api('POST', '/v1/clinic/appointments', a);
    console.log(`  ✅ RDV: ${a.scheduled_date} ${a.start_time} — ${a.reason}`);
  }

  // ── CONSULTATIONS ──
  console.log('\n🩺 Création des consultations...');
  const encounters = [
    {
      animal_id: animalIds[0], party_id: partyIds[0], vet_user_id: vetId,
      encounter_date: `${today}T08:30:00`, encounter_type: 'consultation',
      visit_reason: 'Plaie profonde patte arrière gauche, saignement actif',
      temperature_c: 39.2, heart_rate_bpm: 100, resp_rate_bpm: 28, weight_kg: 40,
      clinical_findings: 'Plaie lacérée de 5cm face médiale du tarse gauche. Saignement veineux modéré. Pas d\'atteinte tendineuse visible.',
      diagnostic_hypotheses: 'Plaie traumatique, probablement fil barbelé',
      clinical_plan: 'Sédation, nettoyage chirurgical, suture en 2 plans, antibiothérapie (Amoxicilline-Ac. clav. 12.5mg/kg BID 7j), anti-tétanique',
      owner_instructions: 'Garder le pansement propre et sec. Revenir dans 3 jours pour contrôle.',
      follow_up_date: new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
      status: 'completed', case_status: 'open'
    },
  ];
  for (const e of encounters) {
    const r = await api('POST', '/v1/clinic/encounters', e);
    console.log(`  ✅ Consultation: ${e.visit_reason.substring(0, 50)}...`);
  }

  // ── VACCINATIONS ──
  console.log('\n💉 Vaccinations...');
  const vaccinations = [
    { animal_id: animalIds[0], product_name: 'Nobivac DHPPi + L', vaccination_date: '2024-06-01', manufacturer: 'MSD', lot_number: 'DL4567', route: 'SC', next_due_date: '2025-06-01' },
    { animal_id: animalIds[2], product_name: 'Nobivac DHPPi', vaccination_date: '2024-08-10', manufacturer: 'MSD', lot_number: 'DL8901', route: 'SC', next_due_date: '2025-08-10' },
  ];
  for (const v of vaccinations) {
    const r = await api('POST', '/v1/clinic/vaccinations', v);
    console.log(`  ✅ Vaccin: ${v.product_name}`);
  }

  // ── FACTURES ──
  console.log('\n💰 Création des factures...');
  const invoices = [
    {
      party_id: partyIds[0], animal_id: animalIds[0], invoice_date: today,
      lines: [
        { description: 'Consultation urgence', quantity: 1, unit_price: 15000 },
        { description: 'Sédation (Kétamine + Diazépam)', quantity: 1, unit_price: 10000 },
        { description: 'Nettoyage chirurgical + suture', quantity: 1, unit_price: 25000 },
        { description: 'Amoxicilline-Ac. clav. 500mg x14', quantity: 14, unit_price: 500 },
        { description: 'Pansement + bande', quantity: 1, unit_price: 3000 },
      ]
    },
  ];
  for (const inv of invoices) {
    const r = await api('POST', '/v1/clinic/invoices', inv);
    console.log(`  ✅ Facture: ${r.data?.invoice_number || 'ERR'} — ${inv.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0).toLocaleString()} XAF`);
  }

  // ── PRODUITS PHARMACIE ──
  console.log('\n💊 Produits pharmacie...');
  const products = [
    { name: 'Amoxicilline-Ac. clav. 500mg', sku: 'AMOXCLAV-500', unit: 'comprimé', selling_price: 500, reorder_level: 100 },
    { name: 'Oxytétracycline LA 20%', sku: 'OXY-LA20', description: 'Injectable longue action', unit: 'flacon 100ml', selling_price: 7500, reorder_level: 15 },
    { name: 'Albendazole 10%', sku: 'ALB-10', description: 'Antiparasitaire interne bovin', unit: 'flacon 1L', selling_price: 12000, reorder_level: 10 },
    { name: 'Complexe vitaminé ADE', sku: 'VIT-ADE', description: 'Solution injectable', unit: 'flacon 100ml', selling_price: 5000, reorder_level: 20 },
    { name: 'Spray bleu cicatrisant', sku: 'SPRAY-BLEU', description: 'Cicatrisant topique', unit: 'aérosol 200ml', selling_price: 4500, reorder_level: 15 },
    { name: 'Kétamine 50mg/ml', sku: 'KETA-50', description: 'Anesthésique injectable', unit: 'flacon 10ml', selling_price: 15000, reorder_level: 5 },
  ];
  for (const p of products) {
    const r = await api('POST', '/v1/pharmacy/products', p);
    console.log(`  ✅ Produit: ${p.name}`);
  }

  console.log('\n✅ Cabinet AgroVet Bafoussam terminé!\n');
}

// ══════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   RecallVET — Seed 2 cabinets vétérinaires');
  console.log('═══════════════════════════════════════════════\n');
  console.log(`API: ${API}\n`);

  await seedCabinet1();
  await seedCabinet2();

  console.log('═══════════════════════════════════════════════');
  console.log('   ✅ Seed terminé — 2 cabinets créés');
  console.log('═══════════════════════════════════════════════');
  console.log('\n📋 Comptes créés:');
  console.log('  1. dr.nguema@santeanimal.cm / Vet@Douala2024  (SantéAnimal Douala)');
  console.log('  2. dr.kamga@agrovet-baf.cm  / Vet@Bafou2024  (AgroVet Bafoussam)');
  console.log('\n🔑 Admin: admin@recallvet.com / r00t@recallvet.COM\n');
}

main().catch(console.error);
