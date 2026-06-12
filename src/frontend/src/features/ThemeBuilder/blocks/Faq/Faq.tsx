import type { BlockRendererProps } from '../renderers/types';

export function FaqPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: theme.colors.text }}>{p.title as string}</h3>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ borderBottom: `1px solid ${theme.colors.border}`, padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: '10px', width: `${55 + i * 10}%`, background: theme.colors.border, borderRadius: '4px' }} />
          <span style={{ color: theme.colors.textMuted, fontSize: '12px' }}>▼</span>
        </div>
      ))}
    </div>
  );
}
