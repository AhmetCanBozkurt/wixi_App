import { useEditor } from '../../ThemeBuilder/context/EditorContext';
import { useWebBuilder } from '../hooks/useWebBuilder';
import styles from '../../ThemeBuilder/panels/Panels.module.css';

function CharCount({ val, max }: { val: string; max: number }) {
  const len = val.length;
  const color = len > max ? '#ef4444' : len > max * 0.9 ? '#f59e0b' : '#10b981';
  return <span style={{ fontSize: '10px', color }}>{len}/{max}</span>;
}

export function WebSeoPanel() {
  const { state, dispatch } = useEditor();
  const { saveSeo } = useWebBuilder();
  const { seo, activePage } = state;

  const set = (key: keyof typeof seo, val: string) => {
    dispatch({ type: 'SET_SEO', seo: { ...seo, [key]: val } });
  };

  if (!activePage) {
    return (
      <div className={styles.panel}>
        <div className={styles.noSelection}><p>Önce bir sayfa seçin.</p></div>
      </div>
    );
  }

  const previewTitle = seo.metaTitle || activePage.title;
  const previewDesc = seo.metaDescription || '';

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>SEO Ayarları</span>
        <button className={styles.saveBtn} onClick={() => void saveSeo()} disabled={state.isSaving}>
          Kaydet
        </button>
      </div>

      <div className={styles.serpPreview}>
        <div className={styles.serpUrl}>
          {window.location.hostname}/corp/{activePage.slug}
        </div>
        <div className={styles.serpTitle} style={{ color: '#1a0dab' }}>
          {previewTitle || 'Sayfa Başlığı'}
        </div>
        <div className={styles.serpDesc}>
          {previewDesc || 'Meta açıklaması burada görünür. Sayfanızın içeriğini özetleyen 160 karakterlik bir metin yazın.'}
        </div>
      </div>

      <div className={styles.propList}>
        <div className={styles.propGroup}>
          <div className={styles.propLabelRow}>
            <label className={styles.propLabel}>Meta Başlık</label>
            <CharCount val={seo.metaTitle} max={60} />
          </div>
          <input
            className={styles.input}
            value={seo.metaTitle}
            onChange={e => set('metaTitle', e.target.value)}
            placeholder="Sayfa başlığı (60 karakter önerilir)"
            maxLength={80}
          />
        </div>

        <div className={styles.propGroup}>
          <div className={styles.propLabelRow}>
            <label className={styles.propLabel}>Meta Açıklaması</label>
            <CharCount val={seo.metaDescription} max={160} />
          </div>
          <textarea
            className={styles.textarea}
            rows={3}
            value={seo.metaDescription}
            onChange={e => set('metaDescription', e.target.value)}
            placeholder="Arama sonuçlarında görünen açıklama (160 karakter önerilir)"
            maxLength={320}
          />
        </div>

        <div className={styles.propGroup}>
          <label className={styles.propLabel}>Anahtar Kelimeler</label>
          <input
            className={styles.input}
            value={seo.metaKeywords}
            onChange={e => set('metaKeywords', e.target.value)}
            placeholder="kelime1, kelime2, kelime3"
          />
        </div>

        <div className={styles.propGroup}>
          <label className={styles.propLabel}>OG Görseli (Open Graph)</label>
          <input
            className={styles.input}
            type="url"
            value={seo.openGraphImageUrl}
            onChange={e => set('openGraphImageUrl', e.target.value)}
            placeholder="https://..."
          />
          {seo.openGraphImageUrl && (
            <img
              src={seo.openGraphImageUrl}
              alt="OG Preview"
              style={{ width: '100%', borderRadius: '6px', marginTop: '8px', border: '1px solid #e5e7eb' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
