import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../shared/api/axiosConfig';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import styles from './AdminTenantThemePage.module.css';

interface ThemeVersion {
  id: number;
  versionNumber: number;
  versionLabel: string | null;
  versionType: string;
  isPublished: boolean;
  changedByEmail: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  auto: 'Otomatik',
  checkpoint: 'Checkpoint',
  rollback: 'Geri Alındı',
  super_admin: 'Admin',
};

const TYPE_COLORS: Record<string, string> = {
  auto: '#6b7280',
  checkpoint: '#3b82f6',
  rollback: '#f59e0b',
  super_admin: '#8b5cf6',
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} sa önce`;
  return new Date(iso).toLocaleDateString('tr-TR');
};

export const AdminTenantThemePage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<ThemeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackId, setRollbackId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await apiClient.get<ThemeVersion[]>(
        `/admin/theme-management/stores/${tenantId}/versions`
      );
      setVersions(res.data);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRollback = async () => {
    if (!tenantId || rollbackId == null) return;
    setProcessing(true);
    try {
      await apiClient.post(
        `/admin/theme-management/stores/${tenantId}/versions/${rollbackId}/rollback`
      );
      setRollbackId(null);
      await load();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/admin/theme-management')}>
          ← Geri
        </Button>
        <div>
          <h2 className={styles.title}>Tema Versiyon Geçmişi</h2>
          <p className={styles.subtitle}>Tenant ID: {tenantId}</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : (
        <ul className={styles.list}>
          {versions.map(v => (
            <li
              key={v.id}
              className={`${styles.item} ${v.isPublished ? styles.published : ''}`}
            >
              <div className={styles.row}>
                <span className={styles.vNum}>v{v.versionNumber}</span>
                <span
                  className={styles.badge}
                  style={{
                    background: (TYPE_COLORS[v.versionType] ?? '#6b7280') + '33',
                    color: TYPE_COLORS[v.versionType] ?? '#6b7280',
                  }}
                >
                  {TYPE_LABELS[v.versionType] ?? v.versionType}
                </span>
                {v.isPublished && <span className={styles.live}>Yayında</span>}
                <span className={styles.time}>{timeAgo(v.createdAt)}</span>
                {v.changedByEmail && (
                  <span className={styles.user}>{v.changedByEmail}</span>
                )}
              </div>
              {v.versionLabel && (
                <div className={styles.label}>{v.versionLabel}</div>
              )}
              {!v.isPublished && (
                <Button variant="ghost" onClick={() => setRollbackId(v.id)}>
                  Zorla Geri Al ↩
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={rollbackId != null}
        onClose={() => setRollbackId(null)}
        title="Versiyona Zorla Geri Dön"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRollbackId(null)}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={processing}
              onClick={() => void handleRollback()}
            >
              Geri Al
            </Button>
          </>
        }
      >
        <p>
          Bu tenant'ın teması seçilen versiyona geri alınacak. Mevcut tema yeni bir
          super_admin versiyonu olarak kaydedilecek.
        </p>
      </Modal>
    </div>
  );
};
