import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaBug, 
  FaCheckCircle,
  FaSearch,
  FaCalendar,
  FaChartBar
} from 'react-icons/fa';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import { TokenService } from '../../ApiServices/services/TokenService';

interface ApplicationLog {
  id: number;
  userId?: number;
  action: string;
  entityName?: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
  todayCount: number;
}

const ApplicationLogs: React.FC = () => {
  const [logs, setLogs] = useState<ApplicationLog[]>([]);
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    debug: 0,
    todayCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<ApplicationLog | null>(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filter, dateFilter, page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        action: filter !== 'all' ? filter : '',
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      });

      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/logs/audit?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        // Map backend format to frontend format
        const mappedLogs = items.map((log: any) => ({
          id: log.id || log.Id,
          userId: log.userId || log.UserId,
          action: log.action || log.Action || 'Unknown',
          entityName: log.entityName || log.EntityName,
          entityId: log.entityId || log.EntityId,
          ipAddress: log.ipAddress || log.IpAddress,
          createdAt: log.createdAt || log.CreatedAt || new Date().toISOString()
        }));
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error('Loglar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        return;
      }
      
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/logs/audit/stats?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Map backend stats format to frontend format
        setStats({
          total: data.total || 0,
          errors: 0, // Backend doesn't provide error count by level
          warnings: 0,
          info: 0,
          debug: 0,
          todayCount: data.todayCount || 0
        });
      }
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const getActionBadge = (action: string) => {
    const actionUpper = action.toUpperCase();
    
    // Determine badge color based on action type
    if (actionUpper.includes('DELETE') || actionUpper.includes('REMOVE')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 flex items-center gap-1 transition-colors duration-300">
          <FaExclamationTriangle /> {action}
        </span>
      );
    } else if (actionUpper.includes('UPDATE') || actionUpper.includes('EDIT')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 flex items-center gap-1 transition-colors duration-300">
          <FaExclamationTriangle /> {action}
        </span>
      );
    } else if (actionUpper.includes('CREATE') || actionUpper.includes('ADD')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex items-center gap-1 transition-colors duration-300">
          <FaCheckCircle /> {action}
        </span>
      );
    } else if (actionUpper.includes('LOGIN') || actionUpper.includes('LOGOUT')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center gap-1 transition-colors duration-300">
          <FaInfoCircle /> {action}
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-1 transition-colors duration-300">
          <FaInfoCircle /> {action}
        </span>
      );
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      log.action.toUpperCase().includes(filter.toUpperCase());
    
    return matchesSearch && matchesFilter;
  });

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Toplam Log</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">{stats.total}</p>
            </div>
            <FaChartBar className="text-3xl text-blue-500 dark:text-blue-400 transition-colors duration-300" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Hatalar</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">{stats.errors}</p>
            </div>
            <FaExclamationTriangle className="text-3xl text-red-500 dark:text-red-400 transition-colors duration-300" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Uyarılar</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 transition-colors duration-300">{stats.warnings}</p>
            </div>
            <FaExclamationTriangle className="text-3xl text-yellow-500 dark:text-yellow-400 transition-colors duration-300" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Bilgi</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{stats.info}</p>
            </div>
            <FaInfoCircle className="text-3xl text-blue-500 dark:text-blue-400 transition-colors duration-300" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Bugün</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{stats.todayCount}</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-500 dark:text-green-400 transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Log mesajı, path veya kullanıcı ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex gap-2 items-center">
            <FaCalendar className="text-gray-400 dark:text-gray-500" />
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
            />
          </div>

          {/* Action Filter */}
          <div className="flex gap-2">
            {['all', 'Create', 'Update', 'Delete', 'Login'].map((action) => (
              <button
                key={action}
                onClick={() => setFilter(action === 'all' ? 'all' : action)}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-300 ${
                  filter === action || (filter === 'all' && action === 'all')
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {action === 'all' ? 'Tümü' : action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            <thead className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tarih/Saat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Varlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kullanıcı ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP Adresi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    <FaInfoCircle className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-2 transition-colors duration-300" />
                    <p>Seçili filtreler için log bulunamadı</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      <div className="max-w-md truncate" title={log.entityName ? `${log.entityName} (${log.entityId || 'N/A'})` : 'N/A'}>
                        {log.entityName ? `${log.entityName}${log.entityId ? ` (${log.entityId})` : ''}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {log.userId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      <div className="max-w-xs truncate" title={log.ipAddress || ''}>
                        {log.ipAddress || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
              Toplam {filteredLogs.length} kayıt gösteriliyor
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                Önceki
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Sayfa {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={filteredLogs.length < pageSize}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300" onClick={() => setSelectedLog(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Log Detayı</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">İşlem</label>
                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Tarih/Saat</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">{new Date(selectedLog.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Varlık Adı</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-3 rounded-md transition-colors duration-300">{selectedLog.entityName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Varlık ID</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-3 rounded-md transition-colors duration-300">{selectedLog.entityId || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.userId && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Kullanıcı ID</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">{selectedLog.userId}</p>
                    </div>
                  )}
                  {selectedLog.ipAddress && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">IP Adresi</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">{selectedLog.ipAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationLogs;


