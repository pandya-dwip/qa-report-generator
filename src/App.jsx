import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TestTube2, BarChart2, Pencil, Download } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ValidationAlert from './components/ValidationAlert';
import ChartsSection from './components/ChartsSection';
import FilePreview from './components/FilePreview';
import ToastContainer from './components/ToastContainer';
import HistoryPage from './components/HistoryPage';
import { parseFile } from './utils/fileParser';
import { generateExcelReport } from './services/excelService';
import { useToast } from './hooks/useToast';
import { saveReport, getAllReports, updateReport, deleteReport, renameReport } from './utils/historyDb';

export default function App() {
  const [activeTab, setActiveTab]           = useState('generator');
  const [data, setData]                     = useState(null);
  const [fileName, setFileName]             = useState('');
  const [isLoading, setIsLoading]           = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [reports, setReports]               = useState([]);
  const [exportState, setExportState]       = useState('idle'); // 'idle' | 'loading' | 'done'
  const { toasts, addToast, removeToast }   = useToast();

  const fetchReports = useCallback(async () => {
    try { setReports(await getAllReports()); } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  /* ── File load ──────────────────────────────── */
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
        const savedId = await saveReport(file.name, result.data);
        setActiveHistoryId(savedId);
        fetchReports();
        addToast(`Loaded ${result.data.length} test cases from "${file.name}"`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to parse file.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, fetchReports]);

  /* ── Row updates ────────────────────────────── */
  const handleUpdateRow = useCallback(async (index, updatedRow) => {
    if (!data) return;
    const newData = [...data];
    newData[index] = updatedRow;
    setData(newData);
    if (activeHistoryId) {
      try { await updateReport(activeHistoryId, newData); fetchReports(); }
      catch (err) { console.error('Auto-save failed:', err); }
    }
  }, [data, activeHistoryId, fetchReports]);

  const handleUpdateRowsBulk = useCallback(async (updates) => {
    if (!data || !updates.length) return;
    const newData = [...data];
    updates.forEach(({ index, updatedRow }) => { newData[index] = updatedRow; });
    setData(newData);
    if (activeHistoryId) {
      try { await updateReport(activeHistoryId, newData); fetchReports(); }
      catch (err) { console.error('Auto-save failed:', err); }
    }
  }, [data, activeHistoryId, fetchReports]);

  /* ── Row deletion ───────────────────────────── */
  const reindex = (arr) => arr.map((row, i) => ({ ...row, 'Sr No': String(i + 1) }));

  const handleDeleteRow = useCallback(async (index) => {
    if (!data) return;
    const newData = reindex(data.filter((_, i) => i !== index));
    setData(newData);
    if (activeHistoryId) {
      try { await updateReport(activeHistoryId, newData); fetchReports(); addToast('Test case deleted.', 'success'); }
      catch (err) { console.error(err); }
    } else { addToast('Test case deleted.', 'success'); }
  }, [data, activeHistoryId, fetchReports, addToast]);

  const handleDeleteRowsBulk = useCallback(async (indices) => {
    if (!data || !indices.length) return;
    const newData = reindex(data.filter((_, i) => !indices.includes(i)));
    setData(newData);
    if (activeHistoryId) {
      try { await updateReport(activeHistoryId, newData); fetchReports(); addToast(`Deleted ${indices.length} test cases.`, 'success'); }
      catch (err) { console.error(err); }
    } else { addToast(`Deleted ${indices.length} test cases.`, 'success'); }
  }, [data, activeHistoryId, fetchReports, addToast]);

  /* ── Row addition ───────────────────────────── */
  const handleAddRow = useCallback(async (newRow, insertIndex) => {
    if (!data) return;
    const newData = reindex([...data.slice(0, insertIndex), newRow, ...data.slice(insertIndex)]);
    setData(newData);
    if (activeHistoryId) {
      try { await updateReport(activeHistoryId, newData); fetchReports(); addToast('Test case added.', 'success'); }
      catch (err) { console.error(err); }
    } else { addToast('Test case added.', 'success'); }
  }, [data, activeHistoryId, fetchReports, addToast]);

  /* ── Merge ──────────────────────────────────── */
  const handleMergeFile = useCallback(async (file) => {
    if (!data) return;
    setIsLoading(true);
    try {
      const result = await parseFile(file);
      if (!result.valid) { addToast('Merge failed: missing required columns.', 'error'); return; }
      const merged = [...data];
      let updated = 0, added = 0;
      result.data.forEach(row => {
        const id = row['Test Case ID']?.toString().trim().toLowerCase();
        if (!id) { merged.push(row); added++; return; }
        const idx = merged.findIndex(r => r['Test Case ID']?.toString().trim().toLowerCase() === id);
        if (idx !== -1) { merged[idx] = { ...merged[idx], ...row, 'Sr No': merged[idx]['Sr No'] }; updated++; }
        else { merged.push(row); added++; }
      });
      const newData = reindex(merged);
      setData(newData);
      if (activeHistoryId) { await updateReport(activeHistoryId, newData); fetchReports(); }
      addToast(`Merged: ${updated} updated, ${added} added.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to merge.', 'error');
    } finally { setIsLoading(false); }
  }, [data, activeHistoryId, addToast, fetchReports]);

  /* ── Export ─────────────────────────────────── */
  const doExport = useCallback(async (isGoogleSheets) => {
    if (!data?.length || exportState === 'loading') return;
    setExportState('loading');
    try {
      await generateExcelReport(data, null, isGoogleSheets, fileName);
      setExportState('done');
      addToast('Report downloaded successfully!', 'success');
      setTimeout(() => setExportState('idle'), 2800);
    } catch (err) {
      setExportState('idle');
      addToast('Export failed: ' + err.message, 'error');
    }
  }, [data, fileName, exportState, addToast]);

  const handleExcelExport   = useCallback(() => doExport(false), [doExport]);
  const handleGSheetsExport = useCallback(() => doExport(true),  [doExport]);

  /* ── History item actions ───────────────────── */
  const handleEditHistoryItem = useCallback((item) => {
    setData(item.data); setFileName(item.fileName);
    setActiveHistoryId(item.id); setActiveTab('generator');
    addToast(`Loaded "${item.fileName}" for editing.`, 'info');
  }, [addToast]);

  const handleDeleteHistoryItem = useCallback(async (id) => {
    if (confirm('Delete this report from history?')) {
      try {
        await deleteReport(id); fetchReports();
        if (activeHistoryId === id) { setData(null); setFileName(''); setActiveHistoryId(null); }
        addToast('Report deleted.', 'success');
      } catch (err) { addToast('Failed: ' + err.message, 'error'); }
    }
  }, [activeHistoryId, fetchReports, addToast]);

  const handleRenameHistoryItem = useCallback(async (id, newName) => {
    try {
      await renameReport(id, newName); await fetchReports();
      addToast(`Renamed to "${newName}"`, 'success');
      if (activeHistoryId === id) setFileName(newName);
    } catch (err) { addToast('Rename failed: ' + err.message, 'error'); }
  }, [activeHistoryId, fetchReports, addToast]);

  const handleReset = () => {
    setData(null); setFileName(''); setValidationError(null); setActiveHistoryId(null);
  };

  /* ── Render ──────────────────────────────────── */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <Header
        hasData={!!data}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={reports.length}
        data={data}
        onExcelExport={handleExcelExport}
        onGSheetsExport={handleGSheetsExport}
        exportState={exportState}
      />

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">

          {activeTab === 'generator' ? (
            <motion.div
              key="generator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}
            >
              {/* Sidebar */}
              <Sidebar
                data={data}
                fileName={fileName}
                isLoading={isLoading}
                onFile={handleFile}
                onReset={handleReset}
                activeHistoryId={activeHistoryId}
                reports={reports}
                onSelectReport={handleEditHistoryItem}
                onDeleteReport={handleDeleteHistoryItem}
              />

              {/* Main panel */}
              <div style={{
                flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
                overflow: 'hidden', padding: '16px 20px 16px 16px', gap: 12,
              }}>

                {/* Validation error */}
                <AnimatePresence>
                  {validationError && (
                    <motion.div key="valerr"
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ flexShrink: 0 }}
                    >
                      <ValidationAlert missing={validationError} onDismiss={() => setValidationError(null)} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {data ? (
                  <>
                    {/* Charts - collapsible */}
                    <div style={{ flexShrink: 0 }}>
                      <ChartsSection data={data} />
                    </div>

                    {/* Table - fills remaining space */}
                    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                      <FilePreview
                        data={data}
                        fileName={fileName}
                        onUpdateRow={handleUpdateRow}
                        onUpdateRowsBulk={handleUpdateRowsBulk}
                        onDeleteRow={handleDeleteRow}
                        onDeleteRowsBulk={handleDeleteRowsBulk}
                        onAddRow={handleAddRow}
                        onMergeFile={handleMergeFile}
                      />
                    </div>
                  </>
                ) : (
                  /* Welcome screen */
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: 16, textAlign: 'center',
                    }}
                  >
                    <div style={{
                      width: 80, height: 80, borderRadius: 24,
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(124,58,237,0.12))',
                      border: '1px solid rgba(14,165,233,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><TestTube2 size={36} strokeWidth={1.5} color="var(--accent-cyan)" /></div>
                    <div>
                      <h1 style={{
                        fontFamily: 'Syne', fontWeight: 800, fontSize: 28,
                        color: 'var(--text-primary)', marginBottom: 8,
                        background: 'linear-gradient(135deg, #0284c7, #7c3aed)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>QA Report Generator</h1>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>
                        Upload your QA test case sheet from the sidebar to generate reports, edit data, and export.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                      {[
                        { icon: <BarChart2 size={22} strokeWidth={1.5} color="var(--accent-cyan)" />, label: 'Smart Dashboard' },
                      { icon: <Pencil size={22} strokeWidth={1.5} color="var(--accent-purple)" />, label: 'Inline Editing' },
                      { icon: <Download size={22} strokeWidth={1.5} color="var(--accent-green)" />, label: 'Excel & Sheets Export' },
                      ].map(f => (
                        <div key={f.label} style={{
                          padding: '10px 16px', borderRadius: 'var(--r-md)',
                          background: 'var(--bg-card)', border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-xs)', textAlign: 'center',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        }}>
                          <span style={{ fontSize: 22 }}>{f.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'DM Mono' }}>
                      100% client-side · No backend · Auto-saved to IndexedDB
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

          ) : (
            /* History Tab */
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}
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
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
