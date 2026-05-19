import { BLOCK_REGISTRY, BLOCK_CATEGORIES } from '../blocks/blockRegistry';
import { useEditor } from '../context/EditorContext';
import type { LayoutComponent } from '../../../../../entities/StorePage/model/types';
import styles from './Panels.module.css';

export function ComponentsPanel() {
  const { dispatch } = useEditor();

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

  const categories = Object.entries(BLOCK_CATEGORIES) as [keyof typeof BLOCK_CATEGORIES, string][];

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}><span>Bileşen Ekle</span></div>
      <div className={styles.componentsList}>
        {categories.map(([cat, label]) => {
          const blocks = BLOCK_REGISTRY.filter(b => b.category === cat);
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
      </div>
    </div>
  );
}
