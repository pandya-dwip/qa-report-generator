import { AnimatePresence, motion } from 'framer-motion';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
const COLORS = {
  success: 'rgba(16,185,129,0.12)', error: 'rgba(239,68,68,0.12)',
  info: 'rgba(14,165,233,0.1)', warning: 'rgba(249,115,22,0.12)',
};
const BORDERS = {
  success: 'rgba(16,185,129,0.25)', error: 'rgba(239,68,68,0.25)',
  info: 'rgba(14,165,233,0.2)', warning: 'rgba(249,115,22,0.25)',
};

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380,
    }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ x: 110, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 110, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              background: COLORS[toast.type] || COLORS.info,
              border: `1px solid ${BORDERS[toast.type] || BORDERS.info}`,
              backdropFilter: 'blur(12px)',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{ICONS[toast.type]}</span>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>
              {toast.message}
            </p>
            <button
              onClick={() => onRemove(toast.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0,
              }}
            >×</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
