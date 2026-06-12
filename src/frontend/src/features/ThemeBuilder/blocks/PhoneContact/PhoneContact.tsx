import type { BlockRendererProps } from '../renderers/types';

export function PhoneContactPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ padding: '16px', background: p.backgroundColor as string || theme.colors.surface, borderRadius: theme.borderRadius.card }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
        <span style={{ background: theme.colors.primary, color: '#fff', padding: '5px 12px', borderRadius: theme.borderRadius.button, fontSize: '0.72rem', fontWeight: 600 }}>{p.buttonText as string}</span>
      </div>
    </div>
  );
}
