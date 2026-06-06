import { motion } from 'framer-motion';
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
  plugins: {
    legend: {
      labels: { color: '#475569', font: { family: 'DM Mono, monospace', size: 11 }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: '#0f172a', borderColor: '#e2e8f0', borderWidth: 1,
      titleColor: '#ffffff', bodyColor: '#94a3b8',
      titleFont: { family: 'Syne, sans-serif', size: 13 },
      bodyFont: { family: 'DM Mono, monospace', size: 11 },
      padding: 12,
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
      ticks: { color: '#475569', font: { family: 'DM Mono, monospace', size: 10 } },
      grid: { color: '#e2e8f0' },
    },
    y: {
      ticks: { color: '#475569', font: { family: 'DM Mono, monospace', size: 10 } },
      grid: { color: '#e2e8f0' },
    },
  },
  plugins: { ...BASE_OPTIONS.plugins, legend: { ...BASE_OPTIONS.plugins.legend, position: 'top' } },
};

function ChartCard({ title, children, span = 1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 24px',
        gridColumn: `span ${span}`,
      }}
    >
      <h4 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
        color: 'var(--text-secondary)', letterSpacing: '0.05em',
        textTransform: 'uppercase', marginBottom: 20,
      }}>
        {title}
      </h4>
      <div style={{ height: 240 }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function ChartsSection({ data }) {
  const statusData = getStatusChartData(data);
  const moduleData = getModuleChartData(data);
  const severityData = getSeverityChartData(data);
  const priorityData = getPriorityChartData(data);
  const trendData = getDailyTrendData(data);

  const hasTrendData = trendData.labels.length > 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14 }}>
      {/* Status Pie — 4 cols */}
      <div style={{ gridColumn: 'span 3' }}>
        <ChartCard title="Status Distribution">
          <Doughnut data={statusData} options={{ ...PIE_OPTIONS, cutout: '58%' }} />
        </ChartCard>
      </div>

      {/* Severity Pie — 3 cols */}
      <div style={{ gridColumn: 'span 3' }}>
        <ChartCard title="Severity Breakdown">
          <Pie data={severityData} options={PIE_OPTIONS} />
        </ChartCard>
      </div>

      {/* Priority Pie — 3 cols */}
      <div style={{ gridColumn: 'span 3' }}>
        <ChartCard title="Priority Breakdown">
          <Pie data={priorityData} options={PIE_OPTIONS} />
        </ChartCard>
      </div>

      {/* Module Bar — full width */}
      <div style={{ gridColumn: 'span 12' }}>
        <ChartCard title="Module-wise Execution" span={1}>
          <Bar data={moduleData} options={BAR_OPTIONS} />
        </ChartCard>
      </div>

      {/* Daily Trend — full width if data exists */}
      {hasTrendData && (
        <div style={{ gridColumn: 'span 12' }}>
          <ChartCard title="Daily Execution Trend">
            <Line data={trendData} options={BAR_OPTIONS} />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
