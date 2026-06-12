import type { BlockRendererProps } from '../renderers/types';

export function RichTextPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div style={{ padding: '16px', fontSize: '0.85rem', color: theme.colors.text, lineHeight: 1.7 }}
      dangerouslySetInnerHTML={{ __html: String(p.html ?? '').slice(0, 200) }} />
  );
}
