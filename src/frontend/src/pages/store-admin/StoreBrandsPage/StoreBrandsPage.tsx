import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaTrademark, FaPlus } from 'react-icons/fa';
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
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';

interface BrandDto extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  isActive: boolean;
}

interface BrandFormData {
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  isActive: boolean;
}

const EMPTY_FORM: BrandFormData = {
  name: '',
  slug: '',
  logoUrl: '',
  websiteUrl: '',
  description: '',
  isActive: true,
};

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

export const StoreBrandsPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(EMPTY_FORM);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<BrandDto[] | { items: BrandDto[] }>('/store-admin/brands');
      const data = Array.isArray(res.data) ? res.data : (res.data as { items: BrandDto[] }).items ?? [];
      setBrands(data);
    } catch {
      toast.error('Markalar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchBrands(); }, [fetchBrands]);

  const openCreate = () => { setEditingId(null); setFormData(EMPTY_FORM); setPendingLogoFile(null); setIsModalOpen(true); };

  const openEdit = (brand: BrandDto) => {
    setEditingId(brand.id);
    setPendingLogoFile(null);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl ?? '',
      websiteUrl: brand.websiteUrl ?? '',
      description: brand.description ?? '',
      isActive: brand.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setPendingLogoFile(null); };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Marka adı zorunludur.'); return; }
    setIsSaving(true);
    try {
      let logoUrl = formData.logoUrl.startsWith('blob:') ? '' : formData.logoUrl.trim();
      if (pendingLogoFile) {
        logoUrl = await uploadStoreImage(pendingLogoFile);
        setPendingLogoFile(null);
      }
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || slugify(formData.name.trim()),
        logoUrl: logoUrl || null,
        websiteUrl: formData.websiteUrl.trim() || null,
        description: formData.description.trim() || null,
        isActive: formData.isActive,
      };
      if (editingId) {
        await apiClient.put(`/store-admin/brands/${editingId}`, { id: editingId, ...payload });
        toast.success('Marka güncellendi.');
      } else {
        await apiClient.post('/store-admin/brands', payload);
        toast.success('Marka oluşturuldu.');
      }
      closeModal();
      void fetchBrands();
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/store-admin/brands/${id}`);
      toast.success('Marka silindi.');
      setConfirmDeleteId(null);
      void fetchBrands();
    } catch {
      toast.error('Marka silinemedi.');
    }
  };

  const columns: ColumnConfig<BrandDto>[] = useMemo(() => [
    {
      field: 'logoUrl',
      title: 'Logo',
      width: 80,
      sortable: false,
      template: (row) => row.logoUrl ? (
        <img
          src={row.logoUrl}
          alt={row.name}
          style={{ width: 48, height: 32, objectFit: 'contain', borderRadius: 4, background: 'var(--bg-main)', border: '1px solid var(--border-glass)', padding: 2 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <FaTrademark size={24} color="var(--text-muted)" />
      ),
    },
    {
      field: 'name',
      title: 'Marka Adı',
      width: 200,
      template: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</span>
      ),
    },
    {
      field: 'slug',
      title: 'Slug',
      width: 180,
      template: (row) => (
        <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-glass)' }}>
          {row.slug}
        </span>
      ),
    },
    {
      field: 'websiteUrl',
      title: 'Web Sitesi',
      width: 200,
      template: (row) => row.websiteUrl ? (
        <a href={row.websiteUrl} target="_blank" rel="noopener noreferrer" className={s.detailLink} style={{ fontSize: '0.875rem' }}>
          {String(row.websiteUrl).replace(/^https?:\/\//, '')}
        </a>
      ) : <span className={s.muted}>—</span>,
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
          <FaTrademark className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Markalar</h2>
            <p className={s.pageSubtitle}>Ürün markalarını yönetin</p>
          </div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<FaPlus />} onClick={openCreate}>
          Yeni Marka
        </Button>
      </div>

      <AdvancedDataTable<BrandDto>
        dataSource={isLoading ? [] : brands}
        columns={columns}
        pageable={{ pageSize: 20 }}
        toolbar={['search', 'excel']}
        filterable
        onEdit={(row) => openEdit(row)}
        onDelete={(row) => setConfirmDeleteId(row.id)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Marka Düzenle' : 'Yeni Marka'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={() => void handleSave()}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formRow}>
          <ImageUploadField
            label="Logo"
            value={formData.logoUrl}
            onChange={(url) => setFormData((p) => ({ ...p, logoUrl: url }))}
            onFileStaged={(f) => setPendingLogoFile(f)}
            aspectRatio="logo"
          />
        </div>

        <div className={s.formGrid}>
          <Input
            label="Marka Adı *"
            value={formData.name}
            onChange={(e) => {
              const v = e.target.value;
              setFormData((p) => ({ ...p, name: v, slug: editingId ? p.slug : slugify(v) }));
            }}
            placeholder="Marka adını girin"
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="marka-slug"
          />
        </div>

        <Input
          label="Web Sitesi URL"
          type="url"
          value={formData.websiteUrl}
          onChange={(e) => setFormData((p) => ({ ...p, websiteUrl: e.target.value }))}
          placeholder="https://marka.com"
        />

        <div className={s.formRow}>
          <label className={s.label}>Açıklama</label>
          <textarea
            className={s.textarea}
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            placeholder="Marka hakkında kısa açıklama"
            rows={3}
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
        title="Markayı Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}>Evet, Sil</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', margin: 0 }}>
          Bu markayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
      </Modal>
    </div>
  );
};
