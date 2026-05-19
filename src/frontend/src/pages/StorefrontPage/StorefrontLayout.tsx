import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { storefrontApi } from '../../entities/StorePage/api/storePageApi';
import { DEFAULT_THEME, mergeTheme, themeToVars } from '../../entities/StorePage/model/defaultTheme';
import type { StorePageSummary, StoreSettings, ThemeConfig } from '../../entities/StorePage/model/types';
import { useCustomerStore } from '../../entities/Customer/model/store';
import { setSfTenant } from '../../shared/api/storefrontApiClient';
import { StorefrontNavbar } from '../../widgets/StorefrontNavbar/StorefrontNavbar';
import { StorefrontFooter } from '../../widgets/StorefrontFooter/StorefrontFooter';
import styles from './StorefrontLayout.module.css';

export const StorefrontLayout = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [pages, setPages] = useState<StorePageSummary[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const { hydrate } = useCustomerStore();

  useEffect(() => {
    if (!tenantSlug) return;
    setSfTenant(tenantSlug);
    hydrate(tenantSlug);
  }, [tenantSlug, hydrate]);

  useEffect(() => {
    if (!tenantSlug) return;

    Promise.all([
      storefrontApi.getSettings(tenantSlug).catch(() => null),
      storefrontApi.getPages(tenantSlug).catch(() => null),
    ]).then(([settingsRes, pagesRes]) => {
      if (settingsRes?.data) {
        setSettings(settingsRes.data);
        if (settingsRes.data.themeConfigJson) {
          try {
            const parsed = JSON.parse(settingsRes.data.themeConfigJson) as Partial<ThemeConfig>;
            setTheme(mergeTheme(DEFAULT_THEME, parsed));
          } catch {
            // keep default theme
          }
        }
      }
      if (pagesRes?.data) {
        setPages(pagesRes.data);
      }
    });
  }, [tenantSlug]);

  // Inject CSS variables
  useEffect(() => {
    const vars = themeToVars(theme);
    for (const [key, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, [theme]);

  return (
    <div className={styles.layout}>
      <StorefrontNavbar
        settings={settings}
        pages={pages}
        tenantSlug={tenantSlug ?? ''}
      />
      <main className={styles.main}>
        <Outlet context={{ tenantSlug, settings, pages, theme }} />
      </main>
      <StorefrontFooter settings={settings} pages={pages} />
    </div>
  );
};
