import { REQUIRED_COLUMNS } from '../constants';

export function validateColumns(headers) {
  const normalized = headers.map(h => h?.toString().trim());
  const CRITICAL = ['Test Case ID', 'Status'];
  const missing = CRITICAL.filter(
    req => !normalized.some(h => h.toLowerCase() === req.toLowerCase())
  );
  return { valid: missing.length === 0, missing };
}

export function normalizeHeaders(headers) {
  const map = {};
  headers.forEach((h, i) => {
    const key = REQUIRED_COLUMNS.find(
      req => req.toLowerCase() === h?.toString().trim().toLowerCase()
    );
    if (key) map[key] = i;
  });
  return map;
}

export function validateRow(row) {
  const warnings = [];
  if (!row['Status']) warnings.push('Missing Status');
  if (!row['Test Case ID']) warnings.push('Missing Test Case ID');
  return warnings;
}

export function normalizeStatus(status) {
  if (!status) return 'NOT EXECUTED';
  const s = status.toString().trim().toUpperCase();
  if (s === 'PASS' || s === 'PASSED') return 'PASS';
  if (s === 'FAIL' || s === 'FAILED') return 'FAIL';
  if (s === 'BLOCKED') return 'BLOCKED';
  return 'NOT EXECUTED';
}

export function normalizeSeverity(sev) {
  if (!sev) return 'MEDIUM';
  const s = sev.toString().trim().toUpperCase();
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(s)) return s;
  return 'MEDIUM';
}

export function normalizePriority(pri) {
  if (!pri) return 'MEDIUM';
  const p = pri.toString().trim().toUpperCase();
  if (['HIGH', 'MEDIUM', 'LOW'].includes(p)) return p;
  return 'MEDIUM';
}

export function parseDateToYYYYMMDD(dateVal) {
  if (!dateVal) return '';

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return '';
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(dateVal).trim();
  if (!str) return '';

  // 1. Try parsing YYYY-MM-DD or YYYY/MM/DD
  let match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, '0');
    const d = match[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. Try parsing DD-MM-YYYY or MM-DD-YYYY (and slashes)
  match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const part1 = parseInt(match[1], 10);
    const part2 = parseInt(match[2], 10);
    const y = match[3];

    if (part1 > 12) {
      // Must be DD-MM-YYYY
      const d = String(part1).padStart(2, '0');
      const m = String(part2).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } else if (part2 > 12) {
      // Must be MM-DD-YYYY
      const m = String(part1).padStart(2, '0');
      const d = String(part2).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } else {
      // Ambiguous! E.g. 05-06-2026. Default to DD-MM-YYYY (June 5th) for Indian context.
      const d = String(part1).padStart(2, '0');
      const m = String(part2).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // 3. Fallback to standard JS Date parser
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    if (str.includes('T') || str.includes('Z')) {
      const y = parsed.getUTCFullYear();
      const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      const d = String(parsed.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } else {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // 4. Excel date serial number fallback
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = num * 24 * 60 * 60 * 1000;
    const parsedExcelDate = new Date(excelEpoch.getTime() + ms);
    const y = parsedExcelDate.getUTCFullYear();
    const m = String(parsedExcelDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(parsedExcelDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
}

