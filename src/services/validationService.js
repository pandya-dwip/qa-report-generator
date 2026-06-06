import { REQUIRED_COLUMNS } from '../constants';

export function validateColumns(headers) {
  const normalized = headers.map(h => h?.toString().trim());
  const missing = REQUIRED_COLUMNS.filter(
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
