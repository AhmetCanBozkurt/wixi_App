import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import s from './ContactInboxPage.module.css';

interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  submittedAt: string;
  isRead: boolean;
}

type FilterMode = 'all' | 'unread';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ContactInboxPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedItem, setSelectedItem] = useState<ContactSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<ContactSubmission[]>('/admin/landing/contacts');
      setSubmissions(data);
    } catch {
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const markRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await apiClient.patch(`/admin/landing/contacts/${id}/read`);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isRead: true } : s)),
      );
      if (selectedItem?.id === id) {
        setSelectedItem((p) => (p ? { ...p, isRead: true } : null));
      }
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const openDetail = async (item: ContactSubmission) => {
    setSelectedItem(item);
    if (!item.isRead) {
      await markRead(item.id);
    }
  };

  const filtered = filterMode === 'unread'
    ? submissions.filter((s) => !s.isRead)
    : submissions;

  const unreadCount = submissions.filter((s) => !s.isRead).length;

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>
            İletişim Gelen Kutusu
            {unreadCount > 0 && <span className={s.unreadBadge}>{unreadCount}</span>}
          </h1>
          <p className={s.pageSubtitle}>Landing page iletişim formundan gelen mesajlar</p>
        </div>
      </div>

      <div className={s.toolbar}>
        <div className={s.filters}>
          <button
            className={`${s.filterBtn} ${filterMode === 'all' ? s.filterBtnActive : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Tümü <span className={s.filterCnt}>{submissions.length}</span>
          </button>
          <button
            className={`${s.filterBtn} ${filterMode === 'unread' ? s.filterBtnActive : ''}`}
            onClick={() => setFilterMode('unread')}
          >
            Okunmamış <span className={s.filterCnt}>{unreadCount}</span>
          </button>
        </div>
      </div>

      <div className={s.tableWrapper}>
        {isLoading && <div className={s.loading}>Yükleniyor...</div>}

        {!isLoading && filtered.length === 0 && (
          <div className={s.empty}>
            {filterMode === 'unread' ? 'Okunmamış mesaj yok' : 'Henüz mesaj yok'}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Konu</th>
                <th>Mesaj</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`${s.tableRow} ${!item.isRead ? s.tableRowUnread : ''}`}
                  onClick={() => openDetail(item)}
                >
                  <td className={s.cellName}>
                    {!item.isRead && <span className={s.unreadDot} />}
                    {item.fullName}
                  </td>
                  <td className={s.cellEmail}>{item.email}</td>
                  <td>
                    <span className={s.topicBadge}>{item.topic}</span>
                  </td>
                  <td className={s.cellMessage}>
                    <span className={s.messagePreview}>{item.message}</span>
                  </td>
                  <td className={s.cellDate}>{formatDate(item.submittedAt)}</td>
                  <td>
                    <span className={item.isRead ? s.statusRead : s.statusUnread}>
                      {item.isRead ? 'Okundu' : 'Yeni'}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {!item.isRead && (
                      <Button variant="ghost" size="sm" onClick={(e) => markRead(item.id, e)}>
                        Okundu İşaretle
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Mesaj Detayı"
        size="md"
        footer={
          <>
            {selectedItem && !selectedItem.isRead && (
              <Button
                variant="primary"
                onClick={() => {
                  markRead(selectedItem.id);
                  setSelectedItem(null);
                }}
              >
                Okundu İşaretle
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedItem(null)}>Kapat</Button>
          </>
        }
      >
        {selectedItem && (
          <div className={s.detailGrid}>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Ad Soyad</span>
              <span className={s.detailValue}>{selectedItem.fullName}</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>E-posta</span>
              <a href={`mailto:${selectedItem.email}`} className={s.detailLink}>
                {selectedItem.email}
              </a>
            </div>
            {selectedItem.phone && (
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Telefon</span>
                <span className={s.detailValue}>{selectedItem.phone}</span>
              </div>
            )}
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Konu</span>
              <span className={s.detailValue}>{selectedItem.topic}</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Tarih</span>
              <span className={s.detailValue}>{formatDate(selectedItem.submittedAt)}</span>
            </div>
            <div className={s.detailMessage}>
              <span className={s.detailLabel}>Mesaj</span>
              <p className={s.messageBody}>{selectedItem.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
