import { lazy, Suspense, useState, useEffect } from 'react';
import { FaCode } from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Switch } from '../../../shared/ui/Switch/Switch';
import { Button } from '../../../shared/ui/Button/Button';
import { ImageUpload } from '../../../shared/ui/ImageUpload/ImageUpload';
import styles from './Panels.module.css';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })));

interface Props { tenantSlug: string; }

export function GlobalPanel({ tenantSlug }: Props) {
  const { state, dispatch } = useEditor();
  const { saveGlobalComponents } = useThemeEditor(tenantSlug);
  const { navbar, footer } = state.globalComponents;

  const [navbarCodeTab, setNavbarCodeTab] = useState<'css' | 'js'>('css');
  const [navbarCodeOpen, setNavbarCodeOpen] = useState(false);
  const [footerCodeTab, setFooterCodeTab] = useState<'css' | 'js'>('css');
  const [footerCodeOpen, setFooterCodeOpen] = useState(false);

  const updateNavbar = (key: string, value: unknown) =>
    dispatch({
      type: 'SET_GLOBAL_COMPONENTS',
      globalComponents: {
        ...state.globalComponents,
        navbar: { ...navbar, [key]: value },
      },
    });

  const updateFooter = (key: string, value: unknown) =>
    dispatch({
      type: 'SET_GLOBAL_COMPONENTS',
      globalComponents: {
        ...state.globalComponents,
        footer: { ...footer, [key]: value },
      },
    });

  // Navbar link handlers
  const navLinks = navbar.links || [];

  const handleAddNavbarLink = () => {
    const updated = [...navLinks, { label: 'Yeni Link', href: '#' }];
    updateNavbar('links', updated);
  };

  const handleUpdateNavbarLink = (idx: number, key: 'label' | 'href', val: string) => {
    const updated = navLinks.map((link, i) => i === idx ? { ...link, [key]: val } : link);
    updateNavbar('links', updated);
  };

  const handleRemoveNavbarLink = (idx: number) => {
    const updated = navLinks.filter((_, i) => i !== idx);
    updateNavbar('links', updated);
  };

  // Footer column handlers
  const footerCols = footer.columns || [];

  const handleUpdateFooterColTitle = (colIdx: number, val: string) => {
    const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
      const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
      return i === colIdx ? { ...existing, title: val } : existing;
    });
    updateFooter('columns', updated);
  };

  const handleAddFooterColLink = (colIdx: number) => {
    const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
      const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
      if (i === colIdx) {
        return {
          ...existing,
          links: [...existing.links, { label: 'Yeni Link', href: '#' }]
        };
      }
      return existing;
    });
    updateFooter('columns', updated);
  };

  const handleUpdateFooterColLink = (colIdx: number, linkIdx: number, key: 'label' | 'href', val: string) => {
    const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
      const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
      if (i === colIdx) {
        return {
          ...existing,
          links: existing.links.map((link, lI) => lI === linkIdx ? { ...link, [key]: val } : link)
        };
      }
      return existing;
    });
    updateFooter('columns', updated);
  };

  const handleRemoveFooterColLink = (colIdx: number, linkIdx: number) => {
    const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
      const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
      if (i === colIdx) {
        return {
          ...existing,
          links: existing.links.filter((_, lI) => lI !== linkIdx)
        };
      }
      return existing;
    });
    updateFooter('columns', updated);
  };

  // Footer social link handlers
  const footerSocials = footer.socialLinks || [];

  const handleUpdateSocialLink = (platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube', url: string) => {
    const exists = footerSocials.some(s => s.platform === platform);
    let updated;
    if (exists) {
      updated = footerSocials.map(s => s.platform === platform ? { ...s, url } : s);
    } else {
      updated = [...footerSocials, { platform, url }];
    }
    updateFooter('socialLinks', updated);
  };

  const getSocialUrl = (platform: string) => {
    return footerSocials.find(s => s.platform === platform)?.url ?? '';
  };

  return (
    <div className={styles.panel}>
      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Navbar Ayarları</div>
        
        <Select
          label="Düzen Şablonu"
          value={navbar.layout}
          onChange={v => updateNavbar('layout', v)}
          options={[
            { label: 'Klasik', value: 'classic' },
            { label: 'Ortalı', value: 'centered' },
            { label: 'Mega', value: 'mega' },
          ]}
        />
        <Select
          label="Logo Pozisyonu"
          value={navbar.logoPosition}
          onChange={v => updateNavbar('logoPosition', v)}
          options={[
            { label: 'Sol', value: 'left' },
            { label: 'Orta', value: 'center' },
          ]}
        />
        <Input
          label="Logo Metni"
          value={navbar.logoText || ''}
          onChange={e => updateNavbar('logoText', e.target.value)}
          placeholder="Mağaza Adı"
        />
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--editor-text-muted)', marginBottom: '6px', display: 'block' }}>Logo Görseli</label>
          <ImageUpload
            value={navbar.logoUrl || ''}
            onChange={val => updateNavbar('logoUrl', val)}
            shape="square"
            size={80}
            hint="Şeffaf PNG önerilir"
          />
        </div>
        <Switch
          label="Sticky Header"
          checked={navbar.isSticky}
          onChange={e => updateNavbar('isSticky', e.target.checked)}
        />
        <Switch
          label="Arama Kutusu"
          checked={navbar.showSearch}
          onChange={e => updateNavbar('showSearch', e.target.checked)}
        />
        <Switch
          label="Dil Seçici"
          checked={navbar.showLanguagePicker}
          onChange={e => updateNavbar('showLanguagePicker', e.target.checked)}
        />

        {/* Menu Links list */}
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--editor-border)', paddingTop: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--editor-text)', marginBottom: '8px', display: 'block' }}>Navbar Menü Linkleri</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map((link, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Input
                    value={link.label}
                    onChange={e => handleUpdateNavbarLink(idx, 'label', e.target.value)}
                    placeholder="Link Metni"
                  />
                  <Input
                    value={link.href}
                    onChange={e => handleUpdateNavbarLink(idx, 'href', e.target.value)}
                    placeholder="Yönlendirme URL"
                  />
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveNavbarLink(idx)}
                  style={{ padding: '8px', minWidth: 'auto', height: '36px' }}
                >
                  Sil
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={handleAddNavbarLink} style={{ marginTop: '4px', fontSize: '12px' }}>
              Yeni Link Ekle
            </Button>
          </div>
        </div>

        <button
          type="button"
          className={styles.codeToggle}
          onClick={() => setNavbarCodeOpen(o => !o)}
          style={{ marginTop: '16px' }}
        >
          <FaCode /> Özel Kod {navbarCodeOpen ? '▲' : '▼'}
        </button>
        {navbarCodeOpen && (
          <div className={styles.codeSection}>
            <div className={styles.codeTabs}>
              <button
                type="button"
                className={`${styles.codeTab} ${navbarCodeTab === 'css' ? styles.codeTabActive : ''}`}
                onClick={() => setNavbarCodeTab('css')}
              >
                CSS
              </button>
              <button
                type="button"
                className={`${styles.codeTab} ${navbarCodeTab === 'js' ? styles.codeTabActive : ''}`}
                onClick={() => setNavbarCodeTab('js')}
              >
                JS
              </button>
            </div>
            <Suspense fallback={<div className={styles.codeLoading}>Yükleniyor...</div>}>
              <MonacoEditor
                height="220px"
                language={navbarCodeTab === 'css' ? 'css' : 'javascript'}
                theme="vs-dark"
                value={navbarCodeTab === 'css' ? (navbar.customCss ?? '') : (navbar.customJs ?? '')}
                onChange={v => updateNavbar(navbarCodeTab === 'css' ? 'customCss' : 'customJs', v ?? '')}
                options={{ minimap: { enabled: false }, fontSize: 12, wordWrap: 'on', scrollBeyondLastLine: false }}
              />
            </Suspense>
          </div>
        )}
      </div>

      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Footer Ayarları</div>
        <Select
          label="Kolon Düzeni"
          value={String(footer.columnCount)}
          onChange={v => updateFooter('columnCount', Number(v))}
          options={[
            { label: '1 Kolon', value: '1' },
            { label: '2 Kolon', value: '2' },
            { label: '3 Kolon', value: '3' },
            { label: '4 Kolon', value: '4' },
          ]}
        />
        <Switch
          label="Sosyal İkonlar"
          checked={footer.showSocials}
          onChange={e => updateFooter('showSocials', e.target.checked)}
        />
        <Switch
          label="Newsletter"
          checked={footer.showNewsletter}
          onChange={e => updateFooter('showNewsletter', e.target.checked)}
        />
        <Input
          label="Telif Hakkı Metni"
          value={footer.copyrightText}
          onChange={e => updateFooter('copyrightText', e.target.value)}
          placeholder="© 2026 Mağazam"
        />

        {/* Footer dynamic columns section */}
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--editor-border)', paddingTop: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--editor-text)', marginBottom: '8px', display: 'block' }}>Footer Kolon İçerikleri</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: footer.columnCount }).map((_, colIdx) => {
              const col = footerCols[colIdx] || { title: `Kolon ${colIdx + 1}`, links: [] };
              return (
                <div key={colIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--editor-border)' }}>
                  <Input
                    label={`Kolon ${colIdx + 1} Başlığı`}
                    value={col.title}
                    onChange={e => handleUpdateFooterColTitle(colIdx, e.target.value)}
                  />
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {col.links && col.links.map((link, linkIdx) => (
                      <div key={linkIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <Input
                            value={link.label}
                            onChange={e => handleUpdateFooterColLink(colIdx, linkIdx, 'label', e.target.value)}
                            placeholder="Etiket"
                          />
                          <Input
                            value={link.href}
                            onChange={e => handleUpdateFooterColLink(colIdx, linkIdx, 'href', e.target.value)}
                            placeholder="URL"
                          />
                        </div>
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveFooterColLink(colIdx, linkIdx)}
                          style={{ padding: '8px', minWidth: 'auto', height: '36px' }}
                        >
                          Sil
                        </Button>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={() => handleAddFooterColLink(colIdx)} style={{ marginTop: '4px', fontSize: '11px', padding: '6px' }}>
                      Link Ekle
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer social links editor */}
        {footer.showSocials && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--editor-border)', paddingTop: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--editor-text)', marginBottom: '8px', display: 'block' }}>Sosyal Medya Adresleri</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'] as const).map(platform => (
                <Input
                  key={platform}
                  label={platform.toUpperCase()}
                  value={getSocialUrl(platform)}
                  onChange={e => handleUpdateSocialLink(platform, e.target.value)}
                  placeholder={`https://${platform}.com/hesabiniz`}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className={styles.codeToggle}
          onClick={() => setFooterCodeOpen(o => !o)}
          style={{ marginTop: '16px' }}
        >
          <FaCode /> Özel Kod {footerCodeOpen ? '▲' : '▼'}
        </button>
        {footerCodeOpen && (
          <div className={styles.codeSection}>
            <div className={styles.codeTabs}>
              <button
                type="button"
                className={`${styles.codeTab} ${footerCodeTab === 'css' ? styles.codeTabActive : ''}`}
                onClick={() => setFooterCodeTab('css')}
              >
                CSS
              </button>
              <button
                type="button"
                className={`${styles.codeTab} ${footerCodeTab === 'js' ? styles.codeTabActive : ''}`}
                onClick={() => setFooterCodeTab('js')}
              >
                JS
              </button>
            </div>
            <Suspense fallback={<div className={styles.codeLoading}>Yükleniyor...</div>}>
              <MonacoEditor
                height="220px"
                language={footerCodeTab === 'css' ? 'css' : 'javascript'}
                theme="vs-dark"
                value={footerCodeTab === 'css' ? (footer.customCss ?? '') : (footer.customJs ?? '')}
                onChange={v => updateFooter(footerCodeTab === 'css' ? 'customCss' : 'customJs', v ?? '')}
                options={{ minimap: { enabled: false }, fontSize: 12, wordWrap: 'on', scrollBeyondLastLine: false }}
              />
            </Suspense>
          </div>
        )}
      </div>

      <div className={styles.themeSection}>
        <Button
          variant="primary"
          isLoading={state.isSaving}
          onClick={() => void saveGlobalComponents()}
        >
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
}
