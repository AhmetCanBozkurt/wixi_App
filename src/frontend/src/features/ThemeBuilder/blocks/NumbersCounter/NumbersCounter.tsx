import type { BlockRendererProps } from '../renderers/types';

export function NumbersCounterPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
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
