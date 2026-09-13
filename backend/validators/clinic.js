const { body, param, query } = require('express-validator');

// ── Shared ──
const idParam = param('id').isInt({ min: 1 }).withMessage('Invalid ID.');
const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

// ── Animals ──
const createAnimal = [
  body('owner_party_id').isInt({ min: 1 }).withMessage('owner_party_id is required.'),
  body('species_id').isInt({ min: 1 }).withMessage('species_id is required.'),
  body('name').optional({ values: 'falsy' }).trim(),
  body('breed_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('sex').optional({ values: 'falsy' }).isIn(['male', 'female', 'unknown', 'castrated', 'spayed']),
  body('date_of_birth').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('weight_kg').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('microchip_number').optional({ values: 'falsy' }).trim(),
  body('identifiers').optional().isArray()
];

const updateAnimal = [
  idParam,
  body('species_id').optional().isInt({ min: 1 }),
  body('sex').optional({ values: 'falsy' }).isIn(['male', 'female', 'unknown', 'castrated', 'spayed']),
  body('date_of_birth').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('weight_kg').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('identifiers').optional().isArray()
];

// ── Parties ──
const createParty = [
  body('display_name').trim().notEmpty().withMessage('display_name is required.'),
  body('party_type').isIn(['individual', 'organization', 'farm_owner', 'government']).withMessage('Invalid party_type.'),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('phone_primary').optional({ values: 'falsy' }).trim(),
  body('country_code').optional({ values: 'falsy' }).isLength({ min: 2, max: 3 }),
  body('credit_limit').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('contacts').optional().isArray(),
  body('addresses').optional().isArray()
];

const updateParty = [
  idParam,
  body('display_name').optional().trim().notEmpty(),
  body('party_type').optional().isIn(['individual', 'organization', 'farm_owner', 'government']),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('credit_limit').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('contacts').optional().isArray(),
  body('addresses').optional().isArray()
];

// ── Appointments ──
const createAppointment = [
  body('animal_id').isInt({ min: 1 }).withMessage('animal_id is required.'),
  body('vet_user_id').isInt({ min: 1 }).withMessage('vet_user_id is required.'),
  body('scheduled_date').isISO8601().toDate().withMessage('Valid scheduled_date is required.'),
  body('party_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('site_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('appointment_type').optional({ values: 'falsy' }).isIn(['consultation', 'vaccination', 'surgery', 'follow_up', 'emergency', 'grooming', 'lab']),
  body('urgency_level').optional({ values: 'falsy' }).isIn(['normal', 'urgent', 'emergency']),
  body('start_time').optional({ values: 'falsy' }).matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('start_time must be HH:MM or HH:MM:SS.')
];

const updateAppointment = [
  idParam,
  body('scheduled_date').optional().isISO8601().toDate(),
  body('status').optional().isIn(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']),
  body('urgency_level').optional().isIn(['normal', 'urgent', 'emergency'])
];

// ── Encounters ──
const createEncounter = [
  body('animal_id').isInt({ min: 1 }).withMessage('animal_id is required.'),
  body('party_id').isInt({ min: 1 }).withMessage('party_id is required.'),
  body('vet_user_id').isInt({ min: 1 }).withMessage('vet_user_id is required.'),
  body('encounter_type').optional({ values: 'falsy' }).isIn(['consultation', 'vaccination', 'surgery', 'follow_up', 'emergency', 'lab']),
  body('temperature_c').optional({ values: 'falsy' }).isFloat({ min: 20, max: 50 }),
  body('heart_rate_bpm').optional({ values: 'falsy' }).isInt({ min: 0, max: 500 }),
  body('resp_rate_bpm').optional({ values: 'falsy' }).isInt({ min: 0, max: 200 }),
  body('weight_kg').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('secondary_diagnosis_codes').optional().isArray(),
  body('procedures_performed').optional().isArray(),
  body('lab_tests_requested').optional().isArray(),
  body('case_status').optional({ values: 'falsy' }).isIn(['open', 'closed', 'referred']),
  body('status').optional({ values: 'falsy' }).isIn(['draft', 'in_progress', 'completed', 'signed'])
];

const updateEncounter = [
  idParam,
  body('temperature_c').optional({ values: 'falsy' }).isFloat({ min: 20, max: 50 }),
  body('heart_rate_bpm').optional({ values: 'falsy' }).isInt({ min: 0, max: 500 }),
  body('resp_rate_bpm').optional({ values: 'falsy' }).isInt({ min: 0, max: 200 }),
  body('weight_kg').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('case_status').optional({ values: 'falsy' }).isIn(['open', 'closed', 'referred']),
  body('status').optional({ values: 'falsy' }).isIn(['draft', 'in_progress', 'completed', 'signed'])
];

// ── Vaccinations ──
const createVaccination = [
  body('animal_id').isInt({ min: 1 }).withMessage('animal_id is required.'),
  body('product_name').trim().notEmpty().withMessage('product_name is required.'),
  body('vaccination_date').isISO8601().toDate().withMessage('Valid vaccination_date is required.'),
  body('route').optional({ values: 'falsy' }).isIn(['SC', 'IM', 'IV', 'PO', 'IN', 'IO', 'topical']),
  body('dose_number').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('next_due_date').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('expiry_date').optional({ values: 'falsy' }).isISO8601().toDate()
];

const updateVaccination = [
  idParam,
  body('route').optional({ values: 'falsy' }).isIn(['SC', 'IM', 'IV', 'PO', 'IN', 'IO', 'topical']),
  body('dose_number').optional({ values: 'falsy' }).isInt({ min: 1 })
];

// ── Prescriptions ──
const createPrescription = [
  body('animal_id').isInt({ min: 1 }).withMessage('animal_id is required.'),
  body('party_id').isInt({ min: 1 }).withMessage('party_id is required.'),
  body('prescription_date').optional().isISO8601().toDate(),
  body('valid_until').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('lines').optional().isArray(),
  body('lines.*.product_name').optional().trim().notEmpty()
];

const updatePrescription = [
  idParam,
  body('status').optional().isIn(['active', 'partially_dispensed', 'dispensed', 'cancelled', 'expired']),
  body('valid_until').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('lines').optional().isArray()
];

// ── Invoices ──
const createInvoice = [
  body('party_id').isInt({ min: 1 }).withMessage('party_id is required.'),
  body('invoice_date').optional().isISO8601().toDate(),
  body('due_date').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('discount_amount').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('lines').optional().isArray(),
  body('lines.*.quantity').optional().isFloat({ min: 0.01 }),
  body('lines.*.unit_price').optional().isFloat({ min: 0 }),
  body('lines.*.discount_percent').optional().isFloat({ min: 0, max: 100 }),
  body('lines.*.tax_rate').optional().isFloat({ min: 0, max: 100 })
];

const updateInvoice = [
  idParam,
  body('status').optional().isIn(['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled']),
  body('discount_amount').optional({ values: 'falsy' }).isFloat({ min: 0 })
];

const recordPayment = [
  idParam,
  body('amount').isFloat({ min: 0.01 }).withMessage('amount is required and must be positive.'),
  body('payment_method').optional({ values: 'falsy' }).isIn(['cash', 'mobile_money', 'card', 'bank_transfer', 'check', 'other']),
  body('payment_date').optional().isISO8601().toDate()
];

module.exports = {
  paginationQuery, idParam,
  createAnimal, updateAnimal,
  createParty, updateParty,
  createAppointment, updateAppointment,
  createEncounter, updateEncounter,
  createVaccination, updateVaccination,
  createPrescription, updatePrescription,
  createInvoice, updateInvoice, recordPayment
};
