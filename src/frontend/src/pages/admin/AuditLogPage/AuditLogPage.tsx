import { useState, useEffect, useCallback } from 'react';
import { FaHistory } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Modal, Card, Button } from '../../../shared/ui';
import styles from './AuditLogPage.module.css';

interface AuditLog extends Record<string, unknown> {
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
  const [_loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ items: AuditLog[] }>('audit');
      setLogs(res.data.items || []);
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
              template: (row) => {
                const userName = row.fullName || (row.FullName as string) || 'Sistem';
                const userEmail = row.email || (row.Email as string) || '';
                return (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>{userName}</strong>
                    {userEmail && <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{userEmail}</small>}
                  </div>
                );
              }
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
          exportTitle="Denetim_Gunlukleri"
          onDetail={(row) => setSelectedLog(row)}
        />
      </div>

      {/* Premium Detail Modal Upgrade */}
      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)}
        title="İşlem ve Değişiklik Detayı"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setSelectedLog(null)}>Kapat</Button>
        }
      >
        {selectedLog && (
          <div className={styles.premiumModalContent}>
            <div className={styles.logMetaInfo}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>İşlemi Yapan:</span>
                <span className={styles.metaValue}>{selectedLog.fullName || 'Sistem'} ({selectedLog.email})</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tarih:</span>
                <span className={styles.metaValue}>{new Date(selectedLog.createdAt).toLocaleString('tr-TR')}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tablo:</span>
                <Badge variant="info">{selectedLog.tableName}</Badge>
              </div>
            </div>

            <div className={styles.modalGrid}>
                <Card title="Eski Veri" subtitle="Değişiklik öncesi durum">
                  <pre className={styles.jsonBlock}>{formatJSON(selectedLog.oldValues)}</pre>
                </Card>
                <Card title="Yeni Veri" subtitle="Değişiklik sonrası durum">
                  <pre className={styles.jsonBlock}>{formatJSON(selectedLog.newValues)}</pre>
                </Card>
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <Card title="İşlem Detayı" padding="sm">
                   <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedLog.details || 'Detaylı açıklama bulunmuyor.'}</p>
                </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
