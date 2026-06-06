import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadBox({ onFile, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragError('');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isValidFile(file)) {
      setDragError('Please upload a .xlsx, .xls, or .csv file.');
      return;
    }
    onFile(file);
  }, [onFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isValidFile(file)) {
      setDragError('Please upload a .xlsx, .xls, or .csv file.');
      return;
    }
    setDragError('');
    onFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${isDragging ? 'var(--accent-cyan)' : dragError ? 'var(--accent-red)' : 'var(--border-hover)'}`,
          borderRadius: 16,
          padding: '52px 32px',
          textAlign: 'center',
          cursor: isLoading ? 'wait' : 'pointer',
          background: isDragging ? 'rgba(0,212,255,0.04)' : dragError ? 'rgba(255,59,92,0.03)' : 'var(--bg-card)',
          transition: 'all 0.25s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'radial-gradient(circle at 50% 50%, #00d4ff 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>⚙️</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Parsing file...</p>
            </motion.div>
          ) : (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                style={{ fontSize: 48, marginBottom: 20, display: 'inline-block' }}
              >
                📂
              </motion.div>

              <h3 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18,
                color: 'var(--text-primary)', marginBottom: 8,
              }}>
                {isDragging ? 'Drop your file here' : 'Upload QA Test Cases'}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                Drag & drop or click to browse
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {['.xlsx', '.xls', '.csv'].map(ext => (
                  <span key={ext} style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 11,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace',
                  }}>{ext}</span>
                ))}
              </div>

              {dragError && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: 'var(--accent-red)', fontSize: 12, marginTop: 16 }}
                >
                  ⚠️ {dragError}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
        All processing happens locally in your browser. No data is sent to any server.
      </p>
    </motion.div>
  );
}

function isValidFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel', 'text/csv', 'application/csv',
  ];
  const validExts = ['.xlsx', '.xls', '.csv'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return validTypes.includes(file.type) || validExts.includes(ext);
}
