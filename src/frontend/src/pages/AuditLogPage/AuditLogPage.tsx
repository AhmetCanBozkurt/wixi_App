import { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaEye, FaTimes, FaUserEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Badge } from '../../shared/ui/Badge/Badge';
import styles from './AuditLogPage.module.css';

interface AuditLog {
  id: string;
  action: string;
  tableName: string;
  entityId: string;
  oldValues: string | null;
  newValues: string | null;
  affectedColumns: string | null;
  details: string;
  userId: string;
  email: string;
  fullName: string | null;
  ipAddress: string;
  createdAt: string;
}

export const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<AuditLog[]>('audit');
      setLogs(res.data);
    } catch {
      toast.error('Girişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatJSON = (jsonString: string | null) => {
    if (!jsonString) return '---';
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonString;
    }
  };

  const getActionVariant = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('added')) return 'success';
    if (act.includes('delete')) return 'danger';
    if (act.includes('update') || act.includes('modified')) return 'warning';
    return 'info';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaHistory className={styles.mainIcon} />
          <div>
            <h1>Denetim Günlükleri</h1>
            <p>Sistem genelindeki tüm değişiklikleri ve kullanıcı aktivitelerini takip edin.</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <AdvancedDataTable<AuditLog>
          dataSource={logs}
          columns={[
            {
              field: 'createdAt',
              title: 'Tarih',
              width: 180,
              template: (row) => <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{new Date(row.createdAt).toLocaleString('tr-TR')}</span>
            },
            {
              field: 'fullName',
              title: 'Kullanıcı',
              template: (row) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{row.fullName || 'Sistem'}</strong>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{row.email}</small>
                </div>
              )
            },
            {
              field: 'action',
              title: 'İşlem',
              width: 140,
              template: (row) => {
                const variant = getActionVariant(row.action);
                const color = variant === 'success' ? '#10b981' : variant === 'danger' ? '#ef4444' : variant === 'warning' ? '#f59e0b' : '#3b82f6';
                return (
                  <span style={{ 
                    backgroundColor: `${color}20`, 
                    color: color, 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    border: `1px solid ${color}40`
                  }}>
                    {row.action}
                  </span>
                );
              }
            },
            { field: 'tableName', title: 'Tablo', width: 140 },
            { 
              field: 'ipAddress', 
              title: 'IP Adresi', 
              width: 130,
              template: (row) => <code style={{ fontSize: '0.75rem' }}>{row.ipAddress}</code>
            },
            { field: 'details', title: 'Detay Açıklama' }
          ]}
          groupable={true}
          sortable={true}
          filterable={false} // Clean mode
          resizable={true}
          reorderable={true}
          pageable={{ pageSize: 15 }}
          toolbar={['search', 'excel', 'pdf']}
          onDetail={(row) => setSelectedLog(row)}
        />
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLog(null)}>
          <div className={`${styles.modal} ${styles.auditModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <FaUserEdit style={{ color: 'var(--color-primary)' }} /> 
                Değişiklik Detayı
              </h3>
              <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.diffContainer}>
                <div className={styles.diffSection}>
                  <h4>Eski Değerler</h4>
                  <pre className={styles.jsonBlock}>{formatJSON(selectedLog.oldValues)}</pre>
                </div>
                <div className={styles.diffSection}>
                  <h4>Yeni Değerler</h4>
                  <pre className={styles.jsonBlock}>{formatJSON(selectedLog.newValues)}</pre>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSelectedLog(null)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
