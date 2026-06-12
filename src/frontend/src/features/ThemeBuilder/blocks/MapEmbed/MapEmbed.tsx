import type { BlockRendererProps } from '../renderers/types';

export function MapEmbedPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ minHeight: '120px', background: '#e5e7eb', borderRadius: theme.borderRadius.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#9ca3af' }}>🗺️</div>
    </div>
  );
}
