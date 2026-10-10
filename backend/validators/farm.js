const { body, param } = require('express-validator');

const idParam = param('id').isInt({ min: 1 }).withMessage('Invalid ID.');

// ── Farms ──
const createFarm = [
  body('owner_party_id').isInt({ min: 1 }).withMessage('owner_party_id is required.'),
  body('name').trim().notEmpty().withMessage('Farm name is required.'),
  body('farm_type').optional({ values: 'falsy' }).isIn(['mixed', 'dairy', 'poultry', 'aquaculture', 'piggery', 'ranch', 'other']),
  body('total_area_ha').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('gps_lat').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }),
  body('gps_lng').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }),
  body('country_code').optional({ values: 'falsy' }).isLength({ min: 2, max: 3 })
];

const updateFarm = [
  idParam,
  body('name').optional().trim().notEmpty(),
  body('farm_type').optional({ values: 'falsy' }).isIn(['mixed', 'dairy', 'poultry', 'aquaculture', 'piggery', 'ranch', 'other']),
  body('total_area_ha').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('gps_lat').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }),
  body('gps_lng').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 })
];

// ── Herds ──
const createHerd = [
  body('farm_id').isInt({ min: 1 }).withMessage('farm_id is required.'),
  body('name').trim().notEmpty().withMessage('Herd name is required.'),
  body('species_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('breed_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('purpose').optional({ values: 'falsy' }).isIn(['dairy', 'meat', 'egg', 'mixed', 'breeding', 'draft', 'other']),
  body('head_count').optional({ values: 'falsy' }).isInt({ min: 0 })
];

const updateHerd = [
  idParam,
  body('name').optional().trim().notEmpty(),
  body('head_count').optional({ values: 'falsy' }).isInt({ min: 0 })
];

const adjustHeadcount = [
  idParam,
  body('head_count').isInt({ min: 0 }).withMessage('head_count is required and must be >= 0.')
];

// ── Visits ──
const createVisit = [
  body('farm_id').isInt({ min: 1 }).withMessage('farm_id is required.'),
  body('visit_date').isISO8601().toDate().withMessage('Valid visit_date is required.'),
  body('vet_user_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('visit_type').optional({ values: 'falsy' }).isIn(['routine', 'emergency', 'follow_up', 'inspection', 'vaccination_campaign']),
  body('follow_up_date').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('herds_inspected').optional().isArray()
];

const updateVisit = [
  idParam,
  body('visit_date').optional().isISO8601().toDate(),
  body('status').optional().isIn(['planned', 'in_progress', 'completed', 'cancelled'])
];

// ── Health Events ──
const createHealthEvent = [
  body('farm_id').isInt({ min: 1 }).withMessage('farm_id is required.'),
  body('event_date').isISO8601().toDate().withMessage('Valid event_date is required.'),
  body('event_type').optional({ values: 'falsy' }).isIn(['observation', 'disease', 'mortality', 'treatment', 'vaccination']),
  body('animals_affected').optional({ values: 'falsy' }).isInt({ min: 0 }),
  body('animals_dead').optional({ values: 'falsy' }).isInt({ min: 0 }),
  body('status').optional({ values: 'falsy' }).isIn(['active', 'monitoring', 'escalated', 'resolved'])
];

const updateHealthEvent = [
  idParam,
  body('event_type').optional({ values: 'falsy' }).isIn(['observation', 'disease', 'mortality', 'treatment', 'vaccination']),
  body('animals_affected').optional({ values: 'falsy' }).isInt({ min: 0 }),
  body('animals_dead').optional({ values: 'falsy' }).isInt({ min: 0 }),
  body('status').optional({ values: 'falsy' }).isIn(['active', 'monitoring', 'escalated', 'resolved'])
];

module.exports = {
  createFarm, updateFarm,
  createHerd, updateHerd, adjustHeadcount,
  createVisit, updateVisit,
  createHealthEvent, updateHealthEvent
};
