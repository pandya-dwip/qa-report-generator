import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ValidationAlert({ missing, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      style={{
        background: 'var(--accent-red-dim)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: 'var(--r-lg)',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} strokeWidth={2} color="var(--accent-red)" />
            <h4 style={{ color: 'var(--accent-red)', fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 }}>
              Missing Required Columns
            </h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
            The uploaded file is missing {missing.length} required column{missing.length > 1 ? 's' : ''}. Please check your file and try again.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {missing.map(col => (
              <span key={col} style={{
                padding: '3px 10px', borderRadius: 5, fontSize: 11,
                background: 'rgba(220,38,38,0.1)', color: 'var(--accent-red)',
                border: '1px solid rgba(220,38,38,0.2)',
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
            color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center',
            borderRadius: 6, transition: 'background 0.15s', marginLeft: 12, flexShrink: 0,
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
