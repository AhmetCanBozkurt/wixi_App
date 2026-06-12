import type { BlockRendererProps } from '../renderers/types';

export function AwardsCertificationsPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
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
