import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus } from 'react-icons/fa';
import { BLOCK_REGISTRY, BLOCK_CATEGORIES } from '../blocks/blockRegistry';
import type { BlockDefinition } from '../blocks/blockRegistry';
import { useEditor } from '../context/EditorContext';
import { MiniRenderer } from '../canvas/EditorCanvas';
import type { LayoutComponent } from '../../../entities/StorePage/model/types';
import styles from './Panels.module.css';

interface ComponentsPanelProps {
  excludeCategories?: (keyof typeof BLOCK_CATEGORIES)[];
}

const CATEGORY_TR: Record<string, string> = {
  hero: 'Hero',
  content: 'İçerik',
  commerce: 'E-Ticaret',
  marketing: 'Pazarlama',
  forms: 'Form',
  advanced: 'Gelişmiş',
  corporate: 'Kurumsal',
};

// ── Block Preview Tooltip ──────────────────────────────────────────────────────

const TOOLTIP_W = 300;
const PREVIEW_SCALE = 0.52;

function BlockPreviewTooltip({
  block,
  anchorRect,
  onAdd,
  onMouseEnter,
  onMouseLeave,
}: {
  block: BlockDefinition;
  anchorRect: DOMRect;
  onAdd: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const { state } = useEditor();
  const theme = state.theme;

  // Position: right of the anchor element (which sits inside the left sidebar)
  let left = anchorRect.right + 30;
  let top = anchorRect.top - 10;

  // clamp to viewport horizontally
  if (left + TOOLTIP_W > window.innerWidth - 16) {
    left = anchorRect.left - TOOLTIP_W - 8;
  }
  // clamp to viewport vertically
  const estH = 390;
  if (top + estH > window.innerHeight - 16) top = window.innerHeight - estH - 16;
  top = Math.max(8, top);

  const fakeComp: LayoutComponent = {
    id: '__preview__',
    type: block.type,
    props: { ...block.defaultProps },
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top,
        left,
        width: TOOLTIP_W,
        zIndex: 99999,
        background: 'var(--editor-surface)',
        border: '1px solid var(--editor-border)',
        borderRadius: '12px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        pointerEvents: 'all',
        animation: 'fadeInPreview 0.12s ease',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: 'var(--editor-surface-2)',
        borderBottom: '1px solid var(--editor-border)',
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 7,
          background: 'rgba(236,72,153,0.12)',
          color: '#ec4899',
          fontSize: 13,
          flexShrink: 0,
        }}>
          <block.icon />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--editor-text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {block.name}
          </div>
          <div style={{
            fontSize: 10,
            color: 'var(--editor-text-muted)',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontWeight: 600,
          }}>
            {CATEGORY_TR[block.category] ?? block.category}
          </div>
        </div>
      </div>

      {/* ── Mini Preview ── */}
      <div style={{
        height: 200,
        overflow: 'hidden',
        background: '#ffffff',
        position: 'relative',
      }}>
        <div style={{
          transform: `scale(${PREVIEW_SCALE})`,
          transformOrigin: 'top left',
          width: `${TOOLTIP_W / PREVIEW_SCALE}px`,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <MiniRenderer comp={fakeComp} theme={theme} />
        </div>
        {/* fade at bottom to mask cut-off content */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 48,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Add Button ── */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--editor-border)',
        background: 'var(--editor-surface-2)',
      }}>
        <button
          onClick={onAdd}
          type="button"
          className={styles.previewAddBtn}
        >
          <FaPlus style={{ fontSize: 11 }} />
          Ekle
        </button>
      </div>
    </div>,
    document.body,
  );
}

// ── ComponentsPanel ────────────────────────────────────────────────────────────

export function ComponentsPanel({ excludeCategories }: ComponentsPanelProps = {}) {
  const { state, dispatch, setInsertIndex } = useEditor();
  const { insertAtIndex } = state;
  const [query, setQuery] = useState('');

  // Hover preview state
  const [hoveredBlock, setHoveredBlock] = useState<BlockDefinition | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addComponent = useCallback((type: string) => {
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
    // close any open preview
    setHoveredBlock(null);
    setAnchorRect(null);
  }, [dispatch]);

  const handleBlockMouseEnter = useCallback((block: BlockDefinition, e: React.MouseEvent<HTMLButtonElement>) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => {
      setHoveredBlock(block);
      setAnchorRect(rect);
    }, 180);
  }, []);

  const handleBlockMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setHoveredBlock(null);
      setAnchorRect(null);
    }, 220);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setHoveredBlock(null);
      setAnchorRect(null);
    }, 220);
  }, []);

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
                    className={`${styles.blockBtn} ${hoveredBlock?.type === block.type ? styles.blockBtnHovered : ''}`}
                    onClick={() => addComponent(block.type)}
                    onMouseEnter={e => handleBlockMouseEnter(block, e)}
                    onMouseLeave={handleBlockMouseLeave}
                    title={block.name}
                    type="button"
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

      {/* Hover preview tooltip — rendered via portal to escape overflow:hidden */}
      {hoveredBlock !== null && anchorRect !== null && (
        <BlockPreviewTooltip
          block={hoveredBlock}
          anchorRect={anchorRect}
          onAdd={() => addComponent(hoveredBlock.type)}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </div>
  );
}
