import { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle,
  FaSearch,
  FaCalendar,
  FaChartBar
} from 'react-icons/fa';
import { apiClient } from '../../shared/api/axiosConfig';
import { useAuthStore } from '../../entities/User/model/store';
import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import styles from './ApplicationLogsPage.module.css';

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  todayCount: number;
}

export const ApplicationLogsPage = () => {
  const [stats, setStats] = useState<LogStats>({
    total: 0, errors: 0, warnings: 0, info: 0, todayCount: 0
  });
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date format: YYYY-MM-DD
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const loadStats = async () => {
    try {
      const statsRes = await apiClient.get('/admin/logs/audit/stats', {
        params: { startDate: dateFilter.startDate, endDate: dateFilter.endDate }
      });
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      console.error('Log stats fetch error', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, [dateFilter]);

  const getActionBadge = (action: string) => {
    const actionUpper = action.toUpperCase();
    if (actionUpper.includes('DELETE') || actionUpper.includes('FAILED')) {
      return <span className={`${styles.badge} ${styles.red}`}><FaExclamationTriangle /> {action}</span>;
    } 
    if (actionUpper.includes('UPDATE') || actionUpper.includes('WARNING')) {
      return <span className={`${styles.badge} ${styles.yellow}`}><FaExclamationTriangle /> {action}</span>;
    } 
    if (actionUpper.includes('CREATE') || actionUpper.includes('SUCCESS')) {
      return <span className={`${styles.badge} ${styles.green}`}><FaCheckCircle /> {action}</span>;
    } 
    if (actionUpper.includes('LOGIN') || actionUpper.includes('LOGOUT')) {
      return <span className={`${styles.badge} ${styles.blue}`}><FaInfoCircle /> {action}</span>;
    }
    return <span className={`${styles.badge} ${styles.gray}`}><FaInfoCircle /> {action}</span>;
  };

  // We let AdvancedDataTable handle the internal fetching. We just provide search and tags via searchParams.
  // AdvancedDataTable supports global search and sorting inherently.

  const columns = [
    { key: 'action', header: 'İŞLEM', render: (val: string) => getActionBadge(val) },
    { key: 'createdAt', header: 'TARİH/SAAT', render: (val: string) => new Date(val).toLocaleString('tr-TR') },
    { key: 'entityName', header: 'VARLIK', render: (val: string, row: any) => val ? `${val} (${row.entityId || '-'})` : '-' },
    { key: 'userId', header: 'KULLANICI ID', render: (val: string) => val || '-' },
    { key: 'ipAddress', header: 'IP ADRESİ', render: (val: string) => val || '-' },
  ];

  return (
    <div className={styles.container}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Toplam Log</span>
            <span className={`${styles.statValue} ${styles.blue}`}>{stats.total}</span>
          </div>
          <FaChartBar className={`${styles.statIcon} ${styles.blue}`} />
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Hatalar</span>
            <span className={`${styles.statValue} ${styles.red}`}>{stats.errors}</span>
          </div>
          <FaExclamationTriangle className={`${styles.statIcon} ${styles.red}`} />
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Uyarılar</span>
            <span className={`${styles.statValue} ${styles.yellow}`}>{stats.warnings}</span>
          </div>
          <FaExclamationTriangle className={`${styles.statIcon} ${styles.yellow}`} />
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Bilgi</span>
            <span className={`${styles.statValue} ${styles.blue}`}>{stats.info}</span>
          </div>
          <FaInfoCircle className={`${styles.statIcon} ${styles.blue}`} />
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Bugün</span>
            <span className={`${styles.statValue} ${styles.green}`}>{stats.todayCount}</span>
          </div>
          <FaCheckCircle className={`${styles.statIcon} ${styles.green}`} />
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Log mesajı, IP veya kullanıcı ara..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.dateFilters}>
          <FaCalendar className={styles.dateIcon} />
          <input type="date" className={styles.dateInput} value={dateFilter.startDate} onChange={e => setDateFilter({...dateFilter, startDate: e.target.value})} />
          <span className={styles.dateSep}>-</span>
          <input type="date" className={styles.dateInput} value={dateFilter.endDate} onChange={e => setDateFilter({...dateFilter, endDate: e.target.value})} />
        </div>

        <div className={styles.actionTags}>
          {['all', 'Create', 'Update', 'Delete', 'Login'].map(act => (
            <button 
              key={act} 
              className={`${styles.tagBtn} ${filter === act ? styles.active : ''}`}
              onClick={() => setFilter(act)}
            >
              {act === 'all' ? 'Tümü' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <AdvancedDataTable 
        endpoint={`${apiClient.defaults.baseURL}/admin/logs/audit`}
        searchParams={{
            ...(filter !== 'all' ? { action: filter } : {}),
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
            search: searchTerm
        }}
        columns={columns}
        pageSize={15}
        getAuthToken={async () => {
             return useAuthStore.getState().token;
        }}
      />
    </div>
  );
};
