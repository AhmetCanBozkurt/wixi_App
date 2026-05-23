import { FaArrowUp, FaArrowDown, FaCopy, FaTrash, FaLayerGroup } from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import styles from './Panels.module.css';

export function LayersPanel() {
  const { state, dispatch } = useEditor();
  const { layout, selectedComponentId } = state;

  if (layout.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>Katmanlar</span>
          <span className={styles.layerCount}>0</span>
        </div>
        <div className={styles.noSelection}>
          <FaLayerGroup style={{ fontSize: '24px', opacity: 0.3 }} />
          <span>Henüz bileşen yok</span>
          <span style={{ fontSize: '11px' }}>Bileşenler sekmesinden ekleyin</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Katmanlar</span>
        <span className={styles.layerCount}>{layout.length}</span>
      </div>

      <div className={styles.layerList}>
        {layout.map((comp, idx) => {
          const def = BLOCK_BY_TYPE[comp.type];
          const Icon = def?.icon;
          const isSelected = comp.id === selectedComponentId;

          // Pick the most descriptive subtitle from props
          const rawSubtitle =
            (comp.props.title as string | undefined) ??
            (comp.props.message as string | undefined) ??
            (comp.props.html as string | undefined) ??
            '';
          // Strip HTML tags from richtext
          const subtitle = rawSubtitle.replace(/<[^>]+>/g, '').slice(0, 35);

          return (
            <div
              key={comp.id}
              className={`${styles.layerItem} ${isSelected ? styles.layerItemActive : ''}`}
              onClick={() => {
                dispatch({ type: 'SELECT_COMPONENT', id: comp.id });
                dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
              }}
            >
              {/* Index */}
              <span className={styles.layerIndex}>{idx + 1}</span>

              {/* Type icon */}
              <span className={styles.layerIcon}>
                {Icon ? <Icon /> : <FaLayerGroup />}
              </span>

              {/* Name + subtitle */}
              <div className={styles.layerInfo}>
                <span className={styles.layerName}>{def?.name ?? comp.type}</span>
                {subtitle && <span className={styles.layerSubtitle}>{subtitle}</span>}
              </div>

              {/* Action buttons — shown on hover / selected */}
              <div className={styles.layerActions} onClick={e => e.stopPropagation()}>
                <button
                  className={styles.layerBtn}
                  disabled={idx === 0}
                  onClick={() => dispatch({ type: 'MOVE_COMPONENT', id: comp.id, direction: 'up' })}
                  title="Yukarı Taşı"
                  type="button"
                >
                  <FaArrowUp />
                </button>
                <button
                  className={styles.layerBtn}
                  disabled={idx === layout.length - 1}
                  onClick={() => dispatch({ type: 'MOVE_COMPONENT', id: comp.id, direction: 'down' })}
                  title="Aşağı Taşı"
                  type="button"
                >
                  <FaArrowDown />
                </button>
                <button
                  className={styles.layerBtn}
                  onClick={() => dispatch({ type: 'DUPLICATE_COMPONENT', id: comp.id })}
                  title="Çoğalt"
                  type="button"
                >
                  <FaCopy />
                </button>
                <button
                  className={`${styles.layerBtn} ${styles.layerBtnDanger}`}
                  onClick={() => dispatch({ type: 'REMOVE_COMPONENT', id: comp.id })}
                  title="Sil"
                  type="button"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
