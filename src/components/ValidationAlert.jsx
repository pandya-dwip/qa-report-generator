import { motion } from 'framer-motion';

export default function ValidationAlert({ missing, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      style={{
        background: 'rgba(255,59,92,0.07)',
        border: '1px solid rgba(255,59,92,0.25)',
        borderRadius: 12,
        padding: '20px 24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <h4 style={{ color: 'var(--accent-red)', fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700 }}>
              Missing Required Columns
            </h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 14 }}>
            The uploaded file is missing {missing.length} required column{missing.length > 1 ? 's' : ''}. Please check your file and try again.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {missing.map(col => (
              <span key={col} style={{
                padding: '4px 10px', borderRadius: 5, fontSize: 11,
                background: 'rgba(255,59,92,0.12)', color: 'var(--accent-red)',
                border: '1px solid rgba(255,59,92,0.2)',
                fontFamily: 'DM Mono, monospace',
              }}>
                {col}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: 4,
          }}
        >×</button>
      </div>
    </motion.div>
  );
}
