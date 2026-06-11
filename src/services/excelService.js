import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { REQUIRED_COLUMNS } from '../constants';
import { computeStats } from './chartService';
import { normalizeStatus, normalizeSeverity, normalizePriority } from './validationService';

// ── Helpers ────────────────────────────────────────────────────────────────────

const hex = (h) => ({ argb: `FF${h.replace('#', '')}` });

const fill = (h) => ({ type: 'pattern', pattern: 'solid', fgColor: hex(h) });

function applyHeaderStyle(row, bgHex = '1E293B', fgHex = 'FFFFFF') {
  row.eachCell(cell => {
    cell.fill = fill(bgHex);
    cell.font = { bold: true, color: hex(fgHex), name: 'Arial', size: 10 };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: hex('475569') },
      left: { style: 'thin', color: hex('475569') },
      bottom: { style: 'thin', color: hex('475569') },
      right: { style: 'thin', color: hex('475569') },
    };
  });
  row.height = 36;
}

function applyDataRowStyle(row, idx, isGoogleSheets) {
  const isEven = idx % 2 === 0;
  const baseBg = isEven ? 'F8FAFC' : 'FFFFFF';
  const borderStyle = isGoogleSheets ? 'thin' : 'hair';

  row.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.fill = fill(baseBg);
    cell.font = { name: 'Arial', size: 9, color: hex('1E293B') };
    cell.alignment = { vertical: 'top', wrapText: true };
    cell.border = {
      bottom: { style: borderStyle, color: hex('E2E8F0') },
      right: { style: borderStyle, color: hex('E2E8F0') },
    };
  });
  row.height = 28;
}

function statusCellStyle(status) {
  const s = normalizeStatus(status);
  const map = {
    PASS: { bg: 'DCFCE7', fg: '15803D', border: '86EFAC' },
    FAIL: { bg: 'FEE2E2', fg: 'B91C1C', border: 'FCA5A5' },
    BLOCKED: { bg: 'FEF3C7', fg: 'B45309', border: 'FDE68A' },
    'NOT EXECUTED': { bg: 'F1F5F9', fg: '475569', border: 'CBD5E1' },
  };
  return map[s] || map['NOT EXECUTED'];
}

function severityCellStyle(sev) {
  const s = normalizeSeverity(sev);
  const map = {
    CRITICAL: { bg: 'FEE2E2', fg: 'B91C1C' },
    HIGH: { bg: 'FFEDD5', fg: 'C2410C' },
    MEDIUM: { bg: 'FEF9C3', fg: '854D0E' },
    LOW: { bg: 'DBEAFE', fg: '1D4ED8' },
  };
  return map[s] || map.MEDIUM;
}

function priorityCellStyle(pri) {
  const p = normalizePriority(pri);
  const map = {
    HIGH: { bg: 'FEE2E2', fg: 'B91C1C' },
    MEDIUM: { bg: 'FEF9C3', fg: '854D0E' },
    LOW: { bg: 'DCFCE7', fg: '15803D' },
  };
  return map[p] || map.MEDIUM;
}

// ── Sheet 1: Dashboard ─────────────────────────────────────────────────────────

function buildDashboardSheet(wb, data, isGoogleSheets) {
  const ws = wb.addWorksheet('📊 Dashboard', {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: 'landscape' },
  });

  ws.getColumn(1).width = isGoogleSheets ? 5 : 4;
  for (let i = 2; i <= 20; i++) ws.getColumn(i).width = isGoogleSheets ? 16 : 14;

  const stats = computeStats(data);

  // Title area
  ws.mergeCells('B2:S2');
  const titleCell = ws.getCell('B2');
  titleCell.value = '🧪  QA EXECUTION DASHBOARD';
  titleCell.font = { bold: true, size: 20, color: hex('0F172A'), name: 'Arial' };
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
  titleCell.fill = fill('F8FAFC');
  ws.getRow(2).height = 52;

  ws.mergeCells('B3:S3');
  const sub = ws.getCell('B3');
  sub.value = `Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}   |   Total Cases: ${stats.total}   |   Pass Rate: ${stats.passRate}%`;
  sub.font = { size: 9, color: hex('475569'), name: 'Arial' };
  sub.alignment = { horizontal: 'left', vertical: 'middle' };
  sub.fill = fill('F8FAFC');
  ws.getRow(3).height = 22;

  // Spacer
  ws.getRow(4).height = 10;

  const testCasesRange = `'🧪 Test Cases'!$L$2:$L${data.length + 1}`;
  const totalRowsRange = `'🧪 Test Cases'!$A$2:$A${data.length + 1}`;

  // KPI Cards ─ row 5-9
  const cards = [
    { label: 'TOTAL', value: { formula: `ROWS(${totalRowsRange})` }, bg: 'F8FAFC', accent: '0EA5E9', icon: '📋' },
    { label: 'PASSED', value: { formula: `COUNTIF(${testCasesRange}, "PASS") + COUNTIF(${testCasesRange}, "PASSED")` }, bg: 'F0FDF4', accent: '16A34A', icon: '✅' },
    { label: 'FAILED', value: { formula: `COUNTIF(${testCasesRange}, "FAIL") + COUNTIF(${testCasesRange}, "FAILED")` }, bg: 'FEF2F2', accent: 'DC2626', icon: '❌' },
    { label: 'BLOCKED', value: { formula: `COUNTIF(${testCasesRange}, "BLOCKED")` }, bg: 'FFFBEB', accent: 'D97706', icon: '🔒' },
    { label: 'NOT EXEC', value: { formula: `COUNTIF(${testCasesRange}, "NOT EXECUTED")` }, bg: 'F8FAFC', accent: '64748B', icon: '⏸' },
    { label: 'PASS %', value: { formula: `IF(B7>0, D7/B7, 0)` }, bg: 'F0FDF4', accent: '16A34A', icon: '📈', isPercent: true },
    { label: 'FAIL %', value: { formula: `IF(B7>0, F7/B7, 0)` }, bg: 'FEF2F2', accent: 'DC2626', icon: '📉', isPercent: true },
  ];

  const cardCols = [2, 4, 6, 8, 10, 12, 14];
  cards.forEach((card, i) => {
    const col = cardCols[i];
    const colLetter1 = String.fromCharCode(64 + col);
    const colLetter2 = String.fromCharCode(64 + col + 1);

    ws.mergeCells(`${colLetter1}5:${colLetter2}5`);
    ws.mergeCells(`${colLetter1}6:${colLetter2}6`);
    ws.mergeCells(`${colLetter1}7:${colLetter2}7`);
    ws.mergeCells(`${colLetter1}8:${colLetter2}8`);
    ws.mergeCells(`${colLetter1}9:${colLetter2}9`);

    // Card top border
    const topCell = ws.getCell(`${colLetter1}5`);
    topCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${card.accent}` } };
    ws.getRow(5).height = 4;

    // Icon
    const iconCell = ws.getCell(`${colLetter1}6`);
    iconCell.value = card.icon;
    iconCell.font = { size: 16, name: 'Arial' };
    iconCell.alignment = { horizontal: 'center', vertical: 'middle' };
    iconCell.fill = fill(card.bg);
    ws.getRow(6).height = 28;

    // Value
    const valCell = ws.getCell(`${colLetter1}7`);
    valCell.value = card.value;
    valCell.font = { bold: true, size: 22, color: hex(card.accent), name: 'Arial' };
    valCell.alignment = { horizontal: 'center', vertical: 'middle' };
    valCell.fill = fill(card.bg);
    if (card.isPercent) {
      valCell.numFmt = '0.0%';
    }
    ws.getRow(7).height = 38;

    // Label
    const lblCell = ws.getCell(`${colLetter1}8`);
    lblCell.value = card.label;
    lblCell.font = { size: 8, color: hex('64748B'), name: 'Arial', bold: true };
    lblCell.alignment = { horizontal: 'center', vertical: 'middle' };
    lblCell.fill = fill(card.bg);
    ws.getRow(8).height = 20;

    // Bottom spacer
    const bot = ws.getCell(`${colLetter1}9`);
    bot.fill = fill(card.bg);
    ws.getRow(9).height = 6;
  });

  // Module breakdown table
  ws.getRow(10).height = 10;

  ws.mergeCells('B11:I11');
  const modTitle = ws.getCell('B11');
  modTitle.value = 'MODULE BREAKDOWN';
  modTitle.font = { bold: true, size: 10, color: hex('475569'), name: 'Arial' };
  modTitle.fill = fill('F8FAFC');
  ws.getRow(11).height = 24;

  // Module table header
  const modHeaders = ['Module', 'Total', 'Pass', 'Fail', 'Blocked', 'Not Exec', 'Pass%'];
  const modHeaderRow = ws.getRow(12);
  modHeaderRow.height = 28;
  ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((col, i) => {
    const cell = modHeaderRow.getCell(col);
    cell.value = modHeaders[i];
    cell.fill = fill('E2E8F0');
    cell.font = { bold: true, size: 9, color: hex('334155'), name: 'Arial' };
    cell.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle' };
    cell.border = { bottom: { style: 'thin', color: hex('CBD5E1') } };
  });

  const moduleMap = {};
  data.forEach(row => {
    const mod = row['Module'] || 'Unknown';
    if (!moduleMap[mod]) moduleMap[mod] = { total: 0, pass: 0, fail: 0, blocked: 0, notExec: 0 };
  });

  const modulesRange = `'🧪 Test Cases'!$B$2:$B${data.length + 1}`;
  const statusesRange = `'🧪 Test Cases'!$L$2:$L${data.length + 1}`;

  let rowIdx = 13;
  Object.entries(moduleMap).forEach(([mod, m], i) => {
    const r = ws.getRow(rowIdx);
    r.height = 22;
    const bg = i % 2 === 0 ? 'F8FAFC' : 'FFFFFF';

    const rowValues = [
      mod,
      { formula: `COUNTIF(${modulesRange}, B${rowIdx})` },
      { formula: `COUNTIFS(${modulesRange}, B${rowIdx}, ${statusesRange}, "PASS") + COUNTIFS(${modulesRange}, B${rowIdx}, ${statusesRange}, "PASSED")` },
      { formula: `COUNTIFS(${modulesRange}, B${rowIdx}, ${statusesRange}, "FAIL") + COUNTIFS(${modulesRange}, B${rowIdx}, ${statusesRange}, "FAILED")` },
      { formula: `COUNTIFS(${modulesRange}, B${rowIdx}, ${statusesRange}, "BLOCKED")` },
      { formula: `COUNTIFS(${modulesRange}, B${rowIdx}, ${statusesRange}, "NOT EXECUTED")` },
      { formula: `IF(C${rowIdx}>0, D${rowIdx}/C${rowIdx}, 0)` }
    ];

    rowValues.forEach((v, vi) => {
      const col = ['B', 'C', 'D', 'E', 'F', 'G', 'H'][vi];
      const cell = r.getCell(col);
      cell.value = v;
      cell.fill = fill(bg);
      cell.font = { size: 9, name: 'Arial', color: hex(vi === 2 ? '16A34A' : vi === 3 ? 'DC2626' : vi === 4 ? 'D97706' : '1E293B') };
      cell.alignment = { horizontal: vi === 0 ? 'left' : 'center', vertical: 'middle' };
      cell.border = { bottom: { style: isGoogleSheets ? 'thin' : 'hair', color: hex('E2E8F0') } };
      if (vi === 6) {
        cell.numFmt = '0%';
      }
    });
    rowIdx++;
  });

  // Severity summary (right side)
  ws.mergeCells('J11:P11');
  const sevTitle = ws.getCell('J11');
  sevTitle.value = 'SEVERITY & PRIORITY SUMMARY';
  sevTitle.font = { bold: true, size: 10, color: hex('475569'), name: 'Arial' };
  sevTitle.fill = fill('F8FAFC');

  const sevHeaders = ['Category', 'Count', '', 'Priority', 'Count'];
  const shRow = ws.getRow(12);
  ['J', 'K', 'L', 'M', 'N'].forEach((col, i) => {
    const cell = shRow.getCell(col);
    cell.value = sevHeaders[i];
    cell.fill = fill('E2E8F0');
    cell.font = { bold: true, size: 9, color: hex('334155'), name: 'Arial' };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { bottom: { style: 'thin', color: hex('CBD5E1') } };
  });

  const severityRange = `'🧪 Test Cases'!$K$2:$K${data.length + 1}`;
  const priorityRange = `'🧪 Test Cases'!$J$2:$J${data.length + 1}`;

  const sevRows = [
    ['CRITICAL', { formula: `COUNTIF(${severityRange}, J13)` }, '', 'HIGH', { formula: `COUNTIF(${priorityRange}, M13)` }],
    ['HIGH', { formula: `COUNTIF(${severityRange}, J14)` }, '', 'MEDIUM', { formula: `COUNTIF(${priorityRange}, M14)` }],
    ['MEDIUM', { formula: `COUNTIF(${severityRange}, J15)` }, '', 'LOW', { formula: `COUNTIF(${priorityRange}, M15)` }],
    ['LOW', { formula: `COUNTIF(${severityRange}, J16)` }, '', '', ''],
  ];
  const sevFg = ['DC2626', 'D97706', 'CA8A04', '2563EB'];
  const priFg = ['DC2626', 'CA8A04', '16A34A'];

  sevRows.forEach((srow, i) => {
    const r = ws.getRow(13 + i);
    const bg = i % 2 === 0 ? 'F8FAFC' : 'FFFFFF';
    ['J', 'K', 'L', 'M', 'N'].forEach((col, ci) => {
      const cell = r.getCell(col);
      cell.value = srow[ci];
      cell.fill = fill(bg);
      cell.font = { size: 9, name: 'Arial', color: hex(ci === 0 ? sevFg[i] : ci === 3 ? (priFg[i] || '1E293B') : '1E293B') };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: isGoogleSheets ? 'thin' : 'hair', color: hex('E2E8F0') } };
    });
    r.height = 22;
  });

  return ws;
}

// ── Sheet 2: Project Details ───────────────────────────────────────────────────

function buildProjectSheet(wb, data, isGoogleSheets) {
  const ws = wb.addWorksheet('📋 Project Details', {
    views: [{ showGridLines: false }],
  });

  ws.getColumn(1).width = isGoogleSheets ? 6 : 5;
  ws.getColumn(2).width = isGoogleSheets ? 32 : 28;
  ws.getColumn(3).width = isGoogleSheets ? 42 : 36;
  ws.getColumn(4).width = isGoogleSheets ? 6 : 5;
  ws.getColumn(5).width = isGoogleSheets ? 32 : 28;
  ws.getColumn(6).width = isGoogleSheets ? 42 : 36;

  const stats = computeStats(data);

  // Title
  ws.mergeCells('B2:F2');
  const t = ws.getCell('B2');
  t.value = '📋  PROJECT DETAILS & TEST SUMMARY';
  t.font = { bold: true, size: 16, color: hex('0F172A'), name: 'Arial' };
  t.alignment = { horizontal: 'left', vertical: 'middle' };
  t.fill = fill('F8FAFC');
  ws.getRow(2).height = 46;

  // Divider
  ws.mergeCells('B3:F3');
  const div = ws.getCell('B3');
  div.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
  ws.getRow(3).height = 2;

  ws.getRow(4).height = 14;

  // Project info section
  ws.mergeCells('B5:F5');
  const pi = ws.getCell('B5');
  pi.value = 'PROJECT INFORMATION';
  pi.font = { bold: true, size: 9, color: hex('1E3A8A'), name: 'Arial' };
  pi.alignment = { horizontal: 'left', vertical: 'middle' };
  pi.fill = fill('F1F5F9');
  ws.getRow(5).height = 24;

  const editableFields = [
    ['Project Name', ''], ['QA Engineer', ''], ['Build Version', ''],
    ['Environment', ''], ['Test Cycle', ''], ['Start Date', ''],
    ['End Date', ''], ['Remarks', ''],
  ];

  editableFields.forEach(([label, val], i) => {
    const r = ws.getRow(6 + i);
    r.height = 28;
    const bg = i % 2 === 0 ? 'F8FAFC' : 'FFFFFF';

    const lbl = r.getCell('B');
    lbl.value = label;
    lbl.font = { size: 9, color: hex('475569'), name: 'Arial' };
    lbl.alignment = { horizontal: 'left', vertical: 'middle' };
    lbl.fill = fill(bg);
    lbl.border = { bottom: { style: isGoogleSheets ? 'thin' : 'hair', color: hex('E2E8F0') } };

    ws.mergeCells(`C${6 + i}:C${6 + i}`);
    const val2 = r.getCell('C');
    val2.value = val;
    val2.font = { size: 9, color: hex('0F172A'), name: 'Arial', italic: true };
    val2.alignment = { horizontal: 'left', vertical: 'middle' };
    val2.fill = fill('F1F5F9');
    val2.border = {
      bottom: { style: isGoogleSheets ? 'thin' : 'hair', color: hex('E2E8F0') },
      left: { style: 'thin', color: hex('3B82F6') },
    };
    val2.protection = { locked: false };
  });

  // Spacer
  ws.getRow(14).height = 16;

  // Auto-calculated stats
  ws.mergeCells('B15:F15');
  const sc = ws.getCell('B15');
  sc.value = 'TEST EXECUTION SUMMARY';
  sc.font = { bold: true, size: 9, color: hex('065F46'), name: 'Arial' };
  sc.alignment = { horizontal: 'left', vertical: 'middle' };
  sc.fill = fill('F1F5F9');
  ws.getRow(15).height = 24;

  const testCasesRange = `'🧪 Test Cases'!$L$2:$L${data.length + 1}`;
  const totalRowsRange = `'🧪 Test Cases'!$A$2:$A${data.length + 1}`;

  const summaryRows = [
    ['Total Test Cases', { formula: `ROWS(${totalRowsRange})` }],
    ['Passed', { formula: `COUNTIF(${testCasesRange}, "PASS") + COUNTIF(${testCasesRange}, "PASSED")` }],
    ['Failed', { formula: `COUNTIF(${testCasesRange}, "FAIL") + COUNTIF(${testCasesRange}, "FAILED")` }],
    ['Blocked', { formula: `COUNTIF(${testCasesRange}, "BLOCKED")` }],
    ['Not Executed', { formula: `COUNTIF(${testCasesRange}, "NOT EXECUTED")` }],
    ['Pass %', { formula: `IF(C16>0, C17/C16, 0)` }, true],
    ['Fail %', { formula: `IF(C16>0, C18/C16, 0)` }, true],
  ];

  const summaryColors = ['1E293B', '16A34A', 'DC2626', 'D97706', '64748B', '16A34A', 'DC2626'];

  summaryRows.forEach(([lbl, val, isPercent], i) => {
    const r = ws.getRow(16 + i);
    r.height = 26;
    const bg = i % 2 === 0 ? 'F8FAFC' : 'FFFFFF';

    const l = r.getCell('B');
    l.value = lbl;
    l.font = { size: 9, color: hex('475569'), name: 'Arial' };
    l.alignment = { horizontal: 'left', vertical: 'middle' };
    l.fill = fill(bg);
    l.border = { bottom: { style: isGoogleSheets ? 'thin' : 'hair', color: hex('E2E8F0') } };

    const v = r.getCell('C');
    v.value = val;
    v.font = { bold: true, size: 11, color: hex(summaryColors[i]), name: 'Arial' };
    v.alignment = { horizontal: 'center', vertical: 'middle' };
    v.fill = fill('F1F5F9');
    v.border = { bottom: { style: isGoogleSheets ? 'thin' : 'hair', color: hex('E2E8F0') }, left: { style: 'thin', color: hex('10B981') } };
    if (isPercent) {
      v.numFmt = '0.0%';
    }
  });

  return ws;
}

// ── Sheet 3: Test Cases ────────────────────────────────────────────────────────

function buildTestCaseSheet(wb, data, isGoogleSheets) {
  const ws = wb.addWorksheet('🧪 Test Cases', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
  });

  // Column widths
  const colWidths = isGoogleSheets
    ? [10, 22, 22, 18, 48, 42, 54, 48, 48, 15, 17, 17, 22, 20, 22, 22, 42]
    : [8, 18, 18, 15, 40, 35, 45, 40, 40, 12, 14, 14, 18, 16, 18, 18, 35];
  REQUIRED_COLUMNS.forEach((_, i) => {
    ws.getColumn(i + 1).width = colWidths[i] || 18;
  });

  // Header row
  const headerRow = ws.addRow(REQUIRED_COLUMNS);
  applyHeaderStyle(headerRow, '1E293B', 'FFFFFF');

  // Accent on first cell
  headerRow.getCell(1).fill = fill('3B82F6');
  headerRow.getCell(1).font = { bold: true, size: 9, color: hex('FFFFFF'), name: 'Arial' };

  // Auto filter
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: REQUIRED_COLUMNS.length },
  };

  // Data rows
  data.forEach((row, idx) => {
    const values = REQUIRED_COLUMNS.map(col => {
      const v = row[col];
      if (v === undefined || v === null) return '';
      return v.toString();
    });

    const dataRow = ws.addRow(values);
    applyDataRowStyle(dataRow, idx, isGoogleSheets);

    // Status conditional
    const statusIdx = REQUIRED_COLUMNS.indexOf('Status') + 1;
    const statusCell = dataRow.getCell(statusIdx);
    const style = statusCellStyle(row['Status']);
    statusCell.fill = fill(style.bg);
    statusCell.font = { bold: true, size: 9, color: hex(style.fg), name: 'Arial' };
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    statusCell.border = {
      top: { style: 'thin', color: hex(style.border) },
      bottom: { style: 'thin', color: hex(style.border) },
      left: { style: 'thin', color: hex(style.border) },
      right: { style: 'thin', color: hex(style.border) },
    };

    // Severity
    const sevIdx = REQUIRED_COLUMNS.indexOf('Severity') + 1;
    const sevCell = dataRow.getCell(sevIdx);
    const sevStyle = severityCellStyle(row['Severity']);
    sevCell.fill = fill(sevStyle.bg);
    sevCell.font = { bold: true, size: 9, color: hex(sevStyle.fg), name: 'Arial' };
    sevCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Priority
    const priIdx = REQUIRED_COLUMNS.indexOf('Priority') + 1;
    const priCell = dataRow.getCell(priIdx);
    const priStyle = priorityCellStyle(row['Priority']);
    priCell.fill = fill(priStyle.bg);
    priCell.font = { bold: true, size: 9, color: hex(priStyle.fg), name: 'Arial' };
    priCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Defect ID hyperlink
    const defectIdIdx = REQUIRED_COLUMNS.indexOf('Defect ID') + 1;
    const defectCell = dataRow.getCell(defectIdIdx);
    const defectId = row['Defect ID'];
    if (defectId && defectId.toString().trim()) {
      defectCell.value = {
        text: defectId.toString(),
        hyperlink: `https://jira.example.com/browse/${defectId}`,
      };
      defectCell.font = { color: hex('2563EB'), underline: true, size: 9, name: 'Arial' };
    }
  });

  return ws;
}

// ── Sheet 4: Summary Table ─────────────────────────────────────────────────────

function buildSummarySheet(wb, data, isGoogleSheets) {
  const ws = wb.addWorksheet('📊 Summary', {
    views: [{ showGridLines: false }],
  });

  ws.getColumn(1).width = isGoogleSheets ? 8 : 6;
  ws.getColumn(2).width = isGoogleSheets ? 28 : 24;
  ws.getColumn(3).width = isGoogleSheets ? 14 : 12;
  ws.getColumn(4).width = isGoogleSheets ? 14 : 12;
  ws.getColumn(5).width = isGoogleSheets ? 14 : 12;
  ws.getColumn(6).width = isGoogleSheets ? 14 : 12;
  ws.getColumn(7).width = isGoogleSheets ? 14 : 12;
  ws.getColumn(8).width = isGoogleSheets ? 14 : 12;

  ws.mergeCells('B2:H2');
  const t = ws.getCell('B2');
  t.value = '📊  MODULE WISE EXECUTION SUMMARY';
  t.font = { bold: true, size: 14, color: hex('0F172A'), name: 'Arial' };
  t.alignment = { horizontal: 'left', vertical: 'middle' };
  t.fill = fill('F8FAFC');
  ws.getRow(2).height = 40;

  ws.getRow(3).height = 8;

  const headers = ['Module', 'Total', 'Pass', 'Fail', 'Blocked', 'Not Exec', 'Pass %'];
  const hRow = ws.getRow(4);
  hRow.height = 30;
  ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((col, i) => {
    const cell = hRow.getCell(col);
    cell.value = headers[i];
    cell.fill = fill('E2E8F0');
    cell.font = { bold: true, size: 9, color: hex(i === 2 ? '16A34A' : i === 3 ? 'DC2626' : i === 4 ? 'D97706' : '334155'), name: 'Arial' };
    cell.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'medium', color: hex('3B82F6') },
      top: { style: 'thin', color: hex('CBD5E1') },
    };
  });

  const moduleMap = {};
  data.forEach(row => {
    const mod = row['Module'] || 'Unknown';
    if (!moduleMap[mod]) moduleMap[mod] = { total: 0, pass: 0, fail: 0, blocked: 0, notExec: 0 };
  });

  const modulesRange = `'🧪 Test Cases'!$B$2:$B${data.length + 1}`;
  const statusesRange = `'🧪 Test Cases'!$L$2:$L${data.length + 1}`;

  let ri = 5;
  Object.entries(moduleMap).forEach(([mod, m], i) => {
    const r = ws.getRow(ri);
    r.height = 24;
    const bg = i % 2 === 0 ? 'F8FAFC' : 'FFFFFF';

    const rowValues = [
      mod,
      { formula: `COUNTIF(${modulesRange}, B${ri})` },
      { formula: `COUNTIFS(${modulesRange}, B${ri}, ${statusesRange}, "PASS") + COUNTIFS(${modulesRange}, B${ri}, ${statusesRange}, "PASSED")` },
      { formula: `COUNTIFS(${modulesRange}, B${ri}, ${statusesRange}, "FAIL") + COUNTIFS(${modulesRange}, B${ri}, ${statusesRange}, "FAILED")` },
      { formula: `COUNTIFS(${modulesRange}, B${ri}, ${statusesRange}, "BLOCKED")` },
      { formula: `COUNTIFS(${modulesRange}, B${ri}, ${statusesRange}, "NOT EXECUTED")` },
      { formula: `IF(C${ri}>0, D${ri}/C${ri}, 0)` }
    ];

    rowValues.forEach((v, vi) => {
      const col = ['B', 'C', 'D', 'E', 'F', 'G', 'H'][vi];
      const cell = r.getCell(col);
      cell.value = v;
      cell.fill = fill(bg);
      cell.font = {
        size: 9, name: 'Arial',
        bold: vi === 0,
        color: hex(vi === 2 ? '16A34A' : vi === 3 ? 'DC2626' : vi === 4 ? 'D97706' : '1E293B'),
      };
      cell.alignment = { horizontal: vi === 0 ? 'left' : 'center', vertical: 'middle' };
      cell.border = { bottom: { style: isGoogleSheets ? 'thin' : 'hair', color: hex('E2E8F0') } };
      if (vi === 6) {
        cell.numFmt = '0.0%';
      }
    });
    ri++;
  });

  // Totals row
  const tr = ws.getRow(ri);
  tr.height = 30;
  const totalsRowValues = [
    'TOTAL',
    { formula: `SUM(C5:C${ri - 1})` },
    { formula: `SUM(D5:D${ri - 1})` },
    { formula: `SUM(E5:E${ri - 1})` },
    { formula: `SUM(F5:F${ri - 1})` },
    { formula: `SUM(G5:G${ri - 1})` },
    { formula: `IF(C${ri}>0, D${ri}/C${ri}, 0)` }
  ];

  totalsRowValues.forEach((v, vi) => {
    const col = ['B', 'C', 'D', 'E', 'F', 'G', 'H'][vi];
    const cell = tr.getCell(col);
    cell.value = v;
    cell.fill = fill('E2E8F0');
    cell.font = { bold: true, size: 10, name: 'Arial', color: hex(vi === 2 ? '16A34A' : vi === 3 ? 'DC2626' : '0F172A') };
    cell.alignment = { horizontal: vi === 0 ? 'left' : 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'medium', color: hex('3B82F6') },
    };
    if (vi === 6) {
      cell.numFmt = '0.0%';
    }
  });

  return ws;
}

// ── Main Export Function ───────────────────────────────────────────────────────

export async function generateExcelReport(data, onProgress, isGoogleSheets = false, customFileName = '') {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'QA Report Generator';
  wb.created = new Date();
  wb.modified = new Date();

  onProgress?.(10, 'Building Dashboard...');
  buildDashboardSheet(wb, data, isGoogleSheets);

  onProgress?.(30, 'Building Project Details...');
  buildProjectSheet(wb, data, isGoogleSheets);

  onProgress?.(55, 'Building Test Cases Sheet...');
  buildTestCaseSheet(wb, data, isGoogleSheets);

  onProgress?.(75, 'Building Summary Sheet...');
  buildSummarySheet(wb, data, isGoogleSheets);

  onProgress?.(90, 'Generating file...');

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Get base name without extension
  let baseName = 'QA_Report';
  if (customFileName) {
    baseName = customFileName.replace(/\.(xlsx|xls|csv)$/i, '');
  }

  // Get current date in DD_MM_YYYY format
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateStr = `${dd}_${mm}_${yyyy}`;

  // Form final filename: Google Sheets has no extension suffix, Excel has .xlsx
  const filename = isGoogleSheets ? `${baseName}_Sheet_${dateStr}` : `${baseName}_Sheet_${dateStr}.xlsx`;
  saveAs(blob, filename);

  onProgress?.(100, 'Done!');
}
