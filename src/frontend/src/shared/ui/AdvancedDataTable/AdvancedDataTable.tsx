import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaEye, FaTimes, FaColumns } from 'react-icons/fa';
import styles from './AdvancedDataTable.module.css';

export interface Column<T = any> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (value: any, row: T) => React.ReactNode;
  filterable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  width?: string;
  hideable?: boolean; // default true
}

export interface AdvancedDataTableProps<T = any> {
  endpoint: string;
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  detailModal?: (row: T, onClose: () => void) => React.ReactNode;
  getAuthToken?: () => Promise<string | null>;
  searchParams?: Record<string, string>;
}

export const AdvancedDataTable = <T extends Record<string, any>>({
  endpoint,
  columns,
  pageSize = 20,
  onRowClick,
  detailModal,
  getAuthToken,
  searchParams = {}
}: AdvancedDataTableProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [total, setTotal] = useState(0);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // ─── Column Visibility ───────────────────────────────────
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Close column menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleColVisibility = (key: string) => {
    setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeColumns = useMemo(() =>
    columns.filter(c => visibleCols[c.key] !== false),
    [columns, visibleCols]
  );

  // ─── getAuthToken → stable ref (avoids dep-array churn) ─
  const authRef = useRef(getAuthToken);
  useEffect(() => { authRef.current = getAuthToken; }, [getAuthToken]);

  // ─── Debounce global search ──────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(globalSearch);
      if (globalSearch !== debouncedSearch) setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [globalSearch]);

  // ─── Stable searchParams string (fixes infinite-loop) ───
  const searchParamsStr = JSON.stringify(searchParams);

  // ─── Fetch ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authRef.current ? await authRef.current() : null;
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: currentPageSize.toString(),
        // spread stable searchParams from the string
        ...JSON.parse(searchParamsStr)
      });

      if (debouncedSearch) params.append('search', debouncedSearch);

      Object.entries(columnFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      Object.entries(columnSearches).forEach(([k, v]) => { if (v) params.append(`${k}_search`, v); });
      if (sortColumn) { params.append('sortBy', sortColumn); params.append('sortOrder', sortDirection); }

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET', headers, credentials: 'include'
      });

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const result = await res.json();
      let items: T[] = [];
      let totalCount = 0;

      if (Array.isArray(result)) {
        items = result; totalCount = result.length;
      } else if (result.items) {
        items = result.items; totalCount = result.totalCount ?? result.total ?? items.length;
      } else if (result.data) {
        items = result.data; totalCount = result.total ?? items.length;
      }

      setData(items);
      setTotal(totalCount);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(msg);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, currentPageSize, debouncedSearch, columnFilters, columnSearches, sortColumn, sortDirection, searchParamsStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset to page 1 when searchParams change
  useEffect(() => { setPage(1); }, [searchParamsStr]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / currentPageSize)), [total, currentPageSize]);

  const getValue = useCallback((row: T, col: Column<T>) => col.accessor ? col.accessor(row) : row[col.key], []);

  return (
    <div className={styles.tableContainer}>
      {/* ─── Toolbar ─── */}
      <div className={styles.toolbar}>
        {/* Global Search */}
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tabloda genel arama..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
          />
        </div>

        {/* Columns Toggle */}
        <div className={styles.colMenuWrapper} ref={colMenuRef}>
          <button
            className={`${styles.toolbarBtn} ${colMenuOpen ? styles.active : ''}`}
            onClick={() => setColMenuOpen(o => !o)}
            title="Kolonları Göster/Gizle"
          >
            <FaColumns /> <span>Kolonlar</span>
          </button>

          {colMenuOpen && (
            <div className={styles.colDropdown}>
              <div className={styles.colDropdownHeader}>Kolon Görünürlüğü</div>
              {columns.map(col => (
                <label key={col.key} className={styles.colToggleRow}>
                  <input
                    type="checkbox"
                    className={styles.colCheckbox}
                    checked={visibleCols[col.key] !== false}
                    onChange={() => toggleColVisibility(col.key)}
                  />
                  <span>{col.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {activeColumns.map(col => (
                <th key={col.key} style={{ width: col.width }}>
                  <div className={styles.columnHeader}>
                    <div className={styles.thContent}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <button
                          className={`${styles.iconBtn} ${sortColumn === col.key ? styles.active : ''}`}
                          onClick={() => {
                            if (sortColumn === col.key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                            else { setSortColumn(col.key); setSortDirection('asc'); }
                            setPage(1);
                          }}
                        >
                          {sortColumn === col.key
                            ? (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)
                            : <FaChevronDown style={{ opacity: 0.3 }} />}
                        </button>
                      )}
                      {(col.filterable || col.searchable) && (
                        <button
                          className={`${styles.iconBtn} ${expandedFilters[col.key] ? styles.active : ''}`}
                          onClick={() => setExpandedFilters(p => ({ ...p, [col.key]: !p[col.key] }))}
                        >
                          <FaFilter />
                        </button>
                      )}
                    </div>

                    {(col.filterable || col.searchable) && expandedFilters[col.key] && (
                      <div className={styles.filterArea}>
                        {col.filterable && (
                          <input
                            type="text"
                            className={styles.filterInput}
                            placeholder={`${col.header} filtrele...`}
                            value={columnFilters[col.key] || ''}
                            onChange={e => { setColumnFilters(p => ({ ...p, [col.key]: e.target.value })); setPage(1); }}
                          />
                        )}
                        {col.searchable && (
                          <div className={styles.filterInputWrapper}>
                            <FaSearch style={{ opacity: 0.45, fontSize: '0.7rem' }} />
                            <input
                              type="text"
                              placeholder={`${col.header} ara...`}
                              value={columnSearches[col.key] || ''}
                              onChange={e => { setColumnSearches(p => ({ ...p, [col.key]: e.target.value })); setPage(1); }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {detailModal && <th style={{ width: '80px' }}>İşlem</th>}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr className={styles.stateRow}>
                <td colSpan={activeColumns.length + (detailModal ? 1 : 0)}>
                  <span className={styles.spinner} /> Yükleniyor...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr className={styles.stateRow}>
                <td colSpan={activeColumns.length + (detailModal ? 1 : 0)}>
                  <span style={{ color: 'var(--color-danger)' }}>Hata: {error}</span>
                  <button className={styles.retryBtn} onClick={fetchData}>Yeniden Dene</button>
                </td>
              </tr>
            )}
            {!loading && !error && data.length === 0 && (
              <tr className={styles.stateRow}>
                <td colSpan={activeColumns.length + (detailModal ? 1 : 0)}>Kayıt bulunamadı.</td>
              </tr>
            )}
            {!loading && data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className={onRowClick ? styles.clickable : ''}
                onClick={() => onRowClick?.(row)}
              >
                {activeColumns.map(col => {
                  const val = getValue(row, col);
                  return (
                    <td key={col.key}>
                      {col.render ? col.render(val, row) : String(val ?? '-')}
                    </td>
                  );
                })}
                {detailModal && (
                  <td>
                    <button
                      className={styles.detailBtn}
                      onClick={e => { e.stopPropagation(); setSelectedRow(row); }}
                    >
                      <FaEye /> Detay
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ─── */}
      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>Toplam <strong>{total}</strong> kayıt</span>
        <div className={styles.pageControls}>
          <button className={styles.pageBtn} disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Önceki</button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button className={styles.pageBtn} disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Sonraki</button>
        </div>
        <select
          className={styles.pageSizeSelect}
          value={currentPageSize}
          onChange={e => { setCurrentPageSize(+e.target.value); setPage(1); }}
        >
          {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} / Sayfa</option>)}
        </select>
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedRow && detailModal && (
        <div className={styles.overlay} onClick={() => setSelectedRow(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Kayıt Detayı</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedRow(null)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              {detailModal(selectedRow, () => setSelectedRow(null))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
