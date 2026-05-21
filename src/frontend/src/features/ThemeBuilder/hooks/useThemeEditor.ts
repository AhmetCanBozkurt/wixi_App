import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { storeAdminApi } from '../../../entities/StorePage/api/storePageApi';
import { DEFAULT_THEME, mergeTheme } from '../../../entities/StorePage/model/defaultTheme';
import type { ThemeConfig, GlobalComponentsConfig } from '../../../entities/StorePage/model/types';
import { useEditor } from '../context/EditorContext';

export function useThemeEditor(tenantSlug: string) {
  const { state, dispatch } = useEditor();

  const loadPages = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const [pagesRes, settingsRes] = await Promise.all([
        storeAdminApi.getPages(tenantSlug),
        storeAdminApi.getSettings(tenantSlug),
      ]);

      dispatch({ type: 'SET_PAGES', pages: pagesRes.data });

      if (settingsRes.data.themeConfigJson) {
        try {
          const parsed = JSON.parse(settingsRes.data.themeConfigJson) as Partial<ThemeConfig>;
          dispatch({ type: 'SET_THEME', theme: mergeTheme(DEFAULT_THEME, parsed) });
        } catch {
          // keep default
        }
      }

      if (settingsRes.data.globalComponentsConfigJson) {
        try {
          const parsed = JSON.parse(settingsRes.data.globalComponentsConfigJson) as Partial<GlobalComponentsConfig>;
          dispatch({ type: 'SET_GLOBAL_COMPONENTS', globalComponents: {
            navbar: { layout: 'classic', logoPosition: 'left', isSticky: true, showSearch: true, showLanguagePicker: true, customCss: '', customJs: '', ...(parsed.navbar ?? {}) },
            footer: { columnCount: 3, showSocials: true, showNewsletter: false, copyrightText: '', customCss: '', customJs: '', ...(parsed.footer ?? {}) },
          }});
        } catch {
          // keep default
        }
      }
      if (settingsRes.data.customCssOverride) dispatch({ type: 'SET_CUSTOM_CSS', css: settingsRes.data.customCssOverride });
      if (settingsRes.data.customJsOverride) dispatch({ type: 'SET_CUSTOM_JS', js: settingsRes.data.customJsOverride });

      // Load first page (Home) by default
      const homePage = pagesRes.data.find(p => p.slug === 'home') ?? pagesRes.data[0];
      if (homePage) {
        await loadPage(homePage.slug);
      }
    } catch {
      toast.error('Sayfalar yüklenemedi.');
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const loadPage = useCallback(async (slug: string) => {
    try {
      const res = await storeAdminApi.getPage(tenantSlug, slug);
      dispatch({ type: 'SET_ACTIVE_PAGE', page: res.data });
    } catch {
      toast.error('Sayfa yüklenemedi.');
    }
  }, [tenantSlug, dispatch]);

  const saveLayout = useCallback(async () => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await storeAdminApi.updateLayout(
        tenantSlug,
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
  }, [tenantSlug, state.activePage, state.layout, dispatch]);

  const saveSeo = useCallback(async () => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await storeAdminApi.updateSeo(tenantSlug, state.activePage.id, {
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
  }, [tenantSlug, state.activePage, state.seo, dispatch]);

  const saveBacklinks = useCallback(async () => {
    if (!state.activePage) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await storeAdminApi.updateBacklinks(
        tenantSlug,
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
  }, [tenantSlug, state.activePage, state.backlinks, dispatch]);

  const saveGlobalComponents = useCallback(async () => {
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      const settingsRes = await storeAdminApi.getSettings(tenantSlug);
      await storeAdminApi.updateSettings(tenantSlug, {
        ...settingsRes.data,
        globalComponentsConfigJson: JSON.stringify(state.globalComponents),
      });
      dispatch({ type: 'SET_DIRTY', dirty: false });
      toast.success('Global bileşenler kaydedildi.');
    } catch {
      toast.error('Kayıt hatası.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [tenantSlug, state.globalComponents, dispatch]);

  const saveCustomCode = useCallback(async () => {
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      const settingsRes = await storeAdminApi.getSettings(tenantSlug);
      await storeAdminApi.updateSettings(tenantSlug, {
        ...settingsRes.data,
        customCssOverride: state.customCss || null,
        customJsOverride: state.customJs || null,
      });
      dispatch({ type: 'SET_DIRTY', dirty: false });
      toast.success('Kod kaydedildi.');
    } catch {
      toast.error('Kod kayıt hatası.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [tenantSlug, state.customCss, state.customJs, dispatch]);

  const loadThemeVersions = useCallback(async () => {
    dispatch({ type: 'SET_VERSIONS_LOADING', loading: true });
    try {
      const res = await storeAdminApi.getThemeVersions(tenantSlug);
      dispatch({ type: 'SET_THEME_VERSIONS', versions: res.data });
    } catch {
      toast.error('Versiyon geçmişi yüklenemedi.');
    } finally {
      dispatch({ type: 'SET_VERSIONS_LOADING', loading: false });
    }
  }, [tenantSlug, dispatch]);

  const createCheckpoint = useCallback(async (label: string) => {
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await storeAdminApi.createCheckpoint(tenantSlug, label);
      toast.success('Checkpoint oluşturuldu.');
      await loadThemeVersions();
    } catch {
      toast.error('Checkpoint oluşturulamadı.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [tenantSlug, dispatch, loadThemeVersions]);

  const rollbackVersion = useCallback(async (versionId: number) => {
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await storeAdminApi.rollbackVersion(tenantSlug, versionId);
      toast.success('Versiyona geri alındı. Sayfa yenileniyor...');
      await loadPages();
      await loadThemeVersions();
    } catch {
      toast.error('Geri alma başarısız.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [tenantSlug, dispatch, loadPages, loadThemeVersions]);

  const saveTheme = useCallback(async () => {
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      const settingsRes = await storeAdminApi.getSettings(tenantSlug);
      await storeAdminApi.updateSettings(tenantSlug, {
        ...settingsRes.data,
        themeConfigJson: JSON.stringify(state.theme),
      });
      dispatch({ type: 'SET_DIRTY', dirty: false });
      toast.success('Tema kaydedildi.');
    } catch {
      toast.error('Tema kayıt hatası.');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [tenantSlug, state.theme, dispatch]);

  const publishPage = useCallback(async (isPublished: boolean) => {
    if (!state.activePage) return;
    try {
      await storeAdminApi.publishPage(tenantSlug, state.activePage.id, isPublished);
      // Refresh pages list
      const pagesRes = await storeAdminApi.getPages(tenantSlug);
      dispatch({ type: 'SET_PAGES', pages: pagesRes.data });
      toast.success(isPublished ? 'Sayfa yayınlandı.' : 'Sayfa yayından kaldırıldı.');
    } catch {
      toast.error('İşlem başarısız.');
    }
  }, [tenantSlug, state.activePage, dispatch]);

  const deletePage = useCallback(async (pageId: string) => {
    try {
      await storeAdminApi.deletePage(tenantSlug, pageId);
      const pagesRes = await storeAdminApi.getPages(tenantSlug);
      dispatch({ type: 'SET_PAGES', pages: pagesRes.data });
      // Load home if active page was deleted
      const home = pagesRes.data.find(p => p.slug === 'home');
      if (home) await loadPage(home.slug);
      toast.success('Sayfa silindi.');
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  }, [tenantSlug, dispatch, loadPage]);

  const saveAll = useCallback(async () => {
    await Promise.all([saveLayout(), saveSeo(), saveBacklinks()]);
    // Auto-checkpoint on each save
    try {
      const time = new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
      await storeAdminApi.createCheckpoint(tenantSlug, `Otomatik — ${time}`);
      // Silently refresh versions in background
      const res = await storeAdminApi.getThemeVersions(tenantSlug);
      dispatch({ type: 'SET_THEME_VERSIONS', versions: res.data });
    } catch {
      // Auto-checkpoint failure is non-critical, don't show error
    }
  }, [saveLayout, saveSeo, saveBacklinks, tenantSlug, dispatch]);

  return { loadPages, loadPage, saveLayout, saveSeo, saveBacklinks, saveTheme, saveGlobalComponents, saveCustomCode, publishPage, deletePage, saveAll, loadThemeVersions, createCheckpoint, rollbackVersion };
}
