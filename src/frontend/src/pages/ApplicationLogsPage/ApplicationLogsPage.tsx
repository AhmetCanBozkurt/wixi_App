import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaExclamationTriangle, FaInfoCircle, FaCheckCircle,
  FaChartBar
} from 'react-icons/fa';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, DateInput, Card, Badge, Input } from '../../shared/ui';
import styles from './ApplicationLogsPage.module.css';

// ─── Types ───────────────────────────────────────────────
interface AuditLogItem {
  id: string;
  action: string;
  logType: number;
  tableName?: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  affectedColumns?: string;
  email?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
  fullName?: string;
  // Fallbacks for PascalCase from Backend
  Details?: string;
  OldValues?: string;
  NewValues?: string;
  TableName?: string;
  EntityId?: string;
  Action?: string;
  Email?: string;
  FullName?: string;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  todayCount: number;
}

// ─── Helper Components ─────────────────────────────────────
const ChangeSummary = ({ item }: { item: AuditLogItem }) => {
  const oldVal = item.oldValues || item.OldValues;
  const newVal = item.newValues || item.NewValues;
  const details = item.details || item.Details;

  if (!oldVal && !newVal) {
    return <span className={styles.detailText}>{details || '-'}</span>;
  }
  
  try {
    const oldObj = oldVal ? JSON.parse(oldVal) : {};
    const newObj = newVal ? JSON.parse(newVal) : {};
    
    const keys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
      .filter(k => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt');

    if (keys.length === 0) return <span className={styles.detailText}>{details || 'İşlem tamamlandı'}</span>;

    return (
      <div className={styles.changeList}>
        {keys.map(key => {
          const ov = oldObj[key];
          const nv = newObj[key];
          if (oldVal && newVal && JSON.stringify(ov) === JSON.stringify(nv)) return null;

          return (
            <div key={key} className={styles.changeItem}>
              <span className={styles.changeField}>{key}:</span>
              {oldVal && <span className={styles.changeOld}>{String(ov ?? 'null')}</span>}
              {oldVal && newVal && <span className={styles.changeArrow}>→</span>}
              {newVal && <span className={styles.changeNew}>{String(nv ?? 'null')}</span>}
            </div>
          );
        })}
      </div>
    );
  } catch {
    return <span className={styles.detailText}>{details || 'Format hatası'}</span>;
  }
};

const ActionBadge = ({ action }: { action: string }) => {
  const up = (action || '').toUpperCase();
  const color = (up.includes('FAILED') || up.includes('DELETE') || up.includes('ERROR')) ? '#ef4444' :
                (up.includes('WARNING') || up.includes('UPDATE')) ? '#f59e0b' :
                (up.includes('SUCCESS') || up.includes('CREATE') || up.includes('ADD')) ? '#10b981' :
                (up.includes('LOGIN') || up.includes('LOGOUT') || up.includes('VIEW') || up.includes('EXPORT')) ? '#3b82f6' : '#6b7280';
  
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
       (up.includes('SUCCESS') || up.includes('ADD')) ? <FaCheckCircle /> : <FaInfoCircle />}
      {action}
    </span>
  );
};

// ─── Constants ────────────────────────────────────────────
const toLocalDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'medium' });

const getDefaultStart = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const getDefaultEnd = () => new Date().toISOString().split('T')[0];

const LogDetailView = ({ item, onClose: _onClose }: { item: AuditLogItem, onClose: () => void }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card title="İşlem Bilgileri" subtitle="Audit detayları ve zaman damgası">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Input label="Aksiyon" value={item.action || item.Action || ''} readOnly />
            <Input label="Tablo / Kapsam" value={item.tableName || item.TableName || '-'} readOnly />
            <Input label="Entity ID" value={item.entityId || item.EntityId || '-'} readOnly />
            <Input label="Zaman" value={toLocalDate(item.createdAt)} readOnly />
          </div>
        </Card>
        <Card title="Kullanıcı & Ağ" subtitle="Giriş yapan kullanıcı ve IP adresi">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <Input label="Ad Soyad" value={item.fullName || item.FullName || 'Sistem'} readOnly />
             <Input label="E-Posta" value={item.email || item.Email || '-'} readOnly />
             <Input label="IP Adresi" value={item.ipAddress || ''} readOnly />
             <div style={{ marginTop: '8px' }}>
               <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>LOG TİPİ</label>
               <Badge variant="info" outline size="lg">{item.logType === 1 ? 'Data Audit' : item.logType === 2 ? 'Security' : item.logType === 3 ? 'Activity' : 'System'}</Badge>
             </div>
          </div>
        </Card>
      </div>
      
      <Card title="Değişim Özeti / Detaylar" subtitle="Veri bazındaki tüm değişiklikler">
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <ChangeSummary item={item} />
          {item.affectedColumns && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
              <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ETKİLENEN SÜTUNLAR:</small>
              <p style={{ fontSize: '0.85rem', marginTop: '4px', color: '#374151' }}>{item.affectedColumns}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export const ApplicationLogsPage = () => {
  const [startDate, setStart]   = useState(getDefaultStart);
  const [endDate, setEnd]       = useState(getDefaultEnd);

  const [stats, setStats] = useState<LogStats>({
    total: 0, errors: 0, warnings: 0, info: 0, todayCount: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get<LogStats>('audit/stats', {
        params: { startDate, endDate }
      });
      setStats(res.data);
    } catch { /* silent */ }
  }, [startDate, endDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const searchParams = useMemo(() => {
    return { startDate, endDate };
  }, [startDate, endDate]);

  const endpoint = 'audit';

  const columns = useMemo(() => [
    {
      field: 'action',
      title: 'AKSİYON / OLAY',
      width: 160,
      template: (row: AuditLogItem) => <ActionBadge action={row.action || row.Action || ''} />,
    },
    {
      field: 'email',
      title: 'KULLANICI',
      template: (row: AuditLogItem) => {
        const email = row.email || row.Email || 'Sistem';
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>{row.fullName || row.FullName || email}</strong>
            <small style={{ opacity: 0.5, fontSize: '0.7rem' }}>{email} • {row.ipAddress}</small>
          </div>
        );
      },
    },
    {
      field: 'tableName',
      title: 'TABLO / KAPSAM',
      template: (row: AuditLogItem) => {
        const table = row.tableName || row.TableName;
        const entityId = row.entityId || row.EntityId;
        return table ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600 }}>{table}</span>
            <small style={{ opacity: 0.5 }}>ID: {String(entityId).slice(0, 8)}</small>
          </div>
        ) : <span style={{ opacity: 0.4 }}>-</span>;
      },
    },
    {
      field: 'details',
      title: 'DETAY / DEĞİŞİM ÖZETİ',
      width: 380, // Reduced from 450
      template: (row: AuditLogItem) => <ChangeSummary item={row} />,
    },
    {
      field: 'createdAt',
      title: 'ZAMAN',
      width: 150, // More compact
      template: (row: AuditLogItem) => <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{toLocalDate(row.createdAt)}</span>,
    },
  ], []);

  return (
    <div className={styles.container}>
      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <StatCard title="Toplam Log"     value={stats.total}      color="blue"   icon={<FaChartBar />} />
        <StatCard title="Hatalar"        value={stats.errors}     color="red"    icon={<FaExclamationTriangle />} />
        <StatCard title="Uyarılar"       value={stats.warnings}   color="yellow" icon={<FaExclamationTriangle />} />
        <StatCard title="Bilgi"          value={stats.info}       color="gray"   icon={<FaInfoCircle />} />
        <StatCard title="Bugün"          value={stats.todayCount} color="green"  icon={<FaCheckCircle />} />
      </div>

      {/* Filters Wrapper */}
      <div className={styles.controlsRow}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.pageSubtitle}>Tüm Sistem Hareketleri</h2>
          <p className={styles.pageDesc}>Veri değişiklikleri, güvenlik olayları ve sistem mesajları.</p>
        </div>

        <div className={styles.premiumDateFilters}>
          <DateInput 
             value={startDate} 
             onChange={setStart} 
             placeholder="Başlangıç"
             containerClassName={styles.dateInputWrapper}
          />
          <span className={styles.dateSep}>—</span>
          <DateInput 
             value={endDate} 
             onChange={setEnd} 
             placeholder="Bitiş" 
             containerClassName={styles.dateInputWrapper}
          />
        </div>
      </div>

      <div className={styles.gridWrapper}>
        <AdvancedDataTable<AuditLogItem>
          dataSource={endpoint}
          searchParams={searchParams}
          columns={columns}
          pageable={{ pageSize: 15 }}
          toolbar={['search', 'excel', 'pdf']}
          exportTitle="Sistem_Loglari"
          resizable={true}
          sortable={true}
          groupable={true}
          selectable={true}
          detailModal={(row, onClose) => <LogDetailView item={row} onClose={onClose} />}
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
