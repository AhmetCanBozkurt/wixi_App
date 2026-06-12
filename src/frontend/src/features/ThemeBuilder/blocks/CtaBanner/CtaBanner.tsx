import type { BlockRendererProps } from '../renderers/types';

export function CtaBannerPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ background: p.backgroundType === 'gradient' ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary ?? theme.colors.primary}cc)` : (p.backgroundColor as string) || theme.colors.primary, padding: '28px 24px', textAlign: 'center', borderRadius: theme.borderRadius.card }}>
      <h3 data-prop-key="headline" style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>{p.headline as string}</h3>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ background: '#fff', color: theme.colors.primary, padding: '7px 16px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 700 }}>{p.primaryButtonText as string}</span>
      </div>
    </div>
  );
}
