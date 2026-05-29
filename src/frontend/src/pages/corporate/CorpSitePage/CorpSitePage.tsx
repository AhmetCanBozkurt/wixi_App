import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import { DEFAULT_THEME, mergeTheme, themeToVars } from '../../../entities/StorePage/model/defaultTheme';
import type { LayoutRow, ThemeConfig } from '../../../entities/StorePage/model/types';
import { BlockRenderer } from '../../storefront/StorefrontPage/StorefrontPage';

interface CorpPage {
  slug: string;
  title: string;
  layoutConfigJson: string | null;
  themeOverrideJson: string | null;
  metaTitle: string | null;
  isPublished: boolean;
}

export const CorpSitePage = () => {
  const { tenantSlug, pageSlug } = useParams<{ tenantSlug: string; pageSlug?: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const slug = pageSlug || 'home';

  const [layout, setLayout] = useState<LayoutRow[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
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
      {layout.length === 0 ? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
    </div>
  );
};
