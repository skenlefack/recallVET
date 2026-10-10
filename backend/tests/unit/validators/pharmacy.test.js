const { validationResult } = require('express-validator');
const {
  createProduct,
  createSupplier,
  createStockMovement,
  createPurchaseOrder
} = require('../../../validators/pharmacy');

async function runValidators(validators, body = {}, params = {}, query = {}) {
  const req = { body, params, query, headers: {} };
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
}

describe('Pharmacy Validators', () => {
  describe('createProduct', () => {
    it('should pass with name', async () => {
      const result = await runValidators(createProduct, {
        name: 'Amoxicillin 500mg'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without name', async () => {
      const result = await runValidators(createProduct, {});
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'name')).toBe(true);
    });
  });

  describe('createSupplier', () => {
    it('should pass with name', async () => {
      const result = await runValidators(createSupplier, {
        name: 'Pharma Supplies SARL'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without name', async () => {
      const result = await runValidators(createSupplier, {});
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'name')).toBe(true);
    });
  });

  describe('createStockMovement', () => {
    it('should pass with required fields', async () => {
      const result = await runValidators(createStockMovement, {
        movement_type: 'adjustment_in',
        product_id: 1,
        quantity: 10
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without movement_type', async () => {
      const result = await runValidators(createStockMovement, {
        product_id: 1,
        quantity: 10
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'movement_type')).toBe(true);
    });
  });

  describe('createPurchaseOrder', () => {
    it('should pass with supplier_id', async () => {
      const result = await runValidators(createPurchaseOrder, {
        supplier_id: 1
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without supplier_id', async () => {
      const result = await runValidators(createPurchaseOrder, {});
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'supplier_id')).toBe(true);
    });
  });
});
