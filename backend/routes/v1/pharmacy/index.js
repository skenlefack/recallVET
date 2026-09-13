const express = require('express');
const router = express.Router();

router.use('/products', require('./products'));
router.use('/suppliers', require('./suppliers'));
router.use('/purchase-orders', require('./purchaseOrders'));
router.use('/goods-receipts', require('./goodsReceipts'));
router.use('/stock', require('./stock'));
router.use('/dispensing', require('./dispensing'));
router.use('/sales', require('./sales'));

module.exports = router;
