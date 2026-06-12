import type { BlockRendererProps } from '../renderers/types';

export function BrandLogosPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>{p.title as string}</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: '60px', height: '24px', background: theme.colors.border, borderRadius: '4px', opacity: 0.5 }} />
        ))}
      </div>
    </div>
  );
}
