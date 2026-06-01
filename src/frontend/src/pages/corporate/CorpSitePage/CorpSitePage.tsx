import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import { DEFAULT_THEME, mergeTheme, themeToVars } from '../../../entities/StorePage/model/defaultTheme';
import type { LayoutRow, ThemeConfig, GlobalComponentsConfig } from '../../../entities/StorePage/model/types';
import { BlockRenderer } from '../../storefront/StorefrontPage/StorefrontPage';
import { CorpNavbar } from '../../../widgets/CorpNavbar/CorpNavbar';
import { CorpFooter } from '../../../widgets/CorpFooter/CorpFooter';

interface CorpPage {
  slug: string;
  title: string;
  layoutConfigJson: string | null;
  themeOverrideJson: string | null;
  metaTitle: string | null;
  isPublished: boolean;
}

interface CorpSettingsResponse {
  globalComponentsConfigJson: string | null;
}

export const CorpSitePage = () => {
  const { tenantSlug, pageSlug } = useParams<{ tenantSlug: string; pageSlug?: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const slug = pageSlug || 'home';

  const [layout, setLayout] = useState<LayoutRow[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [globalComponents, setGlobalComponents] = useState<GlobalComponentsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const vars = themeToVars(theme);
    for (const [key, value] of Object.entries(vars)) {
      rootRef.current.style.setProperty(key, value);
    }
  }, [theme]);

  // Load corp settings (navbar/footer config) — independent of page load
  useEffect(() => {
    if (!tenantSlug) return;
    apiClient
      .get<CorpSettingsResponse>(`/public/corp/${tenantSlug}/settings`)
      .then(res => {
        if (res.data.globalComponentsConfigJson) {
          try {
            setGlobalComponents(JSON.parse(res.data.globalComponentsConfigJson) as GlobalComponentsConfig);
          } catch { /* keep null */ }
        }
      })
      .catch(() => { /* non-critical */ });
  }, [tenantSlug]);

  useEffect(() => {
    if (!tenantSlug) return;
    setIsLoading(true);
    setNotFound(false);

    const endpoint = isPreview
      ? `/public/corp/${tenantSlug}/page/${slug}/preview`
      : `/public/corp/${tenantSlug}/page/${slug}`;

    apiClient
      .get<CorpPage>(endpoint)
      .then(res => {
        const page = res.data;

        if (page.metaTitle) document.title = page.metaTitle;
        else document.title = page.title;

        if (page.themeOverrideJson) {
          try {
            setTheme(mergeTheme(DEFAULT_THEME, JSON.parse(page.themeOverrideJson) as Partial<ThemeConfig>));
          } catch { /* keep default */ }
        }

        if (page.layoutConfigJson) {
          try {
            setLayout(JSON.parse(page.layoutConfigJson) as LayoutRow[]);
          } catch { setLayout([]); }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [tenantSlug, slug]);

  const navbarTheme = { colors: { primary: theme.colors.primary, background: theme.colors.background, text: theme.colors.text } };

  if (isLoading) {
    return (
      <div ref={rootRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div ref={rootRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <h2>Sayfa Bulunamadı</h2>
        <p>Bu sayfa mevcut değil veya henüz yayınlanmamış.</p>
      </div>
    );
  }

  return (
    <div ref={rootRef} style={{ minHeight: '100vh', background: 'var(--sf-color-bg, #fff)', color: 'var(--sf-color-text, #111827)' }}>
      {globalComponents?.navbar && (
        <CorpNavbar config={globalComponents.navbar} tenantSlug={tenantSlug!} theme={navbarTheme} />
      )}

      {layout.length === 0 ? (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <h2>Henüz İçerik Eklenmedi</h2>
          <p>Admin panelinden bu sayfayı tasarlayın.</p>
        </div>
      ) : (
        layout.map(row => (
          <div
            key={row.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              backgroundColor: row.props?.backgroundColor || undefined,
              backgroundImage: row.props?.backgroundImage ? `url(${row.props.backgroundImage})` : undefined,
              paddingTop: row.props?.paddingY || undefined,
              paddingBottom: row.props?.paddingY || undefined,
              paddingLeft: row.props?.paddingX || undefined,
              paddingRight: row.props?.paddingX || undefined,
            }}
          >
            {row.columns?.map(col => (
              col.component ? (
                <section
                  key={col.id}
                  id={`block-${col.component.id}`}
                  style={{ gridColumn: `span ${col.span}` }}
                >
                  <BlockRenderer comp={col.component} theme={theme} tenantSlug={tenantSlug!} />
                </section>
              ) : (
                <div key={col.id} style={{ gridColumn: `span ${col.span}` }} />
              )
            ))}
          </div>
        ))
      )}

      {globalComponents?.footer && (
        <CorpFooter config={globalComponents.footer} theme={navbarTheme} />
      )}
    </div>
  );
};
