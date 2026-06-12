import type { LayoutComponent, ThemeConfig } from '../../../../entities/StorePage/model/types';
import { BLOCK_BY_TYPE } from '../registry';
import { BLOCK_RENDERERS } from './rendererMap';

export function MiniRenderer({ comp, theme }: { comp: LayoutComponent; theme: ThemeConfig }) {
  const Renderer = BLOCK_RENDERERS[comp.type];
  if (Renderer) return <Renderer comp={comp} theme={theme} />;

  const def = BLOCK_BY_TYPE[comp.type];
  return (
    <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.textMuted }}>
      <div style={{ fontWeight: 600 }}>{def?.name ?? comp.type}</div>
    </div>
  );
}
