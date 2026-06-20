import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, FolderOpen, Pencil, Trash2, FileDown, Table, Check, X } from 'lucide-react';
import { generateExcelReport } from '../services/excelService';

export default function HistoryPage({ reports, onEdit, onDelete, onRename, onToast }) {
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName]   = useState('');

  const handleExport = async (report, isGoogleSheets = false) => {
    try {
      onToast?.(isGoogleSheets ? 'Generating Google Sheet…' : 'Generating Excel…', 'info');
      await generateExcelReport(report.data, null, isGoogleSheets, report.fileName);
      onToast?.('Downloaded successfully!', 'success');
    } catch (err) {
      onToast?.(err.message || 'Export failed.', 'error');
    }
  };

  const saveRename = (id) => {
    if (!tempName.trim()) return;
    onRename?.(id, tempName.trim());
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ width: '100%' }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontFamily: 'Syne', fontWeight: 800, fontSize: 26,
          color: 'var(--text-primary)', marginBottom: 6,
        }}>
          Report History
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Browse, rename, edit, and export previously uploaded QA sheets — stored locally in your browser.
        </p>
      </div>

      {/* Empty state */}
      {reports.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', padding: '72px 24px', textAlign: 'center',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.3 }}>
            <FolderOpen size={52} strokeWidth={1.25} color="var(--text-secondary)" />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            No saved sheets yet
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            Switch to the Workspace tab, upload a file, and it will be automatically saved here.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 18,
        }}>
          <AnimatePresence>
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  boxShadow: 'var(--shadow-xs)', transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(14,165,233,0.25)',
                  }}>
                    <FileSpreadsheet size={20} color="#ffffff" strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingId === report.id ? (
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <input
                          type="text" value={tempName} autoFocus
                          onChange={e => setTempName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveRename(report.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          style={{
                            flex: 1, background: 'var(--bg-secondary)',
                            border: '1px solid var(--accent-cyan)', borderRadius: 'var(--r-sm)',
                            color: 'var(--text-primary)', fontSize: 13, padding: '4px 8px', outline: 'none',
                          }}
                        />
                        <button onClick={() => saveRename(report.id)} style={{
                          background: 'var(--accent-green)', border: 'none', borderRadius: 6,
                          color: '#fff', width: 26, height: 26, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => setEditingId(null)} style={{
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6,
                          color: 'var(--text-muted)', width: 26, height: 26, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                          <X size={13} strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <h4 style={{
                          fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)',
                          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{report.fileName}</h4>
                        <button
                          onClick={() => { setEditingId(report.id); setTempName(report.fileName); }}
                          title="Rename"
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', padding: 5, borderRadius: 5,
                            transition: 'all 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center',
                          }}
                          onMouseOver={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                          onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10.5, fontFamily: 'DM Mono', color: 'var(--text-muted)',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        padding: '2px 7px', borderRadius: 12,
                      }}>{report.data.length} cases</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(report.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button
                      onClick={() => onEdit(report)}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 'var(--r-md)',
                        background: 'var(--accent-purple)', border: 'none',
                        color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'opacity 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                      <Pencil size={13} strokeWidth={2} /> Open &amp; Edit
                    </button>
                    <button
                      onClick={() => onDelete(report.id)}
                      style={{
                        padding: '8px 12px', borderRadius: 'var(--r-md)',
                        background: 'var(--accent-red-dim)', border: '1px solid rgba(220,38,38,0.2)',
                        color: 'var(--accent-red)', fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.14)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'var(--accent-red-dim)'; }}
                      title="Delete from history"
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button
                      onClick={() => handleExport(report, false)}
                      style={{
                        flex: 1, padding: '7px 10px', borderRadius: 'var(--r-md)',
                        background: 'var(--accent-cyan-dim)', border: '1px solid rgba(2,132,199,0.2)',
                        color: 'var(--accent-cyan)', fontSize: 11.5, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: 'opacity 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                      onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                      <FileDown size={13} strokeWidth={2} /> Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => handleExport(report, true)}
                      style={{
                        flex: 1, padding: '7px 10px', borderRadius: 'var(--r-md)',
                        background: 'rgba(5,150,105,0.09)', border: '1px solid rgba(5,150,105,0.2)',
                        color: 'var(--accent-green)', fontSize: 11.5, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: 'opacity 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                      onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                      <Table size={13} strokeWidth={2} /> Google Sheets
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
