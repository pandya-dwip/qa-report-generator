import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TestTube2, Zap, FolderOpen, ShieldCheck, Download, ChevronDown,
  FileSpreadsheet, Table,
} from 'lucide-react';

export default function Header({
  hasData, activeTab, setActiveTab, historyCount = 0,
  data, onExcelExport, onGSheetsExport, exportState,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{
      height: 'var(--header-h)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 0,
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      zIndex: 200,
    }}>
      {/* ── Logo ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 24, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
        }}>
          <TestTube2 size={17} color="#ffffff" strokeWidth={2} />
        </div>
        <div>
          <div style={{
            fontFamily: 'Syne', fontWeight: 800, fontSize: 15.5,
            letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1,
          }}>
            QA<span style={{ color: 'var(--accent-cyan)' }}>Report</span>
          </div>
          <div style={{
            fontSize: 9, color: 'var(--text-muted)', fontFamily: 'DM Mono',
            letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1,
          }}>Generator · v2</div>
        </div>
      </div>

      {/* ── Divider ──────────────────────────── */}
      <div style={{ width: 1, height: 22, background: 'var(--border)', marginRight: 16, flexShrink: 0 }} />

      {/* ── Navigation ───────────────────────── */}
      <nav style={{ display: 'flex', gap: 3 }}>
        {[
          { id: 'generator', label: 'Workspace', Icon: Zap },
          { id: 'history',   label: 'History',   Icon: FolderOpen, count: historyCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              background: activeTab === tab.id ? 'var(--accent-cyan-dim)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(2,132,199,0.2)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s ease',
              fontFamily: 'Inter',
            }}
            onMouseOver={e => {
              if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
            onMouseOut={e => {
              if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
            }}
          >
            <tab.Icon size={14} strokeWidth={2} />
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                fontSize: 10,
                background: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--border-hover)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                padding: '1px 6px', borderRadius: 12, fontWeight: 700, lineHeight: 1.6,
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Spacer ───────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Status pill ──────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px', borderRadius: 20,
        background: hasData ? 'var(--accent-green-dim)' : 'var(--bg-secondary)',
        border: `1px solid ${hasData ? 'rgba(5,150,105,0.2)' : 'var(--border)'}`,
        marginRight: 10, flexShrink: 0,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: hasData ? 'var(--accent-green)' : 'var(--text-muted)',
          boxShadow: hasData ? '0 0 0 2px rgba(5,150,105,0.25)' : 'none',
          transition: 'all 0.3s',
        }} />
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: hasData ? 'var(--accent-green)' : 'var(--text-muted)',
        }}>
          {hasData ? 'Data loaded' : 'Ready'}
        </span>
      </div>

      {/* ── Export dropdown ──────────────────── */}
      {hasData && data?.length > 0 && (
        <div ref={dropRef} style={{ position: 'relative', marginRight: 10, flexShrink: 0 }}>
          <button
            onClick={() => exportState !== 'loading' && setExportOpen(o => !o)}
            disabled={exportState === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 15px',
              background: exportState === 'done'
                ? 'linear-gradient(135deg,#059669,#10b981)'
                : 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
              border: 'none', borderRadius: 'var(--r-md)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: exportState === 'loading' ? 'wait' : 'pointer',
              transition: 'opacity 0.2s, transform 0.15s',
              fontFamily: 'Syne',
              boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
              letterSpacing: '0.01em',
            }}
            onMouseOver={e => { if (exportState !== 'loading') e.currentTarget.style.opacity = '0.9'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {exportState === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                Exporting…
              </span>
            ) : exportState === 'done' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Downloaded!
              </span>
            ) : (
              <>
                <Download size={14} strokeWidth={2.5} />
                Export
                <ChevronDown size={12} strokeWidth={2.5} style={{ transition: 'transform 0.2s', transform: exportOpen ? 'rotate(180deg)' : 'none' }} />
              </>
            )}
          </button>

          <AnimatePresence>
            {exportOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)', padding: '6px',
                  minWidth: 220, boxShadow: 'var(--shadow-lg)', zIndex: 1000,
                }}
              >
                {[
                  {
                    label: 'Excel (.xlsx)', sub: 'Full report with formulas',
                    Icon: FileSpreadsheet, iconColor: '#0ea5e9',
                    iconBg: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
                    onClick: () => { onExcelExport?.(); setExportOpen(false); }
                  },
                  {
                    label: 'Google Sheets', sub: 'Optimized for Drive upload',
                    Icon: Table, iconColor: '#0f9d58',
                    iconBg: 'linear-gradient(135deg,#0f9d58,#1a7a47)',
                    onClick: () => { onGSheetsExport?.(); setExportOpen(false); }
                  },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={opt.onClick}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)',
                      background: 'transparent', border: 'none',
                      color: 'var(--text-primary)', fontSize: 13,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      textAlign: 'left', transition: 'background 0.12s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: opt.iconBg, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <opt.Icon size={16} color="#ffffff" strokeWidth={1.75} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Offline badge ─────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 'var(--r-sm)',
        border: '1px solid var(--border)',
        fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'DM Mono',
        flexShrink: 0, letterSpacing: '0.02em',
      }}>
        <ShieldCheck size={11} strokeWidth={2} />
        Offline
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}
