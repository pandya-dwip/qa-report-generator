import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export default function FilePreview({ data, fileName, onUpdateRow, onUpdateRowsBulk, onMergeFile }) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIdxs, setSelectedIdxs] = useState([]);

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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}
    >
      {/* Table header controls */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          {selectedIdxs.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)', display: 'block' }}>
                  ⚡ {selectedIdxs.length} row{selectedIdxs.length > 1 ? 's' : ''} selected
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
            </div>
          ) : (
            <>
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
                🔗 Merge New Sheet
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
                  👁️ View Columns
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
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
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

      {/* Table */}
      <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto', position: 'relative' }}>
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
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 1} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
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
