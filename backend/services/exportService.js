/**
 * CSV export utility.
 */

/**
 * Escape a CSV field value: wrap in quotes if it contains commas, quotes, or newlines.
 * Double any embedded quotes.
 */
function escapeCSVField(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Generate a CSV string from column definitions and row data.
 * @param {Array<{header: string, key: string}>} columns
 * @param {Array<Object>} rows
 * @returns {string} CSV content
 */
function generateCSV(columns, rows) {
  const headerLine = columns.map(c => escapeCSVField(c.header)).join(',');
  const dataLines = rows.map(row =>
    columns.map(c => escapeCSVField(row[c.key])).join(',')
  );
  return [headerLine, ...dataLines].join('\r\n');
}

module.exports = { generateCSV };
