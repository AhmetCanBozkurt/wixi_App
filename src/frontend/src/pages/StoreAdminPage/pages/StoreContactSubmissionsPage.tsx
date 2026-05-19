import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaEnvelope, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { AdvancedDataTable } from '../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { apiClient } from '../../../shared/api/axiosConfig';
import s from './storeAdmin.shared.module.css';

interface ContactSubmissionDto extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  ipAddress?: string;
  submittedAt: string;
}

export const StoreContactSubmissionsPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [items, setItems] = useState<ContactSubmissionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContactSubmissionDto | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ items: ContactSubmissionDto[] }>(
        '/store-admin/contact-submissions',
        { params: unreadOnly ? { unreadOnly: true } : undefined },
      );
      setItems(res.data.items ?? []);
    } catch {
      toast.error('İletişim formları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.put(`/store-admin/contact-submissions/${id}/mark-read`, {});
      toast.success('Okundu olarak işaretlendi.');
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item,
        ),
      );
      if (viewingItem?.id === id) {
        setViewingItem((prev) => prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : null);
      }
    } catch {
      toast.error('İşaretlenemedi.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/store-admin/contact-submissions/${id}`);
      toast.success('Mesaj silindi.');
      setConfirmDeleteId(null);
      if (viewingItem?.id === id) setViewingItem(null);
      void fetchItems();
    } catch {
      toast.error('Mesaj silinemedi.');
    }
  };

  const handleViewItem = async (item: ContactSubmissionDto) => {
    setViewingItem(item);
    if (!item.isRead) void handleMarkRead(item.id);
  };

  const columns: ColumnConfig<ContactSubmissionDto>[] = useMemo(() => [
    {
      field: 'fullName',
      title: 'Ad Soyad',
      width: 180,
      template: (row) => (
        <span className={!row.isRead ? s.nameUnread : s.name}>{row.fullName}</span>
      ),
    },
    {
      field: 'email',
      title: 'E-posta',
      width: 220,
      template: (row) => (
        <a href={`mailto:${row.email}`} style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>
          {row.email}
        </a>
      ),
    },
    {
      field: 'subject',
      title: 'Konu',
      width: 200,
      template: (row) => (
        <span className={s.muted}>
          {row.subject ? (row.subject.length > 45 ? `${row.subject.slice(0, 45)}…` : row.subject) : '—'}
        </span>
      ),
    },
    {
      field: 'submittedAt',
      title: 'Tarih',
      width: 160,
      template: (row) => (
        <span className={s.muted}>{new Date(row.submittedAt).toLocaleString('tr-TR')}</span>
      ),
    },
    {
      field: 'isRead',
      title: 'Durum',
      width: 110,
      template: (row) => (
        <span className={row.isRead ? s.badgeRead : s.badgeUnread}>
          {row.isRead ? 'Okundu' : 'Okunmadı'}
        </span>
      ),
    },
  ], []);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaEnvelope className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>İletişim Formları</h2>
            <p className={s.pageSubtitle}>Müşteri mesajlarını görüntüleyin</p>
          </div>
        </div>
        <label className={s.toggleFilter}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          Yalnızca Okunmamışlar
        </label>
      </div>

      <AdvancedDataTable<ContactSubmissionDto>
        dataSource={isLoading ? [] : items}
        columns={columns}
        pageable={{ pageSize: 20 }}
        toolbar={['search', 'excel']}
        filterable
        onRowClick={(row) => void handleViewItem(row)}
        onDelete={(row) => setConfirmDeleteId(row.id)}
      />

      {!!viewingItem && (
        <div className={s.modalOverlay} onClick={() => setViewingItem(null)}>
          <div className={`${s.modal} ${s.modalWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <FaEnvelope />
                Mesaj Detayı
                {!viewingItem.isRead && (
                  <span className={s.badgeUnread} style={{ marginLeft: 8 }}>Okunmadı</span>
                )}
              </h3>
              <button type="button" className={s.modalClose} onClick={() => setViewingItem(null)}>
                <FaTimes />
              </button>
            </div>

            <div className={s.modalBody}>
              <div className={s.detailGrid}>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Ad Soyad</span>
                  <span className={s.detailValue}>{viewingItem.fullName}</span>
                </div>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>E-posta</span>
                  <a href={`mailto:${viewingItem.email}`} className={s.detailLink}>{viewingItem.email}</a>
                </div>
                {viewingItem.phone && (
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>Telefon</span>
                    <span className={s.detailValue}>{viewingItem.phone}</span>
                  </div>
                )}
                {viewingItem.subject && (
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>Konu</span>
                    <span className={s.detailValue}>{viewingItem.subject}</span>
                  </div>
                )}
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Gönderim Tarihi</span>
                  <span className={s.detailValue}>{new Date(viewingItem.submittedAt).toLocaleString('tr-TR')}</span>
                </div>
                {viewingItem.ipAddress && (
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>IP Adresi</span>
                    <span className={s.detailValueMono}>{viewingItem.ipAddress}</span>
                  </div>
                )}
              </div>

              <div className={s.messageBox}>
                <span className={s.detailLabel}>Mesaj</span>
                <p className={s.messageText}>{viewingItem.message}</p>
              </div>
            </div>

            <div className={s.modalFooter}>
              {!viewingItem.isRead && (
                <button
                  type="button"
                  className={s.markReadBtn}
                  onClick={() => void handleMarkRead(viewingItem.id)}
                >
                  <FaCheck />
                  Okundu İşaretle
                </button>
              )}
              <button
                type="button"
                className={s.deleteBtnModal}
                onClick={() => {
                  setConfirmDeleteId(viewingItem.id);
                  setViewingItem(null);
                }}
              >
                <FaTrash />
                Sil
              </button>
              <button type="button" className={s.closeBtn} onClick={() => setViewingItem(null)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {!!confirmDeleteId && (
        <div className={s.modalOverlay} onClick={() => setConfirmDeleteId(null)}>
          <div className={s.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={s.confirmIcon}>🗑️</div>
            <h3 className={s.confirmTitle}>Mesajı Sil</h3>
            <p className={s.confirmText}>Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className={s.confirmActions}>
              <button type="button" className={s.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Vazgeç</button>
              <button type="button" className={s.deleteConfirmBtn} onClick={() => void handleDelete(confirmDeleteId)}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
