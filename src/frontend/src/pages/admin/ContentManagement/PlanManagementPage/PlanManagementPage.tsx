import { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import s from './PlanManagementPage.module.css';

interface Plan {
  id: string;
  name: string;
  code: string;
  priceMonthly: number;
  priceYearly: number;
  featuresJson: string;
  maxProducts: number;
  maxUsers: number;
  sortOrder: number;
  isActive: boolean;
}

interface PlanForm {
  name: string;
  code: string;
  priceMonthly: string;
  priceYearly: string;
  featuresJson: string;
  maxProducts: string;
  maxUsers: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: PlanForm = {
  name: '',
  code: '',
  priceMonthly: '0',
  priceYearly: '0',
  featuresJson: '[]',
  maxProducts: '-1',
  maxUsers: '-1',
  sortOrder: '0',
  isActive: true,
};

function planToForm(p: Plan): PlanForm {
  return {
    name: p.name,
    code: p.code,
    priceMonthly: String(p.priceMonthly),
    priceYearly: String(p.priceYearly),
    featuresJson: p.featuresJson,
    maxProducts: String(p.maxProducts),
    maxUsers: String(p.maxUsers),
    sortOrder: String(p.sortOrder),
    isActive: p.isActive,
  };
}

const BASE = '/admin/landing/plans';

export default function PlanManagementPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const { data } = await apiClient.get(BASE);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        code: form.code,
        priceMonthly: parseFloat(form.priceMonthly) || 0,
        priceYearly: parseFloat(form.priceYearly) || 0,
        featuresJson: form.featuresJson,
        maxProducts: parseInt(form.maxProducts, 10),
        maxUsers: parseInt(form.maxUsers, 10),
        sortOrder: parseInt(form.sortOrder, 10),
        isActive: form.isActive,
      };
      if (editingId) {
        await apiClient.put(`${BASE}/${editingId}`, payload);
      } else {
        await apiClient.post(BASE, payload);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Plan güncellendi.' : 'Plan oluşturuldu.');
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      closeModal();
    },
    onError: () => toast.error('Kayıt sırasında hata oluştu.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${BASE}/${id}`);
    },
    onSuccess: () => {
      toast.success('Plan silindi.');
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Silme sırasında hata oluştu.'),
  });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditingId(plan.id);
    setForm(planToForm(plan));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function setField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const isSaving = saveMutation.isPending;

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Plan Yönetimi</h1>
          <p className={s.pageSubtitle}>Abonelik planlarını oluşturun, düzenleyin ve yayın durumunu yönetin.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ Plan Ekle</Button>
      </div>

      {isLoading && <p className={s.loading}>Yükleniyor...</p>}

      {!isLoading && plans.length === 0 && (
        <p className={s.empty}>Henüz plan tanımlanmamış. "+ Plan Ekle" ile başlayın.</p>
      )}

      <div className={s.grid}>
        {plans.map((plan) => (
          <div key={plan.id} className={`${s.card} ${plan.isActive ? '' : s.cardInactive}`}>
            <div className={s.cardHead}>
              <span className={s.cardCode}>{plan.code}</span>
              <span className={plan.isActive ? s.badgeActive : s.badgeInactive}>
                {plan.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <h3 className={s.cardName}>{plan.name}</h3>
            <div className={s.cardPrices}>
              <span className={s.priceMonthly}>
                {plan.priceMonthly > 0 ? `₺${plan.priceMonthly}/ay` : 'Ücretsiz'}
              </span>
              {plan.priceYearly > 0 && (
                <span className={s.priceYearly}>₺{plan.priceYearly}/yıl</span>
              )}
            </div>
            <div className={s.cardLimits}>
              <span>Ürün: {plan.maxProducts === -1 ? 'Sınırsız' : plan.maxProducts}</span>
              <span>Kullanıcı: {plan.maxUsers === -1 ? 'Sınırsız' : plan.maxUsers}</span>
            </div>
            <div className={s.cardSort}>Sıra: {plan.sortOrder}</div>
            <div className={s.cardActions}>
              <Button variant="ghost" onClick={() => openEdit(plan)}>Düzenle</Button>
              <Button variant="danger" onClick={() => setDeleteId(plan.id)}>Sil</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Plan Düzenle' : 'Yeni Plan'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={() => saveMutation.mutate()}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <div className={s.formRow}>
            <Input
              label="Plan Adı"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="örn. Standart"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Kod (slug)"
              value={form.code}
              onChange={e => setField('code', e.target.value)}
              placeholder="örn. standard"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Aylık Fiyat (₺)"
              type="number"
              value={form.priceMonthly}
              onChange={e => setField('priceMonthly', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Yıllık Fiyat (₺)"
              type="number"
              value={form.priceYearly}
              onChange={e => setField('priceYearly', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Maks. Ürün (-1 = sınırsız)"
              type="number"
              value={form.maxProducts}
              onChange={e => setField('maxProducts', e.target.value)}
              placeholder="-1"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Maks. Kullanıcı (-1 = sınırsız)"
              type="number"
              value={form.maxUsers}
              onChange={e => setField('maxUsers', e.target.value)}
              placeholder="-1"
            />
          </div>
          <div className={s.formRow}>
            <Input
              label="Sıra (SortOrder)"
              type="number"
              value={form.sortOrder}
              onChange={e => setField('sortOrder', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.formRowFull}>
            <label className={s.textareaLabel}>Özellikler (JSON dizisi)</label>
            <textarea
              className={s.textarea}
              rows={5}
              value={form.featuresJson}
              onChange={e => setField('featuresJson', e.target.value)}
              placeholder={'["Özellik 1", "Özellik 2"]'}
            />
          </div>
          <div className={s.formRowFull}>
            <Switch
              label="Aktif"
              checked={form.isActive}
              onChange={e => setField('isActive', e.target.checked)}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Planı Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Evet, Sil
            </Button>
          </>
        }
      >
        <p>Bu planı silmek istediğinize emin misiniz? İşlem geri alınamaz.</p>
      </Modal>
    </div>
  );
}
