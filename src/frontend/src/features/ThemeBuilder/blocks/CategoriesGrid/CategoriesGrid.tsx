import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function CategoriesGridPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const colsCount = viewport === 'mobile' ? 2 : viewport === 'tablet' ? 3 : Math.min(Number(p.columns ?? 3), 4);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
        {Array.from({ length: Math.min(Number(p.limit ?? 6), 6) }).map((_, i) => (
          <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, padding: '12px', textAlign: 'center', border: `1px solid ${theme.colors.border}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: theme.borderRadius.md, background: theme.colors.border, margin: '0 auto 6px' }} />
            <div style={{ height: '8px', background: theme.colors.border, borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
