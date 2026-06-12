import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';
import { NestedComponentWrapper } from '../renderers/NestedComponentWrapper';

export function GridRowPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { dispatch } = useEditor();
  const children = comp.children ?? [];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: p.gap ? String(p.gap) : '16px',
        width: '100%',
        minHeight: '50px',
        border: '1px dashed rgba(255,255,255,0.05)',
        padding: '4px',
      }}
    >
      {children.length > 0 ? (
        children.map(child => (
          <NestedComponentWrapper key={child.id} comp={child} theme={theme} />
        ))
      ) : (
        <div
          style={{ gridColumn: 'span 12', padding: '12px', textAlign: 'center', color: theme.colors.textMuted, fontSize: '0.8rem', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'SELECT_COMPONENT', id: comp.id });
            dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
          }}
        >
          Izgara Satırı (Seçip kolon ekleyin)
        </div>
      )}
    </div>
  );
}
