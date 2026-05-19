import { lazy, Suspense, useState } from 'react';
import { FaCode } from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { Input } from '../../../../../shared/ui/Input/Input';
import { Select } from '../../../../../shared/ui/Select/Select';
import { Switch } from '../../../../../shared/ui/Switch/Switch';
import { Button } from '../../../../../shared/ui/Button/Button';
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

  return (
    <div className={styles.panel}>
      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Navbar</div>
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

        <button
          type="button"
          className={styles.codeToggle}
          onClick={() => setNavbarCodeOpen(o => !o)}
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
        <div className={styles.themeSectionTitle}>Footer</div>
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

        <button
          type="button"
          className={styles.codeToggle}
          onClick={() => setFooterCodeOpen(o => !o)}
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
          Kaydet
        </Button>
      </div>
    </div>
  );
}
