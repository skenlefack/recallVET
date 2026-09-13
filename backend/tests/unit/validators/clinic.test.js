const { validationResult } = require('express-validator');
const {
  createAnimal,
  createParty,
  createAppointment,
  createEncounter,
  createInvoice,
  recordPayment
} = require('../../../validators/clinic');

async function runValidators(validators, body = {}, params = {}, query = {}) {
  const req = { body, params, query, headers: {} };
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
}

describe('Clinic Validators', () => {
  describe('createAnimal', () => {
    it('should pass with owner_party_id and species_id', async () => {
      const result = await runValidators(createAnimal, {
        owner_party_id: 1,
        species_id: 2
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without owner_party_id', async () => {
      const result = await runValidators(createAnimal, {
        species_id: 2
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'owner_party_id')).toBe(true);
    });

    it('should fail without species_id', async () => {
      const result = await runValidators(createAnimal, {
        owner_party_id: 1
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'species_id')).toBe(true);
    });
  });

  describe('createParty', () => {
    it('should pass with display_name and valid party_type', async () => {
      const result = await runValidators(createParty, {
        display_name: 'Jean Dupont',
        party_type: 'individual'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without display_name', async () => {
      const result = await runValidators(createParty, {
        party_type: 'individual'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'display_name')).toBe(true);
    });

    it('should fail without party_type', async () => {
      const result = await runValidators(createParty, {
        display_name: 'Jean Dupont'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'party_type')).toBe(true);
    });

    it('should fail with invalid party_type', async () => {
      const result = await runValidators(createParty, {
        display_name: 'Jean Dupont',
        party_type: 'invalid_type'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'party_type')).toBe(true);
    });
  });

  describe('createAppointment', () => {
    it('should pass with required fields', async () => {
      const result = await runValidators(createAppointment, {
        animal_id: 1,
        vet_user_id: 2,
        scheduled_date: '2025-06-15T10:00:00Z'
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without animal_id', async () => {
      const result = await runValidators(createAppointment, {
        vet_user_id: 2,
        scheduled_date: '2025-06-15T10:00:00Z'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'animal_id')).toBe(true);
    });
  });

  describe('createInvoice', () => {
    it('should pass with party_id', async () => {
      const result = await runValidators(createInvoice, {
        party_id: 1
      });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail without party_id', async () => {
      const result = await runValidators(createInvoice, {});
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'party_id')).toBe(true);
    });
  });

  describe('recordPayment', () => {
    it('should pass with valid amount', async () => {
      const result = await runValidators(recordPayment, {
        amount: 100.00
      }, { id: '1' });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with negative amount', async () => {
      const result = await runValidators(recordPayment, {
        amount: -10
      }, { id: '1' });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'amount')).toBe(true);
    });
  });
});
