import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaTags, FaPlus, FaLayerGroup } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { AdvancedDataTable } from '../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Button } from '../../../shared/ui/Button/Button';
import { Switch } from '../../../shared/ui/Switch/Switch';
import { ImageUploadField } from '../../../shared/ui/ImageUploadField/ImageUploadField';
import { apiClient, uploadStoreImage } from '../../../shared/api/axiosConfig';
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';

interface CategoryDto extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parentName?: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  parentCategoryId: string;
  imageUrl: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  parentCategoryId: '',
  imageUrl: '',
  description: '',
  sortOrder: '0',
  isActive: true,
};

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

export const StoreCategoriesPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(EMPTY_FORM);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<CategoryDto[] | { items: CategoryDto[] }>('/store-admin/categories');
      const data = Array.isArray(res.data) ? res.data : (res.data as { items: CategoryDto[] }).items ?? [];
      setCategories(data);
    } catch {
      toast.error('Kategoriler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);

  const openCreate = () => { setEditingId(null); setFormData(EMPTY_FORM); setPendingImageFile(null); setIsModalOpen(true); };

  const openEdit = (cat: CategoryDto) => {
    setEditingId(cat.id);
    setPendingImageFile(null);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentCategoryId: (cat.parentId as string) ?? '',
      imageUrl: (cat.imageUrl as string) ?? '',
      description: (cat.description as string) ?? '',
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setPendingImageFile(null); };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Kategori adı zorunludur.'); return; }
    setIsSaving(true);
    try {
      let imageUrl = formData.imageUrl.startsWith('blob:') ? '' : formData.imageUrl.trim();
      if (pendingImageFile) {
        imageUrl = await uploadStoreImage(pendingImageFile);
        setPendingImageFile(null);
      }
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || slugify(formData.name.trim()),
        parentCategoryId: formData.parentCategoryId || null,
        imageUrl: imageUrl || null,
        description: formData.description.trim() || null,
        sortOrder: parseInt(formData.sortOrder, 10) || 0,
        isActive: formData.isActive,
      };
      if (editingId) {
        await apiClient.put(`/store-admin/categories/${editingId}`, { id: editingId, ...payload });
        toast.success('Kategori güncellendi.');
      } else {
        await apiClient.post('/store-admin/categories', payload);
        toast.success('Kategori oluşturuldu.');
      }
      closeModal();
      void fetchCategories();
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/store-admin/categories/${id}`);
      toast.success('Kategori silindi.');
      setConfirmDeleteId(null);
      void fetchCategories();
    } catch {
      toast.error('Kategori silinemedi.');
    }
  };

  const parentOptions = useMemo(() => [
    { label: '— Yok (Ana Kategori) —', value: '' },
    ...categories.filter((c) => c.id !== editingId).map((c) => ({ label: c.name, value: c.id })),
  ], [categories, editingId]);

  const columns: ColumnConfig<CategoryDto>[] = useMemo(() => [
    {
      field: 'imageUrl',
      title: 'Görsel',
      width: 80,
      sortable: false,
      template: (row) => row.imageUrl ? (
        <img
          src={row.imageUrl as string}
          alt={row.name}
          style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-glass)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <FaLayerGroup size={20} color="var(--text-muted)" />
      ),
    },
    {
      field: 'name',
      title: 'Kategori Adı',
      width: 200,
      template: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</span>
      ),
    },
    {
      field: 'slug',
      title: 'Slug',
      width: 160,
      template: (row) => (
        <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-glass)' }}>
          {row.slug}
        </span>
      ),
    },
    {
      field: 'parentName',
      title: 'Üst Kategori',
      width: 160,
      template: (row) => row.parentName ? (
        <span style={{ fontSize: '0.85rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.08)', color: 'var(--color-primary)', border: '1px solid rgba(99,102,241,0.15)', fontWeight: 600 }}>
          {row.parentName as string}
        </span>
      ) : <span className={s.muted}>Ana Kategori</span>,
    },
    {
      field: 'sortOrder',
      title: 'Sıra',
      width: 70,
      template: (row) => <span className={s.muted}>{row.sortOrder}</span>,
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
          <FaTags className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Kategoriler</h2>
            <p className={s.pageSubtitle}>Ürün kategorilerini yönetin</p>
          </div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<FaPlus />} onClick={openCreate}>
          Yeni Kategori
        </Button>
      </div>

      <AdvancedDataTable<CategoryDto>
        dataSource={isLoading ? [] : categories}
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
        title={editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}
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
            label="Kategori Görseli"
            value={formData.imageUrl}
            onChange={(url) => setFormData((p) => ({ ...p, imageUrl: url }))}
            onFileStaged={(f) => setPendingImageFile(f)}
            aspectRatio="banner"
          />
        </div>

        <div className={s.formGrid}>
          <Input
            label="Kategori Adı *"
            value={formData.name}
            onChange={(e) => {
              const v = e.target.value;
              setFormData((p) => ({ ...p, name: v, slug: editingId ? p.slug : slugify(v) }));
            }}
            placeholder="Kategori adını girin"
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="kategori-slug"
          />
        </div>

        <div className={s.formGrid}>
          <Select
            label="Üst Kategori"
            options={parentOptions}
            value={formData.parentCategoryId}
            onChange={(val) => setFormData((p) => ({ ...p, parentCategoryId: String(val) }))}
          />
          <Input
            label="Sıra"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData((p) => ({ ...p, sortOrder: e.target.value }))}
            min="0"
          />
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Açıklama</label>
          <textarea
            className={s.textarea}
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            placeholder="Kategori hakkında kısa açıklama"
            rows={2}
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
        title="Kategoriyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}>Evet, Sil</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', margin: 0 }}>
          Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
      </Modal>
    </div>
  );
};
