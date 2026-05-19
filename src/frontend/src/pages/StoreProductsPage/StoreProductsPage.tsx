import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaBoxOpen, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Modal } from '../../shared/ui/Modal/Modal';
import { Input } from '../../shared/ui/Input/Input';
import { Select } from '../../shared/ui/Select/Select';
import { Button } from '../../shared/ui/Button/Button';
import { Switch } from '../../shared/ui/Switch/Switch';
import { ImageUploadField } from '../../shared/ui/ImageUploadField/ImageUploadField';
import { apiClient, uploadStoreImage } from '../../shared/api/axiosConfig';
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';

interface ProductDto extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryName?: string;
  brandName?: string;
  categoryId?: string;
  brandId?: string;
  isActive: boolean;
  shortDescription?: string;
  mainImageUrl?: string;
  vatRate?: number;
  costPrice?: number | null;
}

interface LookupItem {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  basePrice: string;
  categoryId: string;
  brandId: string;
  shortDescription: string;
  mainImageUrl: string;
  isActive: boolean;
  vatRate: string;
  costPrice: string;
}

interface VariantAttribute {
  key: string;
  value: string;
}

interface VariantFormItem {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stockQuantity: string;
  attributes: VariantAttribute[];
  isActive: boolean;
}

interface VariantItem extends Record<string, unknown> {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  attributesJson?: string;
  isActive: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  slug: '',
  basePrice: '',
  categoryId: '',
  brandId: '',
  shortDescription: '',
  mainImageUrl: '',
  isActive: true,
  vatRate: '20',
  costPrice: '',
};

const EMPTY_VARIANT: VariantFormItem = {
  name: '',
  sku: '',
  price: '',
  stockQuantity: '0',
  attributes: [],
  isActive: true,
};

const vatRateOptions = [
  { label: '%0 (KDV Muaf)', value: '0' },
  { label: '%1', value: '1' },
  { label: '%8', value: '8' },
  { label: '%10', value: '10' },
  { label: '%18', value: '18' },
  { label: '%20 (Standart)', value: '20' },
];

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

const parseAttributesJson = (json?: string): VariantAttribute[] => {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as Record<string, string>;
    return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
  } catch {
    return [];
  }
};

// ─── VariantRow ────────────────────────────────────────────────────────────────

interface VariantRowProps {
  variant: VariantFormItem;
  index: number;
  onChange: (idx: number, updated: VariantFormItem) => void;
  onRemove: (idx: number) => void;
}

const VariantRow = ({ variant, index, onChange, onRemove }: VariantRowProps) => {
  const update = (partial: Partial<VariantFormItem>) => onChange(index, { ...variant, ...partial });

  const updateAttr = (attrIdx: number, partial: Partial<VariantAttribute>) => {
    const updated = variant.attributes.map((a, i) =>
      i === attrIdx ? { ...a, ...partial } : a
    );
    update({ attributes: updated });
  };

  const addAttr = () => update({ attributes: [...variant.attributes, { key: '', value: '' }] });

  const removeAttr = (attrIdx: number) =>
    update({ attributes: variant.attributes.filter((_, i) => i !== attrIdx) });

  const isColorKey = (key: string) =>
    key.toLowerCase() === 'renk' || key.toLowerCase() === 'color';

  return (
    <div
      style={{
        border: '1px solid var(--border-glass)',
        borderRadius: 8,
        padding: '1rem',
        marginBottom: '0.75rem',
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div className={s.formGrid}>
        <Input
          label="Varyant Adı"
          value={variant.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="örn. Kırmızı / L"
        />
        <Input
          label="SKU"
          value={variant.sku}
          onChange={(e) => update({ sku: e.target.value })}
          placeholder="URUN-001-RED-L"
        />
      </div>

      <div className={s.formGrid}>
        <Input
          label="Fiyat (TRY)"
          type="number"
          value={variant.price}
          onChange={(e) => update({ price: e.target.value })}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        <Input
          label="Stok Adedi"
          type="number"
          value={variant.stockQuantity}
          onChange={(e) => update({ stockQuantity: e.target.value })}
          placeholder="0"
          min="0"
          step="1"
        />
      </div>

      {/* Attributes */}
      {variant.attributes.map((attr, attrIdx) => (
        <div
          key={attrIdx}
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.5rem' }}
        >
          <div style={{ flex: 1 }}>
            <Input
              label="Özellik"
              value={attr.key}
              onChange={(e) => updateAttr(attrIdx, { key: e.target.value })}
              placeholder="örn. Renk"
            />
          </div>
          <div style={{ flex: 1 }}>
            {isColorKey(attr.key) ? (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Renk
                </label>
                <input
                  type="color"
                  value={attr.value || '#000000'}
                  onChange={(e) => updateAttr(attrIdx, { value: e.target.value })}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: '1px solid var(--border-glass)',
                    background: 'transparent',
                    padding: 2,
                  }}
                />
              </div>
            ) : (
              <Input
                label="Değer"
                value={attr.value}
                onChange={(e) => updateAttr(attrIdx, { value: e.target.value })}
                placeholder="Değer"
              />
            )}
          </div>
          <div style={{ paddingBottom: 2 }}>
            <Button variant="danger" size="sm" onClick={() => removeAttr(attrIdx)}>
              <FaTimes />
            </Button>
          </div>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <Button variant="ghost" size="sm" onClick={addAttr}>
          + Özellik Ekle
        </Button>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Switch
            label="Aktif"
            checked={variant.isActive}
            onChange={(e) => update({ isActive: e.target.checked })}
          />
          <Button variant="danger" size="sm" onClick={() => onRemove(index)}>
            Varyantı Kaldır
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── StoreProductsPage ─────────────────────────────────────────────────────────

export const StoreProductsPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [brands, setBrands] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantFormItem[]>([]);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<ProductDto[] | { items: ProductDto[] }>('/store-admin/products');
      const data = Array.isArray(res.data) ? res.data : (res.data as { items: ProductDto[] }).items ?? [];
      setProducts(data);
    } catch {
      toast.error('Ürün listesi alınamadı.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        apiClient.get<LookupItem[] | { items: LookupItem[] }>('/store-admin/categories'),
        apiClient.get<LookupItem[] | { items: LookupItem[] }>('/store-admin/brands'),
      ]);
      const cats = Array.isArray(catRes.data) ? catRes.data : (catRes.data as { items: LookupItem[] }).items ?? [];
      const brnds = Array.isArray(brandRes.data) ? brandRes.data : (brandRes.data as { items: LookupItem[] }).items ?? [];
      setCategories(cats);
      setBrands(brnds);
    } catch { /* silent */ }
  }, []);

  const fetchVariants = useCallback(async (productId: string) => {
    try {
      const res = await apiClient.get<VariantItem[]>(`/store-admin/products/${productId}/variants`);
      const items = Array.isArray(res.data) ? res.data : [];
      setVariants(
        items.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: String(v.price),
          stockQuantity: String(v.stockQuantity),
          attributes: parseAttributesJson(v.attributesJson),
          isActive: v.isActive,
        }))
      );
    } catch {
      setVariants([]);
    }
  }, []);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);
  useEffect(() => { void fetchLookups(); }, [fetchLookups]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setPendingImageFile(null);
    setVariants([]);
    setIsModalOpen(true);
  };

  const openEdit = (product: ProductDto) => {
    setEditingId(product.id);
    setPendingImageFile(null);
    setFormData({
      name: product.name,
      slug: product.slug,
      basePrice: String(product.basePrice),
      categoryId: (product.categoryId as string) ?? '',
      brandId: (product.brandId as string) ?? '',
      shortDescription: (product.shortDescription as string) ?? '',
      mainImageUrl: (product.mainImageUrl as string) ?? '',
      isActive: product.isActive,
      vatRate: String((product.vatRate as number) ?? 20),
      costPrice: product.costPrice != null ? String(product.costPrice) : '',
    });
    setVariants([]);
    void fetchVariants(product.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setPendingImageFile(null);
    setVariants([]);
  };

  const saveVariants = async (productId: string) => {
    for (const variant of variants) {
      const attributesJson = JSON.stringify(
        Object.fromEntries(
          variant.attributes
            .filter((a) => a.key.trim())
            .map((a) => [a.key, a.value])
        )
      );
      const payload = {
        name: variant.name,
        sku: variant.sku,
        price: parseFloat(variant.price) || 0,
        stockQuantity: parseInt(variant.stockQuantity) || 0,
        attributesJson,
        isActive: variant.isActive,
      };
      if (variant.id) {
        await apiClient.put(`/store-admin/variants/${variant.id}`, payload);
      } else {
        await apiClient.post(`/store-admin/products/${productId}/variants`, payload);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Ürün adı zorunludur.'); return; }
    const price = parseFloat(formData.basePrice);
    if (isNaN(price) || price < 0) { toast.error('Geçerli bir fiyat girin.'); return; }
    setIsSaving(true);
    try {
      let mainImageUrl = formData.mainImageUrl.startsWith('blob:') ? '' : formData.mainImageUrl.trim();
      if (pendingImageFile) {
        mainImageUrl = await uploadStoreImage(pendingImageFile);
        setPendingImageFile(null);
      }
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || slugify(formData.name.trim()),
        basePrice: price,
        categoryId: formData.categoryId || null,
        brandId: formData.brandId || null,
        shortDescription: formData.shortDescription.trim() || null,
        mainImageUrl: mainImageUrl || null,
        isActive: formData.isActive,
        vatRate: parseInt(formData.vatRate) || 20,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
      };
      let savedProductId = editingId;
      if (editingId) {
        await apiClient.put(`/store-admin/products/${editingId}`, { id: editingId, ...payload });
        toast.success('Ürün güncellendi.');
      } else {
        const res = await apiClient.post<{ id: string }>('/store-admin/products', payload);
        savedProductId = res.data?.id ?? null;
        toast.success('Ürün oluşturuldu.');
      }
      if (savedProductId && variants.length > 0) {
        try {
          await saveVariants(savedProductId);
        } catch {
          toast.error('Varyantlar kaydedilirken hata oluştu.');
        }
      }
      closeModal();
      void fetchProducts();
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/store-admin/products/${id}`);
      toast.success('Ürün silindi.');
      setConfirmDeleteId(null);
      void fetchProducts();
    } catch {
      toast.error('Ürün silinemedi.');
    }
  };

  const addVariant = () => setVariants((prev) => [...prev, { ...EMPTY_VARIANT, attributes: [] }]);
  const removeVariant = (idx: number) => setVariants((prev) => prev.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, updated: VariantFormItem) =>
    setVariants((prev) => prev.map((v, i) => (i === idx ? updated : v)));

  const categoryOptions = useMemo(() => [
    { label: '— Seçiniz —', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ], [categories]);

  const brandOptions = useMemo(() => [
    { label: '— Seçiniz —', value: '' },
    ...brands.map((b) => ({ label: b.name, value: b.id })),
  ], [brands]);

  const columns: ColumnConfig<ProductDto>[] = useMemo(() => [
    {
      field: 'mainImageUrl',
      title: 'Görsel',
      width: 80,
      sortable: false,
      template: (row) => row.mainImageUrl ? (
        <img
          src={row.mainImageUrl as string}
          alt={row.name}
          style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-glass)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <FaBoxOpen size={22} color="var(--text-muted)" />
      ),
    },
    {
      field: 'name',
      title: 'Ürün Adı',
      width: 220,
      template: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{row.slug}</div>
        </div>
      ),
    },
    {
      field: 'categoryName',
      title: 'Kategori',
      width: 140,
      template: (row) => row.categoryName ? (
        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', fontWeight: 600 }}>
          {row.categoryName as string}
        </span>
      ) : <span className={s.muted}>—</span>,
    },
    {
      field: 'brandName',
      title: 'Marka',
      width: 130,
      template: (row) => row.brandName ? (
        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', fontWeight: 600 }}>
          {row.brandName as string}
        </span>
      ) : <span className={s.muted}>—</span>,
    },
    {
      field: 'basePrice',
      title: 'Fiyat',
      width: 120,
      template: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {Number(row.basePrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
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
          <FaBoxOpen className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Ürünler</h2>
            <p className={s.pageSubtitle}>Mağaza ürünlerini yönetin</p>
          </div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<FaPlus />} onClick={openCreate}>
          Yeni Ürün
        </Button>
      </div>

      <AdvancedDataTable<ProductDto>
        dataSource={isLoading ? [] : products}
        columns={columns}
        pageable={{ pageSize: 20, pageSizes: [10, 20, 50] }}
        toolbar={['search', 'excel']}
        filterable
        onEdit={(row) => openEdit(row)}
        onDelete={(row) => setConfirmDeleteId(row.id)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Ürün Düzenle' : 'Yeni Ürün'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={() => void handleSave()}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formRow}>
          <ImageUploadField
            label="Ana Görsel"
            value={formData.mainImageUrl}
            onChange={(url) => setFormData((p) => ({ ...p, mainImageUrl: url }))}
            onFileStaged={(f) => setPendingImageFile(f)}
            aspectRatio="banner"
          />
        </div>

        <div className={s.formGrid}>
          <Input
            label="Ürün Adı *"
            value={formData.name}
            onChange={(e) => {
              const v = e.target.value;
              setFormData((p) => ({ ...p, name: v, slug: editingId ? p.slug : slugify(v) }));
            }}
            placeholder="Ürün adını girin"
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="urun-slug"
          />
        </div>

        <div className={s.formGrid}>
          <Input
            label="Fiyat (TRY) *"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData((p) => ({ ...p, basePrice: e.target.value }))}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <Select
            label="Kategori"
            options={categoryOptions}
            value={formData.categoryId}
            onChange={(val) => setFormData((p) => ({ ...p, categoryId: String(val) }))}
          />
        </div>

        <div className={s.formGrid}>
          <Select
            label="Marka"
            options={brandOptions}
            value={formData.brandId}
            onChange={(val) => setFormData((p) => ({ ...p, brandId: String(val) }))}
          />
          <Select
            label="KDV Oranı"
            options={vatRateOptions}
            value={formData.vatRate}
            onChange={(val) => setFormData((p) => ({ ...p, vatRate: String(val) }))}
          />
        </div>

        <div className={s.formGrid}>
          <Input
            label="Alış Fiyatı (TRY)"
            type="number"
            value={formData.costPrice}
            onChange={(e) => setFormData((p) => ({ ...p, costPrice: e.target.value }))}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <div />
        </div>

        <div className={s.formRow}>
          <label className={s.label}>Kısa Açıklama</label>
          <textarea
            className={s.textarea}
            value={formData.shortDescription}
            onChange={(e) => setFormData((p) => ({ ...p, shortDescription: e.target.value }))}
            placeholder="Ürün hakkında kısa açıklama"
            rows={3}
          />
        </div>

        {/* Variants section */}
        <div
          className={s.formRow}
          style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span className={s.sectionTitle} style={{ margin: 0 }}>
              Varyantlar ({variants.length})
            </span>
            <Button variant="ghost" size="sm" onClick={addVariant}>
              + Varyant Ekle
            </Button>
          </div>
          {variants.map((v, idx) => (
            <VariantRow
              key={idx}
              variant={v}
              index={idx}
              onChange={updateVariant}
              onRemove={removeVariant}
            />
          ))}
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
        title="Ürünü Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}>Evet, Sil</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', margin: 0 }}>
          Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
      </Modal>
    </div>
  );
};
