import { motion } from 'framer-motion';

export default function Header({ hasData, activeTab, setActiveTab, historyCount = 0 }) {
  return (
    <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🧪</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                QA<span style={{ color: 'var(--accent-cyan)' }}>Report</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>
                GENERATOR v2.0
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-primary)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveTab('generator')}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'generator' ? 600 : 500,
                color: activeTab === 'generator' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: activeTab === 'generator' ? 'var(--bg-secondary)' : 'transparent',
                border: activeTab === 'generator' ? '1px solid var(--border)' : '1px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
            >
              🧪 Generator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'history' ? 600 : 500,
                color: activeTab === 'history' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: activeTab === 'history' ? 'var(--bg-secondary)' : 'transparent',
                border: activeTab === 'history' ? '1px solid var(--border)' : '1px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
            >
              📁 History
              {historyCount > 0 && (
                <span style={{
                  fontSize: 10, background: activeTab === 'history' ? 'var(--accent-cyan)' : 'var(--border-hover)',
                  color: activeTab === 'history' ? '#ffffff' : 'var(--text-primary)',
                  padding: '1px 6px', borderRadius: 10, fontWeight: 700, marginLeft: 4,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {historyCount}
                </span>
              )}
            </button>
          </div>

          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: hasData ? 'var(--accent-green)' : 'var(--text-muted)',
                boxShadow: hasData ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
              }} />
              {hasData ? 'Data Loaded' : 'Awaiting Upload'}
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 6,
              border: '1px solid var(--border)',
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'DM Mono, monospace',
            }}>
              Offline · Secure
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
