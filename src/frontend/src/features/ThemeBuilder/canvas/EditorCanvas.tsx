import { useState, useRef, useEffect, Fragment } from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaDesktop,
  FaTabletAlt,
  FaMobileAlt,
  FaCopy,
  FaGripVertical,
  FaPlus,
  FaChevronRight,
  FaLock,
  FaEyeSlash,
} from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor } from '../context/EditorContext';
import type { EditorAction } from '../context/EditorContext';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import { themeToVars } from '../../../entities/StorePage/model/defaultTheme';
import type { LayoutColumn, LayoutRow, ThemeConfig, GlobalComponentsConfig } from '../../../entities/StorePage/model/types';
import { MiniRenderer } from '../blocks/renderers/MiniRenderer';
import { buildDesignStyles } from '../blocks/renderers/designStyles';
import styles from './EditorCanvas.module.css';

// Geriye dönük uyumluluk: ComponentsPanel MiniRenderer'ı buradan import ediyor.
export { MiniRenderer };

const VIEWPORT_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;
type Viewport = 'desktop' | 'tablet' | 'mobile';

// ── Navbar Canvas Preview ─────────────────────────────────────────────────────

function CanvasNavbarPreview({
  config,
  isSelected,
  onClick,
}: {
  config: GlobalComponentsConfig['navbar'];
  isSelected: boolean;
  onClick: () => void;
}) {
  const links = config.links && config.links.length > 0 
    ? config.links 
    : [
        { label: 'Anasayfa', href: '/' },
        { label: 'Ürünler', href: '/products' },
        { label: 'Hakkında', href: '/about' }
      ];

  return (
    <div
      className={`${styles.canvasNavbar} ${isSelected ? styles.canvasNavbarSelected : ''}`}
      onClick={onClick}
      title="Navbar'ı düzenle (Global sekmesi)"
    >
      <div className={styles.canvasNavbarLogo}>
        {config.logoUrl ? (
          <img src={config.logoUrl} alt="Logo" style={{ maxHeight: '28px', display: 'block' }} />
        ) : (
          <span>{config.logoText || (config.logoPosition === 'center' ? '— LOGO —' : 'LOGO')}</span>
        )}
      </div>
      <div className={styles.canvasNavbarLinks}>
        {links.map((link, i) => (
          <span key={i} className={styles.canvasNavbarLink}>{link.label}</span>
        ))}
        {config.showSearch && <span className={styles.canvasNavbarLink}>🔍</span>}
      </div>
    </div>
  );
}

// ── Footer Canvas Preview ─────────────────────────────────────────────────────

function CanvasFooterPreview({
  config,
  isSelected,
  onClick,
}: {
  config: GlobalComponentsConfig['footer'];
  isSelected: boolean;
  onClick: () => void;
}) {
  const defaultCols = [
    { title: 'Kurumsal', links: [{ label: 'Hakkımızda', href: '/about' }, { label: 'İletişim', href: '/contact' }] },
    { title: 'Destek', links: [{ label: 'Yardım', href: '/help' }, { label: 'SSS', href: '/faq' }] },
    { title: 'Yasal', links: [{ label: 'Gizlilik', href: '/privacy' }, { label: 'Şartlar', href: '/terms' }] },
    { title: 'Mağaza', links: [{ label: 'Yeni Gelenler', href: '/new' }, { label: 'İndirimdekiler', href: '/sale' }] }
  ];

  const columnsCount = config.columnCount || 3;
  const columns = Array.from({ length: columnsCount }).map((_, i) => {
    return (config.columns && config.columns[i]) || defaultCols[i] || { title: `Kolon ${i + 1}`, links: [] };
  });

  const socials = config.socialLinks && config.socialLinks.length > 0
    ? config.socialLinks
    : [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'instagram', url: 'https://instagram.com' }
      ];

  return (
    <div
      className={`${styles.canvasFooter} ${isSelected ? styles.canvasFooterSelected : ''}`}
      onClick={onClick}
      title="Footer'ı düzenle (Global sekmesi)"
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsCount}, 1fr)`, gap: '16px', marginBottom: '16px', textAlign: 'left' }}>
        {columns.map((col, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--editor-text)', marginBottom: '4px', textTransform: 'uppercase' }}>{col.title}</h4>
            {col.links && col.links.map((link, lIdx) => (
              <span key={lIdx} style={{ fontSize: '10px', color: 'var(--editor-text-muted)', cursor: 'pointer' }}>{link.label}</span>
            ))}
          </div>
        ))}
      </div>

      {config.showSocials && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          {socials.map((soc, i) => (
            <span key={i} style={{ fontSize: '11px', color: 'var(--editor-text-muted)' }}>
              {soc.platform.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--editor-border)', paddingTop: '12px', fontSize: '11px' }}>
        {config.copyrightText || '© 2024 Mağaza Adı'}
      </div>
    </div>
  );
}

// ── BreadcrumbsBar ────────────────────────────────────────────────────────────

function BreadcrumbsBar() {
  const { state, dispatch } = useEditor();
  const { layout, selectedRowId, selectedColumnId, selectedComponentId } = state;

  if (!selectedRowId) return null;
  const rowIdx = layout.findIndex(r => r.id === selectedRowId);
  if (rowIdx === -1) return null;
  const row = layout[rowIdx];

  const colIdx = selectedColumnId ? row.columns.findIndex(c => c.id === selectedColumnId) : -1;
  const col = colIdx >= 0 ? row.columns[colIdx] : null;
  const comp = col?.component ?? null;
  const blockDef = comp ? BLOCK_BY_TYPE[comp.type] : null;

  return (
    <div className={styles.breadcrumbs}>
      <button
        className={`${styles.breadcrumbItem} ${!selectedColumnId ? styles.breadcrumbActive : ''}`}
        onClick={() => dispatch({ type: 'SELECT_ROW', rowId: selectedRowId })}
        type="button"
      >
        Satır {rowIdx + 1}
      </button>
      {col && (
        <>
          <FaChevronRight className={styles.breadcrumbSep} />
          <button
            className={`${styles.breadcrumbItem} ${selectedColumnId && !selectedComponentId ? styles.breadcrumbActive : ''}`}
            onClick={() => {
              dispatch({ type: 'SELECT_COLUMN', rowId: selectedRowId, columnId: selectedColumnId });
              dispatch({ type: 'SELECT_COMPONENT', id: null });
            }}
            type="button"
          >
            Kolon {colIdx + 1}
          </button>
        </>
      )}
      {comp && (
        <>
          <FaChevronRight className={styles.breadcrumbSep} />
          <button
            className={`${styles.breadcrumbItem} ${selectedComponentId ? styles.breadcrumbActive : ''}`}
            onClick={() => dispatch({ type: 'SELECT_COMPONENT', id: comp.id })}
            type="button"
          >
            {blockDef?.name ?? comp.type}
          </button>
        </>
      )}
    </div>
  );
}

// ── RowInsertZone ─────────────────────────────────────────────────────────────

function RowInsertZone({ index, onInsert }: { index: number; onInsert: (i: number) => void }) {
  return (
    <div className={styles.rowInsertZone} onClick={() => onInsert(index)}>
      <div className={styles.rowInsertLine} />
      <button className={styles.rowInsertBtn} type="button">
        <FaPlus size={9} /> Satır Ekle
      </button>
    </div>
  );
}

// ── ColResizeHandle ───────────────────────────────────────────────────────────

interface ColResizeHandleProps {
  rowId: string;
  leftColId: string;
  rightColId: string;
  leftSpan: number;
  rightSpan: number;
  onResize: (leftColId: string, rightColId: string, newLeft: number, newRight: number) => void;
  rowGridRef: React.RefObject<HTMLDivElement | null>;
}

function ColResizeHandle({ leftColId, rightColId, leftSpan, rightSpan, onResize, rowGridRef }: ColResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [dragSpans, setDragSpans] = useState<{ left: number; right: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const total = leftSpan + rightSpan;
    setIsResizing(true);
    setDragSpans({ left: leftSpan, right: rightSpan });

    const onMouseMove = (ev: MouseEvent) => {
      const rowWidth = rowGridRef.current?.offsetWidth ?? 800;
      const unitW = rowWidth / 12;
      const delta = Math.round((ev.clientX - startX) / unitW);
      const newLeft = Math.max(1, Math.min(total - 1, leftSpan + delta));
      const newRight = total - newLeft;
      setDragSpans({ left: newLeft, right: newRight });
      onResize(leftColId, rightColId, newLeft, newRight);
    };
    const onMouseUp = () => {
      setIsResizing(false);
      setDragSpans(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className={styles.colResizeHandle}
      onMouseDown={handleMouseDown}
      title="Kolon genişliğini ayarla"
    >
      {isResizing && dragSpans && (
        <span className={styles.resizeBadge}>
          {dragSpans.left} : {dragSpans.right}
        </span>
      )}
    </div>
  );
}

// ── ColumnWrapper ─────────────────────────────────────────────────────────────

interface ColumnWrapperProps {
  column: LayoutColumn;
  rowId: string;
  idx: number;
  colCount: number;
  theme: ThemeConfig;
  isSelected: boolean;
  selectedComponentId: string | null;
  onSelectColumn: (rowId: string, colId: string) => void;
  onSelectComponent: (id: string | null) => void;
  onDispatch: (action: EditorAction) => void;
  rowGridRef: React.RefObject<HTMLDivElement | null>;
  nextColumn: LayoutColumn | null;
  onResize: (leftColId: string, rightColId: string, newLeft: number, newRight: number) => void;
  viewport: Viewport;
}

function ColumnWrapper({
  column,
  rowId,
  theme,
  isSelected,
  selectedComponentId,
  onSelectColumn,
  onSelectComponent,
  onDispatch,
  rowGridRef,
  nextColumn,
  onResize,
  viewport,
}: ColumnWrapperProps) {
  const effectiveSpan = viewport === 'mobile' ? 12 : column.span;
  const isColLocked = column.isLocked;
  const isColHidden = column.isHidden;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectColumn(rowId, column.id);
    if (column.component) onSelectComponent(column.component.id);
    else onSelectComponent(null);

    // Prop key detection
    const target = e.target as HTMLElement;
    const propKeyEl = target.closest('[data-prop-key]');
    if (propKeyEl) {
      const propKey = propKeyEl.getAttribute('data-prop-key');
      if (propKey) onDispatch({ type: 'SELECT_PROP', propKey });
    }
  };

  return (
    <div
      className={`${styles.columnWrapper} ${isSelected ? styles.columnSelected : ''}`}
      style={{
        gridColumn: `span ${effectiveSpan}`,
        position: 'relative',
        opacity: isColHidden ? 0.35 : 1,
        border: isColHidden ? '1px dashed var(--color-danger, #ef4444)' : undefined
      }}
      onClick={handleClick}
    >
      <span className={styles.spanBadge}>{column.span}/12</span>
      
      {isColLocked ? (
        <span style={{ position: 'absolute', top: '2px', left: '45px', background: '#ec4899', color: '#fff', fontSize: '8px', padding: '1px 3px', borderRadius: '2px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '2px' }}>
          <FaLock size={7} /> Kilitli
        </span>
      ) : (
        <button
          className={styles.colDeleteBtn}
          type="button"
          title="Kolonu Sil"
          onClick={(e) => {
            e.stopPropagation();
            onDispatch({ type: 'REMOVE_COLUMN', rowId, columnId: column.id });
          }}
        >
          ×
        </button>
      )}

      {column.component ? (
        <div
          className={`${styles.blockWrapper} ${column.component.id === selectedComponentId ? styles.selected : ''}`}
          style={{
            outline: 'none',
            ...buildDesignStyles(column.component.props),
            opacity: column.component.props?.isHidden ? 0.35 : 1,
            border: column.component.props?.isHidden ? '1px dashed var(--color-danger, #ef4444)' : undefined
          }}
        >
          {!!(column.component.props as any)?.isHidden && (
            <span style={{ position: 'absolute', top: '2px', left: '2px', background: '#ef4444', color: '#fff', fontSize: '8px', padding: '1px 3px', borderRadius: '2px', zIndex: 10 }}>Gizli Bileşen</span>
          )}
          {!!(column.component.props as any)?.isLocked && (
            <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#ec4899', color: '#fff', fontSize: '8px', padding: '1px 3px', borderRadius: '2px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '2px' }}><FaLock size={7} /> Kilitli</span>
          )}
          <MiniRenderer comp={column.component} theme={theme} />
        </div>
      ) : (
        <div
          className={styles.emptyColumn}
          onClick={(e) => {
            e.stopPropagation();
            onDispatch({ type: 'SET_INSERT_TARGET_ROW', rowId });
            onDispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
          }}
        >
          <FaPlus size={10} /> Bileşen Ekle
        </div>
      )}

      {nextColumn && !isColLocked && !nextColumn.isLocked && (
        <ColResizeHandle
          rowId={rowId}
          leftColId={column.id}
          rightColId={nextColumn.id}
          leftSpan={column.span}
          rightSpan={nextColumn.span}
          onResize={onResize}
          rowGridRef={rowGridRef}
        />
      )}
    </div>
  );
}

// ── RowWrapper ────────────────────────────────────────────────────────────────

interface RowWrapperProps {
  row: LayoutRow;
  idx: number;
  totalRows: number;
  theme: ThemeConfig;
  selectedRowId: string | null;
  selectedColumnId: string | null;
  selectedComponentId: string | null;
  onDispatch: (action: EditorAction) => void;
  onSelectRow: (id: string | null) => void;
  onSelectColumn: (rowId: string, colId: string) => void;
  onSelectComponent: (id: string | null) => void;
  onInsertRowAt: (index: number) => void;
  viewport: Viewport;
  isDraggingRow: boolean;
}

function RowWrapper({
  row,
  idx,
  totalRows,
  theme,
  selectedRowId,
  selectedColumnId,
  selectedComponentId,
  onDispatch,
  onSelectRow,
  onSelectColumn,
  onSelectComponent,
  onInsertRowAt,
  viewport,
  isDraggingRow,
}: RowWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const rowGridRef = useRef<HTMLDivElement>(null);

  // Local span state for smooth resize
  const [localSpans, setLocalSpans] = useState<Record<string, number>>(() =>
    Object.fromEntries(row.columns.map(c => [c.id, c.span]))
  );

  // Sync when row columns change from outside
  useEffect(() => {
    setLocalSpans(Object.fromEntries(row.columns.map(c => [c.id, c.span])));
  }, [row.columns]);

  const handleResize = (leftColId: string, rightColId: string, newLeft: number, newRight: number) => {
    setLocalSpans(prev => ({ ...prev, [leftColId]: newLeft, [rightColId]: newRight }));
    onDispatch({ type: 'UPDATE_COLUMN_SPAN', rowId: row.id, columnId: leftColId, span: newLeft, siblingId: rightColId, siblingSpan: newRight });
  };

  const isRowLocked = !!(row.props as any)?.isLocked;
  const isRowHidden = !!(row.props as any)?.isHidden;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : isRowHidden ? 0.35 : 1,
    outline: isRowHidden ? '1px dashed var(--color-danger, #ef4444)' : undefined,
  };

  const isRowSelected = row.id === selectedRowId;
  const columnsWithLocalSpans = row.columns.map(col => ({ ...col, span: localSpans[col.id] ?? col.span }));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.rowWrapper} ${isRowSelected ? styles.rowSelected : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectRow(row.id);
        onDispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
      }}
    >
      {/* Drag handle — disabled when locked */}
      <button
        className={styles.rowDragHandle}
        {...(!isRowLocked ? attributes : {})}
        {...(!isRowLocked ? listeners : {})}
        onClick={(e) => e.stopPropagation()}
        title={isRowLocked ? 'Satır kilitli' : 'Sürükleyerek sırala'}
        type="button"
        style={{ cursor: isRowLocked ? 'not-allowed' : undefined, opacity: isRowLocked ? 0.4 : 1 }}
      >
        {isRowLocked ? <FaLock size={12} /> : <FaGripVertical />}
      </button>

      {/* Row toolbar */}
      <div className={styles.rowToolbar} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.toolbarBtn}
          disabled={idx === 0}
          onClick={() => onDispatch({ type: 'MOVE_ROW', rowId: row.id, direction: 'up' })}
          title="Yukarı Taşı"
          type="button"
        >
          <FaArrowUp />
        </button>
        <button
          className={styles.toolbarBtn}
          disabled={idx === totalRows - 1}
          onClick={() => onDispatch({ type: 'MOVE_ROW', rowId: row.id, direction: 'down' })}
          title="Aşağı Taşı"
          type="button"
        >
          <FaArrowDown />
        </button>
        <button
          className={styles.toolbarBtn}
          onClick={() => {
            onDispatch({ type: 'SET_INSERT_TARGET_ROW', rowId: row.id });
            onDispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
          }}
          title="Kolon Ekle"
          type="button"
        >
          <FaPlus />
        </button>
        <button
          className={styles.toolbarBtn}
          onClick={() => {
            onInsertRowAt(idx + 1);
          }}
          title="Altına Yeni Satır Ekle"
          type="button"
        >
          <FaCopy />
        </button>
        <button
          className={`${styles.toolbarBtn} ${styles.toolbarDanger}`}
          onClick={() => onDispatch({ type: 'REMOVE_ROW', rowId: row.id })}
          title="Satırı Sil"
          type="button"
          disabled={isRowLocked}
        >
          <FaTrash />
        </button>
        {/* Lock toggle indicator */}
        {isRowLocked && (
          <span style={{ fontSize: '9px', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '3px', padding: '0 4px' }}>
            <FaLock size={8} /> Kilitli
          </span>
        )}
        {isRowHidden && (
          <span style={{ fontSize: '9px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px', padding: '0 4px' }}>
            <FaEyeSlash size={8} /> Gizli
          </span>
        )}
      </div>

      {/* Row grid */}
      <div
        ref={rowGridRef}
        className={styles.rowGrid}
        style={{
          background: row.props.backgroundColor || undefined,
          backgroundImage: row.props.backgroundImage ? `url("${row.props.backgroundImage as string}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: row.props.paddingY ?? '0',
          paddingBottom: row.props.paddingY ?? '0',
          paddingLeft: row.props.paddingX ?? '0',
          paddingRight: row.props.paddingX ?? '0',
          position: 'relative',
        }}
      >
        {/* Render 12 column guides when selected or globally dragging */}
        {(isRowSelected || isDraggingRow) && (
          <div className={styles.gridGuides}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.gridGuideLine} />
            ))}
          </div>
        )}
        {columnsWithLocalSpans.map((col, colIdx) => (
          <ColumnWrapper
            key={col.id}
            column={col}
            rowId={row.id}
            idx={colIdx}
            colCount={row.columns.length}
            theme={theme}
            isSelected={col.id === selectedColumnId && row.id === selectedRowId}
            selectedComponentId={selectedComponentId}
            onSelectColumn={onSelectColumn}
            onSelectComponent={onSelectComponent}
            onDispatch={onDispatch}
            rowGridRef={rowGridRef}
            nextColumn={colIdx < columnsWithLocalSpans.length - 1 ? columnsWithLocalSpans[colIdx + 1] : null}
            onResize={handleResize}
            viewport={viewport}
          />
        ))}
      </div>
    </div>
  );
}

// ── Canvas ────────────────────────────────────────────────────────────────────

export function EditorCanvas() {
  const { state, dispatch } = useEditor();
  const { layout, selectedComponentId, selectedRowId, selectedColumnId, viewport, theme, activePage, globalComponents } = state;
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);

  const [canvasSelectedSection, setCanvasSelectedSection] = useState<'navbar' | 'footer' | null>(null);
  const [isDraggingRow, setIsDraggingRow] = useState(false);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  useEffect(() => {
    if (canvasScrollRef.current) canvasScrollRef.current.scrollTop = 0;
  }, [activePage?.id]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const vars = themeToVars(theme);
    for (const [k, v] of Object.entries(vars)) {
      canvasRef.current.style.setProperty(k, v);
    }
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;

      const { selectedComponentId: selCompId, selectedRowId: selRowId } = stateRef.current;

      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_COMPONENT', id: null });
        dispatch({ type: 'SELECT_ROW', rowId: null });
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selCompId) {
          e.preventDefault();
          dispatch({ type: 'REMOVE_COMPONENT', componentId: selCompId });
        } else if (selRowId) {
          e.preventDefault();
          dispatch({ type: 'REMOVE_ROW', rowId: selRowId });
        }
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' });
            break;
          case 'y':
            e.preventDefault();
            dispatch({ type: 'REDO' });
            break;
          case 'd':
            e.preventDefault();
            if (selCompId) dispatch({ type: 'DUPLICATE_COMPONENT', componentId: selCompId });
            break;
          case 'c':
            if (selCompId) { e.preventDefault(); dispatch({ type: 'COPY_COMPONENT', componentId: selCompId }); }
            break;
          case 'v':
            e.preventDefault();
            dispatch({ type: 'PASTE_COMPONENT' });
            break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = layout.findIndex(r => r.id === String(active.id));
      const newIdx = layout.findIndex(r => r.id === String(over.id));
      if (oldIdx !== -1 && newIdx !== -1) {
        dispatch({ type: 'REORDER_ROWS', rows: arrayMove(layout, oldIdx, newIdx) });
      }
    }
  };

  const handleInsertRowAt = (index: number) => {
    dispatch({ type: 'SET_INSERT_ROW_INDEX', index });
    dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
  };

  const handleSelectSection = (section: 'navbar' | 'footer') => {
    dispatch({ type: 'SELECT_ROW', rowId: null });
    const globalId = section === 'navbar' ? 'global-navbar' : 'global-footer';
    setCanvasSelectedSection(prev => (prev === section ? null : section));
    // Set a special component ID so PropertiesPanel can detect it
    dispatch({ type: 'SELECT_COMPONENT', id: globalId });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
  };

  return (
    <div className={styles.canvasWrapper}>
      {/* Viewport toolbar */}
      <div className={styles.viewportBar}>
        <div className={styles.pageLabel}>{activePage?.title ?? 'Sayfa Seçin'}</div>
        <div className={styles.viewportBtns}>
          {(['desktop', 'tablet', 'mobile'] as const).map(vp => (
            <button
              key={vp}
              className={`${styles.vpBtn} ${viewport === vp ? styles.vpActive : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEWPORT', viewport: vp })}
              title={vp}
            >
              {vp === 'desktop' ? <FaDesktop /> : vp === 'tablet' ? <FaTabletAlt /> : <FaMobileAlt />}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumbs */}
      <BreadcrumbsBar />

      {/* Canvas area */}
      <div className={styles.canvasScroll} ref={canvasScrollRef}>
        <div className={styles.canvasContainer}>
          <div className={`${styles.canvas} ${styles[viewport]}`} style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }} ref={canvasRef}>

          <CanvasNavbarPreview
            config={globalComponents.navbar}
            isSelected={canvasSelectedSection === 'navbar'}
            onClick={() => handleSelectSection('navbar')}
          />

          {layout.length === 0 && (
            <div className={styles.emptyCanvas}>
              <div className={styles.emptyIcon}>+</div>
              <p>Sol panelden bileşen ekleyerek başlayın</p>
            </div>
          )}

          <DndContext
            sensors={sensors}
            onDragStart={() => setIsDraggingRow(true)}
            onDragEnd={(e) => {
              setIsDraggingRow(false);
              handleDragEnd(e);
            }}
            collisionDetection={closestCenter}
          >
            <SortableContext items={layout.map(r => r.id)} strategy={verticalListSortingStrategy}>
              <RowInsertZone index={0} onInsert={handleInsertRowAt} />
              {layout.map((row, idx) => (
                <Fragment key={row.id}>
                  <RowWrapper
                    row={row}
                    idx={idx}
                    totalRows={layout.length}
                    theme={theme}
                    selectedRowId={selectedRowId}
                    selectedColumnId={selectedColumnId}
                    selectedComponentId={selectedComponentId}
                    onDispatch={dispatch}
                    onSelectRow={(id) => dispatch({ type: 'SELECT_ROW', rowId: id })}
                    onSelectColumn={(rId, cId) => dispatch({ type: 'SELECT_COLUMN', rowId: rId, columnId: cId })}
                    onSelectComponent={(id) => {
                      if (id) {
                        dispatch({ type: 'SELECT_COMPONENT', id });
                        dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
                      } else {
                        dispatch({ type: 'SELECT_COMPONENT', id: null });
                      }
                    }}
                    onInsertRowAt={handleInsertRowAt}
                    viewport={viewport}
                    isDraggingRow={isDraggingRow}
                  />
                  <RowInsertZone index={idx + 1} onInsert={handleInsertRowAt} />
                </Fragment>
              ))}
            </SortableContext>
          </DndContext>

          <CanvasFooterPreview
            config={globalComponents.footer}
            isSelected={canvasSelectedSection === 'footer'}
            onClick={() => handleSelectSection('footer')}
          />
        </div>
      </div>
    </div>
  </div>
  );
}
