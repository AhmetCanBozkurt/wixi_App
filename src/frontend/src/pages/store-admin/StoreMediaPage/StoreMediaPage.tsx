import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaImages, FaCopy, FaTrash } from 'react-icons/fa';

import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { apiClient } from '../../../shared/api/axiosConfig';
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';
import cs from './StoreMediaPage.module.css';

interface MediaFile {
  fileName: string;
  url: string;
  sizeBytes: number;
  createdAt: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
function isImage(name: string) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTS.includes(ext);
}

export default function StoreMediaPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/store-admin/media', {
        headers: { 'X-Tenant-Slug': tenantSlug },
      });
      setFiles(data);
    } catch {
      toast.error('Dosyalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  function copyUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url).then(() => {
      toast.success('URL kopyalandı!');
    });
  }

  async function handleDelete() {
    if (!deleteFile) return;
    try {
      await apiClient.delete(`/store-admin/media/${encodeURIComponent(deleteFile.fileName)}`, {
        headers: { 'X-Tenant-Slug': tenantSlug },
      });
      toast.success('Dosya silindi.');
      setDeleteFile(null);
      load();
    } catch {
      toast.error('Silme başarısız.');
    }
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaImages className={s.titleIcon} />
          <div>
            <h1 className={s.pageTitle}>Medya Yöneticisi</h1>
            <p className={s.pageSubtitle}>Yüklenen dosyaları görüntüleyin ve yönetin.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className={s.muted}>Yükleniyor…</p>
      ) : files.length === 0 ? (
        <p className={s.muted}>Henüz yüklenmiş dosya yok.</p>
      ) : (
        <div className={cs.gallery}>
          {files.map(f => (
            <div key={f.fileName} className={cs.card}>
              <div className={cs.preview}>
                {isImage(f.fileName) ? (
                  <img src={f.url} alt={f.fileName} className={cs.thumb} />
                ) : (
                  <div className={cs.fileIcon}>📄</div>
                )}
              </div>
              <div className={cs.info}>
                <span className={cs.name} title={f.fileName}>{f.fileName}</span>
                <span className={cs.meta}>{fmtSize(f.sizeBytes)}</span>
              </div>
              <div className={cs.actions}>
                <button className={cs.actionBtn} title="URL Kopyala" onClick={() => copyUrl(f.url)}>
                  <FaCopy />
                </button>
                <button className={`${cs.actionBtn} ${cs.danger}`} title="Sil" onClick={() => setDeleteFile(f)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        title="Dosyayı Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteFile(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={handleDelete}>Evet, Sil</Button>
          </>
        }
      >
        <p><strong>{deleteFile?.fileName}</strong> dosyasını silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
