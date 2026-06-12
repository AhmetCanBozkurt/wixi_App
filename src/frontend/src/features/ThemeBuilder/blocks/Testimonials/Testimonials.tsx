import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function TestimonialsPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const items = (p.items as { name: string; quote: string; rating: number }[]) ?? [];
  const isMobile = viewport === 'mobile';
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
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
