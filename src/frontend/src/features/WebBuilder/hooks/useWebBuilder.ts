import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { webBuilderApi } from '../../../entities/CorpPage/api/corpPageApi';
import type { CorpPage } from '../../../entities/CorpPage/model/types';
import type { StorePage } from '../../../entities/StorePage/model/types';
import { useEditor } from '../../ThemeBuilder/context/EditorContext';

// CorpPage has the same shape as StorePage for the fields EditorContext reads.
// Cast helper avoids duplicating the context reducer.
function toStorePage(p: CorpPage): StorePage {
  return {
    id: p.id,
    pageType: 'Custom',
    slug: p.slug,
    title: p.title,
    layoutConfigJson: p.layoutConfigJson,
    themeOverrideJson: p.themeOverrideJson,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    metaKeywords: p.metaKeywords,
    openGraphImageUrl: p.openGraphImageUrl,
    backlinksJson: p.backlinksJson,
    isPublished: p.isPublished,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function useWebBuilder() {
  const { state, dispatch } = useEditor();

  const loadPages = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const pagesRes = await webBuilderApi.getPages();
      dispatch({ type: 'SET_PAGES', pages: pagesRes.data.map(p => ({
        id: p.id,
        pageType: 'Custom' as const,
        slug: p.slug,
        title: p.title,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt,
      })) });

      const first = pagesRes.data[0];
      if (first) {
        await loadPage(first.slug);
      }
    } catch {
      toast.error('Sayfalar yüklenemedi.');
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPage = useCallback(async (slug: string) => {
    try {
      const res = await webBuilderApi.getPage(slug);
      dispatch({ type: 'SET_ACTIVE_PAGE', page: toStorePage(res.data) });
    } catch {
      toast.error('Sayfa yüklenemedi.');
    }
  }, [dispatch]);

  const saveLayout = useCallback(async () => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await webBuilderApi.updateLayout(
        state.activePage.id,
        JSON.stringify(state.layout),
      );
      dispatch({ type: 'SET_DIRTY', dirty: false });
      toast.success('Tasarım kaydedildi.');
    } catch {
      toast.error('Kayıt sırasında hata oluştu.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [state.activePage, state.layout, dispatch]);

  const saveSeo = useCallback(async () => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await webBuilderApi.updateSeo(state.activePage.id, {
        metaTitle: state.seo.metaTitle || null,
        metaDescription: state.seo.metaDescription || null,
        metaKeywords: state.seo.metaKeywords || null,
        openGraphImageUrl: state.seo.openGraphImageUrl || null,
      });
      dispatch({ type: 'SET_DIRTY', dirty: false });
      toast.success('SEO kaydedildi.');
    } catch {
      toast.error('SEO kayıt hatası.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [state.activePage, state.seo, dispatch]);

  const saveBacklinks = useCallback(async () => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await webBuilderApi.updateBacklinks(
        state.activePage.id,
        JSON.stringify(state.backlinks),
      );
      dispatch({ type: 'SET_DIRTY', dirty: false });
      toast.success('Bağlantılar kaydedildi.');
    } catch {
      toast.error('Backlink kayıt hatası.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [state.activePage, state.backlinks, dispatch]);

  const publishPage = useCallback(async (isPublished: boolean) => {
    if (!state.activePage) return;
    try {
      await webBuilderApi.publishPage(state.activePage.id, isPublished);
      const pagesRes = await webBuilderApi.getPages();
      dispatch({ type: 'SET_PAGES', pages: pagesRes.data.map(p => ({
        id: p.id,
        pageType: 'Custom' as const,
        slug: p.slug,
        title: p.title,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt,
      })) });
      toast.success(isPublished ? 'Sayfa yayınlandı.' : 'Sayfa yayından kaldırıldı.');
    } catch {
      toast.error('İşlem başarısız.');
    }
  }, [state.activePage, dispatch]);

  const deletePage = useCallback(async (pageId: string) => {
    try {
      await webBuilderApi.deletePage(pageId);
      const pagesRes = await webBuilderApi.getPages();
      dispatch({ type: 'SET_PAGES', pages: pagesRes.data.map(p => ({
        id: p.id,
        pageType: 'Custom' as const,
        slug: p.slug,
        title: p.title,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt,
      })) });
      const first = pagesRes.data[0];
      if (first) await loadPage(first.slug);
      toast.success('Sayfa silindi.');
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  }, [dispatch, loadPage]);

  const loadVersions = useCallback(async () => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_VERSIONS_LOADING', loading: true });
    try {
      const res = await webBuilderApi.getVersions(state.activePage.id);
      // Map CorpPageVersionSummary to ThemeVersionSummary shape for the shared context
      dispatch({ type: 'SET_THEME_VERSIONS', versions: res.data.map((v, idx) => ({
        id: idx,
        versionNumber: idx + 1,
        versionLabel: v.checkpointLabel,
        versionType: 'checkpoint' as const,
        isPublished: false,
        restoredFromVersionId: null,
        changedByEmail: v.createdByUser,
        createdAt: v.createdAt,
        _versionId: v.id,
      })) });
    } catch {
      toast.error('Versiyon geçmişi yüklenemedi.');
    } finally {
      dispatch({ type: 'SET_VERSIONS_LOADING', loading: false });
    }
  }, [state.activePage, dispatch]);

  const createCheckpoint = useCallback(async (label: string) => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await webBuilderApi.createCheckpoint(state.activePage.id, label);
      toast.success('Checkpoint oluşturuldu.');
      await loadVersions();
    } catch {
      toast.error('Checkpoint oluşturulamadı.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [state.activePage, dispatch, loadVersions]);

  const rollbackVersion = useCallback(async (versionId: string) => {
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await webBuilderApi.rollbackVersion(versionId);
      toast.success('Versiyona geri alındı. Sayfa yenileniyor...');
      await loadPages();
      await loadVersions();
    } catch {
      toast.error('Geri alma başarısız.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [dispatch, loadPages, loadVersions]);

  const saveAll = useCallback(async () => {
    await Promise.all([saveLayout(), saveSeo(), saveBacklinks()]);
    if (!state.activePage) return;
    try {
      const time = new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
      await webBuilderApi.createCheckpoint(state.activePage.id, `Otomatik — ${time}`);
      const res = await webBuilderApi.getVersions(state.activePage.id);
      dispatch({ type: 'SET_THEME_VERSIONS', versions: res.data.map((v, idx) => ({
        id: idx,
        versionNumber: idx + 1,
        versionLabel: v.checkpointLabel,
        versionType: 'checkpoint' as const,
        isPublished: false,
        restoredFromVersionId: null,
        changedByEmail: v.createdByUser,
        createdAt: v.createdAt,
        _versionId: v.id,
      })) });
    } catch {
      // Auto-checkpoint failure is non-critical
    }
  }, [saveLayout, saveSeo, saveBacklinks, state.activePage, dispatch]);

  const createPage = useCallback(async (pageType: string, slug: string, title: string) => {
    try {
      await webBuilderApi.createPage({ pageType, slug, title });
      await loadPages();
      await loadPage(slug);
      toast.success('Sayfa oluşturuldu.');
    } catch {
      toast.error('Sayfa oluşturulamadı.');
    }
  }, [loadPages, loadPage]);

  return {
    loadPages,
    loadPage,
    saveLayout,
    saveSeo,
    saveBacklinks,
    publishPage,
    deletePage,
    saveAll,
    loadVersions,
    createCheckpoint,
    rollbackVersion,
    createPage,
  };
}
