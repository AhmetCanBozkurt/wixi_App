import { useState } from 'react';
import { BLOCK_REGISTRY, BLOCK_CATEGORIES } from '../blocks/blockRegistry';
import { useEditor } from '../context/EditorContext';
import type { LayoutComponent } from '../../../entities/StorePage/model/types';
import styles from './Panels.module.css';

interface ComponentsPanelProps {
  excludeCategories?: (keyof typeof BLOCK_CATEGORIES)[];
}

export function ComponentsPanel({ excludeCategories }: ComponentsPanelProps = {}) {
  const { state, dispatch, setInsertIndex } = useEditor();
  const { insertAtIndex } = state;
  const [query, setQuery] = useState('');

  const addComponent = (type: string) => {
    const def = BLOCK_REGISTRY.find(b => b.type === type);
    if (!def) return;
    const comp: LayoutComponent = {
      id: crypto.randomUUID(),
      type: def.type,
      props: { ...def.defaultProps },
    };
    dispatch({ type: 'ADD_COMPONENT', component: comp });
    dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
  };

  const q = query.trim().toLowerCase();

  const categories = (Object.entries(BLOCK_CATEGORIES) as [keyof typeof BLOCK_CATEGORIES, string][])
    .filter(([cat]) => !excludeCategories?.includes(cat));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}><span>Bileşen Ekle</span></div>

      {insertAtIndex !== null && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'rgba(236,72,153,0.12)',
          borderBottom: '1px solid rgba(236,72,153,0.3)',
          fontSize: '11px',
          color: '#ec4899',
          gap: '8px',
          flexShrink: 0,
        }}>
          <span>📌 {insertAtIndex + 1}. sıraya eklenecek</span>
          <button
            onClick={() => setInsertIndex(null)}
            style={{ background: 'transparent', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}
            type="button"
            title="Pozisyonu temizle — sona ekle"
          >
            ×
          </button>
        </div>
      )}

      {/* Search */}
      <div className={styles.compSearchWrap}>
        <input
          className={styles.compSearchInput}
          type="text"
          placeholder="Bileşen ara..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className={styles.compSearchClear} onClick={() => setQuery('')} type="button">
            ×
          </button>
        )}
      </div>

      <div className={styles.componentsList}>
        {categories.map(([cat, label]) => {
          const blocks = BLOCK_REGISTRY.filter(
            b => b.category === cat && (!q || b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q)),
          );
          if (blocks.length === 0) return null;
          return (
            <div key={cat}>
              <div className={styles.categoryLabel}>{label}</div>
              <div className={styles.blocksGrid}>
                {blocks.map(block => (
                  <button
                    key={block.type}
                    className={styles.blockBtn}
                    onClick={() => addComponent(block.type)}
                    title={block.name}
                  >
                    <block.icon className={styles.blockIcon} />
                    <span>{block.name}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {q && categories.every(([cat]) => {
          const blocks = BLOCK_REGISTRY.filter(
            b => b.category === cat && (b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q)),
          );
          return blocks.length === 0;
        }) && (
          <div className={styles.noSelection} style={{ paddingTop: '32px' }}>
            <span>"{query}" için bileşen bulunamadı</span>
          </div>
        )}
      </div>
    </div>
  );
}
