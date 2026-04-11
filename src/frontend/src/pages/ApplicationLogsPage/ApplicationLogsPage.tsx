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
  const color = (up.includes('FAILED') || up.includes('DELETE') || up.includes('ERROR')) ? '#ef4444' :
                (up.includes('WARNING') || up.includes('UPDATE')) ? '#f59e0b' :
                (up.includes('SUCCESS') || up.includes('CREATE')) ? '#10b981' :
                (up.includes('LOGIN') || up.includes('LOGOUT')) ? '#3b82f6' : '#6b7280';
  
  return (
    <span style={{ 
      backgroundColor: `${color}15`, 
      color: color, 
      padding: '2px 8px', 
      borderRadius: '4px', 
      fontSize: '0.75rem', 
      fontWeight: 'bold',
      border: `1px solid ${color}30`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {up.includes('FAILED') || up.includes('ERROR') ? <FaExclamationTriangle /> : 
       up.includes('SUCCESS') ? <FaCheckCircle /> : <FaInfoCircle />}
      {action}
    </span>
  );
};

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

      {/* Filters */}
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

      <div className={styles.gridWrapper}>
        <AdvancedDataTable<AuditLogItem>
          dataSource={endpoint}
          searchParams={searchParams}
          columns={[
            {
              field: 'action',
              title: 'İŞLEM',
              width: 160,
              template: (row) => <ActionBadge action={row.action} />,
            },
            {
              field: 'email',
              title: 'E-POSTA',
              template: (row) => <strong>{row.email || '-'}</strong>,
            },
            {
              field: 'ipAddress',
              title: 'IP ADRESİ',
              width: 140,
              template: (row) => <code style={{ fontSize: '0.8rem', opacity: 0.8 }}>{row.ipAddress || '-'}</code>,
            },
            {
              field: 'entityName',
              title: 'VARLIK',
              template: (row) => row.entityName ? (
                <span>{row.entityName} <small style={{ opacity: 0.5 }}>#{String(row.entityId).slice(0,8)}</small></span>
              ) : '-',
            },
            {
              field: 'createdAt',
              title: 'TARİH / SAAT',
              width: 200,
              template: (row) => <span style={{ fontFamily: 'monospace' }}>{toLocalDate(row.createdAt)}</span>,
            },
          ]}
          pageable={{ pageSize: 15 }}
          sortable={true}
          groupable={true}
          resizable={true}
          reorderable={true}
          selectable={true}
          toolbar={['search', 'excel', 'pdf']}
        />
      </div>
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
