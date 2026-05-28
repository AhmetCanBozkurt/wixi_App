import { useState, Fragment } from 'react';
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
  FaPlus,
} from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import type { LayoutRow } from '../../../entities/StorePage/model/types';
import styles from './Panels.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

function rowSubtitle(row: LayoutRow): string {
  const filled = row.columns.filter(c => c.component !== null).length;
  const total = row.columns.length;
  return `${filled}/${total} kolon dolu`;
}

// ── Recursive Layer Item Helper ──────────────────────────────────────────────

interface RecursiveLayerItemProps {
  comp: any;
  level: number;
  selectedComponentId: string | null;
  onSelectBlock: (id: string) => void;
  onDispatch: (action: any) => void;
}

function RecursiveLayerItem({
  comp,
  level = 1,
  selectedComponentId,
  onSelectBlock,
  onDispatch,
}: RecursiveLayerItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const def = BLOCK_BY_TYPE[comp.type];
  const Icon = def?.icon;
  const isCompSelected = comp.id === selectedComponentId;
  const hasChildren = comp.children && comp.children.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div
        className={`${styles.layerChildRow} ${isCompSelected ? styles.layerChildRowActive : ''}`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectBlock(comp.id);
        }}
      >
        {hasChildren ? (
          <button
            className={styles.layerExpandBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            type="button"
            style={{ marginRight: '4px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isExpanded ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
          </button>
        ) : (
          <span className={styles.layerChildDot} style={{ marginRight: '8px' }} />
        )}
        <span className={styles.layerIcon} style={{ fontSize: '10px', opacity: 0.6, marginRight: '6px' }}>
          {Icon ? <Icon /> : <FaLayerGroup />}
        </span>
        <span
          className={isCompSelected ? styles.layerName : undefined}
          style={{ flex: 1, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {def?.name ?? comp.type}
        </span>
        <div className={styles.layerActions} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.layerBtn}
            onClick={() => onDispatch({ type: 'DUPLICATE_COMPONENT', componentId: comp.id })}
            title="Çoğalt"
            type="button"
          >
            <FaCopy />
          </button>
          <button
            className={`${styles.layerBtn} ${styles.layerBtnDanger}`}
            onClick={() => onDispatch({ type: 'REMOVE_COMPONENT', componentId: comp.id })}
            title="Sil"
            type="button"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {comp.children.map((child: any) => (
            <RecursiveLayerItem
              key={child.id}
              comp={child}
              level={level + 1}
              selectedComponentId={selectedComponentId}
              onSelectBlock={onSelectBlock}
              onDispatch={onDispatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main LayersPanel ──────────────────────────────────────────────────────────

export function LayersPanel() {
  const { state, dispatch } = useEditor();
  const { layout, selectedComponentId, selectedRowId, selectedColumnId } = state;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedFixed, setSelectedFixed] = useState<'navbar' | 'footer' | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleSelectFixed = (which: 'navbar' | 'footer') => {
    dispatch({ type: 'SELECT_COMPONENT', id: null });
    setSelectedFixed(which);
    dispatch({ type: 'SET_LEFT_TAB', tab: 'global' });
  };

  const handleSelectRow = (rowId: string) => {
    setSelectedFixed(null);
    dispatch({ type: 'SELECT_ROW', rowId });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
  };

  const handleSelectBlock = (componentId: string) => {
    setSelectedFixed(null);
    dispatch({ type: 'SELECT_COMPONENT', id: componentId });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
  };

  const handleSelectColumn = (rowId: string, columnId: string) => {
    setSelectedFixed(null);
    dispatch({ type: 'SELECT_COLUMN', rowId, columnId });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Katmanlar</span>
        <span className={styles.layerCount}>{layout.length}</span>
      </div>

      <div className={styles.layerList}>

        {/* Fixed: Navbar */}
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
            <span>Satir yok — sol panelden blok ekleyin</span>
          </div>
        )}

        {layout.map((row, rowIdx) => {
          const isRowExpanded = expanded.has(row.id);
          const isRowSelected = row.id === selectedRowId && !selectedComponentId && !selectedColumnId;
          const subtitle = rowSubtitle(row);

          return (
            <Fragment key={row.id}>
              {/* Row header */}
              <div
                className={`${styles.layerItem} ${isRowSelected ? styles.layerItemActive : ''}`}
                onClick={() => handleSelectRow(row.id)}
              >
                <button
                  className={styles.layerExpandBtn}
                  onClick={e => { e.stopPropagation(); toggleExpand(row.id); }}
                  type="button"
                  title={isRowExpanded ? 'Kapat' : 'Ac'}
                >
                  {isRowExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </button>

                <span className={styles.layerIndex}>{rowIdx + 1}</span>

                <span className={styles.layerIcon}><FaLayerGroup /></span>

                <div className={styles.layerInfo}>
                  <span className={styles.layerName}>Satir</span>
                  <span className={styles.layerSubtitle}>{subtitle}</span>
                </div>

                <div className={styles.layerActions} onClick={e => e.stopPropagation()}>
                  <button
                    className={styles.layerBtn}
                    disabled={rowIdx === 0}
                    onClick={() => dispatch({ type: 'MOVE_ROW', rowId: row.id, direction: 'up' })}
                    title="Yukari Tasimak"
                    type="button"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    className={styles.layerBtn}
                    disabled={rowIdx === layout.length - 1}
                    onClick={() => dispatch({ type: 'MOVE_ROW', rowId: row.id, direction: 'down' })}
                    title="Asagi Tasimak"
                    type="button"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    className={styles.layerBtn}
                    onClick={() => dispatch({ type: 'ADD_COLUMN_TO_ROW', rowId: row.id })}
                    title="Kolon Ekle"
                    type="button"
                  >
                    <FaPlus />
                  </button>
                  <button
                    className={`${styles.layerBtn} ${styles.layerBtnDanger}`}
                    onClick={() => dispatch({ type: 'REMOVE_ROW', rowId: row.id })}
                    title="Satiri Sil"
                    type="button"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Columns (expanded) */}
              {isRowExpanded && (
                <div className={styles.layerChildList}>
                  {row.columns.map((col, colIdx) => {
                    const comp = col.component;
                    const def = comp ? BLOCK_BY_TYPE[comp.type] : undefined;
                    const Icon = def?.icon;
                    const isColSelected = col.id === selectedColumnId && !selectedComponentId;
                    const isCompSelected = comp ? comp.id === selectedComponentId : false;

                    return (
                      <Fragment key={col.id}>
                        {/* Column row */}
                        <div
                          className={`${styles.layerChildRow} ${isColSelected ? styles.layerChildRowActive : ''}`}
                          onClick={e => {
                            e.stopPropagation();
                            if (comp) {
                              handleSelectBlock(comp.id);
                            } else {
                              handleSelectColumn(row.id, col.id);
                            }
                          }}
                        >
                          <span className={styles.layerChildDot} />
                          <span className={styles.layerIcon} style={{ fontSize: '10px', opacity: 0.6 }}>
                            {comp && Icon ? <Icon /> : <FaLayerGroup />}
                          </span>
                          <span
                            className={isCompSelected ? styles.layerName : undefined}
                            style={{ flex: 1, fontSize: '11px' }}
                          >
                            {comp ? (def?.name ?? comp.type) : `Bos kolon ${colIdx + 1}`}
                          </span>
                          <span style={{ fontSize: '9px', opacity: 0.45, fontFamily: 'monospace', flexShrink: 0, marginRight: '4px' }}>
                            {col.span}/12
                          </span>
                          <div className={styles.layerActions} onClick={e => e.stopPropagation()}>
                            {comp && (
                              <>
                                <button
                                  className={styles.layerBtn}
                                  onClick={() => dispatch({ type: 'DUPLICATE_COMPONENT', componentId: comp.id })}
                                  title="Cogalt"
                                  type="button"
                                >
                                  <FaCopy />
                                </button>
                                <button
                                  className={`${styles.layerBtn} ${styles.layerBtnDanger}`}
                                  onClick={() => dispatch({ type: 'REMOVE_COMPONENT', componentId: comp.id })}
                                  title="Sil"
                                  type="button"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                            {!comp && (
                              <button
                                className={`${styles.layerBtn} ${styles.layerBtnDanger}`}
                                onClick={() => dispatch({ type: 'REMOVE_COLUMN', rowId: row.id, columnId: col.id })}
                                title="Kolonu Sil"
                                type="button"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Render children recursively if they exist */}
                        {comp && comp.children && comp.children.length > 0 && (
                          comp.children.map(child => (
                            <RecursiveLayerItem
                              key={child.id}
                              comp={child}
                              level={1}
                              selectedComponentId={selectedComponentId}
                              onSelectBlock={handleSelectBlock}
                              onDispatch={dispatch}
                            />
                          ))
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              )}
            </Fragment>
          );
        })}

        {layout.length > 0 && <div className={styles.layerDivider} />}

        {/* Fixed: Footer */}
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
