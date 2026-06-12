import type { BlockRendererProps } from '../renderers/types';

export function HeroCorporatePreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ minHeight: '180px', background: p.imageUrl ? `linear-gradient(rgba(0,0,0,${p.overlayOpacity ?? 0.55}),rgba(0,0,0,${p.overlayOpacity ?? 0.55})), url("${p.imageUrl as string}") center/cover` : 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 data-prop-key="title" style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>{p.title as string}</h2>
      {!!p.subtitle && <p data-prop-key="subtitle" style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '14px', maxWidth: '480px' }}>{String(p.subtitle).slice(0, 100)}…</p>}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ background: theme.colors.primary, color: '#fff', padding: '6px 14px', borderRadius: theme.borderRadius.button, fontSize: '0.75rem', fontWeight: 600 }}>{p.primaryButtonText as string}</span>
      </div>
    </div>
  );
}
