import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const TOAST_CONFIG = {
  success: { Icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.10)', border: 'rgba(5,150,105,0.22)' },
  error:   { Icon: XCircle,      color: '#dc2626', bg: 'rgba(220,38,38,0.09)', border: 'rgba(220,38,38,0.22)' },
  info:    { Icon: Info,         color: '#0284c7', bg: 'rgba(2,132,199,0.08)', border: 'rgba(2,132,199,0.20)' },
  warning: { Icon: AlertTriangle, color: '#d97706', bg: 'rgba(217,119,6,0.09)', border: 'rgba(217,119,6,0.22)' },
};

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380,
    }}>
      <AnimatePresence>
        {toasts.map(toast => {
          const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--r-md)',
                padding: '11px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <cfg.Icon size={16} strokeWidth={2} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.45, flex: 1 }}>
                {toast.message}
              </p>
              <button
                onClick={() => onRemove(toast.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center',
                }}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
