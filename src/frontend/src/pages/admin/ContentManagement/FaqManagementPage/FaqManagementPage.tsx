import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Select } from '../../../../shared/ui/Select/Select';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import s from './FaqManagementPage.module.css';

interface FaqCategoryTranslation {
  languageId: string;
  langCode: string;
  label: string;
}

interface FaqCategory {
  id: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  translations: FaqCategoryTranslation[];
  faqCount: number;
}

interface FaqItemTranslation {
  languageId: string;
  langCode: string;
  question: string;
  answer: string;
}

interface FaqAdminItem {
  id: string;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
  translations: FaqItemTranslation[];
}

type LangTab = 'tr' | 'en';

const EMPTY_CAT: Omit<FaqCategory, 'id' | 'faqCount'> = {
  slug: '',
  sortOrder: 0,
  isActive: true,
  translations: [
    { languageId: '', langCode: 'tr', label: '' },
    { languageId: '', langCode: 'en', label: '' },
  ],
};

const EMPTY_FAQ: Omit<FaqAdminItem, 'id'> = {
  categoryId: '',
  sortOrder: 0,
  isActive: true,
  translations: [
    { languageId: '', langCode: 'tr', question: '', answer: '' },
    { languageId: '', langCode: 'en', question: '', answer: '' },
  ],
};

function getLabel(cat: FaqCategory, lang: LangTab): string {
  return cat.translations.find((t) => t.langCode === lang)?.label ?? cat.slug;
}

export default function FaqManagementPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqAdminItem[]>([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<FaqCategory | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqAdminItem | null>(null);
  const [langTab, setLangTab] = useState<LangTab>('tr');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);

  /* ── Draft state for modals ── */
  const [catDraft, setCatDraft] = useState<Omit<FaqCategory, 'id' | 'faqCount'>>(EMPTY_CAT);
  const [faqDraft, setFaqDraft] = useState<Omit<FaqAdminItem, 'id'>>(EMPTY_FAQ);

  /* ── Load categories ── */
  const loadCategories = async () => {
    try {
      const { data } = await apiClient.get<FaqCategory[]>('/admin/landing/faq/categories');
      setCategories(data);
    } catch {
      toast.error('Kategoriler yüklenemedi');
    }
  };

  /* ── Load FAQs for selected category ── */
  const loadFaqs = async (catId: string) => {
    try {
      const { data } = await apiClient.get<FaqAdminItem[]>('/admin/landing/faq', {
        params: { categoryId: catId },
      });
      setFaqs(data);
    } catch {
      toast.error('Sorular yüklenemedi');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadFaqs(selectedCatId);
    } else {
      setFaqs([]);
    }
  }, [selectedCatId]);

  /* ── Open category modal ── */
  const openCatModal = (cat?: FaqCategory) => {
    if (cat) {
      setEditingCat(cat);
      setCatDraft({
        slug: cat.slug,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        translations: cat.translations.length > 0
          ? cat.translations
          : EMPTY_CAT.translations,
      });
    } else {
      setEditingCat(null);
      setCatDraft({ ...EMPTY_CAT, translations: EMPTY_CAT.translations.map((t) => ({ ...t })) });
    }
    setCatModalOpen(true);
  };

  /* ── Open FAQ modal ── */
  const openFaqModal = (faq?: FaqAdminItem) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqDraft({
        categoryId: faq.categoryId,
        sortOrder: faq.sortOrder,
        isActive: faq.isActive,
        translations: faq.translations.length > 0
          ? faq.translations
          : EMPTY_FAQ.translations,
      });
    } else {
      setEditingFaq(null);
      setFaqDraft({
        ...EMPTY_FAQ,
        categoryId: selectedCatId ?? '',
        translations: EMPTY_FAQ.translations.map((t) => ({ ...t })),
      });
    }
    setFaqModalOpen(true);
  };

  /* ── Save category ── */
  const saveCat = async () => {
    setIsSaving(true);
    try {
      if (editingCat) {
        await apiClient.put(`/admin/landing/faq/categories/${editingCat.id}`, catDraft);
        toast.success('Kategori güncellendi');
      } else {
        await apiClient.post('/admin/landing/faq/categories', catDraft);
        toast.success('Kategori eklendi');
      }
      setCatModalOpen(false);
      await loadCategories();
    } catch {
      toast.error('Kayıt başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Delete category ── */
  const deleteCat = async () => {
    if (!deleteCatId) return;
    try {
      await apiClient.delete(`/admin/landing/faq/categories/${deleteCatId}`);
      toast.success('Kategori silindi');
      setDeleteCatId(null);
      if (selectedCatId === deleteCatId) setSelectedCatId(null);
      await loadCategories();
    } catch {
      toast.error('Silme başarısız');
    }
  };

  /* ── Save FAQ ── */
  const saveFaq = async () => {
    setIsSaving(true);
    try {
      if (editingFaq) {
        await apiClient.put(`/admin/landing/faq/${editingFaq.id}`, faqDraft);
        toast.success('Soru güncellendi');
      } else {
        await apiClient.post('/admin/landing/faq', faqDraft);
        toast.success('Soru eklendi');
      }
      setFaqModalOpen(false);
      if (selectedCatId) await loadFaqs(selectedCatId);
    } catch {
      toast.error('Kayıt başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Delete FAQ ── */
  const deleteFaq = async () => {
    if (!deleteFaqId) return;
    try {
      await apiClient.delete(`/admin/landing/faq/${deleteFaqId}`);
      toast.success('Soru silindi');
      setDeleteFaqId(null);
      if (selectedCatId) await loadFaqs(selectedCatId);
    } catch {
      toast.error('Silme başarısız');
    }
  };

  /* ── Cat draft helpers ── */
  const setCatTranslation = (lang: string, field: 'label', value: string) => {
    setCatDraft((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.langCode === lang ? { ...t, [field]: value } : t,
      ),
    }));
  };

  /* ── FAQ draft helpers ── */
  const setFaqTranslation = (lang: string, field: 'question' | 'answer', value: string) => {
    setFaqDraft((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.langCode === lang ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const catOptions = [
    { label: '— Kategori Seçin —', value: '' },
    ...categories.map((c) => ({ label: getLabel(c, 'tr'), value: c.id })),
  ];

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>SSS Yönetimi</h1>
          <p className={s.pageSubtitle}>FAQ kategorileri ve sorularını yönetin</p>
        </div>
        <Button variant="primary" onClick={() => openCatModal()}>
          + Kategori Ekle
        </Button>
      </div>

      <div className={s.layout}>
        {/* ── Left: Category list ── */}
        <aside className={s.sidebar}>
          <div className={s.sidebarHead}>Kategoriler</div>
          {categories.length === 0 && (
            <div className={s.empty}>Henüz kategori yok</div>
          )}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`${s.catItem} ${selectedCatId === cat.id ? s.catItemActive : ''}`}
              onClick={() => setSelectedCatId(cat.id)}
            >
              <div className={s.catItemInfo}>
                <span className={s.catItemLabel}>{getLabel(cat, 'tr')}</span>
                <span className={s.catItemCount}>{cat.faqCount} soru</span>
              </div>
              <div className={s.catItemActions}>
                <button
                  className={s.iconBtn}
                  onClick={(e) => { e.stopPropagation(); openCatModal(cat); }}
                  title="Düzenle"
                >
                  ✎
                </button>
                <button
                  className={`${s.iconBtn} ${s.iconBtnDanger}`}
                  onClick={(e) => { e.stopPropagation(); setDeleteCatId(cat.id); }}
                  title="Sil"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </aside>

        {/* ── Right: FAQ list ── */}
        <main className={s.content}>
          <div className={s.contentHead}>
            <span>{selectedCatId ? `${faqs.length} soru` : 'Kategori seçin'}</span>
            {selectedCatId && (
              <Button variant="primary" onClick={() => openFaqModal()}>
                + Soru Ekle
              </Button>
            )}
          </div>

          {!selectedCatId && (
            <div className={s.empty}>Sol taraftan bir kategori seçin</div>
          )}

          {selectedCatId && faqs.length === 0 && (
            <div className={s.empty}>Bu kategoride henüz soru yok</div>
          )}

          {faqs.map((faq) => {
            const trTrans = faq.translations.find((t) => t.langCode === 'tr');
            return (
              <div key={faq.id} className={s.faqRow}>
                <div className={s.faqRowContent}>
                  <div className={s.faqQuestion}>{trTrans?.question ?? '—'}</div>
                  <div className={s.faqAnswer}>{trTrans?.answer ?? '—'}</div>
                </div>
                <div className={s.faqRowActions}>
                  <span className={faq.isActive ? s.badgeActive : s.badgeInactive}>
                    {faq.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  <Button variant="ghost" onClick={() => openFaqModal(faq)}>
                    Düzenle
                  </Button>
                  <Button variant="danger" onClick={() => setDeleteFaqId(faq.id)}>
                    Sil
                  </Button>
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {/* ── Category Modal ── */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? 'Kategori Düzenle' : 'Yeni Kategori'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCatModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={saveCat}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Input
            label="Slug"
            value={catDraft.slug}
            onChange={(e) => setCatDraft((p) => ({ ...p, slug: e.target.value }))}
            placeholder="genel-sorular"
          />
          <Input
            label="Sıralama"
            type="number"
            value={catDraft.sortOrder}
            onChange={(e) => setCatDraft((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
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
            label={`Etiket (${langTab.toUpperCase()})`}
            value={catDraft.translations.find((t) => t.langCode === langTab)?.label ?? ''}
            onChange={(e) => setCatTranslation(langTab, 'label', e.target.value)}
            placeholder="Genel Sorular"
          />

          <Switch
            label="Aktif"
            checked={catDraft.isActive}
            onChange={(e) => setCatDraft((p) => ({ ...p, isActive: e.target.checked }))}
          />
        </div>
      </Modal>

      {/* ── FAQ Modal ── */}
      <Modal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={editingFaq ? 'Soru Düzenle' : 'Yeni Soru'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFaqModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={saveFaq}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Select
            label="Kategori"
            options={catOptions}
            value={faqDraft.categoryId}
            onChange={(v) => setFaqDraft((p) => ({ ...p, categoryId: String(v) }))}
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
            label={`Soru (${langTab.toUpperCase()})`}
            value={faqDraft.translations.find((t) => t.langCode === langTab)?.question ?? ''}
            onChange={(e) => setFaqTranslation(langTab, 'question', e.target.value)}
            placeholder="Soru metni..."
          />

          <div className={s.formField}>
            <label className={s.fieldLabel}>Cevap ({langTab.toUpperCase()})</label>
            <textarea
              className={s.textarea}
              value={faqDraft.translations.find((t) => t.langCode === langTab)?.answer ?? ''}
              onChange={(e) => setFaqTranslation(langTab, 'answer', e.target.value)}
              rows={5}
              placeholder="Cevap metni..."
            />
          </div>

          <Input
            label="Sıralama"
            type="number"
            value={faqDraft.sortOrder}
            onChange={(e) => setFaqDraft((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
          />

          <Switch
            label="Aktif"
            checked={faqDraft.isActive}
            onChange={(e) => setFaqDraft((p) => ({ ...p, isActive: e.target.checked }))}
          />
        </div>
      </Modal>

      {/* ── Delete Category Confirm ── */}
      <Modal
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        title="Kategoriyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteCatId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={deleteCat}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu kategoriyi ve içindeki tüm soruları silmek istediğinize emin misiniz?</p>
      </Modal>

      {/* ── Delete FAQ Confirm ── */}
      <Modal
        isOpen={!!deleteFaqId}
        onClose={() => setDeleteFaqId(null)}
        title="Soruyu Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteFaqId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={deleteFaq}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu soruyu silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
