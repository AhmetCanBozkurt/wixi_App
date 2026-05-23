import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { StorePageSummary, StoreSettings, GlobalComponentsConfig } from '../../entities/StorePage/model/types';
import { storefrontApi } from '../../entities/StorePage/api/storePageApi';
import styles from './StorefrontFooter.module.css';

interface StorefrontFooterProps {
  settings: StoreSettings | null;
  pages: StorePageSummary[];
  tenantSlug?: string;
}

export const StorefrontFooter = ({ settings, pages, tenantSlug = '' }: StorefrontFooterProps) => {
  const year = new Date().getFullYear();
  const storeName = settings?.storeName || 'Mağaza';

  // ── Parse global config ──────────────────────────────────────────────────────
  let socialLinks: Record<string, string> = {};
  if (settings?.socialLinksJson) {
    try { socialLinks = JSON.parse(settings.socialLinksJson) as Record<string, string>; } catch { /* ignore */ }
  }

  let globalComponents: GlobalComponentsConfig | null = null;
  if (settings?.globalComponentsConfigJson) {
    try { globalComponents = JSON.parse(settings.globalComponentsConfigJson) as GlobalComponentsConfig; } catch { /* ignore */ }
  }

  const colCount       = globalComponents?.footer?.columnCount ?? 3;
  const showSocials    = globalComponents?.footer?.showSocials ?? true;
  const showNewsletter = globalComponents?.footer?.showNewsletter ?? false;
  const copyrightText  = globalComponents?.footer?.copyrightText || '';
  const footerCustomCss = globalComponents?.footer?.customCss ?? '';
  const footerCustomJs  = globalComponents?.footer?.customJs ?? '';

  // ── Newsletter state ─────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await storefrontApi.subscribeNewsletter(tenantSlug, email.trim());
      toast.success('E-bültene abone oldunuz!');
      setEmail('');
    } catch {
      toast.error('Abone olurken hata oluştu.');
    } finally {
      setSubscribing(false);
    }
  };

  const footerPages = pages.filter(p => p.isPublished);

  return (
    <>
      {footerCustomCss && <style dangerouslySetInnerHTML={{ __html: footerCustomCss }} />}

      <footer className={styles.footer}>
        {/* ── Newsletter banner (full-width, above columns) ── */}
        {showNewsletter && (
          <div className={styles.newsletter}>
            <div className={styles.newsletterInner}>
              <div className={styles.newsletterText}>
                <h3 className={styles.newsletterTitle}>Fırsatlardan Haberdar Olun</h3>
                <p className={styles.newsletterDesc}>Kampanya ve yenilikleri kaçırmayın.</p>
              </div>
              <form className={styles.newsletterForm} onSubmit={e => void handleSubscribe(e)}>
                <input
                  className={styles.newsletterInput}
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className={styles.newsletterBtn}
                  disabled={subscribing}
                >
                  {subscribing ? 'Gönderiliyor...' : 'Abone Ol'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Columns ─────────────────────────────────────── */}
        <div
          className={styles.inner}
          style={{ '--footer-col-count': colCount } as React.CSSProperties}
        >
          {/* Brand column */}
          <div className={styles.col}>
            <div className={styles.brandName}>{storeName}</div>
            {settings?.seoDescription && (
              <p className={styles.description}>{settings.seoDescription}</p>
            )}
          </div>

          {/* Pages column */}
          {footerPages.length > 0 && (
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Sayfalar</h4>
              <ul className={styles.list}>
                {footerPages.map(p => (
                  <li key={p.id}>
                    <Link
                      to={p.slug === 'home' ? '/' : `/${p.slug}`}
                      className={styles.footerLink}
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact column */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>İletişim</h4>
            <ul className={styles.list}>
              {settings?.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className={styles.footerLink}>
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings?.contactPhone && (
                <li>
                  <a href={`tel:${settings.contactPhone}`} className={styles.footerLink}>
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className={styles.address}>{settings.address}</li>
              )}
            </ul>
          </div>

          {/* Socials column */}
          {showSocials && Object.keys(socialLinks).length > 0 && (
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Sosyal Medya</h4>
              <div className={styles.socialLinks}>
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom bar ──────────────────────────────────── */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            {copyrightText || `© ${year} ${storeName}. Tüm hakları saklıdır.`}
          </p>
        </div>
      </footer>

      {footerCustomJs && <script dangerouslySetInnerHTML={{ __html: footerCustomJs }} />}
    </>
  );
};
