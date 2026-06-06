import * as XLSX from 'xlsx';
import { validateColumns, normalizeHeaders, normalizeStatus, normalizeSeverity, normalizePriority } from '../services/validationService';
import { REQUIRED_COLUMNS } from '../constants';

export async function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (raw.length < 2) {
          reject(new Error('File appears to be empty or has no data rows.'));
          return;
        }

        const headers = raw[0].map(h => h?.toString().trim());
        const validation = validateColumns(headers);

        if (!validation.valid) {
          resolve({ valid: false, missing: validation.missing, data: [] });
          return;
        }

        const headerMap = normalizeHeaders(headers);

        // Build data array using matched column positions
        const rows = raw.slice(1).filter(row => row.some(c => c !== '')).map(row => {
          const obj = {};
          REQUIRED_COLUMNS.forEach(col => {
            const idx = headerMap[col];
            obj[col] = idx !== undefined ? (row[idx]?.toString().trim() || '') : '';
          });

          // Normalize key fields
          obj['Status'] = normalizeStatus(obj['Status']);
          obj['Severity'] = normalizeSeverity(obj['Severity']);
          obj['Priority'] = normalizePriority(obj['Priority']);

          // Default Tested By
          if (!obj['Tested By']) {
            obj['Tested By'] = 'Dwip Pandya';
          }

          // Handle date formatting
          if (obj['Execution Date']) {
            try {
              const d = new Date(obj['Execution Date']);
              if (!isNaN(d.getTime())) {
                obj['Execution Date'] = d.toISOString().split('T')[0];
              }
            } catch {}
          }

          return obj;
        });

        resolve({ valid: true, missing: [], data: rows });
      } catch (err) {
        reject(new Error(`Failed to parse file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}
