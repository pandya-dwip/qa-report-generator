export const REQUIRED_COLUMNS = [
  'Sr No', 'Module', 'Test Case ID', 'Test Type', 'Testing Method', 'Test Scenario',
  'Simplified Test Scenario', 'Test Steps', 'Expected Result', 'Actual Result',
  'Priority', 'Severity', 'Status', 'Tested By', 'Execution Date',
  'Defect No. / Bug No.', 'Defect ID', 'QA Comments'
];

export const STATUS_COLORS = {
  PASS: { hex: '10b981', rgb: { r: 16, g: 185, b: 129 }, label: 'Pass' },
  FAILED: { hex: 'ef4444', rgb: { r: 239, g: 68, b: 68 }, label: 'Failed' },
  FAIL: { hex: 'ef4444', rgb: { r: 239, g: 68, b: 68 }, label: 'Failed' },
  BLOCKED: { hex: 'f97316', rgb: { r: 249, g: 115, b: 22 }, label: 'Blocked' },
  'NOT EXECUTED': { hex: '64748b', rgb: { r: 100, g: 116, b: 139 }, label: 'Not Executed' },
  'NOT_EXECUTED': { hex: '64748b', rgb: { r: 100, g: 116, b: 139 }, label: 'Not Executed' },
};

export const SEVERITY_COLORS = {
  CRITICAL: { hex: 'f43f5e', label: 'Critical' },
  HIGH: { hex: 'f97316', label: 'High' },
  MEDIUM: { hex: 'eab308', label: 'Medium' },
  LOW: { hex: '06b6d4', label: 'Low' },
};

export const PRIORITY_COLORS = {
  HIGH: { hex: 'ef4444', label: 'High' },
  MEDIUM: { hex: 'eab308', label: 'Medium' },
  LOW: { hex: '06b6d4', label: 'Low' },
};

export const CHART_COLORS = {
  pass: '#10b981',
  fail: '#ef4444',
  blocked: '#f97316',
  notExec: '#64748b',
  critical: '#f43f5e',
  high: '#f97316',
  medium: '#eab308',
  low: '#06b6d4',
};

export const PAGE_SIZE = 20;
