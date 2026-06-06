import { motion } from 'framer-motion';
import { computeStats } from '../services/chartService';

const CARDS = [
  { key: 'total', label: 'Total Cases', icon: '📋', color: 'var(--accent-cyan)', desc: 'All test cases' },
  { key: 'pass', label: 'Passed', icon: '✅', color: 'var(--accent-green)', desc: 'Successful' },
  { key: 'fail', label: 'Failed', icon: '❌', color: 'var(--accent-red)', desc: 'Failed tests' },
  { key: 'blocked', label: 'Blocked', icon: '🔒', color: 'var(--accent-orange)', desc: 'Blocked cases' },
  { key: 'notExec', label: 'Not Executed', icon: '⏸', color: 'var(--text-secondary)', desc: 'Pending' },
  { key: 'passRate', label: 'Pass Rate', icon: '📈', color: 'var(--accent-green)', desc: 'Success rate', suffix: '%' },
  { key: 'failRate', label: 'Fail Rate', icon: '📉', color: 'var(--accent-red)', desc: 'Failure rate', suffix: '%' },
];

export default function DashboardCards({ data }) {
  const stats = computeStats(data);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
      {CARDS.map((card, i) => {
        const value = stats[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '18px 16px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Top accent bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: card.color, opacity: 0.7,
            }} />

            <div style={{ fontSize: 22, marginBottom: 10 }}>{card.icon}</div>
            <div style={{
              fontSize: 26, fontWeight: 800, fontFamily: 'Syne, sans-serif',
              color: card.color, lineHeight: 1, marginBottom: 6,
            }}>
              {value}{card.suffix || ''}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {card.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
