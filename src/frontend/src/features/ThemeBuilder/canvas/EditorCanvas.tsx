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

export function MiniRenderer({ comp, theme }: { comp: LayoutComponent; theme: ThemeConfig }) {
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

    // ── Corporate Previews ─────────────────────────────────────────────

    case 'hero-corporate':
      return (
        <div
          style={{
            minHeight: '180px',
            background: p.imageUrl
              ? `linear-gradient(rgba(0,0,0,${p.overlayOpacity ?? 0.55}),rgba(0,0,0,${p.overlayOpacity ?? 0.55})), url(${p.imageUrl as string}) center/cover`
              : 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 data-prop-key="title" style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>
            {p.title as string}
          </h2>
          {!!p.subtitle && (
            <p data-prop-key="subtitle" style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '14px', maxWidth: '480px' }}>
              {String(p.subtitle).slice(0, 100)}…
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span data-prop-key="primaryButtonText" style={{ background: theme.colors.primary, color: '#fff', padding: '6px 14px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 600 }}>
              {p.primaryButtonText as string}
            </span>
            {!!p.secondaryButtonText && (
              <span style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)', padding: '6px 14px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem' }}>
                {p.secondaryButtonText as string}
              </span>
            )}
          </div>
          {Array.isArray(p.trustBadges) && p.trustBadges.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(p.trustBadges as { text: string }[]).slice(0, 4).map((b, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem' }}>
                  ✓ {b.text}
                </span>
              ))}
            </div>
          )}
        </div>
      );

    case 'about-company': {
      const stats = (p.stats as { value: string; label: string }[]) ?? [];
      return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: theme.colors.primary, fontWeight: 600, marginBottom: '4px' }}>
              {String(p.subtitle ?? '').slice(0, 60)}
            </div>
            <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: theme.colors.text }}>
              {p.title as string}
            </h3>
            <p style={{ fontSize: '0.75rem', color: theme.colors.textMuted, lineHeight: 1.5 }}>
              {String(p.text ?? '').replace(/<[^>]+>/g, '').slice(0, 120)}…
            </p>
          </div>
          {Boolean(p.showStats) && stats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: '8px', background: theme.colors.surface, borderRadius: theme.borderRadius.card, padding: '12px' }}>
              {stats.slice(0, 4).map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.colors.primary }}>{s.value}</div>
                  <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {Boolean(p.showMissionVision) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[{ title: p.missionTitle, text: p.missionText }, { title: p.visionTitle, text: p.visionText }].map((mv, i) => (
                <div key={i} style={{ background: theme.colors.surface, borderLeft: `3px solid ${theme.colors.primary}`, borderRadius: theme.borderRadius.md, padding: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.colors.primary, marginBottom: '4px' }}>{mv.title as string}</div>
                  <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{String(mv.text ?? '').slice(0, 60)}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'team-grid': {
      const members = (p.items as { name: string; role: string; bio?: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.72rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)`, gap: '8px' }}>
            {members.slice(0, Math.min(cols, 4)).map((m, i) => (
              <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `1px solid ${theme.colors.border}`, padding: '10px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: theme.colors.border, margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.colors.text }}>{m.name}</div>
                <div style={{ fontSize: '0.65rem', color: theme.colors.primary, marginTop: '2px' }}>{m.role}</div>
                {Boolean(p.showBio) && m.bio && <div style={{ fontSize: '0.6rem', color: theme.colors.textMuted, marginTop: '4px', lineHeight: 1.4 }}>{m.bio.slice(0, 50)}…</div>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'services-grid': {
      const services = (p.items as { icon?: string; title: string; description: string; iconColor?: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.72rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 80)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {services.slice(0, Math.min(cols, 6)).map((s, i) => (
              <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `1px solid ${theme.colors.border}`, padding: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.iconColor ?? theme.colors.primary, opacity: 0.15, marginBottom: '8px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '4px' }}>{s.title}</div>
                <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{s.description.slice(0, 60)}…</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'features-highlight': {
      const features = (p.items as { icon?: string; title: string; description: string; color?: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.72rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {features.slice(0, Math.min(cols, 6)).map((f, i) => (
              <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `1px solid ${theme.colors.border}`, padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: f.color ?? theme.colors.primary, flexShrink: 0, opacity: 0.85 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px' }}>{f.title}</div>
                  <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{f.description.slice(0, 55)}…</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'process-steps': {
      const steps = (p.steps as { stepNumber: string; title: string; description: string }[]) ?? [];
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.72rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 80)}…</p>}
          <div style={{ display: 'flex', flexDirection: p.orientation === 'vertical' ? 'column' : 'row', gap: '8px', overflowX: 'hidden' }}>
            {steps.slice(0, 4).map((s, i) => (
              <div key={i} style={{ flex: 1, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, padding: '10px', position: 'relative' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>
                  {s.stepNumber}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px' }}>{s.title}</div>
                <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{s.description.slice(0, 55)}…</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'pricing-plans': {
      const plans = (p.plans as { name: string; price: string; currency: string; highlighted?: boolean; badge?: string; features?: { text: string; included: boolean }[] }[]) ?? [];
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', textAlign: 'center', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textAlign: 'center', marginBottom: '12px' }}>{String(p.subtitle).slice(0, 80)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: '8px' }}>
            {plans.slice(0, 3).map((pl, i) => (
              <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `2px solid ${pl.highlighted ? theme.colors.primary : theme.colors.border}`, padding: '12px', textAlign: 'center', position: 'relative' }}>
                {pl.badge && (
                  <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: theme.colors.primary, color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {pl.badge}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '6px' }}>{pl.name}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primary, marginBottom: '10px' }}>
                  {pl.currency}{pl.price}
                </div>
                {pl.features && pl.features.slice(0, 4).map((f, j) => (
                  <div key={j} style={{ fontSize: '0.6rem', color: f.included ? theme.colors.text : theme.colors.textMuted, textDecoration: f.included ? 'none' : 'line-through', marginBottom: '3px', textAlign: 'left' }}>
                    {f.included ? '✓' : '✗'} {f.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'clients-logos': {
      const logos = (p.logos as { imageUrl: string; altText: string }[]) ?? [];
      const cols = Number(p.columns ?? 6);
      return (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {Array.from({ length: Math.min(logos.length || cols, 8) }).map((_, i) => (
              <div key={i} style={{ height: '28px', width: '70px', background: theme.colors.border, borderRadius: '4px', opacity: 0.45 }}>
                {logos[i]?.altText && (
                  <div style={{ fontSize: '0.55rem', color: theme.colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {logos[i].altText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'awards-certifications': {
      const awards = (p.items as { year: string; name: string; organization: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {awards.slice(0, Math.min(cols, 6)).map((a, i) => (
              <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, padding: '10px' }}>
                <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, marginBottom: '4px' }}>{a.year}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px', lineHeight: 1.3 }}>{a.name}</div>
                <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted }}>— {a.organization}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'numbers-counter': {
      const counters = (p.items as { value: string; suffix: string; label: string; color?: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px', background: p.backgroundType === 'dark' ? '#0f172a' : (p.backgroundColor as string || theme.colors.surface) }}>
          {!!p.title && <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', textAlign: 'center', color: p.backgroundType === 'dark' ? '#fff' : theme.colors.text }}>{p.title as string}</h3>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 6)}, 1fr)`, gap: '8px', marginTop: '12px' }}>
            {counters.slice(0, Math.min(cols, 6)).map((c, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color ?? theme.colors.primary, lineHeight: 1 }}>
                  {c.value}{c.suffix}
                </div>
                <div style={{ fontSize: '0.65rem', color: p.backgroundType === 'dark' ? 'rgba(255,255,255,0.6)' : theme.colors.textMuted, marginTop: '4px' }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'cta-banner':
      return (
        <div
          style={{
            background: p.backgroundType === 'gradient'
              ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary ?? theme.colors.primary}cc)`
              : p.backgroundType === 'image' && p.imageUrl
                ? `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url(${p.imageUrl as string}) center/cover`
                : (p.backgroundColor as string) || theme.colors.primary,
            padding: '28px 24px',
            textAlign: 'center',
            borderRadius: theme.borderRadius.card,
          }}
        >
          {!!p.highlightText && (
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', padding: '3px 10px', fontSize: '0.65rem', fontWeight: 600, marginBottom: '10px' }}>
              {p.highlightText as string}
            </div>
          )}
          <h3 data-prop-key="headline" style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.25 }}>
            {p.headline as string}
          </h3>
          {!!p.subheadline && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '14px', lineHeight: 1.5 }}>
              {String(p.subheadline).slice(0, 100)}…
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#fff', color: theme.colors.primary, padding: '7px 16px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 700 }}>
              {p.primaryButtonText as string}
            </span>
            {Boolean(p.showSecondaryButton) && !!p.secondaryButtonText && (
              <span style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)', padding: '7px 16px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem' }}>
                {p.secondaryButtonText as string}
              </span>
            )}
          </div>
        </div>
      );

    case 'contact-details': {
      const phones = (p.phones as { label: string; number: string }[]) ?? [];
      const emails = (p.emails as { label: string; address: string }[]) ?? [];
      const hours  = (p.workingHours as { days: string; hours: string }[]) ?? [];
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Address */}
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>📍 Adres</div>
              <div style={{ fontSize: '0.68rem', color: theme.colors.text, lineHeight: 1.4 }}>{p.address as string}<br />{p.city as string}</div>
            </div>
            {/* Phones */}
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>📞 Telefon</div>
              {phones.slice(0, 2).map((ph, i) => (
                <div key={i} style={{ fontSize: '0.65rem', color: theme.colors.text, marginBottom: '3px' }}>
                  <span style={{ color: theme.colors.textMuted }}>{ph.label}: </span>{ph.number}
                </div>
              ))}
            </div>
            {/* Emails */}
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>✉️ E-posta</div>
              {emails.slice(0, 2).map((em, i) => (
                <div key={i} style={{ fontSize: '0.65rem', color: theme.colors.primary, marginBottom: '3px' }}>{em.address}</div>
              ))}
            </div>
            {/* Hours */}
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>🕐 Saatler</div>
              {hours.slice(0, 2).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', marginBottom: '3px' }}>
                  <span style={{ color: theme.colors.textMuted }}>{h.days}</span>
                  <span style={{ color: theme.colors.text, fontWeight: 600 }}>{h.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'blog-list': {
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', color: theme.colors.text }}>{p.title as string}</h3>
            {!!p.viewAllLink && <span style={{ fontSize: '0.7rem', color: theme.colors.primary, fontWeight: 600 }}>{p.viewAllText as string} →</span>}
          </div>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 80)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {Array.from({ length: Math.min(Number(p.limit ?? 3), 3) }).map((_, i) => (
              <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, overflow: 'hidden' }}>
                {Boolean(p.showFeaturedImage) && <div style={{ height: '60px', background: theme.colors.border }} />}
                <div style={{ padding: '8px' }}>
                  {Boolean(p.showCategory) && <div style={{ fontSize: '0.58rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>Kategori</div>}
                  <div style={{ height: '8px', background: theme.colors.border, borderRadius: '3px', marginBottom: '4px' }} />
                  <div style={{ height: '8px', width: '70%', background: theme.colors.border, borderRadius: '3px', marginBottom: '6px' }} />
                  {(Boolean(p.showAuthor) || Boolean(p.showDate)) && (
                    <div style={{ fontSize: '0.58rem', color: theme.colors.textMuted }}>
                      {Boolean(p.showAuthor) ? 'Yazar Adı' : ''} {Boolean(p.showDate) ? '· 01 Haz 2025' : ''} {Boolean(p.showReadTime) ? '· 5 dk' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'timeline': {
      const items = (p.items as { year: string; title: string; description: string; color?: string }[]) ?? [];
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: `2px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.slice(0, 4).map((it, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: it.color ?? theme.colors.primary, border: `2px solid var(--bg, #fff)`, boxShadow: `0 0 0 2px ${it.color ?? theme.colors.primary}44` }} />
                <div style={{ fontSize: '0.65rem', color: it.color ?? theme.colors.primary, fontWeight: 700 }}>{it.year}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '2px' }}>{it.title}</div>
                <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{it.description.slice(0, 70)}…</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'portfolio-grid': {
      const items = (p.items as { title: string; category: string; description?: string; tags?: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, marginBottom: '8px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          {Boolean(p.filterEnabled) && (
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {['Tümü', ...new Set(items.map(it => it.category).filter(Boolean))].slice(0, 5).map((cat, i) => (
                <span key={i} style={{ fontSize: '0.62rem', padding: '3px 8px', border: `1px solid ${i === 0 ? theme.colors.primary : theme.colors.border}`, borderRadius: '4px', background: i === 0 ? theme.colors.primary : 'transparent', color: i === 0 ? '#fff' : theme.colors.textMuted }}>
                  {cat}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {items.slice(0, Math.min(cols, 6)).map((it, i) => (
              <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, overflow: 'hidden' }}>
                <div style={{ height: '60px', background: theme.colors.border }} />
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '0.58rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{it.category}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px' }}>{it.title}</div>
                  {it.description && <div style={{ fontSize: '0.6rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{it.description.slice(0, 50)}…</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'map-embed':
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: theme.colors.text }}>{p.title as string}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Map placeholder */}
            <div
              style={{
                flex: 2,
                minHeight: '120px',
                background: '#e5e7eb',
                borderRadius: theme.borderRadius.card,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                color: '#9ca3af',
              }}
            >
              🗺️
            </div>
            {/* Sidebar */}
            {Boolean(p.showContactSidebar) && (
              <div style={{ flex: 1, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {([['📍', 'Adres', p.address], ['📞', 'Tel', p.phone], ['✉️', 'Mail', p.email], ['🕐', 'Saatler', p.workingHours]] as [string, string, unknown][]).map(([icon, lbl, val], i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.58rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{icon} {lbl}</div>
                    <div style={{ fontSize: '0.65rem', color: theme.colors.text, lineHeight: 1.3 }}>{String(val ?? '').slice(0, 35)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

    case 'phone-contact':
      return (
        <div style={{ padding: '16px', background: p.backgroundColor as string || theme.colors.surface, borderRadius: theme.borderRadius.card }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          {!!p.subtitle && <p style={{ fontSize: '0.7rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {[[p.mainPhoneLabel, p.mainPhone], [p.supportPhoneLabel, p.supportPhone]].map(([lbl, num], i) => (
              <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
                <div style={{ fontSize: '0.6rem', color: theme.colors.textMuted, marginBottom: '3px' }}>{lbl as string}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.colors.text }}>{num as string}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {!!p.whatsapp && (
              <span style={{ background: '#25D366', color: '#fff', padding: '5px 12px', borderRadius: theme.borderRadius.button, fontSize: '0.72rem', fontWeight: 600 }}>
                📲 WhatsApp
              </span>
            )}
            <span style={{ background: theme.colors.primary, color: '#fff', padding: '5px 12px', borderRadius: theme.borderRadius.button, fontSize: '0.72rem', fontWeight: 600 }}>
              {p.buttonText as string}
            </span>
          </div>
          {!!p.availabilityText && (
            <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted, marginTop: '8px' }}>🕐 {p.availabilityText as string}</div>
          )}
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
  const canvasScrollRef = useRef<HTMLDivElement>(null);

  const [canvasSelectedSection, setCanvasSelectedSection] = useState<'navbar' | 'footer' | null>(
    null,
  );
  const [isDraggingAny, setIsDraggingAny] = useState(false);

  // Keep a ref to latest state so the keydown handler always has fresh values
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  // Reset scroll position when active page changes
  useEffect(() => {
    if (canvasScrollRef.current) {
      canvasScrollRef.current.scrollTop = 0;
    }
  }, [activePage?.id]);

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
      <div className={styles.canvasScroll} ref={canvasScrollRef}>
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
