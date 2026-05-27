import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Select } from '../../../../shared/ui/Select/Select';
import s from './LegalContentManagementPage.module.css';

const TR_LANG_ID = 'F105229B-2D91-43C1-95B6-B344BCEC4D0F';
const EN_LANG_ID = 'D2608AF2-E718-489D-A90F-A8009A1A5ED7';

type LangTab = 'tr' | 'en';

interface LegalTranslation {
  languageId: string;
  langCode: string;
  title: string;
  contentHtml: string;
}

interface LegalDocument {
  id: string;
  slug: string;
  version: string;
  effectiveDate: string;
  translations: LegalTranslation[];
}

type LegalDraft = Omit<LegalDocument, 'id'>;

const EMPTY_DRAFT: LegalDraft = {
  slug: '',
  version: '',
  effectiveDate: '',
  translations: [
    { languageId: TR_LANG_ID, langCode: 'tr', title: '', contentHtml: '' },
    { languageId: EN_LANG_ID, langCode: 'en', title: '', contentHtml: '' },
  ],
};

const SLUG_OPTIONS = [
  { label: '— Slug Seçin —', value: '' },
  { label: 'privacy — Gizlilik Politikası', value: 'privacy' },
  { label: 'kvkk — KVKK', value: 'kvkk' },
  { label: 'terms — Kullanım Şartları', value: 'terms' },
  { label: 'cookies — Çerez Politikası', value: 'cookies' },
];

function getTrTitle(doc: LegalDocument): string {
  return doc.translations.find((t) => t.langCode === 'tr')?.title ?? '—';
}

function getEnTitle(doc: LegalDocument): string {
  return doc.translations.find((t) => t.langCode === 'en')?.title ?? '—';
}

export default function LegalContentManagementPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [draft, setDraft] = useState<LegalDraft>(EMPTY_DRAFT);
  const [langTab, setLangTab] = useState<LangTab>('tr');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['legal-admin'],
    queryFn: () => apiClient.get<LegalDocument[]>('/admin/landing/legal').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; data: LegalDraft }) =>
      payload.id
        ? apiClient.put(`/admin/landing/legal/${payload.id}`, payload.data)
        : apiClient.post('/admin/landing/legal', payload.data),
    onSuccess: () => {
      toast.success(editingDoc ? 'Belge güncellendi' : 'Belge eklendi');
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ['legal-admin'] });
    },
    onError: () => toast.error('Kayıt başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/landing/legal/${id}`),
    onSuccess: () => {
      toast.success('Belge silindi');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['legal-admin'] });
    },
    onError: () => toast.error('Silme başarısız'),
  });

  const openModal = (doc?: LegalDocument) => {
    if (doc) {
      setEditingDoc(doc);
      setDraft({
        slug: doc.slug,
        version: doc.version,
        effectiveDate: doc.effectiveDate,
        translations: doc.translations.length > 0
          ? doc.translations
          : EMPTY_DRAFT.translations.map((t) => ({ ...t })),
      });
    } else {
      setEditingDoc(null);
      setDraft({ ...EMPTY_DRAFT, translations: EMPTY_DRAFT.translations.map((t) => ({ ...t })) });
    }
    setLangTab('tr');
    setModalOpen(true);
  };

  const setTranslation = (lang: string, field: 'title' | 'contentHtml', value: string) => {
    setDraft((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.langCode === lang ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const handleSave = () => {
    saveMutation.mutate({ id: editingDoc?.id, data: draft });
  };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Yasal İçerik Yönetimi</h1>
          <p className={s.pageSubtitle}>Gizlilik, KVKK, kullanım şartları ve çerez politikası içeriklerini yönetin</p>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          + Yeni Belge Ekle
        </Button>
      </div>

      <div className={s.tableWrapper}>
        {isLoading && <div className={s.empty}>Yükleniyor...</div>}
        {!isLoading && documents.length === 0 && (
          <div className={s.empty}>Henüz yasal belge eklenmemiş</div>
        )}
        {!isLoading && documents.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Slug</th>
                <th>Sürüm</th>
                <th>Yürürlük Tarihi</th>
                <th>Başlık (TR)</th>
                <th>Başlık (EN)</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td><span className={s.slug}>{doc.slug}</span></td>
                  <td>{doc.version || '—'}</td>
                  <td>{doc.effectiveDate || '—'}</td>
                  <td>{getTrTitle(doc)}</td>
                  <td>{getEnTitle(doc)}</td>
                  <td>
                    <div className={s.actions}>
                      <Button variant="ghost" onClick={() => openModal(doc)}>
                        Düzenle
                      </Button>
                      <Button variant="danger" onClick={() => setDeleteId(doc.id)}>
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
        title={editingDoc ? 'Belge Düzenle' : 'Yeni Belge Ekle'}
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
            label="Slug"
            options={SLUG_OPTIONS}
            value={draft.slug}
            onChange={(v) => setDraft((p) => ({ ...p, slug: String(v) }))}
          />
          <Input
            label="Sürüm"
            value={draft.version}
            onChange={(e) => setDraft((p) => ({ ...p, version: e.target.value }))}
            placeholder="Örn. 3.2"
          />
          <Input
            label="Yürürlük Tarihi"
            type="date"
            value={draft.effectiveDate}
            onChange={(e) => setDraft((p) => ({ ...p, effectiveDate: e.target.value }))}
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
            placeholder="Belge başlığı..."
          />

          <div className={s.formField}>
            <label className={s.fieldLabel}>HTML İçerik ({langTab.toUpperCase()})</label>
            <textarea
              className={s.textareaLarge}
              value={draft.translations.find((t) => t.langCode === langTab)?.contentHtml ?? ''}
              onChange={(e) => setTranslation(langTab, 'contentHtml', e.target.value)}
              rows={12}
              placeholder="HTML içerik buraya..."
            />
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Belgeyi Sil"
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
        <p>Bu yasal belgeyi silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
