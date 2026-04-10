import { useState, useEffect, useCallback } from 'react';
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaSearch,
  FaCalendar,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { apiClient } from '../../shared/api/axiosConfig';
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

// ─── Constants ───────────────────────────────────────────
const PAGE_SIZE = 15;

const toLocalDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'medium' });

const getDefaultStart = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const getDefaultEnd = () => new Date().toISOString().split('T')[0];

// ─── Badge ───────────────────────────────────────────────
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

// ─── Page Component ───────────────────────────────────────
export const ApplicationLogsPage = () => {
  const [logs, setLogs]       = useState<AuditLogItem[]>([]);
  const [totalCount, setTotal] = useState(0);
  const [loading, setLoading]  = useState(false);
  const [page, setPage]        = useState(1);

  const [stats, setStats] = useState<LogStats>({ total: 0, errors: 0, warnings: 0, info: 0, todayCount: 0 });

  const [filter, setFilter]     = useState('all');
  const [searchTerm, setSearch] = useState('');
  const [startDate, setStart]   = useState(getDefaultStart);
  const [endDate, setEnd]       = useState(getDefaultEnd);

  // ── Fetch logs ──
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize: PAGE_SIZE,
        startDate,
        endDate,
      };
      if (filter !== 'all')  params.action = filter;
      if (searchTerm)        params.search  = searchTerm;

      const res = await apiClient.get<{ totalCount: number; items: AuditLogItem[] }>(
        '/admin/logs/audit',
        { params }
      );
      setLogs(res.data.items ?? []);
      setTotal(res.data.totalCount ?? 0);
    } catch {
      /* apiClient interceptor already shows toast for 500 */
    } finally {
      setLoading(false);
    }
  }, [page, filter, searchTerm, startDate, endDate]);

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get<LogStats>('/admin/logs/audit/stats', {
        params: { startDate, endDate }
      });
      setStats(res.data);
    } catch { /* silent */ }
  }, [startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Reset to page 1 when filters change (except page itself)
  useEffect(() => { setPage(1); }, [filter, searchTerm, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className={styles.container}>
      {/* ─── Stats Cards ─── */}
      <div className={styles.statsGrid}>
        <StatCard title="Toplam Log"  value={stats.total}      color="blue"   icon={<FaChartBar />} />
        <StatCard title="Hatalar"     value={stats.errors}     color="red"    icon={<FaExclamationTriangle />} />
        <StatCard title="Uyarılar"    value={stats.warnings}   color="yellow" icon={<FaExclamationTriangle />} />
        <StatCard title="Bilgi"       value={stats.info}       color="blue"   icon={<FaInfoCircle />} />
        <StatCard title="Bugün"       value={stats.todayCount} color="green"  icon={<FaCheckCircle />} />
      </div>

      {/* ─── Filters ─── */}
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="IP, kullanıcı veya işlem ara..."
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

      {/* ─── Table ─── */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>İŞLEM</th>
                <th>E-POSTA</th>
                <th>IP ADRESİ</th>
                <th>TARİH / SAAT</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className={styles.centerCell}>
                    <span className={styles.spinner} /> Yükleniyor...
                  </td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.centerCell}>Kayıt bulunamadı.</td>
                </tr>
              )}
              {!loading && logs.map(row => (
                <tr key={row.id}>
                  <td><ActionBadge action={row.action} /></td>
                  <td className={styles.mutedCell}>{row.email ?? row.userId ?? '-'}</td>
                  <td className={styles.codeCell}>{row.ipAddress ?? '-'}</td>
                  <td className={styles.mutedCell}>{toLocalDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Toplam <strong>{totalCount}</strong> kayıt &nbsp;|&nbsp; Sayfa {page} / {totalPages}
          </span>
          <div className={styles.pageButtons}>
            <button
              className={styles.pageBtn}
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => p - 1)}
            >
              <FaChevronLeft />
            </button>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card (local) ────────────────────────────────────
const StatCard = ({
  title, value, color, icon
}: { title: string; value: number; color: string; icon: React.ReactNode }) => (
  <div className={styles.statCard}>
    <div className={styles.statInfo}>
      <span className={styles.statTitle}>{title}</span>
      <span className={`${styles.statValue} ${styles[color]}`}>{value}</span>
    </div>
    <span className={`${styles.statIcon} ${styles[color]}`}>{icon}</span>
  </div>
);
