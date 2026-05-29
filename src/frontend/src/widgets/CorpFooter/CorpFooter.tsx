import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import type { FooterConfig } from '../../entities/StorePage/model/types';
import styles from './CorpFooter.module.css';

interface CorpFooterProps {
  config: FooterConfig;
  theme: { colors: { primary: string; background: string; text: string } };
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <FaFacebook />,
  instagram: <FaInstagram />,
  twitter: <FaTwitter />,
  linkedin: <FaLinkedin />,
  youtube: <FaYoutube />,
};

export const CorpFooter = ({ config, theme }: CorpFooterProps) => {
  const bg = '#0f172a';
  const textColor = '#94a3b8';
  const headingColor = '#f1f5f9';
  const primaryColor = theme.colors.primary || '#6366f1';
  const year = new Date().getFullYear();

  const colCount = config.columnCount || 3;
  const defaultCols = [
    { title: 'Kurumsal', links: [{ label: 'Hakkımızda', href: '/hakkimizda' }, { label: 'İletişim', href: '/iletisim' }] },
    { title: 'Hizmetler', links: [{ label: 'Hizmetlerimiz', href: '/hizmetler' }] },
    { title: 'Yasal', links: [{ label: 'Gizlilik', href: '/gizlilik' }, { label: 'Kullanım Şartları', href: '/sartlar' }] },
    { title: 'Destek', links: [{ label: 'Yardım', href: '/yardim' }, { label: 'SSS', href: '/sss' }] },
  ];
  const columns = Array.from({ length: colCount }).map((_, i) =>
    (config.columns && config.columns[i]) || defaultCols[i] || { title: `Kolon ${i + 1}`, links: [] }
  );

  return (
    <>
      {config.customCss && <style dangerouslySetInnerHTML={{ __html: config.customCss }} />}
      <footer className={styles.footer} style={{ backgroundColor: bg, color: textColor }}>
        <div className={styles.inner}>
          <div className={styles.columns} style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {columns.map((col, i) => (
              <div key={i} className={styles.col}>
                <h4 className={styles.colTitle} style={{ color: headingColor }}>{col.title}</h4>
                {col.links.map((link, j) => (
                  <a key={j} href={link.href} className={styles.colLink}>{link.label}</a>
                ))}
              </div>
            ))}
          </div>

          {config.showSocials && config.socialLinks && config.socialLinks.length > 0 && (
            <div className={styles.socials}>
              {config.socialLinks.map((soc, i) => (
                <a key={i} href={soc.url} target="_blank" rel="noreferrer" className={styles.socialLink} style={{ color: primaryColor }}>
                  {SOCIAL_ICONS[soc.platform] ?? soc.platform}
                </a>
              ))}
            </div>
          )}

          <div className={styles.bottom} style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
            <span>{config.copyrightText || `© ${year} Tüm hakları saklıdır.`}</span>
          </div>
        </div>
      </footer>
    </>
  );
};
