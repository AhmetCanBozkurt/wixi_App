import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Select } from '../../../../shared/ui/Select/Select';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import s from './RoadmapManagementPage.module.css';

const TR_LANG_ID = 'F105229B-2D91-43C1-95B6-B344BCEC4D0F';
const EN_LANG_ID = 'D2608AF2-E718-489D-A90F-A8009A1A5ED7';

type PhaseId = 'shipped' | 'now' | 'next' | 'later';
type LangTab = 'tr' | 'en';

interface RoadmapTranslation {
  languageId: string;
  langCode: string;
  title: string;
  description: string;
}

interface RoadmapItem {
  id: string;
  phaseId: PhaseId;
  category: string;
  plannedDate: string;
  sortOrder: number;
  voteCount: number;
  isActive: boolean;
  translations: RoadmapTranslation[];
}

type RoadmapDraft = Omit<RoadmapItem, 'id' | 'voteCount'>;

const EMPTY_DRAFT: RoadmapDraft = {
  phaseId: 'next',
  category: '',
  plannedDate: '',
  sortOrder: 0,
  isActive: true,
  translations: [
    { languageId: TR_LANG_ID, langCode: 'tr', title: '', description: '' },
    { languageId: EN_LANG_ID, langCode: 'en', title: '', description: '' },
  ],
};

const PHASE_OPTIONS = [
  { label: '— Faz Seçin —', value: '' },
  { label: 'Tamamlandı (Shipped)', value: 'shipped' },
  { label: 'Şu An (Now)', value: 'now' },
  { label: 'Sıradaki (Next)', value: 'next' },
  { label: 'İleride (Later)', value: 'later' },
];

const PHASE_CHIP_CLASS: Record<PhaseId, string> = {
  shipped: s.chipShipped,
  now: s.chipNow,
  next: s.chipNext,
  later: s.chipLater,
};

const PHASE_LABEL: Record<PhaseId, string> = {
  shipped: 'Tamamlandı',
  now: 'Şu An',
  next: 'Sıradaki',
  later: 'İleride',
};

function getTrTitle(item: RoadmapItem): string {
  return item.translations.find((t) => t.langCode === 'tr')?.title ?? '—';
}

export default function RoadmapManagementPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [draft, setDraft] = useState<RoadmapDraft>(EMPTY_DRAFT);
  const [langTab, setLangTab] = useState<LangTab>('tr');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [shipId, setShipId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['roadmap-admin'],
    queryFn: () => apiClient.get<RoadmapItem[]>('/admin/landing/roadmap').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; data: RoadmapDraft }) =>
      payload.id
        ? apiClient.put(`/admin/landing/roadmap/${payload.id}`, payload.data)
        : apiClient.post('/admin/landing/roadmap', payload.data),
    onSuccess: () => {
      toast.success(editingItem ? 'Özellik güncellendi' : 'Özellik eklendi');
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ['roadmap-admin'] });
    },
    onError: () => toast.error('Kayıt başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/landing/roadmap/${id}`),
    onSuccess: () => {
      toast.success('Özellik silindi');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['roadmap-admin'] });
    },
    onError: () => toast.error('Silme başarısız'),
  });

  const shipMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/landing/roadmap/${id}/ship`),
    onSuccess: () => {
      toast.success('Tamamlandı olarak işaretlendi');
      setShipId(null);
      qc.invalidateQueries({ queryKey: ['roadmap-admin'] });
    },
    onError: () => toast.error('İşlem başarısız'),
  });

  const openModal = (item?: RoadmapItem) => {
    if (item) {
      setEditingItem(item);
      setDraft({
        phaseId: item.phaseId,
        category: item.category,
        plannedDate: item.plannedDate,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        translations: item.translations.length > 0
          ? item.translations
          : EMPTY_DRAFT.translations.map((t) => ({ ...t })),
      });
    } else {
      setEditingItem(null);
      setDraft({ ...EMPTY_DRAFT, translations: EMPTY_DRAFT.translations.map((t) => ({ ...t })) });
    }
    setLangTab('tr');
    setModalOpen(true);
  };

  const setTranslation = (lang: string, field: 'title' | 'description', value: string) => {
    setDraft((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.langCode === lang ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const handleSave = () => {
    saveMutation.mutate({ id: editingItem?.id, data: draft });
  };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Yol Haritası Yönetimi</h1>
          <p className={s.pageSubtitle}>Ürün yol haritasındaki özellikleri yönetin</p>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          + Yeni Özellik Ekle
        </Button>
      </div>

      <div className={s.tableWrapper}>
        {isLoading && <div className={s.empty}>Yükleniyor...</div>}
        {!isLoading && items.length === 0 && (
          <div className={s.empty}>Henüz özellik eklenmemiş</div>
        )}
        {!isLoading && items.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Başlık (TR)</th>
                <th>Faz</th>
                <th>Kategori</th>
                <th>Planlanan</th>
                <th>Oy</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{getTrTitle(item)}</td>
                  <td>
                    <span className={`${s.chip} ${PHASE_CHIP_CLASS[item.phaseId]}`}>
                      {PHASE_LABEL[item.phaseId]}
                    </span>
                  </td>
                  <td>{item.category || '—'}</td>
                  <td>{item.plannedDate || '—'}</td>
                  <td>{item.voteCount}</td>
                  <td>
                    <span className={item.isActive ? s.badgeActive : s.badgeInactive}>
                      {item.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      {item.phaseId !== 'shipped' && (
                        <Button variant="ghost" onClick={() => setShipId(item.id)}>
                          Tamamlandı
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => openModal(item)}>
                        Düzenle
                      </Button>
                      <Button variant="danger" onClick={() => setDeleteId(item.id)}>
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Özellik Düzenle' : 'Yeni Özellik Ekle'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={saveMutation.isPending} onClick={handleSave}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Select
            label="Faz"
            options={PHASE_OPTIONS}
            value={draft.phaseId}
            onChange={(v) => setDraft((p) => ({ ...p, phaseId: String(v) as PhaseId }))}
          />
          <Input
            label="Kategori"
            value={draft.category}
            onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
            placeholder="Örn. E-Ticaret, Raporlama..."
          />
          <Input
            label="Planlanan Tarih"
            value={draft.plannedDate}
            onChange={(e) => setDraft((p) => ({ ...p, plannedDate: e.target.value }))}
            placeholder="Örn. Q2 2026"
          />
          <Input
            label="Sıralama"
            type="number"
            value={draft.sortOrder}
            onChange={(e) => setDraft((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
          />
          <Switch
            label="Aktif"
            checked={draft.isActive}
            onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.checked }))}
          />

          <div className={s.langTabs}>
            <button
              className={`${s.langTab} ${langTab === 'tr' ? s.langTabActive : ''}`}
              onClick={() => setLangTab('tr')}
            >
              TR
            </button>
            <button
              className={`${s.langTab} ${langTab === 'en' ? s.langTabActive : ''}`}
              onClick={() => setLangTab('en')}
            >
              EN
            </button>
          </div>

          <Input
            label={`Başlık (${langTab.toUpperCase()})`}
            value={draft.translations.find((t) => t.langCode === langTab)?.title ?? ''}
            onChange={(e) => setTranslation(langTab, 'title', e.target.value)}
            placeholder="Özellik başlığı..."
          />

          <div className={s.formField}>
            <label className={s.fieldLabel}>Açıklama ({langTab.toUpperCase()})</label>
            <textarea
              className={s.textarea}
              value={draft.translations.find((t) => t.langCode === langTab)?.description ?? ''}
              onChange={(e) => setTranslation(langTab, 'description', e.target.value)}
              rows={4}
              placeholder="Özellik açıklaması..."
            />
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Özelliği Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Evet, Sil
            </Button>
          </>
        }
      >
        <p>Bu özelliği silmek istediğinize emin misiniz?</p>
      </Modal>

      {/* ── Ship Confirm Modal ── */}
      <Modal
        isOpen={!!shipId}
        onClose={() => setShipId(null)}
        title="Tamamlandı İşaretle"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShipId(null)}>Vazgeç</Button>
            <Button variant="primary" isLoading={shipMutation.isPending} onClick={() => shipId && shipMutation.mutate(shipId)}>
              Evet, Tamamlandı
            </Button>
          </>
        }
      >
        <p>Bu özelliği "Tamamlandı" olarak işaretlemek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
