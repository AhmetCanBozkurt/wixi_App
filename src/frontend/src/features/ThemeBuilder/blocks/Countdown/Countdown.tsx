import type { BlockRendererProps } from '../renderers/types';

export function CountdownPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ background: theme.colors.primary, padding: '24px', textAlign: 'center', color: '#fff' }}>
      <h3 data-prop-key="title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{p.title as string}</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {['00', '00', '00', '00'].map((v, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{v}</div>
            <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{['Gün', 'Saat', 'Dk', 'Sn'][i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
