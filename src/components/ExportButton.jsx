import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateExcelReport, generateTestCasesSheet } from '../services/excelService';

export default function ExportButton({ data, fileName, onSuccess, onError }) {
  const [state, setState] = useState('idle'); // idle | loading | done
  const [exportType, setExportType] = useState(null); // 'excel' | 'gsheets'
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');

  const handleExport = async (type) => {
    if (state === 'loading' || !data?.length) return;

    setState('loading');
    setExportType(type);
    setProgress(0);

    try {
      if (type === 'gsheets-tc') {
        await generateTestCasesSheet(data, (pct, msg) => {
          setProgress(pct);
          setProgressMsg(msg);
        }, fileName);
      } else {
        await generateExcelReport(data, (pct, msg) => {
          setProgress(pct);
          setProgressMsg(msg);
        }, type === 'gsheets', fileName);
      }
      setState('done');
      onSuccess?.();
      setTimeout(() => {
        setState('idle');
        setExportType(null);
      }, 3000);
    } catch (err) {
      setState('idle');
      setExportType(null);
      onError?.(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Excel Export Button */}
      <motion.button
        onClick={() => handleExport('excel')}
        disabled={state === 'loading' || !data?.length}
        whileHover={state === 'idle' && data?.length ? { scale: 1.02 } : {}}
        whileTap={state === 'idle' && data?.length ? { scale: 0.98 } : {}}
        style={{
          width: '100%',
          padding: '12px 20px',
          borderRadius: 10,
          border: !data?.length ? '1px solid var(--border)' : 'none',
          cursor: state === 'loading' || !data?.length ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.02em',
          background: state === 'done' && exportType === 'excel'
            ? 'linear-gradient(135deg, #00C853, #10b981)'
            : state === 'loading' && exportType === 'excel'
            ? 'var(--bg-secondary)'
            : !data?.length
            ? 'var(--bg-card)'
            : 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
          color: state === 'loading' && exportType === 'excel'
            ? 'var(--text-secondary)'
            : !data?.length
            ? 'var(--text-muted)'
            : '#fff',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {state === 'loading' && exportType === 'excel' && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(14,165,233,0.2), rgba(139,92,246,0.2))',
            transition: 'width 0.4s ease',
          }} />
        )}

        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {state === 'loading' && exportType === 'excel' ? (
            <>
              <span style={{ fontSize: 13 }}>⚙️</span>
              <span>{progressMsg || 'Generating...'}</span>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: 11,
                color: 'var(--accent-cyan)', marginLeft: 8,
              }}>{progress}%</span>
            </>
          ) : state === 'done' && exportType === 'excel' ? (
            <>✅ Excel Downloaded!</>
          ) : (
            <>📈 Export to Excel (.xlsx)</>
          )}
        </span>
      </motion.button>

      {/* Google Sheets Export Button */}
      <motion.button
        onClick={() => handleExport('gsheets')}
        disabled={state === 'loading' || !data?.length}
        whileHover={state === 'idle' && data?.length ? { scale: 1.02 } : {}}
        whileTap={state === 'idle' && data?.length ? { scale: 0.98 } : {}}
        style={{
          width: '100%',
          padding: '12px 20px',
          borderRadius: 10,
          border: !data?.length ? '1px solid var(--border)' : 'none',
          cursor: state === 'loading' || !data?.length ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.02em',
          background: state === 'done' && exportType === 'gsheets'
            ? 'linear-gradient(135deg, #00C853, #10b981)'
            : state === 'loading' && exportType === 'gsheets'
            ? 'var(--bg-secondary)'
            : !data?.length
            ? 'var(--bg-card)'
            : 'linear-gradient(135deg, #0f9d58, #1f804f)',
          color: state === 'loading' && exportType === 'gsheets'
            ? 'var(--text-secondary)'
            : !data?.length
            ? 'var(--text-muted)'
            : '#fff',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {state === 'loading' && exportType === 'gsheets' && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(15,157,88,0.2), rgba(31,128,79,0.2))',
            transition: 'width 0.4s ease',
          }} />
        )}

        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {state === 'loading' && exportType === 'gsheets' ? (
            <>
              <span style={{ fontSize: 13 }}>⚙️</span>
              <span>{progressMsg || 'Optimizing...'}</span>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: 11,
                color: '#fff', marginLeft: 8,
              }}>{progress}%</span>
            </>
          ) : state === 'done' && exportType === 'gsheets' ? (
            <>✅ Google Sheet Exported!</>
          ) : (
            <>📊 Export Google Sheet</>
          )}
        </span>
      </motion.button>

      {/* Google Sheets – Test Cases Only Button */}
      <motion.button
        onClick={() => handleExport('gsheets-tc')}
        disabled={state === 'loading' || !data?.length}
        whileHover={state === 'idle' && data?.length ? { scale: 1.02 } : {}}
        whileTap={state === 'idle' && data?.length ? { scale: 0.98 } : {}}
        style={{
          width: '100%',
          padding: '12px 20px',
          borderRadius: 10,
          border: !data?.length ? '1px solid var(--border)' : 'none',
          cursor: state === 'loading' || !data?.length ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.02em',
          background: state === 'done' && exportType === 'gsheets-tc'
            ? 'linear-gradient(135deg, #00C853, #10b981)'
            : state === 'loading' && exportType === 'gsheets-tc'
            ? 'var(--bg-secondary)'
            : !data?.length
            ? 'var(--bg-card)'
            : 'linear-gradient(135deg, #0891b2, #0e7490)',
          color: state === 'loading' && exportType === 'gsheets-tc'
            ? 'var(--text-secondary)'
            : !data?.length
            ? 'var(--text-muted)'
            : '#fff',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {state === 'loading' && exportType === 'gsheets-tc' && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(8,145,178,0.2), rgba(14,116,144,0.2))',
            transition: 'width 0.4s ease',
          }} />
        )}

        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {state === 'loading' && exportType === 'gsheets-tc' ? (
            <>
              <span style={{ fontSize: 13 }}>⚙️</span>
              <span>{progressMsg || 'Exporting...'}</span>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: 11,
                color: '#fff', marginLeft: 8,
              }}>{progress}%</span>
            </>
          ) : state === 'done' && exportType === 'gsheets-tc' ? (
            <>✅ Test Cases Exported!</>
          ) : (
            <>🧪 Export Test Cases (Google Sheet)</>
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {state === 'idle' && data?.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}
          >
            Exports are fully formatted with all formulas and totals.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
