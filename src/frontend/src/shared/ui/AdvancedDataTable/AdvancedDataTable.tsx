import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaChevronUp, FaEye, FaTimes, FaColumns } from 'react-icons/fa';
import { apiClient } from '../../api/axiosConfig';
import styles from './AdvancedDataTable.module.css';

export interface Column<T = any> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// ─── İki mod: endpoint (fetch) veya data (dışarıdan) ────
type EndpointMode = {
  endpoint: string;
  searchParams?: Record<string, string>;
  data?: never;
  totalCount?: never;
  loading?: never;
};

type DataMode<T> = {
  data: T[];
  totalCount?: number;
  loading?: boolean;
  endpoint?: never;
  searchParams?: never;
};

export type AdvancedDataTableProps<T = any> = {
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  detailModal?: (row: T, onClose: () => void) => React.ReactNode;
} & (EndpointMode | DataMode<T>);

export const AdvancedDataTable = <T extends Record<string, any>>(props: AdvancedDataTableProps<T>) => {
  const { columns, pageSize = 20, onRowClick, detailModal } = props;

  // ─── Internal state ───────────────────────────────────
  const [internalData, setInternalData]   = useState<T[]>([]);
  const [internalTotal, setInternalTotal] = useState(0);
  const [internalLoading, setLoading]     = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const [page, setPage]               = useState(1);
  const [pageSz, setPageSz]           = useState(pageSize);
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortCol, setSortCol]         = useState<string | null>(null);
  const [sortDir, setSortDir]         = useState<'asc' | 'desc'>('asc');
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  // Col visibility
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleCol = (key: string) => setVisibleCols(p => ({ ...p, [key]: !p[key] }));
  const activeColumns = useMemo(() => columns.filter(c => visibleCols[c.key] !== false), [columns, visibleCols]);

  // ─── Determine mode ───────────────────────────────────
  const isDataMode = 'data' in props && props.data !== undefined;

  // ─── DATA MODE: client-side pagination/sort/search ───
  const externalData    = isDataMode ? (props as DataMode<T>).data : [];
  const externalLoading = isDataMode ? ((props as DataMode<T>).loading ?? false) : false;

  const processedData = useMemo(() => {
    if (!isDataMode) return [];
    let d = [...externalData];

    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      d = d.filter(row =>
        Object.values(row).some(v => v != null && String(v).toLowerCase().includes(q))
      );
    }

    if (sortCol) {
      d.sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        const cmp = String(av).localeCompare(String(bv), 'tr', { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return d;
  }, [isDataMode, externalData, globalSearch, sortCol, sortDir]);

  const clientPage = useMemo(() => {
    if (!isDataMode) return [];
    const start = (page - 1) * pageSz;
    return processedData.slice(start, start + pageSz);
  }, [isDataMode, processedData, page, pageSz]);

  // ─── ENDPOINT MODE: internal fetch using apiClient ───
  const searchParamsStr = JSON.stringify((props as EndpointMode).searchParams ?? {});
  const endpoint = (props as EndpointMode).endpoint ?? '';

  const fetchData = useCallback(async () => {
    if (isDataMode || !endpoint) return;
    setLoading(true); setError(null);
    try {
      const p = JSON.parse(searchParamsStr);
      const params: any = {
        page,
        pageSize: pageSz,
        ...p
      };
      if (globalSearch) params.search = globalSearch;
      if (sortCol) { params.sortBy = sortCol; params.sortOrder = sortDir; }

      // Use the project's apiClient (axios) to avoid CORS/auth issues
      const res = await apiClient.get(endpoint, { params });
      
      const result = res.data;
      if (Array.isArray(result)) {
        setInternalData(result); setInternalTotal(result.length);
      } else {
        const items = result.items ?? result.data ?? [];
        setInternalData(items);
        setInternalTotal(result.totalCount ?? result.total ?? items.length);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Hata');
      setInternalData([]); setInternalTotal(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataMode, endpoint, page, pageSz, globalSearch, sortCol, sortDir, searchParamsStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Unified display values ───────────────────────────
  const displayData    = isDataMode ? clientPage    : internalData;
  const displayTotal   = isDataMode ? processedData.length : internalTotal;
  const displayLoading = isDataMode ? externalLoading : internalLoading;
  const totalPages     = Math.max(1, Math.ceil(displayTotal / pageSz));

  const handleSort = (key: string) => {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); }
    setPage(1);
  };

  const getValue = useCallback((row: T, col: Column<T>) =>
    col.accessor ? col.accessor(row) : row[col.key]
  , []);

  return (
    <div className={styles.tableContainer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tüm tabloda ara..."
            value={globalSearch}
            onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.colMenuWrapper} ref={colMenuRef}>
          <button className={`${styles.toolbarBtn} ${colMenuOpen ? styles.active : ''}`} onClick={() => setColMenuOpen(o => !o)}>
            <FaColumns /> <span>Kolonlar</span>
          </button>
          {colMenuOpen && (
            <div className={styles.colDropdown}>
              <div className={styles.colDropdownHeader}>Kolon Görünürlüğü</div>
              {columns.map(col => (
                <label key={col.key} className={styles.colToggleRow}>
                  <input type="checkbox" className={styles.colCheckbox} checked={visibleCols[col.key] !== false} onChange={() => toggleCol(col.key)} />
                  <span>{col.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {activeColumns.map(col => (
                <th key={col.key} style={{ width: col.width }}>
                  <div className={styles.thContent}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <button className={`${styles.iconBtn} ${sortCol === col.key ? styles.active : ''}`} onClick={() => handleSort(col.key)}>
                        {sortCol === col.key ? (sortDir === 'asc' ? <FaChevronUp /> : <FaChevronDown />) : <FaChevronDown style={{ opacity: 0.3 }} />}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {detailModal && <th style={{ width: '80px' }}>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {displayLoading && <tr className={styles.stateRow}><td colSpan={10}><span className={styles.spinner} /> Yükleniyor...</td></tr>}
            {!displayLoading && error && <tr className={styles.stateRow}><td colSpan={10}><span>{error}</span></td></tr>}
            {!displayLoading && displayData.length === 0 && <tr className={styles.stateRow}><td colSpan={10}>Kayıt bulunamadı.</td></tr>}
            {displayData.map((row, idx) => (
              <tr key={row.id ?? idx} className={onRowClick ? styles.clickable : ''} onClick={() => onRowClick?.(row)}>
                {activeColumns.map(col => <td key={col.key}>{col.render ? col.render(getValue(row, col), row) : String(getValue(row, col) ?? '-')}</td>)}
                {detailModal && <td><button className={styles.detailBtn} onClick={e => { e.stopPropagation(); setSelectedRow(row); }}><FaEye /></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>Toplam <strong>{displayTotal}</strong> kayıt</span>
        <div className={styles.pageControls}>
          <button className={styles.pageBtn} disabled={page <= 1 || displayLoading} onClick={() => setPage(p => p - 1)}>Önceki</button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button className={styles.pageBtn} disabled={page >= totalPages || displayLoading} onClick={() => setPage(p => p + 1)}>Sonraki</button>
        </div>
        <select className={styles.pageSizeSelect} value={pageSz} onChange={e => { setPageSz(+e.target.value); setPage(1); }}>
          {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} / Sayfa</option>)}
        </select>
      </div>

      {/* Modal */}
      {selectedRow && detailModal && (
        <div className={styles.overlay} onClick={() => setSelectedRow(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h3>Detay</h3><button className={styles.closeBtn} onClick={() => setSelectedRow(null)}><FaTimes /></button></div>
            <div className={styles.modalBody}>{detailModal(selectedRow, () => setSelectedRow(null))}</div>
          </div>
        </div>
      )}
    </div>
  );
};
