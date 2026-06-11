import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateExcelReport } from '../services/excelService';

export default function HistoryPage({ reports, onEdit, onDelete, onRename, onToast }) {
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');

  const handleExport = async (report, isGoogleSheets = false) => {
    try {
      const msg = isGoogleSheets ? 'Generating Google Sheet optimized file...' : 'Generating Excel file...';
      onToast?.(msg, 'info');
      await generateExcelReport(report.data, null, isGoogleSheets, report.fileName);
      onToast?.('File downloaded successfully!', 'success');
    } catch (err) {
      onToast?.(err.message || 'Failed to export report.', 'error');
    }
  };

  const handleSaveRename = (id) => {
    if (!tempName.trim()) return;
    onRename?.(id, tempName.trim());
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', marginBottom: 6 }}>
          Report History
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Access, edit, and export previously uploaded QA sheets stored securely in your browser.
        </p>
      </div>

      {reports.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
          padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 48 }}>📁</span>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>No Saved Sheets</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto' }}>
              Upload and load files in the Generator tab, and they will automatically be saved to your offline history database.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {reports.map((report) => (
            <motion.div
              key={report.id}
              layoutId={report.id}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', minHeight: 180, transition: 'border-color 0.2s',
              }}
              whileHover={{ borderColor: 'var(--border-hover)' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>📊</span>
                  <div style={{
                    fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text-muted)',
                    background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4,
                  }}>
                    {report.data.length} Cases
                  </div>
                </div>
                {editingId === report.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(report.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      style={{
                        flex: 1,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: 6,
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        padding: '4px 8px',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleSaveRename(report.id)}
                      style={{
                        background: 'var(--accent-green)',
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        color: 'var(--text-secondary)',
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <h4 style={{
                      fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                      wordBreak: 'break-all', overflow: 'hidden',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      flex: 1,
                    }}>
                      {report.fileName}
                    </h4>
                    <button
                      onClick={() => {
                        setEditingId(report.id);
                        setTempName(report.fileName);
                      }}
                      title="Rename report"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        transition: 'color 0.2s, background-color 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--accent-cyan)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Instrument Sans, sans-serif' }}>
                  Saved: {new Date(report.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, borderTop: '1px solid var(--border)',
                paddingTop: 16,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onEdit(report)}
                    style={{
                      flex: 1, background: 'var(--accent-purple)', border: 'none', borderRadius: 8,
                      padding: '8px 12px', color: '#fff', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    📝 Edit
                  </button>
                  <button
                    onClick={() => onDelete(report.id)}
                    style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8,
                      padding: '8px 12px', color: 'var(--accent-red)', fontSize: 12,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255,59,92,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255,59,92,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleExport(report, false)}
                    style={{
                      flex: 1, background: 'var(--accent-cyan)', border: 'none', borderRadius: 8,
                      padding: '8px 12px', color: '#ffffff', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    📥 Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport(report, true)}
                    style={{
                      flex: 1, background: 'linear-gradient(135deg, #0f9d58, #1f804f)', border: 'none', borderRadius: 8,
                      padding: '8px 12px', color: '#ffffff', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    📊 Google Sheet
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
