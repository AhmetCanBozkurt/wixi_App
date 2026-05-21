import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaTag, FaPlus } from 'react-icons/fa';

import { AdvancedDataTable } from '../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Button } from '../../../shared/ui/Button/Button';
import { Switch } from '../../../shared/ui/Switch/Switch';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { apiClient } from '../../../shared/api/axiosConfig';

import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';

interface CouponDto extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  discountType: number;
  discountTypeName: string;
  discountValue: number;
  minOrderAmount?: number;
  maxUsageTotal?: number;
  maxUsagePerCustomer?: number;
  currentUsage: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  isExpired: boolean;
}

interface CouponForm {
  id?: string;
  code: string;
  name: string;
  discountType: number;
  discountValue: string;
  minOrderAmount: string;
  maxUsageTotal: string;
  maxUsagePerCustomer: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

const EMPTY_FORM: CouponForm = {
  code: '', name: '', discountType: 1, discountValue: '',
  minOrderAmount: '', maxUsageTotal: '', maxUsagePerCustomer: '',
  startsAt: '', expiresAt: '', isActive: true,
};

const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Yüzde (%)', value: 1 },
  { label: 'Sabit Tutar (₺)', value: 2 },
  { label: 'Ücretsiz Kargo', value: 3 },
];

export default function StoreDiscountsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/store-admin/discounts`, {
        headers: { 'X-Tenant-Slug': tenantSlug },
      });
      setCoupons(data);
    } catch {
      toast.error('Kuponlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(c: CouponDto) {
    setForm({
      id: c.id,
      code: c.code,
      name: c.name,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : '',
      maxUsageTotal: c.maxUsageTotal != null ? String(c.maxUsageTotal) : '',
      maxUsagePerCustomer: c.maxUsagePerCustomer != null ? String(c.maxUsagePerCustomer) : '',
      startsAt: c.startsAt ? c.startsAt.slice(0, 16) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : '',
      isActive: c.isActive,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.code || !form.name || !form.discountValue) {
      toast.error('Kod, ad ve indirim değeri zorunludur.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: form.id ?? null,
        code: form.code,
        name: form.name,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxUsageTotal: form.maxUsageTotal ? parseInt(form.maxUsageTotal) : null,
        maxUsagePerCustomer: form.maxUsagePerCustomer ? parseInt(form.maxUsagePerCustomer) : null,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };
      if (form.id) {
        await apiClient.put(`/store-admin/discounts/${form.id}`, payload, {
          headers: { 'X-Tenant-Slug': tenantSlug },
        });
      } else {
        await apiClient.post(`/store-admin/discounts`, payload, {
          headers: { 'X-Tenant-Slug': tenantSlug },
        });
      }
      toast.success('Kupon kaydedildi.');
      setShowModal(false);
      load();
    } catch {
      toast.error('Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/store-admin/discounts/${deleteId}`, {
        headers: { 'X-Tenant-Slug': tenantSlug },
      });
      toast.success('Kupon silindi.');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Silme başarısız.');
    }
  }

  const columns: ColumnConfig<CouponDto>[] = useMemo(() => [
    {
      field: 'code',
      title: 'Kod',
      width: 130,
      sortable: true,
      template: (r) => <strong>{r.code}</strong>,
    },
    {
      field: 'name',
      title: 'Adı',
      width: 200,
      sortable: true,
    },
    {
      field: 'discountTypeName',
      title: 'Tür',
      width: 130,
    },
    {
      field: 'discountValue',
      title: 'İndirim',
      width: 120,
      template: (r) => r.discountType === 1
        ? <span>%{r.discountValue}</span>
        : r.discountType === 2
          ? <span>₺{r.discountValue}</span>
          : <span>—</span>,
    },
    {
      field: 'currentUsage',
      title: 'Kullanım',
      width: 110,
      template: (r) => <span>{r.currentUsage}{r.maxUsageTotal ? `/${r.maxUsageTotal}` : ''}</span>,
    },
    {
      field: 'isActive',
      title: 'Durum',
      width: 110,
      template: (r) => r.isExpired
        ? <span className={s.badgeInactive}>Süresi Doldu</span>
        : r.isActive
          ? <span className={s.badgeActive}>Aktif</span>
          : <span className={s.badgeInactive}>Pasif</span>,
    },
  ], [s.badgeActive, s.badgeInactive]);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaTag className={s.titleIcon} />
          <div>
            <h1 className={s.pageTitle}>Kampanyalar & Kuponlar</h1>
            <p className={s.pageSubtitle}>İndirim kuponu oluşturun ve yönetin.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openNew}><FaPlus /> Yeni Kupon</Button>
      </div>

      <AdvancedDataTable<CouponDto>
        dataSource={loading ? [] : coupons}
        columns={columns}
        pageable={{ pageSize: 20 }}
        sortable
        onEdit={openEdit}
        onDelete={(r) => setDeleteId(r.id)}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={form.id ? 'Kuponu Düzenle' : 'Yeni Kupon'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>İptal</Button>
            <Button variant="primary" isLoading={saving} onClick={handleSave}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <div className={s.formRow}>
            <Input
              label="Kupon Kodu *"
              value={form.code}
              onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="YENI2026"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Kupon Adı *"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Açıklayıcı isim"
            />
          </div>
          <div className={s.formRow}>
            <Select
              label="İndirim Türü"
              value={form.discountType}
              onChange={(val) => setForm(f => ({ ...f, discountType: Number(val) }))}
              options={DISCOUNT_TYPE_OPTIONS}
            />
          </div>
          <div className={s.formRow}>
            <Input
              label={form.discountType === 1 ? 'İndirim % *' : form.discountType === 2 ? 'İndirim Tutarı ₺ *' : 'Değer (0 girin)'}
              type="number"
              value={form.discountValue}
              onChange={(e) => setForm(f => ({ ...f, discountValue: e.target.value }))}
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Min. Sipariş Tutarı ₺"
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
              placeholder="Boş = limitsiz"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Toplam Kullanım Limiti"
              type="number"
              value={form.maxUsageTotal}
              onChange={(e) => setForm(f => ({ ...f, maxUsageTotal: e.target.value }))}
              placeholder="Boş = sınırsız"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Müşteri Başı Limit"
              type="number"
              value={form.maxUsagePerCustomer}
              onChange={(e) => setForm(f => ({ ...f, maxUsagePerCustomer: e.target.value }))}
              placeholder="Boş = sınırsız"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Başlangıç"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm(f => ({ ...f, startsAt: e.target.value }))}
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Bitiş"
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
            />
          </div>
          <div className={s.formRow}>
            <Switch
              label="Aktif"
              checked={form.isActive}
              onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Kuponu Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={handleDelete}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu kuponu silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
