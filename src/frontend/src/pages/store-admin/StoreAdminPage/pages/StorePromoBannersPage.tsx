import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaBullhorn, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { AdvancedDataTable } from '../../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { ImageUploadField } from '../../../../shared/ui/ImageUploadField/ImageUploadField';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Input } from '../../../../shared/ui/Input/Input';
import { Select } from '../../../../shared/ui/Select/Select';
import { Button } from '../../../../shared/ui/Button/Button';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import { apiClient, uploadStoreImage } from '../../../../shared/api/axiosConfig';
import s from './storeAdmin.shared.module.css';

interface PromoBannerDto extends Record<string, unknown> {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  layout: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface PromoBannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor: string;
  textColor: string;
  layout: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: PromoBannerFormData = {
  title: '',
  subtitle: '',
  imageUrl: '',
  buttonText: '',
  buttonUrl: '',
  backgroundColor: '#ec4899',
  textColor: '#ffffff',
  layout: 'overlay',
  sortOrder: 0,
  isActive: true,
};

const LAYOUT_OPTIONS = [
  { label: '— Düzen Seçiniz —', value: '' },
  { label: 'Üst Katman (Overlay)', value: 'overlay' },
  { label: 'Bölünmüş (Split)', value: 'split' },
  { label: 'Basit (Simple)', value: 'simple' },
];

export const StorePromoBannersPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [items, setItems] = useState<PromoBannerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PromoBannerFormData>(EMPTY_FORM);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ items: PromoBannerDto[] }>('/store-admin/promo-banners', {
        params: { includeInactive: true },
      });
      setItems(res.data.items ?? []);
    } catch {
      toast.error('Bannerlar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditingId(null); setFormData(EMPTY_FORM); setPendingImageFile(null); setIsModalOpen(true); };

  const openEdit = (item: PromoBannerDto) => {
    setEditingId(item.id);
    setPendingImageFile(null);
    setFormData({
      title: item.title,
      subtitle: item.subtitle ?? '',
      imageUrl: item.imageUrl ?? '',
      buttonText: item.buttonText ?? '',
      buttonUrl: item.buttonUrl ?? '',
      backgroundColor: item.backgroundColor ?? '#ec4899',
      textColor: item.textColor ?? '#ffffff',
      layout: item.layout,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setPendingImageFile(null); };

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Banner başlığı zorunludur.'); return; }
    setIsSaving(true);
    try {
      let imageUrl = formData.imageUrl.startsWith('blob:') ? '' : formData.imageUrl.trim();
      if (pendingImageFile) {
        imageUrl = await uploadStoreImage(pendingImageFile);
        setPendingImageFile(null);
      }
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        imageUrl: imageUrl || null,
        buttonText: formData.buttonText.trim() || null,
        buttonUrl: formData.buttonUrl.trim() || null,
        backgroundColor: formData.backgroundColor || null,
        textColor: formData.textColor || null,
        layout: formData.layout || 'overlay',
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };
      if (editingId) {
        await apiClient.put(`/store-admin/promo-banners/${editingId}`, { id: editingId, ...payload });
        toast.success('Banner güncellendi.');
      } else {
        await apiClient.post('/store-admin/promo-banners', payload);
        toast.success('Banner oluşturuldu.');
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
      await apiClient.delete(`/store-admin/promo-banners/${id}`);
      toast.success('Banner silindi.');
      setConfirmDeleteId(null);
      void fetchItems();
    } catch {
      toast.error('Banner silinemedi.');
    }
  };

  const setField = <K extends keyof PromoBannerFormData>(key: K, value: PromoBannerFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getLayoutLabel = (val: string) => LAYOUT_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const columns: ColumnConfig<PromoBannerDto>[] = useMemo(() => [
    {
      field: 'imageUrl',
      title: 'Görsel',
      width: 90,
      sortable: false,
      template: (row) => row.imageUrl ? (
        <img
          src={row.imageUrl}
          alt={row.title}
          style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-glass)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div style={{ width: 60, height: 40, borderRadius: 6, background: row.backgroundColor ?? '#ec4899', border: '1px solid var(--border-glass)' }} />
      ),
    },
    {
      field: 'title',
      title: 'Başlık',
      width: 200,
      template: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {row.backgroundColor && (
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: row.backgroundColor, flexShrink: 0, border: '1px solid var(--border-glass)' }} />
          )}
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.title}</span>
        </div>
      ),
    },
    {
      field: 'layout',
      title: 'Düzen',
      width: 160,
      template: (row) => (
        <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(99,102,241,0.2)', fontWeight: 600 }}>
          {getLayoutLabel(row.layout)}
        </span>
      ),
    },
    {
      field: 'subtitle',
      title: 'Alt Başlık',
      width: 220,
      template: (row) => (
        <span className={s.muted}>
          {row.subtitle ? (row.subtitle.length > 50 ? `${row.subtitle.slice(0, 50)}…` : row.subtitle) : '—'}
        </span>
      ),
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
          <FaBullhorn className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Promo Bannerlar</h2>
            <p className={s.pageSubtitle}>Kampanya ve tanıtım bannerlarını yönetin</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <FaPlus />
          Yeni Banner
        </Button>
      </div>

      <AdvancedDataTable<PromoBannerDto>
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
        title={editingId ? 'Banner Düzenle' : 'Yeni Banner'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={() => void handleSave()}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Input
            label="Başlık *"
            value={formData.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Banner başlığı"
          />
          <Input
            label="Alt Başlık"
            value={formData.subtitle}
            onChange={(e) => setField('subtitle', e.target.value)}
            placeholder="İsteğe bağlı alt başlık"
          />
        </div>

        <div className={s.formRow}>
          <ImageUploadField
            label="Banner Görseli"
            value={formData.imageUrl}
            onChange={(url) => setField('imageUrl', url)}
            onFileStaged={(f) => setPendingImageFile(f)}
            aspectRatio="banner"
          />
        </div>

        <div className={s.formGrid}>
          <Input
            label="Buton Metni"
            value={formData.buttonText}
            onChange={(e) => setField('buttonText', e.target.value)}
            placeholder="Ör: Hemen Al"
          />
          <Input
            label="Buton URL"
            value={formData.buttonUrl}
            onChange={(e) => setField('buttonUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className={s.formGrid}>
          <div className={s.formRow}>
            <label className={s.label}>Arka Plan Rengi</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setField('backgroundColor', e.target.value)}
                style={{ width: 40, height: 36, padding: 2, border: '1px solid var(--border-glass)', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
              />
              <Input
                value={formData.backgroundColor}
                onChange={(e) => setField('backgroundColor', e.target.value)}
                placeholder="#ec4899"
              />
            </div>
          </div>
          <div className={s.formRow}>
            <label className={s.label}>Yazı Rengi</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={formData.textColor}
                onChange={(e) => setField('textColor', e.target.value)}
                style={{ width: 40, height: 36, padding: 2, border: '1px solid var(--border-glass)', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
              />
              <Input
                value={formData.textColor}
                onChange={(e) => setField('textColor', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        <div className={s.formGrid}>
          <Select
            label="Düzen"
            options={LAYOUT_OPTIONS}
            value={formData.layout}
            onChange={(val) => setField('layout', val as string)}
          />
          <Input
            label="Sıra"
            type="number"
            value={String(formData.sortOrder)}
            onChange={(e) => setField('sortOrder', parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <Switch
          label="Aktif"
          checked={formData.isActive}
          onChange={(e) => setField('isActive', e.target.checked)}
        />
      </Modal>

      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Banneri Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu banneri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  );
};
