import { useEffect, useState } from 'react';
import { FaCheckCircle, FaHistory, FaRocket } from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Modal } from '../../../shared/ui/Modal/Modal';
import styles from './VersionHistoryPanel.module.css';

interface Props {
  tenantSlug: string;
  onClose?: () => void;
}

const VERSION_TYPE_LABELS: Record<string, string> = {
  auto:        'Otomatik',
  checkpoint:  'Checkpoint',
  rollback:    'Geri Alındı',
  super_admin: 'Admin',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

export function VersionHistoryPanel({ tenantSlug, onClose }: Props) {
  const { state } = useEditor();
  const { loadThemeVersions, createCheckpoint, rollbackVersion } = useThemeEditor(tenantSlug);

  const [checkpointModalOpen, setCheckpointModalOpen] = useState(false);
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [publishId, setPublishId] = useState<number | null>(null);

  useEffect(() => {
    void loadThemeVersions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const handleCheckpoint = async () => {
    if (!checkpointLabel.trim()) return;
    await createCheckpoint(checkpointLabel.trim());
    setCheckpointLabel('');
    setCheckpointModalOpen(false);
  };

  const handlePublish = async () => {
    if (publishId == null) return;
    await rollbackVersion(publishId);
    setPublishId(null);
    onClose?.();
  };

  return (
    <div className={styles.panelModal}>
      {/* Header row */}
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderLeft}>
          <FaHistory style={{ color: '#ec4899' }} />
          <span className={styles.modalHeaderTitle}>
            {state.themeVersions.length} versiyon
          </span>
        </div>
        <Button variant="ghost" onClick={() => setCheckpointModalOpen(true)}>
          + Checkpoint Oluştur
        </Button>
      </div>

      {state.versionsLoading && (
        <div className={styles.loading}>Yükleniyor...</div>
      )}

      {!state.versionsLoading && state.themeVersions.length === 0 && (
        <p className={styles.empty}>Henüz versiyon kaydı yok. İlk kaydettiğinizde otomatik oluşturulacak.</p>
      )}

      <ul className={styles.list}>
        {state.themeVersions.map(v => (
          <li key={v.id} className={`${styles.item} ${v.isPublished ? styles.published : ''}`}>
            {/* Sol: versiyon bilgisi */}
            <div className={styles.itemBody}>
              <div className={styles.itemLeft}>
                <span className={styles.versionNum}>v{v.versionNumber}</span>
                <span className={`${styles.badge} ${styles[`badge_${v.versionType}`]}`}>
                  {VERSION_TYPE_LABELS[v.versionType] ?? v.versionType}
                </span>
                {v.isPublished && (
                  <span className={styles.liveBadge}>
                    <FaCheckCircle style={{ fontSize: 9 }} /> Yayında
                  </span>
                )}
              </div>
              <div className={styles.itemMeta}>
                {v.versionLabel && <span className={styles.label}>{v.versionLabel}</span>}
                <div className={styles.metaRow}>
                  <span className={styles.time}>{timeAgo(v.createdAt)}</span>
                  {v.changedByEmail && <span className={styles.user}>· {v.changedByEmail}</span>}
                </div>
              </div>
            </div>

            {/* Sağ: aksiyon */}
            {!v.isPublished && (
              <button
                className={styles.publishBtn}
                onClick={() => setPublishId(v.id)}
                type="button"
                title="Bu versiyonu canlıya al"
              >
                <FaRocket style={{ fontSize: 10 }} />
                Canlıya Al
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Checkpoint Modal */}
      <Modal
        isOpen={checkpointModalOpen}
        onClose={() => setCheckpointModalOpen(false)}
        title="Checkpoint Oluştur"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCheckpointModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={state.isSaving} onClick={() => void handleCheckpoint()}>
              Oluştur
            </Button>
          </>
        }
      >
        <Input
          label="Checkpoint Adı"
          value={checkpointLabel}
          onChange={e => setCheckpointLabel(e.target.value)}
          placeholder="Örn: Yaz Kampanyası Teması"
        />
      </Modal>

      {/* Canlıya Al Onay Modal */}
      <Modal
        isOpen={publishId != null}
        onClose={() => setPublishId(null)}
        title="Canlıya Al"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPublishId(null)}>Vazgeç</Button>
            <Button variant="primary" isLoading={state.isSaving} onClick={() => void handlePublish()}>
              <FaRocket /> Evet, Canlıya Al
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
          Bu versiyonu geri yükleyip canlıya almak istediğinize emin misiniz?
          Mevcut tasarım otomatik olarak checkpoint'e alınacak.
        </p>
      </Modal>
    </div>
  );
}
