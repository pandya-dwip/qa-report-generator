import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, ChevronDown } from 'lucide-react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Filler, Title,
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  getStatusChartData, getModuleChartData,
  getSeverityChartData, getPriorityChartData, getDailyTrendData,
} from '../services/chartService';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Filler, Title
);

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  plugins: {
    legend: {
      labels: {
        color: '#475569',
        font: { family: 'DM Mono, monospace', size: 10 },
        boxWidth: 10, padding: 12, usePointStyle: true, pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155', borderWidth: 1,
      titleColor: '#f1f5f9', bodyColor: '#94a3b8',
      titleFont: { family: 'Syne, sans-serif', size: 12, weight: '700' },
      bodyFont:  { family: 'DM Mono, monospace', size: 11 },
      padding: 10, cornerRadius: 8,
    },
  },
};

const PIE_OPTIONS = {
  ...BASE_OPTIONS,
  plugins: { ...BASE_OPTIONS.plugins, legend: { ...BASE_OPTIONS.plugins.legend, position: 'bottom' } },
};

const BAR_OPTIONS = {
  ...BASE_OPTIONS,
  scales: {
    x: {
      ticks: {
        color: '#64748b', font: { family: 'DM Mono, monospace', size: 9.5 },
        autoSkip: true, maxRotation: 0, minRotation: 0,
        callback(value) {
          const label = this.getLabelForValue(value);
          return label.length > 16 ? label.slice(0, 14) + '…' : label;
        },
      },
      grid: { color: 'rgba(226,232,240,0.6)', drawBorder: false },
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'DM Mono, monospace', size: 9.5 } },
      grid: { color: 'rgba(226,232,240,0.6)', drawBorder: false },
      beginAtZero: true,
    },
  },
  plugins: { ...BASE_OPTIONS.plugins, legend: { ...BASE_OPTIONS.plugins.legend, position: 'top' } },
};

function ChartCard({ title, children, style }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '14px 16px',
      boxShadow: 'var(--shadow-xs)',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: 9.5, fontWeight: 500,
        color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10, flexShrink: 0,
      }}>{title}</p>
      <div style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

function ChevronIcon({ up }) {
  return (
    <ChevronDown size={14} strokeWidth={2.5}
      style={{ transition: 'transform 0.25s', transform: up ? 'rotate(180deg)' : 'none' }}
    />
  );
}

const CHART_H = 140; // chart canvas height in px

export default function ChartsSection({ data }) {
  const [collapsed, setCollapsed] = useState(false);

  const statusData   = getStatusChartData(data);
  const moduleData   = getModuleChartData(data);
  const severityData = getSeverityChartData(data);
  const priorityData = getPriorityChartData(data);
  const trendData    = getDailyTrendData(data);
  const hasTrend     = trendData.labels.length > 0;

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Section header with collapse toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: collapsed ? 0 : 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <BarChart2 size={15} strokeWidth={2} color="var(--text-secondary)" />
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Syne' }}>Analytics</span>
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)', padding: '4px 10px',
            cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          {collapsed ? 'Show charts' : 'Hide charts'}
          <ChevronIcon up={!collapsed} />
        </button>
      </div>

      {/* Charts content — animated collapse */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="charts"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Row 1: 3 circular charts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 10, marginBottom: 10,
            }}>
              <ChartCard title="Status Distribution" style={{ height: CHART_H + 60 }}>
                <Doughnut data={statusData} options={{ ...PIE_OPTIONS, cutout: '58%' }} />
              </ChartCard>
              <ChartCard title="Severity Breakdown" style={{ height: CHART_H + 60 }}>
                <Pie data={severityData} options={PIE_OPTIONS} />
              </ChartCard>
              <ChartCard title="Priority Distribution" style={{ height: CHART_H + 60 }}>
                <Pie data={priorityData} options={PIE_OPTIONS} />
              </ChartCard>
            </div>

            {/* Row 2: bar + trend side by side */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: hasTrend ? 'repeat(2, minmax(0, 1fr))' : '1fr',
              gap: 10,
            }}>
              <ChartCard title="Module-wise Execution" style={{ height: CHART_H + 54 }}>
                <Bar data={moduleData} options={BAR_OPTIONS} />
              </ChartCard>
              {hasTrend && (
                <ChartCard title="Daily Execution Trend" style={{ height: CHART_H + 54 }}>
                  <Line data={trendData} options={BAR_OPTIONS} />
                </ChartCard>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
