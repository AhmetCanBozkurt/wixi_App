import type { BlockRendererProps } from '../renderers/types';
import { ShadowHtml } from '../../../../shared/ui/ShadowHtml/ShadowHtml';

export function CustomHtmlPreview({ comp }: BlockRendererProps) {
  const p = comp.props;
  const rawHtml = String(p.html ?? '');
  if (rawHtml.trim()) {
    return (
      <div style={{ position: 'relative', minHeight: '40px' }}>
        <ShadowHtml
          html={rawHtml}
          style={{ display: 'block', width: '100%', minHeight: '40px' }}
          addReset={true}
        />
        {/* Editor overlay to prevent click-through into shadow content */}
        <div
          style={{ position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 2 }}
          title="Custom HTML (içeriği Shadow DOM ile izole)"
        />
      </div>
    );
  }
  return (
    <div style={{ padding: '16px', background: '#1a1a2e', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#7dd3fc' }}>
      &lt;custom html&gt;
    </div>
  );
}
