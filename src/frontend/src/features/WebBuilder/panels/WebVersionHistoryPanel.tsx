import { useEffect, useState } from 'react';
import { FaHistory, FaRocket } from 'react-icons/fa';
import Swal from 'sweetalert2';
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

            <button
              className={styles.publishBtn}
              onClick={() => {
                const versionId = v._versionId;
                if (!versionId) return;
                Swal.fire({
                  title: 'Geri yüklemek istiyor musunuz?',
                  text: `v${v.versionNumber} versiyonu geri yüklenecektir. Bu işlem geçerli tasarımınızı ezecektir!`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: 'var(--color-primary, #6366f1)',
                  cancelButtonColor: '#6b7280',
                  confirmButtonText: 'Evet, Geri Yükle!',
                  cancelButtonText: 'Vazgeç'
                }).then((result) => {
                  if (result.isConfirmed) {
                    void rollbackVersion(versionId).then(() => {
                      onClose?.();
                    });
                  }
                });
              }}
              type="button"
              title="Bu versiyonu geri yükle"
            >
              <FaRocket style={{ fontSize: 10 }} />
              Geri Yükle
            </button>
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
    </div>
  );
}
