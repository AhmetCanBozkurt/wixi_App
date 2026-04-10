import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaEye, FaTimes } from 'react-icons/fa';
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
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Debounce global search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearch);
      if (globalSearch !== debouncedGlobalSearch) {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [globalSearch, debouncedGlobalSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken ? await getAuthToken() : null;
      
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: currentPageSize.toString(),
        ...searchParams
      });

      if (debouncedGlobalSearch) {
        params.append('search', debouncedGlobalSearch);
      }

      Object.entries(columnFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      Object.entries(columnSearches).forEach(([key, value]) => {
        if (value) {
          params.append(`${key}_search`, value);
        }
      });

      if (sortColumn) {
        params.append('sortBy', sortColumn);
        params.append('sortOrder', sortDirection);
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${endpoint}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      let dataArray: T[] = [];
      let totalCount = 0;
      
      if (Array.isArray(result)) {
        dataArray = result;
        totalCount = result.length;
      } else if (result.items) {
        dataArray = Array.isArray(result.items) ? result.items : [];
        totalCount = result.total || dataArray.length;
      } else if (result.data) {
        dataArray = Array.isArray(result.data) ? result.data : [];
        totalCount = result.total || dataArray.length;
      }
      
      setData(dataArray);
      setTotal(totalCount);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, currentPageSize, debouncedGlobalSearch, columnFilters, columnSearches, sortColumn, sortDirection, searchParams, getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [columnKey]: value }));
    setPage(1);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    setColumnSearches(prev => ({ ...prev, [columnKey]: value }));
    setPage(1);
  };

  const toggleFilter = (columnKey: string) => {
    setExpandedFilters(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / currentPageSize)), [total, currentPageSize]);

  const getValue = useCallback((row: T, column: Column<T>) => {
    if (column.accessor) {
      return column.accessor(row);
    }
    return row[column.key];
  }, []);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.searchBar}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tüm tabloda global arama yapın..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={{ width: column.width }}>
                  <div className={styles.columnHeader}>
                    <div className={styles.thContent}>
                      <span>{column.header}</span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className={`${styles.actionButton} ${sortColumn === column.key ? styles.activeAction : ''}`}
                        >
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />
                          ) : (
                            <FaChevronDown style={{ opacity: 0.3 }} />
                          )}
                        </button>
                      )}
                      {(column.filterable || column.searchable) && (
                        <button
                          onClick={() => toggleFilter(column.key)}
                          className={`${styles.actionButton} ${expandedFilters[column.key] ? styles.activeAction : ''}`}
                        >
                          <FaFilter />
                        </button>
                      )}
                    </div>

                    {(column.filterable || column.searchable) && expandedFilters[column.key] && (
                      <div style={{ marginTop: '4px' }}>
                        {column.filterable && (
                          <input
                            type="text"
                            className={styles.filterInput}
                            placeholder={`${column.header} filtrele...`}
                            value={columnFilters[column.key] || ''}
                            onChange={(e) => handleFilterChange(column.key, e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                          />
                        )}
                        {column.searchable && (
                          <div className={styles.filterWrapper}>
                            <FaSearch style={{ fontSize: '0.8rem', opacity: 0.5 }} />
                            <input
                              type="text"
                              placeholder={`${column.header} ara...`}
                              value={columnSearches[column.key] || ''}
                              onChange={(e) => handleSearchChange(column.key, e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {detailModal && <th>İşlem</th>}
            </tr>
          </thead>
          
          <tbody>
            {loading && (
              <tr className={styles.loadingRow}>
                <td colSpan={columns.length + (detailModal ? 1 : 0)}>
                  <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    <span>Veriler yükleniyor, lütfen bekleyin...</span>
                  </div>
                </td>
              </tr>
            )}
            
            {!loading && error && (
              <tr className={styles.errorRow}>
                <td colSpan={columns.length + (detailModal ? 1 : 0)}>
                  <div className={styles.errorContent}>
                    <span>Opps! Bir hata oluştu: {error}</span>
                    <button onClick={() => fetchData()} className={styles.retryButton}>
                      Yeniden Dene
                    </button>
                  </div>
                </td>
              </tr>
            )}
            
            {!loading && !error && data.length === 0 && (
              <tr className={styles.emptyRow}>
                <td colSpan={columns.length + (detailModal ? 1 : 0)}>
                  Hiçbir kayıt bulunamadı.
                </td>
              </tr>
            )}
            
            {!loading && data.map((row, index) => (
              <tr
                key={row.id || index}
                className={onRowClick ? styles.clickableRow : ''}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => {
                  const value = getValue(row, column);
                  return (
                    <td key={column.key}>
                      {column.render ? column.render(value, row) : String(value || '-')}
                    </td>
                  );
                })}
                {detailModal && (
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRow(row);
                      }}
                      className={styles.detailButton}
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

      <div className={styles.pagination}>
        <div className={styles.totalCount}>
          Toplam <strong>{total}</strong> kayıt
        </div>
        <div className={styles.pageControls}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={styles.pageButton}
          >
            Önceki
          </button>
          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className={styles.pageButton}
          >
            Sonraki
          </button>
        </div>
        <div>
          <select
            className={styles.pageSizeSelect}
            value={currentPageSize}
            onChange={(e) => {
              setCurrentPageSize(parseInt(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>{s} Satır / Sayfa</option>
            ))}
          </select>
        </div>
      </div>

      {selectedRow && detailModal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRow(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Kayıt Detayları</h3>
              <button onClick={() => setSelectedRow(null)} className={styles.closeButton}>
                <FaTimes />
              </button>
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
