import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaExclamationTriangle, FaInfoCircle, FaCheckCircle,
  FaSearch, FaCalendar, FaChartBar
} from 'react-icons/fa';
import { apiClient } from '../../shared/api/axiosConfig';
import { useAuthStore } from '../../entities/User/model/store';
import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import styles from './ApplicationLogsPage.module.css';

// ─── Types ───────────────────────────────────────────────
interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  todayCount: number;
}

// ─── Helpers ─────────────────────────────────────────────
const getDefaultStart = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const getDefaultEnd = () => new Date().toISOString().split('T')[0];

const toLocalDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'medium' });

// ─── Action Badge ─────────────────────────────────────────
const ActionBadge = ({ action }: { action: string }) => {
  const up = action.toUpperCase();
  if (up.includes('FAILED') || up.includes('DELETE') || up.includes('ERROR'))
    return <span className={`${styles.badge} ${styles.red}`}><FaExclamationTriangle /> {action}</span>;
  if (up.includes('WARNING') || up.includes('UPDATE'))
    return <span className={`${styles.badge} ${styles.yellow}`}><FaExclamationTriangle /> {action}</span>;
  if (up.includes('SUCCESS') || up.includes('CREATE'))
    return <span className={`${styles.badge} ${styles.green}`}><FaCheckCircle /> {action}</span>;
  if (up.includes('LOGIN') || up.includes('LOGOUT'))
    return <span className={`${styles.badge} ${styles.blue}`}><FaInfoCircle /> {action}</span>;
  return <span className={`${styles.badge} ${styles.gray}`}><FaInfoCircle /> {action}</span>;
};

// ─── Column Definitions ───────────────────────────────────
const COLUMNS = [
  {
    key: 'action',
    header: 'İŞLEM',
    render: (val: string) => <ActionBadge action={val} />,
    filterable: true,
  },
  {
    key: 'email',
    header: 'E-POSTA',
    render: (val: string) => val || '-',
    searchable: true,
    sortable: true,
  },
  {
    key: 'ipAddress',
    header: 'IP ADRESİ',
    render: (val: string) => <code style={{ fontSize: '0.8rem' }}>{val || '-'}</code>,
  },
  {
    key: 'entityName',
    header: 'VARLIK',
    render: (val: string, row: any) => val ? `${val} #${String(row.entityId ?? '').slice(0, 8)}` : '-',
  },
  {
    key: 'createdAt',
    header: 'TARİH / SAAT',
    render: (val: string) => toLocalDate(val),
    sortable: true,
  },
];

// ─── Page ─────────────────────────────────────────────────
export const ApplicationLogsPage = () => {
  const [stats, setStats] = useState<LogStats>({ total: 0, errors: 0, warnings: 0, info: 0, todayCount: 0 });
  const [filter, setFilter]   = useState('all');
  const [searchTerm, setSearch] = useState('');
  const [startDate, setStart]   = useState(getDefaultStart);
  const [endDate, setEnd]       = useState(getDefaultEnd);

  // Stable getAuthToken (never changes reference)
  const getAuthToken = useCallback(async () =>
    useAuthStore.getState().token,
  []);

  // Stable searchParams — only changes when actual values change
  const searchParams = useMemo<Record<string, string>>(() => {
    const p: Record<string, string> = { startDate, endDate };
    if (filter !== 'all') p.action = filter;
    if (searchTerm)        p.search  = searchTerm;
    return p;
  }, [filter, searchTerm, startDate, endDate]);

  // Stats (own fetch, lightweight)
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get<LogStats>('/admin/logs/audit/stats', { params: { startDate, endDate } });
      setStats(res.data);
    } catch { /* silent */ }
  }, [startDate, endDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Backend API base for AdvancedDataTable
  const endpoint = `${apiClient.defaults.baseURL}/admin/logs/audit`;

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard title="Toplam Log"  value={stats.total}      color="blue"   icon={<FaChartBar />} />
        <StatCard title="Hatalar"     value={stats.errors}     color="red"    icon={<FaExclamationTriangle />} />
        <StatCard title="Uyarılar"    value={stats.warnings}   color="yellow" icon={<FaExclamationTriangle />} />
        <StatCard title="Bilgi"       value={stats.info}       color="blue"   icon={<FaInfoCircle />} />
        <StatCard title="Bugün"       value={stats.todayCount} color="green"  icon={<FaCheckCircle />} />
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="IP, e-posta veya işlem filtrele..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.dateFilters}>
          <FaCalendar className={styles.dateIcon} />
          <input type="date" className={styles.dateInput} value={startDate} onChange={e => setStart(e.target.value)} />
          <span className={styles.dateSep}>—</span>
          <input type="date" className={styles.dateInput} value={endDate}   onChange={e => setEnd(e.target.value)} />
        </div>

        <div className={styles.actionTags}>
          {['all', 'LOGIN', 'SUCCESS', 'FAILED', 'ERROR'].map(act => (
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

      {/* Advanced Data Table */}
      <AdvancedDataTable
        endpoint={endpoint}
        columns={COLUMNS}
        pageSize={15}
        searchParams={searchParams}
        getAuthToken={getAuthToken}
      />
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────
const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: React.ReactNode }) => (
  <div className={styles.statCard}>
    <div className={styles.statInfo}>
      <span className={styles.statTitle}>{title}</span>
      <span className={`${styles.statValue} ${styles[color as keyof typeof styles]}`}>{value}</span>
    </div>
    <span className={`${styles.statIcon} ${styles[color as keyof typeof styles]}`}>{icon}</span>
  </div>
);
