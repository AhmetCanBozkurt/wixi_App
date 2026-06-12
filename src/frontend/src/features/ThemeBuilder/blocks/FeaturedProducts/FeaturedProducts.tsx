import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function FeaturedProductsPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const colsCount = viewport === 'mobile' ? 1 : viewport === 'tablet' ? 2 : Math.min(Number(p.columns ?? 4), 4);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: theme.colors.text }}>
        {p.title as string}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
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
}
