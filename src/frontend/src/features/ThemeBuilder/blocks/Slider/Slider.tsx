import type { BlockRendererProps } from '../renderers/types';

export function SliderPreview({ theme }: BlockRendererProps) {
  return (
    <div style={{ padding: '16px', background: theme.colors.surface, borderRadius: '8px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.primary }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.border }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.border }} />
      <span style={{ position: 'absolute', fontSize: '0.7rem', color: theme.colors.textMuted }}>Slayt Gösterisi</span>
    </div>
  );
}
