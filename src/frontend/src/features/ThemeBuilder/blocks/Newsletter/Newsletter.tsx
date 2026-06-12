import type { BlockRendererProps } from '../renderers/types';

export function NewsletterPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ background: theme.colors.surface, padding: '24px', textAlign: 'center' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.95rem' }}>{p.title as string}</h3>
      <p data-prop-key="text" style={{ fontSize: '0.75rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{p.text as string}</p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <div style={{ background: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.button, padding: '8px 16px', fontSize: '0.75rem', color: theme.colors.textMuted }}>E-posta adresiniz</div>
        <span data-prop-key="buttonText" style={{ background: theme.colors.primary, color: '#fff', padding: '8px 16px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 600 }}>{p.buttonText as string}</span>
      </div>
    </div>
  );
}
