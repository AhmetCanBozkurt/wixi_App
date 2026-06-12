import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function PortfolioGridPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const items = (p.items as { title: string; category: string; imageUrl?: string }[]) ?? [];
  const cols = Number(p.columns ?? 3);
  const colsCount = viewport === 'mobile' ? 1 : viewport === 'tablet' ? 2 : Math.min(cols, 3);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
        {items.slice(0, Math.min(cols, 6)).map((it, i) => (
          <div key={i} style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, overflow: 'hidden' }}>
            {it.imageUrl ? (
              <div style={{ height: '60px', background: `url("${it.imageUrl}") center/cover` }} />
            ) : (
              <div style={{ height: '60px', background: theme.colors.border }} />
            )}
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
