import { useState } from 'react';
import { FaPlus, FaTrash, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useEditor } from '../../ThemeBuilder/context/EditorContext';
import { useWebBuilder } from '../hooks/useWebBuilder';
import styles from '../../ThemeBuilder/panels/Panels.module.css';

const CORP_PAGE_TYPE_LABELS: Record<string, string> = {
  Home:        'Ana Sayfa',
  About:       'Hakkımızda',
  Services:    'Hizmetler',
  Portfolio:   'Portfolyo / Referanslar',
  Team:        'Ekip',
  Pricing:     'Fiyatlandırma',
  Contact:     'İletişim',
  Blog:        'Blog',
  CaseStudy:   'Başarı Hikayeleri',
  Faq:         'Sık Sorulan Sorular',
  Landing:     'Landing Page',
  Custom:      'Özel Sayfa',
};

interface NewPageForm {
  title: string;
  slug: string;
  pageType: string;
}

export function WebPagesPanel() {
  const { state, dispatch } = useEditor();
  const { loadPage, loadPages, publishPage, deletePage } = useWebBuilder();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<NewPageForm>({ title: '', slug: '', pageType: 'Custom' });
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectPage = async (slug: string) => {
    if (state.isDirty) {
      const ok = confirm('Kaydedilmemiş değişiklikler var. Yine de devam edilsin mi?');
      if (!ok) return;
    }
    await loadPage(slug);
    dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
  };

  const handleSlugify = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const handleCreate = async () => {
    if (!form.title || !form.slug) {
      toast.error('Başlık ve slug zorunlu.');
      return;
    }
    setIsCreating(true);
    try {
      const { webBuilderApi } = await import('../../../entities/CorpPage/api/corpPageApi');
      await webBuilderApi.createPage(form);
      await loadPages();
      await loadPage(form.slug);
      setShowNew(false);
      setForm({ title: '', slug: '', pageType: 'Custom' });
      toast.success('Sayfa oluşturuldu.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
      if (axiosErr?.response?.status === 409) {
        toast.error(`"${form.slug}" slug'ı zaten kullanımda.`);
      } else if (axiosErr?.response?.data?.error) {
        toast.error(axiosErr.response.data.error);
      } else {
        toast.error('Sayfa oluşturulamadı.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Sayfalar</span>
        <button className={styles.addBtn} onClick={() => setShowNew(v => !v)} title="Yeni Sayfa">
          <FaPlus />
        </button>
      </div>

      {showNew && (
        <div className={styles.newPageForm}>
          <input
            className={styles.input}
            placeholder="Sayfa Başlığı"
            value={form.title}
            onChange={e => {
              const t = e.target.value;
              setForm(f => ({ ...f, title: t, slug: handleSlugify(t) }));
            }}
          />
          <input
            className={styles.input}
            placeholder="slug (url-friendly)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: handleSlugify(e.target.value) }))}
          />
          <select
            className={styles.select}
            value={form.pageType}
            onChange={e => setForm(f => ({ ...f, pageType: e.target.value }))}
          >
            {Object.entries(CORP_PAGE_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <div className={styles.newPageActions}>
            <button className={styles.cancelBtn} onClick={() => setShowNew(false)}>İptal</button>
            <button className={styles.saveBtn} onClick={() => void handleCreate()} disabled={isCreating}>
              {isCreating ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.pageList}>
        {state.pages.map(page => {
          const isActive = state.activePage?.id === page.id;
          return (
            <div
              key={page.id}
              className={`${styles.pageItem} ${isActive ? styles.activePageItem : ''}`}
              onClick={() => void handleSelectPage(page.slug)}
            >
              <div className={styles.pageItemLeft}>
                <div>
                  <div className={styles.pageItemTitle}>{page.title}</div>
                  <div className={styles.pageItemSlug}>/{page.slug}</div>
                </div>
              </div>
              <div className={styles.pageItemActions} onClick={e => e.stopPropagation()}>
                {isActive && (
                  <>
                    <button
                      className={`${styles.iconBtn} ${page.isPublished ? styles.publishedBtn : ''}`}
                      title={page.isPublished ? 'Yayından Kaldır' : 'Yayınla'}
                      onClick={() => void publishPage(!page.isPublished)}
                    >
                      {page.isPublished ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.dangerBtn}`}
                      title="Sil"
                      onClick={() => {
                        if (confirm(`"${page.title}" sayfasını silmek istediğinize emin misiniz?`))
                          void deletePage(page.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
                {page.isPublished && <FaCheck className={styles.publishedCheck} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
