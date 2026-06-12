import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function BlogListPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const cols = Number(p.columns ?? 3);
  const colsCount = viewport === 'mobile' ? 1 : viewport === 'tablet' ? 2 : Math.min(cols, 3);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
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
