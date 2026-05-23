import { useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { useEditor } from '../../ThemeBuilder/context/EditorContext';
import { useWebBuilder } from '../hooks/useWebBuilder';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Modal } from '../../../shared/ui/Modal/Modal';
import styles from '../../ThemeBuilder/panels/VersionHistoryPanel.module.css';

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

interface Props {
  onClose?: () => void;
}

export function WebVersionHistoryPanel({ onClose }: Props) {
  const { state } = useEditor();
  const { loadVersions, createCheckpoint, rollbackVersion } = useWebBuilder();
  const [checkpointModalOpen, setCheckpointModalOpen] = useState(false);
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [rollbackId, setRollbackId] = useState<string | null>(null);

  useEffect(() => {
    void loadVersions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activePage?.id]);

  const handleCheckpoint = async () => {
    if (!checkpointLabel.trim()) return;
    await createCheckpoint(checkpointLabel.trim());
    setCheckpointLabel('');
    setCheckpointModalOpen(false);
  };

  const handleRollback = async () => {
    if (!rollbackId) return;
    await rollbackVersion(rollbackId);
    setRollbackId(null);
    onClose?.();
  };

  return (
    <div className={styles.panelModal}>
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
          <li key={v.id} className={styles.item}>
            <div className={styles.itemBody}>
              <div className={styles.itemLeft}>
                <span className={styles.versionNum}>v{v.versionNumber}</span>
                <span className={`${styles.badge} ${styles.badge_checkpoint}`}>Checkpoint</span>
              </div>
              <div className={styles.itemMeta}>
                {v.versionLabel && <span className={styles.label}>{v.versionLabel}</span>}
                <div className={styles.metaRow}>
                  <span className={styles.time}>{timeAgo(v.createdAt)}</span>
                  {v.changedByEmail && <span className={styles.user}>· {v.changedByEmail}</span>}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

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
          placeholder="Örn: Kurumsal Sayfa v1"
        />
      </Modal>

      <Modal
        isOpen={rollbackId !== null}
        onClose={() => setRollbackId(null)}
        title="Geri Al"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRollbackId(null)}>Vazgeç</Button>
            <Button variant="primary" isLoading={state.isSaving} onClick={() => void handleRollback()}>
              Evet, Geri Al
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
          Bu versiyonu geri yüklemek istediğinize emin misiniz?
        </p>
      </Modal>
    </div>
  );
}
