import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaExclamationTriangle, FaInfoCircle, FaCheckCircle,
  FaCalendar, FaChartBar
} from 'react-icons/fa';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import styles from './ApplicationLogsPage.module.css';

// ─── Types ───────────────────────────────────────────────
interface AuditLogItem {
  id: string;
  action: string;
  userId?: string;
  entityName?: string;
  entityId?: string;
  email?: string;
  ipAddress?: string;
  createdAt: string;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  todayCount: number;
}

// ─── Constants ────────────────────────────────────────────
const toLocalDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'medium' });

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

const COLUMNS = [
  {
    key: 'action',
    header: 'İŞLEM',
    render: (val: string) => <ActionBadge action={val} />,
  },
  {
    key: 'email',
    header: 'E-POSTA',
    sortable: true,
    render: (val: string) => val || '-',
  },
  {
    key: 'ipAddress',
    header: 'IP ADRESİ',
    render: (val: string) => <code style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{val || '-'}</code>,
  },
  {
    key: 'entityName',
    header: 'VARLIK',
    render: (val: string, row: AuditLogItem) =>
      val ? `${val} #${String(row.entityId ?? '').slice(0, 8)}` : '-',
  },
  {
    key: 'createdAt',
    header: 'TARİH / SAAT',
    sortable: true,
    render: (val: string) => toLocalDate(val),
  },
];

// Default date values
const getDefaultStart = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const getDefaultEnd = () => new Date().toISOString().split('T')[0];

export const ApplicationLogsPage = () => {
  // Filters
  const [filter, setFilter]     = useState('all');
  const [startDate, setStart]   = useState(getDefaultStart);
  const [endDate, setEnd]       = useState(getDefaultEnd);

  // Stats
  const [stats, setStats] = useState<LogStats>({
    total: 0, errors: 0, warnings: 0, info: 0, todayCount: 0
  });

  // Fetch stats (independent of the table)
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get<LogStats>('/admin/logs/audit/stats', {
        params: { startDate, endDate }
      });
      setStats(res.data);
    } catch { /* silent */ }
  }, [startDate, endDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Stable searchParams for AdvancedDataTable
  // Stringify check inside the table will prevent re-fetches if these don't change
  const searchParams = useMemo(() => {
    const params: Record<string, string> = { startDate, endDate };
    if (filter !== 'all') params.action = filter;
    return params;
  }, [filter, startDate, endDate]);

  const endpoint = '/admin/logs/audit';

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

      {/* Filters (only for stats and base search params) */}
      <div className={styles.filtersCard}>
        <div className={styles.dateFilters}>
          <FaCalendar className={styles.dateIcon} />
          <input type="date" className={styles.dateInput} value={startDate} onChange={e => setStart(e.target.value)} />
          <span className={styles.dateSep}>—</span>
          <input type="date" className={styles.dateInput} value={endDate} onChange={e => setEnd(e.target.value)} />
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

      {/*
        ENDPOINT MODE: AdvancedDataTable handles fetching via apiClient.
        - No infinite loop: protected by useMemo searchParams + internal JSON.stringify check.
        - No CORS error: uses project's apiClient.
        - No double audit requests: Page doesn't fetch logs anymore.
      */}
      <AdvancedDataTable
        endpoint={endpoint}
        searchParams={searchParams}
        columns={COLUMNS}
        pageSize={15}
      />
    </div>
  );
};

const StatCard = ({
  title, value, color, icon
}: { title: string; value: number; color: string; icon: React.ReactNode }) => (
  <div className={styles.statCard}>
    <div className={styles.statInfo}>
      <span className={styles.statTitle}>{title}</span>
      <span className={`${styles.statValue} ${styles[color as keyof typeof styles]}`}>{value}</span>
    </div>
    <span className={`${styles.statIcon} ${styles[color as keyof typeof styles]}`}>{icon}</span>
  </div>
);
