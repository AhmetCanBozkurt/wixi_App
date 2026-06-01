import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Select } from '../../../../shared/ui/Select/Select';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import s from './CaseStudyManagementPage.module.css';

interface CaseStudyTranslationAdmin {
  languageId: string;
  langCode: string;
  clientName: string;
  title: string;
  description: string;
  metric1Label: string;
  metric2Label: string;
  quoteText?: string;
  quoteAuthor?: string;
}

interface CaseStudyAdmin {
  id: string;
  clientSlug: string;
  clientInitials: string;
  clientLogoUrl?: string;
  industry: string;
  metric1Value: string;
  metric2Value: string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  translations: CaseStudyTranslationAdmin[];
}

type LangTab = 'tr' | 'en';

const INDUSTRY_OPTIONS = [
  { label: '— Sektör —', value: '' },
  { label: 'Perakende', value: 'retail' },
  { label: 'Gıda', value: 'food' },
  { label: 'Tekstil', value: 'textile' },
  { label: 'Hizmet', value: 'service' },
  { label: 'Üretim', value: 'manufacture' },
];

const EMPTY_CASE: Omit<CaseStudyAdmin, 'id'> = {
  clientSlug: '',
  clientInitials: '',
  clientLogoUrl: '',
  industry: '',
  metric1Value: '',
  metric2Value: '',
  isFeatured: false,
  sortOrder: 0,
  isActive: true,
  translations: [
    {
      languageId: '',
      langCode: 'tr',
      clientName: '',
      title: '',
      description: '',
      metric1Label: '',
      metric2Label: '',
      quoteText: '',
      quoteAuthor: '',
    },
    {
      languageId: '',
      langCode: 'en',
      clientName: '',
      title: '',
      description: '',
      metric1Label: '',
      metric2Label: '',
      quoteText: '',
      quoteAuthor: '',
    },
  ],
};

function getTrTranslation(cs: CaseStudyAdmin): CaseStudyTranslationAdmin | undefined {
  return cs.translations.find((t) => t.langCode === 'tr');
}

export default function CaseStudyManagementPage() {
  const [cases, setCases] = useState<CaseStudyAdmin[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudyAdmin | null>(null);
  const [draft, setDraft] = useState<Omit<CaseStudyAdmin, 'id'>>(EMPTY_CASE);
  const [langTab, setLangTab] = useState<LangTab>('tr');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await apiClient.get<CaseStudyAdmin[]>('/admin/landing/cases');
      setCases(data);
    } catch {
      setCases([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (cs?: CaseStudyAdmin) => {
    if (cs) {
      setEditingCase(cs);
      setDraft({
        clientSlug: cs.clientSlug,
        clientInitials: cs.clientInitials,
        clientLogoUrl: cs.clientLogoUrl ?? '',
        industry: cs.industry,
        metric1Value: cs.metric1Value,
        metric2Value: cs.metric2Value,
        isFeatured: cs.isFeatured,
        sortOrder: cs.sortOrder,
        isActive: cs.isActive,
        translations: cs.translations.length > 0
          ? cs.translations
          : EMPTY_CASE.translations.map((t) => ({ ...t })),
      });
    } else {
      setEditingCase(null);
      setDraft({
        ...EMPTY_CASE,
        translations: EMPTY_CASE.translations.map((t) => ({ ...t })),
      });
    }
    setLangTab('tr');
    setModalOpen(true);
  };

  const setTranslation = (
    lang: string,
    field: keyof Omit<CaseStudyTranslationAdmin, 'languageId' | 'langCode'>,
    value: string,
  ) => {
    setDraft((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.langCode === lang ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      if (editingCase) {
        await apiClient.put(`/admin/landing/cases/${editingCase.id}`, draft);
        toast.success('Vaka güncellendi');
      } else {
        await apiClient.post('/admin/landing/cases', draft);
        toast.success('Vaka eklendi');
      }
      setModalOpen(false);
      await load();
    } catch {
      toast.error('Kayıt başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/admin/landing/cases/${deleteId}`);
      toast.success('Vaka silindi');
      setDeleteId(null);
      await load();
    } catch {
      toast.error('Silme başarısız');
    }
  };

  const activeLangTr = draft.translations.find((t) => t.langCode === langTab);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Vaka Çalışmaları</h1>
          <p className={s.pageSubtitle}>Müşteri vaka çalışmalarını yönetin</p>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          + Vaka Ekle
        </Button>
      </div>

      {cases.length === 0 && (
        <div className={s.empty}>Henüz vaka çalışması yok</div>
      )}

      {cases.length > 0 && (
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>İnisiyaller</th>
                <th className={s.th}>Müşteri Adı</th>
                <th className={s.th}>Sektör</th>
                <th className={s.th}>Metrik 1</th>
                <th className={s.th}>Metrik 2</th>
                <th className={s.th}>Öne Çıkan</th>
                <th className={s.th}>Durum</th>
                <th className={s.th}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((cs) => {
                const trTr = getTrTranslation(cs);
                const industryLabel =
                  INDUSTRY_OPTIONS.find((o) => o.value === cs.industry)?.label ?? cs.industry;
                return (
                  <tr key={cs.id} className={s.tr}>
                    <td className={s.td}>
                      <div
                        className={s.initialsCircle}
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        {cs.clientInitials}
                      </div>
                    </td>
                    <td className={s.td}>
                      <span className={s.clientName}>{trTr?.clientName ?? cs.clientSlug}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.industryBadge}>{industryLabel}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.metric}>{cs.metric1Value}</span>
                      <span className={s.metricLabel}>{trTr?.metric1Label}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.metric}>{cs.metric2Value}</span>
                      <span className={s.metricLabel}>{trTr?.metric2Label}</span>
                    </td>
                    <td className={s.td}>
                      {cs.isFeatured ? (
                        <span className={s.badgeFeatured}>Evet</span>
                      ) : (
                        <span className={s.badgeNormal}>Hayır</span>
                      )}
                    </td>
                    <td className={s.td}>
                      <span className={cs.isActive ? s.badgeActive : s.badgeInactive}>
                        {cs.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className={s.td}>
                      <div className={s.rowActions}>
                        <Button variant="ghost" onClick={() => openModal(cs)}>
                          Düzenle
                        </Button>
                        <Button variant="danger" onClick={() => setDeleteId(cs.id)}>
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCase ? 'Vaka Düzenle' : 'Yeni Vaka'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={save}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <div className={s.formRow}>
            <Input
              label="Client Slug"
              value={draft.clientSlug}
              onChange={(e) => setDraft((p) => ({ ...p, clientSlug: e.target.value }))}
              placeholder="acme-corp"
            />
            <Input
              label="İnisiyaller (max 3)"
              value={draft.clientInitials}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  clientInitials: e.target.value.slice(0, 3).toUpperCase(),
                }))
              }
              placeholder="AC"
            />
          </div>

          <Input
            label="Logo URL (opsiyonel)"
            value={draft.clientLogoUrl ?? ''}
            onChange={(e) => setDraft((p) => ({ ...p, clientLogoUrl: e.target.value }))}
            placeholder="https://..."
          />

          <div className={s.formRow}>
            <Select
              label="Sektör"
              options={INDUSTRY_OPTIONS}
              value={draft.industry}
              onChange={(v) => setDraft((p) => ({ ...p, industry: String(v) }))}
            />
            <Input
              label="Sıralama"
              type="number"
              value={draft.sortOrder}
              onChange={(e) => setDraft((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
            />
          </div>

          <div className={s.formRow}>
            <Input
              label="Metrik 1 Değeri"
              value={draft.metric1Value}
              onChange={(e) => setDraft((p) => ({ ...p, metric1Value: e.target.value }))}
              placeholder="%108"
            />
            <Input
              label="Metrik 2 Değeri"
              value={draft.metric2Value}
              onChange={(e) => setDraft((p) => ({ ...p, metric2Value: e.target.value }))}
              placeholder="₺248K"
            />
          </div>

          <div className={s.switchRow}>
            <Switch
              label="Öne Çıkan"
              checked={draft.isFeatured}
              onChange={(e) => setDraft((p) => ({ ...p, isFeatured: e.target.checked }))}
            />
            <Switch
              label="Aktif"
              checked={draft.isActive}
              onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.checked }))}
            />
          </div>

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
            label={`Müşteri Adı (${langTab.toUpperCase()})`}
            value={activeLangTr?.clientName ?? ''}
            onChange={(e) => setTranslation(langTab, 'clientName', e.target.value)}
            placeholder="ACME Kurumsal A.Ş."
          />
          <Input
            label={`Başlık (${langTab.toUpperCase()})`}
            value={activeLangTr?.title ?? ''}
            onChange={(e) => setTranslation(langTab, 'title', e.target.value)}
            placeholder="Dijital dönüşümde..."
          />
          <div className={s.formField}>
            <label className={s.fieldLabel}>Açıklama ({langTab.toUpperCase()})</label>
            <textarea
              className={s.textarea}
              value={activeLangTr?.description ?? ''}
              onChange={(e) => setTranslation(langTab, 'description', e.target.value)}
              rows={3}
              placeholder="Kısa açıklama..."
            />
          </div>

          <div className={s.formRow}>
            <Input
              label={`Metrik 1 Etiketi (${langTab.toUpperCase()})`}
              value={activeLangTr?.metric1Label ?? ''}
              onChange={(e) => setTranslation(langTab, 'metric1Label', e.target.value)}
              placeholder="Satış artışı"
            />
            <Input
              label={`Metrik 2 Etiketi (${langTab.toUpperCase()})`}
              value={activeLangTr?.metric2Label ?? ''}
              onChange={(e) => setTranslation(langTab, 'metric2Label', e.target.value)}
              placeholder="Toplam kazanım"
            />
          </div>

          <div className={s.formField}>
            <label className={s.fieldLabel}>Alıntı Metni ({langTab.toUpperCase()}) — opsiyonel</label>
            <textarea
              className={s.textarea}
              value={activeLangTr?.quoteText ?? ''}
              onChange={(e) => setTranslation(langTab, 'quoteText', e.target.value)}
              rows={2}
              placeholder="Alıntı metni..."
            />
          </div>
          <Input
            label={`Alıntı Sahibi (${langTab.toUpperCase()}) — opsiyonel`}
            value={activeLangTr?.quoteAuthor ?? ''}
            onChange={(e) => setTranslation(langTab, 'quoteAuthor', e.target.value)}
            placeholder="Ahmet Yılmaz, CEO"
          />
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Vakayı Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={confirmDelete}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu vaka çalışmasını silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
