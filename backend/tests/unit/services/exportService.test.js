const { generateCSV } = require('../../../services/exportService');

describe('exportService', () => {
  describe('generateCSV', () => {
    const columns = [
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Age', key: 'age' }
    ];

    it('should generate correct CSV with headers and rows', () => {
      const rows = [
        { name: 'Jean', email: 'jean@test.com', age: 30 },
        { name: 'Marie', email: 'marie@test.com', age: 25 }
      ];
      const csv = generateCSV(columns, rows);
      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('Name,Email,Age');
      expect(lines[1]).toBe('Jean,jean@test.com,30');
      expect(lines[2]).toBe('Marie,marie@test.com,25');
    });

    it('should handle commas in values by wrapping in quotes', () => {
      const rows = [
        { name: 'Dupont, Jean', email: 'jean@test.com', age: 30 }
      ];
      const csv = generateCSV(columns, rows);
      const lines = csv.split('\r\n');
      expect(lines[1]).toBe('"Dupont, Jean",jean@test.com,30');
    });

    it('should handle quotes in values by double-escaping', () => {
      const rows = [
        { name: 'Jean "Le Vet"', email: 'jean@test.com', age: 30 }
      ];
      const csv = generateCSV(columns, rows);
      const lines = csv.split('\r\n');
      expect(lines[1]).toBe('"Jean ""Le Vet""",jean@test.com,30');
    });

    it('should handle empty rows', () => {
      const csv = generateCSV(columns, []);
      expect(csv).toBe('Name,Email,Age');
    });

    it('should handle missing keys in rows', () => {
      const rows = [
        { name: 'Jean' }
      ];
      const csv = generateCSV(columns, rows);
      const lines = csv.split('\r\n');
      expect(lines[1]).toBe('Jean,,');
    });
  });
});
