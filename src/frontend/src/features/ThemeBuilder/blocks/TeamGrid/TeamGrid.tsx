import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function TeamGridPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const members = (p.items as { name: string; role: string; bio?: string; imageUrl?: string }[]) ?? [];
  const cols = Number(p.columns ?? 3);
  const colsCount = viewport === 'mobile' ? 1 : viewport === 'tablet' ? 2 : Math.min(cols, 4);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      {!!p.subtitle && <p style={{ fontSize: '0.72rem', color: theme.colors.textMuted, marginBottom: '12px' }}>{String(p.subtitle).slice(0, 70)}…</p>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
        {members.slice(0, Math.min(cols, 4)).map((m, i) => (
          <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `1px solid ${theme.colors.border}`, padding: '10px', textAlign: 'center' }}>
            {m.imageUrl ? (
              <img src={m.imageUrl} alt={m.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', display: 'block' }} />
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: theme.colors.border, margin: '0 auto 8px' }} />
            )}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.colors.text }}>{m.name}</div>
            <div style={{ fontSize: '0.65rem', color: theme.colors.primary, marginTop: '2px' }}>{m.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
