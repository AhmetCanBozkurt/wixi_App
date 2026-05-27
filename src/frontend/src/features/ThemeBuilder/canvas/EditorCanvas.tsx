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
import type { LayoutComponent, LayoutColumn, LayoutRow, ThemeConfig, GlobalComponentsConfig } from '../../../entities/StorePage/model/types';
import styles from './EditorCanvas.module.css';

const VIEWPORT_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;

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
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        {Array.from({ length: config.columnCount }).map((_, i) => (
          <div key={i} style={{ fontSize: '10px', color: 'var(--editor-text-muted)' }}>
            Kolon {i + 1}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--editor-border)', paddingTop: '8px', fontSize: '11px' }}>
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
          <div className={styles.heroOverlayPrev} style={{ background: `rgba(0,0,0,${p.overlayOpacity ?? 0.4})` }}>
            <h2 data-prop-key="title" style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
              {p.title as string}
            </h2>
            {!!p.subtitle && (
              <p data-prop-key="subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                {p.subtitle as string}
              </p>
            )}
            {!!p.buttonText && (
              <span data-prop-key="buttonText" className={styles.previewBtn} style={{ background: theme.colors.primary }}>
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
            <h3 data-prop-key="subtitle" style={{ color: theme.colors.primary, fontSize: '0.8rem', marginBottom: '4px' }}>
              {p.subtitle as string}
            </h3>
            <h2 data-prop-key="title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.title as string}</h2>
            {!!p.buttonText && (
              <span data-prop-key="buttonText" className={styles.previewBtn} style={{ background: theme.colors.primary }}>
                {p.buttonText as string}
              </span>
            )}
          </div>
          <div
            className={styles.heroSplitImg}
            style={{ background: p.imageUrl ? `url(${p.imageUrl as string}) center/cover` : '#f3f4f6' }}
          />
        </div>
      );

    case 'featured-products':
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: theme.colors.text }}>
            {p.title as string}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Number(p.columns ?? 4), 4)}, 1fr)`, gap: '8px' }}>
            {Array.from({ length: Math.min(Number(p.limit ?? 4), 8) }).map((_, i) => (
              <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, overflow: 'hidden', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ height: '60px', background: theme.colors.border }} />
                <div style={{ padding: '8px' }}>
                  <div style={{ height: '10px', background: theme.colors.border, borderRadius: '4px', marginBottom: '4px' }} />
                  <div style={{ height: '10px', width: '60%', background: theme.colors.primary, borderRadius: '4px', opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'categories-grid':
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>{p.title as string}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Number(p.columns ?? 3), 4)}, 1fr)`, gap: '8px' }}>
            {Array.from({ length: Math.min(Number(p.limit ?? 6), 6) }).map((_, i) => (
              <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, padding: '12px', textAlign: 'center', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: theme.borderRadius.md, background: theme.colors.border, margin: '0 auto 6px' }} />
                <div style={{ height: '8px', background: theme.colors.border, borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'text-image':
      return (
        <div style={{ display: 'flex', gap: '16px', padding: '16px', flexDirection: p.imagePosition === 'right' ? 'row' : 'row-reverse' }}>
          <div style={{ flex: 1 }}>
            <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '8px', color: theme.colors.text }}>{p.title as string}</h3>
            <p data-prop-key="text" style={{ fontSize: '0.8rem', color: theme.colors.textMuted, lineHeight: 1.6 }}>{String(p.text ?? '').slice(0, 120)}...</p>
          </div>
          <div style={{ flex: 1, borderRadius: theme.borderRadius.lg, background: p.imageUrl ? `url(${p.imageUrl as string}) center/cover` : theme.colors.surface, minHeight: '100px', border: `1px solid ${theme.colors.border}` }} />
        </div>
      );

    case 'stats-bar': {
      const items = (p.items as { value: string; label: string }[]) ?? [];
      return (
        <div style={{ padding: '16px', background: theme.colors.surface, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '12px' }}>
          {items.slice(0, 4).map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primary }}>{s.value}</div>
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
          <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>{p.title as string}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {items.slice(0, 2).map((t, i) => (
              <div key={i} style={{ background: theme.colors.surface, padding: '10px', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border}` }}>
                <div style={{ color: theme.colors.accent, fontSize: '11px', marginBottom: '6px' }}>{'★'.repeat(t.rating ?? 5)}</div>
                <p style={{ fontSize: '0.7rem', color: theme.colors.text, lineHeight: 1.5 }}>"{t.quote.slice(0, 60)}"</p>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.colors.text, marginTop: '6px' }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'countdown':
      return (
        <div style={{ background: theme.colors.primary, padding: '24px', textAlign: 'center', color: '#fff' }}>
          <h3 data-prop-key="title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{p.title as string}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['00', '00', '00', '00'].map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{['Gün', 'Saat', 'Dk', 'Sn'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'promo-banner':
      return (
        <div style={{ background: (p.backgroundColor as string) || theme.colors.primary, color: (p.textColor as string) || '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span data-prop-key="message" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.message as string}</span>
          {!!p.buttonText && (
            <span data-prop-key="buttonText" style={{ padding: '4px 12px', border: '1px solid rgba(255,255,255,0.5)', borderRadius: theme.borderRadius.button, fontSize: '0.8rem' }}>
              {p.buttonText as string}
            </span>
          )}
        </div>
      );

    case 'newsletter':
      return (
        <div style={{ background: theme.colors.surface, padding: '24px', textAlign: 'center' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.95rem' }}>{p.title as string}</h3>
          <p data-prop-key="text" style={{ fontSize: '0.75rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{p.text as string}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <div style={{ background: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.button, padding: '8px 16px', fontSize: '0.75rem', color: theme.colors.textMuted }}>E-posta adresiniz</div>
            <span data-prop-key="buttonText" style={{ background: theme.colors.primary, color: '#fff', padding: '8px 16px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 600 }}>{p.buttonText as string}</span>
          </div>
        </div>
      );

    case 'contact-form':
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem', textAlign: 'center' }}>{p.title as string}</h3>
          {['Adınız', 'E-posta', 'Mesajınız'].map((f, i) => (
            <div key={i} style={{ height: i === 2 ? '48px' : '28px', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, marginBottom: '6px', padding: '0 8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted }}>{f}</span>
            </div>
          ))}
          <div style={{ background: theme.colors.primary, color: '#fff', textAlign: 'center', padding: '8px', borderRadius: theme.borderRadius.button, fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>
            {(p.submitText as string) || 'Gönder'}
          </div>
        </div>
      );

    case 'brand-logos':
      return (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>{p.title as string}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: '60px', height: '24px', background: theme.colors.border, borderRadius: '4px', opacity: 0.5 }} />
            ))}
          </div>
        </div>
      );

    case 'video-embed':
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem', textAlign: 'center' }}>{p.title as string}</h3>
          <div style={{ background: '#000', borderRadius: theme.borderRadius.lg, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '2rem' }}>▶</span>
          </div>
        </div>
      );

    case 'rich-text':
      return (
        <div style={{ padding: '16px', fontSize: '0.85rem', color: theme.colors.text, lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: String(p.html ?? '').slice(0, 200) }} />
      );

    case 'custom-html':
      return (
        <div style={{ padding: '16px', background: '#1a1a2e', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#7dd3fc' }}>
          &lt;custom html&gt;
        </div>
      );

    case 'hero-corporate':
      return (
        <div style={{ minHeight: '180px', background: p.imageUrl ? `linear-gradient(rgba(0,0,0,${p.overlayOpacity ?? 0.55}),rgba(0,0,0,${p.overlayOpacity ?? 0.55})), url(${p.imageUrl as string}) center/cover` : 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 data-prop-key="title" style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>{p.title as string}</h2>
          {!!p.subtitle && <p data-prop-key="subtitle" style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '14px', maxWidth: '480px' }}>{String(p.subtitle).slice(0, 100)}…</p>}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: theme.colors.primary, color: '#fff', padding: '6px 14px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 600 }}>{p.primaryButtonText as string}</span>
          </div>
        </div>
      );

    case 'about-company': {
      const stats = (p.stats as { value: string; label: string }[]) ?? [];
      return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: theme.colors.primary, fontWeight: 600, marginBottom: '4px' }}>{String(p.subtitle ?? '').slice(0, 60)}</div>
            <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: theme.colors.text }}>{p.title as string}</h3>
            <p style={{ fontSize: '0.75rem', color: theme.colors.textMuted, lineHeight: 1.5 }}>{String(p.text ?? '').replace(/<[^>]+>/g, '').slice(0, 120)}…</p>
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
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'services-grid': {
      const services = (p.items as { title: string; description: string; iconColor?: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
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
      const features = (p.items as { title: string; description: string; color?: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
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
          <div style={{ display: 'flex', flexDirection: p.orientation === 'vertical' ? 'column' : 'row', gap: '8px', overflowX: 'hidden' }}>
            {steps.slice(0, 4).map((s, i) => (
              <div key={i} style={{ flex: 1, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, padding: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>{s.stepNumber}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px' }}>{s.title}</div>
                <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{s.description.slice(0, 55)}…</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'pricing-plans': {
      const plans = (p.plans as { name: string; price: string; currency: string; highlighted?: boolean; badge?: string }[]) ?? [];
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', textAlign: 'center', color: theme.colors.text }}>{p.title as string}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: '8px' }}>
            {plans.slice(0, 3).map((pl, i) => (
              <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `2px solid ${pl.highlighted ? theme.colors.primary : theme.colors.border}`, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '6px' }}>{pl.name}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primary }}>{pl.currency}{pl.price}</div>
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
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {Array.from({ length: Math.min(logos.length || cols, 8) }).map((_, i) => (
              <div key={i} style={{ height: '28px', width: '70px', background: theme.colors.border, borderRadius: '4px', opacity: 0.45 }} />
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
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {awards.slice(0, Math.min(cols, 6)).map((a, i) => (
              <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, padding: '10px' }}>
                <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, marginBottom: '4px' }}>{a.year}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px' }}>{a.name}</div>
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
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color ?? theme.colors.primary, lineHeight: 1 }}>{c.value}{c.suffix}</div>
                <div style={{ fontSize: '0.65rem', color: p.backgroundType === 'dark' ? 'rgba(255,255,255,0.6)' : theme.colors.textMuted, marginTop: '4px' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'cta-banner':
      return (
        <div style={{ background: p.backgroundType === 'gradient' ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary ?? theme.colors.primary}cc)` : (p.backgroundColor as string) || theme.colors.primary, padding: '28px 24px', textAlign: 'center', borderRadius: theme.borderRadius.card }}>
          <h3 data-prop-key="headline" style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>{p.headline as string}</h3>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#fff', color: theme.colors.primary, padding: '7px 16px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 700 }}>{p.primaryButtonText as string}</span>
          </div>
        </div>
      );

    case 'contact-details': {
      const phones = (p.phones as { label: string; number: string }[]) ?? [];
      const emails = (p.emails as { label: string; address: string }[]) ?? [];
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: theme.colors.text }}>{p.title as string}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>📍 Adres</div>
              <div style={{ fontSize: '0.68rem', color: theme.colors.text }}>{p.address as string}</div>
            </div>
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>📞 Telefon</div>
              {phones.slice(0, 2).map((ph, i) => <div key={i} style={{ fontSize: '0.65rem', color: theme.colors.text }}>{ph.number}</div>)}
            </div>
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>✉️ E-posta</div>
              {emails.slice(0, 2).map((em, i) => <div key={i} style={{ fontSize: '0.65rem', color: theme.colors.primary }}>{em.address}</div>)}
            </div>
          </div>
        </div>
      );
    }

    case 'blog-list': {
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {Array.from({ length: Math.min(Number(p.limit ?? 3), 3) }).map((_, i) => (
              <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, overflow: 'hidden' }}>
                <div style={{ height: '60px', background: theme.colors.border }} />
                <div style={{ padding: '8px' }}>
                  <div style={{ height: '8px', background: theme.colors.border, borderRadius: '3px', marginBottom: '4px' }} />
                  <div style={{ height: '8px', width: '70%', background: theme.colors.border, borderRadius: '3px' }} />
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
          <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: `2px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.slice(0, 4).map((it, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: it.color ?? theme.colors.primary }} />
                <div style={{ fontSize: '0.65rem', color: it.color ?? theme.colors.primary, fontWeight: 700 }}>{it.year}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text }}>{it.title}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'portfolio-grid': {
      const items = (p.items as { title: string; category: string }[]) ?? [];
      const cols = Number(p.columns ?? 3);
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '8px' }}>
            {items.slice(0, Math.min(cols, 6)).map((it, i) => (
              <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, overflow: 'hidden' }}>
                <div style={{ height: '60px', background: theme.colors.border }} />
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '0.58rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{it.category}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text }}>{it.title}</div>
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
          <div style={{ minHeight: '120px', background: '#e5e7eb', borderRadius: theme.borderRadius.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#9ca3af' }}>🗺️</div>
        </div>
      );

    case 'phone-contact':
      return (
        <div style={{ padding: '16px', background: p.backgroundColor as string || theme.colors.surface, borderRadius: theme.borderRadius.card }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span style={{ background: theme.colors.primary, color: '#fff', padding: '5px 12px', borderRadius: theme.borderRadius.button, fontSize: '0.72rem', fontWeight: 600 }}>{p.buttonText as string}</span>
          </div>
        </div>
      );

    case 'slider':
      return (
        <div style={{ padding: '16px', background: theme.colors.surface, borderRadius: '8px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.primary }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.border }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.border }} />
          <span style={{ position: 'absolute', fontSize: '0.7rem', color: theme.colors.textMuted }}>Slayt Gösterisi</span>
        </div>
      );

    case 'faq':
      return (
        <div style={{ padding: '16px' }}>
          <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: theme.colors.text }}>{p.title as string}</h3>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ borderBottom: `1px solid ${theme.colors.border}`, padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ height: '10px', width: `${55 + i * 10}%`, background: theme.colors.border, borderRadius: '4px' }} />
              <span style={{ color: theme.colors.textMuted, fontSize: '12px' }}>▼</span>
            </div>
          ))}
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
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const total = leftSpan + rightSpan;

    const onMouseMove = (ev: MouseEvent) => {
      const rowWidth = rowGridRef.current?.offsetWidth ?? 800;
      const unitW = rowWidth / 12;
      const delta = Math.round((ev.clientX - startX) / unitW);
      const newLeft = Math.max(1, Math.min(total - 1, leftSpan + delta));
      onResize(leftColId, rightColId, newLeft, total - newLeft);
    };
    const onMouseUp = () => {
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
    />
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
}: ColumnWrapperProps) {
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
      style={{ gridColumn: `span ${column.span}`, position: 'relative' }}
      onClick={handleClick}
    >
      <span className={styles.spanBadge}>{column.span}/12</span>
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

      {column.component ? (
        <div
          className={`${styles.blockWrapper} ${column.component.id === selectedComponentId ? styles.selected : ''}`}
          style={{ outline: 'none' }}
        >
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

      {nextColumn && (
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
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
      {/* Drag handle */}
      <button
        className={styles.rowDragHandle}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        title="Sürükleyerek sırala"
        type="button"
      >
        <FaGripVertical />
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
        >
          <FaTrash />
        </button>
      </div>

      {/* Row grid */}
      <div
        ref={rowGridRef}
        className={styles.rowGrid}
        style={{
          background: row.props.backgroundColor,
          paddingTop: row.props.paddingY ?? '0',
          paddingBottom: row.props.paddingY ?? '0',
          paddingLeft: row.props.paddingX ?? '0',
          paddingRight: row.props.paddingX ?? '0',
        }}
      >
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
    dispatch({ type: 'SELECT_COMPONENT', id: null });
    dispatch({ type: 'SELECT_ROW', rowId: null });
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
        <div className={styles.canvas} style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }} ref={canvasRef}>

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

          <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
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
  );
}
