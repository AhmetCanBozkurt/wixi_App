import type { BlockRendererProps } from '../renderers/types';

export function VideoEmbedPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem', textAlign: 'center' }}>{p.title as string}</h3>
      <div style={{ background: '#000', borderRadius: theme.borderRadius.lg, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontSize: '2rem' }}>▶</span>
      </div>
    </div>
  );
}
