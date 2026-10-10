const { body, param } = require('express-validator');

const idParam = param('id').isInt({ min: 1 }).withMessage('Invalid ID.');

// ── Products ──
const createProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('category_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('sku').optional({ values: 'falsy' }).trim(),
  body('barcode').optional({ values: 'falsy' }).trim(),
  body('unit').optional({ values: 'falsy' }).trim(),
  body('unit_price').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('vat_rate').optional({ values: 'falsy' }).isFloat({ min: 0, max: 100 }),
  body('reorder_level').optional({ values: 'falsy' }).isInt({ min: 0 }),
  body('species_applicable').optional().isArray()
];

const updateProduct = [
  idParam,
  body('name').optional().trim().notEmpty(),
  body('unit_price').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('vat_rate').optional({ values: 'falsy' }).isFloat({ min: 0, max: 100 }),
  body('reorder_level').optional({ values: 'falsy' }).isInt({ min: 0 }),
  body('species_applicable').optional().isArray()
];

const createCategory = [
  body('name_fr').trim().notEmpty().withMessage('Category name (FR) is required.'),
  body('name_en').optional({ values: 'falsy' }).trim(),
  body('parent_id').optional({ values: 'falsy' }).isInt({ min: 1 })
];

// ── Suppliers ──
const createSupplier = [
  body('name').trim().notEmpty().withMessage('Supplier name is required.'),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('payment_terms_days').optional({ values: 'falsy' }).isInt({ min: 0, max: 365 }),
  body('country_code').optional({ values: 'falsy' }).isLength({ min: 2, max: 3 })
];

const updateSupplier = [
  idParam,
  body('name').optional().trim().notEmpty(),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('payment_terms_days').optional({ values: 'falsy' }).isInt({ min: 0, max: 365 })
];

// ── Stock ──
const createStockLocation = [
  body('name').trim().notEmpty().withMessage('Location name is required.'),
  body('site_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('location_type').optional({ values: 'falsy' }).isIn(['main_store', 'pharmacy', 'cold_room', 'vehicle', 'satellite'])
];

const createStockMovement = [
  body('movement_type').isIn(['adjustment_in', 'adjustment_out', 'transfer', 'damaged', 'expired', 'return']).withMessage('Valid movement_type is required.'),
  body('product_id').isInt({ min: 1 }).withMessage('product_id is required.'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('quantity must be positive.'),
  body('lot_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('from_location_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('to_location_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('reason').optional({ values: 'falsy' }).trim()
];

// ── Purchase Orders ──
const createPurchaseOrder = [
  body('supplier_id').isInt({ min: 1 }).withMessage('supplier_id is required.'),
  body('order_date').optional().isISO8601().toDate(),
  body('expected_delivery_date').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('lines').optional().isArray(),
  body('lines.*.product_id').optional().isInt({ min: 1 }),
  body('lines.*.quantity_ordered').optional().isFloat({ min: 0.01 }),
  body('lines.*.unit_cost').optional().isFloat({ min: 0 })
];

// ── Goods Receipts ──
const createGoodsReceipt = [
  body('receipt_date').optional().isISO8601().toDate(),
  body('po_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('supplier_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('lines').optional().isArray(),
  body('lines.*.product_id').optional().isInt({ min: 1 }),
  body('lines.*.quantity_received').optional().isFloat({ min: 0.01 }),
  body('lines.*.unit_cost').optional().isFloat({ min: 0 }),
  body('lines.*.location_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('lines.*.expiry_date').optional({ values: 'falsy' }).isISO8601().toDate()
];

// ── Retail Sales ──
const createRetailSale = [
  body('party_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('site_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('payment_method').optional({ values: 'falsy' }).isIn(['cash', 'mobile_money', 'card', 'bank_transfer', 'check', 'other']),
  body('tax_amount').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('lines').optional().isArray(),
  body('lines.*.product_id').optional().isInt({ min: 1 }),
  body('lines.*.lot_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('lines.*.quantity').optional().isFloat({ min: 0.01 }),
  body('lines.*.unit_price').optional().isFloat({ min: 0 }),
  body('lines.*.discount').optional().isFloat({ min: 0 })
];

// ── Dispensing ──
const createDispense = [
  body('prescription_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('animal_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('party_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('lines').optional().isArray(),
  body('lines.*.product_id').optional().isInt({ min: 1 }),
  body('lines.*.lot_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('lines.*.quantity').optional().isFloat({ min: 0.01 }),
  body('lines.*.unit_price').optional().isFloat({ min: 0 })
];

module.exports = {
  createProduct, updateProduct, createCategory,
  createSupplier, updateSupplier,
  createStockLocation, createStockMovement,
  createPurchaseOrder,
  createGoodsReceipt,
  createRetailSale,
  createDispense
};
