import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import type { Backlink } from '../../../../../entities/StorePage/model/types';
import { FaPlus, FaTrash } from 'react-icons/fa';
import styles from './Panels.module.css';

export function BacklinksPanel({ tenantSlug }: { tenantSlug: string }) {
  const { state, dispatch } = useEditor();
  const { saveBacklinks } = useThemeEditor(tenantSlug);
  const { backlinks, activePage } = state;

  if (!activePage) {
    return <div className={styles.panel}><div className={styles.noSelection}><p>Önce bir sayfa seçin.</p></div></div>;
  }

  const update = (idx: number, partial: Partial<Backlink>) => {
    const updated = backlinks.map((b, i) => i === idx ? { ...b, ...partial } : b);
    dispatch({ type: 'SET_BACKLINKS', backlinks: updated });
  };

  const add = () => {
    dispatch({ type: 'SET_BACKLINKS', backlinks: [...backlinks, { url: '', anchorText: '', noFollow: false }] });
  };

  const remove = (idx: number) => {
    dispatch({ type: 'SET_BACKLINKS', backlinks: backlinks.filter((_, i) => i !== idx) });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Bağlantılar</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.addBtn} onClick={add} title="Bağlantı Ekle"><FaPlus /></button>
          <button className={styles.saveBtn} onClick={() => void saveBacklinks()} disabled={state.isSaving}>
            Kaydet
          </button>
        </div>
      </div>

      <div className={styles.backlinkHelp}>
        Bu sayfadan diğer sayfalara veya harici kaynaklara iç/dış bağlantılar ekleyin.
      </div>

      <div className={styles.propList}>
        {backlinks.length === 0 && (
          <div className={styles.noSelection}>
            <p>Henüz bağlantı yok.</p>
            <button className={styles.addBtn} onClick={add} style={{ marginTop: '12px' }}>
              <FaPlus /> İlk Bağlantıyı Ekle
            </button>
          </div>
        )}

        {backlinks.map((link, idx) => (
          <div key={idx} className={styles.backlinkItem}>
            <div className={styles.backlinkHeader}>
              <span className={styles.backlinkIndex}>#{idx + 1}</span>
              <button className={`${styles.iconBtn} ${styles.dangerBtn}`} onClick={() => remove(idx)} title="Kaldır">
                <FaTrash />
              </button>
            </div>
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>URL</label>
              <input
                className={styles.input}
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={e => update(idx, { url: e.target.value })}
              />
            </div>
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Bağlantı Metni</label>
              <input
                className={styles.input}
                placeholder="Bağlantı metnini girin"
                value={link.anchorText}
                onChange={e => update(idx, { anchorText: e.target.value })}
              />
            </div>
            <div className={styles.propGroup}>
              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={link.noFollow}
                  onChange={e => update(idx, { noFollow: e.target.checked })}
                />
                <span>NoFollow (rel="nofollow")</span>
              </label>
            </div>
            {link.url && link.anchorText && (
              <div className={styles.backlinkPreview}>
                Önizleme: <a href={link.url} target="_blank" rel="noreferrer">{link.anchorText}</a>
                {link.noFollow && <span className={styles.nofollowBadge}>nofollow</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
