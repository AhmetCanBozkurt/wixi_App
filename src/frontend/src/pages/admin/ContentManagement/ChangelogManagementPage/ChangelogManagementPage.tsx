import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Select } from '../../../../shared/ui/Select/Select';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import s from './ChangelogManagementPage.module.css';

const TR_LANG_ID = 'F105229B-2D91-43C1-95B6-B344BCEC4D0F';
const EN_LANG_ID = 'D2608AF2-E718-489D-A90F-A8009A1A5ED7';

type ChangelogTag = 'feature' | 'improvement' | 'fix';
type LangTab = 'tr' | 'en';

interface ChangelogTranslation {
  languageId: string;
  langCode: string;
  title: string;
  description: string;
}

interface ChangelogEntry {
  id: string;
  version: string;
  releaseDate: string;
  tag: ChangelogTag;
  isActive: boolean;
  translations: ChangelogTranslation[];
}

type ChangelogDraft = Omit<ChangelogEntry, 'id'>;

const EMPTY_DRAFT: ChangelogDraft = {
  version: '',
  releaseDate: '',
  tag: 'feature',
  isActive: true,
  translations: [
    { languageId: TR_LANG_ID, langCode: 'tr', title: '', description: '' },
    { languageId: EN_LANG_ID, langCode: 'en', title: '', description: '' },
  ],
};

const TAG_OPTIONS = [
  { label: '— Etiket Seçin —', value: '' },
  { label: 'Yeni Özellik (Feature)', value: 'feature' },
  { label: 'İyileştirme (Improvement)', value: 'improvement' },
  { label: 'Hata Düzeltme (Fix)', value: 'fix' },
];

const TAG_CHIP_CLASS: Record<ChangelogTag, string> = {
  feature: s.chipFeature,
  improvement: s.chipImprovement,
  fix: s.chipFix,
};

const TAG_LABEL: Record<ChangelogTag, string> = {
  feature: 'Yeni Özellik',
  improvement: 'İyileştirme',
  fix: 'Hata Düzeltme',
};

function getTrTitle(entry: ChangelogEntry): string {
  return entry.translations.find((t) => t.langCode === 'tr')?.title ?? '—';
}

export default function ChangelogManagementPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [draft, setDraft] = useState<ChangelogDraft>(EMPTY_DRAFT);
  const [langTab, setLangTab] = useState<LangTab>('tr');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['changelog-admin'],
    queryFn: () => apiClient.get<ChangelogEntry[]>('/admin/landing/changelog').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; data: ChangelogDraft }) =>
      payload.id
        ? apiClient.put(`/admin/landing/changelog/${payload.id}`, payload.data)
        : apiClient.post('/admin/landing/changelog', payload.data),
    onSuccess: () => {
      toast.success(editingEntry ? 'Sürüm güncellendi' : 'Sürüm eklendi');
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ['changelog-admin'] });
    },
    onError: () => toast.error('Kayıt başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/landing/changelog/${id}`),
    onSuccess: () => {
      toast.success('Sürüm silindi');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['changelog-admin'] });
    },
    onError: () => toast.error('Silme başarısız'),
  });

  const openModal = (entry?: ChangelogEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setDraft({
        version: entry.version,
        releaseDate: entry.releaseDate,
        tag: entry.tag,
        isActive: entry.isActive,
        translations: entry.translations.length > 0
          ? entry.translations
          : EMPTY_DRAFT.translations.map((t) => ({ ...t })),
      });
    } else {
      setEditingEntry(null);
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
    saveMutation.mutate({ id: editingEntry?.id, data: draft });
  };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Değişiklik Günlüğü Yönetimi</h1>
          <p className={s.pageSubtitle}>Ürün sürümlerini ve değişikliklerini yönetin</p>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          + Yeni Sürüm Ekle
        </Button>
      </div>

      <div className={s.tableWrapper}>
        {isLoading && <div className={s.empty}>Yükleniyor...</div>}
        {!isLoading && entries.length === 0 && (
          <div className={s.empty}>Henüz sürüm eklenmemiş</div>
        )}
        {!isLoading && entries.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Sürüm</th>
                <th>Yayın Tarihi</th>
                <th>Etiket</th>
                <th>Başlık (TR)</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td><span className={s.version}>{entry.version}</span></td>
                  <td>{entry.releaseDate || '—'}</td>
                  <td>
                    <span className={`${s.chip} ${TAG_CHIP_CLASS[entry.tag]}`}>
                      {TAG_LABEL[entry.tag]}
                    </span>
                  </td>
                  <td>{getTrTitle(entry)}</td>
                  <td>
                    <span className={entry.isActive ? s.badgeActive : s.badgeInactive}>
                      {entry.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <Button variant="ghost" onClick={() => openModal(entry)}>
                        Düzenle
                      </Button>
                      <Button variant="danger" onClick={() => setDeleteId(entry.id)}>
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
        title={editingEntry ? 'Sürüm Düzenle' : 'Yeni Sürüm Ekle'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={saveMutation.isPending} onClick={handleSave}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Input
            label="Sürüm Numarası"
            value={draft.version}
            onChange={(e) => setDraft((p) => ({ ...p, version: e.target.value }))}
            placeholder="Örn. v2.5.0"
          />
          <Input
            label="Yayın Tarihi"
            type="date"
            value={draft.releaseDate}
            onChange={(e) => setDraft((p) => ({ ...p, releaseDate: e.target.value }))}
          />
          <Select
            label="Etiket"
            options={TAG_OPTIONS}
            value={draft.tag}
            onChange={(v) => setDraft((p) => ({ ...p, tag: String(v) as ChangelogTag }))}
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
            placeholder="Sürüm başlığı..."
          />

          <div className={s.formField}>
            <label className={s.fieldLabel}>Açıklama ({langTab.toUpperCase()})</label>
            <textarea
              className={s.textarea}
              value={draft.translations.find((t) => t.langCode === langTab)?.description ?? ''}
              onChange={(e) => setTranslation(langTab, 'description', e.target.value)}
              rows={4}
              placeholder="Değişiklik açıklaması..."
            />
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Sürümü Sil"
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
        <p>Bu sürümü silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
