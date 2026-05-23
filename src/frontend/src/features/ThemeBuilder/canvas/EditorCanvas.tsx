import { useState, useRef, useEffect } from 'react';
import type { Dispatch } from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaDesktop,
  FaTabletAlt,
  FaMobileAlt,
  FaCopy,
  FaGripVertical,
} from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
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
import type { LayoutComponent, ThemeConfig, GlobalComponentsConfig } from '../../../entities/StorePage/model/types';
import styles from './EditorCanvas.module.css';

const VIEWPORT_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;

// ── InsertZone ────────────────────────────────────────────────────────────────

function InsertZone({ index, onInsertAt }: { index: number; onInsertAt: (index: number) => void }) {
  return (
    <div className={styles.insertZone} onClick={() => onInsertAt(index)}>
      <div className={styles.insertZoneLine} />
      <button className={styles.insertZoneBtn} type="button">
        + Bileşen Ekle
      </button>
    </div>
  );
}

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
  return (
    <div
      className={`${styles.canvasNavbar} ${isSelected ? styles.canvasNavbarSelected : ''}`}
      onClick={onClick}
      title="Navbar'ı düzenle (Global sekmesi)"
    >
      <span className={styles.canvasNavbarLogo}>
        {config.logoPosition === 'center' ? '— LOGO —' : 'LOGO'}
      </span>
      <div className={styles.canvasNavbarLinks}>
        <span className={styles.canvasNavbarLink}>Anasayfa</span>
        <span className={styles.canvasNavbarLink}>Ürünler</span>
        <span className={styles.canvasNavbarLink}>Hakkında</span>
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
  return (
    <div
      className={`${styles.canvasFooter} ${isSelected ? styles.canvasFooterSelected : ''}`}
      onClick={onClick}
      title="Footer'ı düzenle (Global sekmesi)"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {Array.from({ length: config.columnCount }).map((_, i) => (
          <div key={i} style={{ fontSize: '10px', color: 'var(--editor-text-muted)' }}>
            Kolon {i + 1}
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: '1px solid var(--editor-border)',
          paddingTop: '8px',
          fontSize: '11px',
        }}
      >
        {config.copyrightText || '© 2024 Mağaza Adı'}
      </div>
    </div>
  );
}

// ── MiniRenderer ──────────────────────────────────────────────────────────────

function MiniRenderer({ comp, theme }: { comp: LayoutComponent; theme: ThemeConfig }) {
  const p = comp.props;
  const def = BLOCK_BY_TYPE[comp.type];

  switch (comp.type) {
    case 'hero':
      return (
        <div
          className={styles.heroPreview}
          style={{
            height: '220px',
            backgroundImage: p.imageUrl ? `url(${p.imageUrl as string})` : 'none',
            background: p.imageUrl ? undefined : 'linear-gradient(135deg, #1e293b, #0f172a)',
          }}
        >
          <div
            className={styles.heroOverlayPrev}
            style={{ background: `rgba(0,0,0,${p.overlayOpacity ?? 0.4})` }}
          >
            <h2
              data-prop-key="title"
              style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}
            >
              {p.title as string}
            </h2>
            {!!p.subtitle && (
              <p
                data-prop-key="subtitle"
                style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
              >
                {p.subtitle as string}
              </p>
            )}
            {!!p.buttonText && (
              <span
                data-prop-key="buttonText"
                className={styles.previewBtn}
                style={{ background: theme.colors.primary }}
              >
                {p.buttonText as string}
              </span>
            )}
          </div>
        </div>
      );

    case 'hero-split':
      return (
        <div className={styles.heroSplitPrev}>
          <div className={styles.heroSplitText}>
            <h3
              data-prop-key="subtitle"
              style={{ color: theme.colors.primary, fontSize: '0.8rem', marginBottom: '4px' }}
            >
              {p.subtitle as string}
            </h3>
            <h2 data-prop-key="title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {p.title as string}
            </h2>
            {!!p.buttonText && (
              <span
                data-prop-key="buttonText"
                className={styles.previewBtn}
                style={{ background: theme.colors.primary }}
              >
                {p.buttonText as string}
              </span>
            )}
          </div>
          <div
            className={styles.heroSplitImg}
            style={{
              background: p.imageUrl
                ? `url(${p.imageUrl as string}) center/cover`
                : '#f3f4f6',
            }}
          />
        </div>
      );

    case 'featured-products':
      return (
        <div style={{ padding: '16px' }}>
          <h3
            data-prop-key="title"
            style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: theme.colors.text }}
          >
            {p.title as string}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(Number(p.columns ?? 4), 4)}, 1fr)`,
              gap: '8px',
            }}
          >
            {Array.from({ length: Math.min(Number(p.limit ?? 4), 8) }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: theme.colors.surface,
                  borderRadius: theme.borderRadius.card,
                  overflow: 'hidden',
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ height: '60px', background: theme.colors.border }} />
                <div style={{ padding: '8px' }}>
                  <div
                    style={{
                      height: '10px',
                      background: theme.colors.border,
                      borderRadius: '4px',
                      marginBottom: '4px',
                    }}
                  />
                  <div
                    style={{
                      height: '10px',
                      width: '60%',
                      background: theme.colors.primary,
                      borderRadius: '4px',
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'categories-grid':
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
            {p.title as string}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(Number(p.columns ?? 3), 4)}, 1fr)`,
              gap: '8px',
            }}
          >
            {Array.from({ length: Math.min(Number(p.limit ?? 6), 6) }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: theme.colors.surface,
                  borderRadius: theme.borderRadius.card,
                  padding: '12px',
                  textAlign: 'center',
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: theme.borderRadius.md,
                    background: theme.colors.border,
                    margin: '0 auto 6px',
                  }}
                />
                <div style={{ height: '8px', background: theme.colors.border, borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'text-image':
      return (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px',
            flexDirection: p.imagePosition === 'right' ? 'row' : 'row-reverse',
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              data-prop-key="title"
              style={{ fontWeight: 700, marginBottom: '8px', color: theme.colors.text }}
            >
              {p.title as string}
            </h3>
            <p
              data-prop-key="text"
              style={{ fontSize: '0.8rem', color: theme.colors.textMuted, lineHeight: 1.6 }}
            >
              {String(p.text ?? '').slice(0, 120)}...
            </p>
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: theme.borderRadius.lg,
              background: p.imageUrl
                ? `url(${p.imageUrl as string}) center/cover`
                : theme.colors.surface,
              minHeight: '100px',
              border: `1px solid ${theme.colors.border}`,
            }}
          />
        </div>
      );

    case 'stats-bar': {
      const items = (p.items as { value: string; label: string }[]) ?? [];
      return (
        <div
          style={{
            padding: '16px',
            background: theme.colors.surface,
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {items.slice(0, 4).map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primary }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case 'testimonials': {
      const items = (p.items as { name: string; quote: string; rating: number }[]) ?? [];
      return (
        <div style={{ padding: '16px' }}>
          <h3
            data-prop-key="title"
            style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}
          >
            {p.title as string}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {items.slice(0, 2).map((t, i) => (
              <div
                key={i}
                style={{
                  background: theme.colors.surface,
                  padding: '10px',
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ color: theme.colors.accent, fontSize: '11px', marginBottom: '6px' }}>
                  {'★'.repeat(t.rating ?? 5)}
                </div>
                <p style={{ fontSize: '0.7rem', color: theme.colors.text, lineHeight: 1.5 }}>
                  "{t.quote.slice(0, 60)}"
                </p>
                <div
                  style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.colors.text, marginTop: '6px' }}
                >
                  {t.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'countdown':
      return (
        <div
          style={{
            background: theme.colors.primary,
            padding: '24px',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <h3
            data-prop-key="title"
            style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}
          >
            {p.title as string}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['00', '00', '00', '00'].map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                  {['Gün', 'Saat', 'Dk', 'Sn'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'promo-banner':
      return (
        <div
          style={{
            background: (p.backgroundColor as string) || theme.colors.primary,
            color: (p.textColor as string) || '#fff',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span data-prop-key="message" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {p.message as string}
          </span>
          {!!p.buttonText && (
            <span
              data-prop-key="buttonText"
              style={{
                padding: '4px 12px',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: theme.borderRadius.button,
                fontSize: '0.8rem',
              }}
            >
              {p.buttonText as string}
            </span>
          )}
        </div>
      );

    case 'newsletter':
      return (
        <div style={{ background: theme.colors.surface, padding: '24px', textAlign: 'center' }}>
          <h3
            data-prop-key="title"
            style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.95rem' }}
          >
            {p.title as string}
          </h3>
          <p
            data-prop-key="text"
            style={{ fontSize: '0.75rem', color: theme.colors.textMuted, marginBottom: '12px' }}
          >
            {p.text as string}
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <div
              style={{
                background: '#fff',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.button,
                padding: '8px 16px',
                fontSize: '0.75rem',
                color: theme.colors.textMuted,
              }}
            >
              E-posta adresiniz
            </div>
            <span
              data-prop-key="buttonText"
              style={{
                background: theme.colors.primary,
                color: '#fff',
                padding: '8px 16px',
                borderRadius: theme.borderRadius.button,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {p.buttonText as string}
            </span>
          </div>
        </div>
      );

    case 'contact-form':
      return (
        <div style={{ padding: '16px' }}>
          <h3
            data-prop-key="title"
            style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem', textAlign: 'center' }}
          >
            {p.title as string}
          </h3>
          {['Adınız', 'E-posta', 'Mesajınız'].map((f, i) => (
            <div
              key={i}
              style={{
                height: i === 2 ? '48px' : '28px',
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                marginBottom: '6px',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted }}>{f}</span>
            </div>
          ))}
          <div
            data-prop-key="submitText"
            style={{
              background: theme.colors.primary,
              color: '#fff',
              textAlign: 'center',
              padding: '8px',
              borderRadius: theme.borderRadius.button,
              fontSize: '0.8rem',
              fontWeight: 600,
              marginTop: '4px',
            }}
          >
            {(p.submitText as string) || 'Gönder'}
          </div>
        </div>
      );

    case 'brand-logos':
      return (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h3
            data-prop-key="title"
            style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}
          >
            {p.title as string}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '60px',
                  height: '24px',
                  background: theme.colors.border,
                  borderRadius: '4px',
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        </div>
      );

    case 'video-embed':
      return (
        <div style={{ padding: '16px' }}>
          <h3
            data-prop-key="title"
            style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem', textAlign: 'center' }}
          >
            {p.title as string}
          </h3>
          <div
            style={{
              background: '#000',
              borderRadius: theme.borderRadius.lg,
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: '2rem' }}>▶</span>
          </div>
        </div>
      );

    case 'rich-text':
      return (
        <div
          style={{ padding: '16px', fontSize: '0.85rem', color: theme.colors.text, lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: String(p.html ?? '').slice(0, 200) }}
        />
      );

    case 'custom-html':
      return (
        <div
          style={{
            padding: '16px',
            background: '#1a1a2e',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#7dd3fc',
          }}
        >
          &lt;custom html&gt;
        </div>
      );

    default:
      return (
        <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.textMuted }}>
          <div style={{ fontWeight: 600 }}>{def?.name ?? comp.type}</div>
        </div>
      );
  }
}

// ── SortableBlock ─────────────────────────────────────────────────────────────

function SortableBlock({
  comp,
  idx,
  theme,
  isSelected,
  totalCount,
  onSelect,
  onDispatch,
}: {
  comp: LayoutComponent;
  idx: number;
  theme: ThemeConfig;
  isSelected: boolean;
  totalCount: number;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDispatch: (action: Parameters<Dispatch<EditorAction>>[0]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: comp.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
  };

  const def = BLOCK_BY_TYPE[comp.type];

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`${styles.blockWrapper} ${isSelected ? styles.selected : ''}`}
        onClick={(e) => onSelect(comp.id, e)}
      >
        {/* Drag handle */}
        <button
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
          title="Sürükleyerek sırala"
          type="button"
        >
          <FaGripVertical />
        </button>

        {/* Block label */}
        <div className={styles.blockLabel}>{def?.name ?? comp.type}</div>

        {/* Toolbar — only on selected */}
        {isSelected && (
          <div className={styles.blockToolbar} onClick={e => e.stopPropagation()}>
            <button
              className={styles.toolbarBtn}
              disabled={idx === 0}
              onClick={() => onDispatch({ type: 'MOVE_COMPONENT', id: comp.id, direction: 'up' })}
              title="Yukarı Taşı"
            >
              <FaArrowUp />
            </button>
            <button
              className={styles.toolbarBtn}
              disabled={idx === totalCount - 1}
              onClick={() => onDispatch({ type: 'MOVE_COMPONENT', id: comp.id, direction: 'down' })}
              title="Aşağı Taşı"
            >
              <FaArrowDown />
            </button>
            <button
              className={styles.toolbarBtn}
              onClick={() => onDispatch({ type: 'DUPLICATE_COMPONENT', id: comp.id })}
              title="Çoğalt (Ctrl+D)"
            >
              <FaCopy />
            </button>
            <button
              className={`${styles.toolbarBtn} ${styles.toolbarDanger}`}
              onClick={() => onDispatch({ type: 'REMOVE_COMPONENT', id: comp.id })}
              title="Sil (Delete)"
            >
              <FaTrash />
            </button>
          </div>
        )}

        <MiniRenderer comp={comp} theme={theme} />
      </div>
    </div>
  );
}

// ── Canvas ────────────────────────────────────────────────────────────────────

export function EditorCanvas() {
  const { state, dispatch } = useEditor();
  const { layout, selectedComponentId, viewport, theme, activePage, globalComponents } = state;
  const canvasRef = useRef<HTMLDivElement>(null);

  const [canvasSelectedSection, setCanvasSelectedSection] = useState<'navbar' | 'footer' | null>(
    null,
  );
  const [isDraggingAny, setIsDraggingAny] = useState(false);

  // Keep a ref to latest state so the keydown handler always has fresh values
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  // Theme CSS vars
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
      // Don't capture when user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      const selId = stateRef.current.selectedComponentId;

      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_COMPONENT', id: null });
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selId) {
        e.preventDefault();
        dispatch({ type: 'REMOVE_COMPONENT', id: selId });
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
            if (selId) dispatch({ type: 'DUPLICATE_COMPONENT', id: selId });
            break;
          case 'c':
            if (selId) {
              e.preventDefault();
              dispatch({ type: 'COPY_COMPONENT', id: selId });
            }
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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = () => {
    setIsDraggingAny(true);
    dispatch({ type: 'SET_INSERT_INDEX', index: null });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingAny(false);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layout.findIndex(c => c.id === String(active.id));
      const newIndex = layout.findIndex(c => c.id === String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch({ type: 'SET_LAYOUT', layout: arrayMove(layout, oldIndex, newIndex) });
      }
    }
  };

  const handleInsertAt = (index: number) => {
    dispatch({ type: 'SET_INSERT_INDEX', index });
    dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
  };

  const select = (id: string, e?: React.MouseEvent) => {
    dispatch({ type: 'SELECT_COMPONENT', id });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });

    if (e) {
      const target = e.target as HTMLElement;
      const propKeyEl = target.closest('[data-prop-key]');
      if (propKeyEl) {
        const propKey = propKeyEl.getAttribute('data-prop-key');
        if (propKey) {
          dispatch({ type: 'SELECT_PROP', propKey });
        }
      }
    }
  };

  const handleSelectSection = (section: 'navbar' | 'footer') => {
    dispatch({ type: 'SELECT_COMPONENT', id: null });
    setCanvasSelectedSection(prev => (prev === section ? null : section));
    dispatch({ type: 'SET_LEFT_TAB', tab: 'global' });
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

      {/* Canvas area */}
      <div className={styles.canvasScroll}>
        <div
          className={styles.canvas}
          style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }}
          ref={canvasRef}
        >
          {/* Navbar preview — outside DndContext */}
          <CanvasNavbarPreview
            config={globalComponents.navbar}
            isSelected={canvasSelectedSection === 'navbar'}
            onClick={() => handleSelectSection('navbar')}
          />

          {/* Empty state */}
          {layout.length === 0 && (
            <div className={styles.emptyCanvas}>
              <div className={styles.emptyIcon}>+</div>
              <p>Sol panelden bileşen ekleyerek başlayın</p>
            </div>
          )}

          {/* DnD sortable block list */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={layout.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {/* Insert zone at top */}
              {layout.length > 0 && !isDraggingAny && (
                <InsertZone index={0} onInsertAt={handleInsertAt} />
              )}

              {layout.map((comp, idx) => (
                <div key={comp.id}>
                  <SortableBlock
                    comp={comp}
                    idx={idx}
                    theme={theme}
                    isSelected={comp.id === selectedComponentId}
                    totalCount={layout.length}
                    onSelect={select}
                    onDispatch={dispatch}
                  />
                  {!isDraggingAny && (
                    <InsertZone index={idx + 1} onInsertAt={handleInsertAt} />
                  )}
                </div>
              ))}
            </SortableContext>
            <DragOverlay />
          </DndContext>

          {/* Footer preview — outside DndContext */}
          <CanvasFooterPreview
            config={globalComponents.footer}
            isSelected={canvasSelectedSection === 'footer'}
            onClick={() => handleSelectSection('footer')}
          />
        </div>
      </div>
    </div>
  );
}
