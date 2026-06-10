import { CHART_COLORS } from '../constants';
import {
  normalizeStatus, normalizeSeverity, normalizePriority, parseDateToYYYYMMDD
} from './validationService';

export function computeStats(data) {
  const total = data.length;
  let pass = 0, fail = 0, blocked = 0, notExec = 0;

  data.forEach(row => {
    const s = normalizeStatus(row['Status']);
    if (s === 'PASS') pass++;
    else if (s === 'FAIL') fail++;
    else if (s === 'BLOCKED') blocked++;
    else notExec++;
  });

  return {
    total,
    pass,
    fail,
    blocked,
    notExec,
    passRate: total > 0 ? ((pass / total) * 100).toFixed(1) : '0.0',
    failRate: total > 0 ? ((fail / total) * 100).toFixed(1) : '0.0',
  };
}

export function getStatusChartData(data) {
  const s = computeStats(data);
  return {
    labels: ['Pass', 'Fail', 'Blocked', 'Not Executed'],
    datasets: [{
      data: [s.pass, s.fail, s.blocked, s.notExec],
      backgroundColor: [
        'rgba(16,185,129,0.75)', 'rgba(239,68,68,0.75)',
        'rgba(249,115,22,0.75)', 'rgba(100,116,139,0.6)'
      ],
      borderColor: [
        '#10b981', '#ef4444', '#f97316', '#64748b'
      ],
      borderWidth: 1.5,
    }]
  };
}

export function getModuleChartData(data) {
  const moduleMap = {};
  data.forEach(row => {
    const mod = row['Module'] || 'Unknown';
    if (!moduleMap[mod]) moduleMap[mod] = { pass: 0, fail: 0, blocked: 0 };
    const s = normalizeStatus(row['Status']);
    if (s === 'PASS') moduleMap[mod].pass++;
    else if (s === 'FAIL') moduleMap[mod].fail++;
    else if (s === 'BLOCKED') moduleMap[mod].blocked++;
  });

  const labels = Object.keys(moduleMap).slice(0, 10);
  return {
    labels,
    datasets: [
      {
        label: 'Pass',
        data: labels.map(l => moduleMap[l].pass),
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: '#10b981', borderWidth: 1,
      },
      {
        label: 'Fail',
        data: labels.map(l => moduleMap[l].fail),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: '#ef4444', borderWidth: 1,
      },
      {
        label: 'Blocked',
        data: labels.map(l => moduleMap[l].blocked),
        backgroundColor: 'rgba(249,115,22,0.7)',
        borderColor: '#f97316', borderWidth: 1,
      },
    ]
  };
}

export function getSeverityChartData(data) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  data.forEach(row => {
    const s = normalizeSeverity(row['Severity']);
    counts[s] = (counts[s] || 0) + 1;
  });
  return {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [counts.CRITICAL, counts.HIGH, counts.MEDIUM, counts.LOW],
      backgroundColor: [
        'rgba(244,63,94,0.75)', 'rgba(249,115,22,0.75)',
        'rgba(234,179,8,0.75)', 'rgba(6,182,212,0.75)'
      ],
      borderColor: ['#f43f5e', '#f97316', '#eab308', '#06b6d4'],
      borderWidth: 1.5,
    }]
  };
}

export function getPriorityChartData(data) {
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  data.forEach(row => {
    const p = normalizePriority(row['Priority']);
    counts[p] = (counts[p] || 0) + 1;
  });
  return {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [counts.HIGH, counts.MEDIUM, counts.LOW],
      backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(234,179,8,0.7)', 'rgba(6,182,212,0.7)'],
      borderColor: ['#ef4444', '#eab308', '#06b6d4'],
      borderWidth: 1.5,
    }]
  };
}

export function getDailyTrendData(data) {
  const dateMap = {};
  data.forEach(row => {
    const dateRaw = row['Execution Date'];
    const key = parseDateToYYYYMMDD(dateRaw);
    if (!key) return;

    if (!dateMap[key]) dateMap[key] = { pass: 0, fail: 0 };
    const s = normalizeStatus(row['Status']);
    if (s === 'PASS') dateMap[key].pass++;
    else if (s === 'FAIL') dateMap[key].fail++;
  });

  const sorted = Object.keys(dateMap).sort();
  return {
    labels: sorted,
    datasets: [
      {
        label: 'Pass', data: sorted.map(d => dateMap[d].pass),
        borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true, tension: 0.4, pointRadius: 4,
      },
      {
        label: 'Fail', data: sorted.map(d => dateMap[d].fail),
        borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',
        fill: true, tension: 0.4, pointRadius: 4,
      }
    ]
  };
}

