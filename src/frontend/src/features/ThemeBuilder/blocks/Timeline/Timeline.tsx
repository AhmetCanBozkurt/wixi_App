import type { BlockRendererProps } from '../renderers/types';

export function TimelinePreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
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
