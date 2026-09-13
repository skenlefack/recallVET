const express = require('express');
const router = express.Router();

router.use('/farms', require('./farms'));
router.use('/herds', require('./herds'));
router.use('/visits', require('./visits'));
router.use('/health-events', require('./healthEvents'));

module.exports = router;
