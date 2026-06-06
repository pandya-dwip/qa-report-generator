import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import UploadBox from './components/UploadBox';
import ValidationAlert from './components/ValidationAlert';
import DashboardCards from './components/DashboardCards';
import ChartsSection from './components/ChartsSection';
import FilePreview from './components/FilePreview';
import ExportButton from './components/ExportButton';
import ToastContainer from './components/ToastContainer';
import HistoryPage from './components/HistoryPage';
import { parseFile } from './utils/fileParser';
import { useToast } from './hooks/useToast';
import { saveReport, getAllReports, updateReport, deleteReport, renameReport } from './utils/historyDb';

const Section = ({ title, icon, children }) => (
  <div>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 8 }} />
      </div>
    )}
    {children}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [reports, setReports] = useState([]);
  const { toasts, addToast, removeToast } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      const all = await getAllReports();
      setReports(all);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFile = useCallback(async (file) => {
    setIsLoading(true);
    setValidationError(null);
    try {
      const result = await parseFile(file);
      if (!result.valid) {
        setValidationError(result.missing);
        setData(null);
        addToast('Missing required columns. Please check your file.', 'error');
      } else {
        setData(result.data);
        setFileName(file.name);
        
        // Save to IndexedDB history
        const savedId = await saveReport(file.name, result.data);
        setActiveHistoryId(savedId);
        fetchReports();

        addToast('Loaded & saved ' + result.data.length + ' test cases from "' + file.name + '"', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to parse file.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, fetchReports]);

  const handleUpdateRow = useCallback(async (index, updatedRow) => {
    if (!data) return;
    const newData = [...data];
    newData[index] = updatedRow;
    setData(newData);

    if (activeHistoryId) {
      try {
        await updateReport(activeHistoryId, newData);
        fetchReports(); // Update timestamp in UI
      } catch (err) {
        console.error('Failed to auto-save changes:', err);
      }
    }
  }, [data, activeHistoryId, fetchReports]);

  const handleMergeFile = useCallback(async (file) => {
    if (!data) return;
    setIsLoading(true);
    try {
      const result = await parseFile(file);
      if (!result.valid) {
        addToast('Merge failed: New file missing required columns.', 'error');
        return;
      }

      const incoming = result.data;
      const mergedData = [...data];
      let updatedCount = 0;
      let addedCount = 0;

      incoming.forEach((newRow) => {
        const newId = newRow['Test Case ID']?.toString().trim().toLowerCase();
        if (!newId) {
          // If no test case ID, append it
          mergedData.push(newRow);
          addedCount++;
          return;
        }

        const matchIdx = mergedData.findIndex(
          (row) => row['Test Case ID']?.toString().trim().toLowerCase() === newId
        );

        if (matchIdx !== -1) {
          mergedData[matchIdx] = {
            ...mergedData[matchIdx],
            ...newRow,
            'Sr No': mergedData[matchIdx]['Sr No'], // keep original Sr No
          };
          updatedCount++;
        } else {
          mergedData.push(newRow);
          addedCount++;
        }
      });

      // Re-index Sr No sequentially
      mergedData.forEach((row, idx) => {
        row['Sr No'] = (idx + 1).toString();
      });

      setData(mergedData);

      if (activeHistoryId) {
        await updateReport(activeHistoryId, mergedData);
        fetchReports();
      }

      addToast(`Merged successfully! ${updatedCount} rows updated, ${addedCount} rows added.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to merge file.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [data, activeHistoryId, addToast, fetchReports]);

  const handleEditHistoryItem = useCallback((item) => {
    setData(item.data);
    setFileName(item.fileName);
    setActiveHistoryId(item.id);
    setActiveTab('generator');
    addToast('Loaded "' + item.fileName + '" for editing.', 'info');
  }, [addToast]);

  const handleDeleteHistoryItem = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this report from your history?')) {
      try {
        await deleteReport(id);
        fetchReports();
        if (activeHistoryId === id) {
          setData(null);
          setFileName('');
          setActiveHistoryId(null);
        }
        addToast('Report deleted from history.', 'success');
      } catch (err) {
        addToast('Failed to delete: ' + err.message, 'error');
      }
    }
  }, [activeHistoryId, fetchReports, addToast]);

  const handleRenameHistoryItem = useCallback(async (id, newName) => {
    try {
      await renameReport(id, newName);
      await fetchReports();
      addToast('Report renamed to "' + newName + '"', 'success');
      if (activeHistoryId === id) {
        setFileName(newName);
      }
    } catch (err) {
      addToast('Failed to rename: ' + err.message, 'error');
    }
  }, [activeHistoryId, fetchReports, addToast]);

  const handleReset = () => {
    setData(null);
    setFileName('');
    setValidationError(null);
    setActiveHistoryId(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header hasData={!!data} activeTab={activeTab} setActiveTab={setActiveTab} historyCount={reports.length} />
      <main style={{ maxWidth: '100%', margin: '0 auto', padding: '32px 40px 80px' }}>

        <AnimatePresence mode="wait">
          {activeTab === 'generator' ? (
            <motion.div
              key="generator-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
            >
              <div style={{ textAlign: 'center', marginBottom: 20, paddingTop: 16 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
                  borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-card)',
                  marginBottom: 20, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
                  100% client-side · No backend · Offline database saved
                </div>
                <h1 style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--text-primary)',
                  lineHeight: 1.1, marginBottom: 14,
                }}>
                  QA Report{' '}
                  <span style={{
                    background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>Generator</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
                  Transform your QA test case sheets into professional Excel reports with dashboards, charts, and rich formatting — in seconds.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: data ? '1fr 340px' : '1fr',
                gap: 24, alignItems: 'start',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  <Section>
                    <AnimatePresence>
                      {validationError && (
                        <motion.div key="valerr" style={{ marginBottom: 16 }}>
                          <ValidationAlert missing={validationError} onDismiss={() => setValidationError(null)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!data ? (
                      <UploadBox onFile={handleFile} isLoading={isLoading} />
                    ) : (
                      <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 12, padding: '14px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>📊</span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{fileName}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {data.length} rows loaded {activeHistoryId && '· Stored in history'}
                            </p>
                          </div>
                        </div>
                        <button onClick={handleReset} style={{
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          borderRadius: 8, padding: '6px 14px', color: 'var(--text-secondary)',
                          fontSize: 12, cursor: 'pointer',
                        }}>
                          ↺ Change File
                        </button>
                      </div>
                    )}
                  </Section>

                  {data && (
                    <>
                      <Section title="Execution Summary" icon="📊">
                        <DashboardCards data={data} />
                      </Section>
                      <Section title="Analytics" icon="📈">
                        <ChartsSection data={data} />
                      </Section>
                      <Section title="Data Preview" icon="🔍">
                        <FilePreview
                          data={data}
                          fileName={fileName}
                          onUpdateRow={handleUpdateRow}
                          onMergeFile={handleMergeFile}
                        />
                      </Section>
                    </>
                  )}
                </div>

                {data && (
                  <div style={{ position: 'sticky', top: 24 }}>
                    <div style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 16, padding: '24px 20px',
                    }}>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
                        Export Report
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                        Generate a professional Excel report with formulas and charts.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                        {[
                          { icon: '📊', label: 'Dashboard', desc: 'KPIs + Module breakdown' },
                          { icon: '📋', label: 'Project Details', desc: 'Summary & editable fields' },
                          { icon: '🧪', label: 'Test Cases', desc: 'All rows with formatting' },
                          { icon: '📈', label: 'Summary', desc: 'Module-wise stats table' },
                        ].map(s => (
                          <div key={s.label} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 8,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          }}>
                            <span style={{ fontSize: 14 }}>{s.icon}</span>
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</p>
                              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <ExportButton
                        data={data}
                        onSuccess={() => addToast('Report downloaded successfully!', 'success')}
                        onError={(msg) => addToast('Export failed: ' + msg, 'error')}
                      />
                    </div>
                    <div style={{
                      marginTop: 14, padding: '14px 16px',
                      background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 12,
                    }}>
                      <p style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: 4 }}>💡 Tip</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Modifying cell values (statuses, severities, comments) in the Data Preview above will auto-save the changes locally.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!data && !isLoading && (
                <div style={{ marginTop: 40, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Expected: Sr No · Module · Test Case ID · Test Type · Test Scenario · Simplified Test Scenario · Test Steps · Expected Result · Actual Result · Priority · Severity · Status · Tested By · Execution Date · Defect No. · Defect ID · QA Comments
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <HistoryPage
                reports={reports}
                onEdit={handleEditHistoryItem}
                onDelete={handleDeleteHistoryItem}
                onRename={handleRenameHistoryItem}
                onToast={addToast}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
