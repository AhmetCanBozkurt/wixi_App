import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function TextImagePreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const isMobile = viewport === 'mobile';
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '16px', flexDirection: isMobile ? 'column' : (p.imagePosition === 'right' ? 'row' : 'row-reverse') }}>
      <div style={{ flex: 1 }}>
        <h3 data-prop-key="title" style={{ fontWeight: 700, marginBottom: '8px', color: theme.colors.text }}>{p.title as string}</h3>
        <p data-prop-key="text" style={{ fontSize: '0.8rem', color: theme.colors.textMuted, lineHeight: 1.6 }}>{String(p.text ?? '').slice(0, 120)}...</p>
      </div>
      <div style={{ flex: 1, borderRadius: theme.borderRadius.lg, background: p.imageUrl ? `url("${p.imageUrl as string}") center/cover` : theme.colors.surface, minHeight: '120px', border: `1px solid ${theme.colors.border}` }} />
    </div>
  );
}
