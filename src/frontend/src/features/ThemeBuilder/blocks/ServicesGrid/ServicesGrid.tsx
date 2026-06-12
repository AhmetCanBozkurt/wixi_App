import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function ServicesGridPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const services = (p.items as { title: string; description: string; iconColor?: string }[]) ?? [];
  const cols = Number(p.columns ?? 3);
  const colsCount = viewport === 'mobile' ? 1 : viewport === 'tablet' ? 2 : Math.min(cols, 3);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
        {services.slice(0, Math.min(cols, 6)).map((s, i) => (
          <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `1px solid ${theme.colors.border}`, padding: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.iconColor ?? theme.colors.primary, opacity: 0.15, marginBottom: '8px' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '4px' }}>{s.title}</div>
            <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{s.description.slice(0, 60)}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}
