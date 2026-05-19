import { useEffect, useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { Button } from '../../../../../shared/ui/Button/Button';
import { Input } from '../../../../../shared/ui/Input/Input';
import { Modal } from '../../../../../shared/ui/Modal/Modal';
import styles from './VersionHistoryPanel.module.css';

interface Props { tenantSlug: string; }

const VERSION_TYPE_LABELS: Record<string, string> = {
  auto: 'Otomatik',
  checkpoint: 'Checkpoint',
  rollback: 'Geri Alındı',
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

export function VersionHistoryPanel({ tenantSlug }: Props) {
  const { state } = useEditor();
  const { loadThemeVersions, createCheckpoint, rollbackVersion } = useThemeEditor(tenantSlug);

  const [checkpointModalOpen, setCheckpointModalOpen] = useState(false);
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [rollbackId, setRollbackId] = useState<number | null>(null);

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

  const handleRollback = async () => {
    if (rollbackId == null) return;
    await rollbackVersion(rollbackId);
    setRollbackId(null);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => setCheckpointModalOpen(true)}>
          + Checkpoint Oluştur
        </Button>
      </div>

      {state.versionsLoading && (
        <div className={styles.loading}>Yükleniyor...</div>
      )}

      <ul className={styles.list}>
        {state.themeVersions.map(v => (
          <li key={v.id} className={`${styles.item} ${v.isPublished ? styles.published : ''}`}>
            <div className={styles.itemLeft}>
              <span className={styles.versionNum}>v{v.versionNumber}</span>
              <span className={`${styles.badge} ${styles[`badge_${v.versionType}`]}`}>
                {VERSION_TYPE_LABELS[v.versionType] ?? v.versionType}
              </span>
              {v.isPublished && <span className={styles.liveBadge}>Yayında</span>}
            </div>
            <div className={styles.itemMeta}>
              {v.versionLabel && <span className={styles.label}>{v.versionLabel}</span>}
              <span className={styles.time}>{timeAgo(v.createdAt)}</span>
              {v.changedByEmail && <span className={styles.user}>{v.changedByEmail}</span>}
            </div>
            {!v.isPublished && (
              <Button
                variant="ghost"
                onClick={() => setRollbackId(v.id)}
              >
                Geri Al ↩
              </Button>
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

      {/* Rollback Onay Modal */}
      <Modal
        isOpen={rollbackId != null}
        onClose={() => setRollbackId(null)}
        title="Versiyona Geri Dön"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRollbackId(null)}>Vazgeç</Button>
            <Button variant="danger" isLoading={state.isSaving} onClick={() => void handleRollback()}>
              Evet, Geri Al
            </Button>
          </>
        }
      >
        <p>Bu versiyona geri dönmek istediğinize emin misiniz? Mevcut tema yeni bir versiyon olarak kaydedilecek.</p>
      </Modal>
    </div>
  );
}
