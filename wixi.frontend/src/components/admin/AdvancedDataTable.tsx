import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaEye, FaTimes } from 'react-icons/fa';

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

const AdvancedDataTable = <T extends Record<string, any>>({
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

      // Use debounced global search
      if (debouncedGlobalSearch) {
        params.append('search', debouncedGlobalSearch);
      }

      // Column-specific filters
      Object.entries(columnFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      // Column-specific searches
      Object.entries(columnSearches).forEach(([key, value]) => {
        if (value) {
          params.append(`${key}_search`, value);
        }
      });

      // Sorting
      if (sortColumn) {
        params.append('sortBy', sortColumn);
        params.append('sortOrder', sortDirection);
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${endpoint}?${params.toString()}`;
      console.log('Fetching data from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Response data:', result);
      
      // Handle different response formats: array, {items: []}, {data: []}, or {items: [], total: number}
      let dataArray: T[] = [];
      let totalCount = 0;
      
      if (Array.isArray(result)) {
        // Direct array response
        dataArray = result;
        totalCount = result.length;
      } else if (result.items) {
        // Paginated response with items
        dataArray = Array.isArray(result.items) ? result.items : [];
        totalCount = result.total || dataArray.length;
      } else if (result.data) {
        // Response with data property
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

  // Single effect for fetching data
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
    <div className="p-4 lg:p-6">
      {/* Global Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <FaSearch className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
            placeholder="Tüm tabloda ara..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    <div className="space-y-2">
                      {/* Header with Sort */}
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        {column.sortable && (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                          >
                            {sortColumn === column.key ? (
                              sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />
                            ) : (
                              <FaChevronDown className="opacity-30" />
                            )}
                          </button>
                        )}
                        {(column.filterable || column.searchable) && (
                          <button
                            onClick={() => toggleFilter(column.key)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                          >
                            <FaFilter />
                          </button>
                        )}
                      </div>

                      {/* Filter/Search Inputs */}
                      {(column.filterable || column.searchable) && expandedFilters[column.key] && (
                        <div className="space-y-1">
                          {column.filterable && (
                            <input
                              type="text"
                              className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                              placeholder={`${column.header} filtrele...`}
                              value={columnFilters[column.key] || ''}
                              onChange={(e) => handleFilterChange(column.key, e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                            />
                          )}
                          {column.searchable && (
                            <div className="flex items-center gap-1">
                              <FaSearch className="text-xs text-gray-400 dark:text-gray-500" />
                              <input
                                type="text"
                                className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
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
                {detailModal && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlem
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {loading && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={columns.length + (detailModal ? 1 : 0)}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                      <span>Yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="px-4 py-8 text-center text-red-500 dark:text-red-400" colSpan={columns.length + (detailModal ? 1 : 0)}>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold">Hata: {error}</span>
                      <button
                        onClick={() => fetchData()}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                      >
                        Tekrar Dene
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && data.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={columns.length + (detailModal ? 1 : 0)}>
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
              {!loading && data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => {
                    const value = getValue(row, column);
                    return (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300"
                      >
                        {column.render ? column.render(value, row) : String(value || '-')}
                      </td>
                    );
                  })}
                  {detailModal && (
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRow(row);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
                      >
                        <FaEye />
                        Detay
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
            Toplam: {total} kayıt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Önceki
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Sonraki
            </button>
          </div>
          <div>
            <select
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              value={currentPageSize}
              onChange={(e) => {
                setCurrentPageSize(parseInt(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>{s}/sayfa</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRow && detailModal && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Detay</h3>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              {detailModal(selectedRow, () => setSelectedRow(null))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDataTable;

