import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, GitMerge, Eye, Search, Zap, AlertTriangle,
  TestTube2, X, MapPin,
} from 'lucide-react';
import { REQUIRED_COLUMNS, PAGE_SIZE } from '../constants';

function getColWidth(col) {
  const map = {
    'Sr No': 60,
    'Module': 140,
    'Test Case ID': 130,
    'Test Type': 120,
    'Test Scenario': 260,
    'Simplified Test Scenario': 220,
    'Test Steps': 280,
    'Expected Result': 250,
    'Actual Result': 250,
    'Priority': 110,
    'Severity': 110,
    'Status': 130,
    'Tested By': 120,
    'Execution Date': 130,
    'Defect No. / Bug No.': 160,
    'Defect ID': 120,
    'QA Comments': 250,
  };
  return map[col] || 150;
}

function AutoResizingTextarea({ value, onChange }) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useLayoutEffect(() => {
    adjustHeight();
  }, [value]);

  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, []);

  const handleChange = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    onChange(e);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      style={{
        background: 'transparent',
        border: '1px solid transparent',
        color: 'var(--text-primary)',
        fontSize: 12,
        padding: '4px 6px',
        width: '100%',
        borderRadius: 4,
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        lineHeight: '1.4',
        overflowY: 'hidden',
        display: 'block',
      }}
      onFocus={(e) => {
        e.target.style.border = '1px solid var(--border)';
        e.target.style.background = 'var(--bg-secondary)';
      }}
      onBlur={(e) => {
        e.target.style.border = '1px solid transparent';
        e.target.style.background = 'transparent';
      }}
    />
  );
}

function EditableStatus({ row, data, onUpdateRow }) {
  const statusOptions = ['PASS', 'FAIL', 'BLOCKED', 'NOT EXECUTED'];
  const currentStatus = row['Status'] ? row['Status'].toString().toUpperCase() : 'NOT EXECUTED';
  const map = {
    PASS: 'badge-pass', FAIL: 'badge-fail',
    BLOCKED: 'badge-blocked', 'NOT EXECUTED': 'badge-notexec',
  };
  return (
    <select
      value={currentStatus}
      onChange={(e) => {
        const newStatus = e.target.value;
        onUpdateRow(data.indexOf(row), { ...row, Status: newStatus });
      }}
      className={map[currentStatus] || 'badge-notexec'}
      style={{
        padding: '2px 8px', borderRadius: 20, fontSize: 10,
        fontFamily: 'DM Mono, monospace', fontWeight: 600,
        border: '1px solid transparent', outline: 'none',
        cursor: 'pointer', background: 'inherit',
        color: 'inherit', display: 'inline-block',
      }}
    >
      {statusOptions.map(opt => (
        <option key={opt} value={opt} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function EditableSeverity({ row, data, onUpdateRow }) {
  const severityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const currentSeverity = row['Severity'] ? row['Severity'].toString().toUpperCase() : 'MEDIUM';
  const map = {
    CRITICAL: 'badge-critical', HIGH: 'badge-high',
    MEDIUM: 'badge-medium', LOW: 'badge-low',
  };
  return (
    <select
      value={currentSeverity}
      onChange={(e) => {
        const newSev = e.target.value;
        onUpdateRow(data.indexOf(row), { ...row, Severity: newSev });
      }}
      className={map[currentSeverity] || 'badge-medium'}
      style={{
        padding: '2px 8px', borderRadius: 20, fontSize: 10,
        fontFamily: 'DM Mono, monospace', fontWeight: 600,
        border: '1px solid transparent', outline: 'none',
        cursor: 'pointer', background: 'inherit',
        color: 'inherit', display: 'inline-block',
      }}
    >
      {severityOptions.map(opt => (
        <option key={opt} value={opt} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function EditablePriority({ row, data, onUpdateRow }) {
  const priorityOptions = ['HIGH', 'MEDIUM', 'LOW'];
  const currentPriority = row['Priority'] ? row['Priority'].toString().toUpperCase() : 'MEDIUM';
  const map = { HIGH: 'badge-critical', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  return (
    <select
      value={currentPriority}
      onChange={(e) => {
        const newPri = e.target.value;
        onUpdateRow(data.indexOf(row), { ...row, Priority: newPri });
      }}
      className={map[currentPriority] || 'badge-medium'}
      style={{
        padding: '2px 8px', borderRadius: 20, fontSize: 10,
        fontFamily: 'DM Mono, monospace', fontWeight: 600,
        border: '1px solid transparent', outline: 'none',
        cursor: 'pointer', background: 'inherit',
        color: 'inherit', display: 'inline-block',
      }}
    >
      {priorityOptions.map(opt => (
        <option key={opt} value={opt} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// Trash2 and Plus come from lucide-react (imported above)
function TrashIcon({ size = 16, color = 'currentColor' }) {
  return <Trash2 size={size} color={color} strokeWidth={1.75} />;
}
function PlusIcon({ size = 16, color = 'currentColor' }) {
  return <Plus size={size} color={color} strokeWidth={2} />;
}

export default function FilePreview({ data, fileName, onUpdateRow, onUpdateRowsBulk, onDeleteRow, onDeleteRowsBulk, onAddRow, onMergeFile }) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIdxs, setSelectedIdxs] = useState([]);
  const selectedRow = useMemo(() => {
    return selectedIdxs.length === 1 ? data[selectedIdxs[0]] : null;
  }, [selectedIdxs, data]);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'single' | 'bulk', index?: number, indices?: number[] }
  const [showAddModal, setShowAddModal] = useState(false);
  const [insertConfig, setInsertConfig] = useState({ positionType: 'end', relativeSrNo: '1' });
  const [newRowData, setNewRowData] = useState({
    Module: '',
    'Test Case ID': '',
    'Test Type': 'Functional',
    'Test Scenario': '',
    'Simplified Test Scenario': '',
    'Test Steps': '',
    'Expected Result': '',
    'Actual Result': '',
    Priority: 'MEDIUM',
    Severity: 'MEDIUM',
    Status: 'NOT EXECUTED',
    'Tested By': 'Dwip Pandya',
    'Execution Date': new Date().toISOString().slice(0, 10),
    'Defect No. / Bug No.': '',
    'Defect ID': '',
    'QA Comments': '',
  });

  const DEFAULT_HIDDEN = useMemo(() => ['Test Type', 'Test Case ID', 'Test Steps', 'Priority', 'Severity'], []);
  const [visibleCols, setVisibleCols] = useState(() => {
    return REQUIRED_COLUMNS.filter(col => !DEFAULT_HIDDEN.includes(col));
  });
  const [showColSelector, setShowColSelector] = useState(false);

  useEffect(() => {
    setSelectedIdxs([]);
  }, [search, statusFilter, page, pageSize, data]);

  const filtered = useMemo(() => {
    let rows = data;
    if (statusFilter) rows = rows.filter(r => r['Status']?.toString().toUpperCase() === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r => REQUIRED_COLUMNS.some(col => r[col]?.toString().toLowerCase().includes(q)));
    }
    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        const va = a[sortCol]?.toString() || '', vb = b[sortCol]?.toString() || '';
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return rows;
  }, [data, search, statusFilter, sortCol, sortDir]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(row => selectedIdxs.includes(data.indexOf(row)));
  const someFilteredSelected = filtered.length > 0 && filtered.some(row => selectedIdxs.includes(data.indexOf(row))) && !allFilteredSelected;

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredGlobalIdxs = filtered.map(row => data.indexOf(row));
      setSelectedIdxs(selectedIdxs.filter(idx => !filteredGlobalIdxs.includes(idx)));
    } else {
      const filteredGlobalIdxs = filtered.map(row => data.indexOf(row));
      setSelectedIdxs([...new Set([...selectedIdxs, ...filteredGlobalIdxs])]);
    }
  };

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filtered.length / pageSize);
  const paginated = pageSize === 'all' ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatusFilter = (e) => { setStatusFilter(e.target.value); setPage(1); };

  const handleMergeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onMergeFile?.(file);
      e.target.value = ''; // reset element
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Table header controls */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
        flexShrink: 0, background: 'var(--bg-card)',
      }}>
        <div>
          {selectedIdxs.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Zap size={12} strokeWidth={2.5} /> {selectedIdxs.length} row{selectedIdxs.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedIdxs([])}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-muted)',
                    fontSize: 11, cursor: 'pointer', textDecoration: 'underline', padding: 0,
                    marginTop: 2, display: 'block', textAlign: 'left',
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Preview & Edit
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {fileName} · {filtered.length} of {data.length} rows
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedIdxs.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {selectedIdxs.length === 1 && (
                <button
                  onClick={() => {
                    const row = selectedRow || data[0] || {};
                    setInsertConfig({ positionType: 'after', relativeSrNo: row['Sr No'] || '1' });
                    setNewRowData({
                      Module: row['Module'] || '',
                      'Test Case ID': '',
                      'Test Type': row['Test Type'] || 'Functional',
                      'Test Scenario': '',
                      'Simplified Test Scenario': '',
                      'Test Steps': '',
                      'Expected Result': '',
                      'Actual Result': '',
                      Priority: 'MEDIUM',
                      Severity: 'MEDIUM',
                      Status: 'NOT EXECUTED',
                      'Tested By': 'Dwip Pandya',
                      'Execution Date': new Date().toISOString().slice(0, 10),
                      'Defect No. / Bug No.': '',
                      'Defect ID': '',
                      'QA Comments': '',
                    });
                    setShowAddModal(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                    border: 'none',
                    borderRadius: 8, color: '#fff', fontSize: 12,
                    padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'opacity 0.2s', fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(2,132,199,0.15)',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <PlusIcon size={14} color="#fff" /> Add Test Case
                </button>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Bulk Status:</span>
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const updates = selectedIdxs.map(idx => ({
                    index: idx,
                    updatedRow: { ...data[idx], Status: val }
                  }));
                  onUpdateRowsBulk?.(updates);
                  setSelectedIdxs([]);
                }}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--accent-cyan)',
                  borderRadius: 8, color: 'var(--text-primary)', fontSize: 12,
                  padding: '7px 12px', outline: 'none', cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <option value="" disabled>Apply status to selected...</option>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="NOT EXECUTED">NOT EXECUTED</option>
              </select>

              <button
                onClick={() => {
                  setDeleteTarget({ type: 'bulk', indices: selectedIdxs });
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--accent-red)',
                  borderRadius: 8, color: 'var(--accent-red)', fontSize: 12,
                  padding: '7px 12px', cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              >
                <TrashIcon size={14} color="currentColor" /> Delete Selected
              </button>
            </div>
          ) : (
            <>
              {/* Add Test Case */}
              <button
                onClick={() => {
                  setInsertConfig({ positionType: 'end', relativeSrNo: '1' });
                  setNewRowData({
                    Module: '',
                    'Test Case ID': '',
                    'Test Type': 'Functional',
                    'Test Scenario': '',
                    'Simplified Test Scenario': '',
                    'Test Steps': '',
                    'Expected Result': '',
                    'Actual Result': '',
                    Priority: 'MEDIUM',
                    Severity: 'MEDIUM',
                    Status: 'NOT EXECUTED',
                    'Tested By': 'Dwip Pandya',
                    'Execution Date': new Date().toISOString().slice(0, 10),
                    'Defect No. / Bug No.': '',
                    'Defect ID': '',
                    'QA Comments': '',
                  });
                  setShowAddModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                  border: 'none',
                  borderRadius: 8, color: '#fff', fontSize: 12,
                  padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'opacity 0.2s', fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(2,132,199,0.15)',
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                <PlusIcon size={14} color="#fff" /> Add Test Case
              </button>

              {/* Upload New to Merge */}
              <button
                onClick={() => document.getElementById('merge-file-input').click()}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--accent-cyan)', fontSize: 12,
                  padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s', fontWeight: 600,
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <GitMerge size={14} strokeWidth={2} /> Merge Sheet
              </button>
              <input
                id="merge-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleMergeUpload}
                style={{ display: 'none' }}
              />

              {/* Column Selector */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowColSelector(!showColSelector)}
                  style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12,
                    padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s', fontWeight: 600,
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = showColSelector ? 'var(--accent-cyan)' : 'var(--border)'}
                >
                  <Eye size={14} strokeWidth={2} /> Columns
                </button>
                {showColSelector && (
                  <>
                    <div
                      onClick={() => setShowColSelector(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    />
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '12px 14px', width: 220, zIndex: 1000,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 16px -8px rgba(0,0,0,0.1)',
                      display: 'flex', flexDirection: 'column', gap: 8,
                      maxHeight: 320, overflowY: 'auto',
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
                        borderBottom: '1px solid var(--border)', paddingBottom: 6,
                      }}>
                        Select Columns
                      </div>
                      {REQUIRED_COLUMNS.map(col => {
                        const isVisible = visibleCols.includes(col);
                        const isDisabled = col === 'Sr No';
                        return (
                          <label
                            key={col}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                              color: isVisible ? 'var(--text-primary)' : 'var(--text-secondary)',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              userSelect: 'none',
                              padding: '2px 0',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isVisible}
                              disabled={isDisabled}
                              onChange={() => {
                                if (isVisible) {
                                  setVisibleCols(visibleCols.filter(c => c !== col));
                                } else {
                                  const nextCols = REQUIRED_COLUMNS.filter(c => c === col || visibleCols.includes(c));
                                  setVisibleCols(nextCols);
                                }
                              }}
                              style={{ accentColor: 'var(--accent-cyan)', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                            />
                            {col}
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12,
                  padding: '7px 12px', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">All Statuses</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="BLOCKED">Blocked</option>
                <option value="NOT EXECUTED">Not Executed</option>
              </select>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><Search size={13} strokeWidth={2} /></span>
                <input
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search..."
                  style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-primary)', fontSize: 12,
                    padding: '7px 12px 7px 30px', outline: 'none', width: 180,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table — fills remaining flex space */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 46, textAlign: 'center', padding: '10px 14px' }}>
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  ref={el => {
                    if (el) el.indeterminate = someFilteredSelected;
                  }}
                  onChange={handleSelectAll}
                  style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                />
              </th>
              {visibleCols.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'left', minWidth: getColWidth(col) }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col}
                    {sortCol === col && <span style={{ color: 'var(--accent-cyan)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
              <th style={{ width: 60, textAlign: 'center', padding: '10px 14px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No rows match your filters
                </td>
              </tr>
            ) : paginated.map((row, i) => {
              const globalIdx = data.indexOf(row);
              const isSelected = selectedIdxs.includes(globalIdx);
              return (
                <tr key={i} style={{ background: isSelected ? 'rgba(2,132,199,0.04)' : undefined }}>
                  <td style={{ width: 46, textAlign: 'center', padding: '10px 14px', verticalAlign: 'middle' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedIdxs(selectedIdxs.filter(idx => idx !== globalIdx));
                        } else {
                          setSelectedIdxs([...selectedIdxs, globalIdx]);
                        }
                      }}
                      style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                    />
                  </td>
                  {visibleCols.map(col => {
                    const isReadOnly = col === 'Sr No' || col === 'Test Case ID';
                    const isDropdown = col === 'Status' || col === 'Severity' || col === 'Priority';
                    const isText = !isReadOnly && !isDropdown;

                    return (
                      <td
                        key={col}
                        style={{
                          minWidth: getColWidth(col),
                          maxWidth: col === 'Test Case ID' ? 140 : undefined,
                          padding: isText ? '6px 8px' : '10px 14px',
                        }}
                      >
                        {col === 'Status' ? (
                          <EditableStatus row={row} data={data} onUpdateRow={onUpdateRow} />
                        ) : col === 'Severity' ? (
                          <EditableSeverity row={row} data={data} onUpdateRow={onUpdateRow} />
                        ) : col === 'Priority' ? (
                          <EditablePriority row={row} data={data} onUpdateRow={onUpdateRow} />
                        ) : isReadOnly ? (
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>
                            {row[col] || '—'}
                          </span>
                        ) : (
                          <AutoResizingTextarea
                            value={row[col] || ''}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              onUpdateRow(globalIdx, { ...row, [col]: newVal });
                            }}
                          />
                        )}
                      </td>
                    );
                  })}
                  <td style={{ width: 60, textAlign: 'center', padding: '6px 8px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        onClick={() => setDeleteTarget({ type: 'single', index: globalIdx })}
                        title="Delete Test Case"
                        style={{
                          background: 'transparent', border: 'none', color: '#94a3b8',
                          cursor: 'pointer', padding: '6px', borderRadius: 6,
                          transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#94a3b8';
                        }}
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div style={{
          padding: '8px 14px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8, flexShrink: 0,
          background: 'var(--bg-card)',
        }}>
          {totalPages > 1 ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <PageBtn onClick={() => setPage(1)} disabled={page === 1}>«</PageBtn>
              <PageBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</PageBtn>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.min(Math.max(page - 2, 1), totalPages - 4) + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <PageBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PageBtn>
                );
              })}
              <PageBtn onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</PageBtn>
              <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PageBtn>
            </div>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value;
                  const size = val === 'all' ? 'all' : parseInt(val, 10);
                  setPageSize(size);
                  setPage(1);
                }}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12,
                  padding: '4px 8px', outline: 'none', cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
                <option value="all">View All</option>
              </select>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Page {page} of {totalPages || 1}
            </span>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '24px', width: '90%', maxWidth: 400,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <AlertTriangle size={20} strokeWidth={2} color="var(--accent-red)" />
              <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>
                Confirm Deletion
              </h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              {deleteTarget.type === 'bulk'
                ? `Are you sure you want to delete the ${deleteTarget.indices.length} selected test cases? This action cannot be undone.`
                : `Are you sure you want to delete this test case? This action cannot be undone.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12,
                  padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteTarget.type === 'bulk') {
                    onDeleteRowsBulk?.(deleteTarget.indices);
                    setSelectedIdxs([]);
                  } else {
                    onDeleteRow?.(deleteTarget.index);
                  }
                  setDeleteTarget(null);
                }}
                style={{
                  background: 'var(--accent-red)', border: 'none',
                  borderRadius: 8, color: '#ffffff', fontSize: 12,
                  padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '24px', width: '95%', maxWidth: 700,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TestTube2 size={20} strokeWidth={1.75} color="var(--accent-cyan)" />
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                  Add New Test Case
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                <X size={18} strokeWidth={2} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Module & Test Case ID */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Module *</label>
                  <input
                    type="text"
                    value={newRowData.Module}
                    onChange={(e) => setNewRowData({ ...newRowData, Module: e.target.value })}
                    placeholder="e.g. Authentication"
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Test Case ID *</label>
                  <input
                    type="text"
                    value={newRowData['Test Case ID']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Test Case ID': e.target.value })}
                    placeholder="e.g. TC101"
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                  />
                </div>

                {/* Test Type & Tested By */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Test Type</label>
                  <input
                    type="text"
                    value={newRowData['Test Type']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Test Type': e.target.value })}
                    placeholder="e.g. Functional"
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Tested By</label>
                  <input
                    type="text"
                    value={newRowData['Tested By']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Tested By': e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                  />
                </div>

                {/* Priority & Severity */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Priority</label>
                  <select
                    value={newRowData.Priority}
                    onChange={(e) => setNewRowData({ ...newRowData, Priority: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Severity</label>
                  <select
                    value={newRowData.Severity}
                    onChange={(e) => setNewRowData({ ...newRowData, Severity: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                {/* Status & Execution Date */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Status</label>
                  <select
                    value={newRowData.Status}
                    onChange={(e) => setNewRowData({ ...newRowData, Status: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="NOT EXECUTED">NOT EXECUTED</option>
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Execution Date</label>
                  <input
                    type="date"
                    value={newRowData['Execution Date']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Execution Date': e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '7px 12px', outline: 'none', cursor: 'pointer' }}
                  />
                </div>

                {/* Defect ID & Defect No. / Bug No. */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Defect ID</label>
                  <input
                    type="text"
                    value={newRowData['Defect ID']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Defect ID': e.target.value })}
                    placeholder="e.g. BUG-101"
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Defect No. / Bug No.</label>
                  <input
                    type="text"
                    value={newRowData['Defect No. / Bug No.']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Defect No. / Bug No.': e.target.value })}
                    placeholder="e.g. BUG-101"
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                  />
                </div>

                {/* Test Scenario (Full width) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Test Scenario</label>
                  <textarea
                    value={newRowData['Test Scenario']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Test Scenario': e.target.value })}
                    placeholder="Describe the test scenario details..."
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* Simplified Test Scenario (Full width) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Simplified Test Scenario</label>
                  <textarea
                    value={newRowData['Simplified Test Scenario']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Simplified Test Scenario': e.target.value })}
                    placeholder="A simplified overview..."
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* Test Steps (Full width) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Test Steps</label>
                  <textarea
                    value={newRowData['Test Steps']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Test Steps': e.target.value })}
                    placeholder="Step 1. ...&#10;Step 2. ..."
                    rows={3}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* Expected & Actual Results */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Expected Result</label>
                  <textarea
                    value={newRowData['Expected Result']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Expected Result': e.target.value })}
                    rows={3}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Actual Result</label>
                  <textarea
                    value={newRowData['Actual Result']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'Actual Result': e.target.value })}
                    rows={3}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* QA Comments */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>QA Comments</label>
                  <textarea
                    value={newRowData['QA Comments']}
                    onChange={(e) => setNewRowData({ ...newRowData, 'QA Comments': e.target.value })}
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* INSERTION POSITION SETTING */}
                <div style={{ gridColumn: 'span 2', background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 10, marginTop: 8, border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} strokeWidth={2} color="var(--accent-cyan)" /> Insertion Position</h4>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Insert:</span>
                      <select
                        value={insertConfig.positionType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInsertConfig(prev => ({
                            ...prev,
                            positionType: val,
                            relativeSrNo: selectedRow ? selectedRow['Sr No'] : prev.relativeSrNo
                          }));
                        }}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, padding: '4px 8px', outline: 'none', cursor: 'pointer' }}
                      >
                        {selectedRow ? (
                          <>
                            <option value="after">Below Selected Row (Sr No {selectedRow['Sr No']})</option>
                            <option value="before">Above Selected Row (Sr No {selectedRow['Sr No']})</option>
                            <option value="end">At the end of the sheet</option>
                            <option value="start">At the beginning of the sheet</option>
                          </>
                        ) : (
                          <>
                            <option value="end">At the end of the sheet</option>
                            <option value="start">At the beginning of the sheet</option>
                            <option value="before">Before Row (Sr No)</option>
                            <option value="after">After Row (Sr No)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {!selectedRow && (insertConfig.positionType === 'before' || insertConfig.positionType === 'after') && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Row Number:</span>
                        <input
                          type="number"
                          min="1"
                          max={data.length}
                          value={insertConfig.relativeSrNo}
                          onChange={(e) => setInsertConfig({ ...insertConfig, relativeSrNo: e.target.value })}
                          style={{ width: 70, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, padding: '4px 8px', outline: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12,
                  padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newRowData.Module.trim() || !newRowData['Test Case ID'].trim()) {
                    alert('Module and Test Case ID are required fields.');
                    return;
                  }

                  // Resolve insertion index
                  let resolvedIdx = data.length;
                  if (insertConfig.positionType === 'start') {
                    resolvedIdx = 0;
                  } else if (insertConfig.positionType === 'before') {
                    const sr = parseInt(insertConfig.relativeSrNo) || 1;
                    resolvedIdx = Math.max(0, sr - 1);
                  } else if (insertConfig.positionType === 'after') {
                    const sr = parseInt(insertConfig.relativeSrNo) || 1;
                    resolvedIdx = Math.min(data.length, sr);
                  }

                  onAddRow?.(newRowData, resolvedIdx);
                  setSelectedIdxs([]); // Clear selection after addition
                  setShowAddModal(false);
                }}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                  border: 'none',
                  borderRadius: 8, color: '#ffffff', fontSize: 12,
                  padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(2,132,199,0.2)',
                }}
              >
                Add Test Case
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 6, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        background: active ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
        border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border)'}`,
        color: active ? '#0a0b0f' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        fontWeight: active ? 700 : 400, transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
