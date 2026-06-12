import type { BlockRendererProps } from '../renderers/types';

export function ContactDetailsPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const phones = (p.phones as { label: string; number: string }[]) ?? [];
  const emails = (p.emails as { label: string; address: string }[]) ?? [];
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
          <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>📍 Adres</div>
          <div style={{ fontSize: '0.68rem', color: theme.colors.text }}>{p.address as string}</div>
        </div>
        <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
          <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>📞 Telefon</div>
          {phones.slice(0, 2).map((ph, i) => <div key={i} style={{ fontSize: '0.65rem', color: theme.colors.text }}>{ph.number}</div>)}
        </div>
        <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, padding: '10px' }}>
          <div style={{ fontSize: '0.6rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>✉️ E-posta</div>
          {emails.slice(0, 2).map((em, i) => <div key={i} style={{ fontSize: '0.65rem', color: theme.colors.primary }}>{em.address}</div>)}
        </div>
      </div>
    </div>
  );
}
