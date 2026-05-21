import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import type { ThemeConfig } from '../../../entities/StorePage/model/types';
import styles from './Panels.module.css';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Merriweather', 'Playfair Display', 'DM Sans', 'Outfit',
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.themeField}>
      <label className={styles.themeLabel}>{label}</label>
      <div className={styles.colorRow}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className={styles.colorSwatch} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className={styles.colorText} />
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.themeField}>
      <label className={styles.themeLabel}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className={styles.input} />
    </div>
  );
}

export function ThemePanel({ tenantSlug }: { tenantSlug: string }) {
  const { state, dispatch } = useEditor();
  const { saveTheme } = useThemeEditor(tenantSlug);
  const { theme } = state;

  const set = <K extends keyof ThemeConfig>(section: K, key: keyof ThemeConfig[K], value: string) => {
    dispatch({
      type: 'SET_THEME',
      theme: {
        ...theme,
        [section]: {
          ...theme[section],
          [key]: value,
        },
      },
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Tema</span>
        <button className={styles.saveBtn} onClick={() => void saveTheme()} disabled={state.isSaving}>
          Kaydet
        </button>
      </div>

      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Renkler</div>
        <ColorField label="Ana Renk" value={theme.colors.primary} onChange={v => set('colors', 'primary', v)} />
        <ColorField label="Ana Renk (Hover)" value={theme.colors.primaryHover} onChange={v => set('colors', 'primaryHover', v)} />
        <ColorField label="İkincil Renk" value={theme.colors.secondary} onChange={v => set('colors', 'secondary', v)} />
        <ColorField label="Arka Plan" value={theme.colors.background} onChange={v => set('colors', 'background', v)} />
        <ColorField label="Yüzey" value={theme.colors.surface} onChange={v => set('colors', 'surface', v)} />
        <ColorField label="Metin" value={theme.colors.text} onChange={v => set('colors', 'text', v)} />
        <ColorField label="Soluk Metin" value={theme.colors.textMuted} onChange={v => set('colors', 'textMuted', v)} />
        <ColorField label="Kenarlık" value={theme.colors.border} onChange={v => set('colors', 'border', v)} />
        <ColorField label="Vurgu" value={theme.colors.accent} onChange={v => set('colors', 'accent', v)} />
        <ColorField label="Başarı" value={theme.colors.success} onChange={v => set('colors', 'success', v)} />
        <ColorField label="Tehlike" value={theme.colors.danger} onChange={v => set('colors', 'danger', v)} />
      </div>

      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Tipografi</div>
        <div className={styles.themeField}>
          <label className={styles.themeLabel}>Gövde Fontu</label>
          <select
            className={styles.select}
            value={theme.typography.fontFamily.split(',')[0].trim()}
            onChange={e => set('typography', 'fontFamily', `${e.target.value}, sans-serif`)}
          >
            {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className={styles.themeField}>
          <label className={styles.themeLabel}>Başlık Fontu</label>
          <select
            className={styles.select}
            value={theme.typography.headingFont.split(',')[0].trim()}
            onChange={e => set('typography', 'headingFont', `${e.target.value}, serif`)}
          >
            {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <TextField label="Font Boyutu" value={theme.typography.baseFontSize} onChange={v => set('typography', 'baseFontSize', v)} />
        <TextField label="Satır Yüksekliği" value={theme.typography.lineHeight} onChange={v => set('typography', 'lineHeight', v)} />
        <TextField label="Başlık Kalınlığı" value={theme.typography.headingWeight} onChange={v => set('typography', 'headingWeight', v)} />
      </div>

      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Boşluklar</div>
        <TextField label="Konteyner Genişliği" value={theme.spacing.containerMaxWidth} onChange={v => set('spacing', 'containerMaxWidth', v)} />
        <TextField label="Bölüm Dikey Padding" value={theme.spacing.sectionPaddingY} onChange={v => set('spacing', 'sectionPaddingY', v)} />
        <TextField label="Bölüm Yatay Padding" value={theme.spacing.sectionPaddingX} onChange={v => set('spacing', 'sectionPaddingX', v)} />
      </div>

      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Köşe Yarıçapları</div>
        <TextField label="Küçük (sm)" value={theme.borderRadius.sm} onChange={v => set('borderRadius', 'sm', v)} />
        <TextField label="Orta (md)" value={theme.borderRadius.md} onChange={v => set('borderRadius', 'md', v)} />
        <TextField label="Büyük (lg)" value={theme.borderRadius.lg} onChange={v => set('borderRadius', 'lg', v)} />
        <TextField label="Buton" value={theme.borderRadius.button} onChange={v => set('borderRadius', 'button', v)} />
        <TextField label="Kart" value={theme.borderRadius.card} onChange={v => set('borderRadius', 'card', v)} />
      </div>

      <div className={styles.themeSection}>
        <div className={styles.themeSectionTitle}>Gölgeler</div>
        <TextField label="Kart Gölgesi" value={theme.shadows.card} onChange={v => set('shadows', 'card', v)} />
        <TextField label="Buton Gölgesi" value={theme.shadows.button} onChange={v => set('shadows', 'button', v)} />
      </div>
    </div>
  );
}
