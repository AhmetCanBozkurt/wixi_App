import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function FeaturesHighlightPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const features = (p.items as { title: string; description: string; color?: string }[]) ?? [];
  const cols = Number(p.columns ?? 3);
  const colsCount = viewport === 'mobile' ? 1 : viewport === 'tablet' ? 2 : Math.min(cols, 3);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
        {features.slice(0, Math.min(cols, 6)).map((f, i) => (
          <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `1px solid ${theme.colors.border}`, padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: f.color ?? theme.colors.primary, flexShrink: 0, opacity: 0.85 }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px' }}>{f.title}</div>
              <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{f.description.slice(0, 55)}…</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
