import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { Input } from '../../../../../shared/ui/Input/Input';
import { Select } from '../../../../../shared/ui/Select/Select';
import { Switch } from '../../../../../shared/ui/Switch/Switch';
import { Button } from '../../../../../shared/ui/Button/Button';
import styles from './Panels.module.css';

interface Props { tenantSlug: string; }

export function GlobalPanel({ tenantSlug }: Props) {
  const { state, dispatch } = useEditor();
  const { saveGlobalComponents } = useThemeEditor(tenantSlug);
  const { navbar, footer } = state.globalComponents;

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
