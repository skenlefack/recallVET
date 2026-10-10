const express = require('express');
const router = express.Router();

router.use('/parties', require('./parties'));
router.use('/animals', require('./animals'));
router.use('/appointments', require('./appointments'));
router.use('/encounters', require('./encounters'));
router.use('/vaccinations', require('./vaccinations'));
router.use('/prescriptions', require('./prescriptions'));
router.use('/invoices', require('./invoices'));
router.use('/hospitalizations', require('./hospitalizations'));
router.use('/surgeries', require('./surgeries'));
router.use('/lab', require('./lab'));
router.use('/protocols', require('./protocols'));

router.use('/exports', require('./exports'));
router.use('/bulk', require('./bulk'));

// Reference data
router.use('/ref', require('./reference'));

module.exports = router;
