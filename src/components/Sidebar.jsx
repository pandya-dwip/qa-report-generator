import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, RotateCcw,
  ClipboardList, CheckCircle2, XCircle, Ban, CircleDashed,
  TrendingUp, BarChart2, Trash2, RefreshCw,
} from 'lucide-react';
import { computeStats } from '../services/chartService';

function isValidFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel', 'text/csv', 'application/csv',
  ];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return validTypes.includes(file.type) || ['.xlsx', '.xls', '.csv'].includes(ext);
}

const KPI_ROWS = [
  { key: 'total',   label: 'Total Cases',  accent: '#0284c7', Icon: ClipboardList },
  { key: 'pass',    label: 'Passed',       accent: '#059669', Icon: CheckCircle2  },
  { key: 'fail',    label: 'Failed',       accent: '#dc2626', Icon: XCircle       },
  { key: 'blocked', label: 'Blocked',      accent: '#ea580c', Icon: Ban           },
  { key: 'notExec', label: 'Not Executed', accent: '#94a3b8', Icon: CircleDashed  },
];

function CompactUpload({ onFile, isLoading }) {
  const [dragging, setDragging] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!isValidFile(file)) { setErr('Use .xlsx, .xls or .csv'); return; }
    setErr('');
    onFile(file);
  }, [onFile]);

  return (
    <div
      onClick={() => !isLoading && inputRef.current?.click()}
      onDrop={e => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      style={{
        border: `1.5px dashed ${dragging ? 'var(--accent-cyan)' : err ? 'var(--accent-red)' : 'var(--border-hover)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '22px 16px',
        textAlign: 'center',
        cursor: isLoading ? 'wait' : 'pointer',
        background: dragging ? 'var(--accent-cyan-dim)' : err ? 'var(--accent-red-dim)' : 'var(--bg-app)',
        transition: 'all 0.2s',
      }}
    >
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv"
        onChange={e => processFile(e.target.files[0])} style={{ display: 'none' }} />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Parsing…</p>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              animate={{ scale: dragging ? 1.12 : 1 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}
            >
              <Upload size={32} strokeWidth={1.5} color={dragging ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
            </motion.div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {dragging ? 'Drop here' : 'Upload QA Sheet'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
              Click or drag & drop
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
              {['.xlsx', '.xls', '.csv'].map(ext => (
                <span key={ext} style={{
                  padding: '2px 8px', borderRadius: 5, fontSize: 10,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontFamily: 'DM Mono',
                }}>{ext}</span>
              ))}
            </div>
            {err && (
              <p style={{ color: 'var(--accent-red)', fontSize: 11, marginTop: 8 }}>⚠ {err}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Sidebar({
  data,
  fileName,
  isLoading,
  onFile,
  onReset,
  activeHistoryId,
  reports = [],
  onSelectReport,
  onDeleteReport,
  syncStatus = 'idle',
  onSync,
}) {
  const stats = data ? computeStats(data) : null;
  const passRate = stats ? parseFloat(stats.passRate) : 0;
  const totalForBar = stats ? stats.total : 1;

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      flexShrink: 0,
      height: '100%',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
    }}>

      {/* ── Upload / File Info ─────────────────── */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {data ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '10px 12px', borderRadius: 'var(--r-md)',
              background: 'var(--bg-app)', border: '1px solid var(--border)', marginBottom: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileSpreadsheet size={18} color="#ffffff" strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{fileName}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {data.length} cases{activeHistoryId ? ' · Saved' : ''}
                </p>
              </div>
            </div>

            {/* Sync status section */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 12px', borderRadius: 'var(--r-md)',
              background: syncStatus === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-app)',
              border: `1.5px solid ${syncStatus === 'error' ? 'var(--accent-red)' : 'var(--border)'}`,
              marginBottom: 10, fontSize: 11.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw
                  size={12}
                  style={{
                    animation: syncStatus === 'syncing' ? 'spin 1.5s linear infinite' : 'none',
                    color: syncStatus === 'synced' ? '#10b981' : syncStatus === 'error' ? '#ef4444' : 'var(--text-muted)'
                  }}
                />
                <span style={{
                  color: syncStatus === 'synced' ? '#10b981' : syncStatus === 'error' ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: 500
                }}>
                  {syncStatus === 'syncing' && 'Syncing...'}
                  {syncStatus === 'synced' && 'Synced to Files/'}
                  {syncStatus === 'error' && 'Sync failed'}
                  {syncStatus === 'idle' && 'Not synced'}
                </span>
              </div>
              {syncStatus !== 'syncing' && (
                <button
                  onClick={onSync}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--accent-cyan)',
                    fontWeight: 600, fontSize: 11, cursor: 'pointer', padding: '2px 4px',
                    borderRadius: 4, transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  Sync Now
                </button>
              )}
            </div>
            <button
              onClick={onReset}
              style={{
                width: '100%', padding: '7px', borderRadius: 'var(--r-md)',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
                transition: 'all 0.15s', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <RotateCcw size={13} strokeWidth={2} /> Change File
            </button>
          </motion.div>
        ) : (
          <CompactUpload onFile={onFile} isLoading={isLoading} />
        )}
      </div>

      {/* ── Saved Sheets ──────────────────────── */}
      {!data && (
        <div style={{
          borderBottom: '1px solid var(--border)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          flex: '1 1 auto',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}>
            <h3 style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'DM Mono',
            }}>
              Saved Sheets ({reports.length})
            </h3>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginRight: '-8px',
            paddingRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {reports.length > 0 ? (
              reports.map(item => {
                const isActive = item.id === activeHistoryId;
                const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectReport(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--r-md)',
                      background: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                      }
                      const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                      if (deleteBtn) deleteBtn.style.opacity = '1';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }
                      const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                      if (deleteBtn) deleteBtn.style.opacity = '0';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                        background: isActive ? 'linear-gradient(135deg,#0ea5e9,#7c3aed)' : 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FileSpreadsheet size={14} color={isActive ? '#ffffff' : 'var(--text-secondary)'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>{item.fileName}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                          {item.data?.length || 0} cases · {formattedDate}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(item.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: 4,
                        borderRadius: 4,
                        cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 0.15s, color 0.15s, background-color 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--accent-red)';
                        e.currentTarget.style.background = 'var(--accent-red-dim)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '16px 0',
                color: 'var(--text-muted)',
                fontSize: 11.5,
                border: '1.5px dashed var(--border)',
                borderRadius: 'var(--r-md)',
              }}>
                No saved sheets in system
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── KPI Summary ───────────────────────── */}
      {stats && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

          {/* Pass Rate bar */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'DM Mono', display: 'flex', alignItems: 'center', gap: 5 }}>
                <TrendingUp size={12} strokeWidth={2} /> Pass Rate
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: passRate >= 70 ? 'var(--accent-green)' : passRate >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)', fontFamily: 'Syne' }}>
                {stats.passRate}%
              </span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(passRate, 100)}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: '100%', borderRadius: 4,
                  background: passRate >= 70 ? 'linear-gradient(90deg,#059669,#10b981)' : passRate >= 40 ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'linear-gradient(90deg,#dc2626,#ef4444)',
                }}
              />
            </div>
          </div>

          {/* KPI rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {KPI_ROWS.map((kpi, i) => {
              const val = stats[kpi.key];
              const pct = totalForBar > 0 ? Math.round((val / totalForBar) * 100) : 0;
              return (
                <motion.div
                  key={kpi.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '9px 10px', borderRadius: 'var(--r-md)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-app)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ marginRight: 10, flexShrink: 0, display: 'flex', color: kpi.accent }}>
                    <kpi.Icon size={15} strokeWidth={1.75} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{kpi.label}</p>
                    <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 + 0.2 }}
                        style={{ height: '100%', borderRadius: 2, background: kpi.accent }}
                      />
                    </div>
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: 800, color: kpi.accent,
                    fontFamily: 'Syne', marginLeft: 12, flexShrink: 0, minWidth: 28, textAlign: 'right',
                  }}>{val}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Fail rate footnote */}
          <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>Fail Rate</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', fontFamily: 'DM Mono' }}>
                {stats.failRate}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state (no data) ─────────────── */}
      {!stats && (
        <div style={{ flexShrink: 0, padding: '20px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, opacity: 0.3 }}>
            <BarChart2 size={24} strokeWidth={1.5} color="var(--text-secondary)" />
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Select a saved sheet or upload a new one to see summary analytics
          </p>
        </div>
      )}

      {/* ── Bottom badge ──────────────────────── */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent-green)', boxShadow: '0 0 0 2px rgba(5,150,105,0.25)',
        }} />
        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'DM Mono', letterSpacing: '0.02em' }}>
          100% client‑side · No server
        </span>
      </div>
    </aside>
  );
}
