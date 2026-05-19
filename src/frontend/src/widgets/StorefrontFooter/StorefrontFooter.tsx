import React from 'react';
import { Link } from 'react-router-dom';
import type { StorePageSummary, StoreSettings, GlobalComponentsConfig } from '../../entities/StorePage/model/types';
import styles from './StorefrontFooter.module.css';

interface StorefrontFooterProps {
  settings: StoreSettings | null;
  pages: StorePageSummary[];
}

export const StorefrontFooter = ({ settings, pages }: StorefrontFooterProps) => {
  const year = new Date().getFullYear();
  const storeName = settings?.storeName || 'Mağaza';

  let socialLinks: Record<string, string> = {};
  if (settings?.socialLinksJson) {
    try {
      socialLinks = JSON.parse(settings.socialLinksJson) as Record<string, string>;
    } catch {
      // ignore
    }
  }

  let globalComponents: GlobalComponentsConfig | null = null;
  if (settings?.globalComponentsConfigJson) {
    try {
      globalComponents = JSON.parse(settings.globalComponentsConfigJson) as GlobalComponentsConfig;
    } catch {
      // ignore
    }
  }
  const colCount = globalComponents?.footer?.columnCount ?? 3;
  const showSocials = globalComponents?.footer?.showSocials ?? true;
  const copyrightText = globalComponents?.footer?.copyrightText || '';
  const footerCustomCss = globalComponents?.footer?.customCss ?? '';
  const footerCustomJs = globalComponents?.footer?.customJs ?? '';

  const footerPages = pages.filter((p) => p.isPublished);

  return (
    <>
      {footerCustomCss && (
        <style dangerouslySetInnerHTML={{ __html: footerCustomCss }} />
      )}
    <footer className={styles.footer}>
      <div className={styles.inner} style={{ '--footer-col-count': colCount } as React.CSSProperties}>
        <div className={styles.col}>
          <div className={styles.brandName}>{storeName}</div>
          {settings?.seoDescription && (
            <p className={styles.description}>{settings.seoDescription}</p>
          )}
        </div>

        {footerPages.length > 0 && (
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Sayfalar</h4>
            <ul className={styles.list}>
              {footerPages.map((p) => (
                <li key={p.id}>
                  <Link to={p.slug === 'home' ? '/' : `/${p.slug}`} className={styles.footerLink}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.col}>
          <h4 className={styles.colTitle}>İletişim</h4>
          <ul className={styles.list}>
            {settings?.contactEmail && (
              <li><a href={`mailto:${settings.contactEmail}`} className={styles.footerLink}>{settings.contactEmail}</a></li>
            )}
            {settings?.contactPhone && (
              <li><a href={`tel:${settings.contactPhone}`} className={styles.footerLink}>{settings.contactPhone}</a></li>
            )}
            {settings?.address && (
              <li className={styles.address}>{settings.address}</li>
            )}
          </ul>
        </div>

        {showSocials && Object.keys(socialLinks).length > 0 && (
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Sosyal Medya</h4>
            <div className={styles.socialLinks}>
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          {copyrightText || `© ${year} ${storeName}. Tüm hakları saklıdır.`}
        </p>
      </div>
    </footer>
      {footerCustomJs && (
        <script dangerouslySetInnerHTML={{ __html: footerCustomJs }} />
      )}
    </>
  );
};
