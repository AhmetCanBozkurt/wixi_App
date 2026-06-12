import type { BlockRendererProps } from '../renderers/types';

export function PromoBannerPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ background: (p.backgroundColor as string) || theme.colors.primary, color: (p.textColor as string) || '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <span data-prop-key="message" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.message as string}</span>
      {!!p.buttonText && (
        <span data-prop-key="buttonText" style={{ padding: '4px 12px', border: '1px solid rgba(255,255,255,0.5)', borderRadius: theme.borderRadius.button, fontSize: '0.8rem' }}>
          {p.buttonText as string}
        </span>
      )}
    </div>
  );
}
