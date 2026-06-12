import type { BlockRendererProps } from '../renderers/types';

export function StatsBarPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
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
