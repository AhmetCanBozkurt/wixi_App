import type { BlockRendererProps } from '../renderers/types';

export function ClientsLogosPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const logos = (p.logos as { imageUrl: string; altText: string }[]) ?? [];
  const cols = Number(p.columns ?? 6);
  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {logos.length > 0 ? (
          logos.slice(0, 8).map((logo, i) => (
            logo.imageUrl ? (
              <img key={i} src={logo.imageUrl} alt={logo.altText} style={{ height: '28px', maxWidth: '80px', objectFit: 'contain', opacity: 0.8 }} />
            ) : (
              <div key={i} style={{ height: '28px', width: '70px', background: theme.colors.border, borderRadius: '4px', opacity: 0.45 }} />
            )
          ))
        ) : (
          Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ height: '28px', width: '70px', background: theme.colors.border, borderRadius: '4px', opacity: 0.45 }} />
          ))
        )}
      </div>
    </div>
  );
}
