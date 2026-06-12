import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function ProcessStepsPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const steps = (p.steps as { stepNumber: string; title: string; description: string }[]) ?? [];
  const isMobile = viewport === 'mobile';
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : (p.orientation === 'vertical' ? 'column' : 'row'), gap: '8px', overflowX: 'hidden' }}>
        {steps.slice(0, 4).map((s, i) => (
          <div key={i} style={{ flex: 1, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.card, padding: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>{s.stepNumber}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.colors.text, marginBottom: '3px' }}>{s.title}</div>
            <div style={{ fontSize: '0.62rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>{s.description.slice(0, 55)}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}
