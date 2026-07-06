import { REQUIRED_COLUMNS } from '../constants';

/**
 * Converts a list of test case row objects to a CSV string.
 * @param {Array<Object>} data 
 * @returns {string}
 */
export function jsonToCsv(data) {
  if (!data || !data.length) return '';

  // Use the exact sequence of columns defined in REQUIRED_COLUMNS
  const headers = REQUIRED_COLUMNS;
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const strVal = val === undefined || val === null ? '' : String(val);
      // Escape double quotes and wrap in double quotes to handle commas, newlines, etc.
      const escaped = strVal.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\r\n'); // Windows style line endings
}

/**
 * Syncs the test cases data to the local server's Files/ folder.
 * @param {string} fileName 
 * @param {Array<Object>} data 
 * @returns {Promise<boolean>}
 */
export async function syncFileToServer(fileName, data) {
  if (!fileName || !data) return false;

  const csvContent = jsonToCsv(data);

  const response = await fetch('/api/save-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName, csvContent }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to sync file: ${response.statusText}`);
  }

  return true;
}
