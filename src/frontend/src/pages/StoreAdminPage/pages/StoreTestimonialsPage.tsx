import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaStar, FaPlus, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { AdvancedDataTable } from '../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { Switch } from '../../../shared/ui/Switch/Switch';
import { ImageUploadField } from '../../../shared/ui/ImageUploadField/ImageUploadField';
import { apiClient, uploadStoreImage } from '../../../shared/api/axiosConfig';
import s from './storeAdmin.shared.module.css';

interface TestimonialDto extends Record<string, unknown> {
  id: string;
  customerName: string;
  customerTitle?: string;
  customerAvatarUrl?: string;
  quote: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface TestimonialFormData {
  customerName: string;
  customerTitle: string;
  customerAvatarUrl: string;
  quote: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: TestimonialFormData = {
  customerName: '',
  customerTitle: '',
  customerAvatarUrl: '',
  quote: '',
  rating: 5,
  sortOrder: 0,
  isActive: true,
};

const renderStars = (rating: number) => '★'.repeat(Math.max(1, Math.min(5, rating)));

export const StoreTestimonialsPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [items, setItems] = useState<TestimonialDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(EMPTY_FORM);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ items: TestimonialDto[] }>('/store-admin/testimonials');
      setItems(res.data.items ?? []);
    } catch {
      toast.error('Yorumlar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditingId(null); setFormData(EMPTY_FORM); setPendingAvatarFile(null); setIsModalOpen(true); };

  const openEdit = (item: TestimonialDto) => {
    setEditingId(item.id);
    setPendingAvatarFile(null);
    setFormData({
      customerName: item.customerName,
      customerTitle: item.customerTitle ?? '',
      customerAvatarUrl: item.customerAvatarUrl ?? '',
      quote: item.quote,
      rating: item.rating,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setPendingAvatarFile(null); };

  const handleSave = async () => {
    if (!formData.customerName.trim()) { toast.error('Müşteri adı zorunludur.'); return; }
    if (!formData.quote.trim()) { toast.error('Yorum metni zorunludur.'); return; }
    setIsSaving(true);
    try {
      let avatarUrl = formData.customerAvatarUrl.startsWith('blob:') ? '' : formData.customerAvatarUrl.trim();
      if (pendingAvatarFile) {
        avatarUrl = await uploadStoreImage(pendingAvatarFile);
        setPendingAvatarFile(null);
      }
      const payload = {
        customerName: formData.customerName.trim(),
        customerTitle: formData.customerTitle.trim() || null,
        customerAvatarUrl: avatarUrl || null,
        quote: formData.quote.trim(),
        rating: formData.rating,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };
      if (editingId) {
        await apiClient.put(`/store-admin/testimonials/${editingId}`, { id: editingId, ...payload });
        toast.success('Yorum güncellendi.');
      } else {
        await apiClient.post('/store-admin/testimonials', payload);
        toast.success('Yorum oluşturuldu.');
      }
      closeModal();
      void fetchItems();
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/store-admin/testimonials/${id}`);
      toast.success('Yorum silindi.');
      setConfirmDeleteId(null);
      void fetchItems();
    } catch {
      toast.error('Yorum silinemedi.');
    }
  };

  const columns: ColumnConfig<TestimonialDto>[] = useMemo(() => [
    {
      field: 'customerAvatarUrl',
      title: 'Avatar',
      width: 70,
      sortable: false,
      template: (row) => row.customerAvatarUrl ? (
        <img
          src={row.customerAvatarUrl}
          alt={row.customerName}
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : <FaUserCircle size={32} color="var(--text-muted)" />,
    },
    {
      field: 'customerName',
      title: 'Müşteri',
      width: 180,
      template: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{row.customerName}</div>
          {row.customerTitle && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.customerTitle}</div>}
        </div>
      ),
    },
    {
      field: 'quote',
      title: 'Yorum',
      width: 300,
      template: (row) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
          {row.quote.length > 80 ? `${row.quote.slice(0, 80)}…` : row.quote}
        </span>
      ),
    },
    {
      field: 'rating',
      title: 'Puan',
      width: 100,
      template: (row) => <span className={s.stars}>{renderStars(row.rating)}</span>,
    },
    {
      field: 'isActive',
      title: 'Durum',
      width: 90,
      template: (row) => (
        <span className={row.isActive ? s.badgeActive : s.badgeInactive}>
          {row.isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
  ], []);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaStar className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Müşteri Yorumları</h2>
            <p className={s.pageSubtitle}>Müşteri yorumlarını ve değerlendirmelerini yönetin</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <FaPlus />
          Yeni Yorum
        </Button>
      </div>

      <AdvancedDataTable<TestimonialDto>
        dataSource={isLoading ? [] : items}
        columns={columns}
        pageable={{ pageSize: 15 }}
        toolbar={['search', 'excel']}
        filterable
        onEdit={(row) => openEdit(row)}
        onDelete={(row) => setConfirmDeleteId(row.id)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Yorum Düzenle' : 'Yeni Yorum'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={() => void handleSave()}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Input
            label="Müşteri Adı *"
            value={formData.customerName}
            onChange={(e) => setFormData((p) => ({ ...p, customerName: e.target.value }))}
            placeholder="Ad Soyad"
          />
          <Input
            label="Ünvan"
            value={formData.customerTitle}
            onChange={(e) => setFormData((p) => ({ ...p, customerTitle: e.target.value }))}
            placeholder="Ör: Sadık Müşteri"
          />
        </div>

        <div className={s.formRow}>
          <ImageUploadField
            label="Avatar"
            value={formData.customerAvatarUrl}
            onChange={(url) => setFormData((p) => ({ ...p, customerAvatarUrl: url }))}
            onFileStaged={(f) => setPendingAvatarFile(f)}
            aspectRatio="square"
          />
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Yorum *</label>
          <textarea
            className={s.textarea}
            value={formData.quote}
            onChange={(e) => setFormData((p) => ({ ...p, quote: e.target.value }))}
            placeholder="Müşteri yorumu..."
            rows={3}
          />
        </div>

        <div className={s.formGrid}>
          <Input
            label="Puan (1–5)"
            type="number"
            value={String(formData.rating)}
            onChange={(e) => setFormData((p) => ({ ...p, rating: Math.min(5, Math.max(1, parseInt(e.target.value, 10) || 5)) }))}
            min="1"
            max="5"
          />
          <Input
            label="Sıra"
            type="number"
            value={String(formData.sortOrder)}
            onChange={(e) => setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))}
          />
        </div>

        <Switch
          label="Aktif"
          checked={formData.isActive}
          onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
        />
      </Modal>

      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Yorumu Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  );
};
