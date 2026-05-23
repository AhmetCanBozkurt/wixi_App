import { useState } from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaTrash,
  FaLayerGroup,
  FaBars,
  FaWindowMinimize,
  FaChevronRight,
  FaChevronDown,
} from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import styles from './Panels.module.css';

export function LayersPanel() {
  const { state, dispatch, selectProp } = useEditor();
  const { layout, selectedComponentId, selectedPropKey } = state;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedFixed, setSelectedFixed] = useState<'navbar' | 'footer' | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectBlock = (id: string) => {
    setSelectedFixed(null);
    dispatch({ type: 'SELECT_COMPONENT', id });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
  };

  const handleSelectFixed = (which: 'navbar' | 'footer') => {
    dispatch({ type: 'SELECT_COMPONENT', id: null });
    setSelectedFixed(which);
    dispatch({ type: 'SET_LEFT_TAB', tab: 'global' });
  };

  const handleSelectChild = (compId: string, propKey: string) => {
    dispatch({ type: 'SELECT_COMPONENT', id: compId });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
    selectProp(propKey);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Katmanlar</span>
        <span className={styles.layerCount}>{layout.length}</span>
      </div>

      <div className={styles.layerList}>

        {/* Sabit: Navbar */}
        <div
          className={`${styles.layerFixedRow} ${selectedFixed === 'navbar' ? styles.layerFixedRowActive : ''}`}
          onClick={() => handleSelectFixed('navbar')}
        >
          <span className={styles.layerExpandPlaceholder} />
          <span className={styles.layerIcon}><FaBars /></span>
          <div className={styles.layerInfo}>
            <span className={styles.layerName}>Navbar</span>
          </div>
          <span className={styles.layerFixedBadge}>sabit</span>
        </div>

        {layout.length > 0 && <div className={styles.layerDivider} />}

        {layout.length === 0 && (
          <div className={styles.noSelection} style={{ padding: '16px', fontSize: '12px' }}>
            <FaLayerGroup style={{ fontSize: '20px', opacity: 0.3 }} />
            <span>Bileşen yok — sol panelden ekleyin</span>
          </div>
        )}

        {layout.map((comp, idx) => {
          const def = BLOCK_BY_TYPE[comp.type];
          const Icon = def?.icon;
          const isSelected = comp.id === selectedComponentId;
          const isExpanded = expanded.has(comp.id);
          const children = def?.children ?? [];
          const hasChildren = children.length > 0;

          const rawSubtitle =
            (comp.props.title as string | undefined) ??
            (comp.props.message as string | undefined) ??
            (comp.props.html as string | undefined) ??
            '';
          const subtitle = rawSubtitle.replace(/<[^>]+>/g, '').slice(0, 35);

          return (
            <div key={comp.id}>
              {/* Block satırı */}
              <div
                className={`${styles.layerItem} ${isSelected && !selectedPropKey ? styles.layerItemActive : ''}`}
                onClick={() => handleSelectBlock(comp.id)}
              >
                {hasChildren ? (
                  <button
                    className={styles.layerExpandBtn}
                    onClick={e => { e.stopPropagation(); toggleExpand(comp.id); }}
                    type="button"
                    title={isExpanded ? 'Kapat' : 'Aç'}
                  >
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </button>
                ) : (
                  <span className={styles.layerExpandPlaceholder} />
                )}

                <span className={styles.layerIndex}>{idx + 1}</span>

                <span className={styles.layerIcon}>
                  {Icon ? <Icon /> : <FaLayerGroup />}
                </span>

                <div className={styles.layerInfo}>
                  <span className={styles.layerName}>{def?.name ?? comp.type}</span>
                  {subtitle && <span className={styles.layerSubtitle}>{subtitle}</span>}
                </div>

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

              {/* Children listesi */}
              {hasChildren && isExpanded && (
                <div className={styles.layerChildList}>
                  {children.map(child => {
                    const isChildActive = isSelected && selectedPropKey === child.key;
                    return (
                      <div
                        key={child.key}
                        className={`${styles.layerChildRow} ${isChildActive ? styles.layerChildRowActive : ''}`}
                        onClick={e => { e.stopPropagation(); handleSelectChild(comp.id, child.key); }}
                      >
                        <span className={styles.layerChildDot} />
                        <span>{child.label}</span>
                        {child.selector && (
                          <span style={{ marginLeft: 'auto', fontSize: '9px', opacity: 0.5, fontFamily: 'monospace' }}>
                            {child.selector}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {layout.length > 0 && <div className={styles.layerDivider} />}

        {/* Sabit: Footer */}
        <div
          className={`${styles.layerFixedRow} ${selectedFixed === 'footer' ? styles.layerFixedRowActive : ''}`}
          onClick={() => handleSelectFixed('footer')}
        >
          <span className={styles.layerExpandPlaceholder} />
          <span className={styles.layerIcon}><FaWindowMinimize /></span>
          <div className={styles.layerInfo}>
            <span className={styles.layerName}>Footer</span>
          </div>
          <span className={styles.layerFixedBadge}>sabit</span>
        </div>

      </div>
    </div>
  );
}
