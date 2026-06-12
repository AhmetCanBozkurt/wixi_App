import type { BlockRendererProps } from '../renderers/types';

export function ContactFormPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem', textAlign: 'center' }}>{p.title as string}</h3>
      {['Adınız', 'E-posta', 'Mesajınız'].map((f, i) => (
        <div key={i} style={{ height: i === 2 ? '48px' : '28px', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, marginBottom: '6px', padding: '0 8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted }}>{f}</span>
        </div>
      ))}
      <div style={{ background: theme.colors.primary, color: '#fff', textAlign: 'center', padding: '8px', borderRadius: theme.borderRadius.button, fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>
        {(p.submitText as string) || 'Gönder'}
      </div>
    </div>
  );
}
