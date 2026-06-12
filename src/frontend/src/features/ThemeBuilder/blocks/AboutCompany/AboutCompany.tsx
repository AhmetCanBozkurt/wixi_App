import type { BlockRendererProps } from '../renderers/types';

export function AboutCompanyPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
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
